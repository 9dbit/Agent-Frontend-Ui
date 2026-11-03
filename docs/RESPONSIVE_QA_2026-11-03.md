# Browser QA follow-up — 3 November 2026

Live site: https://playground-agent-frontend-production.up.railway.app

Responsive preview: https://playground-agent-frontend-production.up.railway.app/preview/

## Observed in the user's connected Chrome

- The live homepage rendered at 1440 × 1161 pixels with a 1440-pixel document width: no page-level horizontal overflow at that desktop size.
- Header, logo, category navigation, provider rail, game artwork, section cards and the support control rendered in the desktop screenshot.
- No image fallback markers or console errors/warnings were observed during that inspection.
- The hero carousel exposed a loading defect: its active image had `complete: false` and `naturalWidth: 0`, while earlier slides had finished loading. A screenshot confirmed a blank hero region during this transition.

## Fix

Hero images now load eagerly, with the first image at high priority and the remaining banners at low priority. Slide changes wait for image decoding while preserving the current visible banner. A request sequence prevents a slower previous click from overriding the latest selection. If decoding fails, the current banner remains visible.

An added DOM regression test holds the next image's decode promise open, checks that the current slide stays visible, resolves a newer selection first, and confirms that the older request cannot replace it. Together with the preview endpoint check, the automated suite now contains 23 tests.

## Responsive preview

The preview route embeds the same live app in an iframe with selectable layout widths of 1440, 768, 393 and 360 pixels. The outer frame can scale to fit the available screen while preserving the selected inner layout width. This permits responsive inspection without resizing the user's browser window. Both iframe sources and embedding parents are restricted to the same origin by Content Security Policy.

## Remaining verification

The browser resize operation did not complete and the connection subsequently became unavailable. Post-fix visual verification, tablet/mobile geometry and live browser workflow clicks remain pending. Automated DOM tests do not measure CSS layout or confirm screenshots. The preview page is prepared for the next connected-browser session; avoid using the browser-window resize operation again for this session.
