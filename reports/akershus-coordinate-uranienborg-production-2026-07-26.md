# Akershus coordinate production – Roald Amundsens hjem Uranienborg

Date: 2026-07-26

## Scope

Production source-contract upgrade for `roald_amundsens_hjem_uranienborg`, the second record in the active Akershus history batch 3.

Canonical file:

`data/places/historie/akershus/places_historie_akershus_batch3/roald_amundsens_hjem_uranienborg.json`

Evidence file:

`data/coordinate-evidence/akershus/historie/roald_amundsens_hjem_uranienborg.json`

## Previous state

- coordinate: `59.78616, 10.73388`
- radius: `260 m`
- no coordinate-source metadata
- point already lay at the preserved main house

## Primary geometry source

OpenStreetMap way `171658078` is the stable named building geometry for Roald Amundsens hjem Uranienborg.

Stable source identity:

`osm-way:171658078`

Source URL:

`https://www.openstreetmap.org/way/171658078`

The canonical point is approximately 1.5 metres from the structured house coordinate `59.7861694, 10.7338611`. No artificial coordinate movement is necessary.

## Official address

MiA lists:

`Roald Amundsens vei 192, 1420 Svartskog`

Source:

`https://mia.no/roaldamundsen/finn`

The same page distinguishes the historic house from Bålerud pier, which is used for parking and arrival.

## Official historical identity

MiA documents that:

- the house was built around 1865;
- it was originally part of Bålerud farm and known as Rødsten / Nedre Rødsten;
- Roald Amundsen bought it in 1908 and named it Uranienborg;
- he planned and prepared several expeditions there;
- the house remains furnished substantially as he left it in 1928;
- the property has been a museum since 1934.

Sources:

- `https://mia.no/roaldamundsen/om_oss`
- `https://mia.no/roaldamundsen/om-uranienborg`
- `https://amundsen.mia.no/resource/uranienborgs-historie/`

## Property scope

The Uranienborg property includes:

- main house;
- outbuilding;
- bathhouse;
- icehouse;
- gazebo;
- guard house / visitor centre;
- smaller structures;
- pier and shoreline environment.

The canonical marker represents the main house. The 260-metre radius covers the immediate coherent property environment rather than converting the place into an imprecise area-centre point.

## Wrong-object exclusions

The following are explicitly excluded as coordinate anchors:

- Bålerud pier, which is the nearby parking and arrival point;
- Rødsten, the separate neighbouring property associated with Amundsen's family;
- Uranienborgveien in Oslo, connected to Amundsen's childhood and the origin of the name;
- generic Svartskog locality points;
- the Bunnefjorden shoreline independent of the house.

## Production result

- coordinate retained: `59.78616, 10.73388`
- displacement: `0.0 m`
- `locatorType`: `building`
- `sourceProvider`: `osm`
- `sourceObjectId`: `osm-way:171658078`
- `geocodeAccuracy`: `building`
- `coordRole`: `display_marker`
- `coordType`: `named_historic_house_building_point`
- `coordStatus`: `verified_geometry`
- radius retained at `260 m`

## Coordinate Source Contract decision

The named-building geometry path is satisfied because:

1. the canonical record is centred on the physical historic house;
2. the stable OSM way directly represents that house;
3. the existing coordinate agrees with the structured building coordinate;
4. MiA supplies the active visitor address and official historical identity;
5. the coordinate note explains the distinction between the main-house marker and the wider property radius;
6. nearby and similarly named wrong objects are explicitly excluded.

## Next queue item

`stunner_boplass`

This record represents an archaeological Stone Age settlement rather than a standing visitor building. Production must use a stable archaeological-site identity or documented terrain anchor and must not substitute a generic Stunner farm, road or locality coordinate.
