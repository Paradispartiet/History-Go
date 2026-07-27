# Idd kirke coordinate production

Date: 2026-07-27  
Place ID: `idd_kirke`  
Category: `historie`  
Municipality: Halden, Østfold

## Production decision

Move the canonical coordinate from a nearby undocumented point to the standing medieval Idd church building.

- Previous coordinate: `59.0855, 11.4381`
- Applied coordinate: `59.08631, 11.43481`
- Displacement: approximately `208.4 m` north-west
- Coordinate status: `verified_geometry`
- Coordinate role: `medieval_church_building_anchor`
- Source object: `osm-way:344603830`
- Entity: `wikidata:Q6493646`
- Heritage identity: `kulturminne:84710`
- Radius: `260 m`

## Why this point

OpenStreetMap way `344603830` is the named building geometry for Idd kirke. Its representative point matches Wikidata Q6493646, Church of Norway building ID 270, Kulturminne ID 84710 and the current address Iddeveien 107.

The applied coordinate therefore represents the standing medieval church itself rather than a road point, the wider Idd plain or nearby archaeological context.

## Date interpretation

The church is securely described as a Romanesque stone church from the twelfth century. The canonical year `1150` is retained as an explicitly approximate midpoint in that century.

It is not presented as:

- a documented exact construction year;
- the date of every surviving building element;
- the date of later additions or interior objects.

## Building and preservation history

Norges Kirker documents the church on low ground beside the stream on Iddesletta. During the 1904 earthquake, the masonry developed serious cracks and replacement was considered. The building was instead repaired and structurally secured.

The standing medieval church is therefore both the historical subject and the physical canonical anchor.

## Inventory layers

The church retains several important objects from different periods:

- a soapstone font from the late twelfth century;
- two medieval crucifixes;
- a medieval figure of St Michael;
- a seventeenth-century altar and pulpit layer.

These objects enrich the church record but are not separate coordinate targets.

## Borgleden and landscape interpretation

Idd church lies along Borgleden. Pilegrimsleden also points to the Hov place-name and rock carvings in the surrounding landscape.

The production applies a strict interpretation limit:

- the broader landscape may indicate long-term ritual and settlement significance;
- it is not encoded as proof of one specific pre-Christian building on the church plot;
- nearby archaeological traces are not folded into the church-building geometry.

## Address and access

The current address control is `Iddeveien 107, 1765 Halden`, supported by the church entity and Halden cemetery authority.

Gameplay limitations:

- services, funerals and cemetery use take precedence;
- tasks must not disturb graves, memorials or ceremonies;
- interior access follows current church arrangements;
- the coordinate does not guarantee that the church is open;
- the radius is not a building, cemetery, heritage, property, stream, road, memorial, ceremony or access boundary.

## Files changed

1. `data/places/historie/ostfold/places_historie_ostfold_batch5/idd_kirke.json`
2. `data/coordinate-evidence/ostfold/historie/idd_kirke.json`
3. `reports/ostfold-coordinate-idd-kirke-source-probe/source-summary.json`
4. `reports/ostfold-coordinate-idd-kirke-production-2026-07-27.md`

## Next unresolved manifest entry

`hobol_kirke`
