# Content i18n places batch 18

## Status
- Data-only translation batch.
- 20 new manifest-backed placeIds translated to en/es/pt.
- Builds on batch 17 / PR #2043.
- Builds after batch 17 PT cleanup / PR #2124.
- Disabled placeIds excluded.
- Batch 4–17 placeIds excluded.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
Changed files:
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-18.md`

## Selection method
- Selected only placeIds found in canonical source files listed by `data/places/manifest.json`.
- Compared candidates against all three translation dictionaries and selected IDs missing full en/es/pt coverage.
- Excluded batch 4–17 IDs from existing batch reports.
- Excluded all 40 batch 16 IDs.
- Excluded all 20 batch 17 IDs from PR #2043.
- Excluded disabled placeIds from `data/places/place_exclusions.json`.
- Selected only from current `main` files present in this checkout.
- Did not use open or unmerged PR content.
- Did not select stale translation-only IDs.
- Prioritized Innlandet / Østlandet manifest-backed places with `name`, `desc`, and `popupDesc`.

## Source placeIds
| placeId | Canonical source file | Selection reason | Fields translated |
|---|---|---|---|
| `aurdal_kirke` | `places/historie/innlandet/places_historie_innlandet_batch13.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `nes_kirke_ringsaker` | `places/historie/innlandet/places_historie_innlandet_batch13.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `lillehammer_kirke` | `places/historie/innlandet/places_historie_innlandet_batch13.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `ullinsvin_vagaa_prestegard` | `places/historie/innlandet/places_historie_innlandet_batch13.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `bjorge_gard_ringebu` | `places/historie/innlandet/places_historie_innlandet_batch13.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `espedalen_nikkelverk` | `places/naeringsliv/innlandet/espedalen_nikkelverk.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `fagernes_stasjon_valdresbanen` | `places/by/innlandet/fagernes_stasjon_valdresbanen.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `lillehammer_stasjon` | `places/by/innlandet/lillehammer_stasjon.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `rena_leir` | `places/historie/innlandet/places_historie_innlandet_batch14.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `sanderud_sykehus_historisk_omrade` | `places/historie/innlandet/places_historie_innlandet_batch14.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `romedal_kirke` | `places/historie/innlandet/places_historie_innlandet_batch14.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `snertingdal_kirke` | `places/historie/innlandet/places_historie_innlandet_batch14.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `dombas_stasjon_jernbaneknutepunkt` | `places/by/innlandet/dombas_stasjon_jernbaneknutepunkt.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `biri_glassverk_historisk_sted` | `places/naeringsliv/innlandet/biri_glassverk_historisk_sted.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `otta_stasjon_gudbrandsdalen` | `places/by/innlandet/otta_stasjon_gudbrandsdalen.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `kongsvinger_stasjon_grensebanen` | `places/by/innlandet/kongsvinger_stasjon_grensebanen.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `kvam_krigsminne_1940` | `places/historie/innlandet/places_historie_innlandet_batch15.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `asnes_kirke` | `places/historie/innlandet/places_historie_innlandet_batch15.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `hof_kirke_asnes` | `places/historie/innlandet/places_historie_innlandet_batch15.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |
| `tolga_kirke` | `places/historie/innlandet/places_historie_innlandet_batch15.json` | Innlandet / Østlandet manifest-backed candidate missing full en/es/pt coverage and not in batches 4–17. | name, desc, popupDesc |

## Skipped candidates
| placeId | Reason skipped |
|---|---|
| Batch 4–17 reported IDs | Excluded by prior content-i18n batch reports. |
| Disabled IDs in `place_exclusions.json` | Excluded by disabled-place gate. |
| Already translated IDs | Excluded because full en/es/pt entries already exist. |

## Translation summary
| Language | File | Entries before | Entries after | Added |
|---|---|---:|---:|---:|
| en | `data/i18n/content/places/en.json` | 734 | 754 | 20 |
| es | `data/i18n/content/places/es.json` | 734 | 754 | 20 |
| pt | `data/i18n/content/places/pt.json` | 734 | 754 | 20 |

## Added translations
| placeId | English name | Spanish name | Portuguese name | Notes |
|---|---|---|---|---|
| `aurdal_kirke` | Aurdal church | Iglesia de Aurdal | Igreja de Aurdal | Source-based direct visible fields only. |
| `nes_kirke_ringsaker` | Nes church Ringsaker | Iglesia de Nes, Ringsaker | Igreja de Nes, Ringsaker | Source-based direct visible fields only. |
| `lillehammer_kirke` | Lillehammer church | Iglesia de Lillehammer | Igreja de Lillehammer | Source-based direct visible fields only. |
| `ullinsvin_vagaa_prestegard` | Ullinsvin / Vågå parsonage | Ullinsvin / rectoría de Vågå | Ullinsvin / casa paroquial de Vågå | Source-based direct visible fields only. |
| `bjorge_gard_ringebu` | Bjørge farm Ringebu | Granja Bjørge, Ringebu | Quinta Bjørge, Ringebu | Source-based direct visible fields only. |
| `espedalen_nikkelverk` | Espedalen nickel works | Niquelera de Espedalen | Fábrica de níquel de Espedalen | Source-based direct visible fields only. |
| `fagernes_stasjon_valdresbanen` | Fagernes station / Valdres Line | Estación de Fagernes / línea de Valdres | Estação de Fagernes / Linha de Valdres | Source-based direct visible fields only. |
| `lillehammer_stasjon` | Lillehammer station | Estación de Lillehammer | Estação de Lillehammer | Source-based direct visible fields only. |
| `rena_leir` | Rena camp | Campamento de Rena | Campo militar de Rena | Source-based direct visible fields only. |
| `sanderud_sykehus_historisk_omrade` | Sanderud hospital / historic area | Hospital de Sanderud / área histórica | Hospital de Sanderud / área histórica | Source-based direct visible fields only. |
| `romedal_kirke` | Romedal church | Iglesia de Romedal | Igreja de Romedal | Source-based direct visible fields only. |
| `snertingdal_kirke` | Snertingdal church | Iglesia de Snertingdal | Igreja de Snertingdal | Source-based direct visible fields only. |
| `dombas_stasjon_jernbaneknutepunkt` | Dombås station / railway junction | Estación de Dombås / nudo ferroviario | Estação de Dombås / nó ferroviário | Source-based direct visible fields only. |
| `biri_glassverk_historisk_sted` | Biri glassworks / historic site | Cristalería de Biri / sitio histórico | Fábrica de vidro de Biri / local histórico | Source-based direct visible fields only. |
| `otta_stasjon_gudbrandsdalen` | Otta station / Gudbrandsdalen | Estación de Otta / Gudbrandsdalen | Estação de Otta / Gudbrandsdalen | Source-based direct visible fields only. |
| `kongsvinger_stasjon_grensebanen` | Kongsvinger station / border line | Estación de Kongsvinger / línea fronteriza | Estação de Kongsvinger / linha fronteiriça | Source-based direct visible fields only. |
| `kvam_krigsminne_1940` | Kvam / war memorial 1940 | Kvam / memorial de guerra de 1940 | Kvam / memorial de guerra de 1940 | Source-based direct visible fields only. |
| `asnes_kirke` | Åsnes church | Iglesia de Åsnes | Igreja de Åsnes | Source-based direct visible fields only. |
| `hof_kirke_asnes` | Hof church Åsnes | Iglesia de Hof, Åsnes | Igreja de Hof, Åsnes | Source-based direct visible fields only. |
| `tolga_kirke` | Tolga church | Iglesia de Tolga | Igreja de Tolga | Source-based direct visible fields only. |

## Fields translated
| placeId | name | desc | popupDesc | Other fields |
|---|---:|---:|---:|---|
| `aurdal_kirke` | yes | yes | yes | none |
| `nes_kirke_ringsaker` | yes | yes | yes | none |
| `lillehammer_kirke` | yes | yes | yes | none |
| `ullinsvin_vagaa_prestegard` | yes | yes | yes | none |
| `bjorge_gard_ringebu` | yes | yes | yes | none |
| `espedalen_nikkelverk` | yes | yes | yes | none |
| `fagernes_stasjon_valdresbanen` | yes | yes | yes | none |
| `lillehammer_stasjon` | yes | yes | yes | none |
| `rena_leir` | yes | yes | yes | none |
| `sanderud_sykehus_historisk_omrade` | yes | yes | yes | none |
| `romedal_kirke` | yes | yes | yes | none |
| `snertingdal_kirke` | yes | yes | yes | none |
| `dombas_stasjon_jernbaneknutepunkt` | yes | yes | yes | none |
| `biri_glassverk_historisk_sted` | yes | yes | yes | none |
| `otta_stasjon_gudbrandsdalen` | yes | yes | yes | none |
| `kongsvinger_stasjon_grensebanen` | yes | yes | yes | none |
| `kvam_krigsminne_1940` | yes | yes | yes | none |
| `asnes_kirke` | yes | yes | yes | none |
| `hof_kirke_asnes` | yes | yes | yes | none |
| `tolga_kirke` | yes | yes | yes | none |

## Quality checks
- JSON parse passed.
- Exactly 20 IDs selected.
- All selected IDs exist in manifest-backed source.
- Selected IDs present in en/es/pt.
- No empty translated values.
- `_sourceHash` present.
- `_status` correct.
- No disabled IDs selected.
- No batch 4–17 IDs selected.
- No batch 17 IDs reused.
- No generic fallback prose in es/pt.
- Portuguese checked for Spanish leakage.
- No runtime files changed.
- No UI dictionaries changed.
- No canonical place data changed.
- No coordinate/index files changed.
- No places_index regeneration.
- Earlier reports unchanged.
- Batch 17 PT cleanup report unchanged.

## Known non-goals
- no stale translation cleanup
- no nested-content translation
- no quiz translation
- no people translation
- no story translation
- no Civication translation
- no place-data changes
- no coordinate changes
- no index regeneration

## Recommended next batch
`Content i18n batch 19 — translate next visible manifest-backed places to en/es/pt`

## Validation
- `node -e "for (const f of ['data/i18n/content/places/en.json','data/i18n/content/places/es.json','data/i18n/content/places/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('place content json ok')"` — passed.
- Selected-ID validation — passed.
- Batch 17 reuse check — passed.
- Generic fallback check — passed.
- Portuguese leakage check — passed.
- Disabled ID check — passed.
- Forbidden diff checks — passed.
- `git diff --check` — passed.
- `git diff --name-only` — limited to the four allowed files.

## Final note
No runtime files changed. No UI dictionaries changed. No canonical place data changed. No coordinate or index files changed. No places_index regeneration. Earlier batch reports and cleanup reports remain unchanged.
