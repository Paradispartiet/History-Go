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

/* ======================================================================
   PLACE CARD – DET GAMLE “placeCard-sheetet” (din originale)
======================================================================== */

window.openPlaceCard = function(place) {
  const sheet = document.getElementById("placeCard");
  if (!sheet) return;

  // Fyll inn kortdata
  document.getElementById("pcTitle").textContent = place.name;
  document.getElementById("pcMeta").textContent = place.category || "";
  document.getElementById("pcDesc").textContent = place.desc || "";
  document.getElementById("pcImage").src =
    `bilder/cards/${place.cardImage || place.imageCard}`;

  // Personer knyttet til stedet
  const peopleBox = document.getElementById("pcPeople");
  if (peopleBox) {
    if (place.people && place.people.length) {
      peopleBox.innerHTML = place.people
        .map(id => `<li>${id}</li>`)
        .join("");
    } else {
      peopleBox.innerHTML = "";
    }
  }

  // Quiz-knapp
  const quizBtn = document.getElementById("pcQuiz");
  quizBtn.setAttribute("data-quiz", place.id);

  // Unlock-knapp
  const unlockBtn = document.getElementById("pcUnlock");
  unlockBtn.onclick = () => {
    const visited = JSON.parse(localStorage.getItem("visited_places") || "[]");
    if (!visited.includes(place.id)) {
      visited.push(place.id);
      localStorage.setItem("visited_places", JSON.stringify(visited));
      window.dispatchEvent(new Event("updateProfile"));
    }
    sheet.setAttribute("aria-hidden", "true");
  };

  // Vis sheet
  sheet.setAttribute("aria-hidden", "false");
};

/* ======================================================================
   PLACE POPUP (full popup-versjon – for reward eller “info” i sheet)
======================================================================== */

window.showPlacePopup = function(place) {
  const card = `bilder/cards/${place.cardImage || place.imageCard}`;
  const completed = hasCompletedQuiz(place.id);

  const know = completed ? getKnowledgeBlocks(place.category) : null;
  const trivia = completed ? getTriviaList(place.category) : [];

  const html = `
    <div class="hg-popup-header">
      <span data-close-popup class="hg-close">×</span>
    </div>

    <img src="${card}" class="hg-popup-img">
    <h2 class="hg-popup-title">${place.name}</h2>
    <p class="hg-popup-cat">${place.category}</p>
    <p class="hg-popup-desc">${place.desc}</p>

    <button class="hg-quiz-btn" data-quiz="${place.id}">
      Ta quiz
    </button>

    ${
      place.people && place.people.length
        ? `<div class="hg-section">
             <h3>Personer</h3>
             <ul>${place.people.map(p => `<li>${p}</li>`).join("")}</ul>
           </div>`
        : ""
    }

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
