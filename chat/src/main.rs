use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Path, State,
    },
    response::IntoResponse,
    routing::get,
    Router,
};
use futures::{sink::SinkExt, stream::StreamExt};
use postgres::{Client, NoTls};
use serde_derive::{Deserialize, Serialize};
use std::{net::SocketAddr, sync::Arc};
use tokio::sync::{broadcast, Mutex};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use auth0_jwt::claims::Claims;

#[derive(Clone)]
struct AppState {
    tx: broadcast::Sender<(i32, ChatMessage)>,
    client: Arc<Mutex<Client>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
struct ChatMessage {
    user: String,
    message: String,
    timestamp: Option<String>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .init();

    let (tx, _rx) = broadcast::channel(100);
    let client = Arc::new(Mutex::new(
        Client::connect("host=localhost user=postgres", NoTls).unwrap(),
    ));

    let app_state = Arc::new(AppState { tx, client });

    let app = Router::new()
        .route("/chat/:id", get(websocket_handler))
        .with_state(app_state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::debug!("listening on {}", addr);
    axum_server::bind(addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn websocket_handler(
    ws: WebSocketUpgrade,
    Path(id): Path<i32>,
    State(state): State<Arc<AppState>>,
    Claims(claims): Claims<ClaimsContent>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| websocket(socket, id, state, auth0_jwt::claims::Claims(claims)))
}

async fn websocket(
    stream: WebSocket,
    id: i32,
    state: Arc<AppState>,
    claims: Claims<ClaimsContent>,
) {
    let (mut sender, mut receiver) = stream.split();

    let rows =state
        .client
        .blocking_lock()
        .query("SELECT user_name, message, created_at FROM message,user WHERE team_id = $1 AND user_id = user.id ORDER BY created_at", &[&id]);

    if rows.is_ok() {
        return;
    }

    for row in rows.unwrap() {
        let user: String = row.get(0);
        let message: String = row.get(1);
        let timestamp: Option<String> = row.get(2);

        let chat_message = ChatMessage {
            user,
            message,
            timestamp,
        };
        if let Ok(msg) = serde_json::to_vec(&chat_message) {
            if sender.send(Message::Binary(msg)).await.is_err() {
                return;
            }
        }
    }

    let mut rx = state.tx.subscribe();

    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if msg.0 == id {
                if let Ok(message) = serde_json::to_vec(&msg) {
                    if sender.send(Message::Binary(message)).await.is_err() {
                        break;
                    }
                }
            }
        }
    });

    let tx = state.tx.clone();
    let client = state.client.clone();

    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Binary(msg))) = receiver.next().await {
            let message: Result<ChatMessage, serde_json::Error> = serde_json::from_slice(&msg);

            let user_id: i32 = 0; // TODO

            if message.is_ok() {
                let mut msg = message.unwrap();
                if let Ok(res) =client
                    .blocking_lock().query(
                    "INSERT INTO message (user_id, team_id, message) VALUES ($1, $2, $3) RETURNING created_at",
                    &[&user_id, &id, &msg.message],
                ){
                    let timestrap:String = res.get(0).unwrap().get(0);
                    msg.timestamp= Some(timestrap);
                    let _ = tx.send((id, msg));
                }
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
    pub exp: usize,
    pub iat: usize,
}
