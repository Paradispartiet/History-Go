# Civication flow audit

Dette dokumentet kartlegger faktisk Civication-spillflyt slik koden er organisert nå. Det er en dokumentasjons- og kontrakts-PR: ingen runtime-kode, CSS eller data er endret.

## 1. Nåværende bootflyt

### Scripts som lastes av `Civication.html`

`Civication.html` laster Civication som én klassisk script-kjede i fast rekkefølge:

1. **State og mail-lagring**: `civicationStorageTrace.js`, `core/civicationState.js`, `systems/civicationMailEngine.js`, `systems/civicationActivePositionRecovery.js`, `systems/civicationRoleStarter.js`.
2. **Data, tier og jobbtilbud**: `tiersCivi.js`, `core/civicationJobs.js`, brand-/career-resolvere, `merits-and-jobs.js`.
3. **Core engines**: `roleStoryletBridge.js`, `core/civicationCalendar.js`, `core/civicationTaskEngine.js`, `core/civicationEconomyEngine.js`, `mailPlanBridge.js`, `civicationObligationEngine.js`, `storyResolver.js`.
4. **People / day scoring**: møte-, tone-, alliance-, faction- og reply-systemene under `systems/day/`.
5. **Event/domain**: `core/civicationEventEngine.js`, conflict loader, capital engines.
6. **Identity og psyke**: `identityCore.js`, `identityCompass.js`, `identityEngine.js`, `core/CivicationPsyche.js`.
7. **Lifestyle, commercial, home, public og map**: lifestyle/commercial, home/public/map/system-map UI.
8. **UI**: NPC/event channels, `CivicationUI.js`, dashboard, mini sections, inbox top action, empty panels, debate/people/store/onboarding UI.
9. **Day/weekly runtime**: calendar bridge, day progression, History Go contexts, place access bridge, people engine, carryover, weekly review, day knowledge/events/patches, mail runtime, career outcome runtime, daily mail builder/gates, brand job progression, life mail runtime, day choice/consequence/NPC/debate/debug systems.
10. **Onboarding og boot**: `js/onboarding/onboardingEngine.js`, deretter `js/Civication/CivicationBoot.js`.

### Globals som opprettes av filene i auditten

- `CivicationBoot.js`: `window.ensureCiviCareerRulesLoaded`, `window.BADGES`, `window.HG_CAREERS`, `window.HG_CiviEngine`, og ved feil `window.__CIVI_BOOT_ERROR__`.
- `core/civicationState.js`: `window.CivicationState`, pluss globale week utilities `window.weekKey`, `window.weekIndexFromWeekKey`, `window.weeksPassedBetweenWeekKeys`.
- `core/civicationEventEngine.js`: `window.CivicationEventEngine`; boot oppretter instans som `window.HG_CiviEngine`.
- `systems/civicationMailEngine.js`: `window.CivicationMailEngine`.
- `systems/civicationMailRuntime.js`: `window.CivicationMailRuntime`.
- `systems/civicationDailyMailBuilder.js`: `window.CivicationDailyMailBuilder`.
- `systems/civicationLifeMailRuntime.js`: `window.CivicationLifeMailRuntime`.
- `core/civicationJobs.js`: `window.CivicationJobs`, `window.hgGetJobOffers`, `window.hgSetJobOffers`.
- `core/civicationCalendar.js`: `window.CivicationCalendar`.
- `core/civicationTaskEngine.js`: `window.CivicationTaskEngine`.
- `civicationObligationEngine.js`: `window.CivicationObligationEngine`.
- `core/CivicationPsyche.js`: `window.CivicationPsyche`.
- `ui/CivicationUI.js`: render-funksjoner og UI-init for hoved-Civication.
- `ui/CivicationDashboardUI.js`: `window.CivicationDashboardUI`.
- `ui/CivicationInboxTopActionUI.js`: `window.CivicationInboxTopActionUI`.
- History Go-filene oppretter blant annet `window.QuizEngine`, `window.HGUnlocks`, `window.HGStories`, `window.HGStoryGenerator`, popup-funksjoner for place/person/brand/flora og place-card collapse/open helpers.

### `DOMContentLoaded`

`CivicationBoot.js` registrerer `start` på `DOMContentLoaded`. `start` gjør følgende i rekkefølge:

1. Laster badges fra `data/badges/index.json` og careers fra `data/Civication/hg_careers.json`.
2. Setter `window.BADGES` og `window.HG_CAREERS`.
3. Sikrer `window.CIVI_CAREER_RULES`.
4. Oppretter `window.HG_CiviEngine = new CivicationEventEngine({ packBasePath: "data/Civication", maxInbox: 1, packMap: ... })`.
5. Laster/booter role model runtime, career role resolver og blocked-job-messages ved behov.
6. Kjører `CivicationEconomyEngine.tickWeekly()` hvis den finnes.
7. Kjører `CivicationObligationEngine.evaluate()` hvis den finnes.
8. Kjører `CivicationUI.init()`.
9. Kjører `HG_CiviEngine.onAppOpen()`.
10. Dispatcher `civi:dataReady` og deretter `civi:booted`.

Flere moduler booter også seg selv på `DOMContentLoaded` eller umiddelbart hvis dokumentet allerede er lastet. Viktige eksempler er `CivicationMailRuntime`, `CivicationDailyMailBuilder`, `CivicationLifeMailRuntime`, dashboard og inbox-top-action UI.

### `civi:dataReady`

Dette eventet betyr i praksis: data er lastet, event engine finnes, UI-init og `onAppOpen` er kjørt. Runtime/UI-systemer lytter på eventet for å patche/boote igjen idempotent og for å refreshe visning. `CivicationMailRuntime` lytter eksplisitt på `civi:dataReady` og kjører `boot()` for å patche `CivicationEventEngine.prototype`.

### `civi:booted`

Dette er sluttsignalet etter `civi:dataReady`. Samme type lyttere bruker det som en ekstra garanti for at engine/data/UI er tilgjengelig. `CivicationMailRuntime`, `CivicationDailyMailBuilder`, `CivicationLifeMailRuntime`, dashboard og inbox-top-action UI reagerer på det.

### `updateProfile`

`updateProfile` er dagens brede refresh-buss. Den brukes både av History Go og Civication. I Civication:

- `CivicationBoot.js` kaller `checkTierUpgrades()` på `updateProfile` hvis funksjonen finnes.
- `CivicationState.updateWallet`, `CivicationTaskEngine.setStore`, flere `CivicationEventEngine`-grener, inbox UI, quiz/unlock-systemene og place unlock dispatcher eller lytter på `updateProfile`.
- UI-lagene bruker den som signal om å lese localStorage på nytt og rerendre.

## 2. Nåværende state-modell

### Civication-nære localStorage-nøkler

| Nøkkel | Eier / innhold | Leser | Skriver |
|---|---|---|---|
| `hg_civi_state_v1` | Hovedstate: stabilitet, strikes, score, aktiv rolle-key, consumed events, identity tags, tracks, onboarding, mail branch state, mail system/director, conflict/story/narrative state, career/obligations. Også runtime-underobjekter som `mail_runtime_v1`, `mail_day_runtime_v1`, `life_mail_runtime_v1`, `mail_plan_progress`. | `CivicationState`, `CivicationEventEngine`, mail/daily/life runtimes, dashboard/UI, obligation engine. | `CivicationState.setState`, event engine, mail/daily/life runtimes, jobs/obligations, story/narrative systems. |
| `hg_civi_mail_v1` | Ny mailstore `{ version, items, meta.delivery }`; eier normaliserte mailkonvolutter, status/read/archive/delete/resolved og delivery guards. | `CivicationMailEngine`, UI via `getInbox()`. | `CivicationMailEngine.saveStore()` gjennom send/answer/archive/delete/replace/migrate. |
| `hg_civi_inbox_v1` | Legacy/kompatibilitets-inbox. Holdes synkronisert fra `hg_civi_mail_v1` som aktiv, ikke-arkivert, ikke-slettet liste. | `CivicationState.getInbox()` fallback, `CivicationInboxTopActionUI` fallback. | `CivicationMailEngine.setLegacyInbox()`, `CivicationState.setInbox()` fallback. |
| `hg_active_position_v1` | Aktiv jobb/rolle: career, title, threshold, role key/id, brand/employer/place context. | State, event engine, jobs, obligation engine, dashboard, psyche. | `CivicationJobs.acceptOffer`, active-position recovery, event engine ved fired, state setter. |
| `hg_job_history_v1` | Avsluttede stillinger med `ended_at` og `end_reason`. | Historikk-/recovery-/UI-lag ved behov. | `CivicationState.appendJobHistoryEnded`, fired/obligation/recovery-flyt. |
| `hg_civi_pulse_v1` | Dag/slot-gating for app-open mails: `{ date, seen }`. | `CivicationEventEngine.canPulseNow/markPulseUsed`. | `CivicationState.setPulse`, event engine. |
| `hg_civi_wallet_v1` | Civication-lommebok `{ balance, last_tick_iso }`. | `CivicationState.getWallet`, økonomi-/dashboard-lag. | `CivicationState.updateWallet`, økonomi-engine. |
| `hg_civi_calendar_v1` | Civication-klokke: dag, minutter, shift, login, aktiv job key. | `CivicationCalendar`, event/task/UI/day systems. | `CivicationCalendar.setClock/startShift/advance/logout`. |
| `hg_civi_tasks_v1` | Taskstore `{ byId, byMailId, order }`; oppgaver opprettet fra mail. | `CivicationTaskEngine`, UI og event engine. | `CivicationTaskEngine.ensureTaskForMail/completeByMail/setStore`. |
| `hg_civi_task_results_v1` | Resultat for interaktiv kunnskapsdel per taskId. | `CivicationEventEngine.getStoredTaskResult/getTaskResultModifier`. | Ingen av de auditerte Civication-filene skriver denne nøkkelen. Den er derfor et åpent bridge-punkt. |
| `hg_job_offers_v1` | Jobbtilbud med status, expiry, career/brand/place context. | `CivicationJobs`, UI. | `CivicationJobs.pushOffer/acceptOffer/declineOffer/expireOffers`. |
| `hg_first_job_sequence_v1` | Guard for curated first-job intro/first-day-sekvens. | `CivicationJobs`. | `CivicationJobs.markFirstJobSequenceDone` m.fl. |
| `hg_civi_recovery_v1` | Recovery-arc etter negativt karriereutfall. | `CivicationJobs`, career outcome runtime. | `CivicationJobs` recovery helpers. |
| `hg_psyche_v1` | Psyke: integrity, visibility, economicRoom, trust, trustMeta, burnout, autonomy override, role baseline, collapse state. | `CivicationPsyche`, event engine, UI. | `CivicationPsyche`. |
| `hg_capital_v1` | Kapitalverdier. | `CivicationUI`, event/capital systems. | `CivicationEventEngine` ved choice effects, capital engines. |

### History Go-nøkler som Civication allerede leser eller indirekte bygger på

| Nøkkel | Innhold | Civication-relevans |
|---|---|---|
| `merits_by_category` | Merit-/badgepoeng per kategori. | Event engine bruker den ved rolle-baseline; UI viser/avleder karriere og lønn; quiz endrer den. |
| `quiz_progress` | Quiz-progresjon per kategori/target. | History Go completion-kilde, ikke koblet direkte til Civication-task completion. |
| `hg_learning_log_v1` | Append-only læringslogg for quiz/observasjoner. | God kandidat for completion bridge, men Civication leser den i dag primært via obligation helper/HGLearningLog. |
| `hg_quiz_sets_v1` | Fullførte quiz-sett med score. | History Go progresjon, ikke direkte task-koblet. |
| `hg_unlocks_v1` | Unlocks fra quiz: hooks, concepts, thinkers, knowledge ids, trivia ids, emne ids. | God kandidat for kunnskaps-/unlock-krav. Civication bruker den ikke som task-completion nå. |
| `hg_active_set` | Midlertidig aktivt quiz-sett. | Kun quiz runtime. |
| `hg_pc_wallet_v1` | History Go PC wallet. | Dashboard leser denne hvis `getPCWallet()` ikke finnes; separat fra `hg_civi_wallet_v1`. |
| `hg_placecard_collapsed_v1` | PlaceCard UI-state. | Ikke Civication-progresjon. |

## 3. Nåværende spill-loop

### Ingen aktiv jobb

Ved `onAppOpen()` sjekker event engine aktiv posisjon. Hvis ingen aktiv jobb finnes, settes `unemployed_since_week` første gang og pulse markeres brukt. Etter nok uker kan NAV-fallback mail (`makeNavEvent`) enqueues. `CivicationLifeMailRuntime` patcher også `onAppOpen` og kan prøve å levere life-mail når det ikke finnes aktiv jobb eller når state-tags matcher life-pakker.

### Jobbtilbud

Jobbtilbud ligger i `hg_job_offers_v1`. `CivicationJobs.pushOffer()` oppretter pending tilbud. `acceptOffer()` markerer valgt tilbud accepted, skriver `hg_active_position_v1`, sikrer onboarding-state, aktiverer obligations, starter kalender-shift, lager eventuell første-jobbsekvens og dispatcher `updateProfile`. Tilbud kan også avslås eller utløpe.

### Aktiv rolle

Med aktiv rolle kjører `onAppOpen()` rolle-key sync, obligations, login-registrering, story/conflict-state, psyche baseline og mailvalg. Hvis det finnes pending event stoppes enqueuing. Ellers velges warning/fired før vanlig mail. Vanlig mail bygges fra runtime-plan, role storylets eller legacy pack; hvis ingen finnes genereres en generic career event. Før mail sendes dekorers den med task, work window, brand og kalenderfelt.

### App open

App open er en kombinasjon av boot, økonomi tick, obligation evaluate, UI init og event engine `onAppOpen()`. Pulse-gating begrenser automatisk mail per dag/slot med mindre `force` brukes.

### Pending event

`HG_CiviEngine.getPendingEvent()` returnerer første inbox-item med `status === "pending"`. Hvis pending finnes, `onAppOpen()` returnerer `pending_exists` og lager ikke ny jobbmail. Mailstore kan inneholde flere items, men event engine er konfigurert med `maxInbox: 1` ved fallback, og pending logikken behandler én aktiv hendelse som spill-loopens fokus.

### Svar på mail/event

UI svarer via `CivicationMailEngine.answerMail(mailId, choiceId)` når mulig. Den finner mail, kaller `HG_CiviEngine.answer(eventId, choiceId)`, og markerer mail resolved hvis svaret lykkes. Event engine beregner choice-effect, moral collapse, livsstilstags, autonomy-modifier, task-resultatmodifier, identity tags, tracks, system effects/capital, consumed event, score/strikes/stability, resolved inbox item, obligation response og task completion. Til slutt kan warning/fired/followup enqueues.

### Warning

Warning kommer enten fra obligation evaluate (`shouldEnqueueWarning`) eller fra negativ score i `answer()`. Warning-mail opprettes med `makeWarningEvent`, enqueues og `warning_used` settes. Ved positiv effekt kan state gå tilbake fra `WARNING` til `STABLE`.

### Fired

Fired kan komme fra obligations eller score/strikes. Ved fired registreres eventuell psyche collapse, aktiv posisjon flyttes til job history, `hg_active_position_v1` nulles, career-state resettes, `unemployed_since_week` settes og fired-event enqueues.

### Followup

Etter et vellykket svar, når spilleren fortsatt har aktiv jobb og ikke havner i warning/fired, kaller event engine `enqueueImmediateFollowupEvent()`. Den bygger samme type mailpool som app-open, velger event, dekorerer med task/window og dispatcher `updateProfile`.

### Kalender/tid

`CivicationCalendar` eier `hg_civi_calendar_v1`. Jobbstart starter shift. Mail-dekorering sikrer shift og beregner tidsvindu. Når spilleren svarer på event, fullfører event engine task by mail og avanserer kalenderen med `completedTask.durationMinutes`, `work_minutes`, `duration_minutes` eller fallback 45 minutter.

### Task completion

Task opprettes i `CivicationTaskEngine.ensureTaskForMail()` når work mail dekoreres. Task completion skjer nå ved mail-svar: `completeByMail(mailId, result)` markerer task completed. Hvis mail-eventet har `task_payload.interaction`, event engine ser etter `hg_civi_task_results_v1[taskId]` før svaret og gir +1, 0 eller -1. Det finnes ikke en tydelig History Go-writer for denne result-state i de auditerte filene.

### Wallet/økonomi

Civication har egen wallet-state i `hg_civi_wallet_v1`, og boot/app-open kjører økonomi-engine hvis tilgjengelig. Dashboard kan også lese History Go wallet `hg_pc_wallet_v1`/`getPCWallet()`. Dette er to forskjellige økonomikilder som bør holdes konseptuelt adskilt: Civication-liv/arbeid versus History Go PC.

### Psyke/kapital/identitet

Choices påvirker identity tags/tracks og kan skrive capital deltas til `hg_capital_v1`. `CivicationPsyche` eier `hg_psyche_v1` og beregner autonomy fra integritet, økonomisk handlingsrom, rollebaseline, trust, identity-modifiers og lifestyle. Moral flags, fired, burnout og collapse kan endre psyke og karriereutfall.

## 4. Civication → History Go-oppgaver

### Hovedregel

Civication bør ikke være stedet der spilleren primært lærer, undersøker eller samler kunnskap. Hovedregelen for oppgaver bør være:

1. **Civication skaper behovet, konteksten eller problemet.** En mail, rolle, konflikt eller livshendelse forklarer hvorfor spilleren trenger kunnskap.
2. **History Go er kunnskaps-/handlingsrommet.** Spilleren går til kart, sted, person, quiz, stories, debatt eller unlock-system for å lære, undersøke, besøke, lese, samle eller delta.
3. **Resultatet føres tilbake til Civication.** Fullført History Go-handling gir progresjon, innsikt eller konsekvens i Civication-tasken og påvirker svar, followup, psyke, kapital, rolle eller mailbue.

### A. Stedsoppgaver

- Civication-task må kunne peke til et konkret `placeId`/`place_id` og en forventet handling: åpne PlaceCard, besøke/låse opp stedet, ta place-quiz, lese stories knyttet til stedet eller forstå stedskontekst.
- Eksisterende kode har place-konsepter: active position kan lagre `place_id`; task engine har kind `place_knowledge`; PlaceCard kan låse opp sted og dispatches/lagrer besøks- og meritprogresjon; stories loader indekserer stories per `place_id`.
- Mangler: task schema har ingen formell `history_go_targets.placeId`, ingen Civication-knapp som navigerer til stedet, og ingen bridge som markerer taskens History Go-del fullført når PlaceCard/quiz/story er gjort.

Eksempel: En jobbmail ber spilleren forstå en bykonflikt. Mailen lager en Civication-task med `placeId`, `requiredAction: "place_quiz_or_story"`, og knapp “Gå til History Go”. Når spilleren åpner stedet og fullfører quiz/story, rapporteres dette tilbake til Civication.

### B. Personoppgaver

- Civication-task må kunne peke til `personId`/`person_id` og en forventet handling: åpne profil/personpopup, lese kontekst, ta person-quiz eller låse opp kunnskap.
- Eksisterende kode har person-quiz/unlock-events og stories per person via `HGStories.getByPerson(personId)`.
- Mangler: task engine lagrer ikke `personId`, Civication UI har ingen person-target action, og History Go completion sendes ikke til `hg_civi_task_results_v1`/`hg_civi_tasks_v1`.

Eksempel: En rolle krever at spilleren forstår en historisk aktør, politiker, kunstner, forsker, aktivist eller idrettsperson før et Civication-svar blir godt.

### C. Debattoppgaver

- Civication-task må kunne peke til `debateId` eller `conflictId`, og beskrive hva spilleren må forstå eller ta stilling til.
- Eksisterende kode har conflict-state, conflict ids på event typedef, debate/confrontation UI og story generator type `conflict`.
- Mangler: ingen stabil History Go debate/conflict target-kontrakt i task schema, ingen navigasjon til debate-rom, og ingen completion event tilbake.

Eksempel: En offentlig konflikt i Civication krever at spilleren deltar i en debatt basert på kunnskap fra History Go. Civication eier konsekvensen; History Go eier kunnskaps- og standpunktshandlingen.

### D. Kunnskapsoppgaver

- Civication-task må kunne peke til `quizId`, `categoryId`, `emneId`, story/lesespor eller leksikonnode.
- Eksisterende History Go-kode logger quiz-sett i `hg_learning_log_v1`, markerer quiz progress i `quiz_progress`, vedlikeholder `hg_quiz_sets_v1`, oppdaterer merits og kan merke emner forstått via `KnowledgeLearning.setUnderstood`.
- Mangler: Civication leser ikke disse som task completion for en bestemt mail/task.

### E. Samle-/unlock-oppgaver

- Civication-task må kunne kreve at sted, person, badge, spiller, objekt eller kunnskap er unlocked før mailbuen kan gå videre.
- Eksisterende History Go-kode dispatcher `hg:target-unlock` for fullført place/person target quiz og `hg:unlocks` når `HGUnlocks.recordFromQuiz()` endrer unlock-indexen.
- Mangler: Civication lytter ikke på disse eventene som completion bridge, og task schema beskriver ikke hvilke unlocks som oppfyller kravet.

## 5. Manglende koblinger mellom Civication og History Go

### Task til `placeId`

- **Finnes nå:** `CivicationJobs.acceptOffer()` lagrer `place_id` i active position når et offer har sted. `CivicationTaskEngine` kan inferere `place_knowledge`, men lagrer bare generiske `knowledge_targets` og `quiz_targets`. PlaceCard kan registrere sted som besøkt/låst opp.
- **Mangler:** eksplisitt task target som `history_go_targets.places[]` eller `placeId`, target action, deep-link/navigasjon og completionregel.
- **Bør eie fullføring:** `js/Civication/core/civicationTaskEngine.js` bør eie Civication-taskens completion-state; en ny bridge-modul mellom History Go-events og task engine bør skrive resultatet, mens PlaceCard/quiz kun rapporterer faktiske History Go-hendelser.

### Task til `personId`

- **Finnes nå:** QuizEngine og popup-systemer håndterer person targets; stories loader indekserer `person_id`.
- **Mangler:** Civication-task kan ikke uttrykke personkrav, og ingen UI-knapp sender spilleren til personprofil.
- **Bør eie fullføring:** Task engine eier oppgavefullføring; person popup/QuizEngine/HGStories bør være kilder til completion-signal via bridge.

### Task til `quizId`, `categoryId` eller `emne`

- **Finnes nå:** `quiz_progress`, `hg_quiz_sets_v1`, `hg_learning_log_v1`, meritpoeng, `HGUnlocks` og `KnowledgeLearning.setUnderstood()` beskriver faktisk læring i History Go.
- **Mangler:** mapping fra Civication-task til quiz/category/emne, og deterministisk vurdering av om riktig quiz/emne oppfyller tasken.
- **Bør eie fullføring:** Task engine bør eie task-resultat. QuizEngine bør fortsatt eie quiz-progresjon og sende/eksponere completion-events; bridge oversetter til Civication-resultat.

### Task til `debateId`/`conflictId`

- **Finnes nå:** Civication har `conflict_state.active_conflicts`, event-felt for `conflict_ids`, conflict mail scoring og debate UI. Story generator kan klassifisere konflikt/debatt.
- **Mangler:** History Go-side med stabil debate/conflict id som en task kan navigere til, og completion-kontrakt for å “delta”, “lese argumenter” eller “velge posisjon”.
- **Bør eie fullføring:** Et fremtidig debate/conflict History Go-system bør eie brukerhandlingen; Civication task engine bør eie at kravet er oppfylt for mail/task.

### Fullføring fra History Go tilbake til Civication

- **Finnes nå:** History Go sender `updateProfile`, `hg:target-unlock` og `hg:unlocks`, og lagrer læring/unlocks. Civication har `hg_civi_task_results_v1` som event engine leser for interaktive task-resultater.
- **Mangler:** en listener/bridge som kobler History Go-eventene til åpne Civication-tasks og skriver task result eller completion.
- **Bør eie fullføring:** `CivicationTaskEngine` bør eie ferdig status i `hg_civi_tasks_v1`; `hg_civi_task_results_v1` bør enten eies/formaliseres av task engine eller erstattes av et task-resultatfelt i samme store. Bridge-modulen bør kalle task engine, ikke skrive vilkårlig state uten kontrakt.

### State for fullført oppgave

- **Finnes nå:** `hg_civi_tasks_v1.byId[taskId].status = "completed"` settes ved mail-svar, og `hg_civi_task_results_v1[taskId]` leses som kunnskapsresultat.
- **Mangler:** separat status for History Go-delen før mail-svar, f.eks. `history_go.completed_at`, `completion_source`, `matched_target`, `correct`.
- **Bør eie fullføring:** `js/Civication/core/civicationTaskEngine.js`.

### `updateProfile` etter fullført oppgave

- **Finnes nå:** Task engine dispatcher `updateProfile` når taskstore endres. Quiz/unlock/place sender også `updateProfile` eller custom events.
- **Mangler:** garantert `updateProfile` etter at en History Go-handling er koblet til en Civication-task.
- **Bør eie fullføring:** Bridge kaller task engine; task engine skriver state og dispatcher `updateProfile` én gang.

## 6. Mail-arkitektur

### `hg_civi_mail_v1` vs `hg_civi_inbox_v1`

- `hg_civi_mail_v1` er ny canonical mailstore. Den lagrer normaliserte konvolutter med `id`, `key`, `type`, `from`, `subject`, `body`, `createdAt`, `read`, `archived`, `deleted`, `resolved`, `resolvedAt`, `status`, `event` og `meta.delivery`.
- `hg_civi_inbox_v1` er legacy-kompatibilitet. Ved save i mail engine bygges den fra aktive, ikke-arkiverte, ikke-slettede items i canonical store. Den har enklere form: `status`, `read`, `resolved`, `resolvedAt`, `enqueued_at`, `event`.

### Normalisering

`CivicationMailEngine.normalizeEnvelope()` tar enten en mail-wrapper eller et event og bygger konvolutt. `event.mail_type` eller `event.type` blir envelope `type`; `event.from`/`event.source` blir `from`; `event.situation` blir body når den er en liste; ellers brukes `summary`. `sendMail()` legger på duplicate guards via `mail_key/id`, `mail_type/type` og week fields.

### Resolved event-svar

Svar går via `CivicationMailEngine.answerMail()` til `HG_CiviEngine.answer()`. Når resultatet ikke er `ok:false`, kaller mail engine `markResolved(mailId, eventId, choiceId)`, som setter `read`, `resolved`, `resolvedAt`, `status: "resolved"` og `answeredChoiceId`. Event engine setter også legacy inbox-item resolved med `resolved_at`, `chosen`, `effect` og `feedback`.

### Felt for å skille mailtyper

Faktiske felt som brukes i mail/event-objekter:

- Jobbmail/planlagt: `source_type: "planned"`, `"thread"`, `"legacy_pack"`, `"role"`; `mail_type`, `mail_family`, `mail_plan_meta`, `storylet_id`, `phase_tag`.
- Personlig/life: `source_type: "life"`, `mail_class: "life"`, `mail_type`, `life_pack_id`, `life_context`, `life_mail_meta`.
- Dagshendelse: `mail_class: "daily_workday"`, `source_type` som starter med `daily_`, `daily_mail_meta`, `phase_tag`.
- Consequence/narrative: `source_type: "narrative_stream"`, `narrative_stream_id`, `narrative_storylet_id`, `injected_by_choice`, `choice_history` i narrative state.
- People: `people_ref`, active people threads/phases i state, people/day systems.
- Story: `story_state`, `active_story_threads`, `story_thread_phases`, storylet/narrative fields.
- Conflict/debate: `mail_type: "conflict"`, `conflict_ids`, `conflict_state.active_conflicts`, `active_conflict_id`, `active_conflict_phase`.
- Event generelt: `id`, `stage`, `status`, `type`, `channel`, `source`, `subject`, `situation`, `choices`, `effect/effects`, `task_id`, `task_payload`, `created_at`, `expires_at`.

## 7. Anbefalt neste implementeringsrekkefølge

### PR 1: dokumentasjon/kontrakt for Civication → History Go-oppgaver

- Formaliser begreper: Civication som livs-/konsekvensrom, History Go som kunnskaps-/handlingsrom.
- Dokumenter target-typer, completion-signaler og state-eierskap.
- Ingen runtime-endringer.

### PR 2: inbox-splitt mellom jobbmail og personlige meldinger

- Bygg videre på eksisterende `channel`, `mail_class`, `source_type`, `mail_type`, `life_mail_meta`, `daily_mail_meta` og event channel split.
- Målet bør være tydeligere semantisk split, ikke kosmetisk redesign.

### PR 3: task schema for History Go-koblinger

- Utvid task-kontrakt med eksplisitte History Go targets: `placeId/placeIds`, `personId/personIds`, `quizId`, `categoryId`, `emneId/emneIds`, `debateId`, `conflictId`.
- Legg inn `requiredAction` og `completionPolicy` slik at fullføring ikke er “bare klikk”.

### PR 4: UI-knapper i Civication som sender spilleren til riktig History Go-sted/person/debatt

- Civication-mail/task viser “Gå til History Go”-handlinger basert på schema.
- Knappene bør navigere/deep-linke til riktig History Go-target uten å markere oppgaven fullført alene.

### PR 5: completion bridge fra History Go tilbake til Civication

- Lytt på faktiske History Go-signaler: quiz completion, target unlock, place unlock/open/story completion/debate completion.
- Match mot åpne Civication-tasks.
- Kall task engine for å skrive completion og dispatch `updateProfile`.

### PR 6: én komplett jobbmail-bue som bruker denne flyten

- Velg én jobbmail-bue med reelt History Go-target.
- Mail skaper behovet; History Go gir kunnskapen; Civication-svar/followup bruker resultatet.

### PR 7: kveld/personlige konsekvenser basert på hva spilleren gjorde eller ikke gjorde i History Go

- Life/daily/consequence-systemene bruker task completion eller manglende completion til kveldsmeldinger, personlige reaksjoner og konsekvenser.
