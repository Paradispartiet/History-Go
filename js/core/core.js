// core.js

// ==============================
// KONFIG / DEBUG
// ==============================
const DEBUG = false;

// ==============================
// KONSTANTER
// ==============================
const START            = { lat: 59.9139, lon: 10.7522, zoom: 13 };
const NEARBY_LIMIT     = 99999;
const QUIZ_FEEDBACK_MS = 650;

// ==============================
// HELPERS
// ==============================
function normalizeTags(rawTags, tagsRegistry) {
  const list = Array.isArray(rawTags) ? rawTags : [];
  const legacyMap = (tagsRegistry && tagsRegistry.legacy_map) || {};
  return list.map(t => legacyMap[t] || t).filter(Boolean);
}

function safeInit(name, fn) {
  try {
    fn();
    if (DEBUG && window.HGConsole?.ok) window.HGConsole.ok(name);
  } catch (e) {
    console.error(`[${name}]`, e);
    if (DEBUG && window.HGConsole?.fail) window.HGConsole.fail(name, e);
    if (DEBUG) {
      window.__HG_LAST_ERROR__ = { name, message: String(e), stack: e?.stack };
    }
  }
}
