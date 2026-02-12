// js/dataHub.js
// DataHub v2.1 (NO MODULES) — robust loader for History GO (GitHub Pages / subfolder-safe)
// Bruk: DataHub.loadPlacesBase(), DataHub.loadEnrichedAll(...), DataHub.getPlaceEnriched(...)

(function () {
  "use strict";

  // ----------------------------
  // Base-path (subfolder-safe)
  // ----------------------------
  // Hvis appen kjører på:
  // https://paradispartiet.github.io/History-Go/index.html
  // så blir APP_BASE_PATH = "/History-Go/"
// 🔒 100 % GitHub Pages + SW-safe base path
const APP_BASE_PATH = (function () {
  const base = document.querySelector("base")?.getAttribute("href");
  if (base) return base.endsWith("/") ? base : base + "/";
  return location.origin + location.pathname.replace(/[^/]+$/, "");
})();

const DATA_BASE = APP_BASE_PATH + "data";
const EMNER_BASE = APP_BASE_PATH + "emner";

  // 🔒 SW/GitHub Pages-safe base: alltid prosjekt-root (…/History-Go/)
const PROJECT_BASE = (function () {
  // Hvis du har <base href="/History-Go/"> i <head>, brukes den (best)
  const b = document.querySelector("base")?.getAttribute("href");
  if (b) return b.endsWith("/") ? b : (b + "/");

  // Ellers: finn prosjekt-roten ved å kutte på "/js/" hvis vi står i js-path
  const p = location.pathname;
  if (p.includes("/js/")) return p.split("/js/")[0] + "/";

  // Fallback: mappa der HTML ligger (index.html, profile.html osv)
  return p.replace(/[^/]+$/, "");
})();

const DEFAULTS = {
  DATA_BASE: (PROJECT_BASE + "data").replace(/\/+/g, "/"),
  EMNER_BASE: (PROJECT_BASE + "emner").replace(/\/+/g, "/")
};

  const _cache = new Map();

  function joinPath(base, path) {
    return `${base}/${path}`.replace(/\/+/g, "/");
  }

  function pData(path) {
    return joinPath(DEFAULTS.DATA_BASE, path);
  }

  function pEmner(path) {
    return joinPath(DEFAULTS.EMNER_BASE, path);
  }

  async function fetchJSON(url, { cache = "default", bust = false } = {}) {
    const key = `${url}::${cache}`;
    if (!bust && _cache.has(key)) return _cache.get(key);

    const p = (async () => {
      const res = await fetch(url, { cache });
      if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
      return res.json();
    })();

    _cache.set(key, p);
    return p;
  }

  function clearCache(prefix = "") {
    if (!prefix) return _cache.clear();
    for (const k of _cache.keys()) if (k.startsWith(prefix)) _cache.delete(k);
  }

  function indexBy(arr, key) {
    const m = new Map();
    (arr || []).forEach(x => {
      const k = x && x[key];
      if (k != null && k !== "") m.set(k, x);
    });
    return m;
  }

  // ----------------------------
  // Deep merge (robust)
  // ----------------------------
  function mergeDeep(base, extra) {
    // Viktig: tåler null/undefined
    if (!extra || typeof extra !== "object") return { ...(base || {}) };

    const out = { ...(base || {}) };

    for (const [k, v] of Object.entries(extra)) {
      if (v == null) continue;

      const prev = out[k];

      if (Array.isArray(v)) {
        const a = Array.isArray(prev) ? prev : [];
        const merged = [...a, ...v].filter(Boolean);

        const uniq = [];
        const seen = new Set();

        for (const item of merged) {
          const sig =
            item && typeof item === "object"
              ? JSON.stringify(item)
              : String(item);
          if (!seen.has(sig)) {
            seen.add(sig);
            uniq.push(item);
          }
        }
        out[k] = uniq;

      } else if (typeof v === "object") {
        out[k] = mergeDeep(prev && typeof prev === "object" ? prev : {}, v);

      } else {
        out[k] = v;
      }
    }

    return out;
  }

  // ----------------------------
  // Base loaders
  // ----------------------------
  function loadTags(opts = {}) {
    return fetchJSON(pData("tags.json"), opts);
  }
  function loadPlacesBase(opts = {}) {
    return fetchJSON(pData("places.json"), opts);
  }
  function loadPeopleBase(opts = {}) {
    return fetchJSON(pData("people.json"), opts);
  }
  function loadBadges(opts = {}) {
    return fetchJSON(pData("badges.json"), opts);
  }
  function loadRoutes(opts = {}) {
    return fetchJSON(pData("routes.json"), opts);
  }

  // ----------------------------
  // Overlays
  // ----------------------------
  function loadPlaceOverlays(subjectId, opts = {}) {
    if (!subjectId) return Promise.resolve([]);
    return fetchJSON(pData(`overlays/${subjectId}/places_${subjectId}.json`), opts).catch(() => []);
  }

  function loadPeopleOverlays(subjectId, opts = {}) {
    if (!subjectId) return Promise.resolve([]);
    return fetchJSON(pData(`overlays/${subjectId}/people_${subjectId}.json`), opts).catch(() => []);
  }

  // ----------------------------
  // Enriched (fix: aldri null inn i mergeDeep)
  // ----------------------------
  async function getPlaceEnriched(placeId, subjectId, opts = {}) {
    const [places, overlays] = await Promise.all([
      loadPlacesBase(opts),
      loadPlaceOverlays(subjectId, opts)
    ]);

    const base = (places || []).find(p => p.id === placeId) || null;
    if (!base) return null;

    const overlay = (overlays || []).find(o => o.placeId === placeId) || null;
    const patch = overlay ? { ...overlay, id: base.id } : {}; // ✅ ikke null
    return mergeDeep(base, patch);
  }

  async function getPersonEnriched(personId, subjectId, opts = {}) {
    const [people, overlays] = await Promise.all([
      loadPeopleBase(opts),
      loadPeopleOverlays(subjectId, opts)
    ]);

    const base = (people || []).find(p => p.id === personId) || null;
    if (!base) return null;

    const overlay = (overlays || []).find(o => o.personId === personId) || null;
    const patch = overlay ? { ...overlay, id: base.id } : {}; // ✅ ikke null
    return mergeDeep(base, patch);
  }

  async function loadEnrichedAll(subjectId, opts = {}) {
    const [places, people, placeOv, peopleOv] = await Promise.all([
      loadPlacesBase(opts),
      loadPeopleBase(opts),
      loadPlaceOverlays(subjectId, opts),
      loadPeopleOverlays(subjectId, opts)
    ]);

    const pOvBy = indexBy(placeOv || [], "placeId");
    const peOvBy = indexBy(peopleOv || [], "personId");

    const enrichedPlaces = (places || []).map(p => {
      const ov = pOvBy.get(p.id);
      const patch = ov ? { ...ov, id: p.id } : {}; // ✅ ikke null
      return mergeDeep(p, patch);
    });

    const enrichedPeople = (people || []).map(p => {
      const ov = peOvBy.get(p.id);
      const patch = ov ? { ...ov, id: p.id } : {}; // ✅ ikke null
      return mergeDeep(p, patch);
    });

    return {
      enrichedPlaces,
      enrichedPeople,
      enrichedPlacesById: indexBy(enrichedPlaces, "id"),
      enrichedPeopleById: indexBy(enrichedPeople, "id")
    };
  }

  // ----------------------------
  // Emner/fagkart
  // ----------------------------
  function loadEmner(themeId, opts = {}) {
    if (!themeId) return Promise.resolve([]);
    return fetchJSON(pEmner(`emner_${themeId}.json`), opts).catch(() => []);
  }

  function loadFagkart(opts = {}) {
    return fetchJSON(pEmner("fagkart.json"), opts).catch(() => null);
  }

  function loadFagkartMap(opts = {}) {
    return fetchJSON(pEmner("fagkart_map.json"), opts).catch(() => null);
  }


  async function loadNature() {
  try {
    const r1 = await fetch("data/nature/flora.json", { cache: "no-store" });
    window.FLORA = r1.ok ? await r1.json() : [];
  } catch { window.FLORA = []; }

  try {
    const r2 = await fetch("data/nature/fauna.json", { cache: "no-store" });
    window.FAUNA = r2.ok ? await r2.json() : [];
  } catch { window.FAUNA = []; }
}
  
  // ----------------------------
  // Quiz: /data/quiz/quiz_<categoryId>.json
  // ----------------------------
  function loadQuizCategory(categoryId, opts = {}) {
    if (!categoryId) return Promise.resolve([]);
    return fetchJSON(pData(`quiz/quiz_${categoryId}.json`), opts).catch(() => []);
  }

  function normalizeTags(rawTags, tagsRegistry) {
    const list = Array.isArray(rawTags) ? rawTags : [];
    const legacyMap = (tagsRegistry && tagsRegistry.legacy_map) || {};
    return list.map(t => legacyMap[t] || t).filter(Boolean);
  }

  // Expose
  window.DataHub = {
    // core
    fetchJSON,
    clearCache,

    // base
    loadTags,
    loadPlacesBase,
    loadPeopleBase,
    loadBadges,
    loadRoutes,

    // overlays/enriched
    loadPlaceOverlays,
    loadPeopleOverlays,
    getPlaceEnriched,
    getPersonEnriched,
    loadEnrichedAll,

    // emner
    loadEmner,
    loadFagkart,
    loadFagkartMap,

    // quiz
    loadQuizCategory,

    // tags
    normalizeTags,

    // utils
    mergeDeep,
    indexBy,

    // debug/info (praktisk)
    APP_BASE_PATH,
    DEFAULTS
  };
})();


const PEOPLE_FILES = {};
