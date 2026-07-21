# Retrospektiv Oslo coordinate compliance-audit — batch 1–120

Generert: 2026-07-21T08:04:01.725Z

## Konklusjon

- Dokumenterte verified-rader kontrollert: **348**
- Unike placeId-er: **348**
- Contract v1 PASS: **340**
- Contract v1 FAIL: **6**
- Manglende current canonical records: **2**
- Protokollrader synkronisert til current canonical: **3**
- Gjenstående protokollmismatch etter synk: **0**
- Lagrede entydige Geonorge-kandidater som fortsatt ikke er primærkilde: **1**
- Åpne blokkerende funn: **12**

## Korrigeringer i denne passeringen

### Tronsmo Bokhandel

Den senere OSM/storefront-overstyringen er fjernet. Canonical koordinat er gjenopprettet fra det lagrede, entydige Geonorge-resultatet for Universitetsgata 12: `geonorge-adresser-v1:0301:17999:12` (59.916504851005804, 10.738621210337177). Dette retter både source-priority-regresjonen og den ugyldige `geocodeAccuracy: storefront`.

### Oslo domkirke

Address-first ble kjørt på nytt mot den dokumenterte riktige besøksadressen **Stortorvet 1, Oslo**. Status: **needs_review**. Ingen koordinat ble endret; årsak: Forventet ett eksakt Stortorvet 1-treff, fant 2.

Det gamle batch-4-resultatet for Karl Johans gate 11 gjenbrukes ikke, fordi den senere kildekontrollen dokumenterte at dette adressepunktet tilhører Kirkeristen.

## Dekning

- **Batch 1–5:** revidert på nytt mot opprinnelige batchrapporter og lagrede Geonorge-resultater.
- **Batch 6–35:** eksisterende full retrokontroll gjenbrukt; alle batcher i intervallet er eksplisitt dokumentert kontrollert i `reports/oslo-coordinate-retro-audit-from-batch-6/README.md`.
- **Batch 36–120:** current canonical-rader kontrollert mot Contract v1 og kilde-/scope-beslutningene i de dokumenterte batch- og source-closure-rapportene.

## Contract-feil

| batch | placeId | status | source | problem |
|---|---|---|---|---|
| 35 | `vaterland_historisk_elvelop` | verified_historical_source | oslobyleksikon:akerselva:vaterlands-bru |  |
| 95 | `korketrekkeren` | verified_geometry | osm-relation:1459739 | locatorType: Ugyldig locatorType=route_start.; geocodeAccuracy: Ugyldig geocodeAccuracy=exact_route_endpoint.; coordRole: Ugyldig coordRole=route_start. |
| 1 | `saebotunet_etne` | verified | sunnhordland-museum:saebotunet |  |
| 2 | `folgefonden_minnesmerke_skanevik` | verified_historical_source | kartverket-stedsnavn:978614 |  |
| 5 | `grindheim_runestein` | verified_historical_source | kulturminnesok:84426-1 |  |
| 5 | `grindheim_steinkross` | verified_historical_source | kulturminnesok:84426-2 |  |

## Protokollrader synkronisert

| batch | placeId | status | source |
|---|---|---|---|
| 5 | `tronsmo_bokhandel` | verified → verified | osm-node:10524908476 → geonorge-adresser-v1:0301:17999:12 |
| 60 | `vestre_gravlund` | verified → verified_geometry | osm-way:4740772 → osm-way:4740772 |
| 63 | `vikaterrassen` | verified → verified_geometry | osm-relation:14169568 → osm-relation:14169568 |

## Gjenstående saved-address-kandidater som ikke er primærkilde

| placeId | lagret Geonorge | current source | current provider |
|---|---|---|---|
| `oslo_domkirke` | geonorge-adresser-v1:0301:13630:11 | osm-node:2785921267 | osm |

## Åpne blokkerende funn

| type | placeId | detalj |
|---|---|---|
| contract_failure | vaterland_historisk_elvelop | verified_historical_source |
| contract_failure | korketrekkeren | verified_geometry |
| contract_failure | saebotunet_etne | verified |
| contract_failure | folgefonden_minnesmerke_skanevik | verified_historical_source |
| contract_failure | grindheim_runestein | verified_historical_source |
| contract_failure | grindheim_steinkross | verified_historical_source |
| missing_current_record | folkeobservatoriet |  |
| missing_current_record | slurpen |  |
| protocol_row_no_longer_verified | folkeobservatoriet | placeId mangler i runtime index |
| protocol_row_no_longer_verified | slurpen | placeId mangler i runtime index |
| saved_address_candidate_not_primary | oslo_domkirke | verified |
| oslo_domkirke_address_first_unresolved | oslo_domkirke | Forventet ett eksakt Stortorvet 1-treff, fant 2. |

## Maskinlesbar rapport

Se `reports/oslo-coordinate-retro-compliance-20260721/audit.json` for alle 346 kontrollerte rader og komplette funn.
