# Reports README

## Primary data health system

`npm run health:data` is the primary, Node-based report command for data coverage and planning.

It generates:

- `reports/data-health-summary.md`
- `reports/data-health-full.json`

Use `reports/data-health-summary.md` as the planning baseline for new data batches after confirming its generated timestamp.

## Generated operational reports

Some reports are current, reproducible outputs rather than immutable historical snapshots. Their authority comes from the generator and its source data, not from manual edits to the markdown file.

| Report | Generator | Runtime impact |
|---|---|---|
| `reports/civication-role-pack-index.md` | `npm run audit:civication:role-packs` | None; the same command also regenerates `data/Civication/rolePackIndex.json`, which is the runtime read model |
| `reports/data-health-summary.md` | `npm run health:data` | None |

Generated reports must have one output path. Do not copy the same generated markdown into `docs/` or `README/`. Documentation should link to the report and keep the normative contract separate.

## Legacy reports and audits

- Other existing markdown reports in `reports/` are historical snapshots unless their generator and current role are explicitly documented above.
- Browser/runtime audits, for example under `js/audits/`, can still be used for runtime debugging.
- Browser/runtime audits are not the primary source of overall dataset status.

## Transitional note

`health:places` is intentionally kept during transition, but the main workflow should move to `health:data`.
