// js/caravan-resources.js
// Local-only resource status for Karavane travel modes. No simulator, backend, login, routing or quiz coupling.
(function () {
  "use strict";

  const PREFIX = "[HG_CARAVAN_RESOURCES]";
  const STORAGE_KEY = "HG_CARAVAN_RESOURCES_V1";
  const VERSION = 1;
  const RESOURCE_KEYS_BY_MODE = {
    til_fots: ["energi", "vann", "hvile", "utstyr"],
    hest: ["energi", "vann", "hvile", "hestehelse", "utstyr"],
    sykkel: ["energi", "vann", "hvile", "sykkelstand", "utstyr"]
  };

  function now() { return new Date().toISOString(); }
  function emptyState() { return { version: VERSION, updatedAt: now(), resources: {} }; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function routeKey(routeId) { return routeId == null ? "" : String(routeId); }
  function clean(value) { return String(value ?? "").trim(); }
  function clamp(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function isValidMode(mode) {
    const m = clean(mode);
    if (Object.prototype.hasOwnProperty.call(RESOURCE_KEYS_BY_MODE, m)) return true;
    console.warn(PREFIX, "ugyldig travel mode", { mode });
    return false;
  }

  function isValidResourceKey(mode, resourceKey) {
    const key = clean(resourceKey);
    if (RESOURCE_KEYS_BY_MODE[mode]?.includes(key)) return true;
    console.warn(PREFIX, "ugyldig ressursnøkkel", { mode, resourceKey });
    return false;
  }

  function defaultResourcesForMode(mode) {
    const entry = { updatedAt: now() };
    for (const key of RESOURCE_KEYS_BY_MODE[mode] || []) entry[key] = 100;
    return entry;
  }

  function normalizeModeEntry(mode, raw) {
    const base = defaultResourcesForMode(mode);
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const key of RESOURCE_KEYS_BY_MODE[mode]) base[key] = clamp(raw[key] == null ? 100 : raw[key]);
      base.updatedAt = clean(raw.updatedAt) || base.updatedAt;
    }
    return base;
  }

  function normalizeState(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return emptyState();
    const resources = raw.resources && typeof raw.resources === "object" && !Array.isArray(raw.resources) ? raw.resources : {};
    return { version: VERSION, updatedAt: clean(raw.updatedAt) || now(), resources };
  }

  function readState() {
    try {
      const text = window.localStorage?.getItem(STORAGE_KEY);
      if (!text) return emptyState();
      return normalizeState(JSON.parse(text));
    } catch (error) {
      console.warn(PREFIX, "korrupt localStorage; resetter ressurser", { error: error?.message || error });
      return emptyState();
    }
  }

  function writeState(state) {
    const next = normalizeState(state);
    next.updatedAt = now();
    try { window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch (error) { console.warn(PREFIX, "kunne ikke lagre ressurser", { error: error?.message || error }); }
    return next;
  }

  function ensureModeResources(state, rid, mode) {
    state.resources[rid] = state.resources[rid] || {};
    state.resources[rid][mode] = normalizeModeEntry(mode, state.resources[rid][mode]);
    return state.resources[rid][mode];
  }

  function emit(detail) {
    try { window.dispatchEvent?.(new CustomEvent("hg:caravanResourcesUpdated", { detail })); }
    catch (error) { console.warn(PREFIX, "kunne ikke sende ressurs-event", { error: error?.message || error }); }
  }

  function getResources(routeId, mode) {
    const rid = routeKey(routeId);
    const m = clean(mode);
    if (!rid || !isValidMode(m)) return null;
    const state = readState();
    return clone(normalizeModeEntry(m, state.resources?.[rid]?.[m]));
  }

  function setResource(routeId, mode, resourceKey, value) {
    const rid = routeKey(routeId);
    const m = clean(mode);
    const key = clean(resourceKey);
    if (!rid || !isValidMode(m) || !isValidResourceKey(m, key)) return null;
    const state = readState();
    const entry = ensureModeResources(state, rid, m);
    entry[key] = clamp(value);
    entry.updatedAt = now();
    writeState(state);
    emit({ routeId: rid, mode: m, resourceKey: key, value: entry[key] });
    return clone(entry);
  }

  function adjustResource(routeId, mode, resourceKey, delta) {
    const rid = routeKey(routeId);
    const m = clean(mode);
    const key = clean(resourceKey);
    if (!rid || !isValidMode(m) || !isValidResourceKey(m, key)) return null;
    const current = getResources(rid, m) || defaultResourcesForMode(m);
    return setResource(rid, m, key, Number(current[key] || 0) + Number(delta || 0));
  }

  function resetResources(routeId, mode) {
    const rid = routeKey(routeId);
    const m = clean(mode);
    if (!rid || !isValidMode(m)) return null;
    const state = readState();
    state.resources[rid] = state.resources[rid] || {};
    state.resources[rid][m] = defaultResourcesForMode(m);
    writeState(state);
    emit({ routeId: rid, mode: m, reset: true });
    return clone(state.resources[rid][m]);
  }

  function getAll() { return clone(readState()); }

  window.HG_CARAVAN_RESOURCES = { getResources, setResource, adjustResource, resetResources, getAll };
})();
