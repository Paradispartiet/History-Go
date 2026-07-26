# Nes kirkeruiner coordinate production

Date: 2026-07-26

## Result

`nes_kirkeruiner` has been moved to the deterministic polygon centroid of Riksantikvaren individual monument `80265-1`, the physical medieval church-ruin walls.

- Previous coordinate: `60.14899, 11.45676`
- Applied coordinate: `60.14900935187079, 11.456782263453258`
- Displacement: approximately `2.5 m`
- Previous radius: `220 m`
- Applied radius: `120 m`
- Riksantikvaren ruin individual: `80265-1`
- Broader church-site locality: `80265`
- OSM wall geometry: way `134163878`
- Current named address: `Nes Kirkeruin, Ullershovvegen 160, 2160 Vormsund`
- Coordinate status: `verified_geometry`
- Coordinate role: `display_marker`

## Representation decision

The place has several plausible coordinate objects:

- the physical ruin walls;
- the broader medieval church-site locality;
- the named visitor address;
- the parking area;
- information signs;
- the clock tower;
- grave and memorial objects.

The canonical display marker follows the physical ruin walls because the place record is named `Nes kirkeruiner` and the ruin walls are the most precise semantic and physical object.

The broader locality and current address remain important supporting objects but do not replace the ruin centroid.

## Riksantikvaren ruin individual 80265-1

Riksantikvaren identifies individual monument `80265-1` as `Nes kirkeruin`.

The record publishes:

- category: archaeological ruin;
- geometry: `MultiPolygon`;
- geometry vertices: `17`;
- deterministic polygon centroid: `60.14900935187079, 11.456782263453258`;
- maximum vertex distance from centroid: approximately `19.1 m`;
- automatic protection under the Cultural Heritage Act section 4;
- typological dating;
- source organisation: Akershus county municipality.

The description reconstructs several architectural phases:

- an original Romanesque church with nave, narrower choir and apse;
- early removal of the apse and extension of the choir;
- a later medieval enlargement that made nave and choir equally wide;
- use of brick during the later medieval rebuilding;
- conversion to a cruciform church in 1697;
- preserved round-arched south and west portals built from limestone ashlar.

This individual monument provides the applied display-marker geometry.

## Broader locality 80265

Riksantikvaren locality `80265`, also named `Nes kirkeruin`, contains `14` individual monuments.

The locality publishes:

- official centre: `60.14917722724928, 11.456568155405392`;
- geometry: `MultiPolygon`;
- geometry vertices: `36`;
- maximum distance from its centre: approximately `84.6 m`;
- distance from locality centre to ruin centroid: approximately `22.1 m`;
- automatic protection;
- information on the medieval church site, fire, erosion and later relocation.

The locality description documents that:

- the church stood on the point where Glomma and Vorma meet;
- it was extensively rebuilt through the Middle Ages and in 1697;
- it was destroyed by fire in 1854;
- the new church was completed in 1859–1860 farther north;
- the old site was strongly threatened by landslide and river erosion;
- an information sign was installed in 2012.

The broader locality informs the gameplay radius and historical narrative, but its centre is not used as the physical wall marker.

## OSM ruin-wall geometry

OpenStreetMap way `134163878` is:

- named `Nes kirkeruiner`;
- tagged `historic=ruins`;
- tagged `barrier=wall`;
- represented by a closed 22-node polygon;
- linked to Wikidata `Q4585497`.

The deterministic OSM polygon centroid is:

- Latitude: `60.14904632694334`
- Longitude: `11.456784132261165`

It lies approximately `4.1 m` from the applied Riksantikvaren ruin centroid.

The farthest OSM polygon vertex is approximately `19.3 m` from its centroid, closely matching the Riksantikvaren ruin geometry.

## Current address resolution

MiA's visitor page lists `Ullershovvegen 8`.

The address-first lookup showed why this cannot be used literally as the current house number:

- the ruin property is farm/use number `83/8`;
- Kartverket's current named address object is `Nes Kirkeruin, Ullershovvegen 160`;
- the address representation point is `60.14918881792084, 11.457801927739348`;
- the address point lies approximately `59.9 m` from the ruin centroid.

`Ullershovvegen 8` is therefore interpreted as a legacy property/use-number reference in the museum presentation, while `Ullershovvegen 160` is stored as the current official road address.

The address is valid visitor and identity evidence. It is not used as the ruin marker.

## Visitor-object cross-checks

The local OSM extract contains:

- parking approximately `77 m` from the old point;
- information signs approximately `93–96 m` away;
- picnic area approximately `65 m` away;
- the clock tower approximately `132 m` away;
- grave and memorial objects immediately around the ruin;
- a civic building near the named address point.

These objects explain why a broad visitor-area marker could look plausible, but none is as semantically precise as the ruin-wall geometry.

## Rejected alternatives

### Address point

The named address is official and useful, but lies approximately 59.9 metres from the ruin walls.

### Broader locality centre

The locality centre represents a 14-object church-site complex, not specifically the wall ruin.

### Parking

The parking area is an access object and cannot be used as the physical historical marker.

### Information signs

The signs support on-site interpretation but do not represent the ruin geometry.

### Clock tower

The clock tower is a separate historical structure approximately 132 metres from the old marker and is outside the selected 120-metre gameplay radius.

### Legacy point

The old point was already physically accurate, only about 2.5 metres from the chosen centroid. It is nevertheless replaced because it lacked a reproducible source contract.

## Radius decision

The radius is reduced from `220 m` to `120 m`.

The physical ruin geometry extends only about 19 metres from its centroid. The broader locality extends approximately 84.6 metres from its own centre, which is 22.1 metres from the ruin centroid.

Using the conservative sum of those values, all recorded locality geometry should lie within approximately `106.7 m` of the ruin centroid. A 120-metre radius therefore leaves at least approximately `13.3 m` of gameplay buffer.

The selected radius covers:

- the ruin walls;
- the broader registered church-site locality;
- nearby graves and memorials;
- the parking area;
- the closest information signs;
- immediate public interpretation space.

It must not be interpreted as:

- a legal automatic-protection boundary;
- a cadastral parcel;
- a churchyard boundary;
- a landslide- or erosion-risk polygon;
- the full historical extent of Nes prestegård;
- a combined ruin, river-meeting and visitor-area polygon.

## Content decision

The canonical narrative now foregrounds:

- the Romanesque architectural starting point;
- successive medieval rebuilding;
- conversion to a cruciform church in 1697;
- the 1854 fire;
- relocation of the new church because of landslide risk;
- the strategic and symbolic location at the meeting of Glomma and Vorma.

Unsupported or weakly sourced conflict language from the old short text is removed in favour of the detailed Riksantikvaren chronology.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| Riksantikvaren individual 80265-1 | Physical medieval church-ruin walls | Primary applied geometry |
| Riksantikvaren locality 80265 | Wider church-site complex and history | Radius and identity context |
| OSM way 134163878 | Named physical wall polygon | Independent physical cross-check |
| Kartverket – Ullershovvegen 160 | Current named visitor address | Address and identity cross-check |
| MiA / Nes samlinger | Official visitor identity and legacy address presentation | Institutional cross-check |
| Nominatim ruin result | Named-object point | Secondary geometry cross-check |
| Local OSM visitor objects | Parking, signs, graves and clock tower | Representation-policy cross-check |
| Legacy coordinate | Near-correct but uncontracted point | Rejected |

## Raw source material

The production branch persists:

- `reports/akershus-coordinate-nes-kirkeruiner-source-probe/riksantikvaren-enkeltminner-exact-80265-1.json`
- `reports/akershus-coordinate-nes-kirkeruiner-source-probe/riksantikvaren-lokaliteter-exact-80265.json`
- `reports/akershus-coordinate-nes-kirkeruiner-source-probe/osm-way-134163878-full.xml`
- `reports/akershus-coordinate-nes-kirkeruiner-source-probe/geonorge-nes-kirkeruin-ullershovvegen-160.json`
- `reports/akershus-coordinate-nes-kirkeruiner-source-probe/nominatim-nes-kirkeruiner.json`
- `reports/akershus-coordinate-nes-kirkeruiner-source-probe/osm-nes-kirkeruiner-bbox.xml`
- `reports/akershus-coordinate-nes-kirkeruiner-source-probe/exact-summary.txt`

The temporary workflows, empty alternative-name searches, broad Riksantikvaren result wrappers and obsolete address-query file were removed after the exact objects were extracted.

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch1/nes_kirkeruiner.json`
- `data/coordinate-evidence/akershus/historie/nes_kirkeruiner.json`
- `reports/akershus-coordinate-nes-kirkeruiner-production-2026-07-26.md`
- the seven raw-source files listed above

## Next place

Continue with `blaker_skanse`, the next unresolved record in Akershus batch 1.
