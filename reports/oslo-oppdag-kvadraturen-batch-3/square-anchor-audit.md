# Oppdag Kvadraturen batch 3 — square anchor audit

Date: 2026-07-19

## Rule

Public squares are not assigned a neighbouring street address merely to obtain a convenient point. The batch first checked Kartverket Stedsnavn / SSR and then used an exact named OpenStreetMap area object where SSR did not supply the correct physical square/park object.

## Kartverket Stedsnavn results

Saved raw responses:

- `coordinates/wessels_plass_kartverket_stedsnavn.json` — 0 matches
- `coordinates/egertorget_kartverket_stedsnavn.json` — 0 matches
- `coordinates/stortorget_kartverket_stedsnavn.json` — 0 matches
- `coordinates/grev_wedels_plass_kartverket_stedsnavn.json` — 1 match, but the object type is `Adressenavn` and the returned geometry/representation point describes the street/address-name object, not the park. Rejected as the map anchor for the place.

## Accepted exact named area objects

### Wessels plass

- OpenStreetMap object: `way/942267111`
- tags/source identity: `place=square`, name `Wessels plass`
- representation coordinate used: `59.91244, 10.73996`
- source URL: `https://www.openstreetmap.org/way/942267111`
- supporting OSM-derived lookup: `https://mapcarta.com/W942267111`

Decision: accepted as the exact named square geometry. Use `sourceProvider: osm`, `sourceObjectId: osm-way:942267111`, `coordType: square_center`, `coordRole: area_anchor`, `coordStatus: verified_geometry`.

### Egertorget

- OpenStreetMap object: `relation/4546219`
- tags/source identity: named pedestrian multipolygon, `name=Egertorget`, `area=yes`
- representation coordinate used: `59.91291, 10.74188`
- source URL: `https://www.openstreetmap.org/relation/4546219`
- supporting OSM-derived lookup: `https://no.geoview.info/egertorget%2C4546219r`

Decision: accepted as the exact named pedestrian-area geometry. Use `sourceProvider: osm`, `sourceObjectId: osm-relation:4546219`, `coordType: square_center`, `coordRole: area_anchor`, `coordStatus: verified_geometry`.

### Stortorvet / Stortorget

- OpenStreetMap object: `way/179095465`
- tags/source identity: `place=square`, `highway=pedestrian`, name `Stortorvet`
- representation coordinate used: `59.91277, 10.74529`
- source URL: `https://www.openstreetmap.org/way/179095465`
- supporting OSM-derived lookup: `https://mapcarta.com/W179095465`

Decision: accepted as the exact named square geometry. The canonical display name uses the official municipal spelling `Stortorvet`; the Oppdag Kvadraturen stop uses `Stortorget`. Use `sourceProvider: osm`, `sourceObjectId: osm-way:179095465`, `coordType: square_center`, `coordRole: area_anchor`, `coordStatus: verified_geometry`.

### Grev Wedels plass

- OpenStreetMap object: `way/33610051`
- tags/source identity: `leisure=park`, named `Grev Wedels plass`
- representation coordinate used: `59.90735, 10.74278`
- source URL: `https://www.openstreetmap.org/way/33610051`
- supporting OSM-derived lookup: `https://mapcarta.com/W33610051`

Decision: accepted as the exact named park geometry. The place is modeled as a public square/park with `sourceProvider: osm`, `sourceObjectId: osm-way:33610051`, `coordType: square_center`, `coordRole: area_anchor`, `coordStatus: verified_geometry`.

## Building anchors

The two physically separate shipping-company buildings were resolved through the normative Geonorge address-first workflow:

- Amerikalinjen — Jernbanetorget 2 — `geonorge-adresser-v1:0301:13444:2`
- DFDS-bygget — Karl Johans gate 1 — `geonorge-adresser-v1:0301:13630:1`

Their full saved address-finder outputs are in the batch coordinate folder.
