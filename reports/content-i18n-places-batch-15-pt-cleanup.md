# Content i18n places batch 15 PT cleanup

## Status
- Repair PR for merged batch 15 / PR #2000.
- Fixes Spanish/prose leakage in `data/i18n/content/places/pt.json`.
- Does not add new placeIds.
- Does not change en/es translations.
- Does not change canonical place data.
- Does not change runtime/index files.

## Scope
Changed files:
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-15-pt-cleanup.md`

## Repaired placeIds
| placeId | Fields repaired |
|---|---|
| `hedalen_stavkirke` | `name`, `desc`, `popupDesc` |
| `vaga_kyrkje` | `name`, `desc`, `popupDesc` |
| `garmo_stavkirke_maihaugen` | `name`, `desc`, `popupDesc` |
| `sygard_grytting_pilegrimsgard` | `name`, `desc`, `popupDesc` |
| `matrand_slagsted_1814` | `name`, `desc`, `popupDesc` |
| `magnor_glassverk` | `name`, `desc`, `popupDesc` |
| `finnetunet_skogfinsk_museum` | `name`, `desc`, `popupDesc` |
| `sor_fron_kirke_gudbrandsdalsdomen` | `name`, `desc`, `popupDesc` |
| `lesja_kirke` | `name`, `desc`, `popupDesc` |
| `valdres_folkemuseum_fagernes` | `name`, `desc`, `popupDesc` |
| `odalstunet_sor_odal` | `name`, `desc`, `popupDesc` |
| `tynset_bygdemuseum` | `name`, `desc`, `popupDesc` |
| `eidskog_museum_almenninga` | `name`, `desc`, `popupDesc` |
| `hamar_stasjon_jernbanebyen` | `name`, `desc`, `popupDesc` |
| `ringsaker_kirke` | `name`, `desc`, `popupDesc` |
| `proysenstua_rudshogda` | `name`, `desc`, `popupDesc` |
| `dovre_kirke` | `name`, `desc`, `popupDesc` |
| `sel_kirke_otta` | `name`, `desc`, `popupDesc` |
| `femundshytten_smeltverk` | `name`, `desc`, `popupDesc` |
| `rendalen_bygdemuseum` | `name`, `desc`, `popupDesc` |

## Quality checks
- JSON parse passed.
- Exactly 20 batch 15 pt entries checked.
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
- `python3 -m json.tool data/i18n/content/places/pt.json >/tmp/pt.json.validated`
- `python3 - <<'PY' ... PY` batch 15 scope, metadata preservation, forbidden-file, and Portuguese leakage validation.
- `git diff --name-only`

## Final note
Batch 15 Portuguese entries were repaired without changing English/Spanish translations, source place data, runtime files, indexes, manifests, or prior batch reports.
