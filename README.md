# Playground Agent Frontend

Responsive GOBI88 reference template for Playground, with 238 copied local images and browser-local demo workflows. No live payment, betting session, authentication backend, source-site API, tracker or third-party chat is connected.

## Run

Node 24 recommended; no runtime dependencies. jsdom is used only by development tests.

```sh
npm ci
npm run build
npm test
npm start
```

Open localhost:3000. Railway uses PORT and /health. Discovered page URLs support direct loading and refresh.

Live preview: https://playground-agent-frontend-production.up.railway.app

## Demo access

Default signed-in demo: playground_demo. After logout, use password demo1234. Registration is a browser-local simulation; entered passwords are discarded. Use sample data only. Reset demo state from the footer.

## Workflows

Search, provider/category filters, favorites, hero carousel, mobile drawer, preview launches and history, profile, registration/login/reset simulations, pending/completed/cancelled deposit and withdrawal states, one-time bonuses, inbox, referral copying, support tickets and local chat.

Withdrawals reserve demo balance; cancellation returns it once. Deposits only credit after simulated completion. Idempotent settlement and one-time bonus claims are covered by tests.

## Branding and data

public/config.js configures the brand/navigation. public/data.json contains the captured catalog. Local images are under public/assets. Source URLs, byte sizes and SHA-256 hashes are in docs/reference/asset-copy-manifest.json. No source account values or session credentials are included.

The default retains the requested reference logo and visual assets with a clear Playground preview notice. Replace tenant brand assets/config during integration.

## Backend integration

public/state.js implements the pure demo state adapter. Replace local persistence and actions with authenticated Playground APIs in the next phase. Backend must remain authoritative for identity, tenant boundaries, balances, payment status, rewards and provider sessions. Never promote browser demo balances to live data.

## Coverage

Reference-site native-mobile rendering and some deep states were unavailable during audit. Responsive layout is implemented for 360–1920px. Fishing lobby, live provider sessions, APK downloads, streaming and live results display explicit preview or unavailable states until connected. This is a frontend template, not a live betting platform.

21 automated tests cover HTTP serving, the 131 discovered route views, DOM interactions, persistence and wallet state transitions. DOM tests do not render pixels or validate responsive geometry. See docs/DEPLOYMENT_QA_2026-11-03.md for the deployment checks and outstanding visual verification.

To restore captured assets, run `python3 scripts/restore-assets.py`. Each download must match its recorded SHA-256 hash; assets are committed to Git and served locally without runtime hotlinks.
