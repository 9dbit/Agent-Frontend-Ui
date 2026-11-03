# 64COR category artwork refresh — 4 November 2026

The category navigation and drawer now use the user-supplied red, ivory and gold 3D artwork. Every existing destination is retained. Semua uses the diamond; Live Casino uses the casino chip; Card uses the ace cards. The remaining symbols map to their matching category labels.

The Soft Tech heading inherits the same typography as Hot Slots at every breakpoint. The 64COR wordmark continues using Dogica Pixel at a 15° oblique.

Uno Luck has a new square app thumbnail: a crowned winged shield with clear UNO LUCK lettering, ruby enamel, ivory cards and gold edging. Mahjong Wild and Skygate thumbnails are unchanged.

## Asset provenance

Both assets were made with the built-in image generation tool. The category atlas was extracted from the exact selected image `image-edit-target-607ad3c43c03f587.png`; its dark tiles and labels were removed. The Uno Luck thumbnail was redesigned using the previous game icon plus the supplied category reference. Generated originals are preserved; web assets are versioned WebP copies.

- `public/assets/navigation/red-ivory-gold-atlas-v1.webp`: transparent 1200 × 400 atlas, six columns by two rows.
- `public/assets/soft-tech/uno-luck-icon-v2.webp`: 512 × 512 thumbnail.

Category prompt: preserve all twelve red/ivory/gold objects in reference order, remove tile backgrounds and labels, output a transparent 6 × 2 atlas with square cells, complete centered objects, and no cropped edges.

Uno Luck prompt: redesign the existing crowned winged card shield as a full-bleed square app icon using the reference's glossy ruby/ivory/gold materials; retain readable UNO LUCK lettering; remove busy flames, people and blank margins.

## Validation

- `npm test`: 28 tests passed, including all 131 discovered routes and category destinations.
- `npm run build`: syntax and all 309 local asset references passed.
- Mobile 393 and 360: no horizontal page overflow; Soft Tech and Hot Slots both use Avenir/Helvetica/Arial, 18px and weight 750.
- Desktop visual inspection: all twelve new category symbols visible.
- Kontak navigation verified in browser; the new Uno Luck thumbnail loads correctly.
- Screenshot: `docs/qa/64cor-icon-refresh-20261104.jpg`.
