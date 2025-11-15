// ============================================================
//  UNIVERSAL PERSON INFO POPUP (REN NY VERSJON)
// ============================================================
window.showPersonPopup = function(person) {
  if (!person) return;

  const face    = `bilder/people/${person.id}_face.PNG`;
  const cardImg = person.image || `bilder/kort/people/${person.id}.PNG`;
  const wiki    = person.wiki || "";
  const works   = person.works || [];

  const placeMatches = PLACES.filter(p => p.people?.includes(person.id));

  const el = document.createElement("div");
  el.className = "hg-popup";

  el.innerHTML = `
    <div class="hg-popup-inner">

      <!-- Close -->
      <button class="hg-popup-close">✕</button>

      <!-- Face -->
      <img src="${face}" class="hg-popup-face">

      <h2 class="hg-popup-name">${person.name}</h2>

      <!-- Kortbilde nederst til høyre -->
      <img src="${cardImg}" class="hg-popup-cardimg">

      <!-- Verk -->
      <div class="hg-section">
        <h3>Verk</h3>
        ${
          works.length
            ? `<ul class="hg-works">
                 ${works.map(w => `<li>${w}</li>`).join("")}
               </ul>`
            : `<p class="hg-muted">Ingen registrerte verk.</p>`
        }

        <!-- ENKEL NY QUIZ-KNAPP -->
        <button class="hg-quiz-btn" data-quiz="${person.id}">
          Ta quiz
        </button>
      </div>

      <!-- Wiki -->
      <div class="hg-section">
        <h3>Om personen</h3>
        <p class="hg-wiki">${wiki}</p>
      </div>

      <!-- Steder -->
      <div class="hg-section">
        <h3>Steder</h3>
        ${
          placeMatches.length
            ? `<div class="hg-places">
                 ${placeMatches
                   .map(
                     p => `
                     <div class="hg-place" data-place="${p.id}">
                       📍 ${p.name}
                     </div>`
                   )
                   .join("")}
               </div>`
            : `<p class="hg-muted">Ingen stedstilknytning.</p>`
        }
      </div>

    </div>
  `;

  // Lukk
  el.querySelector(".hg-popup-close").onclick = () => el.remove();

  // Klikk på steder → åpne steds-popup
  el.querySelectorAll("[data-place]").forEach(btn => {
    btn.onclick = () => {
      const place = PLACES.find(p => p.id === btn.dataset.place);
      el.remove();
      showPlacePopup(place);
    };
  });

  document.body.appendChild(el);
};

// ============================================================
//  UNIVERSAL STEDS-POPUP (REN NY VERSJON)
// ============================================================
window.showPlacePopup = function(place) {
  if (!place) return;

  const fullImg  = place.image || `bilder/kort/places/${place.id}.PNG`;
  const thumbImg = `bilder/kort/places/${place.id}.PNG`;

  const peopleHere = PEOPLE.filter(p => p.placeId === place.id);

  const card = document.createElement("div");
  card.className = "hg-popup";

  card.innerHTML = `
    <div class="hg-popup-inner">

      <!-- Hovedbilde -->
      <img src="${fullImg}" class="hg-popup-img" alt="${place.name}">

      <h3 class="hg-popup-title">${place.name}</h3>
      <p class="hg-popup-cat">${place.category || ""}</p>

      <p class="hg-popup-desc">${place.desc || ""}</p>

      <!-- ENKEL NY QUIZ-KNAPP -->
      <button class="hg-quiz-btn" data-quiz="${place.id}">
        Ta quiz
      </button>

      <!-- Personer -->
      ${
        peopleHere.length
          ? `<div class="hg-popup-subtitle">Personer</div>
             <div class="hg-popup-people">
               ${peopleHere.map(p => `
                 <div class="hg-popup-face" data-person="${p.id}">
                   <img src="bilder/people/${p.id}_face.PNG">
                 </div>
               `).join("")}
             </div>`
          : ""
      }

      <!-- Mini-kort nederst -->
      <img src="${thumbImg}" class="hg-popup-cardthumb">

      <!-- Koordinater -->
      <div class="hg-popup-locations">
        <div class="loc-chip">
          📍 ${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(card);

  // Klikk på person → åpne person-popup
  card.querySelectorAll(".hg-popup-face").forEach(el => {
    el.onclick = () => {
      const pr = PEOPLE.find(p => p.id === el.dataset.person);
      showPersonPopup(pr);
    };
  });

  // Klikk utenfor → lukk
  setTimeout(() => card.classList.add("visible"), 10);
  card.onclick = e => {
    if (e.target.classList.contains("hg-popup")) card.remove();
  };
};

window.openPlaceCardByPerson = function(person) {
  if (!person) return;

  // Finn sted eller bruk fallback-posisjon
  const place =
    PLACES.find(x => x.id === person.placeId) || {
      id: "personloc",
      name: person.name,
      category: tagToCat(person.tags),
      r: person.r || 150,
      desc: person.desc || "",
      lat: person.lat,
      lon: person.lon
    };

  // Vis popup
  window.showPlaceCard(place);

  // Quiz-knapp inne i stedet skal egentlig vise personquiz
  setTimeout(() => {
    const btn = document.querySelector(`button[data-quiz="${place.id}"]`);
    if (btn) {
      btn.onclick = () => startQuiz(person.id);
    }
  }, 50);
};

// ============================================================
//  GLOBAL QUIZ-KNAPP HANDLER (MÅ VÆRE MED)
// ============================================================
document.addEventListener("click", e => {
  const btn = e.target.closest(".hg-quiz-btn");
  if (!btn) return;
  const targetId = btn.dataset.quiz;
  if (targetId) startQuiz(targetId);
});


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

