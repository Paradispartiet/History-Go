// ============================================================
// HISTORY GO – POPUP-UTILS (ENDLIG VERISON)
// Bruker KUN filbaner fra JSON: image, imageCard, cardImage
// Ingen fallback, ingen automatikk, ingen _face-filnavn
//
// + OBSERVASJONER:
// - Leser fra hg_learning_log_v1 (type:"observation")
// - Viser siste 10 i person- og steds-popup
// - Trigger Observations fra placeCard via #pcObserve (hvis finnes)
//
// NB: STRICT: ingen normalisering utover trim.
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
function makePopup(html, extraClass = "", onClose = null) {
  closePopup();

  const el = document.createElement("div");
  el.className = `hg-popup ${extraClass}`;

  el.innerHTML = `
    <div class="hg-popup-inner">
      <button class="hg-popup-close" data-close-popup>✕</button>
      ${html}
    </div>
  `;

  let _closed = false;

  function finishClose() {
    if (_closed) return;
    _closed = true;

    // fjern popup (samme som closePopup, men lokalt)
    if (el && el.parentNode) el.parentNode.removeChild(el);
    if (currentPopup === el) currentPopup = null;

    // kjør callback ETTER at popup faktisk er borte
    if (typeof onClose === "function") {
      try { onClose(); } catch (e) { if (window.DEBUG) console.warn("[makePopup] onClose failed", e); }
    }
  }

  el.addEventListener("click", e => {
    if (e.target.closest("[data-close-popup]")) finishClose();
  });

  el.addEventListener("click", e => {
    if (e.target === el) finishClose();
  });

  document.body.appendChild(el);
  currentPopup = el;
  requestAnimationFrame(() => el.classList.add("visible"));
}

// ------------------------------------------------------------
// 2b. HJELPERE FOR QUIZ / KUNNSKAP / TRIVIA
// ------------------------------------------------------------

// Sjekk om en quiz for person/sted er fullført
function hasCompletedQuiz(targetId) {
  try {
    const hist = JSON.parse(localStorage.getItem("quiz_history") || "[]");
    return hist.some(h => h.id === targetId);
  } catch {
    return false;
  }
}

function getLastQuizCategoryId(targetId) {
  try {
    const hist = JSON.parse(localStorage.getItem("quiz_history") || "[]");
    const last = [...hist].reverse().find(h => String(h.id) === String(targetId));
    return last?.categoryId || null;
  } catch {
    return null;
  }
}

// Hent kunnskapsblokker for en bestemt kategori + mål (person/sted)
// Leser direkte fra localStorage: knowledge_universe
function getInlineKnowledgeFor(categoryId, targetId) {
  if (!categoryId || !targetId) return null;

  let uni;
  try {
    uni = JSON.parse(localStorage.getItem("knowledge_universe") || "{}");
  } catch {
    return null;
  }

  const cat = uni[categoryId];
  if (!cat) return null;

  const out = {};
  const prefix = ("quiz_" + targetId + "_").toLowerCase();

  Object.entries(cat).forEach(([dimension, items]) => {
    if (!Array.isArray(items)) return;

    const filtered = items.filter(k =>
      k.id &&
      typeof k.id === "string" &&
      k.id.toLowerCase().startsWith(prefix)
    );

    if (filtered.length) {
      out[dimension] = filtered;
    }
  });

  return Object.keys(out).length ? out : null;
}

// Hent trivia-liste for en bestemt kategori + mål (person/sted)
// Leser direkte fra localStorage: trivia_universe
function getInlineTriviaFor(categoryId, targetId) {
  if (!categoryId || !targetId) return [];

  let uni;
  try {
    uni = JSON.parse(localStorage.getItem("trivia_universe") || "{}");
  } catch {
    return [];
  }

  const cat = uni[categoryId];
  if (!cat || typeof cat !== "object") return [];

  const list = cat[targetId] || [];
  if (Array.isArray(list)) return list;
  if (typeof list === "string") return [list];
  return [];
}

// ------------------------------------------------------------
// 2c. OBSERVASJONER (hg_learning_log_v1)
// ------------------------------------------------------------
function getObservationsForTarget(targetId, targetType) {
  try {
    const log = JSON.parse(localStorage.getItem("hg_learning_log_v1") || "[]");
    if (!Array.isArray(log)) return [];
    const tid = String(targetId || "").trim();
    const ttype = String(targetType || "").trim();

    return log
      .filter(e =>
        e &&
        e.type === "observation" &&
        String(e.targetId || "").trim() === tid &&
        String(e.targetType || "").trim() === ttype
      )
      .sort((a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0));
  } catch {
    return [];
  }
}

function renderObsList(obs) {
  if (!obs || !obs.length) return `<p class="hg-muted">Ingen observasjoner ennå.</p>`;

  return `
    <ul style="margin:0;padding-left:18px;">
      ${obs.slice(0, 10).map(o => {
        const lens = String(o.lens_id || "").trim() || "linse";
        const selected = Array.isArray(o.selected) ? o.selected : [];
        const note = String(o.note || "").trim();
        const when = o.ts ? new Date(o.ts).toLocaleString("no-NO") : "";
        return `
          <li style="margin:6px 0;">
            <strong>${lens}</strong>
            <div class="hg-muted" style="margin-top:2px;">
              ${selected.length ? selected.join(" · ") : "—"}
              ${when ? ` · ${when}` : ""}
            </div>
            ${note ? `<div style="margin-top:4px;">📝 ${note}</div>` : ""}
          </li>
        `;
      }).join("")}
    </ul>
  `;
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

  const categoryId =
    person.category ||
    (Array.isArray(person.tags) && person.tags.length ? person.tags[0] : null);

  const completed = hasCompletedQuiz(person.id);
  const knowledgeBlocks =
    completed && categoryId ? getInlineKnowledgeFor(categoryId, person.id) : null;
  const triviaList =
    completed && categoryId ? getInlineTriviaFor(categoryId, person.id) : [];

  // Finn steder knyttet til personen
  const placeMatches = PLACES.filter(
    p =>
      person.placeId === p.id ||
      (Array.isArray(person.places) && person.places.includes(p.id))
  );

  // OBSERVASJONER (person)
  const observations = getObservationsForTarget(person.id, "person");
  const obsHtml = renderObsList(observations);

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
                ${placeMatches
                  .map(pl => `<div class="hg-place" data-place="${pl.id}">📍 ${pl.name}</div>`)
                  .join("")}
              </div>`
            : `<p class="hg-muted">Ingen stedstilknytning.</p>`
        }
      </div>

      <!-- Samtale & notat -->
      <div class="hg-section">
        <h3>Samtale & notat</h3>
        <div class="hg-actions-row">
          <button class="hg-ghost-btn" data-chat-person="${person.id}">
            💬 Snakk med ${person.name}
          </button>
          <button class="hg-ghost-btn" data-note-person="${person.id}">
            📝 Notat
          </button>
        </div>
      </div>

      <!-- Observasjoner -->
      <div class="hg-section">
        <h3>Observasjoner</h3>
        ${obsHtml}
      </div>

      ${
        completed && (knowledgeBlocks || triviaList.length)
          ? `
      <div class="hg-section">
        <h3>Kunnskap</h3>
        ${
          knowledgeBlocks
            ? Object.entries(knowledgeBlocks)
                .map(([dim, items]) => `
                  <strong>${dim}</strong>
                  <ul>
                    ${items
                      .map(i => `<li><strong>${i.topic}:</strong> ${i.text || i.knowledge || ""}</li>`)
                      .join("")}
                  </ul>
                `)
                .join("")
            : `<p class="hg-muted">Ingen kunnskap registrert ennå.</p>`
        }
      </div>

      <div class="hg-section">
        <h3>Funfacts</h3>
        ${
          triviaList.length
            ? `<ul>${triviaList.map(t => `<li>${t}</li>`).join("")}</ul>`
            : `<p class="hg-muted">Ingen funfacts ennå.</p>`
        }
      </div>
          `
          : ""
      }
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

  const categoryId = place.category || null;
  const completed = hasCompletedQuiz(place.id);
  const knowledgeBlocks =
    completed && categoryId ? getInlineKnowledgeFor(categoryId, place.id) : null;
  const triviaList =
    completed && categoryId ? getInlineTriviaFor(categoryId, place.id) : [];

  // OBSERVASJONER (place)
  const observations = getObservationsForTarget(place.id, "place");
  const obsHtml = renderObsList(observations);

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
               ${peopleHere
                 .map(
                   pr => `
                 <div class="hg-popup-face" data-person="${pr.id}">
                   <img src="${pr.imageCard}">
                 </div>
               `
                 )
                 .join("")}
             </div>`
          : ""
      }

      ${
        completed && (knowledgeBlocks || triviaList.length)
          ? `
      <div class="hg-section">
        <h3>Kunnskap</h3>
        ${
          knowledgeBlocks
            ? Object.entries(knowledgeBlocks)
                .map(
                  ([dim, items]) => `
                  <strong>${dim}</strong>
                  <ul>
                    ${items
                      .map(i => `<li><strong>${i.topic}:</strong> ${i.text}</li>`)
                      .join("")}
                  </ul>
                `
                )
                .join("")
            : `<p class="hg-muted">Ingen kunnskap registrert ennå.</p>`
        }
      </div>

      <div class="hg-section">
        <h3>Funfacts</h3>
        ${
          triviaList.length
            ? `<ul>${triviaList.map(t => `<li>${t}</li>`).join("")}</ul>`
            : `<p class="hg-muted">Ingen funfacts ennå.</p>`
        }
      </div>
          `
          : ""
      }

      <div class="hg-section">
        <h3>Observasjoner</h3>
        ${obsHtml}
      </div>
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
  const btnNote   = document.getElementById("pcNote");
  const btnObs    = document.getElementById("pcObserve");

  if (!card) return;

  // Smooth “skifte sted”
  card.classList.add("is-switching");

  if (imgEl)   imgEl.src = place.image || "";
  if (titleEl) titleEl.textContent = place.name;
  if (metaEl)  metaEl.textContent  = `${place.category || ""} • radius ${place.r || 150} m`;
  if (descEl)  descEl.textContent  = place.desc || "";

  if (peopleEl) {
    const persons = PEOPLE.filter(
      p =>
        (Array.isArray(p.places) && p.places.includes(place.id)) ||
        p.placeId === place.id
    );

    peopleEl.innerHTML = persons
      .map(p => `
        <button class="pc-person" data-person="${p.id}">
          <img src="${p.image}" class="pc-person-img" alt="">
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

  if (btnInfo) btnInfo.onclick = () => showPlacePopup(place);

  // ✅ QUIZ: bruk QuizEngine (ny motor)
  if (btnQuiz) btnQuiz.onclick = () => {
    if (window.QuizEngine && typeof QuizEngine.start === "function") {
      QuizEngine.start(place.id);
    } else {
      showToast("Quiz-modul ikke lastet");
    }
  };

  if (btnRoute) btnRoute.onclick = () => {
  // 1) Foretrukket: ekte gangrute pos -> sted
  if (typeof window.showNavRouteToPlace === "function") {
    return window.showNavRouteToPlace(place);
  }

  // 2) Fallback: gammel compat
  if (typeof window.showRouteTo === "function") {
    return window.showRouteTo(place);
  }

  if (typeof window.showToast === "function") {
    window.showToast("Rute-funksjon ikke lastet");
  }
};

  if (btnNote && typeof handlePlaceNote === "function") {
    btnNote.onclick = () => handlePlaceNote(place);
  }

  // ✅ OBS: trigger HGObservations.start (hvis knappen finnes)
  if (btnObs) {
    btnObs.onclick = () => {
      if (!window.HGObservations || typeof window.HGObservations.start !== "function") {
        showToast("Observasjoner er ikke lastet");
        return;
      }

      const subjectId = String(place.categoryId || place.category || place.subject_id || "by").trim();

      window.HGObservations.start({
        target: {
          targetId: String(place.id || "").trim(),
          targetType: "place",
          subject_id: subjectId,
          categoryId: subjectId,
          title: place.name
        },
        // OBS: må finnes i data/observations/observations_by.json
        lensId: "by_brukere_hvem"
      });
    };
  }

  if (btnUnlock) {
    btnUnlock.onclick = () => {
      if (visited[place.id]) {
        showToast("Allerede låst opp");
        return;
      }

      visited[place.id] = true;
      saveVisited();

      // ✅ MARKØRER: bruk HGMap (ny modul)
      if (window.HGMap) {
        HGMap.setVisited(visited);
        HGMap.refreshMarkers();
      } else if (typeof drawPlaceMarkers === "function") {
        // fallback under migrering
        drawPlaceMarkers();
      }

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

  requestAnimationFrame(() => {
    card.classList.remove("is-switching");
  });

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
// 7. REWARD-POPUPS + KONFETTI
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
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];

      particle.style.left = Math.random() * 100 + "vw";
      particle.style.animationDuration =
        0.7 + Math.random() * 0.6 + "s";

      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }

    requestAnimationFrame(frame);
  })();
}

window.showRewardPlace = function(place) {
  if (!place) return;

  const BASE = document.querySelector("base")?.href || "";
  const card =
    place.cardImage || place.image || `${BASE}bilder/kort/places/${place.id}.PNG`;

  const categoryId = getLastQuizCategoryId(place.id);
  const knowledgeBlocks =
    categoryId ? getInlineKnowledgeFor(categoryId, place.id) : null;
  const triviaList =
    categoryId ? getInlineTriviaFor(categoryId, place.id) : [];

  makePopup(
    `
      <div class="reward-center">
        <h2 class="reward-title">🎉 Gratulerer!</h2>
        <p class="reward-sub">Du har samlet kortet</p>

        <img id="rewardCardImg" src="${card}" class="reward-card-img">

        ${
          knowledgeBlocks || triviaList.length
            ? `
        <div class="hg-section">
          <h3>Kunnskap</h3>
          ${
            knowledgeBlocks
              ? Object.entries(knowledgeBlocks)
                  .map(([dim, items]) => `
                    <strong>${dim}</strong>
                    <ul>
                      ${items.map(i => `<li><strong>${i.topic}:</strong> ${i.text}</li>`).join("")}
                    </ul>
                  `).join("")
              : `<p class="hg-muted">Ingen kunnskap registrert ennå.</p>`
          }
        </div>

        <div class="hg-section">
          <h3>Funfacts</h3>
          ${
            triviaList.length
              ? `<ul>${triviaList.map(t => `<li>${t}</li>`).join("")}</ul>`
              : `<p class="hg-muted">Ingen funfacts ennå.</p>`
          }
        </div>
            `
            : ""
        }

        <button class="reward-ok" data-close-popup>Fortsett</button>
      </div>
    `,
    "reward-popup",
    () => {
      // ÅPNE NESTE POPUP ETTER "FORTSETT"
      if (typeof window.showPlacePopup === "function") {
        window.showPlacePopup(place);
      }
    }
  );

  launchConfetti();

  requestAnimationFrame(() => {
    const img = document.getElementById("rewardCardImg");
    if (img) img.classList.add("visible");
  });
};

window.showRewardPerson = function(person) {
  if (!person) return;

  const BASE = document.querySelector("base")?.href || "";
  const card =
    person.cardImage || person.image || `${BASE}bilder/kort/people/${person.id}.PNG`;

  const categoryId = getLastQuizCategoryId(person.id);
  const knowledgeBlocks =
    categoryId ? getInlineKnowledgeFor(categoryId, person.id) : null;
  const triviaList =
    categoryId ? getInlineTriviaFor(categoryId, person.id) : [];

  makePopup(
    `
      <div class="reward-center">
        <h2 class="reward-title">🎉 Gratulerer!</h2>
        <p class="reward-sub">Du har samlet kortet</p>

        <img id="rewardCardImg" src="${card}" class="reward-card-img">

        ${
          knowledgeBlocks || triviaList.length
            ? `
        <div class="hg-section">
          <h3>Kunnskap</h3>
          ${
            knowledgeBlocks
              ? Object.entries(knowledgeBlocks)
                  .map(([dim, items]) => `
                    <strong>${dim}</strong>
                    <ul>
                      ${items.map(i => `<li><strong>${i.topic}:</strong> ${i.text}</li>`).join("")}
                    </ul>
                  `).join("")
              : `<p class="hg-muted">Ingen kunnskap registrert ennå.</p>`
          }
        </div>

        <div class="hg-section">
          <h3>Funfacts</h3>
          ${
            triviaList.length
              ? `<ul>${triviaList.map(t => `<li>${t}</li>`).join("")}</ul>`
              : `<p class="hg-muted">Ingen funfacts ennå.</p>`
          }
        </div>
            `
            : ""
        }

        <button class="reward-ok" data-close-popup>Fortsett</button>
      </div>
    `,
    "reward-popup",
    () => {
      // ÅPNE NESTE POPUP ETTER "FORTSETT"
      if (typeof window.showPersonPopup === "function") {
        window.showPersonPopup(person);
      }
    }
  );

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
  if (e.key === "Escape" && currentPopup) closePopup();
});
