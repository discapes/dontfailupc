use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Path,
    },
    headers::Cookie,
    http::StatusCode,
    response::IntoResponse,
    Extension, TypedHeader,
};
use futures::{sink::SinkExt, stream::StreamExt};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use mongodb::bson::doc;
use serde_derive::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::AppState;

pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    Path(id): Path<String>,
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
            tracing::info!("id_token invalid");
            StatusCode::FORBIDDEN.into_response()
        }
    } else {
        tracing::info!("No cookie id_token found");
        StatusCode::FORBIDDEN.into_response()
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
    slug: String,
    user: String,
    message: String,
    timestamp: u64,
}

async fn websocket(stream: WebSocket, slug: String, state: Arc<AppState>) {
    tracing::info!("upgraded to websocket, slug={slug}");

    let (mut sender, mut receiver) = stream.split();

    let mut rx = state.tx.subscribe();

    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
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
                let _ = tx.send((slug.clone(), msg.clone()));

                let message_model = MessageModel {
                    slug: slug.clone(),
                    user: msg.user,
                    message: msg.message,
                    timestamp: msg.timestamp,
                };
                let collection = client.database("upc").collection::<MessageModel>("chat");
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
