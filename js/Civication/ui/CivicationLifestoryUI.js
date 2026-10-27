// js/Civication/ui/CivicationLifestoryUI.js
//
// Civication Life Story System — «Min dag»-visningen.
// Hovedskjermen i det nye fortellingssystemet: NÅ-scenen med valg, aktive
// tråder, kalender/senere i dag og arkiv. Innboks er ikke spillet; innboks
// er arkiv — spillet er scenen du står i nå.
//
// Kun visning og interaksjon: all sannhet bor i Player State
// (CivicationLifestoryState) og all fremdrift går gjennom Day Runner
// (CivicationLifestoryRunner). Rendrer i #civiLifestoryPanel og gjør
// ingenting hvis panelet ikke finnes på siden.

(function () {
  "use strict";

  // Startkontrakten (dashboardet/SYSTEM_MAP): du starter ARBEIDSLEDIG.
  // Jobb kommer via quiz/merker -> jobbtilbud i skallet -> maybeAdoptShellRole
  // bytter til jobbens rolle. Arealplanlegger er pilotrolle, ikke standard.
  const DEFAULT_ROLE_ID = "arbeidsledig";
  const ROLE_STORAGE_KEY = "civication_lifestory_role_v1";
  const WAVE_A_SCENE_ID = /^wave_[ab]_(c01|c02|c03|c05|c06|c07|c17|c23)_/;
  const WAVE_A_TITLES = {
    c01: "Jobbtap og verdighet", c02: "Muligheten uten garanti",
    c03: "Drømmen og regningene", c05: "Byråkratiet og personen",
    c06: "Faglig integritet", c07: "Tilhørighet mot frihet",
    c17: "Å arbeide seg tom", c23: "Feilen som ikke forsvinner"
  };
  const WAVE_A_THREAD_ID = /^wave_[ab]_c(?:01|02|03|05|06|07|17|23)$/;


  /**
   * DEV-/TESTVERKTØY — ikke produktflate. Roller velges aldri av spilleren;
   * de fortjenes gjennom quiz (se startkontrakten i civication-life-story-
   * system.md). ?lifestoryRole=<id> tvinger en rolle for utvikling/innholds-
   * arbeid/tester kun for gjeldende URL/lasting. En testrolle må aldri
   * bli en permanent overstyring av spillerens ekte jobb ved senere besøk.
   * @returns {string|null}
   */
  function resolveExplicitRoleId() {
    let fromUrl = null;
    try {
      fromUrl = new URLSearchParams(window.location.search || "").get("lifestoryRole");
    } catch { /* blokkert URL => følg skall-jobben */ }
    return fromUrl && fromUrl.trim() ? fromUrl.trim() : null;
  }

  const EXPLICIT_ROLE_ID = resolveExplicitRoleId();

  // Den gamle testrollen var en lokal nøkkel som også ble kopiert til
  // kontoens skylagring. Fjern den ETTER at sky-backupen er gjenopprettet,
  // ellers kan bootstrap legge nøkkelen tilbake ved neste innlogging.
  // Dette berører aldri faktisk jobb eller lagret Life Story-progresjon.
  let legacyRoleRetirement = null;
  function retireLegacyRoleOverride() {
    if (!legacyRoleRetirement) legacyRoleRetirement = (async () => {
      await window.CivicationCloudSave?.ready;
      try {
        if (window.localStorage?.getItem(ROLE_STORAGE_KEY) === null) return;
        window.localStorage.removeItem(ROLE_STORAGE_KEY);
        window.CivicationCloudSave?.schedule?.();
      } catch { /* blokkert lagring: la øvrig spillstart fortsette */ }
    })();
    return legacyRoleRetirement;
  }

  /**
   * Rollen Min dag spiller akkurat nå. Starter som eksplisitt valg eller
   * standardrollen; kan senere byttes av maybeAdoptShellRole når skallet
   * booter eller spilleren tar en jobb. Ukjent rolle-id feiler fast i
   * Content.loadContent (manifest-oppslag) — ingen stille fallback.
   */
  // Ved nettleseromstart gjenopptas aktiv lagret rolle før shellen booter.
  // Ellers ville standardrollen lage et unødvendig bytte på hver reload.
  const persistedRoleId = /** @type {any} */ (window).CivicationLifestoryState?.load?.()?.rolle;
  let currentRoleId = EXPLICIT_ROLE_ID || persistedRoleId || DEFAULT_ROLE_ID;

  /** @type {any} */ let content = null;
  /** @type {any} */ let baseContent = null;
  let continuing = false;
  let continuationError = "";
  /** @type {any} */ let state = null;
  /** @type {Promise<void>|null} */ let loading = null;
  // Jobbresolver og oppstart kan laste innhold samtidig. Siste rolle vinner.
  let roleLoadSequence = 0;
  let dayAdvancePending = false;
  /** Siste konsekvenstekst (fortellingsmessig feedback etter et valg). */
  /** @type {{ tekst: string, valgTekst: string, deltas: Array<{ key: string, label: string, delta: number }>, dramatisert: boolean }|null} */ let sisteKonsekvens = null;

  /**
   * @param {unknown} value
   * @returns {string}
   */
  function escapeHtml(value) {
    const State = /** @type {any} */ (window).CivicationLifestoryState;
    return escapeLiteral(State?.presentText && content && state ? State.presentText(state, content, value) : value);
  }

  function escapeLiteral(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function humanizeId(id) {
    return String(id || "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (c) => c.toUpperCase());
  }

  function formatThreadStatus(status) {
    return ({ active: "Aktiv", escalated: "Eskalert", dormant: "Hvilende", completed: "Fullført" })[status] || humanizeId(status);
  }

  function formatThreadTitle(thread) {
    if (!thread) return "Ukjent tråd";
    return thread.tittel || humanizeId(thread.id);
  }

  function formatMeterName(key) {
    const person = (content?.role?.personer || []).find((p) => p.id === key);
    if (person) return person.navn;
    return ({ psyke: "Psyke", energi: "Energi", penger: "Penger", integritet: "Integritet", synlighet: "Synlighet", handlingsrom: "Handlingsrom" })[key] || humanizeId(key);
  }

  function formatMeterDelta(delta) {
    const value = Number(delta.delta);
    return formatMeterName(delta.key) + " " + (value > 0 ? "+" : "") + value;
  }

  function snapshotMetersAndRelations() {
    return { meters: Object.assign({}, state.meters), relasjoner: Object.assign({}, state.relasjoner) };
  }

  function diffMetersAndRelations(before) {
    const deltas = [];
    for (const group of ["meters", "relasjoner"]) {
      for (const [key, oldValue] of Object.entries(before[group] || {})) {
        const nextValue = group === "meters" ? state.meters[key] : state.relasjoner[key];
        const delta = Number(nextValue) - Number(oldValue);
        if (delta !== 0) deltas.push({ key, label: formatMeterName(key), delta });
      }
    }
    return deltas;
  }

  function getPanel() {
    return document.getElementById("civiLifestoryPanel");
  }

  /**
   * Last riktig rolles fortelling fra den ene Player State-lagringen.
   * Jobbbytte arkiverer forrige rolletilstand i samme save; retur fortsetter
   * dens kapitler, relasjoner og valg. Ingen jobb-resolver kobles ut.
   * @param {string} roleId
   */
  async function loadRole(roleId, stillCurrent = () => true) {
    await retireLegacyRoleOverride();
    const Content = /** @type {any} */ (window).CivicationLifestoryContent;
    const State = /** @type {any} */ (window).CivicationLifestoryState;
    const sequence = ++roleLoadSequence;
    const base = await Content.loadContent(roleId);
    if (sequence !== roleLoadSequence || !stillCurrent()) return;
    const saved = State.selectRole(State.load(), base);
    // Restore content before reconciliation, even before the shell has booted.
    let restored = base;
    if (saved.fortsettelseId || saved.fortsettelser) {
      const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
      for (const id of Runner.getContinuationIds(saved)) restored = await Content.loadContinuation(restored, id);
    }
    if (sequence !== roleLoadSequence || !stillCurrent()) return;
    baseContent = base;
    content = restored;
    state = saved;
    State.reconcileContent(state, content);
    prepareStoryDay();
    State.bindPersonTypes?.(state, content, null);
    State.save(state);
    syncQueuedSkills();
    currentRoleId = roleId;
    sisteKonsekvens = null;
    continuationError = "";
    // The selected role is already persisted here; the asynchronous shell
    // adoption must now make any eligible private scenes in the *former*
    // role snapshot visible without waiting for another profile event.
    window.CivicationWaveAPrivateRoleBridge?.refresh?.();
    ensureCalendarCheckpoint();
    syncToShellCalendar();
    await refreshPersonTypes();
  }

  /** The existing History Go bridge owns collection and canonical identity.
   * This UI binds the authored type pool once; render itself stays read-only.
   */
  async function refreshPersonTypes() {
    const bridge = /** @type {any} */ (window).CivicationHistoryPeopleBridge;
    if (!state || !content || !bridge || !content.role.personer?.some(p => p.persontype)) return;
    const currentState = state, currentContent = content;
    try {
      await bridge.load();
      if (state !== currentState || content !== currentContent) return;
      const State = /** @type {any} */ (window).CivicationLifestoryState;
      syncSharedPrivateState(State.load());
      State.bindPersonTypes(state, content, bridge);
      State.save(state);
      render();
    } catch (error) {
      console.warn("[CivicationLifestoryUI] History Go-personer kunne ikke lastes", error);
    }
  }

  async function ensureLoaded() {
    await retireLegacyRoleOverride();
    if (content && state) return;
    if (!loading) {
      if (!EXPLICIT_ROLE_ID) currentRoleId = window.CivicationLifestoryState?.load?.()?.rolle || currentRoleId;
      loading = loadRole(currentRoleId);
    }
    return loading;
  }

  // ---- Skall-jobb -> Life Story-rolle ----
  // Uten dev-parameteren følger Min dag skallets aktive jobb: tar
  // spilleren Renholder-jobben, spiller Life Story renholder. Mappingen er
  // canonical resolver (CivicationCareerRoleResolver) + role_scope-binding i
  // lifestory-manifestet — se resolveRoleIdForActivePosition. Jobb uten
  // Uten egen Life Story-pakke ledes spilleren til den felles innboksen.
  // Den tidligere fortellingen beholdes i lagringen, men spilles ikke som
  // om spilleren fortsatt hadde den gamle jobben.
  /** Memo: siste sjekkede jobb, så updateProfile-burster ikke koster noe. */
  let lastAdoptKey = null;
  let adopting = false;
  let adoptAgain = false;
  /** @type {{ status: string, title: string }|null} */
  let shellStory = null;

  function activePositionKey() {
    return JSON.stringify(window.CivicationState?.getActivePosition?.() || null);
  }

  function shellStoryUnavailable() {
    return !!shellStory && !["ready", "private-only"].includes(shellStory.status);
  }

  async function maybeAdoptShellRole() {
    if (EXPLICIT_ROLE_ID) return; // dev-parameteren vinner alltid
    if (adopting) { adoptAgain = true; return; }
    if (!window.CivicationState?.getActivePosition) return;
    // Ikke memoiser før resolveren finnes — den injiseres av shell-loaderen,
    // og en tidlig updateProfile skal ikke låse sjekken for godt.
    const active = /** @type {any} */ (window).CivicationState?.getActivePosition?.();
    const adoptKey = activePositionKey();
    if (adoptKey === lastAdoptKey && ["ready", "private-only", "unavailable"].includes(shellStory?.status)) return;
    const title = String(active?.title || "jobben din");
    shellStory = { status: "loading", title };
    render();
    if (active && !window.CivicationCareerRoleResolver?.resolveCareerRoleScope) {
      shellStory = { status: "error", title };
      render();
      return;
    }
    adopting = true;
    try {
      const Content = /** @type {any} */ (window).CivicationLifestoryContent;
      const mapped = active ? await Content.resolveRoleIdForActivePosition(active) : DEFAULT_ROLE_ID;
      const stillCurrent = () => activePositionKey() === adoptKey;
      if (!stillCurrent()) { adoptAgain = true; return; }
      if (mapped) {
        // Restore the whole authored work pack when employment changes back
        // from a job with no dedicated story, even if the role ID is unchanged.
        if (mapped !== currentRoleId || !state || !content || content.personalOnly) {
          await loadRole(mapped, stillCurrent);
        }
      } else {
        // An earned formal job never turns into unemployment simply because
        // its work-specific storytelling has not been authored yet.
        // Show shared private scenes (and established C01/C05 relationships),
        // never stale NAV or employer mail from the prior role.
        if (!state || !content) await loadRole(currentRoleId, stillCurrent);
        if (!stillCurrent()) { adoptAgain = true; return; }
        content = await Content.makePersonalOnlyContent(content);
      }
      if (!stillCurrent()) { adoptAgain = true; return; }
      shellStory = { status: mapped ? "ready" : "private-only", title };
      lastAdoptKey = adoptKey;
      syncToShellCalendar();
      window.dispatchEvent(new Event("civi:lifestoryChanged"));
    } catch (error) {
      shellStory = { status: "error", title };
      console.warn("[CivicationLifestoryUI] kunne ikke følge skall-jobben", error);
    } finally {
      adopting = false;
      render();
      if (adoptAgain) { adoptAgain = false; maybeAdoptShellRole(); }
    }
  }

  // Pausing preserves the unanswered phase, including after a reload.
  function hasPausedScene() {
    const threadState = Object.fromEntries(Object.entries(state.threadState).map(([id, ts]) =>
      [id, ts.status === "dormant" && state.tidligereValg["wa_paused_" + id]
        ? { ...ts, status: state.tidligereValg["wa_paused_" + id] } : ts]));
    return window.CivicationLifestoryRunner.getCandidateScenes({ ...state, threadState }, content).length > 0;
  }

  function prepareStoryDay() {
    const Runner = window.CivicationLifestoryRunner;
    if (!state.dagFerdig && !Runner.selectNextScene(state, content) && !hasPausedScene()) {
      Runner.advance(state, content);
    }
  }

  // Shell-kalenderen eier døgnskiftet. Fortellingsdag (per rolle) og
  // arbeidsdager er egne tellere og skal ikke manipuleres av denne broen.
  function getShellDay() {
    const day = Number(/** @type {any} */ (window).CivicationCalendar?.getClock?.()?.dayIndex);
    return Number.isInteger(day) && day > 0 ? day : null;
  }

  function ensureCalendarCheckpoint() {
    const day = getShellDay();
    if (!state || day === null) return null;
    if (!Number.isInteger(state.kalenderDag) || state.kalenderDag < 1) {
      // Eldre lagring kobles til den dagen kalenderen faktisk viser nå.
      // Ingen tidligere historie spilles om igjen eller hoppes over.
      state.kalenderDag = day;
      /** @type {any} */ (window).CivicationLifestoryState.save(state);
    }
    return day;
  }

  function syncToShellCalendar() {
    if (shellStoryUnavailable()) return false;
    const day = ensureCalendarCheckpoint();
    if (!state || !content || day === null || day <= state.kalenderDag || !state.dagFerdig) return false;
    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    const Endings = /** @type {any} */ (window).CivicationLifestoryEndings;
    // A fully authored three-week chapter can end while Civication's work
    // calendar must still close the 21st played day and settle week three.
    // Keep the completed narrative/identity at day 21: advancing the shell
    // clock is NOT permission to create a fictitious new Life Story scene.
    if (Endings?.isFinalDay?.(state, content) && !Runner.hasPendingPrivateScenes?.(state, content)) {
      if (state.livsdag < 21) return false; // earlier chapter gates remain intact
      state.kalenderDag = day;
      /** @type {any} */ (window).CivicationLifestoryState.save(state);
      window.dispatchEvent(new Event("civi:lifestoryChanged"));
      render();
      return true;
    }
    try {
      syncSharedPrivateState(window.CivicationLifestoryState?.load?.());
      Runner.startNextDay(state, content);
      state.kalenderDag += 1;
      sisteKonsekvens = null;
      continuationError = "";
      /** @type {any} */ (window).CivicationLifestoryState.save(state);
      window.dispatchEvent(new Event("civi:lifestoryChanged"));
      render();
      return true;
    } catch (error) {
      console.error("[CivicationLifestoryUI] kunne ikke synkronisere døgnskiftet", error);
      return false;
    }
  }

  // Start ikke ny Civication-dag via Min dag før shellens innboks, jobb,
  // ukesoppsummering og day_end er ferdige. DayProgression utfører selve
  // kalenderovergangen og dens konsekvenser nøyaktig én gang.
  async function ensureShellDayAdvanced() {
    const currentDay = ensureCalendarCheckpoint();
    if (currentDay === null) return true; // isolert Min dag uten shell
    if (currentDay > state.kalenderDag) return true;
    const Calendar = /** @type {any} */ (window).CivicationCalendar;
    const Progression = /** @type {any} */ (window).CivicationDayProgression;

    // Without an active job there is no workday queue to drive the calendar.
    // Only skip genuinely empty phases: pending private messages, queued mail
    // and other phase blockers are still owned by DayProgression.inspect().
    // The player must answer those in the unified inbox first.
    if (!window.CivicationState?.getActivePosition?.() && Progression?.inspect && Progression?.advancePhaseIfReady) {
      const maxEmptyPhases = Array.isArray(Calendar?.DAY_PHASES) ? Calendar.DAY_PHASES.length : 8;
      for (let i = 0; i < maxEmptyPhases && Calendar?.getPhase?.() !== "day_end"; i++) {
        const inspection = Progression.inspect();
        if (!inspection?.canAdvance) break;
        const advanced = await Progression.advancePhaseIfReady();
        if (!advanced?.advanced) break;
      }
    }
    if (Calendar?.getPhase?.() !== "day_end" || !Progression?.advancePhaseIfReady) {
      continuationError = "Fullfør dagens jobb, meldinger og kveld i Civication før neste dag.";
      return false;
    }
    const result = await Progression.advancePhaseIfReady();
    if (!result?.advanced || getShellDay() <= currentDay) {
      continuationError = "Dagslutt har utestående handlinger i Civication.";
      return false;
    }
    continuationError = "";
    return true;
  }

  // Skallet booter etter Min dag (shell-loaderen injiserer resolver +
  // CivicationState); jobbaksept dispatcher updateProfile.
  window.addEventListener("civi:booted", () => { syncQueuedSkills(); ensureCalendarCheckpoint(); syncToShellCalendar(); maybeAdoptShellRole(); refreshPersonTypes(); render(); });
  window.addEventListener("civi:dayPhaseChanged", () => { syncToShellCalendar(); refreshDayEvent(); });
  // A role without a Life Story package still lives in the canonical day
  // program. Its preview follows that program; it never answers or advances it.
  window.addEventListener("civi:inboxChanged", refreshDayEvent);
  window.addEventListener("civi:lifePositionChanged", refreshDayEvent);

  function refreshDayEvent() {
    if (shellStory?.status === "unavailable") { render(); return; }
    // A day-end inbox action can become pending after Min dag was first
    // rendered. Refresh only the finished-day summary so the real "Åpne
    // innboksen" button and next-day disabled state stay synchronized, without
    // re-running the Wave A inbox projection or replacing an active story.
    if (!state?.dagFerdig || !content) return;
    const summary = getPanel()?.querySelector(".civi-lifestory-summary");
    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    if (!summary || !Runner?.getView) return;
    const view = Runner.getView(state, content);
    if (!view?.dagFerdig) return;
    const html = renderSummaryHtml(view);
    if (summary.outerHTML !== html) {
      const expandedRecap = !!summary.querySelector?.('details[data-lifestory-disclosure="day-recap"][open]');
      summary.outerHTML = html;
      if (expandedRecap) {
        const recap = getPanel()?.querySelector?.('details[data-lifestory-disclosure="day-recap"]');
        if (recap) /** @type {HTMLDetailsElement} */ (recap).open = true;
      }
    }
  }
  // updateProfile: jobbtilbud kan ha endret rollen, og HG_Lifestyle kan ha
  // telt nye tags (stamp-chipen) — re-render henter begge. render() er ren
  // lesing, så dette kan aldri starte en event-løkke.
  window.addEventListener("updateProfile", () => { maybeAdoptShellRole(); refreshPersonTypes(); render(); });
  // The inactive-role mail handler persists shared private consequences. An
  // already mounted Min dag view must import those facts before its next save.
  // Keep the active job's own meters, work scenes and role-specific flags.
  function syncSharedPrivateState(stored) {
    if (!stored || !state || stored.rolle !== state.rolle) return;
    state.rolleTilstander = stored.rolleTilstander || {};
    state.rolleBytter = stored.rolleBytter || [];
    if (stored.privatHistorie) state.privatHistorie = stored.privatHistorie;
    state.tidligereValg ||= {};
    for (const [key, value] of Object.entries(stored.tidligereValg || {})) {
      if (/^wa_(?:[bcde]_)?c0[15]_/.test(key)) state.tidligereValg[key] = value;
    }
    state.relasjoner ||= {};
    for (const key of ["venn", "familie"]) {
      if (typeof stored.relasjoner?.[key] === "number") state.relasjoner[key] = stored.relasjoner[key];
    }
  }

  function syncQueuedSkills() {
    const State = /** @type {any} */ (window).CivicationLifestoryState;
    const Skills = /** @type {any} */ (window).CivicationSkills;
    if (!State?.load || !State?.save || !Skills?.flushQueued) return;
    const persisted = State.load();
    if (!persisted) return;
    const result = Skills.flushQueued(persisted, (updated) => State.save(updated));
    if (result.cleared && state?.rolle === persisted.rolle) {
      // Keep the UI's next choice save from restoring already-flushed entries.
      state.pendingSkillsPracticesV1 = persisted.pendingSkillsPracticesV1 || [];
      state.rolleTilstander = persisted.rolleTilstander || {};
    }
  }

  window.addEventListener("civi:waveAPrivateStoryChanged", () => {
    syncSharedPrivateState(window.CivicationLifestoryState?.load?.());
    render();
  });

  /**
   * @param {string} sceneId
   * @param {string} choiceId
   */
  function onChoose(sceneId, choiceId) {
    if (shellStoryUnavailable()) return false;
    let accepted = false;
    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    const State = /** @type {any} */ (window).CivicationLifestoryState;
    // The shell may have adopted another job while a previous scene's
    // button is still in the DOM. Never overwrite that newer role save.
    const persisted = State.load();
    if (persisted?.rolle && persisted.rolle !== state?.rolle) return false;
    // Refresh shared facts before running an ordinary work choice, including
    // when the private-story event occurred while this view was not listening.
    syncSharedPrivateState(persisted);
    try {
      const scene = content.scenes.find((s) => s.id === sceneId);
      const valg = scene ? (scene.valg || []).find((c) => c.id === choiceId) : null;
      const before = snapshotMetersAndRelations();
      const result = Runner.applyChoice(state, content, sceneId, choiceId);
      const deltas = diffMetersAndRelations(before);
      sisteKonsekvens = result.konsekvensTekst || deltas.length
        ? { tekst: result.konsekvensTekst || "Valget er registrert.", valgTekst: valg ? valg.tekst : "", deltas, dramatisert: sceneHasRepresentative(scene, valg) }
        : null;
      // A private scene may have been answered from the inactive role's
      // inbox while this job scene was open. Preserve those snapshots
      // instead of overwriting them with this UI's older in-memory copy.
      const latest = State.load();
      if (latest?.rolle === state.rolle) {
        state.rolleTilstander = latest.rolleTilstander || {};
        state.rolleBytter = latest.rolleBytter || [];
      }
      State.save(state);
      accepted = true;
      // Skills are credited only for a successfully played and saved authored
      // Life Story choice, with the concrete effect flag as evidence.
      // The scene ID is stable across reloads and role changes: a replay cannot
      // mint more Skills even if the same private scene reappears.
      const practice = valg?.skills_practice;
      if (practice && valg?.effekter?.flagg?.[practice.evidence_flag] === true &&
          !(/** @type {any} */ (window).CIVICATION_TEST_MODE) &&
          !(/** @type {any} */ (window).OPEN_MODE) &&
          !window.CivicationState?.isTestMode?.()) {
        /** @type {any} */ (window).CivicationSkills?.applyOrQueue?.({
          source: "life_story_choice",
          event_id: "lifestory:" + sceneId,
          choice_id: choiceId,
          skill_id: practice.skill_id,
          activity_type: practice.activity_type,
          evidence_flag: practice.evidence_flag,
          delta: practice.delta
        }, state, (updated) => State.save(updated));
      }
      if (WAVE_A_SCENE_ID.test(sceneId)) {
        window.CivicationWaveAInboxBridge?.afterChoice?.(state.rolle, sceneId, choiceId);
      }
      // Énveis konsekvensbro: faktiske meter-endringer (etter clamping)
      // skrives til skallets psyke, så dashboardet speiler dagens valg.
      // Broen eier mappingen og testmodus-gaten (lifestoryShellBridge).
      const meterDeltas = {};
      for (const meterKey of Object.keys(state.meters)) {
        const delta = Number(state.meters[meterKey]) - Number(before.meters[meterKey]);
        if (delta) meterDeltas[meterKey] = delta;
      }
      /** @type {any} */ (window).CivicationLifestoryShellBridge?.applyMeterDeltasToShell?.(meterDeltas);
      // Livsstilsbro: valgets tags (pub => nightlife, eget prosjekt => craft, …)
      // teller mot skallets HG_Lifestyle-stamp. Broen eier testmodus-gaten.
      if (valg && Array.isArray(/** @type {any} */ (valg).livsstil)) {
        /** @type {any} */ (window).CivicationLifestoryShellBridge?.applyLifestyleTagsToShell?.(/** @type {any} */ (valg).livsstil);
      }
      window.dispatchEvent(new Event("civi:lifestoryChanged"));
      // Handling: utfør den EKTE spillhandlingen valget lover (fanebytte/
      // History GO-navigasjon). Player State er allerede lagret over, så en
      // navigasjon bort fra siden mister aldri progresjon.
      if (valg && /** @type {any} */ (valg).handling) {
        /** @type {any} */ (window).CivicationLifestoryActions?.perform?.(/** @type {any} */ (valg).handling);
      }
    } catch (error) {
      console.error("[CivicationLifestoryUI] valg feilet", error);
    }
    render();
    return accepted;
  }

  async function onNextDay() {
    if (shellStoryUnavailable() || dayAdvancePending || !state || !state.dagFerdig) return;
    dayAdvancePending = true;
    const previousState = state;
    try {
      if (getShellDay() === null) {
        // Min dag fungerer fremdeles uavhengig på sider uten Civication-shell.
        syncSharedPrivateState(window.CivicationLifestoryState?.load?.());
        /** @type {any} */ (window).CivicationLifestoryRunner.startNextDay(state, content);
        sisteKonsekvens = null;
        /** @type {any} */ (window).CivicationLifestoryState.save(state);
        window.dispatchEvent(new Event("civi:lifestoryChanged"));
      } else if (await ensureShellDayAdvanced() && state === previousState) {
        // Den kanoniske kalenderen ruller først. Event-lytteren kan allerede
        // ha synkronisert fortellingsdagen; i så fall gjør vi ingenting mer.
        syncToShellCalendar();
      }
    } catch (error) {
      console.error("[CivicationLifestoryUI] neste dag feilet", error);
    } finally {
      dayAdvancePending = false;
      render();
    }
  }

  function onRestart() {
    if (shellStoryUnavailable() || !content || !state) return;
    const State = /** @type {any} */ (window).CivicationLifestoryState;
    content = baseContent;
    state = State.createInitialState(baseContent);
    prepareStoryDay();
    ensureCalendarCheckpoint();
    continuationError = "";
    sisteKonsekvens = null;
    State.save(state);
    refreshPersonTypes();
    window.dispatchEvent(new Event("civi:lifestoryChanged"));
    render();
  }

  // Keep this destructive action out of daily progression: it belongs in
  // the footer More submenu, not beside Start neste dag.
  function bindFooterRestart() {
    const toggle = document.getElementById("civiMoreMenuToggle");
    const menu = document.getElementById("civiMoreMenu");
    if (!toggle || !menu || /** @type {any} */ (toggle)._civiMoreMenuBound) return;
    /** @type {any} */ (toggle)._civiMoreMenuBound = true;

    function closeMenu() {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", () => {
      menu.hidden = !menu.hidden;
      toggle.setAttribute("aria-expanded", String(!menu.hidden));
    });
    menu.addEventListener("click", (event) => {
      const target = /** @type {HTMLElement} */ (event.target);
      const restartButton = target?.closest?.("[data-lifestory-restart]");
      if (!restartButton || !menu.contains(restartButton)) return;
      closeMenu();
      if (shellStoryUnavailable() || !content || !state) return;
      if (typeof window.confirm !== "function"
        || !window.confirm("Start livshistorien på nytt? Valgene og fremdriften i «Min dag» nullstilles. Dette kan ikke angres.")) return;
      onRestart();
    });
    document.addEventListener("click", (event) => {
      if (!menu.hidden && !menu.contains(/** @type {Node} */ (event.target))
        && !toggle.contains(/** @type {Node} */ (event.target))) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  async function onContinue(id) {
    if (shellStoryUnavailable() || continuing) return;
    const previousState = state, previousContent = content;
    const Content = /** @type {any} */ (window).CivicationLifestoryContent;
    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    const State = /** @type {any} */ (window).CivicationLifestoryState;
    const Endings = /** @type {any} */ (window).CivicationLifestoryEndings;
    const next = content.role.symposium?.fortsettelser?.find((n) => n.id === id);
    if (!Endings || !Runner.canStartContinuation(state, content, next)) return;
    continuing = true;
    continuationError = "";
    render();
    try {
      // Kapittelstart bruker samme shell-døgnskifte som Start neste dag.
      if (getShellDay() !== null && !await ensureShellDayAdvanced()) return;
      const merged = await Content.loadContinuation(previousContent, id);
      if (state !== previousState || content !== previousContent) return;
      const advanced = JSON.parse(JSON.stringify(state));
      Runner.startContinuation(advanced, previousContent, merged, id, Endings.resolveEnding(state, previousContent));
      if (getShellDay() !== null) advanced.kalenderDag += 1;
      State.save(advanced);
      content = merged;
      state = advanced;
      sisteKonsekvens = null;
      window.dispatchEvent(new Event("civi:lifestoryChanged"));
    } catch (error) {
      console.error("[CivicationLifestoryUI] fortsettelsen kunne ikke lastes", error);
      continuationError = "Fortsettelsen kunne ikke åpnes. Historien din er bevart. Prøv igjen.";
    } finally {
      continuing = false;
      render();
    }
  }

  /**
   * Dominant livsstil fra skallet (HG_Lifestyle-stamp). Null før valgene har
   * bygget en tydelig retning (score <= 0) eller uten motoren (ren Min dag-
   * flate) — da vises ingenting, vi gjetter aldri en livsstil.
   * @returns {{ id: string, name: string, icon: string, score: number }|null}
   */
  function lifestyleStamp() {
    try {
      const stamp = /** @type {any} */ (window).HG_Lifestyle?.getStamp?.();
      return stamp && Number(stamp.score) > 0 ? stamp : null;
    } catch { return null; }
  }

  /**
   * @param {any} view
   * @returns {string}
   */
  function renderStatusHtml(view) {
    const m = state.meters;
    const items = [
      ["Rolle", content.role.navn], ["Dag", state.dag], ["Fase", view.dagFerdig ? "Dagen er over" : (view.fase ? view.fase.navn : state.fase)],
      ["Psyke", m.psyke], ["Energi", m.energi], ["Fortellingsøkonomi", m.penger]
    ];
    const stamp = lifestyleStamp();
    if (stamp) items.push(["Livsstil", (stamp.icon ? stamp.icon + " " : "") + stamp.name]);
    const capacity = window.CivicationLifestoryRunner?.capacityWarning?.(state) || "";
    // Real Civication shell owns the unified status dialog in the header.
    // Keep this disclosure only in isolated/legacy views without ScoreUI.
    if (window.CivicationScoreUI?.renderHeader) {
      return capacity
        ? '<p class="muted" role="status" data-lifestory-capacity-warning>' + escapeHtml(capacity) + '</p>'
        : "";
    }
    return '<details class="civi-lifestory-disclosure civi-lifestory-status-details" data-lifestory-disclosure="status"><summary>Status og verdier</summary>' + "<div class=\"civi-lifestory-status\" aria-label=\"Statuslinje\">" + items.map(([label, value]) =>
      "<span class=\"civi-lifestory-status-chip\"><small>" + escapeHtml(label) + "</small><strong>" + escapeHtml(value) + "</strong></span>"
    ).join("") + "</div></details>" + (capacity
      ? '<p class="muted" role="status" data-lifestory-capacity-warning>' + escapeHtml(capacity) + '</p>' : "");
  }

  /**
   * @param {any} scene
   * @returns {string}
   */
  function renderSceneHtml(scene) {
    const thread = content.threads.find((t) => t.id === scene.threadId);
    const ts = state.threadState[scene.threadId];
    const representative = state.personRepresentanter?.[scene.avsender];
    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    const valgHtml = (scene.valg || []).map((valg) => {
      const required = valg.skills_requirement;
      const status = Runner.getChoiceAvailability(valg);
      const detail = !required ? "" : status.available
        ? "Skills: " + status.label + " " + status.score + " / 100 – tilgjengelig"
        : "Krever " + status.label + " " + status.required + " / 100. Du har "
          + (status.measured ? status.score + " / 100" : "ikke målt Skills");
      return "<button class=\"civi-lifestory-choice\" type=\"button\" data-lifestory-scene=\"" + escapeHtml(scene.id) + "\""
        + " data-lifestory-choice=\"" + escapeHtml(valg.id) + "\""
        + (status.available ? "" : " disabled aria-disabled=\"true\"") + ">"
        + "<span>" + escapeHtml(valg.tekst) + "</span>"
        + (valg.tone ? "<small>" + escapeHtml(valg.tone) + "</small>" : "")
        + (required ? "<small class=\"civi-lifestory-skill-hint\">" + escapeHtml(detail) + "</small>" : "")
        + (/** @type {any} */ (valg).handling ? "<small class=\"civi-lifestory-action-hint\">→ "
          + escapeHtml(/** @type {any} */ (window).CivicationLifestoryActions?.HANDLING_LABELS?.[/** @type {any} */ (valg).handling.type] || "utfører handlingen")
          + "</small>" : "")
        + "</button>";
    }).join("");
    return ""
      + "<article class=\"civi-lifestory-scene\" aria-label=\"Nå-scene\">"
      + "<div class=\"civi-lifestory-kicker\"><span>NÅ</span><span>" + escapeHtml(viewPhaseName(scene.fase)) + "</span><span>" + escapeHtml(scene.visningstype) + "</span>" + (scene.avsender ? "<span>Fra " + escapeHtml(personNavn(scene.avsender)) + "</span>" : "") + "</div>"
      + "<h3>" + escapeHtml(scene.tittel) + "</h3>"
      + "<p>" + escapeHtml(scene.tekst) + "</p>"
      + (representative?.personId && representative.beskrivelse
        ? '<p class="muted"><strong>Fra History Go:</strong> ' + escapeLiteral(representative.beskrivelse) + '</p>' : "")
      + dramatizationNote(sceneHasRepresentative(scene))
      + "<div class=\"civi-lifestory-threadline\">Tråd: <strong>" + escapeHtml(formatThreadTitle(thread || { id: scene.threadId })) + "</strong>" + (ts ? " <span class=\"civi-thread-badge is-" + escapeHtml(ts.status) + "\">" + escapeHtml(formatThreadStatus(ts.status)) + "</span>" : "") + "</div>"
      + "<div class=\"civi-lifestory-choices\" aria-label=\"Valg\">" + valgHtml + "</div>"
      + "</article>";
  }

  /**
   * @param {string} phaseId
   * @returns {string}
   */
  function viewPhaseName(phaseId) {
    const phase = (content?.faser || []).find((f) => f.id === phaseId);
    return phase ? phase.navn : humanizeId(phaseId);
  }

  /** @param {any} scene @param {any} [choice] @returns {boolean} */
  function sceneHasRepresentative(scene, choice) {
    return !!scene && (content.role.personer || []).some(p => state.personRepresentanter?.[p.id]?.personId
      && (choice ? [choice] : scene.valg || [null]).some(c => window.CivicationLifestoryState.sceneMentionsPerson(scene, p, c)));
  }

  function dramatizationNote(enabled) {
    return enabled ? '<p class="muted" data-lifestory-dramatized>Dramatisert historie med History Go-personer. Dialog og handling er skrevet for spillet.</p>' : "";
  }

  function personNavn(personId) {
    const person = (content.role.personer || []).find((p) => p.id === personId);
    return person ? person.navn : personId;
  }

  /**
   * Fortellingsmessig feedback etter forrige valg (konsekvensTekst).
   * @returns {string}
   */
  function renderKonsekvensHtml() {
    if (!sisteKonsekvens) return "";
    const chips = (sisteKonsekvens.deltas || []).map((delta) =>
      "<span class=\"civi-lifestory-delta " + (delta.delta > 0 ? "is-positive" : "is-negative") + "\">" + escapeHtml(formatMeterDelta(delta)) + "</span>"
    ).join("");
    return ""
      + "<section class=\"civi-lifestory-konsekvens\" aria-live=\"polite\">"
      + "<div class=\"civi-lifestory-section-label\">Konsekvens</div>"
      + (sisteKonsekvens.valgTekst ? "<div class=\"muted\">Etter «" + escapeHtml(sisteKonsekvens.valgTekst) + "»</div>" : "")
      + "<p>" + escapeHtml(sisteKonsekvens.tekst) + "</p>"
      + dramatizationNote(sisteKonsekvens.dramatisert)
      + (chips ? "<div class=\"civi-lifestory-deltas\">" + chips + "</div>" : "")
      + "</section>";
  }

  /**
   * @param {string} threadId
   * @returns {string}
   */
  function traadTittel(threadId) {
    const thread = content.threads.find((t) => t.id === threadId);
    return thread ? thread.tittel : threadId;
  }

  // A chapter can only open through the current Life Story gates. Read the
  // real History Go merit counter; do not award points or choose a life role.
  /**
   * @param {string} badgeId
   * @returns {number}
   */
  function chapterBadgePoints(badgeId) {
    try {
      const merits = JSON.parse(window.localStorage?.getItem("merits_by_category") || "{}");
      const points = Number(merits?.[badgeId]?.points || 0);
      return Number.isFinite(points) ? Math.max(0, points) : 0;
    } catch { return 0; }
  }

  /**
   * @param {any} view
   * @returns {string}
   */
  function renderSummaryHtml(view) {
    const summary = view.oppsummering;
    const valgHtml = summary.valg.map((entry) =>
      "<li><strong>" + escapeHtml(entry.sceneTittel) + "</strong><br><em>" + escapeHtml(entry.valgTekst) + "</em>"
      + (entry.konsekvensTekst ? "<p>" + escapeHtml(entry.konsekvensTekst) + "</p>" : "")
      + "</li>"
    ).join("") || "<li class=\"muted\">Ingen valg ble tatt.</li>";
    const meterHtml = Object.entries(summary.meterEndringer).map(([key, delta]) =>
      "<span class=\"civi-lifestory-delta " + (Number(delta) > 0 ? "is-positive" : "is-negative") + "\">" + escapeHtml(formatMeterDelta({ key, delta })) + "</span>"
    ).join("");
    const traadHtml = [
      [summary.traader.fullfoert, "Fullført"],
      [summary.traader.eskalert, "Eskalert"],
      [summary.traader.hvilende, "Hvilende"]
    ]
      .filter(([ids]) => ids.length)
      .map(([ids, label]) =>
        "<li><strong>" + escapeHtml(label) + ":</strong> " + ids.map((id) => escapeHtml(traadTittel(id))).join(", ") + "</li>"
      ).join("");
    const narrative = summary.valg.filter((entry) => entry.konsekvensTekst).slice(-2).map((entry) => entry.konsekvensTekst).join(" ");
    // Livsstilslinjen: dagens valg teller — vis hvem spilleren er i ferd med å bli.
    const stamp = lifestyleStamp();
    const stampHtml = stamp
      ? "<p class=\"civi-lifestory-stamp\">Valgene dine drar mot: <strong>"
        + escapeHtml((stamp.icon ? stamp.icon + " " : "") + stamp.name) + "</strong></p>"
      : "";
    // Uka kåres en slutt på den siste dagen med innhold. Da kan spilleren
    // fortsette historien, mens omstart ligger under «Mer» i footeren.
    // Uten endings-modulen vises den vanlige dagsoppsummeringen.
    const Endings = /** @type {any} */ (window).CivicationLifestoryEndings;
    const sisteDag = !!(Endings && Endings.isFinalDay(state, content));
    const ending = sisteDag ? Endings.resolveEnding(state, content) : null;
    const authoredEnding = ending && (content.role.endings || []).find(e => e.id === ending.id);
    const onOriginalFinalDay = !content.role.symposium || state.dag === content.role.symposium.sisteDag;
    const endingHtml = ending && onOriginalFinalDay
      ? "<section class=\"civi-lifestory-ending\" aria-label=\"Ukas slutt\">"
        + "<div class=\"civi-lifestory-section-label\">" + (content.fortsettelse ? "Kapittelet er avsluttet" : "Slutten på uka") + "</div>"
        + "<h3>" + escapeHtml(ending.navn) + "</h3>"
        + (ending.tekst ? "<p>" + escapeHtml(ending.tekst) + "</p>" : "")
        + dramatizationNote(authoredEnding && sceneHasRepresentative({ tittel: authoredEnding.navn, tekst: authoredEnding.tekst }))
        + "</section>"
      : "";
    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    const next = (content.role.symposium?.fortsettelser || []).find((n) => Runner.canStartContinuation?.(state, content, n));
    const continuationHtml = next
      ? '<button class="civi-btn primary" type="button" data-lifestory-continue="' + escapeHtml(next.id) + '"' + (continuing ? ' disabled' : '') + '>' + (continuing ? "Åpner fortsettelsen …" : escapeHtml(next.navn)) + '</button>'
      : "";
    const chosenLifePosition = sisteDag && !next ? getRoleSuggestion() : null;
    const pendingPrivate = !!Runner.hasPendingPrivateScenes?.(state, content);
    // Private Life Stories remain playable without a badge. The History Go
    // guide is optional and must also appear when private stories continue.
    // Show the first-week invitation once, then save the next milestone for
    // the real final private day. Repeating week-one endings on days 8–20
    // made the player's growing life feel like the same mail every morning.
    const offerExploration = sisteDag && !next && (!pendingPrivate || onOriginalFinalDay);
    const threeWeekDirection = state.livsdag >= 21 &&
      state.arkiv?.some(entry => /^wave_e_life21_d21_/.test(entry.sceneId) && entry.livsdag >= 21)
      ? state.tidligereValg?.life21_direction || state.privatHistorie?.flagg?.life21_direction
      : null;
    const threeWeekLabels = {
      skaper: "Skaper", narmiljobygger: "Nærmiljøbygger",
      relasjonsbygger: "Relasjonsbygger", hverdagsbygger: "Hverdagsbygger",
      utforsker: "Utforsker"
    };
    const required = Number(chosenLifePosition?.threshold);
    const hasPointGate = Number.isFinite(required) && required > 0 && !!chosenLifePosition?.badge_id;
    const earned = hasPointGate ? chapterBadgePoints(chosenLifePosition.badge_id) : 0;
    const needsMerits = hasPointGate && earned < required;
    const nextChapterHint = !offerExploration ? "" :
      '<section class="civi-lifestory-next-chapter" role="status" aria-label="Veien videre">'
      + '<h4>Veien videre</h4>'
      + (threeWeekDirection && threeWeekLabels[threeWeekDirection]
        ? '<p>Tre uker med konkrete valg har gjort <strong>' + escapeHtml(threeWeekLabels[threeWeekDirection])
          + '</strong> til en mulig livsretning. Du velger selv om den skal være aktiv i livsprofilen. '
          + 'Du kan samtidig søke jobb og takke ja til et reelt jobbtilbud.</p>'
        : chosenLifePosition
        ? '<p>Privatlivet kan fortsette uansett jobbstatus. Du har vist interesse for <strong>' + escapeHtml(chosenLifePosition.navn) + '</strong>. Vil du åpne dette ekstra historiekapittelet, kreves riktig opptjening og et frivillig valg av livsposisjon.</p>'
          + (needsMerits ? '<p>Du har ' + escapeHtml(earned) + ' av ' + escapeHtml(required) + ' poeng i ' + escapeHtml(chosenLifePosition.badge_id) + '. Ta quizer i History Go for å bygge kunnskap.</p>'
            : hasPointGate ? '<p>Du har nok poeng. Åpne livsposisjonene og velg ' + escapeHtml(chosenLifePosition.navn) + ' for å låse opp neste kapittel.</p>'
              : '<p>Undersøk hvilke krav som gjelder for livsposisjonen før du fortsetter.</p>')
        : '<p>Du kan fortsette privatlivet uten jobb eller livsposisjon. Utforsk History Go når du vil for å bygge kunnskap, utvide samlingen og finne nye muligheter i livsverdenen.</p>')
      + '<div class="civi-lifestory-actions">'
      + '<button class="civi-btn primary" type="button" data-lifestory-study>Utforsk History Go</button>'
      + '<button class="civi-btn" type="button" data-lifestory-life-profile>Se livsposisjoner</button>'
      + '</div></section>';
    // A pending mail needs a reachable player action in Min dag, even when
    // there is no active job or visible top-action card.
    const pendingDayAction = window.CivicationNextActionSelector?.getCurrent?.();
    const needsInboxFirst = !!pendingDayAction && !pendingDayAction.canStartNewDay;
    const pendingDayActionHtml = needsInboxFirst
      ? '<button class="civi-btn" type="button" data-lifestory-next-action>Åpne innboksen</button>'
      : "";
    const blockedDayNote = needsInboxFirst
      ? '<p class="muted" role="status">Du har fortsatt en melding eller oppgave i dag. Åpne innboksen og fullfør den før du starter neste dag.</p>'
      : "";
    const nextDayDisabled = needsInboxFirst ? ' disabled title="Fullfør dagens meldinger først"' : '';
    const chapterReadyToSettle = sisteDag && !pendingPrivate && state.livsdag >= 21
      && getShellDay() === state.livsdag && state.kalenderDag === state.livsdag;
    const completedChapterNotice = sisteDag && !pendingPrivate && state.livsdag >= 21
      && !chapterReadyToSettle
      ? '<p class="muted" role="status">Dette Life Story-kapitlet er ferdig. Arbeid, privatliv og økonomi fortsetter i Civication mens nye kapitler blir tilgjengelige.</p>'
      : '';
    const handlingsHtml = sisteDag
      ? "<div class=\"civi-lifestory-actions\">"
        + continuationHtml
        + nextChapterHint
        + (pendingPrivate ? '<button class="civi-btn primary" type="button" data-lifestory-next-day' + nextDayDisabled + '>Fortsett privatlivet</button>' : "")
        + (chapterReadyToSettle ? '<button class="civi-btn primary" type="button" data-lifestory-next-day' + nextDayDisabled + '>Avslutt dag 21 og gjør opp uken</button>' : "")
        + completedChapterNotice
        + blockedDayNote
        + pendingDayActionHtml
        + "</div>"
      : "<div class=\"civi-lifestory-actions\">"
        + continuationHtml
        + '<button class="civi-btn primary" type="button" data-lifestory-next-day' + nextDayDisabled + '>Start neste dag</button>'
        + blockedDayNote
        + pendingDayActionHtml
        + "</div>";
    return ""
      + "<section class=\"civi-lifestory-summary\" aria-label=\"Dagsoppsummering\">"
      + "<div class=\"civi-lifestory-section-label\">Dagsoppsummering</div>"
      + "<h3>Dag " + escapeHtml(summary.dag) + " er over</h3>"
      + (narrative ? "<p>" + escapeHtml(narrative) + "</p>" : "<p class=\"muted\">Dagen er avsluttet og valgene dine er lagret i arkivet.</p>")
      + dramatizationNote(summary.valg.some(entry => Object.keys(entry.personRepresentanter || {}).some(id => entry.personRepresentanter[id]?.personId)))
      + stampHtml
      + "<details class=\"civi-lifestory-disclosure\" data-lifestory-disclosure=\"day-recap\"><summary>Dagens valg, tråder og endringer</summary>"
      + "<h4>Meter-endringer siden morgenen</h4><div class=\"civi-lifestory-deltas\">" + (meterHtml || "<span class=\"muted\">Ingen målbare endringer.</span>") + "</div>"
      + (traadHtml ? "<h4>Tråder som endret status</h4><ul>" + traadHtml + "</ul>" : "")
      + "<h4>Viktige valg i dag</h4><ul>" + valgHtml + "</ul></details>"
      + endingHtml
      + (continuationError ? '<p role="alert">' + escapeHtml(continuationError) + '</p>' : "")
      + handlingsHtml
      + "</section>";
  }

  /**
   * @param {any} view
   * @returns {string}
   */
  function renderPreviousChoiceHtml(view) {
    // The last documented consequence stays visible after a reload or day
    // change. This is a read-only excerpt from the canonical choice archive.
    if (sisteKonsekvens || view.dagFerdig) return "";
    const previous = [...(view.arkiv || [])].reverse().find(entry => entry.konsekvensTekst);
    if (!previous) return "";
    const text = String(previous.konsekvensTekst).trim();
    const excerpt = text.length > 170 ? text.slice(0, 170).replace(/\s+\S*$/, "") + "…" : text;
    return '<section class="civi-lifestory-previous" aria-label="Et tidligere valg har betydning">'
      + '<strong>Et tidligere valg har betydning</strong><p>' + escapeHtml(excerpt)
      + '</p></section>';
  }

  function renderPanelsHtml(view) {
    const symposium = window.CivicationLifestoryRunner.getSymposium(state, content);
    const allThreads = Object.entries(state.threadState || {}).map(([id, ts]) => {
      const thread = content.threads.find((t) => t.id === id) || { id };
      return Object.assign({}, thread, { status: ts.status, step: ts.step });
    }).sort((a, b) => {
      if (symposium?.hovedtraad) {
        if (a.id === symposium.hovedtraad.id) return -1;
        if (b.id === symposium.hovedtraad.id) return 1;
      }
      const rank = { escalated: 0, active: 1, dormant: 2, completed: 3 };
      return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
    });
    const hiddenCount = Math.max(0, allThreads.length - 6);
    const traaderHtml = allThreads.slice(0, 6).map((thread) =>
      "<li class=\"civi-thread-row is-" + escapeHtml(thread.status) + "\"><span>" + escapeHtml(formatThreadTitle(thread)) + "</span><span class=\"civi-thread-badge is-" + escapeHtml(thread.status) + "\">" + escapeHtml(formatThreadStatus(thread.status)) + "</span></li>"
    ).join("") + (hiddenCount ? "<li class=\"muted\">+ " + hiddenCount + " flere tråder</li>" : "");

    const kalenderHtml = view.dagsplan.map((avtale) =>
      "<li><span class=\"muted\">" + escapeHtml(avtale.klokke) + "</span> " + escapeHtml(avtale.tekst) + "</li>"
    ).join("");
    const senereHtml = view.senereIDag.map((scene) =>
      "<li><span class=\"muted\">" + escapeHtml(viewPhaseName(scene.fase)) + "</span> " + escapeHtml(scene.tittel || scene.visningstype) + "</li>"
    ).join("");

    const arkivHtml = view.arkiv.length
      ? view.arkiv.slice(-4).reverse().map((entry) =>
          "<li><strong>" + escapeHtml(viewPhaseName(entry.fase)) + ": " + escapeHtml(entry.sceneTittel)
          + "</strong><br><em>" + escapeHtml(entry.valgTekst) + "</em>"
          + (entry.konsekvensTekst ? "<br><small>" + escapeHtml(entry.konsekvensTekst) + "</small>" : "") + "</li>"
        ).join("")
      : "<li class=\"muted\">Ingen valg tatt ennå.</li>";

    return ""
      + '<aside class="civi-lifestory-panels" aria-label="Flere muligheter">'
      + renderWaveAOverviewHtml()
      + '<details class="civi-lifestory-disclosure" data-lifestory-disclosure="later"><summary>Senere i dag (' + (view.dagsplan.length + view.senereIDag.length) + ')</summary><ul>' + (kalenderHtml + senereHtml || '<li class="muted">Ingen flere planlagte scener.</li>') + '</ul></details>'
      + '<details class="civi-lifestory-disclosure civi-lifestory-history" data-lifestory-disclosure="history"><summary>Historikk og tidligere valg (' + view.arkiv.length + ')</summary><div class="civi-lifestory-history-content">'
      + '<details class="civi-lifestory-disclosure" data-lifestory-disclosure="threads"><summary>Historietråder (' + allThreads.length + ')</summary><ul>' + (traaderHtml || '<li class="muted">Ingen tråder ennå.</li>') + '</ul></details>'
      + '<details class="civi-lifestory-disclosure" data-lifestory-disclosure="archive"><summary>Tidligere valg (' + view.arkiv.length + ')</summary><ul>' + arkivHtml + '</ul></details>'
      + renderSymposiumHtml(symposium)
      + '</div></details>'
      + '</aside>';
  }


  // A projection of the SAME saved Life Story state, including role snapshots.
  // No past visit/meeting is invented from a scheduled calendar entry.
  function renderWaveAOverviewHtml() {
    if (!state) return "";
    const roles = [{ id: state.rolle, save: state }].concat(
      Object.entries(state.rolleTilstander || {}).map(([id, save]) => ({ id, save }))
    );
    const histories = roles.flatMap(({ id, save }) => (save?.arkiv || [])
      .filter(entry => WAVE_A_SCENE_ID.test(String(entry.sceneId || "")))
      .map(entry => ({ ...entry, savedRole: id })));
    const pending = getPendingWaveAEvent() ||
      window.CivicationWaveAPrivateRoleBridge?.getPendingEvent?.();
    const rows = Object.entries(WAVE_A_TITLES).map(([type, title]) => {
      const matching = histories.filter(entry => {
        const id = String(entry.sceneId);
        return id.startsWith("wave_a_" + type + "_") || id.startsWith("wave_b_" + type + "_");
      });
      const last = matching[matching.length - 1];
      const planned = content.scenes.filter(scene => {
        const match = String(scene.id).match(WAVE_A_SCENE_ID);
        return match?.[1] === type && !state.spilteScener.includes(scene.id);
      });
      const firstDay = planned.length ? Math.min(...planned.map(scene => scene.livsdagFra || scene.dag)) : null;
      const entryHint = firstDay && planned.every(scene => (scene.livsdagFra || scene.dag) > (scene.livsdagFra ? state.livsdag || state.dag : state.dag))
        ? "Tidligst dag " + firstDay + " i denne fortellingen; tidligere valg avgjør veien videre"
        : planned.length ? "Avhenger av tidligere valg og hvilke tråder du følger"
          : "Ikke åpnet i ditt nåværende forløp";
      const detail = pending?.story_type_id === type.toUpperCase()
        ? "Klar til svar i Min dag og innboksen"
        : last ? "Siste valg: " + String(last.sceneTittel || last.sceneId)
          + " (" + (last.savedRole === state.rolle ? "gjeldende rolle" : "tidligere rolle: " + last.savedRole) + ")"
        : entryHint;
      return "<li><strong>" + escapeLiteral(title)
        + "</strong> – " + escapeLiteral(detail)
        + (last ? " <small>(" + matching.length + " lagrede valg)</small>" : "")
        + "</li>";
    }).join("");
    const contracts = [
      ["wa_c01_tur_avtalt", "wa_c01_tur_gjennomfort", "wa_c01_tur_avlyst", "Tur med Jonas"],
      ["wa_c03_avtalt", "wa_c03_test_gjennomfort", "wa_c03_avlyst", "Prøve med Lea"],
      ["wa_c07_vakt_avtalt", "wa_c07_vakt_gjennomfort", "wa_c07_vakt_avlyst", "Vakt hos Arvid"]
    ];
    const agreements = roles.flatMap(({ id, save }) => contracts
      .filter(([agreed, done, canceled]) => save?.tidligereValg?.[agreed] === true &&
        save.tidligereValg[done] !== true && save.tidligereValg[canceled] !== true)
      .map(([, , , title]) => "<li>" + escapeLiteral(title + " (" + id + ")")
        + " – avtalt, gjennomføring ikke dokumentert</li>"));
    const buttons = Object.entries(state.threadState || {}).filter(([id, progress]) =>
      WAVE_A_THREAD_ID.test(id) && content?.threads?.some(thread => thread.id === id) &&
      (["active", "escalated"].includes(progress.status) ||
        (progress.status === "dormant" && state.tidligereValg["wa_paused_" + id]))
    ).map(([id, progress]) => {
      const paused = progress.status === "dormant";
      const label = paused ? "Fortsett" : "Sett på pause";
      const command = paused ? "resume" : "pause";
      return "<li>" + escapeLiteral(formatThreadTitle(content.threads.find(thread => thread.id === id) || { id }))
        + " <button type='button' data-wave-a-thread='" + escapeLiteral(id)
        + "' data-wave-a-command='" + command + "'>" + label + "</button>"
        + (paused ? "" : " <button type='button' data-wave-a-thread='"
          + escapeLiteral(id) + "' data-wave-a-command='end'>Avslutt historien</button>")
        + "</li>";
    }).join("");
    const controls = agreements.length || buttons
      ? '<details class="civi-lifestory-disclosure" data-lifestory-disclosure="story-controls"><summary>Avtaler og styring av historier</summary>'
        + (agreements.length ? '<h4>Åpne avtaler</h4><ul>' + agreements.join("") + '</ul>' : "")
        + (buttons ? '<h4>Styr dine historier</h4><ul>' + buttons + '</ul>' : "")
        + '</details>'
      : "";
    return '<section class="civi-lifestory-story-overview" data-wave-a-overview>'
      + '<details class="civi-lifestory-disclosure" data-lifestory-disclosure="stories"><summary>Mine historier – åtte forløp</summary><ul>'
      + rows + '</ul></details>'
      + controls
      + '</section>';
  }

  // Pause, resume and terminate operate on the canonical thread state. A
  // paused scene is not recorded as played; a terminated one is not replayed.
  function changeWaveAThread(id, command) {
    if (shellStoryUnavailable()) return false;
    if (!WAVE_A_THREAD_ID.test(id) || !content?.threads?.some(t => t.id === id)) return false;
    const current = state?.threadState?.[id];
    if (!current || current.status === "completed") return false;
    const State = window.CivicationLifestoryState;
    const pauseFlag = "wa_paused_" + id;
    let next = null, pausedBefore = false;
    if (command === "pause" && ["active", "escalated"].includes(current.status)) {
      next = "dormant"; pausedBefore = current.status;
    } else if (command === "resume" && current.status === "dormant" &&
      ["active", "escalated"].includes(state.tidligereValg[pauseFlag])) {
      next = state.tidligereValg[pauseFlag];
    } else if (command === "end" && ["active", "escalated", "dormant"].includes(current.status)) {
      next = "completed";
    }
    if (!next) return false;
    State.applyEffects(state, {
      threads: { [id]: { status: next } },
      flagg: {
        [pauseFlag]: pausedBefore,
        ["wa_ended_" + id]: command === "end"
      }
    });
    // The runner, not this UI, advances past newly unavailable scenes.
    // Without this, ending the only visible thread strands Min dag on an
    // unanswerable, unfinished phase and blocks the canonical calendar.
    // Ending a thread may close an otherwise empty phase. Pausing must NOT
    // consume that day: resuming should restore the exact unanswered scene.
    if (command === "end") window.CivicationLifestoryRunner.advance(state, content);
    State.save(state);
    window.dispatchEvent(new Event("civi:lifestoryChanged"));
    render();
    return true;
  }

  /** Den fulle historien kan åpnes uten å fylle NÅ-flaten med metadata. */
  function renderSymposiumHtml(book) {
    if (!book) return "";
    const timeline = book.tidslinje.map((e) => "<li><strong>Dag " + escapeHtml(e.dag) + " · " + escapeHtml(viewPhaseName(e.fase)) + " · " + escapeHtml(e.sceneTittel) + "</strong>"
      + (e.sted ? "<br>" + escapeHtml(e.sted.navn) : "")
      + (e.person ? " · " + escapeHtml(e.person.navn) : "")
      + "<p>" + escapeHtml(e.valgTekst) + "</p>"
      + (e.konsekvensTekst ? "<p>" + escapeHtml(e.konsekvensTekst) + "</p>" : "") + "</li>").join("");
    const plans = book.avtaler.map((a) => "<li>Dag " + escapeHtml(a.dag) + " · " + escapeHtml(viewPhaseName(a.fase)) + ": " + escapeHtml(a.tittel) + (a.sted ? " · " + escapeHtml(a.sted.navn) : "") + "</li>").join("");
    return "<section><details data-lifestory-symposium data-lifestory-disclosure=\"full-history\"><summary>Hele livshistorien</summary>"
      + "<h4>" + escapeHtml(book.tittel) + "</h4>"
      + (book.kapitler?.length ? "<h4>Avsluttede kapitler</h4><ul>" + book.kapitler.map((k) => "<li><strong>" + escapeHtml(k.tittel) + "</strong> · dag " + escapeHtml(k.fraDag) + "–" + escapeHtml(k.tilDag) + "<p>" + escapeHtml(k.ending.navn) + "</p><p>" + escapeHtml(k.ending.tekst) + "</p></li>").join("") + "</ul>" : "")
      + (book.hovedtraad ? "<p>Tråden i forgrunnen: <strong>" + escapeHtml(book.hovedtraad.tittel) + "</strong></p>" : "")
      + (book.rollebro ? "<p>Videre rollekontekst: " + escapeHtml(book.rollebro.navn) + "</p>" : "")
      + (book.rollebroer?.length > 1 ? "<p>Mulige livsroller: " + book.rollebroer.map((b) => escapeHtml(b.navn)).join(" · ") + "</p>" : "")
      + (getRoleSuggestion() || content.fortsettelse ? '<button type="button" data-lifestory-life-profile>Åpne livsprofilen igjen</button>' : "")
      + "<h4>Personer</h4>"
      + (book.personer.some(p => p.persontype) ? '<p class="muted">Persontypene beskriver funksjoner i historien. Samlede History Go-personer kan representere dem. Relasjoner, dialog og handling er dramatisert.</p>' : "")
      + "<ul>" + book.personer.map((p) => {
        const cast = state.personRepresentanter?.[p.id];
        // Keep a stable, anonymous type label in the person overview.
        // Story dialogue may resolve to a collected person's name separately.
        const typeLabel = ({
          medmusiker: "Medmusikeren",
          miljokontakt: "Miljøkontakten",
          prosjektbygger: "Prosjektbyggeren"
        })[p.persontype?.id] || p.navn;
        return "<li><strong>" + escapeLiteral(typeLabel) + "</strong>"
          + (p.persontype ? " <small>· Type: " + escapeLiteral(typeLabel) + "</small>" : "")
          + (p.persontype && cast?.personId ? " <span class=\"muted\">· " + escapeLiteral(cast.navn) + "</span>" : "")
          + ": " + escapeHtml(p.beskrivelse)
          + (cast?.personId && cast.beskrivelse ? "<p>Fra History Go: " + escapeLiteral(cast.beskrivelse) + "</p>" : "")
          + (p.persontype && !cast ? '<p class="muted">Denne typen kan representeres av en relevant person du har samlet i History Go.</p>' : "")
          + "</li>";
      }).join("") + "</ul>"
      + "<h4>Møter og avtaler</h4><ul>" + (book.moter.map((m) => "<li>Dag " + escapeHtml(m.dag) + " · " + escapeHtml(m.navn) + " · " + escapeHtml(m.sted.navn) + ": " + escapeHtml(({ avtalt: "Avtalt", gjennomfort: "Gjennomført", avslaatt: "Avslått", avbrutt: "Avbrutt" })[m.status]) + "</li>").join("") || "<li>Ingen møter avtalt ennå.</li>") + "</ul>"
      + "<h4>Steder</h4><ul>" + book.steder.map((p) => "<li>" + escapeHtml(p.navn) + "</li>").join("") + "</ul>"
      + "<h4>Åpne scener</h4><ul>" + (plans || "<li>Ingen flere planlagte scener.</li>") + "</ul>"
      + "<h4>Tidslinje</h4><ol>" + (timeline || "<li>Ingen valg tatt ennå.</li>") + "</ol>"
      + "</details></section>";
  }

  /**
   * v2-headeren: rolle, dag, fase og noen få statusverdier.
   * @param {any} view
   */
  function renderHeaderStatus(view) {
    const header = document.getElementById("civiLifestoryHeaderStatus");
    if (!header) return;

    if (window.CivicationDashboardUI?.updateHeaderStatus) {
      window.CivicationDashboardUI.updateHeaderStatus({
        state, view, lifeRole: content?.role?.navn || ""
      });
      return;
    }

    const chips = [
      // The isolated Life Story fallback stays compact; the real shell adds
      // its circular score control once CivicationDashboardUI has loaded.
      ["role is-empty", "Ingen aktiv rolle"],
      ["day", "Dag " + state.dag],
      ["phase", view.dagFerdig ? "Dagen er over" : (view.fase ? view.fase.navn : state.fase)]
    ];
    header.textContent = "";
    chips.map(function (chip) {
      const el = document.createElement("span");
      el.className = "civi-header-chip civi-header-chip--" + chip[0].replace(/\s+/g, " civi-header-chip--");
      el.textContent = chip[1];
      el.title = chip[1];
      return el;
    }).forEach(function (chip) { header.appendChild(chip); });
  }

  function renderDayEventHtml() {
    let action = null;
    let primary = null;
    try {
      action = window.CivicationNextActionSelector?.getCurrent?.() || null;
      const active = window.CivicationState?.getActivePosition?.();
      const scope = window.CivicationCareerRoleResolver?.resolveCareerRoleScope?.(active);
      const runtime = window.CivicationDailyMailBuilder?.inspect?.()?.runtime;
      if (action?.source === "day_phase" && runtime?.role_scope && runtime.role_scope !== scope) return "";
      const event = window.CivicationMailEngine?.getMail?.(action?.id)?.event;
      const eventScope = event?.role_scope || event?.role_model_meta?.role_scope;
      const jobEvent = window.CivicationEventChannels?.getMessageChannel?.(event) === "job"
        || event?.mail_class === "daily_workday" || event?.workday_related === true;
      if (jobEvent && eventScope && eventScope !== scope) return "";
      primary = window.CivicationLifePositions?.getLifeContext?.()?.primary_life_position;
    } catch { /* the normal recovery button remains available */ return ""; }
    if (!action || !window.CivicationNextActionUI?.open) return "";
    const situation = (Array.isArray(action.situation) && action.situation.length
      ? action.situation : [action.body || action.summary || ""])
      .map(line => String(line || "").trim()).filter(Boolean).slice(0, 6);
    const label = action.canStartNewDay ? "Se dagslutt" : "Åpne i innboksen";
    return '<div data-lifestory-day-event="' + escapeLiteral(action.id) + '">'
      + '<div class="civi-lifestory-kicker"><span>' + escapeLiteral(shellStory.title) + '</span>'
      + (action.phaseLabel ? '<span>' + escapeLiteral(action.phaseLabel) + '</span>' : "") + '</div>'
      + (primary?.label ? '<p class="muted">Livsrolle: ' + escapeLiteral(primary.label) + '</p>' : "")
      + '<h3>' + escapeLiteral(action.subject || "Dagens hendelse") + '</h3>'
      + situation.map(line => '<p>' + escapeLiteral(line) + '</p>').join("")
      + '<button class="civi-btn primary" type="button" data-lifestory-next-action>' + label + '</button></div>';
  }

  function renderShellStoryHtml() {
    const status = shellStory.status;
    const dayEvent = status === "unavailable" ? renderDayEventHtml() : "";
    const message = status === "unavailable"
      ? "Denne jobben har foreløpig ingen egen fortelling i Min dag. Du kan fortsette med dagens jobb, meldinger og hendelser. Tidligere fortellinger og valg er lagret."
      : status === "error"
        ? "Fortellingen kunne ikke lastes. Valgene dine er lagret. Prøv igjen, eller fortsett med dagens andre handlinger."
        : "Finner fortellingen som hører til jobben din …";
    return '<section class="civi-lifestory-scene" data-lifestory-role-status="' + escapeLiteral(status) + '" aria-live="polite">'
      + (dayEvent ? dayEvent + '<details><summary>Om fortellingen for denne jobben</summary><p>' + message + '</p></details>'
        : '<h3>' + escapeLiteral(shellStory.title) + '</h3><p>' + message + '</p>'
          + (window.CivicationNextActionUI?.open ? '<button class="civi-btn primary" type="button" data-lifestory-next-action>Åpne innboksen</button>' : ""))
      + (status === "error" ? '<button class="civi-btn" type="button" data-lifestory-retry>Prøv igjen</button>' : "")
      + '</section>';
  }

  function renderEmptyPhaseHtml() {
    const paused = hasPausedScene();
    return '<section class="civi-lifestory-scene" data-lifestory-empty-phase>'
      + '<h3>' + (paused ? "Historien venter på deg" : "Ingen ny hendelse akkurat nå") + '</h3>'
      + '<p>' + (paused ? 'Denne delen av historien er satt på pause. Velg «Fortsett» under «Styr dine historier» for å ta opp tråden.'
        : "Du kan gå videre til neste hendelse eller dagens oppsummering.") + '</p>'
      + (paused ? "" : '<button class="civi-btn primary" type="button" data-lifestory-advance>Fortsett dagen</button>')
      + '</section>';
  }

  function render() {
    const panel = getPanel();
    if (!panel || !content || !state) return;

    if (shellStoryUnavailable()) {
      panel.innerHTML = renderShellStoryHtml();
      window.CivicationWaveAInboxBridge?.sync?.();
      return;
    }

    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    const view = Runner.getView(state, content);
    const continuationRole = content.role.symposium?.rollebroer?.find((b) => b.role_scope === content.fortsettelse?.role_scope)?.navn || "kapittelets rolle";
    // Keep expanded archival sections expanded across ordinary profile/UI updates.
    // This is view-only state, never part of the canonical story save.
    const expanded = new Set(Array.from(panel.querySelectorAll?.("details[data-lifestory-disclosure][open]") || [])
      .map((detail) => detail.getAttribute("data-lifestory-disclosure")));

    renderHeaderStatus(view);
    const personalBanner = shellStory?.status === "private-only"
      ? '<section class="civi-lifestory-personal-mode" data-lifestory-personal-only>'
        + '<h3>Privatlivet ditt fortsetter</h3>'
        + '<p>' + escapeHtml(shellStory.title)
        + ' har ennå ingen egen jobbfortelling her. Dine private historier og relasjoner fortsetter; '
        + 'arbeidsoppgaver og meldinger finner du i innboksen.</p></section>'
      : "";
    panel.innerHTML = personalBanner + renderKonsekvensHtml()
      + (Runner.isContinuationPaused?.(state, content)
        ? '<section data-lifestory-paused><h3>Historien er satt på pause</h3><p>Velg ' + escapeHtml(continuationRole) + ' som hovedrolle i livsprofilen for å fortsette der du slapp.</p><button type="button" data-lifestory-life-profile>Åpne livsprofilen</button></section>'
        : (view.dagFerdig ? renderSummaryHtml(view) : (view.scene ? renderSceneHtml(view.scene) : renderEmptyPhaseHtml())))
      + renderPreviousChoiceHtml(view)
      + renderStatusHtml(view)
      + renderPanelsHtml(view);
    panel.querySelectorAll?.("details[data-lifestory-disclosure]").forEach((detail) => {
      if (expanded.has(detail.getAttribute("data-lifestory-disclosure"))) /** @type {HTMLDetailsElement} */ (detail).open = true;
    });
    // When an asynchronous role adoption finishes, retire the prior role\x27s
    // unanswerable inbox projection and expose this role\x27s current scene.
    window.CivicationWaveAInboxBridge?.sync?.();
  }

  function bindDelegation(panel) {
    if (/** @type {any} */ (panel)._lifestoryBound) return;
    /** @type {any} */ (panel)._lifestoryBound = true;
    panel.addEventListener("click", (event) => {
      const target = /** @type {HTMLElement} */ (event.target);
      const choiceBtn = target.closest("[data-lifestory-choice]");
      if (choiceBtn) {
        onChoose(
          choiceBtn.getAttribute("data-lifestory-scene") || "",
          choiceBtn.getAttribute("data-lifestory-choice") || ""
        );
        return;
      }
      const threadBtn = target.closest("[data-wave-a-thread][data-wave-a-command]");
      if (threadBtn) {
        changeWaveAThread(threadBtn.getAttribute("data-wave-a-thread") || "",
          threadBtn.getAttribute("data-wave-a-command") || "");
        return;
      }
      if (target.closest("[data-lifestory-next-action]")) {
        window.CivicationNextActionUI?.open?.();
        return;
      }
      if (target.closest("[data-lifestory-retry]")) {
        if (window.CivicationState?.getActivePosition?.() && !window.CivicationCareerRoleResolver?.resolveCareerRoleScope) {
          window.location.reload();
          return;
        }
        window.CivicationJsonStore?.invalidate?.();
        if (content && state) maybeAdoptShellRole();
        else start();
        return;
      }
      if (target.closest("[data-lifestory-advance]")) {
        if (!shellStoryUnavailable()) {
          syncSharedPrivateState(window.CivicationLifestoryState?.load?.());
          prepareStoryDay();
          window.CivicationLifestoryState.save(state);
          window.dispatchEvent(new Event("civi:lifestoryChanged"));
          render();
        }
        return;
      }
      if (target.closest("[data-lifestory-study]")) {
        const suggestion = getRoleSuggestion();
        // A chosen profile without an explicit point threshold and the
        // open exploratory route both carry a valid guidance card. Completion
        // is never faked: the History Go toast only marks numeric goals done.
        window.CivicationHistoryGoDeepLink?.startLifePositionGuidance?.(suggestion);
        window.CivicationLifestoryActions?.perform?.({ type: "gaa_til_byen" });
        return;
      }
      if (target.closest("[data-lifestory-next-day]")) { onNextDay(); return; }
      const continueBtn = target.closest("[data-lifestory-continue]");
      if (continueBtn) { onContinue(continueBtn.getAttribute("data-lifestory-continue") || ""); return; }
      if (target.closest("[data-lifestory-life-profile]")) {
        /** @type {any} */ (window).CivicationLifestoryActions?.perform?.({ type: "aapne_livsposisjoner" });
        return;
      }
     });
  }

  async function start() {
    const panel = getPanel();
    if (!panel) return; // siden har ikke Min dag-seksjonen
    try {
      bindDelegation(panel);
      bindFooterRestart();
      await ensureLoaded();
      await maybeAdoptShellRole();
      ensureCalendarCheckpoint();
      syncToShellCalendar();
      render();
      // Første scene er oppe — vekk lyttere (kartmarkør, dashboard) som
      // trenger scenens sted/fase uten å måtte polle.
      window.dispatchEvent(new Event("civi:lifestoryChanged"));
    } catch (error) {
      // Innholdsfeil skal synes (fail fast), men aldri stoppe resten av appen.
      console.error("[CivicationLifestoryUI] kunne ikke starte", error);
      loading = null;
      panel.innerHTML = '<p role="alert">Min dag kunne ikke lastes. Valgene dine er lagret.</p><button type="button" data-lifestory-retry>Prøv igjen</button>';
    }
  }

  /**
   * Read-only view-model for NÅ-scenen — brukes av kartmarkøren
   * (CivicationLifestoryPlaceMarker) til å vise hvor dagen foregår.
   * null før innholdet er lastet.
   * @returns {{ sceneId: string|null, tittel: string|null, fase: string,
   *   dagFerdig: boolean, threadId: string|null, threadType: string|null,
   *   rolleNavn: string|null,
   *   sted: { id: string, navn: string, type?: string }|null }|null}
   */
  function getCurrentSceneInfo() {
    if (!content || !state || shellStoryUnavailable()) return null;
    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    const view = Runner.getView(state, content);
    const scene = view.scene || null;
    const thread = scene ? (content.threads || []).find((t) => t.id === scene.threadId) : null;
    return {
      sceneId: scene ? scene.id : null,
      tittel: scene ? window.CivicationLifestoryState.presentText(state, content, scene.tittel) : null,
      fase: state.fase,
      dagFerdig: !!view.dagFerdig,
      threadId: thread ? thread.id : null,
      threadType: thread ? thread.type : null,
      rolleNavn: content.role && content.role.navn ? String(content.role.navn) : null,
      sted: scene ? (content.role.symposium?.steder || []).find((p) => p.id === scene.stedId) || null : null
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { start(); });
  } else {
    start();
  }


  // One canonical Life Story scene; inbox receives a read/action projection.
  function getPendingWaveAEvent() {
    if (shellStoryUnavailable()) return null;
    if (!state || !content || state.dagFerdig) return null;
    const currentSaveRole = window.CivicationLifestoryState?.load?.()?.rolle;
    if (currentSaveRole && currentSaveRole !== state.rolle) return null;
    const Runner = window.CivicationLifestoryRunner;
    const State = window.CivicationLifestoryState;
    const scene = Runner.selectNextScene(state, content);
    if (!scene || !WAVE_A_SCENE_ID.test(scene.id)) return null;
    const storyId = scene.id.match(WAVE_A_SCENE_ID)[1];
    const isJob = storyId === "c06" || storyId === "c17";
    const phases = {
      morgen: "morning", formiddag: "forenoon", arbeidsdag: "workday",
      lunsj: "lunch", ettermiddag: "afternoon",
      middag: "dinner", kveld: "evening", natt: "day_end"
    };
    // The shell owns its phase clock. Never deliver an afternoon scene as
    // an actionable morning mail just because Min dag has reached it first.
    const shellPhase = window.CivicationCalendar?.getPhase?.();
    const order = ["morning", "forenoon", "workday", "lunch",
      "afternoon", "dinner", "evening", "day_end"];
    if (shellPhase && order.includes(shellPhase) &&
        order.indexOf(shellPhase) < order.indexOf(phases[scene.fase] || "afternoon")) return null;
    const text = State.presentText(state, content, scene.tekst || "");
    return {
      id: "wa_lifestory__" + state.rolle + "__" + scene.id,
      source_type: "lifestory_wave_a",
      lifestory_role: state.rolle,
      lifestory_scene_id: scene.id,
      lifestory_thread_id: scene.threadId,
      story_type_id: storyId.toUpperCase(),
      thread_key: "lifestory.wave_a." + state.rolle + "." + scene.id,
      from: State.presentText(state, content, scene.avsender || "Min dag"),
      source: "Min dag",
      subject: State.presentText(state, content, scene.tittel),
      situation: Array.isArray(text) ? text : [String(text)],
      mail_type: "story",
      mail_class: isJob ? "daily_workday" : "daily_private",
      channel: isJob ? "job" : "private",
      messageChannel: isJob ? "job" : "private",
      workday_related: isJob,
      phase_tag: phases[scene.fase] || "afternoon",
      lifestory_day: state.dag,
      choices: (scene.valg || []).map(choice => ({
        id: choice.id,
        label: State.presentText(state, content, choice.tekst),
        feedback: State.presentText(state, content, choice.konsekvensTekst || ""),
        effect: 0
      }))
    };
  }

  function answerWaveAChoice(eventId, choiceId) {
    const pending = getPendingWaveAEvent();
    if (!pending || pending.id !== eventId) return { ok: false, reason: "story_scene_not_current" };
    const choice = pending.choices.find(row => row.id === choiceId);
    if (!choice) return { ok: false, reason: "bad_choice" };
    return onChoose(pending.lifestory_scene_id, choiceId)
      ? { ok: true, feedback: choice.feedback }
      : { ok: false, reason: "runner_rejected_choice" };
  }

  /** Forslaget er et lagret ønske, ikke en aktivert identitet. */
  function getRoleSuggestion() {
    if (shellStoryUnavailable()) return null;
    if (!content?.role?.symposium?.rollevalgFlagg || !state) return null;
    const selected = state.tidligereValg[content.role.symposium.rollevalgFlagg];
    return (content.role.symposium.rollebroer || []).find((b) => b.role_scope === selected) || null;
  }

  // DayProgression leser denne for å hindre at maildagen ruller forbi
  // fortellingens uferdige valg. Ingen kalender-/jobbstate skrives her.
  function getDaySyncState() {
    // With Min dag mounted, loading its state must not be mistaken for an
    // absent story. Otherwise day_end can roll past unanswered scenes on slow
    // starts/reloads. Only an explicitly unsupported job has no story gate.
    if (!getPanel() || shellStory?.status === "unavailable") return null;
    if (shellStoryUnavailable() || !state || !content) {
      return { dagFerdig: false, rolle: state?.rolle || null, kalenderDag: state?.kalenderDag || null };
    }
    return { dagFerdig: !!state.dagFerdig, rolle: state.rolle, kalenderDag: state.kalenderDag || null };
  }

  window.CivicationLifestoryUI = {
    render, refresh: render, getCurrentSceneInfo, getRoleSuggestion, getDaySyncState,
    getPendingWaveAEvent, answerWaveAChoice
  };
})();

