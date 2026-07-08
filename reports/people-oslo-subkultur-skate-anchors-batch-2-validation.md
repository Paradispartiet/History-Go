# People expansion — Oslo subkultur skate anchors batch 2 validation

Dato: 2026-07-09

## Scope

Denne batchen legger til tre kollektive subkultur-/skate-miljøankre for eksisterende Oslo-steder:

- `skur13`
- `gamlebyen_sport_og_fritid`
- `oslo_skatehall`

Dette er ikke en places-batch. Ingen nye places opprettes.

## Implementering

Ny people-fil:

- `data/people/subkultur/oslo/people_subkultur_oslo_skate_anchors_batch2.json`

Manifest oppdatert:

- `data/people/manifest.json`

## Added entries

| peopleId | primary placeId | category | type | status |
|---|---|---|---|---|
| `skur13_miljoet` | `skur13` | `subkultur` | kollektivt miljøanker | added |
| `gamlebyen_sport_og_fritid_miljoet` | `gamlebyen_sport_og_fritid` | `subkultur` | kollektivt miljøanker | added |
| `oslo_skatehall_miljoet` | `oslo_skatehall` | `subkultur` | kollektivt miljøanker | added |

## Gate checks

Repo-søk før opprettelse fant eksisterende place-filer for:

- `skur13`
- `gamlebyen_sport_og_fritid`
- `oslo_skatehall`

Repo-søk fant ikke eksisterende miljøanker-ID-er for:

- `skur13_miljoet`
- `gamlebyen_sport_og_fritid_miljoet`
- `oslo_skatehall_miljoet`

Alle tre nye entries er skrevet som kollektive miljøer, ikke navngitte personer.

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

- nye collective people anchors: 3
- nye named people: 0
- nye places: 0
- duplicatePeopleIds = 0
- invalidPlaceRefs = 0
- peopleWithoutValidPrimaryAnchor = 0
- peopleWithEmptyPlacesArray = 0

## Endrede filer

- `data/people/subkultur/oslo/people_subkultur_oslo_skate_anchors_batch2.json`
- `data/people/manifest.json`
- `reports/people-oslo-subkultur-skate-anchors-batch-2-validation.md`
