# People of Places — Eidsvollsbygningen batch 9 validation

## Intended scope

Stacked base: `agent/eidsvollsbygningen-people-batch8`

Batch 9 is intended to change only:

- `data/people/manifest.json`
- four new canonical person files under `data/people/politikk/akershus/eidsvollsbygningen/`
- `reports/people-eidsvollsbygningen-batch9-research.md`
- `reports/people-eidsvollsbygningen-batch9-validation.md`

No place data, place indexes, quiz data, Civication data, or unrelated people records are intentionally changed.

## Final significance gate

This is the final selective Eidsvollsbygningen pass. Attendance at the Riksforsamlingen is necessary but not sufficient.

Accepted records must have a clearly consequential constitutional, institutional or representative role tied directly to the assembly. The research report documents both accepted candidates and explicit exclusions.

## Canonical audit

No canonical person matches were found for:

- `arnoldus_von_westen_sylow_koren`
- `gregers_winther_wulfsberg`
- `tallev_olsen_huvestad`
- `ole_olsen_evenstad`

## Static structure checks

Each new canonical person record has:

- a unique planned canonical ID
- `visual.designCode: "person_politician_miniature"`
- `category: "politikk"`
- `placeId: "eidsvollsbygningen"`
- `places: ["eidsvollsbygningen"]`
- `year: 1814`
- `image` and `cardImage` fields

## Repository-local validation

The connected GitHub environment does not provide a runnable repository checkout. The following commands are therefore not reported as having passed locally:

```bash
mkdir -p reports/people-eidsvollsbygningen-batch9-runtime
npm run audit:people-of-places \
  | tee reports/people-eidsvollsbygningen-batch9-runtime/audit-people-of-places.txt
npm run tools:check \
  | tee reports/people-eidsvollsbygningen-batch9-runtime/tools-check.txt
```

Expected People of Places audit invariants remain:

- `duplicatePeopleIds: 0`
- `invalidPlaceRefs: 0`
- `peopleWithoutValidPrimaryAnchor: 0`
- `peopleWithEmptyPlacesArray: 0`

## Structural validation

Before opening the pull request, a direct branch comparison against `agent/eidsvollsbygningen-people-batch8` must show exactly seven changed files:

- one manifest update adding the four new file paths
- four new canonical person files
- the batch-9 research report
- this validation report

Any unrelated file in that comparison is out of scope and must be removed before the PR is opened.
