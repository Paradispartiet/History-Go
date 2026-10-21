# History Go – Oslo-bolk 04: quiz og QuizCard, teknisk v1-grunnlag

**Dato:** 22. oktober 2026  
**Kanonisk forløp:** ferdig Fagverk-bolk #6553 (merget til main), deretter dette avgrensede kvalitetsarbeidet.  
**Status:** v1_candidate – ingen samlet v1- eller vFerdig-godkjenning.

## Oppdaget eksisterende quizdekning

Alle 17 steder har registrert fullquiz og ett 10-spørsmåls QuizCard i aktiv kategori-manifest:

| Steder | Antall | Fullquiz per sted | Total fullquiz | QuizCard totalt |
| --- | ---: | ---: | ---: | ---: |
| De ti næringslivsstedene i bolk 04 | 10 | 30 (5 × 6) | 300 | 100 |
| Sagene skole og Stortorget | 2 | 28 (4 × 7) | 56 | 20 |
| Norges Bank, Bankplassen 4 | 1 | 21 (3 × 7) | 21 | 10 |
| Gamle trikkestallen og Gamle rådhus | 2 | 28 (4 × 7) | 56 | 20 |
| Grev Wedels plass og Sofienbergparken | 2 | 35 (5 × 7) | 70 | 20 |
| **Totalt** | **17** | | **503** | **170** |

Ingen nye QuizCards eller quizpakker ble opprettet i dette arbeidet. Gjenbruk eksisterende kanoniske filer, manifestkoblinger og Knowledge-ID-er. De ti næringslivsquizene representeres med fem sett-rader per sted i manifestet, alle med samme fil. Dette er **ikke fem ulike quizfiler** og skal ikke feilklassifiseres som dubletter.

## Varig teknisk kontroll

`tests/oslo-batch04-v1-quiz-parity.test.mjs` kontrollerer at:

1. Hvert av de 17 stedene har ett entydig aktivt quizfilvalg i manifestet, minst tre sett og minst 21 spørsmål.
2. Alle 503 spørsmål har entydig fasit, unike ID-er/tekster innen quiz, kildepekere og kobling til kanoniske Knowledge-ID-er.
3. Alle 170 QuizCard-spørsmål peker til eksisterende fullquizspørsmål med identisk spørsmålstekst, alternativer, svar, svarindeks og Knowledge-ID. Kortenes `sourceQuizFile` og offentlig kilde-URL kontrolleres.
4. Nye spørsmål som eksponerer intern implementasjons-/spillterminologi, gir regresjonsfeil. Ett gjenstående eldre kvalitetsavvik holdes eksplisitt synlig til det er omskrevet.

Egen permanent CI-port: `.github/workflows/oslo-batch04-quiz-parity.yml`. Resultatet regnes ikke som godkjent før jobbene faktisk er kjørt grønt på den siste PR-commiten.

## Fire kartlagte avvik – tre rettet, ett gjenstår

En utvidet gjennomgang av alle 503 spørsmål fant fire tilfeller av eksplisitt intern spill-/implementasjonsterminologi. Spørsmål 22 om skulpturene er rettet på `main` gjennom #6559. Spørsmål 1 ved Akers mekaniske Verksted og spørsmål 7 ved Grev Wedels plass er i tillegg omskrevet til stedsbasert historie med regenerert Knowledge og uendrede Knowledge-ID-er. Guard-testen har dermed **ett** eksakt eldre baseline-unntak igjen (`grev_wedels_plass_quiz_34`). Nye tilsvarende spørsmål skal feile CI.

- **Rettet – Akers mekaniske Verksted, `oslo_mek_quiz_1`:** spør nå «Hvilket skipsverft preget området som senere ble Aker Brygge?». Kunnskapsforklaringen og tematitlene er stedsspesifikke; intern targetterminologi er fjernet fra emnet og tilknyttede begreper.
- **Rettet – Grev Wedels plass, `grev_wedels_plass_quiz_7`:** spør nå «Hvilket byrom betegner navnet Grev Wedels plass?». Den godkjente kildebriefen og quizens `claim_basis` beskriver parkrommet ved Gamle Logen og Militærhospitalet uten intern datamodellterminologi.
- **Rettet i denne PR-en – `grev_wedels_plass_quiz_22`:** det gamle spørsmålet om «Objects i PlaceCard» er erstattet av et faktisk spørsmål om «Kvinnetorso», «Hanne på stranden» og fontenen. Distraktorene er forbedret, fasiten og den faktiske kildeforankrede Knowledge-teksten beholdt. Historisk støtte: https://oslobyleksikon.no/side/Grev_Wedels_plass.
- **Grev Wedels plass, `grev_wedels_plass_quiz_34`**: «Hvorfor holdes Brands-feltet uten oppdiktet innhold?» Dette er en intern redaksjonell instruks, og må erstattes med et faktisk spørsmål, kilde- og fasitbelagt fra eksisterende Grev Wedels plass-kilder.

Spørsmål 7, 22 og 34 i Grev Wedels plass, samt spørsmål 1 ved Akers mekaniske Verksted, er **ikke blant de nåværende QuizCard-spørsmålene**. Kortenes 170 kildekoblede spørsmål er dermed uendret. Quizens kunnskapstekster og Grev Wedels plass sin kildebrief er samordnet med de kanoniske Knowledge-enhetene. Spørsmål 34 må fremdeles revideres før redaksjonell v1-godkjenning.

En egen redaksjonell gjennomlesing gjenstår fortsatt for de øvrige spørsmålene – en terminologidetektor erstatter ikke faktakontroll eller vurdering av pedagogiske distraktorer.

## Ikke dekket av den statiske porten

- Virkelig Chromium-rendering av PlaceCard, kortvending, utvidet kort, Fagverk, bilde og gjennomspilling av fullquiz på 390 og 1440 px.
- Redaksjonell kontroll av alle 503 spørsmåls kvalitet, distraktorer, spørsmålsspenn og historisk presisjon. Teknisk korrekt fasit er ikke i seg selv bevis for godt spørsmål.
- Endelig fotografisk utsnitt, lisens-/krediteringsvisning, og eventuell fysisk visuell QA.
- Vurdering av hver enkelt teksts fortellerkvalitet, datoavhengige påstander og epokeplassering.

**Riktig neste leveranse:** erstatte `grev_wedels_plass_quiz_34` med et kildebelagt historisk spørsmål, og etablere faktisk 390/1440 px browser-aksept for den samlede 17-stedersbolken. Full redaksjonell gjennomgang og fotokontroll gjenstår. Ikke oppgrader `v1_candidate` før alle portene er tilfredsstilt.
