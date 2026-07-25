# Akershus coordinate production – Haslum kirke

Date: 2026-07-25

## Scope

Production source-contract upgrade for `haslum_kirke`, the fourth church in the Akershus batch-2 queue.

Canonical file:

`data/places/historie/akershus/places_historie_akershus_batch2/haslum_kirke.json`

Evidence file:

`data/coordinate-evidence/akershus/historie/haslum_kirke.json`

## Previous state

- coordinate: `59.92387, 10.5658`
- radius: `200`
- no coordinate-source metadata
- point already lay at the named church building

## Primary geometry source

OpenStreetMap way `35947041` is the exact named building geometry for Haslum kirke.

Stable source identity:

`osm-way:35947041`

Source URL:

`https://www.openstreetmap.org/way/35947041`

The canonical point is approximately 2.1 metres from the registered church coordinate `59°55'26.0" N, 10°33'56.9" E` and is retained without an artificial move.

## Official identity source and rejected coordinate candidate

Kartverket SSR identifies:

- name: Haslum kirke
- object type: `Kyrkje`
- place number: `429951`
- name representation point: `59.92459, 10.56735`

The SSR point lies approximately 117.8 metres from the church building. It is retained as an authoritative naming and identity source, but rejected as the building display marker. The place record represents the physical medieval church, not a general label position in the wider church property.

## Independent checks

- Bærum kirkelige fellesråd identifies Haslum kirke on Kirkeveien and separately lists the menighet offices at Gml. Ringeriksvei 86.
- The structured church record identifies `Kirkeveien 143, 1344 Haslum`.
- The same record connects OSM way `35947041`, SSR place number `429951` and Kulturminne ID `84489` to Haslum kirke.
- Bærum municipality identifies Haslum as one of the municipality's medieval stone churches.

## Production result

- coordinate retained: `59.92387, 10.5658`
- displacement: `0.0 m`
- `locatorType`: `building`
- `sourceProvider`: `osm`
- `sourceObjectId`: `osm-way:35947041`
- `geocodeAccuracy`: `building`
- `coordRole`: `display_marker`
- `coordType`: `named_church_building_point`
- `coordStatus`: `verified_geometry`
- radius retained at `200 m`

This is a source-contract upgrade rather than a coordinate correction. The coordinate points to the medieval church while the radius covers the churchyard and immediate historical environment.

## Method decision

The named building geometry is preferred over the Kartverket name point because:

1. the canonical record is building-scoped;
2. the stable OSM way directly represents the physical church;
3. the existing point agrees with the registered church coordinate;
4. the SSR label point is displaced approximately 117.8 metres from the building;
5. the church offices at Gml. Ringeriksvei 86 are a separate location and are excluded.

No nearest/first-hit result, office address or generic Haslum locality point was used.

## Next queue item

`asker_kirke_kirkested`

This record is semantically different from the four standing medieval-church records. It represents a layered historical church site where the medieval church burned in 1878 and the present church was built on the same site in 1879. Production must therefore use a documented historical-site anchor rather than treating the record as a simple modern address point.
