# People expansion — Oslo by batch 1 validation

## Scope

- Target file: `data/people/by/oslo/people_by_oslo.json`
- New people appended: 5
- New places created: 0
- Place files changed: 0
- `data/places/places_index.json` changed: no
- `data/people/manifest.json` changed: no

## Preflight

Checked requested people IDs across all manifest-listed people files before append:

- `kjetil_traedal_thorsen`: not found before append
- `ellen_de_vibe`: not found before append
- `jan_gehl`: not found before append
- `albert_nordengen`: not found before append
- `kristin_jarmund`: not found before append

Checked requested place IDs in `data/places/places_index.json`:

- `bjorvika`: found
- `radhusplassen`: found
- `vulkan_industriomrade`: found

Skipped entries:

- `skipped_existing_person`: 0
- `skipped_missing_place`: 0

## Post-change validation

Custom manifest-wide validation after append:

- New requested people found: 5
- New requested people duplicate counts: 1 each
- New duplicate people introduced by this batch: 0
- `invalidPlaceRefs`: 0
- `peopleWithoutValidPrimaryAnchor`: 0
- `peopleWithEmptyPlacesArray`: 0

Note: a repo-wide duplicate-ID check currently reports 7 pre-existing duplicate IDs unrelated to this batch:
`magnus_den_gode`, `harald_hardrade`, `sigurd_jorsalfare`, `haakon_haakonsson`, `magnus_lagabote`, `haakon_v_magnusson`, `eufemia_av_rugen`.
