// integration/aha.js

function exportHistoryGoData() {
  let knowledge = {};
  try {
    if (typeof getKnowledgeUniverse === "function") {
      knowledge = getKnowledgeUniverse();
    } else {
      knowledge = JSON.parse(
        localStorage.getItem("knowledge_universe") || "{}"
      );
    }
  } catch (e) {
    if (DEBUG) console.warn("Kunne ikke lese knowledge_universe", e);
  }

  const notes   = Array.isArray(userNotes) ? userNotes : [];
  const dialogs = Array.isArray(personDialogs) ? personDialogs : [];
  let learningLog = [];
  let insightsEvents = [];
  let nextUpTri = {};
  let nextUpHistory = [];
  let nextUpBecause = "";
  let merits = {};
  let visitedPlaces = {};

  try { learningLog = JSON.parse(localStorage.getItem("hg_learning_log_v1") || "[]"); } catch {}
  try { insightsEvents = JSON.parse(localStorage.getItem("hg_insights_events_v1") || "[]"); } catch {}
  try { nextUpTri = JSON.parse(localStorage.getItem("hg_nextup_tri") || "{}"); } catch {}
  try { nextUpHistory = JSON.parse(localStorage.getItem("hg_nextup_history_v1") || "[]"); } catch {}
  try { merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}"); } catch {}
  try { visitedPlaces = JSON.parse(localStorage.getItem("visited_places") || "{}"); } catch {}
  nextUpBecause = String(localStorage.getItem("hg_nextup_because") || "");

  const payload = {
    user_id: localStorage.getItem("user_id") || "local_user",
    source: "historygo",
    exported_at: new Date().toISOString(),
    knowledge_universe: knowledge,
    hg_learning_log_v1: Array.isArray(learningLog) ? learningLog : [],
    hg_insights_events_v1: Array.isArray(insightsEvents) ? insightsEvents : [],
    merits_by_category: merits && typeof merits === "object" ? merits : {},
    visited_places: visitedPlaces && typeof visitedPlaces === "object" ? visitedPlaces : {},
    nextup: {
      current: nextUpTri && typeof nextUpTri === "object" ? nextUpTri : {},
      because: nextUpBecause,
      history: Array.isArray(nextUpHistory) ? nextUpHistory : [],
      schema: nextUpTri?.schema || "legacy"
    },
    hg_nextup_tri: nextUpTri && typeof nextUpTri === "object" ? nextUpTri : {},
    hg_nextup_history_v1: Array.isArray(nextUpHistory) ? nextUpHistory : [],
    hg_nextup_because: nextUpBecause,
    notes,
    dialogs
  };

  const json = JSON.stringify(payload, null, 2);
  if (DEBUG) console.log("HistoryGo → AHA export oppdatert i localStorage.");

  localStorage.setItem("aha_import_payload_v1", json);
  return json;
}

function syncHistoryGoToAHA() {
  try {
    exportHistoryGoData();
  } catch (e) {
    if (DEBUG) console.warn("Klarte ikke å synce til AHA:", e);
  }
}
