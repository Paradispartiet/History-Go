// ahaHistoryGoImport.js
// History Go → AHA importadapter.
// Leser den faktiske History Go-strukturen, inkludert nested knowledge_universe:
// category → dimension → array of knowledge objects.

(function (global) {
  "use strict";

  const SUBJECT_ID_HISTORYGO = "sub_historygo";
  const IMPORT_STORAGE_KEY = "aha_import_payload_v1";

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function str(value) {
    return String(value ?? "").trim();
  }

  function firstText(obj, keys) {
    for (const key of keys) {
      const value = str(obj && obj[key]);
      if (value) return value;
    }
    return "";
  }

  function buildKnowledgeText(item) {
    if (typeof item === "string") return str(item);
    if (!isObject(item)) return "";

    const title = firstText(item, ["topic", "title", "question", "name", "label", "id"]);
    const body = firstText(item, [
      "text",
      "knowledge",
      "explanation",
      "answer",
      "summary",
      "content",
      "description",
      "insight",
      "message",
      "note"
    ]);

    if (title && body && title !== body) return `${title}: ${body}`;
    return body || title;
  }

  function createContext(categoryId, path, item) {
    const cleanPath = Array.isArray(path) ? path.map(str).filter(Boolean) : [];
    const emner = [];

    if (isObject(item)) {
      const directEmner = Array.isArray(item.emner)
        ? item.emner
        : Array.isArray(item.emne_ids)
        ? item.emne_ids
        : Array.isArray(item.related_emner)
        ? item.related_emner
        : [];
      directEmner.forEach((id) => {
        const clean = str(id);
        if (clean) emner.push(clean);
      });
    }

    cleanPath.forEach((part) => {
      if (!emner.includes(part)) emner.push(part);
    });

    return {
      field_id: categoryId || null,
      emner
    };
  }

  function extractTimestamp(item, fallback) {
    if (!isObject(item)) return fallback || null;
    return (
      firstText(item, ["createdAt", "created_at", "updatedAt", "updated_at", "timestamp", "date"]) ||
      fallback ||
      null
    );
  }

  function addSignal(chamber, text, themeId, timestamp, context) {
    const safeText = str(text);
    if (!safeText) return 0;

    const safeTheme = str(themeId) || "ukjent";
    const sig = global.InsightsEngine.createSignalFromMessage(
      safeText,
      SUBJECT_ID_HISTORYGO,
      safeTheme,
      context || {}
    );

    sig.timestamp = timestamp || sig.timestamp;
    global.InsightsEngine.addSignalToChamber(chamber, sig);
    return 1;
  }

  function collectKnowledgeSignals(chamber, universe, fallbackTimestamp) {
    let count = 0;

    function walk(node, categoryId, path) {
      if (Array.isArray(node)) {
        node.forEach((item) => walk(item, categoryId, path));
        return;
      }

      if (typeof node === "string") {
        count += addSignal(
          chamber,
          node,
          categoryId,
          fallbackTimestamp,
          createContext(categoryId, path, null)
        );
        return;
      }

      if (!isObject(node)) return;

      const text = buildKnowledgeText(node);
      if (text) {
        count += addSignal(
          chamber,
          text,
          categoryId,
          extractTimestamp(node, fallbackTimestamp),
          createContext(categoryId, path, node)
        );
        return;
      }

      Object.entries(node).forEach(([key, value]) => {
        walk(value, categoryId, [...path, key]);
      });
    }

    if (!isObject(universe)) return 0;

    Object.entries(universe).forEach(([categoryId, categoryValue]) => {
      walk(categoryValue, str(categoryId) || "ukjent", []);
    });

    return count;
  }

  function collectNotes(chamber, notes, fallbackTimestamp) {
    let count = 0;
    (Array.isArray(notes) ? notes : []).forEach((note) => {
      const text = buildKnowledgeText(note) || str(note && note.text);
      const themeId = str(note && (note.categoryId || note.category || note.theme_id)) || "notater";
      count += addSignal(
        chamber,
        text,
        themeId,
        extractTimestamp(note, fallbackTimestamp),
        createContext(themeId, [], note)
      );
    });
    return count;
  }

  function collectDialogs(chamber, dialogs, fallbackTimestamp) {
    let count = 0;
    (Array.isArray(dialogs) ? dialogs : []).forEach((dialog) => {
      const themeId = str(dialog && (dialog.categoryId || dialog.category || dialog.theme_id)) || "dialoger";
      const turns = Array.isArray(dialog && dialog.turns) ? dialog.turns : [];

      if (!turns.length) {
        count += addSignal(
          chamber,
          buildKnowledgeText(dialog),
          themeId,
          extractTimestamp(dialog, fallbackTimestamp),
          createContext(themeId, [], dialog)
        );
        return;
      }

      turns
        .filter((turn) => str(turn && (turn.from || turn.role)) === "user")
        .forEach((turn) => {
          count += addSignal(
            chamber,
            turn.text || turn.content || turn.message,
            themeId,
            extractTimestamp(turn, extractTimestamp(dialog, fallbackTimestamp)),
            createContext(themeId, [], turn)
          );
        });
    });
    return count;
  }

  function collectFlatEvents(chamber, events, defaultThemeId, fallbackTimestamp) {
    let count = 0;
    (Array.isArray(events) ? events : []).forEach((event) => {
      const themeId =
        str(event && (event.categoryId || event.category || event.topic || event.theme_id || event.id)) ||
        defaultThemeId;
      count += addSignal(
        chamber,
        buildKnowledgeText(event),
        themeId,
        extractTimestamp(event, fallbackTimestamp),
        createContext(themeId, [], event)
      );
    });
    return count;
  }

  function importHistoryGoData(payload) {
    if (!payload || typeof payload !== "object") {
      return { importedSignals: 0, importedTextItems: 0 };
    }

    if (!global.InsightsEngine || typeof global.InsightsEngine.createSignalFromMessage !== "function") {
      return { importedSignals: 0, importedTextItems: 0 };
    }

    const chamber = global.loadChamberFromStorage();
    const fallbackTimestamp = payload.exported_at || new Date().toISOString();
    let importedSignals = 0;

    importedSignals += collectNotes(chamber, payload.notes, fallbackTimestamp);
    importedSignals += collectDialogs(chamber, payload.dialogs, fallbackTimestamp);
    importedSignals += collectKnowledgeSignals(chamber, payload.knowledge_universe, fallbackTimestamp);
    importedSignals += collectFlatEvents(chamber, payload.hg_learning_log_v1, "learning_log", fallbackTimestamp);
    importedSignals += collectFlatEvents(chamber, payload.hg_insights_events_v1, "insight_event", fallbackTimestamp);

    global.saveChamberToStorage(chamber);
    if (typeof global.refreshThemePicker === "function") {
      global.refreshThemePicker();
    }

    return {
      importedSignals,
      importedTextItems: importedSignals
    };
  }

  function importHistoryGoDataFromSharedStorage() {
    if (typeof global.clearOutput === "function") global.clearOutput();

    const write = typeof global.log === "function" ? global.log : (msg) => console.log(msg);
    const raw = localStorage.getItem(IMPORT_STORAGE_KEY);

    if (!raw) {
      write("Fant ingen History Go-data å importere (aha_import_payload_v1 er tom).");
      return { importedSignals: 0, importedTextItems: 0 };
    }

    try {
      const payload = JSON.parse(raw);
      const result = importHistoryGoData(payload);
      write(
        "Importerte History Go-data fra lokal storage. " +
          result.importedSignals +
          " signaler fra " +
          result.importedTextItems +
          " tekstbiter."
      );
      if (payload.exported_at) {
        write("Eksportert fra History Go: " + payload.exported_at);
      }
      return result;
    } catch (e) {
      write("Klarte ikke å lese History Go-data: " + e.message);
      return { importedSignals: 0, importedTextItems: 0 };
    }
  }

  function bindImportButton() {
    const btn = document.getElementById("btn-import-hg");
    if (!btn || btn.dataset.ahaHgImportAdapterBound === "1") return;

    btn.dataset.ahaHgImportAdapterBound = "1";
    btn.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        importHistoryGoDataFromSharedStorage();
      },
      true
    );
  }

  global.AHAHistoryGoImport = {
    importHistoryGoData,
    importHistoryGoDataFromSharedStorage,
    collectKnowledgeSignals
  };

  global.importHistoryGoData = importHistoryGoData;
  global.importHistoryGoDataFromSharedStorage = importHistoryGoDataFromSharedStorage;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindImportButton);
  } else {
    bindImportButton();
  }
})(this);
