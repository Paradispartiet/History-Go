// js/caravan-diary.js
// Read-only Karavane diary view built from existing local-only progress, event log, resource and consequence APIs.
(function () {
  "use strict";

  const PREFIX = "[HG_CARAVAN_DIARY]";
  const MODES = ["til_fots", "hest", "sykkel"];
  const MODE_LABELS = { til_fots: "Til fots", hest: "Hest", sykkel: "Sykkel", all: "Alle" };
  const PROGRESS_LABELS = { planned: "Planlagt", started: "Påbegynt", completed: "Fullført" };
  const RESOURCE_LABELS = { energi: "Energi", vann: "Vann", hvile: "Hvile", hestehelse: "Hestehelse", sykkelstand: "Sykkelstand", utstyr: "Utstyr" };
  const RESOURCE_KEYS_BY_MODE = {
    til_fots: ["energi", "vann", "hvile", "utstyr"],
    hest: ["energi", "vann", "hvile", "hestehelse", "utstyr"],
    sykkel: ["energi", "vann", "hvile", "sykkelstand", "utstyr"]
  };

  function clean(value) { return String(value ?? "").trim(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function warn(message, detail) { console.warn(PREFIX, message, detail || ""); }
  function normalizeMode(mode) { const m = clean(mode); return MODES.includes(m) ? m : "all"; }
  function modesFor(mode) { const selected = normalizeMode(mode); return selected === "all" ? MODES.slice() : [selected]; }
  function runtime() { return window.HG_CARAVAN || {}; }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function routeStages(routeId) { return asArray(runtime().stages).filter((stage) => clean(stage?.route_id) === clean(routeId)); }
  function stageById(stageId) { return asArray(runtime().stages).find((stage) => clean(stage?.id) === clean(stageId)) || null; }
  function nodeTitle(nodeId) { const id = clean(nodeId); if (!id) return "—"; const node = runtime().indexes?.nodesById?.[id] || asArray(runtime().nodes).find((item) => clean(item?.id) === id); return clean(node?.title) || id; }
  function stageTitle(stageId) { const stage = stageById(stageId); return stage ? `${nodeTitle(stage.from_node)} → ${nodeTitle(stage.to_node)}` : clean(stageId); }
  function eventById(eventId) { const id = clean(eventId); return asArray(runtime().events).find((event) => clean(event?.id) === id) || null; }
  function choiceLabel(event, choiceId) { const id = clean(choiceId); return clean(asArray(event?.choices).find((choice) => clean(choice?.id) === id)?.label) || id; }
  function effectsText(effects) { return Object.entries(effects || {}).map(([key, value]) => `${RESOURCE_LABELS[key] || key} ${Number(value) > 0 ? "+" : ""}${value}`).join(", "); }
  function resourcesText(resources, mode) { return (RESOURCE_KEYS_BY_MODE[mode] || []).map((key) => `${RESOURCE_LABELS[key] || key} ${Number(resources?.[key] ?? 100)}`).join(", "); }
  function hasApi(name, method) { if (window[name]?.[method]) return true; warn(`${name}.${method} mangler`); return false; }

  function progressEntries(routeId, mode, stageId) {
    if (!hasApi("HG_CARAVAN_PROGRESS", "getAll")) return [];
    const rid = clean(routeId);
    const route = window.HG_CARAVAN_PROGRESS.getAll()?.progress?.[rid] || {};
    const entries = [];
    for (const [sid, byMode] of Object.entries(route)) {
      if (stageId && clean(sid) !== clean(stageId)) continue;
      for (const m of modesFor(mode)) {
        const progress = byMode?.[m];
        if (!progress?.status || progress.status === "none") continue;
        entries.push({ type: "progress", route_id: rid, stage_id: sid, mode: m, createdAt: clean(progress.updatedAt), status: progress.status, title: `${stageTitle(sid)} — ${MODE_LABELS[m]} — ${PROGRESS_LABELS[progress.status] || progress.status}` });
      }
    }
    return entries;
  }

  function eventEntries(routeId, mode, stageId) {
    if (!hasApi("HG_CARAVAN_EVENT_LOG", stageId ? "getStageLog" : "getRouteLog")) return [];
    const entries = stageId ? window.HG_CARAVAN_EVENT_LOG.getStageLog(routeId, stageId, normalizeMode(mode)) : window.HG_CARAVAN_EVENT_LOG.getRouteLog(routeId, normalizeMode(mode));
    return asArray(entries).map((entry) => { const event = eventById(entry.event_id); return { type: "event_choice", route_id: entry.route_id, stage_id: entry.stage_id, event_id: entry.event_id, choice_id: entry.choice_id, mode: entry.travel_mode, createdAt: entry.createdAt, title: `${stageTitle(entry.stage_id)} — ${MODE_LABELS[entry.travel_mode] || entry.travel_mode} — ${clean(event?.title) || entry.event_id}: ${choiceLabel(event, entry.choice_id)}` }; });
  }

  function consequenceEntries(routeId, mode, stageId) {
    if (!hasApi("HG_CARAVAN_CONSEQUENCES", "getAll")) return [];
    const rid = clean(routeId);
    const applied = window.HG_CARAVAN_CONSEQUENCES.getAll()?.applied?.[rid] || {};
    const entries = [];
    for (const [sid, byEvent] of Object.entries(applied)) {
      if (stageId && clean(sid) !== clean(stageId)) continue;
      for (const [eid, byMode] of Object.entries(byEvent || {})) for (const m of modesFor(mode)) {
        const item = byMode?.[m];
        if (!item) continue;
        entries.push({ type: "consequence", route_id: rid, stage_id: sid, event_id: eid, choice_id: item.choice_id, mode: m, createdAt: clean(item.appliedAt), effects: clone(item.effects || {}), title: `${stageTitle(sid)} — ${MODE_LABELS[m]} — Konsekvens brukt: ${effectsText(item.effects) || choiceLabel(eventById(eid), item.choice_id)}` });
      }
    }
    return entries;
  }

  function resourceEntries(routeId, mode) {
    if (!hasApi("HG_CARAVAN_RESOURCES", "getResources")) return [];
    const rid = clean(routeId);
    const stored = window.HG_CARAVAN_RESOURCES.getAll?.()?.resources?.[rid] || {};
    return modesFor(mode).map((m) => {
      if (!stored[m]) return null;
      const resources = window.HG_CARAVAN_RESOURCES.getResources(rid, m);
      if (!resources) return null;
      return { type: "resources", route_id: rid, mode: m, createdAt: clean(resources.updatedAt), resources, title: `Reisestatus — ${MODE_LABELS[m]}: ${resourcesText(resources, m)}` };
    }).filter(Boolean);
  }

  function sortNewest(entries) { return entries.slice().sort((a, b) => clean(b.createdAt).localeCompare(clean(a.createdAt))); }
  function getEntries(routeId, mode) { const rid = clean(routeId); if (!rid) return []; return sortNewest([...progressEntries(rid, mode), ...eventEntries(rid, mode), ...consequenceEntries(rid, mode), ...resourceEntries(rid, mode)]).map(clone); }
  function getStageDiary(routeId, stageId, mode) { const rid = clean(routeId), sid = clean(stageId); if (!rid || !sid) return []; return sortNewest([...progressEntries(rid, mode, sid), ...eventEntries(rid, mode, sid), ...consequenceEntries(rid, mode, sid)]).map(clone); }
  function getRouteDiary(routeId, mode) { return getEntries(routeId, mode); }
  function summary(routeId, mode) { const entries = getEntries(routeId, mode); return { route_id: clean(routeId), mode: normalizeMode(mode), progressCount: entries.filter((e) => e.type === "progress").length, completedStages: entries.filter((e) => e.type === "progress" && e.status === "completed").length, eventChoices: entries.filter((e) => e.type === "event_choice").length, appliedConsequences: entries.filter((e) => e.type === "consequence").length, hasResources: entries.some((e) => e.type === "resources") }; }
  function exportJson(routeId, mode) { const selected = normalizeMode(mode); return { route_id: clean(routeId), mode: selected, generatedAt: now(), summary: summary(routeId, selected), entries: getEntries(routeId, selected) }; }

  window.HG_CARAVAN_DIARY = { getEntries, getStageDiary, getRouteDiary, summary, exportJson };
})();
