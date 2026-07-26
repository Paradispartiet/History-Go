# Rælingen bygdetun coordinate production

Date: 2026-07-26

## Result

`raelingen_bygdetun` has been moved from an incorrect residential-area point west of Fjerdingby to Kartverket's official address point for Rælingen bygdetun at Kirkevegen 20.

- Previous coordinate: `59.9261, 11.0608`
- Applied coordinate: `59.92032136910839, 11.081489629785487`
- Displacement: approximately `1,319.9 m`
- Official address: `Kirkevegen 20, 2008 Fjerdingby`
- Kartverket identity: municipality `3224`, farm/use number `99/36`, address code `13708`
- Coordinate status: `verified_historical_source`
- Coordinate role: `area_anchor`
- Radius: `240 m`

## Canonical identity

The canonical record represents Rælingen bygdetun on the historic Søndre Fjerdingby farm.

The site includes:

- the main house built in 1814;
- the storehouse from the 1850s;
- remains of an earlier house, probably from the seventeenth century;
- other museum buildings and collections;
- the large courtyard oak;
- the nearest parts of the old royal road, church hill and cultural landscape.

The record is not limited to one building and the applied point is not claimed to be the geometric centre of the 1814 main house.

## Official object history

Rælingen municipality's object entry for Søndre Fjerdingby farm identifies the place as Rælingen bygdetun and explicitly gives the object address as Kirkevegen 20.

The municipality documents that:

- the present main house was built in 1814;
- the storehouse dates from the 1850s;
- remains of an older house survive below the main house;
- the old royal road crossed the farmyard;
- Fjerdingby was a religious, route and social centre;
- public announcements were read at the church hill;
- the farm served as a court room and local arrest.

The site's identity is therefore broader than a conventional open-air museum. It represents a local system of farming, transport, church life, justice, public communication and social gathering.

## Address conflict resolution

Two addresses appeared in the source material:

1. `Kirkevegen 20`
2. `Bjørnholthagan 6`

The conflict was resolved as follows:

- the municipality's specific object entry for Søndre Fjerdingby farm gives Kirkevegen 20;
- Rælingen historielag gives Kirkevegen 20 as both postal and visitor address;
- Visit Greater Oslo gives Kirkevegen 20 for the attraction;
- Kartverket returns an exact address object for Kirkevegen 20;
- named OSM museum and historic-farm objects lie at the same tun;
- Bjørnholthagan 6 appears in the municipality site's general contact footer and lies about 1,039.2 metres from the applied point.

Bjørnholthagan 6 is therefore treated as a municipal contact address rather than the physical location of the bygdetun.

## Kartverket address basis

Kartverket returned exactly one object for Kirkevegen 20:

- Municipality: `3224 Rælingen`
- Farm/use number: `99/36`
- Address code: `13708`
- Postal code: `2008`
- Representation point: `59.92032136910839, 11.081489629785487`

This point is used as a physical area anchor for the whole museum farmyard.

## Named OSM cross-checks

Nominatim and the local OSM extract identify three named objects at the actual site:

- historic farm node `1926783972` at `59.9203956, 11.0817869`;
- museum node `6593405625` at `59.9203765, 11.0818226`;
- information-board node `2311812289` at `59.9202200, 11.0816566`.

Their distances from the applied address point are approximately:

- historic farm: `18.5 m`;
- museum: `19.5 m`;
- information board: `14.6 m`.

The agreement confirms that the address point lies within the named museum and historic-farm site.

## Building-geometry assessment

A second source probe fetched the complete OSM map extract around the actual tun and calculated nearby building centroids.

The extract contains named buildings including:

- Landhandel;
- Nistua;
- Stallen skolestue;
- Svingen;
- Rælingen kirke;
- several unnamed museum and farm buildings.

The official address point lies only a few metres from one unnamed building footprint, while the named museum point lies near Landhandel. The source material does not identify one OSM way with sufficient certainty as the 1814 main house.

For that reason the production model deliberately uses the official address point as an `area_anchor` instead of assigning a possibly incorrect building way as the main-house centroid.

## Legacy-point assessment

The former coordinate `59.9261, 11.0608` lies approximately `1,319.9 m` west of the applied address point.

The old point is surrounded by residential addresses and is not associated with:

- Kirkevegen 20;
- Søndre Fjerdingby farm;
- the named museum point;
- the named historic-farm point;
- Rælingen church and the historic Fjerdingby cultural landscape.

This is therefore a major physical correction, not only a metadata upgrade.

## Radius decision

The existing radius of `240 m` is retained to support gameplay coverage of:

- the museum buildings and farmyard;
- the courtyard tree and garden remains;
- the nearest royal-road trace;
- the church hill and relationship to Rælingen church;
- the immediate cultural landscape.

The radius must not be interpreted as:

- a cadastral boundary;
- a formal cultural-environment polygon;
- the exact historic extent of Søndre Fjerdingby farm;
- proof that every road, court or church-related function lay inside the circle.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| Rælingen municipality object 400058 | Official object identity, address and history | Primary historical identity |
| Kartverket Address API | Official representation point for Kirkevegen 20 | Primary applied physical anchor |
| Rælingen historielag | Current operator/visitor address and detailed house history | Address and identity cross-check |
| Visit Greater Oslo | Independent attraction address and site description | Visitor cross-check |
| OSM museum node 6593405625 | Named museum POI | Physical cross-check |
| OSM historic-farm node 1926783972 | Named historic farm | Identity cross-check |
| Bjørnholthagan 6 | General municipal contact address | Rejected |
| Legacy coordinate | Incorrect residential-area point | Rejected |

## Raw source material

The source workflows persisted:

- `reports/akershus-coordinate-raelingen-bygdetun-source-probe/geonorge-kirkevegen-20.json`
- `reports/akershus-coordinate-raelingen-bygdetun-source-probe/geonorge-bjornholthagan-6.json`
- `reports/akershus-coordinate-raelingen-bygdetun-source-probe/nominatim-raelingen-bygdetun.json`
- `reports/akershus-coordinate-raelingen-bygdetun-source-probe/osm-node-1926783972.xml`
- `reports/akershus-coordinate-raelingen-bygdetun-source-probe/osm-node-6593405625.xml`
- `reports/akershus-coordinate-raelingen-bygdetun-source-probe/osm-node-2311812289.xml`
- `reports/akershus-coordinate-raelingen-bygdetun-source-probe/osm-actual-raelingen-bygdetun-bbox.xml`
- `reports/akershus-coordinate-raelingen-bygdetun-source-probe/source-summary.txt`
- `reports/akershus-coordinate-raelingen-bygdetun-source-probe/building-summary.txt`

The temporary workflows removed themselves before the production diff was finalized.

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch4/raelingen_bygdetun.json`
- `data/coordinate-evidence/akershus/historie/raelingen_bygdetun.json`
- `reports/akershus-coordinate-raelingen-bygdetun-production-2026-07-26.md`
- the raw-source files listed above

## Next record

Continue with `losby_gods`, the next place in the active Akershus batch-4 sequence.
