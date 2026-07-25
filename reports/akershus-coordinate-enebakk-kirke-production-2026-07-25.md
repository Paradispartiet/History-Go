# Akershus coordinate production – Enebakk kirke

Date: 2026-07-25

## Scope

Production source-contract upgrade for `enebakk_kirke`, the third church in the Akershus batch-2 queue.

Canonical file:

`data/places/historie/akershus/places_historie_akershus_batch2/enebakk_kirke.json`

Evidence file:

`data/coordinate-evidence/akershus/historie/enebakk_kirke.json`

## Previous state

- coordinate: `59.76234, 11.14683`
- radius: `220`
- no coordinate-source metadata
- point already matched the named church-building candidate

## Applied source

OpenStreetMap way `274137233` is the exact named building geometry for Enebakk kirke and has display point:

`59.76234, 11.14683`

Stable source identity:

`osm-way:274137233`

Source URL:

`https://www.openstreetmap.org/way/274137233`

## Independent checks

- Enebakk sokn confirms the church address `Ignaveien 14, 1912 Enebakk`.
- The protected medieval church identity is associated with Kulturminne ID `84094`.
- Enebakk kapell is a separate neighbouring building, OSM way `274137234`, and is explicitly excluded.

## Production result

- coordinate retained: `59.76234, 11.14683`
- displacement: `0.0 m`
- `locatorType`: `building`
- `sourceProvider`: `osm`
- `sourceObjectId`: `osm-way:274137233`
- `geocodeAccuracy`: `building`
- `coordRole`: `display_marker`
- `coordType`: `named_church_building_point`
- `coordStatus`: `verified_geometry`
- radius retained at `220 m`

This is a source-contract upgrade rather than a coordinate correction. The coordinate points to the medieval church while the radius covers the churchyard and immediate historical environment.

## Method decision

The named building geometry is accepted because it:

1. directly represents Enebakk kirke;
2. has a stable public source object ID;
3. agrees exactly with the canonical coordinate at stored precision;
4. agrees with the official church address;
5. can be distinguished from the separate neighbouring chapel.

No nearest/first-hit result or generic Kirkebygda point was used.

## Next queue item

`haslum_kirke`

The current Haslum marker lies close to the named church-building candidate. The next task is expected to combine official church identity with a stable named building or Kartverket representation point.
