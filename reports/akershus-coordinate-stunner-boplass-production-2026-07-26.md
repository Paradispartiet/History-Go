# Akershus coordinate production – Stunner steinalderboplass

Date: 2026-07-26

## Scope

Production application for `stunner_boplass`, the third record in the active Akershus history batch 3.

Canonical file:

`data/places/historie/akershus/places_historie_akershus_batch3/stunner_boplass.json`

Evidence file:

`data/coordinate-evidence/akershus/historie/stunner_boplass.json`

## Semantic scope

The record represents the specifically identified archaeological settlement field at Stunner. It does not represent:

- the modern Stunner hamlet;
- Stunner nordre farm;
- a generic Stunner locality;
- the memorial stone alone;
- an exact protected-site or excavation polygon.

The field point is used as the historical anchor. Stunnersteinen is an independent on-site marker that confirms the visitor-facing field identity.

## Archaeological identity

Ski Historielag documents:

- an approximately 11,000-year-old Stone Age settlement;
- Johannes Mikkelsen's discovery of flint in the field in 1928;
- Anders Nummedal's association of the finds with the Fosna complex;
- the site's later local recognition and marking.

Stable historical source identity:

`ski-historielag:stunner-boplass`

Source:

`https://www.ski-historielag.no/ski/Stunner`

Store norske leksikon independently identifies Stunner as an archaeological find site east of Ski and one of the earliest settlement traces in Akershus.

Source:

`https://snl.no/Stunner`

## Specific named field point

OpenStreetMap node `1784728445` is specifically named:

`Stunner Steinalderboplass`

Coordinate:

`59.74976, 10.91695`

Stable physical source identity:

`osm-node:1784728445`

Source:

`https://www.openstreetmap.org/node/1784728445`

This is used as the physical historical anchor for the archaeological field.

## On-site memorial cross-check

OpenStreetMap node `1784728449`, Stunnersteinen, lies approximately 4.4 metres from the named settlement point.

The memorial inscription identifies:

- the 11,000-year-old settlement;
- Johannes Mikkelsen's 1928 discovery;
- Ski Historielag's erection of the memorial in 2004.

Source:

`https://www.openstreetmap.org/node/1784728449`

The memorial confirms the field identity but is not treated as the archaeological settlement itself.

## Previous coordinate and rejected generic source

Legacy coordinate:

`59.74657, 10.91747`

This matches OpenStreetMap node `1779117990`, a broad and ambiguous Stunner archaeological/settlement object.

Distance to the specifically named settlement field:

approximately `355.9 m`

The generic object is rejected because it cannot distinguish the archaeological field from the wider Stunner place identity.

## Wrong-object exclusions

- Stunner hamlet lies approximately 778 metres from the applied anchor.
- Stunner nordre farm lies approximately 384 metres from the applied anchor.

The archaeological site was named from the local area, but neither the modern hamlet nor the farm is the settlement field.

## Landscape interpretation

Historical and municipal presentations explain that the shoreline stood much higher when people occupied Stunner. The archaeological field should therefore be interpreted in relation to an earlier coastal landscape rather than today's inland terrain.

The retained 420-metre radius supports this landscape reading. It is not an exact Askeladden boundary or excavation polygon.

## Production result

- previous coordinate: `59.74657, 10.91747`
- applied coordinate: `59.74976, 10.91695`
- displacement: approximately `355.9 m`
- `locatorType`: `historic_site`
- `sourceProvider`: `manual_research`
- `sourceObjectId`: `ski-historielag:stunner-boplass`
- `geocodeAccuracy`: `semantic_anchor`
- `coordRole`: `historical_anchor`
- `coordType`: `documented_stone_age_settlement_field_anchor`
- `coordStatus`: `verified_historical_source`
- physical anchor: OSM node `1784728445`
- radius retained at `420 m`

## Coordinate Source Contract decision

The historical semantic-anchor path is satisfied because:

1. the record is explicitly a `historic_site`;
2. Ski Historielag provides stable historical identity and discovery history;
3. SNL independently confirms the archaeological identity and dating;
4. a specifically named physical settlement point exists;
5. an independent on-site memorial stands approximately 4.4 metres away;
6. the broad legacy object, modern hamlet and farm are explicitly rejected;
7. the coordinate note distinguishes the field anchor from an exact protected-site polygon.

## Next queue item

`ski_middelalderkirke`

That record must be anchored to Ski medieval church and its documented church-site history, not to Ski town centre, the railway station, a parish office or a generic cemetery point.
