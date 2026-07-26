# Ullensaker kirke / Ullinhof kirkested coordinate production

Date: 2026-07-26

## Result

`ullensaker_kirke_kirkested` has been moved from an incorrect western point to the deterministic centroid of the named Romeriksdomen building geometry.

- Previous coordinate: `60.0798, 11.1406`
- Applied coordinate: `60.083857437355, 11.164727670111`
- Displacement: approximately `1,412.1 m`
- Applied geometry: OpenStreetMap way `259926133`
- National building reference: `151220150`
- Official address: `Kjerkevegen 25, 2040 Kløfta`
- Kartverket identity: municipality `3209`, farm/use number `29/1115`, address code `6608`
- Coordinate status: `verified_geometry`
- Coordinate role: `display_marker`
- Radius: `280 m`

## Canonical identity

The canonical marker represents today's Ullensaker kirke, commonly called Romeriksdomen, as the stable physical anchor for a much longer church-site history.

The place identity includes:

- the earliest medieval church at Ullinshov/Ullinhof;
- a later stave church at the present church site;
- the timber church built in 1768;
- the 1952 fire;
- the current concrete church consecrated in 1958;
- reused medieval and early-modern furnishings;
- the pre-Christian place-name layer in Ullinshof.

The marker does not claim to be the exact coordinate of the lost medieval stone church.

## Current church geometry

OpenStreetMap way `259926133` is:

- named `Ullensaker kirke`;
- tagged `building=church`;
- tagged `start_date=1958`;
- linked to national building reference `151220150`;
- linked to Wikidata `Q8732384`;
- represented by a 23-node closed polygon including the repeated closing node.

The deterministic polygon centroid is:

- Latitude: `60.083857437355`
- Longitude: `11.164727670111`

Nominatim independently resolves the same way at `60.0838422, 11.1647448`, approximately `1.9 m` from the calculated centroid.

## Official address

Kartverket returned exactly one object for Kjerkevegen 25:

- Municipality: `3209 Ullensaker`
- Farm/use number: `29/1115`
- Address code: `6608`
- Postal code: `2040`
- Representation point: `60.08387343447055, 11.164631691491484`

The official address point lies approximately `5.6 m` from the applied church centroid.

## Church-site chronology

Store norske leksikon documents the current church as a large reinforced-concrete church designed by Arnstein Arneberg and Per Solemslie and consecrated in 1958. Alf Rolfsen created the frescoes.

The present building followed a timber church from 1768 that burned after a lightning strike in 1952. The altarpiece from 1633, pulpit from 1649 and a medieval baptismal font were rescued and reused.

The church-site history is older than the current location alone:

- the earliest medieval church stood at the Ullinshov parsonage, roughly 200 metres from today's church;
- a stave church was erected at the present church site in the sixteenth century;
- the 1768 timber church replaced it;
- Romeriksdomen replaced the burned timber church in 1958.

## Why no secondary medieval coordinate is stored

The persisted local OSM extract contains the current church and cemetery geometry but no separately named, verifiable ruin, archaeological site or old-church polygon for the earliest Ullinhof church.

The historical sources establish approximate proximity, but not a reproducible object coordinate suitable for the Coordinate Source Contract.

No secondary point is therefore created. This avoids presenting an inferred point as verified archaeological geometry.

## Ullinhof name layer

The place-name Ullensaker is derived from Old Norse `Ullinshof`, combining the god-name Ull and `hof`, a cult building or temple. The name is associated with Ullinshov farm and preserves a pre-Christian religious layer beneath the later church history.

This name history is part of the place narrative but does not establish an exact physical coordinate for a pagan sanctuary.

## Legacy-point assessment

The previous coordinate `60.0798, 11.1406` lies approximately `1,412.1 m` west of the current church centroid.

It cannot be tied to:

- Romeriksdomen;
- Kjerkevegen 25;
- the cemetery;
- the documented approximate Ullinshov old-church area;
- a named archaeological object.

This is a substantial physical correction rather than only a provenance upgrade.

## Radius decision

The radius is set to `280 m` to support gameplay coverage of:

- Romeriksdomen;
- the cemetery;
- the immediate church-site landscape;
- the documented nearby Ullinshov/Ullinhof historical context.

The radius must not be interpreted as:

- the exact cemetery boundary;
- a cadastral parcel;
- an automatic heritage-protection zone;
- an archaeological polygon for the medieval church;
- a verified pagan-temple location.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| OSM way 259926133 | Named Romeriksdomen polygon | Primary applied geometry |
| Kartverket, Kjerkevegen 25 | Official current-church address | Physical/address cross-check |
| SNL – Ullensaker kirke | Current building, fire and church-site chronology | Primary historical identity |
| Ullensaker parish | Current institutional identity | Official cross-check |
| SNL – Ullensaker | Ullinshof name and place context | Name-history context |
| Materialized site map | Shows absence of stable old-site object | Negative geometry evidence |
| Legacy coordinate | Incorrect western point | Rejected |

## Raw source material

The one-time source workflow persisted:

- `reports/akershus-coordinate-ullensaker-kirke-source-probe/osm-way-259926133-full.xml`
- `reports/akershus-coordinate-ullensaker-kirke-source-probe/nominatim-ullensaker-kirke.json`
- `reports/akershus-coordinate-ullensaker-kirke-source-probe/geonorge-kjerkevegen-25.json`
- `reports/akershus-coordinate-ullensaker-kirke-source-probe/osm-ullensaker-church-site-bbox.xml`
- `reports/akershus-coordinate-ullensaker-kirke-source-probe/source-summary.txt`

The temporary workflow removed itself before the production diff was finalized.

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch5/ullensaker_kirke_kirkested.json`
- `data/coordinate-evidence/akershus/historie/ullensaker_kirke_kirkested.json`
- `reports/akershus-coordinate-ullensaker-kirke-production-2026-07-26.md`
- the five raw-source files listed above

## Next record

Continue with `aurskog_holand_bygdetun`, the next place in the active Akershus batch-5 sequence.
