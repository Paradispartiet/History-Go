# Nore stave church coordinate production

Date: 2026-07-28  
Place: `nore_stavkirke`

## Result

- Previous coordinate: `60.1663, 8.8082`
- Applied coordinate: `60.16456, 9.01025`
- Displacement: approximately `11178.9 m` east
- Coordinate status: `verified_geometry`
- Coordinate role: `medieval_stave_church_building_anchor`
- Source objects: `osm-way:546328493;wikidata:Q1557490;kulturminne:85174`
- Gameplay radius: `260 m`

## Identity decision

The canonical place represents the protected Nore stave-church building. The direct OpenStreetMap building geometry agrees with Wikidata and Lokalhistoriewiki within a few metres.

The following remain separate components:

- Nore old cemetery;
- Nore rectory;
- the newer Nore church about 540 metres north;
- the visitor-arrival and parking functions at Fjordevegen 90.

## Coordinate conflict

Fortidsminneforeningen is the authoritative owner, history and visitor-information source. Its page's embedded map point, however, lies several kilometres south of the church and conflicts with:

- OpenStreetMap way `546328493`;
- Wikidata `Q1557490`;
- Lokalhistoriewiki's independent coordinate;
- Kulturminne ID `85174` and geotagged church documentation.

The embedded point is therefore rejected for geometry while the same official page remains valid for ownership, address, opening and historical interpretation.

## Chronology decision

`year: 1167` is retained with a corrected meaning. Dendrochronological samples show that timber in the central mast and a corner post was felled in winter 1166/1167. This is the earliest possible construction date, not a documented completion or consecration year. Other evidence places the standing medieval church in the later twelfth century, likely some years after 1167.

Major later layers include:

- new chancel in 1683;
- south and north transept additions in 1709 and 1714;
- porch in 1723;
- roof rider and decorative phase around 1730;
- sacristy completed by 1772;
- Fortidsminneforeningen ownership from 1890.

The present cross-shaped form must therefore be described as a medieval central-mast church with substantial later log-built additions, not as an entirely unchanged 1167 cross church.

## Coordinate controls

1. OpenStreetMap way `546328493` provides direct named church-building geometry at `60.16456, 9.01025`.
2. Wikidata `Q1557490` independently links the same coordinate, OSM way, Church of Norway building ID `589`, Kulturminne `85174` and Fjordvegen 90.
3. Lokalhistoriewiki gives `60.1645778, 9.0102556`, independently confirming the applied point.
4. Fortidsminneforeningen confirms identity, ownership since 1890, visitor address and seasonal access.
5. Store norske leksikon and Lokalhistoriewiki control the dendrochronological dating and building history.

## Access and safety

- Interior access follows seasonal opening, tickets and guided visitor rules.
- Summer worship and other ceremonies can take precedence over tourism and gameplay.
- Portals, painted surfaces, runes and historic inventory are vulnerable and must not be touched.
- The gameplay radius is not a building, cemetery, rectory, museum, heritage or access boundary.

## Governance boundary

The existing `desc` and `popupDesc` remain unchanged. A full textual correction of their simplified 1167 and cross-plan wording belongs in a separate place-description 4.2 production packet.

## Production files

1. `data/places/historie/buskerud/places_historie_buskerud_batch1/nore_stavkirke.json`
2. `data/coordinate-evidence/buskerud/historie/nore_stavkirke.json`
3. `reports/buskerud-coordinate-nore-stavkirke-source-probe/source-summary.json`
4. `reports/buskerud-coordinate-nore-stavkirke-production-2026-07-28.md`

Next unresolved manifest entry: `uvdal_stavkirke`.
