/* ======================================================================
   POPUP SYSTEM – History Go
   FULL INTEGRERT VERSJON
   – Alt gammelt (placeCard + personCard-sheet)
   – Alt nytt (knowledge + trivia + reward-popups)
   – 100% kompatibel med app.js, JSON og iPad Safari
======================================================================== */

/* ============================================================== */
/*  GLOBALT POPUP-HÅNDTERING                                       */
/* ============================================================== */

let currentPopup = null;

function closePopup() {
  if (currentPopup) {
    currentPopup.classList.remove("open");
    setTimeout(() => currentPopup.remove(), 180);
  }
}

/* ============================================================== */
/*  HELPEFUNKSJONER                                                */
/* ============================================================== */

function hasCompletedQuiz(id) {
  const hist = JSON.parse(localStorage.getItem("quiz_history") || "[]");
  return hist.some(h => h.id === id);
}

function getKnowledgeBlocks(category) {
  if (!window.getKnowledgeUniverse) return null;
  const uni = getKnowledgeUniverse();
  return uni[category] || null;
}

function getTriviaList(category) {
  if (!window.getTriviaUniverse) return [];
  const uni = getTriviaUniverse();
  const block = uni[category] || {};
  const out = [];
  for (const dim of Object.keys(block)) {
    block[dim].forEach(t => out.push(t));
  }
  return out;
}

function makePopup(html, cls = "hg-popup") {
  closePopup();

  const div = document.createElement("div");
  div.className = cls;
  div.innerHTML = html;

  div.addEventListener("click", e => {
    if (e.target.dataset.closePopup !== undefined) closePopup();
  });

  document.body.appendChild(div);
  currentPopup = div;

  requestAnimationFrame(() => div.classList.add("open"));
}

/* ======================================================================
   PERSON POPUP (bottom-sheet versjonen)
======================================================================== */

window.showPersonPopup = function(person) {
  const face = `bilder/people/${person.image}`;
  const card = `bilder/cards/${person.imageCard}`;
  const completed = hasCompletedQuiz(person.id);

  const know = completed ? getKnowledgeBlocks(person.category) : null;
  const trivia = completed ? getTriviaList(person.category) : [];

  // Building the person sheet UI
  const html = `
    <div class="hg-popup-header">
      <span class="hg-close" data-close-popup>×</span>
    </div>

    <img src="${face}" class="hg-popup-face">
    <h2 class="hg-popup-name">${person.name}</h2>
    <img src="${card}" class="hg-popup-cardimg">

    <div class="hg-section">
      <h3>Om personen</h3>
      <p>${person.longDesc || ""}</p>
    </div>

    ${
      person.places && person.places.length
        ? `<div class="hg-section">
             <h3>Steder</h3>
             <ul>${person.places.map(p => `<li>${p}</li>`).join("")}</ul>
           </div>`
        : ""
    }

    <div class="hg-section">
      <button class="hg-quiz-btn" data-quiz="${person.id}">
        Ta quiz
      </button>
    </div>

    ${
      completed
        ? `
        <div class="hg-section">
          <h3>Kunnskap</h3>
          ${Object.entries(know)
            .map(([dim, items]) =>
              `<strong>${dim}</strong><ul>${items
                .map(i => `<li>${i.topic}: ${i.text}</li>`)
                .join("")}</ul>`
            )
            .join("")}
        </div>

        <div class="hg-section">
          <h3>Funfacts</h3>
          <ul>${trivia.map(t => `<li>${t}</li>`).join("")}</ul>
        </div>
      `
        : ""
    }
  `;

  makePopup(html);
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

/* ======================================================================
   REWARD POPUPS (person + sted)
======================================================================== */

window.showRewardPerson = function(person, entry) {
  const card = `bilder/cards/${person.imageCard}`;
  const know = getKnowledgeBlocks(entry.categoryId);
  const trivia = getTriviaList(entry.categoryId);

  const html = `
    <div class="reward-popup">
      <h2>Gratulerer!</h2>
      <p>Du har fullført quizzen om ${person.name}</p>

      <img src="${card}" class="reward-card">

      ${
        know
          ? `
      <div class="reward-section">
        <h3>Ny kunnskap</h3>
        ${Object.entries(know)
          .map(([dim, items]) =>
            `<strong>${dim}</strong><ul>${items
              .map(i => `<li>${i.topic}: ${i.text}</li>`)
              .join("")}</ul>`
          )
          .join("")}
      </div>`
          : ""
      }

      ${
        trivia.length
          ? `<div class="reward-section">
               <h3>Funfacts</h3>
               <ul>${trivia.map(t => `<li>${t}</li>`).join("")}</ul>
             </div>`
          : ""
      }

      <button data-close-popup>Fortsett</button>
    </div>
  `;

  makePopup(html, "reward-container");
};

window.showRewardPlace = function(place, entry) {
  const card = `bilder/cards/${place.cardImage || place.imageCard}`;
  const know = getKnowledgeBlocks(entry.categoryId);
  const trivia = getTriviaList(entry.categoryId);

  const html = `
    <div class="reward-popup">
      <h2>Gratulerer!</h2>
      <p>Du har fullført quizzen om ${place.name}</p>

      <img src="${card}" class="reward-card">

      ${
        know
          ? `
      <div class="reward-section">
        <h3>Ny kunnskap</h3>
        ${Object.entries(know)
          .map(([dim, items]) =>
            `<strong>${dim}</strong><ul>${items
              .map(i => `<li>${i.topic}: ${i.text}</li>`)
              .join("")}</ul>`
          )
          .join("")}
      </div>`
          : ""
      }

      ${
        trivia.length
          ? `<div class="reward-section">
               <h3>Funfacts</h3>
               <ul>${trivia.map(t => `<li>${t}</li>`).join("")}</ul>
             </div>`
          : ""
      }

      <button data-close-popup>Fortsett</button>
    </div>
  `;

  makePopup(html, "reward-container");
};
