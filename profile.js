// ============================================================
// === HISTORY GO – PROFILE.JS (v23, stabil og komplett) ======
// ============================================================
//
// Håndterer profilsiden:
//  - Profilkort og redigering
//  - Historiekort / tidslinje
//  - Merker og modaler
//  - Personer og steder brukeren har låst opp
//  - Leser data direkte fra localStorage
// ============================================================

let PEOPLE = [];
let PLACES = [];
let BADGES = [];

// --------------------------------------
// PROFILKORT OG RENDERING
// --------------------------------------
function renderProfileCard() {
  const name = localStorage.getItem("user_name") || "Utforsker #182";

  const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
  const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const quizProgress    = JSON.parse(localStorage.getItem("quiz_progress") || "{}");

  const visitedCount = Object.keys(visited).length;
  const quizCount = Object.values(quizProgress)
    .map(v => Array.isArray(v.completed) ? v.completed.length : 0)
    .reduce((a,b) => a+b, 0);
  const streak = Number(localStorage.getItem("user_streak") || 0);

  const nameEl   = document.getElementById("profileName");
  const visitEl  = document.getElementById("statVisited");
  const quizEl   = document.getElementById("statQuizzes");
  const streakEl = document.getElementById("statStreak");

  if (nameEl)   nameEl.textContent   = name;
  if (visitEl)  visitEl.textContent  = visitedCount;
  if (quizEl)   quizEl.textContent   = quizCount;
  if (streakEl) streakEl.textContent = streak;
}

// --------------------------------------
// PROFIL-REDIGERINGSMODAL
// --------------------------------------
function openProfileModal() {
  const modal = document.createElement("div");
  modal.className = "profile-modal";
  modal.innerHTML = `
    <div class="profile-modal-inner">
      <h3>Endre profil</h3>
      <label>Navn</label>
      <input id="newName" value="${localStorage.getItem("user_name") || "Utforsker #182"}">
      <label>Farge</label>
      <input id="newColor" type="color" value="${localStorage.getItem("user_color") || "#f6c800"}">
      <button id="saveProfile">Lagre</button>
      <button id="cancelProfile" style="margin-left:6px;background:#444;color:#fff;">Avbryt</button>
    </div>`;
  document.body.appendChild(modal);
  modal.style.display = "flex";

  modal.querySelector("#cancelProfile").onclick = () => modal.remove();

  modal.querySelector("#saveProfile").onclick = () => {
    const newName  = modal.querySelector("#newName").value.trim() || "Utforsker #182";
    const newColor = modal.querySelector("#newColor").value;

    localStorage.setItem("user_name", newName);
    localStorage.setItem("user_color", newColor);

    document.getElementById("profileName").textContent = newName;
    const avatarEl = document.getElementById("profileAvatar");
    if (avatarEl) avatarEl.style.borderColor = newColor;

    showToast("Profil oppdatert ✅");
    modal.remove();
    renderProfileCard();
  };
}

// --------------------------------------
// HISTORIEKORT – TIDSLINJE
// --------------------------------------
function renderTimelineProfile() {
  const body = document.getElementById("timelineBody");
  const bar  = document.getElementById("timelineProgressBar");
  const txt  = document.getElementById("timelineProgressText");
  if (!body) return;

  const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");

  const visitedPlaces   = (PLACES || []).filter(p => visited[p.id]);
  const collectedPeople = (PEOPLE || []).filter(p => peopleCollected[p.id]);

  const allItems = [
    ...visitedPlaces.map(p => ({
      type: "place",
      id: p.id,
      name: p.name,
      year: Number(p.year) || 0,
      image: p.image || `bilder/kort/places/${p.id}.PNG`
    })),
    ...collectedPeople.map(p => ({
      type: "person",
      id: p.id,
      name: p.name,
      year: Number(p.year) || 0,
      image: p.image || `bilder/kort/people/${p.id}.PNG`
    }))
  ].sort((a, b) => a.year - b.year);

  const total = allItems.length;
  if (bar) bar.style.width = `${(total ? (total / (PEOPLE.length + PLACES.length)) * 100 : 0).toFixed(1)}%`;
  if (txt) txt.textContent = total ? `Du har låst opp ${total} historiekort` : "";

  if (!allItems.length) {
    body.innerHTML = `<div class="muted">Du har ingen historiekort ennå.</div>`;
    return;
  }

  body.innerHTML = allItems.map(item => `
    <div class="timeline-card ${item.type}" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}">
      <div class="timeline-name">${item.name}</div>
      <div class="timeline-year">${item.year || "–"}</div>
    </div>
  `).join("");

  body.querySelectorAll(".timeline-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      if (card.classList.contains("person")) {
        const person = PEOPLE.find(p => p.id === id);
        if (person) showPersonPopup(person);
      } else {
        const place = PLACES.find(p => p.id === id);
        if (place) showPlaceOverlay(place);
      }
    });
  });
}

// --------------------------------------
// MINE MERKER
// --------------------------------------
async function renderMerits() {
  const container = document.getElementById("merits");
  if (!container) return;

  const badges = await fetch("badges.json", { cache: "no-store" }).then(r => r.json());
  const localMerits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const cats = Object.keys(localMerits).length ? Object.keys(localMerits) : badges.map(b => b.name);

  function medalByIndex(i) {
    return i <= 0 ? "🥉" : i === 1 ? "🥈" : i === 2 ? "🥇" : "🏆";
  }

  container.innerHTML = cats.map(cat => {
    const merit = localMerits[cat] || { level: "Nybegynner" };
    const badge = badges.find(b =>
      cat.toLowerCase().includes(b.id) ||
      b.name.toLowerCase().includes(cat.toLowerCase())
    );
    if (!badge) return "";

    const tierIndex = badge.tiers.findIndex(t => t.label === merit.level);
    const medal = medalByIndex(tierIndex);

    return `
      <div class="badge-mini" data-badge-id="${badge.id}">
        <div class="badge-wrapper">
          <img src="${badge.image}" alt="${badge.name}" class="badge-mini-icon">
          <span class="badge-medal">${medal}</span>
        </div>
      </div>`;
  }).join("");

  // Klikkbare merker – stabil versjon
container.onclick = (e) => {
  const tile = e.target.closest(".badge-mini");
  if (!tile) return;
  const id = tile.dataset.badgeId;
  const badge = badges.find(b => b.id === id);
  if (!badge) return;

  // Åpne badge-modal trygt
  try {
    openBadgeModalFromBadge(badge);
  } catch (err) {
    console.warn("Klarte ikke åpne badge-modal:", err);
  }
};
}

// --------------------------------------
// PERSONER DU HAR LÅST OPP
// --------------------------------------
function renderPeopleCollection() {
  const grid = document.getElementById("peopleGrid");
  if (!grid) return;

  const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");

  if (!Object.keys(peopleCollected).length) {
    grid.innerHTML = `<div class="muted">Ingen personer låst opp ennå.</div>`;
    return;
  }

  const collected = PEOPLE.filter(p => peopleCollected[p.id]);
  collected.sort((a, b) => a.name.localeCompare(b.name));

  grid.innerHTML = collected.map(p => `
    <div class="avatar-card" data-person="${p.id}">
      <img src="${p.image || `bilder/kort/people/${p.id}.PNG`}" alt="${p.name}" class="avatar-img">
      <div class="avatar-name">${p.name}</div>
    </div>
  `).join("");

  grid.querySelectorAll(".avatar-card").forEach(card => {
    card.addEventListener("click", () => {
      const person = PEOPLE.find(p => p.id === card.dataset.person);
      if (person) showPersonPopup(person);
    });
  });
}

// --------------------------------------
// STEDER DU HAR BESØKT
// --------------------------------------
async function renderPlacesCollection() {
  const container = document.getElementById("collectionGrid");
  if (!container) return;

  const raw = localStorage.getItem("visited_places") ||
              localStorage.getItem("places_visited") ||
              localStorage.getItem("visitedPlaces") ||
              "{}";
  const visited = JSON.parse(raw);

  const places = await fetch("places.json").then(r => r.json());

  const visitedPlaces = Array.isArray(visited)
    ? places.filter(p => visited.includes(p.id))
    : places.filter(p => visited[p.id]);

  if (!visitedPlaces.length) {
    container.innerHTML = `<p class="muted">Ingen steder besøkt ennå.</p>`;
    return;
  }

  container.innerHTML = visitedPlaces.map(p => `
    <div class="card place-card" data-id="${p.id}">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category || ""} · ${p.year || ""}</div>
      <p class="desc">${p.desc || ""}</p>
    </div>
  `).join("");

  container.querySelectorAll(".place-card").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      const place = places.find(p => p.id === id);
      if (place) showPlaceOverlay(place);
    });
  });
}

// --------------------------------------
// FALLBACK-FUNKSJONER
// --------------------------------------
function showPlaceOverlay(place) {
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
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector(".close-overlay").onclick = () => modal.remove();
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
}

function showPersonPopup(person) {
  if (!person) return;
  const popup = document.createElement("div");
  popup.className = "person-popup visible";
  popup.innerHTML = `
    <img src="${person.image || `bilder/kort/people/${person.id}.PNG`}" alt="${person.name}">
    <h3>${person.name}</h3>
    <p>${person.year || ""}</p>
    <p>${person.desc || ""}</p>`;
  document.body.appendChild(popup);
  popup.addEventListener("click", () => popup.remove());
}

// --------------------------------------
// MERKE-MODAL – viser bilde, nivå og quiz-liste
// --------------------------------------
function openBadgeModalFromBadge(badge) {
  if (!badge) return;

  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const quizProgress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  const catId = badge.id;
  const catName = badge.name;
  const completed = quizProgress[catId]?.completed || [];
  const level = merits[catName]?.level || "Nybegynner";

  const listHtml = completed.length
    ? `<ul class="quiz-list">${completed.map(q => `<li>${q}</li>`).join("")}</ul>`
    : `<p class="muted">Ingen quizzer fullført ennå.</p>`;

  const modal = document.createElement("div");
  modal.className = "badge-modal";
  modal.innerHTML = `
    <div class="badge-modal-inner">
      <button class="close-badge" aria-label="Lukk">×</button>
      <img src="${badge.image}" alt="${badge.name}" class="badge-modal-icon">
      <h2>${catName}</h2>
      <p class="muted">Nivå: ${level}</p>
      <h4>Dine quizzer</h4>
      ${listHtml}
    </div>`;
  document.body.appendChild(modal);

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  modal.querySelector(".close-badge").onclick = () => modal.remove();
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
}
  
// ------------------------------------------------------------
// LASTER ALLE PEOPLE-FILER (hoved + 9 kategorier)
// ------------------------------------------------------------
async function loadPeopleCombined() {
  const sources = [
    "people.json",
    "people/people_historie.json",
    "people/people_vitenskap.json",
    "people/people_kunst.json",
    "people/people_musikk.json",
    "people/people_natur.json",
    "people/people_sport.json",
    "people/people_by.json",
    "people/people_politikk.json",
    "people/people_populaerkultur.json",
    "people/people_subkultur.json"
  ];

  const all = await Promise.all(
    sources.map(src =>
      fetch(src)
        .then(r => (r.ok ? r.json() : []))
        .catch(() => [])
    )
  );

  return all.flat(); // slår sammen alle personer til én samlet liste
}

// ------------------------------------------------------------
// INITIALISERING MED DATA
// ------------------------------------------------------------
Promise.all([
  loadPeopleCombined().then(d => PEOPLE = d),
  fetch("places.json").then(r => r.json()).then(d => PLACES = d),
  fetch("badges.json").then(r => r.json()).then(d => BADGES = d)
]).then(() => {
  renderProfileCard();
  renderMerits();
  renderPeopleCollection();
  renderPlacesCollection();
  renderTimelineProfile();
});

document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editProfileBtn");
  if (editBtn) editBtn.addEventListener("click", openProfileModal);
  setTimeout(() => {
    renderProfileCard();
    renderMerits();
    renderPeopleCollection();
    renderPlacesCollection();
    renderTimelineProfile();
  }, 600);
});
