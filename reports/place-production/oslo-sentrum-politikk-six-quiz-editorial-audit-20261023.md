# Oslo sentrum Politikk – flervalgsbank: redaksjonell delkontroll

**Dato:** 23. oktober 2026. **Status:** delkontroll, ikke godkjent fullquiz, QuizCard, Knowledge eller v1.  
**Omfang:** Bare seks Place-ID-er i PR #6579. Oslo-bolk 04 og andre PR-er skal ikke endres.

## Hva som faktisk er kontrollert

- Kandidatbank: `reports/place-production/oslo-sentrum-politikk-six-quiz-sourcebank-20261023.json`.
- **60 unike kandidat-ID-er fordelt på 6 steder × 10**, 3 ulike svaralternativer per kandidat, fasitsvar samsvarer med `options[answerIndex]`; samtlige har minst én kilde-URL.
- **Fasitposisjon før:** 50 første, 6 andre, 4 tredje. **Etter omordning:** 20 / 20 / 20. Av 60 kandidater fikk 30 endret plassering av fasitalternativet; svarinnhold, spørsmålstekst og ID ble beholdt.
- De **fem eksisterende** Folkets Hus-spørsmålene i `data/quiz/politikk/folkets_hus_oslo_sets.json` er ikke endret. Omordning gjelder foreløpig bare kandidatbanken; produksjonsmotorens egen blanding av svar er ikke testet her.
- Denne kontrollen viser **formell svaralternativ-integritet**, ikke at 60 kilder er lest eller at alle distraktorer er faglig gode.

## Stedsvise kontroller og åpne redaksjonelle risikoer

| Place-ID | Kandidater | Delkontroll / fortsatt arbeid |
| --- | ---: | --- |
| `hoyesteretts_hus` | 10 | 1903 vs. 1815 er et viktig korrekt skille; undersøk om spørsmål om fasaden trekker for sterke slutninger om innvendig funksjon; etterprøv 1996-detaljene |
| `folkets_hus_oslo` | 10 | Fem kanoniske spørsmål må bevares. Kontroller særlig fortolkningen av fasade, den eldre finansieringshistorien og overvåkingsfunnet, samt distraktorene |
| `hoyres_hus` | 10 | Datering 1935 og restaurantåpning 1946 kryssjekket; skill beskrivelse av byggets okkupasjonshistorie fra dagens partiorganisasjon |
| `hoyblokka` | 10 | Åpningsdato 13. april 2026 og JDs plassering i Høyblokka kontrollert; framstill ikke første byggetrinn som ferdig regjeringskvartal |
| `victoria_terrasse` | 10 | Fredning 21. mars 2025, to celler, og UDs flytting til D-blokka i 2026 dokumentert; unngå trivialisering i distraktorer om tortur og overgrep |
| `y_blokka` | 10 | «Fiskerne» og «Måken» flyttet til A-blokka i 2024 er kildebelagt; marker stedet som tidligere bygning, og vurder kunst-/fotorettigheter separat |

## Kilder kontrollert for utvalgte påstander

| Kandidat-ID | Påstand | Dokumentasjon |
| --- | --- | --- |
| `hoyres_hus_card_02` | Innvielse 21. oktober 1935 | [Lokalhistoriewiki, Høyres Hus](https://lokalhistoriewiki.no/wiki/H%C3%B8yres_Hus_%28Oslo%29) |
| `hoyres_hus_card_09` | Frascati åpnet 1946 | [Oslo byleksikon, Stortingsgata 20](https://oslobyleksikon.no/side/Stortingsgata) |
| `hoyblokka_card_04` | Første byggetrinn åpnet 13. april 2026 | [Regjeringen, offisiell åpning](https://www.regjeringen.no/no/aktuelt/offisiell-apning-av-nytt-regjeringskvartal/id3153629/) |
| `hoyblokka_card_07` | Justis- og beredskapsdepartementet tilbake i Høyblokka | [Regjeringen, innflytting](https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/nar-flytter-departementene-inn-og-nar-er-nytt-regjeringskvartal-ferdig/id3032581/) |
| `victoria_terrasse_card_03`, `_07` | Fredning 2025 og to tidligere celler | [Riksantikvaren, fredning](https://riksantikvaren.no/fredninger/victoria-terrasse-blir-fredet/) |
| `victoria_terrasse_card_06` | UD flyttet til D-blokka 2026 | [Regjeringen, offisiell åpning](https://www.regjeringen.no/no/aktuelt/offisiell-apning-av-nytt-regjeringskvartal/id3153629/) |
| `y_blokka_card_08` | Begge kunstverk i/på A-blokka etter flytting i 2024 | [Statsbygg, «Måken»](https://www.statsbygg.no/nyheter/her-flyr-maken-for-siste-gang), [KORO om kunst 2026](https://www.mynewsdesk.com/no/koro/news/kunsten-i-regjeringskvartalet-507452) |

**Viktig:** Kildereferanser er kontroll av utvalgte kjernepåstander, ikke av alle alternativene i spørsmålet. Ikke oppgrader øvrige `review_status`-felt automatisk.

## Blokkerende arbeid før bruk i spillet

1. Lag en etterprøvbar claim–source–distraktor-matrise for **alle 60** og gjør faglig gjennomgang av hver kilde, tidsfesting og hvert feilsvar.
2. Kartlegg eksisterende quizmanifest, sett, QuizCard og Knowledge-enheter mot `QUIZ_PRODUCTION_CANONICAL` 3.4. Kandidater er **ikke** fullquiz: adaptivt narrow krever minst tre sett à sju spørsmål, og det må ikke opprettes duplikater av eksisterende Folkets Hus-spørsmål.
3. Lag og revider nye kanoniske quizsett og ti QuizCards per sted først når kilde- og Knowledge-kontrakten er oppfylt. Ingen fritekst som spillerinput.
4. Bildeporten (fil, lisens, stående/bredt format, SHA-256 og kreditering) er fortsatt rød for alle seks steder.
5. Regenerer avledede filer, kjør CI på nyeste head, og utfør virkelig smal mobil- og desktop-QA før v1-godkjenning.

**Beslutning:** Sourcebank kan brukes videre som redaksjonelt arbeidsgrunnlag. Ingen kanonisk quiz, fullquiz, QuizCard, Knowledge eller publiseringsmanifest ble endret i denne delkontrollen. PR #6579 skal fortsatt være draft.
