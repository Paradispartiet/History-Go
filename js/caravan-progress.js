// js/caravan-progress.js
// Local-only progression state for Karavane stages. No backend, login, routing or quiz runtime coupling.
(function () {
  "use strict";

  const PREFIX = "[HG_CARAVAN_PROGRESS]";
  const STORAGE_KEY = "HG_CARAVAN_PROGRESS_V1";
  const VERSION = 1;
  const MODES = new Set(["til_fots", "hest", "sykkel"]);
  const STATUSES = new Set(["none", "planned", "started", "completed"]);

  function now() { return new Date().toISOString(); }
  function clean(value) { return String(value ?? "").trim(); }
  function emptyState() { return { version: VERSION, updatedAt: now(), progress: {} }; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function isKnownStage(routeId, stageId) {
    const runtime = window.HG_CARAVAN;
    if (!runtime || !Array.isArray(runtime.stages)) return true;
    return runtime.stages.some((stage) => clean(stage?.id) === stageId && clean(stage?.route_id) === routeId);
  }

  function warnMissingStage(routeId, stageId) {
    if (!routeId || !stageId) return;
    if (!isKnownStage(routeId, stageId)) console.warn(PREFIX, "stage mangler", { route_id: routeId, stage_id: stageId });
  }

  function normalizeState(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return emptyState();
    const progress = raw.progress && typeof raw.progress === "object" && !Array.isArray(raw.progress) ? raw.progress : {};
    return { version: VERSION, updatedAt: clean(raw.updatedAt) || now(), progress };
  }

  function readState() {
    try {
      const text = window.localStorage?.getItem(STORAGE_KEY);
      if (!text) return emptyState();
      return normalizeState(JSON.parse(text));
    } catch (error) {
      console.warn(PREFIX, "korrupt localStorage; resetter progresjon", { error: error?.message || error });
      return emptyState();
    }
  }

  function writeState(state) {
    const next = normalizeState(state);
    next.updatedAt = now();
    try { window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch (error) { console.warn(PREFIX, "kunne ikke lagre progresjon", { error: error?.message || error }); }
    return next;
  }

  function validMode(mode) { return MODES.has(clean(mode)); }
  function validStatus(status) { return STATUSES.has(clean(status)); }

  function getProgress(routeId, stageId, mode) {
    const rid = clean(routeId); const sid = clean(stageId); const m = clean(mode);
    if (!rid || !sid || !validMode(m)) return null;
    warnMissingStage(rid, sid);
    return readState().progress?.[rid]?.[sid]?.[m] || null;
  }

  function setProgress(routeId, stageId, mode, status) {
    const rid = clean(routeId); const sid = clean(stageId); const m = clean(mode); const s = clean(status);
    if (!rid || !sid || !validMode(m) || !validStatus(s)) return null;
    warnMissingStage(rid, sid);
    if (s === "none") return clearProgress(rid, sid, m);
    const state = readState();
    state.progress[rid] = state.progress[rid] || {};
    state.progress[rid][sid] = state.progress[rid][sid] || {};
    state.progress[rid][sid][m] = { status: s, updatedAt: now() };
    writeState(state);
    window.dispatchEvent?.(new CustomEvent("hg:caravanProgressUpdated", { detail: { routeId: rid, stageId: sid, mode: m, status: s } }));
    return clone(state.progress[rid][sid][m]);
  }

  function clearProgress(routeId, stageId, mode) {
    const rid = clean(routeId); const sid = clean(stageId); const m = clean(mode);
    if (!rid || !sid || !validMode(m)) return null;
    warnMissingStage(rid, sid);
    const state = readState();
    if (state.progress?.[rid]?.[sid]?.[m]) delete state.progress[rid][sid][m];
    if (state.progress?.[rid]?.[sid] && !Object.keys(state.progress[rid][sid]).length) delete state.progress[rid][sid];
    if (state.progress?.[rid] && !Object.keys(state.progress[rid]).length) delete state.progress[rid];
    writeState(state);
    window.dispatchEvent?.(new CustomEvent("hg:caravanProgressUpdated", { detail: { routeId: rid, stageId: sid, mode: m, status: "none" } }));
    return null;
  }

  function getRouteSummary(routeId, mode) {
    const rid = clean(routeId); const m = clean(mode);
    const stages = Array.isArray(window.HG_CARAVAN?.stages) ? window.HG_CARAVAN.stages.filter((stage) => clean(stage?.route_id) === rid) : [];
    const state = readState();
    const route = state.progress?.[rid] || {};
    if (validMode(m)) {
      const completed = stages.filter((stage) => route?.[clean(stage?.id)]?.[m]?.status === "completed").length;
      return { routeId: rid, mode: m, completed, total: stages.length };
    }
    let points = 0;
    Object.values(route).forEach((stageProgress) => Object.values(stageProgress || {}).forEach((entry) => { if (entry?.status && entry.status !== "none") points += 1; }));
    return { routeId: rid, mode: "all", progressionPoints: points, total: stages.length };
  }

  function getAll() { return clone(readState()); }

  window.HG_CARAVAN_PROGRESS = { getProgress, setProgress, clearProgress, getRouteSummary, getAll };
})();
