# create-svelte

## Setup

- Set MONGO_URL and AUTH0_SIGNKEY in .env.
- Set auth0 to use HS256 for the JWT
- Add http://localhost:5173 and production domain to auth0 authorized domains
- Add an auth0 action to add app_metadata to the JWT
- Add an admin field to your user's app_metadata in auth0

## Common MongoDB patterns:

`.replaceOne(noteFav, noteFav, { upsert: true });` - make sure noteFav exists
`.deleteOne(noteFav);` - make sure noteFav doesn't exist
`.replaceOne(noteFilter, { ...noteFilter, text, anonymous }, { upsert: true })` - make sure noteFilter exists, and change its state

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
