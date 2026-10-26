# Gamle Aker kirke – samlet v1-kvalitetsport, 21. oktober 2026

- **Kanonisk sted:** `gamle_aker_kirke` (Akersbakken 26), én og samme Place i hele appen.
- **PR:** https://github.com/Paradispartiet/History-Go/pull/6548
- **Status ved review:** `v1_candidate` til samtlige PR-kontroller på siste head og faktisk app-/bilderendering er bestått. Ikke likestill forrige CI-head med den siste.
- **Strategi:** behold godkjente eldre kilder, historiefortelling, Fagverk, quiz, originalfoto, før/etter-bilde og relasjoner. Reparer bare QuizCard, portrettfotografi, bindinger og QA.

## Historisk fortelling og kildegrenser

`desc` og `popupDesc` er oppdatert gjennom hovedgrenens egen kilde- og redaksjonsgjennomgang, og **bevart ved merge inn i arbeidsgrenen**. Fortellingen tar med fossiler i kalksteinen, Midgardsormen hugget på nordkapellets apsis, branner, beslutningen om riving i 1852 og at Christiania kommune kjøpte kirken. Datering er omdiskutert, med forskjellige intervaller i fagkilder; intet sikkert år eller sikker Olav Kyrre-grunnleggelse blir påstått.

- `data/places/production/gamle_aker_kirke.json`: v4.2 med 17 verifiserte kildespor, setningsdekning for begge tekstflater, teksthash og separate faktisk-/redaksjonell-review.
- `data/runtime/place-open/gamle_aker_kirke.json`, kartindeks, faglig produksjonskontekst og en/es/pt-oversettelser følger tekstversjonen fra main.
- Kilder: https://snl.no/Gamle_Aker_kirke ; https://www.kirken.no/nb-NO/fellesrad/kirkeneioslo/menigheter/sthans/forsideoppslag/gamle-aker/ ; https://riksantikvaren.no/eksempelsamling/energieffektivisering/gamle-aker-med-ny-energi/

## Fullquiz og QuizCard

Eksisterende fullquiz på **21 spørsmål i 3 × 7** beholdes, med kilder, `claim_id`, `answerIndex`, forklaring og Knowledge-kobling. Alle spørsmål er gjennomgått, inkludert egne spørsmål om 1592 og 1703, Nonneseter, Schirmer/von Hanno, fossilførende ortocerkalkstein, rivningsbeslutningen i 1852 og 1900-tallets restaurering. Metode-/autentisitetsspørsmål står i fordypningssettet; ingen kunstig «nøyaktig byggeår»-fasit.

I den **allerede eksisterende** manifestregistrerte QuizCard-samlingen `data/quizcards/historie/topp10_historie_sted_kort_batch1.json` er de ti kortspørsmålene nå direkte gjenbruk av fullquiz. Dette inkluderer identiske spørsmål, svar, alternativer, kilder, Knowledge- og claim-ID-er. Ingen ny samling eller parallell QuizCard er opprettet. Kildegrunnlaget for alle de andre kortene i samlingen er beholdt i riktig datatype.

## Fotografier og rettigheter

- **Nytt separat `frontImage`:** `bilder/places/gamle_aker_kirke_front_nemo_bis_2019.webp`, reelt portrettfoto, 900 × 1200 piksler, ikke fra eksisterende hoved- eller kortbilde. Det viser kirkens steinmur, apsis og del av tårnet fra siden.
- **Fotograf:** Nemo bis, fotografert 23.08.2019. Kilde: https://commons.wikimedia.org/wiki/File:2019-08-23_Oslo_49_-_Gamle_Aker_kirke.jpg
- **Lisens:** CC BY-SA 3.0 – https://creativecommons.org/licenses/by-sa/3.0/
- **Bildebehandling:** EXIF-normalisert, nedskalert og minimalt midtbeskåret til egen WebP. Fullt kilde- og avledet SHA-256-bevis ligger i `reports/place-production/gamle-aker-portrait-2019-image-v1.json`.
- Stående bilde er koblet i canonical Place, `data/places/places_index.json` og `data/runtime/place-open/gamle_aker_kirke.json`, og originalt hovedfoto fra 2008 (Mahlum, public domain) og før/etter-par (Ole Tobias Olsen/Oslo Museum, CC BY-SA 4.0) er **beholdt**. Fotografi fra 2019 viser ikke den senere rehabiliteringen.

## Målrettet testdekning

- `tests/gamle-aker-v1-quizcard-parity.test.mjs`: én registrering, ti spørsmål fra eksisterende fullquiz, hele 21-spørsmålspariteten, kildesporing og fotoressurser.
- `tests/gamle-aker-quizcard-placecard-runtime.test.mjs`: bruker den faktiske PlaceCard-quizkort-kontrolleren for historiekategorien.
- `tests/gamle-aker-v1-real-browser.mjs`: Chromium 390 × 844 og 1440 × 1000; kontroll av ekte 900 × 1200 WebP i `#pcFrontImage`, QuizCard etter fullført flipanimasjon, faktisk utvidet lesepanel med ti spørsmål, videre navigasjon og egen Fagverk-side.
- `scripts/verify-place-quiz-browser.mjs gamle_aker_kirke`: faktisk gjennomspilling av alle 21 spørsmål på begge skjermstørrelser, én unlock, ingen fysisk besøksregistrering.
- `.github/workflows/gamle-aker-v1-browser.yml` er permanent CI-port. Det eksisterende Ljanselva-skriptet er uendret.
- En tidligere Chromium-kjøring på PR bestod mobil, desktop og 21/21-spill, men fotoene var da i gammel konfigurasjon. **Sluttstatus må tas fra siste PR-head** etter innkoblet nytt frontfoto og oppdatert dataprojektering.

## Seksdimensjonal vurdering – betinget inntil siste CI-head er grønn

| Dimensjon | Score / 5 | Evidens og avgrensning |
| --- | ---: | --- |
| Korrekthet og evidens | 5 | Eksisterende kildepåstander og attestert v4.2-tekst, kanonisk quizparitet, bildeproveniens med SHA |
| Dekning og ferdigstillelse | 4 | Alle v1-leveransetyper finnes; avventer formelt siste-head app-gate |
| Redaksjonell kvalitet | 5 | Stedsspesifikk historie om fossil, Midgardsorm, rivning og vern; ingen sikker årsmodell uten kilde |
| Teknisk integritet | 4 | Deterministisk generator + permanente kontrakts-/Chromiumtester; siste CI må verifiseres |
| Sikkerhet og ansvarlighet | 5 | Kilder, bildekreditering, lisens og historisk usikkerhet er eksplisitt, originalene beholdes |
| Vedlikeholdbarhet | 5 | Ett Place, én QuizCard, standard PlaceCard / Fagverk / quizmotor, ingen ny runtimevariant |
| **Sum** | **28/30 betinget** | Ingen fullført v1-erklæring før faktisk grønn siste-head QA |

QA begrenses til v1-minimum, ikke at all mulig full `vFerdig`-produksjon er utført. Alle fotoer og fullquizspørsmål skal forbli sporbart eid av canonical Place og den eksisterende quizmotoren.

## CI-observasjon etter bildepåføring og kontekstgenerering

- Den separate WebP-filen er produsert og bundet til canonical Place, kartindeks og Place-open. Canonical historietekst, claim-dekning og oversettelser fra hovedgrenen er bevart.
- PR-kjøringen på commit `93a98ab6` fant at mobiltesten besto, men desktoptesten forkastet den korrekte engelske tittelen **«Old Aker Church»**. Den aktuelle testen er tilpasset norsk og engelsk tittel, uten å tillate feil place-ID eller feil bilde.
- GitHub Actions-botens genereringscommit `789a900436b2f1628029ce337ab5bc601df35d34` resulterte i status `action_required` uten reell testkjøring. Det teller **ikke** som grønn CI. Det kreves faktisk fullført målrettet Chromium-test på etterfølgende ordinær PR-commit.
- Den permanent lagrede nettleserkontrollen skal fremdeles kontrollere 390/1440 px, 900×1200-bildet, flipp, utvidet lesepanel, Fagverk og 21/21 spørsmål på begge skjermbredder.
