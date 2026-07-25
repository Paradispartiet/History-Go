# Akershus coordinate production – Vollen / Maudbukta

Date: 2026-07-26

## Scope

Production application for `vollen_maudbukta`, the first record in the active Akershus history batch 3.

Canonical file:

`data/places/historie/akershus/places_historie_akershus_batch3/vollen_maudbukta.json`

Evidence file:

`data/coordinate-evidence/akershus/historie/vollen_maudbukta.json`

## Semantic scope

The record represents the historical boatbuilding and launch environment in Maudbukta, where Roald Amundsen's polar ship Maud was built and launched in 1917. The present Oslofjordmuseet is used as the physical anchor because the official museum history directly places the launch beside the current museum location.

The coordinate is not presented as:

- an exact reconstruction of the 1917 slipway;
- an exact historical shoreline point;
- a generic Vollen town-centre coordinate;
- Vollen Marina;
- Maudbukta beach;
- a modern medical-office or residential point.

## Official historical derivation

MiA's official Oslofjordmuseet presentation states that the museum's location in Maudbukta is not accidental: this is where Roald Amundsen's polar ship Maud was launched in 1917 after being built by local boatbuilder Christian Jensen.

Source:

`https://mia.no/oslofjordmuseet/om-gammel`

MiA's Maud-jubilee presentation provides the stronger relative-location statement:

- Maud was completed on 7 June 1917;
- she was launched directly beside the location where Oslofjordmuseet stands today.

Source:

`https://mia.no/oslofjordmuseet/maud-jubileum`

Stable historical source identity:

`mia-oslofjordmuseet:maudbukta-launch-site`

This establishes same-area historical continuity but does not establish an exact surviving slipway geometry.

## Official visitor address

MiA lists:

`Chr. Jensens vei 8, 1390 Vollen`

Source:

`https://mia.no/oslofjordmuseet/finn-oss`

## Kartverket address source

A one-time, self-cleaning GitHub Actions probe queried Kartverket's open Address API for:

- address name: `Chr. Jensens vei`
- number: `8`
- postcode: `1390`

Exactly one result was returned:

- municipality: `3203 ASKER`
- farm/use number: `66/85`
- address code: `1358`
- object type: `Vegadresse`
- representation point: `59.80709179773664, 10.490986627468192`

Stable physical source identity:

`kartverket-address:3203:66/85:1358:8`

Raw response:

`reports/akershus-coordinate-vollen-maudbukta-source-probe/geonorge-chr-jensens-vei-8.json`

Exact-match summary:

`reports/akershus-coordinate-vollen-maudbukta-source-probe/geonorge-chr-jensens-vei-8-summary.txt`

The temporary workflow removed itself before production completion.

## Independent physical cross-check

OpenStreetMap node `6593405632` is the stable named point for Oslofjordmuseet at approximately:

`59.80703, 10.49102`

This lies about 7 metres from the official address representation point. It is used as a cross-check rather than the primary source.

## Wider site history

MiA documents that Arnestad Bruk later occupied approximately the current museum area and that its industrial history grew from Christian Jensen's boatbuilding activity. The former industrial buildings were removed before the present museum and housing development were completed.

Source:

`https://mia.no/oslofjordmuseet/arnestad-bruk`

This supports the retained area radius and the interpretation of Maudbukta as a layered boatbuilding, industrial and museum site.

## Previous coordinate

Legacy coordinate:

`59.81056, 10.4825`

The legacy point lies approximately `611.5 m` northwest of the official museum address point. It cannot be tied to the documented launch location, museum, stable named source object or official address and is therefore rejected.

## Production result

- previous coordinate: `59.81056, 10.4825`
- applied coordinate: `59.80709179773664, 10.490986627468192`
- displacement: approximately `611.5 m`
- `locatorType`: `historic_site`
- `sourceProvider`: `manual_research`
- `sourceObjectId`: `mia-oslofjordmuseet:maudbukta-launch-site`
- `geocodeAccuracy`: `semantic_anchor`
- `coordRole`: `historical_anchor`
- `coordType`: `documented_maudbukta_launch_area_anchor`
- `coordStatus`: `verified_historical_source`
- physical anchor: Kartverket address `Chr. Jensens vei 8`
- radius retained at `320 m`

## Coordinate Source Contract decision

The historical semantic-anchor path is satisfied because:

1. the place is explicitly represented as `historic_site`;
2. the primary source provider is `manual_research`;
3. MiA supplies stable official historical identity;
4. MiA explicitly links the launch to the current museum area;
5. the active visitor address is officially published;
6. Kartverket supplies a unique official address representation point;
7. the physical address point is stored as a `historical_anchor`;
8. the coordinate note explicitly distinguishes the same-area anchor from an exact slipway reconstruction.

## Radius and representation

The retained 320-metre radius covers:

- the museum and immediate Maudbukta waterfront;
- the documented launch and boatbuilding area at gameplay scale;
- the nearby former Arnestad Bruk / boatyard setting;
- the associated museum harbour and coastal-history environment.

It is not an exact heritage polygon or a claim about the full historical property boundary.

## Next queue item

`roald_amundsens_hjem_uranienborg`

That record represents a preserved home and polar-history institution. Its production review must distinguish the actual Uranienborg house and visitor site from Roald Amundsen's separate birthplace, Bunnefjorden shoreline points and generic Svartskog locality coordinates.
