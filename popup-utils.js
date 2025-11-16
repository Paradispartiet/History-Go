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
// PLACE CARD – BUNNPANEL (IDENTISK MED GAMMELT PANEL)
// ============================================================
window.openPlaceCard = function(place) {
  if (!place) return;

  const card      = document.getElementById("placeCard");
  const imgEl     = document.getElementById("pcImage");
  const titleEl   = document.getElementById("pcTitle");
  const metaEl    = document.getElementById("pcMeta");
  const descEl    = document.getElementById("pcDesc");
  const peopleEl  = document.getElementById("pcPeople");
  const btnInfo   = document.getElementById("pcInfo");
  const btnQuiz   = document.getElementById("pcQuiz");
  const btnUnlock = document.getElementById("pcUnlock");
  const btnRoute  = document.getElementById("pcRoute");

  if (!card || !titleEl || !metaEl || !descEl) return;

  // Grunninfo
  card.dataset.cat = place.category || "";

  if (imgEl) {
    imgEl.src = place.cardImage || place.image || "";
    imgEl.alt = place.name || "";
  }

  titleEl.textContent = place.name || "";
  metaEl.textContent  = `${place.category || ""} • radius ${place.r || 150} m`;
  descEl.textContent  = place.desc || "";

  // Personer tilknyttet stedet
  if (peopleEl) {
    let persons = [];

    if (typeof getPersonsByPlace === "function") {
      persons = getPersonsByPlace(place.id);
    } else if (typeof PEOPLE !== "undefined") {
      persons = PEOPLE.filter(
        p =>
          (Array.isArray(p.places) && p.places.includes(place.id)) ||
          p.placeId === place.id
      );
    }

    if (persons.length) {
      peopleEl.innerHTML = persons
        .map(
          p => `
        <button class="pc-person" data-person="${p.id}">
          <img src="bilder/people/${p.id}_face.PNG" alt="${p.name}">
          <span>${p.name}</span>
        </button>`
        )
        .join("");
    } else {
      peopleEl.innerHTML = "";
    }

    peopleEl.querySelectorAll("[data-person]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.person;
        const person = typeof PEOPLE !== "undefined"
          ? PEOPLE.find(p => p.id === id)
          : null;
        if (person && typeof showPersonPopup === "function") {
          showPersonPopup(person);
        }
      };
    });
  }

  // Mer info → stor stedspopup eller Google
  if (btnInfo) {
    btnInfo.onclick = () => {
      if (typeof showPlacePopup === "function") {
        showPlacePopup(place);
      } else {
        const q = encodeURIComponent(`${place.name} Oslo`);
        window.open(`https://www.google.com/search?q=${q}`, "_blank");
      }
    };
  }

  // Ta quiz om stedet
  if (btnQuiz) {
    btnQuiz.onclick = () => {
      if (typeof startQuiz === "function") {
        startQuiz(place.id);
      }
    };
  }

  // Lås opp stedet (bruker globale visited/merits fra app.js)
  if (btnUnlock) {
    btnUnlock.disabled = false;
    btnUnlock.textContent = "Lås opp";

    btnUnlock.onclick = () => {
      try {
        if (typeof visited === "object" && visited[place.id]) {
          if (typeof showToast === "function") {
            showToast("Allerede låst opp");
          }
          return;
        }

        // Marker som besøkt
        if (typeof visited === "object") {
          visited[place.id] = true;
          if (typeof saveVisited === "function") saveVisited();
        }

        // Tegn markører + puls
        if (typeof drawPlaceMarkers === "function") drawPlaceMarkers();
        if (typeof pulseMarker === "function") {
          pulseMarker(place.lat, place.lon);
        }

        // Poeng i kategori
        const cat = place.category;
        if (cat && typeof merits === "object") {
          merits[cat] = merits[cat] || { points: 0, level: "Nybegynner" };
          merits[cat].points += 1;
          if (typeof saveMerits === "function") saveMerits();
          if (typeof updateMeritLevel === "function") {
            updateMeritLevel(cat, merits[cat].points);
          }
        }

        if (typeof showToast === "function") {
          showToast(`Låst opp: ${place.name} ✅`);
        }
        if (typeof window.dispatchEvent === "function") {
          window.dispatchEvent(new Event("updateProfile"));
        }
      } catch (err) {
        console.error("Feil ved låsing av sted:", err);
      }
    };
  }

  // Rute
  if (btnRoute) {
    btnRoute.onclick = () => {
      if (typeof showRouteTo === "function") {
        showRouteTo(place);
      }
    };
  }

  // Vis placeCard-panelet nederst
  card.setAttribute("aria-hidden", "false");
};


// ============================================================
// ÅPNE KORT FRA PERSON (SAMME SOM FØR, BARE FLYTTET HIT)
// ============================================================
window.openPlaceCardByPerson = function(person) {
  if (!person) return;

  let place = null;

  if (person.placeId && typeof PLACES !== "undefined") {
    place = PLACES.find(p => p.id === person.placeId) || null;
  }

  if (!place && typeof PLACES !== "undefined" && Array.isArray(person.places)) {
    place = PLACES.find(p => person.places.includes(p.id)) || null;
  }

  if (!place) {
    // Lag midlertidig “sted” direkte på personen
    place = {
      id: person.id,
      name: person.name,
      category: person.tags ? tagToCat(person.tags) : "",
      r: person.r || 150,
      desc: person.desc || "",
      lat: person.lat,
      lon: person.lon,
      image: person.image
    };
  }

  window.openPlaceCard(place);
};


// ============================================================
// LUKKEKNAPP PÅ PLACE CARD
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const card    = document.getElementById("placeCard");
  const btnClose = document.getElementById("pcClose");
  if (card && btnClose) {
    btnClose.addEventListener("click", () => {
      card.setAttribute("aria-hidden", "true");
    });
  }
});



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
