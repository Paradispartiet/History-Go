# Minneparken — stedssjekkliste, status 2026-11-03

**Place ID:** `minneparken_gamlebyen`  
**Branch:** `content/minneparken-kildebasert-leksikon-20261103`  
**PR:** #6966 (draft)  
**Samlet status:** **DELVIS IMPLEMENTERT / BLOCKED for merge, ikke v1, vFerdig eller V3 complete**.

## Gjennomførte endringer

1. **Canonical Place (335 ord i `popupDesc`):** `data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_11/minneparken_gamlebyen.json` har omarbeidet `desc` og `popupDesc` uten intern History Go-/quiz-/produksjonsprosa. Kildenes lokale byhistorie, parkvedtaket i 1918, planvedtaket i 1928, åpningen i 1932, veiinngrep på 1960-tallet og tilbakeføring i 2024–2025 er bevart og utvidet. Tre relevante, eksisterende underbadges er satt: `middelalder`, `byhistorie`, `kulturminner_og_bevaring`. Verifisert parkgeometri, koordinater og radius ble ikke endret.
2. **Beskrivelse og claim-arbeid:** `data/places/production/minneparken_gamlebyen.json` er opprettet med resolved identitet, 24 claim-poster, kildelokasjoner, 3+21 setningskoblinger, SHA-256-hasher og ti spørsmål som kun er quiz-readiness. **Status er `needs_research`**, ikke `ready_v4_2`, siden full validator og uavhengig review mangler. Disse spørsmålene er ikke en publisert quiz.
3. **Historie-faglig rapport:** `data/places/historie-production/minneparken_gamlebyen.json` dokumenterer kilder, stedseierskap, interessekonflikten i 1918, endringene og usikkerheten. **Status `blocked`**. Gate F (fersk fysisk status), G (fullquiz) og H (canonical chronology/Stories) er åpne.
4. **Fagverk-sted:** Place-eid `history_go_place_fagverk_v2`, `standard`, med egen historisk fagartikkel (211 ord), fire emnekoblede linser, fem undersøkelsesspørsmål, ni begreper, to observerbare spor med tolkningsgrenser og fire eksterne kildeadresser. Smalt indeksledd er føyd til `data/fagverk/fagverk_registry.json`. **Curated er redaksjonell innholdsstatus, ikke bekreftet live side eller full Place-closeout.**
5. **Språkleksikon:** Ny kildebasert stedsspesifikk fil og oppdatert `data/leksikon/sprak/manifest.json`: `Minneparken`, `Ruinparken`, `St. Halvards plass`, `apsis`, `Olavsklostret`. Dialekt er ikke oppdiktet.
6. **Leksikon:** Historisk artikkel supplert, fem stedlige fakta og eksakte kronologipunkter for 1918, 1928, 1932 og 2024. Veibyggingen står som 1960-tall, ikke oppdiktet år.

## Kildegrunnlag og tidsstatus

- [Oslo kommune – Minneparken](https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/minneparken/): katedral, kloster, kirkegård, jernbane, 1932, motorvei, 2024-planer.
- [Oslo byleksikon – Minneparken](https://oslobyleksikon.no/side/Minneparken): stedets navn, lokalbefolkningens park, 1918, 1928, 1932 og Harry Fett.
- [Oslo kommune – Nå blir det mer liv i Middelalderbyen](https://aktuelt.oslo.kommune.no/na-blir-det-mer-liv-i-middelalderbyen) (28. juni 2024): arbeidet med å fjerne betongdekket og planlagt offentlig tilgjengelighet.
- [Middelalder-Oslo – Minneparken og Hallvardskatedralen](https://www.middelalder.no/middelalderbyen-i-dag/middelalderbeltet/589-minneparken-og-hallvardskatedralen), Petter Molaug november 2025: sørmur og apside, manglende sti og plen. **Ikke bevis for november 2026.**
- [Middelalder-Oslo – Minneparken og Hallvardskatedralen (september 2025)](https://www.middelalder.no/oslo-i-middelalderen/arkeologiske-funn/576-minneparken-og-hallvardskatedralen): frostvern, apsidemur og åpne materialvalg.
- [Store norske leksikon – apsis](https://snl.no/apsis): fagordets betydning.

## Sjekkliste og status

| Port | Status | Evidens / neste handling |
| --- | --- | --- |
| Canonical Place-identitet og kart | DELVIS PASS | Egne Minneparken-koordinater og `area_anchor` beholdt; full geografisk slutt-QA mangler |
| Badge/underbadge | DELVIS PASS | Historie og tre eksisterende underbadges er valgt etter stedskilder; formell `rule_preflight` mangler |
| `desc`, `popupDesc` og claims | DELVIS PASS | Historieteksten er revidert; 24 claim-koblinger/hashes; canonical validator og separat uavhengig gjennomgang mangler |
| Historie-faglig evidens | BLOCKED | Rapport materialisert som `blocked`; gates F/G/H krever videre arbeid |
| Fagverk-sted | DELVIS PASS | Egen standard-blokk og registry-oppføring finnes; Fagverk-release er deterministisk regenerert og kontrollert av GitHub Actions; noen andre Fagverk-sider har separate testavvik, og reell browser-QA gjenstår |
| Språkleksikon | DELVIS PASS | Fem navne- og begrepsposter i språkmanifest; faktisk Språk-fane må klikkes/testes |
| Leksikon-kronologi og epoke | DELVIS PASS | Fire kildebelagte leksikonår; epokeindeksen er bygget og `--check` bestod, men canonical claim-/chronology- og seertest gjenstår |
| People / Objects / Brands / historiske hendelser | IKKE AVKLART | Source-bounded kandidataudit og eventuelle materialiserte medlemmer med bilder; ingen filler |
| Stedsbilder / `frontImage` | BLOCKED | Ingen dokumentert, faktisk stående PlaceCard-fil og lisensmetadata integrert |
| Quiz / QuizCard / Knowledge | BLOCKED | Ingen fullquiz/QuizCard/flip-paritet materialisert eller vist; kun ti research-spørsmål i packet |
| Runtime og genererte avledninger | **BLOCKED** | `places_index.json`, `data/runtime/place-open/minneparken_gamlebyen.json`, Place- og Fagverk-release/epoke er generert og sjekket via GitHub Actions; Fagverk coverage, full browser-/i18n-QA og relevante oversettelser må fortsatt kontrolleres |
| CI og browser-QA | **BLOCKED** | Ikke kjørt relevant full node-test/CI-/browserpakke; PR må holdes i draft |

### Bildekandidater (ikke publisert)

- [Ruinparken1.JPG – Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Ruinparken1.JPG), fotograf Helge Høifødt (2007), erklært public domain på Commons. Historisk tidsbilde, ikke en dokumentasjon av utseendet etter 2024. Originalen er liggende.
- [St. Hallvardskatedralen i Ruinparken – Wikimedia Commons](https://commons.wikimedia.org/wiki/File:St._Hallvardskatedralen_i_Ruinparken,_St._Halvards_gate,_Oslo.jpg), fotograf Ssu (2025), CC BY-SA 4.0 på Commons. Aktuelt motiv fra ruinen, men må kvalitetskontrolleres og få selvstendig stående utsnitt med rett attribusjon og lisens ved faktisk publisering.

Ingen av disse er lagt til som `image`/`frontImage`. Hovedbilde og stående bilde skal være ulike, egne bildefiler med proveniens; `cardImage` skal ikke opprettes.

## Utført kontroll

- Alle ti inspiserte JSON-/schemafiler kunne parses.
- `fagverk` har samtlige nødvendige toppfelt, korrekt `standard`-innholdsmengde, resolverte fag-/emne-/kapittel-ID-er i registryet og navngitte `externalLinks` for alle fire kilder.
- Språkmanifestet peker på riktig fil; fem oppføringer har kildeadresser med HTTPS.
- Source-bundne `placeId`-er er like, og 24 beskrivelsessetninger har 24 claimkoblinger.
- Historie-rapportens kilde-ID-er er definert; valgte underbadges finnes i `data/badges/historie.json`.

**Utførte kontroller:** Statisk JSON-/referanseinspeksjon og GitHub Actions-generering (jobben 41575722410) med `places:index:check`, `place-open:check`, `epoker:places:check` og Fagverk-release-`--check` bestod. Deretter bestod også regenereringsjobb 41576163672, og Place-open-payloaden er lest tilbake: alle 335 ordene i `popupDesc` samsvarer byte-for-byte med Place-kilden. Full Historie/description-/Fagverk-validering og faktisk browser-QA er ennå **ikke** godkjent.

## Påkrevd neste integrasjonsrunde

1. Lås og registrer READ-FIRST-workcard med `rule_preflight` fra aktuell main/head.
2. Kjør `npm run places:index:build && npm run places:index:check` og canonical place-open materialisering; verifiser at teksten kommer fram i appen.
3. Kjør `node scripts/audit-fagverk-place-pages.mjs --write`, `node scripts/build-fagverk-release-manifest.mjs`, relevante Fagverk-tester og `--check`. Test `fagverk-sted.html?place=minneparken_gamlebyen`.
4. Kjør description- og Historie-produksjonsvalidatorene mot claim- og reportfilene; bruk valideringsfunn til å korrigere claims, ikke endre status basert på antall alene.
5. Fullfør stedsspesifikk fullquiz/QuizCard, kandidataudit for People/Objects/Brands/hendelser, rettighetsklare bilder, chronology/epoke, og mobil-/desktop-browser-QA.
6. Gjør fresh-main replay og se på endelig diff/CI før merge. Separat produksjonsdeploy må fortsatt være eksplisitt autorisert.

## Foreløpig seksdimensjonal kvalitetsvurdering

| Dimensjon | Score | Kommentar |
| --- | ---: | --- |
| Korrekthet og evidens | 4/5 | Kildedrevet nytt stoff, 19 setningskoblinger; formell validator og uavhengig review mangler |
| Dekning og ferdigstillelse | 2/5 | Historietekst, Fagverk og Språk implementert; bilder/quiz/CI/QA mangler |
| Faglig/redaksjonell kvalitet | 4/5 | Stedlig byhistorie og konflikt, egne spørsmål og lesbare historiske lag |
| Teknisk integritet | 3/5 | Statisk kontroll og to beståtte genereringsrunder med stedsindeks-, epoke-, place-open- og Fagverk-kontroll; manuell app- og fulltest mangler |
| Sikkerhet og ansvarlighet | 4/5 | Åpne lisens- og tidsstatusspørsmål er ikke framstilt som godkjent |
| Etterprøvbarhet og vedlikehold | 4/5 | Egen claim-/kilde-/Historie-rapport og source-avgrenset diff; preflight mangler |

**21/30. Ikke godkjent som fullført eller mergeklart.** Ingen UI-, runtime- eller CI-gate kan ersattes med denne rapporten.


## Integrasjonsbevis, ferdigstilt 2026-11-03

- GitHub Actions `41575722410` og `41576163672`: `npm run places:index:build/check`, `npm run place-open:build/check`, `npm run epoker:places:build/check` og Fagverk-release build/`--check` fullført med suksess.
- `data/runtime/place-open/minneparken_gamlebyen.json` er lest tilbake fra grenen: `place.popupDesc ===` canonical Place-`popupDesc`, **335 ord**.
- Den midlertidige workflowen `.github/workflows/minneparken-regenerate-temp.yml` ble slettet fra arbeidsgrenen etter verifisering; den skal ikke inngå i sluttdiffen.
- Ingen publiserings-/deploy- eller mergehandling er utført. Historieproduksjon, quiz/QuizCard, People/Objects/Brand-kandidater, bilder med proveniens og mobil-/desktopbrowser står fortsatt som sperrer.

## Supplerende kandidataudit og teknisk reparasjon (3. november 2026)

### Reparererte, etterprøvbare CI-kontrakter

- Den tidligere feilen i `tests/epoke-place-index.test.mjs` kom av en utdatert forventning om bare 1932 og 2024. Etter kildebelagt utvidelse av Minneparkens leksikonkronologi er de gjennomgåtte ankerårene **1918, 1928, 1932 og 2024**. Testen ble oppdatert i commit `e7e2e8e9e1864c56bc7e361a7bc6aba276dd5f40`, uten å slette kildestøttede hendelser.
- `dist/web/place-unified-surface.js` og sourcemap var ute av synk. En avgrenset engangsjobb regenererte disse filene i commit `2d2cc9ed0b7c8ffba1e59ddf417333b861055bf9`. GitHub Actions [#41577777123](https://github.com/Paradispartiet/History-Go/actions/runs/41577777123) bestod med TypeScript-kontroll, web-bygg, `build:web:check` og den oppdaterte epoketesten.
- Den midlertidige web-workflowen ble slettet etter kjøringen i commit `761e37482e3a73c960941bb406cbc86b973ca6c4`; den skal ikke inngå i sluttdiffen.
- Ordinær PR-CI på endelig head er fortsatt en separat port. Tidligere røde Fagverk-jobber omfatter `the_villa` og `jaeger_oslo`. Deres Place-filer hadde identisk blob-SHA i den inspiserte PR-grenen og i `main`, og skal ikke maskeres med svakere auditor eller feilaktig fremstilles som en ny Minneparken-feil.

### Source-bounded kandidatgjennomgang: PlaceCard-samlinger

| Kandidatfamilie | Konkret lokal evidens | Foreløpig avgjørelse og hindring |
| --- | --- | --- |
| People | Oslo byleksikons omtale av **Gerhard Fischer** (arkeologisk arbeid og godkjent parkplan i 1928) og **Harry Fett** (tale ved åpningen i 1932). | **KANDIDATER / IKKE MATERIALISERT**. Kontroller eksisterende canonical People-ID-er, stedstilknytning, personprofilkontrakten og bildeproveniens før samling kan opprettes. Ingen konstruerte personer. |
| Objects | Kilder omtaler grunnmurer, apside, kirkegård og betonglokk. Dette er primært anlegg, ruiner og materiell kulturarv på stedet, ikke uten videre selvstendige, flyttbare Objects. | **IKKE AVKLART**. Kilder som dokumenterer konkrete enkeltgjenstander med korrekt objekttilhørighet må undersøkes. Ikke opprett Object bare fra ruin-/strukturbetegnelser. |
| Brands | Minneparken er en navngitt offentlig ruinpark. Det inspiserte stedsstoffet identifiserer ikke en selvstendig merkevare som kvalifiserer bare fordi den har en steds- eller forvalternavn. | **IKKE AVKLART / INGEN MATERIALISERING**. Før `N/A` kreves egen kontroll av canonical brand-katalog, brands-by-place og kandidatspesifikk begrunnelse. |
| Historiske hendelser | Bystyrevedtaket i **1918**, parkplanen i **1928**, åpningen i **1932** og endringene i **2024** er kildebelagt og materialisert som leksikon-/epokeankere. | **KANDIDATER / PLACECARD BLOCKED**. En epokelinje er ikke automatisk en canonical historical-events-samling eller en fullført Story. Eierskap, manifest og lastbare previewbilder må kontrolleres før samlingsflaten erklæres ferdig. |

Denne kandidatenes status er en kontrollert avgrensning, ikke en beslutning om at alle fire samlinger skal vises. I tråd med `PLACE_PRODUCTION_PROFILES.md` velges én til fire **faktisk ferdige og kildebårne** samlinger, ikke fyll for å oppnå antall. Ny v1-/vFerdig-status er fortsatt blokkert av bilder, fullquiz/QuizCard, Historie-portene F/G/H og faktisk mobil-/desktop-QA av Minneparken.

## Målrettet validator- og bildeproveniensgjennomgang (3. november 2026)

- GitHub Actions [#41578664470](https://github.com/Paradispartiet/History-Go/actions/runs/41578664470) brukte den uendrede, eksporterte `validatePacket` fra canonical v4.2-validator direkte på `data/places/production/minneparken_gamlebyen.json` og den tilhørende Place-kilden: **0 strukturelle/claim-relaterte feil**. Dette gjør ikke packetens `needs_research` til `ready_v4_2` og erstatter ikke uavhengig redaksjonell godkjenning.
- Kontrakttestene for Place description og Historie: **21 bestått, 0 feilet**. `place-open:check`, `epoker:places:check`, Fagverk-release-`--check` og `build:web:check` bestod i samme kjøring. Det var ingen automatisk browser-/mobiltest av Minneparken i denne kjøringen.
- Den målrettede Historie-`--changed`-validatoren kontrollerte **1 rapport og fant 2 åpne ferdigporter**: `status` er med vilje `blocked`, ikke `ready`, og **gate F** er `N/A` i stedet for `PASS`. Disse må ikke omgås ved å skru ned valideringen. Gate G og H er fortsatt uferdige innholds-/runtimeporter selv om de ikke var blant disse to direkte validatorfeilene.
- Et tidligere `--changed`-løp av v4.2 CLI rapporterte **461 feil i 269 pakker**. Gjennomgang av `validateRepository` viser at CLI-en fortsatt validerer hele produksjonskatalogen før PR-scope-sjekken. Dette tallet er ikke dokumentasjon på 461 nye Minneparken-feil; den målrettede kontrollen ovenfor isolerer innholdspakken uten å endre valideringsreglene.
- Commons-kandidaten [`Ruinparken1.JPG`](https://commons.wikimedia.org/wiki/File:Ruinparken1.JPG) er oppgitt av fotograf Helge Høifødt som **public domain**, 3072 × 2304 piksler, tatt 15. juli **2007**. Bildet er tidsbundet og kan ikke dokumentere parkens 2026-tilstand.
- Commons-kandidaten [`St. Hallvardskatedralen i Ruinparken, St. Halvards gate, Oslo.jpg`](https://commons.wikimedia.org/wiki/File:St._Hallvardskatedralen_i_Ruinparken,_St._Halvards_gate,_Oslo.jpg) er tatt 19. august **2025** av **Ssu** og merket **CC BY-SA 4.0** (4032 × 3024). Bearbeiding krever kilde-/lisenslenke, fotografkreditering, endringsmerking og korrekt ShareAlike-håndtering. Bilder er *bare* rettighets- og kildekandidater: ingen rettighetsklar `image`/`frontImage`-fil er lagt inn, og 3:4-utsnitt samt faktisk appvisning gjenstår.
- Oslo kommunes [Minneparken-side](https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/minneparken/) omtaler gangsti og tilgjengeliggjøring som planlagte tiltak. [Middelalder-Oslo, november 2025](https://www.middelalder.no/middelalderbyen-i-dag/middelalderbeltet/589-minneparken-og-hallvardskatedralen) dokumenterer at deler av anlegget ikke var fullført den gangen. Ingen av disse beviser faktisk ferdigstatus **3. november 2026**. Historie-gate F forblir blokkert til fersk, etterprøvbar tilstandsbekreftelse finnes.

**Status etter validatorrunde:** Kilde-/setningspakken og de kontrollerte tekniske avledningene har bestått sine målrettede tester, men Historie-gate F, fullquiz/QuizCard, to forskjellige publiserbare bilder, PlaceCard-medlemmer, mobil-/desktopbrowser-QA og ordinær CI på endelig PR-head er fortsatt sperrer. **Ikke `v1`, `vFerdig`, V3 `complete`, merge eller publisering.**

## Målrettet valideringsbevis etter reparasjonsrunden

GitHub Actions [#41578664470](https://github.com/Paradispartiet/History-Go/actions/runs/41578664470) ble kjørt på den isolerte PR-grenen etter web-reparasjonen. Den samlede kjøringen er **rød fordi Historie-rapporten ærlig forblir blokkert**, ikke fordi de øvrige målrettede kontrollene feilet.

- `validatePacket` for bare `data/places/production/minneparken_gamlebyen.json`, med canonical Place lastet fra `placeFile`: **0 issues**.
- `tests/place-description-production-v4_2.test.mjs` og `tests/historie-place-production.test.mjs`: **21/21 bestått**.
- `npm run place-open:check`, `npm run epoker:places:check`, Fagverk-release `--check` og `npm run build:web:check`: **alle bestått**. Web-bunt er i synk.
- Historie `--changed` med Minneparkens rapport: **én rapport kontrollert, to feil**: `status må være ready før Historie-stedet kan godkjennes` og `gate F må være PASS for et ferdig Historie-sted`. Ingen av disse portene skal omgås eller settes til PASS uten kildebevis. Portene G/H (fullquiz, canonical chronology/Story-review) forblir redaksjonelt åpne selv om denne validatoren bare rapporterte F.
- Repository-vid `--all` for description-pakker kontrollerte 269 pakker og viste flere hundre avvik i katalogen. Denne brede kontrollen er **ikke** en presis tilstandsvurdering av Minneparken og skal ikke omtales som en egen place-feil.
- Engangsworkflowen som samlet bevisene ble slettet fra grenen i `2916feb7c0efcd468f081101daef71edd384420e` etter at jobbene var sendt til GitHub. Ingen midlertidig QA-workflow skal inngå i sluttdiffen.

**Konklusjon:** Beskrivelsesregistrering og genererte tekniske overflater er nå testet grønt for denne endringsrunden. Historie, fullquiz/QuizCard, rettighetsklarerte bilder, samlingsmedlemmer og faktisk Minneparken-browser-QA er fortsatt sperrer for v1/vFerdig og merge.

## Etterkontroll av faktisk browser-QA og fersk kildeavgrensning (3. november 2026)

**Målrettet Playwright-test bestått, men ikke full Place-aksept:** [GitHub Actions #41579218108](https://github.com/Paradispartiet/History-Go/actions/runs/41579218108) fullførte med `success` på commit `ef1b5e073370a835e4b67ef9c0f659a186c9479d`. Loggen bekrefter `PASS Minneparken text / PlaceCard / Fagverk: mobile` (390 × 844) og tilsvarende `desktop` (1440 × 960). Testen kontrollerte PlaceCard-`desc`, Fagverk-artikkelavsnitt/linser og fravær av JavaScript-runtimefeil. Skjermbilder og `results.json` ble lastet opp i [artefakt #13205138329](https://github.com/Paradispartiet/History-Go/actions/runs/41579218108/artifacts/13205138329). **Etterfølgende manuell kontroll av de fire opplastede skjermbildene viser at PlaceCard fortsatt bruker HISTORY GO-plassholder og har et synlig ødelagt bildeikon både på mobil og desktop; Fagverk viser eksplisitt at bilde mangler som produksjonskrav.** Dette er en faktisk visuell restanse, ikke et bestått bilde-/UI-kriterium. Kontroll av skjermbilder erstatter ikke interaktiv ferdig-QA. Testen dekker ikke endelig `popupDesc`-presentasjon, faktiske lisensierte `image`/`frontImage`, Quiz/QuizCard-flip, Språk-fane, oversettelser eller full mobil-/desktop-closeout.

**Repeterte målrettede validatorresultater:** [GitHub Actions #41578923153](https://github.com/Paradispartiet/History-Go/actions/runs/41578923153) rapporterte fortsatt **0 issues** fra canonical `validatePacket` for Minneparken og **21/21** beståtte kontrakttester. Historie-valideringen feilet fremdeles **bare** på rapportens `blocked`-status og gate F `N/A`. Dette er tilsiktet fail-closed. Ikke sett `status: ready` eller gate F `PASS` på grunnlag av de tekniske testresultatene.

**Ny kontroll av fysiske spor og tilstand:** [Oslo kommune – Minneparken](https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/minneparken/) og [Middelalderbyen](https://www.oslo.kommune.no/slik-bygger-vi-oslo/middelalderbyen/) bruker fortsatt framtidsform om sti, formidling og tilrettelegging; dette er ikke en datert ferdigattest per november 2026. [Middelalder-Oslo, september 2025](https://www.middelalder.no/oslo-i-middelalderen/arkeologiske-funn/576-minneparken-og-hallvardskatedralen) og [november 2025](https://www.middelalder.no/middelalderbyen-i-dag/middelalderbeltet/589-minneparken-og-hallvardskatedralen) skiller dokumentert frigjort sørmur og rekonstruert apside fra fortsatt manglende plen/gangsti **på disse datoene**. Ingen inspisert kilde bekrefter tilstanden **3. november 2026**. Gate F forblir `N/A`; behovet er en datert 2026-befaring/tilstandsrapport eller annen etterprøvbar bekreftelse fra ansvarlig forvaltning, med tydelig skille mellom originale murspor, rekonstruksjoner og tilgangstiltak. Moderne bilde uten pålitelig datering eller motividentitet er ikke nok.

**Fresh-main-integrasjon må fremdeles gjøres:** Ved sammenligning 3. november var grenen 41 commits foran og 38 bak `main`, og GitHub markerte PR som `mergeable_state: dirty`. Begge sider har endringer i `data/fagverk/fagverk_registry.json` og `data/fagverk/fagverk_release.json`. Bevar både Minneparken- og de nye `main`-registreringene, regenerer deterministiske avledninger, og kjør endelig CI på **ny** head etter konfliktløsning. Ingen merge, deploy eller oppgradering til `v1`/`vFerdig`/V3 `complete` er godkjent av denne kontrollen.

## Staged fullquiz og QuizCard – kildekontrollert, ikke publisert (3. november 2026)

- **Kilde- og påstandsbank:** `data/quiz/production_briefs/historie/minneparken_gamlebyen.json` er opprettet med fem gjennomgåtte kilder og 21 kilde-/emneforankrede påstander. `profile_decision.profile = narrow`, `3 × 7`, men `confirmed: false` inntil full faglig og teknisk slutt-QA. De siste påstandene beskriver kun *daterte* observasjoner fra 2025, ikke nåtilstand i 2026.
- **Fagmanifest og kontekst:** Målet er registrert under `historie.quizProduction.targets` i `data/fag/fag_manifest.json`. Den kanoniske kontekstbyggeren lastet de sju obligatoriske fagfilene, genererte `data/quiz/production_context/historie/minneparken_gamlebyen.json` og bestod `--check` i [Actions #41581241849](https://github.com/Paradispartiet/History-Go/actions/runs/41581241849). **Kildebanken ble senere revidert; oppdatert kontekst ble regenerert og kontrollert mot den siste kildebanken i Actions #41582069626 (forsøk 3, bestått).**
- **Fullquiz-kandidat:** `data/quiz/historie/minneparken_gamlebyen_sets.json` har tre sett à sju kildebundne spørsmål. Første 14 er normale spørsmål uten teori-/metodebinding; siste sett kombinerer vern, rekonstruksjon og datert kildekritikk. Etter innholdsrevisjon: **12 fakta (57,1 %), 5 sammenheng (23,8 %), 4 begrep/metode (19,0 %)**. Alle fire lagrede fasitposisjoner er brukt, og runtime-shuffle må fortsatt testes.
- **QuizCard-kandidat:** `data/quizcards/historie/minneparken_gamlebyen_quizcard_v1.json` speiler ti utvalgte spørsmål og fasiter fra fullquizen. `tests/minneparken-quiz-source-parity.test.mjs` kontrollerer 21/21 påstander, åpningsregelen, kilde-/answer-paritet og QuizCard. En selvstendig in-memory konsistenskontroll bestod. Den fullstendige målrettede Actions-auditen #41582069626 (forsøk 3) bestod med 0 Minneparken-feil i context/progression/theory og bestått streng quiz-innholdskontroll.
- **Aktiveringsporten er lukket:** Verken `data/quiz/manifest.json` eller `data/quizcards/historie/manifest.json` er endret for Minneparken. Alle spørsmåls `knowledge_link_status` er `pending`; canonical Knowledge-synk, uavhengig innholdsgjennomgang, QuizCard-runtime-flip og mobil-/desktop-browser-QA gjenstår. Gate G er `N/A`, ikke `PASS`. Gate F og Historie `status: blocked` er uendret.
- **Målrettet sluttkontroll:** [Actions #41582069626](https://github.com/Paradispartiet/History-Go/actions/runs/41582069626) (forsøk 3) fullførte med `success`: rebuild/--check, tre Node-kontrakter, svarposisjons-audit, isolert streng innholdsaudit og repoets canonical context/progression/theory-validatorer. Disse tre rapporterte hver 0 Minneparken-feil og 0 andre feil i denne kjøringen. Ingen globale validatorregler er lempet på.

## Fullført målrettet quiz-audit – fortsatt ikke publisert (3. november 2026)

- [GitHub Actions #41582069626, forsøk 3](https://github.com/Paradispartiet/History-Go/actions/runs/41582069626): **success** etter retting av to faktiske quizavvik i innholdet (klassifisering av parkskille som sammenhengsspørsmål og `guidance_basis` på metodespørsmål 21). Det ble **ikke** endret validatorregler.
- Canonical `quiz:context`-bygg og `--check`: bestått. Generert `data/quiz/production_context/historie/minneparken_gamlebyen.json` er regenerert etter siste kilderevisjon; 21 source-claims er byte-for-byte like `claim_bank` i konteksten, med planlagt `narrow_3x7` og `opening/bridge/final`.
- `node --test tests/minneparken-quiz-source-parity.test.mjs`: **3 av 3** bestått, med kilde-, fasit-, QuizCard- og metode-/teorimetadata-paritet.
- Canonical answer-position-audit og isolert `audit-quiz-content-quality --strict`: **bestått**. Innholdsfordelingen er 12 fakta (57,1 %), 5 sammenheng (23,8 %) og 4 begrep/metode (19,0 %). Ingen påvist mistenkelig svarlengde, gjentatte åpninger eller forbudte teorimaler i isolert målpakke.
- Repoets canonical `auditQuizProductionContext`, `auditQuizProgression` og `auditQuizTheoryBinding`: **0 feil i hver**. Disse ble kjørt uten svekkelse av reglene; andre repoavvik ville vært synlige separat. Resultatene er integritets-/innholdsbevis, **ikke** full runtime-godkjenning.
- Midlertidig `.github/workflows/minneparken-quiz-context-temp.yml` ble slettet etter vellykket kjøring, slik at den ikke inngår i endelig PR-diff.
- **Gjenstående sperrer:** `knowledge_link_status: pending` på alle 21 spørsmål; ingen aktiv quiz- eller QuizCard-manifestoppføring; profilens `confirmed: false`; uavhengig kildereview og ekte quiz-/QuizCard-flip i mobil/desktop mangler. Gate G forblir `N/A`, gate F `N/A`, Historie `status: blocked`. Bildeproveniens, fysisk tilstand 2026, gate H, fresh-main-replay og full ordinær PR-CI mangler. Ingen v1/vFerdig/merge/deploy.

## Story, History gate H og publiseringssperre – etterkontroll 3. november 2026

- **Uavhengig Story-kandidat:** `data/stories/stories_minneparken_gamlebyen.json` inneholder ett stedfestet `episode_v1`-utkast, «Da lokket som vernet ruinene, ble tatt bort», med 2024 som primært tidsanker og tre kontrollerte kildelenker. Fortellingen følger spenningen mellom ruinvern og synliggjøring under E18-dekket, skiller frilagt eldre mur fra nyere rekonstruert apside og avgrenser statusuttalelser til november 2025, ikke 2026.
- **Maskinkontroll:** `tests/minneparken-story-candidate.test.mjs` kontrollerer episode-v1-feltene, kilde-URL-paritet med gjennomgått Minneparken source brief, maskinberegnet Story-score (19) og manifest-/Historie-sperre. [GitHub Actions #41583940933](https://github.com/Paradispartiet/History-Go/actions/runs/41583940933) fullførte med **success** for Story-kandidat og gjentatt quiz-/release-guard-test. Den separate [#41583522432](https://github.com/Paradispartiet/History-Go/actions/runs/41583522432) bestod også release guard.
- **Ikke aktiv:** Ingen registrering i `data/stories/stories_manifest.json` eller `data/stories/stories_episode_v1_manifest.json`. En fil som ikke er manifestregistrert, er ikke en aktiv Story. Den uavhengige narrative storytesten, full `check:stories`, interaktiv runtime-QA og redaksjonelt endelig innholdsvalg gjenstår. Historie-gate H beholder `N/A`; gate G `N/A` og gate F `N/A` står også uendret.
- **Rydding:** Midlertidig skrive-workflow for quizkontekst og de midlertidige, lesende release-/Story-test-workflowene er fjernet etter testkjøringene. Faste, målrettede testfiler er bevart for videre QA. Ingen merge, deploy eller `ready`-oppgradering er foretatt.

## Isolert Knowledge/Story-integrasjon og deterministiske kandidat-ID-er – 3. november 2026

- **Riktig Knowledge-kildeformat:** Den kanoniske generatoren leser spørsmålets `sources`-objekter (ikke bare `source_urls`). Fullquizens 21 spørsmål og QuizCard-kandidatens 10 utvalgte spørsmål har derfor eksplisitte `sources`-objekter med etterprøvd `source_id`, tittel, HTTPS-URL og `claim_basis`, i paritet med den gjennomgåtte briefen. `tests/minneparken-quiz-source-parity.test.mjs` tester nå URL-/påstandsparitet og deterministic SHA-256-KU-ID-beregning.
- **Ekte, isolert canonical Knowledge-prøve:** I [Actions #41586343590](https://github.com/Paradispartiet/History-Go/actions/runs/41586343590) ble Minneparken midlertidig lagt inn i quizmanifestet i en **disponibel Git-worktree**. `node --experimental-strip-types scripts/knowledge-canonical-data.mts --write` genererte der 32 unike Knowledge-enheter for 21/21 spørsmål. Isolert etterkontroll fant 32/32 eksterne kilde-URL-er representert, 21/21 tilknyttede quiz-referanser, 0 Minneparken-feil og 0 globale Knowledge-kontraktsfeil i den testkopien. Originaltestens [ID-kart og kildedokumentasjon](https://github.com/Paradispartiet/History-Go/actions/runs/41586343590/artifacts/13208275876) er bevart som Actions-artefakt.
- **Forberedte, men inaktive ID-er:** De 32 deterministiske KU-ID-ene fra generatorprøven er lagt inn i `primary_knowledge_unit_id` og `knowledge_unit_ids` for 21 fullquizspørsmål, speilet i ti QuizCard-spørsmål. **`knowledge_link_status` er fortsatt `pending` i både quiz og kort**, fordi de 32 enhetene **ikke** finnes i det aktive committed Knowledge-registeret. Verken quiz- eller QuizCard-manifestet er aktivert. Denne avgrensningen hindrer at forhåndsberegnede ID-er omtales som sluttførte Knowledge-lenker.
- **Ny deterministisk kontroll på prebundne ID-er:** [Actions #41586989803](https://github.com/Paradispartiet/History-Go/actions/runs/41586989803) fullførte med `success`. Den nye SHA-256-/split-claims-testen bestod, og en ny isolert canonical generator/review ga nøyaktig samme 21 spørsmål, 32 unike enheter, 32/32 etterprøvbare kilderelasjoner, 21/21 registreringsreferanser og 0 kontraktsfeil. Kunnskapsrapporten hadde fortsatt **4707 advarsler og 451 unresolved emne links på tvers av hele den midlertidige samlede quizdatabasen**; disse er ikke identifisert som nye Minneparken-feil og ble ikke dempet.
- **Full Story-integritetsprøve:** [Actions #41586542715](https://github.com/Paradispartiet/History-Go/actions/runs/41586542715) kjørte repoets fullstendige `tools/check_stories_integrity.mts` etter **midlertidig** aktivering av Minneparken-kandidaten i begge Story-manifestene i en disponibel worktree. `Stories integrity OK` (full katalog) bekrefter at den validerte `episode_v1`-kandidaten integreres strukturelt med gyldig sted og type. De virkelige Story-manifestene er ikke endret.
- **Videre sperrer og redaksjonell port:** Kildereview må fortsatt være uavhengig, canonical Knowledge-registry må synkroniseres på en kontrollert *reell* manifestaktivering etter godkjent release, og fullquiz/QuizCard-flip og Story må gjennom interaktiv browser-/mobil-/desktop-QA. Gate F krever ny datert dokumentasjon av fysisk tilstand; G og H kan ikke få `PASS` av en isolert prøve alene. Historie `status: blocked`, porter F/G/H `N/A`, PR draft, ingen merge eller deploy. Midlertidige preview-workflows er fjernet etter fullførte tester.


## Interaktiv fullquiz-/QuizCard-QA og historisk bildesynk (3. november 2026)

- **Ekte browser-QA for kandidaten:** [Actions #41587943304](https://github.com/Paradispartiet/History-Go/actions/runs/41587943304), *forsøk 2*, bestod etter retting av en feil i testens skjulte `innerText`-avlesning (ingen sluttregel ble endret). `scripts/verify-place-quiz-browser.mjs minneparken_gamlebyen` spilte gjennom alle **21 spørsmål over 3 sett**, verifiserte fullføring/belønning og uendret fysisk besøksstatus på **desktop og mobil**. `scripts/verify-minneparken-quizcard-real-browser.mjs` fant alle 10 spørsmål og fasitsvar, og verifiserte kortflipp, forstørrelse, Escape, Enter og Space på begge skjermstørrelser. Bevis: [artefakt #13209326815](https://github.com/Paradispartiet/History-Go/actions/runs/41587943304/artifacts/13209326815).
- **Ufravikelig avgrensning:** Quiz, QuizCard og Knowledge-registrering ble kun lagt inn i en disponibel test-worktree. Den virkelige `data/quiz/manifest.json`, `data/quizcards/historie/manifest.json` og Knowledge-registry står urørt. Begge kandidatene beholder `knowledge_link_status: pending` til 32 kanoniske enheter er registrert og endelig redaksjonell aksept er dokumentert.
- **Historisk foto er kildekontrollert og integrert:** [Actions #41589236323](https://github.com/Paradispartiet/History-Go/actions/runs/41589236323) committet original-JPEG `bilder/places/minneparken_gamlebyen_2007.jpg` (**Helge Høifødt, 15. juli 2007, public domain / PD-self**) samt `image`, `cardImage`, `imageMeta.historicalOnly`, synlig datert `historicalCaption` og kreditering i Minneparkens stedfil. [Fotoskilde-/lisensaudit](minneparken_gamlebyen-photo-license-20261103.md).
- **Oppdaget og rettet runtime-indeksfeil, uten å senke krav:** Før den kanoniske indeksen var gjenbygd feilet den nye bilde-browserkontrollen i [Actions #41589585887](https://github.com/Paradispartiet/History-Go/actions/runs/41589585887), forsøk 1. Appen brukte `data/places/places_index.json`, ikke direkte redigert stedfil, og indeksbyggeren lot `imageMeta` falle bort. Både `tools/build_places_index.mts` og `tools/check_places_index_sync.mts` er endret til å videreføre `imageMeta`. [Actions #41590135371](https://github.com/Paradispartiet/History-Go/actions/runs/41590135371) bestod `npm run places:index:build`, full streng `npm run places:index:check`, bilde-/indeks-/Historie-test og kildeparitet; deretter committet den **kun** generert `places_index.json`.
- **Visuell retest med faktisk app bestått:** [Actions #41589585887](https://github.com/Paradispartiet/History-Go/actions/runs/41589585887), forsøk 2, bestod: `naturalWidth: 3072`, synlig datering 2007/kontekst 2024 og frontfoto på mobil/desktop, QuizCard-flipp/forstørrelse/keyboard og fullquiz 21 spørsmål med belønning uten fysisk besøksregistrering. [Skjermbildeartefakt #13210245690](https://github.com/Paradispartiet/History-Go/actions/runs/41589585887/artifacts/13210245690). Manuell skjermbildevurdering oppdaget en visuell kollisjon mellom kildedatering og `TAKE QUIZ`; CSS ble rettet i `css/placeCard.css`. **Siste [Actions #41591420607](https://github.com/Paradispartiet/History-Go/actions/runs/41591420607) bestod også en geometrisk test som krever minst 5 px avstand mellom dateringsetikett og quizknapp på mobil og desktop**, pluss en ny komplett gjennomspilling av de 21 spørsmålene og QuizCard (artefakt [#13210506406](https://github.com/Paradispartiet/History-Go/actions/runs/41591420607/artifacts/13210506406)). Visuell plassering kontrollert mot skjermbilder.
- **Åpne porter:** Historie F `N/A` pga. ingen datert dokumentasjon på parkens fysiske ferdigstatus i november 2026; Historie G `N/A` pga. uaktivert canonical Knowledge-registry og produksjonsmanifest; H `N/A` pga. ikke publisert Story og uavhengig redaksjonell sluttport. Historie `blocked`, PR `draft`, konflikt med oppdatert `main`, og ingen merge eller deploy.


## Semantisk integrasjonsforberedelse mot main (3. november 2026)

- **Virkelig konfliktinventar, ingen merge:** [Actions #41593423672](https://github.com/Paradispartiet/History-Go/actions/runs/41593423672) kjørte `git merge --no-commit origin/main` i lesende QA etter å ha satt eksplisitt Git-committeridentitet. Git fastslo **6 konflikter** mot `main@698db300f613afb9a4d90ac7610d08091b26c51c`: `data/epoker/epoke-place-index.json`, `data/fagverk/fagverk_registry.json`, `data/fagverk/fagverk_release.json`, `data/leksikon/sprak/manifest.json`, `data/places/places_index.json`, `data/runtime/nature-all/flora-001.json`. [Konfliktpatcher og logg](https://github.com/Paradispartiet/History-Go/actions/runs/41593423672/artifacts/13211481466) er lagret. Første [#41593247320](https://github.com/Paradispartiet/History-Go/actions/runs/41593247320) var **ikke** gyldig konfliktbevis (`git merge` stoppet med exit 128 på manglende committeridentitet); dets opprinnelige 0-registrering er eksplisitt forkastet.
- **Semantisk kildefletting:** [Actions #41593860320](https://github.com/Paradispartiet/History-Go/actions/runs/41593860320) bestod eksakt konfliktguard, og produserte foreningsmengde av kanoniske oppføringer i en disponibel arbeidskopi: Fagverk-registeret hadde 290 lenker på PR, 291 på main og **292 forente lenker**, inkludert `minneparken_gamlebyen`, `oslo_prosjektrom` og `fotogalleriet`. Språk-manifestet hadde 113 filer på hver gren og **114 forente filer**, inkludert `minneparken_gamlebyen` og `toyenbadet`. Ingen eksisterende felles oppføring ble overskrevet.
- **Genererte filer:** Den isolerte mergetesten bygget `data/places/places_index.json` gjennom `npm run places:index:build` + strikt `places:index:check`, `data/epoker/epoke-place-index.json` via `epoker:places:build` + `epoker:places:check`, og `data/fagverk/fagverk_release.json` gjennom offisiell `scripts/build-fagverk-release-manifest.mjs` + `--check`. Alle disse bestod. `data/runtime/nature-all/flora-001.json` ble hentet fra nyeste main i testkopien etter en eksplisitt kontroll av at verken gren hadde en Minneparken-referanse i filen. Dette er **ikke** en generell global runtime-godkjenning.
- **Fagporter og app:** Målrettede photo/source-/quiz-/Story-kontrakter, `npm run check:stories` og blokkert F/G/H bestod i isolert mergetest. En separat [browser-retest #41594130733](https://github.com/Paradispartiet/History-Go/actions/runs/41594130733) kjører i samme type isolert, semantisk flettet app for å avdekke PlaceCard-/Fagverk-/QuizCard-/fullquiz-regresjoner før eventuell integrasjonscommit.
- **Release-status:** Denne dokumenterte statusen tillater ikke å omtale PR som mergebar eller innhold som publisert. Fram til kontrollert faktisk grenmerge og slutt-CI er PR draft/dirty, Historie `blocked` og F/G/H `N/A`. Ingen eksisterende validatorgrenser eller publiseringsmanifest er endret i konfliktinventaret/testflettingen.


## Endelig teknisk sluttkontroll – nye kanoniske Knowledge-lenker og oppdatert main (3. november 2026)

Denne delen **erstatter teknisk foreldede statusformuleringer i tidligere kontrollrunder** (særlig «Knowledge pending», «ikke synkronisert register» og «uløste Git-konflikter»). Historiske feillogger og revisjonsspor er beholdt.

- **Kanonisk Knowledge er nå virkelig synkronisert i draft, ikke bare forhåndsberegnet:** Den offisielle generatoren bruker gjennomgåtte Minneparken-påstander som ikke-spillbar Knowledge-kilde. Alle 21 spørsmål og alle ti QuizCard-kopiene har `knowledge_link_status: linked`; globalt Knowledge-register inkluderer 32 unike, faktisk kildekoblede `ku_historie_…`-enheter. Gjentatt `knowledge:canonical:check` og testsperrer bestod i [Actions #41608081923](https://github.com/Paradispartiet/History-Go/actions/runs/41608081923), med 0 kontraktsfeil og øvrige katalogadvarsler beholdt. Commit [0c8ff446](https://github.com/Paradispartiet/History-Go/commit/0c8ff446bee4e3926e9b6b0cc569eb603389bd92) skrev bare generatorens avtalte register, kandidatdata og rapporter. `data/quiz/manifest.json` og QuizCard-manifestet ble ikke aktivert.
- **Siste kontrollert main-fletting på draft-grenen:** [Actions #41608954142](https://github.com/Paradispartiet/History-Go/actions/runs/41608954142) verifiserte eksakt innkommende main-endringsmengde, flettet fast Git-snapshot, regenererte Fagverk-release med den offisielle byggekoden og bestod Places, Epo­ker, Fagverk, full canonical Knowledge, Story-integritet, Minneparken-/Tøyenbadet-/Civication-tester og browsergjennomspilling på både mobil og desktop. Fullquiz **21/21**, QuizCard **10/10**, kildebelagt historisk frontfoto og ingen falske fysiske besøk ble bekreftet. Integrasjonen ble pushet **kun til PR-grenen** i [merge-commit d00f76f](https://github.com/Paradispartiet/History-Go/commit/d00f76f57c88ab58d43119a7326996a7dd468aea). PR er fortsatt draft; en helt fersk main-commit etter snapshotet kan skape ny divergens uten å ugyldiggjøre det testede snapshotet.
- **Rydding:** Midlertidige sync-/main-flette-workflows er fjernet etter testgjennomføring. Permanente kilde-, Knowledge-, foto-, QuizCard- og Story-tester er beholdt.
- **Beslutning: HOLD, ikke release.** Historie `status: blocked`, porter A–E `PASS`, F/G/H `N/A`. Gate F mangler dokumentert fysisk 2026-tilstand. G og H mangler uavhengig redaksjonell signatur og eksplisitt Story-/quiz-aktivering. Se den separate, oppdaterte [release- og overleveringsbeslutningen](minneparken_gamlebyen-release-readiness-20261103.md) med konkrete akseptkriterier. Ingen produksjonsmanifestaktivisering, merge til main eller deploy er utført.

