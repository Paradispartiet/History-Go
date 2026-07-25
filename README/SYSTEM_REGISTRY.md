# SYSTEM REGISTRY – History Go

Status: **canonical runtime ownership contract**  
Last verified: **2026-07-25**

Dette dokumentet definerer regler og kontrakter for systemet.
Det er bindende for videre utvikling.

---

## Product state

- [Current product state](./CURRENT_PRODUCT_STATE.md)

## Dataproduksjonskontrakt

- Praktisk dataproduksjon for places, people, badges, `underbadge_ids`, `rounds`, manifest-bruk og duplikatregler styres av [DATA_PRODUCTION_CONTRACT](../docs/DATA_PRODUCTION_CONTRACT.md). Ikke lim kontrakten inn her; bruk den som aktiv arbeidskontrakt ved dataendringer.

## Aktive subsystemkontrakter

- Observations, fagstruktur/progresjon, Civication wallet/shell/debug/Home, HG Social, Today Hub, Daily Objectives/Progress, Spotmeeting og Social Meet styres av [`SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](./SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md).
- Dette dokumentet eier de overordnede grensene. Subsystemdokumentet eier de eksplisitte API-, storage-, privacy- og UI-kontraktene for de registrerte subsystemene.
- Ingen av kontraktene skal hentes fra den historiske pre-split-filen.

## TILLATTE GLOBALS

Følgende globals er eksplisitt tillatt:

- window.PLACES
- window.PEOPLE
- window.BADGES
- window.RELATIONS
- window.MAP
- window.HGMap
- window.HGPos
- window.OPEN_MODE
- window.API
- window.HG_CiviDebug
- window.HG_RuntimeHealth
- window.HG_RuntimeSmokeRunner
- window.HG_RuntimeHealthPanel
- window.HG_CiviEconomySnapshot

Ingen andre globals skal introduseres uten beslutning.

### Top-level runtime health diagnostics

`window.HG_RuntimeHealth` is an allowed global exposed by `js/debug/HGRuntimeHealth.js` for browser-console diagnostics only.

Allowed methods:

- `HG_RuntimeHealth.snapshot()` — read-only snapshot of Civication health, HG Social health, core globals, map availability, profile/learning-log availability, and basic data counts.
- `HG_RuntimeHealth.health()` — read-only top-level readiness report returning `{ ok, score, checks, blockers, warnings, summary, timestamp }`.
- `HG_RuntimeHealth.printHealth()` — prints the report compactly in the console and returns the same health object.

This helper is **read-only diagnostics only**. It may aggregate existing subsystem diagnostics, including `HG_CiviDebug.health()` and `HG_SocialDebug.health()`, but it must not own or change Civication logic, HG Social logic, map logic, profile logic, data loading, UI, gameplay flow, rendering, or localStorage contents.

`window.HG_RuntimeSmokeRunner` is an allowed global exposed by `js/debug/HGRuntimeSmokeRunner.js` for **TEST_MODE-only** manual runtime smoke checks. It is enabled only when `localStorage.getItem("HG_TEST_MODE") === "1"`.

Allowed methods:

- `HG_RuntimeSmokeRunner.isEnabled()` — reads the TEST_MODE flag.
- `HG_RuntimeSmokeRunner.run()` — performs a read-only smoke check of runtime health, map data readiness, learning-log read APIs, Civication/HG Social debug health, profile snapshot availability, PlaceCard readiness, and privacy field leaks.
- `HG_RuntimeSmokeRunner.print()` — runs the same smoke check and prints compact console output.

This helper is **read-only diagnostics only**. It must not create demo data, fake users, invites, circles, routes, unlocks, economy ticks, mail answers, place-card opens, or gameplay/profile/map/data mutations. When TEST_MODE is disabled, `run()` only reads `HG_TEST_MODE` and returns a skipped result.

`window.HG_RuntimeHealthPanel` is an allowed global exposed by `js/debug/HGRuntimeHealthPanel.js` for **TEST_MODE-only** in-app diagnostics UI. It exposes `render()`, `refresh()`, `remove()`, and `isEnabled()`. The panel may render `HG_RuntimeHealth.health()` for manual testing only when test mode is enabled; it is read-only diagnostics UI, not production UI, and must not mutate gameplay, profile, map, data, Civication, HG Social, or localStorage state.

### Civication read-only debug-globals

Disse er eksplisitt tillatt, men er **kun read-only inspeksjon** (ingen gameplay, ingen skriving):

- `window.HG_CiviWorkdaySnapshot()` — returnerer et øyeblikksbilde av arbeidsdag-state
  (`CivicationUI.getCurrentWorkdaySnapshot`). Ren lesning av `CivicationState`,
  `CivicationCalendar`, `CivicationTaskEngine` og innboksen via den delte `computeWorkdayModel()`
  som `renderWorkdayPanel()` også bruker. Inkluderer `dayPhase` (aktiv fase + dagsbunke per
  fase), lest read-only fra `CivicationDayProgression.inspect()` +
  `CivicationDailyMailBuilder.inspect()`. Rører ikke DOM, kaller ikke `onAppOpen`/`enqueue` og
  endrer ikke rendering.
- `window.CivicationHome.getHomeSnapshot()` — read-only Home/nabolag-øyeblikksbilde fra
  `CivicationHome` / `civi_home_v1`, med kapital lest fra `hg_capital_v1`. Endrer ikke
  gameplay-state, priser, husleie eller boligpress.
- `window.CivicationHome.getDistrictViewModels()` — read-only district view models for
  UI/debug. Bruker eksisterende distriktsdata, låseregler og kapital-lesning, men skriver
  ingenting og endrer ikke kjøps-/flytteregler.

### Civication arbeidsdag / dagsfaser — eierskap (hard rule)

Arbeidsdagen har **én** dagrytme og **ett** sett fase-skrivere. Ikke innfør parallelle.

- **To innholdssystemer (ikke bland):** de **private fase-mailene** (morning, lunch,
  afternoon, dinner, evening, day_end) eies av `CivicationPrivatePhaseMailBuilder` og bygges
  fra `data/Civication/privatePhaseMailFamilies/<fase>.json` — aldri jobb, maks 1 aktiv mail
  per fase, alltid `source_type:"daily_private_phase"` / `mail_class:"daily_private"` /
  `channel:"private"` med tom `role_scope`/`career_id`/`role_id`/`employer_id` og
  `workday_related:false`. **Arbeidslivsmailene** eies av `CivicationWorkdayMailBuilder`
  (mailPlan + mailFamilies), kan kun ha `phase_tag` `forenoon`/`workday`, og bærer
  `mail_class:"daily_workday"` + rolle/arbeidsgiver/`workday_day_index`. `CivicationEventChannels`,
  `CivicationDayProgression`, `CivicationNextActionSelector` og `renderCivicationInbox`
  respekterer skillet: jobbmail er aldri aktiv i en privat fase og blokkerer den ikke.
- **Private fase-mailer er en projeksjon av History Go-profilen** — ikke av jobben. De skal
  speile hva spilleren har samlet, besøkt, lært og bygget opp; arbeidslivsmail tilhører bare
  arbeidsdagen (`forenoon`/`workday`). `CivicationProfileSignalBridge` (offentlig API:
  `getSignals`, `getProfileTags`, `getPrivatePhaseWeights`, `inspect`) normaliserer identitet,
  kapital, psyke (inkl. `energy`) og History Go-samlingen til `profileTags` +
  `privatePhaseWeights` (culture, sport, nature, politics, social, learning, economy, rest,
  family, subculture). Builderen velger mail etter disse; **profilmatch slår dato-rotasjon**,
  og uten profiltreff brukes en trygg generisk fallback. Broen leser **kun** profilen — aldri
  `mailPlan`, role mail families, `plannedPrimary`, `role_scope`, `employer_id` eller
  `workday_day_index`. Konsekvens: samme jobb + ulik profil ⇒ ulike private mailer; samme
  profil + ulik jobb ⇒ samme private mailer.
- **Dagrytme:** `data/Civication/mailDayProgram.json` + `CivicationDailyMailBuilder` er
  autoritativt (adaptor). Builder bygger hele dagen til `mail_day_runtime_v1.items[]` og leverer
  items ett om gangen via `enqueueNext`, men **delegerer de private fasene** til
  `CivicationPrivatePhaseMailBuilder`. Ingen annen `onAppOpen`-gren skal generere en parallell dag.
- **Fase-skrivere (kun to):** `DailyMailBuilder.enqueueNext` setter
  `CivicationCalendar.setPhase(item.phase)`, og `CivicationDayProgression.advancePhaseIfReady()`
  avanserer fasen når fasens items er tomme. `dayPatches.answer` skal **ikke** flytte fasen for
  daily-events (gjenkjent via `CivicationDailyMailBuilder.isDailyEvent`); den beholder bare
  etter-svar-effektene.
- **`dayPatches` eier ikke arbeidsdag/fase.** `dayPatches.onAppOpen` håndterer kun
  recovery/onboarding og deferrer ellers til DailyMailBuilder
  (`CivicationDailyMailBuilder.hasBuiltDayForActiveRole`); de gamle fase-genererte grenene er
  fjernet. `dayEvents`-generatorene (`makeLunchEvent`/`makeEveningEvent`/`makeDayEndEvent`,
  inkl. controller-Dag-1) kalles av DailyMailBuilder som slot-generatorer ved levering.
- **UI leser, eier ikke:** `CivicationUI.renderWorkdayPanel`/`computeWorkdayModel.dayPhase` og
  `CivicationDayPhaseUI` **leser** fase/dagsbunke fra DayProgression/DailyMailBuilder. Faseavansering
  skjer kun via `CivicationDayProgression.advancePhaseIfReady` (knapp i `CivicationDayPhaseUI`).
- **NextAction er eneste aktive svarflate.** `CivicationNextActionSelector.getCurrent()` velger
  nøyaktig én aktiv handling — primært `CivicationDayProgression.inspect()` (`pendingItem`, ellers
  `nextQueuedItem`), med ikke-fasebaserte innboks-handlinger kun som fallback. `CivicationNextActionUI`
  er den **eneste** flaten som rendrer svaralternativer. `CivicationDayPhaseUI` (Dagens fase) er et
  rent statuskort (fase, antall åpne, neste sak) og ruter til NextAction via «Gå til neste handling».
  Innboksen er arkiv/detalj: for en aktiv fasehandling viser den «Håndteres i Neste handling» med
  lenke dit, ikke egne svarvalg. `WorkdayPanel` viser kun en kompakt fase-HUD — `buildDayPhaseSectionHtml`
  rendrer **aldri** `data-civi-bundle-choice` i normal runtime (full bunke kun bak debug-flagg).

---

## INIT-REGLER

| Funksjon | Fil | Når |
|--------|-----|-----|
| boot() | boot.js | DOMContentLoaded |
| initLeftPanel() | left-panel.js | etter DOM |
| initMiniProfile() | mini-profile.js | etter DOM |
| QuizEngine.init() | boot.js | etter data |

All init skjer via `boot()`.

---

## ABSOLUTTE REGLER

1. ❌ Core-filer skal aldri bruke DOM
2. ❌ UI-filer skal aldri fetch’e data
3. ❌ Ingen `DOMContentLoaded` utenfor `app.js`
4. ❌ Ingen dupliserte funksjonsnavn på tvers av filer
5. ✅ All systemstart går gjennom `boot()`

---

## FEILHÅNDTERING

- `safeRun()` er eneste tillatte wrapper for init
- Kritiske feil logges til `window.__HG_LAST_ERROR__`
- UI-feil skal ikke stoppe boot

---

## ENDRINGER

Endringer i struktur krever:
1. Oppdatert SYSTEM_MAP.md
2. Oppdatert SYSTEM_REGISTRY.md
3. Oppdatert `SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md` når API-, storage-, privacy- eller subsystemeierskap endres

Ingen unntak.

---

## Historisk arkiv

Den tidligere fullteksten er bevart byte-identisk i [`archive/SYSTEM_REGISTRY_PRE_SPLIT_2026-07-25.md`](./archive/SYSTEM_REGISTRY_PRE_SPLIT_2026-07-25.md).

Arkivet inneholder både legacytekst og kildeversjonene til appendiksregler som nå er konsolidert i `SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`. Arkivfilen er historisk dokumentasjon og er ikke bindende.

---

## SLUTT

Dette dokumentet og `SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md` utgjør den aktive runtime-kontrakten for History Go.
