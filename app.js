// ============================================================
// === HISTORY GO – APP.JS (v2.7, hovedkoordinator) ===========
// ============================================================
//
// Ansvar:
//  - Starter appen etter core.boot()
//  - Initierer kart, UI, quizsystem og mini-profil
//  - Håndterer brukerhendelser (sted → quiz → progresjon)
//  - Oppdaterer localStorage og sender updateProfile-event
//  - Binder sammen alle moduler i History Go
//
// ============================================================

const HG = {}; // globalt navnerom for data og bruker

const app = (() => {

  // ----------------------------------------------------------
  // 1) INITIERING
  // ----------------------------------------------------------
  async function initApp() {
    try {
      console.log("📦 Initialiserer History Go...");

      // Sørg for at data er lastet (fra core.js)
      if (!window.data || !data.places) {
        console.warn("Data ikke funnet – venter på core.boot()");
        await new Promise(r => setTimeout(r, 500));
      }

      // Sett opp global data
      HG.data = window.data || {};

      // Hent brukerdata
      HG.user = {
        name: localStorage.getItem("user_name") || "Ukjent spiller",
        color: localStorage.getItem("user_color") || "#FFD600"
      };

      // Start moduler
      initMap();
      initUI();
      initQuizSystem();
      initProfileMini();

      // Hendelser og eventkoblinger
      attachEventListeners();

      showToast(`Velkommen tilbake, ${HG.user.name}!`);
    } catch (err) {
      console.error("Feil ved oppstart:", err);
    }
  }

  // ----------------------------------------------------------
  // 2) MODULSTART
  // ----------------------------------------------------------
  function initMap() {
    if (window.map && typeof map.initMap === "function") {
      map.initMap(HG.data.places, HG.data.routes);
    }
  }

  function initUI() {
    if (window.ui && typeof ui.initUI === "function") {
      ui.initUI();
    }
  }

  function initQuizSystem() {
    if (window.quiz && typeof quiz.initQuizSystem === "function") {
      quiz.initQuizSystem(HG.data.badges);
    }
  }

  function initProfileMini() {
    if (window.Profile && typeof Profile.initProfileMini === "function") {
      Profile.initProfileMini();
    }
  }

  // ----------------------------------------------------------
  // 3) HENDELSER OG FLYT
  // ----------------------------------------------------------
  function attachEventListeners() {
    // Når bruker trykker på sted i kart
    document.addEventListener("placeSelected", (e) => {
      const placeId = e.detail.placeId;
      if (placeId) startQuizForPlace(placeId);
    });

    // Når quiz fullføres
    document.addEventListener("quizCompleted", (e) => {
      handleQuizCompletion(e.detail);
    });
  }

  // ----------------------------------------------------------
  // 4) QUIZ OG PROGRESJON
  // ----------------------------------------------------------
  function startQuizForPlace(placeId) {
    if (window.quiz && typeof quiz.startQuiz === "function") {
      quiz.startQuiz(placeId);
    }
  }

  function handleQuizCompletion(result) {
    try {
      console.log("🏁 Quiz fullført:", result);

      // 1. Oppdater progresjon
      addCompletedQuizAndMaybePoint(result);
      updateMeritLevel(result.categoryId, result.points);
      addVisitedPlace(result.placeId);
      unlockPeopleAtPlace(result.placeId);

      // 2. Live-oppdater profil
      window.dispatchEvent(new Event("updateProfile"));

      // 3. Gi bruker tilbakemelding
      showToast(`+${result.points} poeng i ${result.categoryId}!`);
    } catch (err) {
      console.error("Feil ved håndtering av quiz:", err);
    }
  }

  // ----------------------------------------------------------
  // 5) PROGRESJONSFUNKSJONER
  // ----------------------------------------------------------
  function addCompletedQuizAndMaybePoint(result) {
    const progress = load("quiz_progress", {});
    progress[result.quizId] = result;
    save("quiz_progress", progress);
  }

  function updateMeritLevel(categoryId, newPoints = 5) {
    const merits = load("merits_by_category", {});
    if (!merits[categoryId]) merits[categoryId] = { points: 0, valør: "Bronse" };
    merits[categoryId].points += newPoints;

    // Enkel valørlogikk
    if (merits[categoryId].points >= 100) merits[categoryId].valør = "Gull";
    else if (merits[categoryId].points >= 50) merits[categoryId].valør = "Sølv";
    else merits[categoryId].valør = "Bronse";

    save("merits_by_category", merits);
  }

  function addVisitedPlace(placeId) {
    const visited = load("visited_places", []);
    if (!visited.find(p => p.id === placeId)) {
      const pl = HG.data.places.find(p => p.id === placeId);
      if (pl) {
        visited.push({ id: pl.id, name: pl.name, year: pl.year, desc: pl.desc });
        save("visited_places", visited);
        showToast(`📍 Du har besøkt ${pl.name}`);
      }
    }
  }

  function unlockPeopleAtPlace(placeId) {
    const allPeople = HG.data.people || [];
    const collected = load("people_collected", []);
    const placePeople = allPeople.filter(p => p.placeId === placeId);

    placePeople.forEach(p => {
      if (!collected.find(c => c.id === p.id)) {
        collected.push({ id: p.id, name: p.name, year: p.year });
        showToast(`👤 Ny person: ${p.name}`);
      }
    });

    save("people_collected", collected);
  }

  // ----------------------------------------------------------
  // 6) VERKTØY
  // ----------------------------------------------------------
  function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => (t.style.display = "none"), 2500);
  }

  function saveUserState() {
    localStorage.setItem("user_name", HG.user.name);
    localStorage.setItem("user_color", HG.user.color);
  }

  function resetProgress() {
    if (confirm("Vil du slette all progresjon?")) {
      localStorage.clear();
      window.dispatchEvent(new Event("updateProfile"));
      showToast("Progresjon nullstilt");
    }
  }

  // ----------------------------------------------------------
  // 7) EKSPORTERTE FUNKSJONER
  // ----------------------------------------------------------
  return {
    initApp,
    handleQuizCompletion,
    startQuizForPlace,
    saveUserState,
    resetProgress
  };
})();

// ============================================================
// === AUTO-START =============================================
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  if (typeof boot === "function") {
    boot(); // core.boot() kaller initApp automatisk
  } else {
    app.initApp();
  }
});
