# Civication runtime-verifisering (2026-05-25)

## 1) Verifiseringsmål
Målet i denne QA-runden er å **bekrefte hva som faktisk fungerer i eksisterende Civication-runtime** før videre implementering. Dette dokumentet verifiserer observerbar kodeflyt, state-bruk og runtime-debug i dagens branch, uten å endre runtime-kode, CSS, HTML, datafiler, manifest eller service worker.

---

## 2) Runtime-start

### Hva skjer når `Civication.html` åpnes
- `Civication.html` laster hele Civication UI-struktur og script-stack i fast rekkefølge, og avslutter med `js/Civication/CivicationBoot.js`.
- `CivicationBoot.js` registrerer `DOMContentLoaded` og kjører `start()`.

### Hvilke script starter Civication
- Kritiske startledd:
  1. `js/Civication/core/civicationState.js`
  2. `js/Civication/core/civicationEventEngine.js`
  3. `js/Civication/ui/CivicationUI.js`
  4. `js/Civication/CivicationBoot.js`
- I tillegg lastes day-systemer, inbox runtime, debugpanel, capital/wallet-systemer før boot.

### Om `window.HG_CiviEngine` opprettes
- **Bekreftet i kode:** `CivicationBoot.start()` oppretter `window.HG_CiviEngine = new CivicationEventEngine(...)`.
- Engine konfigureres med `packBasePath: "data/Civication"` og `packMap` som inkluderer `naeringsliv`.

### Om `CivicationUI.init()` kjøres
- **Bekreftet i kode:** `ui?.init?.()` kalles i `CivicationBoot.start()`.
- `CivicationUI.init()` kjører flere renderfunksjoner og forsøker `HG_CiviEngine.onAppOpen()` når aktiv rolle mangler og inbox er tom.

### Om dashboard/inbox/dayPhase renderes
- Dashboard renderes via `CivicationDashboardUI.render()` (koblet på events / profile updates).
- Inbox renderes via `CivicationUI.renderCivicationInbox()`.
- Dagfasepanel renderes via `CivicationDayPhaseUI` (events: `civi:dayPhaseChanged`, `civi:inboxChanged`, `civi:booted`, `updateProfile`).

### localStorage-nøkler som leses/skrives (verifisert i relevant kode)
- `hg_civi_state_v1`
- `hg_civi_inbox_v1` (legacy fallback)
- `hg_active_position_v1`
- `hg_job_history_v1`
- `hg_civi_pulse_v1`
- `hg_civi_wallet_v1`
- `hg_pc_wallet_v1` (dashboard-visning)
- `hg_capital_v1`
- `merits_by_category`
- `quiz_progress`
- `hg_civi_debug_panel_open_v1`

---

## 3) Inbox-verifisering

- Inbox hentes primært via `CivicationState.getInbox()`, som først prøver `CivicationMailEngine.getInbox()` og faller tilbake til legacy localStorage.
- Pending items: flere systemer bruker status `pending`; `HG_CiviEngine.getPendingEvent()` brukes i UI.
- `Jobbmail` og `Personlige meldinger` som separate seksjoner:
  - **Bekreftet i UI-kode:** `renderCivicationInbox()` renderer begge seksjoner eksplisitt.
- `CivicationEventChannels.getMessageChannel(...)`:
  - **Bekreftet brukt i runtime/UI** som kanalresolver.
- Eksplisitt `channel` vs heuristikk:
  - `getMessageChannel` bruker først `event.channel / event.messageChannel`, ellers heuristisk klassifisering (source/type/slot/stream/etc.).
- Svarflyt:
  - UI knytter svar-knapper til `window.HG_CiviEngine.answer(ev.id, choiceId)`.
- Lagring av answered-status:
  - Daily builder/runtime setter `status: "answered"`, `answered_at` og fører `answered_ids` i runtime-state.

**Vurdering:** Kanal-splitt er implementert, men delvis heuristisk når eksplisitt `channel` mangler.

---

## 4) Jobbmail-verifisering

- `naeringsliv` jobbmail-data finnes i repo (job/event/story/conflict/people/brand-plan-filer).
- Trigger fra eksisterende HG-progresjon:
  - `merits-and-jobs.js` leser `merits_by_category` og `quiz_progress`.
  - `CivicationBoot` sin engine `packMap` peker `naeringsliv` til jobbmail-pack.
- Bruk av `merits_by_category` / `quiz_progress`:
  - **Bekreftet i kode** (lesing/oppdatering i merits-and-jobs).
- Automatisk opprettelse ved app-open/dagfase:
  - `onAppOpen` patches i daily/life/mail runtime finnes; faktisk frekvens avhenger av state/betingelser.
- Har jobbmail valg?
  - **Ja**, svarknapper i inbox/workday modal og `HG_CiviEngine.answer(...)`.
- Gir valg konsekvens?
  - **Delvis bekreftet i kode:** status, narrative streams, runtime progression og enkelte consequence-objekter oppdateres.
- Persistens av konsekvens?
  - **Delvis bekreftet:** state/inbox/wallet/capital skrives i localStorage av ulike motorer.
- Kommer samme mail tilbake etter refresh?
  - **Ikke endelig kodeverifisert uten manuell browser-run**; anti-repetisjon og answered_ids finnes, men må valideres i praksis.

---

## 5) Dagfase-verifisering

- Faktiske dagfaser i runtime:
  - Fallback-liste: `morning`, `lunch`, `afternoon`, `evening`, `day_end`.
- Aktiv fase ved start:
  - Leses via `CivicationCalendar.getPhase()` (fallback `morning`).
- Pending mail blokkerer fase-advance:
  - **Bekreftet:** `dayProgressionController.inspect()` stopper ved `open_items_in_phase`.
- Fase videre etter svar:
  - **Ja i kode** når åpne items i fasen er løst.
- UI-oppdatering ved faseendring:
  - **Bekreftet:** `civi:dayPhaseChanged` dispatches og `CivicationDayPhaseUI.refresh()` lytter.
- Persistens av dagfase-state:
  - Avhenger av `CivicationCalendar` lagring (ikke fullt bevist her uten runtime-kjøring), men phase leses/oppdateres sentralt gjennom kalender.

---

## 6) Wallet / capital-verifisering

- Wallet/PC leses og vises:
  - Dashboard leser `hg_pc_wallet_v1`.
  - Økonomimotor jobber mot `CivicationState.getWallet()` (`hg_civi_wallet_v1`).
- Wallet kan endres gjennom eksisterende valg/system:
  - **Delvis bekreftet i kode:** weekly tick/expenses/NAV etc. oppdaterer wallet.
- `capital` leses og vises:
  - `renderCapital()` leser `hg_capital_v1` og oppdaterer DOM-felter.
- Capital kan endres via eksisterende valg/home/jobmail:
  - **Delvis bekreftet i kode:** capital-engine + economy/home/consequence paths oppdaterer kapital.
- localStorage-nøkler brukt:
  - `hg_civi_wallet_v1`, `hg_pc_wallet_v1`, `hg_capital_v1`.
- Dashboard oppdateres etter endring:
  - Lytter på `updateProfile` og rerenderer.

---

## 7) History Go → Civication-verifisering

- Leser `merits_by_category`: **Ja**.
- Leser `quiz_progress`: **Ja**.
- Leser badges/careers: **Ja**, via `data/badges/index.json` + `data/Civication/hg_careers.json` i boot.
- `naeringsliv` kobling til career/jobmail: **Ja**, via `packMap` og jobbmailfamilier.
- Aktiv runtime-kobling eller bare forberedt:
  - **Delvis aktiv i runtime** (ikke bare statisk data), men ikke fullstendig ende-til-ende verifisert uten browser-kjøring.
- Konkrete funksjoner/moduler for koblingen:
  - `CivicationBoot.start()`
  - `CivicationEventEngine` init med `packMap`
  - `checkTierUpgrades` / `merits-and-jobs`-flyt
  - `CivicationCareerRoleResolver` / day runtimes

---

## 8) Runtime debug-verifisering

### Åpne/lukke panel
- Toggle-knapp i panel (`⚙ Civication runtime debug`).
- Open-state styres av localStorage key: `hg_civi_debug_panel_open_v1`.

### Hva panelet viser (bekreftet i render)
- Aktiv rolle
- Active faction
- Plan / step index / step type
- Pending event (id/type/family/subject/people ref/score breakdown)
- People/trust-tabell
- Alliances/enemies/tensions
- Faction conflict

### Dekning per ønsket datapunkt
- Pending mail: **Vises i debug**.
- Aktiv rolle: **Vises i debug**.
- Plan/step: **Vises i debug**.
- People/trust: **Vises i debug**.
- Wallet: **Finnes i state, men vises ikke eksplisitt i debug-panelet**.
- Capital: **Finnes i state/localStorage, men vises ikke eksplisitt i debug-panelet**.
- DayPhase: **Finnes i runtime/egen UI, men ikke tydelig som eget felt i debug-panelet**.
- History Go merits: **Finnes i localStorage/runtimekontekst, men vises ikke direkte i debug-panelet**.

---

## 9) Manuelle testkommandoer (iPad/Safari/Eruda)

```js
typeof window.HG_CiviEngine
```

```js
typeof window.CivicationState
```

```js
typeof window.CivicationEventChannels
```

```js
typeof window.CivicationRuntimeDebugPanel
```

```js
window.CivicationState?.getState?.()
```

```js
window.CivicationState?.getInbox?.()
```

```js
window.HG_CiviEngine?.getPendingEvent?.()
```

```js
window.CivicationEventChannels?.splitInboxByMessageChannel?.(window.CivicationState?.getInbox?.() || [])
```

```js
window.CivicationState?.getActivePosition?.()
```

```js
window.CivicationState?.getWallet?.()
```

```js
JSON.parse(localStorage.getItem("hg_capital_v1") || "{}")
```

```js
JSON.parse(localStorage.getItem("merits_by_category") || "{}")
```

```js
JSON.parse(localStorage.getItem("quiz_progress") || "{}")
```

```js
({ phase: window.CivicationCalendar?.getPhase?.(), clock: window.CivicationCalendar?.getClock?.(), dayInspect: window.CivicationDayProgression?.inspect?.() })
```

---

## 10) Verifiseringsmatrise

| Systemdel | Kode finnes | Kode kalles | State endres | UI oppdateres | Spilleren merker konsekvens | Verifisert / ikke verifisert | Kommentar |
|---|---|---|---|---|---|---|---|
| Boot | Ja | Ja | Delvis | Ja | Delvis | Verifisert (kode) | `HG_CiviEngine` opprettes og UI init kalles. |
| Dashboard | Ja | Ja | Delvis | Ja | Ja | Verifisert (kode) | Leser wallet/inbox/status og renderer KPI. |
| Inbox | Ja | Ja | Ja | Ja | Ja | Verifisert (kode) | Pending + svarflyt finnes. |
| Jobbmail | Ja | Delvis | Delvis | Ja | Delvis | Delvis verifisert | Krever manuell runtime-test for repetisjon/konsekvenskjede. |
| Personlige meldinger | Ja | Ja | Delvis | Ja | Delvis | Delvis verifisert | Seksjon renderes separat. |
| Message channel split | Ja | Ja | N/A | Ja | Ja | Verifisert (kode) | Eksplisitt channel + heuristikk fallback. |
| Answer flow | Ja | Ja | Ja | Ja | Delvis | Delvis verifisert | `answer`-flow persisterer status, men full konsekvens må testes i browser. |
| Day phase | Ja | Ja | Ja | Ja | Ja | Delvis verifisert | Blokkering ved åpne items er tydelig i kode. |
| Wallet | Ja | Ja | Ja | Ja | Delvis | Delvis verifisert | Flere wallet-kilder (`hg_civi_wallet_v1`/`hg_pc_wallet_v1`) bør valideres manuelt. |
| Capital | Ja | Ja | Ja | Ja | Delvis | Delvis verifisert | Vises i UI; effektkjede må bekreftes i live-run. |
| History Go merits | Ja | Ja | Delvis | Delvis | Delvis | Delvis verifisert | Leses og brukes, men E2E-bevis mangler uten browser-test. |
| Career/jobmail | Ja | Delvis | Delvis | Delvis | Delvis | Delvis verifisert | Kobling aktiv, men ikke fullstendig bevist for alle paths. |
| Runtime debug | Ja | Ja | Nei | Ja | Ja | Verifisert (kode) | Viser pending/plan/people/faction, ikke wallet/capital/merits direkte. |

---

## 11) Funn

### Bekreftet fungerer
- Boot-orchestrator oppretter engine og kaller UI-init.
- Inbox renderes med egne seksjoner for jobbmail og personlige meldinger.
- Day phase-progressjon har blokkering ved åpne meldinger i aktiv fase.
- Runtime debug-panel kan åpnes/lukkes og persisterer open-state.

### Delvis bekreftet
- Jobbmail-konsekvenser er implementert i flere lag, men full E2E-opplevelse må valideres i nettleser.
- Wallet/capital oppdateringskjede finnes i kode, men full visuell/persistent verifisering må kjøres manuelt.
- History Go → Civication-kobling er aktiv, men trenger runtime-bevis for konkrete scenario-løp.

### Ikke bekreftet
- Deterministisk garanti for at samme mail aldri kommer tilbake etter refresh i alle paths.
- Full dag-for-dag stabilitet gjennom alle parallelle runtime-lag uten browser-verifisering.

### Motstridende / uklart
- Wallet har både `hg_civi_wallet_v1` (state engine) og `hg_pc_wallet_v1` (dashboard), som kan gi uklarhet uten live state-inspeksjon.
- Kanal-splitt er robust men delvis heuristisk når `channel` mangler.

### Må testes manuelt i browser
- Svar på jobbmail → refresh → sjekk at mailstatus/konsekvens bevares.
- Svar på pending i fase → prøv phase advance og bekreft blokkering forsvinner.
- Endring i wallet/capital etter valg/home/jobmail og dashboard-synk.
- Debug-panel snapshot før/etter svar og før/etter fasebytte.

---

## 12) Neste anbefaling (etter fullført verifisering)

Før videre bygging må følgende manuelle tester kjøres og dokumenteres:
1. **Inbox-sykluser:** pending → answer → answered persist etter refresh.
2. **Dagfase-syklus:** blokkering med pending, og åpning av neste fase etter svar.
3. **Økonomi/kapital:** konkret tallendring i wallet/capital og synk til dashboard.
4. **HG-kobling:** test-case med oppdaterte `merits_by_category`/`quiz_progress` som faktisk påvirker jobbmail.

### Screenshots/console outputs som bør tas
- Screenshot av inbox med både `Jobbmail` og `Personlige meldinger`.
- Screenshot av day phase-panel før og etter fase-advance.
- Screenshot av debug-panel (åpen) med pending event og plan/step.
- Console-output fra alle kommandoer i kapittel 9.

### Deler som eventuelt kan bygges etter verifisering
- Først når testene over er gjennomført, kan videre bygging prioriteres for områder som fortsatt er delvis verifisert (jobbmail-konsekvensløp, wallet/capital-synk, HG→Civi E2E).
- Denne rapporten foreslår **ikke implementering nå**, kun verifiseringsgrunnlag.

