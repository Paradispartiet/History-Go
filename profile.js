// ============================================
// PROFILE.JS — HISTORY GO (endelig versjon)
// ============================================
(function () {
  if (!document.body.classList.contains('profile-page')) return;

  // --- Trygg JSON-lesing ---
  function read(key, fallback = {}) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  }

  // --- Lokale data ---
  const visited = read("visited", {});
  const peopleCollected = read("peopleCollected", {});
  const merits = read("merits_by_category", {});
  let name = localStorage.getItem("user_name") || "Utforsker #182";
  let emoji = localStorage.getItem("user_avatar") || "🧭";
  let color = localStorage.getItem("user_color") || "#f6c800";

  // --- PROFILKORT ---
  function renderProfileCard() {
    const avatar = document.getElementById("profileAvatar");
    const nameEl = document.getElementById("profileName");
    const statPlaces = document.getElementById("statPlaces");
    const statPeople = document.getElementById("statPeople");
    const statCategory = document.getElementById("statCategory");

    if (avatar) {
      avatar.textContent = emoji;
      avatar.style.borderColor = color;
    }
    if (nameEl) nameEl.textContent = name;
    if (statPlaces) statPlaces.textContent = `${Object.keys(visited).length} steder`;
    if (statPeople) statPeople.textContent = `${Object.keys(peopleCollected).length} personer`;

    const fav = Object.entries(merits)
      .sort((a, b) => (b[1].points || 0) - (a[1].points || 0))[0];
    if (statCategory) statCategory.textContent = fav ? `Favoritt: ${fav[0]}` : "Favoritt: –";
  }

  // --- MERKER ---
  async function renderUserBadges() {
    const grid = document.getElementById("userBadgesGrid");
    if (!grid) return;
    const localMerits = merits;
    const badges = await fetch("badges.json", { cache: "no-store" }).then(r => r.json());
    const owned = Object.keys(localMerits);

    if (!owned.length) {
      grid.innerHTML = `<div class="muted">Ingen merker ennå – ta quizer for å låse opp!</div>`;
      return;
    }

    grid.innerHTML = owned.map(cat => {
      const m = localMerits[cat];
      const b = badges.find(x => cat.toLowerCase().includes(x.id));
      if (!b) return "";
      return `
        <div class="badge-mini" title="${b.name}">
          <img src="${b.image}" alt="${b.name}">
          <div>${b.name}</div>
          <div class="badge-level">${m.level || "–"}</div>
        </div>`;
    }).join("");
  }

  // --- STEDER ---
  function renderVisitedPlaces() {
    const wrap = document.getElementById("collectionGrid");
    if (!wrap || !window.PLACES) return;
    const got = window.PLACES.filter(p => visited[p.id]);
    wrap.innerHTML = got.length
      ? got.map(p => `<button class="chip" data-open="${p.id}">📍 ${p.name}</button>`).join("")
      : `<div class="muted">Ingen steder besøkt ennå.</div>`;
  }

  // --- PERSONER ---
  function renderCollectedPeople() {
    const wrap = document.getElementById("gallery");
    if (!wrap || !window.PEOPLE) return;
    const got = window.PEOPLE.filter(p => peopleCollected[p.id]);
    wrap.innerHTML = got.length
      ? got.map(p => `
          <div class="card mini">
            <img src="${p.image || `bilder/kort/people/${p.id}.PNG`}" alt="${p.name}">
            <div class="title">${p.name}</div>
          </div>`).join("")
      : `<div class="muted">Ingen personer låst opp ennå.</div>`;
  }

  // --- TIDSLINJE ---
  function renderTimelineProfile() {
    const body = document.getElementById("timelineBody");
    const bar = document.getElementById("timelineProgressBar");
    const txt = document.getElementById("timelineProgressText");
    if (!body || !window.PEOPLE) return;

    const got = window.PEOPLE.filter(p => peopleCollected[p.id]);
    const total = window.PEOPLE.length;
    const count = got.length;
    const pct = total ? (count / total) * 100 : 0;

    if (bar) bar.style.width = `${pct.toFixed(1)}%`;
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

    body.querySelectorAll(".timeline-card").forEach(c => {
      c.addEventListener("click", () => {
        const id = c.dataset.person;
        const pr = window.PEOPLE.find(p => p.id === id);
        if (pr && typeof showPersonPopup === "function") showPersonPopup(pr);
      });
    });
  }

  // --- REDIGERINGSMODAL ---
  function setupEditModal() {
    const btn = document.getElementById("editProfileBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const modal = document.createElement("div");
      modal.className = "profile-modal";
      modal.innerHTML = `
        <div class="profile-modal-inner">
          <h3>Rediger profil</h3>
          <label>Navn:</label>
          <input id="editName" value="${name}">
          <label>Emoji (avatar):</label>
          <input id="editEmoji" value="${emoji}">
          <label>Farge:</label>
          <input id="editColor" type="color" value="${color}">
          <div style="text-align:right;margin-top:10px;">
            <button id="saveProfileBtn">Lagre</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      modal.querySelector("#saveProfileBtn").addEventListener("click", () => {
        name = document.getElementById("editName").value.trim() || name;
        emoji = document.getElementById("editEmoji").value.trim() || emoji;
        color = document.getElementById("editColor").value;
        localStorage.setItem("user_name", name);
        localStorage.setItem("user_avatar", emoji);
        localStorage.setItem("user_color", color);
        document.body.removeChild(modal);
        renderProfileCard();
      });

      modal.addEventListener("click", e => {
        if (e.target === modal) modal.remove();
      });
    });
  }

  // --- DEL PROFIL ---
  async function setupShare() {
    const btn = document.getElementById("shareProfileBtn");
    const poster = document.getElementById("profilePoster");
    if (!btn || !poster) return;

    btn.addEventListener("click", async () => {
      const posterAvatar = document.getElementById("posterAvatar");
      const posterName = document.getElementById("posterName");
      const posterStats = document.getElementById("posterStats");

      if (posterAvatar) posterAvatar.textContent = emoji;
      if (posterName) posterName.textContent = name;
      if (posterStats)
        posterStats.textContent = `${Object.keys(visited).length} steder · ${Object.keys(peopleCollected).length} personer`;

      poster.style.display = "block";
      const canvas = await html2canvas(poster, { backgroundColor: "#111", scale: 3 });
      poster.style.display = "none";

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "historygo_profil.png";
      a.click();
    });
  }

  // --- INIT ---
  document.addEventListener("DOMContentLoaded", () => {
    renderProfileCard();
    renderUserBadges();
    renderVisitedPlaces();
    renderCollectedPeople();
    renderTimelineProfile();
    setupEditModal();
    setupShare();
  });
})();
