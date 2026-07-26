# Akershus coordinate production – Ski middelalderkirke

Date: 2026-07-26

## Scope

Production source-contract upgrade for `ski_middelalderkirke`, the fourth record in the active Akershus history batch 3.

Canonical file:

`data/places/historie/akershus/places_historie_akershus_batch3/ski_middelalderkirke.json`

Evidence file:

`data/coordinate-evidence/akershus/historie/ski_middelalderkirke.json`

## Previous state

- coordinate: `59.72241, 10.86144`
- radius: `220 m`
- no Coordinate Source Contract metadata
- point already lay at the named medieval church building

## Primary geometry source

OpenStreetMap way `167092121` is the stable named building geometry for Ski middelalderkirke.

Stable source identity:

`osm-way:167092121`

Source URL:

`https://www.openstreetmap.org/way/167092121`

The published building position is approximately:

`59.72242, 10.86148`

The canonical coordinate lies about 2.5 metres away and is retained without an artificial move.

## Official address

Nordre Follo kirkelige fellesråd lists:

`Kirkeveien 57, 1400 Ski`

Source:

`https://www.kirken.no/nb-NO/fellesrad/nordre-follo/kontakt/adresser/`

The same official source separately lists Ski Nye kirke in Birkelunden. This distinction prevents the newer church or the parish administration from being used as a proxy for the medieval building.

## Official building history

Ski menighet documents that:

- the Romanesque stone church was built in the middle of the 12th century;
- the original church consisted of nave and chancel;
- traces of medieval portals and windows remain visible;
- the west tower was added in 1860;
- the sacristy was added in 1934;
- the medieval soapstone baptismal font remains in the church.

Source:

`https://www.kirken.no/nb-NO/fellesrad/nordre-follo/menigheter/ski/om%20oss/kirkene/ski%20kirke/`

## Heritage identity

Cultural heritage ID `85453` identifies Ski church site and the protected medieval church.

Source:

`https://www.kulturminnesok.no/minne?queryString=https://data.kulturminne.no/askeladden/lokalitet/85453`

The heritage ID is used as an official identity and protection cross-check. The named OSM building geometry remains the physical marker source.

## Local site context

Ski Historielag describes the medieval church on the moraine ridge associated with the earliest known settlement in Ski. This supports the interpretation of the surrounding churchyard as a long-lived historic centre rather than merely a modern cemetery or suburban church plot.

Source:

`https://www.ski-historielag.no/ski/Ski%20middelalderkirke`

## Wrong-object exclusions

The following are explicitly excluded:

- Ski Nye kirke at Birkelunden 4;
- parish and fellesråd offices in Birkelunden;
- Ski town centre;
- Ski railway station;
- a generic cemetery or chapel point.

## Production result

- coordinate retained: `59.72241, 10.86144`
- displacement: `0.0 m`
- `locatorType`: `building`
- `sourceProvider`: `osm`
- `sourceObjectId`: `osm-way:167092121`
- `geocodeAccuracy`: `building`
- `coordRole`: `display_marker`
- `coordType`: `named_medieval_church_building_point`
- `coordStatus`: `verified_geometry`
- official address added: `Kirkeveien 57, 1400 Ski`
- radius retained at `220 m`

## Coordinate Source Contract decision

The named-building geometry path is satisfied because:

1. the canonical record represents the standing medieval church building;
2. the stable OSM way directly represents that building;
3. the existing coordinate is approximately 2.5 metres from the published building position;
4. the official church authority supplies the active address;
5. the official parish history establishes the medieval building identity;
6. Kulturminne ID 85453 independently confirms the protected church site;
7. the newer church and administration are explicitly excluded.

## Radius and representation

The marker represents the church building. The retained 220-metre radius covers the immediate churchyard and historic church-site environment at gameplay scale. It is not an exact cemetery or heritage polygon.

## Next queue item

`krakstad_kirke_og_gravhaug`

That record combines a standing medieval church with a nearby Iron Age burial mound. Production must determine whether one canonical point plus a documented secondary anchor is sufficient, or whether the place requires a formal multi-anchor representation.
