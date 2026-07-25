# Akershus coordinate production – Tanum kirke

Date: 2026-07-25

## Scope

Production application for `tanum_kirke`, the first church in the Akershus batch-2 queue.

Canonical file:

`data/places/historie/akershus/places_historie_akershus_batch2/tanum_kirke.json`

Evidence file:

`data/coordinate-evidence/akershus/historie/tanum_kirke.json`

## Previous state

- coordinate: `59.8898, 10.47669`
- radius: `220`
- no coordinate-source metadata
- point represented the wider Tanum locality rather than the church

## Applied source

Kartverket's official place-name factsheet identifies:

- name: Tanum kirke
- place number: `65873`
- object type: `Kyrkje`
- municipality: Bærum
- official coordinate: `59.89562, 10.47931`

Stable source identity:

`kartverket-ssr:65873:59.89562000,10.47931000`

Source URL:

`https://stadnamn.kartverket.no/fakta/65873`

## Independent checks

- Tanum menighet confirms the address `Tanumveien 133, 1341 Slependen`.
- Bærum municipality identifies the medieval church on the highest point of Tanumåsen.
- Named OpenStreetMap building `way 112593369` lies approximately 17.3 metres from the Kartverket point and confirms the building scope.

## Production result

- new coordinate: `59.89562, 10.47931`
- displacement from legacy marker: approximately `663.4 m`
- `locatorType`: `building`
- `sourceProvider`: `kartverket`
- `geocodeAccuracy`: `building`
- `coordRole`: `display_marker`
- `coordType`: `official_church_place_name_point`
- `coordStatus`: `verified`
- radius retained at `220 m`

The radius remains broad enough for the churchyard and immediate historic landscape, while the coordinate itself now points to the named medieval church.

## Method decision

The Kartverket SSR object is preferred over the preliminary rounded OSM centre because it:

1. directly classifies the object as a church;
2. provides a stable official source identity;
3. publishes an explicit representation point;
4. agrees with the official address and independent named-building object.

No nearest/first-hit result, generic Tanum locality point or manual map guess was used.

## Next queue item

`skedsmo_kirke`

The existing audit records a plausible correction near the official address at Gjoleidveien 2. It must now be resolved against an official Kartverket source object before production.
