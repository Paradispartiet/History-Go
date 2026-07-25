# Akershus coordinate production – Skedsmo kirke

Date: 2026-07-25

## Scope

Production application for `skedsmo_kirke`, the second church in the Akershus batch-2 queue.

Canonical file:

`data/places/historie/akershus/places_historie_akershus_batch2/skedsmo_kirke.json`

Evidence file:

`data/coordinate-evidence/akershus/historie/skedsmo_kirke.json`

## Previous state

- coordinate: `59.99387, 11.04598`
- radius: `220`
- no coordinate-source metadata
- marker lay approximately 37.8 metres east of the official named-church point

## Applied source

Kartverket's Sentralt stedsnavnregister identifies:

- name: Skedsmo kirke
- place number: `65554`
- official coordinate: `59.99381, 11.04531`

Stable source identity:

`kartverket-ssr:65554:59.99381000,11.04531000`

Source URL:

`https://stadnamn.kartverket.no/fakta/65554`

## Independent checks

- Lillestrøm kirkelige fellesråd confirms the church address `Gjoleidveien 2, 2019 Skedsmokorset`.
- The same official page distinguishes the church from Sten menighetshus at `Gjoleidveien 5`.
- Named OpenStreetMap building `way 189055303` lies approximately 9.8 metres from the Kartverket representation point and confirms the building scope.

## Production result

- new coordinate: `59.99381, 11.04531`
- displacement from legacy marker: approximately `37.8 m`
- `locatorType`: `building`
- `sourceProvider`: `kartverket`
- `geocodeAccuracy`: `building`
- `coordRole`: `display_marker`
- `coordType`: `official_church_place_name_point`
- `coordStatus`: `verified`
- radius retained at `220 m`

The coordinate points to the named medieval church while the radius covers the churchyard and immediate historical church environment.

## Method decision

The Kartverket SSR object is preferred over the preliminary rounded map candidate because it:

1. provides a stable official source identity;
2. publishes an explicit representation point for the named church;
3. agrees with the official church address;
4. agrees with the independent named-building object;
5. excludes the nearby but separate Sten menighetshus.

No nearest/first-hit result, menighetshus address point or manual map guess was used.

## Next queue item

`enebakk_kirke`

The existing audit indicates that the legacy coordinate is already close to the named church. The next task is therefore expected to be a source-contract upgrade with little or no coordinate displacement.
