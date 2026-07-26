# Aurskog-Høland bygdetun coordinate production

Date: 2026-07-26

## Result

`aurskog_holand_bygdetun` has been moved from an incorrect southeastern point to the named museum point inside the multi-building tun at Hemnes.

- Previous coordinate: `59.7194, 11.4598`
- Applied coordinate: `59.7230815, 11.452415`
- Displacement: approximately `582.2 m`
- Applied object: OpenStreetMap node `6593405629`
- Official address: `Tønnebergveien 9, 1970 Hemnes`
- Kartverket identity: municipality `3226`, farm/use number `120/1`, address code `7060`
- Coordinate status: `verified_historical_source`
- Coordinate role: `area_anchor`
- Radius: `300 m`

## Canonical identity

The canonical marker represents the entire Aurskog-Høland bygdetun, not one selected historic building.

The site contains buildings moved from across the municipality and is used to interpret:

- rural domestic life;
- crofts and farm labour;
- school history;
- traditional food and crafts;
- migration and forest-Finn history;
- early local museum and preservation work.

## Why the museum point is applied

OSM node `6593405629` is named `Aurskog-Høland bygdetun`, tagged `tourism=museum`, and lies at `59.7230815, 11.452415`.

The materialized map extract shows at least nine older tun buildings within 70 metres. Most are tagged as civic buildings and carry national building references, but none is named reliably enough to identify it as Kinnestadbygningen, Falletstua or another canonical main building.

Selecting one of those centroids would create false building precision. The named museum point is therefore the more faithful area anchor.

## Official address

MiA publishes `Tønnebergveien 9, 1970 Hemnes`.

Kartverket returned exactly one address object:

- Municipality: `3226 Aurskog-Høland`
- Farm/use number: `120/1`
- Address code: `7060`
- Representation point: `59.72358315309172, 11.451705365686111`
- Distance from applied museum point: approximately `68.5 m`

The address verifies the site but is not treated as the centroid of the entire museum tun.

## Museum chronology

The current place record retains `1964` as the institutional establishment year. Aurskog-Høland municipality explicitly identifies the bygdetun as established in 1964 with roots in fanejunker August Krogh's collections.

MiA documents an earlier physical museum layer:

- Krogh bought Falletstua around 1930 to preserve it locally;
- after his death, the building and collection were given to the municipality;
- Falletstua was erected at Hemnes in 1956;
- Søndre Høland bygdetun opened with Falletstua as its foundation.

The canonical narrative therefore distinguishes the museum site’s 1956 roots from the present institution’s 1964 establishment year.

## Building and collection scope

MiA describes buildings from across Aurskog-Høland and roughly 300 years of regional building history. The collection includes crofters' cottages, brewhouse, barn, cowshed, stable, storehouses, drying house, schoolhouse and the Kinnestad main house from Setskog.

The marker represents this collective site and does not claim to identify one building.

## Legacy-point assessment

The previous coordinate `59.7194, 11.4598` lies approximately `582.2 m` southeast of the named museum point and outside the documented building cluster.

This is a physical correction, not merely a provenance upgrade.

## Radius decision

The radius remains `300 m` to support gameplay coverage of the museum grounds, immediate access and the nearby historical environment.

It must not be interpreted as:

- a cadastral parcel;
- a museum ownership boundary;
- a heritage-protection polygon;
- a combined building footprint;
- a precise boundary for the historical collections.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| OSM node 6593405629 | Named museum-site point | Primary applied area anchor |
| Kartverket, Tønnebergveien 9 | Official visitor address | Address cross-check |
| MiA – Finn oss | Current museum address | Official identity cross-check |
| MiA – Om oss / Bygningene | Multi-building site and collection scope | Primary site identity |
| MiA – Falletstua | Early museum and preservation history | Historical chronology |
| Aurskog-Høland municipality | 1964 establishment and August Krogh | Institutional chronology |
| Materialized site map | Unnamed tun-building cluster | Geometry and negative-name evidence |
| Legacy coordinate | Incorrect southeastern point | Rejected |

## Raw source material

The one-time source workflow persisted:

- `reports/akershus-coordinate-aurskog-holand-bygdetun-source-probe/osm-node-6593405629.xml`
- `reports/akershus-coordinate-aurskog-holand-bygdetun-source-probe/nominatim-aurskog-holand-bygdetun.json`
- `reports/akershus-coordinate-aurskog-holand-bygdetun-source-probe/geonorge-tonnebergveien-9-hemnes.json`
- `reports/akershus-coordinate-aurskog-holand-bygdetun-source-probe/osm-aurskog-holand-bygdetun-bbox.xml`
- `reports/akershus-coordinate-aurskog-holand-bygdetun-source-probe/source-summary.txt`

The temporary workflow removed itself before the production diff was finalized.

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch5/aurskog_holand_bygdetun.json`
- `data/coordinate-evidence/akershus/historie/aurskog_holand_bygdetun.json`
- `reports/akershus-coordinate-aurskog-holand-bygdetun-production-2026-07-26.md`
- the five raw-source files listed above
