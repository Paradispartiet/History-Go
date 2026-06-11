// js/core/domainRuntime.js
// ------------------------------------------------------
// HGDomainRuntime
// ------------------------------------------------------
// Runtime-bro mellom fag/editorial-id-er og runtime category/badge/progression-id-er.
//
// Hovedregel:
// - Fag/emner/pensum bruker DomainRegistry.toFagSubjectId()
// - Badges/merits/place.category/quiz categoryId bruker toRuntimeCategoryId()
//
// Denne fila er bevisst liten og runtime-orientert. Den migrerer ikke datafiler.
// Den beskytter bare runtime-laget mot at alias som "popkultur" blir et nytt
// badge-/merit-/progression-spor ved en feil.
// ------------------------------------------------------

(function () {
  const STORAGE_KEYS_CATEGORY_MAP = new Set([
    "merits_by_category",
    "quiz_progress"
  ]);

  const STORAGE_KEYS_EVENT_LIST = new Set([
    "hg_learning_log_v1"
  ]);

  const RUNTIME_ALIASES = {
    popkultur: "populaerkultur",
    "populærkultur": "populaerkultur",
    popular_kultur: "populaerkultur",
    popularculture: "populaerkultur",
    popular_culture: "populaerkultur",
    "popular-culture": "populaerkultur",
    "popular culture": "populaerkultur"
  };

  let storageGuardInstalled = false;

  function s(value) {
    return String(value ?? "").trim();
  }

  function warn(...args) {
    if (window.DEBUG) console.warn("[HGDomainRuntime]", ...args);
  }

  function toRuntimeCategoryId(value) {
    const raw = s(value);
    if (!raw) return "";

    const bridge = window.DomainRegistry?.toRuntimeCategoryId;
    if (typeof bridge === "function") {
      try {
        return s(bridge(raw));
      } catch (err) {
        warn("DomainRegistry rejected runtime category", raw, err);
      }
    }

    return RUNTIME_ALIASES[raw] || raw;
  }

  function toFagSubjectId(value) {
    const raw = s(value);
    if (!raw) return "";

    const bridge = window.DomainRegistry?.toFagSubjectId || window.DomainRegistry?.resolve;
    if (typeof bridge === "function") {
      try {
        return s(bridge(raw));
      } catch (err) {
        warn("DomainRegistry rejected fag subject", raw, err);
      }
    }

    if (raw === "populaerkultur" || raw === "populærkultur") return "popkultur";
    return raw;
  }

  function mergeArrays(a, b) {
    const out = [];
    for (const item of [].concat(Array.isArray(a) ? a : [], Array.isArray(b) ? b : [])) {
      if (!out.some(x => JSON.stringify(x) === JSON.stringify(item))) out.push(item);
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
        if ((key === "points" || key === "count") && Number.isFinite(Number(out[key])) && Number.isFinite(Number(value))) {
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

  function normalizeEvent(event) {
    if (!isPlainObject(event)) return event;

    const out = { ...event };
    if (out.categoryId != null) out.categoryId = toRuntimeCategoryId(out.categoryId);
    if (out.category_id != null) out.category_id = toRuntimeCategoryId(out.category_id);

    // Bare runtime-kategori-felt normaliseres her. Fagfelt som emne_id, dimension,
    // epoke_domain osv. får stå urørt fordi de kan være fag/editorial-konsepter.
    return out;
  }

  function normalizeEventList(list) {
    if (!Array.isArray(list)) return list;
    return list.map(normalizeEvent);
  }

  function normalizeStoragePayload(key, payload) {
    const storageKey = s(key);
    if (!storageKey || typeof payload !== "string" || !payload) return payload;

    if (!STORAGE_KEYS_CATEGORY_MAP.has(storageKey) && !STORAGE_KEYS_EVENT_LIST.has(storageKey)) {
      return payload;
    }

    try {
      const parsed = JSON.parse(payload);
      const normalized = STORAGE_KEYS_CATEGORY_MAP.has(storageKey)
        ? normalizeCategoryMap(parsed)
        : normalizeEventList(parsed);
      return JSON.stringify(normalized);
    } catch (err) {
      warn("Could not normalize storage payload", storageKey, err);
      return payload;
    }
  }

  function installStorageGuard() {
    if (storageGuardInstalled) return true;
    if (!window.Storage || !window.localStorage) return false;

    const proto = window.Storage.prototype;
    if (proto.__HGDomainRuntimeGuardInstalled) {
      storageGuardInstalled = true;
      return true;
    }

    const originalGetItem = proto.getItem;
    const originalSetItem = proto.setItem;

    proto.getItem = function hgDomainRuntimeGetItem(key) {
      const value = originalGetItem.call(this, key);
      return normalizeStoragePayload(key, value);
    };

    proto.setItem = function hgDomainRuntimeSetItem(key, value) {
      const normalized = normalizeStoragePayload(key, String(value));
      return originalSetItem.call(this, key, normalized);
    };

    try {
      Object.defineProperty(proto, "__HGDomainRuntimeGuardInstalled", {
        value: true,
        enumerable: false,
        configurable: false
      });
    } catch {}

    storageGuardInstalled = true;
    return true;
  }

  function normalizeHookCategoryArg(fn) {
    if (typeof fn !== "function") return fn;

    return function hgDomainRuntimeHook(categoryId, ...rest) {
      return fn.call(this, toRuntimeCategoryId(categoryId), ...rest);
    };
  }

  window.HGDomainRuntime = {
    toRuntimeCategoryId,
    toFagSubjectId,
    normalizeCategoryMap,
    normalizeEvent,
    normalizeEventList,
    normalizeStoragePayload,
    installStorageGuard,
    normalizeHookCategoryArg
  };

  installStorageGuard();
})();
