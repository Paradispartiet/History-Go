// js/caravan-event-log.js
// Local-only choice log for Karavane events. No backend, simulator, routing or quiz coupling.
(function () {
  "use strict";

  const PREFIX = "[HG_CARAVAN_EVENT_LOG]";
  const STORAGE_KEY = "HG_CARAVAN_EVENT_LOG_V1";
  const VERSION = 1;
  const MODES = new Set(["til_fots", "hest", "sykkel"]);

  function now() { return new Date().toISOString(); }
  function clean(value) { return String(value ?? "").trim(); }
  function emptyState() { return { version: VERSION, updatedAt: now(), entries: [] }; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function validMode(mode) { return MODES.has(clean(mode)); }
  function entryId(routeId, stageId, eventId, mode) { return [routeId, stageId, eventId, mode].map(encodeURIComponent).join("__"); }
  function warn(message, detail) { console.warn(PREFIX, message, detail || ""); }

  function normalizeEntry(entry) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
    const route_id = clean(entry.route_id);
    const stage_id = clean(entry.stage_id);
    const event_id = clean(entry.event_id);
    const choice_id = clean(entry.choice_id);
    const travel_mode = clean(entry.travel_mode);
    if (!route_id || !stage_id || !event_id || !choice_id || !validMode(travel_mode)) return null;
    return {
      id: clean(entry.id) || entryId(route_id, stage_id, event_id, travel_mode),
      route_id,
      stage_id,
      event_id,
      choice_id,
      travel_mode,
      createdAt: clean(entry.createdAt) || now()
    };
  }

  function normalizeState(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return emptyState();
    const seen = new Set();
    const entries = [];
    for (const rawEntry of Array.isArray(raw.entries) ? raw.entries : []) {
      const entry = normalizeEntry(rawEntry);
      if (!entry) continue;
      const key = entryId(entry.route_id, entry.stage_id, entry.event_id, entry.travel_mode);
      if (seen.has(key)) {
        const index = entries.findIndex((item) => entryId(item.route_id, item.stage_id, item.event_id, item.travel_mode) === key);
        if (index >= 0) entries[index] = entry;
      } else {
        seen.add(key);
        entries.push(entry);
      }
    }
    return { version: VERSION, updatedAt: clean(raw.updatedAt) || now(), entries };
  }

  function readState() {
    try {
      const text = window.localStorage?.getItem(STORAGE_KEY);
      if (!text) return emptyState();
      return normalizeState(JSON.parse(text));
    } catch (error) {
      warn("korrupt localStorage; resetter logg", { error: error?.message || error });
      try { window.localStorage?.removeItem(STORAGE_KEY); } catch {}
      return emptyState();
    }
  }

  function writeState(state) {
    const next = normalizeState(state);
    next.updatedAt = now();
    try { window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch (error) { warn("kunne ikke lagre eventvalg", { error: error?.message || error }); }
    return next;
  }

  function getAll() { return clone(readState()); }

  function getChoice(routeId, stageId, eventId, mode) {
    const rid = clean(routeId); const sid = clean(stageId); const eid = clean(eventId); const m = clean(mode);
    if (!rid || !sid || !eid || !validMode(m)) { warn("ugyldig getChoice", { routeId, stageId, eventId, mode }); return null; }
    return clone(readState().entries.find((entry) => entry.route_id === rid && entry.stage_id === sid && entry.event_id === eid && entry.travel_mode === m) || null);
  }

  function setChoice(routeId, stageId, eventId, mode, choiceId) {
    const rid = clean(routeId); const sid = clean(stageId); const eid = clean(eventId); const m = clean(mode); const cid = clean(choiceId);
    if (!rid || !sid || !eid || !cid || !validMode(m)) { warn("ugyldig setChoice", { routeId, stageId, eventId, mode, choiceId }); return null; }
    const state = readState();
    const key = entryId(rid, sid, eid, m);
    const entry = { id: key, route_id: rid, stage_id: sid, event_id: eid, choice_id: cid, travel_mode: m, createdAt: now() };
    state.entries = state.entries.filter((item) => entryId(item.route_id, item.stage_id, item.event_id, item.travel_mode) !== key);
    state.entries.push(entry);
    writeState(state);
    window.dispatchEvent?.(new CustomEvent("hg:caravanEventChoiceUpdated", { detail: clone(entry) }));
    return clone(entry);
  }

  function clearChoice(routeId, stageId, eventId, mode) {
    const rid = clean(routeId); const sid = clean(stageId); const eid = clean(eventId); const m = clean(mode);
    if (!rid || !sid || !eid || !validMode(m)) { warn("ugyldig clearChoice", { routeId, stageId, eventId, mode }); return null; }
    const state = readState();
    state.entries = state.entries.filter((entry) => !(entry.route_id === rid && entry.stage_id === sid && entry.event_id === eid && entry.travel_mode === m));
    writeState(state);
    window.dispatchEvent?.(new CustomEvent("hg:caravanEventChoiceUpdated", { detail: { route_id: rid, stage_id: sid, event_id: eid, travel_mode: m, choice_id: null } }));
    return null;
  }

  function filterEntries(routeId, mode, stageId) {
    const rid = clean(routeId); const m = clean(mode); const sid = clean(stageId);
    if (!rid) { warn("ugyldig loggoppslag", { routeId, mode, stageId }); return []; }
    const includeAllModes = m === "all" || !m;
    if (!includeAllModes && !validMode(m)) { warn("ugyldig mode", { mode }); return []; }
    return readState().entries.filter((entry) => entry.route_id === rid && (!sid || entry.stage_id === sid) && (includeAllModes || entry.travel_mode === m)).map(clone);
  }

  function getStageLog(routeId, stageId, mode) { return filterEntries(routeId, mode, stageId); }
  function getRouteLog(routeId, mode) { return filterEntries(routeId, mode, ""); }

  function summary(routeId, mode) {
    const rid = clean(routeId); const m = clean(mode) || "all";
    const entries = getRouteLog(rid, m);
    return { route_id: rid, mode: validMode(m) ? m : "all", choices: entries.length, stagesWithChoices: new Set(entries.map((entry) => entry.stage_id)).size, eventsWithChoices: new Set(entries.map((entry) => entry.event_id)).size };
  }

  window.HG_CARAVAN_EVENT_LOG = { getAll, getChoice, setChoice, clearChoice, getStageLog, getRouteLog, summary };
})();
