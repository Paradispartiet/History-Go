# Source-based coordinate fix: Havnelageret

## Problem

`havnelageret` stod som `needs_source` med en eldre `legacy_manual_map_check`-koordinat. Coordinate Source Contract v1 krever en etterprøvbar primærkilde før et sted kan settes til `verified`; manuell kartkontroll alene er ikke nok.

## Kilder brukt

Primærkilde:

- Geonorge Adresser API v1: `https://ws.geonorge.no/adresser/v1/sok?sok=Langkaia%201%20Oslo`

Geonorge-treffet dokumenterer Langkaia 1, OSLO med kommunenummer `0301`, adressekode `14150`, nummer `1`, postnummer `0150`, og representasjonspunkt i EPSG:4258:

- lat: `59.90760281927637`
- lon: `10.746880614147818`

Wikipedia/Wikidata er ikke brukt som primærkilde. Slike kilder kan bare fungere som research-spor for navn/adresse, ikke som Coordinate Source Contract v1-verifikasjon.

## Valgt adresse/kartobjekt

Valgt kildeobjekt er den offisielle adresseposten for:

- Adresse: Langkaia 1, 0150 Oslo, NO
- Source provider: `official_address`
- Source object id: `geonorge-adresser-v1:0301:14150:1`
- Geocode accuracy: `rooftop`

Dette er en adressekoordinat / et representasjonspunkt for adressen. Den er derfor brukt som `display_marker` for Oslo Havnelager / Havnelageret, ikke som et påstått geometrisk bygningsmidtpunkt.

## Koordinatendring

Koordinaten ble endret fra tidligere legacy-koordinat:

- lat: `59.90845`
- lon: `10.74305`
- r: `160`

Til Geonorge-adressekoordinaten:

- lat: `59.90760281927637`
- lon: `10.746880614147818`
- r: `60`

## Status etter endring

`coordStatus` ble satt til `verified` fordi stedet nå har:

- `locatorType: building`
- `sourceProvider: official_address`
- `sourceObjectId: geonorge-adresser-v1:0301:14150:1`
- strukturert adresse for Langkaia 1
- `geocodeAccuracy: rooftop`
- `coordRole: display_marker`
- `coordType: address_point`
- tydelig `coordNote` som forklarer at punktet representerer adressen/bygget, ikke kai, vei, vannflate eller generelt havneområde

## Coordinate Source Contract v1

Endringen oppfyller kontrakten ved at `verified` ikke lenger baseres på `manual_map_check`, men på en offisiell adressekilde med stabil kildeidentitet og strukturert adresse. Siden kilden gir et adresserepresentasjonspunkt og ikke bygningsgeometri, brukes `coordRole: display_marker` og `coordType: address_point`.

`data/places/places_index.json` ble ikke håndredigert.

## Kommandoer kjørt

- `curl -i -L 'https://ws.geonorge.no/adresser/v1/sok?sok=Langkaia%201%20Oslo'` (miljøet returnerte 403 på CONNECT-tunnel; data fra brukerens oppgitte Geonorge-resultat ble brukt)
- `npm run build:tools`
- `npm run places:coords:evidence:audit`
- `npm run places:coords:intake`
- `npm run places:index:check`
- `npm run places:coords:sync`
- `npm run places:index:check`
