// ============================================================
// === HISTORY GO – APP.JS (v2.6, hovedkoordinator) ===========
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

const app = (() => {

  // ----------------------------------------------------------
  // 1) INITIERING
  // ----------------------------------------------------------
  async function initApp() {
    try {
      console.log("📦 Initialiserer History Go...");

      // Sørg for at data er lastet (fra core.js)
      if (!window.HG || !HG.data || !HG.data.places) {
        console.warn("HG-data ikke funnet – venter på core.boot()");
        await new Promise(r => setTimeout(r, 500));
      }

      // Hent brukerdata
      HG.user = {
        name: localStorage.getItem("user_name") || "Ukjent",
        color: localStorage.getItem("user_color") || "#FFD600"
      };

      // Start moduler
      initMap();
      initUI();
      initQuizSystem();
      initProfileMini();

      // Hendelser og eventkoblinger
      attachEventListeners();

      ui.showToast(`Velkommen tilbake, ${HG.user.name}!`);
    } catch (err) {
      console.error("Feil ved oppstart:", err);
    }
  }

  // ----------------------------------------------------------
  // 2) MODULSTART
  // ----------------------------------------------------------
  function initMap() {
    if (typeof map !== "undefined" && map.initMap) {
      map.initMap(HG.data.places, HG.data.routes);
    }
  }

  function initUI() {
    if (typeof ui !== "undefined" && ui.initUI) {
      ui.initUI();
    }
  }

  function initQuizSystem() {
    if (typeof quiz !== "undefined" && quiz.initQuizSystem) {
      quiz.initQuizSystem(HG.data.badges);
    }
  }

  function initProfileMini() {
    if (typeof Profile !== "undefined" && Profile.initProfileMini) {
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
    if (!quiz || !quiz.startQuiz) return;
    quiz.startQuiz(placeId);
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
      ui.showToast(`+${result.points} poeng i ${result.categoryId}!`);
    } catch (err) {
      console.error("Feil ved håndtering av quiz:", err);
    }
  }

  // ----------------------------------------------------------
  // 5) PROGRESJONSFUNKSJONER (enkle wrappers)
  // ----------------------------------------------------------
  function addCompletedQuizAndMaybePoint(result) {
    const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
    progress[result.quizId] = result;
    localStorage.setItem("quiz_progress", JSON.stringify(progress));
  }

  function updateMeritLevel(categoryId, newPoints = 5) {
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
    if (!merits[categoryId]) merits[categoryId] = { points: 0, valør: "Bronse" };
    merits[categoryId].points += newPoints;

    // Enkel valørlogikk
    if (merits[categoryId].points >= 100) merits[categoryId].valør = "Gull";
    else if (merits[categoryId].points >= 50) merits[categoryId].valør = "Sølv";
    else merits[categoryId].valør = "Bronse";

    localStorage.setItem("merits_by_category", JSON.stringify(merits));
  }

  function addVisitedPlace(placeId) {
    const visited = JSON.parse(localStorage.getItem("visited_places") || "[]");
    if (!visited.find(p => p.id === placeId)) {
      const pl = HG.data.places.find(p => p.id === placeId);
      if (pl) {
        visited.push({ id: pl.id, name: pl.name, year: pl.year, desc: pl.desc });
        localStorage.setItem("visited_places", JSON.stringify(visited));
        ui.showToast(`📍 Du har besøkt ${pl.name}`);
      }
    }
  }

  function unlockPeopleAtPlace(placeId) {
    const allPeople = HG.data.people || [];
    const collected = JSON.parse(localStorage.getItem("people_collected") || "[]");
    const placePeople = allPeople.filter(p => p.placeId === placeId);

    placePeople.forEach(p => {
      if (!collected.find(c => c.id === p.id)) {
        collected.push({ id: p.id, name: p.name, year: p.year });
        ui.showToast(`👤 Ny person: ${p.name}`);
      }
    });

    localStorage.setItem("people_collected", JSON.stringify(collected));
  }

  // ----------------------------------------------------------
  // 6) VERKTØY
  // ----------------------------------------------------------
  function saveUserState() {
    localStorage.setItem("user_name", HG.user.name);
    localStorage.setItem("user_color", HG.user.color);
  }

  function resetProgress() {
    if (confirm("Vil du slette all progresjon?")) {
      localStorage.clear();
      window.dispatchEvent(new Event("updateProfile"));
      ui.showToast("Progresjon nullstilt");
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
// === AUTO-START VED LASTING AV SIDEN ========================
// ============================================================

window.addEventListener("DOMContentLoaded", () => {
  if (typeof core !== "undefined" && core.boot) {
    core.boot().then(() => app.initApp());
  } else {
    console.warn("core.js ikke lastet – prøver å starte direkte");
    app.initApp();
  }
});

