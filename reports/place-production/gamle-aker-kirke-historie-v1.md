# Gamle Aker kirke – Historie-sted V1

- Dato: 2026-08-02
- Place ID: `gamle_aker_kirke`
- Canonical place-fil: `data/places/historie/oslo/places_historie/gamle_aker_kirke.json`
- Manifest: `data/places/manifest.json`
- Primærkategori: `historie`
- Stedstype: stående middelalderkirke i fortsatt bruk
- Status: **fase 6 – tre åpne og komplementære Lesespor klare for review; stedet er ennå ikke samlet produksjonsklart**

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
| B – canonicale Historie-emner | DELVIS | Fire `em_his_*` finnes, men dagens place-fil dokumenterer ikke én inspectable evidenskjede per emne. Eksisterende canonical case/claims/evidence kan gjenbrukes der scope faktisk passer. |
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
| 0 | Nullmåling, identitetsgate og saneringsplan | **GODKJENT – PR #4647, merge `64a49e4ab978cd6ff062c557e7dc891cc15d710e`** |
| 1 | Kildebank, Historie-rapport, description 4.2, bilder og Om | **GODKJENT – PR #4649, merge `26967843bc8ee20441c313d238bf2b51f85baf23`** |
| 2 | Kildebelagt chronology og Historie-fane | **GODKJENT – PR #4651, merge `75cfe841738fc4d0296868d0b8f2dfe6ba5fe78f`** |
| 3 | Story-review og eventuell episodeproduksjon | **GODKJENT – PR #4652, merge `8ce0bc33263dbbcc7581c9b8316f8a483c60143b`** |
| 4 | Før/etter | **GODKJENT – PR #4654, merge `850c3b3332f857fb98593f36588bc46cfe6945eb`** |
| 5 | Nyheter | **GODKJENT – PR #4656, merge `1ae7d30113134edc26394289a1afce0226f58246`** |
| 6 | Lesespor | **KLAR FOR REVIEW** |
| 7 | Brukerrettede Kilder | IKKE STARTET |
| 8 | Mer | IKKE STARTET |
| 9 | Quizåpning 2 × 7 og Knowledge | IKKE STARTET |
| 10 | People, Objects, Brands og Badges/rundinger | IKKE STARTET |
| 11 | Full audit, UI-kontroll og produksjonsklarhetsavgjørelse | IKKE STARTET |

## Resultat i fase 1

- Fem eksterne kilder dekker fagartikkel, offisiell kirkeinformasjon, kulturminneforvaltning, byleksikon og fersk rehabiliteringsstatus.
- Historie-rapporten kryssrefererer alle fire `em_his_*` til ett stedsspesifikt case med aktører, konflikt, brudd, kontinuitet, skala og kildegrenser.
- `desc` og `popupDesc` er revidert under Place Description 4.2. Nøyaktig byggeår oppgis ikke som sikkert, og det bare steininteriøret beskrives som et restaureringsvalg fra 1950-årene.
- Thomas Blix-inventarets motstridende årfesting er holdt utenfor teksten til en senere objektfase kan løse kildekonflikten.
- Et public-domain-foto fra Wikimedia Commons er lagt inn som hoved- og kortbilde med inspectable lisensmetadata.
- Den feilplasserte, lukkede PR #4646 gjenbrukes bare som audit-idé: case/evidens er kryssreferert, inferensgrenser er eksplisitte, og ordinære faktaspørsmål skal telles i fase 9.
- Historiegate A–G er faglig dokumentert. Gate H står begrunnet som uferdig fordi 2 × 7 quiz, chronology og Story ferdigstilles i egne faser.

## Resultat i fase 2

- Den ene udokumenterte chronology-raden er erstattet med elleve kildebelagte milepæler fra middelalderens usikre byggeperiode til planlagt rehabilitering i 2026–2027.
- Byggeperioden bruker `year: null` og `period: "Ca. 1080–1180"`; feltet omslutter begge kildeintervallene og fremstiller dem ikke som ett sikkert byggeår.
- Tidslinjen dekker klostereierskap, brannene i 1592 og 1703, rivningsstriden i 1852, to restaureringsperioder, krigsårene og den nyere rehabiliteringen.
- Fremtidspunktet 2026–2027 er eksplisitt merket som planlagt og kan ikke leses som en ferdig hendelse.
- Leksikonets interne `sources` er fylt med fem eksterne kilder. Brukerrettet `externalLinks` produseres først i Kilder-fasen og er ikke smuglet inn her.
- Den daværende Storyen ble i fase 2 bare gjennomgått for å sikre at chronology ikke dupliserte den; full Story-avgjørelse ble utsatt til fase 3.

## Resultat i fase 3

- Den aktive fossilteksten er avvist som Story fordi den forklarte materiale og geologi uten aktører, handling, konflikt, valg eller transformasjon.
- Fossilstoffet og de tre kildeinngangene beholdes som eksplisitt kandidat til den kildebelagte «Mer»-fasen: Oslo Byleksikon om synlige orthocerer, SNL om kirken og SNL om ortocerkalkstein.
- Samme canonical Story-fil inneholder nå én `episode_v1`: flyttingen av Dronning Mauds sarkofag fra Akershus til krypten 19. april 1940.
- Episoden har navngitte initiativtakere, dokumentert fare, konkret handling, fysisk anker og avslutning da sarkofagen ble returnert til Akershus i 1948.
- `dronning_maud` er koblet som canonical person, og `akershus_festning` er både faktisk relatert sted og narrativ neste scene.
- Episoden bruker to eksterne HTTPS-kilder og kopierer ikke chronologyens korte 1940–1948-punkt.

## Resultat i fase 4

- Et arkivfoto av sørsiden og kirkegården, tatt av Ole Tobias Olsen omtrent 1863–1883, er lagt inn i original oppløsning uten oppskalering eller beskjæring.
- Arkivbildets opphav, museums-ID og CC BY-SA 4.0-lisens er hentet fra Wikimedia Commons og kan inspiseres fra brukerflaten.
- Det eksisterende public-domain-bildet fra 10. februar 2008 gjenbrukes som den nyere siden av paret; ingen unødvendig kopi er laget.
- Begge bilder viser den samme sørsiden, men fra ulik avstand og vinkel. Vindusrytme, midttårn og takvolumer brukes som kontrollerbare identitetsankere.
- Teksten gjør kontinuitet til hovedfunnet: arkivfotoet er tatt etter restaureringen i 1858–1861 og kan derfor ikke vise den opprinnelige middelalderkirken.
- Inferensgrensen er eksplisitt: bildet fra 2008 dokumenterer ikke resultatet av rehabiliteringen i 2023–2024, og paret brukes ikke til å datere alle bygningsdetaljer eller forklare hele områdets utvikling.

## Resultat i fase 5

- To `news_note`-records dekker gjenåpningsfeiringen i 2024 og den nye brukskopien av Blix-døpefonten i 2025.
- Begge notiser har dato eller avgrenset periode, fersk `source_checked_at`, navngitte offisielle HTTPS-kilder og `quiz_use: none`.
- Gjenåpningsnotisen skiller feiringen 26. mai 2024 fra at rehabiliteringsarbeider fortsatte ut august eller september samme år.
- Døpefontnotisen dokumenterer den nye kopien og innvielsen uten å late som den løser kildekonflikten om originalens årstall.
- Den planlagte sluttfasen 2026–2027 vises bare i Historie-kronologien. Den sene reviewen på PR #4656 avdekket at en tredje Nyheter-record dupliserte samme plan, og recorden er derfor fjernet før fase 6.
- De to gjennomførte notisene ligger i Nyheter-flaten og dupliseres ikke som chronology, Story eller brukerrettet Kilder-liste.

## Resultat i fase 6

- Tre `approved` Lesespor er knyttet direkte og bare til `gamle_aker_kirke`.
- SNL-artikkelen gir det brede faglige løpet gjennom bygg, institusjonshistorie, rivningsstrid og restaureringer.
- Arkitektur-intervjuet undersøker beslutninger, vernehensyn og myndighetsansvar i rehabiliteringen i 2023–2024.
- Riksantikvarens case viser hvordan energi, brannsikring, teknikk og universell utforming er integrert i et automatisk fredet middelalderbygg.
- Alle tre tekster er fullt åpne, bruker `link_only`, har godkjent kildekvalitet og lagrer ingen kopiert artikkeltekst.
- Ukjent publiseringsdato for Riksantikvarens case står ærlig som `date: null` og `year: null`; siden tillegges ikke et konstruert årstall.
- Lesespor ligger bare i den canonicale Lesespor-modulen og vises gjennom den eksisterende stedfiltrerte rendereren. Ingen record er kopiert inn i Leksikon eller `externalLinks`.

## Aktivt filscope

Fase 6 endrer bare:

- den eksisterende manifestlastede Oslo/Historie-filen i Lesespor-modulen;
- en egen Lesespor-regresjonspakke;
- dette arbeidskortet.

Ingen canonical place-, Leksikon-, Story-, People-, Quiz-, Knowledge-, manifest-, runtime-, bilde- eller produksjonsrapportfil endres i fase 6.

## Ferdigport for fase 6

Fase 6 kan godkjennes når:

1. nøyaktig tre records har unike ID-er og bare `place_ids: ["gamle_aker_kirke"]`;
2. alle tre bruker `access: "open"`, `rights: "link_only"` og `curation_status: "approved"`;
3. kildene har canonical, recognized eller institutional kildekvalitet og inspectable HTTPS-lenker;
4. Lesesporene utfyller hverandre med historisk oversikt, restaureringsbeslutninger og teknisk kulturminneforvaltning;
5. ukjent dato bevares som `null`, og kjente datoer samsvarer med de publiserte sidene;
6. ingen record lagrer artikkeltekst eller materialiseres i Leksikon, `externalLinks`, Story eller quiz;
7. den eksisterende rendereren filtrerer på place-ID, avviser betalingsmurer og viser relevansnotatet;
8. Lesespor-validator, Historie-rapport og PR-review består uten feil i stedskobling, tilgang eller kildeklassifisering.
