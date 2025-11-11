// ============================================================
// === HISTORY GO – APP.JS (v3.2, utforsk fast + se kart) =====
// ============================================================
//
//  • Starter appen etter core.boot()
//  • Viser nærmeste steder + ruter i utforskpanelet (fast åpent)
//  • “Se kart” / “Vis panel” og (×) styrer panelet + backdrop
//  • Live-oppdatering ved bevegelse (watchPosition)
//  • Håndterer quiz-flyt, progresjon og profiloppdatering
//
// ============================================================

const HG = window.HG || {};

const app = (() => {
  let lastPos = null;
  let watchId = null;

  // ----------------------------------------------------------
  // 1) INITIERING
  // ----------------------------------------------------------
  async function initApp() {
    try {
      console.log("📦 Initialiserer History Go...");

      // Vent på data (fra core.boot)
      if (!HG.data || !HG.data.places) {
        console.warn("Data ikke funnet – venter på core.boot()");
        await new Promise(r => setTimeout(r, 400));
      }

      // Bruker
      HG.user = {
        name: localStorage.getItem("user_name") || "Ukjent spiller",
        color: localStorage.getItem("user_color") || "#FFD600"
      };

      // Moduler
      if (map?.initMap) map.initMap(HG.data.places, HG.data.routes);
      if (quiz?.initQuizSystem) quiz.initQuizSystem(HG.data.badges);
      if (Profile?.initProfileMini) Profile.initProfileMini();

      // Hendelser + UI
      attachEventListeners();
      renderRoutesList();
      tryLocateUser();

      wirePanelButtons();             // ← “Se kart” / (×) / backdrop
      ui.openSheet('exploreSheet');   // start med panelet åpent
      const backdrop = document.getElementById('backdrop');
      if (backdrop) backdrop.classList.add('active');

      showToast(`Velkommen tilbake, ${HG.user.name}!`);
    } catch (err) {
      console.error("Feil ved oppstart:", err);
    }
  }

  // ----------------------------------------------------------
  // 2) GEOLOKASJON & LIVE OPPDATERING
  // ----------------------------------------------------------
  function tryLocateUser() {
    if (!navigator.geolocation) {
      console.warn("Geolokasjon ikke støttet");
      renderNearbyPlaces(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lastPos = [pos.coords.latitude, pos.coords.longitude];
        renderNearbyPlaces(lastPos);
        startWatchingPosition();
      },
      (err) => {
        console.warn("Kunne ikke hente posisjon:", err);
        renderNearbyPlaces(null);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }

  function startWatchingPosition() {
    if (!navigator.geolocation) return;
    if (watchId) navigator.geolocation.clearWatch(watchId);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        const moved = !lastPos || distance(...lastPos, ...newPos) > 100; // >100 m
        if (moved) {
          lastPos = newPos;
          renderNearbyPlaces(newPos);
        }
      },
      (err) => console.warn("watchPosition-feil:", err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }

  // ----------------------------------------------------------
  // 3) UTFORSKPANEL
  // ----------------------------------------------------------
  function renderNearbyPlaces(userPos) {
    const list = document.getElementById("nearbyList");
    if (!list) return;
    list.innerHTML = "";

    const places = HG.data.places || [];
    let sorted = [];

    if (userPos) {
      sorted = places
        .map(p => ({
          ...p,
          dist: distance(userPos[0], userPos[1], p.lat, p.lon)
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 6);
    } else {
      sorted = places.slice(0, 6);
    }

    sorted.forEach(p => {
      const km = p.dist ? (p.dist / 1000).toFixed(2) + " km" : "";
      const item = document.createElement("div");
      item.className = "nearby-item";
      item.innerHTML = `
        <div class="nearby-info">
          <strong>${p.name}</strong><br>
          <small>${p.category || ""} ${km ? "· " + km : ""}</small>
        </div>
        <button class="btn-quiz" data-id="${p.id}">Start</button>
      `;
      item.querySelector("button").onclick = () => startQuizForPlace(p.id);
      list.appendChild(item);
    });

    // Panelet skal være synlig når vi har (re)rendret
    ui.openSheet("exploreSheet");
    const backdrop = document.getElementById('backdrop');
    if (backdrop) backdrop.classList.add('active');
  }

  function renderRoutesList() {
    const list = document.getElementById("routesList");
    if (!list) return;
    list.innerHTML = "";

    (HG.data.routes || []).forEach(r => {
      const div = document.createElement("div");
      div.className = "route-item";
      div.innerHTML = `
        <strong>${r.name}</strong><br>
        <small>${r.category || ""}</small>
      `;
      div.onclick = () => showRouteOnMap(r);
      list.appendChild(div);
    });
  }

  function showRouteOnMap(route) {
    closePanel(); // gi full plass til kartet når rute vises
    if (route && map?.highlightNearbyPlaces) {
      const firstStop = route.stops?.[0];
      if (firstStop?.placeId) {
        const pl = HG.data.places.find(p => p.id === firstStop.placeId);
        if (pl) map.highlightNearbyPlaces(pl.lat, pl.lon, 300);
      }
    }
    showToast(`🗺️ Viser rute: ${route.name}`);
  }

  // ----------------------------------------------------------
  // 4) QUIZ OG PROGRESJON
  // ----------------------------------------------------------
  function startQuizForPlace(placeId) {
    if (quiz?.startQuiz) quiz.startQuiz(placeId);
  }

  function handleQuizCompletion(result) {
    try {
      console.log("🏁 Quiz fullført:", result);
      addCompletedQuizAndMaybePoint(result);
      updateMeritLevel(result.categoryId, result.points);
      addVisitedPlace(result.placeId);
      unlockPeopleAtPlace(result.placeId);

      window.dispatchEvent(new Event("updateProfile"));
      showToast(`+${result.points} poeng i ${result.categoryId}!`);
    } catch (err) {
      console.error("Feil ved håndtering av quiz:", err);
    }
  }

  // ----------------------------------------------------------
  // 5) PROGRESJON
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
  // 6) UI-KNAPPER (Se kart / Vis panel / × / backdrop)
  // ----------------------------------------------------------
  function wirePanelButtons() {
    const seeBtn   = document.getElementById('btnSeeMap')   || document.getElementById('toggleMode'); // fallback
    const closeBtn = document.getElementById('btnCloseSheet');
    const sheet    = document.getElementById('exploreSheet');
    const backdrop = document.getElementById('backdrop');

    const openPanel = () => {
      ui.openSheet('exploreSheet');
      if (backdrop) backdrop.classList.add('active');
      if (seeBtn) seeBtn.textContent = 'Se kart';
    };

    const closePanel = () => {
      ui.closeSheet('exploreSheet');
      if (backdrop) backdrop.classList.remove('active');
      if (seeBtn) seeBtn.textContent = 'Vis panel';
    };

    // eksporterer for bruk i andre funksjoner (showRouteOnMap)
    app._openPanel = openPanel;
    app._closePanel = closePanel;

    if (seeBtn) {
      seeBtn.onclick = () => {
        const isOpen = sheet.classList.contains('sheet-open');
        isOpen ? closePanel() : openPanel();
      };
    }
    if (closeBtn) closeBtn.onclick = closePanel;
    if (backdrop) backdrop.onclick = closePanel;
  }

  // Hjelpere for intern bruk
  function closePanel(){ app._closePanel?.(); }
  function openPanel(){ app._openPanel?.(); }

  // ----------------------------------------------------------
  // 7) HENDELSER FRA KART/QUIZ
  // ----------------------------------------------------------
  function attachEventListeners() {
    // Trykk på sted → start quiz
    document.addEventListener("placeSelected", (e) => {
      const placeId = e.detail?.placeId;
      if (placeId) startQuizForPlace(placeId);
    });

    // Når quiz fullføres
    document.addEventListener("quizCompleted", (e) => {
      if (e.detail) handleQuizCompletion(e.detail);
    });
  }

  // ----------------------------------------------------------
  // 8) HJELPEFUNKSJONER
  // ----------------------------------------------------------
  function distance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function load(key, def) {
    try { return JSON.parse(localStorage.getItem(key)) || def; }
    catch { return def; }
  }
  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
  function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => (t.style.display = "none"), 2400);
  }

  // ----------------------------------------------------------
  // 9) EKSPORT
  // ----------------------------------------------------------
  return {
    initApp,
    handleQuizCompletion,
    startQuizForPlace
  };
})();

// ----------------------------------------------------------
// AUTO-START
// ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  if (typeof boot === "function") boot();
  else app.initApp();
});
