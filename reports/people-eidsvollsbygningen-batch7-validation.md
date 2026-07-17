# People of Places — Eidsvollsbygningen batch 7 validation

## Intended scope

Base: current `main` after Eidsvollsbygningen batches 5 and 6 were merged.

Batch 7 is intended to change only:

- `data/people/manifest.json`
- five new canonical person files under `data/people/politikk/akershus/eidsvollsbygningen/`
- `reports/people-eidsvollsbygningen-batch7-research.md`
- `reports/people-eidsvollsbygningen-batch7-validation.md`

No place data, place indexes, quiz data, Civication data, or unrelated people records are intentionally changed.

## Canonical audit

Exact names, proposed IDs and relevant spelling variants were searched before creation. No canonical person matches were found for:

- `Theis Jacob Thorkildsen Lundegaard` / `theis_lundegaard`
- `Ole Rasmussen Apeness` / `ole_rasmussen_apeness`
- `Zacharias Rasmussen Mellebye` / `zacharias_mellebye`
- `Christian Hersleb Horneman` / `christian_hersleb_horneman`
- `Peter Ulrik Magnus Hount` / `peter_ulrik_magnus_hount`

Additional alias checks included `Teis Lundegaard`, `Ole Rasmussen Apenes`, `Zacharias Rasmussen Mellebye` and `Christian Hersleb Hornemann`.

## Research gate

All five new records have explicit documented participation in the Riksforsamlingen at Eidsvoll in 1814. Candidate-specific roles, source notes and caution points are documented in `reports/people-eidsvollsbygningen-batch7-research.md`.

## Static structure checks

Each new canonical person record has:

- a unique planned canonical ID
- `visual.designCode: "person_politician_miniature"`
- `category: "politikk"`
- `placeId: "eidsvollsbygningen"`
- `places: ["eidsvollsbygningen"]`
- `year: 1814`
- `image` and `cardImage` fields

Zacharias Rasmussen Mellebye is deliberately not assigned a political-party tag because the available official biography presents that affiliation as uncertain.

## Repository-local validation

The connected GitHub environment used for this batch does not provide a runnable repository checkout. The following commands have therefore not been falsely reported as passing locally:

```bash
mkdir -p reports/people-eidsvollsbygningen-batch7-runtime
npm run audit:people-of-places \
  | tee reports/people-eidsvollsbygningen-batch7-runtime/audit-people-of-places.txt
npm run tools:check \
  | tee reports/people-eidsvollsbygningen-batch7-runtime/tools-check.txt
```

Expected People of Places audit invariants remain:

- `duplicatePeopleIds: 0`
- `invalidPlaceRefs: 0`
- `peopleWithoutValidPrimaryAnchor: 0`
- `peopleWithEmptyPlacesArray: 0`

## Structural validation

Before opening the pull request, a direct branch comparison against current `main` must show exactly eight changed files:

- one manifest update adding the five new file paths
- five new canonical person files
- the batch-7 research report
- this validation report

Any unrelated file in that comparison is out of scope and must be removed before the PR is opened.
