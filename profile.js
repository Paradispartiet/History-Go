// ============================================================
// === HISTORY GO – PROFILE.JS (ren v18, koblet mot app.js) ===
// ============================================================
//
// Denne filen håndterer kun profilsiden:
// 1. Profilkort (navn, emoji, farge)
// 2. Profilredigering
// 3. Deling av profilkort (html2canvas)
// 4. Tidslinje for historiekort
// 5. Kall til felles funksjoner fra app.js (merker, samling, galleri)
//
// app.js må være lastet først!
// ============================================================

// --------------------------------------
// PROFILKORT OG RENDERING
// --------------------------------------
function renderProfileCard() {
  const name = localStorage.getItem("user_name") || "Utforsker #182";
  const emoji = localStorage.getItem("user_avatar") || "🧭";
  const color = localStorage.getItem("user_color") || "#f6c800";
  const visitedCount = Object.keys(visited).length;
  const peopleCount = Object.keys(peopleCollected).length;
  const fav = Object.entries(merits).sort((a, b) => b[1].points - a[1].points)[0];
  const favCat = fav ? fav[0] : "Ingen ennå";

  const avatar = document.getElementById("profileAvatar");
  if (!avatar) return; // sikkerhet ved første lasting

  document.getElementById("profileName").textContent = name;
  avatar.textContent = emoji;
  avatar.style.borderColor = color;
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
      <label>Emoji</label>
      <input id="newEmoji" maxlength="2" value="${localStorage.getItem("user_avatar") || "🧭"}">
      <label>Farge</label>
      <input id="newColor" type="color" value="${localStorage.getItem("user_color") || "#f6c800"}">
      <button id="saveProfile">Lagre</button>
      <button id="cancelProfile" style="margin-left:6px;background:#444;color:#fff;">Avbryt</button>
    </div>`;
  document.body.appendChild(modal);

  modal.querySelector("#cancelProfile").onclick = () => modal.remove();

  modal.querySelector("#saveProfile").onclick = () => {
    const newName = modal.querySelector("#newName").value.trim() || "Utforsker #182";
    const newEmoji = modal.querySelector("#newEmoji").value.trim() || "🧭";
    const newColor = modal.querySelector("#newColor").value;

    // 🔹 lagre til localStorage
    localStorage.setItem("user_name", newName);
    localStorage.setItem("user_avatar", newEmoji);
    localStorage.setItem("user_color", newColor);

    // 🔹 oppdater direkte i DOM (uten å vente på reload)
    const nameEl = document.getElementById("profileName");
    const avatarEl = document.getElementById("profileAvatar");
    if (nameEl) nameEl.textContent = newName;
    if (avatarEl) {
      avatarEl.textContent = newEmoji;
      avatarEl.style.borderColor = newColor;
    }

    modal.remove();
    showToast("Profil oppdatert ✅");

    // 🔹 kjør renderProfileCard trygt hvis data finnes
    if (typeof renderProfileCard === "function") {
      try { renderProfileCard(); } catch(e) {}
    }
  };
}

document.getElementById("editProfileBtn")?.addEventListener("click", openProfileModal);

// --------------------------------------
// DEL PROFILKORT (vanlig skjermbilde)
// --------------------------------------
async function shareProfileCard() {
  const card = document.getElementById("profileCard");
  if (!card) return showToast("Fant ikke profilkortet");
  showToast("Lager bilde …");
  const canvas = await html2canvas(card, { backgroundColor: "#111", scale: 3, useCORS: true });
  const dataUrl = canvas.toDataURL("image/png");
  const blob = await fetch(dataUrl).then(r => r.blob());
  const file = new File([blob], "profilkort.png", { type: "image/png" });
  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: "Mitt History Go-kort", text: "Se min fremgang i History Go!" });
    showToast("Profilkort delt ✅");
  } else {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "profilkort.png";
    a.click();
    showToast("Bilde lastet ned ✅");
  }
}
document.getElementById("shareProfileBtn")?.addEventListener("click", shareProfileCard);

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

  const sorted = got
    .map(p => ({ ...p, year: p.year || 0 }))
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

  body.querySelectorAll(".timeline-card").forEach(c => {
    c.addEventListener("click", () => {
      const id = c.dataset.person;
      const pr = PEOPLE.find(p => p.id === id);
      if (pr) showPersonPopup(pr);
    });
  });
}

// --------------------------------------
// INITIALISERING
// --------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderProfileCard();
  renderTimelineProfile();
  renderUserBadges(); // fra app.js
  renderCollection(); // fra app.js
  renderGallery();    // fra app.js
});
