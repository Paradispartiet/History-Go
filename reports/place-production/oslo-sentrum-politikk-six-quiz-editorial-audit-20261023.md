# Oslo sentrum Politikk – quizproduksjon og redaksjonell delkontroll

**Dato:** 23. oktober 2026  
**Omfang:** Kun seks Place-ID-er i PR #6579 (`hoyesteretts_hus`, `folkets_hus_oslo`, `hoyres_hus`, `hoyblokka`, `victoria_terrasse`, `y_blokka`). Oslo-bolk 04 og andre PR-er holdes utenfor.  
**Status:** Forskningsbank, *ikke* publisert fullquiz, QuizCard, Knowledge eller v1. PR forblir draft.

## Bekreftet status – skill rå kandidater fra spillbart innhold

Fagverk 6/6 og bildegrunnlag 6/6 (tolv faktiske WebP-filer) er teknisk integrert. På forrige ferdige PR-head `f789635afdba998cbeda6c108fb866a151db027a` bestod 12/12 GitHub-kontroller. Denne statusen gjelder **den commit-en**, ikke en garanti om senere quiz-research-commits eller faktisk mobil-/desktop-QA.

Kandidatbank: `reports/place-production/oslo-sentrum-politikk-six-quiz-sourcebank-20261023.json`.

| Place-ID | QuizCard-research | Ny fullquiz-research | Rå kandidater | Eksplisitt HOLD | Uten HOLD |
| --- | ---: | ---: | ---: | ---: | ---: |
| `hoyesteretts_hus` | 10 | 16 | 26 | 0 | 26 |
| `folkets_hus_oslo` | 10 | 15 | 25 | 2 | 23 |
| `hoyres_hus` | 10 | 12 | 22 | 1 | 21 |
| `hoyblokka` | 10 | 13 | 23 | 0 | 23 |
| `victoria_terrasse` | 10 | 14 | 24 | 0 | 24 |
| `y_blokka` | 10 | 13 | 23 | 0 | 23 |
| **SUM** | **60** | **83** | **143** | **3** | **140** |

**Viktig:** «Uten HOLD» betyr *ikke* redaksjonelt godkjent. Ingen av de 140 kan omtales som publiseringsklar eller automatisk plasseres i sett. Faktisk selvstendighet, distraktorer, kildepassasjer, repetisjon og Knowledge skal gjennomgås før profil velges.

### Strukturell kontroll utført

- **143 unike kandidat-ID-er**, ingen identiske spørsmålstekster innenfor samme Place.
- **143/143** har nøyaktig tre ulike svaralternativer, og `answer === options[answerIndex]` med gyldig indeks.
- **143/143** har en ikke-tom Knowledge-forklaring og minst én HTTPS-kilde-URL.
- Source-URL-tilstedeværelse alene er **ikke** dokumentasjon på at hele kilden, riktig passasje og alle feilsvar er kvalitetssikret.
- Ingen endring i aktivt quizmanifest, eksisterende fem kanoniske Folkets Hus-spørsmål eller deres eksisterende Knowledge-ID-er. De aktive spørsmåls-ID-ene er bevart i kandidatbanken i samme rekkefølge.
- De opprinnelige 60 QuizCard-kandidatene fikk ved forrige delkontroll balansen **20/20/20** i korrekt svarposisjon. Den utvidede banken er ikke tvunget til uniform fasitplassering; spillmotoren stokker svarene, og fasitparitet må testes der.

### De tre spørsmålene som skal holdes tilbake

| Kandidat-ID | HOLD-årsak | Tiltak |
| --- | --- | --- |
| `folkets_hus_oslo_s1_q1` | Påstanden om at vindusfasaden i seg selv beviser byggets indre funksjonsfordeling, går utover det en observerbar fasade kan dokumentere | Revider spørsmålet og tilsvarende **aktive** Knowledge-kobling i egen kanonisk quizendring, uten å doble ID |
| `folkets_hus_fullquiz_research_25` | Oslo byleksikon beskriver en nasjonal rekkefølge, mens SNL omtaler Folkets hus på Spjærøy i 1898; ordet «andre» blir dermed tvetydig | Behold ute til kriteriene for sammenligningen og primærkilde er avklart |
| `hoyres_hus_fullquiz_research_13` | Konferansesalnavn er mer foranderlig og mindre vesentlig enn husets organisasjons-, by- og okkupasjonshistorie | Ikke bruk som kvotefyll; prioriter heller særskilt stedskjennetegn og historisk bruk |

Forskjellen mellom `hold_` og `held_back_` må begge regnes som HOLD; tidligere ad hoc-telling undervurderte dette når den bare søkte strengen `hold`.

### Andre kilde- og kvalitetsforbehold

- **Victoria terrasse:** Riksantikvaren bruker 1912 om statlig overtakelse; SNL omtaler et kjøpsvedtak 1913. Ikke skriv et datospørsmål før beslutning/overdragelse er skilt og primærkilden lest.
- **Høyblokka:** Skill Høyblokka ferdigstilt/tatt i bruk i 1958 fra øvrig regjeringskvartal og enkelte kilders datering 1959. Bilder fra 2008 er ikke en nåtidsillustrasjon.
- **Y-blokka:** Kilder bruker 1969/1970 i ulike kontekster; unngå uklar «ferdig»-dato. Bygget ble revet i 2020. Presentér både regjeringens sikkerhetsbegrunnelse og kulturminnefaglige/byplanfaglige innvendinger uten skjult slagside.
- **Høyres Hus:** Skill Stortingsgata 20 (1935) fra separat Høyres Hus på Kalbakken (1965). Skill dessuten Christiania Tivoli på tomten, partiets egen virksomhet og okkupasjonsmaktens bruk som ulike tidslag.
- **Folkets Hus:** Arbeiderbevegelsens arkiv beskriver flere klart adskilte byggetrinn i 1907, 1930-årene og 1954–1962. Skille første hus fra dagens anlegg. Ikke legg uspesifiserte påstander om overvåking til navngitte ansvarlige.

### Utvalgte original- og institusjonskilder for neste fagreview

- [Norges domstoler – Høyesteretts hus](https://www.domstol.no/no/hoyesterett/om/hoyesteretts-hus/) og [Høyesteretts historie](https://www.domstol.no/no/hoyesterett/om/historie/).
- [Lovdata – Grunnloven](https://lovdata.no/dokument/NL/lov/1814-05-17/KAPITTEL_3).
- [Arbeiderbevegelsens arkiv – Folkets Hus](https://www.arbark.no/Bildeserier/folketshus/Folkets_Hus.htm) og [Oslo byleksikon – Folkets hus](https://oslobyleksikon.no/side/Folkets_hus).
- [Oslo byleksikon – Stortingsgata 20](https://oslobyleksikon.no/side/Stortingsgata) og [Lokalhistoriewiki – Høyres Hus](https://lokalhistoriewiki.no/wiki/H%C3%B8yres_Hus_%28Oslo%29).
- [Regjeringen – regjeringskvartalets bygninger](https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/bygninger/id712727/), [Statsbygg – Høyblokkas fasade](https://www.statsbygg.no/nyheter/fasaden-pa-hoyblokken-er-klar/).
- [Riksantikvaren – Victoria terrasse fredes](https://riksantikvaren.no/fredninger/victoria-terrasse-blir-fredet/) og [SNL – Victoria terrasse](https://snl.no/Victoria_terrasse).
- [Regjeringen – rivningsgrunnlag for Y-blokka](https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/fakta-y-blokken-ma-rives/id2721904/) og [Oslo kommune – debatt om Y-blokka](https://magasin.oslo.kommune.no/byplan/tillater-riving-av-en-floy-av-y-blokka).

### Eksisterende quiz / Knowledge – kanonisk integrasjonsgrense

`data/quiz/manifest.json` har per denne kontrollen direkte `sets`-oppføring for **bare** `folkets_hus_oslo` av de seks. Filen `data/quiz/politikk/folkets_hus_oslo_sets.json` har ett aktivt sett med **fem** spørsmål (`folkets_hus_oslo_s1_q1` … `s1_q5`) og eksisterende `primary_knowledge_unit_id`. De fem andre target-ID-ene har ingen direkte aktive `sets`-oppføringer. Dette beviser ikke fravær av shared/legacy/quizartefakter; den auditen gjenstår.

Gjeldende `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md` v3.4 krever kategori-/målaudit, fullt faggrunnlag, gjennomgåtte kildepassasjer, påstandsbank, fast profil, settplan, spillspørsmål og Knowledge-synkronisering. **`narrow` er 3 × 7 spørsmål** per Place, med to innledende sett à sju normale spørsmål. Ti QuizCard-spørsmål kommer i tillegg som en separat runtimekontroll og skal gjenbrukes fra de samme godkjente påstandene der det er mulig. Et sett på 1 × 10 er ikke etablert som publisert fullquizstandard.

### Krav før kandidater flyttes fra research til spillet

1. Gjør systematisk spørsmål-for-spørsmål **claim–source–passasje–distraktor–forklaring**-gjennomgang; fjern svake/repeterte påstander og erstatt uten kvotefyll. 143 spørsmål i en liste betyr ikke 143 faglig selvstendige godkjente spørsmål.
2. Gjennomgå alle aktive, eldre og delte sett, QuizCard-assets, `bilder/QuizCards/**`, runtime-mapping og eksisterende Knowledge-ID-er for å unngå dubletter.
3. Opprett kanonisk `source_brief` og `production_context` for de valgte seks targetene etter `data/fag/fag_manifest.json` og v3.4; begrunn profil og eksakt settantall først etter full fakta-/kildeaudit.
4. Bygg og registrer fullquiz-sett i manifestet, med korrekt fase/progresjon, Knowledge-paritet og de dedikerte ti QuizCard-spørsmålene per Place. Ingen fritekstsvar.
5. Kjør målrettet QA og full PR-CI på siste commit, og gjør **faktisk nettleser-/appkontroll på smal mobil og desktop** av bilder, PlaceCard-flipp, quiz, kreditering og Fagverk-side før v1-merke.

**Beslutning:** Redaksjonell forskningsbank kan brukes videre. Ingen nye kanoniske quizsett, quizmanifestoppføringer, QuizCards eller Knowledge ble opprettet som del av denne 143-spørsmålskontrollen. PR #6579 skal være draft.


## Implementering etter redaksjonell bankkontroll – 23. oktober 2026

**Oppdatert produksjonsstatus på bot-commit `ebf09a951cb6b6b0a5897758d78331154fe2adc6`:**
Seks nye/reviderte kanoniske fullquizer er lagret i `data/quiz/politikk/<place_id>_sets.json`, med 3 sett à 7 (**126 spillregistrerte spørsmål**). Seks `source_brief` og seks deterministiske `production_context`-filer er produsert etter `QUIZ_PRODUCTION_CANONICAL` v3.4 og koblet fra Politikk-delen av `data/fag/fag_manifest.json`. Alle seks har egne `data/quiz/manifest.json`-oppføringer. Ny samling `data/quizcards/politikk/topp10_politikk_oslo_sentrum_six_pr6579.json` er registrert i QuizCard-manifestet med **10 flervalgs-QuizCards per sted**, 60 totalt, med `sourceQuestionId`/`sourceQuizId` til kanoniske spørsmål.

**Kvantitativ filkontroll:** Hvert sted har 21 svar med 3 unike alternativer, 7 korrekte svarposisjoner i hver lagret indeks (0, 1, 2), ett teoribundet og fire eksplisitte metodebundne spørsmål i sluttdelen, og **21/21 `knowledge_link_status: linked`** etter `knowledge:canonical:write`. Samlet 126/126 linked. De gamle fem `folkets_hus_oslo_s1_q1` … `q5` har beholdt spørsmålsidentitetene (q4 er flyttet i settrekkefølgen). q1 har fått et nytt spørsmål om 1962-kompleksets dokumenterte funksjoner fremfor å kreve at en fasade alene beviser interiørfunksjoner.

**Teknisk målrettet kvalitetsrunde:** [GitHub Actions #39948052196](https://github.com/Paradispartiet/History-Go/actions/runs/39948052196) fullførte med `success` og kjørte:
- `audit:quiz-content`
- `audit:quiz-templates`
- `audit:quiz-production-context`
- `audit:quiz-progression`
- `audit:quiz-theory-binding`
- `test:quiz-content-audit`
- `audit:quiz-wiring`
- Knowledge-regenerering og kontraktskontroll.

**Eksisterende, urelatert dataproblem:** `audit:quiz-manifest:v2` skriver fortsatt status `failed` fordi `data/quiz/kunst/nasjonalmuseet_sets.json` mangler `kunst_nasjonalmuseet_set_6`. En egen eksakt-delta-kontroll i produksjonsjobben tillot bare *denne kjente urelaterte feiloppføringen* og krevde null øvrige nye manifestfeil. Feilen skal ikke skjules eller erklæres løst, og Nasjonalmuseet skal ikke endres fra vårt Oslo-Politikk-spor.

**Kvalitetsforbehold:** Kildene er tidligere kontrollert som kjernepåstander i forskningsbanken, men status som `reviewed` i produksjonsmetadata er **ikke dokumentasjon på at alle distraktorer er uavhengig fagfelle-/redaksjonsgodkjent**. Flere av de innførte 126 spørsmålene kommer fra foreløpige kandidater som tidligere hadde `review_status: source_candidate_not_published`. Før v1-status må en uavhengig spørsmål-for-spørsmål-kvalitetsrevisjon vurdere distraktorers plausibilitet, balanse og faglig verdi, og kontrollere utvalgsprofilen særskilt for større bygg som Høyblokka/Y-blokka. Appens faktiske respons på smal mobil/desktop, QuizCard-åpning, bilde/attribution og lokal GPS-visning er ennå **ikke manuelt eller browser-automatisert bestått**.

**PR-beslutning:** Behold `draft`; ikke merge eller kall stedene v1-ferdige kun fordi tekniske quizkontrakter består. Ingen Oslo-bolk 04-steder eller andre konkurrerende arbeidsfiler er endret.
