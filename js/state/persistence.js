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
