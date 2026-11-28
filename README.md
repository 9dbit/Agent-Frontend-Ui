# Playground Agent Frontend

Active working frontend based on **[OXPLAY Template v1.0.0](https://github.com/9dbit/OXPLAY-Template)**. The reusable template and visual asset archive live in that separate repository. This repository is used for project UI changes and future integration with [Playground](https://github.com/9dbit/Playground), and retains its existing Railway deployment. See `template-origin.json` and [the integration guide](docs/OXPLAY_TEMPLATE_GUIDE.md).

Responsive GOBI88 reference template for Playground, with 238 copied local images and browser-local demo workflows. No live payment, betting session, authentication backend, or source-site API is connected. Customer support uses the 64COR Chatvice widget (merchant m_ac01b0d69cb4d237).

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

Responsive preview: https://playground-agent-frontend-production.up.railway.app/preview/
This renders the same app in an iframe with a real 1440, 768, 393 or 360 pixel layout viewport. Scaling the outer preview does not change media-query dimensions inside it. Embedding is restricted to the same origin.

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

24 automated tests cover HTTP serving, the 131 discovered route views, DOM interactions, persistence and wallet state transitions. DOM tests do not render pixels or validate responsive geometry. See docs/DEPLOYMENT_QA_2026-11-03.md and docs/RESPONSIVE_QA_2026-11-03.md for deployment checks, the observed carousel loading fix and the historical visual-verification notes. Subsequent live Chromium checks passed all eight account tabs at 360, 393, 768 and 1440 px without horizontal document overflow; Casino, Promotion and Exclusive covers render portrait. Native iPhone Safari remains untested.

To restore captured assets, run `python3 scripts/restore-assets.py`. Each download must match its recorded SHA-256 hash; assets are committed to Git and served locally without runtime hotlinks.

## Playground-connected 64COR

The deployed app is the storefront for Playground tenant `64cor`, not a separate demo account database. `public/playground.js` loads the published CMS and selected game catalog from `/api/storefront`; player operations use `/api/player`. `storefront-proxy.mjs` pins the tenant, forwards only player sessions, enforces same-origin writes and excludes admin/provider endpoints. The default upstream is the authorized Playground agent sandbox; `PLAYGROUND_API_ORIGIN` overrides it for isolated integration tests. Do not point it at a different backend without provisioning the same tenant.

Banner slides (`home`, `banner-*`), promotion pages (`promo-*`), metadata and canonical are edited and published from Playground → 64COR → Website & SEO. Images owned by this frontend stay same-origin; uploaded Playground images are served through the restricted media proxy. Home metadata is included in initial production HTML.

Authentication, profile, password changes, favorites, inbox, transactions, wallet, rounds, support tickets and launch requests persist in Playground. Former local demo balances and accounts are not used or migrated. Payment processing remains sandbox simulation and requires agency coin inventory. Game sessions follow backend readiness; bonus/referral/leaderboard capabilities remain unavailable until their backend engines are enabled. Chatvice retains the existing 64COR merchant widget.

`npm test` covers the proxy boundary, SEO, static assets and the preserved template UI (the legacy UI fixtures explicitly use demo mode). Full connected browser tests live in Playground: `STOREFRONT_PATH=/absolute/path/to/Agent-Frontend-Ui AGENCY_BROWSER=true npm run test:agency`.
