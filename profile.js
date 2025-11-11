// ============================================================
// === HISTORY GO – PROFILE.JS (v21, ren og stabil) ============
// ============================================================
//
// Håndterer profilsiden:
//  - Profilkort og redigering
//  - Historiekort / tidslinje
//  - Merker og modaler
//  - Leser data direkte fra localStorage
// ============================================================


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

  // Skriv ut til de faktiske feltene i din HTML
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

  // ❌ Avbryt-knappen
  modal.querySelector("#cancelProfile").onclick = () => modal.remove();

  // 💾 Lagre endringer
  modal.querySelector("#saveProfile").onclick = () => {
    const newName  = modal.querySelector("#newName").value.trim() || "Utforsker #182";
    const newColor = modal.querySelector("#newColor").value;

    localStorage.setItem("user_name", newName);
    localStorage.setItem("user_color", newColor);

    document.getElementById("profileName").textContent = newName;
    const avatarEl = document.getElementById("profileAvatar");
    if (avatarEl) avatarEl.style.borderColor = newColor;

    showToast("Profil oppdatert ✅");
    modal.remove(); // ✅ Lukk modalen etter lagring
    renderProfileCard();
  };
}


// --------------------------------------
// HISTORIEKORT – KOMBINERT HORISONTAL TIDSLINJE
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

  // Slå sammen og sorter etter år
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

  // Ingen data ennå
  if (!allItems.length) {
    body.innerHTML = `<div class="muted">Du har ingen historiekort ennå.</div>`;
    return;
  }

  // Bygg kortene
  body.innerHTML = allItems.map(item => `
    <div class="timeline-card ${item.type}" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}">
      <div class="timeline-name">${item.name}</div>
      <div class="timeline-year">${item.year || "–"}</div>
    </div>
  `).join("");

  // Klikk for popup
  body.querySelectorAll(".timeline-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      if (card.classList.contains("person")) {
        const person = PEOPLE.find(p => p.id === id);
        if (person) showPersonPopup(person);
      } else {
        const place = PLACES.find(p => p.id === id);
        if (place) showPlacePopup(place);
      }
    });
  });
}


// --------------------------------------
// MINE MERKER – runde ikoner med medalje
// --------------------------------------
async function renderMerits() {
  const container = document.getElementById("merits");
  if (!container) return;

  const badges = await fetch("badges.json").then(r => r.json());
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
      <div class="badge-mini" data-badge="${badge.id}">
        <div class="badge-wrapper">
          <img src="${badge.image}" alt="${badge.name}" class="badge-mini-icon">
          <span class="badge-medal">${medal}</span>
        </div>
      </div>`;
  }).join("");

  container.querySelectorAll(".badge-mini").forEach(el => {
    el.addEventListener("click", () => {
      const badge = badges.find(b => b.id === el.dataset.badge);
      if (badge) showBadgeModal(badge.name);
    });
  });
}

// --------------------------------------
// PERSONER DU HAR LÅST OPP (AVATARER)
// --------------------------------------
function renderCollection() {
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
      <img src="${p.image || `bilder/kort/people/${p.id}.PNG`}" 
           alt="${p.name}" class="avatar-img">
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
// MERKE-MODAL – viser bilde, nivå og quiz-liste
// --------------------------------------
function showBadgeModal(badge) {
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
      <button class="close-badge">✕</button>
      <img src="${badge.image}" alt="${badge.name}" class="badge-modal-icon">
      <h2>${catName}</h2>
      <p class="muted">Nivå: ${level}</p>
      <h4>Dine quizzer</h4>
      ${listHtml}
    </div>`;
  document.body.appendChild(modal);

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  // Lukking
  modal.querySelector(".close-badge").onclick = () => modal.remove();
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
}


// --------------------------------------
// INITIALISERING MED DATA
// --------------------------------------
Promise.all([
  fetch("people.json").then(r => r.json()).then(d => PEOPLE = d),
  fetch("places.json").then(r => r.json()).then(d => PLACES = d),
  fetch("badges.json").then(r => r.json()).then(d => BADGES = d)
]).then(() => {
  renderProfileCard();
  renderMerits();
  renderCollection();
  renderGallery();
  renderTimelineProfile();
});

document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editProfileBtn");
  if (editBtn) editBtn.addEventListener("click", openProfileModal);
  setTimeout(() => {
    renderProfileCard();
    renderMerits();
    renderCollection();
    renderGallery();
    renderTimelineProfile();
  }, 600);
});
