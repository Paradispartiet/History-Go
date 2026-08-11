# Torggata – fase 5 desc/popupDesc-audit v1

Dato: 2026-08-11  
Place ID: `torggata`  
Styrende kontrakt: `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md` v4.2.1

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: commit ecd3af8ec85615e39bc84579f4511bba06e04b72 – «Utvid Torggata til innholdsrik popupDesc»
SISTE GODKJENTE TILSTAND: dagens desc/popupDesc er etterkommer av den tidligere godkjente teksten
KONKRET REGRESJONSEVIDENS: ingen generell tekstregresjon funnet; manglende v4.2-produksjonspakke og én sterk superlativpåstand manglet dagens dokumentasjonsnivå
BESLUTNING: RETROFIT – bevar tidligere tekst, endre bare konkret kontraktavvik
```

## Redaksjonell beslutning

Eksisterende tekst beholdes. Den har en tydelig stedsspesifikk fortelling gjennom fem lag: gateutbygging, Jensen-familiens handel, Eldorado, Torggata bad og nyere gateomforming.

Én minimal endring gjøres:

- før: `...og fikk byens første 25-metersbasseng.`
- etter: `...og fikk et 25-metersbasseng.`

Oslo byleksikon oppgir første-statusen, og Lokalhistoriewiki gjentar den, men sistnevnte oppgir Oslo byleksikon blant sine kilder. Dette behandles derfor ikke som to klart uavhengige evidenskilder under v4.2-kontrakten. Selve 25-metersbassenget er direkte dokumentert både i Oslo byleksikon og Oslo Byarkivs katalogmateriale.

Eldorado-påstanden `Norges første lydfilmkino` beholdes. Den støttes eksplisitt av både Oslo byleksikon og Store norske leksikon.

## Kilder kontrollert i fase 5

- Oslo byleksikon – Torggata: `https://oslobyleksikon.no/index.php/Torggata`
- Lokalhistoriewiki – Torggata (Oslo): `https://lokalhistoriewiki.no/index.php/Torggata_%28Oslo%29`
- Estate Nyheter – Jensen-familien i Torggata: `https://www.estatenyheter.no/aktuelt/torggata-5-til-olav-thon-for-110-millioner-kroner/137090`
- Oslo byleksikon – Eldorado: `https://oslobyleksikon.no/index.php?title=Eldorado`
- Store norske leksikon – lydfilm: `https://snl.no/lydfilm`
- Oslo byleksikon – Torggata bad: `https://oslobyleksikon.no/index.php/Torggata_bad`
- Oslo Byarkiv/Oslobilder – 25 × 12,5 m basseng: `https://www.oslobilder.no/BAR/A-20015/Ua/0001/031`
- Rockefeller – booking/utleie: `https://www.rockefeller.no/booking-utleie`
- Torggata Gateforening – Oslo Street Food: `https://www.torggata.oslo.no/oslo-street-food/`
- Torggata Gateforening – Om Torggata: `https://www.torggata.oslo.no/om-torggata/`
- Torggata Gateforening – gatekart: `https://www.torggata.oslo.no/gate-kart-torggata/`
- Oslo byleksikon – Strøget: `https://oslobyleksikon.no/side/Str%C3%B8get`
- Oslo Byarkiv/Oslobilder – Strøget åpning: `https://www.oslobilder.no/ARB/AAB-108532`

## v4.2-produksjonspakke

Ny fil: `data/places/production/torggata.json`

Pakken registrerer:

- `status: ready_v4_2`;
- resolved identitet og eksplisitte avgrensninger;
- 18 verifiserte claims;
- 4 strong-claims med minst to kilde-URL-er og `evidenceMode: explicit`;
- full setningsdekning: 3/3 `desc`, 31/31 `popupDesc`;
- ferske temporal-claims for nåværende Torggata bad/Rockefeller/John Dee/Oslo Street Food og dagens gateprofil;
- 10 quiz-readiness-spørsmål fordelt på 5 spørsmålstyper;
- faktareview og redaksjonell review satt til passed.

## Tekstgrenser og hash

Etter den ene minimale rettingen:

- `desc`: 49 ord;
- `popupDesc`: 481 ord;
- `popupDesc`: 5 avsnitt;
- `desc` SHA-256: `10711892bbf6acd84a9f8cfd4638c73ce39db71814b4f3619b4b5f6621a82fbb`;
- `popupDesc` SHA-256: `e4e0fa2ab0a249ee3619406972e454045e40cda98b500c50f2f00fa813709fef`.

## Fase-5-konklusjon før CI

Fase 5 er innholdsmessig ferdig på branch. Den settes ikke til **GODKJENT** før Place description governance og øvrig relevant CI er grønn, PR er squash-merget og resultatet er kontrollert på faktisk `main`.
