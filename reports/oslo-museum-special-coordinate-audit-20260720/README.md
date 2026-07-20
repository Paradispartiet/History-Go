# Oslo museum completeness — special coordinate audit

Date: 2026-07-20

## Purpose

This report resolves the four museum candidates that were deliberately excluded from the ordinary Geonorge address-first queue because their physical role or location requires additional interpretation.

The audit follows the repository's coordinate contract and existing geometry precedent:

- exact OSM building geometry may be used as `verified_geometry` when the physical identity is cross-checked against an authoritative source;
- building geometry uses `geocodeAccuracy: "geometric_center"`, `coordType: "building_center"` and `coordRole: "building_center"`;
- named site/installation geometry uses `geocodeAccuracy: "geometric_center"`, `coordType: "site_center"` and `coordRole: "site_center"`;
- a normal Norwegian visitor address should still use the normative Geonorge address-first flow when available.

Repository precedent: the Telegrafbygningen coordinate audit uses an exact OSM building object as the primary geometry source after identity cross-checking, with `verified_geometry` and `building_center`. Myrens Verksted and Bogstad gård establish the equivalent `site_center` pattern for named complexes.

## 1. `ibsen_museum_teater`

### Coordinate-role decision

**Resolved role: current public visitor entrance/display marker at Henrik Ibsens gate 26.**

The historical apartment remains explicitly identified as **Arbins gate 1** in place content and source metadata.

This is not a contradiction: the museum's own current visitor information uses Henrik Ibsens gate 26 as the public address and describes step-free entry directly from street level, while its history and apartment pages identify the preserved Ibsen home as Arbins gate 1.

### Production decision

Do not promote an OSM/secondary coordinate while the normal official-address path remains available in principle.

Run and save:

```bash
npm run places:coords:find:address -- --address "Henrik Ibsens gate 26 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/ibsen_museum_teater.json
```

If the result is an unambiguous Geonorge address point for the visitor building/entrance, use the standard address fields:

- `locatorType: "entrance"` or `building` depending on the returned representation and final source-file convention;
- `sourceProvider: "official_address"`;
- `geocodeAccuracy: "rooftop"`;
- `coordRole: "display_marker"`;
- `coordType: "address_point"`;
- `coordStatus: "verified"`.

Required note: the point is the current public visitor anchor; Henrik Ibsen's preserved historical apartment is at Arbins gate 1 within the same museum complex/building context.

Status: **ROLE RESOLVED; COORDINATE STILL PENDING GEONORGE.**

## 2. `norges_hjemmefrontmuseum`

### Physical identity

The official museum gives its visitor address as **Akershus festning, bygning 21**. The museum's own history states that the museum was created by adapting **Det dobbelte batteri** and the adjoining timber-framed building.

The named OSM building geometry for Det dobbelte batteri is:

- OSM way: `111833902`
- latitude: `59.90773`
- longitude: `10.73563`
- feature: `building=yes`

The geometry is therefore a better physical anchor than the broad `akershus_festning` parent marker.

### Coordinate decision

**Approved special geometry coordinate:**

```json
{
  "lat": 59.90773,
  "lon": 10.73563,
  "locatorType": "building",
  "sourceProvider": "osm",
  "sourceObjectId": "osm-way:111833902",
  "geocodeAccuracy": "geometric_center",
  "coordRole": "building_center",
  "coordType": "building_center",
  "coordStatus": "verified_geometry",
  "coordSource": "osm",
  "coordSourceId": "osm-way:111833902",
  "coordSourceUrl": "https://www.openstreetmap.org/way/111833902"
}
```

Required cross-check note: the official museum identifies the destination as building 21 at Akershus festning and documents the reuse of Det dobbelte batteri; OSM way 111833902 is the named building geometry used for the display anchor.

Status: **SPECIAL COORDINATE APPROVED.**

## 3. `forsvarsmuseet`

### Physical identity

The official museum states that Forsvarsmuseet is in the old arsenal building and gives the visitor location as **Forsvarsmuseet, bygning 62, Akershus festning**.

The exact OSM museum/building geometry is:

- OSM way: `54830211`
- latitude: `59.90451`
- longitude: `10.74089`
- features: `building=yes`, `tourism=museum`

The object identity is independently consistent with the known Hovedarsenalet/Forsvarsmuseet building and must not be replaced by the broad fortress marker.

### Coordinate decision

**Approved special geometry coordinate:**

```json
{
  "lat": 59.90451,
  "lon": 10.74089,
  "locatorType": "building",
  "sourceProvider": "osm",
  "sourceObjectId": "osm-way:54830211",
  "geocodeAccuracy": "geometric_center",
  "coordRole": "building_center",
  "coordType": "building_center",
  "coordStatus": "verified_geometry",
  "coordSource": "osm",
  "coordSourceId": "osm-way:54830211",
  "coordSourceUrl": "https://www.openstreetmap.org/way/54830211"
}
```

Required cross-check note: the official museum identifies building 62 and the old arsenal building; OSM way 54830211 is the exact museum/building geometry used for the display anchor.

Status: **SPECIAL COORDINATE APPROVED.**

## 4. `roseslottet`

### Physical identity and temporal status

Roseslottet is a large named outdoor installation rather than one ordinary addressable building. The official site states that it lies about 50 metres from Frognerseteren T-banestasjon, but the station point must not be reused as the place coordinate.

The named OSM installation geometry is:

- OSM way: `1004591108`
- latitude: `59.97969`
- longitude: `10.67616`
- feature: `tourism=artwork`
- `artwork_type=installation`

The official site currently states that Roseslottet opened in 2020 and is planned to remain through the end of 2026.

### Coordinate decision

**Approved special geometry coordinate:**

```json
{
  "lat": 59.97969,
  "lon": 10.67616,
  "locatorType": "poi",
  "sourceProvider": "osm",
  "sourceObjectId": "osm-way:1004591108",
  "geocodeAccuracy": "geometric_center",
  "coordRole": "site_center",
  "coordType": "site_center",
  "coordStatus": "verified_geometry",
  "coordSource": "osm",
  "coordSourceId": "osm-way:1004591108",
  "coordSourceUrl": "https://www.openstreetmap.org/way/1004591108"
}
```

Required note: the point is the geometric center of the named Roseslottet installation area, not Frognerseteren station and not a claimed exact entrance point.

Required current-status metadata: time-limited installation; current official plan through the end of 2026. This status must be reviewed before the place is presented as active after 2026.

Status: **SPECIAL COORDINATE APPROVED WITH TIME-LIMITED-SITE FLAG.**

## Result

| placeId | coordinate status | method |
| --- | --- | --- |
| `ibsen_museum_teater` | pending | role resolved; Geonorge visitor-address run still required |
| `norges_hjemmefrontmuseum` | approved | exact OSM building geometry + official identity cross-check |
| `forsvarsmuseet` | approved | exact OSM museum/building geometry + official identity cross-check |
| `roseslottet` | approved | named OSM installation geometry + official site/status cross-check |

Three of the four special cases can now proceed directly into canonical place production. Ibsen Museum & Teater remains in the address-first queue solely for the final official address point; the physical role itself is no longer ambiguous.
