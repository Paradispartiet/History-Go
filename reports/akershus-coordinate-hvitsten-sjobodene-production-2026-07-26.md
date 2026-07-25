# Akershus coordinate production – Hvitsten sjøbodene

Date: 2026-07-26

## Scope

Production application for `hvitsten_sjobodene`, the eighth and final record in the original Akershus history batch 2.

The record was later migrated from category `historie` to category `by`. The canonical path is therefore:

`data/places/by/akershus/hvitsten_sjobodene/hvitsten_sjobodene.json`

Evidence file:

`data/coordinate-evidence/akershus/by/hvitsten_sjobodene.json`

## Semantic scope

The place represents the historic sea-boathouse and wharf environment at Andersbrygga. It is not a generic point for:

- Hvitsten settlement;
- Hvitsten harbour as a whole;
- Hvitsten beach;
- one modern pub or association use;
- an exact polygon for the entire waterfront cultural environment.

The physical anchor is the southern sea boathouse. The gameplay radius represents the connected boathouses, Andersbrygga and immediate historical loading and shore environment.

## Official cultural heritage identity

Vestby municipality identifies the old sea boathouses on the pier as the municipality's 1997 cultural heritage monument. The municipality also describes Hvitsten as a former loading port that exported timber to Holland and ice to England.

Stable historical source identity:

`vestby-kommune:hvitsten-sjobodene-kulturminne-1997`

Source URL:

`https://www.vestby.kommune.no/hvitsten.531264.no.html`

## Local site identity

Hvitsten Vel documents that:

- the sea boathouses stand at the pier;
- the associated pier is Andersbrygga;
- Hvitsten Seilforening occupies the southern sea boathouse;
- the boathouses are the same 1997 cultural monument described by the municipality.

Source URL:

`https://www.hvitstenvel.no/Hvitsten-Vel`

A founding notice for Hvitsten Seilforening identifies the building directly as:

`Sjøboden (sør), Fjordveien 1, 1545 Hvitsten`

This prevents the address from being interpreted merely as an organisation's postal address.

## Building history

Hvitsten Vel's historical presentation states that:

- the southeastern sea boathouse was built on site in the 1720s;
- the southwestern section was moved from Emmerstad in the 1880s;
- the northern sea boathouse was built on site in the 1870s;
- water formerly reached the boathouses so loading and unloading could occur directly.

Source URL:

`https://www.hvitstenvel.no/Hvitsten-i-historie-og-tid`

The production year is therefore refined from a generic `1600` to `1720`, representing the earliest specifically documented surviving boathouse element.

## Official address source

A one-time, self-cleaning GitHub Actions probe queried Kartverket's open Address API for:

- address name: `Fjordveien`
- number: `1`
- postcode: `1545`

Exactly one result was returned:

- address: `Fjordveien 1`
- municipality: `3216 VESTBY`
- farm/use number: `56/499`
- address code: `2905`
- object type: `Vegadresse`
- representation point: `59.59803006034044, 10.655030725129018`

Stable physical source identity:

`kartverket-address:3216:56/499:2905:1`

Raw response:

`reports/akershus-coordinate-hvitsten-sjobodene-source-probe/geonorge-fjordveien-1.json`

Exact-match summary:

`reports/akershus-coordinate-hvitsten-sjobodene-source-probe/geonorge-fjordveien-1-summary.txt`

The temporary workflow removed itself before the production PR.

## Previous coordinate

Legacy coordinate:

`59.5979, 10.6541`

The legacy point was approximately 54.3 metres west of the official southern-boathouse address point and lacked a source contract. Available public results associated similar coordinates with Hvitsten at harbour, port or settlement scale, so the point could not be tied specifically to the sea-boathouse environment.

## Production result

- previous coordinate: `59.5979, 10.6541`
- applied coordinate: `59.59803006034044, 10.655030725129018`
- displacement: approximately `54.3 m`
- `locatorType`: `historic_site`
- `sourceProvider`: `manual_research`
- `sourceObjectId`: `vestby-kommune:hvitsten-sjobodene-kulturminne-1997`
- `geocodeAccuracy`: `semantic_anchor`
- `coordRole`: `area_anchor`
- `coordType`: `documented_historic_boathouse_wharf_anchor`
- `coordStatus`: `verified_historical_source`
- physical anchor: Kartverket address `Fjordveien 1`
- radius retained at `260 m`

## Coordinate Source Contract decision

The historical semantic-anchor path is satisfied because:

1. the place is explicitly represented as `historic_site`;
2. the primary provider is `manual_research`;
3. Vestby municipality supplies stable official historical identity;
4. Hvitsten Vel connects the sea boathouses to Andersbrygga and the southern building;
5. the southern building is directly identified as Fjordveien 1;
6. Kartverket supplies a unique official address representation point;
7. the address point is stored as a physical `area_anchor` for the wider site;
8. the coordinate note explicitly excludes generic beach, harbour and settlement interpretations.

## Batch completion

The original eight-place Akershus history batch-2 coordinate queue is complete:

1. Tanum kirke – corrected to official church point
2. Skedsmo kirke – corrected to official church point
3. Enebakk kirke – existing building point retained and verified
4. Haslum kirke – building point retained; displaced SSR label point rejected
5. Asker kirke / gamle kirkested – same-site historical anchor applied
6. Gamle Hvam museum – named multi-building farm-museum area anchor retained
7. Heggedal hovedgård – documented historic farmyard anchor applied
8. Hvitsten sjøbodene – official southern-boathouse address point applied as anchor for the waterfront cultural environment

The next production queue should be selected from the next active coordinate manifest rather than inferred from the former batch-2 category path.
