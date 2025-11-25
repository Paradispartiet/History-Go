// ============================================================
// HISTORY GO – POPUP-UTILS (ENDLIG VERISON)
// Bruker KUN filbaner fra JSON: image, imageCard, cardImage
// Ingen fallback, ingen automatikk, ingen _face-filnavn
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
// 3. PERSON-POPUP
// ============================================================
window.showPersonPopup = function(person) {
  if (!person) return;

  const face    = person.image;      // portrett
  const cardImg = person.imageCard;  // kortbilde
  const works   = person.works || [];
  const wiki    = person.wiki || "";

  // Finn steder knyttet til personen
  const placeMatches = PLACES.filter(
    p =>
      (Array.isArray(p.people) && p.people.includes(person.id)) ||
      p.placeId === person.id
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
      showPlacePopup(place);
    };
  });
};

// ============================================================
// 4. STEDS-POPUP
// ============================================================
window.showPlacePopup = function(place) {
  if (!place) return;

  // RIKTIG: kun stedsbilde
  const img = place.image || "";

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
                   <img src="${pr.imageCard}">
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
// 5. PLACE CARD (det store kortpanelet)
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

  if (imgEl)   imgEl.src = place.image || "";
  if (titleEl) titleEl.textContent = place.name;
  if (metaEl)  metaEl.textContent  = `${place.category || ""} • radius ${place.r || 150} m`;
  if (descEl)  descEl.textContent  = place.desc || "";

  // Personer knyttet til stedet
  if (peopleEl) {
    const persons = PEOPLE.filter(
      p =>
        (Array.isArray(p.places) && p.places.includes(place.id)) ||
        p.placeId === place.id
    );

    peopleEl.innerHTML = persons
  .map(p => `
    <button class="pc-person" data-person="${p.id}">
      <img src="${p.image}">
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
// 6. ÅPNE placeCard FRA PERSON (kart-modus)
// ============================================================
window.openPlaceCardByPerson = function(person) {
  if (!person) return;

  let place =
    PLACES.find(p => p.id === person.placeId) ||
    PLACES.find(
      p => Array.isArray(person.places) && person.places.includes(p.id)
    );

  // Hvis person ikke har et registrert sted → generer et "midlertidig"
  if (!place) {
    place = {
      id: person.id,
      name: person.name,
      category: tagToCat(person.tags || []),
      desc: person.desc || "",
      r: person.r || 150,
      lat: person.lat,
      lon: person.lon,
      cardImage: person.imageCard
    };
  }

  openPlaceCard(place);
};

// ============================================================
// 7. REWARDS
// ============================================================
function launchConfetti() {
  const duration = 900;
  const end = Date.now() + duration;

  (function frame() {
    const timeLeft = end - Date.now();
    if (timeLeft <= 0) return;

    const count = 12;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "confetti-particle";

      const colors = ["#f6c800", "#ff66cc", "#ffb703", "#4caf50", "#c77dff"];
      particle.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];

      particle.style.left = Math.random() * 100 + "vw";
      particle.style.animationDuration = 0.7 + Math.random() * 0.6 + "s";

      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }

    requestAnimationFrame(frame);
  })();
}

window.showRewardPlace = function(place) {
  if (!place) return;

  const card = place.cardImage || place.image || `bilder/kort/places/${place.id}.PNG`;

  makePopup(`
      <div class="reward-center">
        <h2 class="reward-title">🎉 Gratulerer!</h2>
        <p class="reward-sub">Du har samlet kortet</p>

        <img id="rewardCardImg" src="${card}" class="reward-card-img">

        <button class="reward-ok" data-close-popup>Fortsett</button>
      </div>
  `, "reward-popup");

  launchConfetti();

  requestAnimationFrame(() => {
    const img = document.getElementById("rewardCardImg");
    if (img) img.classList.add("visible");
  });
};

window.showRewardPerson = function(person) {
  if (!person) return;

  const card = person.cardImage || person.image || `bilder/kort/people/${person.id}.PNG`;

  makePopup(`
      <div class="reward-center">
        <h2 class="reward-title">🎉 Gratulerer!</h2>
        <p class="reward-sub">Du har samlet kortet</p>

        <img id="rewardCardImg" src="${card}" class="reward-card-img">

        <button class="reward-ok" data-close-popup>Fortsett</button>
      </div>
  `, "reward-popup");

  launchConfetti();

  requestAnimationFrame(() => {
    const img = document.getElementById("rewardCardImg");
    if (img) img.classList.add("visible");
  });
};

// ============================================================
// 8. ESC = LUKK
// ============================================================
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closePopup();
});
