# Havnelageret source coordinate review

## Resultat

Denne PR-en flytter ikke `havnelageret` og setter ikke `coordStatus=verified`.

Research fant et tydelig sekundærspor, men ikke en primær adresse-/kartobjektkilde som tilfredsstiller Coordinate Source Contract v1 for verified.

## Problem

`havnelageret` har i dag `coordStatus=needs_source` og `coordSource=legacy_manual_map_check`. Evidence-filen krever primær adresse-/kartobjektkilde før koordinaten kan verifiseres.

## Kilder vurdert

### Sekundærkilde / research-spor

- Wikipedia/Wikidata/GeoHack: `https://en.wikipedia.org/wiki/Havnelageret`
- Oppgitt identitet: Havnelageret / Oslo Havnelager
- Oppgitt adresse: Langkaia 1, Oslo
- Oppgitt koordinat: `59.9076083, 10.7466667`
- Wikidata-spor: `Q1591560`

Dette er nyttig som research-spor, men det er ikke brukt som primærkilde for verified.

## Koordinatsammenligning

Eksisterende History GO-punkt:

```json
{
  "lat": 59.90845,
  "lon": 10.74305,
  "r": 160,
  "coordStatus": "needs_source"
}
```

Kandidat fra sekundærspor:

```json
{
  "lat": 59.9076083,
  "lon": 10.7466667,
  "sourceObjectId": "wikidata:Q1591560",
  "sourceQuality": "secondary_not_primary"
}
```

Avstand mellom eksisterende punkt og kandidat er omtrent 222 meter. Derfor skal kandidaten ikke brukes ukritisk.

## Beslutning

- `data/coordinate-evidence/oslo/havnefront/havnelageret.json` er oppdatert fra `needs_research` til `candidate_sources_collected`.
- `coordinateDecision` er satt til `do_not_change_coordinates_yet`.
- `decision.canBecomeVerified` er fortsatt `false`.
- `data/places/naeringsliv/oslo/places_naeringsliv.json` er ikke endret.
- `data/places/places_index.json` er ikke håndredigert.

## Hvorfor ikke verified

Coordinate Source Contract v1 krever at verified har kildegrunnlag som kan forklare hva punktet representerer. For et byggpunkt bør dette være en primær adresse-/kartobjektkilde, for eksempel:

- OSM building/way/relation med adresse/bygningsobjekt
- Kartverket/adresse- eller bygningspunkt
- kommunal/offisiell kartkilde
- annen offisiell adressekilde med sourceObjectId eller strukturert adresse

Wikipedia/Wikidata brukes her bare som research-spor, ikke primærkilde.

## Neste handling

Finn primærkilde for Langkaia 1 / Havnelageret og dokumenter:

- `locatorType: building`
- `sourceProvider: official_address | official_map | osm | kartverket | municipality`
- `sourceObjectId` eller strukturert `address`
- `geocodeAccuracy: building | rooftop | entrance | parcel`
- `coordRole: building_center | entrance | display_marker`
- `coordNote` som forklarer at punktet representerer selve bygningskroppen, ikke kai, vei, vannflate eller generelt havneområde

Først da kan place-objektet endres og eventuelt settes `verified`.

## Validering

Planlagt lokal validering:

```bash
npm run build:tools
npm run places:coords:evidence:audit
npm run places:coords:intake
npm run places:index:check
```

Denne PR-en gjør ingen place-source-endring, så `places:coords:sync` skal ikke være nødvendig.
