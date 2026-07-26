# Akershus coordinate production – Heggedal hovedgård

Date: 2026-07-26

## Scope

Production application for `heggedal_hovedgard`, the seventh record in the original eight-place Akershus history batch 2.

Canonical file:

`data/places/historie/akershus/places_historie_akershus_batch2/heggedal_hovedgard.json`

Evidence file:

`data/coordinate-evidence/akershus/historie/heggedal_hovedgard.json`

## Semantic scope

The canonical record represents the preserved historic farm complex and its conservation history. It is not reduced to:

- the present event-rental use of the main building;
- a generic Heggedal farm-name point;
- Hovedgården ungdomsskole;
- Heggedalshallen;
- the full historical land area once associated with the farm.

The farm complex consists of the protected main building, side building, storehouse, a newer outbuilding, the courtyard and the immediate garden environment.

## Published historical-site coordinate

Lokalhistoriewiki publishes:

`59.7836306, 10.4388194`

Stable source identity:

`lokalhistoriewiki:heggedal-hovedgard`

Source URL:

`https://lokalhistoriewiki.no/wiki/Heggedal_hovedg%C3%A5rd`

The source identifies Heggedalsbakken 23 and explicitly describes three old buildings surrounding a courtyard. The point is therefore used as the area anchor for the preserved farm complex.

## Previous coordinate

Legacy coordinate:

`59.78363, 10.43882`

Distance to the applied source coordinate:

approximately `0.1 m`

The production change is a precision and source-contract upgrade, not a material map movement.

## Official historical evidence

The foundation's official history documents:

- the farm in Bishop Eystein's land register from 1398;
- use as church property, Crown property and private farm;
- protection of the main building in 1974;
- establishment of the restoration foundation in 1975;
- completed restoration in 1976;
- three old buildings surrounding the courtyard.

Official historical source:

`https://www.heggedalhovedgaard.no/om-oss/historie/`

## Address and institutional identity

The foundation lists the visitor address:

`Heggedalsbakken 23, 1389 Heggedal`

Official address source:

`https://www.heggedalhovedgaard.no/kontakt-oss/`

The Brønnøysund Register Centre independently lists the same address for Stiftelsen Heggedal Hovedgård.

## Heritage identity

Cultural heritage ID `86083` identifies the protected main building. The building is described as dating from the 1830s with an older core from the 18th century.

Heritage source:

`https://www.kulturminnesok.no/minne?queryString=https://data.kulturminne.no/askeladden/lokalitet/86083`

The heritage ID is an identity and conservation cross-check. It does not reduce the canonical farmyard record to one building.

## Rejected coordinate candidates

### OSM tourism point

- source object: `osm-node:85904457`
- approximate coordinate: `59.78383, 10.43884`
- distance from applied point: approximately `22.3 m`

This is a valid named visitor point, but it is not preferred over the published coordinate tied directly to the described farm buildings around the courtyard.

### OSM farm-name point

- source object: `osm-node:10225952754`
- approximate coordinate: `59.78356, 10.43849`
- distance from applied point: approximately `20.0 m`

This is a broader farm/locality point and is not used as the historical courtyard anchor.

## Wrong-object exclusions

Hovedgården ungdomsskole at Heggedalsbakken 11 and Heggedalshallen are separate modern facilities northwest of the historic farm. Neither is used as an address proxy, geometry source or gameplay anchor.

## Production result

- previous coordinate: `59.78363, 10.43882`
- applied coordinate: `59.7836306, 10.4388194`
- displacement: approximately `0.1 m`
- `locatorType`: `historic_site`
- `sourceProvider`: `manual_research`
- `sourceObjectId`: `lokalhistoriewiki:heggedal-hovedgard`
- `geocodeAccuracy`: `semantic_anchor`
- `coordRole`: `area_anchor`
- `coordType`: `documented_historic_farmyard_anchor`
- `coordStatus`: `verified_historical_source`
- radius retained at `220 m`

## Coordinate Source Contract decision

The historical semantic-anchor path is satisfied because:

1. the place is explicitly a `historic_site`;
2. the source provider is `manual_research`;
3. the published coordinate has stable source identity;
4. the coordinate role is explicitly `area_anchor`;
5. the canonical object stores an anchor record;
6. official history establishes the site's continuity and conservation identity;
7. the active visitor address is independently documented;
8. nearby school and sports objects are explicitly excluded.

## Next queue item

`hvitsten_sjobodene`

This final batch-2 record represents a waterfront cultural environment. Production must distinguish the historic sea-storehouse environment from a generic Hvitsten locality, beach, harbour label or one individual building.
