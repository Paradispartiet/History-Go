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

// Migrer gammel quiz_history inn i hg_learning_log_v1 (én-gangs).
try { window.HGLearningLog?.migrateLegacy?.(); } catch {}


function getUnlockState() {
  const unlocks = JSON.parse(localStorage.getItem("hg_unlocks_v1") || "{}");

  const byQuiz = unlocks.byQuiz || {};
  const quizIds = Object.keys(byQuiz);

  return {
    raw: unlocks,
    byQuiz,
    quizIds,
    visitedCount: quizIds.length
  };
}

function _esc(s){ return String(s ?? "").replace(/[&<>"']/g, ch => ({
  "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
}[ch]));}

// Sørg for at globale popup-funksjoner finnes i app.js
window.showPersonPopup = window.showPersonPopup || (() => {});
window.showPlacePopup  = window.showPlacePopup  || (() => {});

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


function getCompletedQuizUnitCount() {
  const quizProgress = ls("quiz_progress", {});
  const quizHistory = (window.HGLearningLog?.getQuizHistory?.() ?? []);

  const ids = new Set();

  if (Array.isArray(quizHistory)) {
    quizHistory.forEach(entry => {
      const id = String(entry?.id || entry?.targetId || "").trim();
      if (id) ids.add(id);
    });
  }

  if (quizProgress && typeof quizProgress === "object") {
    Object.values(quizProgress).forEach(value => {
      const completed = Array.isArray(value?.completed) ? value.completed : [];
      completed.forEach(id => {
        const key = String(id || "").trim();
        if (key) ids.add(key);
      });
    });
  }

  return ids.size;
}

function getCompletedPlaceCount() {
  const { byQuiz } = getUnlockState();
  const unlockedIds = Object.keys(byQuiz || {});
  const placeIds = new Set((Array.isArray(PLACES) ? PLACES : []).map(p => String(p?.id || "").trim()));
  return unlockedIds.filter(id => placeIds.has(String(id || "").trim())).length;
}


// ------------------------------------------------------------
// PROFILKORT
// ------------------------------------------------------------
function renderProfileCard() {
  const streak = Number(localStorage.getItem("user_streak") || 0);
  const userName = localStorage.getItem("user_name") || "Utforsker #182";

  const placeCount = getCompletedPlaceCount();
  const quizUnitCount = getCompletedQuizUnitCount();

  document.getElementById("profileName").textContent = userName;
  document.getElementById("statVisited").textContent = placeCount;
  document.getElementById("statQuizzes").textContent = quizUnitCount;
  document.getElementById("statStreak").textContent = streak;

  const visitedLabel = document.getElementById("statVisitedLabel");
  if (visitedLabel) visitedLabel.textContent = "Steder";

  const quizzesLabel = document.getElementById("statQuizzesLabel");
  if (quizzesLabel) quizzesLabel.textContent = "Quizsett";

  const visitedEl = document.getElementById("statVisited");
  if (visitedEl) visitedEl.title = "Antall steder du har låst opp.";

  const quizzesEl = document.getElementById("statQuizzes");
  if (quizzesEl) quizzesEl.title = "Antall fullførte quizenheter. Set-baserte quizer teller per sett.";

  renderPC();
}

// ------------------------------------------------------------
// PARADISECOIN (PC) – PROFIL
// ------------------------------------------------------------
function renderPC() {
  const el = document.getElementById("pcValue");
  if (!el) return;

  const pc =
    (typeof window.getPCWallet === "function")
      ? Number(window.getPCWallet() || 0)
      : Number(
          JSON.parse(localStorage.getItem("hg_pc_wallet_v1") || "{}").pc || 0
        );

  el.textContent = pc;
}

function renderNextUpProfileCard() {
  const card = document.getElementById("nextUpProfileCard");
  if (!card) return;
  const metaEl = document.getElementById("nextUpProfileMeta");
  const choicesEl = document.getElementById("nextUpProfileChoices");
  const pathEl = document.getElementById("nextUpProfilePath");
  if (!metaEl || !choicesEl || !pathEl) return;

  const summary = typeof window.getNextUpProfileSummary === "function"
    ? window.getNextUpProfileSummary()
    : null;

  if (!summary) {
    card.style.display = "none";
    return;
  }

  const activeMode = summary.active_mode || "nearest";
  const learningStyle = summary.learning_style || "Under utvikling";
  const direction = summary.current_direction || "NextUp lærer retningen din når du bruker forslagene.";
  const recentChoices = Array.isArray(summary.recent_choices) ? summary.recent_choices.slice(0, 3) : [];
  const path = summary.active_path || null;

  metaEl.innerHTML = `
    <div><strong>Aktiv modus:</strong> ${_esc(activeMode)}</div>
    <div><strong>Læringsstil:</strong> ${_esc(learningStyle)}</div>
    <div><strong>Du følger for tiden:</strong> ${_esc(direction)}</div>
  `;
  choicesEl.innerHTML = recentChoices.length
    ? `<strong>Siste NextUp-valg:</strong> ${_esc(recentChoices.join(" → "))}`
    : `<strong>Siste NextUp-valg:</strong> Ingen valg logget ennå`;
  pathEl.innerHTML = path
    ? `<strong>Pågående rute:</strong> ${_esc(path.title || "Rute i utvikling")} · ${Number(path.step_count || 0)} steg`
    : "";
  card.style.display = "block";
}






function readGroundhopperStats() {
  try {
    const raw = localStorage.getItem("hg_groundhopper_stats_v1");
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

function asCount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function resolveGroundName(placeId) {
  const id = String(placeId || "").trim();
  if (!id) return "Ukjent sted";
  const sources = [
    Array.isArray(PLACES) ? PLACES : [],
    Array.isArray(window.allPlaces) ? window.allPlaces : [],
    Array.isArray(window.HGPlaces) ? window.HGPlaces : []
  ];
  for (const src of sources) {
    const found = src.find((p) => String(p?.id || "").trim() === id);
    if (found?.name) return found.name;
  }
  return id;
}

function getGroundhopperRecentVisits(stats) {
  const keys = ["recent_visits", "recentVisited", "recent_places", "visited_places", "visits"];
  for (const key of keys) {
    const arr = stats?.[key];
    if (Array.isArray(arr) && arr.length) return arr;
  }
  return [];
}

function renderGroundhopperProfilePanel() {
  const panel = document.getElementById("groundhopperProfilePanel");
  const emptyEl = document.getElementById("groundhopperEmpty");
  const bodyEl = document.getElementById("groundhopperBody");
  const gridEl = document.getElementById("groundhopperStatGrid");
  const clubsEl = document.getElementById("groundhopperClubsLine");
  const lastEl = document.getElementById("groundhopperLastVisited");
  const recentListEl = document.getElementById("groundhopperRecentList");
  const visitedListEl = document.getElementById("groundhopperVisitedList");
  const visitedHintEl = document.getElementById("groundhopperVisitedHint");
  const achievementsEl = document.getElementById("groundhopperAchievements");
  const toplineEl = document.getElementById("groundhopperTopline");

  if (!panel || !emptyEl || !bodyEl || !gridEl || !clubsEl || !lastEl || !recentListEl || !visitedListEl || !visitedHintEl || !achievementsEl || !toplineEl) return;

  const stats = readGroundhopperStats() || {};
  const totalVisited = asCount(stats?.total_groundhopper_places_visited);

  if (!stats || totalVisited <= 0) {
    emptyEl.style.display = "block";
    bodyEl.style.display = "none";
    return;
  }

  const statRows = [
    ["Steder besøkt", asCount(stats.total_groundhopper_places_visited)],
    ["Groundhopper-nivå", (window.HG_getGroundhopperLevel?.(stats)?.label || "Ikke startet")],
    ["Fotballgrounds", asCount(stats.total_football_grounds_visited)],
    ["Ishaller", asCount(stats.total_ice_arenas_visited)],
    ["Friidrett", asCount(stats.total_athletics_venues_visited)],
    ["Vintersport", asCount(stats.total_winter_sport_places_visited)],
    ["Nasjonalarenaer", asCount(stats.total_national_arenas_visited)]
  ];

  gridEl.innerHTML = statRows
    .map(([label, value]) => `<div class="groundhopper-stat-card"><span>${_esc(value)}</span><small>${_esc(label)}</small></div>`)
    .join("");
  const level = window.HG_getGroundhopperLevel?.(stats) || { label: "Ikke startet", next: 1, progress: 0, remaining: 1 };
  toplineEl.textContent = level.next == null
    ? `Nivå: ${level.label} · Maksnivå nådd`
    : `Nivå: ${level.label} · ${level.remaining} sted(er) til neste nivå (${Math.round(level.progress * 100)}%)`;

  const clubsCollected = Array.isArray(stats.clubs_collected) ? stats.clubs_collected.length : 0;
  clubsEl.textContent = `Klubber samlet: ${clubsCollected}`;

  const visitIds = Array.isArray(stats.visited_groundhopper_places) ? stats.visited_groundhopper_places : [];
  const visits = visitIds
    .map((entry) => {
      if (typeof entry === "string") return { placeId: entry, visitedAt: Number(stats?.last_visit_by_place?.[entry] ? Date.parse(stats.last_visit_by_place[entry]) : 0) };
      return {
        placeId: String(entry?.placeId || entry?.place_id || entry?.id || "").trim(),
        visitedAt: Number(entry?.visitedAt || entry?.visited_at || entry?.ts || entry?.timestamp || 0)
      };
    })
    .filter((entry) => entry.placeId);

  visits.sort((a, b) => b.visitedAt - a.visitedAt);
  const latest = visits[0];
  lastEl.textContent = `Sist besøkt: ${latest ? resolveGroundName(latest.placeId) : "—"}`;

  const recent = visits.slice(0, 5);
  recentListEl.innerHTML = recent.length
    ? recent.map((entry) => `<li>${_esc(resolveGroundName(entry.placeId))}</li>`).join("")
    : "<li>Ingen stedsliste tilgjengelig ennå.</li>";
  const fullVisited = visits;
  const showAll = fullVisited.length <= 10;
  const visibleVisited = showAll ? fullVisited : fullVisited.slice(0, 10);
  visitedHintEl.textContent = showAll ? "" : "Viser de siste 10.";
  visitedListEl.innerHTML = visibleVisited.length
    ? visibleVisited.map((entry) => `<li>${_esc(resolveGroundName(entry.placeId))}</li>`).join("")
    : "<li>Du har ikke besøkt noen Groundhopper-steder ennå.</li>";
  const achievements = Array.isArray(window.HG_getGroundhopperAchievements?.(stats)) ? window.HG_getGroundhopperAchievements(stats) : [];
  achievementsEl.innerHTML = achievements.map((item) => `
    <article class="groundhopper-achievement ${item.unlocked ? "is-unlocked" : ""}">
      <div class="groundhopper-achievement-label">${item.unlocked ? "🏆" : "🎯"} ${_esc(item.label)}</div>
      <div class="groundhopper-achievement-desc">${_esc(item.desc)}</div>
      <div class="groundhopper-achievement-progress">${Math.min(item.target, Number(item.progress || 0))}/${item.target}</div>
    </article>
  `).join("");

  emptyEl.style.display = "none";
  bodyEl.style.display = "block";
}
window.HG_renderGroundhopperProfilePanel = renderGroundhopperProfilePanel;

// ------------------------------------------------------------
// MERKER – GRID + MODAL (STRICT)
// ------------------------------------------------------------

async function renderMerits() {

  const box = document.getElementById("merits");
  if (!box) return;

  const merits = ls("merits_by_category", {});
  const keys = Object.keys(merits);

  // STRICT: vi prøver først badge.id som key (canonical).
  // Backward-compat: hvis noen gamle keys er badge.name, støtter vi det også – men uten "includes".
  function getBadgeForMeritKey(key) {
  const k = String(key || "").trim();
  if (!k) return null;

  // 1) canonical: id (strict)
  let b = BADGES.find(x => String(x?.id || "").trim() === k);
  if (b) return b;

  // 2) strict fallback: name (no includes)
  b = BADGES.find(x => String(x?.name || "").trim() === k);
  if (b) return b;

  // 3) strict fallback: noen datasett bruker categoryId/key
  b = BADGES.find(x =>
    String(x?.categoryId || "").trim() === k ||
    String(x?.key || "").trim() === k
  );
  if (b) return b;

  // 4) strict fallback: prøv prefiks (hvis du noen gang har lagret sånn)
  b = BADGES.find(x => String(x?.id || "").trim() === `badge_${k}`);
  if (b) return b;

  return null;
}
  box.innerHTML = keys
    .map((k) => {
const badge = getBadgeForMeritKey(k);
if (!badge) {
  if (window.DEBUG) console.warn("[profile] renderMerits: no badge for merit key:", k);
  return ""; // ikke render “ukjent”-kort (ingen 🏷️)
}

      const merit = merits[k] || {};
      const points = Number(merit.points || 0);

      // Sannhet: beregn nivå fra poeng + badge.tiers.threshold (ikke fra lagret level-tekst)
      const { tierIndex, label } = deriveTierFromPoints(badge, points);

      const medal =
        tierIndex === 0 ? "🥉" :
        tierIndex === 1 ? "🥈" :
        tierIndex === 2 ? "🥇" :
        tierIndex >= 3 ? "🏆" : "";


      return `
  <div class="badge-mini" data-badge-id="${badge.id}">
    <div class="badge-wrapper">
      <img src="${badge.image || badge.icon || badge.img || badge.imageCard || ""}" class="badge-mini-icon" alt="${badge.name}">
      <span class="badge-medal">${medal}</span>
    </div>
    <div class="badge-mini-level">${label}</div>
  </div>`;

    })
    .join("");

  // Klikk → modal
  box.querySelectorAll(".badge-mini").forEach(el => {
    el.addEventListener("click", () => {
      const id = String(el.dataset.badgeId || "").trim();
      const badge = BADGES.find(b => String(b.id || "").trim() === id);
      if (!badge) {
        if (window.DEBUG) console.warn("[profile] click badge: not found", id);
        return;
      }
      openBadgeModal(badge);
    });
  });
}


function openBadgeModal(badge) {
  const modal = document.getElementById("badgeModal");
  if (!modal || !badge) return;

  // --- MERITS INFO (canonical key = badge.id) ---
  const merits = ls("merits_by_category", {});
  const info =
    merits[String(badge.id || "").trim()] ||
    merits[String(badge.name || "").trim()] ||
    { level: "Nybegynner", points: 0 };

  const points = Number(info.points || 0);
  const { label } = deriveTierFromPoints(badge, points);

  modal.querySelector(".badge-img").src = (badge.image || badge.icon || badge.img || badge.imageCard || "");
  modal.querySelector(".badge-title").textContent = badge.name;

  // Vis nivå fra tiers (kanonisk), ikke lagret tekst
  modal.querySelector(".badge-level").textContent = label || "Nybegynner";
  modal.querySelector(".badge-progress-text").textContent = `${points} poeng`;

  // Progressbar
  const bar = modal.querySelector(".badge-progress-bar");
  const tiers = Array.isArray(badge.tiers) ? badge.tiers : [];
  const max = tiers.length ? Number(tiers[tiers.length - 1].threshold || 1) : 1;
  if (bar) {
    bar.style.width = `${Math.min(100, (points / Math.max(1, max)) * 100)}%`;
  }

  // --- QUIZ-HISTORIKK (STRICT) ---
  const history = (window.HGLearningLog?.getQuizHistory?.() ?? []);

  const catId = String(badge.id || "").trim();

  // STRICT compare: trim only (ingen lower/normalize)
  const items = history.filter(h => String(h?.categoryId || "").trim() === catId);

  const list = modal.querySelector(".badge-quizzes");
  if (!list) return;

  if (!items.length) {
    list.innerHTML = "<li>Ingen quiz fullført i denne kategorien ennå.</li>";
  } else {
    list.innerHTML = items.map(h => {
      const date = h.date ? new Date(h.date).toLocaleDateString("no-NO") : "";

      const ca = Array.isArray(h.correctAnswers) ? h.correctAnswers : [];
      const correct = Number.isFinite(h.correctCount) ? h.correctCount : ca.length;
      const total = Number.isFinite(h.total) ? h.total : (correct || ca.length || 0);
      const score = `${correct}/${total || correct}`;

      const imgHtml = h.image ? `<img class="badge-quiz-img" src="${h.image}">` : "";

      const answersHtml = ca.length
        ? `
          <ul class="badge-quiz-answers">
            ${ca.map(a => `
              <li class="badge-quiz-q">
                <strong>${a?.question || ""}</strong><br>
                ✔ ${a?.answer || ""}
              </li>
            `).join("")}
          </ul>
        `
        : `<div class="badge-quiz-muted">Ingen svar-detaljer lagret for denne quizen.</div>`;

      return `
        <li class="badge-quiz-item">
          ${imgHtml}
          <div class="badge-quiz-info">
            <strong>${h.name || "Quiz"}</strong><br>
            ${date ? `<span>${date}</span><br>` : ""}
            <span class="badge-quiz-score">Score: ${score}</span>
            ${answersHtml}
          </div>
        </li>
      `;
    }).join("");
  }

  // åpne modal
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  modal.onclick = e => {
    if (e.target && e.target.id === "badgeModal") closeBadgeModal();
  };

  const closeBtn = modal.querySelector(".close-btn");
  if (closeBtn) closeBtn.onclick = closeBadgeModal;
}

function closeBadgeModal() {
  const modal = document.getElementById("badgeModal");
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}
// ------------------------------------------------------------
// PERSONER
// ------------------------------------------------------------
function renderPeopleCollection() {
  const grid = document.getElementById("peopleGrid");
  if (!grid) return;

  const { byQuiz } = getUnlockState();
  const ids = Object.keys(byQuiz || {});

  const peopleUnlocked = ids
    .map(id => PEOPLE.find(p => String(p.id).trim() === String(id).trim()))
    .filter(Boolean);

  if (!peopleUnlocked.length) {
    grid.innerHTML = `<div class="muted">Ingen personer låst opp ennå.</div>`;
    return;
  }

  grid.innerHTML = peopleUnlocked.map(p => `
    <div class="avatar-card" data-person="${p.id}">
      ${p.image
        ? `<img src="${p.image}" class="avatar-img">`
        : `<div class="avatar-img" style="display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.15);border-radius:999px;">👤</div>`
      }
      <div class="avatar-name">${p.name}</div>
    </div>
  `).join("");

  grid.querySelectorAll(".avatar-card").forEach(el => {
    el.onclick = () => {
      const pr = PEOPLE.find(p => p.id === el.dataset.person);
      if (pr) window.showPersonPopup(pr);
    };
  });
}

// ------------------------------------------------------------
// STEDER
// ------------------------------------------------------------
function renderPlacesCollection() {
  const grid = document.getElementById("collectionGrid");
  if (!grid) return;

  const { byQuiz } = getUnlockState();
  const visited = byQuiz || {};
  const validPlaceIds = new Set((Array.isArray(PLACES) ? PLACES : []).map(p => String(p?.id || "").trim()));

  const places = Object.keys(visited)
    .map(id => String(id || "").trim())
    .filter(id => validPlaceIds.has(id))
    .map(id => PLACES.find(p => String(p.id).trim() === id))
    .filter(Boolean);

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
    el.onclick = () => {
      const pl = PLACES.find(p => p.id === el.dataset.place);
      if (pl) window.showPlacePopup(pl);
    };
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

  const { byQuiz } = getUnlockState();
  const visited = byQuiz;
  const collected = byQuiz;

  // TIMELINE = KUN BILDE (ikke kort)
  const items = [
    ...PLACES.filter(p => visited[p.id]).map(p => ({
      type:"place",
      id:p.id,
      name:p.name,
      year:Number(p.year)||0,
      image: p.image || `bilder/places/${p.id}.PNG`
    })),

    ...PEOPLE.filter(p => collected[p.id]).map(p => ({
      type:"person",
      id:p.id,
      name:p.name,
      year:Number(p.year)||0,
      image: p.image || `bilder/people/${p.id}.PNG`
    }))
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

      const pr = PEOPLE.find(p => p.id === id);
      if (pr) return window.showPersonPopup(pr);

      const pl = PLACES.find(p => p.id === id);
      if (pl) return window.showPlacePopup(pl);
    };
  });
}


function renderCollectionCards() {
  const body = document.getElementById("collectionCardsBody");
  if (!body) return;

  const { byQuiz } = getUnlockState();
  const visited = byQuiz;
  const collected = byQuiz;

  const placeCards = PLACES
    .filter(p => visited[p.id])
    .map(p => ({
      id: p.id,
      name: p.name,
      year: Number(p.year) || 0,
      image: p.cardImage
    }));

  const personCards = PEOPLE
    .filter(p => collected[p.id])
    .map(p => ({
      id: p.id,
      name: p.name,
      year: Number(p.year) || 0,
      image: p.imageCard
    }));

  const items = [...placeCards, ...personCards].sort((a,b) => a.year - b.year);

  if (!items.length) {
    body.innerHTML = `<div class="muted">Ingen kort låst opp ennå.</div>`;
    return;
  }

  body.innerHTML = items.map(x => `
    <div class="collection-card" data-id="${x.id}">
      <img src="${x.image}" alt="${x.name}">
      <div class="collection-card-name">${x.name}</div>
      <div class="collection-card-year">${x.year || ""}</div>
    </div>
  `).join("");

  body.querySelectorAll(".collection-card").forEach(el => {
    el.onclick = () => {
      const id = el.dataset.id;
      const pr = PEOPLE.find(p => p.id === id);
      if (pr) return window.showPersonPopup(pr);

      const pl = PLACES.find(p => p.id === id);
      if (pl) return window.showPlacePopup(pl);
    };
  });
}
// ------------------------------------------------------------
// BEGREPER DU HAR LÆRT (HGInsights → hg_insights_events_v1)
// ------------------------------------------------------------
function renderConcepts() {
  const listEl = document.getElementById("conceptsList");
  const emptyEl = document.getElementById("conceptsEmpty");
  const metaEl = document.getElementById("conceptsMeta");
  if (!listEl) return;

  const concepts = (typeof window.HGInsights?.getUserConcepts === "function")
    ? window.HGInsights.getUserConcepts("anon")
    : [];

  listEl.innerHTML = "";

  if (!concepts.length) {
    if (emptyEl) emptyEl.style.display = "";
    if (metaEl) metaEl.textContent = "Ingen begreper logget ennå";
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";

  const total = concepts.reduce((sum, c) => sum + (c.count || 0), 0);
  if (metaEl) metaEl.textContent = `${concepts.length} begreper · ${total} riktige svar`;

  const MAX = 40;
  const shown = concepts.slice(0, MAX);
  const frag = document.createDocumentFragment();

  shown.forEach(c => {
    const chip = document.createElement("span");
    const strong = (c.count || 0) >= 3;
    chip.className = "concept-chip" + (strong ? " is-strong" : "");
    chip.title = `${c.label} – ${c.count} riktige svar`;
    chip.innerHTML = `<span class="concept-label"></span><span class="concept-count"></span>`;
    chip.querySelector(".concept-label").textContent = c.label;
    chip.querySelector(".concept-count").textContent = String(c.count);
    frag.appendChild(chip);
  });

  if (concepts.length > MAX) {
    const more = document.createElement("span");
    more.className = "concept-chip";
    more.textContent = `+${concepts.length - MAX} til`;
    frag.appendChild(more);
  }

  listEl.appendChild(frag);
}

// ------------------------------------------------------------
// SISTE KUNNSKAP
// ------------------------------------------------------------
function renderLatestKnowledge() {
  const elTopic = document.getElementById("lkTopic");
  const elCat   = document.getElementById("lkCategory");
  const elText  = document.getElementById("lkText");
  if (!elTopic || !elCat || !elText) return;

  // Fallback hvis wrapperen (latestKnowledgeBox) ikke finnes i DOM
  const box =
    document.getElementById("latestKnowledgeBox") ||
    document.getElementById("profileKnowledge") ||
    elTopic.closest(".profile-card, .profile-section, .hg-card, .card") ||
    elTopic.parentElement;

  if (!box) return;

  // Hent knowledge-univers – fallback til localStorage hvis funksjonen ikke gir noe
  let uni = (typeof window.getKnowledgeUniverse === "function") ? window.getKnowledgeUniverse() : null;
  if (!uni || !Object.keys(uni).length) {
    try { uni = JSON.parse(localStorage.getItem("knowledge_universe") || "{}"); }
    catch { uni = {}; }
  }

  const flat = [];
  for (const cat of Object.keys(uni || {})) {
    const dims = uni[cat] || {};
    for (const dim of Object.keys(dims)) {
      const arr = dims[dim] || [];
      arr.forEach(k => flat.push({ category: cat, dimension: dim, item: k }));
    }
  }

  if (!flat.length) {
    box.style.display = "none";
    return;
  }

  const last = flat[flat.length - 1];
  const item = last.item || {};

  elTopic.textContent = item.topic || item.question || "Kunnskap";
  elCat.textContent = (last.category || "").charAt(0).toUpperCase() + (last.category || "").slice(1);
  elText.textContent = item.text || item.knowledge || "";

  box.style.display = "block";
}

/**
 * @typedef {Record<string, unknown>} ProfileRecord
 * @typedef {object} ProfileKnowledgeReport
 * @property {boolean=} ok
 * @property {ProfileRecord=} summary
 * @property {ProfileRecord=} sourceState
 * @property {ProfileRecord=} subjects
 * @property {unknown[]=} recommendations
 * @property {unknown=} healthReport
 * @property {string=} generatedAt
 */

/**
 * @returns {Promise<void>}
 */
async function renderKnowledgeEnginePanel() {
  const panel = document.getElementById("knowledgeEnginePanel");
  const metaEl = document.getElementById("knowledgeEngineMeta");
  const summaryEl = document.getElementById("knowledgeEngineSummary");
  const subjectsEl = document.getElementById("knowledgeEngineSubjects");
  const recsEl = document.getElementById("knowledgeEngineRecommendations");
  const signalsEl = document.getElementById("knowledgeEngineSignals");
  if (!panel || !metaEl || !summaryEl || !subjectsEl || !recsEl || !signalsEl) return;

  if (typeof window.HGKnowledgeEngine?.run !== "function") {
    summaryEl.innerHTML = `<div class="muted">Kunnskapsmotoren er ikke lastet ennå.</div>`;
    return;
  }

  try {
    /** @type {ProfileKnowledgeReport | null} */
    const report = await window.HGKnowledgeEngine.run({ cache: "default" });
    window.hgKnowledgeReport = report;

    if (report?.ok !== true) {
      summaryEl.innerHTML = `<div class="muted">Kunnskapsmotoren kunne ikke lage rapport akkurat nå.</div>`;
      return;
    }

    /** @type {ProfileRecord} */
    const summary = report?.summary || {};
    /** @type {ProfileRecord} */
    const sourceState = report?.sourceState || {};
    const summaryCards = [
      [`${Number(summary.subjects || 0)}`, "fag"],
      [`${Number(summary.totalEmner || 0)}`, "emner"],
      [`${Number(summary.totalKnownEmner || 0)}`, "kjente emner"],
      [`${Number(summary.averageCoverage || 0)} %`, "snittdekning"],
      [`${Number(sourceState.subjectsWithSignalsCount || 0)}`, "fag med signaler"],
      [`${Number(summary.healthErrors || 0)} / ${Number(summary.healthWarnings || 0)}`, "feil / varsler"]
    ];
    summaryEl.innerHTML = summaryCards
      .map(([value, label]) => `<div class="knowledge-engine-summary-card"><strong>${_esc(value)}</strong><span>${_esc(label)}</span></div>`)
      .join("");

    /** @type {unknown[]} */
    const allSubjects = Object.values(report?.subjects || {});
    const eligible = allSubjects.filter((subject) => {
      const progress = subject?.progress || {};
      const signals = subject?.signals?.summary || {};
      return Number(progress.knownEmner || 0) > 0 || Number(signals.totalSignals || 0) > 0;
    });
    const strongest = eligible
      .sort((a, b) => Number(b?.progress?.estimatedCoverage || 0) - Number(a?.progress?.estimatedCoverage || 0))
      .slice(0, 5);

    if (!strongest.length) {
      subjectsEl.innerHTML = `<div class="muted">Du har ikke nok registrerte læringssignaler ennå.</div>`;
    } else {
      const weakest = (Array.isArray(summary.weakestSubjects) ? summary.weakestSubjects : [])
        .slice(0, 3)
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object" && item.subjectId) return item.subjectId;
          return "";
        })
        .filter(Boolean);

      const weakestFallback = allSubjects
        .filter((s) => Number(s?.progress?.emnerCount || 0) >= 10)
        .sort((a, b) => {
          const cov = Number(a?.progress?.estimatedCoverage || 0) - Number(b?.progress?.estimatedCoverage || 0);
          if (cov !== 0) return cov;
          return Number(b?.progress?.emnerCount || 0) - Number(a?.progress?.emnerCount || 0);
        })
        .slice(0, 3)
        .map((s) => String(s?.subjectId || ""));

      const weakestIds = weakest.length ? weakest : weakestFallback;

      subjectsEl.innerHTML = `
        ${strongest.map((subject) => {
          const sid = String(subject?.subjectId || "");
          const p = subject?.progress || {};
          const s = subject?.signals?.summary || {};
          const coverage = Math.max(0, Math.min(100, Number(p.estimatedCoverage || 0)));
          return `<article class="knowledge-engine-subject-card">
            <div class="knowledge-engine-subject-title"><span>${_esc(sid)}</span><span>${_esc(`${Number(p.knownEmner || 0)} / ${Number(p.emnerCount || 0)} emner · ${coverage} %`)}</span></div>
            <div class="knowledge-engine-bar"><div class="knowledge-engine-bar-fill" style="width:${coverage}%;"></div></div>
            <div class="knowledge-engine-chip-row">
              <span class="knowledge-engine-chip">Direkte læring: ${_esc(Number(s.directLearningSignals || 0))}</span>
              <span class="knowledge-engine-chip">Besøkte steder: ${_esc(Number(s.visitedPlaceSignals || 0))}</span>
              <span class="knowledge-engine-chip">Streams: ${_esc(Number(s.streamSignals || 0))}</span>
              <span class="knowledge-engine-chip">Begreper: ${_esc(Number(s.conceptSignals || 0))}</span>
            </div>
          </article>`;
        }).join("")}
        <div class="knowledge-engine-summary-card"><strong>Svakeste fag nå:</strong> ${_esc(weakestIds.join(", ") || "Ingen tydelige kandidater ennå")}</div>
      `;
    }

    /** @type {unknown[]} */
    const recs = Array.isArray(report?.recommendations) ? report.recommendations.slice(0, 3) : [];
    recsEl.innerHTML = recs.length
      ? recs.map((rec) => `<article class="knowledge-engine-recommendation"><strong>${_esc(rec?.title || "Anbefaling")}</strong><div>${_esc(rec?.reason || "")}</div><small>${_esc(rec?.subjectId ? `Fag: ${rec.subjectId}` : "")}</small></article>`).join("")
      : `<div class="muted">Ingen anbefalinger akkurat nå.</div>`;

    const signalSubjects = allSubjects.filter((subject) => Number(subject?.signals?.summary?.totalSignals || 0) > 0);
    signalsEl.innerHTML = signalSubjects.length ? signalSubjects.map((subject) => {
      const sid = String(subject?.subjectId || "");
      const breakdown = subject?.signals?.breakdown || {};
      const summarySig = subject?.signals?.summary || {};
      const sourcePlaces = Array.isArray(summarySig.sourcePlaceIds) ? summarySig.sourcePlaceIds : [];
      const sourceEmner = Array.isArray(summarySig.sourceEmneIds) ? summarySig.sourceEmneIds : [];
      const visited = Array.isArray(breakdown.visitedPlaces) ? breakdown.visitedPlaces : [];
      const direct = Array.isArray(breakdown.directLearning) ? breakdown.directLearning.slice(0, 5) : [];
      return `<article class="knowledge-engine-signal-group">
        <div class="knowledge-engine-subject-title"><span>${_esc(sid)}</span><span>${_esc(`${Number(summarySig.totalSignals || 0)} signaler`)}</span></div>
        <div class="knowledge-engine-chip-row">
          <span class="knowledge-engine-chip">directLearning: ${_esc(Number(summarySig.directLearningSignals || 0))}</span>
          <span class="knowledge-engine-chip">visitedPlaces: ${_esc(Number(summarySig.visitedPlaceSignals || 0))}</span>
          <span class="knowledge-engine-chip">streams: ${_esc(Number(summarySig.streamSignals || 0))}</span>
          <span class="knowledge-engine-chip">concepts: ${_esc(Number(summarySig.conceptSignals || 0))}</span>
        </div>
        <div class="muted">Kilde-steder: ${_esc(sourcePlaces.join(", ") || "—")}</div>
        <div class="muted">Kilde-emner: ${_esc(sourceEmner.join(", ") || "—")}</div>
        <div>${visited.map((v) => `${_esc(v.placeName || v.placeId || "Sted")} → ${_esc(v.emne_id || "ukjent emne")}`).join("<br>") || "Ingen stedskoblinger registrert."}</div>
        <div style="margin-top:6px;">${direct.map((d) => `${_esc(d.emne_id || "")} · ${_esc(`${d.seen ? "seen" : "not-seen"}/${d.understood ? "understood" : "not-understood"}/${d.applied ? "applied" : "not-applied"}`)} · score ${_esc(Number(d.score || 0))}`).join("<br>") || "Ingen direkte læringssignal registrert."}</div>
      </article>`;
    }).join("") : `<div class="muted">Ingen signalforklaring tilgjengelig ennå.</div>`;

    metaEl.textContent = `Analysert ${Number(summary.subjects || 0)} fag · ${Number(summary.totalEmner || 0)} emner`;
  } catch (e) {
    console.warn("[profile] Knowledge Engine panel failed", e);
    summaryEl.innerHTML = `<div class="muted">Kunnskapsmotoren kunne ikke lage rapport akkurat nå.</div>`;
  }
}

function renderLatestTrivia() {
  const elTopic = document.getElementById("ltTopic");
  const elCat   = document.getElementById("ltCategory");
  if (!elTopic || !elCat) return;

  // Fallback hvis wrapperen (latestTriviaBox) ikke finnes i DOM
  const box =
    document.getElementById("latestTriviaBox") ||
    document.getElementById("profileTrivia") ||
    elTopic.closest(".profile-card, .profile-section, .hg-card, .card") ||
    elTopic.parentElement;

  if (!box) return;

  // Hent trivia-univers – fallback til localStorage hvis funksjonen ikke gir noe
  let uni = (typeof window.getTriviaUniverse === "function") ? window.getTriviaUniverse() : null;
  if (!uni || !Object.keys(uni).length) {
    try { uni = JSON.parse(localStorage.getItem("trivia_universe") || "{}"); }
    catch { uni = {}; }
  }

  const flat = [];
  for (const cat of Object.keys(uni || {})) {
    const bucket = uni[cat] || {};
    for (const id of Object.keys(bucket)) {
      const arr = bucket[id] || [];
      arr.forEach(t => {
        flat.push({ category: cat, id, trivia: t });
      });
    }
  }

  if (!flat.length) {
    box.style.display = "none";
    return;
  }

  const last = flat[flat.length - 1];
  elTopic.textContent = String(last.trivia || "").trim();
  elCat.textContent = (last.category || "").charAt(0).toUpperCase() + (last.category || "").slice(1);

  box.style.display = "block";
}
  

function renderNextWhy() {
  const sec = document.getElementById("nextWhySection");
  const txt = document.getElementById("nextWhyText");
  if (!sec || !txt) return;

  const because = String(localStorage.getItem("hg_nextup_because") || "").trim();
  if (!because) {
    sec.style.display = "none";
    return;
  }

  txt.textContent = `Fordi: ${because}`;
  sec.style.display = "block";
}

function renderAhaSummary() {
  const box = document.getElementById("ahaSummary");
  const a = document.getElementById("ahaTopConcept");
  const b = document.getElementById("ahaTopMeta");
  if (!box || !a || !b) return;

  const notes = ls("hg_user_notes_v1", []);
  const dialogs = ls("hg_person_dialogs_v1", []);
  const lastNote = notes.length ? notes[notes.length - 1] : null;
  const lastDlg  = dialogs.length ? dialogs[dialogs.length - 1] : null;

  if (!lastNote && !lastDlg) {
    box.style.display = "none";
    return;
  }

  a.textContent = lastNote ? `Siste notat: ${lastNote.title || "Notat"}` : "Siste dialog";
  b.textContent = lastNote ? (lastNote.text || "").slice(0, 90) : (lastDlg.text || "").slice(0, 90);

  box.style.display = "block";
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
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const safeCall = (name, fn) => {
      try {
        if (typeof fn !== "function") return;
        const res = fn();
        if (res && typeof res.then === "function") {
          res.catch(e => console.warn(`[profile] ${name} crashed`, e));
        }
      } catch (e) {
        console.warn(`[profile] ${name} crashed`, e);
      }
    };

    // Kart først
    safeCall("setupProfileMap", setupProfileMap);

    // LAST careers først
    if (typeof window.ensureCiviCareerRulesLoaded === "function") {
      await window.ensureCiviCareerRulesLoaded?.();
    }

    // LAST DATA via DataHub
    const [people, places, badges] = await Promise.all([
      (window.DataHub?.loadPeopleBase?.() || window.DataHub?.loadPeople?.()),
      (window.DataHub?.loadPlacesBase?.() || window.DataHub?.loadPlaces?.()),
      window.DataHub?.loadBadges?.()
    ]);

    PEOPLE = Array.isArray(people) ? people : [];
    PLACES = Array.isArray(places) ? places : [];
    BADGES = Array.isArray(badges?.badges) ? badges.badges : (Array.isArray(badges) ? badges : []);

    window.PEOPLE = PEOPLE;
    window.PLACES = PLACES;
    window.BADGES = BADGES;

    // Initial render
    safeCall("renderProfileCard", renderProfileCard);
    safeCall("renderPC", renderPC);
    safeCall("initCivication", () => window.CivicationUI?.init?.());
    safeCall("renderMerits", renderMerits);
    safeCall("renderPeopleCollection", renderPeopleCollection);
    safeCall("renderPlacesCollection", renderPlacesCollection);
    safeCall("renderTimeline", renderTimeline);
    safeCall("renderCollectionCards", renderCollectionCards);
    safeCall("renderLatestKnowledge", renderLatestKnowledge);
    safeCall("renderLatestTrivia", renderLatestTrivia);
    safeCall("renderConcepts", renderConcepts);
    safeCall("renderNextWhy", renderNextWhy);
    safeCall("renderAhaSummary", renderAhaSummary);
    safeCall("renderNextUpProfileCard", renderNextUpProfileCard);
    safeCall("renderGroundhopperProfilePanel", renderGroundhopperProfilePanel);
    safeCall("renderKnowledgeEnginePanel", renderKnowledgeEnginePanel);

    // Markører etter at PLACES er lastet
    safeCall("updateProfileMarkers", updateProfileMarkers);

    // UI-knapper
    document.getElementById("editProfileBtn")?.addEventListener("click", openProfileModal);
    document.getElementById("btnOpenAHA")?.addEventListener("click", () => window.open("https://paradispartiet.github.io/AHA-EchoNet/", "_blank"));

    // Sync etter quiz / endringer
    window.addEventListener("updateProfile", () => {
      safeCall("renderProfileCard", renderProfileCard);
      safeCall("renderPC", renderPC);

      safeCall("renderCivication", () => {
        window.CivicationUI?.render?.();
        window.CivicationUI?.renderInbox?.();
      });

      safeCall("renderMerits", renderMerits);
      safeCall("renderPeopleCollection", renderPeopleCollection);
      safeCall("renderPlacesCollection", renderPlacesCollection);
      safeCall("renderTimeline", renderTimeline);
      safeCall("renderCollectionCards", renderCollectionCards);
      safeCall("renderLatestKnowledge", renderLatestKnowledge);
      safeCall("renderLatestTrivia", renderLatestTrivia);
      safeCall("renderConcepts", renderConcepts);
      safeCall("renderNextWhy", renderNextWhy);
      safeCall("renderAhaSummary", renderAhaSummary);
      safeCall("renderNextUpProfileCard", renderNextUpProfileCard);
      safeCall("renderGroundhopperProfilePanel", renderGroundhopperProfilePanel);
      safeCall("renderKnowledgeEnginePanel", renderKnowledgeEnginePanel);
      safeCall("updateProfileMarkers", updateProfileMarkers);
    });

  } catch (e) {
    console.warn("[profile] init crashed", e);
  }
});
    
// ============================================================
// KART PÅ PROFILSIDEN – KUN BESØKTE STEDER
// ============================================================

let PROFILE_MAP = null;
let PROFILE_LAYER = null;

window.addEventListener("updateProfile", renderGroundhopperProfilePanel);
window.addEventListener("updateProfile", updateProfileMarkers);

function setupProfileMap() {
  if (typeof L === "undefined") return;

  if (!PROFILE_MAP) {
    PROFILE_MAP = L.map("map", {
      zoomControl: false,
      attributionControl: false
    }).setView([59.9139, 10.7522], 13);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19 }
    ).addTo(PROFILE_MAP);

    PROFILE_LAYER = L.layerGroup().addTo(PROFILE_MAP);
  }

  updateProfileMarkers();
}

function updateProfileMarkers() {
  if (!PROFILE_LAYER || !PLACES.length) return;

  const { byQuiz } = getUnlockState();
  const visited = byQuiz;

  PROFILE_LAYER.clearLayers();

  PLACES.filter(p => visited[p.id]).forEach(p => {
    const mk = L.circleMarker([p.lat, p.lon], {
      radius: 9,
      color: "#ffd700",
      weight: 2,
      fillColor: lighten(catColor(p.category), 0.35),
      fillOpacity: 1
    }).addTo(PROFILE_LAYER);

    mk.bindTooltip(p.name, { direction: "top" });

    mk.on("click", () => {
      if (window.showPlacePopup)
        window.showPlacePopup(p);
    });
  });
}

// ---------- FARGE / LIGHTEN ----------
function catColor(cat = "") {
  const c = cat.toLowerCase();

  if (c === "historie") return "#344B80";
  if (c === "vitenskap") return "#9b59b6";
  if (c === "kunst") return "#ffb703";
  if (c === "by") return "#e63946";
  if (c === "musikk") return "#ff66cc";
  if (c === "litteratur") return "#f6c800";
  if (c === "natur") return "#4caf50";
  if (c === "sport") return "#2a9d8f";
  if (c === "politikk") return "#c77dff";
  if (c === "naeringsliv") return "#ff8800";
  if (c === "populaerkultur") return "#ffb703";
  if (c === "subkultur") return "#ff66cc";
  if (c === "film_tv") return "#6c757d";
  if (c === "teater") return "#b5179e";
  if (c === "media") return "#ff595e";
  if (c === "psykologi") return "#06d6a0";

  return "#9b59b6";
}

function lighten(hex, amount = 0.35) {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  let r = Math.min(255, (num >> 16) + 255*amount);
  let g = Math.min(255, ((num >> 8)&255) + 255*amount);
  let b = Math.min(255, (num & 255) + 255*amount);
  return `rgb(${r},${g},${b})`;
}

function initProfileTabs() {
  const tabs = Array.from(document.querySelectorAll('.profile-tab'));
  const panels = Array.from(document.querySelectorAll('.profile-tab-panel'));
  if (!tabs.length || !panels.length) return;

  const activate = (name) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.panel === name);
    });
  };

  tabs.forEach((tab) => tab.addEventListener('click', () => activate(tab.dataset.tab)));
  activate(tabs[0].dataset.tab);
}

document.addEventListener('DOMContentLoaded', initProfileTabs);
