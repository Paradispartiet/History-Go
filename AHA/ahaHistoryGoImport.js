(function (global) {
  "use strict";

  const SHARED_KEY = "aha_import_payload_v1";
  const SUBJECT_ID = "sub_historygo";

  function addSignal(chamber, text, themeId, timestamp, context) {
    const safeText = String(text || "").trim();
    if (!safeText || !global.InsightsEngine) return false;
    const signal = global.InsightsEngine.createSignalFromMessage(safeText, SUBJECT_ID, themeId || "historygo", context || {});
    signal.timestamp = timestamp || new Date().toISOString();
    if (context && typeof context === "object") signal.meta = context;
    global.InsightsEngine.addSignalToChamber(chamber, signal);
    return true;
  }

  function collectNextUpSignal(chamber, nextupLearningSignal, fallbackTimestamp) {
    if (!nextupLearningSignal || typeof nextupLearningSignal !== "object") return 0;
    const text = [
      `Learning style: ${nextupLearningSignal.learning_style || ""}`,
      `Interpretation: ${(nextupLearningSignal.interpretation_texts || []).join(" | ")}`,
      `Inferred interests: ${(nextupLearningSignal.inferred_interests || []).join(", ")}`,
      `Recommended paths: ${(nextupLearningSignal.recommended_learning_paths || []).join(", ")}`
    ].join("\n");
    return addSignal(chamber, text, "historygo_nextup", fallbackTimestamp, { ...nextupLearningSignal, imported: true, source_app: "historygo", source_type: "historygo_nextup" }) ? 1 : 0;
  }

  function collectLearningLogSignals(chamber, events, fallbackTimestamp) {
    let count = 0;
    (Array.isArray(events) ? events : []).forEach((event) => {
      const text = [event.name, `Correct: ${event.correctAnswers || event.correctCount || 0}/${event.total || 0}`, (event.concepts || []).join(", "), (event.related_emner || []).join(", "), event.note].filter(Boolean).join(" | ");
      const meta = { targetId: event.targetId, parentTargetId: event.parentTargetId, setId: event.setId, concepts: event.concepts || [], related_emner: event.related_emner || [], correctCount: event.correctCount || event.correctAnswers || 0, total: event.total || 0, imported: true, source_app: "historygo", source_type: event.type || "historygo_learning_event" };
      if (addSignal(chamber, text, event.categoryId || "historygo_learning", event.createdAt || event.timestamp || fallbackTimestamp, meta)) count++;
    });
    return count;
  }

  function collectInsightEventSignals(chamber, events, fallbackTimestamp) {
    let count = 0;
    (Array.isArray(events) ? events : []).forEach((event) => {
      const concepts = Array.isArray(event.concepts) ? event.concepts : [];
      const text = `History Go begreper: ${concepts.join(", ")}`;
      const meta = { place_id: event.place_id || null, person_id: event.person_id || null, concepts, quizId: event.quizId || null, imported: true, source_app: "historygo", source_type: "historygo_concept_event" };
      if (addSignal(chamber, text, event.categoryId || "historygo_concepts", event.createdAt || event.timestamp || fallbackTimestamp, meta)) count++;
    });
    return count;
  }

  function collectKnowledgeSignals(chamber, universe, fallbackTimestamp) {
    let count = 0;
    const categories = universe && typeof universe === "object" ? universe : {};
    Object.entries(categories).forEach(([category, dimensions]) => {
      Object.entries(dimensions || {}).forEach(([dimension, items]) => {
        (Array.isArray(items) ? items : []).forEach((item) => {
          const topic = item.topic || item.title || item.id || "tema";
          const text = `${topic}: ${item.text || item.content || item.summary || ""}`;
          const meta = { dimension, item_id: item.id || null, imported: true, source_app: "historygo", source_type: "historygo_knowledge_item" };
          if (addSignal(chamber, text, category, item.updatedAt || item.createdAt || fallbackTimestamp, meta)) count++;
        });
      });
    });
    return count;
  }

  function importHistoryGoData(payload) {
    if (!payload || typeof payload !== "object" || !global.loadChamberFromStorage || !global.saveChamberToStorage) return { importedSignals: 0 };
    const chamber = global.loadChamberFromStorage();
    const ts = payload.exported_at || new Date().toISOString();
    let importedSignals = 0;
    importedSignals += collectNextUpSignal(chamber, payload.nextup_learning_signal, ts);
    importedSignals += collectLearningLogSignals(chamber, payload.hg_learning_log_v1, ts);
    importedSignals += collectInsightEventSignals(chamber, payload.hg_insights_events_v1, ts);
    importedSignals += collectKnowledgeSignals(chamber, payload.knowledge_universe, ts);
    importedSignals += collectLearningLogSignals(chamber, payload.notes, ts);
    importedSignals += collectLearningLogSignals(chamber, payload.dialogs, ts);
    global.saveChamberToStorage(chamber);
    return { importedSignals };
  }

  function importHistoryGoDataFromSharedStorage() {
    const raw = localStorage.getItem(SHARED_KEY);
    if (!raw) return { importedSignals: 0, error: "missing_payload" };
    try {
      return importHistoryGoData(JSON.parse(raw));
    } catch (error) {
      return { importedSignals: 0, error: error.message };
    }
  }

  global.AHAHistoryGoImport = { importHistoryGoData, importHistoryGoDataFromSharedStorage, collectKnowledgeSignals, collectLearningLogSignals, collectInsightEventSignals, collectNextUpSignal };

  if (typeof global.importHistoryGoDataFromSharedStorage !== "function") {
    global.importHistoryGoDataFromSharedStorage = importHistoryGoDataFromSharedStorage;
  }
})(this);
