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
use futures::{sink::SinkExt, stream::StreamExt};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde_derive::{Deserialize, Serialize};
use std::sync::Arc;

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
        println!("{token}");
        if let Ok(token_message) = decode::<ClaimsContent>(
            &token,
            &DecodingKey::from_secret(std::env::var("TOKEN_KEY").unwrap().as_bytes()),
            &Validation::new(Algorithm::HS256),
        ) {
            println!("{}", token_message.claims.email);
            ws.on_upgrade(move |socket| websocket(socket, id, state))
        } else {
            println!("AA");
            StatusCode::NOT_FOUND.into_response()
        }
    } else {
        println!("sssssAA");
        StatusCode::NOT_FOUND.into_response()
    }
}
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct ChatMessage {
    user: String,
    message: String,
    timestamp: Option<f64>,
}

async fn websocket(stream: WebSocket, id: i32, state: Arc<AppState>) {
    let (mut sender, mut receiver) = stream.split();

    // let rows =state
    //     .client
    //     .blocking_lock()
    //     .query("SELECT user_name, message, created_at FROM message,user WHERE team_id = $1 AND user_id = user.id ORDER BY created_at", &[&id]);

    // if rows.is_ok() {
    //     return;
    // }

    let old_msg: Vec<ChatMessage> = [
        ChatMessage {
            user: "manola".to_string(),
            message: "hello".to_string(),
            timestamp: Some(1587139022488.826),
        },
        ChatMessage {
            user: "manolo".to_string(),
            message: "hello2".to_string(),
            timestamp: Some(1587139022488.826),
        },
        ChatMessage {
            user: "manola".to_string(),
            message: "hello3".to_string(),
            timestamp: Some(1587139022488.826),
        },
    ]
    .to_vec();
    if let Ok(msg) = serde_json::to_string(&old_msg) {
        if sender.send(Message::Text(msg)).await.is_err() {
            return;
        }
    }

    // for row in rows.unwrap() {
    //     let user: String = row.get(0);
    //     let message: String = row.get(1);
    //     let timestamp: Option<String> = row.get(2);

    //     let chat_message = ChatMessage {
    //         user,
    //         message,
    //         timestamp,
    //     };
    //     if let Ok(msg) = serde_json::to_string(&chat_message) {
    //         if sender.send(Message::Text(msg)).await.is_err() {
    //             return;
    //         }
    //     }
    // }

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
    // let client = state.client.clone();

    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(msg))) = receiver.next().await {
            let message: Result<ChatMessage, serde_json::Error> = serde_json::from_str(&msg);

            let user_id: i32 = 0; // TODO

            if message.is_ok() {
                let mut msg = message.unwrap();
                // if let Ok(res) =client
                //     .blocking_lock().query(
                //     "INSERT INTO message (user_id, team_id, message) VALUES ($1, $2, $3) RETURNING created_at",
                //     &[&user_id, &id, &msg.message],
                // ){
                //     let timestrap:String = res.get(0).unwrap().get(0);
                //     msg.timestamp= Some(timestrap);
                //     let _ = tx.send((id, msg));
                // }
                msg.timestamp = Some(1587139022488.826);
                let _ = tx.send((id, msg));
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
