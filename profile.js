// ============================================================
// HISTORY GO – PROFILE.JS (v24 – HELT NY OG STABIL)
// ============================================================
//
//  Denne fila kjører KUN på profile.html. Ikke i app.js.
//
//  Den gjør dette:
//   ✓ Leser people.json / places.json / badges.json
//   ✓ Viser profilkortet (navn + statistikk)
//   ✓ Viser merker + åpner badge-modal riktig
//   ✓ Viser personer du har låst opp
//   ✓ Viser steder du har besøkt
//   ✓ Viser tidslinjen
//   ✓ Viser popup for person/sted (samme stil som app.js)
//   ✓ 100% kompatibel med all localStorage-logikk fra app.js
//
// ============================================================

// Sørg for at globale popup-funksjoner finnes i app.js
window.showPersonPopup = window.showPersonPopup || (() => {});
window.showPlacePopup  = window.showPlacePopup  || (() => {});

// GLOBALT
let PEOPLE = [];
let PLACES = [];
let BADGES = [];


// ------------------------------------------------------------
// UTLESNING AV LOCALSTORAGE (TRYGG)
// ------------------------------------------------------------
function ls(name, fallback = {}) {
  try {
    return JSON.parse(localStorage.getItem(name)) || fallback;
  } catch {
    return fallback;
  }
}


// ------------------------------------------------------------
// PROFILKORT
// ------------------------------------------------------------
function renderProfileCard() {
  const visited = ls("visited_places", {});
  const quizProgress = ls("quiz_progress", {});
  const streak = Number(localStorage.getItem("user_streak") || 0);

  const userName = localStorage.getItem("user_name") || "Utforsker #182";

  const visitedCount = Object.keys(visited).length;
  const quizCount = Object.values(quizProgress)
    .map(v => Array.isArray(v.completed) ? v.completed.length : 0)
    .reduce((a,b)=>a+b, 0);

  document.getElementById("profileName").textContent = userName;
  document.getElementById("statVisited").textContent = visitedCount;
  document.getElementById("statQuizzes").textContent = quizCount;
  document.getElementById("statStreak").textContent = streak;
}


// ------------------------------------------------------------
// MERKER – GRID + MODAL
// ------------------------------------------------------------
async function renderMerits() {
  const box = document.getElementById("merits");
  if (!box) return;

  const merits = ls("merits_by_category", {});
  const cats = Object.keys(merits);

  box.innerHTML = cats.map(cat => {
    const merit = merits[cat];
    const badge = BADGES.find(b =>
      cat.toLowerCase().includes(b.id) ||
      b.name.toLowerCase().includes(cat.toLowerCase())
    );
    if (!badge) return "";

    const levelIndex = badge.tiers.findIndex(t => t.label === merit.level);
    const medal = levelIndex === 0 ? "🥉" :
                  levelIndex === 1 ? "🥈" :
                  levelIndex === 2 ? "🥇" : "🏆";

    return `
      <div class="badge-mini" data-badge-id="${badge.id}">
        <div class="badge-wrapper">
          <img src="${badge.image}" class="badge-mini-icon" alt="${badge.name}">
          <span class="badge-medal">${medal}</span>
        </div>
      </div>`;
  }).join("");

  // Klikk → modal
  box.querySelectorAll(".badge-mini").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.badgeId;
      const badge = BADGES.find(b => b.id === id);
      openBadgeModal(badge);
    });
  });
}


function openBadgeModal(badge) {
  const modal = document.getElementById("badgeModal");
  if (!modal || !badge) return;

  // --- MERITS INFO ---
  const merits = ls("merits_by_category", {});
  const info = merits[badge.name] || merits[badge.id] || { level:"Nybegynner", points:0 };

  modal.querySelector(".badge-img").src = badge.image;
  modal.querySelector(".badge-title").textContent = badge.name;
  modal.querySelector(".badge-level").textContent = info.level;
  modal.querySelector(".badge-progress-text").textContent = `${info.points} poeng`;

  // Progressbar
  const bar = modal.querySelector(".badge-progress-bar");
  const max = badge.tiers[badge.tiers.length - 1].threshold;
  bar.style.width = `${Math.min(100, (info.points / max) * 100)}%`;

  // --- QUIZ-HISTORIKK ---
  const history = JSON.parse(localStorage.getItem("quiz_history") || "[]");
  const catId = badge.id.toLowerCase();
  const items = history.filter(h => (h.categoryId || "").toLowerCase() === catId);

  const list = modal.querySelector(".badge-quizzes");

  if (!items.length) {
    list.innerHTML = "<li>Ingen quiz fullført i denne kategorien ennå.</li>";
  } else {
    list.innerHTML = items
      .map(h => {
        const date = new Date(h.date).toLocaleDateString("no-NO");
        const score = `${h.correctAnswers.length}/${h.correctAnswers.length}`;

        return `
          <li class="badge-quiz-item">
            <img class="badge-quiz-img" src="${h.image}">
            <div class="badge-quiz-info">
              <strong>${h.name}</strong><br>
              <span>${date}</span><br>
              <span class="badge-quiz-score">Score: ${score}</span>

              <ul class="badge-quiz-answers">
                ${h.correctAnswers
                  .map(a => `
                    <li class="badge-quiz-q">
                      <strong>${a.question}</strong><br>
                      ✔ ${a.answer}
                    </li>
                  `)
                  .join("")}
              </ul>
            </div>
          </li>
        `;
      })
      .join("");
  }

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  modal.onclick = e => {
    if (e.target.id === "badgeModal") closeBadgeModal();
  };
  modal.querySelector(".close-btn").onclick = closeBadgeModal;
}

function closeBadgeModal() {
  const m = document.getElementById("badgeModal");
  if (!m) return;
  m.style.display = "none";
  m.setAttribute("aria-hidden", "true");
}


// ------------------------------------------------------------
// PERSONER
// ------------------------------------------------------------
function renderPeopleCollection() {
  const grid = document.getElementById("peopleGrid");
  if (!grid) return;

  const collected = ls("people_collected", {});

  const peopleUnlocked = PEOPLE.filter(p => collected[p.id]);
  if (!peopleUnlocked.length) {
    grid.innerHTML = `<div class="muted">Ingen personer låst opp ennå.</div>`;
    return;
  }

  grid.innerHTML = peopleUnlocked.map(p => `
    <div class="avatar-card" data-person="${p.id}">
      <img src="bilder/people/${p.image}" class="avatar-img">
      <div class="avatar-name">${p.name}</div>
    </div>
  `).join("");

  grid.querySelectorAll(".avatar-card").forEach(el => {
    el.onclick = () => {
      const pr = PEOPLE.find(p => p.id === el.dataset.person);
      window.showPersonPopup(pr);
    };
  });
}

// ------------------------------------------------------------
// STEDER
// ------------------------------------------------------------
function renderPlacesCollection() {
  const grid = document.getElementById("collectionGrid");
  if (!grid) return;

  const visited = ls("visited_places", {});
  const places = PLACES.filter(p => visited[p.id]);

  if (!places.length) {
    grid.innerHTML = `<div class="muted">Ingen steder besøkt ennå.</div>`;
    return;
  }

  grid.innerHTML = places.map(p => `
    <div class="card place-card" data-place="${p.id}">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category} · ${p.year || ""}</div>
      <p class="desc">${p.desc || ""}</p>
    </div>
  `).join("");

  grid.querySelectorAll(".place-card").forEach(el => {
  el.onclick = () => {
    const pl = PLACES.find(p => p.id === el.dataset.place);
    window.showPlacePopup(pl);
  };
});
}


// ------------------------------------------------------------
// TIDSLINJE
// ------------------------------------------------------------
function renderTimeline() {
  const body = document.getElementById("timelineBody");
  const bar  = document.getElementById("timelineProgressBar");
  const txt  = document.getElementById("timelineProgressText");
  if (!body) return;

  const visited   = ls("visited_places", {});
  const collected = ls("people_collected", {});

  // TIMELINE = KUN BILDE (ikke kort)
  const items = [
    ...PLACES.filter(p => visited[p.id]).map(p => ({
      type:"place",
      id:p.id,
      name:p.name,
      year:Number(p.year)||0,
      image: p.image || `bilder/places/${p.id}.PNG`
    })),

    ...PEOPLE.filter(p => collected[p.id]).map(p => ({
      type:"person",
      id:p.id,
      name:p.name,
      year:Number(p.year)||0,
      image: p.image || `bilder/people/${p.id}.PNG`
    }))
  ].sort((a,b)=>a.year - b.year);

  const count = items.length;
  if (count === 0) {
    body.innerHTML = `<div class="muted">Du har ingen historiekort ennå.</div>`;
    return;
  }

  body.innerHTML = items.map(x => `
    <div class="timeline-card ${x.type}" data-id="${x.id}">
      <img src="${x.image}">
      <div class="timeline-name">${x.name}</div>
      <div class="timeline-year">${x.year || "–"}</div>
    </div>
  `).join("");

  const max = PEOPLE.length + PLACES.length;
  if (bar) bar.style.width = `${(count/max)*100}%`;
  if (txt) txt.textContent = `Du har låst opp ${count} kort`;

  body.querySelectorAll(".timeline-card").forEach(el => {
    el.onclick = () => {
      const id = el.dataset.id;

      const pr = PEOPLE.find(p => p.id === id);
      if (pr) return window.showPersonPopup(pr);

      const pl = PLACES.find(p => p.id === id);
      if (pl) return window.showPlacePopup(pl);
    };
  });
}

function renderCollectionCards() {
  const body = document.getElementById("collectionCardsBody");
  if (!body) return;

  const visited = ls("visited_places", {});
  const collected = ls("people_collected", {});

  const items = [
    // Steder: cardImage
    ...PLACES.filter(p => visited[p.id]).map(p => ({
      type: "place",
      id: p.id,
      name: p.name,
      year: Number(p.year) || 0,
      image: p.cardImage || p.image || `bilder/kort/places/${p.id}.PNG`
    })),

    // Personer: imageCard
    ...PEOPLE.filter(p => collected[p.id]).map(p => ({
      type: "person",
      id: p.id,
      name: p.name,
      year: Number(p.year) || 0,
      image: p.imageCard || p.image || `bilder/kort/people/${p.id}.PNG`
    }))
  ];

  if (!items.length) {
    body.innerHTML = `<div class="muted">Ingen kort låst opp ennå.</div>`;
    return;
  }

  body.innerHTML = items
    .map(x => `
      <div class="collection-card" data-id="${x.id}">
        <img src="${x.image}" alt="${x.name}">
        <div class="collection-card-name">${x.name}</div>
        <div class="collection-card-year">${x.year || ""}</div>
      </div>
    `)
    .join("");

  body.querySelectorAll(".collection-card").forEach(el => {
    el.onclick = () => {
      const id = el.dataset.id;
      const pr = PEOPLE.find(p => p.id === id);
      if (pr) return window.showPersonPopup(pr);

      const pl = PLACES.find(p => p.id === id);
      if (pl) return window.showPlacePopup(pl);
    };
  });
}

// ------------------------------------------------------------
// EDIT-PROFILMODAL
// ------------------------------------------------------------
function openProfileModal() {
  const name = localStorage.getItem("user_name") || "Utforsker #182";
  const color = localStorage.getItem("user_color") || "#f6c800";

  const modal = document.createElement("div");
  modal.className = "profile-modal";
  modal.innerHTML = `
    <div class="profile-modal-inner">
      <h3>Endre profil</h3>
      <label>Navn</label>
      <input id="newName" value="${name}">
      <label>Farge</label>
      <input id="newColor" type="color" value="${color}">
      <button id="saveProfile">Lagre</button>
      <button id="cancelProfile" style="margin-left:6px;background:#444;color:#fff;">Avbryt</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = "flex";

  modal.querySelector("#cancelProfile").onclick = () => modal.remove();
  modal.querySelector("#saveProfile").onclick = () => {
    const newName = modal.querySelector("#newName").value.trim() || "Utforsker #182";
    const newColor = modal.querySelector("#newColor").value;

    localStorage.setItem("user_name", newName);
    localStorage.setItem("user_color", newColor);

    renderProfileCard();
    modal.remove();
  };
}


// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
Promise.all([
  fetch("people.json").then(r=>r.json()).then(d=>PEOPLE=d),
  fetch("places.json").then(r=>r.json()).then(d=>PLACES=d),
  fetch("badges.json").then(r=>r.json()).then(d=>BADGES=d)
]).then(() => {
  renderProfileCard();
  renderMerits();
  renderPeopleCollection();
  renderPlacesCollection();
  renderTimeline();
  renderCollectionCards();
});

document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editProfileBtn");
  if (editBtn) editBtn.onclick = openProfileModal;

  // Sync etter quiz (app.js)
  window.addEventListener("updateProfile", () => {
    renderProfileCard();
    renderMerits();
    renderPeopleCollection();
    renderPlacesCollection();
    renderTimeline();
    renderCollectionCards();
  });
});

// ============================================================
// KART PÅ PROFILSIDEN – KUN BESØKTE STEDER
// ============================================================

let PROFILE_MAP = null;
let PROFILE_LAYER = null;

window.addEventListener("DOMContentLoaded", setupProfileMap);
window.addEventListener("updateProfile", updateProfileMarkers);

function setupProfileMap() {
  if (typeof L === "undefined") return;

  if (!PROFILE_MAP) {
    PROFILE_MAP = L.map("map", {
      zoomControl: false,
      attributionControl: false
    }).setView([59.9139, 10.7522], 13);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19 }
    ).addTo(PROFILE_MAP);

    PROFILE_LAYER = L.layerGroup().addTo(PROFILE_MAP);
  }

  updateProfileMarkers();
}

function updateProfileMarkers() {
  if (!PROFILE_LAYER || !PLACES.length) return;

  const visited = ls("visited_places", {});
  PROFILE_LAYER.clearLayers();

  PLACES.filter(p => visited[p.id]).forEach(p => {
    const mk = L.circleMarker([p.lat, p.lon], {
      radius: 9,
      color: "#ffd700",
      weight: 2,
      fillColor: lighten(catColor(p.category), 0.35),
      fillOpacity: 1
    }).addTo(PROFILE_LAYER);

    mk.bindTooltip(p.name, { direction: "top" });

    mk.on("click", () => {
      if (window.showPlacePopup)
        window.showPlacePopup(p);
    });
  });
}

// ---------- FARGE / LIGHTEN ----------
function catColor(cat="") {
  const c = cat.toLowerCase();
  if (c.includes("historie")) return "#344B80";
  if (c.includes("vitenskap")) return "#9b59b6";
  if (c.includes("kunst")) return "#ffb703";
  if (c.includes("musikk")) return "#ff66cc";
  if (c.includes("litteratur")) return "#f6c800";
  if (c.includes("natur")) return "#4caf50";
  if (c.includes("sport")) return "#2a9d8f";
  if (c.includes("by")) return "#e63946";
  if (c.includes("politikk")) return "#c77dff";
  if (c.includes("naering")) return "#ff8800";
  if (c.includes("populaer")) return "#ffb703";
  if (c.includes("subkultur")) return "#ff66cc";
  return "#9b59b6";
}

function lighten(hex, amount = 0.35) {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  let r = Math.min(255, (num >> 16) + 255*amount);
  let g = Math.min(255, ((num >> 8)&255) + 255*amount);
  let b = Math.min(255, (num & 255) + 255*amount);
  return `rgb(${r},${g},${b})`;
}
