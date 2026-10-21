// js/Civication/lifestory/lifestoryState.js
//
// Civication Life Story System — Player State.
// Spillets hukommelse: hvem spilleren er akkurat nå. All progresjon i
// livsfortellingen skrives HIT (og bare hit) via applyEffects; UI leser og
// viser. DOM-fri, fetch-fri, testbar rett i Node.
//
// Lagring: én versjonert nøkkel med aktiv rolle og inaktive rollesnapshots
// (ingen parallell sannhetskilde) via CivicationStorageAdapter
// når den finnes, ellers localStorage direkte. I Node (tester) er lagring
// no-op — state sendes eksplisitt rundt.

(function (globalScope) {
  "use strict";

  const STORAGE_KEY = "civication_lifestory_v1";
  const VERSION = 2; // v2: threadState + dagStartThreadStatus erstatter aktiveTraader

  /** Målere som klemmes til 0–100. Penger er bevisst uklemt (gjeld finnes). */
  const CLAMPED_METERS = ["psyke", "energi", "integritet", "synlighet", "handlingsrom"];

  /** Gyldige trådstatuser — speiler THREAD_STATUSES i lifestoryContent. */
  const THREAD_STATUSES = ["active", "completed", "dormant", "escalated"];

  /**
   * @typedef {Object} LifestoryThreadState
   * @property {"active"|"completed"|"dormant"|"escalated"} status
   * @property {number} step
   * @property {string|null} lastSceneId
   *
   * @typedef {Object} LifestoryArkivEntry
   * @property {number} dag
   * @property {string} fase
   * @property {string} sceneId
   * @property {string} sceneTittel
   * @property {string} threadId
   * @property {string} valgId
   * @property {string} valgTekst
   * @property {string} [konsekvensTekst]
   *
   * @typedef {Object} LifestoryState
   * @property {number} version
   * @property {string} rolle
   * @property {number} dag
   * @property {number} [livsdag] Felles fortellingsdag; eldre v2-saves mangler feltet
   * @property {number} [kalenderDag] Siste Civication-kalenderdag som Life Story har fulgt
   * @property {any} [privatHistorie] Felles C01/C05-arkiv med flagg, tidsankre og relasjoner\n   * @property {Record<string, any>} [rolleTilstander] Snapshots av inaktive roller
   * @property {Array<{fra: string, til: string, livsdag: number, fraDag: number, tilDag: number}>} [rolleBytter]
   * @property {string} fase
   * @property {Record<string, number>} meters
   * @property {Record<string, number>} relasjoner
   * @property {Record<string, LifestoryThreadState>} threadState
   * @property {string[]} opplaasteScener
   * @property {string[]} spilteScener
   * @property {Record<string, boolean|number|string>} tidligereValg
   * @property {LifestoryArkivEntry[]} arkiv
   * @property {Record<string, number>} dagStartMeters
   * @property {Record<string, string>} dagStartThreadStatus
   * @property {boolean} dagFerdig
   */

  /**
   * Ny Player State fra en validert innholdspakke: rollens startState,
   * dag 1, første fase. Tråder som starter dag 1 blir aktive; tråder med
   * senere startDag får IKKE threadState før dagen deres kommer
   * (startNextDay i runneren aktiverer dem) — slik forveksles de aldri
   * med tråder spilleren/historien har lagt i dvale (dormant).
   * @param {any} content
   * @returns {LifestoryState}
   */

  // C01 og C05 er privatliv, ikke eiendeler til den siste arbeidsgiveren.
  // Hele rolletilstanden forblir separat; bare disse to historienes konkrete
  // fakta, scenevalg og arkiv følger spilleren ved jobbbytte.
  // Shared personal trajectories survive employment changes in the existing
  // private-history snapshot; neither job role owns these actions.
  const PRIVATE_FLAG = /^(?:wa_(?:[bcde]_)?c0[15]_|life21_)/;
  const PRIVATE_SCENE = /^(?:wave_[abcde]_c0[15]_|wave_e_life21_)/;
  function emptyPrivateStory() { return { flagg: {}, flaggDager: {}, spilteScener: [], arkiv: [], relasjoner: {} }; }
  function capturePrivateStory(state) {
    const story = emptyPrivateStory();
    const merge = source => {
      if (!source) return;
      const previous = source.privatHistorie || {};
      Object.assign(story.flagg, previous.flagg || {});
      Object.assign(story.flaggDager, previous.flaggDager || {});
      Object.assign(story.relasjoner, previous.relasjoner || {});
      for (const id of previous.spilteScener || []) if (PRIVATE_SCENE.test(id) && !story.spilteScener.includes(id)) story.spilteScener.push(id);
      for (const e of previous.arkiv || []) if (PRIVATE_SCENE.test(e.sceneId || "") && !story.arkiv.some(x => x.sceneId === e.sceneId)) story.arkiv.push(e);
      for (const [key,value] of Object.entries(source.tidligereValg || {})) if (PRIVATE_FLAG.test(key)) story.flagg[key] = value;
      for (const id of source.spilteScener || []) if (PRIVATE_SCENE.test(id) && !story.spilteScener.includes(id)) story.spilteScener.push(id);
      for (const e of source.arkiv || []) {
        if (!PRIVATE_SCENE.test(e.sceneId || "")) continue;
        if (!story.arkiv.some(x => x.sceneId === e.sceneId)) story.arkiv.push(e);
        // En lagret, faktisk Wave D-hendelse er et tidsanker. Ikke utled
        // dato fra et flagg uten den tilhørende hendelsen.
        const match = /^wave_d_(c0[15])_/.exec(e.sceneId);
        if (match && Number.isInteger(e.livsdag || e.dag)) story.flaggDager["wa_d_" + match[1] + "_status"] = e.livsdag || e.dag;
      }
      for (const key of ["venn","familie"]) {
        if (typeof source.relasjoner?.[key] === "number") story.relasjoner[key] = source.relasjoner[key];
      }
    };
    // Historiske snapshots først, felles minne deretter, aktivt liv sist.
    for (const snap of Object.values(state.rolleTilstander || {})) merge(snap);
    merge({ privatHistorie: state.privatHistorie });
    merge(state);
    state.privatHistorie = story;
    return story;
  }
  function hydratePrivateStory(state, story) {
    state.privatHistorie = JSON.parse(JSON.stringify(story));
    state.tidligereValg ||= {};
    state.spilteScener ||= [];
    state.arkiv ||= [];
    state.relasjoner ||= {};
    Object.assign(state.tidligereValg, story.flagg);
    Object.assign(state.relasjoner, story.relasjoner);
    for (const id of story.spilteScener) if (!state.spilteScener.includes(id)) state.spilteScener.push(id);
    for (const e of story.arkiv) if (!state.arkiv.some(x => x.sceneId === e.sceneId)) state.arkiv.push(JSON.parse(JSON.stringify(e)));
    return state;
  }

  function createInitialState(content) {
    if (!content?.role?.startState) {
      throw new Error("[LifestoryState] innholdspakken mangler role.startState");
    }
    const meters = Object.assign({}, content.role.startState.meters);
    /** @type {Record<string, LifestoryThreadState>} */
    const threadState = {};
    for (const thread of content.threads) {
      const startDag = typeof thread.startDag === "number" ? thread.startDag : 1;
      if (startDag <= 1 && thread.startVedValg !== true) threadState[thread.id] = { status: "active", step: 0, lastSceneId: null };
    }
    const state = {
      version: VERSION,
      rolle: String(content.role.id),
      dag: 1,
      // Fortellingsdager på tvers av rollene; ikke shell-kalenderen (A2).
      livsdag: 1,
      rolleTilstander: {},
      rolleBytter: [],
      fase: content.faser[0].id,
      meters,
      relasjoner: Object.assign({}, content.role.startState.relasjoner),
      threadState,
      opplaasteScener: [],
      spilteScener: [],
      tidligereValg: {},
      arkiv: [],
      dagStartMeters: Object.assign({}, meters),
      dagStartThreadStatus: snapshotThreadStatus(threadState),
      dagFerdig: false
    };
    return state;
  }

  /**
   * Behold alle rolleerfaringer ved ordinært jobbbytte. Aktiv rolle ligger
   * fortsatt på toppnivå for kompatibilitet med eksisterende saves og UI;
   * inaktive roller har komplette, uavhengige snapshots i samme lagringsnøkkel.
   * Historisk dag/arkiv/relasjoner fortsetter der de slapp ved retur til en
   * rolle. `livsdag` følger spilleren, mens `dag` følger fortellingspakken.
   * @param {LifestoryState|null} saved
   * @param {any} content
   * @returns {LifestoryState}
   */
  function selectRole(saved, content) {
    const roleId = String(content?.role?.id || "");
    if (!roleId) throw new Error("[LifestoryState] mangler rolle-id");
    if (!saved) return createInitialState(content);

    // Eksisterende v2-saves (uten rollehistorikk) oppgraderes på stedet.
    saved.livsdag = Number.isInteger(saved.livsdag) && saved.livsdag > 0 ? saved.livsdag : saved.dag;
    saved.rolleTilstander ||= {};
    saved.rolleBytter ||= [];
    const hasPrivateStory = !!saved.privatHistorie
      || (saved.arkiv || []).some(e => PRIVATE_SCENE.test(e.sceneId || ""))
      || Object.keys(saved.tidligereValg || {}).some(key => PRIVATE_FLAG.test(key));
    const privateStory = hasPrivateStory ? capturePrivateStory(saved) : null;
    if (saved.rolle === roleId) return privateStory ? hydratePrivateStory(saved, privateStory) : saved;

    const inactive = Object.assign({}, saved.rolleTilstander);
    const currentSnapshot = JSON.parse(JSON.stringify(saved));
    delete currentSnapshot.rolleTilstander;
    delete currentSnapshot.rolleBytter;
    delete currentSnapshot.livsdag;
    delete currentSnapshot.kalenderDag;
    inactive[saved.rolle] = currentSnapshot;

    const earlier = inactive[roleId];
    if (earlier && (earlier.version !== VERSION || earlier.rolle !== roleId)) {
      throw new Error("[LifestoryState] ugyldig lagret rolle: " + roleId);
    }
    const selected = earlier || createInitialState(content);
    // Energi, psykisk overskudd og personlig integritet tilhører spilleren,
    // ikke arbeidsplassen. Et jobbskifte er ingen gratis helbredelse.
    // Arbeidsspesifikk synlighet og handlingsrom forblir rollens egne data.
    selected.meters ||= {};
    selected.dagStartMeters ||= {};
    for (const meter of ["energi", "psyke", "integritet"]) {
      if (!Number.isFinite(saved.meters?.[meter])) continue;
      selected.meters[meter] = clamp(saved.meters[meter]);
      // The first day-summary in a new job must not count a prior job's
      // accumulated fatigue as if it happened after this role was adopted.
      selected.dagStartMeters[meter] = selected.meters[meter];
    }
    delete inactive[roleId];
    selected.rolleTilstander = inactive;
    if (privateStory) hydratePrivateStory(selected, privateStory);
    selected.livsdag = saved.livsdag;
    // Kalendertilknytningen tilhører spilleren, ikke jobbrollens arkiv.
    if (Number.isInteger(saved.kalenderDag) && saved.kalenderDag > 0) selected.kalenderDag = saved.kalenderDag;
    selected.rolleBytter = saved.rolleBytter.concat([{
      fra: saved.rolle, til: roleId, livsdag: selected.livsdag,
      fraDag: saved.dag, tilDag: selected.dag
    }]);
    return selected;
  }

  /**
   * @param {Record<string, LifestoryThreadState>} threadState
   * @returns {Record<string, string>}
   */
  function snapshotThreadStatus(threadState) {
    /** @type {Record<string, string>} */
    const snapshot = {};
    for (const [id, ts] of Object.entries(threadState)) snapshot[id] = ts.status;
    return snapshot;
  }

  /**
   * Skriver et valgs effekter inn i Player State (muterer og returnerer
   * state). Ukjente nøkler er innholdsfeil og skal ha blitt stoppet av
   * validatoren — her feiler vi fast i stedet for å gjette.
   * @param {LifestoryState} state
   * @param {{ relasjoner?: Record<string, number>, meters?: Record<string, number>, flagg?: Record<string, boolean|number|string>, threads?: Record<string, { status?: string, stepDelta?: number }> }} effekter
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
    for (const [threadId, change] of Object.entries(effekter.threads || {})) {
      if (!change || typeof change !== "object") throw new Error(`[LifestoryState] ugyldig threads-effekt for "${threadId}"`);
      let ts = state.threadState[threadId];
      if (!ts) {
        // Tråd som ennå ikke har startet kan vekkes/endres av et valg.
        ts = { status: "dormant", step: 0, lastSceneId: null };
        state.threadState[threadId] = ts;
      }
      if (change.status !== undefined) {
        if (THREAD_STATUSES.indexOf(change.status) === -1) {
          throw new Error(`[LifestoryState] ugyldig trådstatus "${change.status}" for "${threadId}"`);
        }
        ts.status = /** @type {"active"|"completed"|"dormant"|"escalated"} */ (change.status);
      }
      if (typeof change.stepDelta === "number") ts.step += change.stepDelta;
    }
    for (const [key, value] of Object.entries(effekter.flagg || {})) {
      state.tidligereValg[key] = value;
      if (PRIVATE_FLAG.test(key)) {
        state.privatHistorie ||= emptyPrivateStory();
        state.privatHistorie.flagg[key] = value;
        state.privatHistorie.flaggDager[key] = state.livsdag || state.dag;
      }
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

  /** Nye personer/tråder i en innholdspakke må kunne nå en eksisterende save.
   * Bevarer valg, arkiv, dag og alle eksisterende relasjoner/trådstatuser.
   * Ingen tidligere hendelse opprettes eller spilles på nytt.
   * @param {any} state @param {any} content @returns {any}
   */
  function reconcileContent(state, content) {
    if (!state || state.rolle !== content.role.id) return state;
    for (const [id, value] of Object.entries(content.role.startState.relasjoner || {})) {
      if (!(id in state.relasjoner)) state.relasjoner[id] = value;
    }
    for (const thread of content.threads) {
      if ((thread.startDag || 1) <= state.dag && thread.startVedValg !== true && !state.threadState[thread.id]) {
        state.threadState[thread.id] = { status: "active", step: 0, lastSceneId: null };
      }
    }
    // Reconciliation of an already selected role must never rewrite an
    // established save, including the original Wave A–D timeline.
    // Migration/rehydration happens at the explicit selectRole boundary,
    // and choices update privatHistorie as they are actually played.
    return state;
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

  /** A story type owns its relationship; a collected History Go person can
   * represent it. Bind once, including a type-only fallback after an encounter.
   * Canonical identity is snapshotted so later collection/index changes cannot
   * recast somebody the player has already met. No History Go state is written.
   * @param {any} state @param {any} content @param {any} bridge
   */
  function bindPersonTypes(state, content, bridge) {
    const cast = state.personRepresentanter || {};
    for (const person of content.role.personer || []) {
      if (!person.persontype || cast[person.id]) continue;
      // An old save must never retroactively attribute fictional acts to a
      // newly collected real person. New archive entries carry their own cast.
      const encountered = (state.spilteScener || []).some(id => {
        const scene = content.scenes.find(s => s.id === id);
        const entry = state.arkiv.find(e => e.sceneId === id);
        const choice = scene?.valg?.find(c => c.id === entry?.valgId);
        return scene && sceneMentionsPerson(scene, person, choice);
      });
      const candidates = encountered ? [] : bridge?.getCollectedByIds?.(person.persontype.representanter) || [];
      const selected = candidates.slice().sort((a, b) => a.id.localeCompare(b.id))[0];
      if (selected) {
        cast[person.id] = { typeId: person.persontype.id, personId: selected.id, navn: selected.name,
          placeId: selected.placeId || null, beskrivelse: selected.desc || "" };
      } else if (encountered) {
        cast[person.id] = { typeId: person.persontype.id, personId: null, navn: person.navn, placeId: null, beskrivelse: "" };
      }
    }
    if (Object.keys(cast).length) state.personRepresentanter = cast;
    return state;
  }

  /** @param {any} scene @param {any} person @param {any} [choice] @returns {boolean} */
  function sceneMentionsPerson(scene, person, choice) {
    return scene.avsender === person.id || JSON.stringify([scene.tittel, scene.tekst, choice?.tekst, choice?.konsekvensTekst]).toLowerCase().includes(person.navn.toLowerCase());
  }

  /** Snapshot the types actually present in this scene before archiving it.
   * @param {any} state @param {any} content @param {any} scene @param {any} choice @returns {any}
   */
  function lockScenePeople(state, content, scene, choice) {
    const cast = {};
    for (const person of content.role.personer || []) {
      if (!person.persontype || !sceneMentionsPerson(scene, person, choice)) continue;
      state.personRepresentanter ||= {};
      state.personRepresentanter[person.id] ||= { typeId: person.persontype.id, personId: null,
        navn: person.navn, placeId: null, beskrivelse: "" };
      cast[person.id] = Object.assign({}, state.personRepresentanter[person.id]);
    }
    return cast;
  }

  /** Resolve authored type names, never legacy archive names or technical IDs.
   * @param {any} state @param {any} content @param {any} value @returns {string}
   */
  function presentText(state, content, value) {
    let text = String(value == null ? "" : value);
    for (const person of content?.role?.personer || []) {
      const cast = state?.personRepresentanter?.[person.id];
      if (!person.persontype || !cast?.personId) continue;
      const escaped = person.navn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Norwegian type names contain letters outside ASCII \b, so delimit
      // explicitly. Replace possessives before the plain name.
      const possessive = /[sxz]$/i.test(cast.navn) ? cast.navn + "’" : cast.navn + "s";
      text = text.replace(new RegExp("(^|[^\\p{L}])" + escaped + "s(?=$|[^\\p{L}])", "giu"), (_, prefix) => prefix + possessive)
        .replace(new RegExp("(^|[^\\p{L}])" + escaped + "(?=$|[^\\p{L}])", "giu"), (_, prefix) => prefix + cast.navn);
    }
    return text;
  }

  const api = { STORAGE_KEY, VERSION, CLAMPED_METERS, THREAD_STATUSES, createInitialState, selectRole, reconcileContent, applyEffects, capturePrivateStory, hydratePrivateStory, snapshotThreadStatus, save, load, reset, bindPersonTypes, lockScenePeople, presentText, sceneMentionsPerson };
  /** @type {any} */ (globalScope).CivicationLifestoryState = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
