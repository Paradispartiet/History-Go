# People expansion — Oslo subkultur skate anchors batch 2 validation

Dato: 2026-07-09

## Scope

Denne batchfilen skal nå bare inneholde det ene miljøankeret som ikke allerede fantes fra tidligere merget subkultur-batch:

- `oslo_skatehall`

Dette er ikke en places-batch. Ingen nye places opprettes.

## Cleanup 2026-07-09

Etter merge ble det oppdaget at to av entryene i batchfilen allerede fantes fra PR #1737 i `data/people/subkultur/oslo/people_subkultur_oslo.json`:

- `skur13_miljoet`
- `gamlebyen_sport_og_fritid_miljoet`

De to duplikatene er derfor fjernet fra `data/people/subkultur/oslo/people_subkultur_oslo_skate_anchors_batch2.json`.

## Implementering

People-fil:

- `data/people/subkultur/oslo/people_subkultur_oslo_skate_anchors_batch2.json`

Manifest:

- `data/people/manifest.json`

Manifestet beholdes uendret fordi filen fortsatt inneholder `oslo_skatehall_miljoet`.

## Current entries

| peopleId | primary placeId | category | type | status |
|---|---|---|---|---|
| `oslo_skatehall_miljoet` | `oslo_skatehall` | `subkultur` | kollektivt miljøanker | kept |
| `skur13_miljoet` | `skur13` | `subkultur` | kollektivt miljøanker | removed duplicate; already in PR #1737 |
| `gamlebyen_sport_og_fritid_miljoet` | `gamlebyen_sport_og_fritid` | `subkultur` | kollektivt miljøanker | removed duplicate; already in PR #1737 |

## Ikke endret

- Ingen `data/places/**`
- Ingen `data/places/manifest.json`
- Ingen `data/places/places_index.json`
- Ingen quiz-filer
- Ingen UI/runtime/loader-filer
- Ingen ny research eller nye stedsbeslutninger

## Validering

Automatisk data-check workflow skal kjøre på PR-en.

Lokal fallback:

```bash
bash scripts/check-people.sh
```

Forventet:

- current entries in this batch file: 1
- duplicatePeopleIds = 0
- invalidPlaceRefs = 0
- peopleWithoutValidPrimaryAnchor = 0
- peopleWithEmptyPlacesArray = 0

## Endrede filer i cleanup

- `data/people/subkultur/oslo/people_subkultur_oslo_skate_anchors_batch2.json`
- `reports/people-oslo-subkultur-skate-anchors-batch-2-validation.md`
- `scripts/check-people.sh`
