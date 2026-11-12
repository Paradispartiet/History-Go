# Renholder søl Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. Native execution and one final fresh review.

**Goal:** Skill sikring, rengjøring, kontroll, mottak og utstyrstiltak i sølforløpet.
**Architecture:** Tre reviderte scener og fem låste oppfølginger i samme tråd; eksisterende motor og historikk.
**Tech Stack:** JSON, Node/assert, Playwright, Markdown, GitHub Actions.
**Spec:** docs/superpowers/specs/2026-11-12-renholder-soel-design.md

## Global Constraints
- Behold alle gamle ID-er, C17-objekter, felles motor og endings.
- Avtalt vernerunde er ikke deltakelse; svar eller plan er ikke utført tiltak.
- Ingen oppdiktet nestenulykke eller generell kjemikalie-/friksjonsgaranti.

## Review Focus
- Gamle flagg må ikke bevise ny utførelse.
- Uferdig gulv må ikke åpnes av mottaksbekreftelse eller invitasjon.
- Skilt og tralle er separate tiltak.
- Begge dag-2-grener må bevare alle faktiske statusflagg.
- C17 og arbeidsfordeling fra #7272 skal være uendret.

## Task 1: Spillbart sølforløp
**Files:** renholder/scenes.json; tests/civication-lifestory-renholder-soel.test.js; profil og synopsis; scoped browser script/workflow.
**Interfaces:** Content.buildContent, State.createInitialState, Runner.selectNextScene/applyChoice/startNextDay/getSymposium.
- [x] Skriv test for framtidig vernerunde uten utført-flagg og observer RED.
- [x] Implementer fem låste oppfølginger; kjør begge kanoniske renholdertester og relevante Life Story-regresjoner.
- [ ] Oppdater profil/synopsis og browser med faktiske sølvalg, reload og Symposium.
- [ ] Gjennomgå full diff og fersk review; kjør CI på eksakt head, kontroller bilder, merge og main-integritet når grønn.

## Evidens og gjennomgang

RED observert for framtidig vernerunde ført som deltakelse; GREEN etter revisjonen. Begge kanoniske renholdertester, day3, endings, dayphase-guard, day-sync og CI-routing bestod lokalt. Nettleser kjører i Actions fordi lokal Chromium-start ble blokkert av socket-begrensning. Fersk uavhengig gjennomgang fant ett P2-avvik: forespurt trallestopp ble ført som utført. Egen RED-regresjon gjenskapte feilen; rettet ved å skille stoppforespørsel fra bekreftet ute-av-bruk-status. Begge kanoniske tester er grønne etter rettingen. C17 og tidligere romfordeling er kontrollert uendret som objekter.
