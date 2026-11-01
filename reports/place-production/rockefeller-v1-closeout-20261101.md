# Rockefeller Music Hall — formell v1-sluttkontroll (1. november 2026)

**Sted-ID:** `rockefeller` · **Kategori:** musikk · **Foreslått produksjonsnivå:** v1 (ikke vFerdig).

## Ferdig redaksjonelt innhold

- Historie: 22/22 dokumenterte påstander i `data/places/production/rockefeller.json`, korrekt identitet i gamle Torggata bad, åpning 14. mars 1986, egen inngang i Mariboes gate 5B. Storyen «Torggata bad ble konsertscene» beholder den opprinnelige tekniske Story-ID-en for fremdrift.
- Fagverk: stedseiet `history_go_place_fagverk_v2`, nivå `standard`, status `curated`. Tre selvstendige avsnitt, tre faglige linser, observerbare spor, kilder og aktive kapitler i musikkfaget. Registrert i `data/fagverk/fagverk_registry.json` og materialisert i Place-open.
- Quiz: fem sett, 30 eksisterende spørsmål med bevart spørsmåls-ID og fasit; QuizCard 10 spørsmål. `knowledge` er faktabasert og kildekoblet. Kapasitetene er korrigert etter arrangørens opplysninger til 1300 (Rockefeller) og 500 (John Dee).
- Bilder: tre egne, eksisterende lisensierte WebP-utsnitt fra Birgit Fostervolds fotografi, publisert under CC BY-SA 4.0. Hero, stående PlaceCard og lite kort beholdes uten nye bilder.
- People: eksisterende Mari Boine, Joachim Nielsen og Morten Harket beholdes uten dubletter eller udokumenterte nye personer.

## Faktisk brukerflate-QA

[PR #6887](https://github.com/Paradispartiet/History-Go/pull/6887) er merget etter [grønn browser-run 41352073765](https://github.com/Paradispartiet/History-Go/actions/runs/41352073765): Fagverk-side og samtlige 30 quizspørsmål gjennomspilt på mobil (390×844) og desktop (1440×1000). Quizprogresjon testes uten falsk registrering av fysisk besøk.

Denne slutt-PR-en [#6898](https://github.com/Paradispartiet/History-Go/pull/6898) supplerer med kontroll av PlaceCards hero- og stående bilde, synlig People-samling og faktisk QuizCard-flipping på de samme skjermstørrelsene. **Ingen merge eller formell v1-godkjenning dersom denne konkrete browser-QA-en feiler.**

[PR #6893](https://github.com/Paradispartiet/History-Go/pull/6893) reviderer de tre siste interne Knowledge-formuleringene og genererer nye claim-korrekte Knowledge-ID-er. Den må være merget eller innarbeidet før slutt-PR-en godkjennes.

## Avgrensning

- Status `v1` betyr publiserbart, faktisk kontrollert minimum etter `docs/PLACE_PRODUCTION_MINIMUM_V1.md` — ikke `vFerdig`, ikke V3 closeout.
- Det endres ingen Story-ID-er, quiz-ID-er, bilder, koordinater eller People-profiler ved statusføringen.
- En urelatert sentral typeguard har meldt utdatert `data/runtime/nature-all/flora-001.json`; dette er ikke en Rockefeller-blokkering og må ikke løses ved å overskrive Flora-data her.
