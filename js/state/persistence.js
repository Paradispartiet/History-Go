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

function saveVisited() {
  localStorage.setItem("visited_places", JSON.stringify(window.visited));
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

  if (!visited[id]) {
    visited[id] = true;
    saveVisited();
    window.dispatchEvent(new Event("updateProfile"));
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
  localStorage.setItem(
    "merits_by_category",
    JSON.stringify(merits)
  );
}

window.saveMerits = saveMerits;
