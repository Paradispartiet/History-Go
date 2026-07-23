# sagene_kvernhus duplicate audit

Date: 2026-07-23

The attempted Glads mølle production was rejected by its canonical collision gate because `glads_molle` already exists at the exact same verified Geonorge address point.

## Canonical result

- Keep: `glads_molle` — Glads mølle, Sandakerveien 10A, source `geonorge-adresser-v1:0301:16161:10A`.
- Retire: `sagene_kvernhus` — broad unresolved business-category proxy.
- Migrate all active exact legacy-id references before removal.
- Add `sagene_kvernhus -> glads_molle` to the legacy place-id alias guard.
- Remove the unresolved coordinate-protocol row for the retired duplicate; no second physical coordinate is created.

## Reference inventory

Exact legacy-id occurrences: 83 across 18 files. See `summary.json` for the full file/line inventory.
