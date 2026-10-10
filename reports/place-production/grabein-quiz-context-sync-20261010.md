# Gråbein — synkronisering av generert quizkontekst (2026-10-10)

Oppgaven reparerer en **allerede eksisterende** feil på `main`. Den globle `Data checks / Category and quiz governance`-jobben fant at `data/quiz/production_context/historie/museumsleiligheten_grabein.json` ikke var deterministisk synkronisert med oppdaterte quizkilder etter tidligere Gråbein-merge (#6163).

- Generert fra canonical script `scripts/build-quiz-production-context.mjs` med `--category historie --target museumsleiligheten_grabein` og korrekt outputfil.
- Umiddelbar `--check` av nøyaktig samme generator bestod.
- Én-gangsworkflow `Grabein quiz context regeneration (one shot)` kjørte grønt: https://github.com/Paradispartiet/History-Go/actions/runs/38041621124.
- Den midlertidige workflowen er slettet i generatorens bot-commit.
- Ingen quizspørsmål, source claims, UI eller History Go-kjerne endret.

Dette er en uavhengig forutsetningsretting for global data-CI, ikke del av VG-husets innholdsproduksjon. Eksakt PR-head CI må fortsatt være grønn før merge.
