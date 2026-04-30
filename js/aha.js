// integration/aha.js

function exportHistoryGoData() {
  const debug = Boolean(window.DEBUG);
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
    if (debug) console.warn("Kunne ikke lese knowledge_universe", e);
  }

  const notes = typeof userNotes !== "undefined" && Array.isArray(userNotes) ? userNotes : [];
  const dialogs = typeof personDialogs !== "undefined" && Array.isArray(personDialogs) ? personDialogs : [];
  let learningLog = [];
  let insightsEvents = [];
  let nextUpTri = {};
  let nextUpHistory = [];
  let nextUpBecause = "";
  let nextUpMode = {};
  let activePath = {};
  let merits = {};
  let visitedPlaces = {};

  try { learningLog = JSON.parse(localStorage.getItem("hg_learning_log_v1") || "[]"); } catch {}
  try { insightsEvents = JSON.parse(localStorage.getItem("hg_insights_events_v1") || "[]"); } catch {}
  try { nextUpTri = JSON.parse(localStorage.getItem("hg_nextup_tri") || "{}"); } catch {}
  try { nextUpHistory = JSON.parse(localStorage.getItem("hg_nextup_history_v1") || "[]"); } catch {}
  try { nextUpMode = JSON.parse(localStorage.getItem("hg_nextup_mode_v1") || "{}"); } catch {}
  try { activePath = JSON.parse(localStorage.getItem("hg_active_path_v1") || "{}"); } catch {}
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
      schema: nextUpTri?.schema || "legacy",
      mode: nextUpMode && typeof nextUpMode === "object" ? nextUpMode : {},
      active_path: activePath && typeof activePath === "object" ? activePath : {}
    },
    hg_nextup_tri: nextUpTri && typeof nextUpTri === "object" ? nextUpTri : {},
    hg_nextup_history_v1: Array.isArray(nextUpHistory) ? nextUpHistory : [],
    hg_nextup_because: nextUpBecause,
    hg_nextup_mode_v1: nextUpMode && typeof nextUpMode === "object" ? nextUpMode : {},
    hg_active_path_v1: activePath && typeof activePath === "object" ? activePath : {},
    nextup_profile: {
      active_path_summary: activePath?.summary && typeof activePath.summary === "object" ? activePath.summary : {}
    },
    notes,
    dialogs
  };

  const json = JSON.stringify(payload, null, 2);
  if (debug) console.log("HistoryGo → AHA export oppdatert i localStorage.");

  localStorage.setItem("aha_import_payload_v1", json);
  return json;
}

function syncHistoryGoToAHA() {
  const debug = Boolean(window.DEBUG);
  try {
    exportHistoryGoData();
  } catch (e) {
    if (debug) console.warn("Klarte ikke å synce til AHA:", e);
  }
}
