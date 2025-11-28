/* ============================================================
   POPUP SYSTEM — History Go (Ren og komplett versjon A+)
   ============================================================ */

let currentPopup = null;

/* ------------------------------------------------------------
   Close popup
------------------------------------------------------------ */
function closePopup() {
  if (currentPopup) {
    currentPopup.classList.remove("open");
    setTimeout(() => currentPopup.remove(), 200);
  }
}

/* ------------------------------------------------------------
   Utility functions
------------------------------------------------------------ */

function hasCompletedQuiz(id) {
  const hist = JSON.parse(localStorage.getItem("quiz_history") || "[]");
  return hist.some(h => h.id === id);
}

function getKnowledgeBlocks(category) {
  if (!getKnowledgeUniverse) return null;
  const uni = getKnowledgeUniverse();
  return uni[category] || null;
}

function getTriviaList(category) {
  if (!getTriviaUniverse) return [];
  const uni = getTriviaUniverse();
  const set = uni[category] || {};
  const out = [];
  for (const dim of Object.keys(set)) {
    set[dim].forEach(t => out.push(t));
  }
  return out;
}

/* ------------------------------------------------------------
   Render Wrapper
------------------------------------------------------------ */
function makePopup(html, cls = "hg-popup") {
  closePopup();

  const div = document.createElement("div");
  div.className = cls;
  div.innerHTML = html;

  div.addEventListener("click", e => {
    if (e.target.dataset.closePopup !== undefined) {
      closePopup();
    }
  });

  document.body.appendChild(div);
  currentPopup = div;

  requestAnimationFrame(() => div.classList.add("open"));
}

/* ============================================================
   PERSON POPUP
============================================================ */
function showPersonPopup(person) {
  const faceImg = `bilder/people/${person.image}`;
  const cardImg = `bilder/cards/${person.imageCard}`;
  const wiki = person.longDesc || "Ingen ytterligere informasjon tilgjengelig.";
  const completed = hasCompletedQuiz(person.id);

  const html = `
    <div class="hg-popup-header">
      <span class="hg-close" data-close-popup>×</span>
    </div>

    <img src="${faceImg}" class="hg-popup-face">
    <h2 class="hg-popup-name">${person.name}</h2>

    <img src="${cardImg}" class="hg-popup-cardimg">

    <div class="hg-section">
      <h3>Om personen</h3>
      <p class="hg-wiki">${wiki}</p>
    </div>

    ${
      person.places && person.places.length
        ? `<div class="hg-section">
             <h3>Steder</h3>
             <ul class="hg-place-list">
               ${person.places.map(p => `<li>${p}</li>`).join("")}
             </ul>
           </div>`
        : ""
    }

    <div class="hg-section">
      <button class="hg-quiz-btn" data-quiz="${person.id}">Ta quiz</button>
    </div>

    ${
      completed
        ? `
      <div class="hg-section">
        <h3>Kunnskap</h3>
        <div id="popupKnowledge"></div>
      </div>

      <div class="hg-section">
        <h3>Funfacts</h3>
        <div id="popupTrivia"></div>
      </div>
    `
        : ""
    }
  `;

  makePopup(html);

  // Knowledge + trivia rendering
  if (completed) {
    const k = getKnowledgeBlocks(person.category);
    const t = getTriviaList(person.category);

    const kBox = currentPopup.querySelector("#popupKnowledge");
    if (k && kBox) {
      kBox.innerHTML = Object.entries(k)
        .map(([dim, items]) => `
          <strong>${dim}</strong>
          <ul>${items.map(i => `<li>${i.topic}: ${i.text}</li>`).join("")}</ul>
        `)
        .join("");
    }

    const tBox = currentPopup.querySelector("#popupTrivia");
    if (t && t.length && tBox) {
      tBox.innerHTML = `<ul>${t.map(x => `<li>${x}</li>`).join("")}</ul>`;
    }
  }
}

/* ============================================================
   PLACE POPUP
============================================================ */
function showPlacePopup(place) {
  const cardImg = `bilder/cards/${place.cardImage || place.imageCard}`;
  const completed = hasCompletedQuiz(place.id);

  const html = `
    <div class="hg-popup-header">
      <span class="hg-close" data-close-popup>×</span>
    </div>

    <img src="${cardImg}" class="hg-popup-img">

    <h2 class="hg-popup-title">${place.name}</h2>
    <p class="hg-popup-cat">${place.category || ""}</p>
    <p class="hg-popup-desc">${place.desc || ""}</p>

    <div class="hg-section">
      <button class="hg-quiz-btn" data-quiz="${place.id}">Ta quiz</button>
    </div>

    ${
      place.people && place.people.length
        ? `
      <div class="hg-section">
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
        <div id="popupKnowledge"></div>
      </div>

      <div class="hg-section">
        <h3>Funfacts</h3>
        <div id="popupTrivia"></div>
      </div>
    `
        : ""
    }
  `;

  makePopup(html);

  // Knowledge + trivia rendering
  if (completed) {
    const k = getKnowledgeBlocks(place.category);
    const t = getTriviaList(place.category);

    const kBox = currentPopup.querySelector("#popupKnowledge");
    if (k && kBox) {
      kBox.innerHTML = Object.entries(k)
        .map(([dim, items]) => `
          <strong>${dim}</strong>
          <ul>${items.map(i => `<li>${i.topic}: ${i.text}</li>`).join("")}</ul>
        `)
        .join("");
    }

    const tBox = currentPopup.querySelector("#popupTrivia");
    if (t && t.length && tBox) {
      tBox.innerHTML = `<ul>${t.map(x => `<li>${x}</li>`).join("")}</ul>`;
    }
  }
}

/* ============================================================
   REWARD POPUPS
============================================================ */

function showRewardPerson(person, entry) {
  const cardImg = `bilder/cards/${person.imageCard}`;
  const k = getKnowledgeBlocks(entry.categoryId);
  const t = getTriviaList(entry.categoryId);

  const html = `
    <div class="reward-popup">
      <div class="reward-header">Gratulerer!</div>
      <div class="reward-sub">Du har fullført quizzen om ${person.name}</div>

      <img src="${cardImg}" class="reward-card">

      ${
        k
          ? `
      <div class="reward-section">
        <h3>Ny kunnskap</h3>
        ${Object.entries(k)
          .map(([dim, items]) => `
            <strong>${dim}</strong>
            <ul>
              ${items.map(i => `<li>${i.topic}: ${i.text}</li>`).join("")}
            </ul>
          `)
          .join("")}
      </div>`
          : ""
      }

      ${
        t && t.length
          ? `
      <div class="reward-section">
        <h3>Funfacts</h3>
        <ul>${t.map(x => `<li>${x}</li>`).join("")}</ul>
      </div>`
          : ""
      }

      <button data-close-popup class="reward-ok">Fortsett</button>
    </div>
  `;

  makePopup(html, "reward-popup-container");
}

function showRewardPlace(place, entry) {
  const cardImg = `bilder/cards/${place.cardImage || place.imageCard}`;
  const k = getKnowledgeBlocks(entry.categoryId);
  const t = getTriviaList(entry.categoryId);

  const html = `
    <div class="reward-popup">
      <div class="reward-header">Gratulerer!</div>
      <div class="reward-sub">Du har fullført quizzen om ${place.name}</div>

      <img src="${cardImg}" class="reward-card">

      ${
        k
          ? `
      <div class="reward-section">
        <h3>Ny kunnskap</h3>
        ${Object.entries(k)
          .map(([dim, items]) => `
            <strong>${dim}</strong>
            <ul>
              ${items.map(i => `<li>${i.topic}: ${i.text}</li>`).join("")}
            </ul>
          `)
          .join("")}
      </div>`
          : ""
      }

      ${
        t && t.length
          ? `
      <div class="reward-section">
        <h3>Funfacts</h3>
        <ul>${t.map(x => `<li>${x}</li>`).join("")}</ul>
      </div>`
          : ""
      }

      <button data-close-popup class="reward-ok">Fortsett</button>
    </div>
  `;

  makePopup(html, "reward-popup-container");
}
