use axum::{http::Uri, response::Redirect, routing::get, Extension, Router};
use axum_server::tls_rustls::RustlsConfig;
use mongodb::{bson::doc, options::ClientOptions, Client};
use std::{net::SocketAddr, sync::Arc};
use tokio::sync::broadcast;
use ws::ChatMessage;

pub mod ws;
use dotenv::dotenv;

#[derive(Clone)]
struct AppState {
    tx: broadcast::Sender<(i32, ChatMessage)>,
    client: Client,
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let uri = std::env::var("MONGO_DB").unwrap();
    let mut client_options = ClientOptions::parse(uri).await.unwrap();
    let client = Client::with_options(client_options).unwrap();

    let (tx, _rx) = broadcast::channel(100);

    let app_state = Arc::new(AppState { tx, client });

    let http = tokio::spawn(http_server());
    let https = tokio::spawn(https_server(app_state));

    // Ignore errors.
    let _ = tokio::join!(http, https);
}

async fn http_server() {
    let app = axum::Router::new().route("/", get(http_handler));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3443));
    axum_server::bind(addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn http_handler(uri: Uri) -> Redirect {
    // let uri = format!("https://127.0.0.1:3000{}", uri.path());
    let uri = format!("http://127.0.0.1:3000{}", uri.path());

    Redirect::temporary(&uri)
}

async fn https_server(app_state: Arc<AppState>) {
    let app = Router::new()
        .nest("/chat", ws::api_router())
        .layer(Extension(app_state));

    // let config = RustlsConfig::from_pem_file("certs/cert.pem", "certs/key.pem")
    //     .await
    //     .unwrap();

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    // axum_server::bind_rustls(addr, config)
    //     .serve(app.into_make_service())
    //     .await
    //     .unwrap();
    axum_server::bind(addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
