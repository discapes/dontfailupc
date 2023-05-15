# Don't fail UPC - HackUPC 2023 Submission

#### You may not be the best student in the class, but we are confident that you can make the most of your abilities and create great projects together with your most compatible classmates.

#### Share your class notes, build teams faster, and work for success.

## How to run:

- Install and start MongoDB
  - Set `MONGODB_URI` in this folder's .env (`mongodb://127.0.0.1:27017` for local)
- Setup Auth0

  - Run `node svelte-app/deploy-auth0.js`
  - Enter the Management API token from `Applications -> APIs -> Auth0 Management API -> API Explorer`
  - Enter the Client ID for `Applications -> Applications -> Default App`
  - Copy the end of the output into .env (this folder)
  - Add `http://localhost:5173` and your production url to `Allowed Callback URLs`, `Allowed Logout URLs` and `Allowed Web Origins`

- Setup GPT analysis

  - Set `OPENAI_API_KEY` in this folder's .env to your OpenAI API key

- Start websocket-server

  - For development: `cargo run`
  - For production: `cargo build --release && target/build/chat`

- sveltekit-app

  - Install dependencies with `npm i`
  - For development: `npm run dev`
  - For production: `npm run build && npm run node`

- scoring-api
  - Install dependencies with `pip install yake flask waitress`
  - For development: `python flask_app.py`
  - For production: `waitress-serve --port 5000 flask-app:app`

## Adminstration

After signing in into the app, set your own users app_metadata in Auth0 User Management to `{"admin":true}`. You can now edit course information and post the source text for lectures.

### <img src = "https://github.com/discapes/hackupc2023/blob/master/assets/about_me.gif" width = 25px> Authors

- Miika Tuominen (sveltekit-app)
- Júlia Alós (websocket-server)
- Àlex Amat (scoring-api Flask code)
- Alessio Sordo (scoring-api neutral network)

<div align="center">
  <img  src="https://github.com/discapes/hackupc2023/blob/master/assets/grid-snake.svg"
       alt="snake" />
</div>

### Preview

<div>
 <img src = "https://github.com/discapes/hackupc2023/blob/master/assets/Auth0_login.gif" width = 49%>
 <img src = "https://github.com/discapes/hackupc2023/blob/master/assets/courses.gif" width = 49%>
 </div>
