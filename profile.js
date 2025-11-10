// ============================================================
// === HISTORY GO – PROFILE.JS (v24, stabil + delingsfunksjon) =
// ============================================================
//
// Håndterer profilsiden:
//  - Profilkort og redigering
//  - Historiekort / tidslinje
//  - Merker og modaler
//  - Person-infoboks (wiki + kort)
//  - Leser data direkte fra localStorage
//  - ✨ Nytt: Del profil som bilde (html2canvas)
// ============================================================

// ------------------------------------------------------------
// 🛰️ BroadcastChannel – sanntidsoppdatering fra forsiden
// ------------------------------------------------------------
try {
  const bc = new BroadcastChannel("historygo");
  bc.onmessage = (ev) => {
    if (!ev?.data?.type) return;
    if (["visited:update", "people:update"].includes(ev.data.type)) {
      renderProfileCard();
      renderMerits();
      renderCollection();
      renderGallery();
      renderTimelineProfile();
      highlightNewTimelineCards();
    }
  };
} catch {}

// --------------------------------------
// PROFILKORT OG RENDERING
// --------------------------------------
function renderProfileCard() {
  const name = localStorage.getItem("user_name") || "Utforsker #182";
  const visited = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  const visitedCount = Object.keys(visited).length;
  const peopleCount = Object.keys(peopleCollected).length;
  const favEntry = Object.entries(merits)
    .sort((a, b) => (b[1].points || 0) - (a[1].points || 0))[0];
  const favCat = favEntry ? favEntry[0] : "Ingen ennå";

  document.getElementById("profileName").textContent = name;
  document.getElementById("statPlaces").textContent = `${visitedCount} steder`;
  document.getElementById("statPeople").textContent = `${peopleCount} personer`;
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

  modal.querySelector("#cancelProfile").onclick = () => modal.remove();
  modal.querySelector("#saveProfile").onclick = () => {
    const newName = modal.querySelector("#newName").value.trim() || "Utforsker #182";
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
  const bar = document.getElementById("timelineProgressBar");
  const txt = document.getElementById("timelineProgressText");
  if (!body) return;

  const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
  const got = PEOPLE.filter((p) => !!peopleCollected[p.id]);
  const total = PEOPLE.length;
  const count = got.length;

  if (bar) bar.style.width = `${total ? (count / total) * 100 : 0}%`;
  if (txt) txt.textContent = `Du har samlet ${count} av ${total} historiekort`;

  if (!got.length) {
    body.innerHTML = `<div class="muted">Du har ingen historiekort ennå.</div>`;
    return;
  }

  const sorted = got.map(p => ({ ...p, year: p.year || 0 })).sort((a, b) => a.year - b.year);
  body.innerHTML = sorted.map(p => `
    <div class="timeline-card" data-person="${p.id}">
      <img src="${p.image || `bilder/kort/people/${p.id}.PNG`}" alt="${p.name}">
      <div class="timeline-name">${p.name}</div>
      <div class="timeline-year">${p.year || "–"}</div>
    </div>`).join("");

  body.querySelectorAll(".timeline-card").forEach(card => {
    card.addEventListener("click", () => {
      const person = PEOPLE.find(p => p.id === card.dataset.person);
      if (person) showPersonInfoModal(person);
    });
  });
}

// --------------------------------------
// PERSONGALLERI – kun ansiktsbilder (_face.PNG)
// --------------------------------------
function renderGallery() {
  const collected = JSON.parse(localStorage.getItem("people_collected") || "{}");
  const got = PEOPLE.filter(p => !!collected[p.id]);
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  if (!got.length) {
    gallery.innerHTML = `<div class="muted">Samle personer ved å møte dem og klare quizen.</div>`;
    return;
  }

  gallery.innerHTML = got.map(p => `
    <div class="person-card" data-person="${p.id}" title="${p.name}">
      <img src="bilder/people/${p.id}_face.PNG" alt="${p.name}" class="person-face-thumb">
      <div class="person-label">${p.name}</div>
    </div>
  `).join("");

  gallery.querySelectorAll(".person-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.person;
      const person = PEOPLE.find(p => p.id === id);
      if (person) showPersonInfoModal(person);
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
  const medalByIndex = (i) => (i <= 0 ? "🥉" : i === 1 ? "🥈" : i === 2 ? "🥇" : "🏆");

  container.innerHTML = cats.map(cat => {
    const merit = localMerits[cat] || { level: "Nybegynner" };
    const badge = badges.find(b =>
      cat.toLowerCase().includes(b.id) || b.name.toLowerCase().includes(cat.toLowerCase())
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

  container.querySelectorAll(".badge-mini").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.badge;
      const badge = badges.find(b => b.id === id);
      if (badge) showBadgeOverviewModal(badge);
    });
  });
}

// --------------------------------------
// MERKE-MODAL (quiz-oversikt)
// --------------------------------------
async function showBadgeOverviewModal(badge) {
  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const quizProgress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  const catId = badge.id;
  const completedIds = quizProgress[catId]?.completed || [];

  let quizData = [];
  try {
    const res = await fetch(`quiz_${catId}.json`, { cache: "no-store" });
    if (res.ok) quizData = await res.json();
  } catch (_) {}

  const inThisCategory = Array.isArray(quizData)
    ? quizData.filter(q => (q.categoryId || "").toLowerCase() === catId.toLowerCase())
    : [];
  const totalInCat = inThisCategory.length;
  const byId = Object.fromEntries(inThisCategory.map(q => [q.id, q]));
  const completedHere = completedIds.filter(id => !!byId[id]);

  const counterHtml = `<p class="muted" style="margin:.2rem 0 1rem;">
    Du har fullført <strong>${completedHere.length}</strong> av <strong>${totalInCat}</strong> quizzer i denne kategorien.
  </p>`;
  const listHtml = completedHere.length
    ? `<ul>${completedHere.map(qid => `<li>${byId[qid]?.question || qid}</li>`).join("")}</ul>`
    : `<p class="muted">Ingen quizzer fullført ennå.</p>`;

  const modal = document.createElement("div");
  modal.className = "badge-modal";
  modal.innerHTML = `
    <div class="badge-modal-inner">
      <button class="close-badge" aria-label="Lukk">✕</button>
      <img src="${badge.image}" alt="${badge.name}" class="badge-modal-icon">
      <h2>${badge.name}</h2>
      <p class="muted">Nivå: ${merits[badge.name]?.level || "Nybegynner"}</p>
      ${counterHtml}
      <h4>Dine quizzer</h4>
      ${listHtml}
    </div>`;
  document.body.appendChild(modal);
  modal.style.display = "flex";
  modal.querySelector(".close-badge").onclick = () => modal.remove();
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
}

// --------------------------------------
// BESØKTE STEDER – samling
// --------------------------------------
function renderCollection() {
  const grid = document.getElementById("collectionGrid");
  const count = document.getElementById("collectionCount");
  if (!grid) return;

  const visited = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const items = PLACES.filter(p => !!visited[p.id]);
  if (count) count.textContent = items.length;

  if (!items.length) {
    grid.innerHTML = `<div class="muted">Ingen steder besøkt ennå.</div>`;
    return;
  }

  grid.innerHTML = items.map(p => {
    const img = p.image || `bilder/kort/places/${p.id}.PNG`;
    return `
      <div class="visited-place" data-place="${p.id}" title="Trykk for å åpne ${p.name}">
        <img src="${img}" alt="${p.name}" class="visited-thumb">
        <div class="visited-label">${p.name}</div>
      </div>`;
  }).join("");

  grid.querySelectorAll(".visited-place").forEach(el => {
    el.addEventListener("click", () => {
      const pid = el.dataset.place;
      const plc = PLACES.find(p => p.id === pid);
      if (plc) {
        closePlaceOverlay?.();
        showPlaceOverlay?.(plc);
      }
    });
  });
}

// --------------------------------------
// PERSON-INFO MODAL (wiki + kort)
// --------------------------------------
async function showPersonInfoModal(person) {
  try {
    const wikiUrl = `https://no.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=extracts&exintro=true&titles=${encodeURIComponent(person.name)}`;
    const res = await fetch(wikiUrl);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    const extract = page?.extract || "Ingen informasjon funnet.";

    const facePath = `bilder/people/${person.id}_face.PNG`;
    const cardPath = `bilder/kort/people/${person.id}.PNG`;
    let imgToUse = facePath;
    try {
      const check = await fetch(facePath, { method: "HEAD" });
      if (!check.ok) imgToUse = cardPath;
    } catch { imgToUse = cardPath; }

    const modal = document.createElement("div");
    modal.className = "person-info-modal";
    modal.innerHTML = `
      <div class="person-info-body">
        <button class="close-btn" aria-label="Lukk">✕</button>
        <div class="person-header">
          <img src="${imgToUse}" alt="${person.name}" class="person-face">
          <div>
            <h2>${person.name}</h2>
            ${person.year ? `<p class="muted">${person.year}</p>` : ""}
          </div>
        </div>
        <div class="person-info-text">${extract}</div>
        <div class="person-card-mini">
          <img src="${cardPath}" class="mini-card" alt="Kort">
          <p class="muted">Trykk for å åpne History Go-kortet</p>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector(".close-btn").onclick = () => modal.remove();
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
    modal.querySelector(".mini-card").onclick = () => openPlaceCardByPerson(person);
  } catch (err) {
    console.error("Feil ved lasting av personinfo:", err);
    showToast("Kunne ikke hente info 📚");
  }
}

// --------------------------------------
// INITIALISERING + DEL PROFIL
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

  // ✨ Ny delingsfunksjon
  const shareBtn = document.getElementById("shareProfileBtn");
  if (shareBtn && window.html2canvas) {
    shareBtn.addEventListener("click", () => {
      const node = document.getElementById("profileCard");
      if (!node) return;
      html2canvas(node).then(canvas => {
        const link = document.createElement("a");
        link.download = "min_profil.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("Profil lagret som bilde 📸");
      });
    });
  }

  setTimeout(() => {
    renderProfileCard();
    renderMerits();
    renderCollection();
    renderGallery();
    renderTimelineProfile();
  }, 600);
});

// --------------------------------------
// OPPDATERING OG ANIMASJON
// --------------------------------------
window.addEventListener("storage", (e) => {
  if (e.key === "visited_places") {
    renderCollection();
    renderGallery();
    renderTimelineProfile();
    highlightNewTimelineCards();
  }
});

function highlightNewTimelineCards() {
  const cards = document.querySelectorAll(".timeline-card");
  if (!cards.length) return;
  const last = cards[cards.length - 1];
  last.classList.add("new-highlight");
  setTimeout(() => last.classList.remove("new-highlight"), 2000);
}

// -- erstatt tidligere "const style = ..." i profile.js med dette --
const profileStyle = document.createElement("style");
profileStyle.textContent = `
  .new-highlight { animation: glowFade 2s ease; }
  @keyframes glowFade {
    0% { box-shadow: 0 0 10px #ffd600; transform: scale(1.04); }
    50% { box-shadow: 0 0 20px #ffec80; transform: scale(1.02); }
    100% { box-shadow: none; transform: scale(1); }
  }`;
document.head.appendChild(profileStyle);
