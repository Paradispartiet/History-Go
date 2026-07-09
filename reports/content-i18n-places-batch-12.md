# Content i18n places batch 12

## Status
Batch 12 builds directly after PR #1920 / content-i18n batch 11 and adds exactly 20 new manifest-backed placeIds to the visible place content dictionaries.

## Scope
Data-only translation batch for `data/i18n/content/places/en.json`, `data/i18n/content/places/es.json`, and `data/i18n/content/places/pt.json`. Disabled placeIds from `data/places/place_exclusions.json` were excluded. No runtime, UI dictionary, canonical place data, index, build output, CSS, schema, quiz, people, story, or Civication files were changed. `places_index.json` was not regenerated.

## Selection method
Read the place manifest, disabled-place exclusions, existing place content dictionaries, batch 4–11 reports, and `js/i18n.js`. Built an exclude set from batch 4–11 reports, built a disabled set from `place_exclusions.json`, and selected the next clean Buskerud/Østlandet manifest-backed places with direct visible `name`, `desc`, and `popupDesc` fields that were missing from all three target language files.

## Source placeIds
| placeId | Canonical source file | Selection reason | Fields translated |
|---|---|---|---|
| eggedal_molle | places/historie/buskerud/places_historie_buskerud_batch3.json | Missing in all three languages; visible Buskerud labour-history place | name, desc, popupDesc |
| drammen_tollbod_havn | places/historie/buskerud/places_historie_buskerud_batch3.json | Missing in all three languages; visible Drammen harbour/history place | name, desc, popupDesc |
| kjerraten_i_asa | places/historie/buskerud/places_historie_buskerud_batch4.json | Missing in all three languages; visible Ringerike timber/engineering place | name, desc, popupDesc |
| hassel_jernverk | places/historie/buskerud/places_historie_buskerud_batch4.json | Missing in all three languages; visible Modum industrial-history place | name, desc, popupDesc |
| bergseminaret_kongsberg | places/historie/buskerud/places_historie_buskerud_batch4.json | Missing in all three languages; visible Kongsberg education/mining place | name, desc, popupDesc |
| laagdalsmuseet | places/historie/buskerud/places_historie_buskerud_batch4.json | Missing in all three languages; visible Kongsberg/Numedal museum place | name, desc, popupDesc |
| fiskum_gamle_kirke | places/historie/buskerud/places_historie_buskerud_batch4.json | Missing in all three languages; visible medieval church place | name, desc, popupDesc |
| hvalsmoen_leir | places/historie/buskerud/places_historie_buskerud_batch4.json | Missing in all three languages; visible military-history place | name, desc, popupDesc |
| dagali_museum | places/historie/buskerud/places_historie_buskerud_batch4.json | Missing in all three languages; visible mountain-village museum place | name, desc, popupDesc |
| gamle_nesbyen | places/historie/buskerud/places_historie_buskerud_batch4.json | Missing in all three languages; visible Hallingdal historic-centre place | name, desc, popupDesc |
| lauvlia_kittelsen | places/historie/buskerud/places_historie_buskerud_batch5.json | Missing in all three languages; visible artist-home place | name, desc, popupDesc |
| hagan_skredsvig | places/historie/buskerud/places_historie_buskerud_batch5.json | Missing in all three languages; visible artist-home place | name, desc, popupDesc |
| gulskogen_gard | places/historie/buskerud/places_historie_buskerud_batch5.json | Missing in all three languages; visible Drammen manor/park place | name, desc, popupDesc |
| aal_bygdamuseum | places/historie/buskerud/places_historie_buskerud_batch5.json | Missing in all three languages; visible Hallingdal rural museum place | name, desc, popupDesc |
| gol_bygdemuseum | places/historie/buskerud/places_historie_buskerud_batch5.json | Missing in all three languages; visible Hallingdal rural museum place | name, desc, popupDesc |
| hemsedal_bygdatun | places/historie/buskerud/places_historie_buskerud_batch5.json | Missing in all three languages; visible mountain-farm museum place | name, desc, popupDesc |
| krokkleiva_kongeveien | places/historie/buskerud/places_historie_buskerud_batch5.json | Missing in all three languages; visible road/cultural-landscape place | name, desc, popupDesc |
| bragernes_kirke | places/historie/buskerud/places_historie_buskerud_batch5.json | Missing in all three languages; visible Drammen church/urban-history place | name, desc, popupDesc |
| riddergarden_honefoss | places/historie/buskerud/places_historie_buskerud_batch6.json | Missing in all three languages; visible Hønefoss town-farm place | name, desc, popupDesc |
| modum_bad_st_olafs_kilde | places/historie/buskerud/places_historie_buskerud_batch6.json | Missing in all three languages; visible Modum health-history place | name, desc, popupDesc |

## Skipped candidates
| placeId | Reason skipped |
|---|---|
| vulkan_murvegger | Disabled by `place_exclusions.json`; excluded from selection |
| hausmannsgate_aksen | Disabled by `place_exclusions.json`; excluded from selection |
| kolstadgata_toyen_vegger | Disabled by `place_exclusions.json`; excluded from selection |
| gronland_underganger | Disabled by `place_exclusions.json`; excluded from selection |
| nybrua_pilarrom | Disabled by `place_exclusions.json`; excluded from selection |
| schweigaards_gate_lodalen | Disabled by `place_exclusions.json`; excluded from selection |
| kuba_akselpassasjer | Disabled by `place_exclusions.json`; excluded from selection |
| grunerlokka_bakgardsvegger | Disabled by `place_exclusions.json`; excluded from selection |
| brenneriveien_ingens_gate | Disabled by `place_exclusions.json`; excluded from selection |

## Translation summary
| Language | File | Entries before | Entries after | Added entries |
|---|---|---:|---:|---:|
| en | data/i18n/content/places/en.json | 594 | 614 | 20 |
| es | data/i18n/content/places/es.json | 594 | 614 | 20 |
| pt | data/i18n/content/places/pt.json | 594 | 614 | 20 |

## Added translations
| placeId | en | es | pt | Notes |
|---|---|---|---|---|
| eggedal_molle | Eggedal Mill | Molino de Eggedal | Moinho de Eggedal | Direct visible fields only |
| drammen_tollbod_havn | Drammen Customs House / Harbour Area | Drammen Customs House / Harbour Area | Drammen Customs House / Harbour Area | Direct visible fields only |
| kjerraten_i_asa | The Kjerrat at Åsa | The Kjerrat at Åsa | The Kjerrat at Åsa | Direct visible fields only |
| hassel_jernverk | Hassel Ironworks | Hassel Ironworks | Hassel Ironworks | Direct visible fields only |
| bergseminaret_kongsberg | The Mining Seminary in Kongsberg | The Mining Seminary in Kongsberg | The Mining Seminary in Kongsberg | Direct visible fields only |
| laagdalsmuseet | Lågdalsmuseet | Lågdalsmuseet | Lågdalsmuseet | Direct visible fields only |
| fiskum_gamle_kirke | Old Fiskum Church | Antigua iglesia de Fiskum | Antiga Igreja de Fiskum | Direct visible fields only |
| hvalsmoen_leir | Hvalsmoen Camp | Hvalsmoen Camp | Hvalsmoen Camp | Direct visible fields only |
| dagali_museum | Dagali Museum | Dagali Museum | Dagali Museum | Direct visible fields only |
| gamle_nesbyen | Old Nesbyen | Old Nesbyen | Old Nesbyen | Direct visible fields only |
| lauvlia_kittelsen | Lauvlia / Theodor Kittelsen’s Artist Home | Lauvlia / Theodor Kittelsen’s Artist Home | Lauvlia / Theodor Kittelsen’s Artist Home | Direct visible fields only |
| hagan_skredsvig | Hagan / Christian Skredsvig’s Artist Home | Hagan / Christian Skredsvig’s Artist Home | Hagan / Christian Skredsvig’s Artist Home | Direct visible fields only |
| gulskogen_gard | Gulskogen Manor | Gulskogen Manor | Gulskogen Manor | Direct visible fields only |
| aal_bygdamuseum | Ål Rural Museum | Ål Rural Museum | Ål Rural Museum | Direct visible fields only |
| gol_bygdemuseum | Gol Rural Museum | Gol Rural Museum | Gol Rural Museum | Direct visible fields only |
| hemsedal_bygdatun | Hemsedal Rural Museum / Øvre Løkji | Hemsedal Rural Museum / Øvre Løkji | Hemsedal Rural Museum / Øvre Løkji | Direct visible fields only |
| krokkleiva_kongeveien | Krokkleiva / The Bergen Royal Road | Krokkleiva / The Bergen Royal Road | Krokkleiva / The Bergen Royal Road | Direct visible fields only |
| bragernes_kirke | Bragernes Church | Iglesia de Bragernes | Igreja de Bragernes | Direct visible fields only |
| riddergarden_honefoss | Riddergården Hønefoss | Riddergården Hønefoss | Riddergården Hønefoss | Direct visible fields only |
| modum_bad_st_olafs_kilde | Modum Bad / St. Olaf’s Spring | Modum Bad / St. Olaf’s Spring | Modum Bad / St. Olaf’s Spring | Direct visible fields only |

## Fields translated
| placeId | name | desc | popupDesc | Other fields |
|---|---:|---:|---:|---|
| eggedal_molle | yes | yes | yes | none |
| drammen_tollbod_havn | yes | yes | yes | none |
| kjerraten_i_asa | yes | yes | yes | none |
| hassel_jernverk | yes | yes | yes | none |
| bergseminaret_kongsberg | yes | yes | yes | none |
| laagdalsmuseet | yes | yes | yes | none |
| fiskum_gamle_kirke | yes | yes | yes | none |
| hvalsmoen_leir | yes | yes | yes | none |
| dagali_museum | yes | yes | yes | none |
| gamle_nesbyen | yes | yes | yes | none |
| lauvlia_kittelsen | yes | yes | yes | none |
| hagan_skredsvig | yes | yes | yes | none |
| gulskogen_gard | yes | yes | yes | none |
| aal_bygdamuseum | yes | yes | yes | none |
| gol_bygdemuseum | yes | yes | yes | none |
| hemsedal_bygdatun | yes | yes | yes | none |
| krokkleiva_kongeveien | yes | yes | yes | none |
| bragernes_kirke | yes | yes | yes | none |
| riddergarden_honefoss | yes | yes | yes | none |
| modum_bad_st_olafs_kilde | yes | yes | yes | none |

## Quality checks
JSON parse validation passed for all three content place dictionaries. Selected-id validation confirmed exactly 20 ids, presence in en/es/pt, non-empty translated direct fields, no disabled ids, and no ids listed in batch 4–11 reports. Batch 7–11 reports are unchanged.

## Known non-goals
No runtime changes. No UI dictionary changes. No canonical place-data changes. No `places_index.json` regeneration. No cleanup of stale or translation-only ids. No nested profile, quiz, story, route, people, brand, nature, training, play, badge, leksikon, task, work, or Civication fields translated.

## Recommended next batch
Continue with the next manifest-backed, non-disabled, non-batch-4–12 visible places that still lack all three content translations, prioritizing clean Norway/Europe candidates before any lower-priority regions.

## Validation
- `node -e "for (const f of ['data/i18n/content/places/en.json','data/i18n/content/places/es.json','data/i18n/content/places/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('place content json ok')"`
- Selected-id check for 20 ids, en/es/pt presence, non-empty direct fields, no disabled ids, no batch 4–11 ids.
- Unwanted-diff checks for UI, JS, canonical places, place index, place exclusions, and batch 7–11 reports.
- `git diff --check`

## Final note
Batch 12 is a pure data-only translation batch after PR #1920 with exactly 20 new ids, disabled placeIds excluded, batch 7–11 reports untouched, no runtime/UI/canonical/index changes, and no regenerated `places_index.json`.
