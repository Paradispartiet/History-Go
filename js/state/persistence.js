// state/persistence.js

function savePersonDialogs() {
  localStorage.setItem(
    "hg_person_dialogs_v1",
    JSON.stringify(personDialogs)
  );
  if (typeof syncHistoryGoToAHA === "function") {
    syncHistoryGoToAHA();
  }
}

function saveUserNotes() {
  localStorage.setItem(
    "hg_user_notes_v1",
    JSON.stringify(userNotes)
  );
  if (typeof syncHistoryGoToAHA === "function") {
    syncHistoryGoToAHA();
  }
}

// progress for “+1 poeng per 3 riktige”
const userProgress = JSON.parse(
  localStorage.getItem("historygo_progress") || "{}"
);

const GROUNDHOPPER_STATS_KEY = "hg_groundhopper_stats_v1";

function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function getGroundhopperStats() {
  const fallback = {
    version: 1,
    visited_groundhopper_places: [],
    visited_by_venue_kind: {},
    visited_by_sport: {},
    visited_by_groundhopper_type: {},
    clubs_collected: [],
    teams_collected: [],
    first_visit_by_place: {},
    last_visit_by_place: {},
    visit_count_by_place: {},
    total_groundhopper_places_visited: 0,
    total_football_grounds_visited: 0,
    total_ice_arenas_visited: 0,
    total_athletics_venues_visited: 0,
    total_winter_sport_places_visited: 0,
    total_national_arenas_visited: 0,
    updated_at: null
  };
  try {
    const parsed = JSON.parse(localStorage.getItem(GROUNDHOPPER_STATS_KEY) || "null");
    if (!parsed || typeof parsed !== "object") return fallback;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function saveGroundhopperStats(stats) {
  localStorage.setItem(GROUNDHOPPER_STATS_KEY, JSON.stringify(stats));
}

function isGroundhopperPlace(place) {
  return place?.category === "sport" && place?.sport_profile?.groundhopper_relevant !== false;
}

function recalculateGroundhopperTotals(stats, placeLookup) {
  const visitedIds = normalizeArray(stats?.visited_groundhopper_places);
  let football = 0, ice = 0, athletics = 0, winter = 0, national = 0;
  for (const placeId of visitedIds) {
    const place = placeLookup?.[placeId];
    if (!isGroundhopperPlace(place)) continue;
    const profile = place.sport_profile || {};
    const sports = normalizeArray(profile.sports).map((s) => s.toLowerCase());
    const venueKind = String(profile.venue_kind || "").toLowerCase();
    const groundhopperType = String(profile.groundhopper_type || "").toLowerCase();
    if (sports.includes("fotball") || venueKind === "football_ground" || venueKind === "stadium") football++;
    if (sports.includes("ishockey") || sports.includes("skøyter") || sports.includes("bandy") || venueKind === "ice_arena") ice++;
    if (sports.includes("friidrett") || venueKind === "athletics_venue") athletics++;
    if (sports.includes("ski") || sports.includes("hopp") || sports.includes("langrenn") || sports.includes("skiskyting") || sports.includes("skøyter") || venueKind === "winter_sport_venue" || groundhopperType.includes("vintersport")) winter++;
    if (groundhopperType === "nasjonalarena" || groundhopperType === "nasjonalanlegg") national++;
  }
  stats.total_groundhopper_places_visited = visitedIds.length;
  stats.total_football_grounds_visited = football;
  stats.total_ice_arenas_visited = ice;
  stats.total_athletics_venues_visited = athletics;
  stats.total_winter_sport_places_visited = winter;
  stats.total_national_arenas_visited = national;
}

function updateGroundhopperFromPlace(place) {
  if (!place || !isGroundhopperPlace(place)) return;
  const placeId = String(place.id || "").trim();
  if (!placeId) return;

  const stats = getGroundhopperStats();
  const now = new Date().toISOString();
  const profile = place.sport_profile || {};

  const visitedSet = new Set(normalizeArray(stats.visited_groundhopper_places));
  const isFirstVisit = !visitedSet.has(placeId);
  visitedSet.add(placeId);
  stats.visited_groundhopper_places = Array.from(visitedSet);

  stats.first_visit_by_place = stats.first_visit_by_place || {};
  stats.last_visit_by_place = stats.last_visit_by_place || {};
  stats.visit_count_by_place = stats.visit_count_by_place || {};
  if (isFirstVisit) stats.first_visit_by_place[placeId] = now;
  stats.last_visit_by_place[placeId] = now;
  stats.visit_count_by_place[placeId] = Number(stats.visit_count_by_place[placeId] || 0) + 1;

  const venueKind = String(profile.venue_kind || "").trim();
  if (venueKind) stats.visited_by_venue_kind[venueKind] = Number(stats.visited_by_venue_kind[venueKind] || 0) + 1;
  for (const sport of normalizeArray(profile.sports)) {
    stats.visited_by_sport[sport] = Number(stats.visited_by_sport[sport] || 0) + 1;
  }
  const ghType = String(profile.groundhopper_type || "").trim();
  if (ghType) stats.visited_by_groundhopper_type[ghType] = Number(stats.visited_by_groundhopper_type[ghType] || 0) + 1;

  stats.clubs_collected = Array.from(new Set([...normalizeArray(stats.clubs_collected), ...normalizeArray(profile.clubs_or_teams)]));
  stats.teams_collected = Array.from(new Set([...normalizeArray(stats.teams_collected), ...normalizeArray(profile.teams)]));

  const places = Array.isArray(window.PLACES) ? window.PLACES : [];
  const placeLookup = Object.fromEntries(places.map((p) => [String(p?.id || ""), p]));
  placeLookup[placeId] = place;
  recalculateGroundhopperTotals(stats, placeLookup);
  stats.updated_at = now;
  saveGroundhopperStats(stats);
  window.dispatchEvent(new Event("updateProfile"));
}

function saveVisited() {
  localStorage.setItem(
    "visited_places",
    JSON.stringify(window.visited)
  );

  renderCollection();

  if (window.HGMap) {
    HGMap.setVisited(window.visited);
    HGMap.refreshMarkers();
  }

  window.dispatchEvent(new Event("updateProfile"));
}

function saveVisitedFromQuiz(placeId) {
  const id = String(placeId ?? "");
  if (!id) return;

  if (!window.visited[id]) {
    window.visited[id] = true;
    const place = (Array.isArray(window.PLACES) ? window.PLACES : []).find((p) => String(p?.id || "") === id);
    updateGroundhopperFromPlace(place);
    saveVisited();
    window.renderNearbyPlaces?.();
  }
}

function savePeople() {
  localStorage.setItem(
    "people_collected",
    JSON.stringify(peopleCollected)
  );
  renderGallery();
}

function saveMerits() {
  const nextRaw = JSON.stringify(merits);
  const prevRaw = localStorage.getItem("merits_by_category");
  if (prevRaw === nextRaw) return;
  localStorage.setItem("merits_by_category", nextRaw);
  window.dispatchEvent(new Event("updateProfile"));
}

window.saveMerits = saveMerits;
window.saveVisitedFromQuiz = saveVisitedFromQuiz;
window.HG_getGroundhopperStats = getGroundhopperStats;
window.HG_updateGroundhopperFromPlace = updateGroundhopperFromPlace;
window.HG_isGroundhopperPlace = isGroundhopperPlace;

// Eksponert for QuizEngine-rewards: marker person som samlet + persistér.
window.savePeopleCollected = function (personId) {
  const id = String(personId ?? "").trim();
  if (!id) return;
  if (typeof peopleCollected !== "object" || peopleCollected == null) return;
  if (peopleCollected[id]) return;
  peopleCollected[id] = true;
  savePeople();
  window.dispatchEvent(new Event("updateProfile"));
};
