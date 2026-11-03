# 64COR design update — 4 November 2026

Prepared locally for Agent-Frontend-Ui. Publication is pending explicit approval to push main and trigger Railway. OXPLAY-Template is unchanged.

## Changes
- Pixel SVG 64COR wordmark: red 64, white COR; matching favicon.
- Search, Deposit, Promotions, Account and shared surfaces: 20px mobile / 24px desktop rounded panels.
- Category SVG icons retain navigation meaning with ruby glass faces, bevels and extrusion.
- Soft Tech section before Hot Slots: three square rounded app icons and local detail routes; originals are searchable and can be favorited.
- Three 2048×683 original hero banners precede retained promotional slides. Banners link to the matching game details.
- Game launch links come from 9dbit/Soft-Tech src/data/games.ts; launch uses a separate tab. No player session or wallet integration was added.

## Source assets
- Mahjong Wild icon: 9dbit/Mahjong-legend web/assets/approved-v082/icon-512.png.
- Skygate icon: 9dbit/Skygate play/icons/skygate-touch-512-v0139.png.
- Uno Luck icon: reproduced by the existing build_social_assets.py from deploy/cp09-uno-runtime-preserved using its original boot-uno-banner.webp; this is the same production app icon build pipeline.
- Soft Tech pixel font: 9dbit/Soft-Tech public/fonts/softtech-minecraft.woff2.
- Banners generated using the built-in image tool from original covers in 9dbit/Soft-Tech, then encoded as WebP without cropping.

## Hero creative briefs
Common: one panoramic 3:1 website hero, edge to edge, center 90% safe area, rich 3D materials, no phone frame, controls, monetary promises or CTA. Include SOFT TECH ORIGINAL.
- Uno Luck: source winged gold UNO LUCK wordmark, adult fantasy character, red/gold dragon, glossy colored cards; logo left, character and dragon right; burgundy, fire and gold.
- Mahjong Wild: source MAHJONG WILD title, gold dragons, emerald jade clouds, ivory tiles; title left, floating tiles and dragon right; remove all phone controls, balances and multipliers.
- Skygate: source stone Zeus with gold eyes and lightning; rustic gold SKYGATE and blue sapphire 5000 left, Zeus and Greek pillars right; midnight blue and gold.

## Validation
- 28 automated tests passed, including new Soft Tech hero/detail/search routes.
- Build validation passed: 308 local asset references, 88 games.
- Browser preview: Home, Search, Deposit, Promotions, Account checked at 360, 393, 768, 1440 CSS viewport presets; no horizontal document overflow.
- Rounded panel computed styles verified: 20px mobile, 24px tablet/desktop.
- 12 glass category icons; 3 Soft Tech cards; no broken homepage image loads.
- Screenshot: docs/qa/64cor-mobile-preview-20261104.jpg.

## Remaining
Push approved commits to main, await Railway success and verify live assets. No live publication was attempted after the prior automatic approval rejection.
