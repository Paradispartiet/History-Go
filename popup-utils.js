// ============================================================
//  UNIVERSAL PERSON INFO POPUP
// ============================================================
window.showPersonPopup = function(person) {
  if (!person) return;

  // Finn ansikt + kortbilde
  const face = `bilder/people/${person.id}_face.PNG`;
  const cardImg = person.image || `bilder/kort/people/${person.id}.PNG`;

  // Wiki / verk / steder
  const wiki = person.wiki || "";
  const works = person.works || [];
  const placeMatches = PLACES.filter(p => p.people?.includes(person.id));

  // Lag popupen
  const el = document.createElement("div");
  el.className = "hg-popup";

  el.innerHTML = `
    <div class="hg-popup-inner">

      <!-- Close -->
      <button class="hg-popup-close">✕</button>

      <!-- Top: face -->
      <img src="${face}" class="hg-popup-face">

      <h2 class="hg-popup-name">${person.name}</h2>

      <!-- Kortbilde nederst til høyre -->
      <img src="${cardImg}" class="hg-popup-cardimg">

      <!-- Verk-listen -->
      <div class="hg-section">
        <h3>Verk</h3>
        ${
          works.length
            ? `<ul class="hg-works">
                ${works.map(w => `<li>${w}</li>`).join("")}
               </ul>`
            : `<p class="hg-muted">Ingen registrerte verk.</p>`
        }
        
        ${
  QUIZZES.some(q => q.placeId === person.placeId)
    ? `<button class="hg-quiz-btn" data-quiz="${QUIZZES.find(q => q.placeId === person.placeId).id}">
         Ta quiz
       </button>`
    : ""
}
</div>

      <!-- Wiki -->
      <div class="hg-section">
        <h3>Om personen</h3>
        <p class="hg-wiki">${wiki}</p>
      </div>

      <!-- Steder personen finnes -->
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
                  )
                  .join("")}
               </div>`
            : `<p class="hg-muted">Ingen stedstilknytning.</p>`
        }
      </div>

    </div>
  `;

  // Lukking
  el.querySelector(".hg-popup-close").onclick = () => el.remove();

  // Klikk på steder → åpner steds-popup
  el.querySelectorAll("[data-place]").forEach(btn => {
    btn.onclick = () => {
      const place = PLACES.find(p => p.id === btn.dataset.place);
      el.remove();
      showPlacePopup(place);
    };
  });

  document.body.appendChild(el);
}

// ============================================================
// UNIVERSAL STEDS-POPUP (info-popup, ikke reward)
// ============================================================
window.showPlacePopup = function(place) {
  if (!place) return;

  const fullImg = place.image || `bilder/kort/places/${place.id}.PNG`;
  const thumbImg = `bilder/kort/places/${place.id}.PNG`;

  const peopleHere = PEOPLE.filter(p => p.placeId === place.id);

  const card = document.createElement("div");
  card.className = "hg-popup";

  card.innerHTML = `
    <div class="hg-popup-inner">

      <!-- Hovedbilde -->
      <img src="${fullImg}" class="hg-popup-img" alt="${place.name}">

      <h3 class="hg-popup-title">${place.name}</h3>
      <p class="hg-popup-cat">${place.category || ""}</p>

      <!-- Beskrivelse -->
      <p class="hg-popup-desc">${place.desc || ""}</p>

        ${
  QUIZZES.some(q => q.placeId === place.id)
    ? `<button class="hg-quiz-btn" data-quiz="${QUIZZES.find(q => q.placeId === place.id).id}">
         Ta quiz
       </button>`
    : ""
}

      <!-- Personer på stedet -->
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

      <!-- Mini-kort nederst høyre -->
      <img src="${thumbImg}" class="hg-popup-cardthumb">

      <!-- Kartmarkør nederst -->
      <div class="hg-popup-locations">
        <div class="loc-chip">📍 ${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}</div>
      </div>

    </div>
  `;

  document.body.appendChild(card);

  // Klikk på person → åpne person-popup
  card.querySelectorAll(".hg-popup-face").forEach(el => {
    el.onclick = () => {
      const id = el.dataset.person;
      const pr = PEOPLE.find(p => p.id === id);
      showPersonPopup(pr);
    };
  });

  setTimeout(() => card.classList.add("visible"), 10);

  // Klikk utenfor → lukk
  card.onclick = e => {
    if (e.target.classList.contains("hg-popup")) card.remove();
  };
};
