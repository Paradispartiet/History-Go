// =====================================================
// HISTORY GO – APP.JS (stabil produksjonsversjon v17)
// =====================================================
//
// 1.  KONSTANTER OG INIT-VARIABLER
// 2.  ELEMENTREFERANSER (DOM-cache)
// 3.  KATEGORIFUNKSJONER (farge, klasse, tag)
// 4.  GEO OG AVSTANDSBEREGNING
// 5.  BRUKERPOSISJON OG KART (ruter, markører)
// 6.  STED- OG PERSONKORT
// 7.  LISTEVISNINGER (nærområde, samling, galleri)
// 8.  MERKER, NIVÅER OG FREMGANG
// 9.  HENDELSER (click-delegation) OG SHEETS
// 10. INITIALISERING OG BOOT
// 12. KARTMODUS
// 13. QUIZ – DYNAMISK LASTER, MODAL & SCORE
// 14. PERSON- OG STED-POPUP
// =====================================================


// ==============================
// 0. KONFIG / DEBUG
// ==============================
const DEBUG = false;

// ==============================
// 1. KONSTANTER OG INIT-VARIABLER
// ==============================
const START            = { lat: 59.9139, lon: 10.7522, zoom: 13 };
const NEARBY_LIMIT     = 5;
const QUIZ_FEEDBACK_MS = 650;

let MAP = null; // ← brukes av enter/exitMapMode + resize

let PLACES  = [];
let PEOPLE  = [];
let BADGES  = [];

let TAGS_REGISTRY = null;

function normalizeTags(rawTags, tagsRegistry) {
  const list = Array.isArray(rawTags) ? rawTags : [];
  const legacyMap = (tagsRegistry && tagsRegistry.legacy_map) || {};
  return list.map(t => legacyMap[t] || t).filter(Boolean);
}

const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

// Dialoger og notater (History Go – V1)

// Samtaler med personer (kan få egen visning senere)
const personDialogs = JSON.parse(
  localStorage.getItem("hg_person_dialogs_v1") || "[]"
);

// Felles notat-lager for alt brukeren skriver
// (person-notater, stedsnotater, frie notater, senere også AHA/Echo)
const userNotes = JSON.parse(
  localStorage.getItem("hg_user_notes_v1") || "[]"
);


function safeInit(name, fn) {
  try {
    fn();
    if (DEBUG && window.HGConsole?.ok) window.HGConsole.ok(name);
  } catch (e) {
    console.error(`[${name}]`, e); // denne kan stå (reell feil)
    if (DEBUG && window.HGConsole?.fail) window.HGConsole.fail(name, e);
    if (DEBUG) {
      window.__HG_LAST_ERROR__ = { name, message: String(e), stack: e?.stack };
    }
  }
}
// ------------------------------------------------------------
// EKSPORT TIL AHA – DELT LOCALSTORAGE-BUFFER
// ------------------------------------------------------------
function exportHistoryGoData() {
  // 1. Knowledge-universet
  let knowledge = {};
  try {
    if (typeof getKnowledgeUniverse === "function") {
      // Foretrukket – bruker knowledge.js
      knowledge = getKnowledgeUniverse();
    } else {
      // Fallback – les direkte fra localStorage
      knowledge = JSON.parse(
        localStorage.getItem("knowledge_universe") || "{}"
      );
    }
  } catch (e) {
if (DEBUG) console.warn("Kunne ikke lese knowledge_universe", e);
  }

  // 2. Notater
  const notes = Array.isArray(userNotes) ? userNotes : [];

  // 3. Person-dialoger
  const dialogs = Array.isArray(personDialogs) ? personDialogs : [];

  const payload = {
    user_id: localStorage.getItem("user_id") || "local_user",
    source: "historygo",
    exported_at: new Date().toISOString(),
    knowledge_universe: knowledge,
    notes,
    dialogs
  };

  const json = JSON.stringify(payload, null, 2);
if (DEBUG) console.log("HistoryGo → AHA export oppdatert i localStorage.");
  // NB: nøkkel deler origin med AHA (samme GitHub-bruker)
  localStorage.setItem("aha_import_payload_v1", json);
  return json;
}

// Praktisk wrapper – trygg mot feil
function syncHistoryGoToAHA() {
  try {
    exportHistoryGoData();
  } catch (e) {
    console.warn("Klarte ikke å synce til AHA:", e);
  }
}

function savePersonDialogs() {
  localStorage.setItem("hg_person_dialogs_v1", JSON.stringify(personDialogs));
  if (typeof syncHistoryGoToAHA === "function") {
    syncHistoryGoToAHA();
  }
}

function saveUserNotes() {
  localStorage.setItem("hg_user_notes_v1", JSON.stringify(userNotes));
  if (typeof syncHistoryGoToAHA === "function") {
    syncHistoryGoToAHA();
  }
}

// progress for “+1 poeng per 3 riktige” (reservert)
const userProgress    = JSON.parse(localStorage.getItem("historygo_progress") || "{}");



function saveVisited() {
  localStorage.setItem("visited_places", JSON.stringify(visited));
  renderCollection();

  // Oppdater kartprikker når visited endrer seg
  if (window.HGMap) {
    HGMap.setVisited(visited);
    HGMap.refreshMarkers();
  }
}

function savePeople() {
  localStorage.setItem("people_collected", JSON.stringify(peopleCollected));
  renderGallery();
}

function saveMerits() {
  localStorage.setItem("merits_by_category", JSON.stringify(merits));
}

function showToast(msg, ms = 2000) {
  const t = el.toast;
  if (!t) return;
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(t._hide);
  t._hide = setTimeout(() => {
    t.style.display = "none";
  }, ms);
}


// ==============================
// 2. ELEMENTREFERANSER (DOM-cache)
// ==============================
const el = {
  map:        document.getElementById("map"),
  toast:      document.getElementById("toast"),
  status:     document.getElementById("status"),

  btnSeeMap:  document.getElementById("btnSeeMap"),
  btnExitMap: document.getElementById("btnExitMap"),
  btnCenter:  document.getElementById("btnCenter"),
  test:       document.getElementById("testToggle"),

  list:       document.getElementById("nearbyList"),
  nearPeople: document.getElementById("nearbyPeople"),

  collectionGrid:      document.getElementById("collectionGrid"),
  collectionCount:     document.getElementById("collectionCount"),
  btnMoreCollection:   document.getElementById("btnMoreCollection"),
  sheetCollection:     document.getElementById("sheetCollection"),
  sheetCollectionBody: document.getElementById("sheetCollectionBody"),

  gallery: document.getElementById("gallery"),

};


// ==============================
// 3. KATEGORIFUNKSJONER
// ==============================

// Kategoriliste (brukes i søk, badges, visning, scroll)
const CATEGORY_LIST = [
  { id: "historie",        name: "Historie" },
  { id: "vitenskap",       name: "Vitenskap & filosofi" },
  { id: "kunst",           name: "Kunst & kultur" },
  { id: "musikk",          name: "Musikk & scenekunst" },
  { id: "natur",           name: "Natur & miljø" },
  { id: "sport",           name: "Sport & lek" },
  { id: "by",              name: "By & arkitektur" },
  { id: "politikk",        name: "Politikk & samfunn" },
  { id: "populaerkultur",  name: "Populærkultur" },
  { id: "subkultur",       name: "Subkultur" },
  { id: "litteratur",      name: "Litteratur" },        // ← NY
  { id: "naeringsliv",     name: "Næringsliv" },        // ← NY
  { id: "psykologi",       name: "Psykologi" }          // ← NY
];

function norm(s = "") {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa");
}

// Farger (bruker badge-fargene)
function catColor(cat = "") {
  const c = norm(cat);
  if (c.includes("historie") || c.includes("fortid") || c.includes("middelalder") || c.includes("arkeologi")) return "#344B80";   // Historie – dyp blå
  if (c.includes("vitenskap") || c.includes("filosofi")) return "#9b59b6";
  if (c.includes("kunst") || c.includes("kultur")) return "#ffb703";
  if (c.includes("musikk") || c.includes("scene")) return "#ff66cc";
  if (c.includes("litteratur") || c.includes("poesi")) return "#f6c800";
  if (c.includes("natur") || c.includes("miljoe")) return "#4caf50";
  if (c.includes("sport") || c.includes("idrett") || c.includes("lek")) return "#2a9d8f";
  if (c.includes("by") || c.includes("arkitektur")) return "#e63946";
  if (c.includes("politikk") || c.includes("samfunn")) return "#c77dff";
  if (c.includes("naering") || c.includes("industri") || c.includes("arbeid")) return "#ff8800";
  if (c.includes("populaer") || c.includes("pop")) return "#ffb703";
  if (c.includes("subkultur") || c.includes("urban")) return "#ff66cc";
  if (c.includes("psykologi") || c.includes("mental") || c.includes("sinn")) return "#ff7aa2"; // ← NY, velg farge du liker
  return "#9b59b6"; // fallback
}

// CSS-klasser
function catClass(cat = "") {
  const c = norm(cat);
  if (c.includes("historie") || c.includes("fortid") || c.includes("middelalder") || c.includes("arkeologi")) return "historie";
  if (c.includes("vitenskap") || c.includes("filosofi")) return "vitenskap";
  if (c.includes("kunst") || c.includes("kultur")) return "kunst";
  if (c.includes("musikk") || c.includes("scene")) return "musikk";
  if (c.includes("litteratur") || c.includes("poesi")) return "litteratur";
  if (c.includes("natur") || c.includes("miljoe")) return "natur";
  if (c.includes("sport") || c.includes("idrett") || c.includes("lek")) return "sport";
  if (c.includes("by") || c.includes("arkitektur")) return "by";
  if (c.includes("politikk") || c.includes("samfunn")) return "politikk";
  if (c.includes("naering") || c.includes("industri") || c.includes("arbeid")) return "naeringsliv";
  if (c.includes("populaer") || c.includes("pop")) return "populaerkultur";
  if (c.includes("subkultur") || c.includes("urban")) return "subkultur";
  if (c.includes("psykologi") || c.includes("mental") || c.includes("sinn")) return "psykologi"; // ← NY
  return "vitenskap";
}

// Kategorier brukt i quiz-fil-kartet
function tagToCat(tags = []) {
  const t = norm(Array.isArray(tags) ? tags.join(" ") : tags || "");

  if (t.includes("historie") || t.includes("fortid") || t.includes("middelalder") || t.includes("arkeologi")) return "historie";
  if (t.includes("subkultur") || t.includes("urban")) return "subkultur";
  if (t.includes("populaer") || t.includes("pop")) return "populaerkultur";
  if (t.includes("vitenskap") || t.includes("filosofi")) return "vitenskap";
  if (t.includes("kunst") || t.includes("kultur")) return "kunst";
  if (t.includes("musikk") || t.includes("scene")) return "musikk";
  if (t.includes("litteratur") || t.includes("poesi")) return "litteratur";
  if (t.includes("natur") || t.includes("miljoe")) return "natur";
  if (t.includes("sport") || t.includes("idrett") || t.includes("lek")) return "sport";
  if (t.includes("by") || t.includes("arkitektur")) return "by";
  if (t.includes("politikk") || t.includes("samfunn")) return "politikk";
  if (t.includes("naering") || t.includes("industri") || t.includes("arbeid")) return "naeringsliv";
  if (t.includes("psykologi") || t.includes("mental") || t.includes("sinn") || t.includes("klinisk")) return "psykologi"; // ← NY

  return "vitenskap";
}

// Bridge for visningsnavn
function catIdFromDisplay(name = "") {
  return tagToCat(name);
}


// ==============================
// 4. GEO OG AVSTANDSBEREGNING
// ==============================
function distMeters(a, b) {
  const R = 6371e3;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 +
            Math.cos(la1) * Math.cos(la2) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}



  
// ==============================
// 7. LISTEVISNINGER
// ==============================
let currentPos = null;

function renderNearbyPlaces() {
  if (!el.list) return;

  const sorted = PLACES
    .map(p => ({
      ...p,
      _d: currentPos ? Math.round(distMeters(currentPos, { lat: p.lat, lon: p.lon })) : null
    }))
    .sort((a, b) => (a._d ?? 1e12) - (b._d ?? 1e12));

  el.list.innerHTML = sorted
    .map(renderPlaceCard)
    .join("");
}

function renderPlaceCard(p) {
  const dist =
    p._d == null
      ? ""
      : p._d < 1000
      ? `${p._d} m`
      : `${(p._d / 1000).toFixed(1)} km`;

  const img = p.image; 

  return `
    <div class="nearby-item" data-open="${p.id}">
      
      <img class="nearby-thumb" src="${img}" alt="${p.name}">
      
      <span class="nearby-name">${p.name}</span>

      <span class="nearby-dist">${dist}</span>

      <img class="nearby-badge" src="bilder/merker/${catClass(p.category)}.PNG" alt="">
    </div>
  `;
}

function renderPersonCardInline(pr) {
  const cat = tagToCat(pr.tags);
  const dist =
    pr._d < 1000 ? `${pr._d} m` : `${(pr._d / 1000).toFixed(1)} km`;

  const img = pr.imageCard || pr.image;

  return `
    <article class="card person-inline-card">
      <img src="${img}" alt="${pr.name}" class="inline-thumb">

      <div class="inline-info">
        <div class="name">${pr.name}</div>
        <div class="meta">${cat}</div>
        <p class="desc">${pr.desc || ""}</p>

        <div class="row between">
          <div class="dist">${dist}</div>
          <button class="primary" data-quiz="${pr.id}">Ta quiz</button>
        </div>
      </div>
    </article>`;
}
function renderCollection() {
  const grid = el.collectionGrid;
  if (!grid) return;

  const items = PLACES.filter(p => visited[p.id]);

  if (el.collectionCount) el.collectionCount.textContent = items.length;

  const first = items.slice(0, 18);
  grid.innerHTML = first
    .map(
      p => `
    <span class="badge ${catClass(p.category)}" title="${p.name}">
      <span class="i" style="background:${catColor(p.category)}"></span> ${p.name}
    </span>`
    )
    .join("");
}

function renderGallery() {
  if (!el.gallery) return;
  const collectedIds = Object.keys(peopleCollected).filter(id => peopleCollected[id]);
  const collectedPeople = PEOPLE.filter(p => collectedIds.includes(p.id));

  el.gallery.innerHTML = collectedPeople
    .map(p => {
      const imgPath = p.imageCard || p.image;
      const cat = tagToCat(p.tags);
      return `
        <div class="person-card" data-quiz="${p.id}">
          <img src="${imgPath}" alt="${p.name}" class="person-thumb">
          <div class="person-label" style="color:${catColor(cat)}">${p.name}</div>
        </div>`;
    })
    .join("");
}


// ==============================
// 8. MERKER, NIVÅER OG FREMGANG
// ==============================
function pulseBadge(cat) {
  const cards = document.querySelectorAll(".badge-mini");
  cards.forEach(card => {
    const name = card.querySelector(".badge-mini-label")?.textContent || "";
    if (name.trim().toLowerCase() === cat.trim().toLowerCase()) {
      card.classList.add("badge-pulse");
      setTimeout(() => card.classList.remove("badge-pulse"), 1200);
    }
  });
}

async function ensureBadgesLoaded() {
  if (BADGES && BADGES.length) return;
  try {
BADGES = await fetch("data/badges.json", { cache: "no-store" }).then(r => r.json());
  } catch {
    BADGES = [];
  }
}

// Oppdater nivå ved ny poengsum
async function updateMeritLevel(cat, newPoints) {
  await ensureBadgesLoaded();
  const badge = BADGES.find(
    b =>
      cat.toLowerCase().includes(b.id) ||
      b.name.toLowerCase().includes(cat.toLowerCase())
  );
  if (!badge) return;

  for (let i = badge.tiers.length - 1; i >= 0; i--) {
    const tier = badge.tiers[i];
    if (newPoints === tier.threshold) {
      showToast(`🏅 Nytt nivå i ${cat}: ${tier.label}!`);
      pulseBadge(cat);
      break;
    }
  }
}

// Poengsystem – +1 poeng per fullført quiz
async function addCompletedQuizAndMaybePoint(categoryDisplay, quizId) {
  const categoryId = catIdFromDisplay(categoryDisplay);
  const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  progress[categoryId] = progress[categoryId] || { completed: [] };

  // Hindre dobbel poeng for samme quiz
  if (progress[categoryId].completed.includes(quizId)) return;

  progress[categoryId].completed.push(quizId);
  localStorage.setItem("quiz_progress", JSON.stringify(progress));

  const catLabel = categoryDisplay;
  merits[catLabel] = merits[catLabel] || { level: "Nybegynner", points: 0 };
  merits[catLabel].points += 1;

  await ensureBadgesLoaded();
  const badge = BADGES.find(
    b =>
      catLabel.toLowerCase().includes(b.id) ||
      b.name.toLowerCase().includes(catLabel.toLowerCase())
  );
  if (badge) {
    for (let i = badge.tiers.length - 1; i >= 0; i--) {
      const tier = badge.tiers[i];
      if (merits[catLabel].points >= tier.threshold) {
        merits[catLabel].level = tier.label;
        break;
      }
    }
  }

  saveMerits();
  updateMeritLevel(catLabel, merits[catLabel].points);
  showToast(`🏅 +1 poeng i ${catLabel}!`);
  window.dispatchEvent(new Event("updateProfile"));
}

// ==============================
// 9. HENDELSER (CLICK-DELEGATION) OG SHEETS
// ==============================
function openSheet(sheet) {
  sheet?.setAttribute("aria-hidden", "false");
}
function closeSheet(sheet) {
  sheet?.setAttribute("aria-hidden", "true");
}

// Felles click-delegation for steder, info, quiz, merker
document.addEventListener("click", e => {
  const target = e.target;

  // Åpne sted fra kort (data-open)
  const openId = target.getAttribute?.("data-open");
  if (openId) {
    const p = PLACES.find(x => x.id === openId);
    if (p) openPlaceCard(p);
    return;
  }
  
  // Mer info (Google)
  const infoName = target.getAttribute?.("data-info");
  if (infoName) {
    window.open(
      `https://www.google.com/search?q=${decodeURIComponent(infoName)} Oslo`,
      "_blank"
    );
    return;
  }

// --- SNakk med person ---
  const chatPersonId = target.getAttribute?.("data-chat-person");
  if (chatPersonId) {
    const person = PEOPLE.find(p => p.id === chatPersonId);
    if (person) {
      handlePersonChat(person);
    }
    return;
  }

  // --- Notat om person ---
  const notePersonId = target.getAttribute?.("data-note-person");
  if (notePersonId) {
    const person = PEOPLE.find(p => p.id === notePersonId);
    if (person) {
      handlePersonNote(person);
    }
    return;
  }

  
  // Quiz
  // Quiz (robust på iPad/Safari)
  const quizEl = target.closest?.("[data-quiz]");
  const quizId = quizEl?.getAttribute?.("data-quiz");

  if (quizId) {
  if (window.QuizEngine?.start) {
    QuizEngine.start(quizId);
  } else {
    showToast("Quiz-modul ikke lastet");
  }
}
  
  // --- SØKERESULTAT: STED ---
const placeId = target.closest?.(".search-item")?.getAttribute("data-place");
if (placeId) {
  const p = PLACES.find(x => x.id === placeId);
  if (p) {
    // lukk søkeresultater
    document.getElementById("searchResults").style.display = "none";
    // åpne popup/kort
    openPlaceCard(p);
    // zoom kart
    if (p.lat && p.lon) focusMap(p.lat, p.lon);
  }
  return;
}

// --- SØKERESULTAT: PERSON ---
const personId = target.closest?.(".search-item")?.getAttribute("data-person");
if (personId) {
  const pe = PEOPLE.find(x => x.id === personId);
  if (pe) {
    document.getElementById("searchResults").style.display = "none";
    showPersonPopup(pe);

    // zoom til sted personen hører til (hvis finnes)
    if (pe.placeId) {
      const plc = PLACES.find(p => p.id === pe.placeId);
      if (plc) focusMap(plc.lat, plc.lon);
    }
  }
  return;
}

// --- SØKERESULTAT: MERKE ---
const badgeId = target.closest?.(".search-item")?.getAttribute("data-badge");
if (badgeId) {
  // lukk søket
  document.getElementById("searchResults").style.display = "none";

  // finn badge i datasettet
  const badgeEl = document.querySelector(`[data-badge-id="${badgeId}"]`);

  // bruk samme funksjon som vanlig
  if (badgeEl) {
    handleBadgeClick(badgeEl);
  }

  return;
}


  
  // Badge-klikk
  const badgeEl = target.closest?.("[data-badge-id]");
  if (badgeEl) {
    handleBadgeClick(badgeEl);
    return;
  }
});

// Sheets med data-close
document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    const sel = btn.getAttribute("data-close");
    document.querySelector(sel)?.setAttribute("aria-hidden", "true");
  });
});



async function handleBadgeClick(badgeEl) {
  const badgeId = badgeEl.getAttribute("data-badge-id");
  const modal = document.getElementById("badgeModal");
  if (!badgeId || !modal) return;

  await ensureBadgesLoaded();
  const badge = BADGES.find(b => b.id === badgeId);
  if (!badge) return;

  const localMerits = JSON.parse(
    localStorage.getItem("merits_by_category") || "{}"
  );
  const info = localMerits[badge.name] || localMerits[badge.id] || {
    level: "Nybegynner",
    points: 0
  };

  const imgEl     = modal.querySelector(".badge-img");
  const titleEl   = modal.querySelector(".badge-title");
  const levelEl   = modal.querySelector(".badge-level");
  const textEl    = modal.querySelector(".badge-progress-text");
  const barEl     = modal.querySelector(".badge-progress-bar");

  if (imgEl)   imgEl.src = badge.image;
  if (titleEl) titleEl.textContent = badge.name;
  if (levelEl) levelEl.textContent = info.level;
  if (textEl)  textEl.textContent = `${info.points} poeng`;

  if (barEl && badge.tiers && badge.tiers.length) {
    const max = badge.tiers[badge.tiers.length - 1].threshold || 1;
    const pct = Math.max(0, Math.min(100, (info.points / max) * 100));
    barEl.style.width = `${pct}%`;
  }

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  const closeBtn = modal.querySelector(".close-btn");
  closeBtn &&
    (closeBtn.onclick = () => {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    });
}


function handlePersonChat(person) {
  // Enkel V1: ett åpent spørsmål + lagring
  const userText = window.prompt(
    `Du snakker med ${person.name}.\n\n` +
    `Hva tenker du når du ser livet og tiden til denne personen?`
  );
  if (!userText) return;

  personDialogs.push({
    id: "dlg_" + Date.now(),
    personId: person.id,
    categoryId: (person.tags && person.tags[0]) || null,
    role: "user",
    text: userText,
    createdAt: new Date().toISOString()
  });
  savePersonDialogs();

  showToast(`Samtale med ${person.name} lagret 💬`);
}

function handlePersonNote(person) {
  const noteText = window.prompt(
    `Notat om ${person.name}.\n\n` +
    `Skriv én setning eller tanke du vil ta vare på:`
  );
  if (!noteText) return;

  userNotes.push({
    id: "note_" + Date.now(),
    userId: "local",              // senere: ekte bruker-id
    source: "historygo",
    type: "person",
    personId: person.id,
    placeId: null,
    categoryId: (person.tags && person.tags[0]) || null,
    title: `Notat om ${person.name}`,
    text: noteText,
    feeling: null,                // plass til følelser/valens senere
    createdAt: new Date().toISOString(),
    visibility: "private"
  });
  saveUserNotes();

  showToast(`Notat om ${person.name} lagret 📝`);
}

function handlePlaceNote(place) {
  const noteText = window.prompt(
    `Notat om ${place.name}.\n\nSkriv én setning eller tanke du vil ta vare på:`
  );
  if (!noteText) return;

  userNotes.push({
    id: "note_" + Date.now(),
    userId: "local",
    source: "historygo",
    type: "place",
    personId: null,
    placeId: place.id,
    categoryId: place.category || null,
    title: `Notat om ${place.name}`,
    text: noteText,
    feeling: null,
    createdAt: new Date().toISOString(),
    visibility: "private"
  });
  saveUserNotes();
  showToast(`Notat om ${place.name} lagret 📝`);
}


// ==============================
// 9.x VENSTRE PANEL – DROPDOWN + RAMME
// (må ligge før wire/boot, og init kjøres i DOMContentLoaded)
// ==============================

function initLeftPanel() {
  const sel = document.getElementById("leftPanelMode");
  const vNearby = document.getElementById("panelNearby");
  const vRoutes  = document.getElementById("panelRoutes");
  const vBadges  = document.getElementById("panelBadges");

  if (!sel || !vNearby || !vRoutes || !vBadges) return;

  function show(mode) {
    vNearby.style.display = mode === "nearby" ? "" : "none";
    vRoutes.style.display  = mode === "routes" ? "" : "none";
    vBadges.style.display  = mode === "badges" ? "" : "none";
    try { localStorage.setItem("hg_leftpanel_mode_v1", mode); } catch {}
  }

  // restore mode
  const saved = localStorage.getItem("hg_leftpanel_mode_v1") || "nearby";
  sel.value = saved;
  show(saved);

  sel.addEventListener("change", () => show(sel.value));

  renderLeftBadges();
  syncLeftPanelFrame();

  window.addEventListener("resize", syncLeftPanelFrame);

  // resync når placeCard endrer høyde (åpne/lukke/innhold)
  const pc = document.getElementById("placeCard");
  if (pc && "ResizeObserver" in window) {
    const ro = new ResizeObserver(() => syncLeftPanelFrame());
    ro.observe(pc);
  } else {
    // fallback: mild polling (billig)
    let last = 0;
    setInterval(() => {
      const el = document.getElementById("placeCard");
      if (!el) return;
      const h = Math.round(el.getBoundingClientRect().height || 0);
      if (Math.abs(h - last) > 6) {
        last = h;
        syncLeftPanelFrame();
      }
    }, 500);
  }
}

function syncLeftPanelFrame() {
  const header = document.querySelector("header") || document.querySelector(".site-header");
  const pc = document.getElementById("placeCard");
  if (!pc) return;

  const headerH = Math.round(header?.getBoundingClientRect().height || 62);
  document.documentElement.style.setProperty("--hg-header-h", headerH + "px");

  // ✅ Eksakt: hvor mye plass placeCard faktisk tar fra bunnen
  const rect = pc.getBoundingClientRect();

  // bottomOffset = avstand fra bunnen av viewport til toppen av placeCard
  // (dette matcher selv om du har ekstra bunnpanel/knapper)
  let bottomOffset = Math.round(window.innerHeight - rect.top);

  // fallback hvis placeCard midlertidig måles rart
  if (!isFinite(bottomOffset) || bottomOffset < 80) bottomOffset = 220;

  document.documentElement.style.setProperty("--hg-placecard-h", bottomOffset + "px");
}

function renderLeftBadges() {
  const box = document.getElementById("leftBadgesList");
  if (!box) return;

  if (!Array.isArray(CATEGORY_LIST) || !CATEGORY_LIST.length) {
    box.innerHTML = `<div style="color:#9bb0c9;">Ingen kategorier lastet.</div>`;
    return;
  }

  box.innerHTML = CATEGORY_LIST.map(c => {
    const img = `bilder/merker/${c.id}.PNG`;
    return `
      <button class="chip ghost" data-badge-id="${c.id}" style="justify-content:flex-start; width:100%;">
        <img src="${img}" alt="" style="width:18px; height:18px; margin-right:8px; border-radius:4px;">
        ${c.name}
      </button>
    `;
  }).join("");

  // (valgfritt) klikk-håndtering kan legges i wire() via delegation senere
}

// ==============================
// 10. INITIALISERING OG BOOT
// ==============================
function wire() {
  // Testmodus-bryter
  el.test?.addEventListener("change", e => {
    if (e.target.checked) {
      currentPos = { lat: START.lat, lon: START.lon };
      if (el.status) el.status.textContent = "Testmodus: Oslo sentrum";
      if (window.HGMap) HGMap.setUser(currentPos.lat, currentPos.lon);
      renderNearbyPlaces();
      showToast("Testmodus PÅ");
    } else {
      showToast("Testmodus AV");
      requestLocation();
    }
  });
}

function requestLocation() {
  // ✅ global “miljøstatus” som health-checks kan bruke
  window.HG_ENV = window.HG_ENV || {};
  window.HG_ENV.geo = "unknown"; // unknown | granted | blocked

  if (!navigator.geolocation) {
    window.HG_ENV.geo = "blocked";
    if (el.status) el.status.textContent = "Geolokasjon støttes ikke.";
    renderNearbyPlaces();
    // ✅ signal til resten av appen
    window.dispatchEvent(new CustomEvent("hg:geo", { detail: { status: "blocked", reason: "unsupported" } }));
    return;
  }

  if (el.status) el.status.textContent = "Henter posisjon…";

  navigator.geolocation.getCurrentPosition(
    g => {
      currentPos = { lat: g.coords.latitude, lon: g.coords.longitude };

      window.userLat = currentPos.lat;
      window.userLon = currentPos.lon;

      window.HG_ENV.geo = "granted"; // ✅
      window.dispatchEvent(new CustomEvent("hg:geo", { detail: { status: "granted", lat: currentPos.lat, lon: currentPos.lon } }));

      if (el.status) el.status.textContent = "Posisjon funnet.";
      if (window.HGMap) HGMap.setUser(currentPos.lat, currentPos.lon);
      renderNearbyPlaces();
    },
    err => {
      console.warn("Geolocation error:", err);

      window.HG_ENV.geo = "blocked"; // ✅
      window.dispatchEvent(new CustomEvent("hg:geo", { detail: { status: "blocked", reason: err?.code, message: err?.message } }));

      const msg =
        err.code === 1 ? "Posisjon blokkert (tillat i Safari)." :
        err.code === 2 ? "Kunne ikke finne posisjon." :
        err.code === 3 ? "Posisjon timeout." :
        "Posisjon-feil.";

      if (el.status) el.status.textContent = msg;
      showToast(msg);

      window.userLat = null;
      window.userLon = null;

      renderNearbyPlaces();
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  );
}

// MINI-PROFIL + quiz-historikk på forsiden
function initMiniProfile() {
  const nm = document.getElementById("miniName");
  const st = document.getElementById("miniStats");
  if (!nm || !st) return;

  const name  = localStorage.getItem("user_name")  || "Utforsker #182";
  const color = localStorage.getItem("user_color") || "#f6c800";

  const visitedLS    = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const meritsLS     = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const quizHist     = JSON.parse(localStorage.getItem("quiz_history") || "[]");

  const visitedCount = Object.keys(visitedLS).length;
  const badgeCount   = Object.keys(meritsLS).length;
  const quizCount    = quizHist.length;

  nm.textContent = name;
  nm.style.color = color;
  st.textContent = `${visitedCount} steder · ${badgeCount} merker · ${quizCount} quizzer`;


  /* -------------------------------------
     1) Siste tre merker (ikon-rad)
  ------------------------------------- */
  const badgeRow = document.getElementById("miniBadges");

  if (badgeRow && window.BADGES) {
    const latest = Object.values(meritsLS)
      .sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0,3)
      .map(m => window.BADGES.find(bb => bb.id === m.id))
      .filter(Boolean);

    badgeRow.innerHTML = latest
      .map(b => `<img src="${b.image}" alt="">`)
      .join("");
  }


  /* -------------------------------------
     2) Siste quiz
  ------------------------------------- */
  const lastQuizBox = document.getElementById("miniLastQuiz");

  if (quizHist.length) {
    const last = quizHist[quizHist.length - 1];

    const person = PEOPLE.find(p => p.id === last.id);
    const place  = PLACES.find(p => p.id === last.id);

    const img  = person?.imageCard || place?.cardImage || "";
    const n    = person?.name || place?.name || "Quiz";

    document.getElementById("miniLastQuizImg").src = img;
    document.getElementById("miniLastQuizName").textContent = n;

    lastQuizBox.style.display = "flex";
  } else {
    lastQuizBox.style.display = "none";
  }
}

window.addEventListener("updateProfile", initMiniProfile);

function showQuizHistory() {
  const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  const allCompleted = Object.entries(progress).flatMap(([cat, val]) =>
    (val.completed || []).map(id => ({ category: cat, id }))
  );

  if (!allCompleted.length) {
    showToast("Du har ingen fullførte quizzer ennå.");
    return;
  }

  const recent = allCompleted.slice(-8).reverse();
  const list = recent
    .map(item => {
      const person = PEOPLE.find(p => p.id === item.id);
      const place = PLACES.find(p => p.id === item.id);
      const name = person?.name || place?.name || item.id;
      const cat = item.category || "–";
      return `<li><strong>${name}</strong><br><span class="muted">${cat}</span></li>`;
    })
    .join("");

  const html = `
    <div class="quiz-modal" id="quizHistoryModal">
      <div class="quiz-modal-inner">
        <button class="quiz-close" id="closeQuizHistory">✕</button>
        <h2>Fullførte quizzer</h2>
        <ul class="quiz-history-list">${list}</ul>
      </div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", html);

  const modal = document.getElementById("quizHistoryModal");
  document.getElementById("closeQuizHistory").onclick = () => modal.remove();
  modal.addEventListener("click", e => {
    if (e.target.id === "quizHistoryModal") modal.remove();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") modal.remove();
  });
}

function wireMiniProfileLinks() {
  document.getElementById("linkPlaces")?.addEventListener("click", () => {
    enterMapMode();
    showToast("Viser steder på kartet");
  });

  document.getElementById("linkBadges")?.addEventListener("click", () => {
    window.location.href = "profile.html#userBadgesGrid";
  });

  document.getElementById("linkQuiz")?.addEventListener("click", showQuizHistory);
}

// BOOT
async function boot() {
  // Init map + eksponer global MAP (routes.js forventer MAP)
  const map = window.HGMap?.initMap({ containerId: "map", start: START });
if (map) {
  MAP = map;        // ← viktig: lokal variabel i app.js
  window.MAP = map; // ← viktig: global for routes.js
}

  // Eksponer START globalt (routes.js bruker START som fallback)
  window.START = START;

  try {
    const [places, people, tags] = await Promise.all([
      fetch("data/places.json", { cache: "no-store" }).then(r => r.json()),
      fetch("data/people.json", { cache: "no-store" }).then(r => r.json()),
      fetch("data/tags.json",   { cache: "no-store" }).then(r => r.json()).catch(() => null)
    ]);

    PLACES = places;
    PEOPLE = people;
    TAGS_REGISTRY = tags;

if (typeof linkPeopleToPlaces === "function") {
  linkPeopleToPlaces();
} else {
  console.warn("linkPeopleToPlaces() mangler – hopper over linking");
}


   // ✅ INIT QUIZ-MODUL (ETTER at PLACES/PEOPLE er lastet)
if (window.QuizEngine) {
  QuizEngine.init({
    getPersonById: id => PEOPLE.find(p => p.id === id),
    getPlaceById:  id => PLACES.find(p => p.id === id),

    getVisited: () => visited,
    isTestMode: () => !!el.test?.checked,

    showToast,

    // progression / rewards
    addCompletedQuizAndMaybePoint,

    showRewardPerson,
    showRewardPlace,
    showPersonPopup,
    showPlacePopup,

    // wrappers
    pulseMarker: (lat, lon) => {
      if (typeof window.pulseMarker === "function") window.pulseMarker(lat, lon);
    },
    savePeopleCollected: (personId) => {
      peopleCollected[personId] = true;
      savePeople();
    },
    dispatchProfileUpdate: () => window.dispatchEvent(new Event("updateProfile")),

    // ✅ hooks (kun ved riktige svar)
    saveKnowledgeFromQuiz: window.saveKnowledgeFromQuiz || null,
    saveTriviaPoint: window.saveTriviaPoint || null
  });
} else {
  console.warn("QuizEngine ikke lastet");
}



    
    // ✅ Gi kartmodulen data + callbacks (ETTER data er lastet)
    if (window.HGMap) {
      HGMap.setPlaces(PLACES);
      HGMap.setVisited(visited);
      HGMap.setCatColor(catColor);
      HGMap.setOnPlaceClick((id) => {
        const p = PLACES.find(x => x.id === id);
        if (p) openPlaceCard(p);
      });
      HGMap.setDataReady(true);
      HGMap.maybeDrawMarkers();
    }

  } catch (e) {
    console.error("Feil ved lasting av data:", e);
    showToast("Kunne ikke laste steder/personer");
  }

  await ensureBadgesLoaded();
  wire();
  requestLocation();
  renderCollection();
  renderGallery();
}

document.addEventListener("DOMContentLoaded", () => {
  safeRun("boot", boot);
  safeRun("initMiniProfile", initMiniProfile);
  safeRun("wireMiniProfileLinks", wireMiniProfileLinks);
  safeRun("initLeftPanel", initLeftPanel);
});

function safeRun(label, fn) {
  try { fn(); }
  catch (e) { console.error(`[${label}]`, e); }
}



// ==============================
// 12. KARTMODUS
// ==============================
function enterMapMode() {
  document.body.classList.add("map-only");
  if (el.btnSeeMap) el.btnSeeMap.style.display = "none";
  if (el.btnExitMap) el.btnExitMap.style.display = "block";

  const main = document.querySelector("main");
  const header = document.querySelector("header");
  if (main) main.style.display = "none";
  if (header) header.style.display = "none";

  const mapEl = document.getElementById("map");
  if (mapEl) mapEl.style.zIndex = "10";

if (window.HGMap) HGMap.resize();

  showToast("Kartmodus");
}

function exitMapMode() {
  document.body.classList.remove("map-only");
  if (el.btnSeeMap) el.btnSeeMap.style.display = "block";
  if (el.btnExitMap) el.btnExitMap.style.display = "none";

  const main = document.querySelector("main");
  const header = document.querySelector("header");
  if (main) main.style.display = "";
  if (header) header.style.display = "";

  const mapEl = document.getElementById("map");
  if (mapEl) mapEl.style.zIndex = "1";

  if (MAP && typeof MAP.resize === "function") MAP.resize();  // ✅ viktig

  showToast("Tilbake til oversikt");
}

el.btnSeeMap?.addEventListener("click", enterMapMode);
el.btnExitMap?.addEventListener("click", exitMapMode);

window.addEventListener("resize", () => {
  if (MAP && typeof MAP.resize === "function") MAP.resize();
});



// ==============================
// 14. GLOBALT SØK
// ==============================

function dist(aLat, aLon, bLat, bLon) {
  const R = 6371;
  const dLat = (bLat - aLat) * Math.PI/180;
  const dLon = (bLon - aLon) * Math.PI/180;
  const lat1 = aLat * Math.PI/180;
  const lat2 = bLat * Math.PI/180;

  const x = Math.sin(dLat/2)**2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2)**2;

  return 2 * R * Math.asin(Math.sqrt(x));
}

function globalSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) return { people: [], places: [], categories: [] };

  // --- PERSONER ---
  const people = PEOPLE.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.desc && p.desc.toLowerCase().includes(q)) ||
    (p.year && String(p.year).includes(q)) ||
(p.tags && normalizeTags(p.tags, TAGS_REGISTRY).some(t => String(t).toLowerCase().includes(q)))
  );

  // --- STEDER ---
  let places = PLACES.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.desc && s.desc.toLowerCase().includes(q)) ||
    (s.type && s.type.toLowerCase().includes(q)) ||
    (s.year && String(s.year).includes(q)) ||
(s.tags && normalizeTags(s.tags, TAGS_REGISTRY).some(t => String(t).toLowerCase().includes(q)))
  );

  // --- NÆR MEG (når kartet er aktivt) ---
if (window.userLat && window.userLon) {
    places = [...places].sort((a, b) => {
      const da = dist(window.userLat, window.userLon, a.lat, a.lon);
      const db = dist(window.userLat, window.userLon, b.lat, b.lon);
      return da - db; // nærmest først
    });
  }

  // --- KATEGORIER ---
  const categories = CATEGORY_LIST.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.id.toLowerCase().includes(q)
  );

  return { people, places, categories };
}

function renderSearchResults({ people, places, categories }, query = "") {
  const box = document.getElementById("searchResults");

  if (!people.length && !places.length && !categories.length) {
    box.innerHTML = "";
    showSearchBox(false);
    return;
  }

  showSearchBox(true);

  function badge(catId) {
    return `<img class="sr-badge" src="bilder/merker/${catId}.PNG">`;
  }

  const q = query.toLowerCase();

  // --- SUGGESTIONS ---
  const peopleStarts = people.filter(p => p.name.toLowerCase().startsWith(q)).slice(0, 5);
  const placesStarts = places.filter(s => s.name.toLowerCase().startsWith(q)).slice(0, 5);
  const catStarts    = categories.filter(c => c.name.toLowerCase().startsWith(q)).slice(0, 5);

  const suggestions = [
    ...catStarts.map(c => `<div class="search-item" data-category="${c.id}">${badge(c.id)}${c.name}</div>`),
    ...peopleStarts.map(p => `<div class="search-item" data-person="${p.id}">${badge(p.category)}${p.name}</div>`),
    ...placesStarts.map(s => `<div class="search-item" data-place="${s.id}">${badge(s.category)}${s.name}</div>`)
  ].join("");

  // --- NÆR DEG (når kart er aktivt) ---
  let nearList = "";
if (window.userLat && window.userLon) {
    const near = places.slice(0, 3); // 3 nærmeste
    nearList = `
      <div class="search-section">
        <h3>Nær deg</h3>
        ${near.map(s => `
          <div class="search-item" data-place="${s.id}">
            ${badge(s.category)}${s.name}
          </div>
        `).join("")}
      </div>
    `;
  }

  box.innerHTML = `
    ${nearList}
    ${suggestions ? `<div class="search-section"><h3>Forslag</h3>${suggestions}</div>` : ""}

    ${people.length ? `
      <div class="search-section"><h3>Personer</h3>
        ${people.map(p => `
          <div class="search-item" data-person="${p.id}">
            ${badge(p.category)}${p.name}
          </div>
        `).join("")}
      </div>` : ""}

    ${places.length ? `
      <div class="search-section"><h3>Steder</h3>
        ${places.map(s => `
          <div class="search-item" data-place="${s.id}">
            ${badge(s.category)}${s.name}
          </div>
        `).join("")}
      </div>` : ""}

    ${categories.length ? `
      <div class="search-section"><h3>Kategorier</h3>
        ${categories.map(c => `
          <div class="search-item" data-category="${c.id}">
            ${badge(c.id)}${c.name}
          </div>
        `).join("")}
      </div>` : ""}
  `;
}

function showSearchBox(show) {
  const box = document.getElementById("searchResults");
  box.style.display = show ? "block" : "none";
}

document.getElementById("globalSearch").addEventListener("input", e => {
  const value = e.target.value;
  const results = globalSearch(value);
  renderSearchResults(results, value);
});



// Skjul når man klikker utenfor
document.addEventListener("click", e => {
  const box = document.getElementById("searchResults");
  const input = document.getElementById("globalSearch");

  if (!box.contains(e.target) && !input.contains(e.target)) {
    showSearchBox(false);
  }
});

// Skjul med Escape
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    showSearchBox(false);
    document.getElementById("globalSearch").value = "";
  }
});
