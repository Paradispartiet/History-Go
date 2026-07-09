# Content i18n places batch 17

## Status
- Data-only translation batch.
- 20 new manifest-backed placeIds translated to en/es/pt.
- Builds on main after batch 16 repair / PR #2039.
- Batch 16 is treated as 40 excluded ids: PR #2023 batch 16a plus PR #2035 batch 16b.
- Disabled placeIds from `data/places/place_exclusions.json` excluded.
- Closed duplicate PR #1988 and unmerged place-split PRs were not used as sources.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
Files changed:
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-17.md`

## Selection method
Read `data/places/manifest.json`, `data/places/place_exclusions.json`, the three place content dictionaries, batch 4–16 reports, the batch 15 PT cleanup report, the batch 16 repair report, the architecture batch 2 report, and `js/i18n.js`.

The exclude set was built from the documented batch 4–16 placeId tables, with the 40 batch 16 ids explicitly excluded. The disabled set was read from `data/places/place_exclusions.json`. The selected ids are manifest-backed canonical ids, are not disabled, are not documented in batches 4–16, and were missing from all three target language dictionaries before this batch. Selection prioritized the next remaining visible Innlandet / Østlandet historical places with direct `name`, `desc`, and `popupDesc` fields.

## Source placeIds
| placeId | Canonical source file | Fields translated |
|---|---|---|
| `land_museum_dokka` | `data/places/historie/innlandet/places_historie_innlandet_batch10.json` | `name`, `desc`, `popupDesc` |
| `vang_stavkirke_tomta_valdres` | `data/places/historie/innlandet/places_historie_innlandet_batch10.json` | `name`, `desc`, `popupDesc` |
| `nord_odal_bygdetun_sand` | `data/places/historie/innlandet/places_historie_innlandet_batch10.json` | `name`, `desc`, `popupDesc` |
| `valer_kirke_brannminne` | `data/places/historie/innlandet/places_historie_innlandet_batch10.json` | `name`, `desc`, `popupDesc` |
| `tingelstad_gamle_kirke` | `data/places/historie/innlandet/places_historie_innlandet_batch11.json` | `name`, `desc`, `popupDesc` |
| `fluberg_kirke` | `data/places/historie/innlandet/places_historie_innlandet_batch11.json` | `name`, `desc`, `popupDesc` |
| `biri_kirke` | `data/places/historie/innlandet/places_historie_innlandet_batch11.json` | `name`, `desc`, `popupDesc` |
| `mustad_hunnselva_gjovik` | `data/places/historie/innlandet/places_historie_innlandet_batch11.json` | `name`, `desc`, `popupDesc` |
| `brumunddal_molle_industri` | `data/places/historie/innlandet/places_historie_innlandet_batch11.json` | `name`, `desc`, `popupDesc` |
| `bagn_bygdesamling` | `data/places/historie/innlandet/places_historie_innlandet_batch11.json` | `name`, `desc`, `popupDesc` |
| `etnedal_bygdetun_bruflat` | `data/places/historie/innlandet/places_historie_innlandet_batch11.json` | `name`, `desc`, `popupDesc` |
| `brandval_kirke` | `data/places/historie/innlandet/places_historie_innlandet_batch11.json` | `name`, `desc`, `popupDesc` |
| `hjerkinn_fjellstue` | `data/places/historie/innlandet/places_historie_innlandet_batch12.json` | `name`, `desc`, `popupDesc` |
| `budsjord_pilegrimsgard` | `data/places/historie/innlandet/places_historie_innlandet_batch12.json` | `name`, `desc`, `popupDesc` |
| `jutulheimen_vagaa_bygdamuseum` | `data/places/historie/innlandet/places_historie_innlandet_batch12.json` | `name`, `desc`, `popupDesc` |
| `follebu_kirke` | `data/places/historie/innlandet/places_historie_innlandet_batch12.json` | `name`, `desc`, `popupDesc` |
| `heidal_kirke` | `data/places/historie/innlandet/places_historie_innlandet_batch12.json` | `name`, `desc`, `popupDesc` |
| `hoff_kirke_toten` | `data/places/historie/innlandet/places_historie_innlandet_batch12.json` | `name`, `desc`, `popupDesc` |
| `gjovik_glassverk_historisk_miljo` | `data/places/historie/innlandet/places_historie_innlandet_batch12.json` | `name`, `desc`, `popupDesc` |
| `eina_stasjon_totenbanen` | `data/places/historie/innlandet/places_historie_innlandet_batch12.json` | `name`, `desc`, `popupDesc` |

## Validation
- Exactly 20 new ids are documented in this report.
- Each selected id exists in a source file listed by `data/places/manifest.json`.
- None of the selected ids are disabled in `data/places/place_exclusions.json`.
- None of the selected ids appear in batch 4–16 reports.
- Each selected id now has `name`, `desc`, `popupDesc`, `_sourceHash`, and `_status` in `en`, `es`, and `pt`.
