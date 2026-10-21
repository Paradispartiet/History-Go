# Civication – Skills, spillerutvikling og History Go i livsverdenen

Status: **besluttet produkt- og designkontrakt, 21. oktober 2026**. Ikke en erklæring om ferdig runtime, migrert state eller bestått 14-dagers spillerreise. Denne filen definerer ønsket samspill og eiergrenser; konkrete feltnavn, numerisk balanse og lagring må implementeres og testes i eksisterende motorer. Kanonisk inngang: [CIVICATION_README.md](CIVICATION_README.md).

## 1. Grunnregel: spilleren lever et liv – med eller uten jobb

**Arbeidsledig er en arbeids-/aktivitetssituasjon, ikke en livsposisjon og ikke en karakterklasse.** En spiller uten jobb skal kunne fortsette Life Stories: relasjoner, kjærlighet, familie, vennskap, fritid, hobbyer, læring, økonomi, bolig, byliv, konflikter og nye muligheter. Historiene skal være drevet av spillerens faktiske valg, opplevde hendelser og livskontekst – ikke av at en jobbrolles postboks er fylt.

Tre uavhengige lag:

1. **Arbeid og livsomstendighet:** ansatt/arbeidsledig, eventuelle ytelser, bolig, inntekt, plikter og tidsbruk; påvirker hvilke scener som er relevante, men avgjør ikke om privatlivet eksisterer.
2. **Life Stories:** én fortellingsrunner med private og jobbrelaterte scenepakker, NPC-minne, relasjoner og forsinkede konsekvenser. Vanlige private hendelser må fortsette uten krav om Badge, en bestemt livsposisjon eller jobb.
3. **Valgbare livsposisjoner:** interesser, praksiser, miljøtilhørighet og identiteter åpner **ekstra** historier og handlingsmuligheter. Reelle merit-/Badge-vilkår beholdes for *disse* forløpene, og posisjoner velges eksplisitt; ingen quiz gir automatisk jobb eller rolle.

På dag 7 skal «Fortsett privatlivet» og frivillig «Utforsk History Go» kunne vises samtidig. Et krav til et særskilt dag-8-kapittel må aldri tolkes som et krav om livsposisjon for å fortsette *livet*. Den generelle Life Story-reisen gjennom dag 8–14 for arbeidsledig uten Badge må fortsatt testes og eventuelle innholdshull skrives; en tilgjengelig privat knapp er ikke bevis for 14 fullt forfattede dager.

## 2. Fem adskilte dimensjoner for spillerens utvikling

| Domene | Hva det er | Eksisterende eier og evidens | Skal ikke forveksles med |
| --- | --- | --- | --- |
| **Livstilstand** | Variabel situasjon her og nå: psyke, energi, integritet, synlighet, handlingsrom, penger | `lifestoryState` meters; `CivicationPsyche`, kalender/økonomi | Varig ferdighet, diagnose, sosial klasse |
| **Skills** | Relativt varig, dokumentert personlig mestring gjennom øvelse, valg, refleksjon og handling | **Planlagt samordnet read-/growth-model**; eksisterende `player.competence.psychology` og `job_learning_progress` beholdes i sine eiere | Meritpoeng, formelle kvalifikasjoner, psyke |
| **Kapital og omdømme** | Ressurser og posisjon i ulike sosiale felt, ikke universell personlig evne | `capitalEngine`: økonomisk, kulturell, sosial, symbolsk, politisk, institusjonell og subkulturell kapital; `civicationSocialStanding` for situert omdømme | At spilleren er god til alt eller har tillit hos alle |
| **History Go-samling og kunnskap** | Evidens for besøk, quiz, kunnskap, merker, People og bidrag | `visited_places`, `merits_by_category`, `hg_knowledge_entries_v2`, `people_collected`, `hg_learning_log_v1`, notater | Frie autorisasjoner eller automatisk skill-mastery |
| **Livsposisjoner og erfaring** | Selvvalgte identiteter, scenemuligheter, relasjoner og opplevd historie | `CivicationLifePositions`, `hg_civi_life_positions_v1`, `CivicationLifestoryState` | Jobbansettelse eller handling som ikke er spilt |

Disse dimensjonene påvirker hverandre, men har forskjellige eiere. **Ingen ny parallell spillmotor, samlingsstore eller valuta.** Psyke og livsstil finnes allerede og må ikke kopieres som «skill»-poeng.

## 3. Seks Skills-skalaer – målmodell

**Skills** er gjennomgående, overførbare *spillegenskaper* (0–100). Seks identiteter, en additiv state-slice og verifiserbar, begrenset praksisregistrering er introdusert i `CivicationSkills`; full aktivitetstilordning, balanse og end-to-end-spillbarhet er **ikke** ferdig. Ukjent Skills-score vises som «Ikke målt», ikke som en oppdiktet startverdi.

| Skill | Hva øvelse kan dokumentere | Eksempel på Life Story-effekt |
| --- | --- | --- |
| **Visdom / dømmekraft** | Forstår kontekst, belegg, usikkerhet og mulige følger | Ser et mindre risikabelt handlingsalternativ, får bedre begrunnelse i en konflikt |
| **Sosial teft** | Leser signaler, lytter, forhandler og tilpasser kommunikasjon | Forstår en NPCs situasjon bedre; tillit må fortsatt bygges med faktisk handling |
| **Kreativitet** | Lager, prøver og reviderer idéer og prosjekter | Nye prosjektvalg eller løsninger åpnes når historien støtter det |
| **Praktisk mestring** | Gjennomfører avgrensede oppgaver og anvender lært kunnskap | Kan håndtere en praktisk utfordring mer presist |
| **Formidling** | Forklarer, underviser, argumenterer og gjør komplisert stoff forståelig | Flere troverdige måter å delta i debatt og samtale |
| **Handlekraft** | Tar initiativ, følger opp og fullfører beslutninger | Kan gjennomføre et realistisk tiltak, uten garanti for utfall |

`CivicationPsyche` har allerede **psykologikompetanse** (`player.competence.psychology`) med aktivitetsspesifikk opptjening og deduplisering. Den skal beholdes som eksisterende domeneferdighet og inngå i en eventuell samordnet oversikt – ikke nullstilles, kopieres eller byttes ut. Tilsvarende er jobbspesifikke `job_learning_progress` og History Go-meritter fortsatt separate evidenskilder.

Krav til opptjening: definert handling, dokumentert kilde/event, idempotent belønning, ingen gratis poeng ved ren visning/oppfriskning, ingen ubegrenset repetisjon, balanserte langsomme kurver og mulighet for å feile/lære. Ett besøk alene kan bygge kjennskap til et sted, men gir ikke automatisk visdom, sosial teft, streetkred eller alle seks ferdigheter. Kompetanse skal ikke forveksles med faktisk fagautorisasjon eller yrkeskvalifikasjon.

### Teknisk Skills-grense (første implementeringsbolk)

- `js/Civication/systems/civicationSkills.js` eier seks Skills-definisjoner, `getViewModel`, en testbar `practicePatch` og additiv praksisskriving gjennom **eksisterende** `CivicationState.setState` (`hg_civi_state_v1.skills_v1`). Ikke egen localStorage- eller sky-nøkkel.
- `js/Civication/systems/civicationSkillsPracticeBridge.js` kobler kun eksplisitte authored valg med `choice.skills_practice = {skill_id, activity_type, delta}` til `CivicationChoiceDirector` **etter vellykket svar**. Delta må være et heltall 1–3. Én `event_id` kan krediteres én gang, også ved replay/reload. Forfattere må kildekontrollere aktivitetstypen før feltet tas i bruk.
- Den synlige «Skills»-flaten under Personlig viser seks skalaer uten å fabrikere startskårer. Eksisterende `job_learning_progress`, `player.competence.psychology`, relasjoner og kapital forblir hos sine respektive eiere; de er ennå ikke oversatt automatisk til generelle Skills-poeng.
- Implementasjonen gir **ingen** automatisk poeng ved besøk, quiz, åpning av mail, rollebytte eller History Go-retur. To forfattede Skills-porter er nå implementert som valgfrie alternativer; en full authored øvingskatalog, langsiktig balanse, bredere konsekvensdrevne Skills-porter og den komplette 14-dagers spillerreisen står fortsatt åpne.

**Treg oppstart og gjenoppretting:** Hvis Min dag lagrer et kvalifiserende valg før `CivicationState` er tilgjengelig, legger `CivicationSkills.applyOrQueue` en validert hendelse i den **eksisterende** Life Story-lagringen (`pendingSkillsPracticesV1`), uten å gi poeng ennå. `flushQueued` avregner etter `civi:booted` eller når rollen lastes igjen, også for inaktive roller. Den kanoniske Skills-ledgeren dedupliserer hendelsen ved flere oppstarter. Køen fjernes først etter registrering eller bekreftet tidligere registrering; testmodus skriver ikke. Ingen separat localStorage-nøkkel eller alternativ Skills-motor introduseres.

### Skills i forfattede Life Stories (implementert v1-eksempel)

**Utvideleg praksisdekning (21.10.2026):** De seks første forfattede valgene er utvidet med 23 flere, til **29 dokumenterte Skills-valg** i arbeidsledighets-, Ekspeditør- og privatlivsfortellingene. Eksempler: faktisk sendt søknad eller NAV-dokumentasjon gir Handlekraft; kontrollert lagerstatus, kassapris og lukkeskift gir Praktisk mestring; gjennomført musikkprøve og kreativ tilbakemeldingsrunde gir Kreativitet; undervisning og forklaring til andre gir Formidling. Hver kildeoppføring må ha et spesifikt, sannhetssatt effektflagg; handlinger som bare er ønsker eller plan om å lære i History Go gir ikke gratispoeng. Verdiene er fortsatt forsiktige 1–2 poeng per dokumentert scenevalg, deduplisert på scene-ID. Denne bolken øker authored dekning uten å endre motor, verdifordeling på 0–100, psyke eller Streetkred.



Seks konkrete valg i eksisterende pakker (`arbeidsledig`, `ekspeditor` og felles privatliv) er nå koblet til én Skill hver: `agency` (ryddet dokumentasjon via telefonsamtale), `creativity` (laget noe i eget prosjekt), `wisdom_judgement` (analysert jobbtilbakemelding og laget læringsplan), `social_awareness` (ærlig og krevende svar i en vennskapsrelasjon), `practical_mastery` (kontrollert og korrigert prisplakater) og `communication` (lært bort arbeidsmetode). Dette er **seks forfattede, valgfrie hendelser**, ikke en garanti for at én spiller tjener alle Skills automatisk.

`lifestoryContent` validerer nå `valg.skills_practice = { skill_id, activity_type, evidence_flag, delta }`, inkludert at `evidence_flag` er en faktisk `true`-effekt av akkurat det valget. `CivicationLifestoryUI.onChoose` registrerer øvingen **etter** vellykket `Runner.applyChoice` og `State.save`, og bruker stabil `lifestory:<sceneId>` som dedupliseringsnøkkel. Ingen poeng ved å åpne en scene, lese fortellingstekst, velge feil eller være på History Go. Testmodus skal ikke kreditere Skills. På denne måten fortsetter `job_learning_progress`, psyke, kapital og relasjoner å ha sine egne eiere.

Fortsatt åpne krav: større authored dekning, faglig vekting, gradert utfordring, medvirkning fra History Go-kunnskap i senere scener, flere Skills-baserte handlingsvalg og faktisk godkjent 14-dagers spillerreise. Denne bolken etablerer én kildebelagt praksisvei inn i den allerede etablerte Skills-visningen; den påstår ikke at Skills-systemet er fullstendig balansert.

### Skills påvirker valg – valgfri første implementering

`valg.skills_requirement = { skill_id, min_score }` åpner et **bonusvalg** når den dokumenterte kanoniske `skills_v1`-skåren oppfyller kravet. Uregistrert Skill er **«Ikke målt»**, ikke en implisitt skår på null eller fri adgang. `CivicationSkills.checkRequirement` er felles fasit, og `CivicationLifestoryRunner.applyChoice` håndhever kravet også ved direkte kall, før fortellingsstate muteres. UI viser både kravet og spillerens status; utilgjengelige bonusvalg vises forklarende med deaktivert knapp, ikke som skjult innhold. Minst ett ordinært valg uten Skills-krav er påkrevd for hver scene.

Første to valg er lagt i reelle scener: **Praktisk mestring 2** gir butikkmedarbeideren mulighet til både å rette kundens pris og rapportere avviket til lederen; **Formidling 1** gir arbeidsledige mulighet til å formulere et konkret, sant kompetanseeksempel som kan brukes ved neste intervju. Tersklene er bevisst lave og knyttet til allerede dokumenterte valg tidligere i forløpet. Ekstra valg gir ikke autorisasjon, profesjonelle privilegier, automatisk jobbtilbud eller History Go-meritter. Gamle lagringer uten slike Skills fortsetter via normale valg.

## 4. Streetkred er kontekstuell, ikke én allmenn popularitetsscore

«Streetkred» betyr **opparbeidet troverdighet i et konkret miljø**: for eksempel musikk, gatekunst, idrett, lokale kulturmiljøer eller andre subkulturer. En historie om miljøet og faktisk tilstedeværelse kan åpne kontakt, men varig kred krever autentiske bidrag og andres reaksjoner.

- Bruk **subkulturell kapital** (`capitalEngine`) som overordnet ressurs og **situert omdømme** (`civicationSocialStanding`) som kilde for *hvem* som stoler på spilleren. Kontroller om eksisterende audience-ID-kontrakt må utvides for miljøgrupper før en ny målgruppe innføres; ikke press dette inn i en generisk jobbleder- eller global popularitetsverdi.
- Skill `kjenner stedet`, `deltok`, `bidro`, `ble anerkjent` og `har tillit`. De er forskjellige evidenser, ikke én lineær XP-belønning.
- Kred kan være lokal, betinget, falle ved brudd på tillit og være uavhengig av formell jobb. Kriminalitet eller stereotypisk miljøtilhørighet må aldri utledes fra arbeidsledighet, klær eller bare et besøk.

## 5. History Go gir meningsfull, dokumentert progresjon i Civication

Den kanoniske ruten er:

```text
Besøk / kunnskap / quiz / People / debatt / egen samling i History Go
→ kanonisk, lagret evidens i History Go
→ CivicationProfileSignalBridge (profil-/interessesignaler)
   og CivicationHistoryGoTaskBridge (faktisk task-evidens)
→ relevante, forfattede Life Stories / samtaler / muligheter
→ valgte handlinger og konsekvenser i Civications egne eiere
→ nytt minne, ferdighetsutvikling, relasjon, kapital eller valgbart livsspor
```

**Eksempler som ønskes:**

- Besøke Maridalsvannet → faktisk sted i samlingen og mulige samtaleemner; lære om vannforsyning med Fagverk/quiz → dokumentert kunnskap om historie/byutvikling; bruke innsikten i en konkret scene → mulig styrket dømmekraft eller nye dialogvalg. Besøket i seg selv er ikke en «visdom +5».
- Samle historiske steder og kunnskapsenheter → mulige livsposisjoner som Historievandrer etter reelle terskler; NPC-er kan reagere på hvilke steder spilleren kjenner, uten å vite mer enn spilleren faktisk har opplevd.
- Delta i kultur-/musikkmiljø → nye forbindelser og miljøhendelser; dokumenterte bidrag, gjensidighet og valg kan over tid påvirke streetkred.
- Debatt eller undervisningsrelatert praksis → mulig formidlings-/dømmekraftutvikling når spillerens faktiske handlinger er dokumentert; quizpoeng alene gir ikke politisk autoritet eller jobb.
- History Go-samlingen (steder, kunnskap, personer, merker, notater) må være synlig og *nyttig* i hele livsverdenen: identitet, venner, fritid, prosjekter, dialog, interessebaserte historier og muligheter – også under arbeidsledighet.

Eksisterende `civicationProfileSignalBridge.js` leser allerede `visited_places`, `people_collected`, `merits_by_category`, `hg_learning_log_v1` og gir temavekter for kultur, sport, natur, politikk, sosialt liv, læring, økonomi, hvile, familie og subkultur. **Dette er implementert signalgrunnlag, ikke et ferdig og fullt ut balansert ferdighetssystem.** `civicationHistoryGoTaskBridge.js` skiller fortsatt dokumentert task-completion fra spillerens valg. Ikke lag en ny bro som teller alt på nytt.

Companion-toast/deep-link kan vise frivillige mål, relevante steder, faktisk fremdrift og retur til Civication. Den **gir aldri** poeng, en jobb, en livsposisjon eller kapittel-fullføring alene. Et `explore_category`-mål er utforsking, ikke automatisk «fullført» uten en autoritativ completion-regel.

## 6. Kausalitet, tid og balanse

1. **Ingen «magisk» opptjening:** ferdighet krever riktig type dokumentert praksis; quiz gir faglig kunnskap, ikke automatisk sosial teft, streetkred eller handlekraft.
2. **Ingen dobbeltkreditering:** ett event med stabil ID behandles idempotent, også etter reload, konto-gjenoppretting og appbytte. Derivat-/read-modeller må ikke overskrive originaldata.
3. **Ingen allvitende NPC:** History Go-personer er factualitet og læringsinnhold, ikke fritt oppdiktede historiske samtalepartnere. Civication-NPC har kun informasjon som er etablert i spillet.
4. **Ingen tvungen livsposisjon:** ordinære private Life Stories og progresjon skal fortsette etter dag 7 uten jobb eller spesialmerker.
5. **Ingen falske formelle rettigheter:** ferdigheter/meritter kan skape muligheter og kvalifisert støtte, men ikke automatisk autorisasjon, vedtak, ansettelse, inntekt eller fullmakt.
6. **Vedvarende konsekvenser:** samme spiller, NPC-minne, økonomi, psyke, valghistorikk, samling og ferdigheter skal overleve rollebytte, day progression og legitim kontogjenoppretting.
7. **Ikke knytt en ferdighet til en bestemt personlighet:** det skal være mulig å spille en introvert dyktig formidler, arbeidsledig klok historievandrer eller velstående person med lite lokal tillit.
8. **Vis få oversiktsskalaer i UI:** seks ferdigheter i én samlet profilvisning, eksisterende psyke og kapital i sine eierflater; ikke en lang liste av dupliserte målere.

## 7. Implementeringsrekkefølge og akseptanse

Dette er en **planlagt leveranse**, ikke godkjent produksjon:

- **A – bevar dag 7:** både «Fortsett privatlivet» og valgfri History Go-veiledning; ingen Badge-/rollekrav for ordinære scener.
- **B – organisk 14-dagersløp:** fersk arbeidsledig spiller fortsetter dag 8–14 med relasjon, hobby, fritid, økonomi og etterspill, også uten kvalifiserende Badge; alternative valg og jobbskifte testes separat. Tomme eller blokkerte dager skal rapporteres, ikke fiktivt fylles.
- **C – Skills/evidens:** seks Skills og en read-model finnes; en minimal skriver under `hg_civi_state_v1.skills_v1` tar kun eksplisitt `skills_practice` fra vellykket canonical ChoiceDirector-valg (med `event_id`, `choice_id`, aktivitetstype, Skill og 1–3 poeng), er deduplisert per hendelse og eksponerer aldri gratispoeng fra UI. Dette er et *første teknisk grunnlag*. Kvalifiserende forfattede aktiviteter, erfaring fra jobb og psykologi, reell balansering og konto-gjenoppretting er ennå ikke ferdig godkjent.
- **D – motor og balanse:** implementer kun nødvendig write-/calculate-lag i eksisterende eierskap, med progresjon 0–100, invarianter, myk progresjonskurve og forklaring i UI. Gjenbruk psykologikompetanse og jobblæring.
- **E – History Go-livseffekter:** integrasjonstester for visit → quiz/Knowledge → relevant scene → faktisk valg → korrekt ferdighet/kapital/relasjon, og for kulturmiljø → situert streetkred, uten automatisk belønning ved visning.
- **F – persistens/feilgrenser:** normal flyt, reload, jobbytte, dag-7/14, skyrestore, dobbeltinnlesing, manglende nett/data, frivillig retur fra toast.
- **G – sluttgodkjenning:** faktisk brukerreise i nettleseren og kilde-/forfatterkontroll; skillet `planned` / `implemented` / `CI` / `end-to-end accepted` beholdes.

Se også [Life Story-kontrakten](civication-life-story-system.md), [ikke-karriere-taksonomien](CIVICATION_NONCAREER_ROLE_TAXONOMY.md), [samlingskontrakten](PERSONAL_COLLECTION_V1.md), [progresjonsmodellen](PROGRESSION_MODEL.md), [History Go-returbroen](CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md) og [14-dagers-akseptansen](CIVICATION_ORGANIC_14_DAY_AND_VITALITY_ACCEPTANCE_2026_10_20.md).

## 21-dagerskapittel og valgfri jobb (beslutning 21.10.2026)

De første tre ukene skal kjennes som utviklingen av et liv, ikke en 14-dagers tvangstrakt fra arbeidsledighet til Badge. Dag 8–21 har forfattede aktiviteter i skaping, lokalt engasjement, relasjoner, praktisk hverdagsmestring **og et frivillig jobbspor**. De valgte aktivitetene fører til konkrete påfølgende scener. Jobbsporet navigerer til eksisterende Karriere-tilbud; det gir aldri en jobb eller inntekt direkte.

Etter dokumentert deltakelse på dag 8, sporrelevant praksis på dag 16 og et arkivert, samsvarende dag-21-valg kan en tilsvarende **selvvalgt** livsretning bli tilgjengelig i eksisterende \`CivicationLifePositions\`, uten en ny valuta eller parallell motor. Livsposisjon og faktisk ansettelse er uavhengige; begge kan eksistere samtidig. De ordinære History Go-Badge-stigene beholder sine egne opptjeningskrav, og kan ikke forbigås med dag-21-valget. Ingen retning blir automatisk aktivert. En fortsatt arbeidsledig spiller kan fortsette å søke jobb senere.

Nødvendig oppfølging etter publisering: 21-dagers nettleserreise med reell jobbtilbudsaksept og jobbbytte, kontogjenoppretting, økonomiavregning etter uke 1/2/3, sosialt etterspill og History Go-samling. En grønn node-/CI-regresjon er ikke slik ende-til-ende-akseptanse.
