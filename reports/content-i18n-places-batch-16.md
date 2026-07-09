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
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-16.md`

## Selection method
- Read canonical ids from manifest-listed source files in `data/places/manifest.json`.
- Compared those ids against `data/i18n/content/places/en.json`, `es.json`, and `pt.json`.
- Excluded batch 4–15 ids by reading the existing batch reports.
- Excluded disabled placeIds from `data/places/place_exclusions.json`.
- Did not use closed duplicate PR #1988 as source.
- Read PR #2011 cleanup as quality context only, not as a new batch.
- Excluded already translated, stale translation-only, and non-manifest ids.

## Source placeIds
| placeId | Canonical source file | Selection reason | Fields translated |
|---|---|---|---|
| `skjaak_bygdamuseum` | `data/places/historie/innlandet/places_historie_innlandet_batch7.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `stenberg_toten_museum` | `data/places/historie/innlandet/places_historie_innlandet_batch7.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `jorstadmoen_leir` | `data/places/historie/innlandet/places_historie_innlandet_batch8.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `nordberg_fort` | `data/places/historie/innlandet/places_historie_innlandet_batch8.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `gausdal_bygdetun` | `data/places/historie/innlandet/places_historie_innlandet_batch8.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `trysil_bygdetun` | `data/places/historie/innlandet/places_historie_innlandet_batch8.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `solor_museum_flisa` | `data/places/historie/innlandet/places_historie_innlandet_batch8.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `grue_kirke_brannminne` | `data/places/historie/innlandet/places_historie_innlandet_batch8.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `lom_bygdamuseum_presthaugen` | `data/places/historie/innlandet/places_historie_innlandet_batch8.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `blokkodden_villmarksmuseum` | `data/places/historie/innlandet/places_historie_innlandet_batch9.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `husantunet_alvdal_bygdemuseum` | `data/places/historie/innlandet/places_historie_innlandet_batch9.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `koppangtunet_stor_elvdal` | `data/places/historie/innlandet/places_historie_innlandet_batch9.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `tylldalen_bygdetun` | `data/places/historie/innlandet/places_historie_innlandet_batch9.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `faaberg_kirke` | `data/places/historie/innlandet/places_historie_innlandet_batch9.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `vang_kirke_hamar` | `data/places/historie/innlandet/places_historie_innlandet_batch9.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `mesna_kraft_og_industri` | `data/places/naeringsliv/innlandet/mesna_kraft_og_industri.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `lillehammer_bryggeri_historisk_miljo` | `data/places/naeringsliv/innlandet/lillehammer_bryggeri_historisk_miljo.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `kistefos_tresliperi_jevnaker` | `data/places/historie/innlandet/places_historie_innlandet_batch10.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `kapp_melkefabrikk` | `data/places/historie/innlandet/places_historie_innlandet_batch10.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |
| `loiten_braenderi` | `data/places/historie/innlandet/places_historie_innlandet_batch10.json` | Manifest-backed Innlandet place missing in all three content languages and not in batch 4–15. | name, desc, popupDesc |

## Skipped candidates
| placeId | Reason skipped |
|---|---|
| Batch 4–15 ids | Excluded by prior batch reports. |
| Disabled ids in `place_exclusions.json` | Excluded from selection. |

## Translation summary
| Language | File | Entries before | Entries after | Added entries |
|---|---|---:|---:|---:|
| en | `data/i18n/content/places/en.json` | 694 | 714 | 20 |
| es | `data/i18n/content/places/es.json` | 694 | 714 | 20 |
| pt | `data/i18n/content/places/pt.json` | 694 | 714 | 20 |

## Added translations
| placeId | en | es | pt | Notes |
|---|---|---|---|---|
| `skjaak_bygdamuseum` | Skjåk Rural Museum | Museo rural de Skjåk | Museu rural de Skjåk | Direct visible fields only. |
| `stenberg_toten_museum` | Stenberg / Toten Museum | Stenberg / Museo de Toten | Stenberg / Museu de Toten | Direct visible fields only. |
| `jorstadmoen_leir` | Jørstadmoen Camp | Campamento de Jørstadmoen | Campo de Jørstadmoen | Direct visible fields only. |
| `nordberg_fort` | Nordberg Fort | Fuerte de Nordberg | Forte de Nordberg | Direct visible fields only. |
| `gausdal_bygdetun` | Gausdal Rural Museum | Museo rural de Gausdal | Museu rural de Gausdal | Direct visible fields only. |
| `trysil_bygdetun` | Trysil Rural Museum | Museo rural de Trysil | Museu rural de Trysil | Direct visible fields only. |
| `solor_museum_flisa` | Solør Museum / Flisa | Museo de Solør / Flisa | Museu de Solør / Flisa | Direct visible fields only. |
| `grue_kirke_brannminne` | Grue Church / fire memorial | Iglesia de Grue / memoria del incendio | Igreja de Grue / memória do incêndio | Direct visible fields only. |
| `lom_bygdamuseum_presthaugen` | Lom Rural Museum / Presthaugen | Museo rural de Lom / Presthaugen | Museu rural de Lom / Presthaugen | Direct visible fields only. |
| `blokkodden_villmarksmuseum` | Blokkodden Wilderness Museum | Museo de la vida silvestre de Blokkodden | Museu da vida selvagem de Blokkodden | Direct visible fields only. |
| `husantunet_alvdal_bygdemuseum` | Husantunet / Alvdal Rural Museum | Husantunet / Museo rural de Alvdal | Husantunet / Museu rural de Alvdal | Direct visible fields only. |
| `koppangtunet_stor_elvdal` | Koppangtunet / Stor-Elvdal Museum | Koppangtunet / Museo de Stor-Elvdal | Koppangtunet / Museu de Stor-Elvdal | Direct visible fields only. |
| `tylldalen_bygdetun` | Tylldalen Rural Museum | Museo rural de Tylldalen | Museu rural de Tylldalen | Direct visible fields only. |
| `faaberg_kirke` | Fåberg Church | Iglesia de Fåberg | Igreja de Fåberg | Direct visible fields only. |
| `vang_kirke_hamar` | Vang Church, Hamar | Iglesia de Vang, Hamar | Igreja de Vang, Hamar | Direct visible fields only. |
| `mesna_kraft_og_industri` | Mesna power and industrial landscape | Paisaje energético e industrial de Mesna | Paisagem energética e industrial de Mesna | Direct visible fields only. |
| `lillehammer_bryggeri_historisk_miljo` | Lillehammer Brewery / historic industrial environment | Cervecería de Lillehammer / entorno industrial histórico | Cervejaria de Lillehammer / ambiente industrial histórico | Direct visible fields only. |
| `kistefos_tresliperi_jevnaker` | Kistefos Wood Pulp Mill / industrial museum | Fábrica de pasta de madera de Kistefos / museo industrial | Fábrica de pasta de madeira de Kistefos / museu industrial | Direct visible fields only. |
| `kapp_melkefabrikk` | Kapp Milk Factory | Fábrica de leche de Kapp | Fábrica de leite de Kapp | Direct visible fields only. |
| `loiten_braenderi` | Løiten Distillery | Destilería de Løiten | Destilaria de Løiten | Direct visible fields only. |

## Fields translated
| placeId | name | desc | popupDesc | Other fields |
|---|---:|---:|---:|---|
| `skjaak_bygdamuseum` | yes | yes | yes | none |
| `stenberg_toten_museum` | yes | yes | yes | none |
| `jorstadmoen_leir` | yes | yes | yes | none |
| `nordberg_fort` | yes | yes | yes | none |
| `gausdal_bygdetun` | yes | yes | yes | none |
| `trysil_bygdetun` | yes | yes | yes | none |
| `solor_museum_flisa` | yes | yes | yes | none |
| `grue_kirke_brannminne` | yes | yes | yes | none |
| `lom_bygdamuseum_presthaugen` | yes | yes | yes | none |
| `blokkodden_villmarksmuseum` | yes | yes | yes | none |
| `husantunet_alvdal_bygdemuseum` | yes | yes | yes | none |
| `koppangtunet_stor_elvdal` | yes | yes | yes | none |
| `tylldalen_bygdetun` | yes | yes | yes | none |
| `faaberg_kirke` | yes | yes | yes | none |
| `vang_kirke_hamar` | yes | yes | yes | none |
| `mesna_kraft_og_industri` | yes | yes | yes | none |
| `lillehammer_bryggeri_historisk_miljo` | yes | yes | yes | none |
| `kistefos_tresliperi_jevnaker` | yes | yes | yes | none |
| `kapp_melkefabrikk` | yes | yes | yes | none |
| `loiten_braenderi` | yes | yes | yes | none |

## Quality checks
- JSON parse result: passed.
- Selected ids present in all three files: passed.
- No empty values among new entries: passed.
- No missing selected ids: passed.
- No disabled/excluded placeIds selected: passed.
- No batch 4–15 ids selected: passed.
- No batch 15 ids reused: passed.
- pt entries checked for Spanish prose leakage: passed.
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
- selected place translation presence/status check
- disabled selected ids check
- batch 15 reuse check
- Portuguese leakage check
- forbidden diff checks for runtime, UI dictionaries, canonical place data, places_index, coordinate overrides and prior reports
- `git diff --check`

## Final note
No runtime files changed. No UI dictionaries changed. No canonical place data changed. No places_index regeneration. Batch 7, batch 8, batch 9, batch 10, batch 11, batch 12, batch 13, batch 14 and batch 15 reports unchanged. Batch 15 PT cleanup report unchanged. Disabled placeIds were excluded.
