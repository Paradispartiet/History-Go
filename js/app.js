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
const NEARBY_LIMIT     = 99999;
const QUIZ_FEEDBACK_MS = 650;

let MAP = null; // ← brukes av enter/exitMapMode + resize

let PLACES  = [];
let PEOPLE  = [];
let BADGES  = [];
let RELATIONS = [];

let TAGS_REGISTRY = null;

function normalizeTags(rawTags, tagsRegistry) {
  const list = Array.isArray(rawTags) ? rawTags : [];
  const legacyMap = (tagsRegistry && tagsRegistry.legacy_map) || {};
  return list.map(t => legacyMap[t] || t).filter(Boolean);
}

const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

window.merits = merits;
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
    if (DEBUG) console.warn("Klarte ikke å synce til AHA:", e);
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

  if (window.HGMap) {
    HGMap.setVisited(visited);
    HGMap.refreshMarkers();
  }

  window.dispatchEvent(new Event("updateProfile")); // ✅ VIKTIG
}

// ✅ Unlock sted via quiz (brukes av QuizEngine)
function saveVisitedFromQuiz(placeId) {
  const id = String(placeId ?? "");
  if (!id) return;

  if (!visited[id]) {
    visited[id] = true;
    saveVisited();
    window.dispatchEvent(new Event("updateProfile"));
    window.renderNearbyPlaces?.();
  }
}

function savePeople() {
  localStorage.setItem("people_collected", JSON.stringify(peopleCollected));
  renderGallery();
}

function applyOpenModeUnlockAll() {
  // Må ha data først
  if (!Array.isArray(PLACES) || !PLACES.length) return;

  let changedVisited = false;
  let changedPeople  = false;

  // 1) Alle steder -> visited
  for (const p of PLACES) {
    const id = String(p?.id ?? "").trim();
    if (!id) continue;
    if (!visited[id]) {
      visited[id] = true;
      changedVisited = true;
    }
  }

  // 2) Alle personer -> collected
  if (Array.isArray(PEOPLE) && PEOPLE.length) {
    for (const person of PEOPLE) {
      const id = String(person?.id ?? "").trim();
      if (!id) continue;
      if (!peopleCollected[id]) {
        peopleCollected[id] = true;
        changedPeople = true;
      }
    }
  }

  // 3) Persist + refresh UI (kun hvis endret)
  if (changedVisited && typeof saveVisited === "function") saveVisited();
  if (changedPeople  && typeof savePeople  === "function") savePeople();

  // Refresh “nær deg”-liste / galleri / små UI-ting (robust)
  try { window.renderNearbyPlaces?.(); } catch {}
  try { window.renderPeopleGallery?.(); } catch {}

  // Oppdater mini-profil osv.
  window.dispatchEvent(new Event("updateProfile"));
}

function saveMerits() {
  localStorage.setItem("merits_by_category", JSON.stringify(merits));
}

window.saveMerits = saveMerits;

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
  open:       document.getElementById("openToggle"),

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
// GEO STATUS UI (lytter på pos.js / hg:geo)
// ==============================
window.addEventListener("hg:geo", (e) => {
  const st = e.detail?.status;
  const icon = document.getElementById("geoStatus");
  if (!icon) return;

  icon.classList.remove("geo-ok","geo-bad","geo-unknown");

  if (st === "granted" || st === "test") {
    icon.classList.add("geo-ok");
    icon.textContent = "✅";
  } else if (st === "blocked" || st === "unsupported") {
    icon.classList.add("geo-bad");
    icon.textContent = "⛔";
  } else {
    icon.classList.add("geo-unknown");
    icon.textContent = "…";
  }
});

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
  if (c.includes("naeringsliv") || c.includes("industri") || c.includes("naring")|| c.includes("arbeid")) return "#ff8800";
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
  if (c.includes("naeringsliv") || c.includes("industri") || c.includes("naering") || c.includes("arbeid")) return "naeringsliv";
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
  if (t.includes("naeringsliv") || t.includes("industri") || t.includes("naering")|| t.includes("arbeid")) return "naeringsliv";
  if (t.includes("psykologi") || t.includes("mental") || t.includes("sinn") || t.includes("klinisk")) return "psykologi"; // ← NY

  return "vitenskap";
}

// Bridge for visningsnavn
function catIdFromDisplay(name = "") {
  // Canonical: naeringsliv
  const id = tagToCat(name);
  return id === "naering" ? "naeringsliv" : id;
}


// ==============================
// 4. GEO OG AVSTANDSBEREGNING
// ==============================
function distMeters(a, b) {
  const aLat = Number(a?.lat);
  const aLon = Number(a?.lon);
  const bLat = Number(b?.lat);
  const bLon = Number(b?.lon);

  if (![aLat, aLon, bLat, bLon].every(Number.isFinite)) return Infinity;

  const R = 6371e3;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const la1 = toRad(aLat);
  const la2 = toRad(bLat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}



  
// ==============================
// 7. LISTEVISNINGER
// ==============================
function renderNearbyPlaces() {
  if (!el.list) return;

  const pos = (typeof window.getPos === "function") ? window.getPos() : null;

  const sorted = PLACES
    .map(p => ({
      ...p,
      _d: pos ? Math.round(distMeters(pos, { lat: p.lat, lon: p.lon })) : null
    }))
    .sort((a, b) => (a._d ?? 1e12) - (b._d ?? 1e12));

  const q = (window.HG_NEARBY_QUERY || "").trim().toLowerCase();
  const filtered = q
    ? sorted.filter(p => String(p.name || "").toLowerCase().includes(q))
    : sorted;

  el.list.innerHTML = filtered.map(renderPlaceCard).join("");
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

window.renderNearbyPlaces = renderNearbyPlaces;

// ✅ API: bruk denne fra "Se kart" osv. for å skjule/vis hele panelet
window.setNearbyCollapsed = function (hidden) {
  const container = document.getElementById("nearbyListContainer");
  if (!container) return;

  container.classList.toggle("is-hidden", !!hidden);
};

// =====================================================
// PLACE CARD – collapse/expand/toggle (global API)
// =====================================================
window.setPlaceCardCollapsed = function (collapsed) {
  const pc = document.getElementById("placeCard");
  if (!pc) return;

  pc.classList.toggle("is-collapsed", !!collapsed);
  document.body.classList.toggle("pc-collapsed", !!collapsed);
};

window.collapsePlaceCard = function () {
  window.setPlaceCardCollapsed(true);
};

window.expandPlaceCard = function () {
  window.setPlaceCardCollapsed(false);
};

window.togglePlaceCard = function () {
  window.setPlaceCardCollapsed(!document.body.classList.contains("pc-collapsed"));
};

// Klikk på “handle-stripen” (øverste ~26px av placeCard) toggler
document.addEventListener("click", (e) => {
  const pc = document.getElementById("placeCard");
  if (!pc) return;

  // bare hvis du faktisk klikker på placeCard
  const inside = e.target.closest?.("#placeCard");
  if (!inside) return;

  const r = pc.getBoundingClientRect();
  const y = e.clientY - r.top;

  // handle-område (juster ved behov)
  if (y >= 0 && y <= 26) {
    e.preventDefault();
    window.togglePlaceCard();
  }
});

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
const data = await fetch("data/badges.json", { cache: "no-store" }).then(r => r.json());
BADGES = Array.isArray(data?.badges) ? data.badges : [];
  } catch {
    BADGES = [];
  }
}


// ------------------------------------------------------------
// CIVICATION: Jobbtilbud (offers) lagres i localStorage
// ------------------------------------------------------------
function hgGetJobOffers() {
  try {
    const raw = JSON.parse(localStorage.getItem("hg_job_offers_v1") || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function hgSetJobOffers(arr) {
  try {
    localStorage.setItem("hg_job_offers_v1", JSON.stringify(arr || []));
  } catch {}
}

function hgPushJobOffer(badge, tier, newPoints) {
  if (!badge || !tier) return;

  const badgeId = String(badge.id || "").trim();
  const badgeName = String(badge.name || "").trim();
  const title = String(tier.label || "").trim();
  const thr = Number(tier.threshold);

  if (!badgeId || !title || !Number.isFinite(thr)) return;

  const offerKey = `${badgeId}:${thr}`;
  const offers = hgGetJobOffers();

  // Ikke lag samme tilbud flere ganger
  if (offers.some(o => o && o.offer_key === offerKey)) return;

  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dager

  offers.unshift({
    offer_key: offerKey,
    career_id: badgeId,
    career_name: badgeName,
    title,
    threshold: thr,
    points_at_offer: Number(newPoints || 0),
    status: "pending",         // pending | accepted | declined | expired
    created_iso: now.toISOString(),
    expires_iso: expires.toISOString()
  });

  hgSetJobOffers(offers);
}


// Wrapper: ny signatur (badge, nextTier, newPoints) -> gammel signatur (badgeId, oldPoints, newPoints)
async function maybeCreateJobOfferFromMerits(badge, nextTier, newPoints) {
  const badgeId = String(badge?.id || "").trim();
  if (!badgeId) return null;

  // Vi trenger oldPoints for din gamle funksjon.
  // Hent fra merits_by_category (samme kilde som resten av appen)
  const merits = (() => {
    try { return JSON.parse(localStorage.getItem("merits_by_category") || "{}"); }
    catch { return {}; }
  })();

  const oldPoints = Number(merits?.[badgeId]?.points || 0);
  // NB: her vil oldPoints typisk allerede være "newPoints" hvis du kaller etter at du har økt poeng.
  // Derfor: bruk prev fra updateMeritLevel isteden hvis du har det tilgjengelig.
  // Men siden du allerede har prev i updateMeritLevel: vi løser det i steg 3 under.

  return maybeCreateJobOfferFromMerits_OLD(badgeId, oldPoints, newPoints);
}

// Gi nytt navn til din eksisterende funksjon:
function maybeCreateJobOfferFromMerits_OLD(badgeId, oldPoints, newPoints) {
  // ... lim inn hele din eksisterende funksjon her uendret ...
}

function maybeCreateJobOfferFromMerits(badgeId, oldPoints, newPoints) {
  const LS_OFFERS = "hg_job_offers_v1";
  const LS_ACTIVE = "hg_active_position_v1";

  const bId = String(badgeId || "").trim();
  const oldP = Number(oldPoints || 0);
  const newP = Number(newPoints || 0);
  if (!bId || !Number.isFinite(oldP) || !Number.isFinite(newP)) return null;
  if (newP <= oldP) return null;

  // --- finn badge + tiers ---
  const badge = Array.isArray(window.BADGES)
    ? window.BADGES.find(b => String(b?.id || "").trim() === bId)
    : null;

  const tiers = Array.isArray(badge?.tiers) ? badge.tiers : [];
  if (!tiers.length) return null;

  // --- finn hvilke tiers du akkurat passerte (kan være flere) ---
  // vi tilbyr den HØYESTE tier-en du krysset i dette steget
  let crossed = null;
  for (const t of tiers) {
    const thr = Number(t?.threshold || 0);
    if (!Number.isFinite(thr) || thr <= 0) continue;

    if (oldP < thr && newP >= thr) {
      crossed = t; // behold siste -> høyeste i rekkefølgen
    }
  }
  if (!crossed) return null;

  const title = String(crossed.label || "").trim();
  const threshold = Number(crossed.threshold || 0);

  if (!title || !Number.isFinite(threshold) || threshold <= 0) return null;

  // --- ikke tilby hvis du allerede er i akkurat den jobben ---
  let active = null;
  try {
    active = JSON.parse(localStorage.getItem(LS_ACTIVE) || "null");
  } catch {}
  const activeCareer = String(active?.career_id || "").trim();
  const activeTitle  = String(active?.title || "").trim();
  if (activeCareer === bId && activeTitle === title) return null;

  // --- last offers ---
  let offers = [];
  try {
    const raw = JSON.parse(localStorage.getItem(LS_OFFERS) || "[]");
    offers = Array.isArray(raw) ? raw : [];
  } catch {
    offers = [];
  }

  // --- dedupe: samme badge + samme title skal aldri tilbys igjen ---
  const offerId = `offer:${bId}:${title}`; // stabil id
  const existing = offers.find(o => o && o.id === offerId);
  if (existing) return null;

  // --- lag offer ---
  const now = new Date();
  const exp = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 dager

  const offer = {
    id: offerId,
    status: "pending",                 // pending | accepted | declined | expired
    created_iso: now.toISOString(),
    expires_iso: exp.toISOString(),

    career_id: bId,                    // f.eks "naeringsliv"
    career_name: String(badge?.name || bId),
    title: title,                      // tier label
    threshold: threshold
  };

  offers.unshift(offer);

  // liten cap så LS ikke svulmer
  if (offers.length > 50) offers = offers.slice(0, 50);

  try {
    localStorage.setItem(LS_OFFERS, JSON.stringify(offers));
  } catch {}

  return offer;
}




// Oppdater "stilling" ved ny poengsum (tiers = karrierestige)
async function updateMeritLevel(cat, oldPoints, newPoints) {
  await ensureBadgesLoaded();

  const catId = String(cat || "").trim();
  const badge = BADGES.find(b => String(b?.id || "").trim() === catId);
  if (!badge || !Array.isArray(badge.tiers) || !badge.tiers.length) return;

  const prev = deriveTierFromPoints(badge, Number(oldPoints || 0));
  const next = deriveTierFromPoints(badge, Number(newPoints || 0));

  // Bare gjør noe hvis du faktisk rykker opp i "stilling"
  if ((next.tierIndex ?? 0) <= (prev.tierIndex ?? 0)) return;

  // tiers.label er nå stillingstittel
  const newTitle = String(next.label || "").trim() || "Ny stilling";

  // 1) UI feedback
  showToast(`💼 Ny stilling i ${badge.name}: ${newTitle}!`);
  pulseBadge(badge.name);

// 2) Lag jobbtilbud (offers) – aktiv rolle settes først ved "Aksepter" på profilen
await maybeCreateJobOfferFromMerits_OLD(badge.id, oldPoints, newPoints);

}

  
// Poengsystem – +1 poeng per fullført quiz
async function addCompletedQuizAndMaybePoint(categoryDisplay, quizId) {
  const categoryId = catIdFromDisplay(categoryDisplay);
  const canonicalCategoryId =
  categoryId === "naering" ? "naeringsliv" : categoryId;
  const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  progress[canonicalCategoryId] = progress[canonicalCategoryId] || { completed: [] };

if (progress[canonicalCategoryId].completed.includes(quizId)) return;

progress[canonicalCategoryId].completed.push(quizId);
localStorage.setItem("quiz_progress", JSON.stringify(progress));

const badgeId = canonicalCategoryId;  if (!badgeId) return;

  window.merits = window.merits || {};
  window.merits[badgeId] = window.merits[badgeId] || { points: 0 };

  const oldPoints = Number(window.merits[badgeId].points || 0);
  window.merits[badgeId].points += 1;

  // Optional: fjern gammel lagret level hvis den finnes (rydder støy)
  if ("level" in window.merits[badgeId]) delete window.merits[badgeId].level;

  if (typeof window.saveMerits === "function") window.saveMerits();

  const newPoints = Number(window.merits[badgeId].points || 0);
  updateMeritLevel(badgeId, oldPoints, newPoints);

  showToast(`🏅 +1 poeng i ${badgeId}!`);
  window.dispatchEvent(new Event("updateProfile"));}

// ==============================
// 9. HENDELSER (CLICK-DELEGATION) OG SHEETS
// ==============================
function openSheet(sheet) {
  sheet?.setAttribute("aria-hidden", "false");
}
function closeSheet(sheet) {
  sheet?.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", e => {
  const target = e.target;

  // --- PlaceCard: toggle icon lists (people / nature / badges) ---
  const toggleBtn = target.closest?.("[data-toggle]");
  if (toggleBtn) {
    const type = toggleBtn.dataset.toggle;

    const map = {
      people: "pcPeopleList",
      nature: "pcNatureList",
      badges: "pcBadgesList"
    };

    const listId = map[type];
    if (listId) {
      document.getElementById(listId)?.classList.toggle("is-open");
    }

    e.preventDefault();
    return;
  }

  // --- Åpne sted fra kort (data-open) ---
  const openEl = target.closest?.("[data-open]");
  const openId = openEl?.getAttribute("data-open");

  if (openId) {
    const p = PLACES.find(x => x.id === openId);
    if (p) openPlaceCard(p);
    return;
  }

  // --- Mer info (Google) ---
  const infoName = target.getAttribute?.("data-info");
  if (infoName) {
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(infoName + " Oslo")}`,
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
  return;
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

function deriveTierFromPoints(badge, points) {
  const tiers = Array.isArray(badge?.tiers) ? badge.tiers : [];
  const p = Number(points || 0);

  if (!tiers.length) {
    return { tierIndex: -1, label: "Nybegynner" };
  }

  let tierIndex = 0;
  let label = String(tiers[0].label || "Nybegynner").trim() || "Nybegynner";

  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    const thr = Number(t.threshold || 0);
    if (p >= thr) {
      tierIndex = i;
      label = String(t.label || "").trim() || label;
    }
  }

  return { tierIndex, label };
}


async function handleBadgeClick(badgeEl) {
  const badgeId = badgeEl.getAttribute("data-badge-id");
  const modal = document.getElementById("badgeModal");
  if (!badgeId || !modal) return;

  await ensureBadgesLoaded();
  const badge = BADGES.find(b => String(b.id || "").trim() === String(badgeId || "").trim());
  if (!badge) return;

  const localMerits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
const info =
  localMerits[String(badge.id || "").trim()] ||
  { points: 0 };


  const points = Number(info.points || 0);
  const { label } = deriveTierFromPoints(badge, points);

  const imgEl   = modal.querySelector(".badge-img");
  const titleEl = modal.querySelector(".badge-title");
  const levelEl = modal.querySelector(".badge-level");
  const textEl  = modal.querySelector(".badge-progress-text");
  const barEl   = modal.querySelector(".badge-progress-bar");

  if (imgEl)  imgEl.src = (badge.image || badge.icon || badge.img || badge.imageCard || "");
  if (titleEl) titleEl.textContent = badge.name;

  // Kanonisk: vis nivå ut fra tiers+points (ikke lagret level-tekst)
  if (levelEl) levelEl.textContent = label || "Nybegynner";
  if (textEl)  textEl.textContent = `${points} poeng`;

  // Progressbar
  if (barEl && Array.isArray(badge.tiers) && badge.tiers.length) {
    const max = Number(badge.tiers[badge.tiers.length - 1].threshold || 1);
    const pct = Math.max(0, Math.min(100, (points / Math.max(1, max)) * 100));
    barEl.style.width = `${pct}%`;
  } else if (barEl) {
    barEl.style.width = "0%";
  }

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  const closeBtn = modal.querySelector(".close-btn");
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    };
  }
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

function getPlaceCardEl() {
  return document.getElementById("placeCard");
}

function isPlaceCardCollapsed() {
  return !!getPlaceCardEl()?.classList.contains("is-collapsed");
}

function collapsePlaceCard() {
  const pc = getPlaceCardEl();
  if (!pc) return;
  pc.classList.add("is-collapsed");
  document.body.classList.add("pc-collapsed");
  try { localStorage.setItem("hg_placecard_collapsed_v1", "1"); } catch {}
  if (window.HGMap?.resize) HGMap.resize();
  if (window.MAP?.resize) window.MAP.resize();
}

function expandPlaceCard() {
  const pc = getPlaceCardEl();
  if (!pc) return;
  pc.classList.remove("is-collapsed");
  document.body.classList.remove("pc-collapsed");
  try { localStorage.setItem("hg_placecard_collapsed_v1", "0"); } catch {}
  if (window.HGMap?.resize) HGMap.resize();
  if (window.MAP?.resize) window.MAP.resize();
}

function togglePlaceCard() {
  if (isPlaceCardCollapsed()) expandPlaceCard();
  else collapsePlaceCard();
}

function initPlaceCardCollapse() {
  const pc = getPlaceCardEl();
  if (!pc) return;

  // restore
  const saved = (() => {
    try { return localStorage.getItem("hg_placecard_collapsed_v1") === "1"; }
    catch { return false; }
  })();
  if (saved) collapsePlaceCard();

  // Klikk på handle-stripen (øverst i placeCard) toggler
  pc.addEventListener("click", (e) => {
    // Bare toggle når du klikker helt øverst (handle-området)
    const rect = pc.getBoundingClientRect();
    const y = e.clientY - rect.top;
    if (y <= 32) {
      e.preventDefault();
      togglePlaceCard();
    }
  });
}

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

// === LEFTPANEL TABS (Rad 1) ===
(function bindLeftPanelTabs(){
  const sel = document.getElementById("leftPanelMode");
  if (!sel) return;

  document.querySelectorAll(".nearby-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-leftmode") || "nearby";
      sel.value = mode;

      // trigger eksisterende change-logikk
      sel.dispatchEvent(new Event("change", { bubbles: true }));

      // aktiv-state visuelt
      document.querySelectorAll(".nearby-tab").forEach(b => {
        b.classList.toggle("is-active", b === btn);
      });
    });
  });
})();

// === SEARCH (Rad 1) – lagrer query og ber om rerender ===
(function bindNearbySearch(){
  const inp = document.getElementById("nearbySearch");
  if (!inp) return;

  window.HG_NEARBY_QUERY = window.HG_NEARBY_QUERY || "";

  inp.addEventListener("input", (e) => {
    window.HG_NEARBY_QUERY = (e.target.value || "").trim().toLowerCase();

    // be pos.js om å rerendre om den har en funksjon
    window.renderNearbyPlaces?.();
  });
})();


// Toggle placeCard ved klikk på bunnstripen
function wirePlaceCardCollapseTapToExpand() {
  const pc = document.getElementById("placeCard");
  if (!pc) return;

  pc.addEventListener("click", (e) => {
    const t = e.target;
    if (t && (t.closest("button") || t.closest("a"))) return;

    const collapsed = pc.classList.contains("is-collapsed");
    window.setPlaceCardCollapsed?.(!collapsed); // ✅ toggle
  });
}

// ==============================
// 10. INITIALISERING OG BOOT
// ==============================
function wire() {
  // Testmodus
  el.open?.addEventListener("change", (e) => {
  const on = !!e.target.checked;

  window.OPEN_MODE = on;
  localStorage.setItem("HG_OPEN_MODE", on ? "1" : "0");
  
  const btnUA = document.getElementById("btnUnlockAll");
  if (btnUA) btnUA.style.display = on ? "inline-flex" : "none";

  window.renderNearbyPlaces?.();
}); 

  document.getElementById("btnUnlockAll")?.addEventListener("click", () => {
  if (!window.OPEN_MODE) return;
  applyOpenModeUnlockAll();
  showToast("Alt åpnet");
});


  // Sikteknapp (center)
  el.btnCenter?.addEventListener("click", () => {
    const pos = (typeof window.getPos === "function") ? window.getPos() : null;

    const map =
      window.MAP ||
      window.HGMap?.getMap?.() ||
      window.HGMap?.map ||
      null;

    if (pos && map?.flyTo) {
      map.flyTo({ center: [pos.lon, pos.lat], zoom: 16 });
      showToast("Sentrerer på deg");
      return;
    }

    showToast(pos ? "Kart ikke klart ennå…" : "Henter posisjon…");
    requestLocation();
  });

  // ✅ gjør placeCard-klikk aktivt (tap stripen → expand)
  wirePlaceCardCollapseTapToExpand();
}

// =====================================================
// POSISJON – ÉN SANNHET (HG_POS) + API for resten av appen
// =====================================================



function requestLocation() {
  window.HG_ENV = window.HG_ENV || {};
  window.HG_ENV.geo = "unknown";

  // vis steder med "–" mens vi venter
  if (typeof renderNearbyPlaces === "function") renderNearbyPlaces();

  // pro: delegér alt til pos.js
  if (window.HGPos?.request) return window.HGPos.request();

  console.warn("[geo] HGPos.request mangler (pos.js ikke lastet?)");
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
     0.5) Aktiv stilling (fra karriere/merker)
  ------------------------------------- */
  let pos = null;
  try {
    pos = JSON.parse(localStorage.getItem("hg_active_position_v1") || "null");
  } catch {}

  // Lag/oppdater en egen linje under miniStats uten å være avhengig av HTML-endringer
  let posEl = document.getElementById("miniPositionLine");
  if (!posEl) {
    posEl = document.createElement("div");
    posEl.id = "miniPositionLine";
    posEl.className = "mini-position-line";
    // minimal styling (kan flyttes til CSS senere)
    posEl.style.fontSize = "12px";
    posEl.style.opacity = "0.92";
    posEl.style.marginTop = "2px";
    posEl.style.whiteSpace = "nowrap";
    posEl.style.overflow = "hidden";
    posEl.style.textOverflow = "ellipsis";

    // sett inn rett etter stats-linja
    st.insertAdjacentElement("afterend", posEl);
  }

  if (pos && pos.title) {
    const careerName = pos.career_name || pos.career_id || "Karriere";
    posEl.textContent = `💼 ${pos.title} · ${careerName}`;
    posEl.style.display = "";
  } else {
    posEl.style.display = "none";
  }
  
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



window.addEventListener("hg:mpNextUp", (e) => {
  const mount = document.getElementById("mpNextUp");
  if (!mount) return;

  const tri = e.detail?.tri || {};
  const becauseLine = e.detail?.becauseLine || "";

// Persistér "Fordi" til profilsiden
try {
  localStorage.setItem("hg_nextup_because", String(becauseLine || ""));
  localStorage.setItem("hg_nextup_tri", JSON.stringify(tri || {}));
} catch {}
  
  const spatial = tri.spatial || null;
  const narrative = tri.narrative || null;
  const concept = tri.concept || null;
  const wk = tri.wk || null; // ✅ Wonderkammer NextUp (valgfri)

  mount.innerHTML = `
  <div class="mp-nextup-line">
    <button class="mp-nextup-link" data-mp="goto"
      ${spatial ? `data-place="${hgEscAttr(spatial.place_id)}"` : "disabled"}>
      🧭 <b>Neste Sted:</b> ${spatial ? hgEsc(spatial.label) : "—"}
    </button>
  </div>

  <div class="mp-nextup-line">
    <button class="mp-nextup-link" data-mp="wk"
      ${wk ? `data-wk="${hgEscAttr(wk.entry_id)}" title="${hgEscAttr(wk.because || "")}"` : "disabled"}>
      🗃️ <b>Wonderkammer:</b> ${wk ? hgEsc(wk.label) : "—"}
    </button>
  </div>

  <div class="mp-nextup-line">
    <button class="mp-nextup-link" data-mp="story"
      ${narrative ? `data-nextplace="${hgEscAttr(narrative.next_place_id)}"` : "disabled"}>
      📖 <b>Neste Scene:</b> ${narrative ? hgEsc(narrative.label) : "—"}
    </button>
  </div>

  <div class="mp-nextup-line">
    <button class="mp-nextup-link" data-mp="emne"
      ${concept ? `data-emne="${hgEscAttr(concept.emne_id)}"` : "disabled"}>
      🧠 <b>Forstå:</b> ${concept ? hgEsc(concept.label) : "—"}
    </button>
  </div>

`;

    mount.querySelectorAll("[data-mp]").forEach((btn) => {
    btn.onclick = () => {
      const t = btn.dataset.mp;

      if (t === "goto") {
        const id = btn.dataset.place;
        if (!id) return;
        const pl = (window.PLACES || []).find(x => String(x.id) === String(id));
        if (pl) return window.openPlaceCard?.(pl);
        return window.showToast?.("Fant ikke stedet");
      }

      if (t === "wk") {
        const id = btn.dataset.wk;
        if (!id) return;

        // Åpne Wonderkammer-entry
        if (window.Wonderkammer && typeof window.Wonderkammer.openEntry === "function") {
          window.Wonderkammer.openEntry(id);
        } else if (typeof window.openWonderkammerEntry === "function") {
          window.openWonderkammerEntry(id);
        } else {
          console.warn("[mpNextUp] No Wonderkammer open handler found for", id);
          window.showToast?.("Fant ikke Wonderkammer-visning");
        }
        return;
      }

      
      if (t === "story") {
        const nextId = btn.dataset.nextplace;
        if (!nextId) return;
        const pl = (window.PLACES || []).find(x => String(x.id) === String(nextId));
        if (pl) return window.openPlaceCard?.(pl);
        return window.showToast?.("Fant ikke neste kapittel-sted");
      }

      if (t === "emne") {
        const emneId = btn.dataset.emne;
        if (!emneId) return;
        window.location.href = `knowledge_by.html#${encodeURIComponent(emneId)}`;
      }
    };
  });
});

function hgEsc(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function hgEscAttr(s){
  return hgEsc(s).replaceAll("\n", " ").trim();
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
  document.getElementById("linkPlaces")?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    enterMapMode();
    showToast("Viser steder på kartet");
  });

  document.getElementById("linkBadges")?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    window.location.href = "profile.html#userBadgesGrid";
  });

  document.getElementById("linkQuiz")?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    showQuizHistory();
  });
}


async function loadNature() {
  try {
    const r1 = await fetch("data/nature/flora.json", { cache: "no-store" });
    window.FLORA = r1.ok ? await r1.json() : [];
  } catch { window.FLORA = []; }

  try {
    const r2 = await fetch("data/nature/fauna.json", { cache: "no-store" });
    window.FAUNA = r2.ok ? await r2.json() : [];
  } catch { window.FAUNA = []; }
}




// BOOT

// ============================================================
// Epoker – runtime index (robust, ikke skjør)
// ============================================================

function epArr(x) { return Array.isArray(x) ? x : []; }
function epS(x) { return String(x ?? "").trim(); }
function epN(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v : null;
}
function epKey(domain, id) {
  const d = epS(domain);
  const i = epS(id);
  return d && i ? `${d}:${i}` : "";
}

// Støtter flere schema-varianter uten å kreve kanonisk format:
// - id / epoke_id
// - start_year / start / from
// - end_year / end / to
function buildEpokerRuntimeIndex(epokerByDomain) {
  const idx = {
    byKey: Object.create(null),       // "domain:id" -> epoke
    byDomain: Object.create(null),    // domain -> { list, byId, byStart }
    all: []                           // flat liste (med domain)
  };

  const input = epokerByDomain && typeof epokerByDomain === "object" ? epokerByDomain : {};

  for (const [domainRaw, rawList] of Object.entries(input)) {
    const domain = epS(domainRaw);
    if (!domain) continue;

    const list = epArr(rawList);

    const dom = {
      list: [],
      byId: Object.create(null),      // id -> epoke (innen domain)
      byStart: []
    };

    for (const e of list) {
      const id = epS(e?.id || e?.epoke_id);
      if (!id) continue;

      const start =
        epN(e?.start_year) ?? epN(e?.start) ?? epN(e?.from) ?? null;

      const end =
        epN(e?.end_year) ?? epN(e?.end) ?? epN(e?.to) ?? null;

      const ep = { ...(e || {}), id, domain, start_year: start, end_year: end };

      dom.list.push(ep);
      dom.byId[id] = ep;

      const k = epKey(domain, id);
      if (k) {
        // Unngå silent overwrite hvis du vil: legg en DEBUG-warn her
        idx.byKey[k] = ep;
      }

      idx.all.push(ep);
    }

    dom.byStart = dom.list
      .slice()
      .sort((a, b) => {
        const A = a.start_year ?? 999999;
        const B = b.start_year ?? 999999;
        return A - B;
      });

    idx.byDomain[domain] = dom;
  }

  return idx;
}

// Små helpers
function getEpoke(domain, epokeId) {
  const d = epS(domain);
  const id = epS(epokeId);
  if (!id) return null;

  // 1) Strict: domain + id
  const k = epKey(d, id);
  if (k && window.EPOKER_INDEX?.byKey?.[k]) return window.EPOKER_INDEX.byKey[k];

  // 2) Fallback: hvis domain finnes, slå opp i domain-index
  if (d && window.EPOKER_INDEX?.byDomain?.[d]?.byId?.[id]) {
    return window.EPOKER_INDEX.byDomain[d].byId[id];
  }

  return null;
}

// ✅ Epoker: hvilke domener/merker som har epoke-fil
// Nøkkelen (domain) må matche det du bruker ellers: "film", "tv", "sport", osv.
const EPOKER_FILES = {
  historie:       "data/epoker_historie.json",
  vitenskap:      "data/epoker_vitenskap.json",
  kunst:          "data/epoker_kunst.json",
  by:             "data/epoker_by.json",
  musikk:         "data/epoker_musikk.json",
  litteratur:     "data/epoker_litteratur.json",
  natur:          "data/epoker_natur.json",
  sport:          "data/epoker_sport.json",
  politikk:       "data/epoker_politikk.json",
  naeringsliv:    "data/epoker_naeringsliv.json",
  populaerkultur: "data/epoker_populaerkultur.json",
  subkultur:      "data/epoker_subkultur.json",
  film_tv:        "data/epoker_film_tv.json",
  teater:         "data/epoker_teater.json",
  media:          "data/epoker_media.json",
  psykologi:      "data/epoker_psykologi.json",
};

async function boot() {
    // ✅ OpenModus (betalingsmodus) – må settes tidlig
  window.OPEN_MODE = localStorage.getItem("HG_OPEN_MODE") === "1";
  const openEl = document.getElementById("openToggle");
  if (openEl) openEl.checked = window.OPEN_MODE;

  // ✅ "Åpne alt"-knapp: riktig synlighet ved reload
  const btnUA = document.getElementById("btnUnlockAll");
  if (btnUA) btnUA.style.display = window.OPEN_MODE ? "inline-flex" : "none";

  // Init map + ...
  // Init map + eksponer global MAP (routes.js forventer MAP)
  const map = window.HGMap?.initMap({ containerId: "map", start: START });
if (map) {
  MAP = map;        // ← viktig: lokal variabel i app.js
  window.MAP = map; // ← viktig: global for routes.js
}

  // Eksponer START globalt (routes.js bruker START som fallback)
  window.START = START;

  try {
    const [places, people, relations, wonderkammer, tags] = await Promise.all([
  fetch("data/places.json", { cache: "no-store" }).then(r => r.json()),
  fetch("data/people.json", { cache: "no-store" }).then(r => r.json()),
  fetch("data/relations.json", { cache: "no-store" }).then(r => r.json()).catch(() => []),
  fetch("data/wonderkammer.json", { cache: "no-store" }).then(r => r.json()).catch(() => null),
  fetch("data/tags.json", { cache: "no-store" }).then(r => r.json()).catch(() => null),
]);

  PLACES = places;
  PEOPLE = people;

window.PLACES = PLACES;
window.PEOPLE = PEOPLE;

RELATIONS = Array.isArray(relations) ? relations : [];
window.RELATIONS = RELATIONS;

// ✅ RELATIONS-indekser (runtime)
window.REL_BY_PLACE = Object.create(null);
window.REL_BY_PERSON = Object.create(null);

for (const r of (window.RELATIONS || [])) {
  const place = String(r.place || "").trim();
  const person = String(r.person || "").trim();

  if (place) (window.REL_BY_PLACE[place] ||= []).push(r);
  if (person) (window.REL_BY_PERSON[person] ||= []).push(r);
}

// ✅ EPOKER (runtime) – last alle epoker per merke/domain via registry
let epokerByDomain = {};
try {
  const pairs = await Promise.all(
    Object.entries(EPOKER_FILES).map(async ([domain, url]) => {
      const data = await fetch(url, { cache: "no-store" })
        .then(r => r.json())
        .catch(() => []);
      return [domain, Array.isArray(data) ? data : []];
    })
  );
  epokerByDomain = Object.fromEntries(pairs);
} catch (e) {
  console.warn("[epoker] fetch feilet:", e);
  epokerByDomain = {};
}

window.EPOKER = epokerByDomain;

try {
  window.EPOKER_INDEX = buildEpokerRuntimeIndex(window.EPOKER);
  window.getEpoke = getEpoke; // eksponer helper (valgfritt)
} catch (e) {
  console.warn("[epoker] buildEpokerRuntimeIndex feilet:", e);
  window.EPOKER_INDEX = { byKey: Object.create(null), byDomain: Object.create(null), all: [] };
}
    
// ✅ WONDERKAMMER (connections) – separat fra relations
window.WONDERKAMMER = (wonderkammer && typeof wonderkammer === "object") ? wonderkammer : null;

// Runtime-indekser: WK_BY_PLACE / WK_BY_PERSON
window.WK_BY_PLACE = Object.create(null);
window.WK_BY_PERSON = Object.create(null);

if (window.WONDERKAMMER) {
  // Støtter både:
  //  A) { places:[{ place:"id", chambers:[] }], people:[{ person:"id", chambers:[] }] }
  //  B) { places:[{ place_id:"id", chambers:[] }], people:[{ person_id:"id", chambers:[] }] }
  const wkPlaces = Array.isArray(window.WONDERKAMMER.places) ? window.WONDERKAMMER.places : [];
  const wkPeople = Array.isArray(window.WONDERKAMMER.people) ? window.WONDERKAMMER.people : [];

  for (const row of wkPlaces) {
    const pid = String(row?.place || row?.place_id || "").trim();
    if (!pid) continue;
    window.WK_BY_PLACE[pid] = Array.isArray(row?.chambers) ? row.chambers : [];
  }

  for (const row of wkPeople) {
    const per = String(row?.person || row?.person_id || "").trim();
    if (!per) continue;
    window.WK_BY_PERSON[per] = Array.isArray(row?.chambers) ? row.chambers : [];
    window.WK_PLACE_DOC = window.WK_PLACE_DOC || Object.create(null);
    window.WK_PLACE_DOC[pid] = row;
  }
}
    
TAGS_REGISTRY = tags || {};

if (window.HGAuditMissingImages) {
  HGAuditMissingImages.run({ people: PEOPLE, places: PLACES });
}

if (typeof linkPeopleToPlaces === "function") {
  linkPeopleToPlaces();
} else {
  if (DEBUG) console.warn("linkPeopleToPlaces() mangler – hopper over linking");
}

await loadNature();

window.API = window.API || {};
window.API.addCompletedQuizAndMaybePoint = (...args) => addCompletedQuizAndMaybePoint(...args);
    
// ✅ INIT QUIZ-MODUL (ETTER at PLACES/PEOPLE er lastet)
if (window.QuizEngine) {
  QuizEngine.init({
    getPersonById: id => PEOPLE.find(p => p.id === id),
    getPlaceById:  id => PLACES.find(p => p.id === id),

    getVisited: () => visited,
    isTestMode: () => !!window.OPEN_MODE,

    showToast,

    // progression / rewards
    addCompletedQuizAndMaybePoint: (...args) => {
  // 1) kjør eksisterende progresjon (den fungerer allerede siden du har "3 quiz fullført")
  addCompletedQuizAndMaybePoint(...args);

  // 2) prøv å finne en ID i args som matcher et sted eller en person
  let foundId = null;
  for (const a of args) {
    if (a == null) continue;
    const s = String(a);
    if (!s) continue;

    // match sted først
    if (PLACES?.some(p => String(p.id) === s)) { foundId = s; break; }
    // ellers match person
    if (PEOPLE?.some(p => String(p.id) === s)) { foundId = s; break; }
  }

  if (!foundId) return;

  // 3) unlock sted/person basert på ID
  if (PLACES?.some(p => String(p.id) === foundId)) {
    saveVisitedFromQuiz(foundId);
    return;
  }

  if (PEOPLE?.some(p => String(p.id) === foundId)) {
    peopleCollected[foundId] = true;
    savePeople();
    window.dispatchEvent(new Event("updateProfile"));
  }
},

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
    saveVisitedFromQuiz: (placeId) => {
      saveVisitedFromQuiz(placeId);
    },
      dispatchProfileUpdate: () => window.dispatchEvent(new Event("updateProfile")),

    // ✅ hooks (kun ved riktige svar)
    saveKnowledgeFromQuiz: window.saveKnowledgeFromQuiz || null,
    saveTriviaPoint: window.saveTriviaPoint || null
  });
} else {
if (DEBUG) console.warn("QuizEngine ikke lastet");
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
  if (DEBUG) console.error("[DEBUG] fetch/data-payload feilet", e?.stack || e);
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

  safeRun("civicationPulse", async () => {
    await window.HG_CiviEngine?.onAppOpen?.();
    window.renderCivicationInbox?.();
    window.dispatchEvent(new Event("updateProfile"));
  });

  safeRun("initMiniProfile", initMiniProfile);
  safeRun("wireMiniProfileLinks", wireMiniProfileLinks);
  safeRun("initLeftPanel", initLeftPanel);
  safeRun("initPlaceCardCollapse", initPlaceCardCollapse);
});

function safeRun(label, fn) {
  try {
    const out = fn();
    // ✅ hvis fn er async / returnerer Promise
    if (out && typeof out.then === "function") {
      out.catch((e) => {
        console.error(`[${label}]`, e);
        if (DEBUG) window.__HG_LAST_ERROR__ = { label, message: String(e), stack: e?.stack };
      });
    }
  } catch (e) {
    console.error(`[${label}]`, e);
    if (DEBUG) window.__HG_LAST_ERROR__ = { label, message: String(e), stack: e?.stack };
  }
}



// ==============================
// 12. KARTMODUS
// ==============================
function enterMapMode() {
  document.body.classList.add("map-only"); // kan beholdes hvis du bruker den visuelt

  if (el.btnSeeMap)  el.btnSeeMap.style.display = "none";
  if (el.btnExitMap) el.btnExitMap.style.display = "block";

  // ✅ bare minimer (ingen hide av hele UI)
  window.setPlaceCardCollapsed?.(true);
  window.setNearbyCollapsed?.(true);

  const mapEl = document.getElementById("map");
  if (mapEl) mapEl.style.zIndex = "10";

  window.HGMap?.resize?.();
  window.MAP?.resize?.();

  showToast("Kartmodus");
}

function exitMapMode() {
  document.body.classList.remove("map-only");

  if (el.btnSeeMap)  el.btnSeeMap.style.display = "block";
  if (el.btnExitMap) el.btnExitMap.style.display = "none";

  window.setPlaceCardCollapsed?.(false);
  window.setNearbyCollapsed?.(false);

  const mapEl = document.getElementById("map");
  if (mapEl) mapEl.style.zIndex = "1";

  window.HGMap?.resize?.();
  window.MAP?.resize?.();

  showToast("Tilbake til oversikt");
}

el.btnSeeMap?.addEventListener("click", enterMapMode);
el.btnExitMap?.addEventListener("click", exitMapMode);

window.addEventListener("resize", () => {
  window.MAP?.resize?.();
});


// ==============================
// 14. GLOBALT SØK
// ==============================

function dist(aLat, aLon, bLat, bLon) {
  const R = 6371e3; // meter
  const toRad = d => d * Math.PI / 180;

  const lat1 = Number(aLat), lon1 = Number(aLon);
  const lat2 = Number(bLat), lon2 = Number(bLon);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return Infinity;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const la1 = toRad(lat1);
  const la2 = toRad(lat2);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
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
const pos = (typeof window.getPos === "function") ? window.getPos() : null;
if (pos) {
  places = places.slice().sort((a, b) => {
    const da = dist(pos.lat, pos.lon, a.lat, a.lon);
    const db = dist(pos.lat, pos.lon, b.lat, b.lon);
    return da - db;
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

  const suggestions =
  catStarts
    .map(c => `<div class="search-item" data-category="${c.id}">${badge(c.id)}${c.name}</div>`)
    .concat(
      peopleStarts.map(p => `<div class="search-item" data-person="${p.id}">${badge(p.category)}${p.name}</div>`),
      placesStarts.map(s => `<div class="search-item" data-place="${s.id}">${badge(s.category)}${s.name}</div>`)
    )
    .join("");

  // --- NÆR DEG (når kart er aktivt) ---
  let nearList = "";

const pos = (typeof window.getPos === "function") ? window.getPos() : null;

if (pos) {
  const near = places.slice(0, 3);

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

