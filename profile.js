// ============================================================
// === HISTORY GO – PROFILE.JS (v26, stabil + sortert tidslinje)
// ============================================================
//
//  Kombinerer det beste fra v21 og v24, med forbedret sortering:
//   ✅ Profilkort og redigering
//   ✅ Historiekort / tidslinje for både personer og steder
//   ✅ Merker og quiz-oversikt
//   ✅ Steds-kort i samling
//   ✅ Person-info med wiki-henting
//   ✅ Del profil som bilde (html2canvas)
//   🚫 Ingen BroadcastChannel (alt oppdateres lokalt)
// ============================================================

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
    showToast?.("Profil oppdatert ✅");
    modal.remove();
    renderProfileCard();
  };
}

// --------------------------------------
// HISTORIEKORT – TIDSLINJE (steder + personer, sortert etter år + navn)
// --------------------------------------
function renderTimelineProfile() {
  const body = document.getElementById("timelineBody");
  const bar = document.getElementById("timelineProgressBar");
  const txt = document.getElementById("timelineProgressText");
  if (!body) return;

  const visited = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");

  const collectedPlaces = PLACES.filter(p => !!visited[p.id]).map(p => ({
    ...p, type: "place", year: p.year || 0
  }));
  const collectedPeople = PEOPLE.filter(p => !!peopleCollected[p.id]).map(p => ({
    ...p, type: "person", year: p.year || 0
  }));

  const combined = [...collectedPlaces, ...collectedPeople].sort((a, b) => {
    const ay = a.year || 0;
    const by = b.year || 0;
    if (ay === by) return a.name.localeCompare(b.name);
    return ay - by;
  });

  const total = PLACES.length + PEOPLE.length;
  const count = combined.length;
  if (bar) bar.style.width = `${total ? (count / total) * 100 : 0}%`;
  if (txt) txt.textContent = `Du har samlet ${count} av ${total} historiekort`;

  if (!combined.length) {
    body.innerHTML = `<div class="muted">Du har ingen historiekort ennå.</div>`;
    return;
  }

  body.innerHTML = combined.map(item => `
    <div class="timeline-card" data-type="${item.type}" data-id="${item.id}">
      <img src="${item.type === 'person'
        ? (item.image || `bilder/kort/people/${item.id}.PNG`)
        : (item.image || `bilder/kort/places/${item.id}.PNG`)}" 
        alt="${item.name}">
      <div class="timeline-name">${item.name}</div>
      <div class="timeline-year">${item.year || "–"}</div>
    </div>`).join("");

  body.querySelectorAll(".timeline-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const type = card.dataset.type;
      if (type === "person") {
        const person = PEOPLE.find(p => p.id === id);
        if (person) showPersonInfoModal(person);
      } else {
        const place = PLACES.find(p => p.id === id);
        if (place) showPlaceOverlay?.(place);
      }
    });
  });
}

// --------------------------------------
// GALLERI (personer)
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
    </div>`).join("");

  gallery.querySelectorAll(".person-card").forEach(card => {
    card.addEventListener("click", () => {
      const person = PEOPLE.find(p => p.id === card.dataset.person);
      if (person) showPersonInfoModal(person);
    });
  });
}

// --------------------------------------
// MERKER
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
      <div class="badge-mini" data-badge="${badge.id}" role="button" tabindex="0">
        <div class="badge-wrapper">
          <img src="${badge.image}" alt="${badge.name}" class="badge-mini-icon">
          <span class="badge-medal">${medal}</span>
        </div>
      </div>`;
  }).join("");
}

// --------------------------------------
// STEDS-SAMLING
// --------------------------------------
function renderCollection() {
  const grid = document.getElementById("collectionGrid");
  if (!grid) return;

  const visited = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const items = PLACES.filter(p => !!visited[p.id]);

  if (!items.length) {
    grid.innerHTML = `<div class="muted">Ingen steder besøkt ennå.</div>`;
    return;
  }

  grid.innerHTML = items.map(p => `
    <div class="visited-place" data-place="${p.id}">
      <img src="${p.image || `bilder/kort/places/${p.id}.PNG`}" alt="${p.name}" class="visited-thumb">
      <div class="visited-label">${p.name}</div>
    </div>`).join("");

  grid.querySelectorAll(".visited-place").forEach(el => {
    el.addEventListener("click", () => {
      const place = PLACES.find(p => p.id === el.dataset.place);
      if (place) showPlaceOverlay?.(place);
    });
  });
}

// --------------------------------------
// PERSONINFO (med wiki)
// --------------------------------------
async function showPersonInfoModal(person) {
  try {
    const wikiUrl = `https://no.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=extracts&exintro=true&titles=${encodeURIComponent(person.name)}`;
    const res = await fetch(wikiUrl);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    const extract = page?.extract || "Ingen informasjon funnet.";

    const face = `bilder/people/${person.id}_face.PNG`;
    const card = `bilder/kort/people/${person.id}.PNG`;
    const imgToUse = person.image || face;

    const modal = document.createElement("div");
    modal.className = "person-info-modal";
    modal.innerHTML = `
      <div class="person-info-body">
        <button class="close-btn">✕</button>
        <div class="person-header">
          <img src="${imgToUse}" alt="${person.name}" class="person-face">
          <div><h2>${person.name}</h2>${person.year ? `<p class="muted">${person.year}</p>` : ""}</div>
        </div>
        <div class="person-info-text">${extract}</div>
        <div class="person-card-mini">
          <img src="${card}" class="mini-card" alt="Kort">
          <p class="muted">Trykk for å åpne History Go-kortet</p>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelector(".close-btn").onclick = () => modal.remove();
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
    modal.querySelector(".mini-card").onclick = () => openPlaceCardByPerson?.(person);
  } catch (err) {
    console.error("Wiki-feil:", err);
    showToast?.("Kunne ikke hente info 📚");
  }
}

// --------------------------------------
// INIT + DEL PROFIL – vent til data er lastet ferdig
// --------------------------------------
Promise.all([
  fetch("people.json").then(r => r.json()).then(d => PEOPLE = d),
  fetch("places.json").then(r => r.json()).then(d => PLACES = d),
  fetch("badges.json").then(r => r.json()).then(d => BADGES = d)
]).then(async () => {
  // Vent 600ms for å sikre at alt er klart fra app.js
  await new Promise(r => setTimeout(r, 600));

  renderProfileCard();
  renderMerits();
  renderCollection();
  renderGallery();
  renderTimelineProfile();
  console.log("✅ Profil ferdig lastet.");
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("editProfileBtn")?.addEventListener("click", openProfileModal);

  // Del profil som bilde
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
        showToast?.("Profil lagret som bilde 📸");
      });
    });
  }
});

// --------------------------------------
// ANIMASJON FOR NYE KORT
// --------------------------------------
const style = document.createElement("style");
style.textContent = `
  .new-highlight { animation: glowFade 2s ease; }
  @keyframes glowFade {
    0% { box-shadow: 0 0 10px #ffd600; transform: scale(1.04); }
    50% { box-shadow: 0 0 20px #ffec80; transform: scale(1.02); }
    100% { box-shadow: none; transform: scale(1); }
  }`;
document.head.appendChild(style);


// ------------------------------------------------------------
// SANNTIDSOPPDATERING FRA ALLE SIDER (synkronisering)
// ------------------------------------------------------------
//
//  Lytter etter endringer i localStorage (steder, personer, merker)
//  slik at profilen oppdateres automatisk uansett hvor quiz tas.
//

window.addEventListener("storage", (event) => {
  const keys = ["visited_places", "people_collected", "merits_by_category", "quiz_progress"];
  if (!keys.includes(event.key)) return;

  console.log("🔄 Oppdaterer profil etter endring:", event.key);
  try {
    renderProfileCard();
    renderCollection();
    renderGallery();
    renderMerits();
    renderTimelineProfile();
  } catch (err) {
    console.warn("⚠️ Oppdateringsfeil:", err);
  }
});

// ------------------------------------------------------------
// LOKAL OPPDATERING VED POENG ELLER QUIZ (samme fane)
// ------------------------------------------------------------
//
//  Hvis quizen tas i samme fane, trigges også et kunstig storage-event
//  slik at profilen oppdateres momentant uten å laste siden på nytt.
//
function triggerProfileUpdate() {
  window.dispatchEvent(new StorageEvent("storage", { key: "visited_places" }));
}

// Gjør funksjonen tilgjengelig globalt, slik at app.js kan kalle den
window.triggerProfileUpdate = triggerProfileUpdate;

// ------------------------------------------------------------
// FANG OPP NÅR APP.JS ER FERDIG LASTET OG DATA ER TILGJENGELIG
// ------------------------------------------------------------
window.addEventListener("load", () => {
  // Prøv på nytt når hele siden er ferdig og PLACES/PEOPLE finnes
  const waitForData = setInterval(() => {
    if (Array.isArray(window.PLACES) && window.PLACES.length > 0) {
      console.log("🔁 Data fra app.js tilgjengelig – oppdaterer profil");
      renderProfileCard();
      renderCollection();
      renderGallery();
      renderMerits();
      renderTimelineProfile();
      clearInterval(waitForData);
    }
  }, 500);

  // Avbryt etter 5 sekunder hvis ingenting lastes
  setTimeout(() => clearInterval(waitForData), 5000);
});
