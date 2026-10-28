# Grini fangeleir – redaksjonell og teknisk quiz-audit (2026-10-28)

**Sted:** `grini_fangeleir` · **Kategori:** `historie` · **PR:** #6759 (utkast)  
**Resultat:** `BLOCKED / NOT RELEASE READY`. Dette er **ikke** en attest for full historisk fagfellekontroll, offisiell CI eller aktiv quiz.

**Revisjonsnotat:** Avsnittene nedenfor dokumenterer første audit. Senere rettelser og gjeldende status er samlet i «Checkpoint D» nederst. Ikke bruk den første feiloversikten som nåstatus.

## Omfang og metode

Alle 70 spørsmål i `grini-fangeleir-quiz-full-draft-2026-10-28.json` ble lest gjennom sammen med svaralternativer, svar, forklaring og påstandsgrunnlag. Det ble utført en strukturell, programmatisk krysskontroll mot samtlige 70 påstander i kildebriefen (ID, `claim_basis`, kilde-URL-er via kilde-ID, gjennomgått kildestatus, fasitindeks). Sentrale historiske opplysninger ble kontrollert særskilt mot SNL, Grinimuseet og NOU 1998:12, men **ikke** alle 70 historiske påstander og distraktorer uavhengig etterprøvd mot originaldokumenter.

| Kontroll | Faktisk resultat | Status |
| --- | --- | --- |
| Kildebrief, antall påstander | 70 | Strukturelt kontrollert |
| Redaksjonelt utkast | 10 sett × 7 = 70 | Strukturelt kontrollert |
| Unike spørsmåls-ID-er | 70 | Strukturelt kontrollert |
| Fasitindekser | 24 / 24 / 22 | Strukturelt kontrollert |
| Fasit mot svaralternativer | 70/70 samsvarer | Strukturelt kontrollert |
| Spørsmål mot påstandstekst og URL-er | 70/70 samsvarer etter retting av #69 | Strukturelt kontrollert |
| Bare kilder markert `reviewed` i påstandene | 70/70 | Metadata-kontroll, **ikke** uavhengig kilderevisjon |
| Fagmanifestets mål `historie.quizProduction.targets.grini_fangeleir` | Mangler | BLOCKED |
| Aktiv quiz | Eldre 1 sett × 3 spørsmål | UENDRET |
| Canonical produksjonskontekst | Ikke generert | BLOCKED |
| Knowledge-migrering, runtime-shuffle og quiz-UI | Ikke testet | BLOCKED |
| Offisielle npm-audits og CI | Ikke kjørt her | NOT RUN |

## Redaksjonelle funn

1. **Kildekonflikt ved dato (#69) – presisert i kildebrief og utkast, trenger eventuell dypere kildekontroll.** NOU 1998:12 (kap. 7.2) oppgir at Grini ble **åpnet 12. juni 1941** og at 115 fanger ble overført fra Åneby. Både SNL og Grinimuseet oppgir **opprettelse 14. juni 1941**. Første utkast foreslo uten tilstrekkelig grunnlag at dette gjaldt henholdsvis overføring og formell etablering. Dette ble endret: spørsmålet handler nå om å dokumentere datoavviket, ikke hevde at forklaringen er kjent. Referanser: https://www.regjeringen.no/no/dokumenter/nou-1998-12/id375416/?ch=26 ; https://snl.no/Grini_-_tysk_fangeleir ; https://mia.no/grinimuseet/om-grini-fangeleir.
2. **Gjennomgående repetisjon mellom læringsspor** (redaksjonelt BLOCKED): #19 og #64 tester samme dobbeltelling av protokoller; #5 og #65 gjentar samlet vs. samtidig fangetall; #41 og #66 gjentar hvor de 786 dødsfallene inntraff; #49 og #67 gjentar at ett vitnesbyrd ikke representerer alle; #61 og #70 gjentar at flyttet autentisk brakke ikke fastslår opprinnelig geografi. Kildebankens påstands-ID-er er teknisk unike, men spørsmålene er ikke tilstrekkelig uavhengige. Erstatt, differensier eller bygg reelle sammenligningsoppgaver, uten å innføre ukontrollerte påstander.
3. **Innholdsbalanse** (redaksjonelt BLOCKED): 49 `fact` (70 %), 6 `context` (8,6 %), 13 `analysis` (18,6 %) og 2 `comparison` (2,9 %). Canonical normalt: 50–60 % konkrete fakta, 20–30 % årsak/utvikling/sammenheng, 15–25 % fag/metode/begrep; to første sett skal uansett være normale. Reell innholdsendring og semantisk vurdering må gå foran type-remerking.
4. **Etterbruk (#59) – presisering anbefales:** MiA sier «brukt for landssvikfanger til 1951», mens SNL oppgir at de siste landssvikdømte forlot leiren ved utgangen av 1950. Vurder å spørre om periode/overgang rundt årsskiftet 1950–1951 framfor en tvetydig siste årsangivelse. Referanser: samme museum og SNL som over.
5. **Distraktor-QA** (ikke ferdig): Minst #44 («Vidkun Quisling», «Christian Michelsen» mot Francis Bull) og flere andre har alternativer som er lette å forkaste uten kunnskap om Grini. Utfør en egen lesning av alle 70 for plausibilitet, lengde, historisk presisjon og fravær av utilsiktede hint.
6. **Arkivdetaljer (#21)**: et manglende fangenummerintervall er legitimt kildekunnskap, men bør redaksjonelt vurderes mot mer overførbar kildekritikk på samme plass. Ikke fjern presis arkivinformasjon uten å bevare den i `knowledge`/Knowledge.

## Integrasjonsfunn og risikogrenser

- `data/fag/fag_manifest.json` har `quizProduction` for `historie`, men ikke målregistrering for Grini. Å registrere målet **før** canonical pakke og context-artifact finnes, vil trekke en uferdig quiz inn i produksjonsaudits; utsett registrering til samlet migrasjonstrinn.
- Redaksjonell `source` er skrevet som URL-er; canonical `audit:quiz-production-context` forventer kilde-**ID-er** som peker til `sources`-kartet i quizpakken og `source_brief`. Denne transformasjonen må gjøres deterministisk, uten å miste kildebevis.
- `data/quiz/historie/grini_fangeleir_sets.json` er fortsatt legacy 1×3 med aktive `primary_knowledge_unit_id`, `knowledge_unit_ids` og `concept_ids`. Utkastet **gjenbruker ID-ene** `grini_fangeleir_quiz_1`–`_3` til andre spørsmålsbetydninger. Dette er en konkret risiko for feil progresjons-/Knowledge-kobling. Velg eksplisitt migrasjon/re-ID og verifiser gammel eierhistorikk før aktivering. Ingen nye Knowledge-ID-er må oppgis som eksisterende uten kanonisk synk.
- De to første settene har sju normale spørsmålsflater hver. Dette er gjennomlest redaksjonelt; canonical åpnings- og progresjonstester er **ikke kjørt**.
- NTNU-PDF har fortsatt `partial`; ingen Grini-spørsmål skal baseres på dette som gjennomgått kilde.
- Historisk leir, museets offentlige ankomstpunkt og dagens aktive Ila-fengsel må holdes fysisk adskilt. Ingen aktivitet eller rute skal føre spilleren inn i fengselets sikrede område.

## Nærmeste produksjonsport

1. Rediger det overlappende sluttsettet og kontroller innholdsbalanse, kilder, svar og distraktorer; ta eksplisitt beslutning om #59 og #21.
2. Lås migrasjonstabell for de tre eksisterende spørsmåls-/Knowledge-eierne, inkludert eventuelle nye ID-er og bevaring av allerede genererte Knowledge-enheter.
3. Registrer målet i `data/fag/fag_manifest.json` **sammen med** gyldig canonical quiz og generert `data/quiz/production_context/historie/grini_fangeleir.json`. Kjør `npm run quiz:context -- --category historie --target grini_fangeleir --output data/quiz/production_context/historie/grini_fangeleir.json`; output må komme fra faktisk full inputlast og deterministisk hash, ikke håndkonstruert metadata.
4. Synkroniser/verifiser Knowledge, kontroller åpning, progresjon, shuffle og utvalg i appen.
5. Kjør minst `npm run audit:quiz-content`, `npm run audit:quiz-templates`, `npm run audit:quiz-production-context`, `npm run audit:quiz-progression`, `npm run audit:quiz-theory-binding`, `npm run test:quiz-content-audit`, samt relevante Knowledge-/runtime-/browserkontroller. Lagre eksakt head-SHA og faktiske resultater.
6. Behold PR #6759 som **draft** og stedets status **ikke vFerdig** til alle relevante produksjonsporter og manuell QA er grønn.

### Statusdisiplin

Denne revisjonen har ikke startet offisielle testskript, ikke registrert manifestmålet, ikke skrevet produksjonskontekst, ikke byttet aktiv quizfil og ikke synkronisert Knowledge. Strukturelle lokale API-kontroller er ikke lik canonical CI PASS.

## Checkpoint D – kanonisk staging og teknisk preflight (2026-10-28)

**Status fortsatt BLOCKED for aktivering, men flere tidligere redaksjonelle blokkere er lukket i utkastet.**

### Fullførte endringer i utkast / kildebrief

- **15 redaksjonelle omskrivinger** (#23, #24, #36, #37, #43, #44, #47, #52, #59, #60, #64–67 og #70). De fem opprinnelige repetisjonene i sluttsettet er erstattet av andre kildebaserte oppgaver. Q59 har nå eksplisitt kildeavgrensning ved årsskiftet 1950/51.
- **Metode og teorifordeling:** 12 eksplisitte metodekoblinger først etter den normale 2×7-åpningen, én stedsspesifikt begrunnet teoribinding til Foucault i siste sett. Kanonisk familieprognose: **41 fakta / 17 kontekst / 12 metode-teori** = **58,6 / 24,3 / 17,1 %**. Dette er en strukturell beregning, ikke bevis for semantisk godkjenning.
- **ID-kollisjoner fjernet:** De tre første spørsmålene i nytt utkast heter nå `grini_fangeleir_quiz_v2_01`–`v2_03` og har også nye `quiz_id`-er. Gamle Knowledge-ID-er er kartlagt men **ikke** migrert og må ikke slettes ved regenerering.
- **Faser korrigert mot faktisk kategori-superset:** `opening, middle, middle, middle, middle, middle, middle, bridge, bridge, final`. Tidligere utkast hadde **7 feilmerkede sett** og kildebriefen **49 feilmerkede claim-faser**. Begge er rettet.
- **Kanonisk påstandstaksonomi korrigert:** 26 `claim.family`-verdier endret til kategoriene `fact/context/concept_theory`, fordi kontekstbyggeren avviser `analysis` og fordi `claim.family` må stemme med den faktiske oppgavefamilien. Nå **41 / 17 / 12**.
- **Arkiv-QA:** #21 skiller nå mellom fangenumrene som delvis finnes i parallell protokollrekke og de som mangler helt.

### Ny ikke-publiserende integrasjonskode

`scripts/prepare-grini-quiz-staging.mjs` leser kildebrief, utkast, aktiv legacy-quiz og kategoriens superset. Den stopper ved feil i:
- antall sett/spørsmål, fase eller påstandsrekkefølge;
- fasit, `claim_basis`, `claim.family`, utvalgte fagkoblinger eller kilder;
- uanmeldt/ikke gjennomgått kilde eller kollisjon med de tre aktive spørsmåls-ID-ene;
- manglende 2×7-normalåpning, manglende final metode/teori eller endret 24/24/22-fordeling.

Ved gyldige inputs konverteres redaksjonelle URL-lister deterministisk til kanoniske kilde-ID-er og sett får numerisk `level`. Resultatet er eksplisitt **`STAGING_ONLY_NOT_ACTIVE`**, ikke en aktiv quizpakke, og inneholder ingen påstått `production_context` eller oppdiktede Knowledge-enheter. Valgfri `--output` tillater bare JSON under `reports/place-production/`.

`tests/grini-quiz-staging.test.mjs` har regresjonstester for gyldig 10×7-konvertering, fasit/kilde/ID-eierskap og fail-closed ved korrupte inputs. Testen er tatt inn i `npm run test:quiz-production` og kan kjøres isolert som `npm run test:grini-quiz-staging`.

**Verifisering i denne revisjonen:** Connector-basert strukturkrysskontroll 70/70, fasit 24/24/22, 0 aktive ID-kollisjoner, 0 faseavvik og 0 kildeavvik; **ingen lokal Node-kjøring eller godkjent GitHub CI-resultat er attestert her**.

### Fortsatt harde aktiveringsporter

1. **Eksisterende Knowledge må bevares gjennom reell regenerering:** `scripts/knowledge-canonical-data.mts` genererer registre ut fra filene i `data/quiz/manifest.json`. Hvis gammel 1×3-fil erstattes uten eksplisitt migrasjon eller bevaring, kan de tre eksisterende `ku_`-enhetene forsvinne fra registrene. Ikke merk dette `PASS` basert på en ID-mapping alene.
2. **Canonical context-artifact må bygges:** fagmanifestets `historie.quizProduction.targets.grini_fangeleir` mangler. Registrering, full 10×7-pakke, generert `data/quiz/production_context/historie/grini_fangeleir.json` og fremtidig runtime-manifestoppdatering må utføres i et kontrollert, testbart integrasjonstrinn.
3. **Tester og menneskelig QA:** se faktiske resultater fra `npm run test:quiz-production`, alle kanoniske quiz- og Knowledge-audits, faglig kildekontroll av 70 påstander, mobile/desktop QuizCard-flip, shuffle, progresjon og sikker publikumsadkomst. Ingen testresultater skal gjettes.
4. **PR-styring:** fortsatt draft, ikke merge og ikke vFerdig. Quizstaging har ingen feltinstruksjoner eller ruter inn i dagens Ila fengsel.


## Checkpoint E – tekniske CI-gater dokumentert

[GitHub Actions-kjøring #40692552404](https://github.com/Paradispartiet/History-Go/actions/runs/40692552404) ble fullført med **success** på commit `3d2751ddf50821b8976a89d2cc298fc0334023c4`.

| Teknisk port | Faktisk teststatus | Avgrensning |
| --- | --- | --- |
| `grini-quiz-staging.test.mjs` | PASS, 4 av 4 | Kun kildebrief/utkast/legacy-paritet |
| Full historiekontekst fra sju innganger | PASS | Bygd med midlertidig manifest-overlegg, ikke lagret i PR |
| `auditQuizProductionContext` | PASS | Kun simulert Grini-mål |
| `auditQuizProgression` | PASS | Kun simulert Grini-mål |
| `auditQuizTheoryBinding` | PASS | Kun simulert Grini-mål |
| Canonical Knowledge-generator etter simulert 1×3 → 10×7 | PASS | Tre gamle KU-er, påstandstekster og konseptkoblinger bevart; 70 nye spørsmål fikk lenker i disponibel CI-kopi |
| Integrert PR-head med ny aktiv quiz, fagmanifest og produksjonskontekst | IKKE UTFØRT | Aktiv quiz er fortsatt 1×3 |
| Full historisk redaksjonell signatur og runtime / browser / mobil | IKKE UTFØRT | Fortsatt release-blokkerende |

Den nye Knowledge-bevaringskilden skal **aldri** inn i runtime-quizmanifestet. Den brukes bare av generatoren når den gamle quiz-ID-en har falt ut av de spillbare spørsmålene. Full dokumentasjon: `reports/place-production/grini-fangeleir-quiz-technical-gates-2026-10-28.json`.

**Releasevedtak:** `BLOCKED / NOT vFerdig`. Gamle funn om urettede fasefeil og ID-kollisjoner i rapportens første del er historikk; se Checkpoint D/E for gjeldende teknisk status. Uavhengig kilde- og distraktorreview, atomisk integrasjon og full løpende CI gjenstår.

## Checkpoint F – fasitposisjoner og distraktorrevisjon (2026-10-28)

**Kildekontroll i denne runden:** SNLs artikkel av Frode Færøy (sist oppdatert 6. april 2026), Nasjonalarkivets registreringsveiledning (15. november 2025) og søkbart materiale fra Grinimuseet ble undersøkt på nytt med vekt på kronologi, leiroppbygging, fangetall, arbeidet, avdelingene, frigjøringen og etterbruken. Dette er målrettet kildekontroll, **ikke** uavhengig gjennomgang av alle 70 påstander eller av alle historiske primærkilder.

- **#57 – korrigert totrinns navneovergang.** Først ble «Grini» avløst av betegnelsen «Ihlen fangeleir». Ved fengselsvesenets overtakelse noen uker etter frigjøringen ble navnet «Ilebu fengsel for landssvikdømte». Spørsmålet spør nå eksplisitt etter navnet *ved fengselsvesenets overtakelse* og skiller fasene i Knowledge-forklaringen. Dokumentasjon: https://snl.no/Grini_-_tysk_fangeleir (Etterkrigsårene).
- **#16 – styrket entydighet.** Spørsmålet spør nå hvilke nasjonaliteter SNL oppgir som de største utenlandske gruppene, ikke om hvilke nasjoner noen fanger kunne ha kommet fra. Kilde: SNL (Hvem var fangene?).
- **#36, #44 og #50 – tydeligere faglig plausible distraktorer.** Haft, Francis Bulls fag og frigjøringsdatoen testes med alternativer som i større grad krever historiekunnskap. Kilder: SNL (Fangene som ble isolert, Kulturliv, Frigjøringen).
- **19 ytterligere distraktorer** revidert i **12 spørsmål** (#11, #19, #20, #23, #28, #30, #31, #41, #49, #55, #62 og #70) for å redusere meningsløst absolutte eller åpenbart utenkelige svar. Riktig svar er bevart i alle tilfellene. Enkelte enkle introduksjonsoppgaver kan fortsatt ha pedagogisk enkle distraktorer.
- **Fasitmønsteret var en vesentlig svakhet:** 65 av 70 svarposisjoner fulgte `(spørsmålsnummer−1) % 3`, selv om totalbalansen var 24/24/22. Alle 70 oppgavenes alternativplasseringer ble stokket om redaksjonelt, med fortsatt nøyaktig **24 / 24 / 22**, men nå kun **27 av 70** i det gamle A–B–C-mønsteret. En ny regresjonstest begrenser mekanisk gjentakelse og beskytter #57/#69.
- **Kanonisk kandidat som CI-artefakt:** `scripts/grini-quiz-context-preflight.mjs` kan nå i en disposabel GitHub Actions-run laste opp en full-manifest-generert 10×7-pakke og kontekstartefakt med ekte kildehash til `grini-10x7-full-input-integration-preview`. Filnavnene merkes `CANDIDATE_NOT_ACTIVE` / `FULL_INPUT_PREVIEW` og kan **ikke** behandles som publisert produksjonsdata. Siste dokumenterte artefakt før denne rapportcommiten tilhører GitHub Actions-kjøring [#40696607712](https://github.com/Paradispartiet/History-Go/actions/runs/40696607712), som bestod de tre isolerte CI-jobbene. Nyere commits krever nye eksakt-head-kontroller.

**Uendrede publiseringsporter:** Kildesignatur fra faghistoriker/redaktør på 70 enkeltpåstander og distraktorer, formell vurdering av teoriens pedagogiske rolle, atomisk integrasjon av quiz+fagmanifest+full-input-kontekst, permanent Knowledge-synk, full repository-CI og reell QuizCard-/nettleser-/mobiltest. Aktiv quiz er fortsatt gammel 1×3, og PR #6759 forblir **draft / ikke vFerdig**.
