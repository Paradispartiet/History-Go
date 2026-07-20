// js/Civication/lifestory/lifestoryEndings.js
//
// Uka kåres en slutt. Når det ikke finnes flere dager med innhold, tolkes
// hele spillet — akkurat som progresjon ellers i History GO tolkes fra
// evidens, aldri skrives direkte. Hver ending i rollepakken har `kriterier`
// (målere, flagg, relasjoner, trådstatuser); den best matchende vinner.
//
// Scoringen er bevisst enkel og deterministisk (ingen tilfeldighet, ingen
// gjetting): hvert oppfylte kriterium gir en fast vekt, høyest total vinner,
// likt avgjøres av rekkefølgen i endings-lista. Scorer ingen ending over 0,
// faller vi tilbake på den eksplisitt merkede `standard`-endingen.
//
// DOM-fri og dual-eksportert som resten av lifestory-kjernen.

(function (globalScope) {
  "use strict";

  /** Vekt per kriterietype. Flagg (konkrete valg) veier mest, relasjon minst. */
  const WEIGHTS = { meters: 2, flagg: 3, relasjoner: 1, traader: 2 };

  /**
   * @param {{ min?: number, max?: number }} range
   * @param {number} value
   * @returns {boolean}
   */
  function inRange(range, value) {
    if (range.min !== undefined && value < range.min) return false;
    if (range.max !== undefined && value > range.max) return false;
    return true;
  }

  /**
   * Poeng for én ending mot sluttilstanden, og hvor mange flagg-kriterier
   * (ekte valg) som traff. En ending må ha minst ett flagg-treff for å bli
   * kåret — ellers kunne start-målere alene (f.eks. lav synlighet fra start)
   * kåre en slutt uten at spilleren har valgt noe.
   * @param {any} ending @param {any} state
   * @returns {{ score: number, flagHits: number }}
   */
  function scoreEnding(ending, state) {
    const k = ending && ending.kriterier ? ending.kriterier : {};
    let score = 0;
    let flagHits = 0;
    for (const [key, range] of Object.entries(k.meters || {})) {
      if (inRange(range, Number(state.meters[key] || 0))) score += WEIGHTS.meters;
    }
    for (const flag of Object.keys(k.flagg || {})) {
      if (state.tidligereValg[flag] === true) { score += WEIGHTS.flagg; flagHits++; }
    }
    for (const [rel, range] of Object.entries(k.relasjoner || {})) {
      if (inRange(range, Number(state.relasjoner[rel] || 0))) score += WEIGHTS.relasjoner;
    }
    for (const [threadId, status] of Object.entries(k.traader || {})) {
      const ts = state.threadState[threadId];
      if ((ts ? ts.status : "dormant") === status) score += WEIGHTS.traader;
    }
    return { score, flagHits };
  }

  /**
   * Er dette den siste dagen med innhold? (Ingen scene finnes for en senere
   * dag.) Da skal uka kåres en slutt i stedet for å tilby «Start neste dag».
   * @param {any} state @param {any} content
   * @returns {boolean}
   */
  function isFinalDay(state, content) {
    return !content.scenes.some((s) => s.dag > state.dag);
  }

  /**
   * Kår en ending fra sluttilstanden. Høyest score vinner; scorer ingen over
   * 0, brukes standard-endingen.
   * @param {any} state @param {any} content
   * @returns {{ id: string, navn: string, tekst?: string, score: number, standard: boolean }|null}
   */
  function resolveEnding(state, content) {
    const endings = (content.role && Array.isArray(content.role.endings)) ? content.role.endings : [];
    if (!endings.length) return null;

    // Kun endinger med minst ett flagg-treff (et ekte valg) kan kåres.
    let best = null;
    for (const e of endings) {
      const { score, flagHits } = scoreEnding(e, state);
      if (flagHits > 0 && (!best || score > best.score)) best = { ending: e, score };
    }
    if (best) {
      return { id: best.ending.id, navn: best.ending.navn, tekst: best.ending.tekst, score: best.score, standard: false };
    }
    const std = endings.find((e) => e.standard) || endings[0];
    return { id: std.id, navn: std.navn, tekst: std.tekst, score: 0, standard: true };
  }

  const api = { WEIGHTS, scoreEnding, isFinalDay, resolveEnding };
  /** @type {any} */ (globalScope).CivicationLifestoryEndings = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
