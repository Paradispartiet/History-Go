// js/boot-fast.js
// Lett app-shell boot for index.html.
// Denne fila erstatter ikke boot.js; den legger på bootCritical/bootBackground
// slik at index kan bli brukbar før alle tunge data er ferdig lastet.

(function () {
  "use strict";

  if (window.bootCritical && window.bootBackground) return;

  const REPO_NAME = "History-Go";
  const isGitHubPages = location.hostname.includes("github.io");
  const BASE = isGitHubPages ? `/${REPO_NAME}/` : "/";

  const PLACE_FILES_FALLBACK = [
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

  const RELATION_FILE_LIST = [
    "data/relations.json",
    "data/relations_philanthropy.json"
  ];

  const WONDERKAMMER_FALLBACK_FILES = [
    "data/wonderkammer/base.json",
    "data/wonderkammer/urban_culture.json",
    "data/wonderkammer/playgrounds.json",
    "data/wonderkammer/training.json",
    "data/wonderkammer/art.json",
    "data/wonderkammer/street_art.json",
    "data/wonderkammer/architecture.json",
    "data/wonderkammer/parks_nature.json",
    "data/wonderkammer/museums_libraries.json",
    "data/wonderkammer/seasonal.json"
  ];

  let criticalStarted = false;
  let criticalDone = false;
  let backgroundStarted = false;

  /**
   * @param {string} url
   * @param {{ cache?: RequestCache }} [options]
   * @returns {Promise<any>}
   */
  async function fetchJSON(url, { cache = "default" } = {}) {
    try {
      const res = await fetch(BASE + url, { cache });
      if (!res.ok) {
        console.warn("[boot-fast] 404:", BASE + url);
        return null;
      }
      return await res.json();
    } catch (error) {
      console.warn("[boot-fast] fetch failed:", BASE + url, error);
      return null;
    }
  }

  function emit(name, detail = {}) {
    try {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    } catch {}
  }

  function runSafe(label, fn) {
    try {
      return fn?.();
    } catch (error) {
      console.warn(`[boot-fast] ${label} failed`, error);
      return undefined;
    }
  }

  async function runSafeAsync(label, fn) {
    try {
      return await fn?.();
    } catch (error) {
      console.warn(`[boot-fast] ${label} failed`, error);
      return undefined;
    }
  }

  function normalizeRows(data, key) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    return [];
  }

  function mergeWonderkammerData(...sources) {
    const out = { places: [], people: [] };
    const placeMap = Object.create(null);
    const personMap = Object.create(null);

    const mergeRows = (rows, map, target, idKeys) => {
      for (const row of (Array.isArray(rows) ? rows : [])) {
        const id = String(idKeys.map(key => row?.[key]).find(Boolean) || "").trim();
        if (!id) continue;

        if (!map[id]) {
          map[id] = { ...row, chambers: [] };
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

      if (placeId) mergeRows([{ place_id: placeId, chambers }], placeMap, out.places, ["place_id", "place"]);
      if (personId) mergeRows([{ person_id: personId, chambers }], personMap, out.people, ["person_id", "person"]);
    }

    return out.places.length || out.people.length ? out : null;
  }

  async function loadPlacesCritical() {
    if (window.DataHub?.loadPlacesBase) {
      const loaded = await runSafeAsync("DataHub.loadPlacesBase", () =>
        window.DataHub.loadPlacesBase({ cache: "default" })
      );
      if (Array.isArray(loaded) && loaded.length) return loaded;
    }

    const places = [];
    for (const url of PLACE_FILES_FALLBACK) {
      const data = await fetchJSON(url, { cache: "default" });
      places.push(...normalizeRows(data, "places"));
    }
    return places;
  }

  function initOpenMode() {
    window.OPEN_MODE = localStorage.getItem("HG_OPEN_MODE") === "1";
    window.TEST_MODE = window.OPEN_MODE;

    const openEl = /** @type {HTMLInputElement | null} */ (document.getElementById("openToggle"));
    if (openEl) {
      openEl.checked = window.OPEN_MODE;
      if (openEl.dataset.hgOpenModeBound !== "1") {
        openEl.dataset.hgOpenModeBound = "1";
        openEl.addEventListener("change", () => {
          window.OPEN_MODE = !!openEl.checked;
          window.TEST_MODE = window.OPEN_MODE;
          localStorage.setItem("HG_OPEN_MODE", window.OPEN_MODE ? "1" : "0");
        });
      }
    }

    const btnUA = document.getElementById("btnUnlockAll");
    if (btnUA) btnUA.style.display = window.OPEN_MODE ? "inline-flex" : "none";
  }

  function initMapOnce() {
    if (window.MAP || window.HGMap?.getMap?.()) return window.MAP || window.HGMap.getMap();

    if (typeof START !== "undefined") window.START = START;

    const map = window.HGMap?.initMap?.({
      containerId: "map",
      start: window.START
    });

    if (map) window.MAP = map;
    return map || null;
  }

  function applyPlacesToMap(places) {
    window.PLACES = places;
    window.HGPlaces = places;
    window.allPlaces = places;

    if (!window.HGMap) return;

    if (typeof window.catColor === "function") window.HGMap.setCatColor(window.catColor);
    if (typeof window.visited !== "undefined") window.HGMap.setVisited(window.visited);

    window.HGMap.setPlaces(window.PLACES);
    window.HGMap.setOnPlaceClick((id) => {
      const placeId = String(id || "").trim();
      const p = (window.PLACES || []).find((x) => String(x?.id || "").trim() === placeId);
      if (!p) return;

      const next = `#/place/${encodeURIComponent(placeId)}`;
      if (window.HGAppRouter?.navigate) {
        window.HGAppRouter.navigate(next);
      } else if (location.hash !== next) {
        location.hash = next;
      }
    });
    window.HGMap.refreshMarkers?.();
  }

  function buildRelationIndex(relations) {
    window.REL_BY_PLACE = Object.create(null);
    window.REL_BY_PERSON = Object.create(null);

    for (const r of Array.isArray(relations) ? relations : []) {
      const place = String(r?.place || r?.place_id || "").trim();
      const person = String(r?.person || r?.person_id || "").trim();
      if (place) (window.REL_BY_PLACE[place] ||= []).push(r);
      if (person) (window.REL_BY_PERSON[person] ||= []).push(r);
    }
  }

  function buildWonderkammerIndex(wonderkammer) {
    window.WONDERKAMMER = wonderkammer || null;
    window.WK_BY_PLACE = Object.create(null);
    window.WK_BY_PERSON = Object.create(null);

    if (!wonderkammer) return;

    const wkPlaces = Array.isArray(wonderkammer.places) ? wonderkammer.places : [];
    const wkPeople = Array.isArray(wonderkammer.people) ? wonderkammer.people : [];

    for (const row of wkPlaces) {
      const id = row?.place || row?.place_id;
      if (id) window.WK_BY_PLACE[id] = row.chambers || [];
    }

    for (const row of wkPeople) {
      const id = row?.person || row?.person_id;
      if (id) window.WK_BY_PERSON[id] = row.chambers || [];
    }
  }

  async function loadRelationsBackground() {
    const relations = [];
    for (const url of RELATION_FILE_LIST) {
      const data = await fetchJSON(url, { cache: "default" });
      relations.push(...normalizeRows(data, "relations"));
    }
    window.RELATIONS = relations;
    buildRelationIndex(relations);
    emit("hg:relations-ready", { count: relations.length });
    return relations;
  }

  async function loadWonderkammerBackground() {
    const manifest = await fetchJSON("data/wonderkammer/index.json", { cache: "default" });
    const files = Array.isArray(manifest?.files) && manifest.files.length
      ? manifest.files
      : WONDERKAMMER_FALLBACK_FILES;

    const sources = [];
    for (const url of files) {
      const data = await fetchJSON(url, { cache: "default" });
      if (data) sources.push(data);
    }

    const wonderkammer = mergeWonderkammerData(...sources);
    buildWonderkammerIndex(wonderkammer);
    emit("hg:wonderkammer-ready", { count: sources.length });
    return wonderkammer;
  }

  function normalizePeoplePath(entry) {
    const raw = String(entry || "").trim().replace(/^\.?\//, "");
    if (!raw) return null;
    return raw.startsWith("data/") ? raw : `data/${raw}`;
  }

  async function loadPeopleBackground() {
    const manifest = await fetchJSON("data/people/manifest.json", { cache: "default" });
    const peopleFiles = Array.isArray(manifest?.files) ? manifest.files.map(normalizePeoplePath).filter(Boolean) : [];

    const peopleAll = [];
    for (const url of peopleFiles) {
      const data = await fetchJSON(url, { cache: "default" });
      peopleAll.push(...normalizeRows(data, "people"));
    }

    window.PEOPLE = peopleAll;
    emit("hg:people-ready", { count: peopleAll.length });
    return peopleAll;
  }

  async function bootCritical() {
    if (criticalDone) return;
    if (criticalStarted) return;
    criticalStarted = true;

    runSafe("CoreEngine.init", () => window.CoreEngine?.init?.());
    runSafe("HGEngine.init", () => window.HGEngine?.init?.());
    runSafe("HGLearningLog.migrateLegacy", () => window.HGLearningLog?.migrateLegacy?.());

    initOpenMode();

    // Layout/viewport må være riktig før første brukbare kartskjerm,
    // slik at #mapLayer og design-canvaset er korrekt dimensjonert.
    runSafe("ViewportManager.init", () => window.ViewportManager?.init?.());

    window.HG_ENV = {
      geo: "unknown",
      openMode: !!window.OPEN_MODE
    };

    initMapOnce();

    const places = await loadPlacesCritical();
    applyPlacesToMap(Array.isArray(places) ? places : []);

    criticalDone = true;
    emit("hg:criticalReady", { places: window.PLACES?.length || 0 });
  }

  /**
   * Binder QuizEngine til det ekte app-API-et (window.PLACES/PEOPLE m.m.).
   * Idempotent: kan trygt kalles både fra app-entry (før router) og fra
   * bootBackground. Default-API-et i js/quizzes.js returnerer null, så denne
   * MÅ ha kjørt før #/quiz kan starte QuizEngine.start.
   * @returns {boolean}
   */
  function initQuizEngine() {
    if (!window.QuizEngine || typeof window.QuizEngine.init !== "function") return false;
    if (window.__HG_QUIZ_ENGINE_APP_API_BOUND__ === true) return true;

    const bind = (fn) => (typeof fn === "function") ? fn : undefined;
    /**
     * @param {string} name
     * @returns {(...args: any[]) => any}
     */
    const lazy = (name) => (...args) => {
      const f = /** @type {any} */ (window)[name];
      if (typeof f === "function") return f(...args);
    };

    window.QuizEngine.init({
      getPersonById: (id) => (window.PEOPLE || []).find((p) => String(p?.id || "").trim() === String(id || "").trim()),
      getPlaceById: (id) => (window.PLACES || []).find((p) => String(p?.id || "").trim() === String(id || "").trim()),
      getVisited: () => (window.visited || {}),
      isTestMode: () => !!window.OPEN_MODE,
      showToast: (...args) => window.showToast?.(...args),
      showRewardPerson: lazy("showRewardPerson"),
      showRewardPlace: lazy("showRewardPlace"),
      showPersonPopup: lazy("showPersonPopup"),
      showPlacePopup: lazy("showPlacePopup"),
      savePeopleCollected: lazy("savePeopleCollected"),
      saveVisitedFromQuiz: lazy("saveVisitedFromQuiz"),
      addCompletedQuizAndMaybePoint: lazy("addCompletedQuizAndMaybePoint"),
      logCorrectQuizAnswer: bind(window.HGInsights?.logCorrectQuizAnswer?.bind(window.HGInsights))
    });

    window.__HG_QUIZ_ENGINE_APP_API_BOUND__ = true;
    return true;
  }

  async function bootBackground() {
    if (backgroundStarted) return;
    backgroundStarted = true;

    if (!criticalDone) await bootCritical();

    const tasks = [
      runSafeAsync("loadRelationsBackground", loadRelationsBackground),
      runSafeAsync("loadWonderkammerBackground", loadWonderkammerBackground),
      runSafeAsync("tags", async () => {
        window.TAGS = await fetchJSON("data/tags.json", { cache: "default" }) || [];
        emit("hg:tags-ready", { count: Array.isArray(window.TAGS) ? window.TAGS.length : 0 });
      }),
      runSafeAsync("loadPeopleBackground", loadPeopleBackground),
      runSafeAsync("DataHub.loadNature", () => window.DataHub?.loadNature?.()),
      runSafeAsync("DataHub.loadLesespor", () => window.DataHub?.loadLesespor?.({ cache: "default" })),
      runSafeAsync("HGStories.init", () => window.HGStories?.init?.()),
      runSafeAsync("HGEvents.init", () => window.HGEvents?.init?.()),
      runSafeAsync("HGBrands.init", () => window.HGBrands?.init?.())
    ];

    await Promise.allSettled(tasks);

    runSafe("initQuizEngine", initQuizEngine);

    await runSafeAsync("ensureBadgesLoaded", () =>
      typeof ensureBadgesLoaded === "function" ? ensureBadgesLoaded() : undefined
    );

    runSafe("wire", () => typeof window.wire === "function" ? window.wire() : undefined);
    runSafe("renderCollection", () => typeof renderCollection === "function" ? renderCollection() : undefined);
    runSafe("renderGallery", () => typeof window.renderGallery === "function" ? window.renderGallery() : undefined);
    runSafe("initPlaceCardCollapse", () => typeof initPlaceCardCollapse === "function" ? initPlaceCardCollapse() : undefined);
    runSafe("LayerManager.init", () => window.LayerManager?.init?.());
    runSafe("bottomSheetController.init", () => window.bottomSheetController?.init?.());

    emit("hg:backgroundReady", {
      people: window.PEOPLE?.length || 0,
      relations: window.RELATIONS?.length || 0
    });
  }

  window.bootCritical = bootCritical;
  window.bootBackground = bootBackground;
  window.initQuizEngine = initQuizEngine;
})();
