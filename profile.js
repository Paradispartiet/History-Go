// ============================================================
// === HISTORY GO – PROFILE.JS (v19, full integrasjon) ========
// ============================================================
//
// Håndterer profilsiden:
// - Profilkort (navn, emoji, farge)
// - Profilredigering
// - Deling (html2canvas)
// - Historiekort / tidslinje
// - Kall til felles funksjoner fra app.js
//
// Krever at app.js lastes først.
// ============================================================

// --------------------------------------
// PROFILKORT OG RENDERING
// --------------------------------------
function renderProfileCard() {
  const name = localStorage.getItem("user_name") || "Utforsker #182";
  const visitedCount = Object.keys(visited).length;
  const peopleCount = Object.keys(peopleCollected).length;

  const fav = Object.entries(merits)
    .sort((a, b) => b[1].points - a[1].points)[0];

  const favCat = fav ? fav[0] : "Ingen ennå";

  document.getElementById("profileName").textContent = name;
  document.getElementById("statPlaces").textContent = `${visitedCount} steder`;
  document.getElementById("statPeople").textContent = `${peopleCount} personer`;
  document.getElementById("statCategory").textContent = `Favoritt: ${favCat}`;
}

// --------------------------------------
// HENT LOKALDATA FRA LAGRING
// --------------------------------------
const visited = JSON.parse(localStorage.getItem("visited") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("peopleCollected") || "{}");
const merits = JSON.parse(localStorage.getItem("merits") || "{}");

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
    const newName = modal.querySelector("#newName").value.trim() || "Utforsker #182";
    const newEmoji = modal.querySelector("#newEmoji").value.trim() || "🧭";
    const newColor = modal.querySelector("#newColor").value;

    localStorage.setItem("user_name", newName);
    localStorage.setItem("user_avatar", newEmoji);
    localStorage.setItem("user_color", newColor);

    document.getElementById("profileName").textContent = newName;
    const avatarEl = document.getElementById("profileAvatar");
    avatarEl.textContent = newEmoji;
    avatarEl.style.borderColor = newColor;

    modal.remove();
    showToast("Profil oppdatert ✅");
    renderProfileCard();
  };
}

document.getElementById("editProfileBtn")?.addEventListener("click", openProfileModal);

// --------------------------------------
// HISTORIEKORT – TIDSLINJE (PROFILVERSJON)
// --------------------------------------
function renderTimelineProfile() {
  const body = document.getElementById("timelineBody");
  const bar = document.getElementById("timelineProgressBar");
  const txt = document.getElementById("timelineProgressText");
  if (!body) return;

  const got = PEOPLE.filter(p => !!peopleCollected[p.id]);
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

  const sorted = got.map(p => ({ ...p, year: p.year || 0 })).sort((a, b) => a.year - b.year);

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

  body.querySelectorAll(".timeline-card").forEach(c => {
    c.addEventListener("click", () => {
      const id = c.dataset.person;
      const pr = PEOPLE.find(p => p.id === id);
      if (pr) showPersonPopup(pr);
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
  renderMerits();       // riktig funksjon for merker
  renderCollection();   // steder
  renderGallery();      // personer
  renderTimelineProfile(); // tidslinje
});
