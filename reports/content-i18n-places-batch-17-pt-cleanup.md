# Content i18n places batch 17 PT cleanup

## Status
- Repair PR for merged batch 17 / PR #2043.
- Fixes Spanish/mixed-language leakage in `data/i18n/content/places/pt.json`.
- Does not add new placeIds.
- Does not change en/es translations.
- Does not change canonical place data.
- Does not change runtime/index files.
- Does not regenerate `places_index.json`.

## Scope
Changed files:
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-17-pt-cleanup.md`

## Repaired placeIds
| placeId | Fields repaired |
|---|---|
| `land_museum_dokka` | `name`, `desc`, `popupDesc` |
| `vang_stavkirke_tomta_valdres` | `name`, `desc`, `popupDesc` |
| `nord_odal_bygdetun_sand` | `name`, `desc`, `popupDesc` |
| `valer_kirke_brannminne` | `name`, `desc`, `popupDesc` |
| `tingelstad_gamle_kirke` | `name`, `desc`, `popupDesc` |
| `fluberg_kirke` | `name`, `desc`, `popupDesc` |
| `biri_kirke` | `name`, `desc`, `popupDesc` |
| `mustad_hunnselva_gjovik` | `name`, `desc`, `popupDesc` |
| `brumunddal_molle_industri` | `name`, `desc`, `popupDesc` |
| `bagn_bygdesamling` | `name`, `desc`, `popupDesc` |
| `etnedal_bygdetun_bruflat` | `name`, `desc`, `popupDesc` |
| `brandval_kirke` | `name`, `desc`, `popupDesc` |
| `hjerkinn_fjellstue` | `name`, `desc`, `popupDesc` |
| `budsjord_pilegrimsgard` | `name`, `desc`, `popupDesc` |
| `jutulheimen_vagaa_bygdamuseum` | `name`, `desc`, `popupDesc` |
| `follebu_kirke` | `name`, `desc`, `popupDesc` |
| `heidal_kirke` | `name`, `desc`, `popupDesc` |
| `hoff_kirke_toten` | `name`, `desc`, `popupDesc` |
| `gjovik_glassverk_historisk_miljo` | `name`, `desc`, `popupDesc` |
| `eina_stasjon_totenbanen` | `name`, `desc`, `popupDesc` |

## Quality checks
- JSON parse passed.
- Exactly 20 batch 17 pt entries checked.
- No new IDs added.
- `_sourceHash` preserved.
- `_status` preserved.
- en/es unchanged.
- data/places unchanged.
- places_index unchanged.
- JS/runtime unchanged.
- Old batch reports unchanged.
- Portuguese leakage check passed.

## Validation
Commands run:
- `node -e "JSON.parse(require('fs').readFileSync('data/i18n/content/places/pt.json','utf8')); console.log('pt json ok')"`
- Batch 17 pt entry presence/non-empty validation script.
- Strong Portuguese leakage check script.
- `git diff --name-only`
- `git diff -- data/i18n/content/places/en.json`
- `git diff -- data/i18n/content/places/es.json`
- `git diff -- data/i18n/ui`
- `git diff -- data/places`
- `git diff -- data/places/places_index.json`
- `git diff -- data/places/place_exclusions.json`
- `git diff -- data/places/coordinate_overrides.json`
- `git diff -- js`
- `git diff -- reports/content-i18n-places-batch-17.md`
- `git diff -- reports/content-i18n-places-batch-16.md`
- `git diff -- reports/content-i18n-places-batch-16-repair.md`
- `git diff --check`

## Final note
Batch 17 Portuguese entries were repaired without changing English/Spanish translations, source place data, runtime files, indexes, manifests, or prior batch reports.
