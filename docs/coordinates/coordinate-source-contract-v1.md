# Coordinate Source Contract v1

Coordinate Source Contract v1 er det kanoniske koordinatsystemet for History Go. Kontrakten finnes for å hindre at `verified` betyr «noen så på kartet» uten etterprøvbar kilde.

## 0. Address-first policy

For aktive steder med konkret adresse skal koordinatfinneren bruke offisiell adressekilde først.

```text
Har stedet konkret adresse?
→ bruk offisiell adressekilde
→ hent representasjonspunkt
→ plott punktet
→ verified
```

For norske adresser er standardkilden Geonorge Adresser API. Et offisielt adresserepresentasjonspunkt kan brukes som `verified` når det lagres som `coordType: "address_point"` og `coordRole: "display_marker"` med `sourceProvider: "official_address"`.

Dette er ikke det samme som `building_center`. Adressepunktet er et presist, offisielt display-/spillanker for adressen, ikke nødvendigvis geometrisk sentrum av bygningskroppen.

Detaljert policy: `docs/coordinates/address-first-coordinate-policy.md`.

## 1. Canonical fields

### `locatorType`
Tillatte verdier: `current_place`, `poi`, `building`, `entrance`, `street`, `square`, `park`, `linear_area`, `route`, `quay`, `historic_site`, `archaeological_site`, `natural_area`, `unknown`.

### `sourceProvider`
Tillatte verdier: `official_address`, `official_map`, `osm`, `google_places`, `mapbox`, `kartverket`, `municipality`, `historical_map`, `manual_research`, `legacy_unknown`.

### `sourceObjectId`
Et stabilt kildeobjekt, for eksempel OSM node/way/relation id, Google `place_id`, Mapbox feature id, Kartverket/matrikkel/kommunal id eller offisiell adresse-id hvis tilgjengelig.

For Geonorge Adresser API bruker vi:

```text
geonorge-adresser-v1:<kommunenummer>:<adressekode>:<nummer><bokstav>
```

Eksempel:

```text
geonorge-adresser-v1:0301:14150:1
```

### `address`
```json
{ "street": "", "number": "", "postcode": "", "city": "", "country": "" }
```

### `geocodeAccuracy`
Tillatte verdier: `rooftop`, `entrance`, `building`, `parcel`, `interpolated`, `geometric_center`, `approximate`, `historical_approximation`, `semantic_anchor`, `unknown`.

For offisiell adresse med representasjonspunkt bruker vi normalt `rooftop`.

### `coordRole`
Tillatte verdier: `display_marker`, `unlock_point`, `label_anchor`, `entrance`, `building_center`, `site_center`, `line_anchor`, `area_anchor`, `historical_anchor`.

For offisiell adresse med representasjonspunkt bruker vi normalt `display_marker`.

### `coordStatus`
Tillatte verdier: `verified`, `verified_geometry`, `verified_historical_source`, `needs_manual_visual_qa`, `needs_source`, `legacy_unverified`, `historical_approximation`, `invalid`.

## 2. Hard rules

- `coordStatus: "verified"` er forbudt uten `locatorType`, `sourceProvider`, `sourceObjectId` eller `address`, `geocodeAccuracy`, `coordRole`, `coordType` og `coordNote`.
- For norske aktive adresse-steder skal `official_address` / Geonorge prøves før Nominatim/OSM/POI-søk.
- `manual_map_check` kan aldri alene gi `verified`; det er bare ekstra QA, ikke primær kilde.
- `legacy_unknown` kan aldri gi `verified`.
- Lavpresisjons lat/lon kan aldri være `verified`.
- `geocodeAccuracy: "approximate"` kan aldri gi `verified`.
- `geocodeAccuracy: "interpolated"` kan ikke gi `verified` uten tydelig note og ikke for spill-/unlock-punkt.
- Lineære steder må ha geometry, anchors eller `coordRole=line_anchor/area_anchor` med kildeforklaring.
- Historiske steder må ha `historical_map`/`manual_research`/historisk kilde og kan ikke bruke dagens adresse som eneste bevis hvis anlegget er revet eller flyttet.
- POI-er må ha `sourceObjectId` eller strukturert adresse; navn alene er ikke nok.
- Bygg/adresse-steder bør ha `geocodeAccuracy` `rooftop`, `entrance`, `building` eller `parcel` for `verified`.

## 3. Legacy policy

Feltene `lat`, `lon`, `r`, `coordType`, `coordStatus`, `coordSource`, `coordNote` og `coordVerifiedAt` er legacy-kompatible. De kan fortsatt brukes av runtime og migrering, men er ikke lenger tilstrekkelige for `verified`.

`coordSource: "manual_map_check"` skal tolkes som `manualQa: true`, ikke som `sourceProvider` og ikke som primær kilde. Hvis et gammelt sted har `coordStatus: "verified"` men mangler ny kontrakt, skal display trust ikke vise det som verified, intake skal feile for nye/endrede steder, og legacy audit skal anbefale downgrade eller upgrade.
