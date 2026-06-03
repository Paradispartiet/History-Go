(function (global) {
  "use strict";

  const NOTES_STORAGE_KEY = "aha_notes_v1";
  const SOURCE_EVENTS_STORAGE_KEY = "aha_source_events_v1";

  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function readJsonStorage(key, fallback) {
    try {
      const raw = global.localStorage?.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function isDeletedRecord(record) {
    return Boolean(record?.deletedAt || record?.deleted_at);
  }

  function recordId(record) {
    return String(record?.id || record?.note_id || record?.ref_id || "").trim();
  }

  function nodeId(type, source, refId) {
    return `${type}::${source}::${refId}`;
  }

  function addNode(nodes, nodeIds, node) {
    if (!node?.id || nodeIds.has(node.id)) return;
    nodeIds.add(node.id);
    nodes.push(node);
  }

  function addEdge(edges, edgeIds, edge) {
    if (!edge?.from || !edge?.to || !edge?.type) return;
    const id = `${edge.type}::${edge.from}::${edge.to}`;
    if (edgeIds.has(id)) return;
    edgeIds.add(id);
    edges.push({ id, ...edge });
  }

  function normalizeRaw(raw) {
    const data = raw && typeof raw === "object" ? raw : {};
    return {
      notes: toArray(data.notes || data.aha_notes || data.aha_notes_v1),
      sourceEvents: toArray(data.sourceEvents || data.source_events || data.aha_source_events || data.aha_source_events_v1)
    };
  }

  function buildMindmapData(raw) {
    const data = normalizeRaw(raw || {
      notes: readJsonStorage(NOTES_STORAGE_KEY, []),
      sourceEvents: readJsonStorage(SOURCE_EVENTS_STORAGE_KEY, [])
    });

    const nodes = [];
    const edges = [];
    const nodeIds = new Set();
    const edgeIds = new Set();

    for (const note of data.notes) {
      if (isDeletedRecord(note)) continue;
      const id = recordId(note);
      if (!id) continue;
      const title = note?.title || note?.text || note?.body || "Note";
      addNode(nodes, nodeIds, {
        id: nodeId("note", "aha_notes", id),
        type: "note",
        source: "aha_notes",
        refId: id,
        title,
        label: title,
        href: note?.href || "",
        meta: {
          lastReanalyzedAt: note?.last_reanalyzed_at || ""
        }
      });
    }

    for (const event of data.sourceEvents) {
      if (isDeletedRecord(event)) continue;
      const id = recordId(event);
      if (!id) continue;
      const title = event?.title || event?.source_type || "Source event";
      addNode(nodes, nodeIds, {
        id: nodeId("source_event", "aha_source_events", id),
        type: "source_event",
        source: "aha_source_events",
        refId: id,
        title,
        label: title,
        href: event?.href || "",
        meta: event?.meta && typeof event.meta === "object" ? { ...event.meta } : {}
      });
    }

    for (const event of data.sourceEvents) {
      if (isDeletedRecord(event)) continue;
      if (event?.source_type !== "note_reanalysis") continue;
      if (event?.source_app && event.source_app !== "aha_notes") continue;

      const eventId = recordId(event);
      const noteId = String(event?.meta?.note_id || "").trim();
      if (!eventId || !noteId) continue;

      const from = nodeId("source_event", "aha_source_events", eventId);
      const to = nodeId("note", "aha_notes", noteId);
      if (!nodeIds.has(from) || !nodeIds.has(to)) continue;

      addEdge(edges, edgeIds, {
        from,
        to,
        type: "note_reanalysis",
        label: "analysert på nytt",
        meta: {
          noteId,
          reanalyze: true
        }
      });
    }

    return { nodes, edges };
  }

  global.AHAMindmap = {
    NOTES_STORAGE_KEY,
    SOURCE_EVENTS_STORAGE_KEY,
    buildMindmapData,
    isDeletedRecord,
    nodeId
  };
})(typeof window !== "undefined" ? window : globalThis);
