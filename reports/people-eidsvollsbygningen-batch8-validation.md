# People of Places — Eidsvollsbygningen batch 8 validation

## Intended scope

Stacked base: `agent/eidsvollsbygningen-people-batch7`

Batch 8 is intended to change only:

- `data/people/manifest.json`
- five new canonical person files under `data/people/politikk/akershus/eidsvollsbygningen/`
- `reports/people-eidsvollsbygningen-batch8-research.md`
- `reports/people-eidsvollsbygningen-batch8-validation.md`

No place data, place indexes, quiz data, Civication data, or unrelated people records are intentionally changed.

## Selection threshold

This batch does not treat attendance at the Riksforsamlingen as sufficient on its own. Every accepted person must also have a clearly consequential constitutional role, assembly leadership, a distinctive historically important position in a major debate, or substantial later national political significance.

The research report documents why each accepted person passes this stricter significance threshold. Palle Rømer Fleischer and Gustav Peter Blom were considered but excluded because stronger candidates with more direct significance at Eidsvoll were available.

## Canonical audit

No canonical person matches were found for:

- `claus_bendeke`
- `hilmar_meincke_krohg`
- `frederik_hartvig_johan_heidmann`
- `peder_valentin_rosenkilde`
- `hans_christian_ulrik_midelfart`

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
mkdir -p reports/people-eidsvollsbygningen-batch8-runtime
npm run audit:people-of-places \
  | tee reports/people-eidsvollsbygningen-batch8-runtime/audit-people-of-places.txt
npm run tools:check \
  | tee reports/people-eidsvollsbygningen-batch8-runtime/tools-check.txt
```

Expected People of Places audit invariants remain:

- `duplicatePeopleIds: 0`
- `invalidPlaceRefs: 0`
- `peopleWithoutValidPrimaryAnchor: 0`
- `peopleWithEmptyPlacesArray: 0`

## Structural validation

Before opening the pull request, a direct branch comparison against `agent/eidsvollsbygningen-people-batch7` must show exactly eight changed files:

- one manifest update adding the five new file paths
- five new canonical person files
- the batch-8 research report
- this validation report

Any unrelated file in that comparison is out of scope and must be removed before the PR is opened.
