// ============================================================
// HISTORY GO – POPUP-UTILS v21
// Felles motor for ALLE popups (person, sted, placeCard, reward)
// ============================================================

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
  closePopup();

  const el = document.createElement("div");
  el.className = `hg-popup ${extraClass}`;

  el.innerHTML = `
    <div class="hg-popup-inner">
      <button class="hg-popup-close" data-close-popup>✕</button>
      ${html}
    </div>
  `;

  el.addEventListener("click", e => {
    if (e.target.closest("[data-close-popup]")) closePopup();
  });

  el.addEventListener("click", e => {
    if (e.target === el) closePopup();
  });

  document.body.appendChild(el);
  currentPopup = el;
  requestAnimationFrame(() => el.classList.add("visible"));
}

// ============================================================
// PERSON-POPUP  (profil + kart + info)
// ============================================================
window.showPersonPopup = function(person) {
  if (!person) return;

  const face    = person.image;      // portrett
  const cardImg = person.imageCard;  // kortbilde  const works   = person.works || [];
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
        <button class="hg-quiz-btn" data-quiz="${person.id}">Ta quiz</button>
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
                ${placeMatches.map(pl => `
                  <div class="hg-place" data-place="${pl.id}">📍 ${pl.name}</div>
                `).join("")}
              </div>`
            : `<p class="hg-muted">Ingen stedstilknytning.</p>`
        }
      </div>
  `;

  makePopup(html, "person-popup");

  currentPopup.querySelectorAll("[data-place]").forEach(btn => {
    btn.onclick = () => {
      const place = PLACES.find(x => x.id === btn.dataset.place);
      closePopup();
      showPlacePopup(place); // NOT placeCard – bare info-popup
    };
  });
};

// ============================================================
// STEDS-POPUP  (REN INFO-POPUP, IKKE placeCard)
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

      <button class="hg-quiz-btn" data-quiz="${place.id}">Ta quiz</button>

      ${
        peopleHere.length
          ? `<div class="hg-popup-subtitle">Personer</div>
             <div class="hg-popup-people">
               ${peopleHere.map(pr => `
                 <div class="hg-popup-face" data-person="${pr.id}">
                   <img src="bilder/people/${pr.id}_face.PNG">
                 </div>
               `).join("")}
             </div>`
          : ""
      }
  `;

  makePopup(html, "place-popup");

  currentPopup.querySelectorAll("[data-person]").forEach(el => {
    el.onclick = () => {
      const pr = PEOPLE.find(p => p.id === el.dataset.person);
      showPersonPopup(pr);
    };
  });
};

// ============================================================
// PLACE CARD – VISUAL / ACTION PANEL
// Brukes kun:
//  ✔ kart (marker-klikk)
//  ✔ “Åpne” i se-nærmeste
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

  if (!card) return;

  if (imgEl)   imgEl.src = place.cardImage || place.image || "";
  if (titleEl) titleEl.textContent = place.name;
  if (metaEl)  metaEl.textContent  = `${place.category || ""} • radius ${place.r || 150} m`;
  if (descEl)  descEl.textContent  = place.desc || "";

  // PERSONER
  if (peopleEl) {
    const persons = PEOPLE.filter(
      p =>
        (Array.isArray(p.places) && p.places.includes(place.id)) ||
        p.placeId === place.id
    );

    peopleEl.innerHTML = persons
      .map(p => `
        <button class="pc-person" data-person="${p.id}">
          <img src="bilder/people/${p.id}_face.PNG">
          <span>${p.name}</span>
        </button>
      `)
      .join("");

    peopleEl.querySelectorAll("[data-person]").forEach(btn => {
      btn.onclick = () => {
        const pr = PEOPLE.find(p => p.id === btn.dataset.person);
        showPersonPopup(pr);
      };
    });
  }

  if (btnInfo)   btnInfo.onclick   = () => showPlacePopup(place);
  if (btnQuiz)   btnQuiz.onclick   = () => startQuiz(place.id);
  if (btnRoute)  btnRoute.onclick  = () => showRouteTo(place);

  if (btnUnlock) {
    btnUnlock.onclick = () => {
      if (visited[place.id]) {
        showToast("Allerede låst opp");
        return;
      }

      visited[place.id] = true;
      saveVisited();
      drawPlaceMarkers();
      if (typeof pulseMarker === "function") {
        pulseMarker(place.lat, place.lon);
      }

      const cat = place.category;
      if (cat) {
        merits[cat] = merits[cat] || { points: 0, level: "Nybegynner" };
        merits[cat].points++;
        saveMerits();
        updateMeritLevel(cat, merits[cat].points);
      }

      showToast(`Låst opp: ${place.name} ✅`);
      window.dispatchEvent(new Event("updateProfile"));
    };
  }

  card.setAttribute("aria-hidden", "false");
};






// ============================================================
// ÅPNE placeCard FRA PERSON (kart-modus)
// ============================================================
window.openPlaceCardByPerson = function(person) {
  if (!person) return;

  let place =
    PLACES.find(p => p.id === person.placeId) ||
    PLACES.find(p => Array.isArray(person.places) && person.places.includes(p.id));

  if (!place) {
    place = {
      id: person.id,
      name: person.name,
      category: tagToCat(person.tags || []),
      desc: person.desc || "",
      r: person.r || 150,
      lat: person.lat,
      lon: person.lon,
      cardImage: person.image
    };
  }

  openPlaceCard(place);
};

// ============================================================
// REWARDS, BADGES (SAMME SOM FØR)
// ============================================================
window.showRewardPlace = function(place) {
  if (!place) return;

  const img = place.image || `bilder/kort/places/${place.id}.PNG`;

  makePopup(`
      <div class="reward-center">
        <img src="${img}" class="reward-img">
        <h2 class="reward-title">Nytt sted!</h2>
        <p class="reward-sub">${place.name}</p>
        <button class="reward-ok" data-close-popup>Fortsett</button>
      </div>
  `, "reward-popup");
};

window.showRewardPerson = function(person) {
  if (!person) return;

  const face = `bilder/people/${person.id}_face.PNG`;

  makePopup(`
      <div class="reward-center">
        <img src="${face}" class="reward-img">
        <h2 class="reward-title">Ny person!</h2>
        <p class="reward-sub">${person.name}</p>
        <button class="reward-ok" data-close-popup>Fortsett</button>
      </div>
  `, "reward-popup");
};

// ============================================================
// ESC = LUKK
// ============================================================
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closePopup();
});
