# Address-first coordinate policy

## Prinsipp

For de fleste aktive steder skal koordinatarbeidet være enkelt:

```text
Har stedet en konkret adresse?
→ bruk offisiell adressekilde
→ hent representasjonspunkt
→ plott punktet
→ verified
```

Vi skal ikke gjøre vanlige adresse-steder vanskeligere enn nødvendig. En offisiell adresse med representasjonspunkt er et godt kartanker for History Go, når punktet merkes korrekt som adressepunkt/display-marker.

## Standardløype for norske steder

For norske steder med konkret adresse bruker History Go Geonorge Adresser API først.

Eksempel:

```bash
curl "https://ws.geonorge.no/adresser/v1/sok?sok=Langkaia%201%20Oslo" | jq
```

Når Geonorge returnerer ett tydelig treff, kan stedet settes til `verified` med:

```json
{
  "locatorType": "building",
  "sourceProvider": "official_address",
  "sourceObjectId": "geonorge-adresser-v1:<kommunenummer>:<adressekode>:<nummer><bokstav>",
  "address": {
    "street": "...",
    "number": "...",
    "postcode": "...",
    "city": "...",
    "country": "NO"
  },
  "geocodeAccuracy": "rooftop",
  "coordRole": "display_marker",
  "coordStatus": "verified",
  "coordSource": "geonorge_adresser_v1",
  "coordType": "address_point"
}
```

## Hvorfor `display_marker`, ikke alltid `building_center`

Geonorge returnerer et offisielt representasjonspunkt for adressen. Det er godt nok for kartvisning og spillanker, men det er ikke nødvendigvis geometrisk midtpunkt i bygningskroppen.

Derfor er standarden:

```text
coordType: address_point
coordRole: display_marker
```

Bruk `building_center` bare når vi faktisk har bygningsgeometri eller en kilde som sier at punktet er bygningsmidtpunkt.

## Beslutningsrekkefølge

1. **Aktivt bygg, butikk, institusjon, arena, kontor, museum, restaurant, venue med adresse**
   - Bruk Geonorge/offisiell adresse først.
   - `sourceProvider: official_address`
   - `coordType: address_point`
   - `coordRole: display_marker`
   - `coordStatus: verified`

2. **POI uten tydelig adresse**
   - Bruk offisiell POI-kilde, OSM POI, Google Places eller Mapbox etter behov.
   - Krev `sourceObjectId` eller strukturert adresse.

3. **Park, kai, gate, rute, område**
   - Ikke bruk tilfeldig adressepunkt som hovedregel.
   - Bruk geometri, `line_anchor` eller `area_anchor`.
   - Forklar hva ankeret representerer.

4. **Historiske/revne/flyttede steder**
   - Ikke bruk dagens adresse som eneste bevis hvis stedet ikke lenger finnes der.
   - Bruk historisk kart, manual research eller dokumentert historisk kilde.

## Ikke bruk som primærkilde

- Wikipedia/Wikidata kan brukes som research-spor, men ikke som primærkilde for `verified`.
- `manual_map_check` kan aldri alene gi `verified`.
- Nominatim/OSM-public geokoding skal ikke være standardløype for norske adresser når Geonorge finnes.

## Praktisk regel

```text
Adresse først.
Geometri bare når adresse ikke passer.
Historisk særbehandling bare når stedet ikke lenger finnes eller identiteten er uklar.
```
