// js/geo/place-coordinate-overrides.js
// Runtime guard for coordinate hotfixes when places_index.json is present.
// History Go source data uses lat/lon. Do not use lng.
(function () {
  "use strict";

  if (window.__HG_PLACE_COORDINATE_OVERRIDES_PATCHED__) return;
  window.__HG_PLACE_COORDINATE_OVERRIDES_PATCHED__ = true;

  const DataHub = window.DataHub;
  if (!DataHub || typeof DataHub.loadPlacesBase !== "function" || typeof DataHub.fetchJSON !== "function") {
    console.warn("[place-coordinate-overrides] DataHub mangler; hopper over koordinat-overrides.");
    return;
  }

  let overridesPromise = null;

  function isNum(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  async function loadCoordinateOverrides(opts = {}) {
    if (overridesPromise && !opts?.bust) return overridesPromise;

    const base = String(DataHub.DEFAULTS?.DATA_BASE || "data").replace(/\/+$/, "");
    const url = `${base}/places/coordinate_overrides.json`;

    overridesPromise = DataHub.fetchJSON(url, { ...opts, cache: opts?.cache || "no-store" })
      .then((data) => Array.isArray(data) ? data : [])
      .catch(() => []);

    return overridesPromise;
  }

  function cleanOverride(raw) {
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

  function applyCoordinateOverrides(places, rawOverrides) {
    const list = Array.isArray(places) ? places : [];
    const overrides = (Array.isArray(rawOverrides) ? rawOverrides : [])
      .map(cleanOverride)
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
      console.info(`[place-coordinate-overrides] applied ${applied} override(s).`);
    }

    return patched;
  }

  const originalLoadPlacesBase = DataHub.loadPlacesBase.bind(DataHub);
  DataHub.loadPlacesBase = async function loadPlacesBaseWithCoordinateOverrides(opts = {}) {
    const [places, overrides] = await Promise.all([
      originalLoadPlacesBase(opts),
      loadCoordinateOverrides(opts),
    ]);
    return applyCoordinateOverrides(places, overrides);
  };

  DataHub.loadPlaces = DataHub.loadPlacesBase;
  window.HGApplyCoordinateOverrides = applyCoordinateOverrides;
})();
