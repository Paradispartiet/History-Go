# History GO — obligatorisk tidligere-arbeid-gate for stedproduksjon

Status: **bindende tillegg til `docs/PLACE_PRODUCTION_CHECKLIST.md`**  
Eier: `place_by_place_production_workflow`  
Gjelder fra: **2026-08-11**

Denne gaten kjøres **før nullmåling og før enhver ny subsystemfase** på et eksisterende sted. Formålet er å hindre at ferdig, verifisert arbeid blir gjort om igjen eller erstattet av en ny tolkning uten at en faktisk regresjon først er bevist.

## Absolutt regel

**Sjekk alltid om jobben allerede er gjort før du starter den på nytt.**

Et tidligere merget og dokumentert arbeid regnes som gjeldende utgangspunkt når det fortsatt finnes i canonical data og ikke er motbevist av en konkret regresjon. At en ny researchrunde finner en annen mulig modell, er ikke i seg selv grunn nok til å overskrive tidligere godkjent arbeid.

## Obligatorisk preflight

Før en fase får status `PÅGÅR`, skal arbeidskortet dokumentere:

1. søk etter canonical `placeId`, visningsnavn, gamle navn og relevante aliaser;
2. søk i tidligere PR-er og commits på `placeId`/navn + subsystemet som skal røres, for eksempel `coordinate`, `quiz`, `people`, `stories`, `popup`, `rounds` eller `images`;
3. kontroll av eksisterende canonical fil, manifest/source-of-truth, evidensfiler, protokoller og relevante rapporter;
4. identifikasjon av **siste aksepterte mergete tilstand** og hvilken PR/commit som etablerte den;
5. kontroll av om dagens `main` faktisk avviker fra denne tilstanden på en måte som er feil, stale eller ufullstendig;
6. eksplisitt beslutning: `ALLEREDE FERDIG`, `REGRESJON SOM SKAL RETTES`, eller `REELT NYTT ARBEID`.

Hvis historikken viser at fasen allerede er ferdig og dagens data fortsatt følger den godkjente kontrakten, skal fasen markeres `ALLEREDE FERDIG` og **ikke produseres på nytt**.

## Særregel for koordinater

Før geokoding, OSM-research, nytt anker, ny radius eller ny geometry vurderes, skal det først søkes i:

- `docs/coordinates/coordinate-control-protocol.md`;
- `data/coordinate-evidence/**/<placeId>.json`;
- tidligere coordinate-PR-er og commits;
- eksisterende `routeSegments`, anchors og source metadata;
- tidligere visuell eller automatisert kart-QA.

En eksisterende `verified`, `verified_geometry` eller `verified_historical_source`-tilstand med dokumentert tidligere QA **blokkerer en ny coordinate-produksjon** inntil en konkret regresjon er dokumentert. En alternativ semantisk modell eller et annet mulig representasjonspunkt er ikke tilstrekkelig.

Ved reell regresjon skal siste gode mergete tilstand brukes som baseline. Korrigeringen skal være minst mulig og må ikke samtidig omskrive place-identitet eller annet innhold uten egen fase og egen evidens.

## Arbeidskortfelter

Alle nye eller videreførte stedkort skal kunne svare på:

```text
TIDLIGERE-ARBEID-SØK:
SISTE GODKJENTE PR/COMMIT:
SISTE GODKJENTE TILSTAND:
KONKRET REGRESJONSEVIDENS:
BESLUTNING: ALLEREDE FERDIG / REGRESJON / REELT NYTT ARBEID
```

Manglende svar betyr at fasen ikke kan starte.

## Læringscase: Torggata 2026-08-11

Torggata hadde allerede en verifisert gategeometri fra PR #3773/#3775. En senere produksjonsrunde behandlet koordinatfasen som åpen og erstattet punktet med et semantisk anker på Youngstorget. Dette var en arbeidsflytfeil: tidligere coordinate-produksjon skulle vært funnet og behandlet som baseline før ny research.

Korrigeringsregelen er derfor permanent: **historikk og tidligere godkjent arbeid kontrolleres før ny produksjon, ikke etterpå.**
