# Civication systemkart PR-review (første steg)

Dato: 2026-05-09

## Kontekst
Denne reviewen er gjort mot nåværende branch-innhold i `/workspace/History-Go`.

## Funn

### 1) Kollisjon: `CivicationSystemMap.js` vs `CivicationMap.js`
- `CivicationSystemMap.js` finnes ikke i branchens filer.
- Det finnes kun `js/Civication/ui/CivicationMap.js`.
- Konsekvens: Kollisjonsanalyse mellom to filer kan ikke verifiseres før `CivicationSystemMap.js` faktisk ligger i PR-en.

### 2) `btnCiviMap`-binding (dobbeltbinding / konflikt)
- Ingen forekomst av `btnCiviMap` i kodebasen.
- Konsekvens: vi kan ikke bekrefte om det finnes dobbeltbinding uten at knapp-id/eventbinding er med i diffen.

### 3) `body.civi-mapmode` og eksisterende panel/footer
- Ingen forekomst av `civi-mapmode` i kodebasen.
- Konsekvens: den nye body-modusen er ikke del av nåværende branch, så layout-/panel-sikkerhet kan ikke valideres enda.

### 4) `localStorage`-lesing og bakoverkompatibilitet
- Eksisterende Civication-kode bruker gjennomgående defensive mønstre (`|| "{}"`, `|| "[]"` og i flere steder safe-parse-fallback), men varierer mellom moduler.
- `CivicationMap.js` leser `hg_capital_v1` med fallback (`JSON.parse(localStorage.getItem("hg_capital_v1") || "{}")`), som er robust mot manglende key, men ikke mot korrupt JSON-string.
- Konsekvens: ny systemkart-kode bør bruke eksisterende safe-parse-mønster konsekvent for alle nye keys.

### 5) Rebase mot `main` før merge
- Dette kan ikke vurderes sikkert uten sammenligning mot remote `main`/PR-base i git-historikken.
- Anbefaling: kjør `git fetch origin` og verifiser merge-base + konfliktstatus før merge.

### 6) Overlay-lag: flytte/forenkle/integrere
- Siden `CivicationSystemMap.js` ikke er tilgjengelig i branchen, kan ikke konkret overlay-arkitektur vurderes i detalj.
- Retning for første trygge systemlag: hold overlay isolert (egen container/namespace), unngå globale sideeffekter og unngå endringer i eksisterende `js/map.js` og place-data.

## Trygg minimumsanbefaling for «første systemlag»
For å treffe målet (soner, hjem, aktiv rolle, åpne hendelser, kapital og place_access-kategorier) uten redesign:
1. Legg systemkart i en ny, namespacet modul med eksplisitt init/destroy.
2. Bruk guard mot dobbelt init (f.eks. data-flag på root-element).
3. Les kun eksisterende state keys via safe-parse, med harde defaults.
4. Hold styling under scoped klasse (ikke global body-modus før panel-regresjon er testet).
5. Reuse `data/Civication/place_access_map.json` read-only.

## Status
- Review-resultat: **BLOCKED av manglende PR-innhold i branchen** (særlig `CivicationSystemMap.js`, `btnCiviMap`, `civi-mapmode`).
