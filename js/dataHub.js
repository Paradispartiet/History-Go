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
  EMNERS_BASE: (PROJECT_BASE + "emner").replace(/\/+/g, "/"),
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
  if (!_placeExclusionsPromise || opts?.bust) {
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

function placesFromPlaceData(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.places)) return data.places;
  if (data && typeof data === "object" && !Array.isArray(data) && typeof data.id === "string") return [data];
  return [];
}

function normalizePlaceManifestPath(entry) {
  const raw = String(entry || "").trim().replace(/^\.?\//, "");
  if (!raw) return "";
  const withoutData = raw.replace(/^data\//, "");
  return withoutData.startsWith("places/") ? withoutData : `places/${withoutData.replace(/^places\//, "")}`;
}

function splitManifestPathFor(file) {
  const normalized = normalizePlaceManifestPath(file);
  const slash = normalized.lastIndexOf("/");
  const dir = slash >= 0 ? normalized.slice(0, slash + 1) : "";
  const name = slash >= 0 ? normalized.slice(slash + 1) : normalized;
  const dot = name.lastIndexOf(".");
  const stem = dot >= 0 ? name.slice(0, dot) : name;
  const ext = dot >= 0 ? name.slice(dot) : ".json";
  return `${dir}${stem}_manifest${ext}`;
}

function isValidSplitManifest(data) {
  return data && typeof data === "object" && !Array.isArray(data)
    && Array.isArray(data.places)
    && data.places.some((row) => row && typeof row === "object" && typeof row.file === "string" && row.file.trim());
}

function resolveRelativePlaceFile(baseFile, childFile) {
  const child = String(childFile || "").trim().replace(/^\.?\//, "");
  if (!child) return "";
  if (child.startsWith("places/")) return child;
  if (child.startsWith("data/places/")) return child.replace(/^data\//, "");
  const slash = baseFile.lastIndexOf("/");
  const dir = slash >= 0 ? baseFile.slice(0, slash + 1) : "";
  return `${dir}${child}`;
}

async function preferSiblingSplitManifest(file, opts = {}) {
  const normalized = normalizePlaceManifestPath(file);
  if (!normalized) return null;
  const splitFile = splitManifestPathFor(normalized);
  try {
    const data = await fetchJSON(pData(splitFile), opts);
    return isValidSplitManifest(data) ? { file: splitFile, data } : null;
  } catch {
    return null;
  }
}

async function loadPlaceEntriesFromManifestFile(file, opts = {}) {
  const normalized = normalizePlaceManifestPath(file);
  if (!normalized) return [];

  const split = await preferSiblingSplitManifest(normalized, opts);
  if (split) {
    const entries = [];
    for (const row of split.data.places) {
      if (!row || typeof row !== "object" || typeof row.file !== "string" || !row.file.trim()) continue;
      const childFile = resolveRelativePlaceFile(split.file, row.file);
      if (!childFile) continue;
      const data = await fetchJSON(pData(childFile), opts);
      for (const place of placesFromPlaceData(data)) entries.push({ place, file: childFile });
    }
    return entries;
  }

  const data = await fetchJSON(pData(normalized), opts);
  return placesFromPlaceData(data).map((place) => ({ place, file: normalized }));
}

async function loadPlacesBase(opts = {}) {
  try {
    const index = await fetchJSON(pData("places/places_index.json"), opts);
    if (Array.isArray(index) && index.length) return filterActivePlaces(index, opts);
  } catch {}

  const manifest = await fetchJSON(pData("places/manifest.json"), opts);
  const places = [];

  for (const file of (Array.isArray(manifest?.files) ? manifest.files : [])) {
    const entries = await loadPlaceEntriesFromManifestFile(file, opts);
    places.push(...entries.map((entry) => ({ ...entry.place, sourceFile: entry.file })));
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
        const entries = await loadPlaceEntriesFromManifestFile(file, opts);
        for (const { place, file: actualFile } of entries) {
          const id = String(place?.id || "").trim();
          if (id && !disabled.has(id) && !map.has(id)) map.set(id, actualFile);
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

    const splitEntries = await loadPlaceEntriesFromManifestFile(file, opts).catch(() => []);
    const splitEntry = splitEntries.find((entry) => String(entry?.place?.id || "").trim() === id);
    if (splitEntry?.file) file = splitEntry.file;

    const data = await fetchJSON(pData(file), opts);
    const places = placesFromPlaceData(data);
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

  async function loadPeopleBase(opts = {}) {
    const manifest = await fetchJSON(pData("people/manifest.json"), opts).catch((e) => {
      console.error("[DataHub.loadPeopleBase] kunne ikke laste people-manifest", e?.message || e);
      return null;
    });

    const files = Array.isArray(manifest?.files)
      ? manifest.files.map(normalizePeopleManifestPath).filter(Boolean)
      : [];

    if (!files.length) {
      console.error("[DataHub.loadPeopleBase] mangler gyldig people-manifest: data/people/manifest.json");
      return [];
    }

    const people = [];
    for (const file of files) {
      const data = await fetchJSON(pData(file), opts).catch((e) => {
        console.error(`[DataHub.loadPeopleBase] kunne ikke laste people-fil: ${file}`, e?.message || e);
        return null;
      });

      if (Array.isArray(data)) {
        people.push(...data);
      } else if (Array.isArray(data?.people)) {
        people.push(...data.people);
      } else if (data) {
        console.error(`[DataHub.loadPeopleBase] ugyldig people-fil: ${file}`);
      }
    }

    return people;
  }

  async function loadBadges(opts = {}) {
    if (Array.isArray(window.BADGES) && window.BADGES.length && !opts?.bust) {
      return window.BADGES;
    }

    if (_badgesPromise && !opts?.bust) return _badgesPromise;

    _badgesPromise = (async () => {
      const index = await fetchJSON(pData("badges/index.json"), opts);
      const files = Array.isArray(index?.files)
        ? index.files.map((file) => String(file || "").trim()).filter(Boolean)
        : [];

      if (!files.length) {
        throw new Error("data/badges/index.json mangler files[]");
      }

      const byId = new Map();
      for (const rawFile of files) {
        const file = String(rawFile || "")
          .trim()
          .replace(/^\/?data\/badges\//, "")
          .replace(/^\.\//, "");
        if (!file) continue;

        const badge = await fetchJSON(pData(`badges/${file}`), opts);
        const id = String(badge?.id || "").trim();
        if (!id || !badge || typeof badge !== "object" || Array.isArray(badge)) {
          throw new Error(`Ugyldig badge-fil: ${rawFile}`);
        }
        if (!byId.has(id)) byId.set(id, badge);
      }

      const badges = [...byId.values()];
      window.BADGES = badges;
      return badges;
    })().catch((e) => {
      console.warn("[DataHub.loadBadges] kunne ikke laste badge-index", e?.message || e);
      window.BADGES = [];
      return /** @type {any} */ (window.BADGES);
    }).finally(() => {
      _badgesPromise = null;
    });

    return _badgesPromise;
  }

  function loadRoutes(opts = {}) {
    return fetchJSON(pData("routes.json"), opts);
  }

  async function loadHistoricalRoutes(opts = {}) {
    const manifest = await fetchJSON(pData("routes/historical/manifest.json"), opts);
    const files = Array.isArray(manifest?.files) ? manifest.files : [];
    const batches = await Promise.all(files.map((file) => fetchJSON(pData(`routes/historical/${file}`), opts)));
    return batches.flatMap((batch) => Array.isArray(batch) ? batch : []);
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


  function getLesesporYear(item) {
    const year = Number(item?.year);
    if (Number.isFinite(year)) return year;
    const dateYear = Number(String(item?.date || "").slice(0, 4));
    return Number.isFinite(dateYear) ? dateYear : 0;
  }

  function getLesesporStatusRank(item) {
    const status = String(item?.curation_status || "").trim();
    if (status === "strong_candidate") return 0;
    if (status === "candidate_needs_review" || status === "candidate") return 1;
    return 2;
  }

  function sortLesesporItems(items) {
    return (Array.isArray(items) ? items : [])
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const statusDiff = getLesesporStatusRank(a.item) - getLesesporStatusRank(b.item);
        if (statusDiff) return statusDiff;
        const yearDiff = getLesesporYear(b.item) - getLesesporYear(a.item);
        if (yearDiff) return yearDiff;
        const dateDiff = String(b.item?.date || "").localeCompare(String(a.item?.date || ""));
        if (dateDiff) return dateDiff;
        return a.index - b.index;
      })
      .map(({ item }) => item);
  }

  function buildLesesporPlaceIndex(items) {
    const index = Object.create(null);
    for (const item of Array.isArray(items) ? items : []) {
      const placeIds = Array.isArray(item?.place_ids) ? item.place_ids : [];
      for (const rawPlaceId of placeIds) {
        const placeId = String(rawPlaceId || "").trim();
        if (!placeId) continue;
        (index[placeId] ||= []).push(item);
      }
    }
    for (const placeId of Object.keys(index)) {
      index[placeId] = sortLesesporItems(index[placeId]);
    }
    return index;
  }

  function getLesesporForPlace(placeId) {
    const id = String(placeId || "").trim();
    if (!id) return [];
    const byPlace = window.LESESPOR_BY_PLACE || Object.create(null);
    const candidates = Array.isArray(byPlace[id]) ? byPlace[id] : [];
    const seen = new Set();
    const deduped = [];
    for (const item of candidates) {
      const itemId = String(item?.id || "").trim();
      if (!itemId || seen.has(itemId)) continue;
      if (!Array.isArray(item?.place_ids) || !item.place_ids.some(pid => String(pid || "").trim() === id)) continue;
      seen.add(itemId);
      deduped.push(item);
    }
    return sortLesesporItems(deduped);
  }

  async function loadLesespor(opts = {}) {
    if (_lesesporPromise) return _lesesporPromise;

    _lesesporPromise = (async () => {
      let manifest;
      try {
        manifest = await fetchJSON(pData("lesespor/manifest.json"), opts);
      } catch (e) {
        console.warn("[DataHub.loadLesespor] kunne ikke laste data/lesespor/manifest.json", e?.message || e);
        window.LESESPOR = [];
        window.LESESPOR_BY_PLACE = Object.create(null);
        window.getLesesporForPlace = getLesesporForPlace;
        return { items: window.LESESPOR, byPlace: window.LESESPOR_BY_PLACE, manifest: null };
      }

      const files = Array.isArray(manifest?.files) ? manifest.files : [];
      const byId = new Map();

      for (const rawFile of files) {
        const file = String(rawFile || "").trim().replace(/^\/?data\/lesespor\//, "").replace(/^\.\//, "");
        if (!file) continue;
        try {
          const data = await fetchJSON(pData(`lesespor/${file}`), opts);
          const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
          for (const item of items) {
            const id = String(item?.id || "").trim();
            if (id && !byId.has(id)) byId.set(id, item);
          }
        } catch (e) {
          console.warn(`[DataHub.loadLesespor] hoppet over data/lesespor/${file}`, e?.message || e);
        }
      }

      const items = sortLesesporItems([...byId.values()]);
      const byPlace = buildLesesporPlaceIndex(items);

      window.LESESPOR = items;
      window.LESESPOR_BY_PLACE = byPlace;
      window.getLesesporForPlace = getLesesporForPlace;

      return { items, byPlace, manifest };
    })();

    return _lesesporPromise;
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
    return fetchJSON(pEmner("fagkart.json"), opts).catch(() => null);
  }

  function loadFagkartMap(opts = {}) {
    return fetchJSON(pEmner("fagkart_map.json"), opts).catch(() => null);
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

  // ----------------------------
  // Quizkort-samlinger: /data/quizcards/<path>
  // ----------------------------
  function loadQuizCardsCollection(collectionPath, opts = {}) {
    const path = String(collectionPath || "").trim();
    if (!path) return Promise.resolve(null);
    const cleanPath = path
      .replace(/^\/?data\/quizcards\//, "")
      .replace(/^\.\//, "");
    return fetchJSON(pData(`quizcards/${cleanPath}`), opts).catch(() => null);
  }

  function normalizeTags(rawTags, tagsRegistry) {
    const list = Array.isArray(rawTags) ? rawTags : [];
    const legacyMap = (tagsRegistry && tagsRegistry.legacy_map) || {};
    return list.map(t => legacyMap[t] || t).filter(Boolean);
  }

  // legacy aliases (kept for backwards-compatible call sites)
  function loadPlaces(opts = {}) { return loadPlacesBase(opts); }
  function loadPeople(opts = {}) { return loadPeopleBase(opts); }

  window.getLesesporForPlace = getLesesporForPlace;

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
    loadHistoricalRoutes,
    loadFullPlace,
    loadLesespor,
    getLesesporForPlace,

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
    loadQuizCardsCollection,

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
