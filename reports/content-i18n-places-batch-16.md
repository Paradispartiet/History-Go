# Content i18n places batch 16

## Status
- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Builds on PR #2000 / batch 15.
- Builds after PR #2011 / batch 15 Portuguese cleanup.
- Disabled placeIds from place_exclusions excluded.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
Changed files:
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-16.md`

## Selection method
- Read canonical ids from manifest-listed source files in `data/places/manifest.json`.
- Compared manifest-backed canonical ids against `data/i18n/content/places/en.json`, `data/i18n/content/places/es.json`, and `data/i18n/content/places/pt.json`.
- Excluded batch 4–15 ids from the existing content-i18n batch reports.
- Excluded disabled placeIds from `data/places/place_exclusions.json`.
- Did not use closed duplicate PR #1988 as source.
- Read PR #2011 cleanup context as quality context only, not as a new batch.
- Excluded already translated ids, stale translation-only ids, and ids not backed by manifest-listed canonical source files.
- Prioritized remaining Innlandet/Østlandet historical places with direct visible `name`, `desc`, and `popupDesc` fields.

## Source placeIds
| placeId | Canonical source file | Selection reason | Fields translated |
|---|---|---|---|
| moelv_stasjon_mjoslinjen | `places/historie/innlandet/places_historie_innlandet_batch16.json` | Manifest-backed Innlandet railway place missing in en/es/pt. | name, desc, popupDesc |
| stange_stasjon_dovrebanen | `places/historie/innlandet/places_historie_innlandet_batch16.json` | Manifest-backed Innlandet railway place missing in en/es/pt. | name, desc, popupDesc |
| gran_stasjon_gjovikbanen | `places/historie/innlandet/places_historie_innlandet_batch16.json` | Manifest-backed Hadeland railway place missing in en/es/pt. | name, desc, popupDesc |
| lena_stasjon_totenbanen | `places/historie/innlandet/places_historie_innlandet_batch16.json` | Manifest-backed Toten railway place missing in en/es/pt. | name, desc, popupDesc |
| reinsvoll_stasjon_totenbanen | `places/historie/innlandet/places_historie_innlandet_batch16.json` | Manifest-backed Toten railway place missing in en/es/pt. | name, desc, popupDesc |
| dokka_stasjon_valdresbanen | `places/historie/innlandet/places_historie_innlandet_batch16.json` | Manifest-backed Land/Valdresbanen place missing in en/es/pt. | name, desc, popupDesc |
| skarnes_stasjon_kongsvingerbanen | `places/historie/innlandet/places_historie_innlandet_batch16.json` | Manifest-backed Odalen/Kongsvingerbanen place missing in en/es/pt. | name, desc, popupDesc |
| braskereidfoss_kraftverk | `places/historie/innlandet/places_historie_innlandet_batch16.json` | Manifest-backed Solør/Glomma energy-history place missing in en/es/pt. | name, desc, popupDesc |
| slidredomen_vestre_slidre | `places/historie/innlandet/places_historie_innlandet_batch17.json` | Manifest-backed Valdres medieval church place missing in en/es/pt. | name, desc, popupDesc |
| bruflat_kirke_etnedal | `places/historie/innlandet/places_historie_innlandet_batch17.json` | Manifest-backed Valdres church place missing in en/es/pt. | name, desc, popupDesc |
| skreia_stasjon_totenbanen | `places/historie/innlandet/places_historie_innlandet_batch17.json` | Manifest-backed Toten railway place missing in en/es/pt. | name, desc, popupDesc |
| flisa_stasjon_solorbanen | `places/historie/innlandet/places_historie_innlandet_batch17.json` | Manifest-backed Solør railway place missing in en/es/pt. | name, desc, popupDesc |
| vinger_kirke_kongsvinger | `places/historie/innlandet/places_historie_innlandet_batch17.json` | Manifest-backed Kongsvinger church place missing in en/es/pt. | name, desc, popupDesc |
| grue_finnskog_kirke | `places/historie/innlandet/places_historie_innlandet_batch17.json` | Manifest-backed Finnskogen church place missing in en/es/pt. | name, desc, popupDesc |
| furnes_kirke_ringsaker | `places/historie/innlandet/places_historie_innlandet_batch17.json` | Manifest-backed Ringsaker church place missing in en/es/pt. | name, desc, popupDesc |
| alvdal_kirke | `places/historie/innlandet/places_historie_innlandet_batch17.json` | Manifest-backed Nord-Østerdalen church place missing in en/es/pt. | name, desc, popupDesc |
| bjorgan_prestegard_kvikne | `places/historie/innlandet/places_historie_innlandet_batch18.json` | Manifest-backed Kvikne cultural-history place missing in en/es/pt. | name, desc, popupDesc |
| kvikne_kirke | `places/historie/innlandet/places_historie_innlandet_batch18.json` | Manifest-backed Kvikne church place missing in en/es/pt. | name, desc, popupDesc |
| oyer_kirke | `places/historie/innlandet/places_historie_innlandet_batch18.json` | Manifest-backed Gudbrandsdalen church place missing in en/es/pt. | name, desc, popupDesc |
| tretten_kirke | `places/historie/innlandet/places_historie_innlandet_batch18.json` | Manifest-backed Gudbrandsdalen church place missing in en/es/pt. | name, desc, popupDesc |

## Skipped candidates
| placeId | Reason skipped |
|---|---|
| hedalen_stavkirke | Batch 15 id; explicitly excluded. |
| vaga_kyrkje | Batch 15 id; explicitly excluded. |
| garmo_stavkirke_maihaugen | Batch 15 id; explicitly excluded. |
| sygard_grytting_pilegrimsgard | Batch 15 id; explicitly excluded. |

## Translation summary
| Language | File | Entries before | Entries after | Added entries |
|---|---|---:|---:|---:|
| en | `data/i18n/content/places/en.json` | 674 | 694 | 20 |
| es | `data/i18n/content/places/es.json` | 674 | 694 | 20 |
| pt | `data/i18n/content/places/pt.json` | 674 | 694 | 20 |

## Added translations
| placeId | en | es | pt | Notes |
|---|---|---|---|---|
| moelv_stasjon_mjoslinjen | Moelv Station / the Mjøsa Line | Estación de Moelv / línea de Mjøsa | Estação de Moelv / linha de Mjøsa | Railway/transport history. |
| stange_stasjon_dovrebanen | Stange Station / Dovre Line | Estación de Stange / línea de Dovre | Estação de Stange / linha de Dovre | Railway/transport history. |
| gran_stasjon_gjovikbanen | Gran Station / Gjøvik Line | Estación de Gran / línea de Gjøvik | Estação de Gran / linha de Gjøvik | Hadeland transport layer. |
| lena_stasjon_totenbanen | Lena Station / Toten Line | Estación de Lena / línea de Toten | Estação de Lena / linha de Toten | Toten logistics. |
| reinsvoll_stasjon_totenbanen | Reinsvoll Station / Toten Line | Estación de Reinsvoll / línea de Toten | Estação de Reinsvoll / linha de Toten | Toten/Raufoss transport. |
| dokka_stasjon_valdresbanen | Dokka Station / Valdres Line | Estación de Dokka / línea de Valdres | Estação de Dokka / linha de Valdres | Land/Valdresbanen. |
| skarnes_stasjon_kongsvingerbanen | Skarnes Station / Kongsvinger Line | Estación de Skarnes / línea de Kongsvinger | Estação de Skarnes / linha de Kongsvinger | Odalen transport. |
| braskereidfoss_kraftverk | Braskereidfoss Power Station | Central eléctrica de Braskereidfoss | Central hidroelétrica de Braskereidfoss | Energy history. |
| slidredomen_vestre_slidre | Slidre Cathedral / Vestre Slidre Church | Slidredomen / iglesia de Vestre Slidre | Slidredomen / igreja de Vestre Slidre | Medieval stone church. |
| bruflat_kirke_etnedal | Bruflat Church | Iglesia de Bruflat | Igreja de Bruflat | Local church site. |
| skreia_stasjon_totenbanen | Skreia Station / Toten Line | Estación de Skreia / línea de Toten | Estação de Skreia / linha de Toten | Toten terminus. |
| flisa_stasjon_solorbanen | Flisa Station / Solør Line | Estación de Flisa / línea de Solør | Estação de Flisa / linha de Solør | Solør railway. |
| vinger_kirke_kongsvinger | Vinger Church | Iglesia de Vinger | Igreja de Vinger | Border-town church layer. |
| grue_finnskog_kirke | Grue Finnskog Church | Iglesia de Grue Finnskog | Igreja de Grue Finnskog | Finnskogen local institution. |
| furnes_kirke_ringsaker | Furnes Church | Iglesia de Furnes | Igreja de Furnes | Hedmarken church site. |
| alvdal_kirke | Alvdal Church | Iglesia de Alvdal | Igreja de Alvdal | Mountain-village church site. |
| bjorgan_prestegard_kvikne | Bjørgan Parsonage, Kvikne | Casa parroquial de Bjørgan, Kvikne | Casa paroquial de Bjørgan, Kvikne | Cultural-history parsonage. |
| kvikne_kirke | Kvikne Church | Iglesia de Kvikne | Igreja de Kvikne | Kvikne church/mining context. |
| oyer_kirke | Øyer Church | Iglesia de Øyer | Igreja de Øyer | Gudbrandsdalen church site. |
| tretten_kirke | Tretten Church | Iglesia de Tretten | Igreja de Tretten | Gudbrandsdalen church site. |

## Fields translated
| placeId | name | desc | popupDesc | Other fields |
|---|---:|---:|---:|---|
| moelv_stasjon_mjoslinjen | yes | yes | yes | none |
| stange_stasjon_dovrebanen | yes | yes | yes | none |
| gran_stasjon_gjovikbanen | yes | yes | yes | none |
| lena_stasjon_totenbanen | yes | yes | yes | none |
| reinsvoll_stasjon_totenbanen | yes | yes | yes | none |
| dokka_stasjon_valdresbanen | yes | yes | yes | none |
| skarnes_stasjon_kongsvingerbanen | yes | yes | yes | none |
| braskereidfoss_kraftverk | yes | yes | yes | none |
| slidredomen_vestre_slidre | yes | yes | yes | none |
| bruflat_kirke_etnedal | yes | yes | yes | none |
| skreia_stasjon_totenbanen | yes | yes | yes | none |
| flisa_stasjon_solorbanen | yes | yes | yes | none |
| vinger_kirke_kongsvinger | yes | yes | yes | none |
| grue_finnskog_kirke | yes | yes | yes | none |
| furnes_kirke_ringsaker | yes | yes | yes | none |
| alvdal_kirke | yes | yes | yes | none |
| bjorgan_prestegard_kvikne | yes | yes | yes | none |
| kvikne_kirke | yes | yes | yes | none |
| oyer_kirke | yes | yes | yes | none |
| tretten_kirke | yes | yes | yes | none |

## Quality checks
- JSON parse result: passed.
- Selected ids present in all three files: passed.
- No empty values among new entries: passed.
- No missing selected ids: passed.
- No disabled/excluded placeIds selected: passed.
- No batch 4–15 ids selected: passed.
- No batch 15 ids reused: passed.
- PT entries checked for Spanish prose leakage: passed.
- No runtime files changed: passed.
- No UI dictionaries changed: passed.
- No canonical place data changed: passed.
- No places_index regeneration: passed.
- Batch 7–15 reports unchanged: passed.
- Batch 15 PT cleanup report unchanged: passed.

## Known non-goals
- no stale id cleanup
- no nested `for_na`, `works`, `tasks_profile`, `leksikon`
- no quiz/people/story/Civication translations
- no `places_index.json` regeneration
- no coordinate/index/parity/intake changes
- no changes to `data/places/place_exclusions.json`
- no reuse of closed duplicate PR #1988 content

## Recommended next batch
`Content i18n batch 17 — translate next visible manifest-backed places to en/es/pt`

## Validation
- `node -e "for (const f of ['data/i18n/content/places/en.json','data/i18n/content/places/es.json','data/i18n/content/places/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('place content json ok')"`
- `node - <<'NODE' ... selected place translations ok ... NODE`
- `node - <<'NODE' ... no disabled selected ids ... NODE`
- `node - <<'NODE' ... no batch 15 ids reused ... NODE`
- `node - <<'NODE' ... pt language leakage check ok ... NODE`
- `git diff -- data/i18n/ui`
- `git diff -- js`
- `git diff -- data/places`
- `git diff -- data/places/places_index.json`
- `git diff -- data/places/place_exclusions.json`
- `git diff -- data/places/coordinate_overrides.json`
- `git diff -- reports/content-i18n-places-batch-7.md`
- `git diff -- reports/content-i18n-places-batch-8.md`
- `git diff -- reports/content-i18n-places-batch-9.md`
- `git diff -- reports/content-i18n-places-batch-10.md`
- `git diff -- reports/content-i18n-places-batch-11.md`
- `git diff -- reports/content-i18n-places-batch-12.md`
- `git diff -- reports/content-i18n-places-batch-13.md`
- `git diff -- reports/content-i18n-places-batch-14.md`
- `git diff -- reports/content-i18n-places-batch-15.md`
- `git diff -- reports/content-i18n-places-batch-15-pt-cleanup.md`
- `git diff --check`
- `git diff --name-only`

## Final note
No runtime files changed. No UI dictionaries changed. No canonical place data changed. No places_index regeneration. Batch 7, batch 8, batch 9, batch 10, batch 11, batch 12, batch 13, batch 14 and batch 15 reports unchanged. Batch 15 PT cleanup report unchanged. Disabled placeIds were excluded.
