// boot.js
// Ren orchestrator: definerer boot(), men starter ikke appen selv.
// app.js skal være eneste entry på index-siden.

async function boot() {
  if (window.CoreEngine) CoreEngine.init();
  if (window.HGEngine) HGEngine.init();

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
  const wonderkammer = await fetchJSON("data/wonderkammer.json");
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
    QuizEngine.init({
      getPersonById: (id) => (window.PEOPLE || []).find((p) => p.id === id),
      getPlaceById: (id) => (window.PLACES || []).find((p) => p.id === id),
      getVisited: () => (window.visited || {}),
      isTestMode: () => !!window.OPEN_MODE,
      showToast
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
