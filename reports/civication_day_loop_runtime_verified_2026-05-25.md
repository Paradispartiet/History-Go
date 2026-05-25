# Civication QA-status: verifisert dagfase-/inbox-runtime (2026-05-25)

## 1. Kort status
Civication-grunnloopen er nå browser-verifisert etter fixene i #630, #631 og #632: fra inbox-avklaring, via korrekt dashboard/day phase-gating, til fullført dag (`day_end`).

## 2. Hva som nå er verifisert
Følgende er konkret verifisert i manuell browser-test:

- Civication starter
- Inbox genererer meldinger
- Meldinger kan avklares
- State/consequence lagres
- Inbox teller åpne riktig
- Dashboard teller åpne riktig
- Day phase teller åpne riktig
- Queued runtime-rows blokkerer ikke
- Resolved inbox-rows blokkerer ikke
- Fase kan gå `morning → lunch → afternoon → evening → day_end`
- “Dagen er fullført”-kort vises ved dagslutt

## 3. Bugs som ble funnet og fikset
Kort oppsummert etter siste PR-runde:

- Før #630 telte dashboard resolved inbox-items som åpne.
- Før #632 telte day phase queued runtime rows som åpne.
- Før #632 telte day phase delivered rows som åpne selv når inbox-wrapper var resolved.
- #631 erstattet den bredere #626-retningen med et smalere og mer målrettet presentasjonskort for dagslutt.

## 4. Viktig arkitekturforståelse
Følgende finnes allerede i Civication og skal **ikke** bygges dobbelt:

- Civication runtime
- CivicationState
- Inbox engine
- Jobbmail/personlig splitt
- Answer-flow
- Life-mail runtime
- Career/activePosition
- Wallet/PC
- Capital consequences
- Runtime debug
- Dashboard
- Day phase inspect/advance
- Day complete-kort

## 5. Nåværende designavklaring
Åpne private/life-mails kan eksistere uten at day phase nødvendigvis blokkerer, dersom de ikke inngår i daily runtime-gating. Dette må behandles som et bevisst designvalg før eventuell senere endring.

## 6. Neste anbefalte verifisering
Neste naturlige QA-steg er ikke ny gameplay-funksjonalitet, men verifisering av ny dag etter `day_end`:

- hvordan ny dag starter etter `day_end`
- om day index går fra 1 til 2
- om nye daily runtime-items genereres riktig
- om gamle resolved inbox-items ikke påvirker ny dag
- om dashboard/inbox/day phase fortsatt er synkronisert på dag 2

## 7. Console-kommandoer brukt
Viktigste manuelle kommandoer brukt i browser-konsoll:

- `window.CivicationDayProgression.inspect()`
- `window.CivicationDayProgression.advancePhaseIfReady()`
- diagnose for pending/inboxOpen/dashboard/dayPhase
- runtime-row/inbox-status-sammenligning

## Browser-funn dokumentert i denne rapporten

### Dashboard etter #630
Verifisert runtime/dashboard-tilstand:

- `pending: null`
- `unresolvedCount: 0`
- `pendingCount: 0`
- `totalInbox: 6`
- UI: `Inbox 0 åpne meldinger`
- UI: `Neste fokus Ingen åpne hendelser`

### Day phase før og etter #632
Før fix:

- `openItemsInPhase: 6`
- `canAdvance: false`
- `reason: "open_items_in_phase"`

Diagnose viste årsaken:

- 2 rows med `row=delivered`, men `inbox=resolved`, `resolved=true`
- 4 rows med `row=queued`, `inbox=-`

Etter #632:

- `openItemsInPhase: 0`
- `canAdvance: true`
- `reason: "ready_to_advance"`

### Inbox/dashboard/day phase synkronisering
Etter avklart pending mail:

- `pending: null`
- `inboxOpen: 0`
- dashboard: `Inbox 0 åpne meldinger`
- day phase kunne gå videre

### Verifisert faseflyt
Manuelt bekreftet flyt:

- `morning → lunch`
- `lunch → afternoon`
- `afternoon → evening`
- `evening → day_end`

### Dagslutt verifisert
På `day_end` viste `CivicationDayProgression.inspect()`:

- `phase: "day_end"`
- `nextPhase: null`
- `openItemsInPhase: 0`
- `reason: "at_last_phase"`

Day phase-panelet viste korrekt:

- `Dagen er fullført`
- `Alle åpne handlinger for denne dagen er avklart`
- `Dag 1`
- `Fase Dagslutt`
- `Åpne handlinger 0`
- `Neste fase Ingen`
