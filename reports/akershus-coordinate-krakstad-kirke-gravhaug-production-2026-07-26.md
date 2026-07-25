# Akershus coordinate production – Kråkstad kirke og gravhaug

Date: 2026-07-26

## Scope

Production application for `krakstad_kirke_og_gravhaug`, the fifth record in the active Akershus history batch 3.

Canonical file:

`data/places/historie/akershus/places_historie_akershus_batch3/krakstad_kirke_og_gravhaug.json`

Evidence file:

`data/coordinate-evidence/akershus/historie/krakstad_kirke_og_gravhaug.json`

## Semantic scope

The canonical record represents a layered historical landscape:

- the standing medieval stone church;
- the churchyard;
- nearby Iron Age burial mounds;
- the ancient route between the church and parsonage;
- the transition from pre-Christian burial landscape to Christian church site.

The standing church is the stable physical anchor. The record is not reduced to the building alone, but no unsupported secondary coordinate is created for a burial mound that lacks a stable specific open-map identity.

## Official church address and history

Kråkstad menighet lists:

`Prestegårdsalléen 2, 1408 Kråkstad`

Source:

`https://www.kirken.no/nn-NO/fellesrad/nordre-follo/menigheter/kr%C3%A5kstad/om%20oss/kontaktinformasjon/`

The official parish history dates the late-Romanesque stone church to the period 1150–1200 and documents the medieval nave and chancel, the 1801 fire and the 1882 tower.

Source:

`https://www.kirken.no/nb-NO/fellesrad/nordre-follo/menigheter/kr%C3%A5kstad/om%20oss/kirken/`

## Physical anchor

OpenStreetMap way `137123341` is the stable named building geometry for Kråkstad church.

Coordinate:

`59.67658, 10.88091`

Stable physical source identity:

`osm-way:137123341`

Source:

`https://www.openstreetmap.org/way/137123341`

The church building supplies the physical historical anchor for the wider documented landscape.

## Burial-mound landscape

Ski Historielag documents:

- Iron Age burial mounds at both Ski and Kråkstad medieval church sites;
- burial mounds west of Kråkstad church;
- a Viking-age axe find approximately 50 metres north of one of the western mounds;
- a broader pattern in which medieval churches were placed close to pre-Christian burial fields;
- ceremonial cooking-pit activity east of Kråkstad church from the centuries after the beginning of the Common Era.

Source:

`https://www.ski-historielag.no/ski/Kultsteder`

Store norske leksikon states that the burial mound by Kråkstad church is the largest in Follo.

Source:

`https://snl.no/Nordre_Follo`

## No fabricated secondary coordinate

Multiple attempts were made to identify a stable, specific open-map object for the largest mound. The available open map data did not expose an object identity precise enough for a defensible secondary anchor.

Production therefore does not:

- invent a gravhaug coordinate from a prose direction;
- promote a generic archaeological or cemetery point;
- treat the church coordinate as the exact mound point;
- claim that the 260-metre radius is an exact archaeological polygon.

The burial-mound component is historically verified and included within the coherent site radius, but remains without a separate coordinate until a stable archaeological object identity is available.

## Heritage identity

Cultural heritage ID `84847` identifies Kråkstad church site and the protected medieval church.

Source:

`https://www.kulturminnesok.no/minne?queryString=https://data.kulturminne.no/askeladden/lokalitet/84847`

The heritage ID supports the church-site identity but is not used as a substitute for a separate burial-mound record.

## Landscape cross-check

Lokalhistoriewiki describes Kråkstad parsonage immediately beside the church in a landscape containing multiple burial mounds and an ancient route between the parsonage and church site.

Source:

`https://lokalhistoriewiki.no/wiki/Kr%C3%A5kstad_presteg%C3%A5rd`

This supports a coherent single destination and the retained area radius.

## Previous coordinate

Legacy coordinate:

`59.6833, 10.8833`

Distance to the named church anchor:

approximately `759.2 m`

The legacy point could not be tied to the church building, burial mounds, churchyard or a stable source object and is rejected.

## Production result

- previous coordinate: `59.6833, 10.8833`
- applied coordinate: `59.67658, 10.88091`
- displacement: approximately `759.2 m`
- `locatorType`: `historic_site`
- `sourceProvider`: `manual_research`
- `sourceObjectId`: `ski-historielag:krakstad-kirke-og-gravfelt`
- `geocodeAccuracy`: `semantic_anchor`
- `coordRole`: `historical_anchor`
- `coordType`: `documented_medieval_church_and_iron_age_burial_landscape_anchor`
- `coordStatus`: `verified_historical_source`
- physical anchor: OSM way `137123341`
- official address: `Prestegårdsalléen 2, 1408 Kråkstad`
- radius retained at `260 m`

## Coordinate Source Contract decision

The historical semantic-anchor path is satisfied because:

1. the record is explicitly a `historic_site`;
2. official parish sources establish the church's active address and medieval building identity;
3. Ski Historielag establishes the burial-mound and pre-Christian landscape component;
4. SNL independently confirms the importance of the large mound;
5. the named church building supplies a stable physical anchor;
6. the coordinate note explains why the landscape is represented without an unsupported secondary mound coordinate;
7. the radius is described as gameplay-scale landscape coverage rather than exact archaeological geometry.

## Next queue item

`son_ladested`

That record represents a historic coastal town and conservation environment rather than a single building. Production must distinguish the old Son street and harbour environment from the modern centre point, marina, railway-associated place names and one arbitrary listed building.
