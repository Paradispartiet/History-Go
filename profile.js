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

  // Quizer (vises bare liste)
  const list = modal.querySelector(".badge-quizzes");
  list.innerHTML = "";

  const progress = ls("quiz_progress", {});
  const completed = [];
  for (const cat of Object.keys(progress)) {
    progress[cat].completed?.forEach(q => completed.push(q));
  }
  list.innerHTML = completed.length
    ? completed.map(id => `<li>${id}</li>`).join("")
    : "<li>Ingen quiz fullført ennå</li>";

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
      <img src="bilder/people/${p.id}_face.PNG" class="avatar-img">
      <div class="avatar-name">${p.name}</div>
    </div>
  `).join("");

  grid.querySelectorAll(".avatar-card").forEach(el => {
    el.onclick = () => showPersonPopup(PEOPLE.find(p => p.id === el.dataset.person));
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
    el.onclick = () => showPlacePopup(PLACES.find(p => p.id === el.dataset.place));
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

  const visited = ls("visited_places", {});
  const collected = ls("people_collected", {});

  const items = [
    ...PLACES.filter(p => visited[p.id]).map(p => ({
      type:"place", id:p.id, name:p.name, year:Number(p.year)||0,
      image:p.image || `bilder/kort/places/${p.id}.PNG`
    })),
    ...PEOPLE.filter(p => collected[p.id]).map(p => ({
      type:"person", id:p.id, name:p.name, year:Number(p.year)||0,
      image:p.image || `bilder/kort/people/${p.id}.PNG`
    })),
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
      const person = PEOPLE.find(p=>p.id===id);
      if (person) return showPersonPopup(person);
      const place = PLACES.find(p=>p.id===id);
      if (place) return showPlacePopup(place);
    };
  });
}


// ------------------------------------------------------------
// POPUPS (samme stil som app.js)
// ------------------------------------------------------------
function showPersonPopup(person) {
  if (!person) return;

  const card = document.createElement("div");
  card.className = "person-popup";
  card.innerHTML = `
    <img src="${person.image || `bilder/kort/people/${person.id}.PNG`}">
    <h3>${person.name}</h3>
    <p>${person.year || ""}</p>
    <p>${person.desc || ""}</p>
  `;
  document.body.appendChild(card);
  setTimeout(()=>card.classList.add("visible"), 10);
  setTimeout(()=>card.remove(), 3800);
}

function showPlacePopup(place) {
  if (!place) return;

  const card = document.createElement("div");
  card.className = "person-popup";
  card.innerHTML = `
    <img src="${place.image || `bilder/kort/places/${place.id}.PNG`}">
    <h3>${place.name}</h3>
    <p>${place.year || ""}</p>
    <p>${place.desc || ""}</p>
  `;
  document.body.appendChild(card);
  setTimeout(()=>card.classList.add("visible"), 10);
  setTimeout(()=>card.remove(), 3800);
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
  });
});
