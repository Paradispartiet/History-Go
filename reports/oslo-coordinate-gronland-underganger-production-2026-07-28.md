# Grønland underganger coordinate production

Date: 2026-07-28

## Result

- Place: `gronland_underganger`
- Previous coordinate: `59.9128, 10.7604`
- Applied coordinate: `59.912904676848626, 10.758921861315992`
- Displacement: approximately `83.2 m` west
- Previous radius: `210 m`
- Applied radius: `130 m`
- Status: `verified_geometry`
- Locator type: `linear_area`
- Source provider: `osm`
- Accuracy: `semantic_anchor`
- Coordinate role: `area_anchor`
- Applied geometry: OpenStreetMap way `163145627` / Kartverket SSR `998056`, Olafiagangen

## Why the old point is replaced

The 2026-07-25 fresh-main audit correctly left this record at `needs_source`. The former coordinate was explicitly an editorial proxy for a diffuse environment of changing walls, passages and technical surfaces. It had no stable named source object and no finite anchor set.

Fresh municipal evidence resolves that blocker.

Oslo kommune describes Olafiagangen as a public passage and meeting place between Grønland torg and Akerselva directly under Nylandsbrua. Bymiljøetaten and Bydel Gamle Oslo manage and upgrade the space, including the underside of Nylandsbrua and the route toward the T-bane entrance.

Bydel Gamle Oslo has also explicitly treated the areas under Nylandsbrua and the underpasses to Grønland T as one connected physical improvement zone.

The canonical subculture record can therefore be represented as a finite public-space and transit-transition environment rather than an undefined neighbourhood-wide graffiti midpoint.

## Stable named geometry

OpenStreetMap way `163145627` is named `Olafiagangen` and is tagged as a pedestrian way. The materialized geometry contains six points and is approximately `89.8 m` long.

A deterministic half-length point was calculated along the named line in local `lon*cos(meanLat), lat` space:

- Latitude: `59.912904676848626`
- Longitude: `10.758921861315992`

This point is approximately `83.2 m` west of the former editorial proxy.

Kartverket independently returns one active Olafiagangen place-name object:

- place number: `998056`
- object type: `Adressenavn`
- spelling: `Olafiagangen`
- spelling status: `vedtatt`
- place status: `aktiv`
- geometry: `MultiLineString`

The Kartverket geometry follows the same corridor and independently establishes a stable official linear identity.

## Nylandsbrua context

OpenStreetMap way `377766487` is the named Nylandsbrua bridge polygon. The mapped bridge polygon is immediately adjacent to/over the Olafiagangen centerline; the nearest line-to-polygon distance in the materialized geometry is approximately `7.5 m`.

The coordinate decision does **not** infer the under-bridge relationship from this small geometric offset. Oslo kommune directly states that Olafiagangen lies under Nylandsbrua, and that municipal source is authoritative for the physical-space relationship.

Nylandsbrua therefore remains infrastructure context rather than the accessible canonical marker.

## Grønland T secondary anchors

The two western subway entrances provide a finite connection between the named passage and the transport node described in the canonical text.

### Western entrance

- OSM node: `1221546349`
- Latitude: `59.9126746`
- Longitude: `10.7589679`
- Distance from canonical point: approximately `25.7 m`

### Northwest accessible entrance

- OSM node: `3409122637`
- Latitude: `59.9129856`
- Longitude: `10.7586106`
- Distance from canonical point: approximately `19.5 m`

These entrances are secondary **current-access anchors** only. Oslo announced in 2026 that one entrance under Nylandsbrua is planned to move by 2028 as part of the station upgrade. The stable identity of the History Go place is therefore Olafiagangen and the under-bridge public-space corridor, not any one entrance node.

## Radius decision

The previous `210 m` radius reflected the old diffuse editorial concept and implied a much broader section of Grønland and Vaterland than the available physical evidence supported.

The radius is reduced to `130 m`.

At gameplay scale this includes:

- the approximately 90-metre named Olafiagangen pedestrian spine;
- the two western Grønland T entrance anchors;
- the under-bridge public-space core documented by Oslo kommune;
- the immediate walls, pillars and passage surfaces through which the canonical subculture theme is experienced.

It must not be interpreted as:

- the extent of all graffiti on Grønland;
- every underpass or technical surface in Vaterland;
- a Nylandsbrua bridge polygon;
- a station boundary;
- a construction boundary;
- a property or access boundary.

## Graffiti and subculture representation

The canonical `desc` and `popupDesc` are retained unchanged. Their reference to fast-changing tags, paste-ups and markings remains appropriate as content interpretation.

Those transient surfaces are deliberately **not** used as coordinate sources. Graffiti can disappear, be painted over or move to nearby surfaces. The coordinate follows the stable urban infrastructure and passage environment in which the subculture is encountered.

## Access context

Olafiagangen is a public pedestrian space, but current construction, station works, municipal maintenance, events and barriers can change circulation.

History Go should use ordinary public pedestrian routes only. Technical rooms, closed service areas, tracks, tunnels or infrastructure spaces outside public access are not gameplay space even if they fall inside the radius.

## Source materialization

A temporary read-only GitHub Actions workflow captured the current OSM map extract, Nominatim results and Kartverket SSR identity.

- workflow run: `30350828545`
- artifact: `8684794327`
- digest: `sha256:6fbb973e0f817bcab492d3b04a96501fefdb9a6183540f3226bbdce53e6777c8`

The temporary workflow was removed after capture.

Persisted production summary:

- `reports/oslo-coordinate-gronland-underganger-source-probe/source-materialization-summary.json`

## Files

- `data/places/subkultur/oslo/places_subkultur/gronland_underganger.json`
- `data/coordinate-evidence/oslo/subkultur/gronland_underganger.json`
- `reports/oslo-coordinate-gronland-underganger-source-probe/source-materialization-summary.json`
- `reports/oslo-coordinate-gronland-underganger-production-2026-07-28.md`

## Sources

- Oslo kommune – Olafiagangen: https://www.oslo.kommune.no/slik-bygger-vi-oslo/olafiagangen/
- Bydel Gamle Oslo – SuperGrønland / Olafiagangen public-space material
- Bydel Gamle Oslo – 12 December 2024 resolution on Grønland public-space upgrades
- OpenStreetMap way 163145627 – Olafiagangen: https://www.openstreetmap.org/way/163145627
- OpenStreetMap way 377766487 – Nylandsbrua: https://www.openstreetmap.org/way/377766487
- Kartverket SSR – Olafiagangen, place number 998056

## Next record

Continue with `grunerlokka_bakgardsvegger` after this production change passes review and data checks.
