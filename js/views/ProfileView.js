// js/views/ProfileView.js
// Lett intern profile-summary for #/profile i index-appen.
// Full profilside eies fortsatt av profile.html/js/profile.js.

(function () {
  "use strict";

  const VIEW_ID = "profileView";

  function closeQuizModals() {
    document.getElementById("quizModal")?.remove?.();
    document.getElementById("quizSummaryModal")?.remove?.();
  }

  function hidePlaceCard() {
    const card = document.getElementById("placeCard");
    if (!card) return;

    card.setAttribute("aria-hidden", "true");
    card.dataset.currentPlaceId = "";

    if (typeof window.collapsePlaceCard === "function") {
      window.collapsePlaceCard();
    } else {
      card.classList.add("is-collapsed");
    }

    window.bottomSheetController?.hide?.();
  }

  function getMountTarget() {
    return document.querySelector(".app-shell") || document.body || document.documentElement;
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function asObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function addId(ids, value) {
    if (value == null) return;
    if (["boolean", "function", "object", "symbol"].includes(typeof value)) return;
    const id = String(value).trim();
    if (id) ids.add(id);
  }

  function addProgressIds(ids, raw) {
    if (Array.isArray(raw)) {
      raw.forEach((entry) => addId(ids, entry?.id ?? entry?.targetId ?? entry));
      return;
    }

    if (!raw || typeof raw !== "object") return;

    Object.entries(raw).forEach(([id, value]) => {
      if (value) addId(ids, id);
    });
  }

  function getVisitedCount() {
    const ids = new Set();
    addProgressIds(ids, window.visited);
    addProgressIds(ids, readJSON("visited_places", {}));
    return ids.size;
  }

  function getQuizHistory() {
    const history = [];

    try {
      const runtimeHistory = window.HGLearningLog?.getQuizHistory?.();
      if (Array.isArray(runtimeHistory)) history.push(...runtimeHistory);
    } catch {}

    const learningLog = readJSON("hg_learning_log_v1", []);
    if (Array.isArray(learningLog)) {
      learningLog.forEach((entry) => {
        const type = entry?.type;
        if (type !== "quiz_perfect" && type !== "quiz_set_complete" && type !== "quiz_legacy") return;
        history.push({
          id: entry?.id || entry?.targetId || "",
          targetId: entry?.targetId || entry?.id || "",
          categoryId: entry?.categoryId || "",
          name: entry?.name || "",
          image: entry?.image || "",
          date: entry?.date || (Number.isFinite(entry?.ts) ? new Date(entry.ts).toISOString() : "")
        });
      });
    }

    const legacyHistory = readJSON("quiz_history", []);
    if (Array.isArray(legacyHistory)) history.push(...legacyHistory);

    return history.sort((a, b) => String(a?.date || "").localeCompare(String(b?.date || "")));
  }

  function getQuizCount() {
    const ids = new Set();

    getQuizHistory().forEach((entry) => {
      addId(ids, entry?.id || entry?.targetId);
    });

    const quizProgress = readJSON("quiz_progress", {});
    if (quizProgress && typeof quizProgress === "object") {
      Object.values(quizProgress).forEach((value) => {
        const completed = Array.isArray(value?.completed) ? value.completed : [];
        completed.forEach((id) => addId(ids, id));
      });
    }

    return ids.size;
  }

  function getMeritCount() {
    const runtimeMerits = asObject(window.merits);
    const storedMerits = asObject(readJSON("merits_by_category", {}));
    return new Set([
      ...Object.keys(runtimeMerits).filter(Boolean),
      ...Object.keys(storedMerits).filter(Boolean)
    ]).size;
  }

  function findKnownName(id) {
    const key = String(id || "").trim();
    if (!key) return "";

    const sources = [window.PLACES, window.PEOPLE].filter(Array.isArray);
    for (const list of sources) {
      const item = list.find((entry) => String(entry?.id || "").trim() === key);
      const name = String(item?.name || item?.title || "").trim();
      if (name) return name;
    }

    return key;
  }

  function getLastQuizLabel() {
    const history = getQuizHistory();
    const lastHistory = history[history.length - 1];
    if (lastHistory) {
      const name = String(lastHistory.name || "").trim();
      if (name) return name;
      const id = lastHistory.id || lastHistory.targetId;
      const label = findKnownName(id);
      if (label) return label;
    }

    const quizProgress = readJSON("quiz_progress", {});
    if (quizProgress && typeof quizProgress === "object") {
      const completed = Object.values(quizProgress).flatMap((value) =>
        Array.isArray(value?.completed) ? value.completed : []
      );
      const lastId = completed[completed.length - 1];
      const label = findKnownName(lastId);
      if (label) return label;
    }

    return "Ingen quiz ennå";
  }

  function renderSummary(view) {
    const values = {
      visited: getVisitedCount(),
      quizzes: getQuizCount(),
      merits: getMeritCount(),
      lastQuiz: getLastQuizLabel()
    };

    const rows = view.querySelectorAll("[data-profile-summary-value]");
    rows.forEach((row) => {
      const key = row.getAttribute("data-profile-summary-value");
      if (key && Object.prototype.hasOwnProperty.call(values, key)) {
        row.textContent = String(values[key]);
      }
    });
  }

  function ensureView() {
    let view = document.getElementById(VIEW_ID);
    if (view) return view;

    view = document.createElement("div");
    view.id = VIEW_ID;
    view.className = "hg-profile-view";
    view.hidden = true;
    view.setAttribute("role", "main");
    view.setAttribute("aria-labelledby", "profileViewTitle");
    view.innerHTML = `
      <section class="hg-profile-view__card" style="margin: 1rem; padding: 1rem; border-radius: 18px; background: rgba(255,255,255,0.94); box-shadow: 0 12px 30px rgba(0,0,0,0.16);">
        <h1 id="profileViewTitle" style="margin: 0 0 1rem;">Profil</h1>
        <dl class="hg-profile-view__summary" style="display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.6rem 1rem; margin: 0 0 1rem;">
          <dt>Besøkte steder</dt>
          <dd data-profile-summary-value="visited" style="margin: 0; font-weight: 800;">0</dd>
          <dt>Fullførte quizzer</dt>
          <dd data-profile-summary-value="quizzes" style="margin: 0; font-weight: 800;">0</dd>
          <dt>Merker / merits</dt>
          <dd data-profile-summary-value="merits" style="margin: 0; font-weight: 800;">0</dd>
          <dt>Siste quiz</dt>
          <dd data-profile-summary-value="lastQuiz" style="margin: 0; font-weight: 800; text-align: right;">Ingen quiz ennå</dd>
        </dl>
        <a class="hg-profile-view__full-link" href="profile.html" style="display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 1rem; border-radius: 999px; background: #111827; color: #fff; font-weight: 700; text-decoration: none;">
          Åpne full profil
        </a>
      </section>
    `;

    const link = view.querySelector(".hg-profile-view__full-link");
    link?.addEventListener("click", (event) => {
      event.preventDefault();
      ProfileView.openFullProfile();
    });

    getMountTarget().appendChild(view);
    return view;
  }

  const ProfileView = {
    show() {
      document.body?.classList.remove("hg-view-map", "hg-view-quiz");
      document.body?.classList.add("hg-view-profile");

      hidePlaceCard();
      closeQuizModals();

      const view = ensureView();
      renderSummary(view);
      view.hidden = false;
      view.setAttribute("aria-hidden", "false");
    },

    hide() {
      const view = document.getElementById(VIEW_ID);
      if (!view) return;

      view.hidden = true;
      view.setAttribute("aria-hidden", "true");
    },

    openFullProfile() {
      window.location.href = "profile.html";
    }
  };

  window.HGProfileView = ProfileView;
})();
