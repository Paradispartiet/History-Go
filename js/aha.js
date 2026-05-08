// integration/aha.js
// History Go ⇄ AHA bridge.
// localStorage remains fallback/cache. When AHA/Supabase auth exists, auth.uid() is the profile_id.
// AHA owns the account display name. History Go only reads it.

const HG_AHA_APP_URL = "https://paradispartiet.github.io/AHA-EchoNet/";
const HG_AHA_SUPABASE_URL = "https://wshmybqyksrwkawqleiz.supabase.co";
const HG_AHA_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fgfxuPJBpZ9CFcYufBBgjg_8YEmi13m";
const HG_AHA_PROFILE_ID_KEY = "aha_profile_id";
const HG_AHA_PROFILE_CACHE_KEY = "aha_profile_cache_v1";
const HG_AHA_SYNC_STATUS_KEY = "historygo_aha_sync_status_v1";
const HG_AHA_READBACK_STATUS_KEY = "historygo_aha_last_readback_v1";

let hgAhaSupabaseClient = null;
let hgAhaSdkPromise = null;

function hgAhaReadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function hgAhaWriteJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function hgAhaStatus(key, value) {
  hgAhaWriteJson(key, { ...value, updated_at: new Date().toISOString() });
}

function hgAhaHasObjectData(key) {
  const value = hgAhaReadJson(key, {});
  return value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
}

function hgAhaHasArrayData(key) {
  return Array.isArray(hgAhaReadJson(key, [])) && hgAhaReadJson(key, []).length > 0;
}

function hasMeaningfulHistoryGoLocalState() {
  return [
    "visited_places",
    "people_collected",
    "merits_by_category",
    "knowledge_universe",
    "trivia_universe",
    "hg_unlocks_v1",
    "quiz_progress",
    "historygo_progress",
    "hg_groundhopper_stats_v1",
    "hg_pc_wallet_v1"
  ].some(hgAhaHasObjectData) || [
    "hg_learning_log_v1",
    "hg_insights_events_v1",
    "hg_nextup_history_v1",
    "hg_user_notes_v1",
    "hg_person_dialogs_v1"
  ].some(hgAhaHasArrayData);
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
    { auth: { persistSession: true, autoRefreshToken: true } }
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

function cacheAhaProfile(profile) {
  const clean = profile && typeof profile === "object" ? {
    id: profile.id || profile.profile_id || getAhaProfileIdSync(),
    display_name: String(profile.display_name || profile.name || "").trim(),
    updated_at: profile.updated_at || new Date().toISOString()
  } : {};

  hgAhaWriteJson(HG_AHA_PROFILE_CACHE_KEY, clean);
  if (clean.display_name) {
    localStorage.setItem("user_name", clean.display_name);
  }
  return clean;
}

async function loadAhaProfile(userInput = null) {
  const session = userInput?.id ? null : await getAhaSession();
  const user = userInput?.id ? userInput : session?.user;
  if (!user?.id) return { ok: false, reason: "not_signed_in" };

  localStorage.setItem(HG_AHA_PROFILE_ID_KEY, user.id);
  const client = await hgAhaGetClient();
  if (!client) return { ok: false, reason: "not_configured" };

  const { data, error } = await client
    .from("aha_profiles")
    .select("id, display_name, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, reason: "profile_read_error", error, profile_id: user.id };
  }
  if (!data || !String(data.display_name || "").trim()) {
    cacheAhaProfile({ id: user.id, display_name: "" });
    return { ok: false, reason: "no_aha_profile", profile_id: user.id };
  }

  const cached = cacheAhaProfile(data);
  return { ok: true, data: cached, profile_id: user.id };
}

// Backwards-compatible name. It now ensures the AHA profile exists by reading it.
// It never writes/overwrites AHA display_name from History Go localStorage.
async function ensureAhaProfile(user) {
  return loadAhaProfile(user);
}

function applyHistoryGoPayloadFromAha(payload, options = {}) {
  if (!payload || typeof payload !== "object") return { ok: false, reason: "invalid_payload" };

  const applied = [];
  const writeObject = (key, value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    hgAhaWriteJson(key, value);
    applied.push(key);
  };
  const writeArray = (key, value) => {
    if (!Array.isArray(value)) return;
    hgAhaWriteJson(key, value);
    applied.push(key);
  };

  writeObject("knowledge_universe", payload.knowledge_universe);
  writeArray("hg_learning_log_v1", payload.hg_learning_log_v1);
  writeArray("hg_insights_events_v1", payload.hg_insights_events_v1);
  writeObject("merits_by_category", payload.merits_by_category);
  writeObject("visited_places", payload.visited_places);
  writeObject("people_collected", payload.people_collected);
  writeObject("hg_unlocks_v1", payload.hg_unlocks_v1);
  writeObject("quiz_progress", payload.quiz_progress);
  writeObject("historygo_progress", payload.historygo_progress);
  writeObject("trivia_universe", payload.trivia_universe);
  writeObject("hg_groundhopper_stats_v1", payload.hg_groundhopper_stats_v1);
  writeObject("hg_pc_wallet_v1", payload.hg_pc_wallet_v1);
  writeObject("hg_nextup_tri", payload.hg_nextup_tri);
  writeArray("hg_nextup_history_v1", payload.hg_nextup_history_v1);
  writeObject("hg_nextup_mode_v1", payload.hg_nextup_mode_v1);
  writeObject("hg_active_path_v1", payload.hg_active_path_v1);
  writeArray("hg_user_notes_v1", payload.notes);
  writeArray("hg_person_dialogs_v1", payload.dialogs);

  if (payload.local_profile && typeof payload.local_profile === "object") {
    writeObject("hg_user_profile_v1", payload.local_profile);
  }

  if (typeof payload.hg_nextup_because === "string") {
    localStorage.setItem("hg_nextup_because", payload.hg_nextup_because);
    applied.push("hg_nextup_because");
  }
  if (payload.profile_id) localStorage.setItem(HG_AHA_PROFILE_ID_KEY, String(payload.profile_id));

  try { localStorage.setItem("aha_import_payload_v1", JSON.stringify(payload, null, 2)); } catch {}

  if (window.visited && payload.visited_places && typeof payload.visited_places === "object") {
    Object.assign(window.visited, payload.visited_places);
  }
  if (window.peopleCollected && payload.people_collected && typeof payload.people_collected === "object") {
    Object.assign(window.peopleCollected, payload.people_collected);
  }

  const status = {
    ok: true,
    source: options.source || "supabase",
    profile_id: payload.profile_id || getAhaProfileIdSync(),
    exported_at: payload.exported_at || null,
    applied_keys: applied
  };
  hgAhaStatus(HG_AHA_READBACK_STATUS_KEY, status);
  window.dispatchEvent(new CustomEvent("historygo:aha-readback", { detail: status }));
  window.dispatchEvent(new Event("updateProfile"));
  return status;
}

async function loadLatestHistoryGoFromAha(options = {}) {
  const session = await getAhaSession();
  const user = session?.user || null;
  if (!user?.id) {
    const status = { ok: false, reason: "not_signed_in" };
    hgAhaStatus(HG_AHA_READBACK_STATUS_KEY, status);
    return status;
  }

  localStorage.setItem(HG_AHA_PROFILE_ID_KEY, user.id);
  const client = await hgAhaGetClient();
  if (!client) return { ok: false, reason: "not_configured" };

  const { data, error } = await client
    .from("aha_imports")
    .select("id, profile_id, source_app, payload, counts, created_at")
    .eq("id", `historygo_latest_${user.id}`)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    const status = { ok: false, reason: "read_error", error: error.message || String(error), profile_id: user.id };
    hgAhaStatus(HG_AHA_READBACK_STATUS_KEY, status);
    return status;
  }
  if (!data?.payload) {
    const status = { ok: false, reason: "no_remote_historygo_payload", profile_id: user.id };
    hgAhaStatus(HG_AHA_READBACK_STATUS_KEY, status);
    return status;
  }
  if (options.apply === false) {
    const status = { ok: true, profile_id: user.id, payload: data.payload, counts: data.counts || {}, applied: false };
    hgAhaStatus(HG_AHA_READBACK_STATUS_KEY, { ...status, payload: undefined });
    return status;
  }
  return applyHistoryGoPayloadFromAha(data.payload, { source: "supabase" });
}

async function refreshAhaAuthState() {
  try {
    const session = await getAhaSession();
    const user = session?.user || null;
    if (!user?.id) {
      localStorage.removeItem(HG_AHA_PROFILE_ID_KEY);
      cacheAhaProfile({});
      window.dispatchEvent(new CustomEvent("aha:auth-ready", { detail: { signed_in: false, profile_id: null, source_app: "historygo" } }));
      return { signed_in: false, profile_id: null };
    }

    localStorage.setItem(HG_AHA_PROFILE_ID_KEY, user.id);
    const ahaProfile = await loadAhaProfile(user);

    let readback = null;
    if (!hasMeaningfulHistoryGoLocalState()) {
      readback = await loadLatestHistoryGoFromAha({ apply: true });
    }

    const detail = {
      signed_in: true,
      profile_id: user.id,
      email: user.email || null,
      source_app: "historygo",
      aha_profile_ready: Boolean(ahaProfile?.ok),
      aha_profile: ahaProfile?.data || null,
      readback
    };
    window.dispatchEvent(new CustomEvent("aha:auth-ready", { detail }));
    return detail;
  } catch (error) {
    if (window.DEBUG) console.warn("HistoryGoAHAAuth: auth refresh feilet", error);
    return { signed_in: false, profile_id: null, error };
  }
}

async function syncHistoryGoPayloadToAha(payloadInput) {
  const payload = typeof payloadInput === "string" ? JSON.parse(payloadInput) : (payloadInput && typeof payloadInput === "object" ? payloadInput : {});
  const session = await getAhaSession();
  const user = session?.user || null;
  if (!user?.id) {
    hgAhaStatus(HG_AHA_SYNC_STATUS_KEY, { ok: false, fallback: "localStorage", reason: "not_signed_in" });
    return { ok: false, fallback: "localStorage", reason: "not_signed_in" };
  }

  localStorage.setItem(HG_AHA_PROFILE_ID_KEY, user.id);
  const ahaProfile = await loadAhaProfile(user);
  if (!ahaProfile?.ok) {
    hgAhaStatus(HG_AHA_SYNC_STATUS_KEY, { ok: false, fallback: "localStorage", reason: ahaProfile?.reason || "no_aha_profile", profile_id: user.id });
    return { ok: false, fallback: "localStorage", reason: ahaProfile?.reason || "no_aha_profile", profile_id: user.id };
  }

  const client = await hgAhaGetClient();
  if (!client) {
    hgAhaStatus(HG_AHA_SYNC_STATUS_KEY, { ok: false, fallback: "localStorage", reason: "not_configured" });
    return { ok: false, fallback: "localStorage", reason: "not_configured" };
  }

  const localProfile = hgAhaReadJson("hg_user_profile_v1", {});
  const enrichedPayload = {
    ...payload,
    user_id: user.id,
    profile_id: user.id,
    aha_display_name: ahaProfile.data.display_name,
    local_profile: localProfile && typeof localProfile === "object" ? localProfile : {},
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
      people_collected: Object.keys(enrichedPayload.people_collected || {}).length,
      unlocks: Object.keys(enrichedPayload.hg_unlocks_v1?.byQuiz || enrichedPayload.hg_unlocks_v1 || {}).length,
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
    hgAhaStatus(HG_AHA_SYNC_STATUS_KEY, { ok: false, error: error.message || String(error), profile_id: user.id });
    return { ok: false, error, profile_id: user.id };
  }

  hgAhaStatus(HG_AHA_SYNC_STATUS_KEY, { ok: true, profile_id: user.id, source_app: "historygo" });
  return { ok: true, data, profile_id: user.id };
}

function openAhaLogin() {
  window.location.href = HG_AHA_APP_URL;
}

function bindHistoryGoAhaButtons() {
  document.getElementById("btnOpenAHA")?.addEventListener("click", openAhaLogin);
}

function initHistoryGoAhaAuthBridge() {
  bindHistoryGoAhaButtons();
  refreshAhaAuthState();
}

window.HistoryGoAHAAuth = {
  appUrl: HG_AHA_APP_URL,
  getClient: hgAhaGetClient,
  getSession: getAhaSession,
  getProfileIdSync: getAhaProfileIdSync,
  refresh: refreshAhaAuthState,
  loadAhaProfile,
  ensureProfile: ensureAhaProfile,
  syncHistoryGoPayload: syncHistoryGoPayloadToAha,
  loadLatestHistoryGo: loadLatestHistoryGoFromAha,
  applyHistoryGoPayload: applyHistoryGoPayloadFromAha,
  openAhaLogin
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHistoryGoAhaAuthBridge);
} else {
  initHistoryGoAhaAuthBridge();
}

function buildNextUpLearningSignal() {
  const TYPE_KEYS = ["concept", "narrative", "spatial", "wonderkammer"];
  const MODE_KEYS = ["learn", "story", "nearest", "wonder", "complete"];
  const s = (value) => String(value ?? "").trim();
  const mapCounts = (items, getter) => {
    const out = {};
    items.forEach((item) => {
      const key = s(getter(item));
      if (key) out[key] = (out[key] || 0) + 1;
    });
    return out;
  };
  const sortCounts = (obj, allow = null) => Object.entries(obj || {})
    .filter(([key, val]) => Number(val) > 0 && (!allow || allow.includes(key)))
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));

  const nextUpHistory = hgAhaReadJson("hg_nextup_history_v1", []);
  const activePath = hgAhaReadJson("hg_active_path_v1", {});
  const nextUpMode = hgAhaReadJson("hg_nextup_mode_v1", {});
  const learningLog = hgAhaReadJson("hg_learning_log_v1", []);
  const insightsEvents = hgAhaReadJson("hg_insights_events_v1", []);
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
  const ignored_nextup_types = TYPE_KEYS.map((type) => {
    const shown = Number(showCounts[type] || 0);
    const clicked = Number(clickCounts[type] || 0);
    if (shown < 3) return null;
    return clicked / shown <= 0.25 && shown - clicked >= 2 ? { type, shown, clicked } : null;
  }).filter(Boolean).sort((a, b) => (b.shown - b.clicked) - (a.shown - a.clicked));

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
    if (topic) topicCounts[topic] = (topicCounts[topic] || 0) + weight;
  };
  active_path_summary.emne_ids.forEach((id) => addTopic(id, 3));
  clickEvents.forEach((event) => addTopic(event?.meta?.emne_id || event?.emne_id, 2));
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
  const dominant_sources = sortCounts(mapCounts(clickEvents, (event) => event?.source)).map((x) => ({ source: x.type, count: x.count }));
  const dominant_modes = sortCounts(modeCounts, MODE_KEYS).map((x) => ({ mode: x.type, count: x.count }));
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
  if (topTypes.includes("concept")) recommended_learning_paths.push({ title: "Begreper som binder steder sammen", reason: "Brukeren velger ofte concept-forslag for å forstå sammenhenger.", source: "nextup_history" });
  if (topTypes.includes("narrative")) recommended_learning_paths.push({ title: "Fortellingsspor mellom steder", reason: "Brukeren følger narrative forslag og holder historiske tråder i gang.", source: "nextup_history" });
  if (topTypes.includes("spatial") || topTypes.includes("wonderkammer")) recommended_learning_paths.push({ title: "Utforskingsspor med mikrofunn", reason: "Valgene peker mot romlig utforsking kombinert med detaljer og objekter.", source: "nextup_history" });

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
  console.table((signal.preferred_nextup_types || []).map((x) => ({ type: x.type, clicks: x.count })));
  console.table((signal.ignored_nextup_types || []).map((x) => ({ type: x.type, shown: x.shown, clicked: x.clicked })));
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
    knowledge = typeof getKnowledgeUniverse === "function"
      ? getKnowledgeUniverse()
      : hgAhaReadJson("knowledge_universe", {});
  } catch (e) {
    if (debug) console.warn("Kunne ikke lese knowledge_universe", e);
  }

  const notes = typeof userNotes !== "undefined" && Array.isArray(userNotes) ? userNotes : hgAhaReadJson("hg_user_notes_v1", []);
  const dialogs = typeof personDialogs !== "undefined" && Array.isArray(personDialogs) ? personDialogs : hgAhaReadJson("hg_person_dialogs_v1", []);
  const learningLog = hgAhaReadJson("hg_learning_log_v1", []);
  const insightsEvents = hgAhaReadJson("hg_insights_events_v1", []);
  const nextUpTri = hgAhaReadJson("hg_nextup_tri", {});
  const nextUpHistory = hgAhaReadJson("hg_nextup_history_v1", []);
  const nextUpMode = hgAhaReadJson("hg_nextup_mode_v1", {});
  const activePath = hgAhaReadJson("hg_active_path_v1", {});
  const nextUpBecause = String(localStorage.getItem("hg_nextup_because") || "");
  const nextUpLearningSignal = buildNextUpLearningSignal();

  const payload = {
    user_id: ahaProfileId || localStorage.getItem("user_id") || "local_user",
    profile_id: ahaProfileId,
    source: "historygo",
    auth_source: ahaProfileId ? "supabase" : "localStorage",
    exported_at: new Date().toISOString(),
    knowledge_universe: knowledge && typeof knowledge === "object" ? knowledge : {},
    hg_learning_log_v1: Array.isArray(learningLog) ? learningLog : [],
    hg_insights_events_v1: Array.isArray(insightsEvents) ? insightsEvents : [],
    merits_by_category: hgAhaReadJson("merits_by_category", {}),
    visited_places: hgAhaReadJson("visited_places", {}),
    people_collected: hgAhaReadJson("people_collected", {}),
    hg_unlocks_v1: hgAhaReadJson("hg_unlocks_v1", {}),
    quiz_progress: hgAhaReadJson("quiz_progress", {}),
    historygo_progress: hgAhaReadJson("historygo_progress", {}),
    trivia_universe: hgAhaReadJson("trivia_universe", {}),
    hg_groundhopper_stats_v1: hgAhaReadJson("hg_groundhopper_stats_v1", {}),
    hg_pc_wallet_v1: hgAhaReadJson("hg_pc_wallet_v1", {}),
    local_profile: hgAhaReadJson("hg_user_profile_v1", {}),
    aha_profile_cache: hgAhaReadJson(HG_AHA_PROFILE_CACHE_KEY, {}),
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
    nextup_profile: { active_path_summary: activePath?.summary && typeof activePath.summary === "object" ? activePath.summary : {} },
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
      hgAhaStatus(HG_AHA_SYNC_STATUS_KEY, { ok: false, error: e?.message || String(e) });
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
