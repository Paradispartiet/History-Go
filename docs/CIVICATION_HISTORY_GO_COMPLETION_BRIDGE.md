# Civication ← History Go completion bridge

Dette er spesifikasjonen for **«Completion bridge»** — den planlagte PR 2 fra
`docs/CIVICATION_HISTORY_GO_TASK_SCHEMA.md`. Schema-PR-en (PR 1-grunnlaget) definerte allerede
hvordan en Civication-oppgave peker til History Go (`normalizeHistoryGoTaskPayload` /
`isHistoryGoTaskPayload` i `js/Civication/core/civicationTaskEngine.js`). Denne bro-en lukker
sløyfen: **når spilleren faktisk gjør handlingen i History Go, skal Civication-oppgaven få vite
det.**

Den dekker hullet beskrevet i `docs/CIVICATION_FLOW_AUDIT.md` §5: «Mangler: en listener/bridge
som kobler History Go-eventene til åpne Civication-tasks og skriver task result eller
completion.»

> Status: **spesifikasjon / kontrakt**, ikke implementert. Ingen kode i denne PR-en.

## 1. Designprinsipp (uendret)

1. **Civication skaper behovet** — en mail/rolle/konflikt lager en oppgave med et `task_payload`
   som peker til History Go.
2. **History Go er handlingsrommet** — spilleren går til kart/sted/person/quiz/debatt og lærer,
   besøker, låser opp.
3. **Resultatet føres tilbake** — broen registrerer fullføringen på Civication-oppgaven, slik at
   svar/followup/psyke/kapital/rolle kan reagere.

UI eier aldri sannhet; broen tolker faktiske History Go-hendelser og skriver **evidens**, ikke
gameplay-beslutninger.

## 2. Den harde virkeligheten: to apper, ett localStorage

`index.html` (hovedappen, der quiz/sted/unlock skjer) og `Civication.html` er **separate
entry-points med hver sin `window`** (se `CLAUDE.md` → «do not merge them»). En `CustomEvent`
som `hg:target-unlock` dispatches i hovedappens `window` og **når aldri Civication-siden** når
brukeren navigerer mellom sidene sekvensielt.

Derfor er den **primære mekanismen reconciliation ved Civication app-open**, ikke event-lytting:

| Mekanisme | Når den gjelder | Rolle |
| --- | --- | --- |
| **Reconciliation ved app-open** | Alltid (kryss-side) | **Primær.** Sammenlign åpne Civication-tasks mot History Go sin persisterte state i delt localStorage. |
| `storage`-event | Begge sider åpne samtidig (sjelden) | Opportunistisk live-oppdatering. |
| `hg:target-unlock` / `hg:unlocks` / `updateProfile` (samme `window`) | Kun hvis en HG-flate kjører i Civication-siden | Opportunistisk; må aldri være eneste vei. |

**Konsekvens:** broen må kunne avgjøre fullføring **kun ut fra localStorage-state**, uten å ha
sett selve eventet. Eventene er en optimalisering, ikke kontrakten.

## 3. Eierskap og moduler

Følger samme tynn-fasade-prinsipp som `civicationIncomingFlow` (se
`docs/CIVICATION_RUNTIME_OWNERSHIP_AUDIT.md`).

| Modul | Ansvar |
| --- | --- |
| `js/Civication/core/civicationTaskEngine.js` (finnes) | **Eier task-state** (`hg_civi_tasks_v1`). Får ny metode `markHistoryGoComplete()` og query `findOpenHistoryGoTasks()`. Er den eneste som skriver task-state. |
| `js/Civication/systems/civicationHistoryGoTaskBridge.js` (**ny**) | **Tynn listener/reconciler.** Leser History Go-state, matcher mot åpne tasks, kaller TaskEngine. Skriver ikke state selv. |
| History Go-emittere (`js/quizzes.js`, `js/hg_unlocks.js`, `js/knowledge.js` …) | **Uendret.** Rapporterer kun faktiske hendelser/state; vet ingenting om Civication. |

Broen lastes i `Civication.html` etter `civicationTaskEngine.js` (#17) og kobles til
`CivicationBoot.onAppOpen` (se `CIVICATION_PATCH_ORDER.md` for sømmer). Den må **ikke** patche
`EventEngine.answer`.

## 4. Ny task-substate: `history_go`

Broen markerer **History Go-delen** av oppgaven — ikke hele `status`. Mail-svaret eier fortsatt
overgangen `open → completed` (via `completeByMail`). `history_go` er evidens som svaret kan lese.

```js
// task.history_go (skrives av CivicationTaskEngine.markHistoryGoComplete)
{
  completed_at: "2026-06-20T10:15:00.000Z",
  completion_source: "hg_target_unlock" | "unlock_index" | "learning_log" |
                     "visited_places" | "quiz_progress" | "merits" | "reconcile_open",
  completion_mode: "place_quiz",        // fra task_payload.completion_mode
  matched_target: { target_type: "place", target_id: "akershus_festning" },
  correct: true                          // true når kravet er reelt oppfylt (ikke bare åpnet)
}
```

Regler:

- **Idempotent:** når `history_go.completed_at` finnes, ignorer nye treff for samme task.
- `correct: false` er lov for «åpnet, men ikke bestått» (f.eks. `open_place` uten quiz).
- Broen setter **aldri** `status: "completed"` direkte.

## 5. History Go-signaler broen konsumerer

Alle finnes allerede; broen leser dem, hovedappen fortsetter å skrive dem.

| Kilde (localStorage / event) | Form | Brukes til |
| --- | --- | --- |
| `hg:target-unlock` (event) | `{ kind: "person"\|"place", id, name, image, quizId, categoryId }` — `js/quizzes.js`, `js/ui/person-place-unlock-toast.js` | Direkte treff på place/person-quiz |
| `HGUnlocks.load()` (`js/hg_unlocks.js`) | indeks `{ byQuiz: { [quizId]: { quizId, categoryId, emne_ids, knowledge_ids, … } } }`. Skrives kun ved **riktig** svar. | quiz/kunnskap/unlock-treff (kryss-side) |
| `hg:unlocks` (event, ingen detail) | ping om at unlock-indeksen endret seg | trigger re-les av `HGUnlocks` |
| `visited_places` | array/objekt av place-id-er | `visit_place`/`open_place` |
| `quiz_progress`, `hg_quiz_sets_v1` | quiz-fremdrift/sett | `quiz_completed` |
| `merits_by_category` | `{ [category]: { points } }` | kategori-nivå kunnskapskrav |
| `hg_learning_log_v1` (append-only) | læringslogg med `category`/`emne`-hits | `emne_id`-baserte krav |
| `hg_debate_log_v1` (`js/hgDebates.js`) | `{ byId: { [id]: { debateId, conflictId, participated, position, positions[] } } }`. `id = debateId \|\| conflictId`. | `debate_participated` / `position_chosen` (kryss-side) |
| `hg_reads_v1` (`js/hgReads.js`) | `{ stories: {[id]:{placeId,personId}}, leksikon: {[id]:{categoryId,emneId}}, persons: {[id]} }` | `read_story` / `read_leksikon` / `open_person` / `read_profile` (kryss-side) |
| `hg:debate-participated` (event) | `{ id, debateId, conflictId, position }` | trigger re-reconcile (samme `window`) |
| `updateProfile` (event) | generisk «noe endret seg» | debounced re-reconcile (samme `window`) |

> Debatt-signalet (`HGDebates.record(...)` → `hg_debate_log_v1`) er **kontrakten/produsenten**,
> analogt med hvordan `HGUnlocks.recordFromQuiz` skrives av `quizzes.js`. Det gjenstår en faktisk
> History Go debatt-/standpunkt-flate som kaller `HGDebates.record(...)`, og en rute å deep-linke
> til (det finnes ingen `#/debate`-rute ennå). Til den finnes vil deep-link returnere `null` for
> debatt, men broen fullfører debatt-tasks så snart loggen har en oppføring.

## 6. Completion-mode → tilfredsstillende signal

| `task_kind` | `completion_mode` | Oppfylt når … |
| --- | --- | --- |
| `history_go_place` | `open_place` | `place_id ∈ visited_places` **eller** target-unlock for `id` (`correct:false` hvis kun åpnet) |
| | `visit_place` | `place_id ∈ visited_places` |
| | `place_quiz` | `hg:target-unlock {kind:"place", id}` eller `HGUnlocks.byQuiz` har quiz for stedet |
| | `read_story` | `hg_reads_v1.stories` har en oppføring med `placeId === place_id/target_id` |
| `history_go_person` | `open_person` / `read_profile` | `hg_reads_v1.persons[person_id]` finnes (person åpnet/profil lest) |
| | `person_quiz` | `hg:target-unlock {kind:"person", id}` eller `HGUnlocks` |
| `history_go_knowledge` | `quiz_completed` | `quiz_id ∈ HGUnlocks.byQuiz` / `quiz_progress` |
| | `correct_answer` | `quiz_id ∈ HGUnlocks.byQuiz` (indeksen skrives kun ved riktig svar → `correct:true`) |
| | `read_leksikon` | `hg_reads_v1.leksikon` har treff på `emne_id` / `category_id` / `target_id` |
| `history_go_debate` | `debate_participated` | `hg_debate_log_v1[id].participated` (id = `debate_id`\|`conflict_id`\|`target_id`) |
| `history_go_debate` | `position_chosen` | `hg_debate_log_v1[id].position` er satt |
| `history_go_unlock` | `unlocked` | `unlock_id` til stede i relevant indeks for `required_kind` |

Matching av `target_id`: bruk den normaliserte `target_id` fra `task_payload` (som allerede
samles fra `place_id`/`person_id`/`quiz_id`/… av schema-laget) mot `id`/`quizId` i signalet.

## 7. Ny TaskEngine-API

Tilføyes i `js/Civication/core/civicationTaskEngine.js` (eier av `hg_civi_tasks_v1`):

```js
// Returnerer åpne tasks som har et normalisert History Go-payload.
findOpenHistoryGoTasks(): Task[]

// Markerer History Go-delen fullført. Idempotent. Dispatcher updateProfile via setStore.
// match = { completion_source, completion_mode, matched_target, correct }
markHistoryGoComplete(taskId, match): Task | null
```

`setStore` dispatcher allerede `updateProfile` ved faktisk endring (linje ~156), så
`markHistoryGoComplete` arver **én** `updateProfile` per reell endring. Broen dispatcher i tillegg
et nytt, spesifikt signal slik at mail-/UI-laget kan reagere presist:

```js
window.dispatchEvent(new CustomEvent("civi:taskHistoryGoCompleted", {
  detail: { task_id, mail_id, matched_target, correct }
}));
```

## 8. Kobling til mail-svaret (hvordan evidens påvirker spillet)

Flow audit §3 («Task completion») noterer at `EventEngine.answer` allerede leser
`hg_civi_task_results_v1[taskId]` for interaktive task-resultater, men at det **ikke finnes en
tydelig writer** for denne state-en. Broen formaliserer dette:

- `markHistoryGoComplete` er den autoritative writer-en. Den speiler resultatet til
  `hg_civi_task_results_v1[taskId] = correct ? 1 : 0` for bakoverkompatibilitet med eksisterende
  lese-logikk i `EventEngine.answer` (+1/0/-1-modifikator på valget).
- På sikt bør `hg_civi_task_results_v1` regnes som **avledet** av `task.history_go` og eies av
  TaskEngine; ingen annen modul skal skrive den.

Resultat: en spiller som faktisk tok kunnskapshandlingen i History Go får den «gode» effekten på
det relaterte Civication-svaret — uten at broen tar gameplay-beslutninger selv.

## 9. Invarianter

1. **Testmodus er isolert.** Broen må være no-op når appen er i testmodus (jf. `CLAUDE.md`:
   «Test mode must never write unlocks, progression, or rewards»). Avklar nøyaktig flagg mot
   `CivicationState`/`OPEN_MODE` ved implementasjon.
2. **Kun TaskEngine skriver task-state.** Broen kaller API; den skriver ikke `hg_civi_tasks_v1`.
3. **Idempotent og additiv.** Ingen nye localStorage-nøkler (gjenbruker `hg_civi_tasks_v1` og
   `hg_civi_task_results_v1`). Ingen endring av eksisterende nøkkelformat.
4. **History Go forblir uvitende om Civication.** Ingen Civication-import i hovedappen.
5. **`updateProfile` én gang per endring** (arvet fra `setStore`); broen dobbelt-dispatcher ikke.
6. **Fail safe, ikke fail fast for UI:** mangler en HG-flate (f.eks. debatt), står tasken åpen —
   broen finner aldri på fullføring uten reelt signal.

## 10. Ende-til-ende-flyt (eksempel)

1. Civication-mail lager task med `task_payload = { task_kind:"history_go_place",
   target_type:"place", place_id:"akershus_festning", completion_mode:"place_quiz", … }`.
   TaskEngine normaliserer og lagrer (`status:"open"`).
2. Deep-link UI (companion-PR) viser «Gå til History Go» → navigerer til hovedappen / stedet.
3. Spilleren tar stedsquizen riktig i `index.html`. `HGUnlocks.recordFromQuiz()` skriver
   indeksen; `hg:target-unlock` dispatches i hovedappens window.
4. Spilleren går tilbake til `Civication.html`. **App-open → broen reconciler:** for hver
   `findOpenHistoryGoTasks()` sjekkes signalet i §6. `akershus_festning` finnes nå i
   `HGUnlocks`/target-unlock → `markHistoryGoComplete("task_…", { completion_source:
   "hg_target_unlock", completion_mode:"place_quiz", matched_target:{…}, correct:true })`.
5. TaskEngine skriver `task.history_go`, speiler `hg_civi_task_results_v1`, dispatcher
   `updateProfile`; broen dispatcher `civi:taskHistoryGoCompleted`.
6. Når spilleren svarer på mailen, leser `EventEngine.answer` resultatet og gir den gode effekten.

## 11. Testplan (Node-asserts, jf. eksisterende `tests/civication-*.test.js`)

- **Reconcile kryss-side:** seed `hg_civi_tasks_v1` (åpen place-task) + `HGUnlocks`/`visited_places`,
  kjør reconcile, forvent `task.history_go.completed_at` + `hg_civi_task_results_v1[taskId]===1`.
- **Idempotens:** to reconciles → kun én `updateProfile`, uendret `completed_at`.
- **Negativ:** `open_place` uten quiz → `correct:false`; ingen feilaktig `correct:true`.
- **Ingen falsk fullføring:** task uten matchende HG-state forblir `open`.
- **Debatt-task:** forblir åpen uten signal; fullføres når `hg_debate_log_v1` har en oppføring
  (`participated` for `debate_participated`, `position` satt for `position_chosen`).
- **Testmodus:** reconcile i testmodus skriver ingenting.
- **Eierskap:** broen kaller TaskEngine-API; ingen direkte `localStorage.setItem("hg_civi_tasks_v1")`.

## 12. Åpne punkter / forutsetninger

- **Alle signal-kontraktene finnes nå** som persisterte markører broen leser:
  - quiz/unlock: `hg_unlocks_v1` (`HGUnlocks`, skrevet av `quizzes.js`)
  - sted: `visited_places`
  - debatt: `hg_debate_log_v1` (`HGDebates`)
  - story/leksikon/person-åpnet: `hg_reads_v1` (`HGReads`)
- **Det som gjenstår er produsent-siden** — å kalle signalene fra faktiske History Go-flater:
  `HGReads.recordStory/recordLeksikon/recordPerson(...)` fra story-/leksikon-/personvisning, og
  `HGDebates.record(...)` fra en debatt-/standpunkt-flate. Pluss en `#/debate`-rute så deep-link
  kan navigere til debatt (deep-link dekker allerede place/quiz).
- **Eksakt testmodus-flagg** i Civication må verifiseres mot `CivicationState` ved implementasjon.

## 13. Utenfor scope

- Deep-link UI fra Civication til History Go (companion-PR 1 fra schema-doc; «Gå til History Go»).
- Endring av `EventEngine.answer` sin grunnflyt (broen leverer kun evidens den allerede leser).
- Nye HG-side emittere for debatt/story/leksikon (egne forutsetnings-PR-er).
- TypeScript-migrering av Civication.
