# Losby Gods coordinate production

Date: 2026-07-26

## Result

`losby_gods` has been moved from a nearby uncontracted point at the eastern side of the complex to the deterministic centroid of the named Losby Gods building geometry.

- Previous coordinate: `59.88685, 10.98411`
- Applied coordinate: `59.88680008666081, 10.983017201931101`
- Displacement: approximately `61.2 m`
- Applied geometry: OpenStreetMap way `819618193`
- National building reference: `12444672`
- Official address: `Losbyveien 270, 1475 Finstadjordet`
- Kartverket identity: municipality `3222`, farm/use number `91/16`, address code `6150`
- Coordinate status: `verified_geometry`
- Coordinate role: `area_anchor`
- Radius: `340 m`

## Canonical identity

The canonical record represents the named manor and hotel complex as the physical anchor for the wider historical Losby estate.

The historical place includes several layers:

- sawmills and timber trade from the sixteenth century;
- the combination of Losby, Østmork and Vestmork into a larger estate;
- smallholdings, sawmill workers, forest workers and servants;
- Christiania merchants and estate owners;
- the mid-nineteenth-century hunting lodge and manor building;
- hunting, recreation and elite hospitality;
- modernization of forestry after 1960;
- restoration and expansion as a hotel in 1997–1999.

The canonical point is not intended to represent the full forest property, every sawmill site or every smallholding.

## Named building geometry

OpenStreetMap way `819618193` is:

- named `Losby Gods`;
- tagged `building=hotel`;
- tagged `tourism=hotel`;
- linked to national building reference `12444672`;
- represented by a complete polygon in the persisted source material.

The deterministic polygon centroid is:

- Latitude: `59.88680008666081`
- Longitude: `10.983017201931101`

Nominatim independently resolves the same way as Losby Gods and returns a representative point at `59.8868735, 10.9839841`, approximately `54.6 m` from the calculated centroid.

The OSM polygon contains both the older manor component and later hotel additions. The centroid therefore anchors the named present-day complex and must not be described as the exact centre of the original mid-nineteenth-century wing.

## Official address basis

Kartverket returned exactly one object for Losbyveien 270:

- Municipality: `3222 Lørenskog`
- Farm/use number: `91/16`
- Address code: `6150`
- Postal code: `1475`
- Representation point: `59.88686319648732, 10.983615156991803`

The official address point lies approximately `34.1 m` from the applied building centroid and confirms the physical identity of the named geometry.

Losby Gods also publishes Losbyveien 270 as its current postal address.

## Historical basis

Lørenskog municipality documents that the oldest hotel section was originally built as a hunting lodge in the mid-nineteenth century. The municipality places this building in a broader history of sawmills from the sixteenth century, forest and timber wealth, former smallholdings and workers' housing.

Losby Gods' own historical account documents the same broader estate system: timber booms and downturns, Christiania owners, hardworking smallholders and servants, hunting, hospitality, modernization and the eventual hotel conversion.

The history therefore supports an area-anchor model: the building is the most stable physical object, but the History Go place represents the larger estate economy and social structure.

## Postal address versus routing advice

Losby Gods warns that entering the correct postal address, Losbyveien 270, may produce an unsuitable navigation route. It recommends entering Losbyveien 1 and continuing to the end of Losbyveien.

Kartverket shows that Losbyveien 1 is located at:

- `59.917657201604136, 10.95790898724187`
- approximately `3,705.8 m` from the applied building centroid.

Losbyveien 1 is therefore a routing hint, not the physical address or canonical coordinate of Losby Gods.

## Published GPS point

The hotel publishes the navigation point:

- `59.888312527778, 10.981993666667`

This point lies approximately `177.6 m` from the building centroid and appears to function as an access or routing point on the approach to the hotel.

It is retained as useful access evidence but is not applied as the canonical marker because the named building geometry provides stronger physical identity.

## Legacy-point assessment

The former coordinate `59.88685, 10.98411` was only `61.2 m` from the calculated building centroid and approximately `7.5 m` from Nominatim's representative point for the same way.

The old marker was therefore near the correct complex, unlike several earlier batch records. It is replaced because it lacked:

- a stable source object;
- a complete coordinate contract;
- an explicit relationship to the named building geometry;
- a distinction between the manor, hotel additions, access route and broader estate.

This production change is primarily a precision, geometry and provenance upgrade.

## Radius decision

The existing radius of `340 m` is retained to support gameplay coverage of:

- the main manor and hotel complex;
- the immediate park and approach landscape;
- the nearest parts of the historical estate environment.

The radius must not be interpreted as:

- the complete Losby forest property;
- the golf-course boundary;
- a cadastral parcel;
- the full network of sawmills, smallholdings and workers' housing;
- the exact extent of the mid-nineteenth-century manor.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| OSM way 819618193 | Named building-complex polygon | Primary applied geometry |
| Kartverket Address API | Official Losbyveien 270 point | Physical/address cross-check |
| Lørenskog municipality | Official manor, sawmill and estate history | Historical identity |
| Losby Gods history | Operator account of workers, owners, hunting and hotel conversion | Historical cross-check |
| Losby Gods contact page | Current Losbyveien 270 address | Address cross-check |
| Losby Gods directions | Published GPS point and Losbyveien 1 routing advice | Access evidence only |
| Losbyveien 1 address | Distant routing-hint address | Rejected as canonical |
| Legacy coordinate | Nearby point without contract | Replaced |

## Raw source material

The one-time source workflow persisted:

- `reports/akershus-coordinate-losby-gods-source-probe/geonorge-losbyveien-270-lorenskog.json`
- `reports/akershus-coordinate-losby-gods-source-probe/geonorge-losbyveien-1-lorenskog.json`
- `reports/akershus-coordinate-losby-gods-source-probe/nominatim-losby-gods.json`
- `reports/akershus-coordinate-losby-gods-source-probe/osm-losby-gods-bbox.xml`
- `reports/akershus-coordinate-losby-gods-source-probe/source-summary.txt`

The temporary workflow removed itself before the production diff was finalized.

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch4/losby_gods.json`
- `data/coordinate-evidence/akershus/historie/losby_gods.json`
- `reports/akershus-coordinate-losby-gods-production-2026-07-26.md`
- the five raw-source files listed above

## Next record

Akershus batch 4 is complete. Continue with the first unresolved record in the active coordinate manifest.
