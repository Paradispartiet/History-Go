// state.js

/**
 * @typedef {import("../../schemas/storage").VisitedPlaces} StateVisitedPlaces
 * @typedef {import("../../schemas/storage").PeopleCollected} StatePeopleCollected
 * @typedef {import("../../schemas/storage").MeritsByCategory} StateMeritsByCategory
 * @typedef {import("../../schemas/storage").PersonDialogs} StatePersonDialogs
 * @typedef {import("../../schemas/storage").UserNotes} StateUserNotes
 * @typedef {{
 *   normalizePlaceId?: (id: unknown) => string,
 *   migrateProgressStorage?: (storage: Storage) => void
 * }} StateHGPlaceIds
 * @typedef {Window & { HGPlaceIds?: StateHGPlaceIds }} StateWindowWithPlaceIds
 */

// ==============================
// RUNTIME STATE
// ==============================
let MAP = null;

// var (not let) so TypeScript merges these intentional page globals with the
// matching declarations in js/profile.js; the two files are never co-loaded
// (state.js -> index.html, profile.js -> profile.html), so this only silences
// the cross-file checkJs TS2451 and changes nothing at runtime.
var PLACES     = [];
var PEOPLE     = [];
var BADGES     = [];
let RELATIONS  = [];

let TAGS_REGISTRY = null;

// ==============================
// USER STATE (persisted)
// ==============================
/** @type {StateVisitedPlaces} */
window.visited = JSON.parse(
  localStorage.getItem("visited_places") || "{}"
);
{
  /** @type {StateWindowWithPlaceIds} */
  const stateWindow = window;
  const normalizePlaceId = stateWindow.HGPlaceIds?.normalizePlaceId
    || ((id) => String(id || "").trim());
  if (window.visited && typeof window.visited === "object" && !Array.isArray(window.visited)) {
    /** @type {StateVisitedPlaces} */
    const migrated = {};
    let changed = false;
    for (const [key, value] of Object.entries(window.visited)) {
      const nextKey = normalizePlaceId(key);
      if (nextKey !== key) changed = true;
      migrated[nextKey] = migrated[nextKey] || value;
    }
    if (changed) {
      window.visited = migrated;
      try { localStorage.setItem("visited_places", JSON.stringify(window.visited)); } catch {}
    }
  }
  try { stateWindow.HGPlaceIds?.migrateProgressStorage?.(localStorage); } catch {}
}

/** @type {StatePeopleCollected} */
const peopleCollected = JSON.parse(
  localStorage.getItem("people_collected") || "{}"
);

/**
 * Keep legacy merit rows self-describing for consumers such as mini-profile,
 * where the category id historically lived inside each merit value even though
 * the canonical storage shape uses the category id as the object key.
 * @returns {StateMeritsByCategory}
 */
function normalizeMeritEntryIds() {
  /** @type {StateMeritsByCategory} */
  const stored = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};

  let changed = false;
  for (const [categoryId, value] of Object.entries(stored)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    /** @type {Record<string, unknown>} */
    const merit = value;
    if (String(merit.id || "").trim()) continue;
    merit.id = categoryId;
    changed = true;
  }

  if (changed) {
    try { localStorage.setItem("merits_by_category", JSON.stringify(stored)); } catch {}
  }
  return stored;
}

/** @type {StateMeritsByCategory} */
const merits = normalizeMeritEntryIds();
window.merits = merits;

// Normalize again before later profile listeners render newly created merit rows.
window.addEventListener("updateProfile", () => {
  window.merits = normalizeMeritEntryIds();
});

// ==============================
// DIALOGER / NOTATER
// ==============================
/** @type {StatePersonDialogs} */
const personDialogs = JSON.parse(
  localStorage.getItem("hg_person_dialogs_v1") || "[]"
);

/** @type {StateUserNotes} */
const userNotes = JSON.parse(
  localStorage.getItem("hg_user_notes_v1") || "[]"
);