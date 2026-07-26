# Frogner gamle kirke coordinate production

Date: 2026-07-26

## Result

`frogner_gamle_kirke` has been moved from an incorrect point north in Frogner village to the deterministic centroid of the named medieval church-building geometry.

- Previous coordinate: `60.0247, 11.1035`
- Applied coordinate: `60.020581663654, 11.104823849509`
- Displacement: approximately `463.8 m`
- Applied geometry: OpenStreetMap way `558572036`
- National building reference: `150263921`
- Official address: `Gamle Kirkeveien 19, 2016 Frogner`
- Kartverket identity: municipality `3205`, farm/use number `274/18`, address code `18027`
- Coordinate status: `verified_geometry`
- Coordinate role: `display_marker`
- Radius: `220 m`

## Canonical identity

The canonical record represents the standing medieval stone church known as Frogner gamle kirke.

It does not represent:

- Frogner village generically;
- the separate Frogner church built in 1925;
- the geometric centre of the shared cemetery;
- the entire historic Frogner farm landscape;
- an exact heritage-protection polygon.

## Medieval, fire and restoration history

Lillestrøm municipality describes Frogner gamle kirke as a stone long church from around 1180. The church burned in 1918. The masonry was repaired in 1936, floor and roof were added in 1948, and the restoration was completed in 1977.

Frogner parish describes the building more precisely as a small medieval stone church from the late twelfth century or around 1200, with rectangular nave and a lower, narrower choir. The building contains traces of medieval alterations and lies beside the pilgrimage route through Romerike.

Norges Kirker documents the 1918 fire, the surviving medieval masonry, later repairs and the rune inscription exposed by the fire. The inscription has been interpreted as a prayer for the builder and patron and supports a late-twelfth-century or around-1200 dating.

## Old-church geometry

OpenStreetMap way `558572036` is:

- named `Frogner gamle kirke`;
- tagged `building=church`;
- tagged `heritage=yes`;
- tagged `start_date=1180`;
- linked to national building reference `150263921`;
- linked to Wikidata `Q7590357`;
- represented by a nine-node closed polygon.

The deterministic polygon centroid is:

- Latitude: `60.020581663654`
- Longitude: `11.104823849509`

Nominatim independently resolves the same way as Frogner gamle kirke at `60.0205948, 11.1048387` with the complete polygon.

## Official old-church address

Kartverket returned exactly one object for Gamle Kirkeveien 19:

- Municipality: `3205 Lillestrøm`
- Farm/use number: `274/18`
- Address code: `18027`
- Postal code: `2016`
- Representation point: `60.02059555351358, 11.104967237227159`

The address point lies approximately `8.1 m` from the applied old-church centroid.

## Separation from the 1925 church

The separate Frogner church is OpenStreetMap way `558572035`:

- name: `Frogner kirke`;
- start date: `1925`;
- national building reference: `150262828`;
- Wikidata: `Q7590463`;
- calculated centroid: `60.020001105527, 11.105715271970`.

It lies approximately `81.4 m` southeast of the old church.

Kartverket returned exactly one object for Gamle Kirkeveien 21 at `60.020008126728285, 11.105755353009377`. This point lies `2.4 m` from the new church and `82.1 m` from the old church.

The two buildings therefore have distinct:

- geometries;
- official address numbers;
- national building references;
- Wikidata identities;
- construction periods;
- physical positions.

Gamle Kirkeveien 21 and way `558572035` are explicitly rejected as canonical for this record.

## Legacy-point assessment

The former coordinate `60.0247, 11.1035` lies approximately `463.8 m` north of the old church centroid.

The old point was closer to the northern village area than to either church building and had no source contract. This is a substantial physical correction, not merely a metadata upgrade.

## Shared church-site context

The raw local map extract shows:

- the medieval church;
- the 1925 church;
- a shared graveyard/cemetery landscape;
- Gamle Kirkeveien;
- nearby Frogner farm identities;
- the Romeriksleden pilgrimage route.

The later church is retained as an important historical layer inside the gameplay radius. It is not collapsed into the same physical object.

## Radius decision

The existing radius of `220 m` is retained to cover:

- the medieval church;
- the shared cemetery landscape;
- the separate 1925 church as a later layer;
- the nearest pilgrimage-route and farm-setting context.

The radius must not be interpreted as:

- the exact cemetery boundary;
- a cadastral parcel;
- a legal protection zone;
- the complete Frogner farm landscape;
- proof that both churches are one object.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| OSM way 558572036 | Named medieval church polygon | Primary applied geometry |
| Kartverket, Gamle Kirkeveien 19 | Official old-church address point | Physical/address cross-check |
| Lillestrøm municipality | Official date, fire and restoration summary | Historical identity |
| Frogner parish | Official building description and pilgrimage context | Historical cross-check |
| Norges Kirker | Scholarly building, rune, fire and restoration history | Deep historical context |
| OSM way 558572035 | Separate 1925 church geometry | Explicitly rejected for this record |
| Kartverket, Gamle Kirkeveien 21 | Official new-church address | Explicitly rejected for this record |
| Legacy coordinate | Incorrect northern village point | Rejected |

## Raw source material

The source workflows persisted:

- `reports/akershus-coordinate-frogner-gamle-kirke-source-probe/osm-way-558572036-full.xml`
- `reports/akershus-coordinate-frogner-gamle-kirke-source-probe/osm-way-558572035-full.xml`
- `reports/akershus-coordinate-frogner-gamle-kirke-source-probe/nominatim-frogner-churches.json`
- `reports/akershus-coordinate-frogner-gamle-kirke-source-probe/osm-frogner-church-site-bbox.xml`
- `reports/akershus-coordinate-frogner-gamle-kirke-source-probe/geonorge-gamle-kirkeveien-19.json`
- `reports/akershus-coordinate-frogner-gamle-kirke-source-probe/geonorge-gamle-kirkeveien-21.json`
- `reports/akershus-coordinate-frogner-gamle-kirke-source-probe/source-summary.txt`
- `reports/akershus-coordinate-frogner-gamle-kirke-source-probe/address-summary.txt`

The temporary workflows removed themselves before the production diff was finalized.

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch5/frogner_gamle_kirke.json`
- `data/coordinate-evidence/akershus/historie/frogner_gamle_kirke.json`
- `reports/akershus-coordinate-frogner-gamle-kirke-production-2026-07-26.md`
- the eight raw-source files listed above

## Next record

Continue with `sorum_kirke`, the next place in the active Akershus batch-5 sequence.
