# Renholder tidsvindu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Native execution, one final fresh reviewer.

**Goal:** Gjør romfordeling, utført arbeid og mottak etterprøvbart i renholderens eksisterende tidsvinduoppgave.
**Architecture:** Authored JSON i samme rolle/tråd og eksisterende Runner/Symposium. Fem låste oppfølginger, ingen ny motor.
**Tech Stack:** JSON, Node/assert, Playwright, GitHub Actions, Markdown.
**Spec:** `docs/superpowers/specs/2026-11-12-renholder-tidsvindu-design.md`.

## Global Constraints

- Behold eksisterende scene-/valg-ID-er og alle C17-sceneobjekter.
- Ingen automatisk fullføring etter et ja, en plan eller en sendt melding.
- Ingen automatisk pauseofring eller straff for forsvarlig kapasitetsavklaring.
- Utført arbeid per aktør og dag1 må skilles fra utsatt og framtidig arbeid.
- Gamle flagg er ikke nye arbeidsbevis; eksisterende uklare sluttoppsummeringer godkjennes ikke her.

## Review Focus

- Alle fire startvalg skal kreve bekreftet plan før utførelse.
- Amina må bekrefte fordeling og eget resultat før hennes korridor føres som gjort.
- Manglende utførelse eller mottak må overleve dagskifte og dag2-oppfølging.
- Nye dag1-romflagg må ikke fullføre senere C17-rom.
- Nettleser og sluttrapport må være ærlige om dev-rolle og dagskiftegrense.

## Task 1: Fra forespørsel til faktisk romstatus

**Files:** Existing renholder scenes JSON, `tests/civication-lifestory-renholder.test.js`, profile and synopsis. Create `scripts/verify-civication-renholder-lifestory-browser.cjs` and scoped workflow, plus spec/plan.
**Interfaces:** State.createInitialState, Runner.selectNextScene/applyChoice/startNextDay/getSymposium; authored flags and archive. No app API changes.

- [x] Skriv reelle regresjoner og observer RED for automatisk tok_ekstra_rom/delte_sonen ved telefonsvar.
- [x] Revider tre eksisterende scener og legg til fem låste oppfølginger. Bevar øvrig innhold og ID-er.
- [x] Kjør kanonisk renholder, endings/day3, Skills, relevante renholdertester og karriere/readiness-auditer; alle skal være grønne.
- [ ] Kjør sju faktiske UI-ruter via scoped workflow; kontroller lagring, romstatus og Symposium på mobil/iPad.
- [ ] Oppdater profil/synopsis og dokumentert scenetall; én fersk gjennomgang av hele endringen.
- [ ] Verifiser full CI og bilder på eksakt head, merge autorisert grønn head og kontroller main-integritet.
