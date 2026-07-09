# Content i18n places batch 15

## Status
- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Builds on PR #1986 / batch 14.
- Explicitly ignores closed duplicate PR #1988.
- Disabled placeIds from place_exclusions excluded.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
Files changed:
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-15.md`

## Selection method
The 20 ids were selected from canonical ids in `data/places/manifest.json` and manifest-listed source files. Existing `en`, `es` and `pt` content dictionaries were compared, batch 4–14 report ids were excluded, disabled placeIds from `data/places/place_exclusions.json` were excluded, and the closed duplicate PR #1988 was not used as source. Selection prioritized visible Innlandet/Østlandet manifest-backed places with direct `name`, `desc` and `popupDesc` fields. Lisboa/Portugal candidates were not needed. Already translated, stale, non-manifest and generated-index-only ids were excluded.

## Source placeIds
| placeId | Canonical source file | Selection reason | Fields translated |
|---|---|---|---|
| `hedalen_stavkirke` | `places/historie/innlandet/places_historie_innlandet_batch5.json` | Next clean Innlandet/Østlandet stave church missing all three languages | `name`, `desc`, `popupDesc` |
| `vaga_kyrkje` | `places/historie/innlandet/places_historie_innlandet_batch5.json` | Next clean Innlandet church missing all three languages | `name`, `desc`, `popupDesc` |
| `garmo_stavkirke_maihaugen` | `places/historie/innlandet/places_historie_innlandet_batch5.json` | Next clean moved stave-church/museum candidate | `name`, `desc`, `popupDesc` |
| `sygard_grytting_pilegrimsgard` | `places/historie/innlandet/places_historie_innlandet_batch5.json` | Next clean pilgrim-route/farm candidate | `name`, `desc`, `popupDesc` |
| `matrand_slagsted_1814` | `places/historie/innlandet/places_historie_innlandet_batch5.json` | Next clean 1814 border-history candidate | `name`, `desc`, `popupDesc` |
| `magnor_glassverk` | `places/historie/innlandet/places_historie_innlandet_batch5.json` | Next clean industry/design-history candidate | `name`, `desc`, `popupDesc` |
| `finnetunet_skogfinsk_museum` | `places/historie/innlandet/places_historie_innlandet_batch6.json` | Next clean minority/migration museum candidate | `name`, `desc`, `popupDesc` |
| `sor_fron_kirke_gudbrandsdalsdomen` | `places/historie/innlandet/places_historie_innlandet_batch6.json` | Next clean Gudbrandsdalen church candidate | `name`, `desc`, `popupDesc` |
| `lesja_kirke` | `places/historie/innlandet/places_historie_innlandet_batch6.json` | Next clean upper Gudbrandsdalen church candidate | `name`, `desc`, `popupDesc` |
| `valdres_folkemuseum_fagernes` | `places/historie/innlandet/places_historie_innlandet_batch6.json` | Next clean regional museum candidate | `name`, `desc`, `popupDesc` |
| `odalstunet_sor_odal` | `places/historie/innlandet/places_historie_innlandet_batch6.json` | Next clean local-history museum candidate | `name`, `desc`, `popupDesc` |
| `tynset_bygdemuseum` | `places/historie/innlandet/places_historie_innlandet_batch6.json` | Next clean Nord-Østerdalen museum candidate | `name`, `desc`, `popupDesc` |
| `eidskog_museum_almenninga` | `places/historie/innlandet/places_historie_innlandet_batch6.json` | Next clean border/local-history museum candidate | `name`, `desc`, `popupDesc` |
| `hamar_stasjon_jernbanebyen` | `places/historie/innlandet/places_historie_innlandet_batch6.json` | Next clean railway-town candidate | `name`, `desc`, `popupDesc` |
| `ringsaker_kirke` | `places/historie/innlandet/places_historie_innlandet_batch7.json` | Next clean medieval stone church candidate | `name`, `desc`, `popupDesc` |
| `proysenstua_rudshogda` | `places/historie/innlandet/places_historie_innlandet_batch7.json` | Next clean literary/social-history candidate | `name`, `desc`, `popupDesc` |
| `dovre_kirke` | `places/historie/innlandet/places_historie_innlandet_batch7.json` | Next clean mountain-route church candidate | `name`, `desc`, `popupDesc` |
| `sel_kirke_otta` | `places/historie/innlandet/places_historie_innlandet_batch7.json` | Next clean mid-Gudbrandsdalen church candidate | `name`, `desc`, `popupDesc` |
| `femundshytten_smeltverk` | `places/historie/innlandet/places_historie_innlandet_batch7.json` | Next clean smelting/mining-history candidate | `name`, `desc`, `popupDesc` |
| `rendalen_bygdemuseum` | `places/historie/innlandet/places_historie_innlandet_batch7.json` | Next clean Østerdalen local-history candidate | `name`, `desc`, `popupDesc` |

## Translation summary
| Language | File | Entries before | Entries after | Added entries |
|---|---|---:|---:|---:|
| English | `data/i18n/content/places/en.json` | 654 | 674 | 20 |
| Spanish | `data/i18n/content/places/es.json` | 654 | 674 | 20 |
| Portuguese | `data/i18n/content/places/pt.json` | 654 | 674 | 20 |

## Added translations
| placeId | en | es | pt | Notes |
|---|---|---|---|---|
| `hedalen_stavkirke` | Hedalen Stave Church | Iglesia de madera de Hedalen | Igreja de madeira de Hedalen | Stave church |
| `vaga_kyrkje` | Vågå Church | Iglesia de Vågå | Igreja de Vågå | Church rebuild |
| `garmo_stavkirke_maihaugen` | Garmo Stave Church / Maihaugen | Garmo Stave Iglesia de madera / Maihaugen | Garmo Igreja de madeira / Maihaugen | Moved heritage |
| `sygard_grytting_pilegrimsgard` | Sygard Grytting / pilgrim farm | Sygard Grytting / pilgrim farm | Sygard Grytting / pilgrim farm | Pilgrim farm |
| `matrand_slagsted_1814` | Matrand / 1814 battlefield | Matrand / 1814 battlefield | Matrand / 1814 battlefield | 1814 war history |
| `magnor_glassverk` | Magnor Glassworks | Magnor Fábrica de vidrio | Magnor Fábrica de vidro | Glass industry |
| `finnetunet_skogfinsk_museum` | Finnetunet / Forest Finn museum | Finnetunet / Forest Finn museum | Finnetunet / Forest Finn museum | Minority history |
| `sor_fron_kirke_gudbrandsdalsdomen` | Sør-Fron Church / Gudbrandsdalsdomen | Sør-Fron Iglesia / Gudbrandsdalsdomen | Sør-Fron Igreja / Gudbrandsdalsdomen | Octagonal church |
| `lesja_kirke` | Lesja Church | Lesja Iglesia | Lesja Igreja | Church art |
| `valdres_folkemuseum_fagernes` | Valdres Folk Museum | Valdres Folk Museo | Valdres Folk Museu | Regional museum |
| `odalstunet_sor_odal` | Odalstunet | Odalstunet | Odalstunet | Local-history museum |
| `tynset_bygdemuseum` | Tynset Bygdemuseum | Tynset Bygdemuseum | Tynset Bygdemuseum | Local-history museum |
| `eidskog_museum_almenninga` | Eidskog Museum / Almenninga | Eidskog Museo / Almenninga | Eidskog Museu / Almenninga | Border history |
| `hamar_stasjon_jernbanebyen` | Hamar Station / railway town | Hamar Estación / railway town | Hamar Estação / railway town | Railway town |
| `ringsaker_kirke` | Ringsaker Church | Ringsaker Iglesia | Ringsaker Igreja | Stone church |
| `proysenstua_rudshogda` | Prøysenstua / Rudshøgda | Prøysenstua / Rudshøgda | Prøysenstua / Rudshøgda | Literary history |
| `dovre_kirke` | Dovre Church | Dovre Iglesia | Dovre Igreja | Mountain route |
| `sel_kirke_otta` | Sel Church / Otta landscape | Sel Iglesia / Otta landscape | Sel Igreja / Otta landscape | Church site |
| `femundshytten_smeltverk` | Femundshytten / smelting history | Femundshytten / smelting history | Femundshytten / smelting history | Smelting history |
| `rendalen_bygdemuseum` | Rendalen Bygdemuseum | Rendalen Bygdemuseum | Rendalen Bygdemuseum | Local history |

## Fields translated
| placeId | name | desc | popupDesc | Other fields |
|---|---:|---:|---:|---|
| `hedalen_stavkirke` | yes | yes | yes | none |
| `vaga_kyrkje` | yes | yes | yes | none |
| `garmo_stavkirke_maihaugen` | yes | yes | yes | none |
| `sygard_grytting_pilegrimsgard` | yes | yes | yes | none |
| `matrand_slagsted_1814` | yes | yes | yes | none |
| `magnor_glassverk` | yes | yes | yes | none |
| `finnetunet_skogfinsk_museum` | yes | yes | yes | none |
| `sor_fron_kirke_gudbrandsdalsdomen` | yes | yes | yes | none |
| `lesja_kirke` | yes | yes | yes | none |
| `valdres_folkemuseum_fagernes` | yes | yes | yes | none |
| `odalstunet_sor_odal` | yes | yes | yes | none |
| `tynset_bygdemuseum` | yes | yes | yes | none |
| `eidskog_museum_almenninga` | yes | yes | yes | none |
| `hamar_stasjon_jernbanebyen` | yes | yes | yes | none |
| `ringsaker_kirke` | yes | yes | yes | none |
| `proysenstua_rudshogda` | yes | yes | yes | none |
| `dovre_kirke` | yes | yes | yes | none |
| `sel_kirke_otta` | yes | yes | yes | none |
| `femundshytten_smeltverk` | yes | yes | yes | none |
| `rendalen_bygdemuseum` | yes | yes | yes | none |

## Quality checks
- JSON parse result: passed.
- Selected ids present in all three files: passed.
- No empty values among new entries: passed.
- No missing selected ids: passed.
- No disabled/excluded placeIds selected: passed.
- No batch 4–14 ids selected: passed.
- No batch 14 ids reused: passed.
- pt entries checked for Spanish prose leakage: passed.
- No runtime files changed: passed.
- No UI dictionaries changed: passed.
- No canonical place data changed: passed.
- No places_index regeneration: passed.
- Batch 7, batch 8, batch 9, batch 10, batch 11, batch 12, batch 13 and batch 14 reports unchanged: passed.

## Known non-goals
- no stale id cleanup
- no nested `for_na`, `works`, `tasks_profile`, `leksikon`
- no quiz/people/story/Civication translations
- no `places_index.json` regeneration
- no coordinate/index/parity changes
- no changes to `data/places/place_exclusions.json`
- no reuse of closed duplicate PR #1988 content

## Recommended next batch
`Content i18n batch 16 — translate next visible manifest-backed places to en/es/pt`

## Validation
- `node -e "for (const f of ['data/i18n/content/places/en.json','data/i18n/content/places/es.json','data/i18n/content/places/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('place content json ok')"`
- Selected-id presence and empty-value check.
- Disabled placeId selection check.
- Batch 14 reuse check.
- Portuguese Spanish-prose leakage check.
- `git diff -- data/i18n/ui`
- `git diff -- js`
- `git diff -- data/places`
- `git diff -- data/places/places_index.json`
- `git diff -- data/places/place_exclusions.json`
- `git diff -- data/places/coordinate_overrides.json`
- Batch 7–14 report diff checks.
- `git diff --check`

## Final note
No runtime files changed. No UI dictionaries changed. No canonical place data changed. No places_index regeneration. Batch 7, batch 8, batch 9, batch 10, batch 11, batch 12, batch 13 and batch 14 reports unchanged. Disabled placeIds were excluded. Closed duplicate PR #1988 was not used as source.
