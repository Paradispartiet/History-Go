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
  const _fullPlaceCache = new Map();
  let _placeManifestFilesPromise = null;
  let _placeFileByIdPromise = null;
  let _placeExclusionsPromise = null;
  let _fagManifestPromise = null;
  let _lesesporPromise = null;
  let _badgesPromise = null;

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
      const res = await fetch(url, { cache: /** @type {RequestCache} */ (cache) });
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

async function loadPlaceExclusions(opts = {}) {
  if (!_placeExclusionsPromise) {
    _placeExclusionsPromise = fetchJSON(pData("places/place_exclusions.json"), opts)
      .then((data) => new Set(Array.isArray(data?.disabledPlaceIds) ? data.disabledPlaceIds.map((id) => String(id || "").trim()).filter(Boolean) : []))
      .catch(() => new Set());
  }
  return _placeExclusionsPromise;
}

async function filterActivePlaces(places, opts = {}) {
  const disabled = await loadPlaceExclusions(opts);
  if (!disabled || !disabled.size) return Array.isArray(places) ? places : [];
  return (Array.isArray(places) ? places : []).filter((p) => {
    const id = String(p?.id || "").trim();
    return !id || !disabled.has(id);
  });
}

async function loadPlacesBase(opts = {}) {
  try {
    const index = await fetchJSON(pData("places/places_index.json"), opts);
    if (Array.isArray(index) && index.length) return filterActivePlaces(index, opts);
  } catch {}

  const manifest = await fetchJSON(pData("places/manifest.json"), opts);
  const places = [];

  for (const file of manifest.files) {
    const data = await fetchJSON(pData(file), opts);
    if (Array.isArray(data)) places.push(...data);
    else if (Array.isArray(data?.places)) places.push(...data.places);
  }
  return filterActivePlaces(places, opts);
}


  function normalizePlaceSourceFile(value) {
    const raw = String(value || "").trim().replace(/^\.?\//, "");
    if (!raw) return "";
    const withoutData = raw.replace(/^data\//, "");
    return withoutData.startsWith("places/") ? withoutData : `places/${withoutData.replace(/^places\//, "")}`;
  }

  async function resolvePlaceSourceFile(id, opts = {}) {
    const disabled = await loadPlaceExclusions(opts);
    if (disabled.has(id)) return "";

    const fromOpt = normalizePlaceSourceFile(opts?.sourceFile || opts?._sourceFile || opts?.file || opts?.place?.sourceFile || opts?.place?._sourceFile || opts?.place?.file);
    if (fromOpt) return fromOpt;

    const places = Array.isArray(window.PLACES) ? window.PLACES : [];
    const basePlace = places.find((p) => String(p?.id || "").trim() === id);
    const fromBase = normalizePlaceSourceFile(basePlace?.sourceFile || basePlace?._sourceFile || basePlace?.file);
    if (fromBase) return fromBase;

    try {
      const index = await fetchJSON(pData("places/places_index.json"), opts);
      const row = (Array.isArray(index) ? index : []).find((p) => String(p?.id || "").trim() === id);
      const fromIndex = normalizePlaceSourceFile(row?.sourceFile || row?._sourceFile || row?.file);
      if (fromIndex) return fromIndex;
    } catch {}

    return "";
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
      const disabled = await loadPlaceExclusions(opts);
      const map = new Map();

      for (const file of files) {
        const data = await fetchJSON(pData(file), opts);
        const places = Array.isArray(data) ? data : (Array.isArray(data?.places) ? data.places : []);
        for (const p of places) {
          const id = String(p?.id || "").trim();
          if (id && !disabled.has(id) && !map.has(id)) map.set(id, file);
        }
      }
      return map;
    })();

    return _placeFileByIdPromise;
  }

  async function loadFullPlace(placeId, opts = {}) {
    const id = String(placeId || "").trim();
    if (!id) return null;
    const disabled = await loadPlaceExclusions(opts);
    if (disabled.has(id)) return null;
    if (_fullPlaceCache.has(id)) return _fullPlaceCache.get(id);

    let file = await resolvePlaceSourceFile(id, opts);

    // Fallback: older indexes do not expose sourceFile yet. This keeps existing
    // behavior working, but it is no longer the first choice for PlaceCard.
    if (!file) {
      const byId = await loadPlaceFileById(opts);
      file = byId.get(id) || "";
    }
    if (!file) return null;

    const data = await fetchJSON(pData(file), opts);
    const places = Array.isArray(data) ? data : (Array.isArray(data?.places) ? data.places : []);
    const fullPlace = places.find((p) => String(p?.id || "").trim() === id) || null;

    if (fullPlace) _fullPlaceCache.set(id, fullPlace);
    return fullPlace;
  }
   

  function normalizePeopleManifestPath(entry) {
    const raw = String(entry || "").trim().replace(/^\.?\//, "");
    if (!raw) return null;
    const withoutData = raw.replace(/^data\//, "");
    return withoutData.startsWith("people/") ? withoutData : `people/${withoutData.replace(/^people\//, "")}`;
  }
