# Content i18n places batch 13

## Status
- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Builds on PR #1962 / batch 12.
- Disabled placeIds from `data/places/place_exclusions.json` excluded.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-13.md`

## Selection method
The selected ids were read from canonical source files listed in `data/places/manifest.json`, then compared against the current en/es/pt place translation files. Batch 4–12 report ids were excluded, including every batch 12 id from PR #1962. Disabled ids collected from `data/places/place_exclusions.json` were also excluded. The batch prioritized remaining visible Buskerud and Innlandet / Østlandet historical places with direct `name`, `desc`, and `popupDesc` fields. Already translated ids, stale translation-only ids, disabled ids, non-manifest ids, generated-index-only ids, and batch 4–12 ids were excluded.

## Source placeIds
| placeId | Canonical source file | Selection reason | Fields translated |
|---|---|---|---|
| `nore_i_kraftverk` | `places/historie/buskerud/places_historie_buskerud_batch6.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `sundvollen_hotell_skysskifte` | `places/historie/buskerud/places_historie_buskerud_batch6.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `union_papirfabrikk_drammen` | `places/historie/buskerud/places_historie_buskerud_batch6.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `solberg_spinderi` | `places/historie/buskerud/places_historie_buskerud_batch6.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `lier_sykehus_historisk_omrade` | `places/historie/buskerud/places_historie_buskerud_batch6.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `vikersund_stasjon_randsfjordbanen` | `places/historie/buskerud/places_historie_buskerud_batch6.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `domkirkeodden_hamar` | `places/historie/innlandet/places_historie_innlandet_batch1.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `maihaugen_lillehammer` | `places/historie/innlandet/places_historie_innlandet_batch1.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `ringebu_stavkirke` | `places/historie/innlandet/places_historie_innlandet_batch1.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `lom_stavkirke` | `places/historie/innlandet/places_historie_innlandet_batch1.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `kongsvinger_festning` | `places/historie/innlandet/places_historie_innlandet_batch1.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `aulestad_bjornson` | `places/historie/innlandet/places_historie_innlandet_batch1.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `klevfos_cellulose` | `places/historie/innlandet/places_historie_innlandet_batch1.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `atlungstad_brenneri` | `places/historie/innlandet/places_historie_innlandet_batch1.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `norsk_jernbanemuseum_hamar` | `places/historie/innlandet/places_historie_innlandet_batch2.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `skibladner_gjovik` | `places/historie/innlandet/places_historie_innlandet_batch2.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `gjovik_gard` | `places/historie/innlandet/places_historie_innlandet_batch2.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `norsk_skogmuseum_elverum` | `places/historie/innlandet/places_historie_innlandet_batch2.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `glomdalsmuseet_elverum` | `places/historie/innlandet/places_historie_innlandet_batch2.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |
| `bjerkebaek_undset` | `places/historie/innlandet/places_historie_innlandet_batch2.json` | Manifest-backed visible place missing in en/es/pt; prioritized Buskerud/Innlandet. | name, desc, popupDesc |

## Skipped candidates
| placeId | Reason skipped |
|---|---|
| `vulkan_murvegger` | Disabled/excluded in `data/places/place_exclusions.json`; not selected. |
| `hausmannsgate_aksen` | Disabled/excluded in `data/places/place_exclusions.json`; not selected. |
| `kolstadgata_toyen_vegger` | Disabled/excluded in `data/places/place_exclusions.json`; not selected. |
| `gronland_underganger` | Disabled/excluded in `data/places/place_exclusions.json`; not selected. |
| `nybrua_pilarrom` | Disabled/excluded in `data/places/place_exclusions.json`; not selected. |
| `schweigaards_gate_lodalen` | Disabled/excluded in `data/places/place_exclusions.json`; not selected. |
| `kuba_akselpassasjer` | Disabled/excluded in `data/places/place_exclusions.json`; not selected. |
| `grunerlokka_bakgardsvegger` | Disabled/excluded in `data/places/place_exclusions.json`; not selected. |
| `brenneriveien_ingens_gate` | Disabled/excluded in `data/places/place_exclusions.json`; not selected. |

## Translation summary
| Language | File | Entries before | Entries after | Added entries |
|---|---|---:|---:|---:|
| en | `data/i18n/content/places/en.json` | 614 | 634 | 20 |
| es | `data/i18n/content/places/es.json` | 614 | 634 | 20 |
| pt | `data/i18n/content/places/pt.json` | 614 | 634 | 20 |

## Added translations
| placeId | en | es | pt | Notes |
|---|---|---|---|---|
| `nore_i_kraftverk` | Nore I Power Station | Central hidroeléctrica Nore I | Central hidroelétrica Nore I | Direct visible fields only |
| `sundvollen_hotell_skysskifte` | Sundvollen Hotel / coaching station | Hotel Sundvollen / posta de relevo | Hotel Sundvollen / estação de muda de cavalos | Direct visible fields only |
| `union_papirfabrikk_drammen` | Union Paper Mill / Grønland Drammen | Fábrica de papel Union / Grønland Drammen | Fábrica de papel Union / Grønland Drammen | Direct visible fields only |
| `solberg_spinderi` | Solberg Spinning Mill | Hilandería Solberg | Fiação Solberg | Direct visible fields only |
| `lier_sykehus_historisk_omrade` | Lier Hospital / historic area | Hospital de Lier / área histórica | Hospital de Lier / área histórica | Direct visible fields only |
| `vikersund_stasjon_randsfjordbanen` | Vikersund Station / Randsfjord Line | Estación de Vikersund / línea de Randsfjord | Estação de Vikersund / Linha de Randsfjord | Direct visible fields only |
| `domkirkeodden_hamar` | Domkirkeodden / Hamar Cathedral ruins | Domkirkeodden / ruinas de la catedral de Hamar | Domkirkeodden / ruínas da catedral de Hamar | Direct visible fields only |
| `maihaugen_lillehammer` | Maihaugen | Maihaugen | Maihaugen | Direct visible fields only |
| `ringebu_stavkirke` | Ringebu Stave Church | Iglesia de madera de Ringebu | Igreja de madeira de Ringebu | Direct visible fields only |
| `lom_stavkirke` | Lom Stave Church | Iglesia de madera de Lom | Igreja de madeira de Lom | Direct visible fields only |
| `kongsvinger_festning` | Kongsvinger Fortress | Fortaleza de Kongsvinger | Fortaleza de Kongsvinger | Direct visible fields only |
| `aulestad_bjornson` | Aulestad / Bjørnstjerne Bjørnson’s home | Aulestad / casa de Bjørnstjerne Bjørnson | Aulestad / casa de Bjørnstjerne Bjørnson | Direct visible fields only |
| `klevfos_cellulose` | Klevfos Cellulose and Paper Mill | Fábrica de celulosa y papel Klevfos | Fábrica de celulose e papel de Klevfos | Direct visible fields only |
| `atlungstad_brenneri` | Atlungstad Distillery | Destilería Atlungstad | Destilaria Atlungstad | Direct visible fields only |
| `norsk_jernbanemuseum_hamar` | Norwegian Railway Museum Hamar | Museo Noruego del Ferrocarril Hamar | Museu Ferroviário Norueguês Hamar | Direct visible fields only |
| `skibladner_gjovik` | DS Skibladner / Gjøvik quay | DS Skibladner / muelle de Gjøvik | DS Skibladner / cais de Gjøvik | Direct visible fields only |
| `gjovik_gard` | Gjøvik Manor | Casa señorial de Gjøvik | Casa senhorial de Gjøvik | Direct visible fields only |
| `norsk_skogmuseum_elverum` | Norwegian Forest Museum | Museo Noruego del Bosque | Museu Norueguês da Floresta | Direct visible fields only |
| `glomdalsmuseet_elverum` | Glomdal Museum | Museo Glomdal | Museu Glomdal | Direct visible fields only |
| `bjerkebaek_undset` | Bjerkebæk / Sigrid Undset’s home | Bjerkebæk / casa de Sigrid Undset | Bjerkebæk / casa de Sigrid Undset | Direct visible fields only |

## Fields translated
| placeId | name | desc | popupDesc | Other fields |
|---|---:|---:|---:|---|
| `nore_i_kraftverk` | yes | yes | yes | — |
| `sundvollen_hotell_skysskifte` | yes | yes | yes | — |
| `union_papirfabrikk_drammen` | yes | yes | yes | — |
| `solberg_spinderi` | yes | yes | yes | — |
| `lier_sykehus_historisk_omrade` | yes | yes | yes | — |
| `vikersund_stasjon_randsfjordbanen` | yes | yes | yes | — |
| `domkirkeodden_hamar` | yes | yes | yes | — |
| `maihaugen_lillehammer` | yes | yes | yes | — |
| `ringebu_stavkirke` | yes | yes | yes | — |
| `lom_stavkirke` | yes | yes | yes | — |
| `kongsvinger_festning` | yes | yes | yes | — |
| `aulestad_bjornson` | yes | yes | yes | — |
| `klevfos_cellulose` | yes | yes | yes | — |
| `atlungstad_brenneri` | yes | yes | yes | — |
| `norsk_jernbanemuseum_hamar` | yes | yes | yes | — |
| `skibladner_gjovik` | yes | yes | yes | — |
| `gjovik_gard` | yes | yes | yes | — |
| `norsk_skogmuseum_elverum` | yes | yes | yes | — |
| `glomdalsmuseet_elverum` | yes | yes | yes | — |
| `bjerkebaek_undset` | yes | yes | yes | — |

## Quality checks
- JSON parse result: passed.
- Selected ids present in all three files: passed.
- No empty values among new entries: passed.
- No missing selected ids: passed.
- No disabled/excluded placeIds selected: passed.
- No batch 4–12 ids selected: passed.
- No runtime files changed: passed.
- No UI dictionaries changed: passed.
- No canonical place data changed: passed.
- No places_index regeneration: passed.
- Batch 7, batch 8, batch 9, batch 10, batch 11 and batch 12 reports unchanged: passed.

## Known non-goals
- No stale id cleanup.
- No nested `for_na`, `works`, `tasks_profile`, `leksikon`.
- No quiz/people/story/Civication translations.
- No `places_index.json` regeneration.
- No coordinate/index/parity changes.
- No changes to `data/places/place_exclusions.json`.

## Recommended next batch
`Content i18n batch 14 — translate next visible manifest-backed places to en/es/pt`

## Validation
- `node -e "for (const f of ['data/i18n/content/places/en.json','data/i18n/content/places/es.json','data/i18n/content/places/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('place content json ok')"`
- Selected-id presence and empty-value check.
- Disabled selected-id check.
- Batch 12 reuse check.
- `git diff -- data/i18n/ui`
- `git diff -- js`
- `git diff -- data/places`
- `git diff -- data/places/places_index.json`
- `git diff -- data/places/place_exclusions.json`
- `git diff -- data/places/coordinate_overrides.json`
- Batch 7–12 report diff checks.
- `git diff --check`

## Final note
No runtime files changed. No UI dictionaries changed. No canonical place data changed. No places_index regeneration. Batch 7, batch 8, batch 9, batch 10, batch 11 and batch 12 reports unchanged. Disabled placeIds were excluded.
