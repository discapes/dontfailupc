use axum::{routing::get, Extension, Router};
use mongodb::{options::ClientOptions, Client};
use std::{net::SocketAddr, sync::Arc};
use tokio::sync::broadcast;
use tower_http::trace::{self, TraceLayer};
use tracing::Level;
use ws::{websocket_handler, ChatMessage};

pub mod ws;
use dotenv::dotenv;

#[derive(Clone)]
pub struct AppState {
    tx: broadcast::Sender<(String, ChatMessage)>,
    client: Client,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_target(false)
        .compact()
        .init();

    dotenv().ok();

    let uri = std::env::var("MONGODB_URI").unwrap();
    let client_options = ClientOptions::parse(uri).await.unwrap();
    let client = Client::with_options(client_options).unwrap();

    let (tx, _rx) = broadcast::channel(100);

    let app_state = Arc::new(AppState { tx, client });

    let ws = tokio::spawn(websocket_server(app_state));
    let _ = tokio::join!(ws);
}

async fn websocket_server(app_state: Arc<AppState>) {
    let app = Router::new()
        .route("/chat/:slug", get(websocket_handler))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
                .on_response(trace::DefaultOnResponse::new().level(Level::INFO)),
        )
        .layer(Extension(app_state));

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("listening on {}", addr);

    axum_server::bind(addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
