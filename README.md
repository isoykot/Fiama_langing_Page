# FiamaFashion Cloudflare Worker

## Project structure
- `src/index.js` — Worker entry point
- `src/core.js` — shared constants, validation, database, encryption, authentication and utilities
- `src/router.js` — page routing, API endpoints, offers and print configuration
- `src/templates.js` — customer landing page and admin HTML templates
- `wrangler.jsonc` — Cloudflare Worker and D1 configuration

## Setup
1. Install Node.js (LTS).
2. Run `npm install`.
3. Run `npx wrangler login`.
4. Create a D1 database: `npx wrangler d1 create fiamafashion-db`.
5. Paste the returned database ID into `wrangler.jsonc` (replace `PASTE_YOUR_D1_DATABASE_ID_HERE`).
6. Add secrets using the terminal: `npx wrangler secret put DATA_KEY`, `npx wrangler secret put ADMIN_DEFAULT_USER`, and `npx wrangler secret put ADMIN_DEFAULT_PASS`. `DATA_KEY` must be at least 16 characters and must be kept unchanged after data has been encrypted.
7. If push notifications are used, also add `FCM_SERVICE_ACCOUNT` as a secret and `FCM_PROJECT_ID` as a variable.
8. Deploy: `npm run deploy`.

**Important:** Do not upload secrets, `.dev.vars`, passwords, Firebase service-account JSON, or real encryption keys to GitHub. Keep them in Cloudflare Worker Secrets/Variables. The code's existing database schema is initialized by the Worker on request.
