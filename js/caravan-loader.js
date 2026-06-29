// js/caravan-loader.js
// Runtime-loader for Europakaravanen data. No UI side effects.
(function () {
  "use strict";

  const PREFIX = "[HG_CARAVAN]";
  const FILES = {
    routes: "karavaner/karavanen_europa_routes.json",
    stages: "karavaner/karavanen_europa_stages.json",
    nodes: "karavaner/karavanen_europa_nodes.json",
    events: "karavaner/karavanen_europa_events.json"
  };
  const ALLOWED_MODES = new Set(["til_fots", "hest", "sykkel"]);
  const ALLOWED_EVENT_TYPES = new Set(["weather", "rest", "water", "food", "stable", "ferry", "border", "terrain", "traffic", "shelter", "repair", "animal_care", "document_check"]);
  const ALLOWED_SEVERITIES = new Set(["info", "low", "medium", "high"]);

  function emptyRuntime(warnings) {
    return {
      routes: [],
      stages: [],
      nodes: [],
      events: [],
      indexes: {
        routesById: Object.create(null),
        nodesById: Object.create(null),
        stagesByRoute: Object.create(null),
        stagesByFromNode: Object.create(null),
        stagesByToNode: Object.create(null),
        eventsByStage: Object.create(null),
        eventsByRoute: Object.create(null),
        eventsByMode: Object.create(null)
      },
      warnings: Array.isArray(warnings) ? warnings : []
    };
  }

  const runtime = window.HG_CARAVAN || emptyRuntime([]);
  window.HG_CARAVAN = runtime;

  function warn(message, detail) {
    runtime.warnings.push({ message, detail });
    if (detail !== undefined) console.warn(PREFIX, message, detail);
    else console.warn(PREFIX, message);
  }

  function asArray(payload, key) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.[key])) return payload[key];
    return [];
  }

  async function fetchData(path, opts) {
    try {
      if (window.DataHub?.fetchJSON && window.DataHub?.DEFAULTS?.DATA_BASE) {
        const url = `${window.DataHub.DEFAULTS.DATA_BASE}/${path}`.replace(/([^:]\/)\/+/g, "$1");
        return await window.DataHub.fetchJSON(url, opts);
      }

      const base = document.querySelector("base")?.getAttribute("href") || location.pathname.replace(/[^/]+$/, "");
      const root = base.endsWith("/") ? base : `${base}/`;
      const res = await fetch(`${root}data/${path}`, { cache: opts?.cache || "default" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      warn(`Kunne ikke laste data/${path}`, error?.message || error);
      return null;
    }
  }

  function pushIndex(index, key, value) {
    if (!key) return;
    (index[key] ||= []).push(value);
  }

  function validateAndIndex(routes, stages, nodes, events) {
    const next = emptyRuntime(runtime.warnings);
    next.routes = routes;
    next.stages = stages;
    next.nodes = nodes;
    next.events = events;

    for (const route of routes) {
      const id = String(route?.id || "").trim();
      if (!id) {
        warn("route id mangler", route);
        continue;
      }
      next.indexes.routesById[id] = route;
    }

    for (const node of nodes) {
      const id = String(node?.id || "").trim();
      if (!id) {
        warn("node id mangler", node);
        continue;
      }
      if (typeof node?.lat !== "number" || !Number.isFinite(node.lat)) warn("node.lat mangler eller er ikke number", { node_id: id, lat: node?.lat });
      if (typeof node?.lng !== "number" || !Number.isFinite(node.lng)) warn("node.lng mangler eller er ikke number", { node_id: id, lng: node?.lng });
      if (!String(node?.geo_confidence || "").trim()) warn("node.geo_confidence mangler", { node_id: id });
      next.indexes.nodesById[id] = node;
    }

    for (const stage of stages) {
      const id = String(stage?.id || "").trim();
      const routeId = String(stage?.route_id || "").trim();
      const fromNode = String(stage?.from_node || "").trim();
      const toNode = String(stage?.to_node || "").trim();

      if (!id) warn("stage id mangler", stage);
      if (routeId && !next.indexes.routesById[routeId]) warn("stage.route_id finnes ikke i routesById", { stage_id: id, route_id: routeId });
      if (fromNode && !next.indexes.nodesById[fromNode]) warn("stage.from_node finnes ikke i nodesById", { stage_id: id, from_node: fromNode });
      if (toNode && !next.indexes.nodesById[toNode]) warn("stage.to_node finnes ikke i nodesById", { stage_id: id, to_node: toNode });

      for (const mode of Array.isArray(stage?.allowed_modes) ? stage.allowed_modes : []) {
        if (!ALLOWED_MODES.has(mode)) warn("allowed_modes inneholder ukjent verdi", { stage_id: id, mode });
      }

      pushIndex(next.indexes.stagesByRoute, routeId, stage);
      pushIndex(next.indexes.stagesByFromNode, fromNode, stage);
      pushIndex(next.indexes.stagesByToNode, toNode, stage);
    }


    const stageIds = new Set(stages.map((stage) => String(stage?.id || "").trim()).filter(Boolean));
    for (const event of events) {
      const id = String(event?.id || "").trim();
      const routeId = String(event?.route_id || "").trim();
      const stageId = String(event?.stage_id || "").trim();
      const eventType = String(event?.event_type || "").trim();
      const severity = String(event?.severity || "").trim();
      const modes = Array.isArray(event?.applies_to_modes) ? event.applies_to_modes.map((mode) => String(mode || "").trim()).filter(Boolean) : [];

      if (!id) warn("event.id mangler", event);
      if (!routeId || !next.indexes.routesById[routeId]) warn("event.route_id finnes ikke i routesById", { event_id: id, route_id: routeId });
      if (!stageId || !stageIds.has(stageId)) warn("event.stage_id finnes ikke i stages", { event_id: id, stage_id: stageId });
      if (!ALLOWED_EVENT_TYPES.has(eventType)) warn("event.event_type er ikke tillatt", { event_id: id, event_type: eventType });
      if (!ALLOWED_SEVERITIES.has(severity)) warn("event.severity er ikke tillatt", { event_id: id, severity });
      for (const mode of modes) {
        if (!ALLOWED_MODES.has(mode)) warn("event.applies_to_modes inneholder ukjent verdi", { event_id: id, mode });
        else pushIndex(next.indexes.eventsByMode, mode, event);
      }
      pushIndex(next.indexes.eventsByStage, stageId, event);
      pushIndex(next.indexes.eventsByRoute, routeId, event);
    }

    return next;
  }

  function replaceRuntime(next) {
    runtime.routes = next.routes;
    runtime.stages = next.stages;
    runtime.nodes = next.nodes;
    runtime.events = next.events;
    runtime.indexes = next.indexes;
    runtime.warnings = next.warnings;
    return runtime;
  }

  async function load(opts = {}) {
    const [routesData, stagesData, nodesData, eventsData] = await Promise.all([
      fetchData(FILES.routes, opts),
      fetchData(FILES.stages, opts),
      fetchData(FILES.nodes, opts),
      fetchData(FILES.events, opts)
    ]);

    return replaceRuntime(validateAndIndex(
      asArray(routesData, "routes"),
      asArray(stagesData, "stages"),
      asArray(nodesData, "nodes"),
      asArray(eventsData, "events")
    ));
  }

  window.HG_CARAVAN_DEBUG = {
    getRoute(routeId) { return runtime.indexes.routesById[String(routeId || "").trim()] || null; },
    getStages(routeId) { return runtime.indexes.stagesByRoute[String(routeId || "").trim()] || []; },
    getNode(nodeId) { return runtime.indexes.nodesById[String(nodeId || "").trim()] || null; },
    getEventsForStage(stageId, mode) {
      const events = runtime.indexes.eventsByStage[String(stageId || "").trim()] || [];
      const selected = String(mode || "all").trim();
      return !selected || selected === "all" ? events : events.filter((event) => Array.isArray(event?.applies_to_modes) && event.applies_to_modes.includes(selected));
    },
    getEventsForRoute(routeId, mode) {
      const events = runtime.indexes.eventsByRoute[String(routeId || "").trim()] || [];
      const selected = String(mode || "all").trim();
      return !selected || selected === "all" ? events : events.filter((event) => Array.isArray(event?.applies_to_modes) && event.applies_to_modes.includes(selected));
    },
    summary() {
      return {
        routes: runtime.routes.length,
        stages: runtime.stages.length,
        nodes: runtime.nodes.length,
        events: runtime.events.length,
        warnings: runtime.warnings.length
      };
    }
  };

  window.HGCaravanLoader = { load, FILES };
})();
