// civicationFriendsEngine.js
// Simulert sosial tilstedeværelse + fasepunkter for Civication-byen.
//
// VIKTIG: Dette er simulert spilltilstedeværelse, ikke ekte geografisk sporing.
// Ingen GPS, ingen live-posisjon. Når en venn er "hjemme" betyr det at vennens
// Civication-avatar er hjemme i spillet.
//
// Datadrevet: alt kommer fra data/Civication/map/phaseLocations.json og
// data/Civication/map/friends.json. Simuleringen er deterministisk – samme
// data + samme fase gir alltid samme tilstand, slik at testing er forutsigbar.
(function () {
  "use strict";

  if (window.CivicationFriendsEngine) return;

  const LOCATIONS_PATH = "data/Civication/map/phaseLocations.json";
  const FRIENDS_PATH = "data/Civication/map/friends.json";

  const DAY_PHASES = ["morning", "lunch", "afternoon", "evening", "day_end"];

  // Tilstander som aldri vises som figur på kartet.
  const HIDDEN_STATES = new Set(["unavailable", "offline_simulated"]);

  // Kort status-tekst pr. presence-state (norsk, brukervendt).
  const PRESENCE_TEXT = {
    walking_in_city: "Går rundt i byen",
    at_home: "Er hjemme",
    at_work: "Er på jobb",
    travelling: "På vei",
    training: "Trener",
    in_event: "På et arrangement",
    visiting_player: "Er innom deg",
    unavailable: "Opptatt",
    offline_simulated: "Utilgjengelig"
  };

  let _locationsCache = null;
  let _friendsCache = null;

  // ---------------------------------------------------------------------------
  // Små rene hjelpere
  // ---------------------------------------------------------------------------
  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function normalizePhase(phase) {
    const p = norm(phase).toLowerCase();
    return DAY_PHASES.includes(p) ? p : "morning";
  }

  // Deterministisk hash (FNV-1a-aktig). Brukes kun som fallback når en venn
  // mangler eksplisitt presenceByPhase for en fase – aldri tilfeldig.
  function hashString(str) {
    let h = 2166136261;
    const s = String(str || "");
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function presenceText(state) {
    return PRESENCE_TEXT[norm(state)] || "Ute i byen";
  }

  function isHiddenState(state) {
    return HIDDEN_STATES.has(norm(state));
  }

  // ---------------------------------------------------------------------------
  // Presence-resolver (ren, deterministisk)
  // ---------------------------------------------------------------------------
  // Returnerer { state, locationId, activity, visibleOnMap } for en venn i en
  // gitt fase. Bruker eksplisitt presenceByPhase når den finnes, ellers en
  // deterministisk fallback basert på vennens hjem og en hash.
  function computePresence(friend, phase, dayIndex) {
    const ph = normalizePhase(phase);
    const byPhase = friend && friend.presenceByPhase && typeof friend.presenceByPhase === "object"
      ? friend.presenceByPhase
      : {};

    let entry = byPhase[ph];

    if (!entry || typeof entry !== "object") {
      entry = deterministicFallback(friend, ph, dayIndex);
    }

    const state = norm(entry.state) || "at_home";
    const homeId = norm(friend && friend.avatar && friend.avatar.homeId) || null;
    const locationId = norm(entry.locationId) || homeId;

    let visibleOnMap;
    if (typeof entry.visibleOnMap === "boolean") {
      visibleOnMap = entry.visibleOnMap;
    } else {
      visibleOnMap = !isHiddenState(state);
    }
    // Skjulte tilstander overstyrer alltid – ingen figur på kartet.
    if (isHiddenState(state)) visibleOnMap = false;

    return {
      state,
      locationId,
      activity: norm(entry.activity),
      visibleOnMap,
      statusText: presenceText(state)
    };
  }

  // Forutsigbar fallback: velger en tilstand ut fra fase + en hash av id-en.
  // Ingen Math.random – samme input gir samme output.
  function deterministicFallback(friend, phase, dayIndex) {
    const homeId = norm(friend && friend.avatar && friend.avatar.homeId) || null;
    const seed = hashString(`${friend && friend.id}:${phase}:${Number(dayIndex || 1)}`);

    if (phase === "morning" || phase === "day_end") {
      return { state: "at_home", locationId: homeId, activity: "hjemme" };
    }
    if (phase === "lunch") {
      return { state: "at_work", locationId: homeId, activity: "i arbeid" };
    }
    // afternoon / evening: enten ute i byen eller hjemme, deterministisk valgt.
    return (seed % 2 === 0)
      ? { state: "walking_in_city", locationId: homeId, activity: "ute i byen" }
      : { state: "at_home", locationId: homeId, activity: "hjemme" };
  }

  // ---------------------------------------------------------------------------
  // Liste-/oppslags-hjelpere (rene)
  // ---------------------------------------------------------------------------
  function locationById(locations, id) {
    const key = norm(id);
    if (!key) return null;
    return (Array.isArray(locations) ? locations : []).find((loc) => norm(loc && loc.id) === key) || null;
  }

  function activeLocations(locations, phase) {
    const ph = normalizePhase(phase);
    return (Array.isArray(locations) ? locations : []).filter((loc) => {
      const phases = Array.isArray(loc && loc.activePhases) ? loc.activePhases.map(norm) : [];
      // Ingen activePhases = alltid aktiv.
      return phases.length === 0 || phases.includes(ph);
    });
  }

  function isLocationActive(location, phase) {
    const phases = Array.isArray(location && location.activePhases) ? location.activePhases.map(norm) : [];
    return phases.length === 0 || phases.includes(normalizePhase(phase));
  }

  // Vennene med beregnet presence for en fase.
  function friendsForPhase(friends, phase, dayIndex) {
    return (Array.isArray(friends) ? friends : []).map((friend) => ({
      friend,
      presence: computePresence(friend, phase, dayIndex)
    }));
  }

  // Vennene som befinner seg på et gitt sted i en fase (kun synlige).
  function friendsAtLocation(friends, locationId, phase, dayIndex) {
    const key = norm(locationId);
    if (!key) return [];
    return friendsForPhase(friends, phase, dayIndex)
      .filter((row) => row.presence.visibleOnMap && norm(row.presence.locationId) === key);
  }

  // ---------------------------------------------------------------------------
  // Runtime-kontekst (fase/dag fra kalenderen)
  // ---------------------------------------------------------------------------
  function getCurrentPhase() {
    return normalizePhase(window.CivicationCalendar?.getPhase?.() || "morning");
  }

  function getDayIndex() {
    const clock = window.CivicationCalendar?.getClock?.() || {};
    return Number(clock.dayIndex || 1);
  }

  // ---------------------------------------------------------------------------
  // Async lasting (cachet)
  // ---------------------------------------------------------------------------
  async function fetchJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return res.json();
  }

  async function loadLocations() {
    if (Array.isArray(_locationsCache)) return _locationsCache;
    try {
      const json = await fetchJson(LOCATIONS_PATH);
      _locationsCache = Array.isArray(json && json.phaseLocations) ? json.phaseLocations : [];
    } catch (e) {
      console.warn("[CivicationFriendsEngine] kunne ikke laste phaseLocations:", (e && e.message) || e);
      _locationsCache = [];
    }
    return _locationsCache;
  }

  async function loadFriends() {
    if (Array.isArray(_friendsCache)) return _friendsCache;
    try {
      const json = await fetchJson(FRIENDS_PATH);
      _friendsCache = Array.isArray(json && json.friends) ? json.friends : [];
    } catch (e) {
      console.warn("[CivicationFriendsEngine] kunne ikke laste friends:", (e && e.message) || e);
      _friendsCache = [];
    }
    return _friendsCache;
  }

  async function loadData() {
    const [locations, friends] = await Promise.all([loadLocations(), loadFriends()]);
    return { locations, friends };
  }

  // Bekvemmelighet for UI: full kartmodell for nåværende fase.
  async function getCityModel() {
    const { locations, friends } = await loadData();
    const phase = getCurrentPhase();
    const dayIndex = getDayIndex();
    return {
      phase,
      dayIndex,
      locations,
      friends: friendsForPhase(friends, phase, dayIndex),
      activeLocationIds: activeLocations(locations, phase).map((l) => norm(l.id))
    };
  }

  window.CivicationFriendsEngine = {
    // konstanter
    DAY_PHASES: DAY_PHASES.slice(),
    PRESENCE_TEXT: { ...PRESENCE_TEXT },
    // rene hjelpere (testbare uten fetch/DOM)
    normalizePhase,
    presenceText,
    isHiddenState,
    computePresence,
    locationById,
    activeLocations,
    isLocationActive,
    friendsForPhase,
    friendsAtLocation,
    // runtime-kontekst
    getCurrentPhase,
    getDayIndex,
    // async
    loadData,
    loadLocations,
    loadFriends,
    getCityModel
  };
})();
