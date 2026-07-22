(function () {
  "use strict";

  const root = window;
  const STORAGE_KEY = "HG_TEST_MODE";
  const LEGACY_STORAGE_KEY = "HG_OPEN_MODE";
  const QUERY_KEY = "hgTest";

  let enabled = false;
  let initialized = false;
  let bootFinalized = false;

  function safeGet(key) {
    try {
      return root.localStorage?.getItem?.(key) ?? null;
    } catch {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      root.localStorage?.setItem?.(key, value);
    } catch {}
  }

  function safeRemove(key) {
    try {
      root.localStorage?.removeItem?.(key);
    } catch {}
  }

  function syncGlobals(next) {
    enabled = next === true;
    root.HG_TEST_MODE = enabled;
    root.TEST_MODE = enabled;

    // Midlertidig runtime-alias for gammel kode. Dette er ikke lenger en
    // offentlig innstilling eller en egen permanent modus.
    root.OPEN_MODE = enabled;

    if (root.HG_ENV && typeof root.HG_ENV === "object") {
      root.HG_ENV.testMode = enabled;
      root.HG_ENV.openMode = enabled;
    }

    return enabled;
  }

  function emitChange() {
    try {
      root.dispatchEvent?.(new CustomEvent("hg:testModeChanged", {
        detail: { enabled }
      }));
    } catch {}
  }

  function readQueryOverride() {
    try {
      const url = new URL(root.location.href);
      const raw = url.searchParams.get(QUERY_KEY);
      if (raw !== "1" && raw !== "0") return null;

      url.searchParams.delete(QUERY_KEY);
      const cleanUrl = url.pathname + url.search + url.hash;
      root.history?.replaceState?.(root.history.state, "", cleanUrl);
      return raw === "1";
    } catch {
      return null;
    }
  }

  function prepareLegacyBootBridge() {
    safeRemove(LEGACY_STORAGE_KEY);
    if (!bootFinalized && enabled) safeSet(LEGACY_STORAGE_KEY, "1");
  }

  function setEnabled(next, options = {}) {
    const previous = enabled;
    const normalized = next === true;

    if (options.persist !== false) {
      if (normalized) safeSet(STORAGE_KEY, "1");
      else safeRemove(STORAGE_KEY);
    }

    syncGlobals(normalized);
    prepareLegacyBootBridge();

    if (previous !== enabled && options.emit !== false) emitChange();
    return enabled;
  }

  function init() {
    if (initialized) return syncGlobals(enabled);
    initialized = true;

    const queryOverride = readQueryOverride();
    const stored = safeGet(STORAGE_KEY) === "1";

    // Gammel offentlig HG_OPEN_MODE-state skal ikke kunne holde GPS-bypass på.
    safeRemove(LEGACY_STORAGE_KEY);
    return setEnabled(queryOverride === null ? stored : queryOverride, {
      persist: true,
      emit: false
    });
  }

  function finalizeBoot() {
    bootFinalized = true;
    safeRemove(LEGACY_STORAGE_KEY);
    return enabled;
  }

  function isEnabled() {
    if (!initialized) init();
    return enabled;
  }

  function enable() {
    return setEnabled(true);
  }

  function disable() {
    return setEnabled(false);
  }

  const api = {
    STORAGE_KEY,
    QUERY_KEY,
    get enabled() {
      return enabled;
    },
    init,
    isEnabled,
    setEnabled,
    enable,
    disable,
    finalizeBoot
  };

  root.HGTestMode = api;
  root.HG_TestMode = api;
  init();

  root.addEventListener?.("hg:criticalReady", finalizeBoot, { once: true });
  root.addEventListener?.("hg:appReady", finalizeBoot, { once: true });
})();
