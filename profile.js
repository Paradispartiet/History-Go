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
// HISTORIEKORT – TIDSLINJE
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

  if (bar) bar.style.width = `${(total ? (count / total) * 100 : 0).toFixed(1)}%`;
  if (txt) txt.textContent = `Du har samlet ${count} av ${total} historiekort`;

  if (!got.length) {
    body.innerHTML = `<div class="muted">Du har ingen historiekort ennå.</div>`;
    return;
  }

  const sorted = got.map(p => ({ ...p, year: p.year || 0 })).sort((a,b) => a.year - b.year);
  body.innerHTML = sorted.map(p => `
    <div class="timeline-card" data-person="${p.id}">
      <img src="${p.image || `bilder/kort/people/${p.id}.PNG`}" alt="${p.name}">
      <div class="timeline-name">${p.name}</div>
      <div class="timeline-year">${p.year || "–"}</div>
    </div>`).join("");

  body.querySelectorAll(".timeline-card").forEach(card => {
    card.addEventListener("click", () => {
      const person = PEOPLE.find(p => p.id === card.dataset.person);
      if (person) showPersonPopup(person);
    });
  });
}


// --------------------------------------
// MINE MERKER – runde ikoner med medalje (klikkbare)
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
      <div class="badge-mini" data-badge="${badge.id}" role="button" tabindex="0" style="cursor:pointer;">
        <div class="badge-wrapper">
          <img src="${badge.image}" alt="${badge.name}" class="badge-mini-icon">
          <span class="badge-medal">${medal}</span>
        </div>
      </div>`;
  }).join("");

  // Hele kortet blir klikkbart + tastatur (Enter/Space)
  const makeOpen = (el) => {
    const id = el.dataset.badge;
    const badge = badges.find(b => b.id === id);
    if (badge) showBadgeModal(badge);
  };

  container.querySelectorAll(".badge-mini").forEach(el => {
    el.addEventListener("click", () => makeOpen(el));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        makeOpen(el);
      }
    });
  });
}


// --------------------------------------
// MERKE-MODAL (bilde + nivå + teller + quizliste med spørsmålstitler)
// --------------------------------------
async function showBadgeModal(badge) {
  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const quizProgress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");

  const catId = badge.id;
  const completedIds = quizProgress[catId]?.completed || [];

  // Prøv å laste riktig quiz-fil for kategorien (f.eks. quiz_vitenskap.json)
  let quizData = [];
  try {
    const res = await fetch(`quiz_${catId}.json`, { cache: "no-store" });
    if (res.ok) quizData = await res.json();
  } catch (_) { /* stille fallback */ }

  // Filtrer til riktig kategori (i tilfelle blandede categoryId i filene)
  const inThisCategory = Array.isArray(quizData)
    ? quizData.filter(q => (q.categoryId || "").toLowerCase() === catId.toLowerCase())
    : [];

  const totalInCat = inThisCategory.length;

  // Lag oppslag for rask tittel-henting
  const byId = Object.fromEntries(inThisCategory.map(q => [q.id, q]));

  // Fullførte i denne kategorien (de som faktisk finnes i filen)
  const completedHere = completedIds.filter(id => !!byId[id]);

  const counterHtml = `<p class="muted" style="margin:.2rem 0 1rem;">Du har fullført <strong>${completedHere.length}</strong> av <strong>${totalInCat}</strong> quizzer i denne kategorien.</p>`;

  const listHtml = completedHere.length
    ? `<ul>${completedHere.map(qid => {
        const q = byId[qid];
        const label = q?.question || qid;
        return `<li>${label}</li>`;
      }).join("")}</ul>`
    : `<p class="muted">Ingen quizzer fullført ennå.</p>`;

  const modal = document.createElement("div");
  modal.className = "badge-modal";
  modal.innerHTML = `
    <div class="badge-modal-inner">
      <button class="close-badge" aria-label="Lukk">✕</button>
      <img src="${badge.image}" alt="${badge.name}" class="badge-modal-icon">
      <h2 style="margin:.4rem 0 .2rem;">${badge.name}</h2>
      <p class="muted" style="margin:.2rem 0 .6rem;">Nivå: ${merits[badge.name]?.level || "Nybegynner"}</p>
      ${counterHtml}
      <h4 style="margin:.6rem 0 .3rem;">Dine quizzer</h4>
      ${listHtml}
    </div>`;
  document.body.appendChild(modal);
  modal.style.display = "flex";

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
