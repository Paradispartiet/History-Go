# Torggata – aktivt stedproduksjonskort

- Oppdatert: 2026-08-11
- Place ID: `torggata`
- Canonical source: `data/places/by/oslo/places/torggata.json`
- Aktiv `main` ved fasestart: `2f96e793229d1ee818db1cb0d98f59bd1b9c4f4f`
- Nullmåling: `reports/place-production/torggata-nullmaaling-v1.md`
- Kildebase: `reports/place-production/torggata-source-base-v1.md`
- Coordinate research: `reports/place-production/torggata-coordinate-research-v2.md`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`

## Fasestatus

| Fase | Status | Merge/live-check |
| --- | --- | --- |
| 0. Nullmåling | **GODKJENT** | PR #4794, merge `694310c4e9b1b009b38f530479d823621bf5a388`; rapport kontrollert på `main` |
| 1. Canonical identity/source | **GODKJENT** | PR #4795, merge `3f8d3b3a832e8604f2c1d1406365398c13e21c49`; arbeidskort kontrollert på `main` |
| 2. Kildebase | **GODKJENT** | PR #4796, merge `15ed74e57cb18940bb9fcba6b4907ac7dc862ae0`; kildebase og arbeidskort lest tilbake fra `main` |
| 3. Koordinater/geometri | **PÅGÅR – RESEARCH LÅST** | feilårsak og implementeringsstrategi dokumentert i `torggata-coordinate-research-v2.md`; canonical coordinate-data er ikke endret ennå |
| 4–15 | **IKKE STARTET** | se nullmålingen |

Bare én produksjonsfase regnes som aktiv om gangen. Fase 4 starter ikke før hele fase 3 er implementert, validert, merget, kartkontrollert og ført i coordinate-control-protokollen.

## Aktiv fase 3 – koordinat, anker, radius og geometry

### LES FØRST gjennomført

- `docs/coordinates/README.md`
- `docs/coordinates/coordinate-source-contract-v1.md`
- `docs/coordinates/coordinate-evidence-files-v1.md`
- `docs/coordinate-finder.md`
- `docs/coordinates/coordinate-control-protocol.md`
- `docs/coordinates/address-first-coordinate-policy.md`
- relevant fase 3-del i `docs/PLACE_PRODUCTION_CHECKLIST.md`

### Aktivt filscope i denne del-PR-en

- `reports/place-production/torggata-coordinate-research-v2.md`
- `reports/place-production/torggata-workcard-current.md`

Ingen canonical place-, evidence-, index- eller runtimefil endres i research-delsteget.

## Låst identitetsbeslutning

`torggata` representerer gaten Torggata fra **Stortorvet til Ankertorget**.

Oslo byleksikon dokumenterer både full gateutstrekning og at Youngstorget krysses av Torggata. Place-identiteten skal derfor ikke snevres inn for å passe dagens OSM-komponent.

## Coordinate-funn

Den gamle Overpass-batchen fant 13 ways med `name=Torggata`, men valgte bare største connected component på 12 ways.

Den utelatte sørlige komponenten er `osm-way:267226140`, som går fra Stortorvet mot Youngstorget. OSM modellerer Youngstorget som eget pedestrian-/torgareal (`osm-way:112054930`), og dette skaper et kartteknisk navnegap før den nordlige Torggata-komponenten starter.

Det er derfor feil å behandle Youngstorget–Ankertorget-komponenten som hele Torggata.

Dagens to anchors er i tillegg reversert i navn:

- `59.9186126, 10.7573038` ligger nord mot Ankertorget, ikke sør ved Youngstorget;
- `59.9151042, 10.7498145` ligger sør ved Youngstorget, ikke nord ved Ankertorget.

## Implementeringsbeslutning for neste delsteg i fase 3

Neste delsteg skal:

1. beholde `locatorType: street`;
2. bruke et dokumentert semantisk line-anchor ved Youngstorget-krysset, ikke et adressepunkt;
3. registrere sør-, midt- og nordanker for Stortorvet, Youngstorget og Ankertorget;
4. korrigere de reverserte anchor-navnene;
5. fjerne/erstatte dagens ufullstendige `routeSegments` slik at en delkjede ikke presenteres som hele gaten;
6. oppdatere `data/coordinate-evidence/oslo/by/torggata.json` med sørlig way, Youngstorget-gap og nordlig komponent;
7. beholde `r: 180` med mindre kart-/runtime-QA viser et eget gameplayproblem;
8. kjøre alle coordinate-portene og visuell kartkontroll;
9. oppdatere `docs/coordinates/coordinate-control-protocol.md` før fase 3 kan godkjennes.

Ingen syntetisk «eksakt» OSM-centerline skal diktes gjennom Youngstorget når OSM selv modellerer torget som areal.

## Kjente andre blokkeringer som ikke røres i fase 3

### Leksikon

Torggata-oppføringen har tomme kildefelt for hovedoppføring, facts og chronology. Dette repareres først i popup/Leksikon-fasen etter riktig kontrakt.

### Rundinger

Den gamle ni-runders Torggata-auditen er historikk, ikke dagens canonical proof. Sanering skjer først i egen rundingsfase etter `data/places/README_place_rounds.md`.

### Fagkoblinger

Kategori `by` og dagens `em_by_*` revideres først i fase 4 etter category- og Fagverk-kontraktene. Coordinate-fasen skal ikke drive faglig omklassifisering.

## Forrige fase merget og live-kontrollert

**Ja.** Fase 2 ble squash-merget i PR #4796 med merge `15ed74e57cb18940bb9fcba6b4907ac7dc862ae0`, og både kildebasen og arbeidskortet ble lest tilbake fra faktisk `main`.

## Ferdiggrense for research-delsteget

Research-delsteget kan godkjennes når:

- coordinate-kontraktene er lest;
- den gamle feilårsaken er dokumentert med konkrete OSM-objekter;
- full canonical gateidentitet er bevart;
- implementeringsstrategien unngår både adresseproxy og syntetisk falsk geometri;
- ingen canonical coordinate-data er endret i samme research-PR;
- PR-en er merget og begge rapportfilene er kontrollert på faktisk `main`.

**Fase 3 som helhet er fortsatt PÅGÅR etter denne del-PR-en.**
