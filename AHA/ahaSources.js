(function (global) {
  "use strict";

  const STORAGE_KEY = "aha_source_events_v1";

  function loadSourceEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveSourceEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(events) ? events : []));
  }

  function createSourceEvent(input) {
    const data = input || {};
    return {
      id: data.id || "src_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
      source_type: data.source_type || "unknown",
      source_app: data.source_app || "aha",
      content_type: data.content_type || "text",
      title: data.title || "",
      text: data.text || "",
      user_created: Boolean(data.user_created),
      imported: Boolean(data.imported),
      created_at: data.created_at || new Date().toISOString(),
      tags: Array.isArray(data.tags) ? data.tags : [],
      meta: data.meta && typeof data.meta === "object" ? data.meta : {}
    };
  }

  function addSourceEvent(input) {
    const events = loadSourceEvents();
    const event = createSourceEvent(input);
    events.push(event);
    saveSourceEvents(events);
    return event;
  }

  global.AHASources = { STORAGE_KEY, createSourceEvent, loadSourceEvents, saveSourceEvents, addSourceEvent };
})(this);
