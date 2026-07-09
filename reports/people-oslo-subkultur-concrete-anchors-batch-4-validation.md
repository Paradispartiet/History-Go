# People expansion — Oslo subkultur concrete anchors batch 4 validation

Dato: 2026-07-09

## Scope

Denne batchen legger til fem kollektive miljøankre for konkrete Oslo subkultur-steder:

- `hausmania`
- `bla`
- `blitzhuset`
- `xray_ungdomskulturhus`
- `torggata_blad`

Dette er ikke en places-batch. Ingen nye places opprettes.

## Prinsipp

Batchen bruker bare konkrete steder: kulturhus, konsertscene, ungdomskulturhus og nisjebokhandel.

Den bruker ikke hybrid-/akse-/vegg-/undergang-/passasje-objekter.

## Implementering

Ny people-fil:

- `data/people/subkultur/oslo/people_subkultur_oslo_concrete_anchors_batch4.json`

Manifest oppdatert:

- `data/people/manifest.json`

## Added entries

| peopleId | primary placeId | category | type | status |
|---|---|---|---|---|
| `hausmania_miljoet` | `hausmania` | `subkultur` | kollektivt miljøanker | added |
| `bla_miljoet` | `bla` | `subkultur` | kollektivt miljøanker | added |
| `blitzhuset_miljoet` | `blitzhuset` | `subkultur` | kollektivt miljøanker | added |
| `xray_ungdomskulturhus_miljoet` | `xray_ungdomskulturhus` | `subkultur` | kollektivt miljøanker | added |
| `torggata_blad_miljoet` | `torggata_blad` | `subkultur` | kollektivt miljøanker | added |

## Gate checks

Før batchen ble laget ble tidligere deknings-PR-er kontrollert:

- PR #1737 dekker `skur13`, `gamlebyen_sport_og_fritid`, `kafe_haerverk` og `vaterland_bar_scene`.
- PR #1788 dekker `helvete_neseblod_records`, `last_train_oslo`, `rock_in_oslo` og `club_7_vika`.
- PR #1900 dekker `revolver_oslo`, `the_villa`, `jaeger_oslo`, `sub_scene` og `mir_grunerlokka_lufthavn`.

Repo-søk fant ikke eksisterende miljøanker-ID-er for de fem nye kandidatene.

`stovnertarnet` og `sofienbergparken_subkultur` er bevisst ikke tatt i denne batchen. De er konkrete steder, men ikke like tydelige subkultur-scene-/institusjonsankre som de fem som legges inn her.

## Ikke endret

- Ingen `data/places/**`
- Ingen `data/places/manifest.json`
- Ingen `data/places/places_index.json`
- Ingen quiz-filer
- Ingen UI/runtime/loader-filer
- Ingen nye steder
- Ingen hybridsteder

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

- `data/people/subkultur/oslo/people_subkultur_oslo_concrete_anchors_batch4.json`
- `data/people/manifest.json`
- `reports/people-oslo-subkultur-concrete-anchors-batch-4-validation.md`
