// state.js

/**
 * @typedef {import("../../schemas/storage").VisitedPlaces} VisitedPlaces
 * @typedef {import("../../schemas/storage").PeopleCollected} PeopleCollected
 * @typedef {import("../../schemas/storage").MeritsByCategory} MeritsByCategory
 * @typedef {import("../../schemas/storage").PersonDialogs} PersonDialogs
 * @typedef {import("../../schemas/storage").UserNotes} UserNotes
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
/** @type {VisitedPlaces} */
window.visited = JSON.parse(
  localStorage.getItem("visited_places") || "{}"
);

/** @type {PeopleCollected} */
const peopleCollected = JSON.parse(
  localStorage.getItem("people_collected") || "{}"
);

/** @type {MeritsByCategory} */
const merits = JSON.parse(
  localStorage.getItem("merits_by_category") || "{}"
);

window.merits = merits;

// ==============================
// DIALOGER / NOTATER
// ==============================
/** @type {PersonDialogs} */
const personDialogs = JSON.parse(
  localStorage.getItem("hg_person_dialogs_v1") || "[]"
);

/** @type {UserNotes} */
const userNotes = JSON.parse(
  localStorage.getItem("hg_user_notes_v1") || "[]"
);


