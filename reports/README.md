# Reports README

## Primary data health system

`npm run health:data` is now the primary, Node-based report command for data coverage and planning.

It generates:
- `reports/data-health-summary.md`
- `reports/data-health-full.json`

Use `reports/data-health-summary.md` as the planning baseline for new data batches.

## Legacy reports and audits

- Existing markdown reports in `reports/` are historical snapshots.
- Browser/runtime audits (for example in `js/audits/`) can still be used for runtime debugging.
- Browser/runtime audits are no longer the primary source of overall dataset status.

## Transitional note

`health:places` is intentionally kept during transition, but the main workflow should move to `health:data`.
