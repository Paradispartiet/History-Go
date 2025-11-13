// ============================================================
// HISTORY GO – POPUP-UTILS (GLOBAL & STABIL)
// ============================================================
// Denne fila styrer ALLE popups for hele History Go.
// Brukes både av app.js og profile.js uten duplikater.
//
//  Inneholder:
//   ✓ showPersonPopup()
//   ✓ showPlacePopup()
//   ✓ showRewardPerson()
//   ✓ showRewardPlace()
// ============================================================


// ------------------------------------------------------------
// PERSON INFO POPUP (stor info-popup)
// ------------------------------------------------------------
function showPersonPopup(person) {
  if (!person) return;

  const face = `bilder/people/${person.id}_face.PNG`;
  const cardImg = person.image || `bilder/kort/people/${person.id}.PNG`;

  const wiki = person.wiki || "";
  const works = person.works || [];
  const placeMatches = (window.PLACES || []).filter(p =>
    p.people?.includes(person.id) || p.placeId === person.id
  );

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
            ? `<ul class="hg-works">${works.map(w=>`<li>${w}</li>`).join("")}</ul>`
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
          placeMatches.length
            ? `<div class="hg-places">
                ${placeMatches.map(p =>
                  `<div class="hg-place" data-place="${p.id}">📍 ${p.name}</div>`
                ).join("")}
               </div>`
            : `<p class="hg-muted">Ingen stedstilknytning.</p>`
        }
      </div>

    </div>
  `;

  // ACTIONS
  el.querySelector(".hg-popup-close").onclick = () => el.remove();

  el.querySelectorAll("[data-place]").forEach(btn => {
    btn.onclick = () => {
      const pl = window.PLACES?.find(x => x.id === btn.dataset.place);
      el.remove();
      showPlacePopup(pl);
    };
  });

  document.body.appendChild(el);
}


// ------------------------------------------------------------
// STED INFO POPUP (stor info-popup)
// ------------------------------------------------------------
function showPlacePopup(place) {
  if (!place) return;

  const fullImg = place.image || `bilder/kort/places/${place.id}.PNG`;
  const peopleHere = (window.PEOPLE || []).filter(p =>
    p.placeId === place.id || place.people?.includes(p.id)
  );

  const el = document.createElement("div");
  el.className = "hg-popup";

  el.innerHTML = `
    <div class="hg-popup-inner">
      <button class="hg-popup-close">✕</button>

      <img src="${fullImg}" class="hg-popup-img">

      <h2 class="hg-popup-title">${place.name}</h2>
      <p class="hg-popup-cat">${place.category || ""}</p>

      <p class="hg-popup-desc">${place.desc || ""}</p>

      ${
        peopleHere.length
          ? `<h3 class="hg-popup-sub">Personer</h3>
             <div class="hg-popup-people">
               ${peopleHere.map(p =>
                 `<img src="bilder/people/${p.id}_face.PNG" data-person="${p.id}" class="hg-popup-face">`
               ).join("")}
             </div>`
          : ""
      }

      <img src="${fullImg}" class="hg-popup-cardthumb">

      <div class="hg-popup-locations">
        <div class="loc-chip">📍 ${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}</div>
      </div>

    </div>
  `;

  // ACTIONS
  el.querySelector(".hg-popup-close").onclick = () => el.remove();

  el.querySelectorAll("[data-person]").forEach(btn => {
    btn.onclick = () => {
      const pr = window.PEOPLE?.find(x => x.id === btn.dataset.person);
      el.remove();
      showPersonPopup(pr);
    };
  });

  document.body.appendChild(el);
}


// ------------------------------------------------------------
// REWARD POPUP – PERSON
// ------------------------------------------------------------
function showRewardPerson(person) {
  if (!person) return;

  const imgPath = person.image || `bilder/kort/people/${person.id}.PNG`;

  const el = document.createElement("div");
  el.className = "reward-popup";
  el.innerHTML = `
    <div class="popup-inner">
      <img src="${imgPath}" class="reward-img">

      <h3>${person.name}</h3>
      <p class="reward-cat">${(person.tags||[]).join(", ")}</p>

      <p class="reward-desc">${person.desc || ""}</p>

      <div class="reward-banner">
        🏅 Du har samlet kortet <strong>${person.name}</strong>!
      </div>
    </div>
  `;

  document.body.appendChild(el);
  setTimeout(() => el.classList.add("visible"), 20);
  setTimeout(() => el.remove(), 4200);
}


// ------------------------------------------------------------
// REWARD POPUP – PLACE
// ------------------------------------------------------------
function showRewardPlace(place) {
  if (!place) return;

  const imgPath = place.image || `bilder/kort/places/${place.id}.PNG`;

  const el = document.createElement("div");
  el.className = "reward-popup";
  el.innerHTML = `
    <div class="popup-inner">
      <img src="${imgPath}" class="reward-img">

      <h3>${place.name}</h3>
      <p class="reward-cat">${place.category || ""}</p>

      <p class="reward-desc">${place.desc || ""}</p>

      <div class="reward-banner">
        🏛️ Du har samlet stedet <strong>${place.name}</strong>!
      </div>
    </div>
  `;

  document.body.appendChild(el);
  setTimeout(() => el.classList.add("visible"), 20);
  setTimeout(() => el.remove(), 4200);
}


// ------------------------------------------------------------
// GJØR FUNKSJONENE GLOBALT TILGJENGELIGE
// ------------------------------------------------------------
window.showPersonPopup = showPersonPopup;
window.showPlacePopup  = showPlacePopup;
window.showRewardPerson = showRewardPerson;
window.showRewardPlace  = showRewardPlace;
