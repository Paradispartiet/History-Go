# Content i18n places batch 9

## Status

- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Priority: next visible Oslo/Østlandet places after batch 8.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope

Files changed:

- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-9.md`

## Selection method

The 20 ids were selected from canonical ids in `data/places/manifest.json` and manifest-listed source files, then compared against `data/i18n/content/places/en.json`, `data/i18n/content/places/es.json` and `data/i18n/content/places/pt.json`.

Selection excluded ids documented in content-i18n batches 4, 5, 6, 7 and 8. It prioritized remaining visible Oslo politics/subculture places with direct `name`, `desc` and `popupDesc` fields, then filled the final slots with the next missing manifest-backed Østlandet history/church/railway-border places. Already translated, stale translation-only, non-manifest and entries without direct visible fields were excluded.

## Source placeIds

| placeId | Canonical source file | Selection reason | Fields translated |
|---|---|---|---|
| `politihuset_gronland` | `data/places/politikk/oslo/places_politikk.json` | Oslo politics/institution place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `blitzhuset` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `kafe_haerverk` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `brenneriveien_ingens_gate` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `gamlebyen_sport_og_fritid` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `oslo_skatehall` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `xray_ungdomskulturhus` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `vaterland_bar_scene` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `helvete_neseblod_records` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `last_train_oslo` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `rock_in_oslo` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `club_7_vika` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `revolver_oslo` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `the_villa` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `jaeger_oslo` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `sub_scene` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `mir_grunerlokka_lufthavn` | `data/places/subkultur/oslo/places_subkultur.json` | Oslo subculture place; remaining untranslated visible direct fields | `name`, `desc`, `popupDesc` |
| `rakkestad_prestegard_1814` | `data/places/historie/ostfold/places_historie_ostfold_batch4.json` | Next missing Østlandet border-history place after Oslo priority candidates | `name`, `desc`, `popupDesc` |
| `aremark_kirke_kirkested` | `data/places/historie/ostfold/places_historie_ostfold_batch4.json` | Next missing Østlandet church/borderland place after Oslo priority candidates | `name`, `desc`, `popupDesc` |
| `kornsjo_grensestasjon` | `data/places/historie/ostfold/places_historie_ostfold_batch4.json` | Next missing Østlandet railway/border-control place after Oslo priority candidates | `name`, `desc`, `popupDesc` |

## Skipped candidates

| placeId | Reason skipped |
|---|---|
| `bislett` | added in earlier content-i18n batch |
| `naturhistorisk_museum` | added in earlier content-i18n batch |
| `hoytorp_fort` | added in earlier content-i18n batch |
| `schous_plass` | stale translation-only id |
| `brekke_sluser_haldenkanalen` | valid later candidate, but lower priority than the selected Oslo-first batch 9 ids |

## Translation summary

| Language | File | Entries before | Entries after | Added entries |
|---|---|---:|---:|---:|
| English | `data/i18n/content/places/en.json` | 528 canonical / 534 total | 548 canonical / 554 total | 20 |
| Spanish | `data/i18n/content/places/es.json` | 528 canonical / 534 total | 548 canonical / 554 total | 20 |
| Portuguese | `data/i18n/content/places/pt.json` | 528 canonical / 534 total | 548 canonical / 554 total | 20 |

Actual repo counts match the expected batch-8 baseline plus 20 new manifest-backed entries.

## Added translations

| placeId | en | es | pt | Notes |
|---|---|---|---|---|
| `politihuset_gronland` | Police Headquarters at Grønland | Jefatura de Policía en Grønland | Sede da Polícia em Grønland | Direct visible fields only |
| `blitzhuset` | Blitz House | Blitzhuset | Blitzhuset | Direct visible fields only |
| `kafe_haerverk` | Kafé Hærverk | Kafé Hærverk | Kafé Hærverk | Direct visible fields only |
| `brenneriveien_ingens_gate` | Brenneriveien / Ingens gate | Brenneriveien / Ingens gate | Brenneriveien / Ingens gate | Direct visible fields only |
| `gamlebyen_sport_og_fritid` | Gamlebyen Sport og Fritid | Gamlebyen Sport og Fritid | Gamlebyen Sport og Fritid | Direct visible fields only |
| `oslo_skatehall` | Oslo Skatehall | Oslo Skatehall | Oslo Skatehall | Direct visible fields only |
| `xray_ungdomskulturhus` | X-Ray Youth Culture House | Casa de Cultura Juvenil X-Ray | Casa de Cultura Juvenil X-Ray | Direct visible fields only |
| `vaterland_bar_scene` | Vaterland Bar & Scene | Vaterland Bar & Scene | Vaterland Bar & Scene | Direct visible fields only |
| `helvete_neseblod_records` | Helvete / Neseblod Records | Helvete / Neseblod Records | Helvete / Neseblod Records | Direct visible fields only |
| `last_train_oslo` | Last Train | Last Train | Last Train | Direct visible fields only |
| `rock_in_oslo` | Rock In | Rock In | Rock In | Direct visible fields only |
| `club_7_vika` | Club 7 | Club 7 | Club 7 | Direct visible fields only |
| `revolver_oslo` | Revolver | Revolver | Revolver | Direct visible fields only |
| `the_villa` | The Villa | The Villa | The Villa | Direct visible fields only |
| `jaeger_oslo` | Jaeger | Jaeger | Jaeger | Direct visible fields only |
| `sub_scene` | Sub Scene | Sub Scene | Sub Scene | Direct visible fields only |
| `mir_grunerlokka_lufthavn` | MIR / Grünerløkka Lufthavn | MIR / Grünerløkka Lufthavn | MIR / Grünerløkka Lufthavn | Direct visible fields only |
| `rakkestad_prestegard_1814` | Rakkestad Parsonage | Rectoría de Rakkestad | Reitoria de Rakkestad | Direct visible fields only |
| `aremark_kirke_kirkested` | Aremark Church / church site | Iglesia de Aremark / lugar eclesiástico | Igreja de Aremark / lugar eclesiástico | Direct visible fields only |
| `kornsjo_grensestasjon` | Kornsjø station / border station | Estación de Kornsjø / estación fronteriza | Estação de Kornsjø / estação fronteiriça | Direct visible fields only |

## Fields translated

| placeId | name | desc | popupDesc | Other fields |
|---|---:|---:|---:|---|
| `politihuset_gronland` | yes | yes | yes | none |
| `blitzhuset` | yes | yes | yes | none |
| `kafe_haerverk` | yes | yes | yes | none |
| `brenneriveien_ingens_gate` | yes | yes | yes | none |
| `gamlebyen_sport_og_fritid` | yes | yes | yes | none |
| `oslo_skatehall` | yes | yes | yes | none |
| `xray_ungdomskulturhus` | yes | yes | yes | none |
| `vaterland_bar_scene` | yes | yes | yes | none |
| `helvete_neseblod_records` | yes | yes | yes | none |
| `last_train_oslo` | yes | yes | yes | none |
| `rock_in_oslo` | yes | yes | yes | none |
| `club_7_vika` | yes | yes | yes | none |
| `revolver_oslo` | yes | yes | yes | none |
| `the_villa` | yes | yes | yes | none |
| `jaeger_oslo` | yes | yes | yes | none |
| `sub_scene` | yes | yes | yes | none |
| `mir_grunerlokka_lufthavn` | yes | yes | yes | none |
| `rakkestad_prestegard_1814` | yes | yes | yes | none |
| `aremark_kirke_kirkested` | yes | yes | yes | none |
| `kornsjo_grensestasjon` | yes | yes | yes | none |

## Quality checks

- JSON parse result: `place content json ok`.
- Selected ids present in all three files: `selected place translations ok`.
- No empty values among new entries.
- No missing selected ids.
- No runtime files changed.
- No UI dictionaries changed.
- No canonical place data changed.
- No places_index regeneration.
- Batch 7 and batch 8 reports unchanged.
- Existing broad audit still reports unrelated stale/missing/extra ids outside this batch; selected batch 9 ids are present in all three language files.

## Known non-goals

- No stale id cleanup.
- No nested `for_na`, `works`, `tasks_profile`, `leksikon`.
- No quiz/people/story/Civication translations.
- No `places_index.json` regeneration.

## Recommended next batch

`Content i18n batch 10 — translate next visible Oslo/Østlandet places to en/es/pt`

## Validation

Commands run:

- `node -e "for (const f of ['data/i18n/content/places/en.json','data/i18n/content/places/es.json','data/i18n/content/places/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('place content json ok')"`
- selected-id presence and empty-value Node check for the 20 batch 9 ids
- `git diff -- data/i18n/ui`
- `git diff -- js`
- `git diff -- data/places`
- `git diff -- data/places/places_index.json`
- `git diff -- reports/content-i18n-places-batch-7.md`
- `git diff -- reports/content-i18n-places-batch-8.md`
- `git diff --check`
- `npm run i18n:places:audit` (warning: broad existing audit exits non-zero because it reports unrelated stale/missing/extra ids outside this batch)

## Final note

No runtime files changed. No UI dictionaries changed. No canonical place data changed. No places_index regeneration. Batch 7 and batch 8 reports unchanged.
