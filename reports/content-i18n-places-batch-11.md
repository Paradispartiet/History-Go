# Content i18n places batch 11

## Status

- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Priority: next visible manifest-backed places after batch 10.
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
- `reports/content-i18n-places-batch-11.md`

## Selection method

The 20 ids were selected from canonical ids in manifest-listed place source files and compared against `data/i18n/content/places/en.json`, `data/i18n/content/places/es.json` and `data/i18n/content/places/pt.json`.

Selection excluded ids documented in content-i18n batches 4, 5, 6, 7, 8, 9 and 10, and excluded disabled placeIds read from `data/places/place_exclusions.json`. The selected ids are the next remaining visible Østlandet/Buskerud history, church, industry, railway, museum and local-history places with direct `name`, `desc` and `popupDesc` fields. Already translated, stale translation-only, non-manifest, disabled and entries without direct visible fields were excluded.

## Source placeIds

| placeId | Canonical source file | Selection reason | Fields translated |
|---|---|---|---|
| `blaafarvevaerket_modum` | `data/places/historie/buskerud/places_historie_buskerud_batch1.json` | Østlandet industry/resource-history candidate | `name`, `desc`, `popupDesc` |
| `nore_stavkirke` | `data/places/historie/buskerud/places_historie_buskerud_batch1.json` | Østlandet medieval church candidate | `name`, `desc`, `popupDesc` |
| `uvdal_stavkirke` | `data/places/historie/buskerud/places_historie_buskerud_batch1.json` | Østlandet stave-church/interior-history candidate | `name`, `desc`, `popupDesc` |
| `rollag_stavkirke` | `data/places/historie/buskerud/places_historie_buskerud_batch1.json` | Østlandet stave-church continuity candidate | `name`, `desc`, `popupDesc` |
| `flesberg_stavkirke` | `data/places/historie/buskerud/places_historie_buskerud_batch1.json` | Østlandet stave-church/churchyard candidate | `name`, `desc`, `popupDesc` |
| `fossesholm_herregard` | `data/places/historie/buskerud/places_historie_buskerud_batch1.json` | Østlandet manor/timber-economy candidate | `name`, `desc`, `popupDesc` |
| `torpo_stavkirke` | `data/places/historie/buskerud/places_historie_buskerud_batch2.json` | Østlandet medieval church/painting candidate | `name`, `desc`, `popupDesc` |
| `hol_gamle_kyrkje` | `data/places/historie/buskerud/places_historie_buskerud_batch2.json` | Østlandet mountain-village church candidate | `name`, `desc`, `popupDesc` |
| `hallingdal_museum_nesbyen` | `data/places/historie/buskerud/places_historie_buskerud_batch2.json` | Østlandet regional museum/social-history candidate | `name`, `desc`, `popupDesc` |
| `kroderbanen_kroderen_stasjon` | `data/places/historie/buskerud/places_historie_buskerud_batch2.json` | Østlandet railway/waterway transport candidate | `name`, `desc`, `popupDesc` |
| `nostetangen_glassverk` | `data/places/historie/buskerud/places_historie_buskerud_batch2.json` | Østlandet glass/design industry candidate | `name`, `desc`, `popupDesc` |
| `drammen_museum_marienlyst` | `data/places/historie/buskerud/places_historie_buskerud_batch2.json` | Østlandet urban museum/culture candidate | `name`, `desc`, `popupDesc` |
| `haug_kirke_eiker` | `data/places/historie/buskerud/places_historie_buskerud_batch2.json` | Østlandet medieval/local church-site candidate | `name`, `desc`, `popupDesc` |
| `lier_bygdetun` | `data/places/historie/buskerud/places_historie_buskerud_batch2.json` | Østlandet rural museum/local-history candidate | `name`, `desc`, `popupDesc` |
| `boensnes_kirke` | `data/places/historie/buskerud/places_historie_buskerud_batch3.json` | Østlandet medieval church/memory candidate | `name`, `desc`, `popupDesc` |
| `stein_gard_halvdanshaugen` | `data/places/historie/buskerud/places_historie_buskerud_batch3.json` | Østlandet archaeology/saga-memory candidate | `name`, `desc`, `popupDesc` |
| `kongsberg_kirke` | `data/places/historie/buskerud/places_historie_buskerud_batch3.json` | Østlandet mining-town church candidate | `name`, `desc`, `popupDesc` |
| `labro_museum` | `data/places/historie/buskerud/places_historie_buskerud_batch3.json` | Østlandet hydropower/transport museum candidate | `name`, `desc`, `popupDesc` |
| `portaasen_wildenvey` | `data/places/historie/buskerud/places_historie_buskerud_batch3.json` | Østlandet literature/place-memory candidate | `name`, `desc`, `popupDesc` |
| `lausen_kapell_ruin` | `data/places/historie/buskerud/places_historie_buskerud_batch3.json` | Østlandet medieval chapel-ruin candidate | `name`, `desc`, `popupDesc` |

## Skipped candidates

| placeId | Reason skipped |
|---|---|
| `akershus_festning` | Already translated in all three language files before batch 11. |
| `brenneriveien_ingens_gate` | Disabled in `data/places/place_exclusions.json` and already documented in an earlier content-i18n batch. |
| `vulkan_murvegger` | Disabled in `data/places/place_exclusions.json`. |
| `hausmannsgate_aksen` | Disabled in `data/places/place_exclusions.json`. |

## Translation summary

| Language | File | Entries before | Entries after | Added entries |
|---|---|---:|---:|---:|
| English | `data/i18n/content/places/en.json` | 574 | 594 | 20 |
| Spanish | `data/i18n/content/places/es.json` | 574 | 594 | 20 |
| Portuguese | `data/i18n/content/places/pt.json` | 574 | 594 | 20 |

Expected around 568 canonical / 574 total entries before batch 11 and around 588 canonical / 594 total entries after batch 11. The repo totals matched the expected total-entry count after adding 20 entries per language; stale/extra cleanup remains out of scope.

## Added translations

| placeId | en | es | pt | Notes |
|---|---|---|---|---|
| `blaafarvevaerket_modum` | Blaafarveværket | Blaafarveværket | Blaafarveværket | Industry/resource history |
| `nore_stavkirke` | Nore Stave Church | Iglesia de madera de Nore | Igreja de madeira de Nore | Stave church |
| `uvdal_stavkirke` | Uvdal Stave Church | Iglesia de madera de Uvdal | Igreja de madeira de Uvdal | Stave church/interior layers |
| `rollag_stavkirke` | Rollag Stave Church | Iglesia de madera de Rollag | Igreja de madeira de Rollag | Stave church continuity |
| `flesberg_stavkirke` | Flesberg Stave Church | Iglesia de madera de Flesberg | Igreja de madeira de Flesberg | Stave church/churchyard |
| `fossesholm_herregard` | Fossesholm Manor | Mansión Fossesholm | Solar de Fossesholm | Manor/timber economy |
| `torpo_stavkirke` | Torpo Stave Church | Iglesia de madera de Torpo | Igreja de madeira de Torpo | Medieval paintings |
| `hol_gamle_kyrkje` | Hol Old Church | Antigua iglesia de Hol | Antiga igreja de Hol | Mountain-village church |
| `hallingdal_museum_nesbyen` | Hallingdal Museum Nesbyen | Museo Hallingdal Nesbyen | Museu Hallingdal Nesbyen | Regional museum |
| `kroderbanen_kroderen_stasjon` | The Krøderen Line / Krøderen Station | Línea de Krøderen / estación de Krøderen | Linha de Krøderen / estação de Krøderen | Heritage railway |
| `nostetangen_glassverk` | Nøstetangen Glassworks | Fábrica de vidrio de Nøstetangen | Fábrica de vidro de Nøstetangen | Glass/design history |
| `drammen_museum_marienlyst` | Drammen Museum / Marienlyst | Museo de Drammen / Marienlyst | Museu de Drammen / Marienlyst | Urban museum |
| `haug_kirke_eiker` | Haug Church / Eiker Church Site | Iglesia de Haug / sitio eclesiástico de Eiker | Igreja de Haug / sítio eclesiástico de Eiker | Church site |
| `lier_bygdetun` | Lier Rural Museum | Museo rural de Lier | Museu rural de Lier | Rural museum |
| `boensnes_kirke` | Bønsnes Church | Iglesia de Bønsnes | Igreja de Bønsnes | Medieval church/memory |
| `stein_gard_halvdanshaugen` | Stein Farm / Halvdanshaugen | Granja Stein / Halvdanshaugen | Quinta Stein / Halvdanshaugen | Saga-memory landscape |
| `kongsberg_kirke` | Kongsberg Church | Iglesia de Kongsberg | Igreja de Kongsberg | Mining-town church |
| `labro_museum` | The Labro Museums | Museos de Labro | Museus de Labro | Hydropower/transport |
| `portaasen_wildenvey` | Portåsen / Herman Wildenvey’s Childhood Home | Portåsen / casa de infancia de Herman Wildenvey | Portåsen / casa de infância de Herman Wildenvey | Literary place-memory |
| `lausen_kapell_ruin` | Laugen Chapel Ruin | Ruina de la capilla de Laugen | Ruína da capela de Laugen | Chapel ruin |

## Fields translated

| placeId | name | desc | popupDesc | Other fields |
|---|---:|---:|---:|---|
| `blaafarvevaerket_modum` | yes | yes | yes | none |
| `nore_stavkirke` | yes | yes | yes | none |
| `uvdal_stavkirke` | yes | yes | yes | none |
| `rollag_stavkirke` | yes | yes | yes | none |
| `flesberg_stavkirke` | yes | yes | yes | none |
| `fossesholm_herregard` | yes | yes | yes | none |
| `torpo_stavkirke` | yes | yes | yes | none |
| `hol_gamle_kyrkje` | yes | yes | yes | none |
| `hallingdal_museum_nesbyen` | yes | yes | yes | none |
| `kroderbanen_kroderen_stasjon` | yes | yes | yes | none |
| `nostetangen_glassverk` | yes | yes | yes | none |
| `drammen_museum_marienlyst` | yes | yes | yes | none |
| `haug_kirke_eiker` | yes | yes | yes | none |
| `lier_bygdetun` | yes | yes | yes | none |
| `boensnes_kirke` | yes | yes | yes | none |
| `stein_gard_halvdanshaugen` | yes | yes | yes | none |
| `kongsberg_kirke` | yes | yes | yes | none |
| `labro_museum` | yes | yes | yes | none |
| `portaasen_wildenvey` | yes | yes | yes | none |
| `lausen_kapell_ruin` | yes | yes | yes | none |

## Quality checks

- JSON parse result: passed.
- Selected ids present in all three files: passed.
- No empty values among new entries: passed.
- No missing selected ids: passed.
- No disabled/excluded placeIds selected: passed.
- No runtime files changed: passed.
- No UI dictionaries changed: passed.
- No canonical place data changed: passed.
- No places_index regeneration: passed.
- Batch 7, batch 8, batch 9 and batch 10 reports unchanged: passed.

## Known non-goals

- No stale id cleanup.
- No nested `for_na`, `works`, `tasks_profile`, `leksikon` translations.
- No quiz/people/story/Civication translations.
- No `places_index.json` regeneration.
- No changes to `data/places/place_exclusions.json`.

## Recommended next batch

`Content i18n batch 12 — translate next visible manifest-backed places to en/es/pt`

## Validation

- `node -e "for (const f of ['data/i18n/content/places/en.json','data/i18n/content/places/es.json','data/i18n/content/places/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('place content json ok')"`
- Selected-id presence and empty-value check for the 20 batch 11 ids.
- Disabled-placeId check against `data/places/place_exclusions.json`.
- `git diff -- data/i18n/ui`
- `git diff -- js`
- `git diff -- data/places`
- `git diff -- data/places/places_index.json`
- `git diff -- data/places/place_exclusions.json`
- `git diff -- reports/content-i18n-places-batch-7.md`
- `git diff -- reports/content-i18n-places-batch-8.md`
- `git diff -- reports/content-i18n-places-batch-9.md`
- `git diff -- reports/content-i18n-places-batch-10.md`
- `git diff --check`
- `npm run i18n:places:audit` completed its build step but exited with existing broad i18n work remaining: 499 OK, 503 missing, 89 stale and 6 extra English translation IDs. The batch 11 selected ids were not reported as missing; broad stale/missing/extra cleanup remains out of scope.

## Final note

No runtime files changed. No UI dictionaries changed. No canonical place data changed. No places_index regeneration. Batch 7, batch 8, batch 9 and batch 10 reports unchanged. Disabled placeIds were excluded.
