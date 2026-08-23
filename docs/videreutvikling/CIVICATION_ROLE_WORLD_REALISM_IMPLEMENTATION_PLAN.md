# Civication Role World — implementasjonsplan for rikere livsverdener

Status: **videreutviklingsplan — ikke implementert runtime-kontrakt**  
Sist kontrollert: **2026-08-23**

## 1. Mål

Denne planen beskriver hvordan målene i [`CIVICATION_ROLE_WORLD_REALISM_VISION.md`](./CIVICATION_ROLE_WORLD_REALISM_VISION.md) kan implementeres uten å bryte dagens Civication-arkitektur.

Hovedregelen er:

```text
utvid eksisterende state + Scene Pipeline + task-/consequence-kjeder
før vi vurderer noen ny motor
```

Vi skal ikke implementere alt i én PR. Hvert lag skal bevises med én eller noen få representative roller, permanente tester og full regressjon før neste lag blir blokkerende.

## 2. Verifisert eksisterende arkitektur

Planen bygger på følgende eksisterende eiere:

### Canonical scene- og Role World-lag

- `data/Civication/roleWorldPolicy.json`
- `data/Civication/roleWorldV1.schema.json`
- `data/Civication/roleWorldAuthoringChecklist.json`
- `data/Civication/sceneContractV1.schema.json`
- `data/Civication/compiledSceneRegistryV1.json`
- `scripts/build-civication-scene-registry.mjs`

### Runtime/state

- `js/Civication/core/civicationState.js`
- `js/Civication/core/civicationEventEngine.js`
- `js/Civication/core/civicationTaskEngine.js`
- `js/Civication/systems/day/dayChoiceDirector.js`
- `js/Civication/systems/day/dayConsequences.js`
- `js/Civication/systems/day/dayNpcReactions.js`
- `js/Civication/systems/civicationDailyTaskGates.js`
- `js/Civication/systems/civicationJobLearningRuntime.js`

### History Go bridge

- `js/Civication/systems/civicationHistoryGoTaskBridge.js`
- `js/Civication/ui/CivicationHistoryGoDeepLink.js`
- `docs/CIVICATION_HISTORY_GO_TASK_SCHEMA.md`
- `docs/CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md`
- `tests/civication-history-go-task-bridge.test.js`

### People

- `docs/CIVICATION_SCENARIO_PEOPLE.md`
- `data/Civication/historyPeople_index.json`
- `data/Civication/scenarioPeople_index.json`
- `data/Civication/scenarioPeople/overrides.json`
- `scripts/build-civication-scenario-people-index.mts`
- `tests/civication-scenario-people.test.mjs`

## 3. Viktig governance-beslutning før runtime-utvidelse

Dagens Role World-policy sier eksplisitt `new_runtime_allowed: false`. Det betyr at en framtidig runtime-utvidelse ikke skal smugles inn gjennom en rollefil.

Før første runtime-PR skal vi derfor gjøre én eksplisitt governance-endring som avgrenser at:

- eksisterende Scene Pipeline fortsatt er eneste scene-runtime;
- additive state-/effect-capabilities kan innføres gjennom ordinær runtime-governance;
- Role World-filer alene kan ikke erklære nye runtime-felt som om de allerede eksisterer;
- `role_world_complete` beholder dagens betydning;
- realismeutvidelsen får en egen maskinlesbar status eller en eksplisitt versjonert kontrakt senere.

Dette skal skje i en liten egen PR før funksjonaliteten blir brukt bredt.

## 4. Fase 0 — baseline og kontraktbeskyttelse

### Formål

Bevis hva dagens runtime allerede kan gjøre, slik at vi ikke bygger dobbelt.

### Arbeid

1. Kartlegg om eksisterende `state_set`, flags, `trigger_scene_ids`, thread-state, task-results, daily state og NPC reactions allerede kan dekke deler av behovet.
2. Kartlegg hvilke Role World-reference worlds som allerede simulerer vedvarende saker redaksjonelt uten eksplisitt objektstate.
3. Legg permanente tester rundt dagens grenser.
4. Dokumenter hvilke nye felter som faktisk krever schema-/runtime-endring.

### Tester

Minst:

- `tests/civication-role-world-contract.test.js`
- `tests/civication-compiled-scene-registry.test.js`
- `tests/civication-compiled-scene-registry-parity.test.js`
- `tests/civication-scene-interaction-contract.test.js`
- `tests/civication-history-go-task-bridge.test.js`
- `tests/civication-scenario-people.test.mjs`
- `tests/civication-semantic-playthrough-gate.test.js`

### Exit-kriterium

Ingen ny state introduseres før vi har bevist at den ikke allerede finnes i en egnet form.

## 5. Fase 1 — vedvarende arbeidsobjekter

Dette er første funksjonelle hovedfase.

### 5.1 Data-kontrakt

Opprett en liten, typed og generell kontrakt for arbeidsobjekter. Arbeidsobjekt er ikke et nytt sceneformat.

Foreslått modell:

```text
work_object_id
kind
role_scope
institution_id?
title/status/phase
opened_at
updated_at
people_refs[]
place_refs[]
knowledge_refs[]
open_questions[]
deadline?
confidentiality?
history[]
closed_at?
```

`history[]` skal være append-only for viktige state-overganger og ikke en kopi av full scenehistorikk.

### 5.2 State-eierskap

Utvid `CivicationState.DEFAULTS` additivt med et felt tilsvarende:

```text
work_world: {
  objects_by_id: {},
  active_object_ids: [],
  role_object_ids: {},
  shared_object_ids: []
}
```

Eksisterende `deepMerge` gjør dette mulig uten å ødelegge gamle save states, men migrasjon og normalisering skal likevel testes eksplisitt.

### 5.3 Ren state-helper

Lag en liten typed helper, fortrinnsvis TypeScript, som eier:

- `getWorkObject(id)`
- `upsertWorkObject(seed)`
- `transitionWorkObject(id, transition)`
- `appendWorkObjectHistory(id, event)`
- `closeWorkObject(id, outcome)`
- `listWorkObjectsForRole(roleScope)`

Den skal ikke velge scener eller drive dagen. Den er kun en state-adapter.

### 5.4 Scene-kontrakt

Utvid `civication_scene_v1` additivt med et valgfritt `work_context` eller tilsvarende felt, for eksempel:

```text
work_context: {
  object_ids: [...],
  institution_id?: ...,
  operation?: ...,
  deadline_ref?: ...
}
```

Utvid `effects` med en strengt validert og begrenset work-object-operasjon i stedet for fri vilkårlig JSON.

Eksempel:

```text
effects.work_object_ops = [
  { op: "transition", work_object_id: "...", to_status: "..." },
  { op: "append_fact", work_object_id: "...", key: "...", value: "..." }
]
```

Ikke bruk fri nested `state_set` for komplekse arbeidsobjekter; det blir vanskelig å validere og vanskelig å migrere.

### 5.5 Effect-applikasjon

Koble work-object-operasjoner inn i samme konsekvenskjede som øvrige scene-effects. Ikke lag en separat choice engine.

Aktuelle integrasjonspunkter som først skal auditeres:

- `js/Civication/systems/day/dayChoiceDirector.js`
- `js/Civication/systems/day/dayConsequences.js`
- `js/Civication/core/civicationEventEngine.js`

### 5.6 Scene Registry

`scripts/build-civication-scene-registry.mjs` må:

- bevare `work_context` deterministisk;
- validere refererte IDs;
- ikke produsere tilfeldige object IDs ved build;
- sikre parity mellom authored source og compiled scene.

### 5.7 Pilot

Første pilot bør være en rolle hvor persistent case state er faglig naturlig. Anbefalt kandidat når dens normale playability-rollout er ferdig:

`historie/historie_arkiv_og_dokumentasjon`

Pilotobjekter kan være:

- `archive_delivery`;
- `access_request`;
- `digital_preservation_incident`.

### Exit-kriterium

Minst ett arbeidsobjekt skal:

1. opprettes i én scene;
2. endres i en senere scene;
3. påvirkes av spillerens valg;
4. leses igjen etter minst én mellomliggende scene;
5. overleve reload/save;
6. ha deterministisk historikk;
7. ikke kreve en ny Scene Pipeline.

## 6. Fase 2 — institusjonsstruktur og myndighet

### 6.1 Editorial contract

Role World skal kunne deklarere institusjonell struktur, minimum:

- `institution_id`;
- team/unit;
- reporting line;
- sideordnede fagfunksjoner;
- eksterne motparter;
- approval points;
- authority boundaries;
- scarce resources;
- organizational goals/pressures.

### 6.2 Runtime-prinsipp

Mesteparten av dette bør være authored context, ikke egen state.

Runtime-state brukes bare på ting som faktisk endrer seg, for eksempel:

- approval granted/denied;
- capacity pressure;
- reassignment;
- escalation status;
- temporary authority delegation.

### 6.3 Scene-kobling

`work_context.institution_id` og eventuelt `authority_context` gjør at samme arbeidsobjekt kan forstås i riktig organisatorisk posisjon.

### 6.4 Tester

Legg gate som avviser scener hvor spilleren utfører en handling roleModel/authority boundary eksplisitt forbyr uten en definert escalation/authorization-bro.

### Exit-kriterium

Piloten skal bevise forskjellen mellom:

- spillerens faglige anbefaling;
- leder-/spesialistgodkjenning;
- formell beslutningsmyndighet;
- ekstern parts påvirkningskraft.

## 7. Fase 3 — History Go-kunnskap endrer handlingsrom

### 7.1 Ikke ny læringsmotor

`CivicationTaskEngine` støtter allerede `place`, `person`, `knowledge`, `debate` og `unlock`, samt konkrete completion modes. `civicationHistoryGoTaskBridge.js` eier completion-handoff.

Vi skal bygge videre på disse.

### 7.2 Ny capability-lesing

Lag en read-only resolver som kan svare på:

```text
har spilleren fullført denne konkrete tasken?
har spilleren denne dokumenterte knowledge completion?
har spilleren besøkt/lest/quizet targeten på riktig måte?
```

Ikke kopier History Go-progresjonen inn i Civication som ny sannhetskilde.

### 7.3 Choice affordances

Utvid scene-/choice-kontrakten med eksplisitte requirements, for eksempel:

```text
requires: {
  task_completion_ids: [...],
  flags_all: [...],
  competency_min?: ...
}
```

ChoiceDirector skal kunne:

- vise eller aktivere et ekstra faglig alternativ når krav er oppfylt;
- eventuelt vise låst begrunnelse når produktdesignet ønsker læringseffekt;
- aldri endre frosne answer keys eller pinned knowledge-regler dynamisk.

### 7.4 Return til samme arbeid

History Go-tasken skal bære `return_context` som peker tilbake til:

- `role_scope`;
- `scene/thread`;
- `work_object_id`;
- ønsket continuation.

Når completion registreres, skal senere scene velges gjennom eksisterende next-action/scene pipeline, ikke gjennom en hardkodet særside.

### 7.5 Knowledge-effekt

Kunnskap kan åpne:

- bedre observasjon;
- bedre spørsmål;
- bedre begrunnelse;
- mindre risikabel handling;
- raskere korrekt løsning.

Kunnskap kan ikke alene åpne formell profesjonsmyndighet.

### Exit-kriterium

Én pilotbue må bevise:

```text
arbeidsproblem → History Go-task → completion → return → nytt relevant valg → senere konsekvens
```

## 8. Fase 4 — realistisk arbeidsrytme, backlog og rework

### 8.1 Ingen ny dagmotor

Bruk eksisterende day/phase-system og SceneDirector.

### 8.2 Additive metadata

Utvid scene-/work context med små, deklarative signaler:

- `deadline_day` / `deadline_phase`;
- `blocked_by_object_id`;
- `waiting_for_actor_id`;
- `handoff_to_actor_id`;
- `priority`;
- `interrupts`;
- `rework_of_scene_id` eller `rework_of_object_transition`.

### 8.3 Daily selection

Audit og utvid ved behov:

- `civicationDailyTaskGates.js`;
- SceneDirector/daily catalog;
- `civicationDailyMailBuilder.js` / `civicationWorkdayMailBuilder.js` der de fortsatt er adaptere inn i canonical scenes.

Regler skal være deterministiske og ikke oversvømme spilleren.

### 8.4 Hverdagsbeats

For hver pilotrolle bør minst noen beats være:

- ack/info;
- rutine;
- kontroll;
- venting;
- rework;
- håndover;
- lavintensitetsarbeid.

De skal fortsatt ha gameplay-verdi gjennom kontekst, state eller senere konsekvens, ikke være rent tekstfyll.

### Exit-kriterium

14-dagersløpet skal ha yrkesspesifikk rytme uten at antallet store beslutninger økes kunstig.

## 9. Fase 5 — situert omdømme og relasjonell tillit

### 9.1 Behold eksisterende reputation

`career.reputation` beholdes som legacy/globalt sammendrag så lenge andre systemer leser det.

### 9.2 Ny struktur

Legg additivt til et begrenset map-system, for eksempel:

```text
social_standing: {
  by_audience: {
    "manager:<id>": number,
    "team:<id>": number,
    "professional:<id>": number,
    "public:<context>": number
  }
}
```

Ikke opprett alle akser for alle roller. IDs skal komme fra authored role/institution context.

### 9.3 NPC reactions

`dayNpcReactions.js` og relasjonelle consequence-kjeder skal kunne lese relevant situert standing i stedet for bare global reputation.

### 9.4 Aggregat

Hvis UI fortsatt trenger én reputation-verdi, kan den beregnes eller oppdateres som et grovt sammendrag. Det situerte kartet skal ikke ukritisk summeres til «sosial score».

### Exit-kriterium

En pilot skal kunne ende med to motstridende relasjonelle resultater, for eksempel høy kollegatillit og lav ledertillit, og dette skal gi ulike senere scener.

## 10. Fase 6 — arbeidsvilkår

### 10.1 Gjenbruk eksisterende life/career-state

Før nye felt opprettes skal vi audite:

- active position / job history;
- salary/economy;
- life position;
- livelihood;
- psyche;
- work ability/benefits dersom dette faktisk finnes i aktiv state;
- obligations.

### 10.2 Minimal utvidelse

Bare manglende, generelle arbeidsstatusfelt bør innføres, for eksempel:

- contract kind;
- probation end;
- weekly hours category;
- overtime balance;
- leave state.

Ikke bygg HR-simulator.

### 10.3 Consequences

Arbeidsvilkår skal bare få gameplay-effekt når de er relevante for rollen/buen, eksempelvis:

- midlertidighet påvirker risiko ved å protestere;
- overtid påvirker psyke/privatliv;
- ansvar uten tittel påvirker trust/status;
- ferie/fravær påvirker handover.

### Exit-kriterium

Minst én rolle skal vise at samme faglige valg oppleves ulikt avhengig av faktisk arbeidssituasjon, uten å redusere spillet til økonomisk optimalisering.

## 11. Fase 7 — profesjonskultur

### 11.1 Primært authored data

Profesjonskultur bør først bo i Role World/roleModel/FWG, for eksempel:

- vocabulary;
- craftsmanship norms;
- meeting rituals;
- junior/senior norms;
- informal spaces;
- taboo shortcuts;
- professional pride;
- status symbols;
- recurring mundane practices.

### 11.2 Scene-kompilering

Scene Registry trenger normalt bare provenance og eventuelle tags/refs. Ikke opprett en `ProfessionalCultureEngine`.

### 11.3 Tester

Kvalitetsgate bør kontrollere:

- at profesjonskultur har role-specific substance;
- at samme generiske setninger ikke massebrukes på tvers av roller;
- at virkelige grupper ikke karikeres;
- at authored praksis har provenance til roleModel/FWG/Role World.

## 12. Fase 8 — cross-role shared world

Dette implementeres etter at work objects og institutions er stabile.

### 12.1 Stable IDs

Delte objekter må ha stabile IDs som ikke inkluderer aktiv rolle hvis objektet faktisk skal leve på tvers av karrierer.

Eksempel:

```text
shared:planning_case:lillebekk
shared:archive_collection:...
shared:event:...
```

Fiktive pilotsaker skal markeres som fiktive og må ikke kollidere med canonical historiske fakta.

### 12.2 Perspektiv fremfor delt autoritet

Samme objekt kan eksponeres forskjellig per rolle:

```text
shared object
→ role lens
→ permitted operations
→ role-specific knowledge needs
→ role-specific scenes
```

Journalistens tilgang til en plansak betyr ikke planmyndighet. Arkivarens kjennskap til en samling betyr ikke forskerens tolkingsautoritet, og omvendt.

### 12.3 Cross-role handoff

Et objekt kan etter avsluttet rolle bli liggende som read-only/shared state og senere gjenåpnes gjennom en annen rolle når authored data eksplisitt støtter det.

### 12.4 Privacy/factuality

Delte helse-, elev-, klient- eller personalobjekter skal ikke brukes som cross-role gameplay bare fordi teknikken tillater det. Slike domener krever egne strengere grenser og bør som hovedregel bruke abstraherte/fiktive case-data.

### Exit-kriterium

Minst ett shared object skal kunne oppleves fra to roller med:

- samme objekt-ID;
- ulikt handlingsrom;
- ulik faglig informasjon;
- forskjellige mennesker/authority chains;
- ingen lekkasje av rolleprivilegier.

## 13. Fase 9 — People-integrasjon som permanent rollout-gate

Denne fasen skal i praksis bygges inn i alle rolloutene fra starten, men får egen permanent gate når mekanikken er stabil.

### Hver rolle skal bevise

1. Scenario People er generert og synkronisert.
2. Eksisterende canonical People er vurdert før nye virkelige People opprettes.
3. Fiktive recurring work actors har `fictional: true` og holdes utenfor canonical People.
4. `history_go_person` tasks peker til faktisk eksisterende People-ID.
5. Place-bound personreferanser arver canonical `placeId`; rollen oppfinner ikke et nytt sted.
6. `missing_people_candidates` materialiseres aldri automatisk.
7. Virkelige People brukes faktabasert som knowledge/task/reference, ikke fri NPC-dialog.

### Tester

Utvid Scenario People-testene og rolle-spesifikke playability-tester til å kontrollere disse grensene.

## 14. Fase 10 — realisme-matrise og completion

Når minst tre forskjellige yrkestyper er bevist, opprett en separat maskinlesbar audit/matrise.

Foreslåtte dimensjoner:

```text
persistent_work_objects
institutional_structure
history_go_affordance
realistic_work_rhythm
rework_and_handoffs
situated_reputation
employment_conditions
professional_culture
cross_role_links
people_integrity
```

Status per dimensjon kan være for eksempel:

- `not_started`
- `editorial_only`
- `runtime_proven`
- `reference_proven`

Ikke gjenbruk `reference_complete` eller `role_world_complete` til dette uten eksplisitt versjonering.

## 15. Anbefalt pilotrekkefølge

For å unngå at mekanikken overtilpasses én type arbeid:

### Pilot A — arkiv/dokumentasjon

Beviser:

- persistent work objects;
- provenance;
- access/authority;
- History Go knowledge;
- rework;
- handover.

### Pilot B — by-rådgiver plan

Beviser:

- institusjonsstruktur;
- ekstern motpart;
- offentlig/politisk makt;
- situert reputation;
- shared case potensial.

### Pilot C — sport-utøver eller annen kropp-/prestasjonshverdag

Beviser:

- helt annen arbeidsrytme;
- recovery;
- team/coach trust;
- kontrakt/status;
- at systemet ikke bare passer kontorarbeid.

### Pilot D — undervisning/journalistikk

Beviser:

- knowledge→affordance;
- publikum/student/kilde-relasjoner;
- profesjonskultur;
- rework/feedback.

Først etter dette bør realisme-gaten rulles bredt ut.

## 16. PR-strategi

Én hovedmekanikk per PR. Ikke bland global runtime-endring og flere rolleproduksjoner i samme PR.

Anbefalt sekvens:

1. **Governance/contract PR** — definer tillatt additive runtime-utvidelse og statussemantikk.
2. **Work-object schema/state PR** — state helper + schema + unit tests, ingen stor content rollout.
3. **Work-object scene/effect PR** — Scene Contract + compiler + effect handling + parity tests.
4. **Arkiv pilot PR** — én rolle bruker arbeidsobjekter gjennom en full bue.
5. **Institution/authority PR** — kontrakt + runtime minimal state + tester.
6. **History Go affordance PR** — task completion resolver + choice requirements + bridge tests.
7. **Arkiv/by pilot PR** — bevis knowledge→choice og authority.
8. **Rhythm/rework PR** — metadata + daily selection/gates.
9. **Situated reputation PR** — additive state + NPC reaction paths.
10. **Employment conditions PR** — kun dersom audit viser faktiske state-gap.
11. **Professional culture contract PR** — primært editorial/schema/test.
12. **Cross-role shared object PR** — stable shared IDs + role lenses.
13. **Second-role shared-world pilot PR**.
14. **Realism matrix/gate PR**.
15. Deretter **én rolle per rollout-PR**, på samme måte som dagens Civication-systematiske produksjon.

## 17. Teststrategi

Hver mekanikk skal ha tre nivåer.

### 17.1 Unit/contract

Tester ren data- og state-semantikk:

- schema validity;
- migration/defaults;
- transitions;
- illegal operations;
- deterministic ordering;
- authority boundary;
- People/factuality boundaries.

### 17.2 Pipeline parity

Bevis at authored data og compiled registry samsvarer:

- source → compiled scene;
- work_context preserved;
- choices/effects preserved;
- task/return context preserved;
- no shadow/generic fallback.

### 17.3 Semantic playthrough

En faktisk spillsekvens skal bevise:

```text
scene A
→ work-object state
→ scene B
→ History Go task
→ completion
→ return
→ choice unlocked
→ work-object transition
→ NPC/institution reaction
→ delayed consequence
```

Reload mellom minst to steg bør inngå i testen for persistent state.

## 18. Save-/migreringskrav

Eksisterende `hg_civi_state_v1` må fortsatt kunne leses.

Alle nye additive felt skal:

- ha sikre defaults;
- tåle manglende felt;
- normaliseres før bruk;
- ikke kreve at gamle save states slettes;
- ikke endre aktiv jobb eller gammel inbox ved migrering;
- ikke doble scene-/object-history ved reload.

Hvis state-strukturen på et tidspunkt blir for stor for dagens blob, skal dette behandles som egen storage-migrering, ikke skjules i en content-PR.

## 19. TypeScript-retning

Nye rene helpers bør skrives i TypeScript der repoets browser/build-oppsett tillater det, i tråd med TypeScript-first-policyen.

Legacy JS-runtime skal ikke omskrives en masse bare for å implementere denne planen. Grenser skal types gjennom:

- tydelige interfaces/types;
- små pure functions;
- discriminated unions for object/effect operations;
- exhaustiveness for operation kinds;
- minst mulig `any`.

## 20. UI-plan

Første faser trenger svært lite ny UI.

### Minimum

- vis sak/arbeidsobjekt-tittel i relevant scene/mail;
- vis status eller «du arbeider fortsatt med …» der det forbedrer forståelsen;
- bevare History Go-return context;
- kunne forklare hvorfor et kunnskapsbasert valg er tilgjengelig/låst.

### Senere

Når mekanikken er bevist kan Civication Home/Min dag få:

- «Aktive saker»;
- «Venter på»;
- «Frist»;
- «Nylig oppdatert»;
- «Kunnskap som kan hjelpe».

Ikke bygg dashboard før arbeidsobjektmodellen er stabil.

## 21. Telemetri/debugging i utvikling

For å gjøre feil sporbare bør utviklermodus kunne vise en read-only snapshot av:

- active work objects;
- object status/history;
- institution/authority context;
- task completions relevant to active case;
- situated standing;
- pending delayed consequences.

Dette skal være skjult utviklerflate, ikke produktkrav for sluttbruker.

## 22. Failure modes vi skal beskytte mot

### Generic-object inflation

Alle roller får samme `case_1`, `case_2`, `case_3` med nytt navn. Forbudt.

### State uten dramaturgi

Vi legger inn masse state som ingen senere scene leser. Dette gir kompleksitet uten livsverden.

### Dramaturgi uten state

Teksten påstår at «gårsdagens sak kommer tilbake», men det er egentlig en isolert scene uten faktisk forbindelse.

### Authority leakage

Knowledge/badge/reputation gir spilleren myndighet rollen ikke har.

### People leakage

En ekte person brukes som fiktiv sjef/kollega med oppdiktet dialog.

### Cross-role privilege leakage

En rolle arver sensitive data eller myndighet fra en annen bare fordi objekt-ID-en deles.

### Completion inflation

En rolle får ny realisme-status fordi filer finnes, uten semantic playthrough.

### Scene Pipeline fork

En ny feature begynner å levere scener utenfor `civication_scene_v1`/compiled registry. Forbudt.

## 23. Definition of Done for hele videreutviklingsprogrammet

Programmet er først modent nok for bred rollout når:

1. minst tre strukturelt forskjellige yrkestyper har runtime-bevis;
2. persistent work objects overlever reload og påvirker senere scenes;
3. institusjon/authority er maskinlesbart nok til å blokkere åpenbare autoritetsbrudd;
4. én History Go completion gir et nytt relevant handlingsrom uten å gi falsk formell kvalifikasjon;
5. arbeidstempo/rework er forskjellig mellom minst to yrkestyper;
6. situert standing gir ulike NPC-/institusjonelle reaksjoner;
7. People-integritet er permanent testet;
8. minst ett shared object fungerer på tvers av to roller uten privilege leakage;
9. compiled registry parity er grønn;
10. semantic playthrough er grønn;
11. full Civication-suite og TypeScript-gates er grønne;
12. en egen realisme-matrise viser faktisk implementert dekning uten å omskrive historien til eksisterende `role_world_complete`.

## 24. Første konkrete implementeringsoppgave etter dokumentasjonen

Når det systematiske career-playability-sporet tillater det, bør første kodearbeid være:

**Persistent Work Object Foundation**

Scope:

- state contract + typed helper;
- additive Scene Contract metadata/effects;
- compiler parity;
- unit tests;
- ingen bred rolleproduksjon;
- deretter én separat pilot-PR for `historie/historie_arkiv_og_dokumentasjon`.

Dette gir størst realismegevinst per ny mekanikk og danner grunnlaget for institusjon, rhythm, rework, History Go-affordances og cross-role shared world.
