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

  /**
   * Scener spilleren kan stå i akkurat nå: riktig dag og fase, tråden er
   * aktiv, scenen er ikke spilt, og den er enten en start-scene eller
   * eksplisitt låst opp av et tidligere valg.
   * @param {any} state
   * @param {any} content
   * @returns {any[]}
   */
  function getCandidateScenes(state, content) {
    return content.scenes.filter((scene) =>
      scene.dag === state.dag &&
      scene.fase === state.fase &&
      state.aktiveTraader.indexOf(scene.threadId) !== -1 &&
      state.spilteScener.indexOf(scene.id) === -1 &&
      (scene.tilgjengelighet === "start" || state.opplaasteScener.indexOf(scene.id) !== -1)
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
   * @returns {{ state: any, laasteOpp: string[], faseSkifte: boolean, dagFerdig: boolean }}
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

    const laasteOpp = [];
    for (const target of choice.laaserOpp || []) {
      if (state.opplaasteScener.indexOf(target) === -1 && state.spilteScener.indexOf(target) === -1) {
        state.opplaasteScener.push(target);
        laasteOpp.push(target);
      }
    }

    state.spilteScener.push(scene.id);
    state.arkiv.push({
      dag: state.dag,
      fase: state.fase,
      sceneId: scene.id,
      sceneTittel: scene.tittel,
      threadId: scene.threadId,
      valgId: choice.id,
      valgTekst: choice.tekst
    });

    const progress = advance(state, content);
    return { state, laasteOpp, faseSkifte: progress.faseSkifte, dagFerdig: state.dagFerdig };
  }

  /**
   * Går videre i dagen: hopper over tomme faser til det finnes en scene,
   * eller markerer dagen som ferdig når siste fase er tom.
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
        state.dagFerdig = true;
        return { faseSkifte };
      }
      state.fase = content.faser[index + 1].id;
      faseSkifte = true;
    }
    return { faseSkifte };
  }

  /**
   * Oppsummering av dagen: hva spilleren gjorde og hvordan målerne flyttet
   * seg siden morgenen. Brukes av kveldsvisningen — leser bare state.
   * @param {any} state
   * @returns {{ dag: number, valg: any[], meterEndringer: Record<string, number> }}
   */
  function getDaySummary(state) {
    /** @type {Record<string, number>} */
    const meterEndringer = {};
    for (const [key, startValue] of Object.entries(state.dagStartMeters || {})) {
      const delta = (state.meters[key] || 0) - startValue;
      if (delta !== 0) meterEndringer[key] = delta;
    }
    return {
      dag: state.dag,
      valg: state.arkiv.filter((entry) => entry.dag === state.dag),
      meterEndringer
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

    const aktiveTraader = state.aktiveTraader
      .map((id) => content.threads.find((t) => t.id === id))
      .filter(Boolean);

    const senereFaser = content.faser.slice(faseIndex + 1).map((f) => f.id);
    const senereIDag = content.scenes.filter((s) =>
      s.dag === state.dag &&
      senereFaser.indexOf(s.fase) !== -1 &&
      s.tilgjengelighet === "start" &&
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

  const api = { getCandidateScenes, selectNextScene, applyChoice, advance, getDaySummary, getView };
  /** @type {any} */ (globalScope).CivicationLifestoryRunner = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
