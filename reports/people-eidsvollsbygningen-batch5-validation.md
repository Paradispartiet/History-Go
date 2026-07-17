# People of Places — Eidsvollsbygningen batch 5 validation

## Canonical audit

- Audited all five planned candidates before creating new records.
- `peder_anker` already exists in `data/people/historie/oslo/people_historie_oslo.json`.
- The existing Peder Anker record keeps `bogstad_gard` as primary `placeId` and already contains `eidsvollsbygningen` in `places`.
- No canonical person record or exact canonical ID was found for:
  - `jens_schow_fabricius`
  - `frederik_meltzer`
  - `jonas_rein`
  - `andreas_rogert`

## Data changes

Added four new canonical person files under:

`data/people/politikk/akershus/eidsvollsbygningen/`

- `jens_schow_fabricius.json`
- `frederik_meltzer.json`
- `jonas_rein.json`
- `andreas_rogert.json`

Updated `data/people/manifest.json` with exactly these four new paths.

A branch comparison against `main` after the person and manifest changes showed:

- manifest: 5 additions / 1 deletion, corresponding to converting the prior final entry to a comma-terminated entry and appending four paths
- four added person files
- no unrelated data files changed

## Static structure checks

Each new person record has:

- unique planned canonical ID
- `category: "politikk"`
- `placeId: "eidsvollsbygningen"`
- `places: ["eidsvollsbygningen"]`
- `year: 1814`
- `visual.designCode: "person_politician_miniature"`
- `image` and `cardImage` fields

The research gate is documented in `reports/people-eidsvollsbygningen-batch5-research.md`.

## Repository commands

The following repository-local commands could not be executed in this connector-only environment because there is no usable local checkout with the project dependencies:

- `npm run audit:people-of-places`
- `npm run tools:check`

These are therefore not reported as passed here. Pull-request CI should be treated as the authoritative executable validation for this branch; the report should be updated if CI exposes a batch-specific issue.
