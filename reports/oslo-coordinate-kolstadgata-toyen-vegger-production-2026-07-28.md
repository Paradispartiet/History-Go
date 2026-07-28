# Kolstadgata veggmiljø coordinate production

Date: 2026-07-28

## Result

- Place: `kolstadgata_toyen_vegger`
- Previous coordinate: `59.9142, 10.7782`
- Applied coordinate: `59.913866905366774, 10.774121793781443`
- Displacement: approximately `230.3 m` west
- Previous radius: `170 m`
- Applied radius: `120 m`
- Status: `verified_geometry`
- Locator type: `route`
- Source provider: `osm`
- Accuracy: `semantic_anchor`
- Coordinate role: `line_anchor`
- Applied source identity: OpenStreetMap ways `355173203`, `785046180`; Kartverket SSR `996398`

## Why the old point is replaced

The fresh Oslo coordinate audit correctly left this record at `needs_source`. The previous coordinate was explicitly an editorial proxy for a diffuse Tøyen wall environment and had no stable physical object or finite anchor set.

The blocker is now resolved by defining a source-backed **Kolstadgata 1–15 public-space and wall axis** rather than pretending that every changing mural, tag, paste-up and side passage belongs to one broad neighbourhood centroid.

The canonical `desc` and `popupDesc` remain unchanged. The production work only establishes where the described environment is physically anchored.

## Why this is a route rather than one mural

The place is called `Kolstadgata veggmiljø`, not a single-artwork record.

Three source-backed frontage controls make a finite route model possible:

1. **Kolstadgata 1** anchors the western end of the relevant street/public-space environment.
2. **Kolstadgata 7** is documented by Oslo kommune in local housing/community and art activity.
3. **Kolstadgata 15** carries the documented Jason mural from 2013.

The Jason mural therefore validates the eastern wall-art anchor, but it does not replace the full street-environment record.

## Current municipal public-space context

Oslo kommune currently treats Kolstadgata as a defined public-space project area and is testing new public use of the street before a permanent upgrade.

That is important for coordinate semantics: the stable identity is the named street/public-space axis, while individual surfaces and traffic arrangements can change.

The coordinate must therefore follow named urban infrastructure rather than one temporary mural or one current street-layout detail.

## Named street identity

Kartverket SSR returns one active `Kolstadgata` object in Oslo:

- place number: `996398`
- object type: `Adressenavn`
- status: active
- official spelling: `Kolstadgata`
- geometry type: `MultiLineString`

This independently confirms the named street identity used by the OSM route geometry.

## Applied route geometry

The production route uses current named OpenStreetMap street geometry from ways `355173203` and `785046180`.

It begins beside the Kolstadgata 1 frontage, follows the named street through Kolstadgata 7 and terminates at the orthogonal projection of the midpoint between the exact Kolstadgata 15A and 15B address points onto the street geometry.

The route coordinates are:

```json
[
  [59.9141752, 10.7736511],
  [59.9141114, 10.7736924],
  [59.9140252, 10.7738356],
  [59.9139216, 10.7740207],
  [59.9137838, 10.7742754],
  [59.9137074, 10.7744123],
  [59.91357585943619, 10.774648258407565]
]
```

The source-backed route length is approximately `87.5 m`.

A deterministic half-length point calculated in local `lon*cos(meanLat), lat` space gives:

- Latitude: `59.913866905366774`
- Longitude: `10.774121793781443`

This is the canonical route marker.

No wall centroid is invented.

## Address controls

Kartverket Address API provides exact current address points:

### Kolstadgata 1

- `59.91419388196801, 10.773215674420667`
- approximately `62.2 m` from the applied route midpoint
- western frontage/community control

### Kolstadgata 7

- `59.91391789697803, 10.773701763840386`
- approximately `24.1 m` from the applied route midpoint
- municipal community/art control

### Kolstadgata 15A

- `59.91351433470854, 10.774324123425956`
- approximately `40.8 m` from the applied midpoint

### Kolstadgata 15B

- `59.91344838160333, 10.774553119623407`
- approximately `52.4 m` from the applied midpoint

The 15A/15B address pair controls the building frontage carrying the documented mural. It is not interpreted as an exact mural-wall centroid.

## Jason mural anchor

The large Jason motif at Kolstadgata 15 is documented as a 2013 Urban Samtidskunst project. Independent local and tourism sources identify the same artwork and street.

This gives the route a strong, stable historical wall-art anchor while preserving the broader canonical concept of a changing wall environment.

## Transient-art rule

Murals, tags, paste-ups and informal marks are intentionally not treated as permanent coordinate geometry.

They can:

- be painted over;
- be replaced;
- disappear during renovation;
- move to another nearby wall;
- gain or lose cultural importance over time.

History Go therefore anchors the place to the stable Kolstadgata street/public-space route while using documented artworks and community projects as secondary cultural evidence.

## Radius decision

The previous `170 m` radius belonged to the unsupported broad proxy.

The new radius is `120 m`.

At gameplay scale it covers:

- the approximately 87.5-metre Kolstadgata 1–15 route;
- the exact 1, 7 and 15 address controls;
- immediate wall and public-space context around the route.

It must not be interpreted as:

- the extent of all Tøyen graffiti or murals;
- every side passage near Kolstadgata;
- a property boundary;
- a schoolyard boundary;
- a construction zone;
- a road-closure boundary;
- an access guarantee.

## Current-change warning

Kolstadgata is under active public-space transformation. Oslo kommune is testing temporary public-space uses ahead of a permanent upgrade.

The named street and public-space identity are stable enough for current production, but the exact route geometry should be re-audited when the permanent rebuild is complete.

## Access model

The canonical geometry follows ordinary public street space.

Users must not enter private courtyards, residential properties, school areas or construction zones without normal public access or permission. Current traffic, schoolyard, construction, event and maintenance conditions always take precedence over the gameplay radius.

## Source materialization

A temporary read-only GitHub Actions workflow captured current OSM geometry, Kartverket exact addresses, Kartverket SSR identity and a Nominatim address cross-check.

- workflow run: `30352529384`
- artifact: `8685448990`
- digest: `sha256:489c5690f45ff2b760918582f3c4b3ea4fb2a27f253453a4a181ef40f3dd3ea3`

The temporary workflow was removed after source capture.

Persisted production summary:

- `reports/oslo-coordinate-kolstadgata-toyen-vegger-source-probe/source-materialization-summary.json`

## Files

- `data/places/subkultur/oslo/places_subkultur/kolstadgata_toyen_vegger.json`
- `data/coordinate-evidence/oslo/subkultur/kolstadgata_toyen_vegger.json`
- `reports/oslo-coordinate-kolstadgata-toyen-vegger-source-probe/source-materialization-summary.json`
- `reports/oslo-coordinate-kolstadgata-toyen-vegger-production-2026-07-28.md`

## Sources

- Oslo kommune – Midlertidig skog i Kolstadgata: https://www.oslo.kommune.no/slik-bygger-vi-oslo/midlertidig-skog-i-kolstadgata/
- Oslo kommune – Tøyen endrer boligmarkedet: https://magasin.oslo.kommune.no/byplan/toyen-endrer-boligmarkedet
- Mer av Oslo – gatekunst på Tøyen / Jason in Kolstadgata 15: https://meravoslo.no/nyheter/opplev-gatekunst-i-oslo?rq=gatekunst
- OpenStreetMap way 355173203 – Kolstadgata: https://www.openstreetmap.org/way/355173203
- OpenStreetMap way 785046180 – Kolstadgata: https://www.openstreetmap.org/way/785046180
- Kartverket SSR – Kolstadgata, place number 996398
- Kartverket Address API – Kolstadgata 1, 7, 15A and 15B

## Next record

Continue with `kuba_akselpassasjer` after this production change passes review and data checks.
