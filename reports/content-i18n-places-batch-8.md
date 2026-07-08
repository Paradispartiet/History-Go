# Content i18n places batch 8

## Status

Kort oppsummering:

- Report cleanup for translations merged in PR #1843.
- Data-only translation batch already merged.
- 20 placeIds translated to en/es/pt.
- Priority: next missing Østlandet/Oslo-region places after Oslo nature/route priority files.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope

Files changed by this cleanup PR:

- `reports/content-i18n-places-batch-7.md`
- `reports/content-i18n-places-batch-8.md`

PR #1843 also changed:

- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- previously overwritten `reports/content-i18n-places-batch-7.md`

This cleanup PR must only change report files.

## Correction

- PR #1843 contained batch 8 translations but used the batch 7 title and report path.
- `reports/content-i18n-places-batch-7.md` has now been restored to the PR #1825 batch 7 report.
- `reports/content-i18n-places-batch-8.md` now documents the PR #1843 batch 8 translations.

## Selection method

- Canonical ids were selected from `data/places/manifest.json` and manifest-listed source files under `data/places/**`.
- Candidate ids were compared against `data/i18n/content/places/en.json`, `data/i18n/content/places/es.json` and `data/i18n/content/places/pt.json`.
- Oslo nature/route candidates were checked first.
- The batch selected the next missing Østlandet/Oslo-region manifest-backed places.
- Already translated, stale and non-manifest ids were excluded.

## Source placeIds

| placeId | Canonical source file | Selection reason | Fields translated |
|---|---|---|---|
| `hoytorp_fort` | `data/places/historie/ostfold/places_historie_ostfold_batch2.json` | Next missing Østlandet defence/landscape place after Oslo nature files were already translated | `name`, `desc`, `popupDesc` |
| `orje_sluser_haldenkanalen` | `data/places/historie/ostfold/places_historie_ostfold_batch2.json` | Next missing Østlandet waterway/route infrastructure place | `name`, `desc`, `popupDesc` |
| `basmo_festning` | `data/places/historie/ostfold/places_historie_ostfold_batch2.json` | Next missing Østlandet border-landscape heritage place | `name`, `desc`, `popupDesc` |
| `eidsberg_kirke` | `data/places/historie/ostfold/places_historie_ostfold_batch2.json` | Next missing Østlandet medieval church place | `name`, `desc`, `popupDesc` |
| `rygge_kirke` | `data/places/historie/ostfold/places_historie_ostfold_batch2.json` | Next missing Østlandet pilgrim-route/church place | `name`, `desc`, `popupDesc` |
| `hvaler_kirke` | `data/places/historie/ostfold/places_historie_ostfold_batch2.json` | Next missing Østlandet coastal church and maritime-landscape place | `name`, `desc`, `popupDesc` |
| `askim_gummivarefabrikk` | `data/places/historie/ostfold/places_historie_ostfold_batch2.json` | Next missing Østlandet industrial-history place | `name`, `desc`, `popupDesc` |
| `borregaard_sarpsborg_industri` | `data/places/historie/ostfold/places_historie_ostfold_batch3.json` | Next missing Østlandet river/industry place | `name`, `desc`, `popupDesc` |
| `sarpsfossen` | `data/places/historie/ostfold/places_historie_ostfold_batch3.json` | Next missing Østlandet waterfall, town-foundation and industry place | `name`, `desc`, `popupDesc` |
| `spydeberg_prestegard_1814` | `data/places/historie/ostfold/places_historie_ostfold_batch3.json` | Next missing Østlandet 1814 public-history place | `name`, `desc`, `popupDesc` |
| `skjeberg_kirke` | `data/places/historie/ostfold/places_historie_ostfold_batch3.json` | Next missing Østlandet ancient-landscape/church place | `name`, `desc`, `popupDesc` |
| `tistedalen_saugbrugsforeningen` | `data/places/historie/ostfold/places_historie_ostfold_batch3.json` | Next missing Østlandet watercourse/industrial landscape place | `name`, `desc`, `popupDesc` |
| `indreroed_gard_fredrikstad` | `data/places/historie/ostfold/places_historie_ostfold_batch3.json` | Next missing Østlandet cultural-landscape/farm-history place | `name`, `desc`, `popupDesc` |
| `varne_kloster` | `data/places/historie/ostfold/places_historie_ostfold_batch3.json` | Next missing Østlandet monastery/estate-history place | `name`, `desc`, `popupDesc` |
| `onsøy_kirke` | `data/places/historie/ostfold/places_historie_ostfold_batch3.json` | Next missing Østlandet rural church-place entry | `name`, `desc`, `popupDesc` |
| `isegran_fort_verft` | `data/places/historie/ostfold/places_historie_ostfold_batch4.json` | Next missing Østlandet river-defence and maritime-craft place | `name`, `desc`, `popupDesc` |
| `akeroya_fort` | `data/places/historie/ostfold/places_historie_ostfold_batch4.json` | Next missing Østlandet coastal-defence/nature-landscape place | `name`, `desc`, `popupDesc` |
| `trogstad_fort` | `data/places/historie/ostfold/places_historie_ostfold_batch4.json` | Next missing Østlandet inland fortification place | `name`, `desc`, `popupDesc` |
| `rodenes_kirke` | `data/places/historie/ostfold/places_historie_ostfold_batch4.json` | Next missing Østlandet lake-landscape/church place | `name`, `desc`, `popupDesc` |
| `fredrikshalds_teater` | `data/places/historie/ostfold/places_historie_ostfold_batch4.json` | Next missing Østlandet visible urban-culture place | `name`, `desc`, `popupDesc` |

## Translation summary

| Language | File | Entries before | Entries after | Added entries |
|---|---|---:|---:|---:|
| English | `data/i18n/content/places/en.json` | 508 canonical / 514 total | 528 canonical / 534 total | 20 |
| Spanish | `data/i18n/content/places/es.json` | 508 canonical / 514 total | 528 canonical / 534 total | 20 |
| Portuguese | `data/i18n/content/places/pt.json` | 508 canonical / 514 total | 528 canonical / 534 total | 20 |

## Added translations

| placeId | en | es | pt | Notes |
|---|---|---|---|---|
| `hoytorp_fort` | Høytorp Fort | Fuerte de Høytorp | Forte de Høytorp | Defence landscape |
| `orje_sluser_haldenkanalen` | Ørje Locks / Halden Canal | Esclusas de Ørje / canal de Halden | Eclusas de Ørje / Canal de Halden | Waterway route |
| `basmo_festning` | Basmo Fortress | Fortaleza de Basmo | Fortaleza de Basmo | Border fortress |
| `eidsberg_kirke` | Eidsberg Church | Iglesia de Eidsberg | Igreja de Eidsberg | Medieval church |
| `rygge_kirke` | Rygge Church | Iglesia de Rygge | Igreja de Rygge | Pilgrim-route church |
| `hvaler_kirke` | Hvaler Church | Iglesia de Hvaler | Igreja de Hvaler | Coastal church |
| `askim_gummivarefabrikk` | Askim Rubber Factory / Viking | Fábrica de caucho de Askim / Viking | Fábrica de borracha de Askim / Viking | Industrial history |
| `borregaard_sarpsborg_industri` | Borregaard Sarpsborg | Borregaard Sarpsborg | Borregaard Sarpsborg | River industry |
| `sarpsfossen` | Sarpsfossen | Sarpsfossen | Sarpsfossen | Waterfall/town |
| `spydeberg_prestegard_1814` | Spydeberg Parsonage / 1814 meeting | Casa parroquial de Spydeberg / reunión de 1814 | Casa paroquial de Spydeberg / reunião de 1814 | 1814 site |
| `skjeberg_kirke` | Skjeberg Church | Iglesia de Skjeberg | Igreja de Skjeberg | Ancient landscape |
| `tistedalen_saugbrugsforeningen` | Tistedalen / Saugbrugsforeningen | Tistedalen / Saugbrugsforeningen | Tistedalen / Saugbrugsforeningen | Watercourse industry |
| `indreroed_gard_fredrikstad` | Indre Rød Farm | Granja Indre Rød | Quinta Indre Rød | Farm landscape |
| `varne_kloster` | Værne Monastery | Monasterio de Værne | Mosteiro de Værne | Monastery/estate |
| `onsøy_kirke` | Onsøy Church | Iglesia de Onsøy | Igreja de Onsøy | Rural church |
| `isegran_fort_verft` | Isegran Fort and Maritime Centre | Fuerte de Isegran y centro marítimo | Forte de Isegran e Centro Marítimo | River/maritime heritage |
| `akeroya_fort` | Akerøya Fort | Fuerte de Akerøya | Forte de Akerøya | Coastal defence |
| `trogstad_fort` | Trøgstad Fort | Fuerte de Trøgstad | Forte de Trøgstad | Inland fort |
| `rodenes_kirke` | Rødenes Church | Iglesia de Rødenes | Igreja de Rødenes | Lake church |
| `fredrikshalds_teater` | Fredrikshald Theatre | Teatro de Fredrikshald | Teatro de Fredrikshald | Theatre history |

## Fields translated

| placeId | name | desc | popupDesc | Other fields |
|---|---:|---:|---:|---|
| `hoytorp_fort` | yes | yes | yes | none |
| `orje_sluser_haldenkanalen` | yes | yes | yes | none |
| `basmo_festning` | yes | yes | yes | none |
| `eidsberg_kirke` | yes | yes | yes | none |
| `rygge_kirke` | yes | yes | yes | none |
| `hvaler_kirke` | yes | yes | yes | none |
| `askim_gummivarefabrikk` | yes | yes | yes | none |
| `borregaard_sarpsborg_industri` | yes | yes | yes | none |
| `sarpsfossen` | yes | yes | yes | none |
| `spydeberg_prestegard_1814` | yes | yes | yes | none |
| `skjeberg_kirke` | yes | yes | yes | none |
| `tistedalen_saugbrugsforeningen` | yes | yes | yes | none |
| `indreroed_gard_fredrikstad` | yes | yes | yes | none |
| `varne_kloster` | yes | yes | yes | none |
| `onsøy_kirke` | yes | yes | yes | none |
| `isegran_fort_verft` | yes | yes | yes | none |
| `akeroya_fort` | yes | yes | yes | none |
| `trogstad_fort` | yes | yes | yes | none |
| `rodenes_kirke` | yes | yes | yes | none |
| `fredrikshalds_teater` | yes | yes | yes | none |

## Quality checks

- Report-only cleanup.
- Batch 7 report restored from git history.
- Batch 8 report created.
- No translation JSON files changed in this cleanup PR.
- No runtime files changed.
- No UI dictionaries changed.
- No canonical place data changed.
- No places_index regeneration.

## Known non-goals

- No translation edits.
- No stale id cleanup.
- No nested `for_na`, `works`, `tasks_profile`, `leksikon`.
- No quiz/people/story/Civication translations.
- No `places_index.json` regeneration.

## Recommended next batch

`Content i18n batch 9 — translate next visible Oslo/Østlandet places to en/es/pt`

## Validation

Commands run:

```sh
grep -q "Content i18n places batch 7" reports/content-i18n-places-batch-7.md
grep -q "bygdoy_kongsgard_salamanderdam" reports/content-i18n-places-batch-7.md
grep -q "hoyesteretts_hus" reports/content-i18n-places-batch-7.md
! grep -q "hoytorp_fort" reports/content-i18n-places-batch-7.md
grep -q "Content i18n places batch 8" reports/content-i18n-places-batch-8.md
grep -q "hoytorp_fort" reports/content-i18n-places-batch-8.md
grep -q "fredrikshalds_teater" reports/content-i18n-places-batch-8.md
grep -q "508 canonical" reports/content-i18n-places-batch-8.md
grep -q "528 canonical" reports/content-i18n-places-batch-8.md
git diff -- data/i18n/content/places/en.json
git diff -- data/i18n/content/places/es.json
git diff -- data/i18n/content/places/pt.json
git diff -- data/i18n/ui
git diff -- js
git diff -- data/places
git diff -- data/places/places_index.json
git diff --check
git status --short
```

## Final note

Batch 7 report restored. Batch 8 report created. No translation JSON changed. No runtime files changed. No UI dictionaries changed. No canonical place data changed. No places_index regeneration.
