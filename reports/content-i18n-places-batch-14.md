# Content i18n places batch 14

## Status
- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Builds on batch 13.
- Disabled placeIds from `data/places/place_exclusions.json` excluded.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-14.md`

## Selection method
The selected ids were read from canonical source files listed in `data/places/manifest.json`, then compared against the current en/es/pt place translation files. Batch 13 report ids were explicitly excluded and not reused. Disabled ids collected from `data/places/place_exclusions.json` were also excluded. The batch continued with the next visible manifest-backed places missing in all three language files, prioritizing remaining Innlandet historical places after batch 13.

## Source placeIds
| placeId | Canonical source file | Fields translated |
|---|---|---|
| `brekke_sluser_haldenkanalen` | `data/places/historie/ostfold/places_historie_ostfold_batch5.json` | name, desc, popupDesc |
| `hegge_stavkirke` | `data/places/historie/innlandet/places_historie_innlandet_batch2.json` | name, desc, popupDesc |
| `reinli_stavkirke` | `data/places/historie/innlandet/places_historie_innlandet_batch2.json` | name, desc, popupDesc |
| `hundorp_dale_gudbrand` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | name, desc, popupDesc |
| `folldal_gruver` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | name, desc, popupDesc |
| `norsk_utvandrermuseum_ottestad` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | name, desc, popupDesc |
| `raufoss_industripark_ammunisjon` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | name, desc, popupDesc |
| `lesja_bygdemuseum` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | name, desc, popupDesc |
| `kvikne_kobberverk` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | name, desc, popupDesc |
| `bagnsbergatn_krigsminne` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | name, desc, popupDesc |
| `tolga_os_museum` | `data/places/historie/innlandet/places_historie_innlandet_batch3.json` | name, desc, popupDesc |
| `granavollen_sosterkirkene` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | name, desc, popupDesc |
| `hadeland_folkemuseum` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | name, desc, popupDesc |
| `norsk_vegmuseum_oyer` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | name, desc, popupDesc |
| `nybergsund_kongens_nei` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | name, desc, popupDesc |
| `elverum_folkehogskole_1940` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | name, desc, popupDesc |
| `stange_kirke` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | name, desc, popupDesc |
| `balke_kirke_toten` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | name, desc, popupDesc |
| `kvinnemuseet_kongsvinger` | `data/places/historie/innlandet/places_historie_innlandet_batch4.json` | name, desc, popupDesc |
| `lomen_stavkirke` | `data/places/historie/innlandet/places_historie_innlandet_batch5.json` | name, desc, popupDesc |

## Translation summary
| Language | File | Added entries |
|---|---|---:|
| en | `data/i18n/content/places/en.json` | 20 |
| es | `data/i18n/content/places/es.json` | 20 |
| pt | `data/i18n/content/places/pt.json` | 20 |

## Quality checks
- JSON parse result: passed.
- Selected ids present in all three files: passed.
- No empty values among new entries: passed.
- No batch 13 ids reused: passed.
- No runtime files changed: passed.
- No UI dictionaries changed: passed.
- No canonical place data changed: passed.
- No `places_index.json`, `coordinate_overrides.json`, or `place_exclusions.json` changes: passed.
- Batch 7–13 reports unchanged: passed.

## Validation
- `npm run build:scripts`
- `node -e "for (const f of ['data/i18n/content/places/en.json','data/i18n/content/places/es.json','data/i18n/content/places/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('place content json ok')"`
- Selected-id presence and empty-value check.
- Batch 13 reuse check.
- `git diff --name-only`
- `git diff -- data/places js reports/content-i18n-places-batch-7.md reports/content-i18n-places-batch-8.md reports/content-i18n-places-batch-9.md reports/content-i18n-places-batch-10.md reports/content-i18n-places-batch-11.md reports/content-i18n-places-batch-12.md reports/content-i18n-places-batch-13.md`
- `git diff --check`

## Final note
No runtime files changed. No UI dictionaries changed. No canonical place data changed. No places_index regeneration. Batch 7–13 reports unchanged. Batch 13 ids were not reused.
