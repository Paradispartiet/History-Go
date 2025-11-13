// ============================================================
// HISTORY GO – APP.JS (hovedapp – kart, quiz, miniprofil)
// ============================================================
//
//  - Laster places.json, people.json, badges.json
//  - Tegner kart (Leaflet) og markører
//  - Håndterer quiz-modal, poeng, badges
//  - Holder styr på visited_places, people_collected,
//    merits_by_category og quiz_progress i localStorage
//  - Oppdaterer miniprofil og sender "updateProfile"-event
//
// ============================================================

let MAP = null;
let USER_MARKER = null;
let PLACES = [];
let PEOPLE = [];
let BADGES = [];

let mapReady = false;
let dataReady = false;

const QUIZ_FILE_MAP = {
  historie: "quizzes_historie.json",
  vitenskap: "quizzes_vitenskap.json",
  kunst: "quizzes_kunst.json",
  musikk: "quizzes_musikk.json",
  natur: "quizzes_natur.json",
  sport: "quizzes_sport.json",
  by: "quizzes_by.json",
  politikk: "quizzes_politikk.json",
  populaerkultur: "quizzes_popkultur.json",
  subkultur: "quizzes_subkultur.json",
  naeringsliv: "quizzes_naeringsliv.json"
};

// ------------------------------------------------------------
//  HJELPEFUNKSJONER
// ------------------------------------------------------------
function norm(str = "") {
  return (str || "").toString().toLowerCase()
    .replace(/å/g,"a").replace(/ø/g,"o").replace(/æ/g,"ae")
    .replace(/\s+/g," ").trim();
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) {
    alert(msg);
    return;
  }
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    t.style.display = "none";
  }, 2200);
}

// ------------------------------------------------------------
//  KATEGORIFARGER / KLASSER
// ------------------------------------------------------------
function catColor(cat = "") {
  const c = norm(cat);
  if (c.includes("historie") || c.includes("fortid") || c.includes("middelalder") || c.includes("arkeologi")) return "#344B80";   // Historie – dyp blå
  if (c.includes("vitenskap") || c.includes("filosofi")) return "#9b59b6";                         // Vitenskap & filosofi – lilla
  if (c.includes("kunst") || c.includes("kultur")) return "#ffb703";                               // Kunst & kultur – gul/oransje
  if (c.includes("musikk") || c.includes("scene")) return "#ff66cc";                               // Musikk & scenekunst – rosa
  if (c.includes("litteratur") || c.includes("poesi") || c.includes("forfatter")) return "#f6c800"; // Litteratur & poesi – gul
  if (c.includes("natur") || c.includes("miljoe")) return "#4caf50";                               // Natur & miljø – grønn
  if (c.includes("sport") || c.includes("idrett") || c.includes("lek")) return "#2a9d8f";          // Sport & lek – turkis
  if (c.includes("by") || c.includes("arkitektur")) return "#e63946";                              // By & arkitektur – rød
  if (c.includes("politikk") || c.includes("samfunn")) return "#c77dff";                           // Politikk & samfunn – lilla
  if (c.includes("populaer") || c.includes("popkultur")) return "#ffb703";                         // Populærkultur – oransje
  if (c.includes("subkultur")) return "#ff66cc";                                                   // Subkultur – rosa
  if (c.includes("naeringsliv") || c.includes("industri")) return "#ff8800";                       // Næringsliv & industri – oransje
  return "#1976d2";                                                                                // Standard blå
}

function catClass(cat = "") {
  const c = norm(cat);
  if (c.includes("historie") || c.includes("fortid") || c.includes("middelalder") || c.includes("arkeologi")) return "historie";
  if (c.includes("vitenskap") || c.includes("filosofi")) return "vitenskap";
  if (c.includes("kunst") || c.includes("kultur")) return "kunst";
  if (c.includes("musikk") || c.includes("scene")) return "musikk";
  if (c.includes("litteratur") || c.includes("poesi") || c.includes("forfatter")) return "litteratur";
  if (c.includes("natur") || c.includes("miljoe")) return "natur";
  if (c.includes("sport") || c.includes("idrett") || c.includes("lek")) return "sport";
  if (c.includes("by") || c.includes("arkitektur")) return "by";
  if (c.includes("politikk") || c.includes("samfunn")) return "politikk";
  if (c.includes("populaer") || c.includes("popkultur")) return "populaerkultur";
  if (c.includes("subkultur")) return "subkultur";
  if (c.includes("naeringsliv") || c.includes("industri")) return "naeringsliv";
  return "";
}

// Mapping fra tag → kategori-id brukt i badges / merits
function tagToCat(tag = "") {
  const t = norm(tag);
  if (!t) return "";
  if (t.includes("historie") || t.includes("fortid")) return "historie";
  if (t.includes("vitenskap") || t.includes("forskning") || t.includes("filosofi")) return "vitenskap";
  if (t.includes("kunst") || t.includes("kultur")) return "kunst";
  if (t.includes("musikk") || t.includes("konsert") || t.includes("scene")) return "musikk";
  if (t.includes("litteratur") || t.includes("forfatter") || t.includes("lesing")) return "litteratur";
  if (t.includes("natur") || t.includes("miljoe") || t.includes("park")) return "natur";
  if (t.includes("sport") || t.includes("idrett") || t.includes("lek")) return "sport";
  if (t.includes("by") || t.includes("arkitektur") || t.includes("gate")) return "by";
  if (t.includes("politikk") || t.includes("samfunn") || t.includes("demokrati")) return "politikk";
  if (t.includes("populaer") || t.includes("popkultur") || t.includes("film") || t.includes("spill")) return "populaerkultur";
  if (t.includes("subkultur")) return "subkultur";
  if (t.includes("naeringsliv") || t.includes("industri") || t.includes("arbeidsplass")) return "naeringsliv";
  return "";
}

// ------------------------------------------------------------
//  DATAINNLESING
// ------------------------------------------------------------
async function loadData() {
  try {
    const [places, people, badges] = await Promise.all([
      fetch("places.json", {cache:"no-store"}).then(r=>r.json()),
      fetch("people.json", {cache:"no-store"}).then(r=>r.json()),
      fetch("badges.json", {cache:"no-store"}).then(r=>r.json())
    ]);
    PLACES = places;
    PEOPLE = people;
    BADGES = badges;
    dataReady = true;
    if (mapReady) {
      drawPlaceMarkers();
    }
  } catch (e) {
    console.error("Feil ved lasting av data", e);
    showToast("Kunne ikke laste data.");
  }
}

// ------------------------------------------------------------
//  KART
// ------------------------------------------------------------
function initMap() {
  if (typeof L === "undefined") {
    console.error("Leaflet er ikke lastet");
    return;
  }

  MAP = L.map("map", {
    center: [59.9139, 10.7522],
    zoom: 13,
    zoomControl: false
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(MAP);

  mapReady = true;
  if (dataReady) {
    drawPlaceMarkers();
  }

  // Forsøk å hente brukerposisjon
  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      pos => setUser(pos.coords),
      err => console.warn("Geolokasjon-feil", err),
      { enableHighAccuracy:true, maximumAge:15000, timeout:10000 }
    );
  }
}

function setUser(coords) {
  if (!MAP || !coords) return;
  const latlng = [coords.latitude, coords.longitude];
  if (!USER_MARKER) {
    USER_MARKER = L.circleMarker(latlng, {
      radius: 8,
      color: "#fff",
      weight: 2,
      fillColor: "#f6c800",
      fillOpacity: 0.9
    }).addTo(MAP);
  } else {
    USER_MARKER.setLatLng(latlng);
  }
}

// ------------------------------------------------------------
//  MARKØRER
// ------------------------------------------------------------
function drawPlaceMarkers() {
  if (!MAP || !Array.isArray(PLACES)) return;

  PLACES.forEach(place => {
    if (!place.lat || !place.lng) return;

    const color = catColor(place.category || "");
    const marker = L.circleMarker([place.lat, place.lng], {
      radius: 7,
      color: "#fff",
      weight: 1.5,
      fillColor: color,
      fillOpacity: 0.95
    }).addTo(MAP);

    marker.on("click", () => {
      openPlaceCard(place);
    });
  });
}

function openPlaceCard(place) {
  const card = document.getElementById("placeCard");
  if (!card || !place) return;

  card.querySelector(".name").textContent = place.name;
  card.querySelector(".meta").textContent = `${place.category || ""} · ${place.year || ""}`;
  card.querySelector(".desc").textContent = place.desc || "";

  card.dataset.placeId = place.id;
  card.setAttribute("aria-hidden","false");

  const btnUnlock = document.getElementById("pcUnlock");
  const btnRoute  = document.getElementById("pcRoute");
  const btnClose  = document.getElementById("pcClose");

  if (btnUnlock) {
    btnUnlock.onclick = () => {
      startQuizForPlace(place);
    };
  }
  if (btnRoute) {
    btnRoute.onclick = () => showRouteTo(place);
  }
  if (btnClose) {
    btnClose.onclick = () => {
      card.setAttribute("aria-hidden","true");
    };
  }
}

// Dummy – rutetegning (kan utvides)
function showRouteTo(place) {
  if (!MAP || !place) return;
  showToast(`Rute til ${place.name} (kommer senere)`);
}

// ------------------------------------------------------------
//  QUIZ – LASTING OG START
// ------------------------------------------------------------
async function loadQuizzesForCategory(catId) {
  const file = QUIZ_FILE_MAP[catId];
  if (!file) return [];
  try {
    const data = await fetch(file, {cache:"no-store"}).then(r=>r.json());
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Feil ved lasting av quiz-fil", file, e);
    return [];
  }
}

async function startQuiz(config) {
  const { quizId, place, person, categoryId, testModeToggleId } = config || {};
  const modal = document.getElementById("quizModal");
  if (!modal) return;

  const el = {
    progress: modal.querySelector("#quizProgress"),
    question: modal.querySelector("#quizQuestion"),
    choices:  modal.querySelector(".quiz-choices"),
    feedback: modal.querySelector(".quiz-feedback"),
    bar:      modal.querySelector(".quiz-progress .bar"),
    closeBtn: modal.querySelector("#quizClose"),
    test:     testModeToggleId ? document.getElementById(testModeToggleId) : null
  };

  modal.setAttribute("aria-hidden","false");
  modal.style.display = "block";
  modal.classList.remove("fade-out");

  // --- Krever fysisk besøk før quiz kan tas ---
  if (!el.test?.checked) {
    const visitedPlaces = JSON.parse(localStorage.getItem("visited_places") || "{}");
    if (place && !visitedPlaces[place.id]) {
      return showToast("📍 Du må besøke stedet først for å ta denne quizen.");
    }
    if (person && person.placeId && !visitedPlaces[person.placeId]) {
      return showToast("📍 Du må besøke stedet først for å ta denne quizen.");
    }
  }

  // Hent riktig quizer
  const cat = categoryId || (place ? catClass(place.category || "") : (person ? person.categoryId : ""));
  const quizzes = await loadQuizzesForCategory(cat);
  if (!quizzes.length) {
    showToast("Ingen quizer tilgjengelig her ennå.");
    modal.setAttribute("aria-hidden","true");
    modal.style.display = "none";
    return;
  }

  const quiz = quizId ? quizzes.find(q => q.id === quizId) : quizzes[0];
  if (!quiz) {
    showToast("Fant ikke denne quizen.");
    modal.setAttribute("aria-hidden","true");
    modal.style.display = "none";
    return;
  }

  let answered = false;
  const quizProgress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  const existing = quizProgress[quiz.id] || { completed: [], best: 0 };

  let correctCount = 0;
  const total = 1; // én oppgave per modal nå

  // Render én quiz
  el.progress.textContent = `1 / ${total}`;
  el.question.textContent = quiz.question || "";
  el.choices.innerHTML = "";
  el.feedback.textContent = "";
  if (el.bar) el.bar.style.width = "0%";

  const answers = quiz.options || [];
  answers.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.onclick = () => {
      if (answered) return;
      answered = true;

      const isCorrect = option === quiz.answer;
      if (isCorrect) {
        btn.classList.add("correct");
        correctCount = 1;
        el.feedback.textContent = "Riktig! ✅";
      } else {
        btn.classList.add("wrong");
        el.feedback.textContent = "Ikke helt. Prøv igjen senere.";
      }

      if (el.bar) el.bar.style.width = "100%";

      setTimeout(() => {
        finishQuiz(quiz, correctCount, total, { place, person, testMode: !!el.test?.checked });
      }, 650);
    };
    el.choices.appendChild(btn);
  });

  if (el.closeBtn) {
    el.closeBtn.onclick = () => {
      modal.classList.add("fade-out");
      setTimeout(() => {
        modal.setAttribute("aria-hidden","true");
        modal.style.display = "none";
      }, 400);
    };
  }
}

// Wrapper for startQuiz fra place-card
function startQuizForPlace(place) {
  if (!place) return;
  startQuiz({ place, categoryId: catClass(place.category || ""), testModeToggleId: "testModeToggle" });
}

// ------------------------------------------------------------
//  QUIZ – FULLFØRING / LAGRING / BADGES
// ------------------------------------------------------------
function finishQuiz(quiz, correctCount, total, ctx) {
  const modal = document.getElementById("quizModal");
  if (modal) {
    modal.classList.add("fade-out");
    setTimeout(() => {
      modal.setAttribute("aria-hidden","true");
      modal.style.display = "none";
    }, 400);
  }

  const { place, person, testMode } = ctx || {};
  const allCorrect = correctCount === total;

  if (!quiz || !allCorrect) {
    // lagrer ingenting hvis alt ikke er riktig – men vi kunne lagret forsøk
    return;
  }

  // quiz_progress
  const quizProgress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  const existing = quizProgress[quiz.id] || { completed: [], best: 0 };

  existing.completed = Array.from(new Set([...(existing.completed || []), new Date().toISOString()]));
  existing.best = Math.max(existing.best || 0, correctCount);

  quizProgress[quiz.id] = existing;
  localStorage.setItem("quiz_progress", JSON.stringify(quizProgress));

  // visited_places
  const visited = JSON.parse(localStorage.getItem("visited_places") || "{}");
  if (place && !visited[place.id]) {
    visited[place.id] = { first: new Date().toISOString() };
  }
  if (person && person.placeId && !visited[person.placeId]) {
    visited[person.placeId] = { first: new Date().toISOString() };
  }
  localStorage.setItem("visited_places", JSON.stringify(visited));

  // people_collected
  if (person) {
    const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
    peopleCollected[person.id] = { first: new Date().toISOString() };
    localStorage.setItem("people_collected", JSON.stringify(peopleCollected));
  }

  // Oppdater merits/badges
  updateMeritsFromQuiz(quiz);

  // Popups – også i testmodus
  if (person) {
    const personObj = PEOPLE.find(p => p.id === person.id) || person;
    showPersonPopup(personObj);
  } else if (place) {
    const placeObj = PLACES.find(p => p.id === place.id) || place;
    // Her var det tidligere brukt visitedPlaces[place.id] → nå bruker vi visited[]
    if (visited[place.id] || testMode) {
      showPlacePopup(placeObj);
    }
  }

  // Signal til miniprofil osv.
  try {
    window.dispatchEvent(new Event("updateProfile"));
  } catch(e) {}

  showToast("Quiz fullført med toppscore! 🏅");
}

// ------------------------------------------------------------
//  MERITS / BADGES
// ------------------------------------------------------------
function updateMeritsFromQuiz(quiz) {
  if (!quiz || !quiz.categoryId) return;

  const catId = quiz.categoryId;
  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  const existing = merits[catId] || { points:0, level:"Nybegynner", quizzes:[] };
  const newPoints = (existing.points || 0) + 10;

  const quizzes = Array.from(new Set([...(existing.quizzes || []), quiz.id]));

  let level = existing.level;
  if (newPoints >= 100) level = "Ekspert";
  else if (newPoints >= 60) level = "Viderekommen";
  else if (newPoints >= 30) level = "Lærd";

  merits[catId] = {
    points: newPoints,
    level,
    quizzes
  };

  localStorage.setItem("merits_by_category", JSON.stringify(merits));
}

// ------------------------------------------------------------
//  PERSON-POPUP & PLACE-POPUP (brukes både her og på profil)
// ------------------------------------------------------------
function showPersonPopup(person) {
  if (!person) return;
  const popup = document.createElement("div");
  popup.className = "person-popup visible";

  popup.innerHTML = `
    <img src="${person.image || `bilder/kort/people/${person.id}.PNG`}" alt="${person.name}">
    <h3>${person.name}</h3>
    <p>${person.year || ""}</p>
    <p>${person.desc || ""}</p>
  `;

  document.body.appendChild(popup);
  popup.onclick = () => popup.remove();
}

function showPlacePopup(place) {
  if (!place) return;
  const modal = document.createElement("div");
  modal.className = "place-overlay";

  modal.innerHTML = `
    <div class="place-overlay-content">
      <button class="close-overlay" aria-label="Lukk">×</button>
      <div class="left">
        <h2>${place.name}</h2>
        <p class="meta">${place.category || ""} · ${place.year || ""}</p>
        <p>${place.desc || ""}</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close-overlay").onclick = () => modal.remove();
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
}

// ------------------------------------------------------------
//  BADGES (klikk på små-badger i hovedapp)
// ------------------------------------------------------------
async function ensureBadgesLoaded() {
  if (BADGES && BADGES.length) return;
  try {
    const data = await fetch("badges.json", {cache:"no-store"}).then(r=>r.json());
    BADGES = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Kunne ikke laste badges.json", e);
  }
}

function openBadgeModalFromMain(badgeId) {
  const badge = (BADGES || []).find(b => b.id === badgeId);
  if (!badge) return;

  // Gjenbruker badge-modal fra profil (hvis den finnes i DOM)
  const modal = document.getElementById("badgeModal");
  if (!modal) {
    showToast("Badge-vinduet er ikke tilgjengelig på denne siden.");
    return;
  }

  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const merit  = merits[badge.id] || merits[badge.name] || {};

  const modalImg   = modal.querySelector(".badge-img");
  const modalTitle = modal.querySelector(".badge-title");
  const modalLevel = modal.querySelector(".badge-level");
  const quizList   = modal.querySelector(".badge-quizzes");
  const progBar    = modal.querySelector(".badge-progress-bar");
  const progText   = modal.querySelector(".badge-progress-text");

  const points  = Number(merit.points || 0);
  const level   = merit.level || "Nybegynner";
  const quizzes = Array.isArray(merit.quizzes) ? merit.quizzes.length : 0;

  if (modalImg)   modalImg.src = badge.image;
  if (modalTitle) modalTitle.textContent = badge.name;
  if (modalLevel) modalLevel.textContent = level;

  if (progBar) {
    let pct = 0;
    if (points >= 100) pct = 100;
    else if (points >= 60) pct = 60;
    else if (points >= 30) pct = 30;
    else if (points > 0) pct = 15;
    progBar.style.width = pct + "%";
  }

  if (progText) {
    progText.textContent = points ? `Poeng: ${points}` : "";
  }

  if (quizList) {
    if (quizzes > 0) {
      quizList.innerHTML = `<li>Fullførte quizer i denne kategorien: ${quizzes}</li>`;
    } else {
      quizList.innerHTML = "<li>Ingen quizer fullført ennå.</li>";
    }
  }

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden","false");

  const closeBtn = modal.querySelector(".close-btn");
  if (closeBtn) closeBtn.onclick = () => {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden","true");
  };
  modal.onclick = e => { if (e.target === modal) {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden","true");
  }};
}

// Global klikklytter for små-badger i hovedapp (hvis du bruker data-badge-id)
document.addEventListener("click", (e) => {
  const badgeEl = e.target.closest("[data-badge-id]");
  if (!badgeEl) return;
  const badgeId = badgeEl.getAttribute("data-badge-id");
  if (!badgeId) return;
  ensureBadgesLoaded().then(() => openBadgeModalFromMain(badgeId));
});

// ------------------------------------------------------------
//  MINIPROFIL I HOVEDAPP
// ------------------------------------------------------------
function renderMiniProfile() {
  const el = document.querySelector(".mini-profile");
  if (!el) return;

  const name = localStorage.getItem("user_name") || "Utforsker #182";
  const visited = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const quizProgress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");

  const visitedCount = Object.keys(visited).length;
  const quizCount = Object.values(quizProgress)
    .map(v => Array.isArray(v.completed) ? v.completed.length : 0)
    .reduce((a,b) => a+b, 0);
  const peopleCount = Object.keys(peopleCollected).length;

  const nameEl = el.querySelector("[data-mini-name]");
  const statsEl = el.querySelector("[data-mini-stats]");

  if (nameEl) nameEl.textContent = name;
  if (statsEl) {
    statsEl.textContent = `${visitedCount} steder · ${quizCount} quizer · ${peopleCount} personer`;
  }
}

// Lytt etter globale oppdateringer
window.addEventListener("updateProfile", () => {
  renderMiniProfile();
});

// ------------------------------------------------------------
//  INIT
// ------------------------------------------------------------
function boot() {
  const mapEl = document.getElementById("map");
  if (mapEl) {
    initMap();
  }
  loadData();
  renderMiniProfile();
}

document.addEventListener("DOMContentLoaded", boot);

// ------------------------------------------------------------
//  EKSTRA – QUIZ-HISTORIKK MODAL (hvis du bruker den på index)
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector(".quiz-modal");
  if (!modal) return;

  const listEl = modal.querySelector(".quiz-history-list");
  const closeBtn = modal.querySelector(".quiz-close");

  function openHistory() {
    const quizProgress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
    const entries = Object.entries(quizProgress);
    if (!entries.length) {
      listEl.innerHTML = "<li>Ingen quizer gjennomført ennå.</li>";
    } else {
      listEl.innerHTML = entries.map(([id, data]) => {
        const count = Array.isArray(data.completed) ? data.completed.length : 0;
        return `<li><strong>${id}</strong><br><small>Fullført ${count} ganger</small></li>`;
      }).join("");
    }
    modal.style.display = "flex";
  }

  const trigger = document.getElementById("openQuizHistory");
  if (trigger) trigger.onclick = openHistory;

  if (closeBtn) {
    closeBtn.onclick = () => { modal.style.display = "none"; };
  }
  modal.onclick = e => { if (e.target === modal) modal.style.display = "none"; };
});

// ------------------------------------------------------------
//  STYLE-TWEEK (placeholder – hvis du bruker dette til tema)
// ------------------------------------------------------------
(function injectStyleTweak(){
  const s = document.createElement("style");
  s.textContent = `
    body.map-only .mini-profile { display:none; }
  `;
  document.head.appendChild(s);
})();
