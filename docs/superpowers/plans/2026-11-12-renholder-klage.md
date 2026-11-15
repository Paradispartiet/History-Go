# Renholder klager Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. Native execution, one final fresh review.

**Goal:** Knytt klager og avslutninger til faktisk arbeid og fullstendige kriterier.
**Architecture:** Elleve authored oppfølginger/morgenoppgave i eksisterende tråd; valgfri per-ending all-kriterieport med uendret standardatferd i andre roller.
**Tech Stack:** JSON, Node/assert, Playwright, Markdown, GitHub Actions.
**Spec:** docs/superpowers/specs/2026-11-12-renholder-klage-design.md

## Global Constraints
- Behold alle gamle scene-/valg-/ending-ID-er, C17, romfordeling, søl og opplæring.
- Ingen utført rom 204 før faktisk dag-3-morgenvalg; ingen falsk 07:10 eller forrige uke.
- Eldre flagg er ikke nye rombevis; ingen omskriving av gammelt arkiv.
- Ny ending-port er valgfri, strengt boolsk og skal ikke påvirke andre roller.

## Review Focus
- Delvis eller delt arbeid må ikke bli spillerens fullførte rom.
- Forespørsel, sendt liste og bekreftet mottak er ulike steg.
- Sindre-svar og lukt må ikke fullføre restarbeid.
- Streng ending må avvises ved ett manglende kriterium; nøytral fallback må være sann uten signaler.
- Hele siste dag og eldre lagringer må forbli spillbare.

## Task 1: Romstatus, klage og avslutning
**Files:** renholder scenes/role; lifestoryEndings.js og ending-validator i lifestoryContent.js; eksisterende kanoniske renholder/endings-tester; browser/workflow; profil/synopsis.
**Interfaces:** Content.buildContent, Runner.selectNextScene/applyChoice/startNextDay/getSymposium; Endings.scoreEnding/resolveEnding/isFinalDay.
- [ ] Skriv RED for opt-in-ending med manglende kriterium og for oppdiktet rom-204-historie.
- [ ] Implementer valgfri gate og nøytral renholderfallback; kalibrer uendrede rolle-ID-er og test hver kriteriegruppe.
- [ ] Implementer elleve scener, rombevis og mottak; test faktiske ruter, alle venteutfall, legacy og Symposium.
- [ ] Synk profil/synopsis med 55 scener; utvid nettleser med dag-3-klager og sluttvisning.
- [ ] Kjør relevante tester og registre; én fersk review av hele endringen; full CI/bilder før merge og main-integritet etterpå.
