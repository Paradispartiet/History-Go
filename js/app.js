// ============================================================
// === HISTORY GO – APP.JS (v3.5, komplett og stabil) =========
// ============================================================
//
//  • Utforskpanel alltid synlig
//  • Kartetikett viser nærmeste sted / valgt rute
//  • Automatisk fargekoding etter kategori
//  • Håndterer quizresultater, progresjon og profiloppdatering
//
// ============================================================

const HG = window.HG || {};

const app = (() => {
  let lastPos = null;
  let watchId = null;

  // ----------------------------------------------------------
  // INITIERING
  // ----------------------------------------------------------
  async function initApp() {
    try {
      console.log("📦 Initialiserer History Go...");

      if (!HG.data || !HG.data.places) {
        console.warn("Data ikke funnet – venter på core.boot()");
        await new Promise(r => setTimeout(r, 400));
      }

      HG.user = {
        name: localStorage.getItem("user_name") || "Ukjent spiller",
        color: localStorage.getItem("user_color") || "#FFD600"
      };

      if (map?.initMap) map.initMap(HG.data.places, HG.data.routes);
      initMiniProfile();
      renderRoutesList();
      tryLocateUser();
      attachEventListeners();

      showToast(`Velkommen tilbake, ${HG.user.name}!`);
    } catch (err) {
      console.error("Feil ved oppstart:", err);
    }
  }

  // ----------------------------------------------------------
  // HENDELSER
  // ----------------------------------------------------------
  function attachEventListeners() {
    const mapLabel = document.getElementById("mapLabel");
    if (mapLabel) {
      mapLabel.addEventListener("click", () => {
        document.body.classList.toggle("map-active");
      });
    }
  }

  // ----------------------------------------------------------
  // GEOLOKASJON
  // ----------------------------------------------------------
  function tryLocateUser() {
    if (!navigator.geolocation) {
      renderNearbyPlaces(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        lastPos = [pos.coords.latitude, pos.coords.longitude];
        renderNearbyPlaces(lastPos);
        startWatchingPosition();
      },
      () => renderNearbyPlaces(null),
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }

  function startWatchingPosition() {
    if (!navigator.geolocation) return;
    if (watchId) navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(
      pos => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        const moved = !lastPos || distance(...lastPos, ...newPos) > 100;
        if (moved) {
          lastPos = newPos;
          renderNearbyPlaces(newPos);
        }
      },
      err => console.warn("watchPosition-feil:", err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }

// ----------------------------------------------------------
// UTFORSKPANEL – viser steder i nærheten (med "Se på kart")
// ----------------------------------------------------------
function renderNearbyPlaces(userPos) {
  const list = document.getElementById("nearbyList");
  if (!list) return;
  list.innerHTML = "";

  const places = HG.data.places || [];
  let sorted = [];

  // Sorter etter avstand hvis posisjon finnes
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
    const color = getCategoryColor(p.category);

    const item = document.createElement("div");
    item.className = "nearby-item";
    item.style.borderLeft = `4px solid ${color}`;
    item.innerHTML = `
      <div class="nearby-info">
        <strong>${p.name}</strong><br>
        <small>${p.category || ""} ${km ? "· " + km : ""}</small>
      </div>
      <div class="nearby-actions">
        <button class="btn-quiz" data-id="${p.id}">Start</button>
        <button class="btn-map" data-id="${p.id}">Se på kart</button>
      </div>
    `;

    // Start quiz-knapp
    item.querySelector(".btn-quiz").onclick = () => startQuizForPlace(p.id);

    // Se på kart-knapp
    item.querySelector(".btn-map").onclick = () => {
      if (map?.focusOnPlace) {
        map.focusOnPlace(p.id);
        showToast(`📍 Viser ${p.name} på kartet`);
      } else {
        console.warn("map.focusOnPlace mangler i map.js");
      }
    };

    list.appendChild(item);
  });

  updateMapLabelArea(userPos);
}

  // ----------------------------------------------------------
  // KARTMODUS / ETIKETT
  // ----------------------------------------------------------
  function showRouteOnMap(route) {
    if (route && map?.highlightNearbyPlaces) {
      const firstStop = route.stops?.[0];
      if (firstStop?.placeId) {
        const pl = HG.data.places.find(p => p.id === firstStop.placeId);
        if (pl) map.highlightNearbyPlaces(pl.lat, pl.lon, 300);
      }
    }

    const color = getCategoryColor(route.category);
    const mapLabel = document.getElementById("mapLabel");
    if (mapLabel) {
      mapLabel.firstChild.textContent = `Kartmodus · ${route.name}`;
      mapLabel.style.color = color;
      mapLabel.style.borderColor = color;
      mapLabel.style.display = "flex";
    }

    showToast(`🗺️ Viser rute: ${route.name}`);
  }

  function updateMapLabelArea(userPos) {
    const mapLabel = document.getElementById("mapLabel");
    if (!mapLabel || !userPos || !HG?.data?.places?.length) return;

    const currentText = mapLabel.firstChild?.textContent || "";
    if (currentText.includes("rute") || currentText.includes("Ruten")) return;

    const nearest = HG.data.places
      .map(p => ({
        ...p,
        dist: distance(userPos[0], userPos[1], p.lat, p.lon)
      }))
      .sort((a, b) => a.dist - b.dist)[0];

    if (nearest && nearest.dist < 1500) {
      mapLabel.firstChild.textContent = `Kartmodus · ${nearest.name}`;
      mapLabel.style.color = getCategoryColor(nearest.category);
      mapLabel.style.borderColor = getCategoryColor(nearest.category);
    } else {
      mapLabel.firstChild.textContent = "Kartmodus";
      mapLabel.style.color = "#FFD600";
      mapLabel.style.borderColor = "rgba(255,255,255,.15)";
    }
  }

// ----------------------------------------------------------
// MINI-PROFIL (viser navn, men ikke redigerbar)
// ----------------------------------------------------------
function initMiniProfile() {
  const miniName = document.getElementById("miniName");
  const miniStats = document.getElementById("miniStats");
  const openBtn = document.getElementById("openProfile");
  if (!miniName || !miniStats) return;

  // --- Sett navn fra lagring ---
  miniName.textContent = localStorage.getItem("user_name") || "Utforsker";

  // --- Statistikk ---
  function updateStats() {
    const places = load("visited_places", []);
    const merits = load("merits_by_category", {});
    const quizzes = Object.keys(load("quiz_progress", {})).length;
    miniStats.textContent = `${places.length} steder · ${Object.keys(merits).length} merker · ${quizzes} quizzer`;
  }

  updateStats();

  // --- Åpne profilside ---
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      window.location.href = "profile.html";
    });
  }

  // --- Oppdater når profilnavn endres ---
  window.addEventListener("updateProfile", () => {
    miniName.textContent = localStorage.getItem("user_name") || "Utforsker";
    updateStats();
  });
}

  // ----------------------------------------------------------
  // QUIZRESULTAT
  // ----------------------------------------------------------
  function startQuizForPlace(placeId) {
    if (quiz?.startQuiz) quiz.startQuiz(placeId);
  }

  function handleQuizCompletion(result) {
    addCompletedQuizAndMaybePoint(result);
    updateMeritLevel(result.categoryId, result.points);
    addVisitedPlace(result.placeId);
    unlockPeopleAtPlace(result.placeId);
    window.dispatchEvent(new Event("updateProfile"));
    showToast(`+${result.points} poeng i ${result.categoryId}!`);
  }

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
        visited.push({ id: pl.id, name: pl.name, year: pl.year, desc: pl.desc, lat: pl.lat, lon: pl.lon });
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
        collected.push({ id: p.id, name: p.name, year: p.year, placeId });
        showToast(`👤 Ny person: ${p.name}`);
      }
    });
    save("people_collected", collected);
  }

  // ----------------------------------------------------------
  // HJELPERE
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
    try {
      return JSON.parse(localStorage.getItem(key)) || def;
    } catch {
      return def;
    }
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

  function getCategoryColor(cat = "") {
    const c = cat.toLowerCase();
    if (c.includes("historie")) return "#344B80";
    if (c.includes("vitenskap")) return "#9b59b6";
    if (c.includes("kunst")) return "#ffb703";
    if (c.includes("musikk")) return "#ff66cc";
    if (c.includes("litteratur")) return "#f6c800";
    if (c.includes("natur")) return "#4caf50";
    if (c.includes("sport")) return "#2a9d8f";
    if (c.includes("by")) return "#e63946";
    if (c.includes("politikk")) return "#c77dff";
    return "#FFD600";
  }

  // ----------------------------------------------------------
  // EKSPORT
  // ----------------------------------------------------------
  return {
    initApp,
    handleQuizCompletion,
    startQuizForPlace
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (typeof boot === "function") boot();
  else app.initApp();
});

// === WIRING (støtt både direkte kall og event-basert) ======
document.addEventListener("placeSelected", (e) => {
  const { placeId } = e.detail || {};
  if (placeId && quiz?.startQuiz) quiz.startQuiz(placeId);
});

document.addEventListener("quizCompleted", (e) => {
  if (!e?.detail) return;
  handleQuizCompletion(e.detail);
});

// === MINI-PROFIL (leser, men endrer ikke navn her) =========
function initMiniProfile() {
  const miniName = document.getElementById("miniName");
  const miniStats = document.getElementById("miniStats");
  const openBtn  = document.getElementById("openProfile");
  if (!miniName || !miniStats) return;

  miniName.textContent = localStorage.getItem("user_name") || "Utforsker";

  function updateStats() {
    const places = load("visited_places", []);
    const merits = load("merits_by_category", {});
    const quizzes = Object.keys(load("quiz_progress", {})).length;
    miniStats.textContent =
      `${places.length} steder · ${Object.keys(merits).length} merker · ${quizzes} quizzer`;
  }
  updateStats();

  if (openBtn) openBtn.onclick = () => (window.location.href = "profile.html");

  // Oppdater når profil-siden lagrer nytt navn/progresjon
  window.addEventListener("updateProfile", () => {
    miniName.textContent = localStorage.getItem("user_name") || "Utforsker";
    updateStats();
  });
}

// === ROUTES-LISTE + “Se på kart” (ingen auto-gul rute) =====
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
      <div style="margin-top:6px">
        <button class="btn-quiz" data-id="${r.id}">Se på kart</button>
      </div>
    `;
    div.querySelector("button").onclick = () => {
      if (map?.showRoute) map.showRoute(r); // tegner først ved valg
      const color = getCategoryColor(r.category || "");
      const mapLabel = document.getElementById("mapLabel");
      if (mapLabel) {
        mapLabel.firstChild && (mapLabel.firstChild.textContent = `Kartmodus · ${r.name}`);
        mapLabel.style.color = color;
        mapLabel.style.borderColor = color;
        mapLabel.style.display = "flex";
      }
      showToast(`🗺️ Viser rute: ${r.name}`);
    };
    list.appendChild(div);
  });
}

// === QUIZ-FLYT (uendret logikk, men kall oppdaterer profil) =
function handleQuizCompletion(result) {
  addCompletedQuizAndMaybePoint(result);
  updateMeritLevel(result.categoryId, result.points);
  addVisitedPlace(result.placeId);
  unlockPeopleAtPlace(result.placeId);
  window.dispatchEvent(new Event("updateProfile")); // <- viktig
  showToast(`+${result.points} poeng i ${result.categoryId}!`);
}
