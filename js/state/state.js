// state.js

/**
 * @typedef {import("../../schemas/storage").VisitedPlaces} StateVisitedPlaces
 * @typedef {import("../../schemas/storage").PeopleCollected} StatePeopleCollected
 * @typedef {import("../../schemas/storage").MeritsByCategory} StateMeritsByCategory
 * @typedef {import("../../schemas/storage").PersonDialogs} StatePersonDialogs
 * @typedef {import("../../schemas/storage").UserNotes} StateUserNotes
 */

// ==============================
// RUNTIME STATE
// ==============================
let MAP = null;

let PLACES     = [];
let PEOPLE     = [];
let BADGES     = [];
let RELATIONS  = [];

let TAGS_REGISTRY = null;

// ==============================
// USER STATE (persisted)
// ==============================
/** @type {StateVisitedPlaces} */
window.visited = JSON.parse(
  localStorage.getItem("visited_places") || "{}"
);

/** @type {StatePeopleCollected} */
const peopleCollected = JSON.parse(
  localStorage.getItem("people_collected") || "{}"
);

/** @type {StateMeritsByCategory} */
const merits = JSON.parse(
  localStorage.getItem("merits_by_category") || "{}"
);

window.merits = merits;

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


