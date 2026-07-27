# Rød Herregård – coordinate production

Date: 2026-07-27

## Result

- Place: `rod_herregard`
- Previous coordinate: `59.1261, 11.3769`
- Applied coordinate: `59.12269, 11.36845`
- Displacement: approximately `613.4 m` southwest
- Radius: `320 m` retained
- Status: `verified_historical_source`
- Role: `manor_house_main_building_anchor`
- Source object: `osm-way:4481504;wikidata:Q14556917;riksantikvaren-kulturminne:86040`

## Identity resolution

Rød can refer to the protected main house, the museum, its gardens and yard, the historic farm or a much larger forest estate. The canonical History Go record needs one stable physical anchor while preserving those wider historical relationships.

OpenStreetMap way `4481504` maps the manor's main-building geometry and is linked to Wikidata `Q14556917`. Wikidata identifies the same object as cultural property, manor house and museum, and links it to Kulturminne ID `86040`. The building centroid is therefore used as the canonical anchor.

Store norske leksikon describes a seventeenth-century building and a 1733 addition as the core of the protected main house, later altered in 1862 and enlarged in 1875. It also distinguishes the house-and-park foundation from the approximately 90,000-decare forest estate. Østfoldmuseene confirms the combined public destination with manor house, collections, archive and gardens.

## Applied source

The centroid of OpenStreetMap way `4481504` is:

- `59.12269, 11.36845`

The Wikidata heritage-entity coordinate lies approximately 9.2 metres away and confirms the same building identity.

## Rejected candidates

- Legacy point `59.1261, 11.3769`: approximately 613.4 m northeast of the manor complex and without a source-object identity.
- OSM node `27470219`: museum visitor point approximately 33.3 m northeast of the applied building centroid.
- GeoNames farm point: broad farm identity and less precise than the protected building geometry.
- Wider Rød estate: extensive property and forest context, not a point coordinate source.
- Park or garden centroid: important to the visitor experience but not a substitute for the named main building.

## Radius decision

The existing 320 m gameplay radius is retained. It covers the main building, immediate yard, museum functions and core garden approaches.

The radius is explicitly not:

- the legal heritage-protection geometry
- the property or forest-estate boundary
- the full park or every historic garden feature
- a separate archaeological locality

## Production files

- `data/places/historie/ostfold/places_historie_ostfold_batch1/rod_herregard.json`
- `data/coordinate-evidence/ostfold/historie/rod_herregard.json`
- `reports/ostfold-coordinate-rod-herregard-source-probe/source-summary.json`
- `reports/ostfold-coordinate-rod-herregard-production-2026-07-27.md`

## Queue

Rød Herregård completes the coordinate-production sequence for Historie Østfold batch 1. The next manifest entry is `gjellestadskipet_jellhaugen` in batch 2.
