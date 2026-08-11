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
- Fase 6-audit: `reports/place-production/torggata-phase6-structured-profiles-audit-v1.md`
- Fase 7-audit: `reports/place-production/torggata-phase7-popup-tabs-audit-v1.md`

## Korrigert fasestatus

| Fase | Status | Dokumentasjon |
| --- | --- | --- |
| 0. Nullmåling | **GODKJENT** | PR #4794, merge `694310c4e9b1b009b38f530479d823621bf5a388` |
| 1. Canonical identity/source | **GODKJENT** | PR #4795, merge `3f8d3b3a832e8604f2c1d1406365398c13e21c49` |
| 2. Kildebase | **GODKJENT** | PR #4796, merge `15ed74e57cb18940bb9fcba6b4907ac7dc862ae0` |
| 3. Koordinater/geometri | **ALLEREDE FERDIG – BEHOLD** | tidligere coordinate-produksjon, særlig PR #3773 og #3775 |
| 4. Kategori, Badges, emner og Fagverk | **GODKJENT** | PR #4813, merge `094fbcef5119fb6e3c427df2ee59ee645bd79795` |
| 5. `desc` + `popupDesc` | **GODKJENT** | PR #4815, merge `0528b259fcb6dc0e2a3ea68b6d3e3925bbfe5a4e` |
| 6. Strukturerte place-profiler | **GODKJENT** | PR #4816, merge `e155aea8b0717c623a1de9904dcc253e8820f356` |
| 7. Popupfaner | **PÅGÅR – AUDIT FERDIG; 7A OM NESTE** | åtte faner eksplisitt vurdert; Nyheter, Lesespor og Mer begrunnet N/A; 7A–7E er reelle restleveranser |
| 8–15 | **IKKE STARTET** | styres av hovedchecklisten |

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

### Fase 5 – godkjent resultat

- `desc` beholdes uendret: 49 ord;
- `popupDesc` beholdes redaksjonelt og strukturelt;
- eneste innholdsendring er `byens første 25-metersbasseng` → `et 25-metersbasseng`;
- Eldorados `Norges første lydfilmkino` beholdes fordi påstanden har to uavhengige kilder;
- `data/places/production/torggata.json` følger v4.2.1 med 18 verifiserte claims;
- setningsdekning er 3/3 for `desc` og 31/31 for `popupDesc`;
- fire strong-claims har eksplisitt evidens og minst to kilde-URL-er;
- ferske temporal-claims dekker nåværende stedselementer;
- quiz-readiness inneholder 10 direkte spørsmål fordelt på 5 typer;
- `desc`-hash: `10711892bbf6acd84a9f8cfd4638c73ce39db71814b4f3619b4b5f6621a82fbb`;
- `popupDesc`-hash: `e4e0fa2ab0a249ee3619406972e454045e40cda98b500c50f2f00fa813709fef`.

PR #4815 passerte Place description governance, Data checks, Fagverk and place learning, Nature data validation and candidates og Fagverk By Data og styring Phase 4 på samme head. PR-en ble squash-merget, og faktisk `main` ble kontrollert på merge `0528b259fcb6dc0e2a3ea68b6d3e3925bbfe5a4e` før fase 6 startet.

## Fase 6 – tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: Ingen tidligere Torggata-PR funnet som eier fase 6 etter dagens checklist
SISTE GODKJENTE TILSTAND: stedet hadde rike enkeltfelt, men ingen canonical strukturerte place-profiler
KONKRET REGRESJONSEVIDENS: ingen
BESLUTNING: REELT NYTT ARBEID – bygg bare kildebårne strukturer som tilfører ny organisering
```

### Fase 6 – godkjent resultat

- `spatial_profile` skiller canonical gateidentitet fra den kortere operative routeSegments-kjeden;
- 574,5 meter gjøres ikke til påstått full Torggata-lengde;
- `temporal_profile` bruker seks hovedmilepæler og blir ikke en parallell chronology;
- `subplaces` består bare av de to dokumenterte gatesegmentene Stortorvet–Youngstorget og Youngstorget–Ankertorget;
- `history_layers` gir fem korte, kildebårne historiske lag uten å duplisere full chronology;
- `source_summary.safe_sources` inneholder bare eksterne brukerrettede kilder;
- `nature_profile` er **N/A** med konkret begrunnelse: urbant gateløp uten dokumentert naturfaglig rolle i stedspakken;
- fase 5-tekster og production package er urørt.

PR #4816 passerte Fagverk By Data og styring Phase 4, Nature data validation and candidates, Place description governance, Fagverk and place learning og Data checks på samme head. PR-en ble squash-merget, og faktisk `main` ble kontrollert på merge `e155aea8b0717c623a1de9904dcc253e8820f356` før fase 7 startet.

## Fase 7 – tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: tab-runtime, Torggata-leksikon, én canonical Story, for_na, Lesespor og externalLinks finnes allerede
NY PRODUKSJON FØR AUDIT: FORBUDT
BESLUTNING: REELT AUDITARBEID – vurder hver av åtte canonical popupfaner separat og behold eksisterende data som faktisk består kontrakten
```

### Fase 7 – auditresultat

- **Om – TRENGER ARBEID / 7A:** fase-5-artikkelen og fase-6 spatial/subplaces er på plass, men ukildet legacy-Leksikonstoff legges fortsatt inn i Om. `temporal_profile` har helper i runtime, men ingen presentasjonsrenderer.
- **Historie – TRENGER ARBEID / 7B:** `history_layers` vises, mens Leksikon-chronology fortsatt er én generisk ukildet post.
- **Fortellinger – TRENGER ARBEID / 7C:** én aktiv Torggata-story finnes; narrativet beholdes, men legacy-type `urban_change` og tematisk `next_scenes` må re-auditeres mot dagens Story-governance.
- **Før/etter – TRENGER ARBEID / 7D:** `for_na` finnes, men interne History GO/Wonderkammer-kilder kan ikke være selvstendig faktagrunnlag, og kontrollert bildepar mangler.
- **Nyheter – BEGRUNNET N/A:** ingen canonical Torggata-notiser er dokumentert som relevante nok til produksjon nå.
- **Lesespor – BEGRUNNET N/A:** eksisterende Torggata-koblinger er subscription/paywall og filtreres korrekt fra den åpne stedflaten; ingen åpent direkte lesbart Torggata-spor er dokumentert.
- **Kilder – TRENGER ARBEID / 7E:** sikre kildenavn finnes, men flere av dem er bare labels og ikke inspectable brukerrettede HTTPS-lenker.
- **Mer – BEGRUNNET N/A:** ingen Torggata-post i Språkleksikon-manifestet og ingen særskilt canonical Mer-pakke som må vises; fanen skal ikke fylles med legacy-/handlingselementer.

### Korrigert runtimeforståelse

Fase-6-feltene er ikke generelt frakoblet popupen. `place-popup-v2.js` renderer `spatial_profile`, `subplaces`, `history_layers` og `source_summary`, og tabs-wrapperen fordeler dem til Om, Historie og Kilder. Det konkrete profilgapet som auditen fant er at `temporalProfile(place)` finnes som helper, men ikke brukes av en renderer.

### Bindende delstegrekkefølge

```text
7 audit → 7A Om → 7B Historie → 7C Fortellinger → 7D Før/etter → 7E Kilder
```

Bare ett delsteg kan være aktivt om gangen. Fase 7 settes først **GODKJENT** når 7A–7E er ferdige og kontrollert på faktisk `main`.
