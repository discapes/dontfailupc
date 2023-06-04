# needs to be alpine if its run on alpine
FROM rust:alpine AS builder
WORKDIR /app

RUN cargo init
COPY Cargo* ./
# update crates.io index
RUN cargo update --dry-run
RUN apk add musl-dev
# important ^^^ 
# compile dependencies
RUN cargo build --release


COPY src src
# update mtime so cargo rebuilds
RUN touch src/main.rs 
RUN cargo build --release

FROM alpine
WORKDIR /app
EXPOSE 3000
COPY --from=builder /app/target/release/chat ./
RUN pwd && ls -la
CMD ./chat