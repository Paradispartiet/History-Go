// js/core/domainRuntime.js
// ------------------------------------------------------
// Pure helpers for the two explicit History Go domain-id directions.
//
// Callers must normalize at the source before runtime writes or fag loads:
// - runtime badges/merits/progression: toRuntimeCategoryId()
// - fag/emner/pensum: toFagSubjectId()
//
// This module does not intercept or migrate storage.
// ------------------------------------------------------

(function () {
  const RUNTIME_ALIASES = {
    popkultur: "populaerkultur",
    "populærkultur": "populaerkultur",
    popular_kultur: "populaerkultur",
    popularculture: "populaerkultur",
    popular_culture: "populaerkultur",
    "popular-culture": "populaerkultur",
    "popular culture": "populaerkultur"
  };

  function s(value) {
    return String(value ?? "").trim();
  }

  function warn(...args) {
    if (window.DEBUG) console.warn("[HGDomainRuntime]", ...args);
  }

  function toRuntimeCategoryId(value) {
    const raw = s(value);
    if (!raw) return "";

    const normalizer = window.DomainRegistry?.toRuntimeCategoryId;
    if (typeof normalizer === "function") {
      try {
        return s(normalizer(raw));
      } catch (err) {
        warn("DomainRegistry rejected runtime category", raw, err);
      }
    }

    return RUNTIME_ALIASES[raw] || raw;
  }

  function toFagSubjectId(value) {
    const raw = s(value);
    if (!raw) return "";

    const normalizer = window.DomainRegistry?.toFagSubjectId;
    if (typeof normalizer === "function") {
      try {
        return s(normalizer(raw));
      } catch (err) {
        warn("DomainRegistry rejected fag subject", raw, err);
      }
    }

    if (raw === "populaerkultur" || raw === "populærkultur") return "popkultur";
    return raw;
  }

  function mergeArrays(existing, incoming) {
    const out = [];
    for (const item of [].concat(
      Array.isArray(existing) ? existing : [],
      Array.isArray(incoming) ? incoming : []
    )) {
      if (!out.some(candidate => JSON.stringify(candidate) === JSON.stringify(item))) {
        out.push(item);
      }
    }
    return out;
  }

  function isPlainObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function mergeValues(existing, incoming) {
    if (existing == null) return incoming;
    if (incoming == null) return existing;

    if (Array.isArray(existing) || Array.isArray(incoming)) {
      return mergeArrays(existing, incoming);
    }

    if (isPlainObject(existing) && isPlainObject(incoming)) {
      const out = { ...existing };
      for (const [key, value] of Object.entries(incoming)) {
        if (
          (key === "points" || key === "count") &&
          Number.isFinite(Number(out[key])) &&
          Number.isFinite(Number(value))
        ) {
          out[key] = Number(out[key] || 0) + Number(value || 0);
        } else {
          out[key] = mergeValues(out[key], value);
        }
      }
      return out;
    }

    return existing;
  }

  function normalizeCategoryMap(map) {
    if (!isPlainObject(map)) return map;

    const out = {};
    for (const [key, value] of Object.entries(map)) {
      const runtimeKey = toRuntimeCategoryId(key) || key;
      out[runtimeKey] = mergeValues(out[runtimeKey], value);
    }
    return out;
  }

  window.HGDomainRuntime = {
    toRuntimeCategoryId,
    toFagSubjectId,
    normalizeCategoryMap
  };
})();
