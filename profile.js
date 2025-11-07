// ============================================================
// === HISTORY GO – PROFILE.JS (v20, stabil og synkronisert) ===
// ============================================================
//
// Håndterer profilsiden:
// - Profilkort (navn, emoji, farge, statistikk)
// - Profilredigering
// - Deling (html2canvas)
// - Historiekort / tidslinje
// - Leser ferske data direkte fra localStorage
//
// Krever at app.js lastes først (for PEOPLE, PLACES, BADGES)
// ============================================================


// --------------------------------------
// PROFILKORT OG RENDERING
// --------------------------------------
function renderProfileCard() {
  const name = localStorage.getItem("user_name") || "Utforsker #182";

  // 🔹 Hent ferske data direkte fra lagring
  const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
  const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  const visitedCount = Object.keys(visited).length;
  const peopleCount  = Object.keys(peopleCollected).length;

  const favEntry = Object.entries(merits)
    .sort((a, b) => (b[1].points || 0) - (a[1].points || 0))[0];
  const favCat = favEntry ? favEntry[0] : "Ingen ennå";

  document.getElementById("profileName").textContent  = name;
  document.getElementById("statPlaces").textContent   = `${visitedCount} steder`;
  document.getElementById("statPeople").textContent   = `${peopleCount} personer`;
  document.getElementById("statCategory").textContent = `Favoritt: ${favCat}`;
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
      <label>Emoji</label>
      <input id="newEmoji" maxlength="2" value="${localStorage.getItem("user_avatar") || "🧭"}">
      <label>Farge</label>
      <input id="newColor" type="color" value="${localStorage.getItem("user_color") || "#f6c800"}">
      <button id="saveProfile">Lagre</button>
      <button id="cancelProfile" style="margin-left:6px;background:#444;color:#fff;">Avbryt</button>
    </div>`;
  document.body.appendChild(modal);
  modal.style.display = "flex";

  modal.querySelector("#cancelProfile").onclick = () => modal.remove();

  modal.querySelector("#saveProfile").onclick = () => {
    const newName  = modal.querySelector("#newName").value.trim()  || "Utforsker #182";
    const newEmoji = modal.querySelector("#newEmoji").value.trim() || "🧭";
    const newColor = modal.querySelector("#newColor").value;

    localStorage.setItem("user_name",  newName);
    localStorage.setItem("user_avatar", newEmoji);
    localStorage.setItem("user_color",  newColor);

    document.getElementById("profileName").textContent = newName;
    const avatarEl = document.getElementById("profileAvatar");
    avatarEl.textContent = newEmoji;
    avatarEl.style.borderColor = newColor;

    modal.remove();
    showToast("Profil oppdatert ✅");
    renderProfileCard();
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editProfileBtn");
  if (editBtn) {
    editBtn.addEventListener("click", openProfileModal);
  }

  // kjør også standardoppdatering når DOM er klar
  renderProfileCard();
  renderMerits();
  renderCollection();
  renderGallery();
  renderTimelineProfile();
});


// --------------------------------------
// HISTORIEKORT – TIDSLINJE (PROFILVERSJON)
// --------------------------------------
function renderTimelineProfile() {
  const body = document.getElementById("timelineBody");
  const bar  = document.getElementById("timelineProgressBar");
  const txt  = document.getElementById("timelineProgressText");
  if (!body) return;

  const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");

  const got   = PEOPLE.filter(p => !!peopleCollected[p.id]);
  const total = PEOPLE.length;
  const count = got.length;

  if (bar) {
    const pct = total ? (count / total) * 100 : 0;
    bar.style.width = `${pct.toFixed(1)}%`;
  }
  if (txt) txt.textContent = `Du har samlet ${count} av ${total} historiekort`;

  if (!got.length) {
    body.innerHTML = `<div class="muted">Du har ingen historiekort ennå.</div>`;
    return;
  }

  const sorted = got.map(p => ({ ...p, year: p.year || 0 }))
                    .sort((a, b) => a.year - b.year);

  body.innerHTML = sorted.map(p => {
    const img = p.image || `bilder/kort/people/${p.id}.PNG`;
    const yearLabel = p.year || "–";
    return `
      <div class="timeline-card" data-person="${p.id}">
        <img src="${img}" alt="${p.name}">
        <div class="timeline-name">${p.name}</div>
        <div class="timeline-year">${yearLabel}</div>
      </div>`;
  }).join("");

  body.querySelectorAll(".timeline-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.person;
      const person = PEOPLE.find(p => p.id === id);
      if (person) showPersonPopup(person);
    });
  });
}


// --------------------------------------
// FULL INITIALISERING MED DATA
// --------------------------------------
Promise.all([
  fetch("people.json").then(r => r.json()).then(d => PEOPLE = d),
  fetch("places.json").then(r => r.json()).then(d => PLACES = d),
  fetch("badges.json").then(r => r.json()).then(d => BADGES = d)
]).then(() => {
  dataReady = true;
  renderProfileCard();
  renderMerits();
  renderCollection();
  renderGallery();
  renderTimelineProfile();
});


// --------------------------------------
// SIKKERHET – VENT PÅ DATA VED TREG LAST
// --------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    renderProfileCard();
    renderMerits();
    renderCollection();
    renderGallery();
    renderTimelineProfile();
  }, 600);
});

// --------------------------------------
// MERKE-MODAL (viser info og quiz-liste)
// --------------------------------------
function showBadgeModal(catName) {
  const badges = JSON.parse(localStorage.getItem("badges_cache") || "[]");
  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const quizProgress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");

  const badge = badges.find(b =>
    catName.toLowerCase().includes(b.id) ||
    b.name.toLowerCase().includes(catName.toLowerCase())
  );
  if (!badge) return;

  // Quiz-liste for denne kategorien
  const catId = badge.id;
  const completed = quizProgress[catId]?.completed || [];

  const listHtml = completed.length
    ? `<ul>${completed.map(q => `<li>${q}</li>`).join("")}</ul>`
    : `<p class="muted">Ingen quizzer fullført ennå.</p>`;

  // Bygg modalen
  const modal = document.createElement("div");
  modal.className = "badge-modal";
  modal.innerHTML = `
    <div class="badge-modal-inner">
      <button class="close-badge">✕</button>
      <img src="${badge.image}" alt="${badge.name}" class="badge-modal-icon">
      <h2>${badge.name}</h2>
      <p class="muted">${badge.description}</p>
      <h4>Dine quizzer</h4>
      ${listHtml}
    </div>`;

  document.body.appendChild(modal);
  modal.style.display = "flex";

  modal.querySelector(".close-badge").onclick = () => modal.remove();
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.remove();
  });
}
