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
  const SNAPSHOTS_PATH = "data/Civication/map/friendPhaseSnapshots.json";
  const PLAYER_SNAPSHOTS_KEY = "civi.playerPhaseSnapshots.v1";

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
    reflecting: "Reflekterer",
    unavailable: "Opptatt",
    offline_simulated: "Utilgjengelig"
  };

  // ---------------------------------------------------------------------------
  // Fase-minne (phase snapshots)
  // ---------------------------------------------------------------------------
  // Civication har semantiske livsfaser (morgen, arbeid, fritid, kveld,
  // refleksjon) som kartet bruker for å vise hver venns SISTE LAGREDE status i
  // nettopp den fasen spilleren selv er i. Dette er fase-minne, ikke live-status.
  const SNAPSHOT_PHASES = ["morning", "work", "leisure", "evening", "reflection"];

  // Kalenderens dagfaser -> semantisk Civication-fase brukt av fase-minnet.
  // Deterministisk oppslag, ingen klokkeslett-logikk på toppen av spillfasen.
  const DAY_PHASE_TO_SNAPSHOT = {
    morning: "morning",
    lunch: "work",
    afternoon: "leisure",
    evening: "evening",
    day_end: "evening"
  };

  // Semantisk fase -> representativ dagfase, brukt KUN som trygg fallback mot
  // friends.json presenceByPhase når et snapshot mangler for den aktive fasen.
  const SNAPSHOT_TO_DAY_PHASE = {
    morning: "morning",
    work: "lunch",
    leisure: "afternoon",
    evening: "evening",
    reflection: "day_end"
  };

  const SNAPSHOT_PHASE_LABEL = {
    morning: "Morgenfase",
    work: "Arbeidsfase",
    leisure: "Fritidsfase",
    evening: "Kveldsfase",
    reflection: "Refleksjonsfase"
  };

  // Brukervendt "sist sett"-tekst pr. fase (gjør det tydelig at dette er minne).
  const SNAPSHOT_LAST_SEEN_TEXT = {
    morning: "Sist sett i morgenfasen",
    work: "Siste arbeidsfase",
    leisure: "Siste fritidsfase",
    evening: "Siste kveldsfase",
    reflection: "Siste refleksjonsfase"
  };

  let _locationsCache = null;
  let _friendsCache = null;
  let _snapshotsCache = null;

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

  // Normaliser til en gyldig semantisk fase-minne-fase. Godtar både semantiske
  // faser (morning/work/leisure/evening/reflection) og kalenderens dagfaser
  // (som mappes via DAY_PHASE_TO_SNAPSHOT).
  function normalizeSnapshotPhase(phase) {
    const p = norm(phase).toLowerCase();
    if (SNAPSHOT_PHASES.includes(p)) return p;
    if (DAY_PHASE_TO_SNAPSHOT[p]) return DAY_PHASE_TO_SNAPSHOT[p];
    return "morning";
  }

  function snapshotPhaseLabel(phase) {
    return SNAPSHOT_PHASE_LABEL[normalizeSnapshotPhase(phase)] || "Morgenfase";
  }

  function snapshotLastSeenText(phase) {
    return SNAPSHOT_LAST_SEEN_TEXT[normalizeSnapshotPhase(phase)] || "Sist sett";
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
  // Fase-minne-resolver (ren, deterministisk)
  // ---------------------------------------------------------------------------
  // Slår opp et venne-snapshot for en gitt semantisk fase i en snapshots-array
  // (formen til friendPhaseSnapshots.json). Returnerer rå snapshot-objekt eller
  // null. Ren funksjon – ingen fetch, ingen cache.
  function snapshotEntryFor(snapshots, friendId, phase) {
    const fid = norm(friendId);
    const ph = normalizeSnapshotPhase(phase);
    if (!fid) return null;
    const list = Array.isArray(snapshots) ? snapshots : [];
    const record = list.find((r) => norm(r && r.friendId) === fid);
    if (!record || !record.snapshots || typeof record.snapshots !== "object") return null;
    const entry = record.snapshots[ph];
    return entry && typeof entry === "object" ? entry : null;
  }

  // Bygger et presence-objekt ut fra et rått snapshot. Beholder samme form som
  // computePresence, men legger til fase-minne-felt (mood, source, isSnapshot …).
  function presenceFromSnapshot(friend, phase, entry) {
    const ph = normalizeSnapshotPhase(phase);
    const state = norm(entry.state) || "at_home";
    const homeId = norm(friend && friend.avatar && friend.avatar.homeId) || null;
    const locationId = norm(entry.locationId) || homeId;

    let visibleOnMap;
    if (typeof entry.visibleOnMap === "boolean") {
      visibleOnMap = entry.visibleOnMap;
    } else {
      visibleOnMap = !isHiddenState(state);
    }
    if (isHiddenState(state)) visibleOnMap = false;

    return {
      state,
      locationId,
      activity: norm(entry.activity),
      mood: norm(entry.mood),
      visibleOnMap,
      statusText: presenceText(state),
      source: "snapshot",
      isSnapshot: true,
      phase: ph,
      snapshotPhaseLabel: snapshotPhaseLabel(ph),
      lastSeenText: snapshotLastSeenText(ph),
      updatedAtLabel: norm(entry.updatedAtLabel)
    };
  }

  // Avgjør hvilken status kartet skal vise for en venn i den aktive fasen.
  // Prioritet:
  //   1) Snapshot for fasen (fase-minne) – vinner alltid hvis det finnes.
  //   2) Trygg fallback: friends.json presenceByPhase for tilsvarende dagfase.
  //   3) Ingen fasehistorikk -> skjult (visibleOnMap=false, source="none").
  // Ren og deterministisk: samme (friend, phase, snapshots) gir samme resultat.
  function resolveFriendMapPresence(friend, phase, snapshots, dayIndex) {
    const ph = normalizeSnapshotPhase(phase);
    const entry = snapshotEntryFor(snapshots, friend && friend.id, ph);
    if (entry) {
      return presenceFromSnapshot(friend, ph, entry);
    }

    // Fallback til eksisterende presence hvis vennen har den dagfasen.
    const dayPhase = SNAPSHOT_TO_DAY_PHASE[ph] || "morning";
    const byPhase = friend && friend.presenceByPhase && typeof friend.presenceByPhase === "object"
      ? friend.presenceByPhase
      : {};
    if (byPhase[dayPhase] && typeof byPhase[dayPhase] === "object") {
      const fallback = computePresence(friend, dayPhase, dayIndex);
      return {
        ...fallback,
        mood: "",
        source: "presence_fallback",
        isSnapshot: false,
        phase: ph,
        snapshotPhaseLabel: snapshotPhaseLabel(ph),
        lastSeenText: snapshotLastSeenText(ph),
        updatedAtLabel: ""
      };
    }

    // Verken snapshot eller fallback: skjul vennen trygt.
    return {
      state: "no_history",
      locationId: null,
      activity: "",
      mood: "",
      visibleOnMap: false,
      statusText: "Ingen fasehistorikk ennå",
      source: "none",
      isSnapshot: false,
      phase: ph,
      snapshotPhaseLabel: snapshotPhaseLabel(ph),
      lastSeenText: snapshotLastSeenText(ph),
      updatedAtLabel: ""
    };
  }

  // Vennene med resolvet fase-minne-presence for en semantisk fase.
  function friendSnapshotRows(friends, phase, snapshots, dayIndex) {
    return (Array.isArray(friends) ? friends : []).map((friend) => ({
      friend,
      presence: resolveFriendMapPresence(friend, phase, snapshots, dayIndex)
    }));
  }

  // ---------------------------------------------------------------------------
  // Runtime-kontekst (fase/dag fra kalenderen)
  // ---------------------------------------------------------------------------
  function getCurrentPhase() {
    return normalizePhase(window.CivicationCalendar?.getPhase?.() || "morning");
  }

  // Hvilken semantisk Civication-fase er spilleren i nå? Mapper kalenderens
  // dagfase til fase-minne-fasen. Kan overstyres med et eksplisitt argument
  // (f.eks. når refleksjon/psykologirommet er åpent).
  function getActivePhase(dayPhaseArg) {
    const dayPhase = dayPhaseArg != null ? normalizePhase(dayPhaseArg) : getCurrentPhase();
    return DAY_PHASE_TO_SNAPSHOT[dayPhase] || "morning";
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

  async function loadSnapshots() {
    if (Array.isArray(_snapshotsCache)) return _snapshotsCache;
    try {
      const json = await fetchJson(SNAPSHOTS_PATH);
      _snapshotsCache = Array.isArray(json && json.friendPhaseSnapshots) ? json.friendPhaseSnapshots : [];
    } catch (e) {
      // Fase-minne er valgfritt – uten fil faller motoren tilbake til presence.
      console.warn("[CivicationFriendsEngine] kunne ikke laste friendPhaseSnapshots:", (e && e.message) || e);
      _snapshotsCache = [];
    }
    return _snapshotsCache;
  }

  async function loadData() {
    const [locations, friends, snapshots] = await Promise.all([
      loadLocations(),
      loadFriends(),
      loadSnapshots()
    ]);
    return { locations, friends, snapshots };
  }

  // ---------------------------------------------------------------------------
  // Runtime-bekvemmelighet for fase-minne (bruker cache, men kan ta eksplisitt
  // data som siste argument – nyttig for testing uten fetch).
  // ---------------------------------------------------------------------------
  function getFriendSnapshotForPhase(friendId, phase, snapshotsArg) {
    const snapshots = Array.isArray(snapshotsArg) ? snapshotsArg : (_snapshotsCache || []);
    return snapshotEntryFor(snapshots, friendId, phase);
  }

  function getVisibleFriendSnapshotsForPhase(phase, friendsArg, snapshotsArg, dayIndex) {
    const friends = Array.isArray(friendsArg) ? friendsArg : (_friendsCache || []);
    const snapshots = Array.isArray(snapshotsArg) ? snapshotsArg : (_snapshotsCache || []);
    return friendSnapshotRows(friends, phase, snapshots, dayIndex)
      .filter((row) => row.presence && row.presence.visibleOnMap);
  }

  function getFriendsAtLocationForPhase(locationId, phase, friendsArg, snapshotsArg, dayIndex) {
    const key = norm(locationId);
    if (!key) return [];
    return getVisibleFriendSnapshotsForPhase(phase, friendsArg, snapshotsArg, dayIndex)
      .filter((row) => norm(row.presence.locationId) === key);
  }

  // ---------------------------------------------------------------------------
  // Lokalt spiller-fase-minne (player phase snapshots)
  // ---------------------------------------------------------------------------
  // Når spilleren spiller en fase (morgen/arbeid/fritid/kveld/refleksjon) lagrer
  // vi spillerens EGEN siste status for nettopp den fasen – på samme form som
  // venners fase-minne (friendPhaseSnapshots.json). Dette er grunnlaget for at
  // spilleren senere kan etterlate sin siste fase i byen for venner.
  //
  // Ingen backend/nettverk her: lagres i minne, speiles til localStorage hvis
  // tilgjengelig. Ingen GPS / live-posisjon / tidsstempel – kun deterministisk
  // fase-minne slik at testing er forutsigbar.

  // Deterministiske standardverdier pr. semantisk fase. Brukes når spilleren er
  // i en fase uten at et eksplisitt sted/aktivitet er oppgitt. locationId peker
  // til ekte steder i phaseLocations.json. channel speiler hvilken kanal/type
  // fasen tilhører (job/private/leisure/reflection), kompatibelt med kartdata.
  const PLAYER_PHASE_DEFAULTS = {
    morning: {
      state: "at_home",
      locationId: "home",
      activity: "starter dagen hjemme",
      mood: "rolig",
      updatedAtLabel: "sist morgenrunde",
      channel: "private"
    },
    work: {
      state: "at_work",
      locationId: "workplace",
      activity: "jobber med dagens oppgaver",
      mood: "fokusert",
      updatedAtLabel: "sist arbeidsrunde",
      channel: "job"
    },
    leisure: {
      state: "walking_in_city",
      locationId: "park",
      activity: "tar en pause ute i byen",
      mood: "avslappet",
      updatedAtLabel: "sist fritidsrunde",
      channel: "leisure"
    },
    evening: {
      state: "at_home",
      locationId: "home",
      activity: "roer ned hjemme",
      mood: "rolig",
      updatedAtLabel: "sist kveldsrunde",
      channel: "private"
    },
    reflection: {
      state: "reflecting",
      locationId: "psychology_room",
      activity: "reflekterer over dagen",
      mood: "ettertenksom",
      updatedAtLabel: "sist refleksjonsrunde",
      channel: "reflection"
    }
  };

  let _playerPhaseSnapshots = null;

  function loadPlayerPhaseSnapshots() {
    if (_playerPhaseSnapshots) return _playerPhaseSnapshots;
    _playerPhaseSnapshots = {};
    try {
      const raw = window.localStorage && window.localStorage.getItem(PLAYER_SNAPSHOTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") _playerPhaseSnapshots = parsed;
      }
    } catch (_e) {
      // localStorage utilgjengelig (privat modus/test) – hold alt i minne.
    }
    return _playerPhaseSnapshots;
  }

  function persistPlayerPhaseSnapshots(store) {
    try {
      window.localStorage && window.localStorage.setItem(PLAYER_SNAPSHOTS_KEY, JSON.stringify(store));
    } catch (_e) {
      // Ignorer skrivefeil – minnet er fortsatt oppdatert.
    }
  }

  // Ren normalisering til ett player phase snapshot. Samme felt-form som
  // friend-snapshot (phase, state, locationId, activity, mood, updatedAtLabel,
  // visibleOnMap) pluss channel/type. Ingen tidsstempel/GPS-felt.
  function normalizePlayerSnapshot(phase, snapshot) {
    const ph = normalizeSnapshotPhase(phase);
    const s = snapshot && typeof snapshot === "object" ? snapshot : {};
    const state = norm(s.state) || "at_home";
    let visibleOnMap = typeof s.visibleOnMap === "boolean" ? s.visibleOnMap : true;
    if (isHiddenState(state)) visibleOnMap = false;
    return {
      phase: ph,
      state,
      locationId: norm(s.locationId) || null,
      activity: norm(s.activity),
      mood: norm(s.mood),
      updatedAtLabel: norm(s.updatedAtLabel),
      visibleOnMap,
      channel: norm(s.channel)
    };
  }

  // Bygger et player phase snapshot ut fra aktiv fase + spillerens nåværende
  // tilstand. currentState kan overstyre sted/aktivitet/stemning/kanal; det som
  // mangler fylles deterministisk fra PLAYER_PHASE_DEFAULTS. Ren funksjon.
  function buildPlayerSnapshotFromCurrentState(phase, currentState) {
    const ph = normalizeSnapshotPhase(phase);
    const def = PLAYER_PHASE_DEFAULTS[ph] || PLAYER_PHASE_DEFAULTS.morning;
    const cs = currentState && typeof currentState === "object" ? currentState : {};
    return normalizePlayerSnapshot(ph, {
      state: norm(cs.state) || def.state,
      locationId: norm(cs.locationId) || def.locationId,
      activity: norm(cs.activity) || def.activity,
      mood: norm(cs.mood) || def.mood,
      updatedAtLabel: norm(cs.updatedAtLabel) || def.updatedAtLabel,
      channel: norm(cs.channel) || def.channel,
      visibleOnMap: typeof cs.visibleOnMap === "boolean" ? cs.visibleOnMap : true
    });
  }

  function getPlayerPhaseSnapshots() {
    return { ...loadPlayerPhaseSnapshots() };
  }

  function getPlayerSnapshotForPhase(phase) {
    const store = loadPlayerPhaseSnapshots();
    return store[normalizeSnapshotPhase(phase)] || null;
  }

  // Lagrer ett snapshot for én fase – overskriver KUN den fasen, ikke de andre.
  function savePlayerSnapshotForPhase(phase, snapshot) {
    const ph = normalizeSnapshotPhase(phase);
    const store = loadPlayerPhaseSnapshots();
    store[ph] = normalizePlayerSnapshot(ph, snapshot);
    persistPlayerPhaseSnapshots(store);
    return store[ph];
  }

  // Bygger og lagrer spillerens snapshot for den fasen den selv er i nå. Kalles
  // av UI når spilleren bytter fase eller bruker et sted/fullfører en fasehandling.
  function capturePlayerPhaseSnapshot(currentState, phaseArg) {
    const phase = phaseArg != null ? normalizeSnapshotPhase(phaseArg) : getActivePhase();
    return savePlayerSnapshotForPhase(phase, buildPlayerSnapshotFromCurrentState(phase, currentState));
  }

  function clearPlayerPhaseSnapshotsForTesting() {
    _playerPhaseSnapshots = {};
    try {
      window.localStorage && window.localStorage.removeItem(PLAYER_SNAPSHOTS_KEY);
    } catch (_e) {
      // Ignorer – minnet er allerede nullstilt.
    }
    return {};
  }

  // Bakoverkompatible aliaser (scaffold-navn fra PR #1181).
  const getPlayerPhaseSnapshot = getPlayerSnapshotForPhase;
  const setPlayerPhaseSnapshot = savePlayerSnapshotForPhase;

  // Bekvemmelighet for UI: full kartmodell for nåværende fase. Vennelaget bruker
  // fase-minne (snapshot for aktiv semantisk fase), med trygg fallback til
  // presence. Steder bruker fortsatt dagfasen for aktiv/rolig-markering.
  async function getCityModel() {
    const { locations, friends, snapshots } = await loadData();
    const dayPhase = getCurrentPhase();
    const snapshotPhase = getActivePhase(dayPhase);
    const dayIndex = getDayIndex();
    return {
      phase: dayPhase,
      snapshotPhase,
      snapshotPhaseLabel: snapshotPhaseLabel(snapshotPhase),
      dayIndex,
      locations,
      snapshots,
      friends: friendSnapshotRows(friends, snapshotPhase, snapshots, dayIndex),
      activeLocationIds: activeLocations(locations, dayPhase).map((l) => norm(l.id))
    };
  }

  window.CivicationFriendsEngine = {
    // konstanter
    DAY_PHASES: DAY_PHASES.slice(),
    SNAPSHOT_PHASES: SNAPSHOT_PHASES.slice(),
    PRESENCE_TEXT: { ...PRESENCE_TEXT },
    SNAPSHOT_PHASE_LABEL: { ...SNAPSHOT_PHASE_LABEL },
    SNAPSHOT_LAST_SEEN_TEXT: { ...SNAPSHOT_LAST_SEEN_TEXT },
    DAY_PHASE_TO_SNAPSHOT: { ...DAY_PHASE_TO_SNAPSHOT },
    SNAPSHOT_TO_DAY_PHASE: { ...SNAPSHOT_TO_DAY_PHASE },
    // rene hjelpere (testbare uten fetch/DOM)
    normalizePhase,
    normalizeSnapshotPhase,
    snapshotPhaseLabel,
    snapshotLastSeenText,
    presenceText,
    isHiddenState,
    computePresence,
    locationById,
    activeLocations,
    isLocationActive,
    friendsForPhase,
    friendsAtLocation,
    // fase-minne (rene, deterministiske)
    snapshotEntryFor,
    resolveFriendMapPresence,
    friendSnapshotRows,
    // runtime-kontekst
    getCurrentPhase,
    getActivePhase,
    getDayIndex,
    // fase-minne runtime
    getFriendSnapshotForPhase,
    getVisibleFriendSnapshotsForPhase,
    getFriendsAtLocationForPhase,
    // lokalt spiller-fase-minne (grunnlag for framtidig synk til venner)
    PLAYER_PHASE_DEFAULTS: { ...PLAYER_PHASE_DEFAULTS },
    buildPlayerSnapshotFromCurrentState,
    getPlayerPhaseSnapshots,
    getPlayerSnapshotForPhase,
    savePlayerSnapshotForPhase,
    capturePlayerPhaseSnapshot,
    clearPlayerPhaseSnapshotsForTesting,
    // bakoverkompatible aliaser
    getPlayerPhaseSnapshot,
    setPlayerPhaseSnapshot,
    // async
    loadData,
    loadLocations,
    loadFriends,
    loadSnapshots,
    getCityModel
  };
})();
