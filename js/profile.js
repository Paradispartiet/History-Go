// ============================================================
// === HISTORY GO – PROFILE.JS (stabil, ren versjon) ==========
// ============================================================
//
// Viser og oppdaterer profilinformasjon:
//  • Redigerbart navn
//  • Statistikk (quiz, steder, poeng, merker, nivå)
//  • Tidslinjer for steder, personer og merker
//  • Trykkbare merker med modal ("Se alt")
//  • Del profil som bilde (html2canvas)
// ============================================================

// ------------------------------------------------------------
// INITIERING
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initEditableProfileName();
  initAutoProfileSync();
  initShareProfile();
  updateTimelines();
});

window.addEventListener("updateProfile", updateTimelines);

// ------------------------------------------------------------
// REDIGERBART NAVN
// ------------------------------------------------------------
function initEditableProfileName() {
  const nameEl = document.querySelector(".profile-card .name");
  if (!nameEl) return;

  const savedName = localStorage.getItem("playerName");
  if (savedName) nameEl.textContent = savedName;

  nameEl.addEventListener("blur", saveName);
  nameEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nameEl.blur();
    }
  });

  function saveName() {
    const newName = nameEl.textContent.trim();
    if (newName.length > 0) {
      localStorage.setItem("playerName", newName);
      window.dispatchEvent(new Event("updateProfile"));
    }
  }
}

// ------------------------------------------------------------
// AUTO-OPPDATER STATISTIKK
// ------------------------------------------------------------
function initAutoProfileSync() {
  function renderStats() {
    const statsEl = document.querySelector(".profile-stats");
    if (!statsEl) return;

    const completedQuizzes = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
    const visitedPlaces = JSON.parse(localStorage.getItem("visited_places") || "[]");
    const unlockedBadges = JSON.parse(localStorage.getItem("unlockedBadges") || "[]");
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

    const totalPoints = Object.values(merits).reduce((sum, m) => sum + (m.points || 0), 0);
    const level = Math.floor(totalPoints / 50) + 1;

    statsEl.querySelector(".stat-quizzes").textContent = Object.keys(completedQuizzes).length;
    statsEl.querySelector(".stat-places").textContent = visitedPlaces.length;
    statsEl.querySelector(".stat-badges").textContent = unlockedBadges.length;
    statsEl.querySelector(".stat-points").textContent = totalPoints;
    statsEl.querySelector(".stat-level").textContent = level;
  }

  renderStats();
  window.addEventListener("updateProfile", renderStats);
}

// ------------------------------------------------------------
// TIDSLINJE – STEDER
// ------------------------------------------------------------
function renderTimeline() {
  const container = document.getElementById("timeline");
  if (!container) return;

  const visited = JSON.parse(localStorage.getItem("visited_places") || "[]");
  visited.sort((a, b) => (a.year || 0) - (b.year || 0));

  container.innerHTML = visited.length
    ? visited.map(p => `
        <div class="timeline-item place">
          <h3>${p.name} (${p.year || "ukjent år"})</h3>
          <p>${p.desc || ""}</p>
          ${p.image ? `<img src="${p.image}" alt="${p.name}">` : ""}
        </div>
      `).join("")
    : "<p>Ingen steder besøkt ennå.</p>";
}

// ------------------------------------------------------------
// TIDSLINJE – PERSONER
// ------------------------------------------------------------
function renderPeopleTimeline() {
  const container = document.getElementById("peopleTimeline");
  if (!container) return;

  const people = JSON.parse(localStorage.getItem("people_collected") || "[]");
  people.sort((a, b) => a.name.localeCompare(b.name));

  container.innerHTML = people.length
    ? people.map(p => `
        <div class="timeline-item person">
          <h3>${p.name}</h3>
          ${p.image ? `<img src="${p.image}" alt="${p.name}">` : ""}
        </div>
      `).join("")
    : "<p>Ingen personer møtt ennå.</p>";
}

// ------------------------------------------------------------
// TIDSLINJE – MERKER
// ------------------------------------------------------------
function renderBadgeTimeline() {
  const container = document.getElementById("badgeTimeline");
  if (!container) return;

  const badges = JSON.parse(localStorage.getItem("unlockedBadges") || "[]");
  badges.sort((a, b) => a.name.localeCompare(b.name));

  container.innerHTML = badges.length
    ? badges.map(b => `
        <div class="timeline-item badge">
          <img src="${b.image || `bilder/merker/${b.id}.PNG`}" alt="${b.name}">
          <h3>${b.name}</h3>
        </div>
      `).join("")
    : "<p>Ingen merker låst opp ennå.</p>";

  setupBadgeModalListeners();
}

// ------------------------------------------------------------
// MODAL – "SE ALT" FOR MERKER
// ------------------------------------------------------------
function setupBadgeModalListeners() {
  document.querySelectorAll("#badgeTimeline .timeline-item.badge").forEach(item => {
    item.addEventListener("click", () => {
      const badgeName = item.querySelector("h3").textContent.trim();
      openBadgeModal(badgeName);
    });
  });
}

function openBadgeModal(badgeName) {
  const modal = document.getElementById("badgeModal");
  const titleEl = document.getElementById("badgeModalTitle");
  const bodyEl = document.getElementById("badgeModalContent");
  if (!modal || !titleEl || !bodyEl) return;

  const allBadges = JSON.parse(localStorage.getItem("unlockedBadges") || "[]");
  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  const found = allBadges.find(b => b.name === badgeName);
  const categoryId = found?.id || badgeName.toLowerCase();
  const catMerit = merits[categoryId] || { points: 0, valør: "Bronse" };

  titleEl.textContent = found?.name || badgeName;
  bodyEl.innerHTML = `
    <div style="text-align:center">
      <img src="${found?.image || `bilder/merker/${found?.id}.PNG`}" alt="${badgeName}">
      <p>${found?.desc || "Ingen beskrivelse tilgjengelig."}</p>
      <p><strong>Nivå:</strong> ${catMerit.valør} (${catMerit.points} poeng)</p>
    </div>
  `;
  modal.setAttribute("aria-hidden", "false");
}

function closeBadgeModal() {
  const modal = document.getElementById("badgeModal");
  if (modal) modal.setAttribute("aria-hidden", "true");
}

// ------------------------------------------------------------
// DEL PROFIL SOM BILDE (html2canvas må være lastet i HTML)
// ------------------------------------------------------------
function initShareProfile() {
  const btn = document.getElementById("shareProfileBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const main = document.querySelector("main");
    if (!main) return;

    btn.textContent = "📷 Lager bilde...";
    try {
      const canvas = await html2canvas(main, { scale: 2 });
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "historygo_profil.png";
      link.href = url;
      link.click();

      btn.textContent = "✅ Lagret som bilde!";
      setTimeout(() => (btn.textContent = "📸 Del profilen"), 2000);
    } catch (err) {
      console.error("Delingsfeil:", err);
      btn.textContent = "Feil under lagring";
    }
  });
}

// ------------------------------------------------------------
// OPPDATER ALLE TIDSLINJER
// ------------------------------------------------------------
function updateTimelines() {
  renderTimeline();
  renderPeopleTimeline();
  renderBadgeTimeline();
}
