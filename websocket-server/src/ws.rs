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
    TypedHeader(cookies): TypedHeader<Cookie>,
) -> impl IntoResponse {
    let pub_key = std::env::var("AUTH0_PUBKEY").unwrap();

    if let (Some(token), Some(nonce)) = (cookies.get("id_token"), cookies.get("nonce")) {
        let token_result = decode::<ClaimsContent>(
            &token,
            &DecodingKey::from_rsa_pem(pub_key.as_bytes())
                .map_err(|e| panic!("Failed to decode Auth0 public key: {e} '{pub_key}'"))
                .unwrap(),
            &Validation::new(Algorithm::RS256),
        );

        // todo check nonce
        match token_result {
            Ok(token_payload) => ws.on_upgrade(move |socket| websocket(socket, id, state)),
            Err(e) => {
                tracing::error!("Couldn't verify token: {e}");
                StatusCode::FORBIDDEN.into_response()
            }
        }
    } else {
        let missing: Vec<&str> = vec!["id_token", "nonce"]
            .into_iter()
            .filter(|s| cookies.get(s).is_none())
            .collect();
        tracing::info!("{} missing from request", missing.join(", "));
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
    pub nonce: String,
}
