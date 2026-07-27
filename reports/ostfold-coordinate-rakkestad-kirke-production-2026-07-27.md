# Rakkestad kirke – coordinate production

Date: 2026-07-27
Place ID: `rakkestad_kirke`
Canonical file: `data/places/historie/ostfold/places_historie_ostfold_batch5/rakkestad_kirke.json`

## Result

The canonical coordinate was moved from an undocumented point north-west of the site to the named medieval church building.

| Field | Previous | Applied |
|---|---:|---:|
| Latitude | 59.4254 | 59.41078 |
| Longitude | 11.3452 | 11.36931 |
| Radius | 260 m | 260 m |
| Distance |  | approximately 2121.6 m south-east |

Applied source object: `osm-way:316802556`
Independent entity: `wikidata:Q6494287`
Heritage identity: `kulturminne:85264`
Status: `verified_geometry`
Role: `medieval_church_building_anchor`

## Identity decision

The place represents Rakkestad church, the standing Romanesque medieval stone church at Kirkeveien 139. It does not represent:

- the legacy point near the settlement side;
- the full churchyard;
- Rakkestad rectory;
- the rectory's separate 1814 episode;
- a generic village-centre or transport corridor.

Rakkestad rectory remains a separate canonical place approximately 225 metres north of the church.

## Coordinate evidence

1. OpenStreetMap way `316802556` supplies named church-building geometry at the applied point.
2. Wikidata `Q6494287` independently links the same coordinate to Church of Norway building ID `446`, Kulturminne ID `85264` and Kirkeveien 139.
3. Rakkestad sokn identifies the building as a Romanesque medieval church from circa 1200 and documents the first written reference in 1370.
4. Norges Kirker documents the medieval stone core, the churchyard, the rectory north of the church and the major 1875 rebuilding.
5. The already verified `rakkestad_prestegard_1814` canonical provides the independent rectory coordinate and prevents entity conflation.

## Historical interpretation

The church was probably built around 1200. The canonical year is therefore retained with `yearQualifier: circa`; it is not an exact construction or consecration date.

The church appears in written sources in 1370. A major rebuilding in 1875 added the west tower, enlarged the chancel arch and portals and introduced large pointed windows. These changes are later architectural layers over a surviving medieval stone core.

The altarpiece from 1696 and pulpit and font from around 1700 provide a separate baroque inventory layer. This prevents the place from being reduced either to a generic medieval church or to the 1875 exterior alone.

## Separation from Rakkestad rectory

The rectory lies at `59.41279, 11.36889`, approximately 225 metres north of the church. It is already represented by `rakkestad_prestegard_1814`, with the 1797 main building and Christian Frederik's 1814 visit as its own narrative.

The church and rectory remain historically related, but their geometry, access conditions and principal historical episodes are not interchangeable.

## Current use and access

Rakkestad church remains an active church and cemetery site. History Go activity must remain outside graves, closed areas and private rectory property. Services, funerals and other church activity take priority. The 260-metre gameplay radius is not a building, churchyard, property, heritage, ceremony or access boundary.

## Files in production scope

1. `data/places/historie/ostfold/places_historie_ostfold_batch5/rakkestad_kirke.json`
2. `data/coordinate-evidence/ostfold/historie/rakkestad_kirke.json`
3. `reports/ostfold-coordinate-rakkestad-kirke-source-probe/source-summary.json`
4. `reports/ostfold-coordinate-rakkestad-kirke-production-2026-07-27.md`

## Next manifest entry

`brekke_sluser_haldenkanalen`
