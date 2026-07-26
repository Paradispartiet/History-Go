# Seiersten skanse coordinate production

Date: 2026-07-26

## Result

`seiersten_skanse` has been moved from an unresolved point east of the fortification to the named military site for Øvre Seiersten skanse.

- Previous coordinate: `59.6719, 10.6471`
- Applied coordinate: `59.6726278, 10.6396722`
- Displacement: approximately `424.8 m`
- Applied source object: OpenStreetMap node `6463616338`
- SSR place number: `300433`
- Coordinate status: `verified_historical_source`
- Coordinate role: `area_anchor`
- Radius: `260 m`

## Canonical identity

The canonical record represents the protected closed infantry redoubt built at Seiersten in 1898–1900 as part of the landward defence of Oscarsborg and the Drøbak Sound approach.

It does not represent:

- the information map named Seiersten skanse east of the redoubt;
- Follo museum or the wider recreation area;
- Veisvingbatteriet, which is a separate artillery battery;
- Oscarsborg Fortress itself;
- the complete legal preservation polygon for all Seiersten defence works.

## Official historical identity

The legal protection regulation for Oscarsborg Fortress and associated installations identifies Seiersten skanse as inventory number `1002`.

The regulation states:

- original function: infantry redoubt;
- construction period: `1898–1900`;
- protected scope: the entire installation, including the exteriors and interiors of the shelters;
- cadastral identity: farm/use number `70/1`.

The same regulation separately inventories:

- ammunition magazine 31;
- Veisvingbatteriet, inventory 1001;
- Seiersten skanse, inventory 1002;
- the southern and northern connecting lines, inventory 1003 and 1004.

This legal object separation is important: the canonical place must anchor the infantry redoubt itself rather than collapse the whole defence system into one marker.

## Physical and tactical form

Skiforeningen describes Seiersten as a closed redoubt built in 1898–1900 with:

- approximately 300 metres of combined firing line;
- firing sectors toward the fjord, Drøbak and the inland approaches;
- positions for infantry and field guns;
- 24 shelters;
- ammunition storage;
- mobilization in 1905 and a short period of manning during the First World War;
- no combat use.

The place therefore represents a real landward fortification with earthworks, shelters and tactical orientation, not merely a commemorative point.

## Applied OSM/SSR anchor

OpenStreetMap node `6463616338` is:

- named `Øvre Seiersten skanse`;
- tagged `landuse=military`;
- linked to SSR place number `300433`;
- located at `59.6726278, 10.6396722`.

This is the strongest available physical site identity because it combines a named fortification object, military classification and a national place-name reference.

A co-located tourism object, node `1763395772`, is named `Seiersten Festning` and lies about 1.7 metres from the applied point. It supports visitor identity, but is marked `fixme=incomplete` and is therefore secondary to the SSR-linked military node.

## Rejected information point

OpenStreetMap node `1793750671` is named `Seiersten skanse`, but its tags are:

```json
{
  "tourism": "information",
  "information": "map"
}
```

It lies at `59.6726272, 10.6419304`, approximately `126.8 m` east of the applied military point. It represents an information map and must not be used as the canonical coordinate for the redoubt itself.

## Legacy-point assessment

The former coordinate `59.6719, 10.6471` lies approximately `424.8 m` east of the applied military point.

It had no source contract and could not be tied to:

- the protected infantry redoubt;
- the SSR-linked military site;
- the co-located attraction point;
- an exact defence-work component.

The correction is therefore a substantial physical relocation rather than only a provenance upgrade.

## Veisvingbatteriet boundary

Veisvingbatteriet is a separately inventoried artillery battery, constructed in 1894–1896 and located roughly 390 metres southwest of Seiersten skanse.

It belongs to the same broader defence system but must remain distinct from the infantry-redoubt record. The canonical marker and 260-metre gameplay radius are not intended to absorb Veisvingbatteriet as though it were part of the same physical object.

## Radius decision

The existing radius of `260 m` is retained to support gameplay coverage of the closed infantry redoubt, its nearest shelters, earthworks and connection traces.

The radius must not be interpreted as:

- the exact legal protection boundary;
- the complete historical firing sector;
- the full southern and northern connecting lines;
- the location of Veisvingbatteriet;
- a cadastral parcel.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| Lovdata protection regulation | Official legal identity, dates, scope and inventory separation | Establishes what the marker must represent |
| OSM node 6463616338 / SSR 300433 | Named military site | Primary applied area anchor |
| OSM node 1763395772 | Co-located visitor attraction | Secondary identity cross-check |
| OSM node 1793750671 | Information map east of site | Explicitly rejected as canonical |
| Skiforeningen | Detailed physical, tactical and mobilization history | Supports site interpretation and radius |
| Lokalhistoriewiki | Independent local site and land-history cross-check | Contextual support |
| Legacy coordinate | Unresolved eastern point | Rejected |

## Raw source material

The one-time source workflow persisted:

- `reports/akershus-coordinate-seiersten-skanse-source-probe/osm-node-6463616338.xml`
- `reports/akershus-coordinate-seiersten-skanse-source-probe/osm-node-1763395772.xml`
- `reports/akershus-coordinate-seiersten-skanse-source-probe/osm-node-1793750671.xml`
- `reports/akershus-coordinate-seiersten-skanse-source-probe/nominatim-seiersten-objects.json`
- `reports/akershus-coordinate-seiersten-skanse-source-probe/osm-seiersten-bbox.xml`
- `reports/akershus-coordinate-seiersten-skanse-source-probe/source-summary.txt`

The temporary workflow removed itself before the production diff was finalized.

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch4/seiersten_skanse.json`
- `data/coordinate-evidence/akershus/historie/seiersten_skanse.json`
- `reports/akershus-coordinate-seiersten-skanse-production-2026-07-26.md`
- the six raw-source files listed above

## Sources

- https://lovdata.no/dokument/LF/forskrift/2014-04-09-1986
- https://www.skiforeningen.no/utimarka/omrader/follomarka/steder/seiersten/
- https://lokalhistoriewiki.no/wiki/Seiersten_(Frogn)
- https://www.openstreetmap.org/node/6463616338

## Next record

Continue with `raelingen_bygdetun`, the next place in the active Akershus batch-4 sequence.
