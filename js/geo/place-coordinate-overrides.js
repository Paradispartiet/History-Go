// js/geo/place-coordinate-overrides.js
// Runtime guard for explicit place overrides when places_index.json is present.
// History Go source data uses lat/lon. Do not use lng.
(function () {
  "use strict";

  if (window.__HG_PLACE_COORDINATE_OVERRIDES_PATCHED__) return;
  window.__HG_PLACE_COORDINATE_OVERRIDES_PATCHED__ = true;

  const DataHub = window.DataHub;
  if (!DataHub || typeof DataHub.loadPlacesBase !== "function" || typeof DataHub.fetchJSON !== "function") {
    console.warn("[place-overrides] DataHub mangler; hopper over place-overrides.");
    return;
  }

  let coordinateOverridesPromise = null;
  let categoryOverridesPromise = null;

  function isNum(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function asOptions(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function optionsFromArgs(args) {
    for (let i = args.length - 1; i >= 0; i -= 1) {
      const candidate = asOptions(args[i]);
      if (Object.keys(candidate).length || args[i] === candidate) return candidate;
    }
    return {};
  }

  function dataUrl(filename) {
    const base = String(DataHub.DEFAULTS?.DATA_BASE || "data").replace(/\/+$/, "");
    return `${base}/places/${filename}`;
  }

  function categoryOverrideBatchUrl(entry) {
    const raw = String(entry || "").trim().replace(/^\.\//, "");
    if (!raw) return "";
    const withoutData = raw.replace(/^data\/places\/category_overrides\//, "");
    const withoutPlaces = withoutData.replace(/^places\/category_overrides\//, "");
    const withoutFolder = withoutPlaces.replace(/^category_overrides\//, "");
    return dataUrl(`category_overrides/${withoutFolder}`);
  }

  async function loadCoordinateOverrides(opts = {}) {
    opts = asOptions(opts);
    if (coordinateOverridesPromise && !opts.bust) return coordinateOverridesPromise;

    coordinateOverridesPromise = DataHub.fetchJSON(dataUrl("coordinate_overrides.json"), {
      ...opts,
      cache: opts.cache || "no-store"
    })
      .then((data) => Array.isArray(data) ? data : [])
      .catch(() => []);

    return coordinateOverridesPromise;
  }

  async function loadCategoryOverrides(opts = {}) {
    opts = asOptions(opts);
    if (categoryOverridesPromise && !opts.bust) return categoryOverridesPromise;

    const fetchOpts = {
      ...opts,
      cache: opts.cache || "no-store"
    };

    categoryOverridesPromise = Promise.all([
      DataHub.fetchJSON(dataUrl("category_overrides.json"), fetchOpts)
        .then((data) => Array.isArray(data) ? data : [])
        .catch(() => []),
      DataHub.fetchJSON(dataUrl("category_overrides/index.json"), fetchOpts)
        .catch(() => null)
    ]).then(async ([baseOverrides, manifest]) => {
      const files = Array.isArray(manifest?.files)
        ? manifest.files.map((file) => String(file || "").trim()).filter(Boolean)
        : [];

      if (!files.length) return baseOverrides;

      const batches = await Promise.all(files.map(async (file) => {
        const url = categoryOverrideBatchUrl(file);
        if (!url) return [];
        return DataHub.fetchJSON(url, fetchOpts)
          .then((data) => Array.isArray(data) ? data : [])
          .catch((err) => {
            console.warn(`[place-overrides] kunne ikke laste kategori-batch ${file}`, err);
            return [];
          });
      }));

      return [...baseOverrides, ...batches.flat()];
    });

    return categoryOverridesPromise;
  }

  function cleanCoordinateOverride(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = String(raw.id || "").trim();
    if (!id || !isNum(raw.lat) || !isNum(raw.lon)) return null;

    const out = {
      id,
      lat: raw.lat,
      lon: raw.lon,
    };

    if (isNum(raw.r)) out.r = raw.r;

    for (const key of [
      "coordType",
      "coordStatus",
      "coordSource",
      "coordSourceId",
      "coordSourceUrl",
      "coordPrecisionM",
      "coordVerifiedAt",
      "coordNote"
    ]) {
      if (raw[key] != null) out[key] = raw[key];
    }

    return out;
  }

  function cleanCategoryOverride(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = String(raw.id || "").trim();
    const category = String(raw.category || "").trim();
    if (!id || !category) return null;

    const normalizer = window.DomainRegistry?.toRuntimeCategoryId;
    if (typeof normalizer === "function") {
      try {
        const normalizedCategory = String(normalizer(category) || "").trim();
        return normalizedCategory ? { id, category: normalizedCategory } : null;
      } catch (err) {
        console.warn("[place-overrides] ugyldig kategori-override", id, category, err);
        return null;
      }
    }

    return { id, category };
  }

  function applyCoordinateOverrides(places, rawOverrides) {
    const list = Array.isArray(places) ? places : [];
    const overrides = (Array.isArray(rawOverrides) ? rawOverrides : [])
      .map(cleanCoordinateOverride)
      .filter(Boolean);

    if (!overrides.length) return list;

    const byId = new Map(overrides.map((override) => [override.id, override]));
    let applied = 0;

    const patched = list.map((place) => {
      const id = String(place?.id || "").trim();
      const override = byId.get(id);
      if (!override) return place;
      applied += 1;

      const next = { ...place, ...override };
      if (Object.prototype.hasOwnProperty.call(next, "lng")) delete next.lng;
      return next;
    });

    if (applied > 0) {
      window.__HG_COORDINATE_OVERRIDES_APPLIED__ = applied;
      window.__HG_COORDINATE_OVERRIDES__ = overrides;
      console.info(`[place-overrides] applied ${applied} coordinate override(s).`);
    }

    return patched;
  }

  function categoryOverrideMap(rawOverrides) {
    const overrides = (Array.isArray(rawOverrides) ? rawOverrides : [])
      .map(cleanCategoryOverride)
      .filter(Boolean);
    return new Map(overrides.map((override) => [override.id, override.category]));
  }

  function applyCategoryOverrideToPlace(place, byId) {
    if (!place || typeof place !== "object" || Array.isArray(place)) return place;
    const id = String(place.id || "").trim();
    const category = byId.get(id);
    if (!category || place.category === category) return place;
    return { ...place, category };
  }

  function applyCategoryOverrides(payload, rawOverrides) {
    const byId = categoryOverrideMap(rawOverrides);
    if (!byId.size) return payload;

    let applied = 0;
    const patchOne = (place) => {
      const next = applyCategoryOverrideToPlace(place, byId);
      if (next !== place) applied += 1;
      return next;
    };

    let patched = payload;
    if (Array.isArray(payload)) {
      patched = payload.map(patchOne);
    } else if (payload && typeof payload === "object") {
      if (Array.isArray(payload.places)) {
        patched = { ...payload, places: payload.places.map(patchOne) };
      } else {
        patched = patchOne(payload);
      }
    }

    if (applied > 0) {
      window.__HG_CATEGORY_OVERRIDES_APPLIED__ = (window.__HG_CATEGORY_OVERRIDES_APPLIED__ || 0) + applied;
      window.__HG_CATEGORY_OVERRIDES__ = Object.fromEntries(byId.entries());
      console.info(`[place-overrides] applied ${applied} category override(s).`);
    }

    return patched;
  }

  const originalLoadPlacesBase = DataHub.loadPlacesBase.bind(DataHub);
  DataHub.loadPlacesBase = async function loadPlacesBaseWithOverrides(opts = {}) {
    opts = asOptions(opts);
    const [places, coordinateOverrides, categoryOverrides] = await Promise.all([
      originalLoadPlacesBase(opts),
      loadCoordinateOverrides(opts),
      loadCategoryOverrides(opts),
    ]);
    return applyCategoryOverrides(
      applyCoordinateOverrides(places, coordinateOverrides),
      categoryOverrides
    );
  };

  DataHub.loadPlaces = DataHub.loadPlacesBase;

  for (const methodName of ["loadFullPlace", "getPlaceEnriched", "loadEnrichedAll"]) {
    const original = DataHub[methodName];
    if (typeof original !== "function") continue;

    DataHub[methodName] = async function placeMethodWithCategoryOverrides(...args) {
      const opts = optionsFromArgs(args);
      const [result, categoryOverrides] = await Promise.all([
        Reflect.apply(original, DataHub, args),
        loadCategoryOverrides(opts),
      ]);
      return applyCategoryOverrides(result, categoryOverrides);
    };
  }

  window.HGApplyCoordinateOverrides = applyCoordinateOverrides;
  window.HGApplyCategoryOverrides = applyCategoryOverrides;
})();
