// ============================================================
// HISTORY GO – POPUP-UTILS v20
// Felles motor for ALLE popups (person, sted, placeCard, reward)
// ============================================================

// Holder referanse til aktiv popup
let currentPopup = null;


// ============================================================
// 1. LUKK POPUP
// ============================================================
function closePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
}


// ============================================================
// 2. GENERELL POPUP-GENERATOR
// ============================================================
function makePopup(html, extraClass = "") {
  // Fjern eventuell tidligere popup
  closePopup();

  const el = document.createElement("div");
  el.className = `hg-popup ${extraClass}`;

  el.innerHTML = `
    <div class="hg-popup-inner">
      <button class="hg-popup-close" data-close-popup>✕</button>
      ${html}
    </div>
  `;

  // Lukk via ✕
  el.addEventListener("click", e => {
    if (e.target.closest("[data-close-popup]")) {
      closePopup();
    }
  });

  // Lukk via mørk bakgrunn
  el.addEventListener("click", e => {
    if (e.target === el) closePopup();
  });

  document.body.appendChild(el);
  currentPopup = el;
  requestAnimationFrame(() => el.classList.add("visible"));
}


// ============================================================
// PERSON-POPUP
// ============================================================
window.showPersonPopup = function(person) {
  if (!person) return;

  const face    = `bilder/people/${person.id}_face.PNG`;
  const cardImg = person.image || `bilder/kort/people/${person.id}.PNG`;
  const works   = person.works || [];
  const wiki    = person.wiki || "";

  const placeMatches = PLACES.filter(
    p => p.people?.includes(person.id)
  );

  const html = `
      <img src="${face}" class="hg-popup-face">

      <h2 class="hg-popup-name">${person.name}</h2>

      <img src="${cardImg}" class="hg-popup-cardimg">

      <div class="hg-section">
        <h3>Verk</h3>
        ${
          works.length
            ? `<ul class="hg-works">${works.map(w => `<li>${w}</li>`).join("")}</ul>`
            : `<p class="hg-muted">Ingen registrerte verk.</p>`
        }

        <button class="hg-quiz-btn" data-quiz="${person.id}">
          Ta quiz
        </button>
      </div>

      <div class="hg-section">
        <h3>Om personen</h3>
        <p class="hg-wiki">${wiki}</p>
      </div>

      <div class="hg-section">
        <h3>Steder</h3>
        ${
          placeMatches.length
            ? `<div class="hg-places">
                ${placeMatches.map(p => `
                  <div class="hg-place" data-place="${p.id}">
                    📍 ${p.name}
                  </div>`).join("")}
              </div>`
            : `<p class="hg-muted">Ingen stedstilknytning.</p>`
        }
      </div>
  `;

  makePopup(html, "person-popup");

  // Klikk på sted → åpne steds-popup
  currentPopup.querySelectorAll("[data-place]").forEach(btn => {
    btn.onclick = () => {
      const p = PLACES.find(x => x.id === btn.dataset.place);
      closePopup();
      showPlacePopup(p);
    };
  });
};


// ============================================================
// STEDS-POPUP
// ============================================================
window.showPlacePopup = function(place) {
  if (!place) return;

  const img = place.image || `bilder/kort/places/${place.id}.PNG`;

  const peopleHere = PEOPLE.filter(p => p.placeId === place.id);

  const html = `
      <img src="${img}" class="hg-popup-img">

      <h3 class="hg-popup-title">${place.name}</h3>
      <p class="hg-popup-cat">${place.category || ""}</p>

      <p class="hg-popup-desc">${place.desc || ""}</p>

      <button class="hg-quiz-btn" data-quiz="${place.id}">
        Ta quiz
      </button>

      ${
        peopleHere.length
          ? `<div class="hg-popup-subtitle">Personer</div>
             <div class="hg-popup-people">
               ${peopleHere.map(p => `
                 <div class="hg-popup-face" data-person="${p.id}">
                   <img src="bilder/people/${p.id}_face.PNG">
                 </div>`).join("")}
             </div>`
          : ""
      }
  `;

  makePopup(html, "place-popup");

  // Klikk → person-popup
  currentPopup.querySelectorAll("[data-person]").forEach(el => {
    el.onclick = () => {
      const pr = PEOPLE.find(p => p.id === el.dataset.person);
      showPersonPopup(pr);
    };
  });
};


// ============================================================
// PLACE CARD – POPUP (MATCHER APPENS "openPlaceCard")
// ============================================================
window.openPlaceCard = function(place) {
  if (!place) return;

  const img = place.cardImage || place.image || `bilder/kort/places/${place.id}.PNG`;

  const peopleHere = (place.people || [])
    .map(p => typeof p === "string" ? PEOPLE.find(x => x.id === p) : p)
    .filter(Boolean);

  const htmlPeople =
    peopleHere.length
      ? `
        <div class="pcp-people">
          ${peopleHere.map(p => `
            <div class="pcp-person" data-person="${p.id}">
              <img src="bilder/people/${p.id}_face.PNG">
              <span>${p.name}</span>
            </div>
          `).join("")}
        </div>`
      : `<p class="hg-muted">Ingen personer knyttet til dette stedet.</p>`;

  const html = `
      <img src="${img}" class="pcp-img">

      <h2 class="pcp-title">${place.name}</h2>
      <p class="pcp-meta">${place.category} • radius ${place.r || 150} m</p>

      <p class="pcp-desc">${place.desc}</p>

      ${htmlPeople}

      <div class="pcp-actions">
        <button class="hg-quiz-btn" data-quiz="${place.id}">Ta quiz</button>
        <button class="ghost" data-route="${place.id}">Rute</button>
        <button class="ghost" data-info="${encodeURIComponent(place.name)}">Mer info</button>
      </div>
  `;

  makePopup(html, "placecard-popup");

  // Klikk → person-popup
  currentPopup.querySelectorAll(".pcp-person").forEach(el => {
    el.onclick = () => {
      const p = PEOPLE.find(x => x.id === el.dataset.person);
      showPersonPopup(p);
    };
  });

  // Rute
  const routeBtn = currentPopup.querySelector(`[data-route="${place.id}"]`);
  if (routeBtn) routeBtn.onclick = () => showRouteTo(place);
};


// ============================================================
// ÅPNE KORT FRA PERSON
// ============================================================
window.openPlaceCardByPerson = function(person) {
  if (!person) return;

  const place =
    PLACES.find(p => p.id === person.placeId) ||
    {
      id: person.id,
      name: person.name,
      category: person.tags ? tagToCat(person.tags) : "",
      r: person.r || 150,
      desc: person.desc || "",
      lat: person.lat,
      lon: person.lon,
      image: person.image
    };

  openPlaceCard(place);
};

// ============================================================
// REWARD-POPUPS
// ============================================================
window.showRewardPlace = function(place) {
  if (!place) return;

  const img = place.image || `bilder/kort/places/${place.id}.PNG`;

  makePopup(`
      <div class="reward-header">
        <img src="${img}" class="reward-img">
      </div>

      <h2 class="reward-title">Nytt sted!</h2>
      <p class="reward-sub">${place.name}</p>

      <button class="reward-ok" data-close-popup>Fortsett</button>
  `, "reward-popup");
};


window.showRewardPerson = function(person) {
  if (!person) return;

  const face = `bilder/people/${person.id}_face.PNG`;

  makePopup(`
      <div class="reward-header">
        <img src="${face}" class="reward-img">
      </div>

      <h2 class="reward-title">Ny person!</h2>
      <p class="reward-sub">${person.name}</p>

      <button class="reward-ok" data-close-popup>Fortsett</button>
  `, "reward-popup");
};


// ============================================================
// BADGE-POPUP
// ============================================================
window.showBadgePopup = function(badge) {
  if (!badge) return;

  makePopup(`
      <div class="badge-header">
        <img src="${badge.icon}" class="badge-icon">
      </div>

      <h2 class="badge-title">${badge.title}</h2>
      <p class="badge-level">${badge.level}</p>

      <p class="badge-desc">${badge.desc}</p>

      ${
        badge.progress
          ? `<div class="badge-progress">${badge.progress}</div>`
          : ""
      }

      <button class="badge-ok" data-close-popup>OK</button>
  `, "badge-popup");
};


// ============================================================
// ESC = LUKK
// ============================================================
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closePopup();
});
