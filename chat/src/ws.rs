use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Path,
    },
    headers::Cookie,
    http::{Response, StatusCode},
    response::IntoResponse,
    routing::get,
    Extension, Router, TypedHeader,
};
use futures::{sink::SinkExt, stream::StreamExt, TryStreamExt};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use mongodb::bson::{doc, Document};
use serde_derive::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::AppState;
pub fn api_router() -> Router {
    Router::new().route("/:id", get(websocket_handler))
}

async fn websocket_handler(
    ws: WebSocketUpgrade,
    Path(id): Path<i32>,
    Extension(state): Extension<Arc<AppState>>,
    TypedHeader(auth): TypedHeader<Cookie>,
) -> impl IntoResponse {
    if let Some(token) = auth.get("id_token") {
        if let Ok(_token_message) = decode::<ClaimsContent>(
            &token,
            &DecodingKey::from_secret(std::env::var("TOKEN_KEY").unwrap().as_bytes()),
            &Validation::new(Algorithm::HS256),
        ) {
            ws.on_upgrade(move |socket| websocket(socket, id, state))
        } else {
            StatusCode::NOT_FOUND.into_response()
        }
    } else {
        StatusCode::NOT_FOUND.into_response()
    }
}
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct ChatMessage {
    user: String,
    message: String,
    timestamp: u64,
}
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]

pub struct MessageModel {
    chat_id: i32,
    user: String,
    message: String,
    timestamp: u64,
}

async fn websocket(stream: WebSocket, id: i32, state: Arc<AppState>) {
    let (mut sender, mut receiver) = stream.split();

    let coll = state
        .client
        .database("upc")
        .collection::<MessageModel>("messages");
    let old_msg = match coll.find(Some(doc! {"chat": id}), None).await {
        Ok(cursor) => {
            println!("{:?}", cursor);
            cursor.try_collect().await.unwrap_or_else(|_| vec![])
        }
        Err(_) => vec![],
    };

    let mut send_vec = vec![];
    for message in old_msg {
        send_vec.push(ChatMessage {
            user: message.user,
            message: message.message,
            timestamp: message.timestamp,
        });
    }

    if let Ok(msg) = serde_json::to_string(&send_vec) {
        if sender.send(Message::Text(msg)).await.is_err() {
            return;
        }
    }

    let mut rx = state.tx.subscribe();

    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            println!("{}", msg.0);
            if msg.0 == id {
                if let Ok(message) = serde_json::to_string(&msg.1) {
                    println!("{}", message);
                    if sender
                        .send(Message::Text(format!("[{}]", message)))
                        .await
                        .is_err()
                    {
                        break;
                    }
                }
            }
        }
    });

    let tx = state.tx.clone();
    let client = state.client.clone();

    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(msg))) = receiver.next().await {
            let message: Result<ChatMessage, serde_json::Error> = serde_json::from_str(&msg);

            if message.is_ok() {
                let mut msg = message.unwrap();
                let now = SystemTime::now();
                msg.timestamp = now.duration_since(UNIX_EPOCH).unwrap().as_secs();
                let _ = tx.send((id, msg.clone()));

                let message_model = MessageModel {
                    chat_id: id,
                    user: msg.user,
                    message: msg.message,
                    timestamp: msg.timestamp,
                };
                let collection = client
                    .database("upc")
                    .collection::<MessageModel>("messages");
                collection.insert_one(message_model, None).await.unwrap();
            }
        }
    });

    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };
}

#[derive(Deserialize, Serialize)]
struct ClaimsContent {
    pub email: String,
}
