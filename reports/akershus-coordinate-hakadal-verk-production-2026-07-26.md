# Hakadal Verk coordinate production

Date: 2026-07-26

## Result

`hakadal_verk` has been moved from an unresolved point southwest of the historic works to the deterministic centroid of the named surviving industrial-building geometry on the Hakadal Verk site.

- Previous coordinate: `60.12083, 10.82278`
- Applied coordinate: `60.122400847631, 10.824335391711`
- Displacement: approximately `194.8 m`
- Applied source object: OpenStreetMap way `249239760`
- National building reference: `151094600`
- Coordinate role: `area_anchor`
- Coordinate status: `verified_geometry`
- Radius: `360 m`

## Canonical identity

The place represents the former Hakadal ironworks and the coherent works, waterpower, worker, school and estate environment that developed around it.

It does not represent:

- the modern hamlet generically;
- Hakadal railway station;
- one exact sixteenth-century rennverk structure;
- a reconstructed furnace or hammer location;
- an exact property or heritage polygon.

## Historical basis

Store norske leksikon identifies Hakadal Verk as a former ironworks established around 1550 and closed in 1869. It describes surviving dams, falls and industrial buildings, including the main building, worker housing, school and crofter communities.

Nittedal Historielag documents the same works history in greater local detail: ore from Grua, royal direction and privileges, multiple owner periods, forest and charcoal dependence, the Greveveien transport system and closure in 1869. The historielag also states that nearly all direct traces of the actual iron production have disappeared apart from the main building and the old iron store.

SNL's separate rennverk article documents an earlier Hakadal production phase in 1541–1545 and later attempts. This reinforces the need to avoid treating one surviving building as the exact location of every production phase.

## Geometry basis

A one-time source-materialization workflow fetched the full OpenStreetMap geometry for way `249239760` and the corresponding Nominatim lookup.

The OSM way contains nine nodes and is tagged:

```json
{
  "building": "industrial",
  "historic": "works",
  "name": "Hakadal verk",
  "ref:bygningsnr": "151094600"
}
```

The polygon centroid was calculated directly from the raw node geometry:

- Latitude: `60.122400847631`
- Longitude: `10.824335391711`

Nominatim independently resolves the same object as:

- name: `Hakadal verk`
- category: `historic`
- type: `works`
- OSM type/id: `way 249239760`
- point: `60.1224095, 10.8243370`
- context: Sagstuveien, Hakadals verk, Løvstad, Nittedal, Akershus, 1488

The Nominatim point is about one metre from the calculated polygon centroid.

## Anchor decision

The named industrial-building geometry is used as the physical anchor because it provides:

1. a stable, named same-site object;
2. an explicit historic-works classification;
3. a national building reference;
4. reproducible raw geometry;
5. close agreement between calculated centroid and Nominatim representation point;
6. a defensible connection to the historically documented surviving works environment.

The building is not identified as the original rennverk, furnace or hammer. It anchors the wider historic environment without claiming false production-site precision.

## Radius decision

The existing radius of `360 m` is retained. At gameplay scale it covers the nearest parts of the documented works environment, including surviving buildings, dams, falls, worker and school history and the immediate estate landscape.

The radius must not be interpreted as:

- an exact former works boundary;
- a cadastral property polygon;
- an archaeological protection zone;
- a claim that every historic component lies inside the circle.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| Store norske leksikon – Hakadal Verk | Authoritative works identity, chronology and surviving environment | Supports the named site and area representation |
| Nittedal Historielag – Hakadal verk | Detailed local production, ownership and survival history | Supports same-site anchor and representation limits |
| OpenStreetMap way 249239760 | Named historic industrial-building polygon | Primary applied physical geometry |
| Nominatim lookup for way 249239760 | Independent object identity and point cross-check | Cross-check only; canonical uses calculated polygon centroid |
| Store norske leksikon – rennverk | Earlier production-phase context | Prevents false exact-site interpretation |
| Legacy coordinate | Unresolved southwest point | Rejected |

## Changed files

- `data/places/naeringsliv/akershus/hakadal_verk/hakadal_verk.json`
- `data/coordinate-evidence/akershus/naeringsliv/hakadal_verk.json`
- `reports/akershus-coordinate-hakadal-verk-production-2026-07-26.md`
- `reports/akershus-coordinate-hakadal-verk-source-probe/osm-way-249239760-full.xml`
- `reports/akershus-coordinate-hakadal-verk-source-probe/nominatim-way-249239760.json`
- `reports/akershus-coordinate-hakadal-verk-source-probe/source-summary.txt`

The temporary probe workflow removed itself before the production diff was finalized.

## Sources

- https://snl.no/Hakadal_Verk
- https://snl.no/rennverk
- https://www.nittedal-historielag.no/hakadalverk/
- https://www.openstreetmap.org/way/249239760

## Next record

Continue with `nesodden_kirke`, the next place in the active Akershus batch-4 sequence.
