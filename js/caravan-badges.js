// Local-only Karavane badges v1. No profile, backend, quiz or global merits coupling.
(function () {
  "use strict";

  const PREFIX = "[HG_CARAVAN_BADGES]";
  const STORAGE_KEY = "HG_CARAVAN_BADGES_V1";
  const VERSION = 1;
  const STARTED_STATUSES = new Set(["started", "completed"]);

  function now() { return new Date().toISOString(); }
  function clean(value) { return String(value ?? "").trim(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function warn(message, detail) { if (detail !== undefined) console.warn(PREFIX, message, detail); else console.warn(PREFIX, message); }
  function emptyState() { return { version: VERSION, updatedAt: now(), unlocked: {} }; }

  function normalizeState(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return emptyState();
    const unlocked = raw.unlocked && typeof raw.unlocked === "object" && !Array.isArray(raw.unlocked) ? raw.unlocked : {};
    return { version: VERSION, updatedAt: clean(raw.updatedAt) || now(), unlocked };
  }

  function readState() {
    try {
      const text = window.localStorage?.getItem(STORAGE_KEY);
      if (!text) return emptyState();
      return normalizeState(JSON.parse(text));
    } catch (error) {
      warn("korrupt localStorage; bruker tom badge-state", { error: error?.message || error });
      return emptyState();
    }
  }

  function writeState(state) {
    const next = normalizeState(state);
    next.updatedAt = now();
    try { window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch (error) { warn("kunne ikke lagre badges", { error: error?.message || error }); }
    return next;
  }

  function getAllBadges() {
    return (Array.isArray(window.HG_CARAVAN?.badges) ? window.HG_CARAVAN.badges : [])
      .filter((badge) => badge?.visible !== false)
      .slice()
      .sort((a, b) => Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0))
      .map(clone);
  }

  function getUnlocked() { return clone(readState().unlocked); }
  function isUnlocked(badgeId) { return Boolean(readState().unlocked?.[clean(badgeId)]); }

  function progressEntries() {
    const api = window.HG_CARAVAN_PROGRESS;
    if (!api?.getAll) { warn("HG_CARAVAN_PROGRESS mangler"); return []; }
    const progress = api.getAll()?.progress || {};
    const entries = [];
    for (const [routeId, stages] of Object.entries(progress)) {
      for (const [stageId, modes] of Object.entries(stages || {})) {
        for (const [mode, entry] of Object.entries(modes || {})) entries.push({ routeId, stageId, mode, status: clean(entry?.status) });
      }
    }
    return entries;
  }

  function eventEntries() {
    const api = window.HG_CARAVAN_EVENT_LOG;
    if (!api?.getAll) { warn("HG_CARAVAN_EVENT_LOG mangler"); return []; }
    return Array.isArray(api.getAll()?.entries) ? api.getAll().entries : [];
  }

  function consequenceEntries() {
    const api = window.HG_CARAVAN_CONSEQUENCES;
    if (!api?.getAll) { warn("HG_CARAVAN_CONSEQUENCES mangler"); return []; }
    const applied = api.getAll()?.applied || {};
    const entries = [];
    for (const stages of Object.values(applied)) for (const events of Object.values(stages || {})) for (const modes of Object.values(events || {})) for (const entry of Object.values(modes || {})) if (entry) entries.push(entry);
    return entries;
  }

  function diaryEntries() {
    const api = window.HG_CARAVAN_DIARY;
    if (!api?.getEntries) { warn("HG_CARAVAN_DIARY mangler"); return []; }
    const routes = Array.isArray(window.HG_CARAVAN?.routes) ? window.HG_CARAVAN.routes : [];
    return routes.flatMap((route) => api.getEntries(clean(route?.id), "all") || []);
  }

  function eventById(eventId) {
    const id = clean(eventId);
    return window.HG_CARAVAN?.indexes?.eventsById?.[id] || (Array.isArray(window.HG_CARAVAN?.events) ? window.HG_CARAVAN.events.find((event) => clean(event?.id) === id) : null);
  }

  function evaluateBadge(badgeId) {
    const badge = window.HG_CARAVAN?.indexes?.badgesById?.[clean(badgeId)] || getAllBadges().find((item) => clean(item?.id) === clean(badgeId));
    if (!badge) return false;
    const criteria = badge.criteria || {};
    const count = Number(criteria.count || 1);
    switch (clean(badge.criteria_type)) {
      case "completed_stage_count":
        return progressEntries().filter((entry) => entry.status === "completed" && (!criteria.mode || entry.mode === criteria.mode) && (!criteria.route_id || entry.routeId === criteria.route_id)).length >= count;
      case "started_stage_count":
        return progressEntries().filter((entry) => STARTED_STATUSES.has(entry.status) && (!criteria.mode || entry.mode === criteria.mode)).length >= count;
      case "route_started":
        return progressEntries().some((entry) => entry.routeId === criteria.route_id && STARTED_STATUSES.has(entry.status));
      case "event_choice_logged":
        return eventEntries().length >= count;
      case "event_type_choice_logged":
        return eventEntries().filter((entry) => clean(eventById(entry.event_id)?.event_type) === clean(criteria.event_type)).length >= count;
      case "consequence_applied_count":
        return consequenceEntries().length >= count;
      case "diary_entry_count":
        return diaryEntries().length >= count;
      default:
        warn("ukjent criteria_type", { badge_id: badge.id, criteria_type: badge.criteria_type });
        return false;
    }
  }

  function unlock(badgeId) {
    const id = clean(badgeId);
    if (!id) return null;
    const state = readState();
    if (state.unlocked[id]) return clone(state.unlocked[id]);
    state.unlocked[id] = { unlockedAt: now() };
    writeState(state);
    const badge = window.HG_CARAVAN?.indexes?.badgesById?.[id] || getAllBadges().find((item) => clean(item?.id) === id);
    try { window.dispatchEvent?.(new CustomEvent("hg:caravanBadgeUnlocked", { detail: { badgeId: id, badge: clone(badge || { id }) } })); } catch {}
    return clone(state.unlocked[id]);
  }

  function evaluateAll() {
    const unlocked = [];
    for (const badge of getAllBadges()) {
      try { if (!isUnlocked(badge.id) && evaluateBadge(badge.id)) unlocked.push({ badge, state: unlock(badge.id) }); }
      catch (error) { warn("badge-evaluering feilet", { badge_id: badge?.id, error: error?.message || error }); }
    }
    return unlocked;
  }

  function resetBadges() { try { window.localStorage?.removeItem(STORAGE_KEY); } catch (error) { warn("kunne ikke nullstille badges", { error: error?.message || error }); } return emptyState(); }
  function summary() { const total = getAllBadges().length; const unlocked = Object.keys(readState().unlocked || {}).length; return { total, unlocked, locked: Math.max(0, total - unlocked) }; }

  window.HG_CARAVAN_BADGES = { getAllBadges, getUnlocked, isUnlocked, evaluateBadge, evaluateAll, unlock, resetBadges, summary };
})();
