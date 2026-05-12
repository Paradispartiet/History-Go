(function (global) {
  "use strict";

  const KEYS = {
    importPayload: "aha_import_payload_v1",
    unlocks: "hg_unlocks_v1",
    visitedPlaces: "visited_places",
    peopleCollected: "people_collected",
    progress: "historygo_progress",
    sourceEvents: "aha_source_events_v1",
    insightChamber: "aha_insight_chamber_v1"
  };

  function readJson(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toCount(value) {
    if (Array.isArray(value)) return value.length;
    if (value && typeof value === "object") return Object.keys(value).length;
    return 0;
  }

  function countNestedItems(input) {
    if (Array.isArray(input)) return input.length;
    if (!input || typeof input !== "object") return 0;
    let count = 0;
    Object.keys(input).forEach(function (k) {
      count += countNestedItems(input[k]);
    });
    return count;
  }

  function pickTimestamp(obj) {
    if (!obj || typeof obj !== "object") return "";
    return obj.exported_at || obj.exportedAt || obj.updated_at || obj.updatedAt || "";
  }

  function collectHistoryGoStatus() {
    const payload = readJson(KEYS.importPayload, null);
    const progress = readJson(KEYS.progress, null);
    return {
      hasImportPayload: Boolean(payload && typeof payload === "object"),
      visitedPlacesCount: toCount(readJson(KEYS.visitedPlaces, [])),
      peopleCollectedCount: toCount(readJson(KEYS.peopleCollected, [])),
      unlocksCount: toCount(readJson(KEYS.unlocks, [])),
      progressExists: Boolean(progress && (typeof progress === "object" || Array.isArray(progress))),
      lastImportAt: pickTimestamp(payload) || ""
    };
  }

  function collectImportPayloadSummary() {
    const payload = readJson(KEYS.importPayload, {});
    const safePayload = payload && typeof payload === "object" ? payload : {};
    const keys = Object.keys(safePayload);
    return {
      nextupLearningSignalExists: Boolean(safePayload.nextup_learning_signal),
      learningLogCount: toCount(safePayload.hg_learning_log_v1),
      insightEventsCount: toCount(safePayload.hg_insights_events_v1),
      knowledgeUniverseCount: countNestedItems(safePayload.knowledge_universe),
      notesCount: toCount(safePayload.notes),
      dialogsCount: toCount(safePayload.dialogs),
      payloadKeys: keys,
      exportedAt: pickTimestamp(safePayload)
    };
  }

  function isHistoryGoImported(event) {
    const sourceType = String(event && event.source_type ? event.source_type : "").toLowerCase();
    const sourceApp = String(event && event.source_app ? event.source_app : "").toLowerCase();
    return event && (event.imported === true || sourceApp === "historygo" || sourceType.indexOf("historygo") === 0);
  }

  function collectImportedAhaEvents() {
    const events = readJson(KEYS.sourceEvents, []);
    const imported = (Array.isArray(events) ? events : []).filter(isHistoryGoImported);
    const sorted = imported.slice().sort(function (a, b) {
      return String(b && b.created_at || "").localeCompare(String(a && a.created_at || ""));
    });

    const countsBySourceType = {};
    sorted.forEach(function (event) {
      const key = event && event.source_type ? event.source_type : "unknown";
      countsBySourceType[key] = (countsBySourceType[key] || 0) + 1;
    });

    const chamber = readJson(KEYS.insightChamber, {});
    const insights = chamber && Array.isArray(chamber.insights) ? chamber.insights : [];
    const importedInsightsCount = insights.filter(function (insight) {
      const meta = insight && insight.meta && typeof insight.meta === "object" ? insight.meta : {};
      const raw = [
        insight && insight.source_type,
        insight && insight.source_app,
        meta.source_type,
        meta.source_app,
        meta.imported,
        meta.origin,
        meta.provider,
        insight && insight.title,
        insight && insight.summary
      ].join(" ").toLowerCase();
      return raw.indexOf("historygo") !== -1 || raw.indexOf("history go") !== -1 || meta.imported === true;
    }).length;

    return {
      totalCount: sorted.length,
      latestEvents: sorted.slice(0, 10),
      countsBySourceType: countsBySourceType,
      importedInsightsCount: importedInsightsCount
    };
  }

  function render(target) {
    const container = target || global.document.getElementById("aha-historygo-status-root");
    if (!container) return;

    const status = collectHistoryGoStatus();
    const payload = collectImportPayloadSummary();
    const imported = collectImportedAhaEvents();

    const countItems = Object.keys(imported.countsBySourceType).map(function (key) {
      return "<li><strong>" + escapeHtml(key) + "</strong>: " + escapeHtml(imported.countsBySourceType[key]) + "</li>";
    }).join("");

    const latestEvents = imported.latestEvents.map(function (event) {
      const preview = (event && (event.text || event.title) ? String(event.text || event.title) : "").slice(0, 180);
      return "<li><div><strong>" + escapeHtml(event.title || event.source_type || "Uten tittel") + "</strong></div><div>" + escapeHtml(event.created_at || "") + "</div><div>" + escapeHtml(preview) + "</div></li>";
    }).join("");

    container.innerHTML = ""
      + "<section class='aha-status-card'><h2>History Go i AHA</h2><p>History Go er samlings- og læringsuniverset. AHA leser importert materiale som personlig innsikt.</p></section>"
      + "<section class='aha-status-card'><h3>Status</h3><ul class='aha-payload-list'>"
      + "<li>Importpayload: " + (status.hasImportPayload ? "finnes" : "finnes ikke") + "</li>"
      + "<li>Besøkte steder: " + escapeHtml(status.visitedPlacesCount) + "</li>"
      + "<li>Personer samlet: " + escapeHtml(status.peopleCollectedCount) + "</li>"
      + "<li>Unlocks: " + escapeHtml(status.unlocksCount) + "</li>"
      + "<li>Progress: " + (status.progressExists ? "finnes" : "finnes ikke") + "</li>"
      + "<li>Siste eksport/import-tid: " + escapeHtml(status.lastImportAt || "ukjent") + "</li></ul></section>"
      + "<section class='aha-status-card'><h3>Payload-oppsummering</h3><ul class='aha-payload-list'>"
      + "<li>Nextup learning signal: " + (payload.nextupLearningSignalExists ? "finnes" : "finnes ikke") + "</li>"
      + "<li>Learning log count: " + escapeHtml(payload.learningLogCount) + "</li>"
      + "<li>Insight events count: " + escapeHtml(payload.insightEventsCount) + "</li>"
      + "<li>Knowledge universe count: " + escapeHtml(payload.knowledgeUniverseCount) + "</li>"
      + "<li>Notes count: " + escapeHtml(payload.notesCount) + "</li>"
      + "<li>Dialogs count: " + escapeHtml(payload.dialogsCount) + "</li>"
      + "<li>Payload keys: " + escapeHtml(payload.payloadKeys.join(", ")) + "</li>"
      + "<li>Exported at: " + escapeHtml(payload.exportedAt || "ukjent") + "</li></ul></section>"
      + "<section class='aha-status-card'><h3>Importerte AHA-events</h3><p>Antall importerte source events: " + escapeHtml(imported.totalCount) + "</p><ul class='aha-payload-list'>" + countItems + "</ul><ol class='aha-importevent-list'>" + latestEvents + "</ol></section>"
      + "<section class='aha-status-card'><h3>Importerte innsikter</h3><p>Antall innsikter med mulig History Go-opphav: " + escapeHtml(imported.importedInsightsCount) + "</p></section>"
      + "<section class='aha-status-card'><h3>Forklaring</h3><ul class='aha-payload-list'><li>History Go samler steder, personer, badges og kunnskap.</li><li>AHA importerer dette som signaler.</li><li>AHA lager ikke ny History Go-motor.</li><li>Import skjer bare når brukeren trykker import.</li></ul></section>";
  }

  function refresh() {
    render();
  }

  global.AHAHistoryGoStatus = {
    collectHistoryGoStatus: collectHistoryGoStatus,
    collectImportPayloadSummary: collectImportPayloadSummary,
    collectImportedAhaEvents: collectImportedAhaEvents,
    render: render,
    refresh: refresh
  };
})(window);
