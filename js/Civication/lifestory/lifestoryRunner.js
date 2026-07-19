// js/Civication/lifestory/lifestoryRunner.js
//
// Civication Life Story System — Day Runner.
// Den ene egentlige «motoren» i det nye systemet. Den gjør bare dette:
//   1. Les Player State          2. Finn aktive tråder
//   3. Finn mulige scener        4. Velg beste neste scene
//   5. (UI viser scenen)         6. Ta imot valg
//   7. Oppdater Player State     8. Lås opp nye scener
//   9. Gå videre i dagen
// Ikke mer. Ingen generering, ingen mail-heuristikk — alt innhold kommer
// fra fortellingspakkene (lifestoryContent).
//
// DOM-fri, fetch-fri, lagringsfri: opererer kun på (state, content) og
// muterer/returnerer state. UI-et eier visning og lagring.

(function (globalScope) {
  "use strict";

  const State = /** @type {any} */ (globalScope).CivicationLifestoryState
    || (typeof require === "function" ? require("./lifestoryState.js") : null);
  if (!State) throw new Error("[LifestoryRunner] CivicationLifestoryState mangler (lastes før runneren)");

  /** Trådstatuser som gjør at trådens scener kan spilles. */
  const PLAYABLE_THREAD_STATUSES = ["active", "escalated"];

  /**
   * Er en tråd spillbar akkurat nå? Krever threadState med status
   * active/escalated. Tråder uten threadState har ikke startet ennå;
   * completed/dormant-tråder gir ingen nye scener.
   * @param {any} state
   * @param {string} threadId
   * @returns {boolean}
   */
  function isThreadPlayable(state, threadId) {
    const ts = state.threadState[threadId];
    return !!ts && PLAYABLE_THREAD_STATUSES.indexOf(ts.status) !== -1;
  }

  /**
   * Evaluerer scene.conditions mot Player State. Strukturen er validert
   * av lifestoryContent (fail fast der); her evalueres den bare.
   *  - flagg: literal => tidligereValg[k] === verdi;
   *           { finnes: true/false } => nøkkelen må (ikke) finnes.
   *  - meters/relasjoner: { min?, max? } inklusive grenser.
   *  - threads: threadState[id].status må være nøyaktig oppgitt status
   *    (tråd uten threadState teller som "dormant" — ikke startet).
   * @param {any} state
   * @param {any} scene
   * @returns {boolean}
   */
  function conditionsMet(state, scene) {
    const cond = scene.conditions;
    if (!cond) return true;

    for (const [flag, expected] of Object.entries(cond.flagg || {})) {
      const exists = flag in state.tidligereValg;
      if (expected && typeof expected === "object") {
        if (expected.finnes !== exists) return false;
      } else if (!exists || state.tidligereValg[flag] !== expected) {
        return false;
      }
    }
    for (const [key, range] of Object.entries(cond.meters || {})) {
      const value = state.meters[key];
      if (typeof value !== "number") throw new Error(`[LifestoryRunner] ukjent måler i conditions: "${key}"`);
      if (range.min !== undefined && value < range.min) return false;
      if (range.max !== undefined && value > range.max) return false;
    }
    for (const [key, range] of Object.entries(cond.relasjoner || {})) {
      const value = state.relasjoner[key];
      if (typeof value !== "number") throw new Error(`[LifestoryRunner] ukjent relasjon i conditions: "${key}"`);
      if (range.min !== undefined && value < range.min) return false;
      if (range.max !== undefined && value > range.max) return false;
    }
    for (const [threadId, requiredStatus] of Object.entries(cond.threads || {})) {
      const actual = state.threadState[threadId] ? state.threadState[threadId].status : "dormant";
      if (actual !== requiredStatus) return false;
    }
    if (cond.profil) {
      // Profilgatet innhold er bonus: uten snapshot (ren Min dag-flate,
      // Node-tester uten mock, spiller uten History GO-historikk) fyrer
      // scenen ikke. Snapshotet holdes ved like av lifestoryShellBridge
      // (async ProfileSignalBridge -> synkron global).
      const tags = /** @type {any} */ (globalScope).CivicationLifestoryProfileTags;
      if (!Array.isArray(tags) || !tags.length) return false;
      if (!cond.profil.tags.some((t) => tags.indexOf(t) !== -1)) return false;
    }
    return true;
  }

  /**
   * Scener spilleren kan stå i akkurat nå: riktig dag og fase, tråden er
   * spillbar (active/escalated), scenen er ikke spilt, conditions er
   * oppfylt, og den er enten en start-scene eller eksplisitt låst opp av
   * et tidligere valg.
   * @param {any} state
   * @param {any} content
   * @returns {any[]}
   */
  function getCandidateScenes(state, content) {
    return content.scenes.filter((scene) =>
      scene.dag === state.dag &&
      scene.fase === state.fase &&
      isThreadPlayable(state, scene.threadId) &&
      state.spilteScener.indexOf(scene.id) === -1 &&
      (scene.tilgjengelighet === "start" || state.opplaasteScener.indexOf(scene.id) !== -1) &&
      conditionsMet(state, scene)
    );
  }

  /**
   * Beste neste scene: høyest prioritet vinner; lik prioritet avgjøres av
   * rekkefølgen i fortellingspakken (deterministisk, ingen tilfeldighet).
   * @param {any} state
   * @param {any} content
   * @returns {any|null}
   */
  function selectNextScene(state, content) {
    const candidates = getCandidateScenes(state, content);
    if (!candidates.length) return null;
    return candidates.slice().sort((a, b) => (b.prioritet || 0) - (a.prioritet || 0))[0];
  }

  /**
   * Spilleren tar et valg: effekter skrives til Player State, valget
   * arkiveres, nye scener låses opp, scenen markeres spilt, og dagen
   * rykker videre til neste fase når fasen er tom.
   * Ugyldige scene-/valg-id-er er programmeringsfeil => throw (fail fast).
   * @param {any} state
   * @param {any} content
   * @param {string} sceneId
   * @param {string} choiceId
   * @returns {{ state: any, laasteOpp: string[], faseSkifte: boolean, dagFerdig: boolean, konsekvensTekst: string|null }}
   */
  function applyChoice(state, content, sceneId, choiceId) {
    const scene = content.scenes.find((s) => s.id === sceneId);
    if (!scene) throw new Error(`[LifestoryRunner] ukjent scene "${sceneId}"`);
    if (state.spilteScener.indexOf(scene.id) !== -1) {
      throw new Error(`[LifestoryRunner] scenen "${sceneId}" er allerede spilt`);
    }
    const choice = (scene.valg || []).find((c) => c.id === choiceId);
    if (!choice) throw new Error(`[LifestoryRunner] ukjent valg "${choiceId}" i scenen "${sceneId}"`);

    State.applyEffects(state, choice.effekter);

    // Runneren fører trådens spor: siste scene. Steg (step) endres kun
    // eksplisitt via effekter.threads.stepDelta — ingen gjetting.
    const ts = state.threadState[scene.threadId];
    if (ts) ts.lastSceneId = scene.id;

    const laasteOpp = [];
    for (const target of choice.laaserOpp || []) {
      if (state.opplaasteScener.indexOf(target) === -1 && state.spilteScener.indexOf(target) === -1) {
        state.opplaasteScener.push(target);
        laasteOpp.push(target);
      }
    }

    state.spilteScener.push(scene.id);
    const entry = {
      dag: state.dag,
      fase: state.fase,
      sceneId: scene.id,
      sceneTittel: scene.tittel,
      threadId: scene.threadId,
      valgId: choice.id,
      valgTekst: choice.tekst
    };
    if (choice.konsekvensTekst) entry.konsekvensTekst = choice.konsekvensTekst;
    state.arkiv.push(entry);

    const progress = advance(state, content);
    return {
      state,
      laasteOpp,
      faseSkifte: progress.faseSkifte,
      dagFerdig: state.dagFerdig,
      konsekvensTekst: choice.konsekvensTekst || null
    };
  }

  /**
   * Går videre i dagen: hopper over tomme faser til det finnes en scene,
   * eller avslutter dagen når siste fase er tom.
   * @param {any} state
   * @param {any} content
   * @returns {{ faseSkifte: boolean }}
   */
  function advance(state, content) {
    let faseSkifte = false;
    while (!getCandidateScenes(state, content).length) {
      const index = content.faser.findIndex((f) => f.id === state.fase);
      if (index === -1) throw new Error(`[LifestoryRunner] ukjent fase "${state.fase}"`);
      if (index >= content.faser.length - 1) {
        completeDay(state);
        return { faseSkifte };
      }
      state.fase = content.faser[index + 1].id;
      faseSkifte = true;
    }
    return { faseSkifte };
  }

  /**
   * Avslutter dagen (idempotent) og returnerer oppsummeringen.
   * @param {any} state
   * @returns {ReturnType<typeof getDaySummary>}
   */
  function completeDay(state) {
    state.dagFerdig = true;
    return getDaySummary(state);
  }

  /**
   * Starter neste dag: dag+1, første fase, nye dagsnapshot. Tråder hvis
   * startDag nå er nådd og som aldri har fått threadState, aktiveres.
   * Tråder som er completed/dormant/escalated beholder statusen sin —
   * de vekkes bare av eksplisitte threads-effekter, aldri automatisk.
   * Arkiv, tidligere valg og relasjoner beholdes urørt.
   * @param {any} state
   * @param {any} content
   * @returns {any} state
   */
  function startNextDay(state, content) {
    if (!state.dagFerdig) throw new Error("[LifestoryRunner] dagen er ikke ferdig — kan ikke starte neste dag");
    state.dag += 1;
    state.fase = content.faser[0].id;
    state.dagFerdig = false;
    for (const thread of content.threads) {
      const startDag = typeof thread.startDag === "number" ? thread.startDag : 1;
      if (startDag <= state.dag && !state.threadState[thread.id]) {
        state.threadState[thread.id] = { status: "active", step: 0, lastSceneId: null };
      }
    }
    state.dagStartMeters = Object.assign({}, state.meters);
    state.dagStartThreadStatus = State.snapshotThreadStatus(state.threadState);
    // Hopp frem til første fase med innhold; en tom dag avsluttes trygt
    // (dagFerdig igjen) i stedet for å krasje.
    advance(state, content);
    return state;
  }

  /**
   * Oppsummering av dagen: hva spilleren gjorde, hvordan målerne flyttet
   * seg siden morgenen, og hvilke tråder som skiftet status i løpet av
   * dagen. Leser bare state.
   * @param {any} state
   * @returns {{ dag: number, valg: any[], meterEndringer: Record<string, number>, traader: { fullfoert: string[], eskalert: string[], hvilende: string[] } }}
   */
  function getDaySummary(state) {
    /** @type {Record<string, number>} */
    const meterEndringer = {};
    for (const [key, startValue] of Object.entries(state.dagStartMeters || {})) {
      const delta = (state.meters[key] || 0) - startValue;
      if (delta !== 0) meterEndringer[key] = delta;
    }
    /** @type {{ fullfoert: string[], eskalert: string[], hvilende: string[] }} */
    const traader = { fullfoert: [], eskalert: [], hvilende: [] };
    const startStatus = state.dagStartThreadStatus || {};
    for (const [id, ts] of Object.entries(state.threadState || {})) {
      if (ts.status === startStatus[id]) continue;
      if (ts.status === "completed") traader.fullfoert.push(id);
      else if (ts.status === "escalated") traader.eskalert.push(id);
      else if (ts.status === "dormant") traader.hvilende.push(id);
    }
    return {
      dag: state.dag,
      valg: state.arkiv.filter((entry) => entry.dag === state.dag),
      meterEndringer,
      traader
    };
  }

  /**
   * Alt «Min dag»-skjermen trenger, i én lesing: nå-scenen, aktive tråder,
   * det som venter senere i dag, og arkivet. Rent lesende.
   * @param {any} state
   * @param {any} content
   * @returns {{ scene: any|null, fase: any, aktiveTraader: any[], senereIDag: any[], dagsplan: any[], arkiv: any[], dagFerdig: boolean, oppsummering: any|null }}
   */
  function getView(state, content) {
    const fase = content.faser.find((f) => f.id === state.fase) || null;
    const faseIndex = content.faser.findIndex((f) => f.id === state.fase);
    const scene = state.dagFerdig ? null : selectNextScene(state, content);

    const aktiveTraader = Object.entries(state.threadState)
      .filter(([, ts]) => PLAYABLE_THREAD_STATUSES.indexOf(ts.status) !== -1)
      .map(([id, ts]) => {
        const thread = content.threads.find((t) => t.id === id);
        return thread ? Object.assign({}, thread, { status: ts.status, step: ts.step }) : null;
      })
      .filter(Boolean);

    const senereFaser = content.faser.slice(faseIndex + 1).map((f) => f.id);
    const senereIDag = content.scenes.filter((s) =>
      s.dag === state.dag &&
      senereFaser.indexOf(s.fase) !== -1 &&
      s.tilgjengelighet === "start" &&
      isThreadPlayable(state, s.threadId) &&
      state.spilteScener.indexOf(s.id) === -1
    );

    const dagsplan = content.role?.dagsplan?.[String(state.dag)] || [];

    return {
      scene,
      fase,
      aktiveTraader,
      senereIDag,
      dagsplan,
      arkiv: state.arkiv.slice(),
      dagFerdig: !!state.dagFerdig,
      oppsummering: state.dagFerdig ? getDaySummary(state) : null
    };
  }

  const api = {
    conditionsMet,
    isThreadPlayable,
    getCandidateScenes,
    selectNextScene,
    applyChoice,
    advance,
    completeDay,
    startNextDay,
    getDaySummary,
    getView
  };
  /** @type {any} */ (globalScope).CivicationLifestoryRunner = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
