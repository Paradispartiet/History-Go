// boot.js

async function boot() {

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

  const openEl = document.getElementById("openToggle");
  if (openEl) openEl.checked = window.OPEN_MODE;

  const btnUA = document.getElementById("btnUnlockAll");
  if (btnUA) btnUA.style.display = window.OPEN_MODE ? "inline-flex" : "none";

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

  const places        = await fetchJSON("data/places.json")        || [];
  const relations     = await fetchJSON("data/relations.json")     || [];
  const wonderkammer  = await fetchJSON("data/wonderkammer.json");
  const tags          = await fetchJSON("data/tags.json");

  /* ==============================
     LAST PEOPLE (multi-file)
  ============================== */

  let peopleAll = [];

  if (typeof PEOPLE_FILES === "object") {
    for (const [domain, url] of Object.entries(PEOPLE_FILES)) {
      const data = await fetchJSON(url);
      if (Array.isArray(data)) {
        peopleAll.push(...data.map(p => ({ ...p, __source: domain })));
      }
    }
  }

  /* ==============================
     RUNTIME GLOBALS
  ============================== */

  window.PLACES = places;
  window.PEOPLE = peopleAll;
  window.RELATIONS = relations;

  /* ==============================
     RELATION INDEX
  ============================== */

  window.REL_BY_PLACE = Object.create(null);
  window.REL_BY_PERSON = Object.create(null);

  for (const r of window.RELATIONS) {
    const place = String(r.place || "").trim();
    const person = String(r.person || "").trim();

    if (place)  (window.REL_BY_PLACE[place]  ||= []).push(r);
    if (person) (window.REL_BY_PERSON[person] ||= []).push(r);
  }

  /* ==============================
     WONDERKAMMER
  ============================== */

  window.WONDERKAMMER = wonderkammer || null;

  window.WK_BY_PLACE = Object.create(null);
  window.WK_BY_PERSON = Object.create(null);

  if (window.WONDERKAMMER) {
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
  }

  /* ==============================
     MAP DATA
  ============================== */

  if (window.HGMap) {
  HGMap.setPlaces(window.PLACES);

  if (typeof window.visited !== "undefined") {
    HGMap.setVisited(window.visited);
  }

  if (typeof window.catColor !== "undefined") {
    HGMap.setCatColor(window.catColor);
  }

  HGMap.setOnPlaceClick((id) => {
    const p = window.PLACES.find(x => x.id === id);
    if (p) openPlaceCard(p);
  });

  HGMap.setDataReady(true);
  HGMap.maybeDrawMarkers();
}

  /* ==============================
     INIT
  ============================== */

  if (typeof loadNature === "function") {
    try { await loadNature(); } catch (e) { console.error(e); }
  }

if (window.QuizEngine) {
  QuizEngine.init({
    getPersonById: id => (window.PEOPLE || []).find(p => p.id === id),
    getPlaceById:  id => (window.PLACES || []).find(p => p.id === id),
    getVisited: () => (window.visited || {}),
    isTestMode: () => !!window.OPEN_MODE,
    showToast
  });
}

  if (typeof ensureBadgesLoaded === "function") {
    await ensureBadgesLoaded();
  }

  if (typeof wire === "function") wire();
  if (typeof requestLocation === "function") requestLocation();
  if (typeof renderCollection === "function") renderCollection();
  if (typeof renderGallery === "function") renderGallery();

}

boot();
