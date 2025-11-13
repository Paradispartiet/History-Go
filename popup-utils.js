/* ============================================================
   UNIVERSAL PERSON & PLACE POPUP – History Go
   ============================================================ */

/* ------------------------------------------------------------
   Person-popup
------------------------------------------------------------ */
window.showPersonPopup = function(person) {
  if (!person) return;

  const face = `bilder/people/${person.id}_face.PNG`;
  const cardImg = person.image || `bilder/kort/people/${person.id}.PNG`;
  const wiki = person.wiki || "";
  const works = person.works || [];
  const places = (window.PLACES || []).filter(p => p.people?.includes(person.id));

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
            ? `<ul class="hg-works">${works.map(w => `<li>${w}</li>`).join("")}</ul>`
            : `<p class="hg-muted">Ingen registrerte verk.</p>`
        }
      </div>

      <div class="hg-section">
        <h3>Om personen</h3>
        <p class="hg-wiki">${wiki}</p>
      </div>

      <div class="hg-section">
        <h3>Steder</h3>
        ${
          places.length
            ? `<div class="hg-places">
                ${places
                  .map(
                    p => `<div class="hg-place" data-place="${p.id}">📍 ${p.name}</div>`
                  )
                  .join("")}
               </div>`
            : `<p class="hg-muted">Ingen stedstilknytning.</p>`
        }
      </div>
    </div>
  `;

  // Close
  el.querySelector(".hg-popup-close").onclick = () => el.remove();

  // Klikk på steder → åpner steds-popup
  el.querySelectorAll("[data-place]").forEach(btn => {
    btn.onclick = () => {
      const place = (window.PLACES || []).find(p => p.id === btn.dataset.place);
      el.remove();
      window.showPlacePopup(place);
    };
  });

  document.body.appendChild(el);
};


/* ------------------------------------------------------------
   Steds-popup
------------------------------------------------------------ */
window.showPlacePopup = function(place) {
  if (!place) return;

  const fullImg = place.image || `bilder/kort/places/${place.id}.PNG`;
  const thumbImg = `bilder/kort/places/${place.id}.PNG`;
  const peopleHere = (window.PEOPLE || []).filter(p => p.placeId === place.id);

  const el = document.createElement("div");
  el.className = "hg-popup";
  el.innerHTML = `
    <div class="hg-popup-inner">
      <button class="hg-popup-close">✕</button>

      <img src="${fullImg}" class="hg-popup-img" alt="${place.name}">

      <h3 class="hg-popup-title">${place.name}</h3>
      <p class="hg-popup-cat">${place.category || ""}</p>

      <p class="hg-popup-desc">${place.desc || ""}</p>

      ${
        peopleHere.length
          ? `
            <div class="hg-section">
              <h3>Personer</h3>
              <div class="hg-popup-people">
                ${peopleHere
                  .map(
                    p => `
                  <div class="hg-popup-face" data-person="${p.id}">
                    <img src="bilder/people/${p.id}_face.PNG">
                  </div>`
                  )
                  .join("")}
              </div>
            </div>
          `
          : ""
      }

      <img src="${thumbImg}" class="hg-popup-cardthumb">

      <div class="hg-popup-locations">
        <div class="loc-chip">📍 ${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}</div>
      </div>
    </div>
  `;

  document.body.appendChild(el);

  // Close
  el.querySelector(".hg-popup-close").onclick = () => el.remove();

  // Klikk på personer → åpne person-popup
  el.querySelectorAll("[data-person]").forEach(btn => {
    btn.onclick = () => {
      const person = (window.PEOPLE || []).find(p => p.id === btn.dataset.person);
      el.remove();
      window.showPersonPopup(person);
    };
  });
};
