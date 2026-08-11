# Torggata – coordinate correction V4

- Dato: 2026-08-11
- Place ID: `torggata`
- Status: **REGRESJON KORRIGERT**

## Hva som skjedde

Torggata-coordinatejobben var allerede gjennomført 25. juli 2026 i PR #3773 og PR #3775. PR #3775 materialiserte et displaypunkt direkte på navngitt Torggata-geometri:

- `lat: 59.91700148933685`
- `lon: 10.75330911912394`
- `coordType: street_geometry_midpoint`
- `sourceObjectId: osm-way:467290774`
- `coordStatus: verified_geometry`

Under senere stedproduksjon ble coordinatefasen feilaktig åpnet på nytt. PR #4799 flyttet displaypunktet til Youngstorget (`59.91478, 10.74923`, `osm-way:112054930`), PR #4800 synkroniserte dette til runtime-indeksen, og PR #4802 dokumenterte Youngstorget-løsningen som aktiv QA-retning.

Dette var en regressjon i displayplassering: Torggata-markøren skal ligge i selve Torggata, ikke midt på det separate canonicale torgobjektet Youngstorget.

## Korrigering

PR #4809 gjenoppretter den tidligere godkjente Torggata-plasseringen og coordinate-evidence, og synkroniserer runtime-indeksen tilbake til samme coordinate-identitet. Den fjerner også den supersederte QA-rapporten som beskrev Youngstorget-løsningen som gjeldende.

`docs/coordinates/coordinate-control-protocol.md` tilbakeføres til tilstanden før den feilaktige 11. august-korrigeringen. Den operative coordinate-fasiten er canonical place + coordinate-evidence + materialisert runtime-index.

## Permanent prosessregel

Før et sted får ny coordinate-research eller coordinate-endring skal eksisterende arbeid alltid auditeres først:

1. canonical coordinate metadata;
2. coordinate-evidence;
3. coordinate-control-protokoll;
4. Git-/PR-historikk;
5. runtime/index-paritet.

Et sted med tidligere dokumentert og materialisert `verified*` coordinate-beslutning skal ikke få coordinatefasen gjenåpnet bare fordi stedet går gjennom ny innholdsproduksjon. Ny coordinatejobb krever et konkret regressjonssignal, identitetsproblem eller eksplisitt nytt coordinate-oppdrag.
