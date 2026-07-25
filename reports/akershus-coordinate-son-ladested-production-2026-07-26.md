# Akershus coordinate production – Son ladested

Date: 2026-07-26

## Scope

Production application for `son_ladested`, the sixth record in the active Akershus history batch 3. The record was later migrated to category `by`.

Canonical file:

`data/places/by/akershus/son_ladested/son_ladested.json`

Evidence file:

`data/coordinate-evidence/akershus/by/son_ladested.json`

## Semantic scope

The canonical record represents Son as a coherent historic ladested and coastal-town environment:

- Son torv;
- Thornegården;
- Stoltenberggården;
- Spinnerigården;
- the central historic street structure;
- the relationship between the trade houses and the old harbour.

The record is not reduced to:

- Thornegården alone;
- Son marina;
- Sonsstranda;
- one arbitrary protected building;
- the entire modern Son / Moss continuous settlement;
- an exact conservation polygon.

## Official historic-area identity

Vestby municipality identifies Son as:

- a historic ladested;
- a timber-export and shipping port whose trading rise began around 1550;
- a customs place with rights from 1604;
- a nationally important historic urban area;
- a centre with surviving trade houses from the period of prosperity.

Source:

`https://www.vestby.kommune.no/om-vestby/son`

Stable top-level source identity:

`vestby-kommune:son-historisk-byomrade`

## Collective cultural-environment value

Vestby municipality's preservation guidance states that Son's self-grown small-town character remains largely intact and that the collective cultural value of central Son is more important than the individual buildings in isolation.

Source:

`https://www.vestby.kommune.no/tjenester/plan-bygg-og-eiendom/byggesak/skal-du-bygge-rive-eller-endre/bevaring-og-kulturminner`

This establishes that the canonical object must be represented as a historic area rather than one building.

## Physical anchor

OpenStreetMap way `369923177` is the stable named building geometry for Thornegården at Son torv.

Approximate anchor coordinate:

`59.52352, 10.68665`

Stable physical identity:

`osm-way:369923177`

Source:

`https://www.openstreetmap.org/way/369923177`

Thornegården is used as the physical area anchor because it stands in the core trade-house and square environment and has a stable object identity. The canonical record remains the wider ladested environment.

## Heritage and independent cross-checks

Cultural heritage ID `86110` identifies the protected Thornegården building.

Source:

`https://www.kulturminnesok.no/minne?queryString=https://data.kulturminne.no/askeladden/lokalitet/86110`

Lokalhistoriewiki publishes Thornegården at `59.523619, 10.686456` and connects it to Son torv and the historic quay relationship.

Source:

`https://lokalhistoriewiki.no/wiki/Thorneg%C3%A5rden_(Son)`

Store norske leksikon independently documents Son's timber-port and customs history and identifies Thornegården, Stoltenberggården, Spinnerigården and other buildings as material evidence of the former trading prosperity.

Source:

`https://snl.no/Son_-_tettsted_i_Vestby`

## Previous coordinate

Legacy coordinate:

`59.5208, 10.6849`

Distance to the Thornegården anchor:

approximately `318.1 m`

The legacy point lay southwest of the historic centre and lacked a stable identity connecting it specifically to Son torv, the trade houses or the nationally important historic urban environment.

## Production result

- previous coordinate: `59.5208, 10.6849`
- applied coordinate: `59.52352, 10.68665`
- displacement: approximately `318.1 m`
- `locatorType`: `historic_site`
- `sourceProvider`: `manual_research`
- `sourceObjectId`: `vestby-kommune:son-historisk-byomrade`
- `geocodeAccuracy`: `semantic_anchor`
- `coordRole`: `area_anchor`
- `coordType`: `documented_historic_ladested_center_anchor`
- `coordStatus`: `verified_historical_source`
- physical anchor: OSM way `369923177`
- radius retained at `320 m`

## Coordinate Source Contract decision

The historical semantic-area-anchor path is satisfied because:

1. the place is explicitly represented as a `historic_site`;
2. Vestby municipality provides stable official historic-area identity;
3. municipal preservation guidance defines the collective urban structure as the main cultural value;
4. Thornegården provides a stable named physical object at Son torv;
5. the protected-building identity and independent historical sources cross-check the anchor;
6. the coordinate note explicitly distinguishes the physical anchor from the full cultural environment;
7. marina, beach and modern-settlement interpretations are rejected.

## Radius and representation

The retained 320-metre radius covers, at gameplay scale:

- Son torv;
- the central historic streets;
- the major surviving trade houses;
- the connection toward the old harbour.

It is not an exact national-interest boundary, regulatory conservation zone or geometric centre of the historic town.

## Next queue item

`holen_ladested`

That record represents a river, sawmill, bridge and transport landscape. Production must choose an anchor that captures the old ladested and crossing environment without reducing Hølen to the railway viaduct alone or using a generic modern settlement point.
