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
const EMNERS_BASE = APP_BASE_PATH + "emner";

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
  const _fullPlaceCache = new Map();
  let _placeManifestFilesPromise = null;
  let _placeFileByIdPromise = null;
  let _fagManifestPromise = null;

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
async function loadPlacesBase(opts = {}) {
  const places = [];
  const seen = new Set();

  function addPlaces(data) {
    const list = Array.isArray(data) ? data : (Array.isArray(data?.places) ? data.places : []);
    for (const place of list) {
      const id = String(place?.id || "").trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      places.push(place);
    }
  }

  try {
    const index = await fetchJSON(pData("places/places_index.json"), opts);
    addPlaces(index);
  } catch {}

  try {
    const manifest = await fetchJSON(pData("places/manifest.json"), opts);
    const files = Array.isArray(manifest?.files) ? manifest.files : [];

    for (const file of files) {
      const data = await fetchJSON(pData(file), opts);
      addPlaces(data);
    }
  } catch (e) {
    if (!places.length) throw e;
  }

  return places;
}

  async function loadPlaceManifestFiles(opts = {}) {
    if (!_placeManifestFilesPromise) {
      _placeManifestFilesPromise = fetchJSON(pData("places/manifest.json"), opts)
        .then((manifest) => Array.isArray(manifest?.files) ? manifest.files : []);
    }
    return _placeManifestFilesPromise;
  }

  async function loadPlaceFileById(opts = {}) {
    if (_placeFileByIdPromise) return _placeFileByIdPromise;

    _placeFileByIdPromise = (async () => {
      const files = await loadPlaceManifestFiles(opts);
      const map = new Map();

      for (const file of files) {
        const data = await fetchJSON(pData(file), opts);
        const places = Array.isArray(data) ? data : (Array.isArray(data?.places) ? data.places : []);
        for (const p of places) {
          const id = String(p?.id || "").trim();
          if (id && !map.has(id)) map.set(id, file);
        }
      }
      return map;
    })();

    return _placeFileByIdPromise;
  }

  async function loadFullPlace(placeId, opts = {}) {
    const id = String(placeId || "").trim();
    if (!id) return null;
    if (_fullPlaceCache.has(id)) return _fullPlaceCache.get(id);

    const byId = await loadPlaceFileById(opts);
    const file = byId.get(id);
    if (!file) return null;

    const data = await fetchJSON(pData(file), opts);
    const places = Array.isArray(data) ? data : (Array.isArray(data?.places) ? data.places : []);
    const fullPlace = places.find((p) => String(p?.id || "").trim() === id) || null;

    if (fullPlace) _fullPlaceCache.set(id, fullPlace);
    return fullPlace;
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

    let id = String(themeId).trim();
    try {
      if (window.DomainRegistry?.resolve) id = window.DomainRegistry.resolve(id);
    } catch (e) { /* behold rå id ved ukjent domene */ }

    const nested = pData(`fag/${id}/emner_${id}.json`);
    const flat = pData(`fag/emner_${id}.json`);
    return loadFagFile(id, "emner", opts)
      .then((data) => (Array.isArray(data) ? data : null))
      .then((data) => data || fetchJSON(nested, opts))
      .catch(() => fetchJSON(flat, opts))
      .catch(() => []);
  }

  function loadFagManifest(opts = {}) {
    if (!_fagManifestPromise || opts?.bust) {
      _fagManifestPromise = fetchJSON(pData("fag/fag_manifest.json"), opts).catch(() => ({}));
    }
    return _fagManifestPromise;
  }

  async function loadFagFile(subjectId, fileType, opts = {}) {
    if (!subjectId || !fileType) return null;
    let id = String(subjectId).trim();
    try {
      if (window.DomainRegistry?.resolve) id = window.DomainRegistry.resolve(id);
    } catch (e) { /* behold rå id ved ukjent domene */ }

    try {
      const manifest = await loadFagManifest(opts);
      const relPath = manifest?.[id]?.[fileType];
      if (typeof relPath === "string" && relPath.trim()) {
        return await fetchJSON(pData(`fag/${relPath}`), opts);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function loadPensum(subjectId, opts = {}) {
    return loadFagFile(subjectId, "pensum", opts);
  }
  function loadMethods(subjectId, opts = {}) {
    return loadFagFile(subjectId, "methods", opts);
  }
  function loadSubjectFagkart(subjectId, opts = {}) {
    return loadFagFile(subjectId, "fagkart", opts);
  }
  function loadSupersetQuizMal(subjectId, opts = {}) {
    return loadFagFile(subjectId, "supersetQuizMal", opts);
  }

  function loadFagkart(opts = {}) {
    return fetchJSON(pEmners("fagkart.json"), opts).catch(() => null);
  }

  function loadFagkartMap(opts = {}) {
    return fetchJSON(pEmners("fagkart_map.json"), opts).catch(() => null);
  }


  // Manifest-basert natur-lasting. Slår sammen alle underfiler under
  // data/natur/flora/ og data/natur/fauna/. Hopper graciously over filer
  // som ikke parser (noen eldre filer har ugyldig JSON – må fikses separat).
  async function loadNatureGroup(groupPath) {
    const manifestUrl = pData(`${groupPath}/manifest.json`);
    let manifest;
    try {
      manifest = await fetchJSON(manifestUrl);
    } catch {
      return [];
    }
    const files = Array.isArray(manifest?.files) ? manifest.files : [];
    const out = [];
    for (const file of files) {
      try {
        const data = await fetchJSON(pData(`${groupPath}/${file}`));
        if (Array.isArray(data)) out.push(...data);
        else if (data && typeof data === "object") out.push(data);
      } catch (e) {
        console.warn(`[DataHub] natur: hoppet over ${file}:`, e?.message || e);
      }
    }
    return out;
  }

  async function loadNature() {
    try { window.FLORA = await loadNatureGroup("natur/flora"); }
    catch { window.FLORA = []; }
    try { window.FAUNA = await loadNatureGroup("natur/fauna"); }
    catch { window.FAUNA = []; }
    try {
      window.dispatchEvent(new CustomEvent("hg:nature-loaded", {
        detail: { flora: window.FLORA.length, fauna: window.FAUNA.length }
      }));
    } catch {}
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

  // legacy aliases (kept for backwards-compatible call sites)
  function loadPlaces(opts = {}) { return loadPlacesBase(opts); }
  function loadPeople(opts = {}) { return loadPeopleBase(opts); }

  // Expose
  window.DataHub = {
    // core
    fetchJSON,
    clearCache,

    // base
    loadTags,
    loadPlacesBase,
    loadPeopleBase,
    loadPlaces,
    loadPeople,
    loadBadges,
    loadRoutes,
    loadFullPlace,

    // overlays/enriched
    loadPlaceOverlays,
    loadPeopleOverlays,
    getPlaceEnriched,
    getPersonEnriched,
    loadEnrichedAll,

    // emner
    loadFagManifest,
    loadFagFile,
    loadPensum,
    loadMethods,
    loadSubjectFagkart,
    loadSupersetQuizMal,
    loadEmner,
    loadFagkart,
    loadFagkartMap,

    // quiz
    loadQuizCategory,

    // natur
    loadNature,
    loadNatureGroup,

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
