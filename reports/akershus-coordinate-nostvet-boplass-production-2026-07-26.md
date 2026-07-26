# Nøstvet-boplassen coordinate production

Date: 2026-07-26

## Result

`nostvet_boplass` has been moved from the Nøstvet farm-name point to Riksantikvaren's official centre for the named archaeological locality `41534`, `Nøstvet boplassen`, at Sjøskogen.

- Previous coordinate: `59.75109, 10.7996`
- Applied coordinate: `59.74233187729497, 10.762980481326093`
- Displacement: approximately `2,270.9 m`
- Previous radius: `220 m`
- Applied radius: `120 m`
- Riksantikvaren locality: `41534`
- Locality name: `Nøstvet boplassen`
- Geometry: `MultiPolygon`
- Individual monuments: `41534-1`, `41534-2`
- Protection status: automatic protection under the Cultural Heritage Act section 4
- Coordinate status: `verified_geometry`
- Coordinate role: `site_center`

## Identity correction

The old point coincides with the OSM place node for the farm `Nøstvet`.

Ås municipality explains why the archaeological site and farm share a name:

- the large find was made at Sjøskogen;
- Sjøskogen had the same owner as Nøstvet;
- the find was therefore somewhat imprecisely called the Nøstvet find;
- the artefact form later gave its name to the Nøstvet culture.

The canonical place must therefore represent the registered archaeological locality at Sjøskogen, not the farm-name point roughly 2.27 kilometres east.

## Official locality geometry

Riksantikvaren's public OGC dataset identifies locality `41534` as `Nøstvet boplassen`.

The locality publishes:

- official centre: `59.74233187729497, 10.762980481326093`;
- geometry type: `MultiPolygon`;
- geometry vertices: `62`;
- maximum vertex distance from official centre: approximately `87.2 m`;
- two individual monuments;
- automatic protection;
- origin: Kulturhistorisk museum, Oslo;
- first registered field date: `1979-09-24`;
- last source update: `2025-06-24`.

The official description states that finds have been made in the area from around 1880 onwards. It also records new surface finds from 2015 and an information sign installed by Akershus county municipality in autumn 2015.

## Individual monuments

### 41534-1

Individual monument `41534-1` is the primary settlement component.

- Category: archaeological individual monument
- Type: settlement
- Protection: automatic
- Geometry: `MultiPolygon`
- Geometry mean: `59.742344450882825, 10.763127895957094`
- Distance from locality centre: approximately `8.4 m`

### 41534-2

Individual monument `41534-2` documents two flint fragments found on the surface beside a large stone block in 2015.

- Dating: late Mesolithic
- Protection: automatic
- Geometry: `MultiPolygon`
- Geometry mean: `59.74254682261126, 10.762671835846966`
- Distance from locality centre: approximately `29.5 m`

Neither individual monument replaces the locality centre. They are physical components inside the larger named locality.

## Visitor and landscape cross-checks

The official municipal visitor page identifies the same find place at Sjøskogen and documents:

- a cultural-history information board;
- the Nøstvet-culture interpretation;
- the relationship between the Sjøskogen find and the Nøstvet name;
- the public visitor setting associated with Nøstvetfunnet and Tussebohuken.

An older municipal route description gives a more precise walking sequence:

- start near the kindergarten on Sjøskogenveien;
- continue south through Hareåsen;
- follow Elgjartunveien south to a recreational and ancient-monument area with signs;
- cross the area westwards;
- return through Eikelia and Steinalderveien.

Boplassveien's local history states that the Stone Age finds were made on a height between Eikelia and Elgjartunveien.

OSM node `6450596840`, named `NØSTVET` and tagged as an information board, lies at `59.7426995, 10.7626924`, approximately `43.9 m` from Riksantikvaren's official locality centre.

These independent descriptions and objects converge on locality `41534`.

## Rejected alternatives

### Legacy Nøstvet farm point

The previous point `59.75109, 10.7996` is the Nøstvet farm-name point. It is not the archaeological locality and is rejected.

### Nearby clearance cairns

Several nearby Askeladden records named Nøstvedt are clearance cairns or clearance-cairn fields from later agricultural activity. They do not represent the type-site and were rejected.

### Other Stone Age settlements

The landscape around Sjøskogen, Pollevannet and Vinterbro contains many genuine Stone Age settlements. Examples include localities `100418`, `89248`, `23039`, `32985` and others. None of these may replace locality `41534` merely because it is close or contains flint.

### Tussebohuken

Tussebohuken is a nearby shelter and visitor facility. It is part of the public outing but is not the archaeological site's canonical coordinate.

### Information board

The information board is a useful physical visitor cross-check but is subordinate to the official archaeological locality geometry.

## Radius decision

The radius is reduced from `220 m` to `120 m`.

The official locality geometry extends at most approximately `87.2 m` from its published centre. The public information board lies approximately `43.9 m` from the same centre.

A 120-metre gameplay radius therefore covers:

- the registered locality geometry;
- both individual monuments;
- the public information board;
- the immediate interpretation area.

It must not be interpreted as:

- the legal automatic-protection boundary;
- a cadastral parcel;
- a security-zone polygon;
- the full distribution of Nøstvet-culture finds;
- the boundary of the Sjøskogen residential area;
- a combined Nøstvetfunnet–Tussebohuken visitor polygon.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| Riksantikvaren locality 41534 | Named archaeological locality, official centre and MultiPolygon | Primary applied geometry |
| Riksantikvaren individual 41534-1 | Primary settlement component | Internal geometry cross-check |
| Riksantikvaren individual 41534-2 | 2015 surface-find component | Internal geometry cross-check |
| Ås municipality | Official site identity, visitor interpretation and name history | Primary identity cross-check |
| Municipal route description | Road-level access to the signed ancient-monument area | Landscape cross-check |
| Localhistoriewiki – Boplassveien | Height between Eikelia and Elgjartunveien | Historical physical cross-check |
| OSM information board 6450596840 | Named on-site visitor board | Physical visitor cross-check |
| Legacy coordinate | Nøstvet farm-name point | Rejected |

## Raw source material

The production branch persists only the exact authoritative archaeological records and the deterministic geometry summary:

- `reports/akershus-coordinate-nostvet-source-probe/riksantikvaren-lokalitet-41534.json`
- `reports/akershus-coordinate-nostvet-source-probe/riksantikvaren-enkeltminne-41534_1.json`
- `reports/akershus-coordinate-nostvet-source-probe/riksantikvaren-enkeltminne-41534_2.json`
- `reports/akershus-coordinate-nostvet-source-probe/exact-41534-summary.txt`

Broad municipality extracts, temporary name searches, large candidate lists, map extracts and all one-time workflows were removed after the exact locality was resolved.

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch1/nostvet_boplass.json`
- `data/coordinate-evidence/akershus/historie/nostvet_boplass.json`
- `reports/akershus-coordinate-nostvet-boplass-production-2026-07-26.md`
- the four exact raw-source files listed above

## Next step

Continue the Akershus-wide coordinate audit with the next place whose evidence status is not `production_applied` or whose canonical file still lacks a verified Coordinate Source Contract.
