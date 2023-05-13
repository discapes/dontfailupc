use axum::{Extension, Router};
use std::{net::SocketAddr, sync::Arc};
use tokio::sync::broadcast;
use ws::ChatMessage;

pub mod ws;
use dotenv::dotenv;

#[derive(Clone)]
struct AppState {
    tx: broadcast::Sender<(i32, ChatMessage)>,
    // client: Arc<Mutex<Client>>,
}

#[tokio::main]
async fn main() {
    // tracing_subscriber::registry()
    //     .with(tracing_subscriber::fmt::layer())
    //     .init();
    dotenv().ok();

    let (tx, _rx) = broadcast::channel(100);

    // println!("{:?}", res.err());
    // let client = Arc::new(Mutex::new(res));

    let app_state = Arc::new(AppState { tx, /*client */ });

    let app = Router::new()
        .nest("/chat", ws::api_router())
        .layer(Extension(app_state));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    // tracing::debug!("listening on {}", addr);
    axum_server::bind(addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
