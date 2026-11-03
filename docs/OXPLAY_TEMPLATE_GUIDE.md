# OXPLAY Template — repository and integration guide

## Decision

Maintain independent template and working frontend repositories. Existing `9dbit/Agent-Frontend-Ui` remains the working copy, preserving its history, links, and Railway deployment. `9dbit/OXPLAY-Template` is the extracted reusable template. A third frontend copy would be redundant.

The archive is versioned with release tags. It remains a usable GitHub template rather than being switched to GitHub's read-only Archived status.

## Ownership

| Repository | Changes |
| --- | --- |
| OXPLAY-Template | Shared layout fixes, reusable components, template assets and releases |
| Agent-Frontend-Ui | Project branding, tenant UI, live API adapter and account presentation |
| Playground | API contracts, persistence, business logic, authorization and authoritative account state |

Changes do not synchronize automatically. Review and copy or cherry-pick individual reusable fixes. Record compatible frontend and backend contract versions.

## Baseline

Source commit: `3513a9181f049815cc04dcc7fbcb001752a1aad0`, before template metadata was added. Original application assets and catalog records are preserved. `template.json` records provenance.

## Integration sequence

1. Inspect the actual Playground API, tenant configuration and authentication model. Record the existing contract; do not invent endpoint names.
2. Introduce an adapter boundary for identity, catalog, promotions, account data and history. Retain a separate local demo adapter.
3. Connect read-only views first, including loading, empty, retry, expired-session and denied-access states.
4. Connect account-changing workflows in an isolated test environment. Backend responses own final state; handle duplicate submissions and retries.
5. Verify tenant boundaries, responsive forms, keyboard use, errors and end-to-end workflows before changing production configuration.
6. Release the working frontend independently. Record template and backend contract versions in the release checkpoint.

This separation does not enable backend integration. The working deployment remains a frontend demo until integration is implemented and tested.
