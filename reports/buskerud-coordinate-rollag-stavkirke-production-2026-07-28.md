# Rollag stave church coordinate production

Date: 2026-07-28  
Place: `rollag_stavkirke`

## Result

- Previous coordinate: `60.0255, 9.2768`
- Applied coordinate: `60.02106, 9.27318`
- Displacement: approximately `533.1 m` south-south-west
- Coordinate status: `verified_geometry`
- Coordinate role: `active_stave_church_building_anchor`
- Source objects: `osm-way:324221606;wikidata:Q1818591;kulturminne:85311`
- Gameplay radius: `260 m`

## Identity decision

The canonical place represents the active, congregation-owned Rollag stave-church building. The building coordinate is independently supported by OpenStreetMap, Wikidata and Lokalhistoriewiki.

Separate components are:

- Rollag churchyard and its stone crosses and historic grave markers;
- the protected and still occupied Rollag rectory about 260 metres east;
- Rollag open-air museum established from 1960;
- Kyrkjestugo and other parish-use buildings.

## Chronology correction

`year` changes from `1200` to approximate `1450`. Rollag kirkelige fellesråd reports that dendrochronological work published in 2016 dates the standing church to the middle of the fifteenth century. The historic church site is older, but that continuity must not be used to backdate the surviving stave core.

The year 1450 is a representative midpoint for the dating range, not an exact construction or consecration date.

Later layers include extensive rebuilding from around 1650 and rich seventeenth- and eighteenth-century furnishing and decoration. These changes are integral to Rollag's identity as a continuously used village church.

## Coordinate controls

1. OpenStreetMap way `324221606` gives direct named building geometry at `60.02106, 9.27318`.
2. Wikidata `Q1818591` independently links the coordinate, OSM way, Church of Norway building ID `918` and Kulturminne ID `85311`.
3. Lokalhistoriewiki gives `60.021054, 9.273148` and documents the churchyard and nearby rectory.
4. Rollag kirkelige fellesråd controls the new dendrochronological date and current parish use.
5. Norges Kirker controls the stave structure, later building layers and church-site layout.

## Access and safety

- The church is in regular liturgical use; services, weddings and funerals take precedence.
- Summer opening and guided visits follow current parish announcements.
- Painted surfaces, historic fittings, tarred walls and cemetery monuments must not be touched or marked.
- The gameplay radius is not a church, cemetery, rectory, museum, heritage or access boundary.

## Governance boundary

The existing `desc` and `popupDesc` remain unchanged. They do not state the obsolete year explicitly, so full prose revision is not required in this coordinate PR.

## Production files

1. `data/places/historie/buskerud/places_historie_buskerud_batch1/rollag_stavkirke.json`
2. `data/coordinate-evidence/buskerud/historie/rollag_stavkirke.json`
3. `reports/buskerud-coordinate-rollag-stavkirke-source-probe/source-summary.json`
4. `reports/buskerud-coordinate-rollag-stavkirke-production-2026-07-28.md`

Next unresolved manifest entry: `flesberg_stavkirke`.
