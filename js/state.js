// state.js

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
const visited = JSON.parse(
  localStorage.getItem("visited_places") || "{}"
);

const peopleCollected = JSON.parse(
  localStorage.getItem("people_collected") || "{}"
);

const merits = JSON.parse(
  localStorage.getItem("merits_by_category") || "{}"
);

window.merits = merits;

// ==============================
// DIALOGER / NOTATER
// ==============================
const personDialogs = JSON.parse(
  localStorage.getItem("hg_person_dialogs_v1") || "[]"
);

const userNotes = JSON.parse(
  localStorage.getItem("hg_user_notes_v1") || "[]"
);
