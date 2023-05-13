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
