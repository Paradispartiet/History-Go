# Nesodden kirke coordinate production

Date: 2026-07-26

## Result

`nesodden_kirke` has been moved from a nearby uncontracted point to the deterministic centroid of the named medieval church-building geometry.

- Previous coordinate: `59.80521, 10.69346`
- Applied coordinate: `59.805182948086, 10.693807598202`
- Displacement: approximately `19.7 m`
- Applied geometry: OpenStreetMap way `299949532`
- National building reference: `149437207`
- Official address: `Presteskjærveien 13, 1459 Nesodden`
- Kartverket identity: municipality `3212`, farm/use number `11/106`, address code `2500`
- Coordinate status: `verified_geometry`
- Coordinate role: `display_marker`
- Radius: `220 m`

## Canonical identity

The canonical marker represents the standing medieval limestone church itself.

The wider radius provides gameplay context for:

- the cemetery;
- the old parsonage;
- the protected cultural landscape;
- Kirkekrysset and the older route network;
- the historical connection to Bunnefjorden and Kirkevika.

Kirkevika and Kirkekrysset are not alternative canonical coordinates.

## Historical basis

Nesodden kirkelige fellesråd describes the church as a limestone long church built between 1136 and 1180. It contains a medieval baptismal font and later church furnishings and is the oldest standing building in the municipality.

Nesodden municipality lists the church and cemetery and confirms Presteskjærveien 13 as the church address.

Skiforeningen documents the church as the historic centre of a wider route and fjord landscape. People formerly rowed to Kirkevika below the church before travelling up to the church site. The church, cemetery and surrounding cultural landscape therefore explain more than the building alone, but the standing building remains the most precise and defensible marker.

## Geometry basis

A one-time source-materialization workflow fetched:

- the complete OpenStreetMap geometry for way `299949532`;
- a Nominatim lookup for the same object;
- the Kartverket address result for Presteskjærveien 13.

The OSM way contains 17 nodes and is tagged with, among other fields:

```json
{
  "amenity": "place_of_worship",
  "building": "church",
  "heritage": "yes",
  "name": "Nesodden kirke",
  "ref:bygningsnr": "149437207",
  "start_date": "1175",
  "wikidata": "Q7593553"
}
```

The polygon centroid was calculated directly from the raw geometry:

- Latitude: `59.805182948086`
- Longitude: `10.693807598202`

Nominatim independently resolves the same OSM way as Nesodden kirke at `59.8051661, 10.6938118`, approximately 1.9 metres from the calculated centroid.

## Address basis

Kartverket returned one exact address object for Presteskjærveien 13:

- Municipality: `3212 Nesodden`
- Farm/use number: `11/106`
- Address code: `2500`
- Postal code: `1459`
- Representation point: `59.80516223390065, 10.69379338056053`

The address point lies approximately 2.4 metres from the calculated church centroid.

## Identifier cross-check

Structured Wikimedia and Wikidata data associate the same church with:

- Wikidata: `Q7593553`
- Kulturminne ID: `85123`
- OpenStreetMap way: `299949532`

These identifiers are retained as cross-checks. The primary coordinate source is the raw named building geometry.

## Anchor decision

The church-building centroid is applied because it provides:

1. a named and closed physical polygon;
2. explicit church and heritage tags;
3. a national building reference;
4. agreement with the official address point;
5. agreement with Nominatim's named-object point;
6. direct correspondence with the documented standing medieval building.

The former coordinate was already close to the church and was not grossly misplaced. The production change is primarily a precision and provenance upgrade.

## Radius decision

The existing `220 m` radius is retained to cover the immediate church-site landscape at gameplay scale.

It must not be interpreted as:

- the legal automatic-protection boundary;
- the exact cemetery boundary;
- a cadastral parcel;
- the full route from Kirkevika;
- a cultural-landscape polygon.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| OpenStreetMap way 299949532 | Named medieval church geometry | Primary applied geometry |
| Kartverket Address API | Official address and representation point | Independent physical cross-check |
| Nesodden kirkelige fellesråd | Official building history and address | Confirms standing church identity |
| Nesodden municipality | Official church/cemetery and address identity | Administrative cross-check |
| Skiforeningen | Fjord, route and cultural-landscape context | Supports retained radius and narrative |
| Wikimedia/Wikidata | Identifier cross-check | Secondary only |
| Legacy coordinate | Nearby point without contract | Replaced |

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch4/nesodden_kirke.json`
- `data/coordinate-evidence/akershus/historie/nesodden_kirke.json`
- `reports/akershus-coordinate-nesodden-kirke-production-2026-07-26.md`
- `reports/akershus-coordinate-nesodden-kirke-source-probe/osm-way-299949532-full.xml`
- `reports/akershus-coordinate-nesodden-kirke-source-probe/nominatim-way-299949532.json`
- `reports/akershus-coordinate-nesodden-kirke-source-probe/geonorge-presteskjaerveien-13.json`
- `reports/akershus-coordinate-nesodden-kirke-source-probe/source-summary.txt`

The temporary workflow removed itself before the production diff was finalized.

## Next record

Continue with `seiersten_skanse`, the next place in the active Akershus batch-4 sequence.
