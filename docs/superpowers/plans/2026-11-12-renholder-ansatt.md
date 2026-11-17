# Renholder ansatt Implementation Plan

> Inline execution using executing-plans; one fresh final review.

**Goal:** Bevis opptjent renholderjobb, faktisk innboks og første ukeslønn.
**Architecture:** Egen testmodul med eksisterende UI-hjelper, startet fra etablert renholder-browserjobb.
**Tech Stack:** TypeScript, Playwright, JSON, GitHub Actions.
**Spec:** docs/superpowers/specs/2026-11-12-renholder-ansatt-design.md

## Global Constraints
- Ingen injisert fremdrift, jobb, tilbud, dato, saldo eller kunstig RNG.
- Tilbud og kalender behandles med vanlige UI-kontroller.
- Senere uker og fysisk Safari godkjennes ikke av denne testen.

## Review Focus
- Poeng alene må ikke ansette spilleren; tilbud må aksepteres.
- Kalender skal ikke hoppe eller betale uken før sju fullførte dager.
- Reell jobbmail må bli svart, ikke bare vises.
- Lønn skal være sporbar til faktiske dagsposter og ikke betales igjen ved reload.
- En legitim tilfeldig oppsigelse etter opptjent uke må ikke skjules eller gjøre lønnsbeviset falskt.

### Task 1: Organisk jobb- og lønnskontroll
**Files:** scripts/verify-civication-renholder-employed-browser.ts; eksisterende browser-CJS/workflow; tsconfig.scripts.build.json; renholderprofil/synopsis og fellesregister.
**Interfaces:** QuizEngine UI, CivicationJobs offers/active position, nextDayViaUi(page,id,day), canonical wallet snapshots.
- [ ] Skriv og kjør akseptansekontrollen mot nåværende produkt; ingen runtime-endring uten observert feil.
- [ ] Kontroller første lønnsoppgjør og reload-idempotens; behold diagnostikk ved feil.
- [ ] Synk reststatus med konkret bevis og åpne grenser.
- [ ] Fersk review, relevante tester/CI, merge og etterkontroll av main.
