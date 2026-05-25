# Civication flow audit (2026-05-25)

## 1. Kort status

Civication i `main` er **ikke bare UI**: det finnes en aktiv runtime med state-lagring, inbox/event-motor, dagfase-gating, wallet/kapitalberegning og flere patch-lag rundt `HG_CiviEngine`.

Samtidig er systemet tydelig i en **hybridfase**:
- En del moduler er operative i runtime (f.eks. `CivicationBoot`, `CivicationState`, `dayProgressionController`, `dayRuntimeDebugPanel`, `civicationEventChannels`).
- Andre områder er mer halvferdige eller overlappende (parallelle mailruntime-lag, legacy vs ny dagruntime, flere karriere-/jobbtilbudsbaner).

Nåværende rolle mot History Go er i praksis: **konsekvens- og presentasjonslag som leser HG-progresjon fra localStorage**, men med bare delvis konsekvenssløyfe ferdig (spesielt tydelig for naeringsliv/jobmail). Dette er mer enn mockup, men mindre enn en full, stram game loop.

---

## 2. Filkart (faktisk ansvar)

### HTML entry
- `Civication.html`
  - Definerer hele UI-skallet (dashboard, kapital, psyke, hjem, jobbpanel, inbox, map, day phase panelholder).
  - Laster et stort script-stack i bestemt rekkefølge: state/mail/core → UI → day systems → debug panel → `CivicationBoot.js`.

### CSS/layout
- `css/civi.css`, `css/civi-refresh.css`, `css/civi-dashboard.css`, `css/civi-mini.css`, `css/civi-system-map.css`
  - Styling for hovedlayout, dashboard-kort, mini-seksjoner og systemkart.
  - Ingen sentral gameplaylogikk, men UI-signaler kan få ting til å se “aktivt” ut selv når effektlogikk er svak.

### Core/state
- `js/Civication/core/civicationState.js`
  - Primær localStorage-fasade (`hg_civi_state_v1`, `hg_civi_inbox_v1`, `hg_active_position_v1`, `hg_civi_wallet_v1`, m.fl.).
  - Har defaults for mail-system, narrative-state, career-state, onboarding.
- `js/Civication/CivicationBoot.js`
  - Orkestrerer startup, laster careers + badges, instansierer `HG_CiviEngine`, kjører runtime-bridges.
- `js/Civication/core/civicationCalendar.js`
  - Kalender/klokke-shift (dayIndex, minutter, shift start/slutt).

### UI
- `js/Civication/ui/CivicationUI.js`
  - Init/refresh, hovedrender, inbox-render, workday-panel, capital/psyche/home renderhooks.
  - Knytter svar-knapper til `HG_CiviEngine.answer(...)`.
- `js/Civication/ui/CivicationDashboardUI.js`
  - Dashboard KPI (wallet, inbox count, status, home, fokus).
- `js/Civication/ui/CivicationDayPhaseUI.js`
  - Viser fase, blokkeringsårsak og neste fase-knapp.

### Inbox/message/event
- `js/Civication/systems/civicationEventChannels.js`
  - Klassifiserer events (`message/workday/milestone/system`) + kanal (`job/private`).
- `js/Civication/systems/civicationDailyMailBuilder.js`
  - Bygger daglige runtime-items pr fase, håndterer pending/answered status og patcher `onAppOpen/answer`.
- `js/Civication/systems/civicationMailRuntime.js`
  - Runtime-wrapper rundt mailvalg/inboxflyt (parallelt lag med daily builder).
- `js/Civication/systems/civicationLifeMailRuntime.js`
  - Eget lag for life/private mail.

### Career/jobmail
- `js/Civication/core/civicationJobs.js`
  - Jobboffers-livssyklus, recovery-arc, aktiv rolle-relatert status.
- `js/Civication/merits-and-jobs.js`
  - Kobler merit/quiz-poeng til jobboffers (tier-up triggere).
- `js/Civication/systems/civicationCareerRoleResolver.js`
  - Mapper aktiv posisjon til role scope/id (særlig naeringsliv).
- `data/Civication/jobbmails/**/*.json`, `data/Civication/mailFamilies/**/*.json`, `data/Civication/mailPlans/**/*.json`
  - Faktiske jobbmail-kilder/planfamilier.

### Economy/wallet/capital
- `js/Civication/core/civicationEconomyEngine.js`
  - Tier-up checks + ukentlig PC tick inkl. NAV-regel ved arbeidsledighet.
- `js/Civication/capitalEngine.js`
  - Kapitalvektor (economic/cultural/social/symbolic/political/...) + runtimeberegning.
- `js/Civication/ui/CivicationHome.js`
  - Home-kjøp/flytt/effekt mot capital og psyche.

### Runtime debug/diagnostics
- `js/Civication/systems/day/dayRuntimeDebugPanel.js`
  - In-page debugpanel med runtime snapshot, pending mail, people/trust, alliance/faction.
- `js/Civication/systems/civicationMailPlanDebug.js`
  - Ekstra debug API for mail runtime-kandidater.

### Datafiler Civication faktisk leser i runtime
- `data/Civication/hg_careers.json`
- `data/badges/index.json` (+ underfiler)
- `data/Civication/place_contexts.json`
- Jobbmail packs via `packMap` (naeringsliv/vitenskap/media/by)

---

## 3. Nåværende spillflyt (kode vs effekt)

1. **Ved åpning av Civication**
   - `CivicationBoot.start()` laster badges/careers og oppretter `window.HG_CiviEngine`.
   - `CivicationUI.init()` kjører, og hvis ingen aktiv rolle + tom inbox: `HG_CiviEngine.onAppOpen()`.

2. **State-init**
   - `CivicationState` henter/merger defaults med localStorage.
   - Inbox hentes primært fra `CivicationMailEngine` hvis tilgjengelig, ellers legacy-key.

3. **Dashboard vises**
   - `CivicationDashboardUI` leser wallet/inbox/active/home og oppdaterer KPI-er.
   - UI oppdateres på `updateProfile`, `civi:inboxChanged` osv.

4. **Hvordan inbox oppstår**
   - Flere lag kan enqueue: `HG_CiviEngine` packs + daily mail builder + brand progression/life runtime.
   - Fasegating bruker runtime-items med status (`queued`, `pending`, `answered`...).

5. **Hvordan jobbmail oppstår**
   - Dels via packMap/engine, dels via merit-tier jobbtilbud (`merits-and-jobs`), dels via brand progression rules.
   - En del baner er tydelig naeringsliv-spisset.

6. **Dagfase**
   - `CivicationDayProgression.inspect()` stopper faseadvance ved åpne items i aktuell fase.
   - `advancePhaseIfReady()` endrer fase via kalender + emitter events.

7. **Verdipåvirkning**
   - Wallet: ukentlig tick finnes (`tickPCIncomeWeekly`) med arbeidsledig/NAV branch.
   - Capital/psyche: flere konsekvensbaner (`dayConsequences`, `capitalEngine`, `CivicationHome`).
   - Ikke alle endringer er like tydelig synlige for spiller i samme øyeblikk.

8. **LocalStorage**
   - Civication bruker mange nøkler aktivt (state, inbox, active position, wallet, calendar, capital, job offers, recovery, debug-open).

9. **History Go-data**
   - Leser `merits_by_category`, `quiz_progress`, quiz history (`HGLearningLog`), badges/careers.
   - Kobling finnes og brukes, men full konsekvenskjede “HG quiz → presis Civication-situasjon neste fase/dag” er ikke helt stram enda.

---

## 4. Inbox-analyse (Jobbmail vs Personlig)

**Data/logikk:**
- `CivicationEventChannels.getMessageChannel()` støtter eksplisitt `channel/messageChannel` og inferens til `job` vs `private`.
- `splitInboxByMessageChannel()` lager separate buckets (`job`, `private`, `system`, `unknown`).

**UI:**
- `CivicationUI.renderCivicationInbox()` bygger separate seksjoner for **Jobbmail** og **Personlige meldinger**.

**Vurdering:**
- Skillet er **faktisk implementert**, ikke bare visuelt.
- Men klassifisering er delvis heuristisk (source/mail_class/slot/stream), så feilkategorisering kan skje dersom eventmetadata er ujevn.

**For rent skille videre:**
1. Gjør `event.channel` obligatorisk i alle mailgenererende paths.
2. Behold heuristikk kun som fallback + debug advarsel ved fallback.
3. Legg testdekning for alle viktige mailfamilier (job/private/system).

---

## 5. Jobbmail- og karriereanalyse

- Jobbmail genereres gjennom flere mekanismer (packMap, daily builder, merits→offers, brand progression).
- Triggerne er delvis HG-progresjon (merits/tiers), delvis runtime state/brand thresholds.
- Valg har **noen reelle effekter** (branch flags, capital/psyche deltas, progression-triggered mails, recovery arcs i jobs-modul).
- Men helheten er ikke entydig én kontrollert karriereloop; flere parallelle systemer kan overlappe.

**Om opprykk/stagnasjon/oppsigelse/autonomi:**
- Kode for slike konsekvenser finnes i deler av systemet (outcome/recovery/psyche/consequences).
- Ikke alt er verifisert som konsekvent spilleropplevelse i én sammenhengende loop på tvers av alle careers.

**Fallback-mail:**
- Runtime har fallback-lignende adferd i builder/engine, men risiko for repetisjon finnes når pending/answered/phase-tilstand ikke synkes perfekt mellom lag.

**Første kontrollerte karriereloop bør ligge i:**
- `CivicationDailyMailBuilder` + `CivicationEventChannels` + `CivicationUI.renderCivicationInbox` for én valgt career (anbefalt: `naeringsliv`), med én tydelig source-of-truth for pending/answered.

---

## 6. History Go → Civication-kobling

**Nøkler/inputs som leses:**
- `merits_by_category`
- `quiz_progress`
- `hg_unlocks_v1` (primært i profile-sfæren)
- quiz history via `HGLearningLog`
- badges/careers fra datafiler

**Er kobling aktiv?**
- Ja, aktiv i runtime (tilbud/tier/salary/context-bias), men med varierende styrke mellom subsystemer.

**Første rene kobling å implementere videre:**
- En enkel deterministisk regel: når `merits_by_category[<kategori>]` passerer terskel X, enqueue eksakt én career-relevant morning-jobmail i neste fase/dag med eksplisitt `channel:"job"`.

---

## 7. Kapitaler og økonomi

- Faktiske kapitaltyper brukt: minst `economic`, `cultural`, `social`, `symbolic`, `political` (+ internal støtte for `institutional`, `subculture`).
- Lagring: `hg_capital_v1`.
- Endring: via capital engine, day consequences, home-system, og enkelte rolle/valgbaner.
- Ukentlig PC-/lønnstick: finnes (`tickPCIncomeWeekly`).
- NAV-/arbeidslediglogikk: finnes i weekly tick (etter configured uker).
- Home/shop kobling: home er tydelig koblet til økonomisk kapital; shop/UI har delvis wallet-integrasjon.

**Status:**
- Fungerer: grunnmotor for kapital/wallet.
- Delvis: konsekvent synlig effektkjede i alle UI-paneler og alle loops.
- Forberedt: flere utvidede kapital-/livsstilsbaner.

---

## 8. Dagfase og tidsflyt

- Faser brukt av day progression: `morning`, `lunch`, `afternoon`, `evening`, `day_end` (fallback-liste).
- Videregang: knapp i `CivicationDayPhaseUI`, men blokkeres av åpne meldinger i aktuell fase.
- Nye meldinger trigges av runtime builder/engine og fase/dagtilstand.
- Fase påvirker innhold delvis (phase tags/slots/contexts).

**Mangler for første stramme 7-dagers loop:**
1. Entydig daglig “seed” per dag/fase.
2. Én konsekvent pending/answered-state uten overlappende wrappers.
3. Stabil anti-repetisjonsregel per dag og per mail-family.
4. Enkel “day summary” som bekrefter faktiske konsekvenser før neste morgen.

---

## 9. Runtime debug-status

**Finnes:**
- `dayRuntimeDebugPanel` monteres automatisk i UI med toggle.
- `CivicationMailPlanDebug` eksponerer inspeksjon/candidates.

**Aktivering:**
- Panel alltid mountet; open/closed huskes i `hg_civi_debug_panel_open_v1`.

**Viser i dag:**
- Aktiv rolle/faction/plan-step.
- Pending mail (id/type/family/subject/score breakdown).
- People/trust rows.
- Alliances/faction conflicts.

**Dekning vs krav:**
- Inbox: **delvis** (viser pending, ikke full kanalfordelt historikk).
- DayPhase: **svak** (indirekte, ikke full faseinspeksjon i samme panel).
- Career/jobmail: **delvis**.
- Wallet/PC: **mangler i panelet**.
- Capital: **mangler i panelet**.
- HistoryGo-koblinger: **mangler direkte visning** (merits/unlocks/context match ikke eksplisitt).

**Kan det brukes til manuell verifisering av første loop?**
- Ja, men bare delvis. Godt for pending/plan/faction. Svakt for økonomi/kapital/HG-input-sporbarhet.

**Anbefalte manuelle browser-tester etter rapporten:**
1. Reset relevante LS-nøkler, åpne Civication, verifiser første pending mail + fasepanel.
2. Svar på valg, sjekk pending-id skifter og at fase kan advances.
3. Kjør noen quiz i én kategori, returner Civication, verifiser at tilbud/mail matcher kategori.
4. Verifiser wallet/capital endring etter valg/home-handling + uke/dag overgang.
5. Sammenlign inbox channel-splitt i UI mot raw event metadata.

---

## 10. UI-status

- Dashboard/topbar: rolle, wallet PC, status, inbox count, home status, neste fokus.
- Dagfasepanel: vises dynamisk med blokkeringsårsak og advance-knapp.
- Inbox: tydelig presentasjon med jobbmail/personlig seksjon + pending handling.
- Home/economy/map/andre panel: mye er synlig og delvis datadrevet.
- Runtime debug: viser runtime-kjerne, men ikke full økonomi/kapital/HG-spor.

**Elementer med data bak seg:** dashboard KPI, inbox pending, aktiv rolle, home-status, deler av workday/people.

**Elementer som kan se aktive ut uten sterk konsekvens:** enkelte paneler hvor state finnes, men konsekvenskjeden ikke er stram eller tydelig for spiller mellom faser/dager.

---

## 11. Fungerer / fungerer delvis / må verifiseres manuelt

### Fungerer nå (kode kalles + state/UI effekt synlig)
- Boot laster careers/badges og starter engine.
- Dashboard refresh på profile/inbox-events.
- Day phase gating blokkerer advance ved åpne faseitems.
- Inbox rendres med jobbmail/personlig seksjoner.
- Runtime debugpanel mount/toggle/snapshot.

### Fungerer delvis
- HG→Civication konsekvenssløyfe er aktiv men ikke stramt enhetlig.
- Karrieremail/outcome/recovery finnes, men flere parallelle lag øker kompleksitet.
- Wallet/kapitalendringer finnes, men er ikke like transparent i debug og alle UI-flater.

### Må verifiseres manuelt i browser
- End-to-end 7-dagers loop uten repetisjonsstøy.
- Konsistent kanal-klassifisering for alle mailfamilier.
- Reelle konsekvensgrenser (opprykk/stagnasjon/tilbakeslag) i faktisk spillerflyt.
- NAV/weekly PC i samspill med dagfase og aktiv rollebytte.

---

## 12. Anbefalt neste implementeringssteg (én smal oppgave)

**Anbefalt neste Codex-oppgave:**

Implementer en **single-source “Day 1 morning intake”** for én karriere (`naeringsliv`) i `CivicationDailyMailBuilder`, der:
1. én deterministic morning-mail enqueues basert på HG merit terskel,
2. event får eksplisitt `channel: "job"` eller `"private"`,
3. ett valg skriver en liten, tydelig konsekvens (f.eks. `wallet +X/-X` + `capital.social +/-`),
4. dashboard og dagfasepanel reflekterer konsekvensen umiddelbart,
5. neste fase får én ny situasjon uten fallback-repetisjon.

Dette er smalt, testbart, og etablerer første spillbare miniloop uten redesign.

---

## 13. Konkrete filer som sannsynligvis må endres senere (neste implementerings-PR)

1. `js/Civication/systems/civicationDailyMailBuilder.js`
   - Hvorfor: sentralt punkt for fasebasert enqueue/pending/answered.
   - Flytdel: dag- og inbox-loop.
   - Risiko: kan bryte eksisterende wrappers og pending-håndtering hvis patch gjøres bredt.

2. `js/Civication/systems/civicationEventChannels.js`
   - Hvorfor: harden kanal-separasjon (job/private) med eksplisitt metadata.
   - Flytdel: inbox-segmentering + riktig UI.
   - Risiko: feilkategorisering kan flytte meldinger mellom seksjoner.

3. `js/Civication/ui/CivicationUI.js`
   - Hvorfor: tydelig visning av konsekvens etter valg + robust pending-refresh.
   - Flytdel: spillerens opplevde loop.
   - Risiko: UI-rerender-race mot andre event listeners.

4. `js/Civication/ui/CivicationDashboardUI.js`
   - Hvorfor: sikre at dashboard alltid viser konsekvens-endring (wallet/fokus/inbox) etter svar.
   - Flytdel: feedback-loop.
   - Risiko: dobbeltkilder for inbox/wallet kan gi inkonsistens.

5. `js/Civication/systems/day/dayRuntimeDebugPanel.js`
   - Hvorfor: legg til wallet/capital/dayPhase/HG-input (merits) for verifisering.
   - Flytdel: QA/manual testing.
   - Risiko: debugpanel blir støyete om data ikke struktureres tydelig.

6. `js/Civication/core/civicationEconomyEngine.js`
   - Hvorfor: koble konkrete day-choice consequences renere mot weekly økonomiflyt.
   - Flytdel: økonomisk progresjon.
   - Risiko: kan påvirke balanse og gamle saves.

7. `js/Civication/systems/day/dayProgressionController.js`
   - Hvorfor: sikre enkel, stabil phase-advance-policy per dag.
   - Flytdel: tidsstruktur.
   - Risiko: deadlocks hvis open-item-regler blir for strenge.

