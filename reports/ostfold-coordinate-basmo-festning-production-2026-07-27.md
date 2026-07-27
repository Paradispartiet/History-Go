# Basmo festning – coordinate production

Date: 2026-07-27

## Result

- Place: `basmo_festning`
- Previous coordinate: `59.6635, 11.6738`
- Applied coordinate: `59.61710, 11.53487`
- Displacement: approximately `9,358.7 m` southwest
- Radius: `320 m` retained
- Status: `verified_geometry`
- Role: `main_fort_ruin_anchor`
- Source object: `osm-way:1263141701;wikidata:Q4867802;riksantikvaren-kulturminne:86068`

## Identity resolution

Basmo was historically much larger than the ruin visible today. The fortress occupied a steep hill between Rødenessjøen and Hemnessjøen and included a five-storey donjon, batteries, outworks, a southern retrenchment and approximately 40 buildings on and below the hill.

The canonical History Go point therefore follows the restored donjon and main-fort ruin. This is the strongest stable physical visitor anchor, but it does not represent the complete historical fortress, forterrain or military settlement.

## Applied source

OpenStreetMap way `1263141701` maps the restored main-fort building geometry. Its centroid is:

- `59.61710, 11.53487`

Wikidata `Q4867802` identifies the same fortress as a cultural property, links Kulturminne ID `86068` and places the entity approximately 34.1 metres from the applied building centroid.

Store norske leksikon distinguishes the small main-fort location from the much wider approximate fortress and forterrain. Marker municipality documents the tower completed in 1683, approximately 40 buildings, closure in 1745, protection in 1985 and continuing restoration.

## Rejected candidates

- Legacy point `59.6635, 11.6738`: approximately 9.36 km northeast of the documented fortress and without a source-object identity.
- Wikidata entity coordinate: valid close cross-check, but less direct than the mapped main-fort building geometry.
- Broad Basmo locality or farm point: does not identify the surviving ruin.
- Road, parking or access point: visitor infrastructure rather than the historical object.
- Reconstructed full fortress centroid or boundary: not applied because no verified canonical geometry was captured for the complete forterrain and military settlement.

## Radius decision

The existing 320 m gameplay radius is retained. It covers the main ruin, hilltop and immediate visitor approach.

The radius is explicitly not:

- the complete historical fortress and forterrain
- the legal heritage-protection geometry
- a property boundary
- the exact ruin or building polygon

## Production files

- `data/places/historie/ostfold/places_historie_ostfold_batch2/basmo_festning.json`
- `data/coordinate-evidence/ostfold/historie/basmo_festning.json`
- `reports/ostfold-coordinate-basmo-festning-source-probe/source-summary.json`
- `reports/ostfold-coordinate-basmo-festning-production-2026-07-27.md`

## Queue

The next active manifest entry is `eidsberg_kirke`.
