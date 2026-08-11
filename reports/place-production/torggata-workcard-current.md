# Torggata – aktivt stedproduksjonskort

- Oppdatert: 2026-08-11
- Place ID: `torggata`
- Canonical source: `data/places/by/oslo/places/torggata.json`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Obligatorisk preflight-tillegg: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Nullmåling: `reports/place-production/torggata-nullmaaling-v1.md`
- Kildebase: `reports/place-production/torggata-source-base-v1.md`
- Fase 4-audit: `reports/place-production/torggata-phase4-fagverk-audit-v1.md`
- Fase 5-audit: `reports/place-production/torggata-phase5-description-audit-v1.md`

## Korrigert fasestatus

| Fase | Status | Dokumentasjon |
| --- | --- | --- |
| 0. Nullmåling | **GODKJENT** | PR #4794, merge `694310c4e9b1b009b38f530479d823621bf5a388` |
| 1. Canonical identity/source | **GODKJENT** | PR #4795, merge `3f8d3b3a832e8604f2c1d1406365398c13e21c49` |
| 2. Kildebase | **GODKJENT** | PR #4796, merge `15ed74e57cb18940bb9fcba6b4907ac7dc862ae0` |
| 3. Koordinater/geometri | **ALLEREDE FERDIG – BEHOLD** | tidligere coordinate-produksjon, særlig PR #3773 og #3775 |
| 4. Kategori, Badges, emner og Fagverk | **GODKJENT** | PR #4813, merge `094fbcef5119fb6e3c427df2ee59ee645bd79795` |
| 5. `desc` + `popupDesc` | **PÅGÅR – KLAR FOR REVIEW** | tidligere tekst bevart; v4.2-retrofit, produksjonspakke og én minimal strong-claim-retting ferdig på aktiv branch |
| 6–15 | **IKKE STARTET** | styres av hovedchecklisten |

## Tidligere-arbeid-gate – koordinater

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: PR #3775 / 794e0cad02f54ba561e2af06e0ae839a95f11e52
SISTE GODKJENTE TILSTAND: verified_geometry, street_geometry_midpoint, ordnede routeSegments
KONKRET REGRESJONSEVIDENS: PR #4799 flyttet displaypunktet til Youngstorget og fjernet den tidligere routeSegments-modellen uten at tidligere ferdig coordinate-jobb først ble behandlet som baseline
BESLUTNING: REGRESJON – gjenopprett tidligere godkjent tilstand; ingen ny coordinate-produksjon
```

## Bindende coordinate-baseline

Torggata skal bruke den tidligere godkjente coordinate-tilstanden fra PR #3775:

- `lat`: `59.91700148933685`
- `lon`: `10.75330911912394`
- `r`: `180`
- `coordType`: `street_geometry_midpoint`
- `coordStatus`: `verified_geometry`
- operativt geometry-anker: `osm-way:467290774`
- ordnede `routeSegments` beholdes

Denne tilstanden ble etablert gjennom eksakt gategeometri-research i PR #3773 og anvendt/validert i PR #3775. Punktet ligger på selve Torggata-geometrien og skal ikke erstattes med et punkt midt på Youngstorget bare fordi torget inngår i den bredere gateidentiteten.

Følgende senere coordinatearbeid brukes ikke som gjeldende fasit: PR #4797, #4799, #4800 og #4802. Feilen var å gjøre om en allerede ferdig koordinatjobb uten først å kontrollere og respektere den tidligere godkjente coordinate-historikken.

## Fase 4 – tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: Ingen tidligere PR funnet som godkjenner fase 4 etter dagens place-checklist
SISTE GODKJENTE TILSTAND: Arvet category=by, to em_by_* og Badges-runding
KONKRET REGRESJONSEVIDENS: Generisk fagverk-sted.html og Politikk-overlaget lekket Politikk-presentasjon inn i ikke-Politikk-steder
BESLUTNING: REELT NYTT AUDITARBEID – behold beståtte fagdata, rett runtimefeilen
```

### Fase 4 – godkjent resultat

- `category: by` er canonical og beholdes;
- `em_by_gentrifisering_eiendom` beholdes med kildebasens dokumenterte inferensgrense;
- `em_by_styring_forvaltning_planmakt` beholdes med avgrensning mot udokumentert enkel kausalitet;
- ingen `underbadge_ids` ble lagt til bare for å fylle felt;
- `badges` finnes allerede;
- By-merket og By-faget er materialisert i portalregisteret;
- generisk `fagverk-sted.html` er gjort fagnøytral;
- Politikk-integrasjonen kjører bare ved eksplisitt Politikk-identitet;
- Torggatas By-rendering kan ikke overskrives av tom Politikk-modell;
- regresjonstesten låser `by`-identitet, begge By-emnene, Badges-rundingen og materialisert By-portal.

PR #4813 ble squash-merget etter grønn Fagverk and place learning, Fagverk By Data og styring Phase 4 og TypeScript guard. `main` ble kontrollert på merge `094fbcef5119fb6e3c427df2ee59ee645bd79795` før fase 5 startet.

## Fase 5 – tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: ecd3af8ec85615e39bc84579f4511bba06e04b72 – «Utvid Torggata til innholdsrik popupDesc»
SISTE GODKJENTE TILSTAND: dagens desc/popupDesc er etterkommer av tidligere merget tekst
KONKRET REGRESJONSEVIDENS: ingen generell tekstregresjon; manglende v4.2-produksjonspakke og én superlativpåstand tilfredsstilte ikke dagens strong-claim-kontrakt
BESLUTNING: RETROFIT – bevar teksten; rett bare det konkrete kontraktavviket
```

### Fase 5 – aktivt resultat

- `desc` beholdes uendret: 49 ord;
- `popupDesc` beholdes redaksjonelt og strukturelt;
- eneste innholdsendring er `byens første 25-metersbasseng` → `et 25-metersbasseng`;
- Eldorados `Norges første lydfilmkino` beholdes fordi påstanden har to uavhengige kilder;
- ny `data/places/production/torggata.json` følger v4.2.1 med 18 verifiserte claims;
- setningsdekning er 3/3 for `desc` og 31/31 for `popupDesc`;
- fire strong-claims har eksplisitt evidens og minst to kilde-URL-er;
- ferske temporal-claims dekker nåværende stedselementer;
- quiz-readiness inneholder 10 direkte spørsmål fordelt på 5 typer;
- `desc`-hash: `10711892bbf6acd84a9f8cfd4638c73ce39db71814b4f3619b4b5f6621a82fbb`;
- `popupDesc`-hash: `e4e0fa2ab0a249ee3619406972e454045e40cda98b500c50f2f00fa813709fef`.

Fase 5 settes først **GODKJENT** etter grønn Place description governance, merge og kontroll på faktisk `main`. Fase 6 starter ikke før dette er gjort.
