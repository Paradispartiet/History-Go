/* ============================================================
   POPUP SYSTEM — History Go
   Person- og steds-popups + reward-popups
   Nå oppgradert med:
   ✔ Knowledge (etter fullført quiz)
   ✔ Trivia (etter fullført quiz)
   ✔ Integrert i reward-popupen
   Ingen spoilers før quiz.
   ============================================================ */

let currentPopup = null;

// Close popup
function closePopup() {
  if (currentPopup) {
    currentPopup.classList.remove("open");
    setTimeout(() => currentPopup.remove(), 200);
  }
}

// ============================================================
// QUIZ STATUS + KNOWLEDGE/TRIVIA HELPERS
// ============================================================

// Har spilleren fullført quizen for dette targetId?
function hasCompletedQuiz(targetId) {
  const hist = JSON.parse(localStorage.getItem("quiz_history") || "[]");
  return hist.some(h => h.id === targetId);
}

// Hent kunnskapsblokk for kategori
function getKnowledgeBlocks(category) {
  const uni = getKnowledgeUniverse ? getKnowledgeUniverse() : {};
  return uni[category] || null;
}

// Hent trivia-liste for kategori
function getTriviaList(category) {
  const uni = getTriviaUniverse ? getTriviaUniverse() : {};
  const block = uni[category] || {};
  const out = [];
  for (const id of Object.keys(block)) {
    block[id].forEach(t => out.push(t));
  }
  return out;
}

/* ============================================================
   RENDER POPUP BASE
   ============================================================ */
function makePopup(html, popupClass = "hg-popup") {
  closePopup();

  const div = document.createElement("div");
  div.className = popupClass;
  div.innerHTML = html;

  div.addEventListener("click", e => {
    if (e.target.dataset.closePopup !== undefined) closePopup();
  });

  document.body.appendChild(div);
  currentPopup = div;

  requestAnimationFrame(() => div.classList.add("open"));
}

/* ============================================================
   PERSON POPUP
   ============================================================ */
function showPersonPopup(person) {
  const face = `bilder/people/${person.image}`;
const img = `bilder/cards/${place.cardImage || place.imageCard}`;
  const wiki = person.longDesc || "Ingen ytterligere informasjon tilgjengelig.";
  const completed = hasCompletedQuiz(person.id);

  const html = `
    <div class="hg-popup-header">
      <span data-close-popup class="hg-close">×</span>
    </div>

    <img src="${face}" class="hg-popup-face">
    <h2 class="hg-popup-name">${person.name}</h2>
    <img src="${cardImg}" class="hg-popup-cardimg">

    <div class="hg-section">
      <h3>Om personen</h3>
      <p class="hg-wiki">${wiki}</p>
    </div>

    ${completed ? `
      <div class="hg-section">
        <h3>Kunnskap</h3>
        <div id="popupKnowledge"></div>
      </div>

      <div class="hg-section">
        <h3>Funfacts</h3>
        <div id="popupTrivia"></div>
      </div>
    ` : ""}

    <div class="hg-section">
      <h3>Steder</h3>
      <ul class="hg-place-list">
        ${(person.places || []).map(p => `<li>${p}</li>`).join("")}
      </ul>
    </div>

    <div class="hg-section">
      <button class="hg-quiz-btn" data-quiz="${person.id}">
        Ta quiz
      </button>
    </div>
  `;

  makePopup(html, "hg-popup");

  // Fyll kunnskap / trivia hvis fullført quiz
  if (completed) {
    const k = getKnowledgeBlocks(person.category);
    const t = getTriviaList(person.category);

    if (k) {
      const box = currentPopup.querySelector("#popupKnowledge");
      if (box) {
        box.innerHTML = Object.entries(k).map(([dim, items]) => `
          <strong>${dim}</strong>
          <ul>${items.map(i => `<li>${i.topic}: ${i.text}</li>`).join("")}</ul>
        `).join("");
      }
    }

    if (t.length) {
      const box = currentPopup.querySelector("#popupTrivia");
      if (box) {
        box.innerHTML = `<ul>${t.map(x => `<li>${x}</li>`).join("")}</ul>`;
      }
    }
  }
}

/* ============================================================
   PLACE POPUP
   ============================================================ */
function showPlacePopup(place) {
  const img = `bilder/places/${place.image}`;
  const completed = hasCompletedQuiz(place.id);

  const html = `
    <div class="hg-popup-header">
      <span data-close-popup class="hg-close">×</span>
    </div>

    <img src="${img}" class="hg-popup-img">
    <h3 class="hg-popup-title">${place.name}</h3>
    <p class="hg-popup-cat">${place.category || ""}</p>
    <p class="hg-popup-desc">${place.desc || ""}</p>

    ${completed ? `
      <div class="hg-section">
        <h3>Kunnskap</h3>
        <div id="popupKnowledge"></div>
      </div>

      <div class="hg-section">
        <h3>Funfacts</h3>
        <div id="popupTrivia"></div>
      </div>
    ` : ""}

    <div class="hg-section">
      <button class="hg-quiz-btn" data-quiz="${place.id}">
        Ta quiz
      </button>
    </div>

    ${
      place.people && place.people.length
        ? `<div class="hg-section">
             <h3>Personer</h3>
             <ul>${place.people.map(p => `<li>${p}</li>`).join("")}</ul>
           </div>`
        : ""
    }
  `;

  makePopup(html, "hg-popup");

  // Fyll kunnskap / trivia hvis fullført
  if (completed) {
    const k = getKnowledgeBlocks(place.category);
    const t = getTriviaList(place.category);

    if (k) {
      const box = currentPopup.querySelector("#popupKnowledge");
      if (box) {
        box.innerHTML = Object.entries(k).map(([dim, items]) => `
          <strong>${dim}</strong>
          <ul>${items.map(i => `<li>${i.topic}: ${i.text}</li>`).join("")}</ul>
        `).join("");
      }
    }

    if (t.length) {
      const box = currentPopup.querySelector("#popupTrivia");
      if (box) {
        box.innerHTML = `<ul>${t.map(x => `<li>${x}</li>`).join("")}</ul>`;
      }
    }
  }
}

/* ============================================================
   REWARD POPUPS — Nå med KUNNSKAP & TRIVIA
   ============================================================ */
function showRewardPerson(person, entry) {
  const k = getKnowledgeBlocks(entry.categoryId);
  const t = getTriviaList(entry.categoryId);

  const html = `
    <div class="hg-popup reward-popup">
      <div class="reward-header">Gratulerer!</div>
      <div class="reward-sub">Du har fullført quizzen for ${person.name}</div>

      <img src="bilder/cards/${person.imageCard}" class="reward-card">

      ${k ? `
        <div class="reward-section">
          <h3>Ny kunnskap</h3>
          ${Object.entries(k).map(([dim, items]) =>
            `<strong>${dim}</strong>
             <ul>${items.map(i => `<li>${i.topic}: ${i.text}</li>`).join("")}</ul>`
          ).join("")}
        </div>
      ` : ""}

      ${t.length ? `
        <div class="reward-section">
          <h3>Funfacts</h3>
          <ul>${t.map(x => `<li>${x}</li>`).join("")}</ul>
        </div>
      ` : ""}

      <button class="reward-ok" data-close-popup>Fortsett</button>
    </div>
  `;

  makePopup(html, "reward-popup-container");
}

function showRewardPlace(place, entry) {
  const k = getKnowledgeBlocks(entry.categoryId);
  const t = getTriviaList(entry.categoryId);

  const html = `
    <div class="hg-popup reward-popup">
      <div class="reward-header">Gratulerer!</div>
      <div class="reward-sub">Du har fullført quizzen for ${place.name}</div>

      <img src="bilder/cards/${place.cardImage}" class="reward-card">

      ${k ? `
        <div class="reward-section">
          <h3>Ny kunnskap</h3>
          ${Object.entries(k).map(([dim, items]) =>
            `<strong>${dim}</strong>
             <ul>${items.map(i => `<li>${i.topic}: ${i.text}</li>`).join("")}</ul>`
          ).join("")}
        </div>
      ` : ""}

      ${t.length ? `
        <div class="reward-section">
          <h3>Funfacts</h3>
          <ul>${t.map(x => `<li>${x}</li>`).join("")}</ul>
        </div>
      ` : ""}

      <button class="reward-ok" data-close-popup>Fortsett</button>
    </div>
  `;

  makePopup(html, "reward-popup-container");
}
