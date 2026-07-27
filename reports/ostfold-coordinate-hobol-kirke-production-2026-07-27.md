# Hobøl kirke – coordinate production

Date: 2026-07-27
Place ID: `hobol_kirke`
Canonical file: `data/places/historie/ostfold/places_historie_ostfold_batch5/hobol_kirke.json`

## Result

The canonical coordinate was moved from an undocumented remote point to the named medieval church building.

| Field | Previous | Applied |
|---|---:|---:|
| Latitude | 59.6232 | 59.60081 |
| Longitude | 10.9474 | 10.92389 |
| Radius | 260 m | 260 m |
| Distance |  | approximately 2819.5 m south-west |

Applied source object: `osm-way:81114208`
Independent entity: `wikidata:Q6493315`
Heritage identity: `kulturminne:84587`
Status: `verified_geometry`
Role: `medieval_church_building_anchor`

## Identity decision

The place represents Hobøl church, the standing Romanesque medieval stone church at Mjærumveien 53. It does not represent:

- the legacy point north-east of the church;
- the whole rectory property;
- the whole churchyard;
- a generic regional transition landscape;
- a permanent closure status derived from temporary 2025–2026 works.

The rectory and churchyard remain explicit context anchors.

## Coordinate evidence

1. OpenStreetMap way `81114208` supplies named church-building geometry at the applied point.
2. Wikidata `Q6493315` independently identifies Hobøl church at the same location and links Church of Norway building ID `1769`.
3. Kulturminne ID `84587` identifies Hobøl kirkested and its medieval heritage context.
4. Lokalhistoriewiki gives an independent church coordinate at `59.60076675, 10.92396232`, approximately 6 metres from the applied point.
5. The official church page gives the visitor address Mjærumveien 53.

## Historical interpretation

The church is a Romanesque stone building probably erected in the late twelfth century. The canonical `year: 1175` is retained with `yearQualifier: circa`; it is not presented as an exact construction or consecration date.

Norges Kirker documents the short, high nave, narrower choir and apse, together with the churchyard and the relationship between church and rectory. Later additions and repairs belong to separate post-medieval building layers.

The previous profile overemphasised broad regional transition and transport claims. The revised profile is anchored in the documented building, medieval kirkested, architecture and rectory relationship.

## Current use and access

The church remains an active church and ceremony site. Official pages documented a temporary closure from November 2025 until spring 2026 during works. A June 2026 confirmation schedule demonstrates continued active use, so the closure is not encoded as permanent.

History Go activity must remain outside graves, closed work areas and private rectory property. Services, funerals and other church activity take priority. The 260-metre gameplay radius is not a building, churchyard, property, heritage, ceremony or access boundary.

## Files in production scope

1. `data/places/historie/ostfold/places_historie_ostfold_batch5/hobol_kirke.json`
2. `data/coordinate-evidence/ostfold/historie/hobol_kirke.json`
3. `reports/ostfold-coordinate-hobol-kirke-source-probe/source-summary.json`
4. `reports/ostfold-coordinate-hobol-kirke-production-2026-07-27.md`

## Next manifest entry

`rakkestad_kirke`
