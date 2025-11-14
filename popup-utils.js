// ============================================================
//  UNIVERSAL PERSON INFO POPUP (REN NY VERSJON)
// ============================================================
window.showPersonPopup = function(person) {
  if (!person) return;

  const face    = `bilder/people/${person.id}_face.PNG`;
  const cardImg = person.image || `bilder/kort/people/${person.id}.PNG`;
  const wiki    = person.wiki || "";
  const works   = person.works || [];
  const popupDesc = person.popupDesc || "";   // ← LEGG TIL: trygg fallback

  const placeMatches = PLACES.filter(p => p.people?.includes(person.id));

  const el = document.createElement("div");
  el.className = "hg-popup";

  el.innerHTML = `
    <div class="hg-popup-inner">

      <button class="hg-popup-close">✕</button>

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

        ${popupDesc 
          ? `<p class="hg-popupdesc">${popupDesc}</p>` 
          : ""}
      </div>

      <div class="hg-section">
        <h3>Steder</h3>
        ${
          placeMatches.length
            ? `<div class="hg-places">
                 ${placeMatches.map(p => `
                   <div class="hg-place" data-place="${p.id}">
                     📍 ${p.name}
                   </div>
                 `).join("")}
               </div>`
            : `<p class="hg-muted">Ingen stedstilknytning.</p>`
        }
      </div>

    </div>
  `;

  el.querySelector(".hg-popup-close").onclick = () => el.remove();

  el.querySelectorAll("[data-place]").forEach(btn => {
    btn.onclick = () => {
      const place = PLACES.find(p => p.id === btn.dataset.place);
      el.remove();
      showPlacePopup(place);
    };
  });

  document.body.appendChild(el);
};

// ============================================================
//  UNIVERSAL STEDS-POPUP (REN NY VERSJON)
// ============================================================
window.showPlacePopup = function(place) {
  if (!place) return;

  const fullImg  = place.image || `bilder/kort/places/${place.id}.PNG`;
  const thumbImg = `bilder/kort/places/${place.id}.PNG`;

  const peopleHere = PEOPLE.filter(p => p.placeId === place.id);

  const card = document.createElement("div");
  card.className = "hg-popup";

  card.innerHTML = `
    <div class="hg-popup-inner">

      <img src="${fullImg}" class="hg-popup-img" alt="${place.name}">

      <h3 class="hg-popup-title">${place.name}</h3>
      <p class="hg-popup-cat">${place.category || ""}</p>

      <p class="hg-popup-desc">${place.desc || ""}</p>

      ${place.popupDesc 
        ? `<p class="hg-popup-popupdesc">${place.popupDesc}</p>` 
        : ""}

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

    </div>
  `;

  document.body.appendChild(card);

  card.querySelectorAll(".hg-popup-face").forEach(el => {
    el.onclick = () => {
      const pr = PEOPLE.find(p => p.id === el.dataset.person);
      showPersonPopup(pr);
    };
  });

  setTimeout(() => card.classList.add("visible"), 10);
  card.onclick = e => {
    if (e.target.classList.contains("hg-popup")) card.remove();
  };
};


// ============================================================
//  GLOBAL QUIZ-KNAPP HANDLER (MÅ VÆRE MED)
// ============================================================
document.addEventListener("click", e => {
  const btn = e.target.closest(".hg-quiz-btn");
  if (!btn) return;
  const targetId = btn.dataset.quiz;
  if (targetId) startQuiz(targetId);
});
