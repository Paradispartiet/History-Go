# People expansion — Oslo subkultur venues batch 3 validation

Dato: 2026-07-09

## Scope

Denne batchen legger til fem kollektive subkultur-/venue-miljøankre for eksisterende Oslo-steder:

- `revolver_oslo`
- `the_villa`
- `jaeger_oslo`
- `sub_scene`
- `mir_grunerlokka_lufthavn`

Dette er ikke en places-batch. Ingen nye places opprettes.

## Implementering

Ny people-fil:

- `data/people/subkultur/oslo/people_subkultur_oslo_venues_batch3.json`

Manifest oppdatert:

- `data/people/manifest.json`

## Added entries

| peopleId | primary placeId | category | type | status |
|---|---|---|---|---|
| `revolver_oslo_miljoet` | `revolver_oslo` | `subkultur` | kollektivt miljøanker | added |
| `the_villa_miljoet` | `the_villa` | `subkultur` | kollektivt miljøanker | added |
| `jaeger_oslo_miljoet` | `jaeger_oslo` | `subkultur` | kollektivt miljøanker | added |
| `sub_scene_miljoet` | `sub_scene` | `subkultur` | kollektivt miljøanker | added |
| `mir_grunerlokka_lufthavn_miljoet` | `mir_grunerlokka_lufthavn` | `subkultur` | kollektivt miljøanker | added |

## Gate checks

Repo-søk før opprettelse fant eksisterende place-grunnlag for kandidatene gjennom subkultur-place-data og batchrapportene.

Repo-søk fant ikke eksisterende miljøanker-ID-er for:

- `revolver_oslo_miljoet`
- `the_villa_miljoet`
- `jaeger_oslo_miljoet`
- `sub_scene_miljoet`
- `mir_grunerlokka_lufthavn_miljoet`

Alle fem entries er skrevet som kollektive miljøer, ikke navngitte personer.

## Ikke endret

- Ingen `data/places/**`
- Ingen `data/places/manifest.json`
- Ingen `data/places/places_index.json`
- Ingen quiz-filer
- Ingen UI/runtime/loader-filer
- Ingen ny place-research eller nye stedsbeslutninger

## Validering

Automatisk data-check workflow skal kjøre på PR-en.

Lokal fallback:

```bash
bash scripts/check-people.sh
```

Forventet:

- nye collective people anchors: 5
- nye named people: 0
- nye places: 0
- duplicatePeopleIds = 0
- invalidPlaceRefs = 0
- peopleWithoutValidPrimaryAnchor = 0
- peopleWithEmptyPlacesArray = 0

## Endrede filer

- `data/people/subkultur/oslo/people_subkultur_oslo_venues_batch3.json`
- `data/people/manifest.json`
- `reports/people-oslo-subkultur-venues-batch-3-validation.md`
