// ======================================================
// PLACE CARD POPUP  (erstatter gammel sheet-løsning)
// ======================================================

window.showPlaceCard = function(place) {
  if (!place) return;

  const imgPath = place.image || `bilder/kort/places/${place.id}.PNG`;
  const cat = place.category || "";
  const desc = place.desc || "";
  const radius = place.r || 120;

  const people = (place.people || [])
    .map(p => typeof p === "string" ? PEOPLE.find(x => x.id === p) : p)
    .filter(Boolean);

  const htmlPeople = people.length
    ? people.map(p => `
        <button class="person-chip" data-person="${p.id}">
          <img src="bilder/people/${p.id}_face.PNG" alt="${p.name}">
          <span>${p.name}</span>
        </button>
      `).join("")
    : `<p class="muted">Ingen personer registrert her.</p>`;

  const card = document.createElement("div");
  card.className = "popup placecard-popup";

  card.innerHTML = `
    <div class="popup-inner placecard-inner">
      <button class="popup-close" data-close-popup>✕</button>

      <img src="${imgPath}" class="placecard-img" alt="${place.name}">
      <h2 class="placecard-title">${place.name}</h2>
      <p class="placecard-meta">${cat} • radius ${radius} m</p>

      <p class="placecard-desc">${desc}</p>

      <div class="placecard-people">
        ${htmlPeople}
      </div>

      <div class="placecard-actions">
        <button class="primary" data-quiz="${place.id}">Ta quiz</button>
        <button class="ghost" data-route="${place.id}">Rute</button>
        <button class="ghost" data-info="${encodeURIComponent(place.name)}">Mer info</button>
      </div>
    </div>
  `;

  document.body.appendChild(card);
  setTimeout(() => card.classList.add("visible"), 10);

  // Close
  card.querySelector("[data-close-popup]").onclick = () => card.remove();

  // Person-klikk
  card.querySelectorAll("[data-person]").forEach(btn => {
    btn.onclick = () => {
      const p = PEOPLE.find(x => x.id === btn.dataset.person);
      if (p && window.showPersonPopup) window.showPersonPopup(p);
    };
  });

  // Rute
  card.querySelector(`[data-route="${place.id}"]`).onclick = () => {
    if (typeof showRouteTo === "function") {
      showRouteTo(place);
    }
  };
};
