# VisitOSLO Oslofjorden — final coordinate intake

Date: 2026-07-21

## Result

All **11 approved candidates** from the merged physical-scope audit now have a production-ready coordinate decision.

- 11 approved candidates
- 11 coordinate-ready candidates
- 0 canonical identity duplicates found in the intake runs
- 0 unresolved coordinate decisions

## Production-ready coordinate queue

| placeId | Name | Coordinate | Primary source identity | Coordinate model |
|---|---|---|---|---|
| `heggholmen` | Heggholmen | 59.88374, 10.71305 | `kartverket-ssr:692270` | Exact active SSR object, `Øy i sjø` |
| `rambergoya` | Rambergøya | 59.88025, 10.72007 | `kartverket-ssr:489838` | Exact active SSR object, `Øy i sjø` |
| `ormoya` | Ormøya | 59.877238716487454, 10.760332278136202 | `osm-way:4154500` | Exact named island/islet polygon |
| `malmoya` | Malmøya | 59.86767369909778, 10.756803452030066 | `osm-way:35213472` | Exact named island polygon |
| `nakholmen` | Nakholmen | 59.889584926598545, 10.694851942199495 | `osm-way:4154397` | Exact named island/islet polygon |
| `steilene` | Steilene | 59.81768354575886, 10.607351639955356 | `osm-relation:15882838` | Exact named archipelago multipolygon |
| `langoyene` | Langøyene | 59.87180284489248, 10.718234309408619 | `osm-way:4154560` | Exact named present-day island polygon |
| `lindoya` | Lindøya | 59.890079734831424, 10.713192091385766 | `osm-relation:11816904` | Exact named island polygon |
| `ingierstrand_bad` | Ingierstrand bad | 59.81831, 10.74834 | `kartverket-ssr:448130` | Exact active SSR object, `Badeplass`; whole-site semantic anchor |
| `bleikoya` | Bleikøya | 59.89024108759495, 10.74219742405063 | `osm-way:4154383` | Exact named island polygon |
| `ulvoya` | Ulvøya | 59.867982824709344, 10.770784753488378 | `osm-way:4154565` | Exact named island/islet polygon |

## Why Heggholmen and Rambergøya use SSR points

The first strict OSM pass deliberately accepted only exact island, islet or archipelago objects. Heggholmen and Rambergøya are now physically connected to the surrounding Gressholmen island system, and the exact OSM name objects appeared as `cape` rather than separate accepted island polygons.

Kartverket's Sentralt stedsnavnregister resolves the ambiguity cleanly:

- Heggholmen: active approved name, object type `Øy i sjø`, stedsnummer `692270`.
- Rambergøya: active approved name, object type `Øy i sjø`, stedsnummer `489838`.

The official SSR representation points are therefore used as documented semantic area anchors. This preserves the separately named island identities without pretending that a modern detached shoreline polygon exists.

## Why Ingierstrand uses the SSR bathing-place point

The canonical scope is the complete protected functionalist bathing complex, not the restaurant building alone.

Riksantikvaren's current distribution service did not return one unique named non-point Ingierstrand area object. Kartverket SSR, however, returns one exact active place object:

- `Ingierstrand bad`
- object type `Badeplass`
- stedsnummer `448130`
- coordinate `59.81831, 10.74834`

The exact Geonorge address point for Ingierstrandveien 30 lies 197.8 metres away. This is retained as a physical cross-check for one building in the complex, while the SSR bathing-place object remains the canonical whole-site anchor.

## Coordinate-contract normalization

The source runners sometimes used descriptive intermediate values that are not part of coordinate source contract v1. The final production configurations are normalized here:

- Kartverket SSR sources use `sourceProvider: "kartverket"`.
- SSR semantic area anchors use `coordStatus: "verified_geometry"`, `geocodeAccuracy: "semantic_anchor"` and `coordRole: "area_anchor"`.
- Exact OSM island geometries use `sourceProvider: "osm"`, `coordStatus: "verified_geometry"`, `geocodeAccuracy: "geometric_center"` and `coordRole: "area_anchor"`.

## County-path guard

VisitOSLO source inclusion does not override physical geography.

- Steilene: Nesodden, Akershus.
- Langøyene: Nesodden, Akershus.
- Ingierstrand bad: Nordre Follo, Akershus.

Those places must use the appropriate Akershus data paths and must not be forced into Oslo directories or the Oslo coordinate protocol. The eight candidates physically in Oslo municipality remain Oslo production candidates.

Status: **COORDINATE INTAKE CLOSED — 11/11 READY FOR CANONICAL PRODUCTION.**
