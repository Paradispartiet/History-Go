# Oslo harbor coordinate evidence v1

Generert: 2026-07-09

## Hvorfor disse fem fikk evidence files

`havnelageret`, `oslo_mek`, `salt`, `tollbukaia` og `akershus_kaier` ble tidligere flyttet, men bruker rapporterte at de fortsatt var feil. Etter Coordinate Source Contract v1 ble de degradert fra `verified` til `needs_source`. Denne PR-en legger derfor bare bevisrammeverk før neste koordinatendring.

## Ingen koordinater flyttet

Ingen `lat`, `lon`, `r`, `coordStatus`, `coordSource`, `coordType` eller `coordNote` i place source ble endret i denne PR-en.

Ingen av de fem ble satt `verified`.

## Hva hvert sted krever

| placeId | type problem | coordinateDecision | hva kreves før koordinat kan fikses |
|---|---|---|---|
| havnelageret | current building/current place | needs_address_source | offisiell adresse eller kartobjekt, sourceObjectId eller strukturert address, geocodeAccuracy rooftop/entrance/building/parcel, coordRole building_center/entrance |
| salt | POI/current venue | needs_poi_source | offisiell venue/adressekilde og/eller POI-kilde som OSM/Google Places/Mapbox/official map, pluss begrunnelse for site_center/entrance |
| tollbukaia | quay/linear_area | needs_geometry | official_map eller OSM/kommunal geometri, geometry eller anchors, coordRole line_anchor/area_anchor |
| akershus_kaier | quay/linear_area | needs_geometry | official_map eller OSM/kommunal geometri, geometry eller anchors, coordRole line_anchor/area_anchor |
| oslo_mek | identity/historic_site | needs_historical_source | historisk kilde, historisk kart eller manual_research med kilde, og avklaring av dagens venue vs historisk verksted |

## Oslo Mek

`oslo_mek` er ikke bare et koordinatproblem. Dagens Oslo Mek-navnebruk og historisk mekanisk verksted/industrihistorie må ikke blandes. Evidence-filen markerer derfor `identityStatus: "ambiguous"` og `requiresSplit: true`.

## Tollbukaia og Akershuskaiene

Disse er geometri-/lineærproblemer. De skal ikke verifiseres som ett tilfeldig punkt. Neste koordinat-PR må bruke geometry, anchors eller dokumentert line-/area-anchor.

## Havnelageret og SALT

`havnelageret` må behandles som building/current_place med adresse-/kartobjektkilde. `salt` må behandles som POI/current venue med POI-kilde eller strukturert adresse. Navn og `manual_map_check` er ikke nok.

## Nye filer

- `docs/coordinates/coordinate-evidence-files-v1.md`
- `data/coordinate-evidence/manifest.json`
- `data/coordinate-evidence/oslo/havnefront/havnelageret.json`
- `data/coordinate-evidence/oslo/havnefront/salt.json`
- `data/coordinate-evidence/oslo/havnefront/tollbukaia.json`
- `data/coordinate-evidence/oslo/havnefront/akershus_kaier.json`
- `data/coordinate-evidence/oslo/havnefront/oslo_mek.json`
- `tools/audit-coordinate-evidence.mts`
- `reports/coordinate-evidence-audit.md`

## Validering

`tools/audit-coordinate-evidence.mts` validerer manifest, evidence-filer, aktiv placeId, placeFile, status/decision enums og at `currentCoordinate` fortsatt matcher eksisterende place source.
