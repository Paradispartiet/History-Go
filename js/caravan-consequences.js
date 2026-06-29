// js/caravan-consequences.js
// Explicit, local-only consequence application for Karavane event choices. No simulator or automatic resource use.
(function () {
  "use strict";

  const PREFIX = "[HG_CARAVAN]";
  const STORAGE_KEY = "HG_CARAVAN_CONSEQUENCES_V1";
  const VERSION = 1;
  const MODES = new Set(["til_fots", "hest", "sykkel"]);
  const RESOURCE_KEYS_BY_MODE = {
    til_fots: ["energi", "vann", "hvile", "utstyr"],
    hest: ["energi", "vann", "hvile", "hestehelse", "utstyr"],
    sykkel: ["energi", "vann", "hvile", "sykkelstand", "utstyr"]
  };

  function now() { return new Date().toISOString(); }
  function clean(value) { return String(value ?? "").trim(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function emptyState() { return { version: VERSION, updatedAt: now(), applied: {} }; }
  function warn(message, detail) { console.warn(PREFIX, message, detail); }

  function readState() {
    try {
      const text = window.localStorage?.getItem(STORAGE_KEY);
      if (!text) return emptyState();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return emptyState();
      return { version: VERSION, updatedAt: clean(parsed.updatedAt) || now(), applied: parsed.applied && typeof parsed.applied === "object" && !Array.isArray(parsed.applied) ? parsed.applied : {} };
    } catch (error) {
      warn("korrupt localStorage for konsekvenser; bruker tom state", { error: error?.message || error });
      return emptyState();
    }
  }

  function writeState(state) {
    const next = { version: VERSION, updatedAt: now(), applied: state?.applied && typeof state.applied === "object" && !Array.isArray(state.applied) ? state.applied : {} };
    try { window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch (error) { warn("kunne ikke lagre konsekvenser", { error: error?.message || error }); }
    return next;
  }

  function getEvent(eventId) {
    const id = clean(eventId);
    return (Array.isArray(window.HG_CARAVAN?.events) ? window.HG_CARAVAN.events : []).find((event) => clean(event?.id) === id) || null;
  }

  function getChoice(eventId, choiceId) {
    const event = getEvent(eventId);
    const cid = clean(choiceId);
    return (Array.isArray(event?.choices) ? event.choices : []).find((choice) => clean(choice?.id) === cid) || null;
  }

  function validMode(mode) { return MODES.has(clean(mode)); }
  function validResourceKey(mode, key) { return RESOURCE_KEYS_BY_MODE[clean(mode)]?.includes(clean(key)); }

  function getChoiceEffects(eventId, choiceId, mode) {
    const selected = clean(mode);
    if (!validMode(selected)) return null;
    const raw = getChoice(eventId, choiceId)?.resource_effects_by_mode?.[selected];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const effects = {};
    for (const [key, delta] of Object.entries(raw)) {
      if (validResourceKey(selected, key) && typeof delta === "number" && Number.isFinite(delta)) effects[key] = delta;
    }
    return Object.keys(effects).length ? clone(effects) : null;
  }

  function getApplied(routeId, stageId, eventId, mode) {
    const entry = readState().applied?.[clean(routeId)]?.[clean(stageId)]?.[clean(eventId)]?.[clean(mode)] || null;
    return entry ? clone(entry) : null;
  }

  function canApplyChoiceEffects(routeId, stageId, eventId, choiceId, mode) {
    const rid = clean(routeId), sid = clean(stageId), eid = clean(eventId), cid = clean(choiceId), selected = clean(mode);
    if (!rid || !sid || !eid || !cid || !validMode(selected)) return false;
    if (!getChoiceEffects(eid, cid, selected)) return false;
    return !getApplied(rid, sid, eid, selected);
  }

  function applyChoiceEffects(routeId, stageId, eventId, choiceId, mode) {
    const rid = clean(routeId), sid = clean(stageId), eid = clean(eventId), cid = clean(choiceId), selected = clean(mode);
    const effects = getChoiceEffects(eid, cid, selected);
    if (!rid || !sid || !eid || !cid || !validMode(selected) || !effects) return null;
    if (getApplied(rid, sid, eid, selected)) { warn("konsekvens er allerede brukt for event/mode", { routeId: rid, stageId: sid, eventId: eid, mode: selected }); return null; }
    const resources = window.HG_CARAVAN_RESOURCES;
    if (!resources?.adjustResource) { warn("HG_CARAVAN_RESOURCES.adjustResource mangler", { routeId: rid, mode: selected }); return null; }
    for (const [key, delta] of Object.entries(effects)) resources.adjustResource(rid, selected, key, delta);
    const state = readState();
    (((state.applied[rid] ||= {})[sid] ||= {})[eid] ||= {})[selected] = { choice_id: cid, appliedAt: now(), effects: clone(effects) };
    writeState(state);
    try { window.dispatchEvent?.(new CustomEvent("hg:caravanConsequencesUpdated", { detail: { routeId: rid, stageId: sid, eventId: eid, mode: selected, choiceId: cid, effects: clone(effects) } })); } catch {}
    return getApplied(rid, sid, eid, selected);
  }

  function clearApplied(routeId, stageId, eventId, mode) {
    const rid = clean(routeId), sid = clean(stageId), eid = clean(eventId), selected = clean(mode);
    const state = readState();
    if (state.applied?.[rid]?.[sid]?.[eid]) delete state.applied[rid][sid][eid][selected];
    writeState(state);
    return null;
  }

  function getAll() { return clone(readState()); }

  window.HG_CARAVAN_CONSEQUENCES = { getChoiceEffects, canApplyChoiceEffects, applyChoiceEffects, getApplied, clearApplied, getAll };
})();
