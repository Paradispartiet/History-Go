# Værne kloster – coordinate production

Date: 2026-07-27

## Result

- Place: `varne_kloster`
- Previous coordinate: `59.3609, 10.7269`
- Applied coordinate: `59.39354, 10.67424`
- Displacement: approximately `4,697.8 m` northwest
- Radius: `300 m` retained
- Status: `verified_geometry`
- Role: `monastery_manor_core_anchor`
- Source object: `osm-way:124839227;wikidata:Q4994287;riksantikvaren-kulturminne:9570`
- Year: `1190`, retained only as an approximate 1190s period anchor

## Identity resolution

The canonical object is the named Værne Kloster farmyard and manor core at Klosterveien 91. The site combines several historical layers:

- former royal estate
- Norway's only Knights Hospitaller monastery and hospital
- post-Reformation manor and estate
- present active private farm

The coordinate does not represent the complete historical monastery, estate, modern property or protected landscape.

## Applied source

OpenStreetMap way `124839227` maps the named farmyard and manor area. Its representative point is:

- `59.39354, 10.67424`

Wikidata `Q4994287` links the same site to OSM way `124839227` and Kulturminne ID `9570`. Its entity coordinate is approximately 109.4 metres west of the applied area representative point.

Lokalhistoriewiki and the Brønnøysund Register Centre identify the current site at Klosterveien 91, 1570 Dilling. The farm remains an active private property.

## Historical and dating decision

Store norske leksikon describes Værne as a royal estate where King Sverre established Norway's only Knights Hospitaller monastery and hospital in the 1190s. Local-history sources preserve broader uncertainty and allow for a later foundation.

The existing numeric field is therefore retained as:

- `year: 1190`
- interpretation: approximate 1190s period anchor, not an exact foundation year

The monastery was closed in 1532. The site later became a large manor and estate. Parts of the present three-wing main building date from around 1680.

## Rejected candidates

- Legacy point `59.3609, 10.7269`: approximately 4.7 km southeast of the named site and without a source-object identity.
- OSM farm-locality node `6241620634`: valid cross-check, but the farmyard polygon gives the stronger physical core.
- Værne Kloster bus stop: access infrastructure approximately 250 m southwest.
- One monastery wall fragment: too narrow for the combined monastery, hospital, manor and estate record.
- The protected landscape polygon: approximately 5,473 decares and not a point-coordinate substitute.
- An invented centroid for the historical estate: not applied because the estate changed over time.

## Radius and access decision

The existing 300 m gameplay radius is retained. It covers the manor house, named farmyard and immediate monastery-core environment.

The radius is explicitly not:

- exact building or monastery-remain geometry
- the current property or historical estate boundary
- the landscape-protection polygon
- the full agricultural and monastery landscape

Værne Kloster is an active private farm. The coordinate identifies the place but does not imply access to the farmyard, buildings or archaeological remains. Any gameplay task must use lawful public roads and viewpoints.

## Production files

- `data/places/historie/ostfold/places_historie_ostfold_batch3/varne_kloster.json`
- `data/coordinate-evidence/ostfold/historie/varne_kloster.json`
- `reports/ostfold-coordinate-varne-kloster-source-probe/source-summary.json`
- `reports/ostfold-coordinate-varne-kloster-production-2026-07-27.md`

## Queue

The next active manifest entry is `onsoy_kirke`.
