// ==============================
// History Go — app.js (v12)
// Siste checkpoint: personer (inkl. byoriginaler) på kartet + quiz
// ==============================

// ---- Konstanter ----
const START = { lat: 59.9139, lon: 10.7522, zoom: 13 };
const NEARBY_LIMIT = 2;
const QUIZ_FEEDBACK_MS = 2600;

// ---- State ----
let PLACES = [];
let PEOPLE = [];
let QUIZZES = [];

const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}"); // {Kategori:{level,points}}

function saveVisited(){  localStorage.setItem("visited_places", JSON.stringify(visited));  renderCollection(); }
function savePeople(){   localStorage.set
