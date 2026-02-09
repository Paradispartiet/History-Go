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

  const payload = {
    user_id: localStorage.getItem("user_id") || "local_user",
    source: "historygo",
    exported_at: new Date().toISOString(),
    knowledge_universe: knowledge,
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
