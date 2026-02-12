// ============================================================
// LISTS (Nearby, People, Collection)
// Global-safe versjon
// ============================================================

function renderNearbyPlaces() {
  const listEl = document.getElementById("nearbyList");
  if (!listEl) return;

  const PLACES = window.PLACES || [];
  const visited = window.visited || {};
  const catColor = window.catColor || (() => "#888");

  const pos = window.getPos?.();

  const sorted = PLACES
    .map(p => ({
      ...p,
      _d: pos && typeof window.distMeters === "function"
        ? Math.round(window.distMeters(pos, { lat: p.lat, lon: p.lon }))
        : null
    }))
    .sort((a, b) => (a._d ?? 1e12) - (b._d ?? 1e12));

  listEl.innerHTML = "";

  sorted.slice(0, 30).forEach(place => {

    const img = place.cardImage || place.image || "";

    const item = document.createElement("div");
    item.className = "nearby-item";
    item.style.borderLeft = `4px solid ${catColor(place.category)}`;

    item.innerHTML = `
      <div class="nearby-thumbWrap">
        <img class="nearby-thumb" src="${img}" alt="${place.name}">
      </div>

      <div class="nearby-content">
        <div class="nearby-title">${place.name}</div>
        <div class="nearby-meta">
          ${place._d != null ? place._d + " m" : ""}
          ${visited[place.id] ? " • ✔" : ""}
        </div>
      </div>
    `;

    item.addEventListener("click", () => {
      if (typeof window.openPlaceCard === "function") {
        window.openPlaceCard(place);
      }
    });

    listEl.appendChild(item);
  });
}

function renderNearbyPeople() {
  const listEl = document.getElementById("leftPeopleList");
  if (!listEl) return;

  const PEOPLE = window.PEOPLE || [];
  const visited = window.visited || {};
  const REL = window.REL_BY_PLACE || {};

  listEl.innerHTML = "";

  const visitedPlaceIds = Object.keys(visited).filter(id => visited[id]);
  const relatedIds = new Set();

  visitedPlaceIds.forEach(pid => {
    const rels = REL[pid] || [];
    rels.forEach(r => {
      if (r.person) relatedIds.add(r.person);
    });
  });

  const relatedPeople = PEOPLE.filter(p => relatedIds.has(p.id));

  relatedPeople.forEach(person => {
    const img = person.cardImage || person.image || "";

    const item = document.createElement("div");
    item.className = "nearby-item";

    item.innerHTML = `
      <div class="nearby-thumbWrap">
        <img class="nearby-thumb" src="${img}" alt="${person.name}">
      </div>
      <div class="nearby-title">${person.name}</div>
    `;

    item.addEventListener("click", () => {
      if (typeof window.openPersonCard === "function") {
        window.openPersonCard(person);
      }
    });

    listEl.appendChild(item);
  });
}

function renderCollection() {
  const grid = document.getElementById("collectionGrid");
  if (!grid) return;

  const PLACES = window.PLACES || [];
  const visited = window.visited || {};

  grid.innerHTML = "";

  PLACES.filter(p => visited[p.id]).forEach(place => {
    const img = place.cardImage || place.image || "";

    const item = document.createElement("div");
    item.className = "collection-item";

    item.innerHTML = `
      <img src="${img}" alt="${place.name}">
      <div>${place.name}</div>
    `;

    item.addEventListener("click", () => {
      if (typeof window.openPlaceCard === "function") {
        window.openPlaceCard(place);
      }
    });

    grid.appendChild(item);
  });
}

// eksponer globalt
window.renderNearbyPlaces = renderNearbyPlaces;
window.renderNearbyPeople = renderNearbyPeople;
window.renderCollection = renderCollection;
