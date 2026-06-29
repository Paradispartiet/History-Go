// js/ui/caravan-panel.js
// UI for Europakaravanen. Draws visual corridors and stores local-only stage progression.
(function () {
  "use strict";

  const PREFIX = "[HG_CARAVAN_UI]";
  const PANEL_ID = "hgCaravanPanel";
  const BUTTON_ID = "btnKaravane";
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
    return "Ingen progresjon";
  }

  function getEventLogRuntime() {
    return window.HG_CARAVAN_EVENT_LOG || null;
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
    if (!summary) return "Ingen progresjon";
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
        <span class="hg-caravan-route-meta">ID: ${esc(id || "—")} · ${stages.length} stages · ${esc(modes.join(", ") || "—")}</span>
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
    return `<div class="hg-caravan-travel-mode" role="group" aria-label="Reisebrille">${TRAVEL_MODES.map((mode) => `
      <button type="button" class="hg-caravan-travel-mode-option ${mode === activeTravelMode ? "is-active" : ""}" data-caravan-travel-mode="${attr(mode)}" aria-pressed="${mode === activeTravelMode ? "true" : "false"}">${esc(readableMode(mode))}</button>`).join("")}
    </div>`;
  }

  function stageCard(stage) {
    const id = cleanText(stage?.id);
    const from = nodeTitle(stage?.from_node);
    const to = nodeTitle(stage?.to_node);
    const supported = stageSupportsMode(stage);
    const status = getStageProgressStatus(stage);
    const progressLabel = activeTravelMode === "all" ? getStageAllModeProgressLabel(stage) : (PROGRESS_LABELS[status] || "Ingen progresjon");
    const eventsLabel = eventCountLabel(stage);
    const logLabel = stageEventLogLabel(stage);
    return `
      <button type="button" class="hg-caravan-stage ${id === activeStageId ? "is-active" : ""} ${supported ? "is-mode-supported" : "is-mode-dimmed"}" data-caravan-stage="${attr(id)}">
        <span class="hg-caravan-stage-title">${esc(stage?.order ?? "—")}. ${esc(from)} → ${esc(to)}</span>
        <span class="hg-caravan-stage-meta">${stage?.approximate_distance_km != null ? `${esc(stage.approximate_distance_km)} km` : "Distanse ukjent"} · ${esc(formatList(stage?.allowed_modes))}</span>
        <span class="hg-caravan-progress-pill">${esc(progressLabel)}</span>
        <span class="hg-caravan-event-pill">${esc(eventsLabel)}</span>
        ${logLabel ? `<span class="hg-caravan-log-pill">${esc(logLabel)}</span>` : ""}
      </button>`;
  }

  function progressControls(stage) {
    const disabled = activeTravelMode === "all";
    const status = getStageProgressStatus(stage);
    return `<div class="hg-caravan-progress-controls">
      ${disabled ? `<p class="hg-caravan-progress-hint">Velg Til fots, Hest eller Sykkel for å lagre progresjon</p>` : `<p class="hg-caravan-progress-hint">Progresjon for ${esc(readableMode(activeTravelMode))}</p>`}
      <div class="hg-caravan-progress-buttons" role="group" aria-label="Stage-progresjon">
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
        <p class="hg-caravan-event-meta">Hendelse: ${esc(eventLabel(event?.event_type))} · Alvorlighet: ${esc(severityLabel(event?.severity))} · Reisemåter: ${esc(formatList(event?.applies_to_modes))}</p>
        ${cleanText(event?.prompt) ? `<p>${esc(event.prompt)}</p>` : ""}
        ${logged ? `<p class="hg-caravan-selected-choice">Valgt for ${esc(readableMode(selectedMode))}: ${esc(choiceLabel(event, logged.choice_id))}</p>` : ""}
        ${cleanText(event?.historical_context) ? `<p><strong>Historisk kontekst:</strong> ${esc(event.historical_context)}</p>` : ""}
        ${cleanText(event?.observation_prompt) ? `<p><strong>Observasjon:</strong> ${esc(event.observation_prompt)}</p>` : ""}
        ${asArray(event?.choices).length ? `<div class="hg-caravan-event-choices" aria-label="${readOnly ? "Read-only valg" : "Lagre valg"}">${asArray(event.choices).map((choice) => {
          const choiceId = cleanText(choice?.id);
          const active = logged && cleanText(logged.choice_id) === choiceId;
          const body = `<strong>${esc(choice?.label || choiceId || "Valg")}</strong>${cleanText(choice?.note) ? ` – ${esc(choice.note)}` : ""}`;
          return readOnly ? `<span class="hg-caravan-event-choice">${body}</span>` : `<button type="button" class="hg-caravan-event-choice ${active ? "is-active" : ""}" data-caravan-event-choice="${attr(choiceId)}" data-caravan-event-id="${attr(event?.id)}" data-caravan-stage-id="${attr(stageId)}" data-caravan-route-id="${attr(event?.route_id)}" aria-pressed="${active ? "true" : "false"}">${body}</button>`;
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
        <h3>Stage-preview</h3>
        <h4>${esc(from)} → ${esc(to)}</h4>
        ${progressControls(stage)}
        <dl>
          ${field("Distanse", stage?.approximate_distance_km != null ? `${stage.approximate_distance_km} km` : "")}
          ${field("Distanse-sikkerhet", stage?.distance_confidence)}
          ${field("Reisemåter", stage?.allowed_modes)}
          ${field("Underlag", formatPlainList(stage?.surface_types))}
          ${field(activeTravelMode === "all" ? "Behov per reisemåte" : `Behov – ${readableMode(activeTravelMode)}`, formatNeedsByMode(stage?.needs_by_mode))}
          ${field("Læringskroker", formatPlainList(stage?.learning_hooks))}
          ${field("Risiko", formatPlainList(stage?.risk_tags))}
          ${field("Historieprompt", stage?.history_prompt)}
          ${field("Observasjonsprompt", stage?.observation_prompt)}
        </dl>
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
      ? `${stagePreview(activeStage)}<section class="hg-caravan-stages" aria-live="polite"><h3>${esc(route.title || route.id)} – stages</h3>${travelModeControl()}${getStages(route.id).map(stageCard).join("") || `<p class="hg-caravan-empty">Ingen stages funnet.</p>`}</section>${renderEventLogSection(route.id)}`
      : `<p class="hg-caravan-hint">Velg en route for å se stages i rekkefølge.</p>`;

    panel.innerHTML = shell(`
      <div class="hg-caravan-intro"><strong>Europakaravanen</strong><span>Fra Oslo til Roma, Lisboa og Constanța uten bil</span></div>
      <section class="hg-caravan-routes"><h3>Routes</h3>${routes.map(routeCard).join("") || `<p class="hg-caravan-empty">Ingen routes funnet.</p>`}</section>
      ${stagesHtml}
    `);
    wire(panel);
    return panel;
  }

  function getEventById(eventId) {
    const id = cleanText(eventId);
    return asArray(getRuntime()?.events).find((event) => cleanText(event?.id) === id) || null;
  }

  function renderEventLogSection(routeId) {
    const entries = getEventLogRuntime()?.getRouteLog?.(routeId, activeTravelMode === "all" ? "all" : activeTravelMode) || [];
    const recent = entries.slice().sort((a, b) => cleanText(b.createdAt).localeCompare(cleanText(a.createdAt))).slice(0, 5);
    return `<section class="hg-caravan-log"><h3>Logg</h3>${recent.length ? recent.map((entry) => {
      const route = asArray(getRuntime()?.routes).find((item) => cleanText(item?.id) === entry.route_id);
      const stage = getStage(entry.stage_id);
      const event = getEventById(entry.event_id);
      const when = entry.createdAt ? new Date(entry.createdAt).toLocaleString("nb-NO", { dateStyle: "short", timeStyle: "short" }) : "—";
      return `<article class="hg-caravan-log-entry"><strong>${esc(route?.title || entry.route_id)}</strong><span>${esc(nodeTitle(stage?.from_node))} → ${esc(nodeTitle(stage?.to_node))}</span><span>${esc(event?.title || entry.event_id)}</span><span>${esc(readableMode(entry.travel_mode))}: ${esc(choiceLabel(event, entry.choice_id))}</span><time>${esc(when)}</time></article>`;
    }).join("") : `<p class="hg-caravan-empty">Ingen valg logget ennå.</p>`}</section>`;
  }

  function shell(body) {
    return `
      <div class="hg-caravan-panel-card">
        <header class="hg-caravan-head">
          <div><p class="hg-caravan-kicker">Read-only data</p><h2>Karavane</h2></div>
          <button type="button" class="hg-caravan-close" data-caravan-close aria-label="Lukk Karavane">×</button>
        </header>
        ${body}
      </div>`;
  }

  function wire(panel) {
    panel.querySelector("[data-caravan-close]")?.addEventListener("click", close);
    panel.querySelectorAll("[data-caravan-route]").forEach((btn) => {
      btn.addEventListener("click", () => { clearStagePreview(false); render(btn.getAttribute("data-caravan-route") || ""); });
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
    panel.querySelectorAll("[data-caravan-event-choice]").forEach((btn) => {
      btn.addEventListener("click", () => setEventChoice(btn.getAttribute("data-caravan-event-id") || "", btn.getAttribute("data-caravan-event-choice") || "", btn.getAttribute("data-caravan-stage-id") || activeStageId, btn.getAttribute("data-caravan-route-id") || selectedRouteId));
    });
    panel.querySelectorAll("[data-caravan-clear-event-choice]").forEach((btn) => {
      btn.addEventListener("click", () => clearEventChoice(btn.getAttribute("data-caravan-clear-event-choice") || "", btn.getAttribute("data-caravan-stage-id") || activeStageId, btn.getAttribute("data-caravan-route-id") || selectedRouteId));
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
          ${field("Læringskroker", formatNodeList(node?.learning_hooks))}
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
    render(selectedRouteId);
    updateActiveNodeStyling();
    drawCorridor(selectedRouteId);
    return activeTravelMode;
  }

  function getTravelMode() {
    return activeTravelMode;
  }

  function setActiveStageProgress(status) {
    const stage = getStage(activeStageId);
    const mode = normalizeTravelMode(activeTravelMode);
    if (!stage || mode === "all") return null;
    const runtime = getProgressRuntime();
    if (!runtime) return null;
    const result = status === "none" ? runtime.clearProgress(cleanText(stage.route_id), cleanText(stage.id), mode) : runtime.setProgress(cleanText(stage.route_id), cleanText(stage.id), mode, status);
    render(selectedRouteId);
    updateActiveNodeStyling();
    drawCorridor(selectedRouteId);
    return result;
  }

  function setEventChoice(eventId, choiceId, stageId = activeStageId, routeId = selectedRouteId) {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all") return null;
    const event = getEventById(eventId);
    const sid = cleanText(stageId || event?.stage_id);
    const rid = cleanText(routeId || event?.route_id);
    const cid = cleanText(choiceId);
    if (!asArray(event?.choices).some((choice) => cleanText(choice?.id) === cid)) { console.warn(PREFIX, "ugyldig eventvalg", { eventId, choiceId }); return null; }
    const result = getEventLogRuntime()?.setChoice?.(rid, sid, eventId, mode, cid) || null;
    render(selectedRouteId);
    return result;
  }

  function getEventChoice(eventId, stageId = activeStageId, routeId = selectedRouteId) {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all") return null;
    const event = getEventById(eventId);
    return getEventLogRuntime()?.getChoice?.(cleanText(routeId || event?.route_id), cleanText(stageId || event?.stage_id), eventId, mode) || null;
  }

  function clearEventChoice(eventId, stageId = activeStageId, routeId = selectedRouteId) {
    const mode = normalizeTravelMode(activeTravelMode);
    if (mode === "all") return null;
    const event = getEventById(eventId);
    const result = getEventLogRuntime()?.clearChoice?.(cleanText(routeId || event?.route_id), cleanText(stageId || event?.stage_id), eventId, mode) || null;
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

  function open(routeId) {
    const panel = render(routeId || selectedRouteId);
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("hg-caravan-open");
    showNodes(selectedRouteId);
    updateActiveNodeStyling();
  }

  function close() {
    const panel = ensurePanel();
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("hg-caravan-open");
    clearStagePreview(false);
    activeTravelMode = "all";
    clearCorridor();
    clearNodes();
    panel.innerHTML = "";
  }

  function bindEntryButton() {
    document.getElementById(BUTTON_ID)?.addEventListener("click", () => open());
  }

  window.HG_CARAVAN_UI_DEBUG = { open, close, renderStageEvents, getEventsForStage, getEventsForRoute, renderRoute: (routeId) => open(routeId), showNodes, clearNodes, getVisibleNodeIds, previewStage, clearStagePreview, getActiveStageId: () => activeStageId, setTravelMode, getTravelMode, getVisibleStagesForMode, drawCorridor, clearCorridor, getVisibleCorridorRouteId: () => visibleCorridorRouteId, getVisibleCorridorSegmentIds: () => visibleCorridorSegmentIds.slice(), setStageProgress: (stageId, status) => { if (stageId) previewStage(stageId); return setActiveStageProgress(status); }, getStageProgress: (stageId) => { const stage = stageId ? getStage(stageId) : getStage(activeStageId); return stage && activeTravelMode !== "all" ? getStageProgress(stage) : null; }, clearStageProgress: (stageId) => { if (stageId) previewStage(stageId); return clearActiveStageProgress(); }, getActiveStageProgress, setEventChoice, getEventChoice, clearEventChoice, getRouteEventLog: (routeId, mode) => getEventLogRuntime()?.getRouteLog?.(routeId || selectedRouteId, mode || activeTravelMode) || [] };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEntryButton, { once: true });
  } else {
    bindEntryButton();
  }
})();
