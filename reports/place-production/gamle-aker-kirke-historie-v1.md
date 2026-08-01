# Gamle Aker kirke – Historie-sted V1

- Dato: 2026-08-02
- Place ID: `gamle_aker_kirke`
- Canonical place-fil: `data/places/historie/oslo/places_historie/gamle_aker_kirke.json`
- Manifest: `data/places/manifest.json`
- Primærkategori: `historie`
- Stedstype: stående middelalderkirke i fortsatt bruk
- Status: **fase 0 – nullmåling klar for review; stedet er ikke produksjonsklart**

## Arbeidskort

| Felt | Status ved nullmåling |
| --- | --- |
| Hva place-objektet representerer | Det fysiske kirkebygget Gamle Aker kirke i Akersbakken 26, med dokumenterte endringer, bruk og materielle spor på originalstedet. Kirkegården, Akersbergets gruver, menigheten, tidligere eiere og nærområdet er relaterte objekter, ikke synonymer for kirken. |
| Kategori | `historie` er riktig hovedidentitet. Kirken er et stående materielt spor med dokumentert institusjons-, bruks- og bevaringshistorie. |
| Underbadges | `middelalder`, `kulturminner_og_bevaring`; må beholdes bare dersom category-/badgekontrollen fortsatt løser begge ID-ene. |
| Historie-emner | `em_his_kirke_kloster_middelalder`, `em_his_middelalder_oslo`, `em_his_spor_materialitet`, `em_his_kulturminner_bevaring`; alle fire skal revideres mot stedsspesifikk evidens i Historie-rapporten. |
| Historie-evidens | Canonical case `case_his_gamle_aker_kirke` og flere claims/evidence-lenker finnes allerede i Historie-registeret, blant annet om Nonneseter-eierskapet, Aker som landlig sogn og kirken som materielt retts-/institusjonsspor. |
| Koordinat | `verified`, offisiell adressekoordinat for Akersbakken 26; `locatorType: building`, `coordRole: display_marker`. Ingen koordinatendring planlegges. |
| Description-pakke | Mangler. `desc` og `popupDesc` er omfattende, men har ingen aktiv 4.2-pakke med claim-dekning, teksthash og review. |
| Leksikon | Aktiv hovedrecord finnes, men den har bare ett fakta- og ett chronology-punkt; begge har tomme kildelister. |
| Rundingsprofil | Vanlig sted: fast `people · objects · brands`, med Badges ved overskriften. Legacy rundingsfelt skal ikke innføres. |
| People | Tre dokumenterte koblinger er funnet: Heinrich Ernst Schirmer, Wilhelm von Hanno og Torvald Moseid. Bare von Hanno har bilde; People-rundingen er derfor ikke visuelt ferdig. |
| Objects | Ingen ferdig, canonical Objects-pakke for stedet er funnet. Prekestol, døpefont, klokker, glassmalerier og eventuelle andre fysiske objekter er bare kandidater inntil identitet, kilde og bilde er kontrollert. |
| Brands | Ingen kvalifiserende canonical Brand med dokumentert stedskobling er funnet. Institusjoner, menighet, arkitekter og kunstnere skal ikke brukes som filler. |
| Badges | Kategori og underbadges finnes i place-data; faktisk badgegrafikk og fagverksnavigasjon må UI-kontrolleres i en senere fase. |
| Quiz | Én manifestlastet fil med ett sett og fem spørsmål. Alle fem er Knowledge-linket, men normalåpningen på 2 × 7 mangler; spørsmål 4 går allerede over i synlig metodespråk. |
| Story | Én Story finnes: `st_gamle_aker_kirke_fossiler`. Den har tre eksterne kilder, men er en forklarende natur-/materialhistorisk tekst uten tydelig episodekonflikt eller transformasjon og må vurderes mot gjeldende Story-kontrakt. |
| Knowledge | De fem eksisterende quizspørsmålene har `primary_knowledge_unit_id`, `knowledge_unit_ids`, `concept_ids` og `knowledge_link_status: linked`. Dette er delvis dekning, ikke en ferdig quiz-/Knowledge-fase. |
| Hovedbilder | `image` og `cardImage` er tomme. Ingen ferdig hovedbilde-/kortbildepakke er dokumentert i place-filen. |
| Dagens spor | Kirken beskrives som stående og fortsatt i bruk, men den ferske nåtidskontrollen og skillet mellom middelaldermur, senere restaureringer og dagens kirkerom skal dokumenteres i Historie-produksjonsrapporten. |

## Canonical identitetsgate

Nullmålingen finner ingen grunn til å opprette et nytt sted eller splitte place-ID-en.

`gamle_aker_kirke` skal representere **kirkebygget på originalstedet**, ikke:

- Gamle Aker menighet som organisasjon;
- Gamle Aker kirkegård som helt område;
- Akersbergets gruver;
- Ytteborgs underjordiske lagerhaller;
- hele Akerryggen eller det historiske Aker;
- en tradisjon om en eldre trekirke eller førkristent tingsted uten tilstrekkelig dokumentasjon.

Relaterte rom og landskapslag kan omtales når kilden dokumenterer den fysiske forbindelsen og teksten beholder dette skillet.

## Faglig nullmåling etter Historie-gatene A–H

| Gate | Status | Nullmåling |
| --- | --- | --- |
| A – historisk identitet og stedstilknytning | DELVIS | Place-identiteten er tydelig, og bygget står fysisk på stedet. Periodeangivelsen spriker mellom «omkring 1100» i teksten og `year: 1150`; presisjon og formulering må kildekontrolleres. |
| B – canonicale Historie-emner | DELVIS | Fire `em_his_*` finnes, men dagens place-fil dokumenterer ikke én inspectable evidenskjede per emne. Existing canonical case/claims/evidence kan gjenbrukes der scope faktisk passer. |
| C – tidsforløp, brudd og kontinuitet | DELVIS | Place-filen har mange `history_layers`, men Leksikon har bare ett udokumentert chronology-punkt. Bygging, eierskifter, brann, rivningstrussel, restaureringer og fortsatt bruk må skilles og kildebelegges. |
| D – aktører, interesser, makt og konflikt | DELVIS | Kloster, kirkelige og kommunale eiere, private eiere, arkitekter og brukere nevnes, men interesser og maktposisjoner er ikke analysert samlet. Påstanden om «reddet fra riving» må dokumenteres presist. |
| E – kildekritikk og proveniens | IKKE BESTÅTT | Place-filen viser kildenavn, men ikke URL, konkret kildeplassering, proveniens og begrensning for vesentlige claims. Leksikonets fakta og chronology har tomme kildelister. |
| F – lokal og større skala | DELVIS | Teksten kobler kirken til middelalderbyen, Aker, kloster, kommune og bybevaring, men skalaene er ikke kildekritisk avgrenset. Ett bygg kan ikke alene representere hele middelalderen eller all kirkehistorie. |
| G – usikkerhet og dagens fysiske spor | DELVIS | Research-notatene holder tre usikre tradisjoner tilbake, som er bra. Derimot mangler en fersk, inspectable kontroll av hva som er middelaldersk, senere endret og synlig i dag. |
| H – vanlig quizåpning og chronology/Stories | IKKE BESTÅTT | Quiz har 5, ikke 14, åpningsspørsmål. Chronology er for tynn og Storyen må vurderes som egen narrativ episode, ikke som utvidet faktaforklaring. |

Som ekstra pilotkontroll gjenbrukes tre gode ideer fra den lukkede, feilplasserte PR #4646 uten å gjeninnføre dens alternative schema: canonical profile/case/claim/evidence skal kryssrefereres i arbeidsgrunnlaget, inferensgrenser skal skrives eksplisitt, og antall ordinære faktaspørsmål i de første 14 skal telles.

## Popup-nullmåling

| Fane | Status | Begrunnelse |
| --- | --- | --- |
| Om | IKKE GODKJENT | `desc`/`popupDesc` og mange strukturerte felt finnes, men 4.2-pakken, claim-dekningen, redaksjonell review og hovedbilder mangler. |
| Historie | DELVIS | Place `history_layers` er rik, men aktiv chronology består av ett punkt uten kilder. Historiske lag, daterte hendelser og senere restaureringer er ikke ryddet mot hverandre. |
| Fortellinger | DELVIS | Én kildebelagt tekst om fossiler finnes. Den må enten bestå Story-gaten som selvstendig narrativ idé eller flyttes til en bedre eid kunnskapsflate uten tap av kildene. |
| Før/etter | MANGLER | Ingen canonical `for_na`-pakke eller kontrollert bildepar er funnet. |
| Nyheter | MANGLER | Ingen daterte, ferskverifiserte nyhets-/driftsrecords for stedet er funnet. |
| Lesespor | MANGLER | Ingen eksplisitt stedskoblet, åpen Lesespor-pakke er funnet. |
| Kilder | IKKE GODKJENT | Leksikon `sources` er tom. `source_summary.safe_sources` består hovedsakelig av kildenavn og interne History Go-data, ikke en brukerrettet, deduplisert HTTPS-liste. |
| Mer | DELVIS | Leksikon har korte tolkningspunkter, men de mangler kilder. Ingen ferdig Språkleksikon-/observasjonspakke er dokumentert, og Wonderkammer skal ikke gjeninnføres som ny flate. |

## Sanerings- og produksjonsplan

### Behold inntil videre

- canonical place-ID, source-fil, kategori og koordinatmetadata;
- de fire `em_his_*` som arbeidshypotese, med krav om stedsspesifikk evidens;
- eksisterende canonical Historie-case, claims og evidenslenker når scope og kildegrunnlag passer;
- de tre identifiserte People-koblingene, men ikke som visuelt ferdige før bilde- og profilkontroll;
- de fem eksisterende quizspørsmålene og Knowledge-lenkene som revisjonsgrunnlag, ikke automatisk som ferdig innhold;
- Storyens tre eksterne kilder selv dersom teksten må omskrives, flyttes eller avvises som Story.

### Omskriv eller bygg på nytt

- `desc` og `popupDesc` etter Place Description 4.2, med claims, kildelokasjoner, hash og to reviews;
- Leksikon-fakta og chronology med konkrete kilder og kildeplasseringer;
- Historie-produksjonsrapporten med tidsforløp, aktører, kildesammenligning, skala, usikkerhet og dagens spor;
- normal quizåpning til 2 × 7 ordinære, stedsspesifikke spørsmål før metode-/teorifordypning;
- Knowledge-materialisering etter at quizinnholdet er reviewet;
- Story bare dersom en egen narrativ akse kan dokumenteres.

### Fjern eller hold tilbake fra brukerflaten

- tidligere trekirke, Olav Kyrre-grunnleggelse og førkristent tingsted så lenge sterkere kilder mangler;
- interne History Go-filer som brukerrettede kilder;
- generiske formuleringer der hele middelalderen, kirkeinstitusjonen eller Aker-området flyttes inn i ett bygg uten skalaavgrensning;
- Objects, Brands, People eller popupinnhold som bare er filler.

### Mangler

- komplett ekstern kildebank med minst to ulike kildetyper og konkrete kildeplasseringer;
- ferdig Historie-produksjonsrapport;
- godkjent description-pakke;
- hovedbilde og kortbilde med lisens/attribusjon;
- kildebelagt chronology;
- avgjørelse om Story;
- Før/etter;
- Nyheter;
- Lesespor;
- brukerrettet Kilder-fane;
- kildebelagt Mer-innhold;
- 14-spørsmåls normalåpning og full Knowledge-synkronisering;
- bildeklare People, reelle Objects og eventuelle kvalifiserende Brands;
- UI-kontroll av PlaceCard, fagverk og alle åtte popupfaner.

## Faseplan

Bare én fase kan være aktiv om gangen. Hver godkjente fase skal merges og kontrolleres på fersk `main` før neste starter.

| Fase | Leveranse | Status |
| --- | --- | --- |
| 0 | Nullmåling, identitetsgate og saneringsplan | **PÅGÅR – dette dokumentet** |
| 1 | Kildebank, Historie-rapport, description 4.2, bilder og Om | IKKE STARTET |
| 2 | Kildebelagt chronology og Historie-fane | IKKE STARTET |
| 3 | Story-review og eventuell episodeproduksjon | IKKE STARTET |
| 4 | Før/etter | IKKE STARTET |
| 5 | Nyheter | IKKE STARTET |
| 6 | Lesespor | IKKE STARTET |
| 7 | Brukerrettede Kilder | IKKE STARTET |
| 8 | Mer | IKKE STARTET |
| 9 | Quizåpning 2 × 7 og Knowledge | IKKE STARTET |
| 10 | People, Objects, Brands og Badges/rundinger | IKKE STARTET |
| 11 | Full audit, UI-kontroll og produksjonsklarhetsavgjørelse | IKKE STARTET |

## Aktivt filscope

Fase 0 endrer bare:

- `reports/place-production/gamle-aker-kirke-historie-v1.md`

Ingen place-, Leksikon-, Story-, People-, Quiz-, Knowledge-, bilde-, manifest-, runtime- eller validatorfil skal endres i nullmålings-PR-en.

## Ferdigport for fase 0

Fase 0 kan godkjennes når:

1. nullmålingen samsvarer med fersk `main`;
2. canonical identitet og source-fil er entydig;
3. behold/omskriv/fjern/mangler er eksplisitt;
4. popup, rundinger, Quiz, Knowledge og Historie-gatene er vurdert separat;
5. PR-diffen inneholder nøyaktig dette dokumentet;
6. review ikke finner at teknisk eksistens er forvekslet med redaksjonell ferdigstatus.
