// integration/aha.js

const HG_AHA_APP_URL = "https://paradispartiet.github.io/AHA-EchoNet/";
const HG_AHA_SUPABASE_URL = "https://wshmybqyksrwkawqleiz.supabase.co";
const HG_AHA_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fgfxuPJBpZ9CFcYufBBgjg_8YEmi13m";
const HG_AHA_PROFILE_ID_KEY = "aha_profile_id";
const HG_AHA_SYNC_STATUS_KEY = "historygo_aha_sync_status_v1";

let hgAhaSupabaseClient = null;
let hgAhaSdkPromise = null;

function hgAhaSafeJsonParse(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function hgAhaSetSyncStatus(status) {
  try {
    localStorage.setItem(HG_AHA_SYNC_STATUS_KEY, JSON.stringify({
      ...status,
      updated_at: new Date().toISOString()
    }));
  } catch {}
}

function hgAhaLoadSupabaseSdk() {
  if (window.supabase?.createClient) return Promise.resolve(window.supabase);
  if (hgAhaSdkPromise) return hgAhaSdkPromise;

  hgAhaSdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-hg-aha-supabase="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.supabase));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.dataset.hgAhaSupabase = "true";
    script.onload = () => resolve(window.supabase);
    script.onerror = () => reject(new Error("Kunne ikke laste Supabase SDK for AHA."));
    document.head.appendChild(script);
  });

  return hgAhaSdkPromise;
}

async function hgAhaGetClient() {
  if (hgAhaSupabaseClient) return hgAhaSupabaseClient;
  await hgAhaLoadSupabaseSdk();
  if (!window.supabase?.createClient) return null;

  hgAhaSupabaseClient = window.supabase.createClient(
    HG_AHA_SUPABASE_URL,
    HG_AHA_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    }
  );

  return hgAhaSupabaseClient;
}

function getAhaProfileIdSync() {
  return String(localStorage.getItem(HG_AHA_PROFILE_ID_KEY) || "").trim() || null;
}

async function getAhaSession() {
  const client = await hgAhaGetClient();
  if (!client) return null;
  const { data, error } = await client.auth.getSession();
  if (error) {
    if (window.DEBUG) console.warn("HistoryGoAHAAuth: kunne ikke hente session", error);
    return null;
  }
  return data?.session || null;
}

async function ensureAhaProfile(user) {
  const client = await hgAhaGetClient();
  if (!client || !user?.id) return { ok: false, reason: "not_ready" };

  const displayName =
    String(localStorage.getItem("user_name") || "").trim() ||
    user.email ||
    "History Go-bruker";

  const { data, error } = await client
    .from("aha_profiles")
    .upsert({
      id: user.id,
      display_name: displayName,
      updated_at: new Date().toISOString()
    }, { onConflict: "id" })
    .select()
    .single();

  if (error) return { ok: false, error };
  return { ok: true, data };
}

async function refreshAhaAuthState() {
  try {
    const session = await getAhaSession();
    const user = session?.user || null;

    if (!user?.id) {
      localStorage.removeItem(HG_AHA_PROFILE_ID_KEY);
      window.dispatchEvent(new CustomEvent("aha:auth-ready", {
        detail: { signed_in: false, profile_id: null, source_app: "historygo" }
      }));
      return { signed_in: false, profile_id: null };
    }

    localStorage.setItem(HG_AHA_PROFILE_ID_KEY, user.id);
    await ensureAhaProfile(user);

    window.dispatchEvent(new CustomEvent("aha:auth-ready", {
      detail: { signed_in: true, profile_id: user.id, email: user.email || null, source_app: "historygo" }
    }));

    return { signed_in: true, profile_id: user.id, email: user.email || null };
  } catch (error) {
    if (window.DEBUG) console.warn("HistoryGoAHAAuth: auth refresh feilet", error);
    return { signed_in: false, profile_id: null, error };
  }
}

async function syncHistoryGoPayloadToAha(payloadInput) {
  const payload = typeof payloadInput === "string"
    ? JSON.parse(payloadInput)
    : (payloadInput && typeof payloadInput === "object" ? payloadInput : {});

  const session = await getAhaSession();
  const user = session?.user || null;
  if (!user?.id) {
    hgAhaSetSyncStatus({ ok: false, fallback: "localStorage", reason: "not_signed_in" });
    return { ok: false, fallback: "localStorage", reason: "not_signed_in" };
  }

  localStorage.setItem(HG_AHA_PROFILE_ID_KEY, user.id);
  await ensureAhaProfile(user);

  const client = await hgAhaGetClient();
  if (!client) {
    hgAhaSetSyncStatus({ ok: false, fallback: "localStorage", reason: "not_configured" });
    return { ok: false, fallback: "localStorage", reason: "not_configured" };
  }

  const enrichedPayload = {
    ...payload,
    user_id: user.id,
    profile_id: user.id,
    source: "historygo",
    auth_source: "supabase",
    synced_from_historygo_at: new Date().toISOString()
  };

  const record = {
    id: `historygo_latest_${user.id}`,
    profile_id: user.id,
    source_app: "historygo",
    payload: enrichedPayload,
    counts: {
      knowledge_categories: Object.keys(enrichedPayload.knowledge_universe || {}).length,
      learning_log: Array.isArray(enrichedPayload.hg_learning_log_v1) ? enrichedPayload.hg_learning_log_v1.length : 0,
      insight_events: Array.isArray(enrichedPayload.hg_insights_events_v1) ? enrichedPayload.hg_insights_events_v1.length : 0,
      notes: Array.isArray(enrichedPayload.notes) ? enrichedPayload.notes.length : 0,
      dialogs: Array.isArray(enrichedPayload.dialogs) ? enrichedPayload.dialogs.length : 0,
      visited_places: Object.keys(enrichedPayload.visited_places || {}).length,
      merit_categories: Object.keys(enrichedPayload.merits_by_category || {}).length
    },
    created_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from("aha_imports")
    .upsert(record, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    hgAhaSetSyncStatus({ ok: false, error: error.message || String(error), profile_id: user.id });
    return { ok: false, error, profile_id: user.id };
  }

  hgAhaSetSyncStatus({ ok: true, profile_id: user.id, source_app: "historygo" });
  return { ok: true, data, profile_id: user.id };
}

function openAhaLogin() {
  window.location.href = HG_AHA_APP_URL;
}

window.HistoryGoAHAAuth = {
  appUrl: HG_AHA_APP_URL,
  getClient: hgAhaGetClient,
  getSession: getAhaSession,
  getProfileIdSync,
  refresh: refreshAhaAuthState,
  ensureProfile: ensureAhaProfile,
  syncHistoryGoPayload: syncHistoryGoPayloadToAha,
  openAhaLogin
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", refreshAhaAuthState);
} else {
  refreshAhaAuthState();
}

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
  const ahaProfileId = getAhaProfileIdSync();
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
    user_id: ahaProfileId || localStorage.getItem("user_id") || "local_user",
    profile_id: ahaProfileId,
    source: "historygo",
    auth_source: ahaProfileId ? "supabase" : "localStorage",
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

  if (window.HistoryGoAHAAuth?.syncHistoryGoPayload) {
    window.HistoryGoAHAAuth.syncHistoryGoPayload(payload).then((result) => {
      if (debug) console.log("HistoryGo → AHA Supabase sync:", result);
    }).catch((e) => {
      if (debug) console.warn("HistoryGo → AHA Supabase sync feilet:", e);
      hgAhaSetSyncStatus({ ok: false, error: e?.message || String(e) });
    });
  }

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

window.exportHistoryGoData = exportHistoryGoData;
window.syncHistoryGoToAHA = syncHistoryGoToAHA;
