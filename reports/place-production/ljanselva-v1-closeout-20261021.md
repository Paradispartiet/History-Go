# Ljanselva – History Go v1-sluttkontroll (21.10.2026)

## Leveranse
- Identitet: hele Ljanselvvassdraget fra Lutvann/Nøklevann–Skraperud til Fiskevollbukta. Koordinater og sju eksisterende ankre beholdt.
- Fortelling: sagbruk, Ljabrua, Liadalens Krudtværk, eksplosjonen 1884, jernbanen og den kulverterte nedre delen.
- Kilder: v4.2 stedspakke med 27 kildepåstander og full setningsdekning.
- Fagverk: kuratert artikkel, tre linser, fire spørsmål, seks begreper og to observerbare spor.
- Quiz: 21 spørsmål i tre sett med fasit, kilder og Knowledge-ID-er; QuizCard med ti av de samme spørsmålene.
- Medier: to autentiske Kjetil Ree-foto (CC BY-SA 3.0) som lokale 600×800/1400×900 WebP, med kreditering og hash.
- Språk: norsk original og oppdaterte en/es/pt-oversettelser med korrekt kildehash.

## Faktisk app-aksept
GitHub Actions: https://github.com/Paradispartiet/History-Go/actions/runs/39640866096

Den permanente testen tests/ljanselva-v1-real-browser.mjs åpnet reell History Go index.html på 390 og 1440 px. Begge bestod: riktig sted, historisk oversatt tekst, lokalt frontbilde, synlig og lesbar QuizCard etter snuanimasjon, korrekt rehydrering, quizrute og kuratert Fagverk (tre linser og fire spørsmål). Ingen JavaScript-feil.

scripts/verify-ljanselva-fullquiz-browser.mjs spilte gjennom 21 spørsmål på mobil og desktop med 3/3 gjennomførte sett, én stedsopplåsing, tre læringshendelser og uten å registrere fysisk besøk.

Artefakt: ljanselva-v1-actual-app-qa i ovennevnte Actions-kjøring, med skjermbilder og maskinlesbare resultater. Begge lokale fotografier er akseptert innen v1. Dette er ikke V3/vFerdig-godkjenning.

## Mergeport
Bekreft grønn GitHub CI på seneste PR-head etter synkronisering av bildestatus, places_index.json og place-open/ljanselva.json; ingen bypass. Merk Ready, squash-merge main, kontroller merge-commit. Ingen parallell gren.

## Sporbar godkjenningsrekke

- Funksjonell mobil- og desktopaksept og fullquiz: kjøring `39640866096` (bestått).
- Bilde- og runtime-synkronisering: GitHub Actions `39641694719` (bestått), med ny kanonisk bildeaksept, regenerert stedsindeks og place-open.
- Alle 17 relevante PR-arbeidsflytene bestod på `4289ae532c5ec41ddad807805e79da35533413cf`. Disse må kjøres på nytt på siste endringscommit; eldre resultater regnes ikke som ny godkjenning.
- Endelig v1-merge forutsetter at **nyeste** testsett også er grønt.
