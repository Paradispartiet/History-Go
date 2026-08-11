# Torggata – aktivt stedproduksjonskort

- Oppdatert: 2026-08-11
- Place ID: `torggata`
- Canonical source: `data/places/by/oslo/places/torggata.json`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Obligatorisk preflight: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Nullmåling: `reports/place-production/torggata-nullmaaling-v1.md`
- Kildebase: `reports/place-production/torggata-source-base-v1.md`
- Fase 4-audit: `reports/place-production/torggata-phase4-fagverk-audit-v1.md`
- Fase 5-audit: `reports/place-production/torggata-phase5-description-audit-v1.md`
- Fase 6-audit: `reports/place-production/torggata-phase6-structured-profiles-audit-v1.md`
- Fase 7-audit: `reports/place-production/torggata-phase7-popup-tabs-audit-v1.md`
- Fase 7A-audit: `reports/place-production/torggata-phase7a-about-audit-v1.md`
- Fase 7B-audit: `reports/place-production/torggata-phase7b-history-audit-v1.md`

## Fasestatus

| Fase | Status | Dokumentasjon |
| --- | --- | --- |
| 0. Nullmåling | **GODKJENT** | PR #4794, merge `694310c4e9b1b009b38f530479d823621bf5a388` |
| 1. Canonical identity/source | **GODKJENT** | PR #4795, merge `3f8d3b3a832e8604f2c1d1406365398c13e21c49` |
| 2. Kildebase | **GODKJENT** | PR #4796, merge `15ed74e57cb18940bb9fcba6b4907ac7dc862ae0` |
| 3. Koordinater/geometri | **ALLEREDE FERDIG – BEHOLD** | PR #3773/#3775; korrigert tilbake i PR #4810 |
| 4. Kategori, Badges, emner og Fagverk | **GODKJENT** | PR #4813, merge `094fbcef5119fb6e3c427df2ee59ee645bd79795` |
| 5. `desc` + `popupDesc` | **GODKJENT** | PR #4815, merge `0528b259fcb6dc0e2a3ea68b6d3e3925bbfe5a4e` |
| 6. Strukturerte place-profiler | **GODKJENT** | PR #4816, merge `e155aea8b0717c623a1de9904dcc253e8820f356` |
| 7. Popupfaner | **PÅGÅR – 7B HISTORIE KLAR FOR REVIEW** | audit PR #4817; 7A Om PR #4820; 7B aktiv branch |
| 8–15 | **IKKE STARTET** | styres av hovedchecklisten |

## Bindende coordinate-baseline

Koordinatjobben skal ikke åpnes på nytt uten konkret regresjonsevidens.

- `lat`: `59.91700148933685`
- `lon`: `10.75330911912394`
- `r`: `180`
- `coordType`: `street_geometry_midpoint`
- `coordStatus`: `verified_geometry`
- operativt geometry-anker: `osm-way:467290774`
- ordnede `routeSegments` beholdes

Tidligere-arbeid-gaten klassifiserte PR #4797/#4799/#4800/#4802 som feilaktig gjenåpning av allerede ferdig coordinatearbeid. PR #3775 er bindende baseline; PR #4810 gjenopprettet den.

## Fase 4 – godkjent resultat

- `category: by` beholdes;
- `em_by_gentrifisering_eiendom` og `em_by_styring_forvaltning_planmakt` beholdes innen dokumenterte inferensgrenser;
- ingen underbadge ble lagt til som filler;
- generisk `fagverk-sted.html` ble gjort fagnøytral;
- Politikk-overlaget kjører bare ved eksplisitt Politikk-identitet;
- Torggatas By-rendering er regresjonslåst.

## Fase 5 – godkjent resultat

Tidligere merget Torggata-tekst ble behandlet som baseline, ikke omskrevet på nytt.

- `desc`: beholdt;
- `popupDesc`: beholdt, bortsett fra `byens første 25-metersbasseng` → `et 25-metersbasseng`;
- Eldorados `Norges første lydfilmkino` beholdes med dobbeltkilde;
- `data/places/production/torggata.json` følger v4.2.1;
- 18 verifiserte claims;
- setningsdekning 3/3 `desc`, 31/31 `popupDesc`;
- fire strong-claims med eksplisitt evidens;
- 10 quiz-readiness-spørsmål / 5 typer.

## Fase 6 – godkjent resultat

- `spatial_profile` skiller canonical gateidentitet fra den kortere operative routeSegments-kjeden;
- 574,5 meter brukes ikke som påstått full Torggata-lengde;
- `temporal_profile` har seks hovedmilepæler;
- `subplaces` har to reelle gatesegmenter;
- `history_layers` har fem korte historiske lag;
- `source_summary.safe_sources` inneholder eksterne brukerrettede kilder;
- `nature_profile` er begrunnet N/A.

## Fase 7 – popupaudit

Alle åtte faner er vurdert separat:

- **Om:** 7A behandlet;
- **Historie:** 7B aktiv;
- **Fortellinger:** 7C gjenstår;
- **Før/etter:** 7D gjenstår;
- **Nyheter:** **BEGRUNNET N/A** – ingen relevant canonical Torggata-notis dokumentert;
- **Lesespor:** **BEGRUNNET N/A** – eksisterende Torggata-koblinger er subscription/paywall og filtreres fra åpen stedflate;
- **Kilder:** 7E gjenstår;
- **Mer:** **BEGRUNNET N/A** – ingen Språkleksikon-/observasjonspakke som bør fylles inn kunstig.

### Runtimeforståelse

`place-popup-v2.js` renderer allerede `spatial_profile`, `subplaces`, `history_layers` og `source_summary`, og tabs-wrapperen fordeler dem til Om, Historie og Kilder. `temporal_profile` har ingen egen renderer; Historie/Leksikon chronology er den brukerrettede tidslinjeeieren.

## Fase 7A – Om, GODKJENT

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
LEGACY-FUNN: leksikon_oslo_by_batch1.json hadde Torggata-fallback med generisk gentrifiseringsprosa og tomme sources
BESLUTNING: behold fase-5 popupDesc og fase-6 profiler; legg til egen kildebåret manifest-hovedartikkel
```

PR #4820 ble squash-merget til `main` som `49b79250403bdbfd6db0a4d07aa57887fa7eefe4` etter grønn Fagverk By-port og TypeScript guard.

7A leverte:

- `data/leksikon/places/oslo/by/leksikon_oslo_by_torggata.json` med `title: Torggata`, `type: main`;
- to inspectable eksterne kilder og kildebelagte facts;
- manifestregistrering;
- eksisterende runtimeprioritet for eksakt stedsnavn;
- ingen endring i canonical place-record eller fase-5-tekst.

## Fase 7B – Historie, aktiv

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
TIDLIGERE GODKJENT CHRONOLOGYJOBB: ingen funnet etter dagens kontrakt
LEGACY-FUNN: navnløs Torggata-batchpost har ukildet chronology «Senmodernitet»
BEHOLD: fase-6 history_layers og fase-5 kilde-/claim-base
BESLUTNING: bygg seks korte kildebårne chronology-poster og filtrer bare navnløs legacy-extra via eksplisitt opt-in
```

Aktiv 7B-leveranse:

- chronology-år: `1846 · 1852 · 1876 · 1929 · 1986 · 2014`;
- alle chronology-poster har konkrete HTTPS-kilder;
- chronology svarer bare på **hva som skjedde når** og kopierer ikke Storyen;
- hovedartikkelen bruker `suppress_untitled_legacy_articles: true`;
- `place-popup-tabs.js` har generell `visibleArticlesForPopup()` som bare aktiveres ved dette flagget;
- navngitte ekstraartikler beholdes; navnløse legacy-extras filtreres fra popupen;
- ingen place-ID hardkodes i runtime;
- `tests/torggata-phase7b-history.test.mjs` låser chronology og supersession-regelen;
- den fysiske legacy-posten slettes ikke og beholdes for sporbarhet.

### Bindende delstegrekkefølge

```text
7 audit → 7A Om → 7B Historie → 7C Fortellinger → 7D Før/etter → 7E Kilder
```

7B settes først **GODKJENT** etter relevant CI, squash-merge og kontroll på faktisk `main`. 7C starter først da.
