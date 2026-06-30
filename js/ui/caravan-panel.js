// js/ui/caravan-panel.js
// UI for Europakaravanen. Draws visual corridors and stores local-only stage progression.
(function () {
  "use strict";

  const PREFIX = "[HG_CARAVAN_UI]";
  const PANEL_ID = "hgCaravanPanel";
  const BUTTON_ID = "btnKaravane";
  const LAST_VIEW_KEY = "HG_CARAVAN_LAST_VIEW_V1";
  const RESUME_PREFIX = "[HG_CARAVAN_RESUME]";
  const HEADER_PREFIX = "[HG_CARAVAN_HEADER]";
  const TRAVEL_MODES = ["all", "til_fots", "hest", "sykkel"];
  const MODE_LABELS = {
    all: "Alle",
    til_fots: "Til fots",
    hest: "Hest",
    sykkel: "Sykkel"
  };
  const PROGRESS_LABELS = {
    planned: "Planlagt",
    started: "Påbegynt",
    completed: "Fullført"
  };
  const EVENT_TYPE_LABELS = {
    weather: "Vær",
    rest: "Hvile",
    water: "Vann",
    food: "Mat",
    stable: "Stall",
    ferry: "Ferge",
    border: "Grense",
    terrain: "Terreng",
    traffic: "Trafikk",
    shelter: "Ly",
    repair: "Reparasjon",
    animal_care: "Dyreomsorg",
    document_check: "Dokumentkontroll"
  };
  const SEVERITY_LABELS = { info: "Info", low: "Lav", medium: "Middels", high: "Høy" };

  const RESOURCE_LABELS = {
    energi: "Energi",
    vann: "Vann",
    hvile: "Hvile",
    hestehelse: "Hestehelse",
    sykkelstand: "Sykkelstand",
    utstyr: "Utstyr"
  };
  const RESOURCE_KEYS_BY_MODE = {
    til_fots: ["energi", "vann", "hvile", "utstyr"],
    hest: ["energi", "vann", "hvile", "hestehelse", "utstyr"],
    sykkel: ["energi", "vann", "hvile", "sykkelstand", "utstyr"]
  };

  let selectedRouteId = "";
  let activeStageId = "";
  let activeTravelMode = "all";
  const warnedMissingAllowedModes = new Set();
  let caravanMarkers = [];
  const CORRIDOR_SOURCE_ID = "hg-caravan-corridor-source";
  const CORRIDOR_LINE_LAYER_ID = "hg-caravan-corridor-line";
  const CORRIDOR_ACTIVE_LAYER_ID = "hg-caravan-corridor-active-line";
  let visibleCorridorRouteId = "";
  let visibleCorridorSegmentIds = [];
  let lastBadgeToast = null;
  let resumeNotice = null;


  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function attr(value) {
    return esc(value).replace(/`/g, "&#96;");
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function cleanText(value) {
    return String(value ?? "").trim();
  }

  function readableMode(mode) {
    const key = cleanText(mode);
    return MODE_LABELS[key] || key;
  }

  function normalizeTravelMode(mode) {
    const key = cleanText(mode);
    return TRAVEL_MODES.includes(key) ? key : "all";
  }


  function nowIso() { return new Date().toISOString(); }

  function routeById(routeId) {
    const id = cleanText(routeId);
    if (!id) return null;
    return asArray(getRuntime()?.routes).find((route) => cleanText(route?.id) === id) || null;
  }

  function isKnownRoute(routeId) {
    return Boolean(routeById(routeId));
  }

  function isKnownStageForRoute(stageId, routeId) {
    const stage = getStage(stageId);
    if (!stage) return false;
    return !cleanText(routeId) || cleanText(stage.route_id) === cleanText(routeId);
  }

  function normalizeLastView(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const routeId = cleanText(raw.route_id || raw.routeId);
    const stageId = cleanText(raw.stage_id || raw.stageId);
    const travelMode = normalizeTravelMode(raw.travel_mode || raw.travelMode || "all");
    if (!routeId && !stageId && travelMode === "all") return null;
    return { version: 1, updatedAt: cleanText(raw.updatedAt) || nowIso(), route_id: routeId, travel_mode: travelMode, stage_id: stageId };
  }

  function getLastView() {
    try {
      const text = window.localStorage?.getItem(LAST_VIEW_KEY);
      if (!text) return null;
      return normalizeLastView(JSON.parse(text));
    } catch (error) {
      console.warn(RESUME_PREFIX, "korrupt last-view; ignorerer", { error: error?.message || error });
      return null;
    }
  }

  function setLastView(routeId = selectedRouteId, mode = activeTravelMode, stageId = activeStageId) {
    const existing = getLastView() || {};
    const rid = cleanText(routeId !== undefined ? routeId : existing.route_id);
    const travelMode = normalizeTravelMode(mode !== undefined ? mode : (existing.travel_mode || "all"));
    const sid = cleanText(stageId !== undefined ? stageId : existing.stage_id);
    if (!rid && !sid && travelMode === "all") return null;
    const next = { version: 1, updatedAt: nowIso(), route_id: rid, travel_mode: travelMode, stage_id: sid };
    try { window.localStorage?.setItem(LAST_VIEW_KEY, JSON.stringify(next)); }
    catch (error) { console.warn(RESUME_PREFIX, "kunne ikke lagre last-view", { error: error?.message || error }); }
    return next;
  }

  function clearLastView() {
    try { window.localStorage?.removeItem(LAST_VIEW_KEY); }
    catch (error) { console.warn(RESUME_PREFIX, "kunne ikke slette last-view", { error: error?.message || error }); }
  }

  function newestByCreatedAt(entries) {
    return asArray(entries).filter(Boolean).sort((a, b) => cleanText(b.createdAt || b.updatedAt).localeCompare(cleanText(a.createdAt || a.updatedAt)))[0] || null;
  }

  function getLatestDiaryTarget() {
    const api = getDiaryRuntime();
    if (!api?.getEntries) return null;
    const entries = asArray(getRuntime()?.routes).flatMap((route) => api.getEntries(cleanText(route?.id), "all") || []);
    const entry = newestByCreatedAt(entries);
    return entry ? { route_id: cleanText(entry.route_id), travel_mode: normalizeTravelMode(entry.mode || entry.travel_mode || "all"), stage_id: cleanText(entry.stage_id), source: "diary" } : null;
  }

  function getLatestEventTarget() {
    const entry = newestByCreatedAt(getEventLogRuntime()?.getAll?.()?.entries || []);
    return entry ? { route_id: cleanText(entry.route_id), travel_mode: normalizeTravelMode(entry.travel_mode), stage_id: cleanText(entry.stage_id), source: "event_log" } : null;
  }

  function getLatestProgressTarget() {
    const progress = getProgressRuntime()?.getAll?.()?.progress || {};
    const entries = [];
    for (const [route_id, byStage] of Object.entries(progress)) {
      for (const [stage_id, byMode] of Object.entries(byStage || {})) {
        for (const [travel_mode, item] of Object.entries(byMode || {})) {
          if (item?.status && item.status !== "none") entries.push({ route_id, stage_id, travel_mode, updatedAt: item.updatedAt });
        }
      }
    }
    const entry = newestByCreatedAt(entries);
    return entry ? { route_id: cleanText(entry.route_id), travel_mode: normalizeTravelMode(entry.travel_mode), stage_id: cleanText(entry.stage_id), source: "progress" } : null;
  }

  function validateResumeTarget(target) {
    const normalized = normalizeLastView(target);
    if (!normalized) return null;
    if (!normalized.route_id && normalized.stage_id) {
      const stage = getStage(normalized.stage_id);
      if (stage) normalized.route_id = cleanText(stage.route_id);
    }
    if (!isKnownRoute(normalized.route_id)) {
      if (normalized.route_id) console.warn(RESUME_PREFIX, "route finnes ikke lenger; bruker vanlig start", { route_id: normalized.route_id });
      return null;
    }
    if (normalized.stage_id && !isKnownStageForRoute(normalized.stage_id, normalized.route_id)) {
      console.warn(RESUME_PREFIX, "stage finnes ikke lenger; åpner route", { route_id: normalized.route_id, stage_id: normalized.stage_id });
      normalized.stage_id = "";
    }
    return normalized;
  }

  function getResumeTarget() {
    const candidates = [
      { source: "last_view", value: getLastView() },
      { source: "diary", value: getLatestDiaryTarget() },
      { source: "event_log", value: getLatestEventTarget() },
      { source: "progress", value: getLatestProgressTarget() }
    ];
    for (const candidate of candidates) {
      const target = validateResumeTarget(candidate.value);
      if (target) return { ...target, source: candidate.value?.source || candidate.source };
    }
    return null;
  }

  function resumeLine(target) {
    if (!target?.route_id) return null;
    const route = routeById(target.route_id);
    const stage = target.stage_id ? getStage(target.stage_id) : null;
    const routeTitle = cleanText(route?.title || target.route_id).split(/[–:-]/)[0].trim() || cleanText(route?.title || target.route_id);
    const stageText = stage ? ` — ${nodeTitle(stage.from_node)} → ${nodeTitle(stage.to_node)}` : "";
    return `Fortsetter reisen: ${routeTitle} — ${readableMode(target.travel_mode)}${stageText}`;
  }

  function warnMissingAllowedModes(stage) {
    const id = cleanText(stage?.id) || "unknown-stage";
    if (warnedMissingAllowedModes.has(id)) return;
    warnedMissingAllowedModes.add(id);
    console.warn(PREFIX, "stage.allowed_modes mangler; behandler reisemåte som ukjent", { stage_id: id, route_id: cleanText(stage?.route_id) });
  }

  function stageSupportsMode(stage, mode = activeTravelMode) {
    const selected = normalizeTravelMode(mode);
    if (selected === "all") return true;
    if (!Array.isArray(stage?.allowed_modes)) {
      warnMissingAllowedModes(stage);
      return false;
    }
    return stage.allowed_modes.map(cleanText).includes(selected);
  }

  function getVisibleStagesForMode(routeId, mode = activeTravelMode) {
    return getStages(routeId).filter((stage) => stageSupportsMode(stage, mode));
  }

  function formatList(value, empty = "—") {
    const items = asArray(value).map(readableMode).filter(Boolean);
    return items.length ? items.join(", ") : empty;
  }

  function formatPlainList(value, empty = "—") {
    const items = asArray(value).map(cleanText).filter(Boolean);
    return items.length ? items.join(", ") : empty;
  }

  function formatNeedsByMode(value, mode = activeTravelMode, empty = "Ingen mode-spesifikke behov registrert") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return empty;
    const selected = normalizeTravelMode(mode);
    if (selected !== "all") return Array.isArray(value[selected]) ? formatPlainList(value[selected], empty) : empty;
    const rows = Object.entries(value)
      .filter(([item]) => normalizeTravelMode(item) !== "all")
      .map(([item, needs]) => `${readableMode(item)}: ${Array.isArray(needs) ? formatPlainList(needs, "—") : empty}`);
    return rows.length ? rows.join(" | ") : empty;
  }

  function formatNodeList(value, empty = "—") {
    return formatPlainList(value, empty);
  }

  function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function uniqueModesForRoute(routeId) {
    const seen = new Set();
    for (const stage of getStages(routeId)) {
      for (const mode of asArray(stage?.allowed_modes)) {
        if (cleanText(mode)) seen.add(cleanText(mode));
      }
    }
    return Array.from(seen).map(readableMode);
  }

  function getProgressRuntime() {
    return window.HG_CARAVAN_PROGRESS || null;
  }

  function getStageProgress(stage, mode = activeTravelMode) {
    const selected = normalizeTravelMode(mode);
    if (selected === "all") return null;
    return getProgressRuntime()?.getProgress?.(cleanText(stage?.route_id), cleanText(stage?.id), selected) || null;
  }

  function getStageProgressStatus(stage, mode = activeTravelMode) {
    return cleanText(getStageProgress(stage, mode)?.status);
  }

  function getStageAllModeProgressLabel(stage) {
    const statuses = ["til_fots", "hest", "sykkel"].map((mode) => getStageProgressStatus(stage, mode)).filter((status) => status && status !== "none");
    const completed = statuses.filter((status) => status === "completed").length;
    if (completed) return `${completed}/3 fullført`;
    if (statuses.length) return `${statuses.length}/3 progresjon`;
    return "Ikke startet";
  }

  function getResourcesRuntime() {
    return window.HG_CARAVAN_RESOURCES || null;
  }

  function resourceKeysForMode(mode = activeTravelMode) {
    return RESOURCE_KEYS_BY_MODE[normalizeTravelMode(mode)] || [];
  }

  function getRouteResources(routeId = selectedRouteId, mode = activeTravelMode) {
    const selected = normalizeTravelMode(mode);
    if (selected === "all") return null;
    const rid = cleanText(routeId);
    if (!rid) return null;
    return getResourcesRuntime()?.getResources?.(rid, selected) || null;
  }

  function renderResourceRows(resources, mode, interactive) {
    const keys = resourceKeysForMode(mode);
    return keys.map((key) => {
      const value = Math.max(0, Math.min(100, Number(resources?.[key] ?? 100)));
      return `<div class="hg-caravan-resource-row" data-caravan-resource-row="${attr(key)}">
        <div class="hg-caravan-resource-main">
          <span class="hg-caravan-resource-label">${esc(RESOURCE_LABELS[key] || key)}</span>
          <span class="hg-caravan-resource-value">${esc(value)}</span>
          <span class="hg-caravan-resource-bar" aria-hidden="true"><span style="width:${esc(value)}%"></span></span>
        </div>
        ${interactive ? `<div class="hg-caravan-resource-actions" aria-label="Juster ${esc(RESOURCE_LABELS[key] || key)}"><button type="button" data-caravan-resource-adjust="${attr(key)}" data-caravan-resource-delta="-10">-10</button><button type="button" data-caravan-resource-adjust="${attr(key)}" data-caravan-resource-delta="10">+10</button></div>` : ""}
      </div>`;
    }).join("");
  }

  function resourcesPanel(routeId = selectedRouteId, mode = activeTravelMode, options = {}) {
    const selected = normalizeTravelMode(mode);
    if (selected === "all") return `<section class="hg-caravan-resources"><p class="hg-caravan-progress-hint">Velg Til fots, Hest eller Sykkel for å se reisestatus.</p></section>`;
    const resources = getRouteResources(routeId, selected) || {};
    return `<section class="hg-caravan-resources" aria-label="Reisestatus">
      <div class="hg-caravan-resources-head"><h3>${esc(options.title || `Reisestatus — ${readableMode(selected)}`)}</h3>${options.interactive === false ? "" : `<button type="button" class="hg-caravan-resource-reset" data-caravan-resource-reset>Nullstill reisestatus</button>`}</div>
      ${renderResourceRows(resources, selected, options.interactive !== false)}
    </section>`;
  }

  function getEventLogRuntime() {
    return window.HG_CARAVAN_EVENT_LOG || null;
  }

  function getConsequencesRuntime() {
    return window.HG_CARAVAN_CONSEQUENCES || null;
  }

  function getDiaryRuntime() {
    return window.HG_CARAVAN_DIARY || null;
  }

  function getBadgesRuntime() {
    return window.HG_CARAVAN_BADGES || null;
  }

  function routeEventLogLabel(routeId) {
    const title = cleanText((getRuntime()?.routes || []).find((route) => cleanText(route?.id) === cleanText(routeId))?.title || routeId).split(/[–:-]/)[0].trim() || cleanText(routeId);
    const summary = getEventLogRuntime()?.summary?.(routeId, activeTravelMode === "all" ? "all" : activeTravelMode);
    const count = Number(summary?.choices || 0);
    return activeTravelMode === "all" ? `${title}: ${count} valg totalt` : `${title}: ${count} valg logget`;
  }

  function stageEventLogCount(stage, mode = activeTravelMode) {
    const rid = cleanText(stage?.route_id);
    const sid = cleanText(stage?.id);
    if (!rid || !sid) return 0;
    return getEventLogRuntime()?.getStageLog?.(rid, sid, mode === "all" ? "all" : mode)?.length || 0;
  }

  function stageEventLogLabel(stage, mode = activeTravelMode) {
    const count = stageEventLogCount(stage, mode);
    if (!count) return "";
    return mode === "all" ? `${count} loggvalg` : `${count} valg`;
  }

  function getLoggedChoice(routeId, stageId, eventId, mode = activeTravelMode) {
    const selected = normalizeTravelMode(mode);
    if (selected === "all") return null;
    return getEventLogRuntime()?.getChoice?.(routeId, stageId, eventId, selected) || null;
  }

  function routeProgressLabel(routeId) {
    const summary = getProgressRuntime()?.getRouteSummary?.(routeId, activeTravelMode);
    if (!summary) return "Ikke startet";
    if (normalizeTravelMode(activeTravelMode) === "all") return `${summary.progressionPoints || 0} progresjonspunkter`;
    return `${summary.completed || 0}/${summary.total || 0} etapper fullført`;
  }

  function getRuntime() {
    const runtime = window.HG_CARAVAN;
    if (!runtime || !Array.isArray(runtime.routes)) return null;
    if (!runtime.routes.length && !asArray(runtime.stages).length && !asArray(runtime.nodes).length) return null;
    return runtime;
  }

  function getStages(routeId) {
    const runtime = getRuntime();
    if (!runtime) return [];
    const key = cleanText(routeId);
    const indexed = runtime.indexes?.stagesByRoute?.[key];
    const stages = Array.isArray(indexed)
      ? indexed
      : asArray(runtime.stages).filter((stage) => cleanText(stage?.route_id) === key);
    return stages.slice().sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0));
  }

  function getMap() {
    return window.HGMap?.getMap?.() || window.map || null;
  }

  function getEventsForStage(stageId, mode = activeTravelMode) {
    const runtime = getRuntime();
    const id = cleanText(stageId);
    if (!runtime || !id) return [];
    const indexed = runtime.indexes?.eventsByStage?.[id];
    const events = Array.isArray(indexed) ? indexed : asArray(runtime.events).filter((event) => cleanText(event?.stage_id) === id);
    const selected = normalizeTravelMode(mode);
    if (selected === "all") return events.slice();
    return events.filter((event) => asArray(event?.applies_to_modes).map(cleanText).includes(selected));
  }

  function getEventsForRoute(routeId, mode = activeTravelMode) {
    const runtime = getRuntime();
    const id = cleanText(routeId);
    if (!runtime || !id) return [];
    const indexed = runtime.indexes?.eventsByRoute?.[id];
    const events = Array.isArray(indexed) ? indexed : asArray(runtime.events).filter((event) => cleanText(event?.route_id) === id);
    const selected = normalizeTravelMode(mode);
    if (selected === "all") return events.slice();
    return events.filter((event) => asArray(event?.applies_to_modes).map(cleanText).includes(selected));
  }

  function eventCountLabel(stage, mode = activeTravelMode) {
    const count = getEventsForStage(cleanText(stage?.id), mode).length;
    return count ? `${count} ${count === 1 ? "hendelse" : "hendelser"}` : "Ingen hendelser";
  }

  function getStage(stageId) {
    const id = cleanText(stageId);
    if (!id) return null;
    return asArray(getRuntime()?.stages).find((stage) => cleanText(stage?.id) === id) || null;
  }

  function getNodeById(nodeId, stageId = activeStageId) {
    const id = cleanText(nodeId);
    if (!id) return null;
    const node = getRuntime()?.indexes?.nodesById?.[id] || asArray(getRuntime()?.nodes).find((item) => cleanText(item?.id) === id) || null;
    if (!node) console.warn(PREFIX, "node mangler for stage-preview", { stage_id: stageId, node_id: id });
    return node;
  }


  function warnMissingSegment(message, detail) {
    console.warn(PREFIX, message, detail);
  }

  function getCorridorNode(nodeId, stage) {
    const id = cleanText(nodeId);
    const stageId = cleanText(stage?.id);
    if (!id) {
      warnMissingSegment("hopper over korridorsegment: node-id mangler", { stage_id: stageId, route_id: cleanText(stage?.route_id) });
      return null;
    }
    const node = getRuntime()?.indexes?.nodesById?.[id] || null;
    if (!node) {
      warnMissingSegment("hopper over korridorsegment: node mangler", { stage_id: stageId, route_id: cleanText(stage?.route_id), node_id: id });
      return null;
    }
    const lat = num(node.lat);
    const lng = num(node.lng);
    if (lat == null || lng == null) {
      warnMissingSegment("hopper over korridorsegment: lat/lng mangler", { stage_id: stageId, route_id: cleanText(stage?.route_id), node_id: id, lat: node?.lat, lng: node?.lng });
      return null;
    }
    return { id, lat, lng };
  }

  function buildCorridorFeatures(routeId) {
    const features = [];
    for (const stage of getStages(routeId)) {
      const from = getCorridorNode(stage?.from_node, stage);
      const to = getCorridorNode(stage?.to_node, stage);
      if (!from || !to) continue;
      const stageId = cleanText(stage?.id);
      features.push({
        type: "Feature",
        properties: {
          id: stageId,
          stage_id: stageId,
          route_id: cleanText(stage?.route_id),
          order: Number(stage?.order ?? 0),
          class: CORRIDOR_LINE_LAYER_ID,
          active: stageId && stageId === activeStageId ? 1 : 0,
          travel_mode_supported: stageSupportsMode(stage) ? 1 : 0,
          progress_status: normalizeTravelMode(activeTravelMode) === "all" ? "none" : (getStageProgressStatus(stage) || "none")
        },
        geometry: { type: "LineString", coordinates: [[from.lng, from.lat], [to.lng, to.lat]] }
      });
    }
    return features;
  }

  function ensureCorridorLayers(map, data) {
    if (!map || typeof map.addSource !== "function") return false;
    if (!map.getSource(CORRIDOR_SOURCE_ID)) map.addSource(CORRIDOR_SOURCE_ID, { type: "geojson", data });
    else map.getSource(CORRIDOR_SOURCE_ID).setData(data);

    if (!map.getLayer(CORRIDOR_LINE_LAYER_ID)) {
      map.addLayer({
        id: CORRIDOR_LINE_LAYER_ID,
        type: "line",
        source: CORRIDOR_SOURCE_ID,
        filter: ["==", ["geometry-type"], "LineString"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["match", ["get", "progress_status"], "completed", "#f0d59b", "started", "#d9b36a", "planned", "#b9a77d", "#d9b36a"],
          "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1.2, 8, 1.8, 12, 2.6],
          "line-opacity": ["case", ["==", ["get", "travel_mode_supported"], 0], 0.07, ["==", ["get", "progress_status"], "completed"], 0.48, ["==", ["get", "progress_status"], "started"], 0.36, ["==", ["get", "progress_status"], "planned"], 0.28, ["==", ["get", "active"], 1], 0.34, 0.22],
          "line-dasharray": [1.1, 1.6],
          "line-blur": 0.7
        }
      });
    }

    if (!map.getLayer(CORRIDOR_ACTIVE_LAYER_ID)) {
      map.addLayer({
        id: CORRIDOR_ACTIVE_LAYER_ID,
        type: "line",
        source: CORRIDOR_SOURCE_ID,
        filter: ["all", ["==", ["geometry-type"], "LineString"], ["==", ["get", "active"], 1]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffbf57",
          "line-width": ["interpolate", ["linear"], ["zoom"], 4, 2.0, 8, 3.0, 12, 4.2],
          "line-opacity": ["case", ["==", ["get", "travel_mode_supported"], 0], 0.16, 0.62],
          "line-dasharray": [1.4, 1.1],
          "line-blur": 0.35
        }
      });
    }
    return true;
  }

  function drawCorridor(routeId = selectedRouteId) {
    const id = cleanText(routeId);
    if (!id) return clearCorridor();
    const map = getMap();
    if (!map) return [];
    const data = { type: "FeatureCollection", features: buildCorridorFeatures(id) };
    try {
      ensureCorridorLayers(map, data);
      visibleCorridorRouteId = id;
      visibleCorridorSegmentIds = data.features.map((feature) => cleanText(feature?.properties?.stage_id)).filter(Boolean);
      return visibleCorridorSegmentIds.slice();
    } catch (error) {
      console.warn(PREFIX, "kunne ikke tegne korridor", { route_id: id, error: error?.message || error });
      return [];
    }
  }

  function clearCorridor() {
    const map = getMap();
    if (map) {
      for (const layerId of [CORRIDOR_ACTIVE_LAYER_ID, CORRIDOR_LINE_LAYER_ID]) {
        if (map.getLayer?.(layerId)) { try { map.removeLayer(layerId); } catch {} }
      }
      if (map.getSource?.(CORRIDOR_SOURCE_ID)) { try { map.removeSource(CORRIDOR_SOURCE_ID); } catch {} }
    }
    visibleCorridorRouteId = "";
    visibleCorridorSegmentIds = [];
    return [];
  }

  function getNodesForRoute(routeId = selectedRouteId) {
    const runtime = getRuntime();
    if (!runtime) return [];
    const id = cleanText(routeId);
    if (!id) return asArray(runtime.nodes);

    const seen = new Set();
    const nodes = [];
    for (const stage of getStages(id)) {
      for (const nodeId of [stage?.from_node, stage?.to_node]) {
        const key = cleanText(nodeId);
        if (!key || seen.has(key)) continue;
        const node = runtime.indexes?.nodesById?.[key] || asArray(runtime.nodes).find((item) => cleanText(item?.id) === key);
        if (node) {
          seen.add(key);
          nodes.push(node);
        }
      }
    }
    return nodes;
  }

  function nodeTitle(nodeId) {
    const id = cleanText(nodeId);
    if (!id) return "—";
    const node = getNodeById(id, activeStageId);
    const title = cleanText(node?.title);
    if (title) return title;
    console.warn(PREFIX, "node mangler", id);
    return id;
  }

  function ensurePanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;

    panel = document.createElement("aside");
    panel.id = PANEL_ID;
    panel.className = "hg-caravan-panel";
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("aria-label", "Karavane");
    document.body.appendChild(panel);
    return panel;
  }

  function routeCard(route) {
    const id = cleanText(route?.id);
    const stages = getStages(id);
    const modes = uniqueModesForRoute(id);
    const title = cleanText(route?.title || id || "Route").split(/[–:-]/)[0].trim() || route?.title || id;
    return `
      <button type="button" class="hg-caravan-route ${id === selectedRouteId ? "is-active" : ""}" data-caravan-route="${attr(id)}">
        <span class="hg-caravan-route-title">${esc(route?.title || id || "Uten tittel")}</span>
        ${cleanText(route?.subtitle) ? `<span class="hg-caravan-route-subtitle">${esc(route.subtitle)}</span>` : ""}
        <span class="hg-caravan-route-meta">${stages.length} etapper · ${esc(modes.join(", ") || "—")}</span>
        <span class="hg-caravan-progress-summary">${esc(title)}: ${esc(routeProgressLabel(id))}</span>
        <span class="hg-caravan-log-summary">${esc(routeEventLogLabel(id))}</span>
      </button>`;
  }

  function field(label, value) {
    const text = Array.isArray(value) ? formatList(value) : cleanText(value);
    if (!text || text === "—") return "";
    return `<div class="hg-caravan-stage-field"><dt>${esc(label)}</dt><dd>${esc(text)}</dd></div>`;
  }

  function travelModeControl() {
    const hint = activeTravelMode === "all"
      ? "Velg en reisebrille for å lagre progresjon, valg og ressurser."
      : `Reisen vises for ${readableMode(activeTravelMode)}.`;
    return `<section class="hg-caravan-travel-mode-section" aria-label="Reisebrille"><h3>Reisebrille</h3><div class="hg-caravan-travel-mode" role="group" aria-label="Reisebrille">${TRAVEL_MODES.map((mode) => `
      <button type="button" class="hg-caravan-travel-mode-option ${mode === activeTravelMode ? "is-active" : ""}" data-caravan-travel-mode="${attr(mode)}" aria-pressed="${mode === activeTravelMode ? "true" : "false"}">${esc(readableMode(mode))}</button>`).join("")}
    </div><p class="hg-caravan-progress-hint">${esc(hint)}</p></section>`;
  }

  function stageCard(stage) {
    const id = cleanText(stage?.id);
    const from = nodeTitle(stage?.from_node);
    const to = nodeTitle(stage?.to_node);
    const supported = stageSupportsMode(stage);
    const status = getStageProgressStatus(stage);
    const progressLabel = activeTravelMode === "all" ? getStageAllModeProgressLabel(stage) : (PROGRESS_LABELS[status] || "Ikke startet");
    const eventsLabel = eventCountLabel(stage);
    const logLabel = stageEventLogLabel(stage);
    return `
      <button type="button" class="hg-caravan-stage ${id === activeStageId ? "is-active" : ""} ${supported ? "is-mode-supported" : "is-mode-dimmed"}" data-caravan-stage="${attr(id)}">
        <span class="hg-caravan-stage-title">${esc(stage?.order ?? "—")}. ${esc(from)} → ${esc(to)}</span>
        <span class="hg-caravan-stage-meta">${stage?.approximate_distance_km != null ? `${esc(stage.approximate_distance_km)} km` : "Distanse ukjent"} · ${esc(formatList(stage?.allowed_modes))}</span>
        <span class="hg-caravan-progress-pill">${esc(progressLabel)}</span>
        <span class="hg-caravan-event-pill">${esc(eventsLabel)}</span>
        ${!supported && activeTravelMode !== "all" ? `<span class="hg-caravan-mode-warning">Ikke registrert for ${esc(readableMode(activeTravelMode))}</span>` : ""}
        ${logLabel ? `<span class="hg-caravan-log-pill">${esc(logLabel)}</span>` : ""}
      </button>`;
  }

  function progressControls(stage) {
    const disabled = activeTravelMode === "all";
    const status = getStageProgressStatus(stage);
    return `<div class="hg-caravan-progress-controls">
      ${disabled ? `<p class="hg-caravan-progress-hint">Velg Til fots, Hest eller Sykkel for å lagre progresjon</p>` : `<p class="hg-caravan-progress-hint">Progresjon for ${esc(readableMode(activeTravelMode))}</p>`}
      <div class="hg-caravan-progress-buttons" role="group" aria-label="Etappeprogresjon">
        ${[["planned", "Planlagt"], ["started", "Påbegynt"], ["completed", "Fullført"], ["none", "Nullstill"]].map(([value, label]) => `<button type="button" class="hg-caravan-progress-button ${status === value ? "is-active" : ""}" data-caravan-progress-status="${attr(value)}" ${disabled ? "disabled" : ""}>${esc(label)}</button>`).join("")}
      </div>
    </div>`;
  }

  function eventLabel(type) {
    const key = cleanText(type);
    return EVENT_TYPE_LABELS[key] || key || "Ukjent";
  }

  function severityLabel(severity) {
    const key = cleanText(severity);
    return SEVERITY_LABELS[key] || key || "Ukjent";
  }

  function choiceLabel(event, choiceId) {
    const id = cleanText(choiceId);
    return cleanText(asArray(event?.choices).find((choice) => cleanText(choice?.id) === id)?.label || id);
  }

  function formatEffects(effects) {
    const entries = effects && typeof effects === "object" && !Array.isArray(effects) ? Object.entries(effects) : [];
    if (!entries.length) return `<p class="hg-caravan-consequence-empty">Ingen ressurskonsekvens for denne reisebrillen.</p>`;
    return `<ul class="hg-caravan-consequence-list">${entries.map(([key, delta]) => {
      const n = Number(delta);
      const prefix = n > 0 ? "+" : "";
      return `<li>${esc(prefix)}${esc(n)} ${esc(RESOURCE_LABELS[key] || key)}</li>`;
    }).join("")}</ul>`;
  }

  function renderDiaryEntries(entries, emptyText) {
    const items = asArray(entries);
    if (!items.length) return `<p class="hg-caravan-empty">${esc(emptyText || "Ingen dagboklinjer ennå.")}</p>`;
    return `<div class="hg-caravan-diary-list">${items.map((entry) => {
      const when = entry?.createdAt ? new Date(entry.createdAt).toLocaleString("nb-NO", { dateStyle: "short", timeStyle: "short" }) : "—";
      return `<article class="hg-caravan-diary-entry" data-caravan-diary-type="${attr(entry?.type)}"><span>${esc(entry?.title || entry?.id || "Dagboklinje")}</span><time>${esc(when)}</time></article>`;
    }).join("")}</div>`;
  }

  function renderRouteDiarySection(routeId) {
    const diary = getDiaryRuntime();
    if (!diary?.getRouteDiary) return `<details class="hg-caravan-diary"><summary>Dagbok: ikke lastet</summary><p class="hg-caravan-empty">Dagbok er ikke lastet ennå.</p></details>`;
    const mode = activeTravelMode === "all" ? "all" : activeTravelMode;
    const entries = diary.getRouteDiary(routeId, mode);
    const summary = diary.summary?.(routeId, mode);
    const filter = mode === "all" ? "Viser samlet dagbok for alle reisebriller" : `Viser dagbok for ${readableMode(mode)}`;
    const count = asArray(entries).length;
    return `<details class="hg-caravan-diary"><summary>Dagbok: ${esc(count)} linjer</summary><p class="hg-caravan-event-filter">${esc(filter)} · ${esc(summary?.progressCount || 0)} progresjon · ${esc(summary?.eventChoices || 0)} valg · ${esc(summary?.appliedConsequences || 0)} konsekvenser</p>${renderDiaryEntries(entries, "Ingen reisehistorikk ennå.")}</details>`;
  }

  function renderStageDiarySection(stage) {
    if (!stage) return "";
    const diary = getDiaryRuntime();
    if (!diary?.getStageDiary) return `<section class="hg-caravan-diary hg-caravan-stage-diary"><h3>Dagbok for denne etappen</h3><p class="hg-caravan-empty">Dagbok er ikke lastet ennå.</p></section>`;
    const mode = activeTravelMode === "all" ? "all" : activeTravelMode;
    const entries = diary.getStageDiary(cleanText(stage?.route_id), cleanText(stage?.id), mode);
    return `<section class="hg-caravan-diary hg-caravan-stage-diary"><h3>Dagbok for denne etappen</h3>${renderDiaryEntries(entries, "Ingen dagbok for denne etappen ennå.")}</section>`;
  }

  function effectsForChoice(choice, mode) {
    const selected = normalizeTravelMode(mode);
    if (selected === "all") return null;
    const effects = choice?.resource_effects_by_mode?.[selected];
    return effects && typeof effects === "object" && !Array.isArray(effects) ? effects : null;
  }

  function allEffectsForChoice(choice) {
    const byMode = choice?.resource_effects_by_mode;
    if (!byMode || typeof byMode !== "object" || Array.isArray(byMode)) return "";
    return Object.entries(byMode).map(([mode, effects]) => `<div class="hg-caravan-consequence-mode"><strong>Konsekvens for ${esc(readableMode(mode))}:</strong>${formatEffects(effects)}</div>`).join("");
  }

  function choiceConsequenceHtml(event, choice, stageId, selectedMode, logged) {
    const choiceId = cleanText(choice?.id);
    if (selectedMode === "all") {
      const allEffects = allEffectsForChoice(choice);
      return `<div class="hg-caravan-consequence">${allEffects || `<p class="hg-caravan-consequence-empty">Ingen ressurskonsekvens registrert.</p>`}<p class="hg-caravan-progress-hint">Velg en reisebrille for å bruke konsekvens</p></div>`;
    }
    const effects = effectsForChoice(choice, selectedMode);
    const applied = getConsequencesRuntime()?.getApplied?.(event?.route_id, stageId, event?.id, selectedMode);
    const loggedChoiceId = cleanText(logged?.choice_id);
    const isLoggedChoice = loggedChoiceId === choiceId;
    const disabled = !effects || !isLoggedChoice || Boolean(applied);
    const appliedText = applied ? `<p class="hg-caravan-selected-choice">Konsekvens brukt: ${esc(choiceLabel(event, applied.choice_id))}</p>` : "";
    const alreadyText = applied && cleanText(applied.choice_id) !== choiceId ? `<p class="hg-caravan-progress-hint">Gammel konsekvens er allerede brukt. Nullstill anvendt konsekvens før en ny brukes.</p>` : "";
    return `<div class="hg-caravan-consequence"><strong>Konsekvens for ${esc(readableMode(selectedMode))}:</strong>${formatEffects(effects)}${appliedText}${alreadyText}<button type="button" class="hg-caravan-apply-consequence" data-caravan-apply-consequence="${attr(choiceId)}" data-caravan-event-id="${attr(event?.id)}" data-caravan-stage-id="${attr(stageId)}" data-caravan-route-id="${attr(event?.route_id)}" ${disabled ? "disabled" : ""}>${applied ? "Konsekvens brukt" : "Bruk konsekvens"}</button>${applied ? `<button type="button" class="hg-caravan-clear-consequence" data-caravan-clear-consequence="${attr(event?.id)}" data-caravan-stage-id="${attr(stageId)}" data-caravan-route-id="${attr(event?.route_id)}">Nullstill anvendt konsekvens</button>` : ""}</div>`;
  }

  function renderStageEvents(stageId, mode = activeTravelMode) {
    const events = getEventsForStage(stageId, mode);
    const selectedMode = normalizeTravelMode(mode);
    const readOnly = selectedMode === "all";
    const modeLabel = readOnly ? "alle reisemåter" : readableMode(mode);
    if (!events.length) return `<section class="hg-caravan-events"><h3>Karavanehendelser</h3><p class="hg-caravan-empty">Ingen hendelser for ${esc(modeLabel)}.</p></section>`;
    return `<section class="hg-caravan-events"><h3>Karavanehendelser</h3>${readOnly ? `<p class="hg-caravan-progress-hint">Velg Til fots, Hest eller Sykkel for å lagre valg</p>` : ""}<p class="hg-caravan-event-filter">Viser ${esc(events.length)} for ${esc(modeLabel)}</p>${events.map((event) => {
      const logged = getLoggedChoice(event?.route_id, stageId, event?.id, selectedMode);
      return `
      <article class="hg-caravan-event" data-caravan-event-id="${attr(event?.id)}">
        <h4>${esc(event?.title || event?.id || "Karavanehendelse")}</h4>
        <p class="hg-caravan-event-meta">Hendelse: ${esc(eventLabel(event?.event_type))} · Risiko: ${esc(severityLabel(event?.severity))} · Kan gjøres: ${esc(formatList(event?.applies_to_modes))}</p>
        ${cleanText(event?.prompt) ? `<p>${esc(event.prompt)}</p>` : ""}
        ${logged ? `<p class="hg-caravan-selected-choice">Valgt for ${esc(readableMode(selectedMode))}: ${esc(choiceLabel(event, logged.choice_id))}</p><p class="hg-caravan-resource-note">Bruk konsekvens-knappen for å justere ressurser eksplisitt.</p>` : ""}
        ${cleanText(event?.historical_context) ? `<p><strong>Historisk kontekst:</strong> ${esc(event.historical_context)}</p>` : ""}
        ${cleanText(event?.observation_prompt) ? `<p><strong>Se etter:</strong> ${esc(event.observation_prompt)}</p>` : ""}
        ${asArray(event?.choices).length ? `<div class="hg-caravan-event-choices" aria-label="${readOnly ? "Se valg" : "Lagre valg"}">${asArray(event.choices).map((choice) => {
          const choiceId = cleanText(choice?.id);
          const active = logged && cleanText(logged.choice_id) === choiceId;
          const body = `<strong>${esc(choice?.label || choiceId || "Valg")}</strong>${cleanText(choice?.note) ? ` – ${esc(choice.note)}` : ""}`;
          const consequence = choiceConsequenceHtml(event, choice, stageId, selectedMode, logged);
          return readOnly ? `<div class="hg-caravan-event-choice-wrap"><span class="hg-caravan-event-choice">${body}</span>${consequence}</div>` : `<div class="hg-caravan-event-choice-wrap"><button type="button" class="hg-caravan-event-choice ${active ? "is-active" : ""}" data-caravan-event-choice="${attr(choiceId)}" data-caravan-event-id="${attr(event?.id)}" data-caravan-stage-id="${attr(stageId)}" data-caravan-route-id="${attr(event?.route_id)}" aria-pressed="${active ? "true" : "false"}">${body}</button>${consequence}</div>`;
        }).join("")}</div>` : ""}
        ${logged ? `<button type="button" class="hg-caravan-clear-choice" data-caravan-clear-event-choice="${attr(event?.id)}" data-caravan-stage-id="${attr(stageId)}" data-caravan-route-id="${attr(event?.route_id)}">Nullstill valg</button>` : ""}
      </article>`;
    }).join("")}</section>`;
  }

  function stagePreview(stage) {
    if (!stage) return "";
    const from = nodeTitle(stage?.from_node);
    const to = nodeTitle(stage?.to_node);
    return `
      <section class="hg-caravan-stage-preview" aria-live="polite">
        <h3>Valgt etappe</h3>
        <h4>${esc(from)} → ${esc(to)}</h4>
        ${progressControls(stage)}
        ${stageBadgeContributionLine(stage)}
        <dl>
          ${field("Distanse", stage?.approximate_distance_km != null ? `${stage.approximate_distance_km} km` : "")}
          ${field("Distanse er grovt anslått", stage?.distance_confidence)}
          ${field("Kan gjøres", stage?.allowed_modes)}
          ${field("Terreng/underlag", formatPlainList(stage?.surface_types))}
          ${field(activeTravelMode === "all" ? "Behov per reisemåte" : `Behov – ${readableMode(activeTravelMode)}`, formatNeedsByMode(stage?.needs_by_mode))}
          ${field("Du lærer om", formatPlainList(stage?.learning_hooks))}
          ${field("Risiko", formatPlainList(stage?.risk_tags))}
          ${field("Historisk spørsmål", stage?.history_prompt)}
          ${field("Se etter", stage?.observation_prompt)}
        </dl>
        ${activeTravelMode === "all" ? "" : resourcesPanel(cleanText(stage?.route_id), activeTravelMode, { title: "Reisestatus for denne reisen", interactive: false })}
        ${renderStageEvents(cleanText(stage?.id), activeTravelMode)}
      </section>`;
  }

  function render(selected = selectedRouteId) {
    selectedRouteId = cleanText(selected);
    showNodes(selectedRouteId);
    if (selectedRouteId) drawCorridor(selectedRouteId);
    else clearCorridor();
    const panel = ensurePanel();
    const runtime = getRuntime();

    if (!runtime) {
      panel.innerHTML = shell(`<p class="hg-caravan-empty">Karavanedata er ikke lastet ennå</p>`);
      wire(panel);
      return panel;
    }

    const routes = asArray(runtime.routes);
    const route = routes.find((item) => cleanText(item?.id) === selectedRouteId) || null;
    const activeStage = getStage(activeStageId);
    const stagesHtml = route
      ? `${travelModeControl()}${resourcesPanel(route.id)}<section class="hg-caravan-stages" aria-live="polite"><h3>${esc(route.title || route.id)} – Etapper</h3>${stagePreview(activeStage)}${getStages(route.id).map(stageCard).join("") || `<p class="hg-caravan-empty">Ingen etapper funnet.</p>`}</section><div class="hg-caravan-secondary">${renderRouteDiarySection(route.id)}${renderEventLogSection(route.id)}${renderBadgesSection()}</div>`
      : `<p class="hg-caravan-hint">Velg en rute for å se etappene i rekkefølge.</p><div class="hg-caravan-secondary">${renderBadgesSection()}</div>`;

    panel.innerHTML = shell(`
      <div class="hg-caravan-intro"><strong>Europakaravanen</strong><span>Fra Oslo til Roma, Lisboa og Constanța uten bil</span>${resumeNotice ? `<span>${esc(resumeNotice)}</span>` : ""}</div>
      <section class="hg-caravan-routes"><h3>Ruter</h3>${routes.map(routeCard).join("") || `<p class="hg-caravan-empty">Ingen ruter funnet.</p>`}</section>
      ${stagesHtml}
    `);
    wire(panel);
    return panel;
  }

  function getEventById(eventId) {
    const id = cleanText(eventId);
    return asArray(getRuntime()?.events).find((event) => cleanText(event?.id) === id) || null;
  }


  function renderBadgesSection() {
    const api = getBadgesRuntime();
    if (!api?.getAllBadges) return `<details class="hg-caravan-badges"><summary>Merker: ikke lastet</summary><p class="hg-caravan-empty">Merker er ikke lastet ennå.</p></details>`;
    try { api.evaluateAll?.(); } catch (error) { console.warn("[HG_CARAVAN_BADGES]", "evaluering ved render feilet", { error: error?.message || error }); }
    const badges = api.getAllBadges();
    const unlocked = api.getUnlocked?.() || {};
    const summary = api.summary?.() || { total: badges.length, unlocked: Object.keys(unlocked).length };
    return `<details class="hg-caravan-badges" aria-label="Karavane-merker"><summary>Merker: ${esc(summary.unlocked || 0)}/${esc(summary.total || badges.length)} låst opp</summary>${lastBadgeToast ? `<p class="hg-caravan-badge-toast" role="status">Merke låst opp: ${esc(lastBadgeToast)}</p>` : ""}<div class="hg-caravan-badge-list">${badges.map((badge) => {
      const isOpen = Boolean(unlocked[cleanText(badge?.id)]);
      return `<article class="hg-caravan-badge ${isOpen ? "is-unlocked" : "is-locked"}" data-caravan-badge-id="${attr(badge?.id)}"><span class="hg-caravan-badge-icon" aria-hidden="true">${esc(badge?.icon || "◇")}</span><div><h4>${esc(badge?.title || badge?.id || "Merke")}</h4><p>${esc(badge?.description || "")}</p><strong>${isOpen ? "Låst opp" : "Låst"}</strong></div></article>`;
    }).join("") || `<p class="hg-caravan-empty">Ingen merker definert.</p>`}</div></details>`;
  }

  function stageBadgeContributionLine(stage) {
    const badges = getBadgesRuntime()?.getAllBadges?.() || [];
    if (!stage || !badges.length) return "";
    const titles = badges.filter((badge) => ["completed_stage_count", "started_stage_count", "route_started"].includes(cleanText(badge?.criteria_type)))
      .filter((badge) => !badge.criteria?.route_id || cleanText(badge.criteria.route_id) === cleanText(stage?.route_id))
      .slice(0, 4).map((badge) => cleanText(badge.title)).filter(Boolean);
    return titles.length ? `<p class="hg-caravan-badge-contribution">Denne etappen kan bidra til: ${esc(titles.join(", "))}</p>` : "";
  }

  function renderEventLogSection(routeId) {
    const entries = getEventLogRuntime()?.getRouteLog?.(routeId, activeTravelMode === "all" ? "all" : activeTravelMode) || [];
    const recent = entries.slice().sort((a, b) => cleanText(b.createdAt).localeCompare(cleanText(a.createdAt))).slice(0, 3);
    return `<details class="hg-caravan-log"><summary>Logg: siste ${esc(recent.length)} valg</summary>${recent.length ? recent.map((entry) => {
      const route = asArray(getRuntime()?.routes).find((item) => cleanText(item?.id) === entry.route_id);
      const stage = getStage(entry.stage_id);
      const event = getEventById(entry.event_id);
      const when = entry.createdAt ? new Date(entry.createdAt).toLocaleString("nb-NO", { dateStyle: "short", timeStyle: "short" }) : "—";
      return `<article class="hg-caravan-log-entry"><strong>${esc(route?.title || entry.route_id)}</strong><span>${esc(nodeTitle(stage?.from_node))} → ${esc(nodeTitle(stage?.to_node))}</span><span>${esc(event?.title || entry.event_id)}</span><span>${esc(readableMode(entry.travel_mode))}: ${esc(choiceLabel(event, entry.choice_id))}</span><time>${esc(when)}</time></article>`;
    }).join("") : `<p class="hg-caravan-empty">Ingen valg logget ennå.</p>`}</details>`;
  }

  function shell(body) {
    return `
      <div class="hg-caravan-panel-card">
        <header class="hg-caravan-head">
          <div><p class="hg-caravan-kicker">Reise</p><h2>Karavane</h2></div>
          <button type="button" class="hg-caravan-close" data-caravan-close aria-label="Lukk Karavane">×</button>
        </header>
        ${body}
      </div>`;
  }

  function wire(panel) {
    panel.querySelector("[data-caravan-close]")?.addEventListener("click", close);
    panel.querySelectorAll("[data-caravan-route]").forEach((btn) => {
      btn.addEventListener("click", () => { clearStagePreview(false); const routeId = btn.getAttribute("data-caravan-route") || ""; render(routeId); setLastView(routeId, activeTravelMode, ""); });
    });
    panel.querySelectorAll("[data-caravan-travel-mode]").forEach((btn) => {
      btn.addEventListener("click", () => setTravelMode(btn.getAttribute("data-caravan-travel-mode") || "all"));
    });
    panel.querySelectorAll("[data-caravan-stage]").forEach((btn) => {
      btn.addEventListener("click", () => previewStage(btn.getAttribute("data-caravan-stage") || ""));
    });
    panel.querySelectorAll("[data-caravan-progress-status]").forEach((btn) => {
      btn.addEventListener("click", () => setActiveStageProgress(btn.getAttribute("data-caravan-progress-status") || "none"));
    });
    panel.querySelectorAll("[data-caravan-resource-adjust]").forEach((btn) => {
      btn.addEventListener("click", () => adjustActiveResource(btn.getAttribute("data-caravan-resource-adjust") || "", Number(btn.getAttribute("data-caravan-resource-delta") || 0)));
    });
    panel.querySelectorAll("[data-caravan-resource-reset]").forEach((btn) => {
      btn.addEventListener("click", resetActiveResources);
    });
    panel.querySelectorAll("[data-caravan-event-choice]").forEach((btn) => {
      btn.addEventListener("click", () => setEventChoice(btn.getAttribute("data-caravan-event-id") || "", btn.getAttribute("data-caravan-event-choice") || "", btn.getAttribute("data-caravan-stage-id") || activeStageId, btn.getAttribute("data-caravan-route-id") || selectedRouteId));
    });
    panel.querySelectorAll("[data-caravan-clear-event-choice]").forEach((btn) => {
      btn.addEventListener("click", () => clearEventChoice(btn.getAttribute("data-caravan-clear-event-choice") || "", btn.getAttribute("data-caravan-stage-id") || activeStageId, btn.getAttribute("data-caravan-route-id") || selectedRouteId));
    });
    panel.querySelectorAll("[data-caravan-apply-consequence]").forEach((btn) => {
      btn.addEventListener("click", () => applyChoiceEffects(btn.getAttribute("data-caravan-event-id") || "", btn.getAttribute("data-caravan-apply-consequence") || "", btn.getAttribute("data-caravan-stage-id") || activeStageId, btn.getAttribute("data-caravan-route-id") || selectedRouteId));
    });
    panel.querySelectorAll("[data-caravan-clear-consequence]").forEach((btn) => {
      btn.addEventListener("click", () => clearAppliedConsequence(btn.getAttribute("data-caravan-clear-consequence") || "", btn.getAttribute("data-caravan-stage-id") || activeStageId, btn.getAttribute("data-caravan-route-id") || selectedRouteId));
    });
  }

  function popupHtml(node) {
    return `
      <article class="hg-caravan-node-card">
        <h3>${esc(node?.title || node?.id || "Karavane-node")}</h3>
        <dl>
          ${field("Land", node?.country)}
          ${field("Node-type", node?.node_type)}
          ${field("Karavane-rolle", node?.caravan_role)}
          ${field("Reisebrille", readableMode(activeTravelMode))}
          ${field("Du lærer om", formatNodeList(node?.learning_hooks))}
          ${field("Tags", formatNodeList(node?.tags))}
        </dl>
      </article>`;
  }

  function clearNodes() {
    caravanMarkers.forEach((marker) => {
      try { marker.remove(); } catch {}
    });
    caravanMarkers = [];
  }

  function showNodes(routeId = selectedRouteId) {
    clearNodes();
    const map = getMap();
    const Marker = window.maplibregl?.Marker;
    if (!map || !Marker) return [];

    const Popup = window.maplibregl?.Popup;
    const visible = [];
    for (const node of getNodesForRoute(routeId)) {
      const lat = num(node?.lat);
      const lng = num(node?.lng);
      if (lat == null || lng == null) continue;

      const el = document.createElement("button");
      el.type = "button";
      el.className = "hg-caravan-node-marker";
      el.setAttribute("aria-label", `Karavane-node: ${cleanText(node?.title || node?.id)}`);
      el.dataset.caravanNodeId = cleanText(node?.id);

      const marker = new Marker({ element: el, anchor: "center" }).setLngLat([lng, lat]).addTo(map);
      if (Popup) marker.setPopup(new Popup({ closeButton: true, closeOnClick: true, maxWidth: "280px" }).setHTML(popupHtml(node)));
      marker.__hgCaravanNodeId = cleanText(node?.id);
      caravanMarkers.push(marker);
      visible.push(cleanText(node?.id));
    }
    return visible;
  }


  function updateActiveNodeStyling() {
    const stage = getStage(activeStageId);
    const activeIds = new Set([cleanText(stage?.from_node), cleanText(stage?.to_node)].filter(Boolean));
    caravanMarkers.forEach((marker) => {
      const el = marker?.getElement?.();
      if (!el) return;
      const nodeId = cleanText(el.dataset.caravanNodeId || marker.__hgCaravanNodeId);
      el.classList.toggle("is-active-stage-node", activeIds.has(nodeId));
      el.classList.toggle("is-dimmed-stage-node", Boolean(activeStageId) && !activeIds.has(nodeId));
    });
  }

  function fitStageBounds(stage, fromNode, toNode) {
    const map = getMap();
    const fromLat = num(fromNode?.lat);
    const fromLng = num(fromNode?.lng);
    const toLat = num(toNode?.lat);
    const toLng = num(toNode?.lng);
    if (!map || fromLat == null || fromLng == null || toLat == null || toLng == null) {
      console.warn(PREFIX, "kan ikke fitBounds for stage-preview: lat/lng mangler", { stage_id: cleanText(stage?.id), from_node: stage?.from_node, to_node: stage?.to_node });
      return;
    }
    if (typeof map.fitBounds === "function") {
      map.fitBounds([[fromLng, fromLat], [toLng, toLat]], { padding: 96, maxZoom: 8, duration: 700 });
    }
  }

  function previewStage(stageId) {
    const stage = getStage(stageId);
    if (!stage) {
      console.warn(PREFIX, "stage mangler for preview", cleanText(stageId));
      return null;
    }
    activeStageId = cleanText(stage.id);
    if (cleanText(stage.route_id) && cleanText(stage.route_id) !== selectedRouteId) selectedRouteId = cleanText(stage.route_id);
    setLastView(selectedRouteId, activeTravelMode, activeStageId);
    render(selectedRouteId);
    const fromNode = getNodeById(stage.from_node, activeStageId);
    const toNode = getNodeById(stage.to_node, activeStageId);
    updateActiveNodeStyling();
    drawCorridor(selectedRouteId);
    fitStageBounds(stage, fromNode, toNode);
    return stage;
  }

  function clearStagePreview(rerender = true) {
    activeStageId = "";
    updateActiveNodeStyling();
    if (rerender) render(selectedRouteId);
  }

  function getVisibleNodeIds() {
    return caravanMarkers.map((marker) => cleanText(marker?.getElement?.()?.dataset?.caravanNodeId)).filter(Boolean);
  }

  function setTravelMode(mode) {
    activeTravelMode = normalizeTravelMode(mode);
    setLastView(selectedRouteId, activeTravelMode, activeStageId);
    render(selectedRouteId);
    updateActiveNodeStyling();
    drawCorridor(selectedRouteId);
    return activeTravelMode;
  }

  function getTravelMode() {
    return activeTravelMode;
  }

  function setActiveResource(resourceKey, value) {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all" || !selectedRouteId) return null;
    const result = getResourcesRuntime()?.setResource?.(selectedRouteId, mode, resourceKey, value) || null;
    render(selectedRouteId);
    return result;
  }

  function adjustActiveResource(resourceKey, delta) {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all" || !selectedRouteId) return null;
    const result = getResourcesRuntime()?.adjustResource?.(selectedRouteId, mode, resourceKey, delta) || null;
    render(selectedRouteId);
    return result;
  }

  function resetActiveResources() {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all" || !selectedRouteId) return null;
    const result = getResourcesRuntime()?.resetResources?.(selectedRouteId, mode) || null;
    render(selectedRouteId);
    return result;
  }

  function setActiveStageProgress(status) {
    const stage = getStage(activeStageId);
    const mode = normalizeTravelMode(activeTravelMode);
    if (!stage || mode === "all") return null;
    const runtime = getProgressRuntime();
    if (!runtime) return null;
    const result = status === "none" ? runtime.clearProgress(cleanText(stage.route_id), cleanText(stage.id), mode) : runtime.setProgress(cleanText(stage.route_id), cleanText(stage.id), mode, status);
    try { getBadgesRuntime()?.evaluateAll?.(); } catch (error) { console.warn("[HG_CARAVAN_BADGES]", "evaluering etter progress feilet", { error: error?.message || error }); }
    render(selectedRouteId);
    updateActiveNodeStyling();
    drawCorridor(selectedRouteId);
    return result;
  }

  function setEventChoice(eventId, choiceId, stageId = activeStageId, routeId = selectedRouteId) {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all") { console.warn(PREFIX, "kan ikke lagre eventvalg når reisebrille er Alle", { eventId, choiceId }); return null; }
    const event = getEventById(eventId);
    const sid = cleanText(stageId || event?.stage_id);
    const rid = cleanText(routeId || event?.route_id);
    const cid = cleanText(choiceId);
    if (!asArray(event?.choices).some((choice) => cleanText(choice?.id) === cid)) { console.warn(PREFIX, "ugyldig eventvalg", { eventId, choiceId }); return null; }
    const result = getEventLogRuntime()?.setChoice?.(rid, sid, eventId, mode, cid) || null;
    try { getBadgesRuntime()?.evaluateAll?.(); } catch (error) { console.warn("[HG_CARAVAN_BADGES]", "evaluering etter eventvalg feilet", { error: error?.message || error }); }
    render(selectedRouteId);
    return result;
  }

  function getEventChoice(eventId, stageId = activeStageId, routeId = selectedRouteId) {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all") { console.warn(PREFIX, "kan ikke lese eventvalg når reisebrille er Alle", { eventId }); return null; }
    const event = getEventById(eventId);
    return getEventLogRuntime()?.getChoice?.(cleanText(routeId || event?.route_id), cleanText(stageId || event?.stage_id), eventId, mode) || null;
  }

  function clearEventChoice(eventId, stageId = activeStageId, routeId = selectedRouteId) {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all") { console.warn(PREFIX, "kan ikke nullstille eventvalg når reisebrille er Alle", { eventId }); return null; }
    const event = getEventById(eventId);
    const result = getEventLogRuntime()?.clearChoice?.(cleanText(routeId || event?.route_id), cleanText(stageId || event?.stage_id), eventId, mode) || null;
    render(selectedRouteId);
    return result;
  }

  function applyChoiceEffects(eventId, choiceId, stageId = activeStageId, routeId = selectedRouteId) {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all") return null;
    const event = getEventById(eventId);
    const result = getConsequencesRuntime()?.applyChoiceEffects?.(cleanText(routeId || event?.route_id), cleanText(stageId || event?.stage_id), eventId, choiceId, mode) || null;
    try { getBadgesRuntime()?.evaluateAll?.(); } catch (error) { console.warn("[HG_CARAVAN_BADGES]", "evaluering etter konsekvens feilet", { error: error?.message || error }); }
    render(selectedRouteId);
    return result;
  }

  function getChoiceEffects(eventId, choiceId) {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all") return null;
    return getConsequencesRuntime()?.getChoiceEffects?.(eventId, choiceId, mode) || null;
  }

  function getAppliedConsequence(eventId, stageId = activeStageId, routeId = selectedRouteId) {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all") return null;
    const event = getEventById(eventId);
    return getConsequencesRuntime()?.getApplied?.(cleanText(routeId || event?.route_id), cleanText(stageId || event?.stage_id), eventId, mode) || null;
  }

  function clearAppliedConsequence(eventId, stageId = activeStageId, routeId = selectedRouteId) {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all") return null;
    const event = getEventById(eventId);
    const result = getConsequencesRuntime()?.clearApplied?.(cleanText(routeId || event?.route_id), cleanText(stageId || event?.stage_id), eventId, mode) || null;
    render(selectedRouteId);
    return result;
  }

  function getActiveStageProgress() {
    const stage = getStage(activeStageId);
    if (!stage || activeTravelMode === "all") return null;
    return getStageProgress(stage);
  }

  function clearActiveStageProgress() {
    return setActiveStageProgress("none");
  }

  function openDiary(routeId = selectedRouteId) {
    open(routeId);
    document.querySelector(".hg-caravan-diary")?.scrollIntoView?.({ block: "start" });
  }

  function getDiary(routeId = selectedRouteId, mode = activeTravelMode) {
    return getDiaryRuntime()?.getRouteDiary?.(routeId, mode) || [];
  }

  function getStageDiary(stageId = activeStageId, routeId = selectedRouteId, mode = activeTravelMode) {
    const stage = stageId ? getStage(stageId) : getStage(activeStageId);
    return getDiaryRuntime()?.getStageDiary?.(cleanText(routeId || stage?.route_id), cleanText(stageId || stage?.id), mode) || [];
  }

  function exportDiaryJson(routeId = selectedRouteId, mode = activeTravelMode) {
    return getDiaryRuntime()?.exportJson?.(routeId, mode) || null;
  }

  function open(routeId) {
    resumeNotice = null;
    const panel = render(routeId || selectedRouteId);
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("hg-caravan-open");
    showNodes(selectedRouteId);
    updateActiveNodeStyling();
  }

  function openResume() {
    const target = getResumeTarget();
    if (!target) { open(); return null; }
    resumeNotice = resumeLine(target);
    activeTravelMode = normalizeTravelMode(target.travel_mode);
    activeStageId = "";
    const panel = render(target.route_id);
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("hg-caravan-open");
    if (target.stage_id) previewStage(target.stage_id);
    else { showNodes(selectedRouteId); updateActiveNodeStyling(); }
    return target;
  }

  function close() {
    const panel = ensurePanel();
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("hg-caravan-open");
    clearStagePreview(false);
    activeTravelMode = "all";
    resumeNotice = null;
    clearCorridor();
    clearNodes();
    panel.innerHTML = "";
  }

  function evaluateBadges() { return getBadgesRuntime()?.evaluateAll?.() || []; }
  function getUnlockedBadges() { return getBadgesRuntime()?.getUnlocked?.() || {}; }
  function resetCaravanBadges() { const result = getBadgesRuntime()?.resetBadges?.() || null; render(selectedRouteId); return result; }

  function bindEntryButton() {
    document.getElementById(BUTTON_ID)?.addEventListener("click", () => {
      try { openResume(); }
      catch (error) { console.warn(HEADER_PREFIX, "kunne ikke åpne Karavane-resume; åpner vanlig", { error: error?.message || error }); open(); }
    });
  }

  window.HG_CARAVAN_UI_DEBUG = { open, openResume, close, renderStageEvents, getEventsForStage, getEventsForRoute, renderRoute: (routeId) => open(routeId), openDiary, getDiary, getStageDiary, exportDiaryJson, showNodes, clearNodes, getVisibleNodeIds, previewStage, clearStagePreview, getActiveStageId: () => activeStageId, setTravelMode, getTravelMode, getVisibleStagesForMode, drawCorridor, clearCorridor, getVisibleCorridorRouteId: () => visibleCorridorRouteId, getVisibleCorridorSegmentIds: () => visibleCorridorSegmentIds.slice(), setStageProgress: (stageId, status) => { if (stageId) previewStage(stageId); return setActiveStageProgress(status); }, getStageProgress: (stageId) => { const stage = stageId ? getStage(stageId) : getStage(activeStageId); return stage && activeTravelMode !== "all" ? getStageProgress(stage) : null; }, clearStageProgress: (stageId) => { if (stageId) previewStage(stageId); return clearActiveStageProgress(); }, getActiveStageProgress, setEventChoice, getEventChoice, clearEventChoice, getRouteEventLog: (routeId, mode) => getEventLogRuntime()?.getRouteLog?.(routeId || selectedRouteId, mode || activeTravelMode) || [], getResources: () => getRouteResources(), setResource: setActiveResource, adjustResource: adjustActiveResource, resetResources: resetActiveResources, getChoiceEffects, applyChoiceEffects, getAppliedConsequence, clearAppliedConsequence, evaluateBadges, getUnlockedBadges, resetCaravanBadges, getLastView, setLastView, clearLastView, getResumeTarget };

  window.HG_CARAVAN_HEADER_DEBUG = { open: openResume, getLastView, setLastView, clearLastView, getResumeTarget };

  window.addEventListener?.("hg:caravanBadgeUnlocked", (event) => { lastBadgeToast = cleanText(event?.detail?.badge?.title || event?.detail?.badgeId); if (!document.getElementById(PANEL_ID)?.hidden) render(selectedRouteId); });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEntryButton, { once: true });
  } else {
    bindEntryButton();
  }
})();
