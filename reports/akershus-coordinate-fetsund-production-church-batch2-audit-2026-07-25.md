# Akershus coordinate production and medieval-church audit

Date: 2026-07-25

## Scope

This round continues the coordinate queue in Akershus. It first applies the production-ready Fetsund lenser point documented in PR #3792, then audits the five medieval-church records in `places_historie_akershus_batch2` without guessing from map previews.

Church batch:

- Tanum kirke
- Haslum kirke
- Skedsmo kirke
- Enebakk kirke
- Asker kirke / gamle kirkested

## Production change: Fetsund lenser

The legacy coordinate `59.9256, 11.1598` has been replaced by MiA's officially published GPS point after deterministic transformation from EUREF89 / UTM zone 32 to WGS84:

- published point: `32V N 6644601, E 620295`
- WGS84: `59.92129383059753, 11.151830033283264`
- movement from legacy marker: approximately `653.1 m`
- radius retained: `300 m`

The canonical record now uses:

- `locatorType: linear_area`
- `sourceProvider: official_map`
- `geocodeAccuracy: semantic_anchor`
- `coordRole: area_anchor`
- `coordStatus: verified_geometry`
- stable source id `mia-fetsundlenser:gps:32v-6644601-620295`

The point represents the museum and immediate visitor area. It does not claim to be the geometric centre of the complete floating boom system.

Sources:

- https://mia.no/fetsundlenser/slik-finner-du-oss
- https://mia.no/fetsundlenser/kontakt-oss
- https://epsg.io/25832

## Church audit results

| Place | Legacy marker versus named building candidate | Official identity/address evidence | Decision |
|---|---:|---|---|
| Tanum kirke | about `678.8 m` away | Tanumveien 133, 1341 Slependen | Current point is likely wrong. Resolve the Geonorge address object first, then compare with OSM way `112593369`. |
| Haslum kirke | about `9.3 m` away | Official page lists only Kirkeveien, without house number | Retain legacy point. Capture a stable property/address object or raw OSM way `35947041` before verification. |
| Skedsmo kirke | about `44.0 m` away | Gjoleidveien 2, 2019 Skedsmokorset | Run address-first lookup and compare the official point with OSM way `189055303` before moving. |
| Enebakk kirke | same rounded coordinate | Ignaveien 14, 1912 Enebakk | Coordinate is likely correct but remains unverified until the exact official address object or raw geometry is stored. |
| Asker kirke / gamle kirkested | about `3.4 m` from present church candidate | Current church at Kirkelia 7; Askertun is Kirkelia 3 | Treat as a layered historical site. Capture geometry and explicitly derive a historical/site anchor from the present church on the same documented site. |

## Key representation decisions

### Tanum kirke

The current point appears to be a locality-level marker, not a church marker. It must not be retained merely because it lies in the wider Tanum landscape. This is the first church production target after the audit.

### Haslum kirke

The current point is close to the named church geometry, but proximity is not source verification. The menighet office at Gml. Ringeriksvei 86 must not be used as a proxy for the church.

### Skedsmo kirke

The official church address is Gjoleidveien 2. Sten menighetshus is at Gjoleidveien 5 and must not be confused with the church source object.

### Enebakk kirke

No move should be made solely to manufacture a change. The likely production task is source-contract enrichment if the Geonorge address point confirms the existing marker.

### Asker kirke / gamle kirkested

The record is intentionally older than the standing building. Official church history states that the present church was built on the same site after the medieval church burned in 1878. The correct representation is therefore a documented historical/site anchor, not the adjacent Askertun office address.

## Validation

- Fetsund canonical JSON parsed successfully.
- All five church evidence JSON files parsed successfully.
- Fetsund metadata was checked against Coordinate Source Contract v1 and satisfies the `verified_geometry` semantic-area-anchor path.
- No canonical church coordinates were changed during this audit.
- No nearest/first-hit result was promoted to verified.
- No map-preview coordinate was copied directly into production.

## Next production order

1. Tanum kirke: resolve Tanumveien 133 through Geonorge and correct the large displacement.
2. Skedsmo kirke: resolve Gjoleidveien 2 and compare with the named building geometry.
3. Enebakk kirke: resolve Ignaveien 14 and likely add metadata without moving the marker.
4. Haslum kirke: obtain a stable official property object or materialize the named building geometry.
5. Asker kirke / gamle kirkested: materialize same-site geometry and derive the historical anchor explicitly.
