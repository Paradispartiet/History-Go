# Minneparken — stedssjekkliste, status 2026-11-03

**Place ID:** `minneparken_gamlebyen`  
**Branch:** `content/minneparken-kildebasert-leksikon-20261103`  
**PR:** #6966 (draft)  
**Samlet status:** **DELVIS IMPLEMENTERT / BLOCKED for merge, ikke v1, vFerdig eller V3 complete**.

## Gjennomførte endringer

1. **Canonical Place:** `data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_11/minneparken_gamlebyen.json` har omarbeidet `desc` og `popupDesc` uten intern History Go-/quiz-/produksjonsprosa. Kildenes lokale byhistorie, parkvedtaket i 1918, planvedtaket i 1928, åpningen i 1932, veiinngrep på 1960-tallet og tilbakeføring i 2024–2025 er bevart og utvidet. Tre relevante, eksisterende underbadges er satt: `middelalder`, `byhistorie`, `kulturminner_og_bevaring`. Verifisert parkgeometri, koordinater og radius ble ikke endret.
2. **Beskrivelse og claim-arbeid:** `data/places/production/minneparken_gamlebyen.json` er opprettet med resolved identitet, 19 claim-poster, kildelokasjoner, 3+16 setningskoblinger, SHA-256-hasher og ti spørsmål som kun er quiz-readiness. **Status er `needs_research`**, ikke `ready_v4_2`, siden full validator og uavhengig review mangler. Disse spørsmålene er ikke en publisert quiz.
3. **Historie-faglig rapport:** `data/places/historie-production/minneparken_gamlebyen.json` dokumenterer kilder, stedseierskap, interessekonflikten i 1918, endringene og usikkerheten. **Status `blocked`**. Gate F (fersk fysisk status), G (fullquiz) og H (canonical chronology/Stories) er åpne.
4. **Fagverk-sted:** Place-eid `history_go_place_fagverk_v2`, `standard`, med egen historisk fagartikkel (211 ord), fire emnekoblede linser, fem undersøkelsesspørsmål, ni begreper, to observerbare spor med tolkningsgrenser og fire eksterne kildeadresser. Smalt indeksledd er føyd til `data/fagverk/fagverk_registry.json`. **Curated er redaksjonell innholdsstatus, ikke bekreftet live side eller full Place-closeout.**
5. **Språkleksikon:** Ny kildebasert stedsspesifikk fil og oppdatert `data/leksikon/sprak/manifest.json`: `Minneparken`, `Ruinparken`, `St. Halvards plass`, `apsis`, `Olavsklostret`. Dialekt er ikke oppdiktet.
6. **Leksikon:** Historisk artikkel supplert, fem stedlige fakta og eksakte kronologipunkter for 1918, 1928, 1932 og 2024. Veibyggingen står som 1960-tall, ikke oppdiktet år.

## Kildegrunnlag og tidsstatus

- [Oslo kommune – Minneparken](https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/minneparken/): katedral, kloster, kirkegård, jernbane, 1932, motorvei, 2024-planer.
- [Oslo byleksikon – Minneparken](https://oslobyleksikon.no/side/Minneparken): stedets navn, lokalbefolkningens park, 1918, 1928, 1932 og Harry Fett.
- [Oslo kommune – Nå blir det mer liv i Middelalderbyen](https://aktuelt.oslo.kommune.no/na-blir-det-mer-liv-i-middelalderbyen) (28. juni 2024): arbeidet med å fjerne betongdekket og planlagt offentlig tilgjengelighet.
- [Middelalder-Oslo – Minneparken og Hallvardskatedralen](https://www.middelalder.no/middelalderbyen-i-dag/middelalderbeltet/589-minneparken-og-hallvardskatedralen), Petter Molaug november 2025: sørmur og apside, manglende sti og plen. **Ikke bevis for november 2026.**
- [Store norske leksikon – apsis](https://snl.no/apsis): fagordets betydning.

## Sjekkliste og status

| Port | Status | Evidens / neste handling |
| --- | --- | --- |
| Canonical Place-identitet og kart | DELVIS PASS | Egne Minneparken-koordinater og `area_anchor` beholdt; full geografisk slutt-QA mangler |
| Badge/underbadge | DELVIS PASS | Historie og tre eksisterende underbadges er valgt etter stedskilder; formell `rule_preflight` mangler |
| `desc`, `popupDesc` og claims | DELVIS PASS | Historieteksten er revidert; 19 claim-koblinger/hashes; canonical validator og separat uavhengig gjennomgang mangler |
| Historie-faglig evidens | BLOCKED | Rapport materialisert som `blocked`; gates F/G/H krever videre arbeid |
| Fagverk-sted | DELVIS PASS | Egen standard-blokk og registry-oppføring finnes; Fagverk release, test og reell browser-QA gjenstår |
| Språkleksikon | DELVIS PASS | Fem navne- og begrepsposter i språkmanifest; faktisk Språk-fane må klikkes/testes |
| Leksikon-kronologi og epoke | DELVIS PASS | Fire kildebelagte leksikonår; canonical chronology/epokeindeks og seertest gjenstår |
| People / Objects / Brands / historiske hendelser | IKKE AVKLART | Source-bounded kandidataudit og eventuelle materialiserte medlemmer med bilder; ingen filler |
| Stedsbilder / `frontImage` | BLOCKED | Ingen dokumentert, faktisk stående PlaceCard-fil og lisensmetadata integrert |
| Quiz / QuizCard / Knowledge | BLOCKED | Ingen fullquiz/QuizCard/flip-paritet materialisert eller vist; kun ti research-spørsmål i packet |
| Runtime og genererte avledninger | **BLOCKED** | `places_index.json`, `data/runtime/place-open/minneparken_gamlebyen.json`, Fagverk release/coverage og eventuelle oversettelser må bygges med canonical scripts, ikke håndrettes |
| CI og browser-QA | **BLOCKED** | Ikke kjørt relevant full node-test/CI-/browserpakke; PR må holdes i draft |

### Bildekandidater (ikke publisert)

- [Ruinparken1.JPG – Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Ruinparken1.JPG), fotograf Helge Høifødt (2007), erklært public domain på Commons. Historisk tidsbilde, ikke en dokumentasjon av utseendet etter 2024. Originalen er liggende.
- [St. Hallvardskatedralen i Ruinparken – Wikimedia Commons](https://commons.wikimedia.org/wiki/File:St._Hallvardskatedralen_i_Ruinparken,_St._Halvards_gate,_Oslo.jpg), fotograf Ssu (2025), CC BY-SA 4.0 på Commons. Aktuelt motiv fra ruinen, men må kvalitetskontrolleres og få selvstendig stående utsnitt med rett attribusjon og lisens ved faktisk publisering.

Ingen av disse er lagt til som `image`/`frontImage`. Hovedbilde og stående bilde skal være ulike, egne bildefiler med proveniens; `cardImage` skal ikke opprettes.

## Utført kontroll

- Alle ti inspiserte JSON-/schemafiler kunne parses.
- `fagverk` har samtlige nødvendige toppfelt, korrekt `standard`-innholdsmengde, resolverte fag-/emne-/kapittel-ID-er i registryet og navngitte `externalLinks` for alle fire kilder.
- Språkmanifestet peker på riktig fil; fem oppføringer har kildeadresser med HTTPS.
- Source-bundne `placeId`-er er like, og 19 beskrivelsessetninger har 19 claimkoblinger.
- Historie-rapportens kilde-ID-er er definert; valgte underbadges finnes i `data/badges/historie.json`.

**Dette er statiske inspeksjoner i GitHub-connectoren.** Node-validatorer, skjemavalidering via Ajv, bygget index/release, faktisk UI og manuelle interaksjoner er **ikke** kjørt.

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
| Teknisk integritet | 2/5 | Statisk parsing/strukturkontroll, men generatorer, indekser og runtime ikke oppdatert |
| Sikkerhet og ansvarlighet | 4/5 | Åpne lisens- og tidsstatusspørsmål er ikke framstilt som godkjent |
| Etterprøvbarhet og vedlikehold | 4/5 | Egen claim-/kilde-/Historie-rapport og source-avgrenset diff; preflight mangler |

**20/30. Ikke godkjent som fullført eller mergeklart.** Ingen UI-, runtime- eller CI-gate kan ersattes med denne rapporten.
