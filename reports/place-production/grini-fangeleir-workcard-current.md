# Grini fangeleir — gjeldende sluttkontroll, 1. november 2026

Kandidaten er komplett etter dokumentert kilde-/innholdsreview og faktisk mobil-/desktop-QA. Publisert status avventer merge og deploy-readback. Dette erstatter gamle arbeidscheckpoints i denne current-filen; historikken er bevart i Git og daterte rapporter.

Profil: **major / confirmed**. Fire reelle samlinger: People (2), Objects (2), Brands (1), historiske hendelser (1). Alle åtte relevante kunnskapsfaner, QuizCard og Fagverk er kontrollert. Før/etter har begrunnet N/A: Commons-bildene har ulike utsnitt; historielagets relevante portpar har uavklart gjenbrukslisens.

[GitHub Actions 41304682294](https://github.com/Paradispartiet/History-Go/actions/runs/41304682294) består alle fire Grini-jobber på `0bce0be00f9f559dd0b349537929c3032aae7798`. Begge bredder: 70/70 svar, 10/10 sett, 10 læringshendelser, én belønning, ingen quizgenerert fysisk besøksstatus og null JavaScript-feil. Samlinger, favoritt, språkinnsamling og syntetisk fjern-/museumsbesøk består. Faktisk visning avdekket og fikk rettet manglende kronologiår/tekst og svak News-kortstyling. Siste typeetiketter kontrolleres av permanente renderertester.

Seksdelt kvalitetsvurdering: korrekthet/evidens **5**, dekning **5**, fag/redaksjon **4**, teknikk **4**, sikkerhet **5**, vedlikehold/etterprøvbarhet **5** — **28/30, PASS**. Detaljert evidens og begrensninger: [sluttreview](grini-fangeleir-final-review-2026-11-01.json). Automatiske tester og navngitt KI-review er ikke en attestert uavhengig menneskelig fagredaktørsignatur.

Separate katalogfeil i Fagverk, People, Subkultur og quizkontekst er baseline-sammenlignet og oppgis eksplisitt i JSON-review. Eldre isolert onsite-fixture har uendret test/controller; eneste serverte CSS-endring gjelder scroll-margin, mens feilen er venting på en DOM-node. Faktisk Grini-app består. Ingen validator eller auditterskel er svekket. Offentlig besøksanker og 360m-radius beholdes; ingen oppgave krever adgang til aktivt fengsel.

Canonical kilde: `data/places/historie/akershus/grini_fangeleir.json`. Maskinlesbar current-status og READ-FIRST-hasher: [workcard](grini-fangeleir-workcard-current.json). PR: [#6858](https://github.com/Paradispartiet/History-Go/pull/6858).
