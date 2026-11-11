# Ekspeditør: avgrenset fullmakt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox syntax for tracking.

**Goal:** Skill mellom disknøkkel, personlig returfullmakt og samarbeid i eksisterende dag-2-scene.

**Architecture:** Eksisterende authored JSON og Life Story Runner beholdes. Nye flagg beskriver bekreftede handlinger, ikke nye systemrettigheter utenfor scenen. Eksisterende browserforløp forlenges uten nye parallelle historier.

**Tech Stack:** JSON, Node/assert, Playwright, Markdown.

**Spec:** `docs/superpowers/specs/2026-11-11-ekspeditor-avgrenset-fullmakt-design.md`.

## Global Constraints

- Behold scene-ID, de tre valg-ID-ene, tråd og avslutningskriterier.
- 500 kroner er lokal fiksjon; ikke lovregel eller generell reklamasjonsgrense.
- Fysisk disknøkkel innebærer ikke butikklåsing eller bemanning.
- Samarbeid gir ikke automatisk fullmakt til noen av deltakerne.
- Opplæringsbevis og tidligere kontroller må bevares.

## Review Focus

- Aksept må registrere faktisk personlig fullmakt og nøkkelutlevering, uten låseansvar.
- Utsettelse må beholde tidligere rettigheter og ikke gi trekk for opplæringsbehov.
- Delt dokumentkontroll må ikke gi selvstendig fullmakt til vikaren.
- Historiske flagg/ID-er og dag-3-forløp må være kompatible.
- Browserresultatet må oppgi dagskiftets faktiske testmetode.

## Task 1: Avklar og kontroller fullmaktssamtalen

**Files:** `data/Civication/lifestory/roles/ekspeditor/scenes.json`, `docs/civication-symposium/ekspeditor.md`, `tests/civication-lifestory-ekspeditor.test.js`, `scripts/verify-civication-ekspeditor-lifestory-browser.cjs`.

**Interfaces:** Consumes canonical `State.createInitialState(content)`, `Runner.selectNextScene/applyChoice/startNextDay/getSymposium`. Produces recorded choice flags and archive entries in the same role/thread.

- [ ] Skriv Runner-regresjon for de tre faktiske fullmaktsvalgene; kjør og observer forventet feil.
- [ ] Revider bare den eksisterende scenen; bevar øvrige sceneobjekter og alle ID-er.
- [ ] Kjør kanonisk Life Story, kontinuitet og Skills-evidens; forvent grønt.
- [ ] Forleng de tre eksisterende dag-2-browserforløpene med fullmaktsvalg og reload-kontroll, og rapporter testmetode for dagskiftet.
- [ ] Oppdater rolleprofilens fullmaktsbeskrivelse og dokumenterte status uten å ferdigattestere hele rollen.
- [ ] Publiser én PR fra isolert arbeidsgren; kontroller full Civication-suite, browserbilder og uavhengig review på siste head.
- [ ] Merge grønn head og kontroller main-integritet.
