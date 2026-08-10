# Torggata – aktivt stedproduksjonskort

- Oppdatert: 2026-08-11
- Place ID: `torggata`
- Canonical source: `data/places/by/oslo/places/torggata.json`
- Aktiv `main` ved fasestart: `3f8d3b3a832e8604f2c1d1406365398c13e21c49`
- Nullmåling: `reports/place-production/torggata-nullmaaling-v1.md`
- Kildebase: `reports/place-production/torggata-source-base-v1.md`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`

## Fasestatus

| Fase | Status | Merge/live-check |
| --- | --- | --- |
| 0. Nullmåling | **GODKJENT** | PR #4794, merge `694310c4e9b1b009b38f530479d823621bf5a388`; rapport kontrollert på `main` |
| 1. Canonical identity/source | **GODKJENT** | PR #4795, merge `3f8d3b3a832e8604f2c1d1406365398c13e21c49`; arbeidskort kontrollert på `main` |
| 2. Kildebase | **KLAR FOR REVIEW** | `torggata-source-base-v1.md`; ingen brukerrettede data endret |
| 3. Koordinater/geometri | **NESTE – IKKE STARTET** | kjent identitet/geometri-avvik; coordinate-kontraktene skal leses før endring |
| 4–15 | **IKKE STARTET** | se nullmålingen |

Bare én produksjonsfase regnes som aktiv om gangen. Fase 3 starter først når fase 2 er merget og verifisert på faktisk `main`.

## Aktiv fase 2 – kildebase

### LES FØRST gjennomført

- `docs/FACTUALITY_CONTRACT.md`
- relevant fase 2-del i `docs/PLACE_PRODUCTION_CHECKLIST.md`

### Aktivt filscope

- `reports/place-production/torggata-source-base-v1.md`
- `reports/place-production/torggata-workcard-current.md`

Ingen place-, Leksikon-, Quiz-, Story-, People-, Brand-, Works-, Object-, coordinate- eller runtime-fil skal endres i denne fasen.

### Leveransen

Kildebasen registrerer inspectable kjeder som:

`påstand → konkret kilde → konkret sourceLocation → kontrollstatus → begrensning`

Den skiller eksplisitt mellom:

- stabil gateidentitet og navnehistorie;
- historisk opparbeiding og bruk;
- konkrete bygg- og institusjonscase i gaten;
- historiske empiriske mobilitetsdata;
- nåtidsopplysninger som krever fersk kontroll;
- fagfellevurdert analyse av delvis gentrifisering og utviklermakt;
- påstander som foreløpig avvises fordi kausalitet, fortrengning, prisnivå eller dagens virksomhetsmiks ikke er godt nok dokumentert.

Bymiljøetatens `Torggata - oppfølgingsundersøkelse` er lokalisert som offentlig dokument, men selve PDF-en er ikke inspisert i denne fasen. Derfor støtter rapporten ingen claim fra dokumentets innhold ennå.

## Beholdt identitetsbeslutning fra fase 1

- `torggata` representerer gaten Torggata;
- canonical identitetsgrense er Stortorvet–Ankertorget;
- manifest-loadet source er `data/places/by/oslo/places/torggata.json`;
- `torggata_blad` er et separat Subkultur-objekt;
- enkeltbygg, virksomheter og scener i gaten er relaterte case, ikke synonymer for place-objektet.

## Kjente blokkeringer som bæres videre

### Koordinat/geometri

Gjeldende coordinate-evidence og `routeSegments` dekker Youngstorget–Ankertorget, mens canonical identitet er Stortorvet–Ankertorget. Dette skal løses i fase 3 etter at alle tre coordinate-kontraktene checklisten krever er lest.

### Leksikon

Torggata-oppføringen har tomme kildefelt for hovedoppføring, facts og chronology. Dette skal ikke repareres før popup/Leksikon-fasen og den relevante kontrakten er lest.

### Rundinger

Den gamle ni-runders Torggata-auditen er historikk, ikke dagens canonical proof. Sanering skjer først i egen rundingsfase etter `data/places/README_place_rounds.md`.

## Forrige fase merget og live-kontrollert

**Ja.** Fase 1 ble squash-merget i PR #4795 og `reports/place-production/torggata-workcard-current.md` ble deretter lest tilbake fra `main`.

## Neste fase etter merge

**Fase 3 – koordinat, anker, radius og geometry.**

Før første coordinate-endring skal disse leses i rekkefølge:

1. `docs/coordinates/README.md`
2. `docs/coordinates/coordinate-source-contract-v1.md`
3. `docs/coordinates/coordinate-evidence-files-v1.md`

Dersom disse kontraktene peker videre til andre bindende filer for gategeometri eller audit, leses også de før produksjon.

## Ferdiggrense for fase 2

Fase 2 kan godkjennes når:

- kildebasen er den eneste nye researchleveransen utover dette arbeidskortet;
- alle vesentlige claims har kilde, sourceLocation, status og begrensning;
- uverifiserte claims er uttrykkelig holdt ute;
- ingen brukerrettet sannhet er endret;
- PR-en er merget og begge filene er kontrollert på faktisk `main`.
