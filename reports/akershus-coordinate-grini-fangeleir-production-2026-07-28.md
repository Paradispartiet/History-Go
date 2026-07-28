# Grini fangeleir coordinate production

Date: 2026-07-28

## Result

- Place: `grini_fangeleir`
- Previous coordinate: `59.9565, 10.5909`
- Applied coordinate: `59.954295776884884, 10.582680030345253`
- Displacement: approximately `519.1 m`
- Previous radius: `240 m`
- Applied radius: `360 m`
- Status: `verified_historical_source`
- Locator type: `historic_site`
- Source provider: `manual_research`
- Accuracy: `geometric_center`
- Coordinate role: `historical_anchor`
- Applied geometry: OpenStreetMap way `1420075236`
- Public visitor anchor: Grinimuseet, OSM node `5446566958`

## Why the provisional point is replaced

The previous marker at `59.9565, 10.5909` had no documented relationship to the original prison building, appeal area, barracks, workshops or surviving wartime elements. The 2026-07-26 audit therefore correctly left it at `needs_manual_map_check` until a stable historical area anchor could be tied to current terrain.

The blocker is now resolved through the surviving original prison building rather than through an invented centroid of the full camp perimeter.

MiA documents that Grini fangeleir was established on 14 June 1941 in the nearly completed Ila women's-prison building. During the first period the prisoners were housed in this building. From 1942 the surrounding forest was cleared and the camp expanded with more than thirty barracks, workshops, sick wards and other functions. MiA also states that Ila fengsel og forvaringsanstalt occupies the original main building today.

The canonical marker therefore moves approximately `519.1 m` to the deterministic centroid of that surviving building.

## One-time current-geometry materialization

A temporary read-only GitHub Actions workflow fetched current OSM geometry around Ila/Grini and Kartverket address controls for Jøssingveien 33 and 31.

Artifact:

- workflow run: `30349699245`
- artifact: `8684349286`
- digest: `sha256:4ef61dce08fdbc557579373ed0083d0df5ae85843a7c27de0206277b01853f85`
- source bbox: `10.5790,59.9510,10.5965,59.9605`

The temporary workflow was removed after the source material was captured.

The production branch persists the relevant compact geometry and derivation in:

- `reports/akershus-coordinate-grini-fangeleir-source-probe/osm-way-1420075236-original-prison-building-geometry.json`

## Original main-building geometry

OpenStreetMap way `1420075236` is a closed 41-node building polygon at the current Ila site.

A deterministic polygon centroid calculated in planar `lon*cos(meanLat), lat` space gives:

- Latitude: `59.954295776884884`
- Longitude: `10.582680030345253`

Kartverket returns one exact address object for Jøssingveien 33 at:

- Latitude: `59.954506038554115`
- Longitude: `10.58271591642294`

The official address point is approximately `23.5 m` from the applied building centroid. Kriminalomsorgen independently lists Jøssingveien 33, 1359 Eiksmarka as the current address of Ila fengsel og forvaringsanstalt.

## Historical building identification

The building geometry is not selected merely because it lies inside today's prison.

The historical source chain identifies it as the Grini main building:

1. MiA states that the camp began in the original Ila prison building and that today's Ila institution occupies that building.
2. The wartime camp plan reproduced from Griniboken identifies the original prison building as a principal masonry structure around which the expanded camp developed.
3. A 1945 appeal photograph is described as taken from the fourth floor of the original prison building toward the large appeal area.
4. Historical sources place the special `Fallskjermen` room in the original building.
5. OSM way `1470255130`, named `Fallskjermen`, lies inside building way `1420075236`. OSM marks that indoor-room position as approximate, so it is used only as identity QA and never as the applied coordinate.

This establishes the current building polygon as a stable historical feature anchor without requiring a false full-camp polygon.

## Historical camp scope

Grini fangeleir was much larger than the main building.

MiA and Bærum municipality document a camp that expanded into a barracks town with more than thirty barracks plus workshops, sick wards and other functions. Historical plans also show the appeal area, inner camp, outer administrative functions and farms.

The canonical marker therefore does **not** claim that the main-building centroid is:

- the centroid of the complete 1941–1945 camp;
- the centre of the appeal area;
- the barracks-camp centroid;
- the wartime fence or security-perimeter centroid;
- a property or protection-area centroid.

It is instead the most stable surviving historical component from which the camp developed.

## Separate public visitor anchor

The current Grinimuseet is at Jøssingveien 31.

OpenStreetMap node `5446566958` gives:

- Latitude: `59.9557896`
- Longitude: `10.5847011`
- Distance from the historical main-building centroid: approximately `200.6 m`

Kartverket gives the Jøssingveien 31 address point at `59.95552747619229, 10.584786409648313`.

MiA states that the current museum is housed in an authentic prisoner barrack that was moved away after the war, restored at Grini in 2015 and now stands just outside the original prison-camp location.

The museum is therefore the correct **public visitor anchor**, but it is not substituted for the historical camp coordinate.

## Active-prison access boundary

The applied historical coordinate lies inside today's Ila fengsel og forvaringsanstalt, which Kriminalomsorgen operates as a high-security prison.

This is an important distinction between coordinate truth and gameplay access:

- the historical marker may truthfully identify the surviving original main building;
- History Go must never instruct users to enter, approach through, cross or navigate inside the active prison security perimeter;
- the current prison boundary is operational access context only and is not used as historical camp geometry;
- public on-site interpretation should use Grinimuseet and ordinary lawful public roads.

## Radius decision

The radius increases from `240 m` to `360 m`.

The radius is not intended to recreate the full wartime camp boundary. It provides a gameplay core that includes:

- the surviving original main-building historical anchor;
- the separate Grinimuseet public visitor anchor approximately `200.6 m` away;
- the immediate terrain in which the historical main-building and camp functions are interpreted.

It must not be interpreted as:

- the 1941–1945 camp perimeter;
- the current Ila prison security boundary;
- a property polygon;
- a legal heritage boundary;
- permission to enter any restricted area.

## Rejected alternatives

### Legacy point

`59.9565, 10.5909` is approximately `519.1 m` from the applied main-building centroid and has no documented historical feature role.

### Grinimuseet as canonical marker

Rejected because MiA explicitly states that the museum's authentic barrack was moved after the war and now stands just outside the original camp location.

### Wikidata Q637411 coordinate

The Wikidata coordinate is approximately `96.2 m` from the applied building centroid, but the coordinate statement has no cited derivation or documented camp-feature role. It remains an entity cross-check only.

### Current prison-area centroid

Rejected because today's secure-prison boundary reflects current operations and later development rather than the wartime camp perimeter.

## Content governance

The existing `desc` and `popupDesc` are retained unchanged. This production change resolves coordinate provenance, historical feature role, radius and access context rather than rewriting the historical narrative.

## Production files

- `data/places/historie/akershus/grini_fangeleir.json`
- `data/coordinate-evidence/akershus/historie/grini_fangeleir.json`
- `reports/akershus-coordinate-grini-fangeleir-source-probe/source-summary.json`
- `reports/akershus-coordinate-grini-fangeleir-source-probe/osm-way-1420075236-original-prison-building-geometry.json`
- `reports/akershus-coordinate-grini-fangeleir-production-2026-07-28.md`

## Sources

- MiA Grinimuseet – Om Grini fangeleir: https://mia.no/grinimuseet/om-grini-fangeleir
- MiA Grinimuseet – Grini museum: https://mia.no/grinimuseet/en/grini-museum
- Kriminalomsorgen – Ila fengsel og forvaringsanstalt: https://www.kriminalomsorgen.no/fengsel/ila-fengsel-og-forvaringsanstalt
- Bærum kommune – Forsvar og krigsminner: https://www.baerum.kommune.no/tjenester/kultur-idrett-og-fritid/kunst-og-kultur/rik-pa-historie/6.-forsvar-og-krigsminner
- Lokalhistoriewiki – Grini fangeleir: https://lokalhistoriewiki.no/Grini_fangeleir
- OpenStreetMap way 1420075236: https://www.openstreetmap.org/way/1420075236
- OpenStreetMap node 5446566958: https://www.openstreetmap.org/node/5446566958

## Next record

Continue with the next unresolved coordinate record after this production change passes review and data checks.
