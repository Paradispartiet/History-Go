// ============================================================
// HISTORY GO – POPUP-UTILS (STEIG 1)
// Felles motor for person-popup, sted-popup, placeCard-popup
// ============================================================

// Holder referanse til aktiv popup
let currentPopup = null;

// -----------------------------------------
// 1. Lukke popup
// -----------------------------------------
function closePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
}

// -----------------------------------------
// 2. Opprett popup med HTML + klasse
// -----------------------------------------
function makePopup(html, extraClass = "") {
  // Fjern gammel
  closePopup();

  const el = document.createElement("div");
  el.className = `hg-popup ${extraClass}`;

  el.innerHTML = `
    <div class="hg-popup-inner">
      <button class="hg-popup-close" data-close-popup>✕</button>
      ${html}
    </div>
  `;

  // Klikk på close-knapp
  el.addEventListener("click", e => {
    if (e.target.closest("[data-close-popup]")) {
      closePopup();
    }
  });

  // Klikk på bakgrunn
  el.addEventListener("click", e => {
    if (e.target === el) closePopup();
  });

  document.body.appendChild(el);
  currentPopup = el;

  // Litt delay for animasjon hvis du vil i CSS
  requestAnimationFrame(() => el.classList.add("visible"));
}


// ============================================================
//  PERSON-POPUP
// ============================================================
window.showPersonPopup = function(person) {
  if (!person) return;

  const face    = `bilder/people/${person.id}_face.PNG`;
  const cardImg = person.image || `bilder/kort/people/${person.id}.PNG`;
  const wiki    = person.wiki || "";
  const works   = person.works || [];

  const placeMatches = PLACES.filter(p => p.people?.includes(person.id));

  const html = `
      <img src="${face}" class="hg-popup-face">

      <h2 class="hg-popup-name">${person.name}</h2>

      <img src="${cardImg}" class="hg-popup-cardimg">

      <div class="hg-section">
        <h3>Verk</h3>
        ${
          works.length
            ? `<ul class="hg-works">
                 ${works.map(w => `<li>${w}</li>`).join("")}
               </ul>`
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
                 ${placeMatches
                   .map(
                     p => `
                     <div class="hg-place" data-place="${p.id}">
                       📍 ${p.name}
                     </div>`
                   ).join("")}
               </div>`
            : `<p class="hg-muted">Ingen stedstilknytning.</p>`
        }
      </div>
  `;

  makePopup(html, "person-popup");

  // Klikk på sted → åpne steds-popup
  currentPopup.querySelectorAll("[data-place]").forEach(btn => {
    btn.onclick = () => {
      const place = PLACES.find(p => p.id === btn.dataset.place);
      closePopup();
      showPlacePopup(place);
    };
  });
};


// ============================================================
//  STEDS-POPUP
// ============================================================
window.showPlacePopup = function(place) {
  if (!place) return;

  const fullImg  = place.image || `bilder/kort/places/${place.id}.PNG`;
  const thumbImg = `bilder/kort/places/${place.id}.PNG`;

  const peopleHere = PEOPLE.filter(p => p.placeId === place.id);

  const html = `
      <img src="${fullImg}" class="hg-popup-img" alt="${place.name}">

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
                 </div>
               `).join("")}
             </div>`
          : ""
      }

      <img src="${thumbImg}" class="hg-popup-cardthumb">

      <div class="hg-popup-locations">
        <div class="loc-chip">
          📍 ${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}
        </div>
      </div>
  `;

  makePopup(html, "place-popup");

  // Klikk → person
  currentPopup.querySelectorAll(".hg-popup-face").forEach(el => {
    el.onclick = () => {
      const pr = PEOPLE.find(p => p.id === el.dataset.person);
      showPersonPopup(pr);
    };
  });
};


// ============================================================
// PLACE CARD POPUP – DEN ENESTE KORT-VERSJONEN
// ============================================================
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

  const html = `
      <img src="${imgPath}" class="placecard-img" alt="${place.name}">
      <h2 class="placecard-title">${place.name}</h2>
      <p class="placecard-meta">${cat} • radius ${radius} m</p>

      <p class="placecard-desc">${desc}</p>

      <div class="placecard-people">
        ${htmlPeople}
      </div>

      <div class="placecard-actions">
        <button class="primary hg-quiz-btn" data-quiz="${place.id}">Ta quiz</button>
        <button class="ghost" data-route="${place.id}">Rute</button>
        <button class="ghost" data-info="${encodeURIComponent(place.name)}">Mer info</button>
      </div>
  `;

  makePopup(html, "placecard-popup");

  // Person → person-popup
  currentPopup.querySelectorAll("[data-person]").forEach(btn => {
    btn.onclick = () => {
      const p = PEOPLE.find(x => x.id === btn.dataset.person);
      showPersonPopup(p);
    };
  });

  // Rute
  const routeBtn = currentPopup.querySelector(`[data-route="${place.id}"]`);
  if (routeBtn && typeof showRouteTo === "function") {
    routeBtn.onclick = () => showRouteTo(place);
  }
};


// ============================================================
// ÅPNE KORT FRA PERSON
// ============================================================
window.openPlaceCardByPerson = function(person) {
  if (!person) return;

  const place =
    PLACES.find(x => x.id === person.placeId) || {
      id: "personloc",
      name: person.name,
      category: (person.tags ? tagToCat(person.tags[0]) : ""),
      r: person.r || 150,
      desc: person.desc || "",
      lat: person.lat,
      lon: person.lon
    };

  showPlaceCard(place);

  // Koble quiz til personen etter render
  setTimeout(() => {
    const btn = currentPopup.querySelector(`[data-quiz="${place.id}"]`);
    if (btn) btn.onclick = () => startQuiz(person.id);
  }, 50);
};


// ============================================================
// GLOBAL QUIZ-KNAPP
// ============================================================
document.addEventListener("click", e => {
  const btn = e.target.closest(".hg-quiz-btn");
  if (!btn) return;

  const targetId = btn.dataset.quiz;
  if (targetId) startQuiz(targetId);
});

// ============================================================
// POPUP-UTILS – STEG 2: SHEETS, REWARDS, BADGES
// ============================================================



// ------------------------------------------------------------
//  A)  SHEET POPUP  (brukes for lister / galleri / samling)
// ------------------------------------------------------------
window.showSheetPopup = function(title, htmlContent) {

  const html = `
      <div class="sheet-header">
        <h2>${title}</h2>
        <button class="sheet-close" data-close-popup>✕</button>
      </div>

      <div class="sheet-body">
        ${htmlContent}
      </div>
  `;

  makePopup(html, "sheet-popup");
};




// ------------------------------------------------------------
//  B)  REWARD – GENERERT PLACE-REWARD  (besøkt nytt sted)
// ------------------------------------------------------------
window.showRewardPlace = function(place) {
  if (!place) return;

  const img = place.image || `bilder/kort/places/${place.id}.PNG`;

  const html = `
      <div class="reward-header">
        <img src="${img}" class="reward-img">
      </div>

      <h2 class="reward-title">Nytt sted!</h2>
      <p class="reward-sub">${place.name}</p>

      <button class="reward-ok" data-close-popup>Fortsett</button>
  `;

  makePopup(html, "reward-popup");
};



// ------------------------------------------------------------
//  C)  REWARD – GENERERT PERSON-REWARD  (ny person låst opp)
// ------------------------------------------------------------
window.showRewardPerson = function(person) {
  if (!person) return;

  const face = `bilder/people/${person.id}_face.PNG`;

  const html = `
      <div class="reward-header">
        <img src="${face}" class="reward-img">
      </div>

      <h2 class="reward-title">Ny person!</h2>
      <p class="reward-sub">${person.name}</p>

      <button class="reward-ok" data-close-popup>Fortsett</button>
  `;

  makePopup(html, "reward-popup");
};




// ------------------------------------------------------------
//  D) BADGE-POPUP  (nivå, progresjon, beskrivelse)
// ------------------------------------------------------------
window.showBadgePopup = function(badge) {
  if (!badge) return;

  // badge = objekt hentet fra BADGES[catId] eller lignende
  const title = badge.title || "";
  const desc  = badge.desc || "";
  const icon  = badge.icon || "";
  const level = badge.level || "";
  const progress = badge.progress || "";

  const html = `
      <div class="badge-header">
        <img src="${icon}" class="badge-icon">
      </div>

      <h2 class="badge-title">${title}</h2>
      <p class="badge-level">${level}</p>

      <p class="badge-desc">${desc}</p>

      ${
        progress
          ? `<div class="badge-progress">${progress}</div>`
          : ""
      }

      <button class="badge-ok" data-close-popup>OK</button>
  `;

  makePopup(html, "badge-popup");
};




// ------------------------------------------------------------
//  E) ESC-LUKKING
// ------------------------------------------------------------
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closePopup();
  }
});
