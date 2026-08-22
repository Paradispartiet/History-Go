# Gamle Aker kirke – Historie-sted V1

- Dato: 2026-08-22
- Place ID: `gamle_aker_kirke`
- Canonical place-fil: `data/places/historie/oslo/places_historie/gamle_aker_kirke.json`
- Manifest: `data/places/manifest.json`
- Primærkategori: `historie`
- Stedstype: stående middelalderkirke i fortsatt bruk
- Status: **fase 10 – People, Objects, Brands, Badges og Related klare for review; full audit i fase 11 gjenstår**

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
| Kilder | PASS – fase 7 | Fem brukerrettede kildegrupper og sju unike, navngitte HTTPS-lenker dekker identitet, bygningshistorie, dagens bruk, rehabilitering, kulturminnevern og bilder. Interne History Go-data er fjernet fra brukerflaten, og kildekonflikten om Thomas Blix-inventaret er synlig avgrenset. |
| Mer | PASS – fase 8 | Fem stedsspesifikke Språkleksikon-oppslag og tre kildebelagte spor hver for observasjon, betydning og motpunkt materialiseres som navngitte direktefaner. Det finnes ingen brukerrettet Mer-restfane. |

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
| 6 | Lesespor | **GODKJENT – PR #4658, merge `c78cb05353bfb61eb68fef74ee9f115dfacc3a8b`** |
| 7 | Brukerrettede Kilder | **GODKJENT – PR #5184, merge `31af12e8852cca6d7c2da2ef2e5fdab480a287c2`** |
| 8 | Mer | **GODKJENT – PR #5186, merge `3bc252d347b3dd8561155bdbd49c354378401767`** |
| 9 | Quizåpning 2 × 7 og Knowledge | **GODKJENT – PR #5188, merge `5c400fdb79fa16af7eb23fcd61c3e8b70ef8e01b`** |
| 10 | People, Objects, Brands og Badges/rundinger | **KLAR FOR REVIEW – STANDARD 4+1, KILDE- OG BILDEKONTROLLERT** |
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

## Resultat i fase 7

- `source_summary.safe_sources` er ryddet til fem brukerrettede kildegrupper for identitet/bygningshistorie, dagens bruk, rehabilitering/kulturminnevern og bildeproveniens.
- Sju unike, navngitte `externalLinks` bruker HTTPS og dekker Store norske leksikon, Den norske kirke, Riksantikvaren, Oslo byleksikon og begge bildenes kildesider.
- Alle sju lenker er kontrollert 22. august 2026. Rehabiliteringssiden skiller gjennomførte arbeider i 2023–2024 fra en planlagt sluttfase i 2026–2027.
- Store norske leksikon oppgir 1715 for Thomas Blix-inventaret, mens Den norske kirke og Oslo byleksikon oppgir 1725. Kildekonflikten er lagt i `hold_back_sources` og på den statiske Leksikon-siden; ingen av årstallene presenteres som avklart i Kilder-flaten.
- Den statiske Leksikon-sidens Kilder-seksjon bruker de samme sju eksterne inngangene. Lokalhistoriewiki og tre interne History Go-referanser er fjernet fra brukerflaten fordi de ikke inngikk i den kontrollerte kildepakken.
- Eksisterende popup-runtime samler place- og Leksikon-lenker med Før/etter-kildene, dedupliserer på URL og åpner eksterne lenker med `noopener noreferrer`. Ingen ny hovedflate eller runtimevariant er innført.
- Interne rapporter, quizdata, Story-data, audits og research-notater eksponeres ikke som brukerrettede kilder. De tre usikre tradisjonene om trekirke, Olav Kyrre og tingsted forblir holdt tilbake.

## Resultat i fase 8

- Leksikonets hovedrecord er oppgradert til versjon 3 med tre «Legg merke til»-punkter, tre betydningspunkter og tre motpunkter. Alle tre sporene har sju HTTPS-kilder kontrollert 22. august 2026.
- Observasjonene gjør besøket konkret: brukeren kan lese basilikaformen, apsiden, kalksteinen/fossilsporet og restaureringslagene i selve bygget uten å berøre sårbart murverk.
- Betydningssporet kobler navnet Aker til norrønt `akr`, ortocerkalkstein til Oslofeltets geologi og rehabiliteringen til avveininger mellom fortsatt bruk, tilgjengelighet, energi, brannsikring og vern.
- Motpunktene holder byggeåret usikkert, forklarer at det bare steininteriøret i stor grad er et resultat av restaureringen i 1950–1955, og avviser at bygningen alene beviser trekirke-, Olav Kyrre- eller tingstedstradisjonene.
- Et canonicalt Språkleksikon med fem oppslag forklarer `Aker`, `ortocerkalkstein`, `basilika`, `apsis` og `krypt`. Hvert oppslag er koblet til `gamle_aker_kirke`, har stedskontekst og minst én navngitt HTTPS-kilde; arkitektur- og romordene har også en egen stedskilde.
- Gamle Aker kirke er et enkeltsted uten `placeScope: "area"`. Dialektlaget er derfor eksplisitt N/A: språkfilen har `layer: "language"`, ingen `dialect_area` og ingen `dialect_feature`. Oslo-dialekt skal eies av et relevant område-Place, ikke kopieres inn i kirkebygget.
- Fossilstoffet som ble avvist som Story i fase 3 er nå plassert hos riktige eiere: geologibegrepet ligger i Språkleksikon, mens den kildebelagte observasjonen og betydningen ligger i direktefanene. Ingen forklarende fossiltekst gjeninnføres som Story.
- Knowledge, funfacts, relasjoner og fysiske Objects er vurdert og ikke lagt i denne fasen. Knowledge eies av quiz-/Knowledge-fasen, relasjoner eies av canonical relasjonsdata, og Objects krever egen identitets-, kilde- og bilderunde.
- Eksisterende runtime materialiserer språk, observasjon, betydning og motpunkter som navngitte direktefaner i den horisontalt scrollbar fanestripen. Ingen ny hovedflate, Mer-restfane eller stedsspesifikk runtimevariant er innført.

## Resultat i fase 9

- Den eneste aktive Gamle Aker-quizen er revidert fra ett sett med fem spørsmål til canonical `narrow_3x7`: tre sett med sju spørsmål og 21 selvstendige, kildebelagte claims.
- Sett 1 og 2 utgjør den absolutte normalåpningen på 2 × 7. Alle fjorten spørsmål er direkte spørsmål om bygg, arkitektur, materiale, navn, bruk, eierskap, branner, rivningsstrid og restaurering; ingen har `method_id`, `topic_hook_id`, `thinker_id` eller `theory_ref`.
- Sett 3 innfører kildekritikk, sporlesning, restaurerings-/autentisitetsanalyse og kulturarvutvelgelse. Fire teoribindinger bruker Carlo Ginzburg, Alois Riegl og Sverre Bagge bare der teorien skjerper en konkret, eksternt kildebelagt situasjon.
- Et reviewed `source_brief` samler sju åpne HTTPS-kilder, 21 ordnede claims, audit av de fem gamle spørsmålene, profilbegrunnelse og fire eksplisitt holdte kandidater. Trekirketradisjonen, Olav Kyrre, tingstedet og det motstridende Thomas Blix-året er ikke gjort til quizfasit.
- Den genererte produksjonskonteksten dokumenterer hele manifestløste fagpakken, stedets canonical data, relevante relasjoner/Story, valgt pensum og en nøyaktig settplan. Profilen stoppes på tre sett fordi et fjerde ville gjenta samme bygnings- og bevaringshistorie.
- Alle 21 spørsmål har stabilt læringsmål, evidenstype og feedbackgrunnlag. Canonical Knowledge-synk materialiserer 42 koblede Knowledge-enheter, 45 concepts og 8 terms for quizen; alle spørsmål har `knowledge_link_status: "linked"`.
- Quizdata endrer ikke fysisk besøksstatus. Eksisterende quiz-, Knowledge- og progresjonsruntime brukes uten ny hovedflate, ny storage eller stedsspesifikk runtimevariant.

## Resultat i fase 10

- People-rundingen har fire direkte, manifestlastede personkoblinger: Heinrich Ernst Schirmer og Wilhelm von Hanno for restaureringen i 1856–1861, Torvald Moseid for glassmaleriet fra 1955 og Dronning Maud for den dokumenterte oppbevaringen av sarkofagen i krypten 1940–1948.
- Olav Kyrre holdes fortsatt tilbake som svak tradisjon. Thomas Blix materialiseres ikke som en tynn ny personprofil bare for å øke antallet; hans dokumenterte arbeid bæres i stedet av de fysiske objektene.
- Objects-rundingen har tre identifiserbare gjenstander inne i kirken: døpefonten og prekestolen skåret av Thomas Blix i 1715, samt det bevarte nattverdsmaleriet fra altertavlen fra 1700-tallet. Hvert objekt har stedstekst, funnsted, fagkilde, lokalt bilde og inspectable CC BY-SA 4.0-proveniens.
- Kirkebygget, tårnet, kalksteinen og fossilene er ikke duplisert som Objects. Torvald Moseids glassmaleri er faglig relevant, men holdes ute av Objects til et kontrollert, lokalt objektbilde finnes.
- Brand-kandidatpasset har kontrollert moderne prosjektaktører, ikke bare eksisterende registertreff. Zenisk og TRÅD AS består Brand-definisjonen, har direkte dokumenterte roller ved stedet og 100 prosent lokal, offisiell logodekning. Arkitektene AS og Nco AS holdes tilbake fordi den ferdige logo-/rolleporten ikke er lukket; Kirkelig fellesråd brukes ikke som institusjonsfyll.
- Fire canonicale nabosteder gir en virkelig Related-runde: Damstredet og Telthusbakken, Vår Frelsers gravlund, St. Hanshaugen park og Stensparken. Alle løser i `places_index` og gjør kirken til inngang til et rikere lokalt område.
- Badges ligger fortsatt separat ved overskriften. `middelalder` og `kulturminner_og_bevaring` er kontrollert mot Historie-registeret, og innholdsrundingene følger standarden `people · objects · brands · related` uten `round_profile`-overstyring eller ny runtime.
- Seksdelt kvalitetsport er 29/30: korrekthet/evidens 5, dekning 5, redaksjonell kvalitet 5, teknisk integritet 5, sikkerhet/ansvarlighet 5 og vedlikeholdbarhet/etterprøvbarhet 4. Ingen dimensjon er under 4 og ingen kritiske funn står åpne i faseomfanget.

## Aktivt filscope

Fase 10 endrer bare:

- den canonicale Gamle Aker-place-filen med tre Objects og fire eksplisitte related-place-ID-er;
- tre eksisterende People-profiler, uten å opprette nye person-ID-er;
- canonical Brand-master og place-mapping med to ferdige profesjonsbrands;
- tre lokale objektbilder og to lokale offisielle logo-assets med dokumentert proveniens;
- produksjonspakkens rundingsstatus, én maskinlesbar faseaudit og én målrettet regresjonstest;
- dette arbeidskortet.

Ingen Story-, Lesespor-, quiz-, Knowledge-, koordinat-, lagrings- eller runtimefil endres i fase 10. Det innføres ingen ny hovedflate eller ny rundingsvariant.

## Ferdigport for fase 10

Fase 10 kan godkjennes når:

1. People-rundingen løser minst de fire oppgitte, direkte personkoblingene fra canonical manifestdata uten svak tradisjonsfyll eller brutte bildebaner;
2. alle tre Objects er fysiske, stedsspesifikke og har to kilder, lokalt bilde, lisens, kreditering og manuell motivkontroll;
3. Brand-kandidatpasset er dokumentert, begge inkluderte Brands består canonical score og har direkte stedsrolle;
4. begge Brands har lokale offisielle logoer, 100 prosent attribusjonsdekning og ingen genererte eller rekonstruerte merker;
5. alle fire Related-ID-er løser til andre canonical History Go-places, og ingen av dem er kopiert som Objects eller Structures;
6. begge underbadges finnes i Historie-registeret og Badge forblir separat fra de fire innholdsrundingene;
7. eksisterende runtime velger `people · objects · brands · related` fra standardkontrakten uten en lokal `round_profile` eller kodevariant;
8. målrettet test, canonical audits, TypeScript-kontroll og GitHub CI består, og seksdelt kvalitetsport er minst 27/30 med alle dimensjoner minst 4.
