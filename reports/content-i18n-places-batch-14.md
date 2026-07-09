# Content i18n places batch 14

## Status

- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Builds on PR #1981 / batch 13.
- Disabled placeIds from `data/places/place_exclusions.json` excluded.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope

Files changed:

- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-14.md`

## Selection method

- Read `data/places/manifest.json` and selected canonical ids from manifest-listed source files.
- Read `data/places/place_exclusions.json` and excluded disabled placeIds.
- Compared canonical ids against `data/i18n/content/places/en.json`, `data/i18n/content/places/es.json`, and `data/i18n/content/places/pt.json`.
- Excluded ids already used in batch 4, batch 5, batch 6, batch 7, batch 8, batch 9, batch 10, batch 11, batch 12, and batch 13 reports.
- Prioritized visible Innlandet/Østlandet manifest-backed places with direct `name`, `desc`, and `popupDesc` fields.
- Lisboa/Portugal manifest-backed places were not needed to reach 20 clean candidates.
- Excluded already translated, stale, non-manifest, disabled, and generated-index-only ids.

## Source placeIds

| placeId | Canonical source file | Selection reason | Fields translated |
|---|---|---|---|
| `hegge_stavkirke` | `data/places/historie/innlandet/places_historie_innlandet_batch2.json` | Manifest-backed Innlandet/Østlandet stave church missing all three languages | `name`, `desc`, `popupDesc` |
| `reinli_stavkirke` | `data/places/historie/innlandet/places_historie_innlandet_batch2.json` | Manifest-backed Innlandet/Østlandet stave church missing all three languages | `name`, `desc`, `popupDesc` |
| `hundorp_dale_gudbrand` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | Manifest-backed Gudbrandsdalen historic landscape missing all three languages | `name`, `desc`, `popupDesc` |
| `folldal_gruver` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | Manifest-backed mining heritage site missing all three languages | `name`, `desc`, `popupDesc` |
| `norsk_utvandrermuseum_ottestad` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | Manifest-backed migration-history museum missing all three languages | `name`, `desc`, `popupDesc` |
| `raufoss_industripark_ammunisjon` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | Manifest-backed industrial heritage site missing all three languages | `name`, `desc`, `popupDesc` |
| `lesja_bygdemuseum` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | Manifest-backed rural museum missing all three languages | `name`, `desc`, `popupDesc` |
| `kvikne_kobberverk` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | Manifest-backed copper works site missing all three languages | `name`, `desc`, `popupDesc` |
| `bagnsbergatn_krigsminne` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | Manifest-backed war memorial missing all three languages | `name`, `desc`, `popupDesc` |
| `tolga_os_museum` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | Manifest-backed local-history museum missing all three languages | `name`, `desc`, `popupDesc` |
| `granavollen_sosterkirkene` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | Manifest-backed medieval church site missing all three languages | `name`, `desc`, `popupDesc` |
| `hadeland_folkemuseum` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | Manifest-backed folk museum missing all three languages | `name`, `desc`, `popupDesc` |
| `norsk_vegmuseum_oyer` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | Manifest-backed national road-history museum missing all three languages | `name`, `desc`, `popupDesc` |
| `nybergsund_kongens_nei` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | Manifest-backed 1940 war-history site missing all three languages | `name`, `desc`, `popupDesc` |
| `elverum_folkehogskole_1940` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | Manifest-backed constitutional crisis site missing all three languages | `name`, `desc`, `popupDesc` |
| `stange_kirke` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | Manifest-backed medieval stone church missing all three languages | `name`, `desc`, `popupDesc` |
| `balke_kirke_toten` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | Manifest-backed medieval stone church missing all three languages | `name`, `desc`, `popupDesc` |
| `kvinnemuseet_kongsvinger` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | Manifest-backed social-history museum missing all three languages | `name`, `desc`, `popupDesc` |
| `lomen_stavkirke` | `data/places/historie/innlandet/places_historie_innlandet_batch5.json` | Manifest-backed Valdres stave church missing all three languages | `name`, `desc`, `popupDesc` |
| `oye_stavkirke` | `data/places/historie/innlandet/places_historie_innlandet_batch5.json` | Manifest-backed Valdres stave church missing all three languages | `name`, `desc`, `popupDesc` |

## Skipped candidates

| placeId | Reason skipped |
|---|---|
| Disabled ids from `data/places/place_exclusions.json` | Excluded before selection; none were selected for batch 14. |
| Batch 4–13 ids | Excluded before selection to avoid reusing earlier content-i18n batches. |

## Translation summary

| Language | File | Entries before | Entries after | Added entries |
|---|---|---:|---:|---:|
| en | `data/i18n/content/places/en.json` | 634 | 654 | 20 |
| es | `data/i18n/content/places/es.json` | 634 | 654 | 20 |
| pt | `data/i18n/content/places/pt.json` | 634 | 654 | 20 |

## Added translations

| placeId | en | es | pt | Notes |
|---|---|---|---|---|
| `hegge_stavkirke` | Hegge Stave Church | Iglesia de madera de Hegge | Igreja de madeira de Hegge | Stave church |
| `reinli_stavkirke` | Reinli Stave Church | Iglesia de madera de Reinli | Igreja de madeira de Reinli | Stave church |
| `hundorp_dale_gudbrand` | Hundorp / Dale-Gudbrand’s farm | Hundorp / granja de Dale-Gudbrand | Hundorp / quinta de Dale-Gudbrand | Historic farm and assembly landscape |
| `folldal_gruver` | Folldal Mines | Minas de Folldal | Minas de Folldal | Mining heritage |
| `norsk_utvandrermuseum_ottestad` | Norwegian Emigrant Museum Ottestad | Museo Noruego de la Emigración Ottestad | Museu Norueguês da Emigração Ottestad | Migration museum |
| `raufoss_industripark_ammunisjon` | Raufoss Industrial Park / ammunition factory | Parque industrial de Raufoss / fábrica de municiones | Parque industrial de Raufoss / fábrica de munições | Industrial heritage |
| `lesja_bygdemuseum` | Lesja Rural Museum | Museo rural de Lesja | Museu rural de Lesja | Rural museum |
| `kvikne_kobberverk` | Kvikne Copper Works | Ferrería de cobre de Kvikne | Ferraria de cobre de Kvikne | Copper works |
| `bagnsbergatn_krigsminne` | Bagnsbergatn / war memorial | Bagnsbergatn / memorial de guerra | Bagnsbergatn / memorial de guerra | War memorial |
| `tolga_os_museum` | Tolga-Os Museum / Dølmotunet | Museo Tolga-Os / Dølmotunet | Museu Tolga-Os / Dølmotunet | Local-history museum |
| `granavollen_sosterkirkene` | Granavollen / the Sister Churches | Granavollen / las Iglesias Hermanas | Granavollen / as Igrejas Irmãs | Medieval church site |
| `hadeland_folkemuseum` | Hadeland Folk Museum | Museo Popular de Hadeland | Museu Popular de Hadeland | Folk museum |
| `norsk_vegmuseum_oyer` | Norwegian Road Museum | Museo Noruego de Carreteras | Museu Norueguês das Estradas | Road-history museum |
| `nybergsund_kongens_nei` | Nybergsund / the King’s No | Nybergsund / el no del rey | Nybergsund / o não do rei | 1940 war-history site |
| `elverum_folkehogskole_1940` | Elverum Folk High School / the Elverum Authorization | Escuela popular de Elverum / autorización de Elverum | Escola popular de Elverum / autorização de Elverum | Constitutional crisis site |
| `stange_kirke` | Stange Church | Iglesia de Stange | Igreja de Stange | Stone church |
| `balke_kirke_toten` | Balke Church | Iglesia de Balke | Igreja de Balke | Stone church |
| `kvinnemuseet_kongsvinger` | The Women’s Museum Kongsvinger | Museo de la Mujer Kongsvinger | Museu da Mulher Kongsvinger | Social-history museum |
| `lomen_stavkirke` | Lomen Stave Church | Iglesia de madera de Lomen | Igreja de madeira de Lomen | Stave church |
| `oye_stavkirke` | Øye Stave Church | Iglesia de madera de Øye | Igreja de madeira de Øye | Stave church |

## Fields translated

| placeId | name | desc | popupDesc | Other fields |
|---|---:|---:|---:|---|
| `hegge_stavkirke` | yes | yes | yes | none |
| `reinli_stavkirke` | yes | yes | yes | none |
| `hundorp_dale_gudbrand` | yes | yes | yes | none |
| `folldal_gruver` | yes | yes | yes | none |
| `norsk_utvandrermuseum_ottestad` | yes | yes | yes | none |
| `raufoss_industripark_ammunisjon` | yes | yes | yes | none |
| `lesja_bygdemuseum` | yes | yes | yes | none |
| `kvikne_kobberverk` | yes | yes | yes | none |
| `bagnsbergatn_krigsminne` | yes | yes | yes | none |
| `tolga_os_museum` | yes | yes | yes | none |
| `granavollen_sosterkirkene` | yes | yes | yes | none |
| `hadeland_folkemuseum` | yes | yes | yes | none |
| `norsk_vegmuseum_oyer` | yes | yes | yes | none |
| `nybergsund_kongens_nei` | yes | yes | yes | none |
| `elverum_folkehogskole_1940` | yes | yes | yes | none |
| `stange_kirke` | yes | yes | yes | none |
| `balke_kirke_toten` | yes | yes | yes | none |
| `kvinnemuseet_kongsvinger` | yes | yes | yes | none |
| `lomen_stavkirke` | yes | yes | yes | none |
| `oye_stavkirke` | yes | yes | yes | none |

## Quality checks

- JSON parse result: passed.
- Selected ids present in all three files: passed.
- No empty values among new entries: passed.
- No missing selected ids: passed.
- No disabled/excluded placeIds selected: passed.
- No batch 4–13 ids selected: passed.
- No runtime files changed: passed.
- No UI dictionaries changed: passed.
- No canonical place data changed: passed.
- No places_index regeneration: passed.
- Batch 7, batch 8, batch 9, batch 10, batch 11, batch 12 and batch 13 reports unchanged: passed.

## Known non-goals

- No stale id cleanup.
- No nested `for_na`, `works`, `tasks_profile`, `leksikon`.
- No quiz/people/story/Civication translations.
- No `places_index.json` regeneration.
- No coordinate/index/parity changes.
- No changes to `data/places/place_exclusions.json`.

## Recommended next batch

`Content i18n batch 15 — translate next visible manifest-backed places to en/es/pt`

## Validation

- `node -e "for (const f of ['data/i18n/content/places/en.json','data/i18n/content/places/es.json','data/i18n/content/places/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('place content json ok')"`
- Selected-id presence and non-empty value check.
- Disabled placeId exclusion check.
- Batch 13 reuse check.
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
- `git diff --check`
- `npm run i18n:places:check`

## Final note

No runtime files changed. No UI dictionaries changed. No canonical place data changed. No places_index regeneration. Batch 7, batch 8, batch 9, batch 10, batch 11, batch 12 and batch 13 reports unchanged. Disabled placeIds were excluded.
