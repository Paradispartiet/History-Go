# Torggata – aktivt stedproduksjonskort

- Oppdatert: 2026-08-11
- Place ID: `torggata`
- Canonical source: `data/places/by/oslo/places/torggata.json`
- Nullmåling: `reports/place-production/torggata-nullmaaling-v1.md`
- Kildebase: `reports/place-production/torggata-source-base-v1.md`
- Tidligere coordinate research: PR #3773 / PR #3775, 2026-07-25
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Coordinate-preflight: `docs/coordinates/README.md`

## Viktig korrigering 2026-08-11

Torggata-coordinatefasen skulle **ikke ha blitt åpnet på nytt** under denne stedproduksjonen.

Historikken viser at Torggata allerede var undersøkt og materialisert som gategeometri i PR #3773 og PR #3775 25. juli 2026. PR #3775 satte displaypunktet direkte på navngitt Torggata-geometri til `59.91700148933685, 10.75330911912394`, med `sourceObjectId: osm-way:467290774` og `coordType: street_geometry_midpoint`.

PR #4799 flyttet senere markøren til Youngstorget (`59.91478, 10.74923`, `osm-way:112054930`) fordi coordinate-jobben feilaktig ble behandlet som åpen. PR #4800 synkroniserte denne regresjonen til runtime-indeksen, og PR #4802 dokumenterte den som om den var en ny godkjent coordinate-retning.

Dette er nå klassifisert som **dobbeltarbeid og coordinate-regresjon**, ikke som en legitim ny coordinatefase. Korrigerings-PR #4809 gjenoppretter den tidligere godkjente gateplasseringen og supersederer coordinate-konklusjonene i PR #4799, #4800 og #4802.

## Fasestatus

| Fase | Status | Merge/live-check |
| --- | --- | --- |
| 0. Nullmåling | **GODKJENT** | PR #4794, merge `694310c4e9b1b009b38f530479d823621bf5a388` |
| 1. Canonical identity/source | **GODKJENT** | PR #4795, merge `3f8d3b3a832e8604f2c1d1406365398c13e21c49` |
| 2. Kildebase | **GODKJENT** | PR #4796, merge `15ed74e57cb18940bb9fcba6b4907ac7dc862ae0` |
| 3. Koordinat | **GODKJENT SOM EKSISTERENDE ARBEID – GJENOPPRETTET** | Opprinnelig PR #3773/#3775; regresjon fra #4799/#4800 korrigeres i #4809 |
| 4–15 | **IKKE STARTET** | fortsetter etter korrigeringsmerge |

Coordinatefasen skal dermed ikke lenger blokkere neste stedproduksjonsfase bare fordi den feilaktig ble gjenåpnet 11. august.

## Gjeldende coordinate-beslutning

- `locatorType: street`
- `lat: 59.91700148933685`
- `lon: 10.75330911912394`
- `r: 180`
- `coordStatus: verified_geometry`
- `coordType: street_geometry_midpoint`
- `sourceProvider: osm`
- `sourceObjectId: osm-way:467290774`
- `coordSource: OpenStreetMap exact-name street topology`
- `coordVerifiedAt: 2026-07-25`

Displaymarkøren skal ligge **i Torggata**, ikke midt på Youngstorget. At Torggata historisk og fysisk går gjennom Youngstorget endrer ikke dette displaykravet.

## Permanent læring fra regresjonen

Før coordinate research eller coordinate-endring på et sted skal produksjonen alltid:

1. lese dagens canonical coordinate metadata og evidence;
2. søke coordinate-control-protokollen;
3. søke Git-/PR-historikk etter tidligere coordinate- og map-point-arbeid;
4. kontrollere om avgjørelsen allerede er materialisert i runtime/indeks;
5. la eksisterende `verified*`-beslutning stå dersom det ikke finnes et konkret regressjonssignal eller eksplisitt oppdrag om ny koordinat.

En ny innholdschecklist for et sted åpner **ikke automatisk coordinatefasen på nytt**.

## Kjente andre blokkeringer som ikke hører til coordinatefasen

### Leksikon

Torggata-oppføringen har tomme kildefelt for hovedoppføring, facts og chronology. Dette repareres først i popup/Leksikon-fasen etter riktig kontrakt.

### Rundinger

Den gamle ni-runders Torggata-auditen er historikk, ikke dagens canonical proof. Sanering skjer først i egen rundingsfase etter `data/places/README_place_rounds.md`.

### Fagkoblinger

Kategori `by` og dagens `em_by_*` revideres først i fase 4 etter category- og Fagverk-kontraktene. Coordinatearbeid skal ikke drive faglig omklassifisering.

## Neste fase

Etter at korrigerings-PR #4809 er merget og coordinate source/runtime igjen er synkronisert på den tidligere godkjente gateplasseringen, går Torggata videre til **fase 4** i stedproduksjonschecklisten.
