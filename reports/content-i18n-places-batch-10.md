# Content i18n places batch 10

## Status

- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Priority: next visible Oslo/Østlandet places after batch 9.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope

Files changed:

- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-10.md`

## Selection method

The 20 ids were selected from canonical ids in `data/places/manifest.json` and manifest-listed source files, then compared against `data/i18n/content/places/en.json`, `data/i18n/content/places/es.json` and `data/i18n/content/places/pt.json`.

Selection excluded ids documented in content-i18n batches 4, 5, 6, 7, 8 and 9. It prioritized remaining visible Oslo/Østlandet places with direct `name`, `desc` and `popupDesc` fields, starting with the remaining Oslo psychology candidate and then continuing through manifest-backed Østfold history/waterway/industry/church/coastal places plus the next Oslo/Buskerud history candidates. Already translated, stale translation-only, non-manifest and entries without direct visible fields were excluded.

## Source placeIds

| placeId | Canonical source file | Selection reason | Fields translated |
|---|---|---|---|
| `psykologisk_institutt_uio` | `data/places/psykologi/oslo/places_psykologi.json` | Remaining visible Oslo psychology place after batch 9 | `name`, `desc`, `popupDesc` |
| `stromsfoss_sluser` | `data/places/historie/ostfold/places_historie_ostfold_batch5.json` | Østlandet waterway/lock history candidate | `name`, `desc`, `popupDesc` |
| `moss_mollebyen_industri` | `data/places/historie/ostfold/places_historie_ostfold_batch5.json` | Østlandet industry/by-history candidate | `name`, `desc`, `popupDesc` |
| `tomb_herregard` | `data/places/historie/ostfold/places_historie_ostfold_batch5.json` | Østlandet estate/agricultural-history candidate | `name`, `desc`, `popupDesc` |
| `tune_kirke_kirkested` | `data/places/historie/ostfold/places_historie_ostfold_batch5.json` | Østlandet church/runic-history candidate | `name`, `desc`, `popupDesc` |
| `idd_kirke` | `data/places/historie/ostfold/places_historie_ostfold_batch5.json` | Østlandet medieval church candidate | `name`, `desc`, `popupDesc` |
| `hobol_kirke` | `data/places/historie/ostfold/places_historie_ostfold_batch5.json` | Østlandet medieval church/travel-route candidate | `name`, `desc`, `popupDesc` |
| `rakkestad_kirke` | `data/places/historie/ostfold/places_historie_ostfold_batch5.json` | Østlandet medieval church/rural-centre candidate | `name`, `desc`, `popupDesc` |
| `folkenborg_museum` | `data/places/historie/ostfold/places_historie_ostfold_batch6.json` | Østlandet rural museum/social-history candidate | `name`, `desc`, `popupDesc` |
| `elingaard_herregard` | `data/places/historie/ostfold/places_historie_ostfold_batch6.json` | Østlandet manor/estate-history candidate | `name`, `desc`, `popupDesc` |
| `nes_lensemuseum` | `data/places/historie/ostfold/places_historie_ostfold_batch6.json` | Østlandet river/work/forest-economy candidate | `name`, `desc`, `popupDesc` |
| `homlungen_fyr` | `data/places/historie/ostfold/places_historie_ostfold_batch6.json` | Østlandet coastal lighthouse/navigation candidate | `name`, `desc`, `popupDesc` |
| `spydeberg_kirke` | `data/places/historie/ostfold/places_historie_ostfold_batch6.json` | Østlandet church/1814-history candidate | `name`, `desc`, `popupDesc` |
| `trogstad_kirke` | `data/places/historie/ostfold/places_historie_ostfold_batch6.json` | Østlandet medieval church candidate | `name`, `desc`, `popupDesc` |
| `skiptvet_kirke` | `data/places/historie/ostfold/places_historie_ostfold_batch6.json` | Østlandet medieval church/river-landscape candidate | `name`, `desc`, `popupDesc` |
| `momarken_markedsplass` | `data/places/historie/ostfold/places_historie_ostfold_batch6.json` | Østlandet market/meeting-place candidate | `name`, `desc`, `popupDesc` |
| `akershus_festning` | `data/places/historie/oslo/places_historie.json` | Remaining visible Oslo fortress/history candidate | `name`, `desc`, `popupDesc` |
| `veien_kulturminnepark` | `data/places/historie/buskerud/places_historie_buskerud_batch1.json` | Østlandet archaeology/history candidate | `name`, `desc`, `popupDesc` |
| `norderhov_prestegard_1716` | `data/places/historie/buskerud/places_historie_buskerud_batch1.json` | Østlandet parsonage/war-history candidate | `name`, `desc`, `popupDesc` |
| `kongsberg_solvverk` | `data/places/historie/buskerud/places_historie_buskerud_batch1.json` | Østlandet mining/industry-history candidate | `name`, `desc`, `popupDesc` |

## Skipped candidates

| placeId | Reason skipped |
|---|---|
| `politihuset_gronland` | added in earlier content-i18n batch |
| `blitzhuset` | added in earlier content-i18n batch |
| `rakkestad_prestegard_1814` | added in earlier content-i18n batch |
| `brekke_sluser_haldenkanalen` | added in earlier content-i18n batch |
| `schous_plass` | stale translation-only id |

## Translation summary

| Language | File | Entries before | Entries after | Added entries |
|---|---|---:|---:|---:|
| English | `data/i18n/content/places/en.json` | 548 canonical / 554 total | 568 canonical / 574 total | 20 |
| Spanish | `data/i18n/content/places/es.json` | 548 canonical / 554 total | 568 canonical / 574 total | 20 |
| Portuguese | `data/i18n/content/places/pt.json` | 548 canonical / 554 total | 568 canonical / 574 total | 20 |

Actual repo counts match the expected batch-9 baseline plus 20 new manifest-backed entries.

## Added translations

| placeId | en | es | pt | Notes |
|---|---|---|---|---|
| `psykologisk_institutt_uio` | Department of Psychology, UiO | Departamento de Psicología, UiO | Departamento de Psicologia, UiO | Direct visible fields only |
| `stromsfoss_sluser` | Strømsfoss locks | Esclusas de Strømsfoss | Eclusas de Strømsfoss | Direct visible fields only |
| `moss_mollebyen_industri` | Møllebyen / Moss Town and Industrial Museum | Møllebyen / Museo de la Ciudad y la Industria de Moss | Møllebyen / Museu da Cidade e da Indústria de Moss | Direct visible fields only |
| `tomb_herregard` | Tomb Manor | Mansión de Tomb | Solar de Tomb | Direct visible fields only |
| `tune_kirke_kirkested` | Tune Church / church site | Iglesia de Tune / lugar eclesiástico | Igreja de Tune / lugar eclesiástico | Direct visible fields only |
| `idd_kirke` | Idd Church | Iglesia de Idd | Igreja de Idd | Direct visible fields only |
| `hobol_kirke` | Hobøl Church | Iglesia de Hobøl | Igreja de Hobøl | Direct visible fields only |
| `rakkestad_kirke` | Rakkestad Church | Iglesia de Rakkestad | Igreja de Rakkestad | Direct visible fields only |
| `folkenborg_museum` | Folkenborg Museum | Museo Folkenborg | Museu Folkenborg | Direct visible fields only |
| `elingaard_herregard` | Elingaard Manor | Mansión de Elingaard | Solar de Elingaard | Direct visible fields only |
| `nes_lensemuseum` | Nes Boom Museum | Museo de barreras madereras de Nes | Museu das barreiras de madeira de Nes | Direct visible fields only |
| `homlungen_fyr` | Homlungen Lighthouse | Faro de Homlungen | Farol de Homlungen | Direct visible fields only |
| `spydeberg_kirke` | Spydeberg Church | Iglesia de Spydeberg | Igreja de Spydeberg | Direct visible fields only |
| `trogstad_kirke` | Trøgstad Church | Iglesia de Trøgstad | Igreja de Trøgstad | Direct visible fields only |
| `skiptvet_kirke` | Skiptvet Church | Iglesia de Skiptvet | Igreja de Skiptvet | Direct visible fields only |
| `momarken_markedsplass` | Momarken marketplace | Mercado de Momarken | Mercado de Momarken | Direct visible fields only |
| `akershus_festning` | Akershus Fortress | Fortaleza de Akershus | Fortaleza de Akershus | Direct visible fields only |
| `veien_kulturminnepark` | Veien Cultural Heritage Park | Parque de Patrimonio Cultural de Veien | Parque de Património Cultural de Veien | Direct visible fields only |
| `norderhov_prestegard_1716` | Norderhov Old Parsonage | Antigua rectoría de Norderhov | Antiga reitoria de Norderhov | Direct visible fields only |
| `kongsberg_solvverk` | Kongsberg Silver Works | Minas de Plata de Kongsberg | Minas de Prata de Kongsberg | Direct visible fields only |

## Fields translated

| placeId | name | desc | popupDesc | Other fields |
|---|---:|---:|---:|---|
| `psykologisk_institutt_uio` | yes | yes | yes | none |
| `stromsfoss_sluser` | yes | yes | yes | none |
| `moss_mollebyen_industri` | yes | yes | yes | none |
| `tomb_herregard` | yes | yes | yes | none |
| `tune_kirke_kirkested` | yes | yes | yes | none |
| `idd_kirke` | yes | yes | yes | none |
| `hobol_kirke` | yes | yes | yes | none |
| `rakkestad_kirke` | yes | yes | yes | none |
| `folkenborg_museum` | yes | yes | yes | none |
| `elingaard_herregard` | yes | yes | yes | none |
| `nes_lensemuseum` | yes | yes | yes | none |
| `homlungen_fyr` | yes | yes | yes | none |
| `spydeberg_kirke` | yes | yes | yes | none |
| `trogstad_kirke` | yes | yes | yes | none |
| `skiptvet_kirke` | yes | yes | yes | none |
| `momarken_markedsplass` | yes | yes | yes | none |
| `akershus_festning` | yes | yes | yes | none |
| `veien_kulturminnepark` | yes | yes | yes | none |
| `norderhov_prestegard_1716` | yes | yes | yes | none |
| `kongsberg_solvverk` | yes | yes | yes | none |

## Quality checks

- JSON parse result: `place content json ok`.
- Selected ids present in all three files: `selected place translations ok`.
- No empty values among new entries.
- No missing selected ids.
- No runtime files changed.
- No UI dictionaries changed.
- No canonical place data changed.
- No places_index regeneration.
- Batch 7, batch 8 and batch 9 reports unchanged.

## Known non-goals

- No stale id cleanup.
- No nested `for_na`, `works`, `tasks_profile`, `leksikon`.
- No quiz/people/story/Civication translations.
- No `places_index.json` regeneration.

## Recommended next batch

`Content i18n batch 11 — translate next visible manifest-backed places to en/es/pt`

## Validation

Commands run:

- `node -e "for (const f of ['data/i18n/content/places/en.json','data/i18n/content/places/es.json','data/i18n/content/places/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('place content json ok')"`
- selected-id presence and empty-value Node check for the 20 batch 10 ids
- `git diff -- data/i18n/ui`
- `git diff -- js`
- `git diff -- data/places`
- `git diff -- data/places/places_index.json`
- `git diff -- reports/content-i18n-places-batch-7.md`
- `git diff -- reports/content-i18n-places-batch-8.md`
- `git diff -- reports/content-i18n-places-batch-9.md`
- `git diff --check`

## Final note

No runtime files changed. No UI dictionaries changed. No canonical place data changed. No places_index regeneration. Batch 7, batch 8 and batch 9 reports unchanged.
