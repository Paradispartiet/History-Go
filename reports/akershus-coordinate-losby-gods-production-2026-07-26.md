# Losby Gods coordinate production

## Result

- Place: `losby_gods`
- Legacy coordinate: `59.88685, 10.98411`
- Retained production coordinate: `59.88680008666081, 10.983017201931101`
- Original displacement from legacy: approximately `61.2 m`
- Coordinate change in this pass: `0 m`
- Radius: retained at `340 m`
- Status: `verified_geometry`
- Coordinate Source Contract role: `area_anchor`
- Locator type: `institutional_area`
- Accuracy: `semantic_anchor`
- Applied geometry: OpenStreetMap way `819618193`
- National building reference: `12444672`
- Official address: `Losbyveien 270, 1475 Finstadjordet`

## Why the coordinate is retained

The 2026-07-26 production already moved the nearby uncontracted legacy point approximately 61.2 metres west to the deterministic centroid of the named Losby Gods building geometry. That geometry and its address controls remain correct.

This pass does not invent a second movement. It repairs the Coordinate Source Contract classification. `historic_site` requires a historical-map or manual-research primary coordinate source, while the applied point is reproducible OSM geometry for the current named manor and hotel complex. The record is therefore classified as `institutional_area` with `osm`, `semantic_anchor`, `area_anchor` and `verified_geometry`.

Historical sources continue to define the much broader Losby estate, forestry, sawmill, worker, hunting and recreation context. The present-day polygon is a physical anchor for that institution and landscape, not an exact historical-estate boundary.

## Canonical identity

The canonical record represents the named manor and hotel complex as the physical anchor for the wider historical Losby estate.

The historical place includes several layers:

- sawmills and timber trade from the sixteenth century;
- Losby, Østmork and Vestmork as a larger estate system;
- smallholdings, sawmill workers, forest workers and servants;
- Christiania merchants and estate owners;
- the mid-nineteenth-century hunting lodge and manor building;
- hunting, recreation and elite hospitality;
- forestry modernization;
- restoration and hotel expansion in 1997–1999.

The canonical point does not represent the full forest property, every sawmill site, every smallholding or an exact nineteenth-century building footprint.

## Geometry and address basis

OpenStreetMap way `819618193` is named `Losby Gods`, tagged `building=hotel` and `tourism=hotel`, and linked to national building reference `12444672`.

Its deterministic polygon centroid is:

- Latitude: `59.88680008666081`
- Longitude: `10.983017201931101`

Kartverket returns one exact address object for Losbyveien 270:

- Municipality: `3222 Lørenskog`
- Farm/use number: `91/16`
- Address code: `6150`
- Postal code: `1475`
- Representation point: `59.88686319648732, 10.983615156991803`

The official address point lies approximately `34.1 m` from the retained centroid.

Nominatim independently resolves the same OSM way as Losby Gods with representative point `59.8868735, 10.9839841`. The OSM polygon includes the older manor component and later hotel additions, so the centroid represents the current named complex rather than the exact centre of the original manor wing.

## Historical basis

Lørenskog municipality documents the oldest hotel section as a mid-nineteenth-century hunting lodge within a broader history of sawmills, forestry, smallholdings and workers.

Losby Gods' own historical material documents forestry and sawmill activity, smallholders and servants, Christiania owners, hunting and hospitality, and the later restoration and hotel conversion.

These sources support the area-anchor model: one stable current institution physically anchors a much larger historical economic and social landscape.

## Routing and access controls

Losby Gods publishes Losbyveien 270 as its physical address. The hotel also recommends Losbyveien 1 as a routing hint for navigation systems; Kartverket places that address approximately `3.7 km` from the retained centroid, so it remains explicitly rejected as canonical.

The hotel's published GPS point `59.888312527778, 10.981993666667` lies approximately `177.6 m` from the retained centroid and is treated only as an access and navigation point.

Public access follows current hotel, event, park, road and trail conditions. Hotel interiors, event areas, golf areas, operational spaces and private estate or forestry land may have separate restrictions.

## Radius decision

The existing radius of `340 m` is retained to cover the main complex, park and nearest historical estate environment at gameplay scale.

It must not be interpreted as:

- the full Losby forest property;
- the golf-course boundary;
- a cadastral parcel;
- a heritage polygon;
- the full sawmill, smallholding or worker-housing network;
- the exact extent of the mid-nineteenth-century manor;
- an access guarantee.

## Files

- `data/places/historie/akershus/places_historie_akershus_batch4/losby_gods.json`
- `data/coordinate-evidence/akershus/historie/losby_gods.json`
- `reports/akershus-coordinate-losby-gods-source-probe/source-summary.txt`
- `reports/akershus-coordinate-losby-gods-production-2026-07-26.md`

The previously persisted raw Kartverket, Nominatim and OSM probe files remain unchanged as underlying evidence.

## Next manifest item

Akershus batch 4 remains complete. Continue with the first unresolved record in the active coordinate manifest after this contract migration passes review and data checks.
