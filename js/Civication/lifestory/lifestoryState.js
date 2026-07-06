// js/Civication/lifestory/lifestoryState.js
//
// Civication Life Story System — Player State.
// Spillets hukommelse: hvem spilleren er akkurat nå. All progresjon i
// livsfortellingen skrives HIT (og bare hit) via applyEffects; UI leser og
// viser. DOM-fri, fetch-fri, testbar rett i Node.
//
// Lagring: én versjonert nøkkel i localStorage via CivicationStorageAdapter
// når den finnes, ellers localStorage direkte. I Node (tester) er lagring
// no-op — state sendes eksplisitt rundt.

(function (globalScope) {
  "use strict";

  const STORAGE_KEY = "civication_lifestory_v1";
  const VERSION = 1;

  /** Målere som klemmes til 0–100. Penger er bevisst uklemt (gjeld finnes). */
  const CLAMPED_METERS = ["psyke", "energi", "integritet", "synlighet", "handlingsrom"];

  /**
   * @typedef {Object} LifestoryArkivEntry
   * @property {number} dag
   * @property {string} fase
   * @property {string} sceneId
   * @property {string} sceneTittel
   * @property {string} threadId
   * @property {string} valgId
   * @property {string} valgTekst
   *
   * @typedef {Object} LifestoryState
   * @property {number} version
   * @property {string} rolle
   * @property {number} dag
   * @property {string} fase
   * @property {Record<string, number>} meters
   * @property {Record<string, number>} relasjoner
   * @property {string[]} aktiveTraader
   * @property {string[]} opplaasteScener
   * @property {string[]} spilteScener
   * @property {Record<string, boolean|number|string>} tidligereValg
   * @property {LifestoryArkivEntry[]} arkiv
   * @property {Record<string, number>} dagStartMeters
   * @property {boolean} dagFerdig
   */

  /**
   * Ny Player State fra en validert innholdspakke: rollens startState,
   * dag 1, første fase, tråder som starter dag 1 aktive.
   * @param {any} content
   * @returns {LifestoryState}
   */
  function createInitialState(content) {
    if (!content?.role?.startState) {
      throw new Error("[LifestoryState] innholdspakken mangler role.startState");
    }
    const meters = Object.assign({}, content.role.startState.meters);
    const state = {
      version: VERSION,
      rolle: String(content.role.id),
      dag: 1,
      fase: content.faser[0].id,
      meters,
      relasjoner: Object.assign({}, content.role.startState.relasjoner),
      aktiveTraader: content.threads
        .filter((t) => (typeof t.startDag === "number" ? t.startDag : 1) <= 1)
        .map((t) => t.id),
      opplaasteScener: [],
      spilteScener: [],
      tidligereValg: {},
      arkiv: [],
      dagStartMeters: Object.assign({}, meters),
      dagFerdig: false
    };
    return state;
  }

  /**
   * Skriver et valgs effekter inn i Player State (muterer og returnerer
   * state). Ukjente nøkler er innholdsfeil og skal ha blitt stoppet av
   * validatoren — her feiler vi fast i stedet for å gjette.
   * @param {LifestoryState} state
   * @param {{ relasjoner?: Record<string, number>, meters?: Record<string, number>, flagg?: Record<string, boolean|number|string> }} effekter
   * @returns {LifestoryState}
   */
  function applyEffects(state, effekter) {
    if (!effekter || typeof effekter !== "object") return state;

    for (const [key, delta] of Object.entries(effekter.meters || {})) {
      if (!(key in state.meters)) throw new Error(`[LifestoryState] ukjent måler "${key}"`);
      const next = state.meters[key] + delta;
      state.meters[key] = CLAMPED_METERS.indexOf(key) !== -1 ? clamp(next) : next;
    }
    for (const [key, delta] of Object.entries(effekter.relasjoner || {})) {
      if (!(key in state.relasjoner)) throw new Error(`[LifestoryState] ukjent relasjon "${key}"`);
      state.relasjoner[key] = clamp(state.relasjoner[key] + delta);
    }
    for (const [key, value] of Object.entries(effekter.flagg || {})) {
      state.tidligereValg[key] = value;
    }
    return state;
  }

  /**
   * @param {number} value
   * @returns {number}
   */
  function clamp(value) {
    return Math.max(0, Math.min(100, value));
  }

  /** @returns {any} */
  function getStorage() {
    const g = /** @type {any} */ (globalScope);
    if (g.CivicationStorageAdapter?.readJson) return g.CivicationStorageAdapter;
    if (typeof g.localStorage !== "undefined") {
      return {
        readJson(key, fallback) {
          try {
            const raw = g.localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
          } catch {
            return fallback;
          }
        },
        writeJson(key, value) {
          try {
            g.localStorage.setItem(key, JSON.stringify(value));
          } catch {
            /* full/blokkert lagring skal ikke stoppe spillet */
          }
        },
        remove(key) {
          try { g.localStorage.removeItem(key); } catch { /* som over */ }
        }
      };
    }
    return null; // Node/tester: ingen persistens
  }

  /**
   * @param {LifestoryState} state
   */
  function save(state) {
    getStorage()?.writeJson(STORAGE_KEY, state);
  }

  /** @returns {LifestoryState|null} */
  function load() {
    const stored = getStorage()?.readJson(STORAGE_KEY, null);
    if (!stored || stored.version !== VERSION) return null;
    return stored;
  }

  function reset() {
    getStorage()?.remove(STORAGE_KEY);
  }

  const api = { STORAGE_KEY, VERSION, CLAMPED_METERS, createInitialState, applyEffects, save, load, reset };
  /** @type {any} */ (globalScope).CivicationLifestoryState = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
