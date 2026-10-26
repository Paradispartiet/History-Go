# Nøklevann – avgrenset v1-sluttkontroll (21.10.2026)

## Resultat og avgrensning

**Status: v1-produksjonen er klar for merge etter grønn PR-CI på nyeste head.** Dette er minimumspakken (historisk fortelling, Fagverk, fullquiz, QuizCard, fotografier, reell visuell appkontroll), ikke generell V3/vFerdig-produksjon.

| Leveranse | Bekreftet |
| --- | --- |
| Historisk fortelling | 1856 Heftye/Sarabråten, 1897 kommunalt kjøp, 1899–1902 dam og rørnett, 1983 frigitt badevann |
| Place description v4.2 | 17 source claims, full setningsdekning og 10 dokumenterte quizkandidater, status ready_v4_2 |
| Fagverk | Kuratert natur-artikkel, fire undersøkelsesspørsmål, tre undersøkelseslinser, to observerbare spor |
| Fullquiz | 3×7 = 21 kildebelagte og distinkte spørsmål, alle med fasit, svarindeks, Knowledge-link og kildepåstand |
| QuizCard | Ett kort med 10 spørsmål, eksakt fasit og kobling til fullquiz |
| Bilder | To separate fotografier av Kjetil Ree under CC BY-SA 3.0; lokale WebP 600×800 og 1400×900, kilde, lisens og beskjæring dokumentert |
| Runtime | Fagverk-release, epokeindeks, stedsindeks, place-open og Knowledge materialisert og kontrollert |
| Oversettelser | Oppdatert faktabasert Nøklevann-tekst på engelsk, spansk og portugisisk; kildehash synkronisert |
| Virkelig app | Chromium-aksept ved 390 og 1440 px: korrekt sted, lokalt frontbilde, synlig snudd QuizCard **etter animasjonen**, rehydrering, quizrute, Fagverk |
| Fullquiz i app | Alle 21 spørsmål spilt til ferdig progresjon på både 390 og 1440 px |

## Verifiserbar testdokumentasjon

- GitHub Actions: https://github.com/Paradispartiet/History-Go/actions/runs/39620135728 – **bestått** one-off kjøring. Reell Playwright-nettleser åpnet `index.html`, ikke statisk HTML-fixture.
- Samme kjøring publiserte arkiv `noklevann-v1-browser-evidence` med mobil-/desktopskjermbilder og bevis på full quizgjennomspilling.
- Varige regresjonstester i repoet: `tests/noklevann-v1-real-browser.mjs` og `scripts/verify-noklevann-fullquiz-browser.mjs`.
- Bildeaksept og eksakt kildeattributtering: `reports/place-production/noklevann-v1-images-20261021.json`.
- Før-status og kildegrunnlag: `reports/place-production/noklevann-v1-read-first-20261021.md`. Den dokumenterer nullmåling, ikke sluttstatus.

## Redaksjonell og etisk kvalitetsgrense

Historien skiller Nøklevann fra de egne lokalitetene Sarabråten, Bremsrud, Kattisa og Rustadsaga. Innsjøen har skiftet rolle, men det hevdes ikke at nedlagte bosettinger skyldtes én enkelt hendelse. Bruken før og etter 1983 skilles tydelig; Nøklevann omtales ikke feilaktig som en gjeldende drikkevannskilde. Ingen oppdiktede personer, oppdiktede hendelser eller rettighetsforespørsler er brukt. Historiske detaljer bygger på Oslo byleksikon, Oslo kommune, og det tidligere kildearbeidet. Foto er krediterte originalfotografier, ikke illustrerte rekonstruksjoner.

## Mergeport og videre kø

PR #6520 må ha **faktisk kjørte og grønne** relevante GitHub check-runs på sin **siste commit**. Ingen `action_required`, `queued` eller `in_progress` kan tolkes som bestått. Når alle kontroller er grønne: merk Ready, merge til `main`, bekreft squash-commit. Først da videreføres produksjonen med Østensjøvannet og deretter Bogstadvannet i én ny bolk.
