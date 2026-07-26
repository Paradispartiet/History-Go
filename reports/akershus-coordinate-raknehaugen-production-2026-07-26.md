# Raknehaugen coordinate production

Date: 2026-07-26

## Result

`raknehaugen` has been moved to Riksantikvaren's official centre for the named archaeological locality `32659-1`.

- Previous coordinate: `60.1469, 11.1366`
- Applied coordinate: `60.14694610454176, 11.137238047964038`
- Displacement: approximately `35.7 m`
- Previous radius: `260 m`
- Applied radius: `120 m`
- Riksantikvaren locality: `32659-1`
- Geometry: `MultiPolygon`
- OSM physical mound: way `258836263`
- Coordinate status: `verified_geometry`
- Coordinate role: `site_center`

## Official archaeological locality

Riksantikvaren's public OGC data identifies `32659-1` as `Raknehaugen` in Ullensaker.

The locality publishes:

- official centre: `60.14694610454176, 11.137238047964038`;
- geometry type: `MultiPolygon`;
- geometry vertices: `43`;
- maximum vertex distance from centre: approximately `85.1 m`;
- one registered individual monument;
- automatic protection under the Cultural Heritage Act section 4;
- source organisation: Akershus county municipality;
- source update: `2025-12-01`.

The official description characterises the feature as a clearly marked, topped round mound approximately 90 metres in diameter and 15 metres high. The top is flat, and terraces on the sides are interpreted as results of restoration. Three information signs were installed in 2009.

## Raw physical mound geometry

OpenStreetMap way `258836263` is:

- named `Raknehaugen`;
- tagged `historic=archaeological_site`;
- tagged `archaeological_site=tumulus`;
- represented by a closed 10-node polygon.

The deterministic polygon centroid is:

- Latitude: `60.14697672151585`
- Longitude: `11.137202577094722`

The physical mound centroid lies approximately `3.9 m` from Riksantikvaren's official locality centre.

The farthest OSM polygon vertex is approximately `46.7 m` from the OSM centroid. This is consistent with the official description of a mound about 90 metres in diameter.

## Independent point cross-checks

Nominatim resolves the same named OSM way at `60.1470469, 11.1371888`:

- approximately `7.8 m` from the calculated OSM centroid;
- approximately `11.3 m` from the applied Riksantikvaren centre.

OSM viewpoint node `4904939956` lies on the mound:

- coordinate: `60.1469729, 11.1372258`;
- approximately `3.1 m` from the applied centre.

The information board `Raknehaugen størst i norden` lies approximately `48.3 m` from the OSM mound centroid and remains inside the applied radius.

## Rejected alternatives

### Legacy point

The old point was only about 35.7 metres from the correct locality centre, but it had no source contract and sat west of the official centre.

### Viewpoint

The viewpoint is physically on the mound and is a useful cross-check, but it is a visitor-use object rather than the archaeological locality.

### Information board

The information board is part of the public interpretation environment but does not represent the centre of the mound.

### Guidepost

The guidepost named Raknehaugen lies approximately 172.7 metres from the physical mound centroid. It is an access aid and is rejected as a canonical marker.

### Hovin school parking

The municipality describes access from Hovin school, but a parking or route-start point must not replace the monument itself.

## Radius decision

The radius is reduced from `260 m` to `120 m`.

The official archaeological locality extends at most approximately `85.1 m` from its centre. The applied radius therefore leaves approximately `34.9 m` of gameplay buffer beyond the farthest recorded locality vertex.

The 120-metre radius covers:

- the complete registered archaeological locality;
- the physical mound polygon;
- the on-mound viewpoint;
- the nearest information signs;
- the immediate interpretation environment.

It must not be interpreted as:

- a legal automatic-protection boundary;
- a security-zone polygon;
- a cadastral parcel;
- the visual catchment of the mound;
- the full access route from Hovin school;
- a combined natural-reserve and archaeological-site polygon.

## Content decision

The canonical narrative retains the dating to the Migration Period and the association with the year 552, while strengthening the physical description and source-critical framing.

The place is treated as:

- a monumental archaeological locality;
- a landscape expression of power and organised labour;
- a grave and memory monument;
- a site where physical scale is evidence;
- an object that must be separated from later legends and visitor infrastructure.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| Riksantikvaren locality 32659-1 | Named archaeological locality, official centre and MultiPolygon | Primary applied geometry |
| OSM way 258836263 | Named physical mound polygon | Primary independent physical cross-check |
| Nominatim way result | Named-object point | Secondary cross-check |
| Ullensaker municipality | Official identity, history and access context | Identity cross-check |
| OSM viewpoint 4904939956 | Physical point on mound | Visitor-use cross-check |
| OSM information board 4904939922 | Nearby interpretation object | Radius cross-check |
| Legacy coordinate | Nearby uncontracted point | Rejected |

## Raw source material

The production branch persists:

- `reports/akershus-coordinate-raknehaugen-source-probe/riksantikvaren-raknehaugen-exact.json`
- `reports/akershus-coordinate-raknehaugen-source-probe/osm-way-258836263-full.xml`
- `reports/akershus-coordinate-raknehaugen-source-probe/nominatim-raknehaugen.json`
- `reports/akershus-coordinate-raknehaugen-source-probe/osm-raknehaugen-bbox.xml`
- `reports/akershus-coordinate-raknehaugen-source-probe/source-summary.txt`

The temporary workflow and the broad Riksantikvaren name-search responses are removed after the exact locality feature has been persisted.

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch1/raknehaugen.json`
- `data/coordinate-evidence/akershus/historie/raknehaugen.json`
- `reports/akershus-coordinate-raknehaugen-production-2026-07-26.md`
- the five raw-source files listed above

## Next place

Continue with `nes_kirkeruiner`, the next unresolved record in Akershus batch 1.
