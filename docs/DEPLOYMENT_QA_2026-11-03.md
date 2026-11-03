# Deployment and QA — 3 November 2026

Preview: https://playground-agent-frontend-production.up.railway.app

Repository change: https://github.com/9dbit/Agent-Frontend-Ui/pull/2

Railway project: Playground. Service: playground-agent-frontend. Environment: production.
The new service is separate from the existing admin, UI sandbox, agent sandbox and database services.

## Verified

- Railway build and health check succeeded for application commit `10796efc87777659a037f5134374c12033c61b62`.
- 238 source assets plus a readable logo alias are committed in Git. All 239 image files decoded successfully with Pillow or XML parsing. All captured assets match the recorded SHA-256 hashes.
- 16 hero banners, 85 captured game entries and 50 provider entries are available in the local data catalog. These are the audited subset, not a claim to cover every asset in the original service.
- 21 automated tests passed: 4 server tests, 9 state tests and 8 DOM interaction tests.
- All 131 discovered routes serve the app and render a usable view without runtime exceptions in the DOM test harness.
- DOM workflows covered: carousel selection, drawer/Escape, search, provider filter, favorites, deposit completion, insufficient-balance rejection, withdrawal cancellation, single bonus/promotion claim, logout/login validation, registration, profile editing, support ticket, inbox, local chat, game preview/history and persistence across documents.
- 25 live HTTP checks passed: health, representative category/member pages, app modules/styles/data, logo and sample image assets. Returned static bytes matched the checked-out application. Missing static files returned an error.

## Verification boundary

Browser connection attempts for live visual QA repeatedly timed out. Screenshots and actual responsive geometry at desktop/tablet/mobile sizes were therefore **not verified**. DOM tests do not render CSS or measure layout. Media queries are implemented at 1100, 850, 599 and 374 pixels, with safe-area mobile navigation, horizontally scrolling rails/tabs and reduced-motion support.

The source audit also could not establish a reliable native-mobile reference and did not inspect every deep screen. Refer to the source audit and route inventory for inspected versus discovered coverage.

## Demo boundary and next integration

Login, registration, balance, transactions, bonuses, support and chat are local simulations. No passwords are stored or transmitted, and no live account, payment, bet, provider session, email, or support message is created. Live game providers, fishing catalog, streaming, app downloads and live results require backend configuration. Promotion terms and legal/help copy on uninspected screens are explicit template/demo content.

Replace local state actions with authenticated tenant-aware Playground APIs. The backend must authorize identity, wallet mutations, transaction settlement, bonuses and provider sessions; browser demo state must never become authoritative production data.
