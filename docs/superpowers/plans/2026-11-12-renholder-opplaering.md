# Renholder opplæring Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. Native execution, one final fresh reviewer.

**Goal:** Skill belastningsavklaring, utført arbeid, demonstrasjon, egen øvelse og tilbakemelding.
**Architecture:** To reviderte scener og seks låste oppfølginger i samme JSON/Runner; ingen nye motorgrensesnitt.
**Tech Stack:** JSON, Node/assert, Playwright, Markdown, GitHub Actions.
**Spec:** docs/superpowers/specs/2026-11-12-renholder-opplaering-design.md

## Global Constraints
- Behold alle scene-/valg-ID-er, C17, søl, romfordeling, motor og endings.
- Ingen garanti om medisinsk bedring eller ferdig sone etter pause/spørsmål.
- Renholdsvogn er ikke kaffetralle; ny øvingsoppgave er ikke dag-1-romstatus.

## Review Focus
- Gamle læringsflagg må ikke bli nye bevis.
- Plan må ikke fullføre transport; mottak må ikke utføre arbeidet.
- Demonstrasjon må ikke være egen øvelse; øvelse må ikke være vurdering.
- Avbrutt eller utsatt opplæring må forbli åpen etter lagring/dagskifte.
- Nye valg må ikke endre andre tråders arbeidsbevis.

## Task 1: Konkrete valg og læringsbevis
**Files:** renholder/scenes.json; tests/civication-lifestory-renholder.test.js; eksisterende browser/workflow; profil/synopsis.
**Interfaces:** Content.buildContent, State.createInitialState, Runner.selectNextScene/applyChoice/startNextDay/getSymposium.
- [x] Skriv RED for `spor_ole` uten automatisk `laerte_teknikk`.
- [x] Legg til konkret plan, transport og mottak; demonstrasjon, øvelse og tilbakemelding. Verifiser alle start-/ventevalg.
- [x] Synk profil/synopsis med 44 scener og kildeavgrensning; utvid nettleser med ni læringsruter.
- [x] Kjør eksisterende renholder/søl/day3/endings/Skills, routing og registerkontroller; gjennomgå hele diffen og én fersk review.
- [ ] Verifiser CI og bilder på eksakt head; merge autorisert grønn head og kontroller main-integritet.

## Evidens og gjennomgang

RED observert: `spor_ole` satte `laerte_teknikk`. GREEN etter revisjon; 162 reelle kombinasjoner følger alle startvalg, plan/arbeid/mottak og demonstrasjon/øvelse/tilbakemelding gjennom lagring, Symposium og sju dager. Kompatibilitetsfixture kontrollerer at eldre læringsflagg ikke oppretter nye øvingsbevis eller historikk. Søltesten, day3, endings, dayphase-guard, day-sync, Skills evidence/UI og CI-routing bestod. Karriere- og readinessregistre består uten regenerering fordi eksisterende testfil er utvidet. Uavhengig sluttgjennomgang fant ingen actionable findings. Alle 36 øvrige sceneobjekter er kontrollert uendret. Nettleser og full CI må fortsatt verifiseres på eksakt head.

Beslutning: nettleserjobben deles i tre matrix-jobber, med de eksisterende sju romrutene, sju sølrutene og ni nye læringsruter. Det gir separat bevis per tema og holder hver kjøring innen eksisterende tidsgrense. Ingen motor- eller produktflyt endres.
