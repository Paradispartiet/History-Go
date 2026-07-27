# Aremark kirke coordinate production

Date: 2026-07-27  
Place ID: `aremark_kirke_kirkested`  
Category: `historie`  
Municipality: Aremark, Østfold

## Production decision

Move the canonical point from an undocumented remote location to the standing Aremark church building at the historic kirkested east of Aremarksjøen.

- Previous coordinate: `59.2212, 11.6959`
- Applied coordinate: `59.24473, 11.68211`
- Displacement: approximately `2,731.5 m` north-northwest
- Coordinate status: `verified_geometry`
- Coordinate role: `current_church_building_anchor`
- Source object: `osm-way:733677615`
- Entity: `wikidata:Q6492585`
- Heritage identity: `kulturminne:83789`
- Radius: `240 m`

## Why this point

OpenStreetMap way `733677615` is the named geometry for Aremark kirke. Its representative point directly identifies the standing church and aligns with Wikidata `Q6492585`, Kulturminne ID `83789`, the church address and the architectural history in Norges Kirker.

The applied point is stronger than the legacy coordinate, a road or bus-stop point, or an undifferentiated churchyard coordinate.

## Identity resolution

The record represents:

- the standing brick church erected in 1860–1861;
- the continuous Aremark kirkested;
- the medieval stone church as a historical layer at the same site;
- the churchyard and Aremarksjøen setting as context.

It does not represent:

- a surviving medieval church building;
- the whole churchyard as unrestricted gameplay space;
- a generic Aremark settlement point;
- the public-transport stop as the church itself.

## Construction and kirkested chronology

Norges Kirker supports the following chronology:

- a medieval stone church dedicated to St. Lawrence stood at the site;
- permission to replace the old church was obtained before construction;
- demolition of the medieval church took place in `1860`;
- the current brick church was designed by Peter Høier Holtermann;
- construction took place in `1860–1861`;
- the church was consecrated on `6 November 1861`;
- parts of the older inventory were transferred into the new church.

The canonical year `1861` is the consecration year of the standing building. It is not the beginning of the kirkested.

## Medieval layer

The medieval church and today's church belong to the same continuous kirkested, but they must not be conflated:

- the medieval stone building was demolished;
- it has no separately verified standing footprint;
- the current church is the physical canonical anchor;
- the medieval church remains an interpretive and quiz layer at the same place.

## Public arrival and access

OpenStreetMap node `6373485107` at `59.24487, 11.68278` is retained as a separate public transport and roadside-arrival anchor approximately 41 metres east of the church point.

Gameplay limitations:

- services, funerals and cemetery use take precedence;
- tasks must not interfere with graves, memorials or ceremonies;
- interior access follows current parish arrangements;
- the coordinate does not guarantee that the church is open;
- the radius is not a building, cemetery, heritage, property, shoreline, ceremony or access boundary.

## Separate anchors

### Standing church

- Coordinate: `59.24473, 11.68211`
- Source: OSM way `733677615`
- Role: canonical current church-building anchor

### Medieval kirkested

- Coordinate: same site layer as the current church
- Source: Norges Kirker
- Role: historical layer for the demolished medieval stone church

### Public arrival

- Coordinate: `59.24487, 11.68278`
- Source: OSM node `6373485107`
- Role: public transport and roadside-arrival anchor

## Files changed

1. `data/places/historie/ostfold/places_historie_ostfold_batch4/aremark_kirke_kirkested.json`
2. `data/coordinate-evidence/ostfold/historie/aremark_kirke_kirkested.json`
3. `reports/ostfold-coordinate-aremark-kirke-source-probe/source-summary.json`
4. `reports/ostfold-coordinate-aremark-kirke-production-2026-07-27.md`

## Next unresolved manifest entry

`kornsjo_grensestasjon`
