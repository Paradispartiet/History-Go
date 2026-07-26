# Akershus coordinate production – Hølen ladested

Date: 2026-07-26

## Scope

Production application for `holen_ladested`, the seventh record in the active Akershus history batch 3. The record is canonically stored in category `by`.

Canonical file:

`data/places/by/akershus/holen_ladested/holen_ladested.json`

Evidence file:

`data/coordinate-evidence/akershus/by/holen_ladested.json`

## Semantic scope

The record represents the combined historic ladested, customs, sawmill, river, street and bridge environment in central Hølen. It is not reduced to:

- the railway viaduct alone;
- a generic modern village point;
- one historic bridge;
- one sawmill ruin;
- an exact conservation-zone polygon.

## Official ladested and transport identity

Vestby municipality documents Hølen as:

- a strategically located historic ladested;
- a customs place from the mid-1660s;
- an important 17th-century trading place;
- a sawmill environment along Såna producing timber for export;
- a place shaped by several generations of bridges and transport routes.

Source:

`https://www.vestby.kommune.no/om-vestby/holen`

Stable top-level source identity:

`vestby-kommune:holen-historisk-kulturmiljo`

## Official historic-centre scope

Vestby municipality's preservation guidance identifies:

- the area around the square;
- upper Store Strandgate;
- the junction of Lille and Store Strandgate;

as especially valuable coherent historic urban environments. The municipality rates Hølen's cultural-history value as very high.

Source:

`https://www.vestby.kommune.no/tjenester/plan-bygg-og-eiendom/byggesak/skal-du-bygge-rive-eller-endre/bevaring-og-kulturminner`

## Physical anchor

Lokalhistoriewiki publishes Hølen torv at:

`59.5395561, 10.7419569`

Stable physical source identity:

`lokalhistoriewiki:holen-torg`

Source:

`https://lokalhistoriewiki.no/wiki/H%C3%B8len`

The square is used as the area anchor because it lies in the municipal historic core and connects the central streets, Såna, the ladested history and the nearest bridge sequence.

## River, timber and street context

Lokalhistoriewiki documents:

- Hølen's customs rights and timber trade;
- timber floated and processed along Såna;
- eight up-and-down sawmills in 1688;
- the mutual economic relationship between Hølen and Son harbour;
- Kulpa in the centre as the likely origin of the place name.

Store Strandgate follows the northern bank of Såna through the historic centre, while Lille Strandgate runs on the opposite bank.

Sources:

- `https://lokalhistoriewiki.no/wiki/H%C3%B8len`
- `https://lokalhistoriewiki.no/wiki/Store_Strandgate_(Vestby)`

Store norske leksikon independently documents the ladested, timber trade, river and stone-arch bridges.

Source:

`https://snl.no/H%C3%B8len`

## Later railway layer

Vestby municipality documents the 1879 Hølen viaduct, its railway use until 1996 and its later conversion into the Smaalensbanen walking and cycling route.

Source:

`https://www.vestby.kommune.no/tjenester/friluftsliv-natur-og-miljo/smaalensbanen/fra-nedlagt-jernbanetrase-til-turvei-og-friluftslivsomrade`

The viaduct is an important later transport layer but is not used as the sole canonical coordinate because Hølen's historic identity predates the railway and is centred on the square, river, sawmills, streets and older crossings.

## Previous coordinate

Legacy coordinate:

`59.53984, 10.73919`

Distance to Hølen torv:

approximately `159.1 m`

The previous point lay west of the municipal historic core and lacked a stable identity connecting it to the square, central streets, river or ladested environment.

## Production result

- previous coordinate: `59.53984, 10.73919`
- applied coordinate: `59.5395561, 10.7419569`
- displacement: approximately `159.1 m`
- `locatorType`: `historic_site`
- `sourceProvider`: `manual_research`
- `sourceObjectId`: `vestby-kommune:holen-historisk-kulturmiljo`
- `geocodeAccuracy`: `semantic_anchor`
- `coordRole`: `area_anchor`
- `coordType`: `documented_historic_ladested_torg_and_river_anchor`
- `coordStatus`: `verified_historical_source`
- physical anchor: Hølen torv
- radius retained at `300 m`

## Coordinate Source Contract decision

The historical semantic-area-anchor path is satisfied because:

1. the record is explicitly represented as a `historic_site`;
2. Vestby municipality supplies stable official ladested, customs, sawmill and bridge identity;
3. municipal preservation guidance defines the most valuable historic-centre subareas;
4. Lokalhistoriewiki publishes a physical square coordinate in that core;
5. independent sources cross-check the river, timber, street and ladested history;
6. the coordinate note distinguishes the square anchor from the full cultural environment and the viaduct alone;
7. the retained radius is described as gameplay-scale coverage rather than an exact regulatory polygon.

## Radius and representation

The retained 300-metre radius covers, at gameplay scale:

- Hølen torv;
- central sections of Store and Lille Strandgate;
- Såna and Kulpa;
- Mærø bridge and the nearest bridge sequence;
- the connection toward Hølen viaduct.

It is not an exact cultural-environment, property or conservation boundary.

## Next queue item

The next production record should be selected from the current generated coordinate manifest after this PR is merged, rather than inferred from historical batch ordering alone.
