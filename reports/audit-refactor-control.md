# Audit refactor control check

## Bakgrunn

PR #406 samlet delt place-ref-logikk i `tools/lib/placeRefAuditUtils.mjs` og oppdaterte både `tools/audit-place-data.mjs` og `tools/audit-people-invalid-place-refs.mjs` til å bruke helperen.

PR-en ble merget før tallendringer i regenererte rapporter var fullt forklart. Denne kontrollen legger derfor inn et eksplisitt, read-only sjekkverktøy som sammenligner den nye helperen mot de gamle inline-primitivene på dagens repository-data.

## Kontrollverktøy

Ny fil:

- `tools/check-audit-refactor-equivalence.mjs`

Scriptet endrer ingen data og skriver ingen rapporter. Det sjekker:

1. at place-filer fra `data/places/manifest.json` gir samme antall rows med gammel og ny `toArray`
2. at aktiv place-id-sett er identisk med gammel og ny manifestlesing
3. at people-manifestet løses til samme filer
4. at people-ref-ekstraksjon gir samme ref-sett som gammel people-auditlogikk
5. at generiske refs eventuelt bare skiller seg på path-format, for eksempel `places` vs `places[0]`

## Viktig avklaring

Tallendringer i rapporter etter #406/#407 må ikke tolkes alene som bevis på runtime-feil. Audit-script er utviklingsverktøy, ikke app-runtime.

De viktigste trygge indikatorene er:

- ingen appkode ble endret i #406
- ingen `data/places/*` eller `data/people/*` ble endret i #406
- delt helper brukes nå av begge audit-script
- path-format for array-ref ble mer presist (`places[0]`, `places[1]`)

## Kommando

Kjør:

```bash
node tools/check-audit-refactor-equivalence.mjs
```

Forventet resultat er at scriptet ikke rapporterer blocking failures. Eventuelle path-formatforskjeller i generiske refs skal forklares som formatforbedring, ikke datatelling-endring.
