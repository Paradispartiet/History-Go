# Uvdal stave church coordinate production

Date: 2026-07-28  
Place: `uvdal_stavkirke`

## Result

- Previous coordinate: `60.2677, 8.5986`
- Applied coordinate: `60.26514, 8.83478`
- Displacement: approximately `13028.2 m` east
- Coordinate status: `verified_geometry`
- Coordinate role: `medieval_stave_church_building_anchor`
- Source objects: `osm-way:220941602;wikidata:Q1398030`
- Gameplay radius: `260 m`

## Identity decision

The canonical place represents the protected Uvdal stave-church building at Kirkebygda 111. OpenStreetMap building geometry agrees with Wikidata and the owner's official coordinate.

Separate components are:

- Nore og Uvdal bygdetun on the old rectory ground;
- Uvdal old cemetery;
- the newer Uvdal church from 1893 in the valley bottom;
- the shared visitor reception and ticket function in Skolestua.

## Site-continuity correction

The current `desc` and `popupDesc` say that the stave church was moved into Uvdal open-air museum. The source record does not support that claim. The open-air museum was developed on the old rectory ground near the historic stave-church site, and the church remained the parish church there until 1893.

Place-description governance prevents silently changing this prose in a coordinate PR. The false move claim is therefore:

- explicitly rejected in the canonical metadata and evidence;
- retained unchanged in `desc` and `popupDesc` for PR isolation;
- flagged for a separate place-description 4.2 production.

## Chronology decision

`year` changes from a loose 1190 to `1168`. This is the dendrochronological felling year for construction timber. The material appears to have been used before fully drying, so the church was probably built shortly afterwards. It is not an exact consecration date.

Later layers include the thirteenth-century portal, repeated expansions, rich painted interiors from the seventeenth through nineteenth centuries, replacement as parish church in 1893, Fortidsminneforeningen ownership from 1901 and archaeological investigations in 1978.

## Coordinate controls

1. OpenStreetMap way `220941602` gives direct named building geometry at `60.26514, 8.83478`.
2. Wikidata `Q1398030` independently identifies the same church.
3. Fortidsminneforeningen gives the nearby official coordinate `60.265536, 8.8348002`, address and current visitor operation.
4. Nore og Uvdal bygdetun documents that the museum is on the old rectory ground near the church.
5. Lokalhistoriewiki distinguishes the stave church from Uvdal church from 1893.

## Access and safety

- Interior access follows seasonal tickets, guides and worship use.
- Painted surfaces, portals, inventory and archaeological areas are vulnerable.
- The open-air museum contains multiple historic buildings with separate access conditions.
- The gameplay radius is not a church, museum, cemetery, property, heritage or access boundary.

## Governance boundary

`desc` and `popupDesc` remain unchanged. Their incorrect move claim must be corrected in a separate place-description 4.2 packet.

## Production files

1. `data/places/historie/buskerud/places_historie_buskerud_batch1/uvdal_stavkirke.json`
2. `data/coordinate-evidence/buskerud/historie/uvdal_stavkirke.json`
3. `reports/buskerud-coordinate-uvdal-stavkirke-source-probe/source-summary.json`
4. `reports/buskerud-coordinate-uvdal-stavkirke-production-2026-07-28.md`

Next unresolved manifest entry: `rollag_stavkirke`.
