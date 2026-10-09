# Quizdekning — 9. oktober 2026

Grunnlag: `main` ved `35d08069d867975b3c3eb3448b674a185d6c8659`; `data/places/manifest.json` og `data/quiz/manifest.json`. Stedfilene i dagens manifest er avstemt mot den forrige stedsspesifikke dekningsrapporten fra 8. oktober. De 13 nye stedfilene er lest, og deres kanoniske `id`, `name` og `category` er lagt til.

| Måling | Alle | Oslo | Utenfor Oslo |
| --- | ---: | ---: | ---: |
| Steder | 1 546 | 573 | 973 |
| Med quiz | 311 | 196 | 115 |
| Uten quiz | 1 235 | 377 | 858 |
| Quizdekning | 20,1 % | 34,2 % | 11,8 % |

Tre eldre steder endret status fra uten quiz til med quiz: `abelonegarden`, `arbeidermuseet` og `operahuset`. Alle 13 nye stedfiler i manifestet mangler eksplisitt quizkobling.

## Avgrensning og metode

- Den eksakte koblingen er `sted.id === data/quiz/manifest.json sets[].targetId`. En `Med quiz`-markering betyr minst én aktiv manifestoppføring for stedet; flere sett kan ligge i én fil.
- Kategoribanker uten en slik `targetId` regnes ikke som stedsspesifikk quizdekning.
- Én canonical Place-fil telles én gang. Dette er en koblingsaudit, ikke en kvalitetsvurdering av alle spørsmål og ikke en kontroll av at hver quiz er ferdig gjennomspilt.
- CSV-en `reports/quiz-place-coverage-2026-10-09.csv` gir alle 1 546 stedene, antall manifestoppføringer og aktive quizfilreferanser. Filer i dagens Place-manifest uten tilhørende aktiv manifestkobling regnes som udekket.
- Stedet `sagene_skole` er kontrollert mot aktivt manifest og er uten quizkobling. Det er utpekt som neste historiequizkandidat etter Arbeidermuseet. Et nytt spørsmålsett er **ikke** produsert eller registrert som del av denne dekningsoppdateringen.

## Reproduserbarhet

Les `data/places/manifest.json.files`, hent kanoniske Place-ID-er fra de refererte filene, grupper `data/quiz/manifest.json.sets` etter `targetId`, og tell treff. For eksisterende rapportstedsfiler er canonical ID/name/path bevart fra dekningsrapporten av 8. oktober; for nye filer er metadata lest fra gjeldende canonical Place-fil. Siden rapporten er et øyeblikksbilde, må tellingen kjøres om igjen når quizmanifest eller stedsmanifest endres.
