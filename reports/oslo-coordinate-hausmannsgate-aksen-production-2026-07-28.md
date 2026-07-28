# Hausmannsgate-aksen coordinate production

Date: 2026-07-28

## Result

- Place: `hausmannsgate_aksen`
- Previous coordinate: `59.9189, 10.7513`
- Applied coordinate: `59.91930402696448, 10.75166160598796`
- Displacement: approximately `49.3 m`
- Previous radius: `240 m`
- Applied radius: `100 m`
- Status: `verified_geometry`
- Locator type: `route`
- Source provider: `osm`
- Accuracy: `semantic_anchor`
- Coordinate role: `line_anchor`
- Applied geometry: OpenStreetMap way `129061331`
- Official street identity: Kartverket SSR `995873`

## Why the old point is replaced

The fresh Oslo coordinate audit correctly left `hausmannsgate_aksen` at `needs_source`. The former point was a broad editorial proxy for changing walls, passages and street surfaces and had no stable geometry matching the full canonical scope.

The blocker is now resolved by narrowing the coordinate representation to the named Hausmanns gate frontage through Hauskvartalet.

This does not change the editorial identity of the place. The `desc` and `popupDesc` remain unchanged. The production change identifies the stable street route on which the described posters, stencils, facade marks and DIY visual practices are encountered.

## Distinction from neighbouring canonical places

This record must not duplicate two already existing History Go places.

### Hausmania

`hausmania` is already a separate canonical building place at Hausmanns gate 34 with an exact official-address coordinate.

The Hausmannsgate axis therefore does not use the Hausmania building point as its canonical marker. Hausmanns gate 34 is only the western frontage control for the route.

### Brenneriveien / Ingens gate

`brenneriveien_ingens_gate` is already a separate subculture area by Akerselva, with its own graffiti, market and club-scene identity.

The Hausmannsgate route is not extended east into that area. This preserves the intended contrast between the Hauskvartalet street axis and the Akerselva-side Brenneriveien/Ingens gate environment.

## Municipal Hauskvartalet scope

Oslo kommune describes Hauskvartalet as a culture quarter whose actors include Hausmania and whose development includes Hausmannsgate 40 and 42 together with adjacent cultural and residential functions.

This provides a finite reason to select the street frontage around addresses 34–42 rather than an arbitrary segment of the complete Hausmanns gate or a broad neighbourhood midpoint.

## Named street geometry

OpenStreetMap way `129061331` is a named Hausmanns gate segment with Wikidata identity `Q11974526`.

The materialized geometry is:

```json
[
  [59.9191197, 10.7518504],
  [59.9192022, 10.7517740],
  [59.9192637, 10.7517113],
  [59.9193300, 10.7516296],
  [59.9193519, 10.7515980],
  [59.9193958, 10.7515383],
  [59.9194698, 10.7514140]
]
```

The segment is approximately `46.2 m` long.

A deterministic half-length point calculated in local `lon*cos(meanLat), lat` space gives:

- Latitude: `59.91930402696448`
- Longitude: `10.75166160598796`

This is the applied canonical route anchor.

## Kartverket street identity

Kartverket SSR returns one active Hausmanns gate place-name object in Oslo:

- place number: `995873`
- object type: `Adressenavn`
- spelling: `Hausmanns gate`
- spelling status: approved and prioritized
- geometry: `MultiLineString`

The official object covers the complete street. It is used as an identity cross-check, while the production coordinate deliberately uses only the OSM subsegment through the Hauskvartalet frontage.

## Address controls

Kartverket Address API provides exact current frontage controls:

### Hausmanns gate 34

- Coordinate: `59.919148209457326, 10.751977548509613`
- Distance to route geometry: approximately `7.8 m`
- Role: western frontage control and existing Hausmania canonical address

### Hausmanns gate 40

- Coordinate: `59.919303875414755, 10.751753198638816`
- Distance to route geometry: approximately `4.3 m`
- Role: central Hauskvartalet frontage control

### Hausmanns gate 42

Kartverket currently returns 42A, 42B and 42C. The 42A point is:

- Coordinate: `59.91941347762521, 10.751615863914031`
- Distance to route geometry: approximately `6.8 m`
- Role: eastern Hauskvartalet frontage control

These controls show that the chosen route segment actually follows the named quarter frontage rather than a detached street centreline.

## Radius decision

The previous `240 m` radius reflected the unresolved broad editorial scope.

The radius is reduced to `100 m`.

At gameplay scale this covers:

- the 46.2-metre Hausmanns gate route segment;
- the immediate Hauskvartalet street frontage;
- entrances and side-wall context around Hausmanns gate 34–42.

It must not be interpreted as:

- the legal extent of Hauskvartalet;
- the boundary of Hausmania;
- the extent of Brenneriveien/Ingens gate;
- a property or construction boundary;
- every poster, stencil or graffiti surface in nearby side streets;
- an access guarantee to adjacent buildings or courtyards.

## Subculture representation

The canonical route follows stable urban infrastructure, not changing visual content.

Posters, political stencils, graffiti, facade marks and temporary DIY expressions can be removed, painted over or moved. They remain evidence for how the street is used and interpreted, but they are not production-coordinate sources.

This distinction lets History Go keep the place historically and culturally meaningful without freezing one ephemeral artwork into the coordinate contract.

## Source materialization

A temporary read-only GitHub Actions workflow captured current OSM geometry, Kartverket SSR data and exact Kartverket address controls.

- workflow run: `30351791326`
- artifact: `8685160898`
- digest: `sha256:2ae23a4a85a59be8d54a1ca1a084ec06023adce71a2ace63309589c45a188606`

The temporary workflow was removed after source capture.

Persisted production summary:

- `reports/oslo-coordinate-hausmannsgate-aksen-source-probe/source-materialization-summary.json`

## Files

- `data/places/subkultur/oslo/places_subkultur/hausmannsgate_aksen.json`
- `data/coordinate-evidence/oslo/subkultur/hausmannsgate_aksen.json`
- `reports/oslo-coordinate-hausmannsgate-aksen-source-probe/source-materialization-summary.json`
- `reports/oslo-coordinate-hausmannsgate-aksen-production-2026-07-28.md`

## Sources

- Oslo kommune – Byøkologi og kultur i Hauskvartalet: https://magasin.oslo.kommune.no/byplan/oslos-forste-byokologiske-kulturkvartal-tar-form
- Hausmania – Hausmanns gate 34: https://www.hausmania.org/kontakt
- OpenStreetMap way 129061331 – Hausmanns gate: https://www.openstreetmap.org/way/129061331
- Kartverket SSR – Hausmanns gate, place number 995873
- Kartverket Address API – Hausmanns gate 34, 40 and 42

## Next record

Continue with `kolstadgata_toyen_vegger` after this production change passes review and data checks.
