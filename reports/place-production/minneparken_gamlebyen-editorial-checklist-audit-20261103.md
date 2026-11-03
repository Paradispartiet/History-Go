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
