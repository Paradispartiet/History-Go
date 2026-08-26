# Olaf Ryes plass — arbeidskort

Oppdatert: 2026-08-26
Samlet status: `CORRECTION_READY_FOR_PR_LIVE_REQA_PENDING`

| Fase | Status | Evidens |
|---:|---|---|
| 0–7 | COMPLETE | Kilde, scope, geometri og grunninnhold mergret i PR #5339 |
| 8–19 | CORRECTED | Fire bildeklare samlingsflater: People 2, Objects 2, Parkteatret Brand 1 og Related 4. FrontImage er en faktisk stående 900×1200-variant |
| 20 | COMPLETE | Olaf-kontrakt, description v4.2, place-open, runtime-synk og JS-syntaks er grønne lokalt |
| 21 | PENDING | Ny manuell live-QA skal kjøres etter merge og Pages-deploy |
| 22 | COMPLETE | Manuell kilde-, innholds-, bildegrense- og own-place-QA |
| 23 | PENDING | Korreksjons-PR og CI gjenstår |
| 24 | REOPENED | Den tidligere closeouten manglet Brand, medlemsbilder i rundingene og stående frontImage |

Den nye lokale QA-en bekrefter at Parkteatret er materialisert som verifisert venue-Brand med offisiell logo, at People, Objects, Brands og Related har bilde av et canonical medlem, og at frontImage er en lokal stående variant. Endelig status lukkes først etter merge, vellykket deploy og manuell live re-QA.

## Avgrensning

Parkteatrets venue-identitet ved Olaf Ryes plass 11 vises i Brands. Bygningen og den fulle institusjonshistorien overføres ikke til den canonicale parkflaten.
