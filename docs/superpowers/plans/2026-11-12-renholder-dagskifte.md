# Renholder dagskifte Implementation Plan

> For agentic workers: use executing-plans; inline execution and one fresh final review.

**Goal:** Kontroller renholderens virkelige UI-dagskifte og før etterprøvbar reststatus.
**Architecture:** Gjenbruk eksisterende `nextDayViaUi`; streng modus i etablert renholderkontroll, ingen nye parallelle runtime-systemer.
**Tech Stack:** Playwright, CommonJS/kompilert TypeScript, GitHub Actions, Markdown.
**Spec:** docs/superpowers/specs/2026-11-12-renholder-dagskifte-design.md

## Global Constraints
- Ingen Runner-reserve, direkte kalender-/tilstandsskriving eller syntetiske klikk i streng dagskiftemodus.
- Eksisterende arbeids-/klagebevis og 26 kontrollruter beholdes.
- Fysisk Safari og faktisk ansettelsesforløp godkjennes ikke ved rolleparameter eller skjermemulering.

## Review Focus
- Åpne brev må besvares i innboksen; ingen overlegg kan tvinges bort ved force-click.
- Nøyaktig ett kalenderdøgn og samme Life Story-dag etter hver overgang.
- Arkiv og rombevis må bevares etter reload og gjennom sju dager.
- Utestående fysisk kontroll må være synlig i fellesregisteret.

### Task 1: Streng UI-kontroll og samlet status
**Files:** scripts/verify-civication-renholder-lifestory-browser.cjs; .github/workflows/civication-renholder-lifestory-browser.yml; docs/CIVICATION_SYMPOSIUM_PROFILE_COVERAGE.md; docs/civication-symposium/renholder.md; docs/civication-synopsis/renholder.md.
**Interfaces:** nextDayViaUi(page,scenarioId,day), CivicationCalendar.getClock(), CivicationLifestoryState.load().
- [ ] Legg til tre strenge dagskifteruter og nødvendige kalender-/arkivasserts; kjør dem på faktisk UI i CI.
- [ ] Ved feil: behold feilbevis og finn årsak før eventuell avgrenset runtime-retting.
- [ ] Synk profil, synopsis og register med eksakt resultat og åpen fysisk sjekkliste.
- [ ] Kjør dokumentasjons- og renholderregresjon, fersk review, relevant CI, merge og main-integritet.
