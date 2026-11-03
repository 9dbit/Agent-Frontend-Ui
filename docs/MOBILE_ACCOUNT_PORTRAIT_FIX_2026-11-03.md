# Account width and portrait cover correction

## Evidence

The supplied mobile account screenshot shows a horizontal menu expanding the account grid beyond the viewport. At the tablet breakpoint, the single `1fr` grid track retained its automatic minimum content width. Neither direct grid child could shrink below the navigation's content width.

The supplied homepage screenshot shows portrait Casino images cropped into the landscape slot-card frame. Dimensions were checked against the copied source image files:

| Source assets | Original dimensions | Display ratio |
| --- | --- | --- |
| Casino, including Top Tables | 187 × 303 / 374 × 606 | 187:303 |
| Promotion thumbnail posters | 447 × 598 | 447:598 |
| Exclusive covers | 447 × 598 and near-proportional variants | 447:598 |

## Changes

- Use a zero-minimum account grid track on tablet and mobile, and allow both account columns to shrink. Navigation and transaction tables scroll within their own bounded containers. Long text wraps. No page-level horizontal overflow hiding is used to mask the problem.
- Keep account form controls within the available width and use 16 px input text on mobile to avoid Safari's small-input focus zoom.
- Apply Casino portrait sizing wherever game cards render, including homepage, catalogues, search, and favorites. Preserve the complete cover with `object-fit: contain`.
- Restore portrait dimensions for Exclusive and Promotion covers.
- Separate the six copied promotion thumbnail posters from eight hero-only promotion records. Listings use the available source posters; all hero links and promotion detail/claim views remain available. Landscape hero images keep their existing banner dimensions.

## Validation and limits

- Build and automated suite cover route loading, original asset bytes, carousel behavior, account workflows, and promotion poster/detail mapping.
- Original-site reinspection in the user's local browser is unavailable in this session because its browser connector is not exposed. This patch uses the supplied screenshots and previously copied source assets. No new original-site browser inspection is claimed.
- DOM tests do not validate visual geometry. A fresh native mobile/Safari visual pass remains pending; the deployed `/preview/` supports desktop, tablet, and mobile iframe widths for that review.
