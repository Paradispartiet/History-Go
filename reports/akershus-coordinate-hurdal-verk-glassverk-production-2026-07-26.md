# Akershus coordinate production – Hurdal Verk / Hurdal Glassverk

Date: 2026-07-26

## Scope

Production application for `hurdal_verk_glassverk`, the eighth and final record in the active Akershus history batch 3. The record was later migrated to category `naeringsliv`.

Canonical file:

`data/places/naeringsliv/akershus/hurdal_verk_glassverk/hurdal_verk_glassverk.json`

Evidence file:

`data/coordinate-evidence/akershus/naeringsliv/hurdal_verk_glassverk.json`

## Semantic scope

The record represents the layered Hurdal Verk environment:

- the glassworks established in 1755 and operated until 1895;
- the industrial worker settlement and its institutions;
- the surviving main-building complex;
- the later manor and hotel uses;
- the wartime Lebensborn home;
- the folk-high-school use from 1945;
- the park, dam and immediate former works landscape.

The present main building is used as the physical anchor. It is not presented as the original glass hut, furnace or an exact 1755 production-building location.

## Authoritative industrial and site history

Store norske leksikon documents Hurdal Verk as the former glassworks north of Torget, operated from 1755 to 1895. Around 1800 it was Norway's largest glassworks, with more than 300 workers and approximately 50 buildings. The works maintained its own school, poor relief and store.

SNL also documents that construction of the present main building began in 1850 and that the classical portico was added in 1905.

Sources:

- `https://snl.no/Hurdal_Verk`
- `https://snl.no/Hurdal_glassverk`

Stable top-level identity:

`snl:hurdal-verk-og-glassverk`

## Independent layered-history cross-check

Lokalhistoriewiki publishes the historic site at approximately:

`60.450853, 11.047547`

It documents:

- the glassworks period from 1755 to 1895;
- the worker and institutional environment;
- the later manor and hotel use;
- the Lebensborn home during the Second World War;
- the present folk-high-school use.

Source:

`https://lokalhistoriewiki.no/wiki/Hurdal_glassverk`

The published point lies approximately 15.4 metres from the applied official address point and supports the same-site layered representation.

## Official active-site address

Hurdal Verk Folkehøgskole lists:

`Hurdal Verk 5A, 2090 Hurdal`

The school also states that the site's history reaches back to the establishment of the glassworks in 1755 and that the folk high school was founded there in 1945.

Source:

`https://hvf.no/en/the-school/contact/`

## Kartverket address source

A one-time, self-cleaning GitHub Actions probe queried Kartverket's open Address API for:

- address name: `Hurdal verk`
- number: `5`
- letter: `A`
- postcode: `2090`

Exactly one result was returned:

- municipality: `3242 HURDAL`
- farm/use number: `14/15`
- address code: `1090`
- object type: `Vegadresse`
- representation point: `60.450835090104455, 11.047825837515976`

Stable physical source identity:

`kartverket-address:3242:14/15:1090:5A`

Raw response:

`reports/akershus-coordinate-hurdal-verk-source-probe/geonorge-hurdal-verk-5a.json`

## Physical building cross-check

The source probe materialized nearby OSM data. OpenStreetMap way `170856663`, national building reference `151946569`, is the school building containing the main entrance and has a calculated centre at approximately:

`60.45081564, 11.04780523`

Distance from the official address point:

approximately `2.4 m`

Source:

`https://www.openstreetmap.org/way/170856663`

The way confirms that the official address point lies on the main-building complex. The way is not used as the top-level historical source because it lacks a sufficiently specific historical name.

## Previous coordinate

Legacy coordinate:

`60.45029, 11.04809`

The legacy coordinate corresponds to the general present-day Hurdal Verk Folkehøgskole POI rather than a stable physical point on the main-building complex.

Distance to the official address anchor:

approximately `62.3 m`

## Production result

- previous coordinate: `60.45029, 11.04809`
- applied coordinate: `60.450835090104455, 11.047825837515976`
- displacement: approximately `62.3 m`
- `locatorType`: `historic_site`
- `sourceProvider`: `manual_research`
- `sourceObjectId`: `snl:hurdal-verk-og-glassverk`
- `geocodeAccuracy`: `semantic_anchor`
- `coordRole`: `area_anchor`
- `coordType`: `documented_glassworks_main_building_and_institution_anchor`
- `coordStatus`: `verified_historical_source`
- physical anchor: Kartverket address `Hurdal verk 5A`
- radius retained at `360 m`

## Coordinate Source Contract decision

The historical semantic-area-anchor path is satisfied because:

1. the record is explicitly represented as a `historic_site`;
2. SNL provides stable authoritative industrial and layered-site identity;
3. Lokalhistoriewiki independently places the historic site at the surviving complex;
4. the active institution publishes the address and historical continuity;
5. Kartverket supplies one unique official address representation point;
6. nearby OSM building data confirms that the address point lies on the main-building complex;
7. the coordinate note explicitly distinguishes the surviving main building from the original 1755 production buildings.

## Radius and representation

The retained 360-metre radius covers, at gameplay scale:

- the main-building complex;
- school and former works buildings;
- the park and small lakes;
- Verkensdammen;
- the immediate historic industrial and institutional environment.

It is not an exact former-glassworks property, furnace-area or regulatory heritage polygon.

## Source materialization

The following files were generated and retained:

- `reports/akershus-coordinate-hurdal-verk-source-probe/geonorge-hurdal-verk-5a.json`
- `reports/akershus-coordinate-hurdal-verk-source-probe/nominatim-hurdal-verk.json`
- `reports/akershus-coordinate-hurdal-verk-source-probe/osm-hurdal-verk-map.xml`
- `reports/akershus-coordinate-hurdal-verk-source-probe/osm-map-request.txt`
- `reports/akershus-coordinate-hurdal-verk-source-probe/source-summary.txt`

The temporary workflow removed itself before production completion.

## Batch completion

The active eight-place Akershus history batch-3 coordinate queue is complete:

1. Vollen / Maudbukta – corrected 611.5 m to the documented launch area
2. Roald Amundsens hjem Uranienborg – building-aligned point retained and verified
3. Stunner steinalderboplass – corrected 355.9 m to the named archaeological field
4. Ski middelalderkirke – building-aligned point retained and verified
5. Kråkstad kirke og gravhaug – corrected 759.2 m to the church anchor for the burial landscape
6. Son ladested – corrected 318.1 m to Thornegården at Son torv
7. Hølen ladested – corrected 159.1 m to Hølen torv
8. Hurdal Verk / Hurdal Glassverk – corrected 62.3 m to the main-building address anchor

The next production queue must be selected from the current generated coordinate manifest after this PR is merged.
