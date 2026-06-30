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

function _t(key, fallback = "") {
  try {
    return window.HG_I18N?.t?.(key, fallback) || fallback;
  } catch {
    return fallback;
  }
}

function _tf(key, fallback = "", vars = {}) {
  const template = _t(key, fallback);
  return String(template).replace(/\{(\w+)\}/g, (_, name) => {
    return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`;
  });
}

function updateStatusBadgeA11y(valueEl, label, title) {
  const value = String(valueEl?.textContent || "0");
  const card = valueEl?.closest?.(".profile-stat-card");
  if (!card) return;

  card.setAttribute("aria-label", `${value} ${label}`);
  card.setAttribute("title", title);
}

// Sørg for at globale popup-funksjoner finnes i app.js
window.showPersonPopup = window.showPersonPopup || (() => {});
window.showPlacePopup  = window.showPlacePopup  || (() => {});

// GLOBALT
// var (not let) so TypeScript merges these with the matching globals in
// js/state/state.js; the files are never co-loaded (profile.js -> profile.html,
// state.js -> index.html), so this only silences the cross-file checkJs TS2451.
var PEOPLE = [];
var PLACES = [];
var BADGES = [];


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


/**
 * @param {string} storageKey
 * @returns {Set<string>}
 */
function readProgressIdSet(storageKey) {
  const raw = ls(storageKey, {});
  /** @type {Set<string>} */
  const ids = new Set();
  const addId = (value) => {
    if (value == null) return;
    if (["boolean", "function", "object", "symbol"].includes(typeof value)) return;
    const id = String(value).trim();
    if (id) ids.add(id);
  };

  if (Array.isArray(raw)) {
    raw.forEach(addId);
    return ids;
  }

  if (raw && typeof raw === "object") {
    Object.entries(raw).forEach(([id, value]) => {
      if (value) addId(id);
    });
  }

  return ids;
}

/**
 * @returns {Set<string>}
 */
function getVisitedPlaceIds() {
  return readProgressIdSet("visited_places");
}

/**
 * @returns {Set<string>}
 */
function getCollectedPeopleIds() {
  return readProgressIdSet("people_collected");
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

function getMusicUnlockSummary() {
  if (typeof window.HGAhaMusic?.getMusicUnlockSummary === "function") {
    return window.HGAhaMusic.getMusicUnlockSummary();
  }
  const rows = Object.values(ls("hg_unlocked_music_objects_v1", {}));
  const places = new Set(rows.map(item => String(item?.placeId || "").trim()).filter(Boolean));
  return {
    total: rows.length,
    artists: rows.filter(item => item?.type === "music_artist").length,
    tracks: rows.filter(item => item?.type === "music_track").length,
    places: places.size
  };
}

function getCompletedPlaceCount() {
  const visitedIds = /** @type {Set<string>} */ (/** @type {unknown} */ (getVisitedPlaceIds()));
  const placeIds = new Set((Array.isArray(PLACES) ? PLACES : [])
    .map(p => String(p?.id || "").trim())
    .filter(Boolean));

  if (!placeIds.size) return visitedIds.size;

  let count = 0;
  visitedIds.forEach(id => {
    if (placeIds.has(id)) count += 1;
  });
  return count;
}


// ------------------------------------------------------------
// PROFILKORT
// ------------------------------------------------------------
function renderProfileCard() {
  const streak = Number(localStorage.getItem("user_streak") || 0);
  const rawUserName =
    window.HGUserProfile?.getDisplayName?.() ||
    localStorage.getItem("user_name") ||
    "Gjest";
  const userName = rawUserName === "Logg inn" ? "Gjest" : rawUserName;

  const placeCount = getCompletedPlaceCount();
  const quizUnitCount = getCompletedQuizUnitCount();

  const profileNameEl = document.getElementById("profileName");
  if (profileNameEl) profileNameEl.textContent = userName;
  const visitedEl = document.getElementById("statVisited");
  if (visitedEl) visitedEl.textContent = String(placeCount);
  const quizzesEl = document.getElementById("statQuizzes");
  if (quizzesEl) quizzesEl.textContent = String(quizUnitCount);
  const streakEl = document.getElementById("statStreak");
  if (streakEl) streakEl.textContent = String(streak);

  const visitedLabelText = _t("ui.tabs.places", "Steder");
  const quizLabelText = _t("ui.profile.statQuizSets", "Quizsett");
  const streakLabelText = _t("ui.profile.statStreak", "Streak");
  const pcLabelText = _t("ui.profile.statPC", "PC");
  const musicSummary = getMusicUnlockSummary();

  const musicEl = document.getElementById("statMusicFinds");
  const musicLabel = document.getElementById("statMusicFindsLabel");
  if (musicEl && musicLabel) {
    musicEl.textContent = String(musicSummary.total);
    musicLabel.textContent = _t("ui.profile.musicFinds", "Musikkfunn");
  }

  const visitedLabel = document.getElementById("statVisitedLabel");
  if (visitedLabel) visitedLabel.textContent = visitedLabelText;

  const quizzesLabel = document.getElementById("statQuizzesLabel");
  if (quizzesLabel) quizzesLabel.textContent = quizLabelText;

  updateStatusBadgeA11y(
    visitedEl,
    visitedLabelText,
    _t("ui.profile.statPlacesTitle", "Antall steder du har låst opp.")
  );
  updateStatusBadgeA11y(
    quizzesEl,
    quizLabelText,
    _t("ui.profile.statQuizTitle", "Antall fullførte quizenheter. Set-baserte quizer teller per sett.")
  );
  updateStatusBadgeA11y(
    streakEl,
    streakLabelText,
    _t("ui.profile.statStreakTitle", "Antall dager på rad med aktivitet.")
  );
  updateStatusBadgeA11y(
    musicEl,
    _t("ui.profile.musicFinds", "Musikkfunn"),
    `Artister låst opp: ${musicSummary.artists} · Sanger låst opp: ${musicSummary.tracks} · Steder med musikk: ${musicSummary.places}`
  );

  renderPC(pcLabelText);
}

// ------------------------------------------------------------
// PARADISECOIN (PC) – PROFIL
// ------------------------------------------------------------
function renderPC(labelText = _t("ui.profile.statPC", "PC")) {
  const el = document.getElementById("pcValue");
  if (!el) return;

  const finiteNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const walletValue = (wallet, key) => {
    if (!wallet || typeof wallet !== "object") return null;
    return finiteNumber(wallet[key]);
  };

  const readLegacyWallet = () => {
    try {
      const raw = localStorage.getItem("hg_pc_wallet_v1");
      const wallet = raw ? JSON.parse(raw) : {};
      const balance = walletValue(wallet, "balance");
      if (balance !== null) return balance;
      return walletValue(wallet, "pc");
    } catch {
      return null;
    }
  };

  const sources = [
    () => walletValue(window.CivicationState?.getWallet?.(), "balance"),
    () => walletValue(window.HG_CiviShop?.getWallet?.(), "balance"),
    () => finiteNumber(window.getPCWallet?.()),
    readLegacyWallet
  ];

  let pc = 0;
  for (const read of sources) {
    try {
      const value = read();
      if (value !== null) {
        pc = value;
        break;
      }
    } catch {
      // Keep the profile safe if any wallet bridge is unavailable or malformed.
    }
  }

  el.textContent = String(pc);
  updateStatusBadgeA11y(
    el,
    labelText,
    _t("ui.profile.statPCTitle", "ParadiseCoin-saldoen din.")
  );
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
  const learningStyle = summary.learning_style || _t("ui.nextup.developing", "Under utvikling");
  const direction = summary.current_direction || _t("ui.nextup.learnDirection", "NextUp lærer retningen din når du bruker forslagene.");
  const recentChoices = Array.isArray(summary.recent_choices) ? summary.recent_choices.slice(0, 3) : [];
  const path = summary.active_path || null;

  metaEl.innerHTML = `
    <div><strong>${_esc(_t("ui.nextup.activeMode", "Aktiv modus"))}:</strong> ${_esc(activeMode)}</div>
    <div><strong>${_esc(_t("ui.nextup.learningStyle", "Læringsstil"))}:</strong> ${_esc(learningStyle)}</div>
    <div><strong>${_esc(_t("ui.nextup.followingNow", "Du følger for tiden"))}:</strong> ${_esc(direction)}</div>
  `;
  choicesEl.innerHTML = recentChoices.length
    ? `<strong>${_esc(_t("ui.nextup.latestChoices", "Siste NextUp-valg"))}:</strong> ${_esc(recentChoices.join(" → "))}`
    : `<strong>${_esc(_t("ui.nextup.latestChoices", "Siste NextUp-valg"))}:</strong> ${_esc(_t("ui.nextup.noChoices", "Ingen valg logget ennå"))}`;
  pathEl.innerHTML = path
    ? `<strong>${_esc(_t("ui.nextup.activeRoute", "Pågående rute"))}:</strong> ${_esc(path.title || _t("ui.nextup.routeDeveloping", "Rute i utvikling"))} · ${Number(path.step_count || 0)} steg`
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
  if (!id) return _t("ui.groundhopper.unknownPlace", "Ukjent sted");
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

  const level = window.HG_getGroundhopperLevel?.(stats) || { label: _t("ui.groundhopper.notStarted", "Ikke startet"), next: 1, progress: 0, remaining: 1 };
  const statRows = [
    [_t("ui.groundhopper.level", "Nivå"), level.label],
    [_t("ui.groundhopper.groundsVisited", "Grounds besøkt"), asCount(stats.total_groundhopper_places_visited)],
    [_t("ui.groundhopper.footballGrounds", "Fotballgrounds"), asCount(stats.total_football_grounds_visited)],
    [_t("ui.groundhopper.iceArenas", "Ishaller"), asCount(stats.total_ice_arenas_visited)],
    [_t("ui.groundhopper.athletics", "Friidrett"), asCount(stats.total_athletics_venues_visited)],
    [_t("ui.groundhopper.winterSport", "Vintersport"), asCount(stats.total_winter_sport_places_visited)],
    [_t("ui.groundhopper.nationalArenas", "Nasjonalarenaer"), asCount(stats.total_national_arenas_visited)]
  ];

  gridEl.innerHTML = statRows
    .map(([label, value]) => `<div class="groundhopper-stat-card"><span>${_esc(value)}</span><small>${_esc(label)}</small></div>`)
    .join("");
  toplineEl.textContent = level.next == null
    ? _tf("ui.groundhopper.levelMaxReached", "Nivå: {level} · Maksnivå nådd", { level: level.label })
    : _tf("ui.groundhopper.levelProgress", "Nivå: {level} · {remaining} sted(er) til neste nivå ({progress}%)", {
      level: level.label,
      remaining: level.remaining,
      progress: Math.round(level.progress * 100)
    });

  const clubsCollected = Array.isArray(stats.clubs_collected) ? stats.clubs_collected.length : 0;
  clubsEl.textContent = _tf("ui.groundhopper.clubsCollected", "Klubber samlet: {count}", { count: clubsCollected });

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
  lastEl.textContent = _tf("ui.groundhopper.lastVisited", "Sist besøkt: {place}", {
    place: latest ? resolveGroundName(latest.placeId) : "—"
  });

  const recent = visits.slice(0, 5);
  recentListEl.innerHTML = recent.length
    ? recent.map((entry) => `<li>${_esc(resolveGroundName(entry.placeId))}</li>`).join("")
    : `<li>${_esc(_t("ui.groundhopper.noPlaceList", "Ingen stedsliste tilgjengelig ennå."))}</li>`;
  const fullVisited = visits;
  const showAll = fullVisited.length <= 10;
  const visibleVisited = showAll ? fullVisited : fullVisited.slice(0, 10);
  visitedHintEl.textContent = showAll ? "" : _t("ui.groundhopper.showLatest10", "Viser de siste 10.");
  visitedListEl.innerHTML = visibleVisited.length
    ? visibleVisited.map((entry) => `<li>${_esc(resolveGroundName(entry.placeId))}</li>`).join("")
    : `<li>${_esc(_t("ui.groundhopper.noVisitedPlaces", "Du har ikke besøkt noen Groundhopper-steder ennå."))}</li>`;
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
  box.querySelectorAll(".badge-mini").forEach((/** @type {HTMLElement} */ el) => {
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
    { level: _t("ui.badge.beginner", "Nybegynner"), points: 0 };

  const points = Number(info.points || 0);
  const { label } = deriveTierFromPoints(badge, points);

  /** @type {HTMLImageElement} */ (modal.querySelector(".badge-img")).src = (badge.image || badge.icon || badge.img || badge.imageCard || "");
  modal.querySelector(".badge-title").textContent = badge.name;

  // Vis nivå fra tiers (kanonisk), ikke lagret tekst
  modal.querySelector(".badge-level").textContent = label || _t("ui.badge.beginner", "Nybegynner");
  modal.querySelector(".badge-progress-text").textContent = _tf("ui.badge.progressPoints", "{points} poeng", { points });

  // Progressbar
  const bar = /** @type {HTMLElement} */ (modal.querySelector(".badge-progress-bar"));
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
    list.innerHTML = `<li>${_esc(_t("ui.badge.noQuizCompleted", "Ingen quiz fullført i denne kategorien ennå."))}</li>`;
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
        : `<div class="badge-quiz-muted">${_esc(_t("ui.badge.noAnswerDetails", "Ingen svar-detaljer lagret for denne quizen."))}</div>`;

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
    if (e.target && /** @type {Element} */ (e.target).id === "badgeModal") closeBadgeModal();
  };

  const closeBtn = /** @type {HTMLElement} */ (modal.querySelector(".close-btn"));
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

  const collectedIds = /** @type {Set<string>} */ (/** @type {unknown} */ (getCollectedPeopleIds()));

  const peopleUnlocked = PEOPLE
    .filter(p => collectedIds.has(String(p?.id || "").trim()));

  if (!peopleUnlocked.length) {
    grid.innerHTML = `<div class="muted">${_esc(_t("ui.profile.noPeopleUnlocked", "Ingen personer låst opp ennå."))}</div>`;
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

  grid.querySelectorAll(".avatar-card").forEach((/** @type {HTMLElement} */ el) => {
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

  const visitedIds = /** @type {Set<string>} */ (/** @type {unknown} */ (getVisitedPlaceIds()));

  const places = PLACES
    .filter(p => visitedIds.has(String(p?.id || "").trim()));

  if (!places.length) {
    grid.innerHTML = `<div class="muted">${_esc(_t("ui.profile.noPlacesVisited", "Ingen steder besøkt ennå."))}</div>`;
    return;
  }

  grid.innerHTML = places.map(p => `
    <div class="card place-card" data-place="${p.id}">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category} · ${p.year || ""}</div>
      <p class="desc">${p.desc || ""}</p>
    </div>
  `).join("");

  grid.querySelectorAll(".place-card").forEach((/** @type {HTMLElement} */ el) => {
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

  const visitedIds = /** @type {Set<string>} */ (/** @type {unknown} */ (getVisitedPlaceIds()));
  const collectedIds = /** @type {Set<string>} */ (/** @type {unknown} */ (getCollectedPeopleIds()));

  // TIMELINE = KUN BILDE (ikke kort)
  const items = [
    ...PLACES.filter(p => visitedIds.has(String(p?.id || "").trim())).map(p => ({
      type:"place",
      id:p.id,
      name:p.name,
      year:Number(p.year)||0,
      image: p.image || `bilder/places/${p.id}.PNG`
    })),

    ...PEOPLE.filter(p => collectedIds.has(String(p?.id || "").trim())).map(p => ({
      type:"person",
      id:p.id,
      name:p.name,
      year:Number(p.year)||0,
      image: p.image || `bilder/people/${p.id}.PNG`
    }))
  ].sort((a,b)=>a.year - b.year);

  const count = items.length;
  if (count === 0) {
    body.innerHTML = `<div class="muted">${_esc(_tf("ui.profile.timelineNoCards", "Du har ingen historiekort ennå."))}</div>`;
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
  if (txt) txt.textContent = _tf("ui.profile.timelineUnlockedCards", "Du har låst opp {count} kort", { count });

  body.querySelectorAll(".timeline-card").forEach((/** @type {HTMLElement} */ el) => {
    el.onclick = () => {
      const id = el.dataset.id;

      const pr = PEOPLE.find(p => p.id === id);
      if (pr) return window.showPersonPopup(pr);

      const pl = PLACES.find(p => p.id === id);
      if (pl) return window.showPlacePopup(pl);
    };
  });
}


function renderMusicCollection() {
  const body = document.getElementById("musicCollectionBody");
  const meta = document.getElementById("musicCollectionMeta");
  if (!body) return;
  const rows = (typeof window.HGAhaMusic?.getUnlockedMusicObjects === "function")
    ? window.HGAhaMusic.getUnlockedMusicObjects()
    : Object.values(ls("hg_unlocked_music_objects_v1", {}));
  const artists = rows.filter(item => item?.type === "music_artist");
  const tracks = rows.filter(item => item?.type === "music_track");
  const places = new Set(rows.map(item => String(item?.placeId || "").trim()).filter(Boolean));
  if (meta) meta.textContent = `Artister låst opp: ${artists.length} · Sanger låst opp: ${tracks.length} · Steder med musikk: ${places.size}`;
  if (!rows.length) {
    body.innerHTML = `<div class="muted">Ingen musikkfunn låst opp ennå.</div>`;
    return;
  }
  body.innerHTML = rows.map(item => `
    <article class="profile-detail-item">
      <strong>${_esc(item.title || item.id)}</strong>
      <span>${_esc(item.type === "music_artist" ? "Artist" : "Sang")} · ${_esc(item.placeId || "")}</span>
    </article>
  `).join("");
}

function renderCollectionCards() {
  const body = document.getElementById("collectionCardsBody");
  if (!body) return;

  const visitedIds = /** @type {Set<string>} */ (/** @type {unknown} */ (getVisitedPlaceIds()));
  const collectedIds = /** @type {Set<string>} */ (/** @type {unknown} */ (getCollectedPeopleIds()));

  const placeCards = PLACES
    .filter(p => visitedIds.has(String(p?.id || "").trim()))
    .map(p => ({
      id: p.id,
      name: p.name,
      year: Number(p.year) || 0,
      image: p.cardImage
    }));

  const personCards = PEOPLE
    .filter(p => collectedIds.has(String(p?.id || "").trim()))
    .map(p => ({
      id: p.id,
      name: p.name,
      year: Number(p.year) || 0,
      image: p.imageCard
    }));

  const items = [...placeCards, ...personCards].sort((a,b) => a.year - b.year);

  if (!items.length) {
    body.innerHTML = `<div class="muted">${_esc(_t("ui.profile.noCardsUnlocked", "Ingen kort låst opp ennå."))}</div>`;
    return;
  }

  body.innerHTML = items.map(x => `
    <div class="collection-card" data-id="${x.id}">
      <img src="${x.image}" alt="${x.name}">
      <div class="collection-card-name">${x.name}</div>
      <div class="collection-card-year">${x.year || ""}</div>
    </div>
  `).join("");

  body.querySelectorAll(".collection-card").forEach((/** @type {HTMLElement} */ el) => {
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
    if (metaEl) metaEl.textContent = _t("ui.profile.noConceptsLogged", "Ingen begreper logget ennå");
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";

  const total = concepts.reduce((sum, c) => sum + (c.count || 0), 0);
  if (metaEl) metaEl.textContent = _tf("ui.profile.conceptsSummary", "{concepts} begreper · {answers} riktige svar", {
    concepts: concepts.length,
    answers: total
  });

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
    more.textContent = _tf("ui.profile.moreCount", "+{count} til", { count: concepts.length - MAX });
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

  elTopic.textContent = item.topic || item.question || _t("ui.knowledge.knowledge", "Kunnskap");
  elCat.textContent = (last.category || "").charAt(0).toUpperCase() + (last.category || "").slice(1);
  elText.textContent = item.text || item.knowledge || "";

  box.style.display = "block";
}

/**
 * @typedef {Record<string, unknown>} ProfileRecord
 * @typedef {object} ProfileKnowledgeProgress
 * @property {number=} knownEmner
 * @property {number=} estimatedCoverage
 * @property {number=} emnerCount
 * @typedef {object} ProfileKnowledgeSignalSummary
 * @property {number=} totalSignals
 * @property {number=} directLearningSignals
 * @property {number=} visitedPlaceSignals
 * @property {number=} streamSignals
 * @property {number=} conceptSignals
 * @property {unknown[]=} sourcePlaceIds
 * @property {unknown[]=} sourceEmneIds
 * @typedef {object} ProfileKnowledgeSignalBreakdown
 * @property {ProfileRecord[]=} visitedPlaces
 * @property {ProfileRecord[]=} directLearning
 * @typedef {object} ProfileKnowledgeSignals
 * @property {ProfileKnowledgeSignalSummary=} summary
 * @property {ProfileKnowledgeSignalBreakdown=} breakdown
 * @typedef {object} ProfileKnowledgeSubject
 * @property {unknown=} subjectId
 * @property {ProfileKnowledgeProgress=} progress
 * @property {ProfileKnowledgeSignals=} signals
 * @typedef {object} ProfileKnowledgeRecommendation
 * @property {unknown=} title
 * @property {unknown=} reason
 * @property {unknown=} subjectId
 * @typedef {object} ProfileKnowledgeReport
 * @property {boolean=} ok
 * @property {ProfileRecord=} summary
 * @property {ProfileRecord=} sourceState
 * @property {Record<string, ProfileKnowledgeSubject>=} subjects
 * @property {ProfileKnowledgeRecommendation[]=} recommendations
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
    summaryEl.innerHTML = `<div class="muted">${_esc(_t("ui.knowledge.engineNotLoaded", "Kunnskapsmotoren er ikke lastet ennå."))}</div>`;
    return;
  }

  try {
    /** @type {ProfileKnowledgeReport | null} */
    const report = await window.HGKnowledgeEngine.run({ cache: "default" });
    window.hgKnowledgeReport = report;

    if (report?.ok !== true) {
      summaryEl.innerHTML = `<div class="muted">${_esc(_t("ui.knowledge.reportFailed", "Kunnskapsmotoren kunne ikke lage rapport akkurat nå."))}</div>`;
      return;
    }

    /** @type {ProfileRecord} */
    const summary = report?.summary || {};
    /** @type {ProfileRecord} */
    const sourceState = report?.sourceState || {};
    const summaryCards = [
      [`${Number(summary.subjects || 0)}`, _t("ui.knowledge.subjects", "fag")],
      [`${Number(summary.totalEmner || 0)}`, _t("ui.knowledge.topics", "emner")],
      [`${Number(summary.totalKnownEmner || 0)}`, _t("ui.knowledge.knownTopics", "kjente emner")],
      [`${Number(summary.averageCoverage || 0)} %`, _t("ui.knowledge.averageCoverage", "snittdekning")],
      [`${Number(sourceState.subjectsWithSignalsCount || 0)}`, _t("ui.knowledge.subjectsWithSignals", "fag med signaler")],
      [`${Number(summary.healthErrors || 0)} / ${Number(summary.healthWarnings || 0)}`, _t("ui.knowledge.errorsWarnings", "feil / varsler")]
    ];
    summaryEl.innerHTML = summaryCards
      .map(([value, label]) => `<div class="knowledge-engine-summary-card"><strong>${_esc(value)}</strong><span>${_esc(label)}</span></div>`)
      .join("");

    /** @type {ProfileKnowledgeSubject[]} */
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
      subjectsEl.innerHTML = `<div class="muted">${_esc(_t("ui.knowledge.notEnoughSignals", "Du har ikke nok registrerte læringssignaler ennå."))}</div>`;
    } else {
      const weakest = (Array.isArray(summary.weakestSubjects) ? summary.weakestSubjects : [])
        .slice(0, 3)
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            const subject = /** @type {{ subjectId?: unknown }} */ (item);
            if (subject.subjectId) return subject.subjectId;
          }
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
            <div class="knowledge-engine-subject-title"><span>${_esc(sid)}</span><span>${_esc(_tf("ui.knowledge.subjectProgress", "{known} / {total} emner · {coverage} %", { known: Number(p.knownEmner || 0), total: Number(p.emnerCount || 0), coverage }))}</span></div>
            <div class="knowledge-engine-bar"><div class="knowledge-engine-bar-fill" style="width:${coverage}%;"></div></div>
            <div class="knowledge-engine-chip-row">
              <span class="knowledge-engine-chip">${_esc(_t("ui.knowledge.directLearning", "Direkte læring"))}: ${_esc(Number(s.directLearningSignals || 0))}</span>
              <span class="knowledge-engine-chip">${_esc(_t("ui.knowledge.visitedPlaces", "Besøkte steder"))}: ${_esc(Number(s.visitedPlaceSignals || 0))}</span>
              <span class="knowledge-engine-chip">${_esc(_t("ui.knowledge.streams", "Streams"))}: ${_esc(Number(s.streamSignals || 0))}</span>
              <span class="knowledge-engine-chip">${_esc(_t("ui.knowledge.concepts", "Begreper"))}: ${_esc(Number(s.conceptSignals || 0))}</span>
            </div>
          </article>`;
        }).join("")}
        <div class="knowledge-engine-summary-card"><strong>${_esc(_t("ui.knowledge.weakestNow", "Svakeste fag nå"))}:</strong> ${_esc(weakestIds.join(", ") || _t("ui.knowledge.noWeakCandidates", "Ingen tydelige kandidater ennå"))}</div>
      `;
    }

    /** @type {ProfileKnowledgeRecommendation[]} */
    const recs = Array.isArray(report?.recommendations) ? report.recommendations.slice(0, 3) : [];
    recsEl.innerHTML = recs.length
      ? recs.map((rec) => `<article class="knowledge-engine-recommendation"><strong>${_esc(rec?.title || _t("ui.knowledge.recommendation", "Anbefaling"))}</strong><div>${_esc(rec?.reason || "")}</div><small>${_esc(rec?.subjectId ? `Fag: ${rec.subjectId}` : "")}</small></article>`).join("")
      : `<div class="muted">${_esc(_t("ui.knowledge.noRecommendations", "Ingen anbefalinger akkurat nå."))}</div>`;

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
        <div class="knowledge-engine-subject-title"><span>${_esc(sid)}</span><span>${_esc(_tf("ui.knowledge.signalCount", "{count} signaler", { count: Number(summarySig.totalSignals || 0) }))}</span></div>
        <div class="knowledge-engine-chip-row">
          <span class="knowledge-engine-chip">${_esc(_t("ui.knowledge.directLearning", "directLearning"))}: ${_esc(Number(summarySig.directLearningSignals || 0))}</span>
          <span class="knowledge-engine-chip">${_esc(_t("ui.knowledge.visitedPlaces", "visitedPlaces"))}: ${_esc(Number(summarySig.visitedPlaceSignals || 0))}</span>
          <span class="knowledge-engine-chip">${_esc(_t("ui.knowledge.streams", "streams"))}: ${_esc(Number(summarySig.streamSignals || 0))}</span>
          <span class="knowledge-engine-chip">${_esc(_t("ui.knowledge.concepts", "concepts"))}: ${_esc(Number(summarySig.conceptSignals || 0))}</span>
        </div>
        <div class="muted">${_esc(_t("ui.knowledge.sourcePlaces", "Kilde-steder"))}: ${_esc(sourcePlaces.join(", ") || "—")}</div>
        <div class="muted">${_esc(_t("ui.knowledge.sourceTopics", "Kilde-emner"))}: ${_esc(sourceEmner.join(", ") || "—")}</div>
        <div>${visited.map((v) => `${_esc(v.placeName || v.placeId || _t("ui.knowledge.place", "Sted"))} → ${_esc(v.emne_id || _t("ui.knowledge.unknownTopic", "ukjent emne"))}`).join("<br>") || _esc(_t("ui.knowledge.noPlaceLinks", "Ingen stedskoblinger registrert."))}</div>
        <div style="margin-top:6px;">${direct.map((d) => `${_esc(d.emne_id || _t("ui.knowledge.unknownTopic", "ukjent emne"))} · ${_esc(`${d.seen ? "seen" : "not-seen"}/${d.understood ? "understood" : "not-understood"}/${d.applied ? "applied" : "not-applied"}`)} · score ${_esc(Number(d.score || 0))}`).join("<br>") || _esc(_t("ui.knowledge.noDirectSignals", "Ingen direkte læringssignal registrert."))}</div>
      </article>`;
    }).join("") : `<div class="muted">${_esc(_t("ui.knowledge.noSignalExplanation", "Ingen signalforklaring tilgjengelig ennå."))}</div>`;

    metaEl.textContent = _tf("ui.knowledge.analyzedSummary", "Analysert {subjects} fag · {topics} emner", {
      subjects: Number(summary.subjects || 0),
      topics: Number(summary.totalEmner || 0)
    });
  } catch (e) {
    console.warn("[profile] Knowledge Engine panel failed", e);
    summaryEl.innerHTML = `<div class="muted">${_esc(_t("ui.knowledge.reportFailed", "Kunnskapsmotoren kunne ikke lage rapport akkurat nå."))}</div>`;
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

  txt.textContent = _tf("ui.nextwhy.because", "Fordi: {because}", { because });
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

  a.textContent = lastNote
    ? _tf("ui.profile.latestNote", "Siste notat: {title}", { title: lastNote.title || _t("ui.profile.noteFallback", "Notat") })
    : _t("ui.profile.latestDialog", "Siste dialog");
  b.textContent = lastNote ? (lastNote.text || "").slice(0, 90) : (lastDlg.text || "").slice(0, 90);

  box.style.display = "block";
}

// ------------------------------------------------------------
// EDIT-PROFILMODAL
// ------------------------------------------------------------
function openProfileModal() {
  const rawName =
    window.HGUserProfile?.getDisplayName?.() ||
    localStorage.getItem("user_name") ||
    "Gjest";
  const name = rawName === "Logg inn" ? "Gjest" : rawName;
  const color = localStorage.getItem("user_color") || "#f6c800";

  const modal = document.createElement("div");
  modal.className = "profile-modal";
  modal.innerHTML = `
    <div class="profile-modal-inner">
      <h3>${_esc(_t("ui.profile.edit", "Endre profil"))}</h3>
      <label>${_esc(_t("ui.profile.modalName", "Navn"))}</label>
      <input id="newName" value="${name}">
      <label>${_esc(_t("ui.profile.modalColor", "Farge"))}</label>
      <input id="newColor" type="color" value="${color}">
      <button id="saveProfile">${_esc(_t("ui.profile.modalSave", "Lagre"))}</button>
      <button id="cancelProfile" style="margin-left:6px;background:#444;color:#fff;">${_esc(_t("ui.profile.modalCancel", "Avbryt"))}</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = "flex";

  /** @type {HTMLElement} */ (modal.querySelector("#cancelProfile")).onclick = () => modal.remove();
  /** @type {HTMLElement} */ (modal.querySelector("#saveProfile")).onclick = () => {
    const newName = /** @type {HTMLInputElement} */ (modal.querySelector("#newName")).value.trim() || "Gjest";
    const newColor = /** @type {HTMLInputElement} */ (modal.querySelector("#newColor")).value;

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

    const safeLoad = async (name, loader) => {
      try {
        if (typeof loader !== "function") return [];
        const data = await loader();
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.badges)) return data.badges;
        return [];
      } catch (e) {
        console.warn(`[profile] ${name} load failed; using []`, e);
        return [];
      }
    };

    // Render localStorage-backed stats immediately, before any data files load.
    safeCall("renderProfileCard", renderProfileCard);
    safeCall("renderPC", renderPC);

    // Kart først
    safeCall("setupProfileMap", setupProfileMap);

    // LAST careers først
    if (typeof window.ensureCiviCareerRulesLoaded === "function") {
      await window.ensureCiviCareerRulesLoaded?.();
    }

    // LAST DATA via DataHub. Each loader falls back independently so one
    // missing file (for example data/badges.json) does not stop profile boot.
    const [people, places, badges] = await Promise.all([
      safeLoad("people", () => window.DataHub?.loadPeopleBase
        ? window.DataHub.loadPeopleBase()
        : window.DataHub?.loadPeople?.()),
      safeLoad("places", () => window.DataHub?.loadPlacesBase
        ? window.DataHub.loadPlacesBase()
        : window.DataHub?.loadPlaces?.()),
      safeLoad("badges", () => window.DataHub?.loadBadges?.())
    ]);

    PEOPLE = people;
    PLACES = places;
    BADGES = badges;

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
    safeCall("renderMusicCollection", renderMusicCollection);
    safeCall("renderLatestKnowledge", renderLatestKnowledge);
    safeCall("renderLatestTrivia", renderLatestTrivia);
    safeCall("renderConcepts", renderConcepts);
    safeCall("renderNextWhy", renderNextWhy);
    safeCall("renderAhaSummary", renderAhaSummary);
    safeCall("renderNextUpProfileCard", renderNextUpProfileCard);
    safeCall("renderGroundhopperProfilePanel", renderGroundhopperProfilePanel);
    safeCall("renderKnowledgeEnginePanel", renderKnowledgeEnginePanel);
    safeCall("renderKnowledgeMatches", () => window.HGKnowledgeMatch?.renderKnowledgeMatches?.());

    // Markører etter at PLACES er lastet
    safeCall("updateProfileMarkers", updateProfileMarkers);

    // UI-knapper
    if (!window.HGUserProfile?.openEditor) {
      document.getElementById("editProfileBtn")?.addEventListener("click", openProfileModal);
    }

    const btnOpenAHA = document.getElementById("btnOpenAHA");
    const refreshBtnOpenAHA = async (stateOverride = null) => {
      if (!btnOpenAHA) return;
      try {
        const state = stateOverride || await window.HistoryGoAHAAuth?.refresh?.();
        const signedIn = Boolean(state?.signed_in);
        btnOpenAHA.hidden = signedIn;
        btnOpenAHA.setAttribute("aria-hidden", signedIn ? "true" : "false");
        btnOpenAHA.textContent = _t("ui.aha.login", "Logg inn");
      } catch {
        btnOpenAHA.hidden = false;
        btnOpenAHA.setAttribute("aria-hidden", "false");
        btnOpenAHA.textContent = _t("ui.aha.login", "Logg inn");
      }
    };

    btnOpenAHA?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (typeof window.HGUserProfile?.openLoginPopup === "function") {
        window.HGUserProfile.openLoginPopup();
        return;
      }

      if (typeof window.HistoryGoAHAAuth?.openAhaLogin === "function") {
        window.HistoryGoAHAAuth.openAhaLogin();
        return;
      }

      window.location.href = "https://paradispartiet.github.io/AHA-EchoNet/?auth=login&source=historygo";
    });
    refreshBtnOpenAHA();
    window.addEventListener("aha:auth-ready", (/** @type {CustomEvent} */ event) => {
      refreshBtnOpenAHA(event.detail || { signed_in: false });
    });
    window.addEventListener("historygo:aha-readback", (/** @type {CustomEvent} */ event) => {
      refreshBtnOpenAHA({ signed_in: Boolean(event.detail?.profile_id || localStorage.getItem("aha_profile_id")) });
    });

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
      safeCall("renderMusicCollection", renderMusicCollection);
      safeCall("renderLatestKnowledge", renderLatestKnowledge);
      safeCall("renderLatestTrivia", renderLatestTrivia);
      safeCall("renderConcepts", renderConcepts);
      safeCall("renderNextWhy", renderNextWhy);
      safeCall("renderAhaSummary", renderAhaSummary);
      safeCall("renderNextUpProfileCard", renderNextUpProfileCard);
      safeCall("renderGroundhopperProfilePanel", renderGroundhopperProfilePanel);
      safeCall("renderKnowledgeEnginePanel", renderKnowledgeEnginePanel);
      safeCall("renderKnowledgeMatches", () => window.HGKnowledgeMatch?.renderKnowledgeMatches?.());
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

  const visitedIds = /** @type {Set<string>} */ (/** @type {unknown} */ (getVisitedPlaceIds()));

  PROFILE_LAYER.clearLayers();

  PLACES.filter(p => visitedIds.has(String(p?.id || "").trim())).forEach(p => {
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
  const tabs = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll('.profile-tab')));
  const panels = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll('.profile-tab-panel')));
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

    const shouldRefreshSocialMeet = name === 'socialmeet';
    if (shouldRefreshSocialMeet) {
      window.renderSocialMeetSections?.();
    }
  };

  tabs.forEach((tab) => tab.addEventListener('click', () => activate(tab.dataset.tab)));
  activate(tabs[0].dataset.tab);
}

document.addEventListener('DOMContentLoaded', initProfileTabs);
