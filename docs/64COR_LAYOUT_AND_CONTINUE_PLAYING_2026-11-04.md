# 64COR layout and Continue Playing — 4 November 2026

## Delivered behavior

- All twelve category icons are visible in six columns and two rows at every breakpoint. Artwork is exactly 10% larger: 44 → 48.4px desktop and 38 → 41.8px mobile.
- Dogica Pixel 64COR wordmark retains its 15° oblique and red/white colors, with a heavier outline.
- Rounded background cards are restored for Soft Tech, Hot Slots and Promosi; section heading icons are removed.
- The carousel fills the viewport width without rounded island edges. Original game and Soft Tech artwork retain their compositions; all sixteen legacy promotions fill their image slot with object-fit cover.
- A new Soft Tech original-games campaign banner leads the carousel and links to the three originals in search.
- Uno Luck has a red dragon thumbnail with a smaller, balanced UNO LUCK shield.
- The ticker uses a circled i. The header profile icon and duplicate breadcrumb category menu are removed.
- All eight account destinations are exposed as a wrapped grid in Akun Saya, Deposit and the other account pages.
- Continue Playing shows the last launched game's thumbnail, title, provider, Play and Close above the floating dock. Its card uses the same 3:1 proportions as promotion covers. It aligns with the dock and leaves a 10px gap on mobile.

## Persistence and scope

A detail-page visit does not count as playing. A provider preview launch or original-game launch records the game ID and timestamp in existing browser storage. The card survives reload/navigation, and closing it persists until another launch. Existing compatible play history migrates automatically. Removed/unknown IDs and malformed records do not render a card. Original-game links retain native new-tab navigation; their external gameplay state and progress are not available to 64COR. Wallet/provider integration is unchanged.

## Validation

- `npm test`: 33 passed, including 131 route checks, resume/reload/dismissal, external launch targets, legacy history migration and malformed remembered games.
- `npm run build`: passed, 310 local asset references.
- Browser: 360, 393, 768 and 1440 presets all show exactly six columns/two rows and no horizontal page or category overflow. Hero width matches the viewport and has zero corner radius.
- Account and Deposit: all eight buttons are visible; mobile account navigation has four columns, two rows, no horizontal scrolling.
- Continue Playing verified with a local preview launch; mobile card and dock both measure 354px wide with a 10px gap.
- Screenshot: `docs/qa/64cor-full-layout-20261104.jpg`.

## Artwork

Built-in image generation created the following versioned assets:

- `public/assets/soft-tech/uno-luck-red-dragon-v3.webp` — 512 × 512. Prompt: edit the prior ruby/ivory/gold Uno Luck icon to feature a crimson Chinese dragon, with colorful cards and a proportionally smaller readable UNO LUCK shield, full bleed burgundy background.
- `public/assets/soft-tech/soft-tech-originals-hero-v1.webp` — 1800 × 600. Prompt: full-bleed 3:1 original-games publisher campaign, preserving the supplied Soft Tech pixel-neon identity and combining the Uno cards/dragon, Mahjong jade/gold theme and Skygate Zeus/lightning.

Generated source images are preserved. WebP copies are optimized for this website; the external original-game repositories were not modified.
