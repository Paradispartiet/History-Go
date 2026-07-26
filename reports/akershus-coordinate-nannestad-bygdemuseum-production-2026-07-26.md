# Nannestad bygdemuseum coordinate production

Date: 2026-07-26

## Result

`nannestad_bygdemuseum` has been moved from an imprecise southwestern point to the deterministic centroid of the named museum building at Teiealleen 11.

- Previous coordinate: `60.217, 11.012`
- Applied coordinate: `60.21899976453861, 11.014497955277188`
- Displacement: approximately `261.7 m`
- Applied geometry: OpenStreetMap way `591392894`
- National building reference: `19214206`
- Official address: `Teiealleen 11, 2030 Nannestad`
- Kartverket identity: municipality `3238`, farm/use number `27/72`, address code `2320`
- Coordinate status: `verified_geometry`
- Coordinate role: `display_marker`
- Radius: `260 m`

## Canonical identity

The canonical marker represents the named Nannestad bygdemuseum building and its indoor collections.

The place identity includes:

- the museum exhibitions opened in 2007;
- Tore G. Solheim's financial gift, objects and interiors from Grindaker;
- Dr. Habberstad's reconstructed medical office;
- the recreated country store;
- craft and agricultural collections;
- the museum's role as a meeting place for the historical society, schools and local organisations.

The nearby outdoor stone collection and Ekerjordet are part of the visitor context but are not the canonical building.

## Building geometry

OpenStreetMap way `591392894` is:

- named `Nannestad bygdemuseum`;
- tagged `building=civic`;
- tagged `tourism=museum`;
- linked to national building reference `19214206`;
- represented by a 33-node closed polygon including the repeated closing node.

The deterministic polygon centroid is:

- Latitude: `60.21899976453861`
- Longitude: `11.014497955277188`

Nominatim independently resolves the same way at `60.2189826, 11.0144747`, approximately `2.3 m` from the calculated centroid.

## Official address

Nannestad municipality publishes `Teiealleen 11` as the museum address.

Kartverket returned exactly one address object:

- Municipality: `3238 Nannestad`
- Farm/use number: `27/72`
- Address code: `2320`
- Postal code: `2030`
- Location verified: `true`
- Representation point: `60.21893661547271, 11.014694263764905`

The official address point lies approximately `12.9 m` from the applied building centroid.

## Museum history

Nannestad municipality documents the museum as established in 2007 through a financial gift from Tore G. Solheim. Solheim also contributed objects, furniture and interiors from his home farm Grindaker in Bjerke parish.

Nannestad historical society documents twelve years of planning and the formal opening of the exhibitions on 8 May 2007.

The museum's fixed collections include:

- three Grindaker interior rooms;
- Dr. Habberstad's medical office;
- a country store with material from B. Størdal in Maura;
- a craft collection;
- agricultural tools in the basement;
- an outdoor stone collection.

The place is therefore interpreted as a history of collecting and institutional memory, not merely as a container for old objects.

## Nearby-object assessment

The materialized map extract distinguishes:

- the named museum building;
- a separate unnamed civic building 17.3 m away;
- the official Teiealleen 11 address point;
- the artwork `Steiner i Nannestad`;
- Ekerjordet park;
- nearby retail, government and transport functions.

This confirms that the named museum polygon is the correct canonical object rather than a generic town-centre or park point.

## Legacy-point assessment

The previous coordinate `60.217, 11.012` lies approximately `261.7 m` southwest of the museum-building centroid.

It is replaced because it cannot be tied to the museum polygon or the verified Teiealleen 11 address.

## Radius decision

The radius remains `260 m` to support gameplay around the museum, the immediate visitor environment and the nearby public space.

It must not be interpreted as:

- the museum property boundary;
- a combined museum and park polygon;
- an event area;
- a heritage-protection zone;
- a footprint for the outdoor collections.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| OSM way 591392894 | Named museum-building polygon | Primary applied geometry |
| Kartverket, Teiealleen 11 | Verified official address | Address cross-check |
| Nannestad municipality | Museum identity, address and collections | Primary institutional source |
| Nannestad historical society | Planning and 8 May 2007 opening | Local historical source |
| Nominatim | Named-object and polygon cross-check | Secondary geometry check |
| Materialized area map | Separates museum from nearby objects | Context geometry |
| Legacy coordinate | Imprecise southwestern point | Rejected |

## Raw source material

The one-time source workflow persisted:

- `reports/akershus-coordinate-nannestad-bygdemuseum-source-probe/osm-way-591392894-full.xml`
- `reports/akershus-coordinate-nannestad-bygdemuseum-source-probe/nominatim-nannestad-bygdemuseum.json`
- `reports/akershus-coordinate-nannestad-bygdemuseum-source-probe/geonorge-teiealleen-11-nannestad.json`
- `reports/akershus-coordinate-nannestad-bygdemuseum-source-probe/osm-nannestad-bygdemuseum-bbox.xml`
- `reports/akershus-coordinate-nannestad-bygdemuseum-source-probe/source-summary.txt`

The temporary workflow removed itself before the production diff was finalized.

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch5/nannestad_bygdemuseum.json`
- `data/coordinate-evidence/akershus/historie/nannestad_bygdemuseum.json`
- `reports/akershus-coordinate-nannestad-bygdemuseum-production-2026-07-26.md`
- the five raw-source files listed above

## Batch status

Nannestad bygdemuseum is the final record in the active Akershus batch-5 sequence. The batch is complete after this pull request is validated and merged.
