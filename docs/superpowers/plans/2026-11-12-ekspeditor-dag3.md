# Ekspeditør dag 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Native execution, one final fresh reviewer.

**Goal:** Gjør dag 3 og rolleavslutningene samsvarende med konkret arbeid, fullmakter og faktisk historikk.
**Architecture:** Eksisterende authored JSON, Runner, Endings og Symposium. Ingen felles motorendring; rolleavgrensede evidensflagg og oppfølgingsscener.
**Tech Stack:** JSON, Node/assert, Playwright, Markdown.
**Spec:** `docs/superpowers/specs/2026-11-12-ekspeditor-dag3-design.md`.

## Global Constraints

- Behold eksisterende rolle-, scene-, valg- og ending-ID-er; lokal prispremiss179/149/159 er fiktiv.
- Ingen falsk tidligere rabatt, generell prismatchfullmakt, opplæringsbevis eller forfremmelse.
- Meldt, overtatt og rettet avvik er forskjellige hendelser.
- Pauser/støtte skal ha navngitt ansvar og ikke gi automatisk statusstraff.
- Standardavslutningen skal være sann også uten dokumentert arbeid.

## Review Focus

- Returfullmakt på dag2 gir ikke prismatch på dag3.
- Kundens medlemsvilkår må faktisk undersøkes; en rabattforespørsel er ikke en handel.
- Oppfølging må være tilgjengelig også når tidligere kundetråd er eskalert.
- Faktisk spilleropplæring må ikke registreres etter Amirs arbeid eller bare en avtale.
- Delvis ending-treff og eldre flagg må ikke gi ukontrollerte påstander.

## Task 1: Samlet dag-3-forløp og evidens

**Files:** Modify `data/Civication/lifestory/roles/ekspeditor/scenes.json`, `role.json`, `tests/civication-lifestory-ekspeditor-continuity.test.js`, `scripts/verify-civication-ekspeditor-lifestory-browser.cjs`, existing profile and synopsis. Keep normal jobmail and shared engines unchanged.
**Interfaces:** `State.createInitialState(content)`, `Runner.selectNextScene/applyChoice/startNextDay/getSymposium`, `Endings.resolveEnding(state, content)` produce canonical flags/archive/actual ending.

- [x] Skriv og kjør reelle dag-3-regresjoner til forventet RED: prisvalg før kontroll, åpne avvik, støtte, ending uten bevis.
- [x] Konkretiser eksisterende scener og nødvendige låste oppfølginger. Gjør avslutninger bevisavgrensede med nøytral fallback.
- [x] Kjør continuity, canonical, Skills, endings og eksisterende rolleauditer til GREEN; undersøk hver feil.
- [x] Forleng tre eksisterende browserforløp til dag3, arbeidsrytmegren, ending og Symposium. Bevar faktisk klikkhistorie og testgrense.
- [x] Oppdater profil og synopsis med nye lokale premisser og gjennomgått/gjenstående status.
- [ ] Én fersk whole-branch review; rett viktige funn. Publiser PR, kontroller full CI, bilder og eksakt head.
- [ ] Merge autorisert grønn head og kontroller main-integritet.
