// boot.js
// Ren orchestrator: definerer boot(), men starter ikke appen selv.
// app.js skal være eneste entry på index-siden.

async function boot() {
  if (window.CoreEngine) CoreEngine.init();
  if (window.HGEngine) HGEngine.init();

  // Migrer gammel quiz_history inn i hg_learning_log_v1 (én-gangs).
  try { window.HGLearningLog?.migrateLegacy?.(); } catch {}

  /* ==============================
     BASE PATH (GitHub Pages safe)
  ============================== */

  const REPO_NAME = "History-Go";
  const isGitHubPages = location.hostname.includes("github.io");
  const BASE = isGitHubPages ? `/${REPO_NAME}/` : "/";

  const fetchJSON = async (url) => {
    try {
      const res = await fetch(BASE + url, { cache: "no-store" });

      if (!res.ok) {
        console.error("404:", BASE + url);
        return null;
      }

      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error("JSON parse error:", BASE + url);
        return null;
      }
    } catch (e) {
      console.error("Fetch error:", BASE + url, e);
      return null;
    }
  };

  const mergeWonderkammerData = (...sources) => {
    const out = {
      places: [],
      people: []
    };

    const placeMap = Object.create(null);
    const personMap = Object.create(null);

    const mergeRows = (rows, map, target, idKeys) => {
      for (const row of (Array.isArray(rows) ? rows : [])) {
        const id = String(idKeys.map(key => row?.[key]).find(Boolean) || "").trim();
        if (!id) continue;

        if (!map[id]) {
          map[id] = {
            ...row,
            chambers: []
          };
          target.push(map[id]);
        }

        const chambers = Array.isArray(row?.chambers) ? row.chambers : [];
        map[id].chambers.push(...chambers);
      }
    };

    for (const source of sources) {
      if (!source) continue;

      if (Array.isArray(source.places) || Array.isArray(source.people)) {
        mergeRows(source.places, placeMap, out.places, ["place_id", "place"]);
        mergeRows(source.people, personMap, out.people, ["person_id", "person"]);
        continue;
      }

      const placeId = String(source.place_id || source.place || "").trim();
      const personId = String(source.person_id || source.person || "").trim();
      const chambers = Array.isArray(source.chambers) ? source.chambers : [];

      if (placeId) {
        mergeRows([{ place_id: placeId, chambers }], placeMap, out.places, ["place_id", "place"]);
      }

      if (personId) {
        mergeRows([{ person_id: personId, chambers }], personMap, out.people, ["person_id", "person"]);
      }
    }

    return out.places.length || out.people.length ? out : null;
  };

  const loadWonderkammerManifest = async () => {
    const fallbackFiles = [
      "data/wonderkammer/base.json",
      "data/wonderkammer/urban_culture.json",
      "data/wonderkammer/playgrounds.json",
      "data/wonderkammer/training.json",
      "data/wonderkammer/art.json",
      "data/wonderkammer/street_art.json",
      "data/wonderkammer/architecture.json",
      "data/wonderkammer/parks_nature.json"
    ];

    const manifest = await fetchJSON("data/wonderkammer/index.json");
    const files = Array.isArray(manifest?.files) && manifest.files.length
      ? manifest.files
      : fallbackFiles;

    const sources = [];
    for (const url of files) {
      const data = await fetchJSON(url);
      if (data) sources.push(data);
    }

    return mergeWonderkammerData(...sources);
  };

  /* ==============================
     OPEN MODE
  ============================== */

  window.OPEN_MODE = localStorage.getItem("HG_OPEN_MODE") === "1";
  window.TEST_MODE = window.OPEN_MODE;

  const openEl = document.getElementById("openToggle");
  if (openEl) {
    openEl.checked = window.OPEN_MODE;

    openEl.addEventListener("change", () => {
      window.OPEN_MODE = !!openEl.checked;
      window.TEST_MODE = window.OPEN_MODE;
      localStorage.setItem("HG_OPEN_MODE", window.OPEN_MODE ? "1" : "0");
    });
  }

  const btnUA = document.getElementById("btnUnlockAll");
  if (btnUA) btnUA.style.display = window.OPEN_MODE ? "inline-flex" : "none";

  /* ==============================
     ENV
  ============================== */

  window.HG_ENV = {
    geo: "unknown",
    openMode: !!window.OPEN_MODE
  };

  /* ==============================
     MAP INIT
  ============================== */

  if (typeof START !== "undefined") {
    window.START = START;
  }

  const map = window.HGMap?.initMap({
    containerId: "map",
    start: window.START
  });

  if (map) {
    window.MAP = map;
  }

  /* ==============================
     LAST BASISDATA
  ============================== */

  const PLACE_FILES = [
    "data/places/places_by.json",
    "data/places/places_historie.json",
    "data/places/places_kunst.json",
    "data/places/places_litteratur.json",
    "data/places/places_musikk.json",
    "data/places/places_naeringsliv.json",
    "data/places/places_natur.json",
    "data/places/places_politikk.json",
    "data/places/places_sport.json",
    "data/places/places_subkultur.json",
    "data/places/places_vitenskap.json"
  ];

  let places = [];

  for (const url of PLACE_FILES) {
    const data = await fetchJSON(url);
    if (Array.isArray(data)) {
      places.push(...data);
    } else if (Array.isArray(data?.places)) {
      places.push(...data.places);
    }
  }

  const relations = (await fetchJSON("data/relations.json")) || [];
  const wonderkammer = await loadWonderkammerManifest();
  const tags = await fetchJSON("data/tags.json");

  /* ==============================
     LAST PEOPLE (multi-file)
  ============================== */

  const PEOPLE_FILE_LIST = [
    "data/people/people_by.json",
    "data/people/people_historie.json",
    "data/people/people_kunst.json",
    "data/people/people_litteratur.json",
    "data/people/people_musikk.json",
    "data/people/people_naeringsliv.json",
    "data/people/people_natur.json",
    "data/people/people_politikk.json",
    "data/people/people_sport.json",
    "data/people/people_subkultur.json",
    "data/people/people_vitenskap.json"
  ];

  let peopleAll = [];

  for (const url of PEOPLE_FILE_LIST) {
    const data = await fetchJSON(url);

    if (Array.isArray(data)) {
      peopleAll.push(...data);
    } else if (Array.isArray(data?.people)) {
      peopleAll.push(...data.people);
    }
  }

  /* ==============================
     RUNTIME GLOBALS
  ============================== */

  window.PLACES = places;
  window.PEOPLE = peopleAll;
  window.RELATIONS = relations;
  window.TAGS = tags || [];

  /* ==============================
     RELATION INDEX
  ============================== */

  window.REL_BY_PLACE = Object.create(null);
  window.REL_BY_PERSON = Object.create(null);

  for (const r of window.RELATIONS) {
    const place = String(r.place || r.place_id || "").trim();
    const person = String(r.person || r.person_id || "").trim();

    if (place) (window.REL_BY_PLACE[place] ||= []).push(r);
    if (person) (window.REL_BY_PERSON[person] ||= []).push(r);
  }

  /* ==============================
     WONDERKAMMER
  ============================== */

  window.WONDERKAMMER = wonderkammer || null;

  window.WK_BY_PLACE = Object.create(null);
  window.WK_BY_PERSON = Object.create(null);

  if (window.WONDERKAMMER) {
    if (
      Array.isArray(window.WONDERKAMMER.places) ||
      Array.isArray(window.WONDERKAMMER.people)
    ) {
      const wkPlaces = window.WONDERKAMMER.places || [];
      const wkPeople = window.WONDERKAMMER.people || [];

      for (const row of wkPlaces) {
        const id = row.place || row.place_id;
        if (id) window.WK_BY_PLACE[id] = row.chambers || [];
      }

      for (const row of wkPeople) {
        const id = row.person || row.person_id;
        if (id) window.WK_BY_PERSON[id] = row.chambers || [];
      }
    } else {
      const placeId = window.WONDERKAMMER.place || window.WONDERKAMMER.place_id;
      const personId = window.WONDERKAMMER.person || window.WONDERKAMMER.person_id;

      if (placeId) window.WK_BY_PLACE[placeId] = window.WONDERKAMMER.chambers || [];
      if (personId) window.WK_BY_PERSON[personId] = window.WONDERKAMMER.chambers || [];
    }
  }

  /* ==============================
     MAP DATA
  ============================== */

  if (window.HGMap) {
  if (typeof window.catColor === "function") {
    HGMap.setCatColor(window.catColor);
  }

  if (typeof window.visited !== "undefined") {
    HGMap.setVisited(window.visited);
  }

  HGMap.setPlaces(window.PLACES);

  HGMap.setOnPlaceClick((id) => {
    const p = window.PLACES.find((x) => x.id === id);
    if (p) openPlaceCard(p);
  });

  HGMap.refreshMarkers();
}

  /* ==============================
     INIT
  ============================== */

  if (window.DataHub?.loadNature) {
    try {
      await window.DataHub.loadNature();
    } catch (e) {
      console.error("[DataHub.loadNature]", e);
    }
  }

  if (window.HGStories?.init) {
    try {
      await window.HGStories.init();
    } catch (e) {
      console.error("[HGStories.init]", e);
    }
  }

  if (window.HGEvents?.init) {
    try {
      await window.HGEvents.init();
    } catch (e) {
      console.error("[HGEvents.init]", e);
    }
  }

  if (window.HGBrands?.init) {
    try {
      await window.HGBrands.init();
    } catch (e) {
      console.error("[HGBrands.init]", e);
    }
  }

  if (window.QuizEngine) {
    // Wrappere late-binder til window.* så funksjoner definert senere
    // (showRewardPerson, saveVisitedFromQuiz osv.) alltid plukkes opp
    // ved kall-tid, ikke ved init-tid.
    const bind = (fn) => (typeof fn === "function") ? fn : undefined;
    const lazy = (name) => (...args) => {
      const f = window[name];
      if (typeof f === "function") return f(...args);
    };

    QuizEngine.init({
      getPersonById: (id) => (window.PEOPLE || []).find((p) => p.id === id),
      getPlaceById: (id) => (window.PLACES || []).find((p) => p.id === id),
      getVisited: () => (window.visited || {}),
      isTestMode: () => !!window.OPEN_MODE,
      showToast,

      // --- Reward-modaler (definert i popup-utils.js) ---
      showRewardPerson: lazy("showRewardPerson"),
      showRewardPlace: lazy("showRewardPlace"),

      // --- Popups (for "åpne etter unlock"-scenarier) ---
      showPersonPopup: lazy("showPersonPopup"),
      showPlacePopup: lazy("showPlacePopup"),

      // --- Persistens etter unlock ---
      savePeopleCollected: lazy("savePeopleCollected"),
      saveVisitedFromQuiz: lazy("saveVisitedFromQuiz"),

      // --- Progresjon (merits + jobb-tilbud) ---
      addCompletedQuizAndMaybePoint: lazy("addCompletedQuizAndMaybePoint"),

      // --- Innsikt (HGInsights) — blir konsumert i profil-chips ---
      logCorrectQuizAnswer: bind(window.HGInsights?.logCorrectQuizAnswer?.bind(window.HGInsights)),
    });
  }

  if (typeof ensureBadgesLoaded === "function") {
    await ensureBadgesLoaded();
  }

  if (typeof wire === "function") wire();
  if (typeof renderCollection === "function") renderCollection();
  if (typeof renderGallery === "function") renderGallery();

  if (typeof initPlaceCardCollapse === "function") {
    initPlaceCardCollapse();
  }

  if (window.ViewportManager) {
    ViewportManager.init();
  }

  if (window.LayerManager) {
    LayerManager.init();
  }

  if (window.bottomSheetController?.init) {
    window.bottomSheetController.init();
  }
}
