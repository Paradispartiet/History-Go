# Civication Patch Order

Status: **canonical runtime coordination guide**  
Sist kontrollert: **2026-08-17**

Civication-runtimen består av flere små moduler, men to kritiske grenser er nå strangler-migrert og skal behandles som canonical:

1. **kandidat-/scenegrensen**: `CivicationSceneCatalog` + `CivicationSceneDirector`;
2. **svargrensen**: `CivicationChoiceDirector`.

Historiske broer og aliaser kan fortsatt eksistere for kompatibilitet, men de eier ikke lenger rå work-kilder eller `EventEngine.answer`.

> Kilder: faktisk runtimekode i `js/Civication/`, `data/Civication/SCENE_PIPELINE_V1.md`, `data/Civication/scenePipelinePolicyV1.json` og permanente Scene Pipeline-regresjoner. Ved konflikt skal kode + testet pipeline vinne over eldre README-formuleringer.

## Oversikt

```text
authored work source (`mailFamilies` m.m.)
        ↓ build
compiled_scene_registry_v1
        ↓
CivicationSceneCatalog
        ↓
CivicationMailRuntime plan/progresjonsfiltrering
+ CivicationSceneDirector samlet kandidat-/day-/EventEngine-eierskap
        ↓
delivery / NextAction / EventEngine queue
        ↓
CivicationChoiceDirector
        ↓
domeneeide middleware/handlers
        ↓
state / consequence / progression / livelihood / UI-events
```

Private, life, narrative og social går via registrerte SceneCatalog-source adapters. De skal ikke opprette konkurrerende svar- eller sceneeierskap.

---

## De tre delte sømmene

### 1. Scene/kandidat-sømmen

Canonical source-/kandidatsøm er nå:

- `window.CivicationSceneCatalog` — laster/normaliserer canonical kilder;
- `window.CivicationSceneDirector` — samler kandidatvalg for Workday, Daily og EventEngine;
- `CivicationMailRuntime` — eier plan/progresjon og filtrering mot resolved scene-data.

For work-scenes leser `CivicationSceneCatalog.getRoleMails()` det materialiserte `data/Civication/compiledSceneRegistryV1.json` gjennom `role_index`. Rå `mailFamilies` er **source-of-build**, ikke normal runtime-kilde.

`CivicationMailRuntime.makeCandidateMailsForActiveRole(active, state)` gjør ikke lenger egen rå kataloglasting. Den krever SceneCatalog og bruker:

```text
SceneCatalog.getRolePlan(active)
+ SceneCatalog.getRoleMails(active, state)
→ MailRuntime.selectCandidateMailsFromResolvedSources(...)
```

Hvis SceneCatalog mangler, lukkes planned gameplay fail-closed og returnerer ingen kandidater.

### 2. Canonical svar-søm

`CivicationChoiceDirector` er eneste aktive eier av `CivicationEventEngine.prototype.answer` i standardruntime. Rundt-svar-semantikk registreres som prioritert middleware; etter-svar-konsekvenser registreres som handlers.

Ny kode skal **ikke** direkte wrappe eller erstatte `EventEngine.answer`.

### 3. Event-bussen

Løs, rekkefølge-uavhengig kobling bruker `window`-events som `civi:npcReaction`, `civi:inboxChanged`, `civi:dayPhaseChanged` og `updateProfile`.

Event-bussen skal brukes for observasjon/varsling, ikke som skjult eier av scenevalg eller svartransaksjonen.

---

## Kandidatpipeline etter 4H-D

### Source ownership

For work-scenes:

```text
mailFamilies / authored catalogs
→ scripts/build-civication-scene-registry.mjs
→ compiledSceneRegistryV1.json
→ CivicationSceneCatalog.getRoleMails()
```

Registryet validerer schema/version, krever null shadowed duplicates og gir SceneCatalog en deterministisk `role_index`.

Brand-scener ligger i samme compiled registry og filtreres mot aktiv `brand_id`, slik at Ekspeditør-varianter ikke lekker mellom arbeidsgivere.

### Plan ownership

`mailPlan` er fortsatt authored progresjonsplan. SceneCatalog kan laste planen, men `CivicationMailRuntime` eier:

- current step;
- consumed IDs;
- plan history;
- strict family/type matching;
- fallback **innen canonical plan/data**;
- kandidat-scoring/rangering;
- plansteg-progresjon etter gyldig svar.

«Fallback» her betyr eksplisitte `fallback_types` eller andre canonical plansteg mot det samme resolved scene-settet. Det betyr **ikke** legacy-pack, RoleStoryletBridge, rå jobbmails eller generisk syntetisk karrieremail.

### SceneDirector ownership

SceneDirector er den samlede runtimeinngangen for Workday/Daily/EventEngine-kandidater og bevarer blant annet:

- outcome-aware selection;
- Daily-ekstrascener;
- terminalt lukket karriere;
- Scene Interaction-kontrakten;
- katalog- og selection provenance.

Kompatibilitetsaliaser kan finnes, men skal delegere inn i denne kjeden i stedet for å opprette en ny kildeleser.

### Fail-closed-regel

Etter 4H-C gjelder:

- null canonical kandidater → tom/no-op gameplay-resultat;
- SceneDirector/SceneCatalog-feil → fail-closed tom kandidatpool;
- ingen `legacy_pack`-fallback;
- ingen RoleStoryletBridge-fallback;
- ingen gammel `buildMailPool`-fallback;
- ingen syntetisk generisk karrieremail.

Manglende gameplay skal løses ved å produsere canonical authored innhold, ikke ved å skjule hullet i runtime.

---

## Canonical `answer`-pipeline

### ChoiceDirector-eier

`systems/day/dayChoiceDirector.js` eier den offentlige svargrensen. Den:

- validerer Scene Interaction-kontrakten (`decision`, `task`, `ack`, `info`) før state-mutasjon;
- eier `registerAnswerMiddleware(name, fn, priority)`;
- eier `registerHandler(name, fn, priority)`;
- eksponerer faktisk middleware-rekkefølge;
- adopterer deferred registreringer fra moduler som lastes tidligere.

Lavere middleware-prioritet ligger ytterst og kjøres derfor først før `next()` og sist etter `next()`.

### Middleware-rekkefølge

| Prioritet | Modul | Ansvar |
| --- | --- | --- |
| 10 | `dayActiveRoleStateSync` | synk av mail/thread/aktiv rolle etter vellykket svar |
| 20 | ChoiceDirector builtin `choice_contract` | Scene Interaction-validering og choice-handlerpunkt |
| 30 | `CivicationLifeMailRuntime` | registrerer besvart life/private scene/mail |
| 40 | `CivicationDailyMailBuilder` | Daily-runtime markering, suppression og rollback |
| 50 | `CivicationJobEligibilityRuntime` | reentry-/eligibility-state |
| 60 | `CivicationJobLearningRuntime` | kvalifiserende jobblæring |
| 70 | `CivicationCareerOutcomeRuntime` | terminalt karriereutfall |
| 80 | `CivicationMailRuntime` | planned/thread planstate, brandkonsekvens og triggered thread |
| 90 | `dayPatches` | recovery/onboarding/task-/fasekoordinering rundt original answer |

Effektiv nesting:

```text
ActiveRole pre
→ choice contract
  → Life
    → Daily
      → Eligibility
        → Learning
          → CareerOutcome
            → MailRuntime
              → dayPatches
                → original EventEngine.answer
              ← dayPatches post
            ← MailRuntime post
          ← CareerOutcome post
        ← Learning post
      ← Eligibility post
    ← Daily post/rollback
  ← Life post
← choice handlers
← ActiveRole post
```

### Choice-handlere

Handlers reagerer på et **kildeeid, vellykket valg** etter inner svarpipeline. De skal ikke brukes til rundt-semantikk som trenger før/etter `next()`.

| Prioritet | Handler | Funksjon |
| --- | --- | --- |
| 10 | `dayConsequences` | kapital/psyke/grenbias-deltaer |
| 15 | `character_reply_consequence` | NPC-karaktersvar |
| 20 | faction reaction | fraksjonsfarget NPC-reaksjon |
| 20 | `npcReactions` | produserer `civi:npcReaction` |

Levevei-opportunities og andre domeneeide konsekvenser skal kobles til den vellykkede canonical scene-/choice-transaksjonen; de skal ikke introdusere en alternativ answer-motor.

---

## Scene Interaction-kontrakten

Scene Pipeline skiller mellom:

- `decision` — minst to reelle kildeeide valg;
- `task` — eksplisitt `task_contract`;
- `ack` — eksplisitt bekreftelse/ett kildeeid valg;
- `info` — ingen valg nødvendig.

Runtime skal ikke generere standardvalg for å gjøre passivt eller mangelfullt innhold «spillbart».

Dette er spesielt viktig for Role World-produksjon: 14 dager × fire dramaturgiske ankerpunkter betyr ikke 56 kunstige A/B/C-spørsmål. Morgen kan være `info`, lunsj en relationship/conversation, ettermiddag `decision` eller `task`, og kveld en private consequence/ack-scene.

---

## Role World og kandidatpipeline

`docs/CIVICATION_ROLE_WORLD_STANDARD.md` er en **redaksjonell produksjonsstandard**, ikke runtime-eier.

En Role World skal materialiseres i eksisterende canonical kilder:

```text
roleModel / FWG / mailPlan / authored work data
+ private / life / narrative / social sources
→ SceneCatalog-grensen
```

Ikke bygg:

- `roleWorldRuntime`;
- ny separat korrespondansemotor;
- livelihood-mailmotor;
- bolig-mailmotor;
- ny SceneDirector;
- ny answer-wrapper.

Hvis en ny type producer trengs, skal den enten materialisere til et registrert source-format eller registreres eksplisitt som source adapter i SceneCatalog-policyen.

---

## Renderer-dekoratører

`renderWorkdayPanel` og `renderCivicationInbox` kan dekoreres for visning, men rendererne eier ikke konsekvensberegning.

Eksempler:

| Modul | Injiserer |
| --- | --- |
| `dayConsequencesUI` | konsekvensboks i innboks/arbeidsdag |
| `dayNarrativeConsequencesUI` | narrativ konsekvenstekst |

Effektene skal komme fra den canonicale svar-/konsekvenskjeden.

---

## Event-bussen

| Event | Typisk produsent | Typisk bruk |
| --- | --- | --- |
| `civi:booted` | Civication boot | moduler som venter på ferdig boot |
| `civi:dataReady` | boot/dataflyt | state-sync m.m. |
| `civi:inboxChanged` | progression/mail | UI |
| `civi:dayPhaseChanged` | day progression | fase-UI |
| `civi:npcReaction` | NPC reaction handlers | allianse/fraksjon/karaktertråder |
| `updateProfile` | flere domener | profil/AHA-lesing |

---

## Regler for ny kode

1. **SceneCatalog/SceneDirector eier kandidatgrensen.** Ikke opprett en parallell raw-source reader.
2. `mailFamilies` er authored source-of-build for work, ikke normal runtime API.
3. `CivicationMailRuntime` eier plan/progresjon mot resolved scene-data.
4. **ChoiceDirector eier svargrensen.** Ikke opprett direkte `proto.answer = ...`-patcher.
5. Bruk `registerAnswerMiddleware` for rundt-svar-semantikk.
6. Bruk `registerHandler` for konsekvenser av et vellykket valg.
7. Middleware må kalle `next()` maksimalt én gang.
8. Ikke skriv samme effekt i flere domener uten eksplisitt kontrakt.
9. Manglende canonical innhold skal fail-closed; ikke legg inn generisk fallback.
10. Role World-innhold skal bruke eksisterende scene-/source-arkitektur.
11. Oppdater denne filen hvis runtime-eierskap faktisk flyttes.

---

## 4F–4H status

- **4F fullført:** `CivicationChoiceDirector` er eneste aktive `EventEngine.answer`-eier.
- **4G fullført:** private, life, narrative og social er bak registrerte SceneCatalog-source adapters.
- **4H-A fullført:** deterministic `compiled_scene_registry_v1`-kontrakt/compiler.
- **4H-B fullført:** normal work-runtime leser compiled registry gjennom SceneCatalog; parity/sync er gated.
- **4H-C fullført:** legacy gameplay fallbacks er lukket fail-closed.
- **4H-D fullført:** primær MailRuntime-path bruker SceneCatalog/compiled registry, brand-isolasjon er bevart, og permanent semantisk playthrough tester `compiled scene → EventEngine delivery → ChoiceDirector answer → MailRuntime progression`.

Det finnes derfor **ingen planlagt 4H-E** i denne dokumentasjonslinjen. Neste verdiløft er primært authored gameplay/Role World-dybde og dokumentert produktinnhold, ikke en ny kandidat- eller svararkitektur.

## Kjente dokumentasjons-/kompatibilitetsforbehold

- Historiske navn som `mail`, `mailPlanBridge` og `RoleStoryletBridge` kan fortsatt finnes i kode eller eldre data. De skal ikke tolkes som dagens source ownership.
- `systems/civicationRuntimeSanityGuard.js` har historisk answer-patchkode, men lastes ikke av standardruntime. Hvis den skal aktiveres, må den først inn i ChoiceDirector-kontrakten.
- Runtimefiler kan beholde migreringskompatibilitet så lenge permanente tester beviser at normal produksjonsflyt ikke gjenåpner legacyveier.
