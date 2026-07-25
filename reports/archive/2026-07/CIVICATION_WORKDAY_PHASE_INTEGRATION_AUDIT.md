# Civication Workday Phase Integration Audit

> Status: **audit + integrasjonsplan**. Ingen arbeidsdaglogikk er fjernet i denne PR-en.
> Dato: 2026-06-22. Scope: kartlegge hvordan arbeidsdag i dag er spredt over flere
> systemer, og hvordan den skal bli **innholdslaget inni dagsfasene** (Morgen → Lunsj →
> Ettermiddag → Kveld → Dagslutt) med `CivicationDailyMailBuilder` + `mailDayProgram.json`
> som autoritativ dagrytme.

---

## 1. Kort konklusjon

Civication har **to overlappende arbeidsdagsmotorer** som begge patcher
`CivicationEventEngine.prototype.onAppOpen` og `.answer`:

1. **`day/dayPatches.js` (eldre, fase-først-motor)** — bygger arbeidsdagen
   *ad hoc per fase* direkte i `onAppOpen`: den leser `CivicationCalendar.getPhase()`
   og lager ett event for fasen (`morning` via `buildMailPool`, `lunch` via
   `makeLunchEvent`, `afternoon` via hardkodet controller-event eller
   `makeGenericCareerEvent`, `evening` via `makeEveningEvent`, `day_end` via
   `makeDayEndEvent`). I `answer` flytter den kalenderen ett fasehakk per svar
   (`morning → lunch → … → day_end → resetForNewDay`).

2. **`systems/civicationDailyMailBuilder.js` (nyere, program-først-motor)** — bygger
   **hele dagen på forhånd** fra `data/Civication/mailDayProgram.json` til
   `runtime.items[]` (alle faser, alle slots), leverer items ett om gangen via
   `enqueueNext`, og short-circuiter `onAppOpen` (returnerer uten å kalle den eldre
   motoren) når en aktiv rolle har en bygd dag.

Fordi DailyMailBuilder lastes **etter** dayPatches i `Civication.html`, blir
DailyMailBuilder den ytterste `onAppOpen`-wrapperen og **vinner** levering når en rolle
har et bygd `mail_day_runtime_v1`. Men **`dayPatches.answer` lever fortsatt i
answer-kjeden** og flytter `CivicationCalendar`-fasen ett hakk for *hvert* svar — også
for daily-events. Det kolliderer med DailyMailBuilder, som har flere items per fase og
re-setter fasen fra hvert item i `enqueueNext`. Resultatet er at **fase-tilstanden kan
"ping-ponge"** og at to systemer eier dagens fremdrift samtidig.

**Anbefaling:** `CivicationDailyMailBuilder` + `mailDayProgram.json` skal være den
**autoritative** dagrytmen. `dayPatches`' fase-genererte events
(`makeLunchEvent`/`makeEveningEvent`/`makeDayEndEvent`/hardkodet controller-afternoon)
skal degraderes fra "egen onAppOpen-loop" til **innholdsleverandører som mater slots i
`mailDayProgram`**, og dagens faseskifte skal eies av ett sted
(`CivicationDayProgression` + DailyMailBuilder), ikke av `dayPatches.answer`. Selve
flettingen gjøres i en **senere** PR; denne PR-en leverer kartet, mappingen og
rekkefølgen.

Begge påkrevde tester er grønne i dag:
`tests/civication-controller-two-week-flow.test.js` og
`tests/civication-incoming-flow.test.js` (kjørt 2026-06-22).

---

## 2. Dagens systemkart — hvem eier hva nå

Lastrekkefølge i `Civication.html` (relevante linjer):

```
195  civicationMailEngine.js
211  core/civicationCalendar.js
230  core/civicationEventEngine.js
271  civicationIncomingFlow.js
272  ui/CivicationUI.js                  (renderWorkdayPanel original)
283  day/dayCalendarBridge.js           (legger fase-modell på Calendar)
284  day/dayProgressionController.js     (CivicationDayProgression)
285  ui/CivicationDayPhaseUI.js          (eget fasepanel, rent statuskort + rute til NextAction)
294  day/dayPatches.js                   (PATCH onAppOpen/answer + renderWorkdayPanel HUD)
295  civicationMailRuntime.js            (PATCH buildMailPool/pickEventFromPack/answer)
296  civicationCareerOutcomeRuntime.js
300  civicationDailyMailBuilder.js       (PATCH onAppOpen/answer)
303  civicationDailyTaskGates.js         (PATCH onAppOpen + patcher DailyMailBuilder)
310  day/dayConsequences.js
```

| System | Fil | Hovedansvar | State keys | Events lest/skrevet | Lager mail/task? | Flytter fase? | UI? | Overlapp |
|---|---|---|---|---|---|---|---|---|
| **DailyMailBuilder** | `systems/civicationDailyMailBuilder.js` | Bygger hele dagsbunken fra `mailDayProgram.json` → `runtime.items[]`; leverer item-for-item via `enqueueNext`; markerer answered | `mail_day_runtime_v1`, `narrative_state_v1` (les: `consumed`, `mail_runtime_v1`, `mail_plan_progress`) | Patcher `onAppOpen` (enqueue neste item, short-circuit), `answer` (markAnswered); dispatch `civi:inboxChanged`,`updateProfile`; setter `Calendar.setPhase(item.phase)` | Lager daily-mail (planned/extra/generated/narrative) | **Ja** (indirekte: setter Calendar-fase fra item) | Nei | Eier dagrytme, men deler faseskifte med dayPatches |
| **mailDayProgram** | `data/Civication/mailDayProgram.json` | Dataschema for dagsstruktur: 5 faser × slots (morning_brief, primary_work_mail, operational_mail, people_ping, phase_lunch, …, day_summary) | — (data) | — | Definerer slot-typer | Definerer faserekkefølge | Nei | Eneste deklarative dagsstruktur — bør være autoritativ |
| **CivicationCalendar** | `core/civicationCalendar.js` | Klokke/skift/tid (`dayIndex`, `currentMinutes`, shift) | `hg_civi_calendar_v1` | — | Nei | Nei (kjernen) | Nei | — |
| **dayCalendarBridge** | `day/dayCalendarBridge.js` | Legger **fase-modell** på Calendar: `DAY_PHASES`, `getPhase/setPhase/advancePhase`, `dailyFlags`, `getDailySummary`, `resetForNewDay`, `getPhaseModel` | `hg_civi_calendar_v1` (`phase`,`phaseStatus`,`dailyFlags`,`dailySummary`) | — | Nei | **Ja** (eier `setPhase/advancePhase`) | Nei | Faseapparatet som *både* dayPatches og DailyMailBuilder skriver til |
| **DayProgression** | `day/dayProgressionController.js` (`CivicationDayProgression`) | Leser DailyMailBuilder-runtime + Calendar-fase; teller åpne items i fasen; avgjør `canAdvance`; `advancePhaseIfReady()` kaller `Calendar.advancePhase()` | leser `mail_day_runtime_v1`, `hg_civi_calendar_v1`, inbox | dispatch `civi:dayPhaseChanged`,`civi:inboxChanged`,`updateProfile` | Nei | **Ja** (via `advancePhaseIfReady`) | Nei (mater UI) | Tredje faseskifte-vei (i tillegg til dayPatches.answer og DailyMailBuilder) |
| **DailyTaskGates** | `systems/civicationDailyTaskGates.js` | Setter inn `task_gate`-leveranser (morning_delivery/main_delivery/analysis_delivery) i runtime etter N besvarte items; blokkerer dagen til task er fullført | `mail_day_runtime_v1` (`task_gates`, `blocked_*`) | Patcher `DailyMailBuilder.startToday/inspect` + `onAppOpen` | **Ja** (task_gate-mail + `CivicationTaskEngine` task) | Nei (markerer phase på gate) | Nei | Innfletting allerede gjort *riktig vei* (mater DailyMailBuilder) — mønster for resten |
| **TaskEngine** | `core/civicationTaskEngine.js` | Oppgavestore: `createTaskForMail`, `completeByMail`, `listOpenTasks`, History-Go-task-payloads | `hg_civi_tasks_v1`, `hg_civi_task_results_v1` | — | **Ja** (tasks) | Nei | Nei | — |
| **WorkdayPanel** | `ui/CivicationUI.js` `renderWorkdayPanel()` + `computeWorkdayModel()` | Viser **én** aktiv arbeidsdag: klokke, rolle, aktivt workday-item, tidsvindu, ukeprogresjon, kontraktspress | leser `active_position`, Calendar, TaskEngine, inbox | — | Nei | Nei | **Ja** (`#civiWorkdayPanel`) | Viser ett pending workday-item, ikke fase/dagsbunke |
| **renderWorkdayPanel (HUD-patch)** | `day/dayPatches.js` `patchUI()` | Dekorerer `renderWorkdayPanel` med fase-HUD (Dag N · fase, ✅/🔵/⬜), ukesrapport, kontakter, kunnskaps-task | leser `Calendar.getPhaseModel`, TaskEngine | — | Nei | Nei | **Ja** (HUD oppå panelet) | Eneste "fase i panelet"-visning i dag |
| **DayPhaseUI** | `ui/CivicationDayPhaseUI.js` (`CivicationDayPhaseUI`) | Rent statuskort (`#civiDayPhasePanel`): gjeldende fase, antall åpne saker, neste sak-tittel, outcome/læring/reentry-bannere + én "Gå til neste handling"-knapp som ruter til NextAction (samme inngang som top action). Ingen svarvalg eller progresjon herfra | leser kun `CivicationDayProgression.inspect()` | lytter `civi:dayPhaseChanged/inboxChanged/booted/updateProfile` | Nei | **Nei** (ruter bare til NextAction) | **Ja** (eget panel) | Andre fasevisning, separat fra WorkdayPanel |
| **IncomingFlow** | `systems/civicationIncomingFlow.js` | Lavnivå innboks: `getPendingJobMails/PrivateMessages`, `getActiveWorkdayItem`, `enqueueBatch/Followup`, `normalizeConsequences/applyConsequences`; kjenner `phase_tag` + batch-kinds | leser inbox (MailEngine/State) | — | enqueue followup/batch | Nei | Nei | WorkdayPanel og DailyMailBuilder leser herfra |
| **MailRuntime** | `systems/civicationMailRuntime.js` | Langsiktig rolleprogresjon: `makeCandidateMailsForActiveRole`, patcher `buildMailPool/pickEventFromPack/answer/resetForNewJob` | `mail_runtime_v1`, `mail_plan_progress`, `mail_branch_state` | Patcher answer (brand consequence + thread) | **Ja** (planlagt jobbmail) | Nei | Nei | DailyMailBuilder ber MailRuntime om dagens **primære** planmail (`getPlannedPrimary`) |
| **EventEngine** | `core/civicationEventEngine.js` | Generisk hendelsesmotor: `onAppOpen`, `answer`, `enqueueEvent`, `buildMailPool`, `makeGenericCareerEvent`, `decorateWorkMail`, `enqueueImmediateFollowupEvent` | `hg_civi_state_v1` m.m. | base for alle patches | **Ja** (generisk/fallback) | Nei | Nei | Patches stables oppå denne |
| **MailEngine** | `systems/civicationMailEngine.js` | Innboks/lagring: envelopes, pending/resolved/read, dedupe, legacy mirror | `hg_civi_mail_v1`, `hg_civi_inbox_v1` | answer-kobling | Nei (lagrer) | Nei | Nei | Lagringslag for alt over |
| **EventEngine patch-eiere (oppsummert)** | flere | Tre `onAppOpen`-wrappere (dayPatches → DailyMailBuilder → DailyTaskGates) + flere `answer`-wrappere (dayPatches, MailRuntime, DailyMailBuilder) | — | — | — | dayPatches + DailyMailBuilder + DayProgression flytter fase | — | **Kjernen i overlappet** |

---

## 3. Parallelle arbeidsdagspor

Dette er logikk som kan gi spilleren en arbeidsdag **utenom** DailyMailBuilder/mailDayProgram.

### 3.1 `day/dayPatches.js` — `onAppOpen` fase-generator (hovedparallellen)

- **Hva den lager:** ett event per fase, generert i farten:
  - `morning`: `buildMailPool` → `pickEventFromPack` → `decorateWorkMail`, pluss
    carryover-justering av valg (visibilityBias/processBias/fatigue).
  - `lunch`: `makeLunchEvent(active)` (`dayEvents.js`).
  - `afternoon`: **hardkodet controller-Dag-1-event** hvis
    `isControllerDayOnePhase(active)`, ellers `makeGenericCareerEvent` +
    `decorateWorkMail` som `work_case`.
  - `evening`: `makeEveningEvent(active)`.
  - `day_end`: `makeDayEndEvent()`.
- **Når den kjøres:** `onAppOpen` når det **ikke** finnes pending event og rolle/recovery
  er aktiv — men kun hvis DailyMailBuilder *ikke* allerede short-circuitet (dvs. når det
  ikke finnes bygd `mail_day_runtime_v1`, eller `skipDailyMailBuilder`-flagg, eller dagen
  er ferdig).
- **Roller den påvirker:** alle; controller har en hardkodet spesialgren i `afternoon` og
  i `dayEvents.makeLunchEvent`.
- **State:** `hg_civi_calendar_v1` (fase + `dailyFlags` + `dailySummary`), carryover via
  `dayCarryover.js`.
- **Lager pending mail:** ja (`enqueueEvent`).
- **Flytter fase:** ja — `answer` kaller `cal.setPhase(neste)` per svar.
- **Kan stoppe etter én mail:** ja — fordi den lager **ett** event per fase per
  `onAppOpen`. Uten DailyMailBuilder gir den én mail, svar, faseskift, én mail … (ingen
  flere items per fase, ingen micro/people/followup-volum).
- **Bør flettes inn ved:** at `makeLunchEvent/makeEveningEvent/makeDayEndEvent` og
  controller-afternoon blir **slot-leverandører** for henholdsvis `phase_lunch`,
  `phase_evening`, `day_summary` og `conflict_or_event`/`primary_work_mail` i
  `mailDayProgram`, i stedet for å eie sin egen `onAppOpen`-gren.

### 3.2 `day/dayPatches.js` — `answer` faseskifte (skjult parallell)

- **Hva den lager:** ingen mail, men flytter `CivicationCalendar`-fasen ett hakk
  (`morning→lunch→afternoon→evening→day_end→resetForNewDay`) for **hvert** svar, inkl.
  daily-events.
- **Konflikt:** `mailDayProgram` har flere items per fase (morgen har 5). dayPatches.answer
  flytter til `lunch` etter første morgen-svar, mens DailyMailBuilder fortsatt har 4
  morgen-items og re-setter `setPhase("morning")` i neste `enqueueNext`. To skrivere av
  samme fase-state → ping-pong; HUD/DayPhaseUI/DayProgression kan vise feil fase og
  feil "åpne items i fasen".
- **Bør flettes inn ved:** faseskifte tas ut av `dayPatches.answer` og overlates til
  DailyMailBuilder (fase følger item) + `CivicationDayProgression.advancePhaseIfReady`.

### 3.3 `dayEvents.js` — `makeLunchEvent` / `makeEveningEvent` / `makeDayEndEvent`

- **Hva de lager:** rike, kontekstuelle fase-events (by-/butikk-/nettverk-kontekst,
  History-Go-steder, controller-spesialtekster).
- **Når:** kalt fra `dayPatches.onAppOpen` per fase.
- **Bør flettes inn ved:** kalles fra DailyMailBuilder som slot-generatorer
  (erstatter/utvider `makeGeneratedEvent` for `phase`/`day_end`-slots) slik at innholdet
  beholdes, men dagrytmen eies av programmet.

### 3.4 `DailyTaskGates` — allerede riktig mønster (referanse, ikke problem)

- Mater leveranser (`morning_delivery`/`main_delivery`/`analysis_delivery`) **inn i**
  DailyMailBuilder-runtime via `insertGates`, og blokkerer videre levering til task er
  fullført. Dette er **akkurat** det integrasjonsmønsteret resten skal følge.

### 3.5 Tredje faseskifte-vei: `CivicationDayProgression.advancePhaseIfReady`

- Brukes av "Gå til neste fase"-knappen i `CivicationDayPhaseUI`. Korrekt prinsipp
  (fase avanseres bare når åpne items i fasen = 0), men i dag konkurrerer den med
  `dayPatches.answer` som avanserer automatisk. Etter fletting bør **dette** (manuell
  fase-avansering når fasen er tom) være den eneste avanseringsveien, sammen med
  DailyMailBuilders item-drevne `setPhase`.

---

## 4. State keys (arbeidsdag/dagsfase)

| Key | Eier | Innhold |
|---|---|---|
| `mail_day_runtime_v1` | DailyMailBuilder (+ TaskGates) | Dagens bunke: `date`, `role_scope`, `items[]` (status/phase/slot/event), `current_index`, `delivered_ids`, `answered_ids`, `task_gates`, `blocked_*` |
| `hg_civi_calendar_v1` | Calendar + dayCalendarBridge | `dayIndex`, `currentMinutes`, shift, **`phase`**, `phaseStatus`, `dailyFlags` (`morning_done`…), `dailySummary` (choiceLog, nextDayCarryover) |
| `narrative_state_v1` | DailyMailBuilder | `active_streams`, `stream_progress`, `flags`, `choice_history` |
| `mail_runtime_v1` | MailRuntime | `role_plan_id`, `role_scope`, `step_index`, `consumed_ids`, `history` |
| `mail_plan_progress` | MailRuntime | `role_plan_id`, `step_index`, `current_step_type` |
| `mail_branch_state` | MailRuntime/day | `flags`, `next_bias` |
| `hg_civi_tasks_v1` / `hg_civi_task_results_v1` | TaskEngine | tasks per mail + resultater |
| `hg_civi_mail_v1` / `hg_civi_inbox_v1` | MailEngine | mailstore + legacy mirror |
| `hg_civi_state_v1` | CivicationState | global state (`consumed`, `identity_tags`, `career`, `stability`, m.m.) |
| `hg_active_position_v1` | Jobs/State | aktiv rolle + brand metadata |

Carryover (`dayCarryover.js`) bor inne i `hg_civi_calendar_v1.dailySummary.nextDayCarryover`.

---

## 5. UI-komponenter

| Komponent | Host | Viser | Leser |
|---|---|---|---|
| `renderWorkdayPanel` (base) | `#civiWorkdayPanel` | klokke, rolle, brand/sted, status, **ett** aktivt workday-item ("Hva gjør du?"), tidsvindu, ukeprogresjon, kontraktspress | `computeWorkdayModel()` → active_position, Calendar, TaskEngine, IncomingFlow |
| `renderWorkdayPanel` (HUD-patch i dayPatches) | samme host, `afterbegin` | fase-HUD (Dag N · fase, ✅/🔵/⬜ for morgen→dagslutt), ukesrapport, kontakter, kunnskaps-task | `Calendar.getPhaseModel()`, TaskEngine |
| `CivicationDayPhaseUI` | `#civiDayPhasePanel` | gjeldende fase + label, åpne items i fasen, "Gå til neste fase", outcome/læring/reentry-bannere | `CivicationDayProgression.inspect()` |
| `CivicationInboxTopActionUI` | inbox-topp | seksjoner/handlinger | inbox |

**Funn:** Fasevisning er i dag fordelt på **to** steder (HUD-patch i WorkdayPanel +
eget DayPhaseUI-panel), mens selve WorkdayPanel-kortet bare viser ett pending item.
Ingen flate viser "dagens bunke per fase".

---

## 6. Hvordan DailyMailBuilder bør eie dagrytmen

Måldiagram (én dagstruktur):

```
Dag (CivicationCalendar.dayIndex)
  → mailDayProgram.json (faser + slots)
    → DailyMailBuilder.buildQueue  → mail_day_runtime_v1.items[]   (HELE dagen, alle faser)
      → enqueueNext (ett item)  → CivicationMailEngine pending
        → answer  → markAnswered + status
          → fase = item.phase   (Calendar følger item, ikke per-svar-hakk)
            → når fasens items er tomme → CivicationDayProgression.advancePhaseIfReady
              → morning → lunch → afternoon → evening → day_end
                → day_end → resetForNewDay() + carryover
```

Prinsipper:

1. **Én dagrytme:** `mailDayProgram.json` + `DailyMailBuilder.runtime.items[]` er fasit.
   Ingen annen `onAppOpen`-gren skal generere en parallell dag.
2. **Fase følger item:** `enqueueNext` setter allerede `Calendar.setPhase(item.phase)`.
   Dette beholdes. **`dayPatches.answer` skal ikke lenger flytte fasen.**
3. **Fase-avansering eies av DayProgression:** når alle items i en fase er `answered`,
   avanserer `advancePhaseIfReady` (auto eller via "Gå til neste fase"-knapp). Det er
   allerede korrekt implementert; det som mangler er å fjerne den konkurrerende
   auto-avanseringen i `dayPatches.answer`.
4. **Eldre fase-events blir slot-generatorer:** `makeLunchEvent/makeEveningEvent/
   makeDayEndEvent` + controller-afternoon kalles **fra DailyMailBuilder** (utvider
   `makeGeneratedEvent`) for de slot-typene som ikke har en mailFamily-kandidat.

---

## 7. Hvordan arbeidsdag skal bli faseinnhold

Konkret fasemodell — hver fase får dedikerte "slot-funksjoner" som DailyMailBuilder
fyller fra (i prioritert rekkefølge) mailFamilies → narrative streams → fase-generator:

```
morning:
  - arbeidsbrief        → slot morning_brief        (story/people/intro)
  - primary_work_mail   → slot primary_work_mail    (job, planned primary fra MailRuntime)
  - morning task_gate   → DailyTaskGates morning_delivery (etter N items)
  - prioritering        → slot operational_mail      (job_micro)
  - hovedmail/people    → slot people_ping           (people)

lunch:
  - uformell avklaring  → slot phase_lunch           (makeLunchEvent som generator)
  - person/kollega      → slot informal_people_mail  (people)
  - liten beslutning    → slot small_choice          (micro_choice)

afternoon:
  - main_delivery       → DailyTaskGates main_delivery + slot conflict_or_event (conflict/event)
  - conflict_or_event   → slot conflict_or_event
  - analysis_followup   → slot analysis_followup     (followup ×2)
  - operational_batch   → slot operational_batch     (job_micro ×3)
  - beslutningsgrunnlag  → slot knowledge_mail        (knowledge)

evening:
  - consequence_mail    → slot consequence_mail      (consequence)
  - relationship/status → slot relationship_or_status (people_or_status)
  - ettervirkning       → slot phase_evening         (makeEveningEvent som generator)

day_end:
  - day_summary         → slot day_summary           (makeDayEndEvent + DailyTaskGates analysis_delivery)
  - carryover           → Calendar.resetForNewDay nextDayCarryover
  - weekly summary       → dayWeeklyReview.finalizeWeekIfNeeded (allerede koblet i day_end)
```

### Mapping-tabell: gammel arbeidsdagfunksjon → ny fase/slot

| Gammel funksjon / event (fil) | I dag | Ny fase | Ny slot i `mailDayProgram` | Hvordan |
|---|---|---|---|---|
| `dayPatches.onAppOpen` morning-gren (`buildMailPool`+carryover) | egen onAppOpen-gren | morning | `primary_work_mail` / `morning_brief` | carryover-logikk flyttes til en morning-dekorator på det planlagte primær-item; selve genereringen erstattes av MailRuntime planned primary |
| `dayEvents.makeLunchEvent` | onAppOpen lunch-gren | lunch | `phase_lunch` | kalles som generator for `phase`-slot i lunsj |
| `dayPatches` controller-afternoon (hardkodet) | onAppOpen afternoon-gren | afternoon | `conflict_or_event` (eller `primary_work_mail` for Dag 1) | flyttes til en controller-mailFamily (`conflict`/`event`) eller dedikert Dag-1-storylet |
| `decorateWorkMail`+`makeGenericCareerEvent` afternoon | onAppOpen afternoon-gren | afternoon | `conflict_or_event` fallback | brukes som fase-generator-fallback når ingen familie-kandidat finnes |
| `dayEvents.makeEveningEvent` | onAppOpen evening-gren | evening | `phase_evening` | kalles som generator for `phase`-slot i kveld |
| `dayEvents.makeDayEndEvent` | onAppOpen day_end-gren | day_end | `day_summary` | kalles som generator for `day_end`-slot (DailyMailBuilder har allerede `__generated_day_end`) |
| `dayPatches.answer` faseskifte | flytter fase per svar | (alle) | — | **fjernes**; fase eies av item.phase + DayProgression |
| `DailyTaskGates` gates | mater runtime | morning/afternoon/evening | task_gate-slots | **beholdes som mønster** |
| `applyTaskCapitalFromChoice` / `applyPhaseChoiceEffects` / `maybeCreateContactFromChoice` / `appendDayChoiceLog` (dayPatches.answer) | kjøres ved svar | (alle) | — | beholdes, men hektes på DailyMailBuilder.answer / en felles "etter-svar"-hook i stedet for dayPatches.answer-grenen |
| `renderWorkdayPanel` HUD-patch (dayPatches.patchUI) | dekorerer panel | (alle) | — | erstattes av native fasevisning i WorkdayPanel (§8) |

---

## 8. WorkdayPanel skal bli fasevisning

**I dag:** `computeWorkdayModel()` + `renderWorkdayPanel()` viser én aktiv arbeidsdag
(klokke/rolle/ett item/tidsvindu/ukeprogresjon/kontraktspress). `dayPatches.patchUI()`
monkey-patcher panelet og legger på fase-HUD + ukesrapport + kontakter + kunnskaps-task.
`CivicationDayPhaseUI` er en separat fase-visning.

**Mål:** WorkdayPanel leser `DailyMailBuilder` + `CivicationCalendar` + `TaskEngine` +
`CivicationDayProgression` og blir den ene fasevisningen. Det skal vise:

- **aktiv dag** — `Calendar.getPhaseModel().dayIndex`
- **aktiv fase** — `DayProgression.inspect().phase/phaseLabel`
- **aktiv pending item** — `IncomingFlow.getActiveWorkdayItem()` (beholdes)
- **åpne tasks for fasen** — `TaskEngine.listOpenTasksForCurrentPhase()`
- **dagens leveranser** — items gruppert per fase fra `DailyMailBuilder.inspect().runtime.items`
  (status pr. slot: morgen/lunsj/ettermiddag/kveld/dagslutt)
- **neste handling** — `DayProgression.inspect()` (`canAdvance`/`reason`/`nextPhase`)
- **dagsoppsummering ved day_end** — `Calendar.getDailySummary()` / `dayWeeklyReview`

**Viktig:** WorkdayPanel skal **lese**, ikke starte sin egen arbeidsdag (ingen
`onAppOpen`/`enqueue` fra UI). Fase-HUD-en fra `dayPatches.patchUI` bør på sikt erstattes
av en native seksjon i `computeWorkdayModel` slik at UI ikke er avhengig av en
monkey-patch. Datamodellen finnes allerede: `DailyMailBuilder.inspect()` returnerer
`by_phase`, `by_status` og hele `runtime.items` — nok til å rendre en bunke per fase
uten ny motor.

---

## 9. Arealplanlegger-funn (rollecase)

Rolle:

```
role_key:    by_radgiver_plan
role_scope:  arealplanlegger  (badge-tittel; resolves → by_radgiver_plan)
role_id:     by_arealplanlegger
career_id:   by
```

`CivicationCareerRoleResolver.resolveCareerRoleScope` mapper **både** `arealplanlegger`,
`byplanlegger`, `radgiver_byutvikling` og `role_key by_radgiver_plan` til den kanoniske
scope-en **`by_radgiver_plan`** (resolver-linjer 112–115, 168, 174, 232). Det betyr at
DailyMailBuilder/MailRuntime finner riktige fil-stier uansett om aktiv posisjon bærer
badge-tittelen "arealplanlegger" eller role_key `by_radgiver_plan`.

Datadekning (full):

- **mailPlan:** `data/Civication/mailPlans/by/by_radgiver_plan_plan.json` (id
  `by_radgiver_plan_v1`, reguleringssak i Lillebekk).
- **mailFamilies:** komplett sett under `data/Civication/mailFamilies/by/` →
  `job`, `conflict`, `event`, `story`, `consequence`, `followup`, `knowledge`,
  `micro`, `people` (alle `by_radgiver_plan_*.json`).
- **rolefil:** `data/Civication/roles/by_radgiver_plan.json`.

Sjekkliste:

| Spørsmål | Svar |
|---|---|
| Bygger DailyMailBuilder full dag? | **Ja** — `getFamilyPaths` finner intro_v2/job + alle EXTRA_MAIL_TYPES (people/story/conflict/event/micro/followup/knowledge/consequence); `buildQueue` fyller alle 5 faser. |
| Finnes morning/lunch/afternoon/evening/day_end? | **Ja** — fra `mailDayProgram.json` (defaultProgram identisk). |
| Hva skjer etter svar på første mail? | DailyMailBuilder.markAnswered + `current_index++`; **men** dayPatches.answer flytter også Calendar-fasen → mulig ping-pong (se §3.2). |
| Hvilken funksjon bestemmer neste item? | `DailyMailBuilder.findNextIndex` → `enqueueNext`. |
| Overstyrer/stopper gammel arbeidsdaglogikk flyten? | Ikke levering (DailyMailBuilder short-circuiter onAppOpen), men **fase-tilstanden** påvirkes av dayPatches.answer. |
| Viser WorkdayPanel riktig fase? | Delvis — HUD leser `Calendar.getPhaseModel()`, som kan være feil pga. ping-pong; bør lese DayProgression-fasen. |

**Verifisering i konsoll (Civication.html):**

```js
CivicationDebug.buildDebugMap("by_radgiver_plan")   // role/plan/families/dailyRuntime/gaps
CivicationDailyMailBuilder.inspect()                 // by_phase, by_status, items, next_index
CivicationDayProgression.inspect()                   // phase, openItemsInPhase, canAdvance
CivicationDebug.inspectWorkdayPhaseIntegration?.()   // NY: samlet parallell-spor-diagnose (denne PR)
```

`buildDebugMap` har en `gaps`-sjekk som vil flagge "runtime har bare morning og mangler
lunch/afternoon/evening/day_end" hvis dagen ikke bygges fullt — nyttig akseptansetest for
Arealplanlegger.

---

## 10. Controller-referanse

Controller er den dypest testede rollen og må ikke brytes av flettingen. Integrasjonen
skal bevare:

- **Controller Dag 1** — `isControllerDayOnePhase`/`isControllerDayOne` gir hardkodede
  lunch-/afternoon-tekster. Disse må **flyttes**, ikke slettes: lunch → `phase_lunch`
  generator, afternoon → `conflict_or_event`/Dag-1-storylet. Beholdes verbatim som
  innhold.
- **week1/ikke-week2-filteret** — `DailyMailBuilder.mailMatchesDailyProgression` +
  `extractProgressionWeek`/`inferMaxWeekFromPlan` hindrer at week2/advanced/mastery-mail
  lekker inn før rolePlan når dit. Dette **må bevares** når flere slots fylles fra
  familier.
- **primary_work_mail** — dagens planlagte primærmail fra
  `MailRuntime.makeCandidateMailsForActiveRole` (kun denne får `source_type:"planned"` og
  flytter rolePlan). Micro/followup/people/consequence skal **ikke** flytte rolePlan.
- **task_gates** — morning/main/analysis-leveranser skal fortsatt blokkere dagen til task
  er fullført.
- **people/lunch/evening/dagslutt** — kanalseparasjon (job vs private) via
  `CivicationEventChannels` + `IncomingFlow` må holde; jobbmail og private meldinger skal
  ikke blandes.

Regresjonsvakt: `tests/civication-controller-two-week-flow.test.js` (grønn i dag) sikrer
20 første package-steg, kanal-isolasjon, ingen fallback-progression for planned, og
branch-flags. Den må forbli grønn gjennom hele flettingen.

---

## 11. Anbefalt implementeringsrekkefølge (neste PR-er)

1. **PR A — fjern dobbelt faseskifte (lavest risiko, høyest gevinst).**
   Ta auto-faseskiftet ut av `dayPatches.answer` for daily-events
   (`mail_class === "daily_workday"` / `source_type` starter med `daily_`). La fase følge
   `item.phase` (DailyMailBuilder) + `CivicationDayProgression`. Behold
   `applyTaskCapitalFromChoice`/`applyPhaseChoiceEffects`/contact/log. Tester: controller
   two-week + incoming-flow + en ny "ingen ping-pong"-test.
2. **PR B — degrader `dayPatches.onAppOpen` til fallback.** Når DailyMailBuilder har bygd
   dag, skal dayPatches' fase-onAppOpen-gren ikke kjøre. (Allerede delvis sant via
   short-circuit; gjør det eksplisitt og test at lunch/evening/day_end-events kommer fra
   programmet, ikke fra dayPatches.)
3. **PR C — flytt fase-generatorene inn i DailyMailBuilder.** `makeLunchEvent`/
   `makeEveningEvent`/`makeDayEndEvent` + controller-Dag-1 kalles fra DailyMailBuilders
   `phase`/`day_end`-slot-generator (utvid `makeGeneratedEvent`). Behold all tekst.
4. **PR D — WorkdayPanel native fasevisning.** Utvid `computeWorkdayModel` med
   fase/dagsbunke fra `DailyMailBuilder.inspect()` + `DayProgression.inspect()`; fjern
   avhengigheten av `dayPatches.patchUI`-monkey-patchen. Konsolider med DayPhaseUI.
5. **PR E — opprydding.** Når alt går gjennom programmet: fjern de døde onAppOpen-grenene
   i `dayPatches` og oppdater `README/SYSTEM_REGISTRY.md` + `SYSTEM_MAP.md`.

---

## 12. Risikoer

- **Faseskifte eies av tre steder** (dayPatches.answer, DailyMailBuilder.enqueueNext
  setPhase, DayProgression.advancePhaseIfReady). Å fjerne én uten å forstå rekkefølgen kan
  fryse eller hoppe over faser. PR A må ha eksplisitt test.
- **Patch-rekkefølge er timing-avhengig** (`DOMContentLoaded` + `civi:dataReady`/
  `civi:booted`). Endring i lastrekkefølge kan bytte hvilken `answer`-wrapper som er
  ytterst. Ikke endre rekkefølgen i `Civication.html` uten å re-verifisere.
- **Hardkodet controller-innhold** ligger i `dayPatches`/`dayEvents`. Flytting må være
  verbatim for å ikke degradere Dag 1.
- **week-gating** (`mailMatchesDailyProgression`) må gjelde alle nye slot-fyll, ellers
  lekker advanced/week2-mail.
- **UI-monkey-patch** (`renderWorkdayPanel`) gjør at fjerning av dayPatches.patchUI uten
  native erstatning fjerner fase-HUD-en.
- **Civication er ekskludert fra TS-migrasjonen** (CLAUDE.md) — alt forblir
  `checkJs`/JSDoc JavaScript; ingen `.ts`-konvertering her.
- **Test mode-isolasjon** må holde: arbeidsdag i testmodus skal aldri skrive
  unlocks/progression/rewards.

---

## 13. Tester som bør oppdateres/lages

Grønne i dag (regresjonsvakt — må forbli grønne):

- `tests/civication-controller-two-week-flow.test.js` ✅ (kjørt 2026-06-22)
- `tests/civication-incoming-flow.test.js` ✅ (kjørt 2026-06-22)

Bør lages i kommende PR-er:

1. **`civication-day-phase-single-owner.test.js`** — etter PR A: svar på et morgen-item
   flytter **ikke** Calendar-fasen før alle morgen-items er besvart (ingen ping-pong).
2. **`civication-dailymailbuilder-full-day.test.js`** — for en rolle (controller +
   arealplanlegger): `buildQueue` produserer items i alle fem faser; `inspect().by_phase`
   har morning/lunch/afternoon/evening/day_end; `gaps` er tom for "mangler
   lunch/afternoon/evening/day_end".
3. **`civication-workday-panel-phase-model.test.js`** — etter PR D: `computeWorkdayModel`
   eksponerer aktiv fase + dagsbunke per fase uten å kalle `onAppOpen`.
4. **Statusdokumenterende test (denne PR, valgfri):** assert at både
   `__dayPhasePatched` og `__civicationDailyMailBuilderPatched` finnes på
   EventEngine-prototypen samtidig (dokumenterer dagens dobbeltpatch som utgangspunkt).

---

## Tillegg i denne PR-en

- Dette dokumentet.
- Liten, additiv, read-only debug-hjelper
  `CivicationDebug.inspectWorkdayPhaseIntegration()` i
  `js/Civication/systems/civicationMailPlanDebug.js` som samler de parallelle sporene
  (patch-flagg, Calendar-fase vs. DailyMailBuilder item-fase vs. DayProgression-fase,
  åpne items per fase) i ett objekt for å gjøre ping-pong-diagnosen rask.
- **Ingen** arbeidsdaglogikk er fjernet eller refaktorert.
</content>
</invoke>
