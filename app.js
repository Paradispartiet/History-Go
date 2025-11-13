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
// 11. STED-OVERLAY (tekst + personer)
// 12. KARTMODUS
// 13. QUIZ – DYNAMISK LASTER, MODAL & SCORE
// 14. PERSON- OG STED-POPUP
// =====================================================


// ==============================
// 1. KONSTANTER OG INIT-VARIABLER
// ==============================
const START            = { lat: 59.9139, lon: 10.7522, zoom: 13 };
const NEARBY_LIMIT     = 2;
const QUIZ_FEEDBACK_MS = 650;

let PLACES  = [];
let PEOPLE  = [];
let BADGES  = [];

const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

// progress for “+1 poeng per 3 riktige” (reservert)
const userProgress    = JSON.parse(localStorage.getItem("historygo_progress") || "{}");

function saveVisited() {
  localStorage.setItem("visited_places", JSON.stringify(visited));
  renderCollection();
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
  seeMore:    document.getElementById("btnSeeMoreNearby"),
  sheetNear:  document.getElementById("sheetNearby"),
  sheetNearBody: document.getElementById("sheetNearbyBody"),

  collectionGrid:      document.getElementById("collectionGrid"),
  collectionCount:     document.getElementById("collectionCount"),
  btnMoreCollection:   document.getElementById("btnMoreCollection"),
  sheetCollection:     document.getElementById("sheetCollection"),
  sheetCollectionBody: document.getElementById("sheetCollectionBody"),

  gallery: document.getElementById("gallery"),

  // Place Card (sheet)
  pc:       document.getElementById("placeCard"),
  pcTitle:  document.getElementById("pcTitle"),
  pcMeta:   document.getElementById("pcMeta"),
  pcDesc:   document.getElementById("pcDesc"),
  pcUnlock: document.getElementById("pcUnlock"),
  pcRoute:  document.getElementById("pcRoute"),
  pcClose:  document.getElementById("pcClose")
};


// ==============================
// 3. KATEGORIFUNKSJONER
// ==============================
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
// 5. BRUKERPOSISJON OG KART
// ==============================
let MAP, userMarker, userPulse, routeLine, routeControl, placeLayer;
let mapReady = false;
let dataReady = false;

function setUser(lat, lon) {
  if (!MAP) return;
  const pos = [lat, lon];

  if (!userMarker) {
    userMarker = L.circleMarker(pos, {
      radius: 8,
      weight: 2,
      color: "#fff",
      fillColor: "#1976d2",
      fillOpacity: 1
    }).addTo(MAP).bindPopup("Du er her");

    userPulse = L.circle(pos, {
      radius: 25,
      color: "#00e676",
      weight: 1,
      opacity: 0.6,
      fillColor: "#00e676",
      fillOpacity: 0.12
    }).addTo(MAP);
  } else {
    userMarker.setLatLng(pos);
    userPulse.setLatLng(pos);
  }
}

function initMap() {
  if (!el.map) return;

  MAP = L.map("map", { zoomControl: false }).setView(
    [START.lat, START.lon],
    START.zoom
  );
  placeLayer = L.layerGroup().addTo(MAP);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19
    }
  ).addTo(MAP);

  MAP.whenReady(() => {
    mapReady = true;
    if (dataReady) maybeDrawMarkers();

    // Kartet dekker hele skjermen
    const mapEl = document.getElementById("map");
    if (mapEl) {
      mapEl.style.position = "fixed";
      mapEl.style.inset = "0";
      mapEl.style.width = "100%";
      mapEl.style.height = "100%";
      mapEl.style.zIndex = "1";
    }
  });
}

// PEOPLE → PLACES-linking (kun kobling, ingen markører)
function linkPeopleToPlaces() {
  if (!PLACES.length || !PEOPLE.length) return;

  PEOPLE.forEach(person => {
    let linkedPlaces = [];

    if (Array.isArray(person.places) && person.places.length > 0) {
      linkedPlaces = PLACES.filter(p => person.places.includes(p.id));
    } else if (person.placeId) {
      const single = PLACES.find(p => p.id === person.placeId);
      if (single) linkedPlaces.push(single);
    }

    if (!linkedPlaces.length) return;

    linkedPlaces.forEach(lp => {
      lp.people = lp.people || [];
      lp.people.push(person);
    });
  });
}

function showRouteTo(place) {
  if (!MAP || !place) return;

  const from = currentPos
    ? L.latLng(currentPos.lat, currentPos.lon)
    : L.latLng(START.lat, START.lon);
  const to = L.latLng(place.lat, place.lon);

  if (routeLine) {
    MAP.removeLayer(routeLine);
    routeLine = null;
  }

  try {
    if (!L.Routing) throw new Error("no LRM");
    if (routeControl) {
      MAP.removeControl(routeControl);
      routeControl = null;
    }

    routeControl = L.Routing.control({
      waypoints: [from, to],
      router: L.Routing.osrmv1({
        serviceUrl: "https://routing.openstreetmap.de/routed-foot/route/v1",
        profile: "foot"
      }),
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: { styles: [{ color: "#cfe8ff", opacity: 1, weight: 6 }] },
      createMarker: () => null
    }).addTo(MAP);

    showToast("Rute lagt.");
  } catch (e) {
    routeLine = L.polyline([from, to], {
      color: "#cfe8ff",
      weight: 5,
      opacity: 1
    }).addTo(MAP);
    MAP.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
    showToast("Vis linje (ingen rutetjeneste)");
  }
}

function maybeDrawMarkers() {
  if (mapReady && dataReady) {
    drawPlaceMarkers();
  }
}

function lighten(hex, amount = 0.35) {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  let r = Math.min(255, (num >> 16) + 255 * amount);
  let g = Math.min(255, ((num >> 8) & 0x00ff) + 255 * amount);
  let b = Math.min(255, (num & 0x0000ff) + 255 * amount);
  return `rgb(${r},${g},${b})`;
}

function drawPlaceMarkers() {
  if (!MAP || !PLACES.length || !placeLayer) return;
  placeLayer.clearLayers();

  PLACES.forEach(p => {
    const isVisited = !!visited[p.id];
    const fill = isVisited
      ? lighten(catColor(p.category), 0.35)
      : catColor(p.category);
    const border = isVisited ? "#ffd700" : "#fff";

    const mk = L.circleMarker([p.lat, p.lon], {
      radius: isVisited ? 9 : 8,
      color: border,
      weight: 2,
      fillColor: fill,
      fillOpacity: 1
    }).addTo(placeLayer);

    mk.bindTooltip(isVisited ? `✅ ${p.name}` : p.name, {
      permanent: false,
      direction: "top"
    });

    mk.on("click", () => {
      closePlaceOverlay();
      showPlaceOverlay(p);
    });
  });
}


// ==============================
// 6. STED- OG PERSONKORT
// ==============================
let currentPlace = null;

function googleUrl(name) {
  const q = encodeURIComponent(`site:no.wikipedia.org ${name} Oslo`);
  return `https://www.google.com/search?q=${q}`;
}

// Liten visuell effekt når et sted låses opp
function pulseMarker(lat, lon) {
  if (!MAP) return;
  const pulse = L.circle([lat, lon], {
    radius: 30,
    color: "#ffd700",
    weight: 2,
    opacity: 0.9,
    fillColor: "#ffd700",
    fillOpacity: 0.3
  }).addTo(MAP);
  setTimeout(() => MAP.removeLayer(pulse), 1000);
}

function openPlaceCard(p) {
  if (!el.pc) return;

  currentPlace = p;
  el.pcTitle.textContent = p.name;
  el.pcMeta.textContent = `${p.category} • radius ${p.r || 120} m`;
  el.pcDesc.textContent = p.desc || "";
  el.pc.setAttribute("aria-hidden", "false");

  el.pcUnlock.textContent = "Lås opp";
  el.pcUnlock.disabled = false;

  el.pcUnlock.onclick = () => {
    if (visited[p.id]) {
      showToast("Allerede låst opp");
      return;
    }

    visited[p.id] = true;
    saveVisited();
    drawPlaceMarkers();
    pulseMarker(p.lat, p.lon);

    const cat = p.category;
    if (cat && cat.trim()) {
      merits[cat] = merits[cat] || { points: 0, level: "Nybegynner" };
      merits[cat].points += 1;
      saveMerits();
      updateMeritLevel(cat, merits[cat].points);
    }

    showToast(`Låst opp: ${p.name} ✅`);
    window.dispatchEvent(new Event("updateProfile"));
  };

  el.pcRoute.onclick = () => showRouteTo(p);
  showPlaceOverlay(p);
}

function openPlaceCardByPerson(person) {
  const place =
    PLACES.find(x => x.id === person.placeId) || {
      id: "personloc",
      name: person.name,
      category: tagToCat(person.tags),
      r: person.r || 150,
      desc: person.desc || "",
      lat: person.lat,
      lon: person.lon
    };

  openPlaceCard(place);

  if (!el.pcUnlock) return;
  el.pcUnlock.textContent = "Ta quiz";
  el.pcUnlock.disabled = false;
  el.pcUnlock.onclick = () => startQuiz(person.id);
}

el.pcClose?.addEventListener("click", () => {
  if (!el.pc) return;
  el.pc.setAttribute("aria-hidden", "true");
  el.pcUnlock.textContent = "Lås opp";
});


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
    .slice(0, NEARBY_LIMIT)
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

  return `
    <article class="card">
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${p.category || ""} • Oslo</div>
        <p class="desc">${p.desc || ""}</p>
      </div>
      <div class="row between">
        <div class="dist">${dist}</div>
        <div class="row">
          <button class="ghost" data-open="${p.id}">Åpne</button>
          <button class="ghost" data-info="${encodeURIComponent(p.name)}">Mer info</button>
        </div>
      </div>
    </article>`;
}

function renderPersonCardInline(pr) {
  const cat = tagToCat(pr.tags);
  const dist =
    pr._d < 1000 ? `${pr._d} m` : `${(pr._d / 1000).toFixed(1)} km`;

  return `
    <article class="card">
      <div>
        <div class="name">${pr.name}</div>
        <div class="meta">${cat}</div>
        <p class="desc">${pr.desc || ""}</p>
      </div>
      <div class="row between">
        <div class="dist">${dist}</div>
        <button class="primary" data-quiz="${pr.id}">Ta quiz</button>
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

function buildSeeMoreNearby() {
  if (!el.sheetNearBody) return;

  const sorted = PLACES
    .map(p => ({
      ...p,
      _d: currentPos ? Math.round(distMeters(currentPos, { lat: p.lat, lon: p.lon })) : null
    }))
    .sort((a, b) => (a._d ?? 1e12) - (b._d ?? 1e12));

  el.sheetNearBody.innerHTML = sorted
    .slice(NEARBY_LIMIT, NEARBY_LIMIT + 24)
    .map(renderPlaceCard)
    .join("");
}

function renderGallery() {
  if (!el.gallery) return;
  const collectedIds = Object.keys(peopleCollected).filter(id => peopleCollected[id]);
  const collectedPeople = PEOPLE.filter(p => collectedIds.includes(p.id));

  el.gallery.innerHTML = collectedPeople
    .map(p => {
      const imgPath = p.image || `bilder/kort/people/${p.id}.PNG`;
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

// Puls-animasjon på badge basert på badge.id (ikke label)
function pulseBadge(cat) {
  const id = catIdFromDisplay(cat);  // f.eks. "vitenskap"

  document.querySelectorAll(".badge-mini").forEach(card => {
    if (card.dataset.badgeId === id) {
      card.classList.add("badge-pulse");
      setTimeout(() => card.classList.remove("badge-pulse"), 1200);
    }
  });
}

async function ensureBadgesLoaded() {
  if (BADGES && BADGES.length) return;
  try {
    BADGES = await fetch("badges.json", { cache: "no-store" }).then(r => r.json());
  } catch {
    BADGES = [];
  }
}

// Oppdater nivå ved ny poengsum
async function updateMeritLevel(cat, newPoints) {
  await ensureBadgesLoaded();

  const id = catIdFromDisplay(cat);
  const badge = BADGES.find(
    b => b.id === id || b.name.toLowerCase() === cat.toLowerCase()
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

  if (progress[categoryId].completed.includes(quizId)) return;

  progress[categoryId].completed.push(quizId);
  localStorage.setItem("quiz_progress", JSON.stringify(progress));

  // Merits følger fortsatt display-navn (din regel)
  const catLabel = categoryDisplay;
  merits[catLabel] = merits[catLabel] || { level: "Nybegynner", points: 0 };
  merits[catLabel].points += 1;

  await ensureBadgesLoaded();

  const badge = BADGES.find(
    b =>
      b.id === categoryId ||
      b.name.toLowerCase() === catLabel.toLowerCase()
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

// Felles click-delegation for steder, info, quiz og merker
document.addEventListener("click", e => {
  const target = e.target;

  // Åpne sted fra kort (data-open)
  const openId = target.getAttribute?.("data-open");
  if (openId) {
    const p = PLACES.find(x => x.id === openId);
    if (p) {
      // Bruk popup-systemet
      window.showPlacePopup(p);
    }
  }

  // "Mer info" (Google)
  const infoName = target.getAttribute?.("data-info");
  if (infoName) {
    window.open(
      `https://www.google.com/search?q=${decodeURIComponent(infoName)} Oslo`,
      "_blank"
    );
  }

  // Quiz (person eller sted)
  const quizId = target.getAttribute?.("data-quiz");
  if (quizId) {
    startQuiz(quizId);
  }

  // Badge-klikk
  const badgeEl = target.closest?.("[data-badge-id]");
  if (badgeEl) {
    handleBadgeClick(badgeEl);
  }
});

// "Lukk"-knapper for sheets
document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    const sel = btn.getAttribute("data-close");
    document.querySelector(sel)?.setAttribute("aria-hidden", "true");
  });
});

// "Se flere i nærheten"
el.seeMore?.addEventListener("click", () => {
  buildSeeMoreNearby();
  openSheet(el.sheetNear);
});

// ----------------------------------------------------------
// BADGE MODAL
// ----------------------------------------------------------
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

  const info =
    localMerits[badge.name] ||
    localMerits[badge.id] ||
    { level: "Nybegynner", points: 0 };

  const imgEl   = modal.querySelector(".badge-img");
  const titleEl = modal.querySelector(".badge-title");
  const levelEl = modal.querySelector(".badge-level");
  const textEl  = modal.querySelector(".badge-progress-text");
  const barEl   = modal.querySelector(".badge-progress-bar");

  if (imgEl)   imgEl.src = badge.image;
  if (titleEl) titleEl.textContent = badge.name;
  if (levelEl) levelEl.textContent = info.level;
  if (textEl)  textEl.textContent = `${info.points} poeng`;

  if (barEl && badge.tiers?.length) {
    const max = badge.tiers[badge.tiers.length - 1].threshold || 1;
    const pct = Math.max(0, Math.min(100, (info.points / max) * 100));
    barEl.style.width = `${pct}%`;
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

// ==============================
// 10. INITIALISERING OG BOOT
// ==============================
function wire() {
  // Testmodus-bryter
  el.test?.addEventListener("change", e => {
    if (e.target.checked) {
      currentPos = { lat: START.lat, lon: START.lon };
      if (el.status) el.status.textContent = "Testmodus: Oslo sentrum";
      setUser(currentPos.lat, currentPos.lon);
      renderNearbyPlaces();
      showToast("Testmodus PÅ");
    } else {
      showToast("Testmodus AV");
      requestLocation();
    }
  });
}

function requestLocation() {
  if (!navigator.geolocation) {
    if (el.status) el.status.textContent = "Geolokasjon støttes ikke.";
    renderNearbyPlaces();
    return;
  }
  if (el.status) el.status.textContent = "Henter posisjon…";

  navigator.geolocation.getCurrentPosition(
    g => {
      currentPos = { lat: g.coords.latitude, lon: g.coords.longitude };
      if (el.status) el.status.textContent = "Posisjon funnet.";
      setUser(currentPos.lat, currentPos.lon);
      renderNearbyPlaces();
    },
    _ => {
      if (el.status) el.status.textContent = "Kunne ikke hente posisjon.";
      renderNearbyPlaces();
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
  );
}

// MINI-PROFIL + quiz-historikk på forsiden
function initMiniProfile() {
  const nm = document.getElementById("miniName");
  const st = document.getElementById("miniStats");
  if (!nm || !st) return;

  const name  = localStorage.getItem("user_name")  || "Utforsker #182";
  const color = localStorage.getItem("user_color") || "#f6c800";

  const visitedLS         = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const meritsLS          = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const quizProgress      = JSON.parse(localStorage.getItem("quiz_progress") || "{}");

  const visitedCount = Object.keys(visitedLS).length;
  const badgeCount   = Object.keys(meritsLS).length;
  const quizCount    = Object.values(quizProgress)
    .map(v => (Array.isArray(v.completed) ? v.completed.length : 0))
    .reduce((a, b) => a + b, 0);

  nm.textContent = name;
  nm.style.color = color;
  st.textContent = `${visitedCount} steder · ${badgeCount} merker · ${quizCount} quizzer`;
}

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
    // erstatter enterMapMode()
    document.body.classList.add("map-mode");
    showToast("Viser steder på kartet");
  });

  document.getElementById("linkBadges")?.addEventListener("click", () => {
    window.location.href = "profile.html#userBadgesGrid";
  });

  document.getElementById("linkQuiz")?.addEventListener("click", showQuizHistory);
}

// BOOT
async function boot() {
  initMap();

  try {
    const [places, people] = await Promise.all([
      fetch("places.json", { cache: "no-store" }).then(r => r.json()),
      fetch("people.json", { cache: "no-store" }).then(r => r.json())
    ]);
    PLACES = places;
    PEOPLE = people;
    linkPeopleToPlaces();
    dataReady = true;
    maybeDrawMarkers();
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
  boot();
  initMiniProfile();
  wireMiniProfileLinks();
});


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

  showToast("Tilbake til oversikt");
}

el.btnSeeMap?.addEventListener("click", enterMapMode);
el.btnExitMap?.addEventListener("click", exitMapMode);


// ==============================
// 13. QUIZ – DYNAMISK LASTER, MODAL & SCORE
// ==============================
const QUIZ_FILE_MAP = {
  kunst:        "quiz_kunst.json",
  sport:        "quiz_sport.json",
  politikk:     "quiz_politikk.json",
  populaerkultur:"quiz_populaerkultur.json",
  musikk:       "quiz_musikk.json",
  subkultur:    "quiz_subkultur.json",
  vitenskap:    "quiz_vitenskap.json",
  natur:        "quiz_natur.json",
  litteratur:   "quiz_litteratur.json",
  by:           "quiz_by.json",
  historie:     "quiz_historie.json",
  naeringsliv:  "quiz_naeringsliv.json"
};

async function loadQuizForCategory(categoryId) {
  const file = QUIZ_FILE_MAP[categoryId];
  if (!file) return [];
  try {
    const response = await fetch(file, { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data)
      ? data.filter(
          q => (q.categoryId || "").toLowerCase() === categoryId.toLowerCase()
        )
      : [];
  } catch {
    return [];
  }
}

function ensureQuizUI() {
  if (document.getElementById("quizModal")) return;

  const m = document.createElement("div");
  m.id = "quizModal";
  m.className = "modal";
  m.innerHTML = `
    <div class="modal-body">
      <div class="modal-head">
        <strong id="quizTitle">Quiz</strong>
        <button class="ghost" id="quizClose">Lukk</button>
      </div>
      <div class="quiz-progress"><div class="bar"></div></div>
      <div class="sheet-body">
        <div id="quizQuestion" style="margin:6px 0 10px;font-weight:600"></div>
        <div id="quizChoices" class="quiz-choices"></div>
        <div style="display:flex;justify-content:space-between;margin-top:8px;">
          <span id="quizFeedback" class="quiz-feedback"></span>
          <small id="quizProgress" class="muted"></small>
        </div>
      </div>
    </div>`;
  document.body.appendChild(m);

  const modal = document.getElementById("quizModal");
  modal.querySelector("#quizClose").onclick = closeQuiz;
  modal.addEventListener("click", e => {
    if (e.target.id === "quizModal") closeQuiz();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeQuiz();
  });
}

function openQuiz() {
  ensureQuizUI();
  const modal = document.getElementById("quizModal");
  modal.style.display = "flex";
  modal.classList.remove("fade-out");
}

function closeQuiz() {
  const modal = document.getElementById("quizModal");
  if (!modal) return;
  modal.classList.add("fade-out");
  setTimeout(() => modal.remove(), 450);
}

// START QUIZ
async function startQuiz(targetId) {
  const person = PEOPLE.find(p => p.id === targetId);
  const place  = PLACES.find(p => p.id === targetId);
  if (!person && !place) {
    showToast("Fant verken person eller sted");
    return;
  }

  // Krever fysisk besøk før quiz (ikke i testmodus)
  if (!el.test?.checked) {
    const visitedPlaces = visited; // bruk GLOBAL visited
    if (place && !visitedPlaces[place.id]) {
      showToast("📍 Du må besøke stedet først for å ta denne quizen.");
      return;
    }
    if (person && person.placeId && !visitedPlaces[person.placeId]) {
      showToast("📍 Du må besøke stedet først for å ta denne quizen.");
      return;
    }
  }

  // Hent quizdata
  const displayCat = person ? tagToCat(person.tags) : (place.category || "vitenskap");
  const categoryId = catIdFromDisplay(displayCat);
  const items      = await loadQuizForCategory(categoryId);
  const questions  = items.filter(
    q => q.personId === targetId || q.placeId === targetId
  );
  if (!questions.length) {
    showToast("Ingen quiz tilgjengelig her ennå");
    return;
  }

  const formatted = questions.map(q => ({
    text: q.question,
    choices: q.options || [],
    answerIndex: (q.options || []).findIndex(o => o === q.answer)
  }));

  openQuiz();

  runQuizFlow({
    title: person ? person.name : place.name,
    questions: formatted,
    onEnd: (correct, total) => {
      const perfect = correct === total;

      if (perfect) {
        addCompletedQuizAndMaybePoint(displayCat, targetId);
        markQuizAsDone(targetId);

        if (person) {
          peopleCollected[targetId] = true;
          savePeople();
          showRewardPerson(person);
          document
            .getElementById("gallery")
            ?.scrollIntoView({ behavior: "smooth" });
        } else if (place) {
          // Vis kort hvis stedet er besøkt eller testmodus
          const visitedPlaces = visited;
          if (visitedPlaces[place.id] || el.test?.checked) {
            showRewardPlace(place);
            pulseMarker(place.lat, place.lon);
          }
        }

        showToast(
          `Perfekt! ${total}/${total} riktige 🎯 Du fikk poeng og kort!`
        );
        window.dispatchEvent(new Event("updateProfile"));
      } else {
        showToast(
          `Fullført: ${correct}/${total} – prøv igjen for full score.`
        );
      }

      if (person && person.placeId) {
        const plc = PLACES.find(p => p.id === person.placeId);
        if (plc) pulseMarker(plc.lat, plc.lon);
      }
    }
  });
}

function markQuizAsDone(targetId) {
  const quizBtns = document.querySelectorAll(`[data-quiz="${targetId}"]`);
  quizBtns.forEach(btn => {
    const firstTime = !btn.classList.contains("quiz-done");
    btn.classList.add("quiz-done");
    btn.innerHTML = "✔️ Tatt (kan gjentas)";
    if (firstTime) {
      btn.classList.add("blink");
      setTimeout(() => btn.classList.remove("blink"), 1200);
    }
  });
}

function runQuizFlow({ title = "Quiz", questions = [], onEnd = () => {} }) {
  ensureQuizUI();
  const qs = {
    title:    document.getElementById("quizTitle"),
    q:        document.getElementById("quizQuestion"),
    choices:  document.getElementById("quizChoices"),
    progress: document.getElementById("quizProgress"),
    feedback: document.getElementById("quizFeedback")
  };
  qs.title.textContent = title;

  let i = 0;
  let correctCount = 0;

  function step() {
    const q = questions[i];
    qs.q.textContent = q.text;
    qs.choices.innerHTML = q.choices
      .map((opt, idx) => `<button data-idx="${idx}">${opt}</button>`)
      .join("");
    qs.progress.textContent = `${i + 1}/${questions.length}`;
    qs.feedback.textContent = "";

    const bar = document.querySelector(".quiz-progress .bar");
    if (bar) bar.style.width = `${((i + 1) / questions.length) * 100}%`;

    qs.choices.querySelectorAll("button").forEach(btn => {
      btn.onclick = () => {
        const ok = Number(btn.dataset.idx) === q.answerIndex;
        btn.classList.add(ok ? "correct" : "wrong");
        qs.feedback.textContent = ok ? "Riktig ✅" : "Feil ❌";
        if (ok) correctCount++;
        qs.choices
          .querySelectorAll("button")
          .forEach(b => (b.disabled = true));
        setTimeout(() => {
          i++;
          if (i < questions.length) {
            step();
          } else {
            closeQuiz();
            onEnd(correctCount, questions.length);
          }
        }, QUIZ_FEEDBACK_MS);
      };
    });
  }

  step();
}


// ============================================================
//  UNIVERSAL PERSON INFO POPUP
// ============================================================
window.showPersonPopup = function(person) {
  if (!person) return;

  // Finn ansikt + kortbilde
  const face = `bilder/people/${person.id}_face.PNG`;
  const cardImg = person.image || `bilder/kort/people/${person.id}.PNG`;

  // Wiki / verk / steder
  const wiki = person.wiki || "";
  const works = person.works || [];
  const placeMatches = PLACES.filter(p => p.people?.includes(person.id));

  // Lag popupen
  const el = document.createElement("div");
  el.className = "hg-popup";

  el.innerHTML = `
    <div class="hg-popup-inner">

      <!-- Close -->
      <button class="hg-popup-close">✕</button>

      <!-- Top: face -->
      <img src="${face}" class="hg-popup-face">

      <h2 class="hg-popup-name">${person.name}</h2>

      <!-- Kortbilde nederst til høyre -->
      <img src="${cardImg}" class="hg-popup-cardimg">

      <!-- Verk-listen -->
      <div class="hg-section">
        <h3>Verk</h3>
        ${
          works.length
            ? `<ul class="hg-works">
                ${works.map(w => `<li>${w}</li>`).join("")}
               </ul>`
            : `<p class="hg-muted">Ingen registrerte verk.</p>`
        }
      </div>

      <!-- Wiki -->
      <div class="hg-section">
        <h3>Om personen</h3>
        <p class="hg-wiki">${wiki}</p>
      </div>

      <!-- Steder personen finnes -->
      <div class="hg-section">
        <h3>Steder</h3>
        ${
          placeMatches.length
            ? `<div class="hg-places">
                ${placeMatches
                  .map(
                    p => `
                  <div class="hg-place" data-place="${p.id}">
                    📍 ${p.name}
                  </div>`
                  )
                  .join("")}
               </div>`
            : `<p class="hg-muted">Ingen stedstilknytning.</p>`
        }
      </div>

    </div>
  `;

  // Lukking
  el.querySelector(".hg-popup-close").onclick = () => el.remove();

  // Klikk på steder → åpner steds-popup
  el.querySelectorAll("[data-place]").forEach(btn => {
    btn.onclick = () => {
      const place = PLACES.find(p => p.id === btn.dataset.place);
      el.remove();
      showPlacePopup(place);
    };
  });

  document.body.appendChild(el);
}

// ============================================================
// UNIVERSAL STEDS-POPUP (info-popup, ikke reward)
// ============================================================
window.showPlacePopup = function(place) {
  if (!place) return;

  // Bilde av kortet
  const fullImg = place.image || `bilder/kort/places/${place.id}.PNG`;
  // Mini-ikon (thumbnail)
  const thumbImg = `bilder/kort/places/${place.id}.PNG`;

  // Personer som hører til stedet
  const peopleHere = PEOPLE.filter(p => p.placeId === place.id);

  const card = document.createElement("div");
  card.className = "hg-popup";
  card.innerHTML = `
    <div class="hg-popup-inner">

      <!-- Hovedbilde -->
      <img src="${fullImg}" class="hg-popup-img" alt="${place.name}">

      <h3 class="hg-popup-title">${place.name}</h3>
      <p class="hg-popup-cat">${place.category || ""}</p>

      <!-- Beskrivelse -->
      <p class="hg-popup-desc">${place.desc || ""}</p>

      <!-- Personer på stedet -->
      ${
        peopleHere.length
        ? `<div class="hg-popup-subtitle">Personer</div>
           <div class="hg-popup-people">
             ${peopleHere.map(p => `
               <div class="hg-popup-face" data-person="${p.id}">
                 <img src="bilder/people/${p.id}_face.PNG">
               </div>
             `).join("")}
           </div>`
        : ""
      }

      <!-- Mini-kort nederst høyre -->
      <img src="${thumbImg}" class="hg-popup-cardthumb">

      <!-- Kartmarkør nederst -->
      <div class="hg-popup-locations">
        <div class="loc-chip">📍 ${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}</div>
      </div>

    </div>
  `;

  document.body.appendChild(card);

  // Klikk på person → åpne person-popup
  card.querySelectorAll(".hg-popup-face").forEach(el => {
    el.onclick = () => {
      const id = el.dataset.person;
      const pr = PEOPLE.find(p => p.id === id);
      showPersonPopup(pr);
    };
  });

  setTimeout(() => card.classList.add("visible"), 10);

  // Klikk utenfor → lukk
  card.onclick = e => {
    if (e.target.classList.contains("hg-popup")) card.remove();
  };
}

// ==============================
// 14. QUIZ-REWARD POPUPS
// (Små, auto-close, IKKE info-popup)
// ==============================

// PERSON – reward-popup etter fullført personquiz
function showRewardPerson(person) {
  const imgPath = person.image || `bilder/kort/people/${person.id}.PNG`;
  const cat = tagToCat(person.tags);
  const desc = person.desc || "Ingen beskrivelse tilgjengelig.";

  const card = document.createElement("div");
  card.className = "reward-popup";
  card.innerHTML = `
    <div class="popup-inner" 
         style="width:290px;max-width:85vw;background:rgba(15,15,20,0.95);
                color:#fff;border-radius:14px;padding:20px;text-align:center;
                box-shadow:0 0 25px rgba(0,0,0,0.7);display:flex;
                flex-direction:column;align-items:center;animation:fadeIn .35s ease;">
      
      <img src="${imgPath}" alt="${person.name}"
           style="width:180px;height:180px;object-fit:contain;border-radius:10px;margin-bottom:12px;">

      <h3 style="margin:6px 0 4px;font-size:1.3em;">${person.name}</h3>
      <p style="margin:0 0 10px;color:#bbb;font-size:0.9em;">${cat}</p>

      <p style="font-size:0.85em;line-height:1.45;color:#ddd;margin:0 0 14px;">
        ${desc}
      </p>

      <div style="background:#222;padding:10px 12px;border-radius:8px;
                  font-size:0.9em;color:#FFD600;">
        🏅 Du har nå samlet kortet for <strong>${person.name}</strong>!
      </div>
    </div>`;

  document.body.appendChild(card);
  setTimeout(() => card.classList.add("visible"), 10);
  setTimeout(() => card.remove(), 4200);
}



// PLACE – reward-popup etter fullført stedsquiz
function showRewardPlace(place) {
  const imgPath = place.image || `bilder/kort/places/${place.id}.PNG`;
  const cat = place.category || "Historie";
  const desc = place.desc || "Ingen beskrivelse tilgjengelig.";

  const card = document.createElement("div");
  card.className = "reward-popup";
  card.innerHTML = `
    <div class="popup-inner" 
         style="width:290px;max-width:85vw;background:rgba(15,15,20,0.95);
                color:#fff;border-radius:14px;padding:20px;text-align:center;
                box-shadow:0 0 25px rgba(0,0,0,0.7);display:flex;
                flex-direction:column;align-items:center;animation:fadeIn .35s ease;">
      
      <img src="${imgPath}" alt="${place.name}"
           style="width:180px;height:180px;object-fit:contain;border-radius:10px;margin-bottom:12px;">

      <h3 style="margin:6px 0 4px;font-size:1.3em;">${place.name}</h3>
      <p style="margin:0 0 10px;color:#bbb;font-size:0.9em;">${cat}</p>

      <p style="font-size:0.85em;line-height:1.45;color:#ddd;margin:0 0 14px;">
        ${desc}
      </p>

      <div style="background:#222;padding:10px 12px;border-radius:8px;
                  font-size:0.9em;color:#FFD600;">
        🏛️ Du har samlet stedet <strong>${place.name}</strong>!
      </div>
    </div>`;

  document.body.appendChild(card);
  setTimeout(() => card.classList.add("visible"), 10);
  setTimeout(() => card.remove(), 4200);
}

// Ekstra animasjonsstil for reward popup
const rewardStyle = document.createElement("style");
rewardStyle.textContent = `
.reward-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  opacity: 0;
  transition: all 0.35s ease;
  z-index: 9999;
}
.reward-popup.visible {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}
@keyframes fadeIn {
  from {opacity:0;transform:translate(-50%,-50%) scale(0.85);}
  to   {opacity:1;transform:translate(-50%,-50%) scale(1);}
}`;
document.head.appendChild(rewardStyle);
