// integration/aha.js

function buildNextUpLearningSignal() {
  const TYPE_KEYS = ["concept", "narrative", "spatial", "wonderkammer"];
  const MODE_KEYS = ["learn", "story", "nearest", "wonder", "complete"];
  const safeParse = (key, fallback) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "");
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };
  const s = (value) => String(value ?? "").trim();
  const mapCounts = (items, getter) => {
    const out = {};
    items.forEach((item) => {
      const key = s(getter(item));
      if (!key) return;
      out[key] = (out[key] || 0) + 1;
    });
    return out;
  };
  const sortCounts = (obj, allow = null) =>
    Object.entries(obj || {})
      .filter(([key, val]) => Number(val) > 0 && (!allow || allow.includes(key)))
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ type: key, count }));

  const nextUpHistory = safeParse("hg_nextup_history_v1", []);
  const activePath = safeParse("hg_active_path_v1", {});
  const nextUpMode = safeParse("hg_nextup_mode_v1", {});
  const learningLog = safeParse("hg_learning_log_v1", []);
  const insightsEvents = safeParse("hg_insights_events_v1", []);

  const history = Array.isArray(nextUpHistory) ? nextUpHistory : [];
  const clickEvents = history.filter((h) => s(h?.event) === "click" && TYPE_KEYS.includes(s(h?.type)));
  const showEvents = history.filter((h) => s(h?.event) === "show" && TYPE_KEYS.includes(s(h?.type)));
  const modeEvents = history.filter((h) => s(h?.event) === "mode_change");

  const clickCounts = mapCounts(clickEvents, (e) => e?.type);
  const showCounts = mapCounts(showEvents, (e) => e?.type);
  const modeCounts = mapCounts(modeEvents, (e) => e?.mode);
  const persistedMode = s(nextUpMode?.mode);
  if (persistedMode) modeCounts[persistedMode] = (modeCounts[persistedMode] || 0) + 1;

  const preferred_nextup_types = sortCounts(clickCounts, TYPE_KEYS);
  const ignored_nextup_types = TYPE_KEYS
    .map((type) => {
      const shown = Number(showCounts[type] || 0);
      const clicked = Number(clickCounts[type] || 0);
      if (shown < 3) return null;
      const ratio = shown > 0 ? clicked / shown : 0;
      if (ratio <= 0.25 && shown - clicked >= 2) return { type, shown, clicked };
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => (b.shown - b.clicked) - (a.shown - a.clicked));
  const dominant_modes = sortCounts(modeCounts, MODE_KEYS).map((x) => ({ mode: x.type, count: x.count }));

  const summary = activePath?.summary && typeof activePath.summary === "object" ? activePath.summary : {};
  const active_path_summary = {
    title: s(summary.title),
    description: s(summary.description),
    place_ids: Array.isArray(summary.place_ids) ? summary.place_ids : [],
    emne_ids: Array.isArray(summary.emne_ids) ? summary.emne_ids : [],
    story_ids: Array.isArray(summary.story_ids) ? summary.story_ids : [],
    dominant_types: Array.isArray(summary.dominant_types) ? summary.dominant_types : [],
    step_count: Number(summary.step_count || 0)
  };

  const topicCounts = {};
  const addTopic = (value, weight = 1) => {
    const topic = s(value);
    if (!topic) return;
    topicCounts[topic] = (topicCounts[topic] || 0) + weight;
  };
  active_path_summary.emne_ids.forEach((id) => addTopic(id, 3));
  clickEvents.forEach((e) => addTopic(e?.meta?.emne_id || e?.emne_id, 2));
  (Array.isArray(learningLog) ? learningLog : []).forEach((entry) => {
    addTopic(entry?.topic, 2);
    addTopic(entry?.categoryId, 1);
    addTopic(entry?.id, 1);
  });
  (Array.isArray(insightsEvents) ? insightsEvents : []).forEach((event) => {
    addTopic(event?.topic, 2);
    addTopic(event?.theme_id, 1);
    addTopic(event?.categoryId, 1);
  });
  const dominant_topics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([topic, count]) => ({ topic, count }));

  const sourceCounts = mapCounts(clickEvents, (e) => e?.source);
  const dominant_sources = sortCounts(sourceCounts).map((x) => ({ source: x.type, count: x.count }));

  const topTypes = preferred_nextup_types.map((x) => x.type);
  let learning_style = "variert";
  if (topTypes[0] === "concept" && topTypes[1] === "narrative") learning_style = "begrep + fortelling";
  else if (topTypes[0] === "spatial" && topTypes[1] === "wonderkammer") learning_style = "utforsking + detaljer";
  else if (topTypes[0] === "concept") learning_style = "begrepsbasert";
  else if (topTypes[0] === "narrative") learning_style = "fortellingsbasert";
  else if (topTypes[0] === "spatial") learning_style = "utforskende";
  else if (topTypes[0] === "wonderkammer") learning_style = "detalj- og objektbasert";

  const inferred_interests = [];
  if (topTypes.includes("concept")) inferred_interests.push("Brukeren søker forklaring og begrepsmessig sammenheng.");
  if (topTypes.includes("narrative")) inferred_interests.push("Brukeren følger fortellinger og forbindelser mellom steder.");
  if (topTypes.includes("spatial")) inferred_interests.push("Brukeren utforsker byen fysisk og følger romlig nærhet.");
  if (topTypes.includes("wonderkammer")) inferred_interests.push("Brukeren trekkes mot detaljer, objekter og små oppdagelser.");
  if (active_path_summary.emne_ids.length >= 2) inferred_interests.push("Brukeren er i ferd med å bygge en læringssti på tvers av steder.");

  const recommended_learning_paths = [];
  if (topTypes.includes("concept")) recommended_learning_paths.push({
    title: "Begreper som binder steder sammen",
    reason: "Brukeren velger ofte concept-forslag for å forstå sammenhenger.",
    source: "nextup_history"
  });
  if (topTypes.includes("narrative")) recommended_learning_paths.push({
    title: "Fortellingsspor mellom steder",
    reason: "Brukeren følger narrative forslag og holder historiske tråder i gang.",
    source: "nextup_history"
  });
  if (topTypes.includes("spatial") || topTypes.includes("wonderkammer")) recommended_learning_paths.push({
    title: "Utforskingsspor med mikrofunn",
    reason: "Valgene peker mot romlig utforsking kombinert med detaljer og objekter.",
    source: "nextup_history"
  });

  const interpretation_texts = [];
  if (topTypes[0] === "concept") interpretation_texts.push("Du velger ofte forklaringer framfor bare neste sted.");
  if (topTypes[0] === "narrative") interpretation_texts.push("Du følger ofte historier som binder steder sammen.");
  if (topTypes[0] === "spatial") interpretation_texts.push("Du bruker NextUp til å utforske nærområdet steg for steg.");
  if (topTypes[0] === "wonderkammer") interpretation_texts.push("Du fanges ofte av detaljer og små objekter i NextUp.");
  if (active_path_summary.step_count > 0) interpretation_texts.push("Du er i gang med en rute som binder steder sammen tematisk.");
  if (dominant_topics.length > 0) interpretation_texts.push("NextUp-valgene dine peker mot tydelige læringstemaer.");

  const signalEvidence = clickEvents.length + showEvents.length + modeEvents.length + active_path_summary.step_count;
  const confidence = Math.max(0.15, Math.min(0.95, Number((signalEvidence / 40).toFixed(2))));

  return {
    preferred_nextup_types,
    ignored_nextup_types,
    dominant_modes,
    active_path_summary,
    dominant_topics,
    dominant_sources,
    learning_style,
    inferred_interests,
    recommended_learning_paths: recommended_learning_paths.slice(0, 3),
    interpretation_texts,
    confidence
  };
}

function debugNextUpLearningSignal() {
  const signal = buildNextUpLearningSignal();
  const preferred = (signal.preferred_nextup_types || []).map((x) => ({ type: x.type, clicks: x.count }));
  const ignored = (signal.ignored_nextup_types || []).map((x) => ({ type: x.type, shown: x.shown, clicked: x.clicked }));
  console.table(preferred);
  console.table(ignored);
  console.log("NextUp interpretation_texts:", signal.interpretation_texts || []);
  return signal;
}

window.buildNextUpLearningSignal = buildNextUpLearningSignal;
window.debugNextUpLearningSignal = debugNextUpLearningSignal;

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
  const nextUpLearningSignal = buildNextUpLearningSignal();

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
      active_path: activePath && typeof activePath === "object" ? activePath : {},
      learning_signal: nextUpLearningSignal
    },
    nextup_learning_signal: nextUpLearningSignal,
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
