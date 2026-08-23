# Civication Role World — realisme og livsverden

Status: **videreutviklingsmål — ikke implementert completion-kontrakt**  
Sist kontrollert: **2026-08-23**

## 1. Formål

Civication har allerede et sterkt Role World-grunnlag: en rolle skal oppleves som en liten sosial serie med sosiologisk kjerne, recurring people, makt/status, 14 dager × fire faser, relasjonelle tråder, privat etterklang og forsinkede konsekvenser.

Neste kvalitetsnivå er at spilleren ikke bare skal oppleve gode jobbsituasjoner, men føle at rollen eksisterer i en **vedvarende yrkes-, institusjons- og samfunnsverden**.

Målet er at spilleren skal kunne huske:

- menneskene man jobbet med;
- saken, pasienten, prosjektet, teksten, samlingen, arrangementet eller problemet man arbeidet med;
- institusjonen og dens interne makt-/arbeidsdeling;
- hva man faktisk lærte og derfor kunne gjøre bedre senere;
- hvilke feil eller prioriteringer som kom tilbake;
- hvordan jobben påvirket økonomi, status, privatliv og selvbilde;
- hvordan samme steder, People, institusjoner og saker finnes på tvers av roller;
- hvordan History Go-kunnskap faktisk endret arbeidet.

Dette dokumentet beskriver ønsket produktkvalitet. Det er **ikke** bevis på at alle mekanismene finnes i runtime i dag.

## 2. Eksisterende grunnmur som skal beholdes

Videreutviklingen skal bygge på dagens canonicale lag:

1. `roleModel` og Work Grammar/FWG for faglig jobbsubstans;
2. `mailPlan`, `mailFamilies`, private/life/social/narrative-kilder for authored hendelser;
3. `civication_scene_v1` som canonical sceneformat;
4. `compiledSceneRegistryV1` og eksisterende SceneCatalog/SceneDirector/ChoiceDirector;
5. `CivicationState` som eksisterende state-eier;
6. `CivicationEventEngine` for event-/konsekvensflyt;
7. `CivicationTaskEngine` og History Go task bridge for konkrete læringsoppgaver;
8. Scenario People for trygg kobling mellom canonicale History Go People og Civication;
9. eksisterende life position, livelihood, økonomi, psyke, jobbstatus, relasjoner og reputation der disse allerede finnes.

Det skal ikke bygges en ny parallell RoleWorldEngine, ny dagmotor eller et konkurrerende sceneformat bare for å realisere denne visjonen.

## 3. Overordnet designprinsipp: fire typer hukommelse

En troverdig livsverden trenger mer enn at én NPC husker et tidligere valg. Vi vil gradvis kunne representere fire typer hukommelse:

### 3.1 Personhukommelse

En leder, kollega, kunde, fagperson, venn eller annen recurring actor reagerer senere på hva spilleren faktisk har gjort.

Dette finnes delvis allerede gjennom tråder, flags og forsinkede konsekvenser, og skal styrkes uten å gjøre virkelige historiske personer til frie NPC-er.

### 3.2 Arbeidsobjekthukommelse

Saken eller arbeidsobjektet skal kunne leve videre.

Eksempler:

- arkivleveransen som først mottas, så ordnes, så viser et proveniensproblem, så blir gjenstand for innsyn;
- plansaken som får ny dokumentasjon og endrer konfliktbildet;
- journalistens tips som blir kildearbeid, publisering, rettelse eller oppfølging;
- controllerens avvik som går fra signal til kontrollspor og ledelsesbeslutning;
- undervisningsopplegget som justeres etter hva studentene faktisk forstod;
- sportsutøverens skade-/treningsforløp som påvirker uttak og privatliv.

### 3.3 Institusjonshukommelse

Arbeidsplassen skal ha struktur, kapasitet, prosedyrer, prioriteringer og maktforhold som fortsetter å eksistere etter én scene.

### 3.4 Samfunnshukommelse

Steder, institusjoner, People, kunnskapsenheter og noen arbeidsobjekter skal kunne krysses av flere roller, slik at Civication føles som forskjellige posisjoner i samme samfunn og ikke som separate minispill.

## 4. Ti tydelige utbedringsområder

## 4.1 Vedvarende saker og arbeidsobjekter

Dette er høyeste prioritet.

I dag kan en scene eller tråd beskrive en sak over flere beats, men modellen bør eksplisitt kunne uttrykke at **det samme arbeidsobjektet** har identitet og tilstand over tid.

Et arbeidsobjekt bør kunne ha:

- stabil `work_object_id`;
- type, for eksempel `archive_delivery`, `planning_case`, `article`, `budget_deviation`, `course_module`, `collection`, `patient_case` der det er forsvarlig, `event`, `production`, `training_cycle`;
- institusjon-/rolle-eierskap;
- status og fase;
- åpne spørsmål;
- frist eller tidsvindu når relevant;
- hvem som er involvert;
- canonical place/person/knowledge-referanser der de faktisk finnes;
- spor av viktige valg og endringer;
- konfidensialitets-/tilgangsgrense når relevant;
- avslutning, overlevering eller senere gjenåpning.

Arbeidsobjektet skal ikke bli en universell CRM-database. Hver rolle bruker bare de feltene arbeidet faktisk trenger.

### Kvalitetsmål

En spiller skal kunne se en ny scene og umiddelbart forstå: «Dette er **den samme saken** jeg jobbet med i går, og det jeg gjorde da påvirker hva jeg kan gjøre nå.»

## 4.2 Institusjonen som egen verden

Role World beskriver allerede mennesker og sosiale miljøer. Neste steg er å gjøre den **institusjonelle logikken** eksplisitt.

For relevante roller bør authored world-data beskrive:

- organisatorisk enhet og arbeidssted;
- rapporteringslinje;
- sideordnede fagfunksjoner;
- ekstern motpart/kunde/offentlighet;
- beslutningsmyndighet og godkjenningspunkter;
- hva spilleren kan gjøre selv;
- hva som må eskaleres;
- hvilke ressurser som er knappe;
- hva organisasjonen måles på;
- hvor faglig kvalitet, tid, penger, lovlighet og omdømme kan trekke i ulike retninger.

### Kvalitetsmål

Spilleren skal lære hvordan jobben faktisk er plassert i en institusjon, ikke bare hvordan et individuelt dilemma ser ut.

## 4.3 Realistisk arbeidsrytme

14 × 4-dekningen skal fortsatt være dramaturgisk ramme. Den skal **ikke** bli likestilt med fire store hendelser per dag.

Yrkesrealismen bør kunne uttrykke:

- frister;
- møter;
- kø og backlog;
- venting på andre;
- avbrudd;
- håndover;
- hasteoppgaver;
- rutinearbeid;
- arbeid som må gjøres om;
- perioder med lav intensitet;
- sesong-/uke-/årsrytme når relevant;
- turnus eller skift for roller som faktisk har dette;
- privat restitusjon etter krevende arbeid.

### Kvalitetsmål

Arbeid skal ha tempo og friksjon som passer yrket. En lærer, arkivar, journalist, renholder, controller, trener og planrådgiver skal ikke oppleves som samme dagstruktur med ulike substantiv.

## 4.4 Kompetanse skal endre handlingsrommet

History Go-oppgaver og fagkunnskap skal ikke bare være sideoppdrag som gir et grønt hake-tegn.

Når spilleren faktisk har lært noe, skal det på sikt kunne gi:

- tidligere oppdagelse av et problem;
- en bedre diagnostisk observasjon;
- et ekstra handlingsalternativ;
- bedre argumentasjon;
- mindre risiko for faglig feil;
- mulighet til å stille et bedre spørsmål;
- bedre begrunnelse for eskalering;
- raskere eller mer presis utførelse, når dette er faglig troverdig.

Eksempel: En arkivar som har gjennomført relevant History Go-/fagoppgave om proveniens bør kunne gjenkjenne at en eksportstruktur ikke er det samme som original orden, og dermed få et annet handlingsrom i senere arbeid.

### Viktig grense

Kunnskap gir **kompetanse**, ikke automatisk formell autoritet. Et badge eller en quiz kan aldri alene gjøre spilleren til autorisert helsepersonell, professor, arkivar med formell kvalifikasjon eller annen rolle som krever separat kvalifikasjon/ansettelse.

## 4.5 Arbeidsvilkår og faktisk yrkesliv

Rollenes livsverden bør ved behov bruke eksisterende life-/career-systemer til å gjøre arbeidsforhold merkbare:

- fast/midlertidig stilling;
- prøvetid;
- arbeidstid;
- overtid og avspasering;
- sykefravær og arbeidsevne der slike systemer faktisk finnes;
- ansvar uten tittel;
- lønn/økonomisk rom;
- usikkerhet om videre kontrakt;
- faglig uenighet med leder;
- verneombud/fagforening/tillitsvalgt når relevant og korrekt modellert;
- ferie og fraværsplanlegging;
- konsekvenser av å si nei, eskalere eller prioritere kvalitet over tempo.

Ikke alle roller trenger alle dimensjoner. Kravet er relevans, ikke mekanisk checklisting.

## 4.6 Én delt verden på tvers av roller

Civication bør gradvis la ulike roller møte de samme samfunnsobjektene fra ulike posisjoner.

Eksempler:

- samme plansak kan berøre planrådgiver, politiker, journalist og økonom;
- samme arkivsamling kan først håndteres av arkivmedarbeider, senere brukes som kilde av historiker/forsker;
- samme kulturinstitusjon kan møte kurator, formidler, journalist, økonom og publikum;
- samme arrangement kan involvere kulturarbeider, sikkerhet, journalistikk, næringsliv og byforvaltning;
- samme sted og canonical People kan være relevant for flere faglige roller uten duplisering.

### Kvalitetsmål

Spilleren skal kunne skifte karriere og kjenne igjen verden, samtidig som rollen gir et annet perspektiv og annet ansvar.

## 4.7 Hverdagsarbeid, rework og små friksjoner

Realisme må ikke forveksles med konstant drama.

Role Worlds bør inneholde:

- korrektur;
- klassifisering;
- kontroll og dobbeltkontroll;
- oppdatering av metadata;
- dokumentasjon;
- rutinemøter;
- køarbeid;
- venting på avklaring;
- små feil;
- oppgaver som må gjøres om;
- kollegastøtte;
- arbeid man gjør riktig uten stor belønning;
- dager der en liten detalj faktisk er den viktigste leveransen.

Dette skaper kontrast og gjør de store konfliktene mer troverdige.

## 4.8 Situert omdømme fremfor én universell score

Dagens karrierestate har en generell `reputation`. Videreutviklingen bør på sikt skille mellom relevante publikum eller relasjoner.

Eksempler:

- `manager_trust`;
- `colleague_trust`;
- `professional_credibility`;
- `public_reputation`;
- `client_trust`;
- `community_trust`;
- `political_trust`;
- `team_trust`.

Disse skal ikke innføres ukritisk som globale felt. Rollen bør bare bruke akser som har reell dramaturgisk og faglig betydning.

### Kvalitetsmål

Det skal være mulig å være faglig respektert, men vanskelig for ledelsen; populær blant kolleger, men lite troverdig hos en ekstern motpart; eller omvendt.

## 4.9 Profesjonskultur

En yrkesverden består også av kultur.

Authored innhold bør kunne beskrive:

- fagspråk og hva ord faktisk betyr i miljøet;
- hva som regnes som godt håndverk;
- hvordan junior/senior opptrer ulikt;
- møteritualer og uformelle normer;
- humor og sosial maske;
- hva man helst ikke sier høyt;
- klær/utstyr når dette faktisk er relevant;
- pauserom, kaffe, garderobe, feltarbeid, møterom, backstage, kontor eller andre konkrete arbeidsflater;
- faglig stolthet og identitet;
- konflikt mellom profesjonsnorm og organisasjonens kortsiktige mål.

Arketypisk profesjonskultur skal aldri bli karikatur eller stereotyper om kjønn, klasse, etnisitet eller andre grupper.

## 4.10 History Go som yrkesverktøy

History Go skal bli en integrert del av arbeidsverdenen, ikke et tilfeldig hopp ut av Civication.

Eksisterende task bridge støtter allerede konkrete mål som place, person, knowledge, debate og unlock. Videreutviklingen bør bruke dette til en tydelig kjede:

```text
arbeidsproblem
→ konkret kunnskapshull
→ History Go-oppgave
→ dokumentert completion
→ tilbake til samme arbeidsobjekt
→ ny forståelse eller nytt handlingsrom
→ senere faglig konsekvens
```

Mulige anvendelser:

- besøke eller åpne et sted for å forstå fysisk/historisk kontekst;
- lese en canonical People-profil;
- ta relevant quiz;
- undersøke en knowledge unit;
- delta i relevant debate;
- åpne en historisk story eller annen eksisterende læringsflate når task-schemaet støtter den.

Koblingen skal være spesifikk og faglig begrunnet. «Gå og lær noe» er ikke godt nok.

## 5. People — canonicale mennesker og fiktive arbeidsaktører

Dette er et tverrgående krav i hele videreutviklingen.

### 5.1 Eksisterende History Go People først

Før en rolle får nye virkelige personer skal produksjonen:

1. lese Scenario People for fag/rolle;
2. undersøke `existing_place_people` og `existing_other_people`;
3. bruke `direct`, `strong` eller `contextual` fit korrekt;
4. gjenbruke canonical person-ID når personen allerede finnes;
5. aldri oppfinne person–sted-koblinger.

### 5.2 Nye canonical People bare ved reelt hull

`missing_people_candidates` er kun arbeidsliste. En ny person kan først materialiseres etter egen kildeverifisering og canonical People-produksjon.

### 5.3 Fiktive arbeidsaktører for fri sosial dramaturgi

Kollegaer, ledere, kunder, venner og andre løpende karakterer som trenger fiktive e-poster, privat motivasjon, fri dialog eller dramatiske valg skal være eksplisitt fiktive/fiksjonaliserte actors. De skal ikke lekke inn som historiske People.

### 5.4 Virkelige personer er kunnskaps-/oppgavemål

En historisk/offentlig person kan være en sterk History Go-oppgave, kilde eller kontekst. Personen skal ikke få oppdiktet privatliv, frie meninger eller påstått dialog med spilleren.

## 6. Arbeidsobjekter og People skal møtes uten å blandes

Et arbeidsobjekt kan referere til:

- en fiktiv intern actor;
- en canonical person som faktabasert target/reference;
- et canonical place;
- en knowledge unit;
- en faglig source/ref;
- et institusjonelt objekt.

Men dataene skal bevare typen. En `person_id` er ikke en NPC bare fordi den forekommer i en sak.

## 7. Rolleeksempler

## 7.1 Arkiv og dokumentasjon

Vedvarende arbeidsobjekter:

- leveranse;
- arkivserie;
- innsynssak;
- integritetsavvik;
- digital migrering.

Institusjon:

- arkivleder;
- dokumentforvalter;
- innsynskoordinator;
- digital bevaring;
- formell kassasjons-/tilgangsmyndighet.

History Go-verktøy:

- historisk sted/person for å skille offentlig historisk syntese fra arkivbeskrivelse;
- fagkunnskap om kildekritikk, proveniens og dokumentasjon.

## 7.2 Journalistikk

Vedvarende arbeidsobjekt:

- tips → research → kildevurdering → publisering → reaksjon → eventuell rettelse/oppfølging.

Situert omdømme:

- redaktørtillit;
- kildetillit;
- faglig troverdighet;
- offentlig omdømme.

## 7.3 Planlegging/forvaltning

Vedvarende arbeidsobjekt:

- samme plansak med dokumenter, medvirkning, juridiske avklaringer, politisk behandling og senere konsekvens.

Cross-role:

- samme sak kan leses senere av journalist/politiker/økonom uten at de får samme autoritet eller samme kunnskapsbehov.

## 7.4 Undervisning

Vedvarende arbeidsobjekt:

- kurs-/undervisningsforløp, opplegg, studentmisforståelser, vurdering og revisjon.

Kompetanse:

- History Go-/Fagverk-kunnskap kan gi bedre eksempler og bedre diagnostikk av misforståelser, men ikke automatisk formell akademisk kvalifikasjon.

## 7.5 Sport

Vedvarende arbeidsobjekt:

- trenings-/sesongforløp, skadebelastning, kamp-/uttaksforberedelse, kontrakt og restitusjon.

Arbeidsrytme:

- trening, kampdag, reise, restitusjon og privatliv må føles annerledes enn kontorjobber.

## 8. Ikke-mål

Denne videreutviklingen skal ikke:

- skape en ny parallel scene-engine;
- gjøre alle roller til samme universelle systemsimulator;
- innføre 56 store beslutninger per 14-dagersperiode;
- gjøre kunnskapspoeng til formell yrkesautorisasjon;
- opprette virkelige People bare for å fylle en dramatisk rolle;
- bruke virkelige personer som frie fiktive NPC-er;
- gjøre sensitiv helse-, klient-, elev- eller personalinformasjon unødvendig detaljert;
- bygge global reputation-matematikk før vi har bevist behovet i konkrete roller;
- oppfinne workplace-data, person–sted-relasjoner eller fakta for completeness;
- kreve samme mekanikk i alle profesjoner.

## 9. Målbilde for en moden rolle

En fremtidig moden Role World bør kunne bevise følgende sammenheng:

```text
institusjon
→ mennesker og makt
→ vedvarende arbeidsobjekter
→ realistisk rytme og begrensede ressurser
→ faglige oppgaver
→ History Go-kunnskap
→ bedre eller andre handlingsmuligheter
→ valg og utførelse
→ rework / kollegial reaksjon / institusjonell reaksjon
→ privat etterklang
→ situert omdømme og relasjoner
→ senere konsekvens
→ mulig kryssing med andre roller i samme samfunnsverden
```

## 10. Prioritet

Foreslått rekkefølge etter verdi og avhengigheter:

1. **Vedvarende arbeidsobjekter**
2. **Institusjonsstruktur og myndighetsgrenser**
3. **History Go-kunnskap som faktisk endrer handlingsrom**
4. **Realistisk arbeidsrytme og rework**
5. **Situert omdømme / relasjonell tillit**
6. **Arbeidsvilkår**
7. **Profesjonskultur**
8. **Cross-role shared world**

People-integrasjon og faktisitetsgrensen gjelder i alle faser, ikke som en separat sluttfase.

## 11. Completion-prinsipp

Dagens `role_world_complete` skal ikke i stillhet endre betydning. Når realismeutvidelsen blir implementert må repoet eksplisitt velge én av disse styrte løsningene:

- en ny, separat maskinlesbar realisme-status/matrise; eller
- en versjonert ny Role World-kontrakt med tydelig migrering av eksisterende reference worlds.

Det skal aldri oppstå «completion-teater» der gamle roller plutselig regnes som å ha vedvarende arbeidsobjekter, cross-role world eller situert reputation bare fordi dokumentasjonen beskriver målet.
