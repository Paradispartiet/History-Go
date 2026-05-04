function handlePersonChat(person) {
  // Enkel V1: ett åpent spørsmål + lagring
  const userText = window.prompt(
    `Du snakker med ${person.name}.\n\n` +
    `Hva tenker du når du ser livet og tiden til denne personen?`
  );
  if (!userText) return;

  personDialogs.push({
    id: "dlg_" + Date.now(),
    personId: person.id,
    categoryId: (person.tags && person.tags[0]) || null,
    role: "user",
    text: userText,
    createdAt: new Date().toISOString()
  });
  savePersonDialogs();

  showToast(`Samtale med ${person.name} lagret 💬`);
}

function handlePersonNote(person) {
  const noteText = window.prompt(
    `Notat om ${person.name}.\n\n` +
    `Skriv én setning eller tanke du vil ta vare på:`
  );
  if (!noteText) return;

  userNotes.push({
    id: "note_" + Date.now(),
    userId: "local",              // senere: ekte bruker-id
    source: "historygo",
    type: "person",
    personId: person.id,
    placeId: null,
    categoryId: (person.tags && person.tags[0]) || null,
    title: `Notat om ${person.name}`,
    text: noteText,
    feeling: null,                // plass til følelser/valens senere
    createdAt: new Date().toISOString(),
    visibility: "private"
  });
  saveUserNotes();

  showToast(`Notat om ${person.name} lagret 📝`);
}

function handlePlaceNote(place) {
  const noteText = window.prompt(
    `Notat om ${place.name}.\n\nSkriv én setning eller tanke du vil ta vare på:`
  );
  if (!noteText) return;

  userNotes.push({
    id: "note_" + Date.now(),
    userId: "local",
    source: "historygo",
    type: "place",
    personId: null,
    placeId: place.id,
    categoryId: place.category || null,
    title: `Notat om ${place.name}`,
    text: noteText,
    feeling: null,
    createdAt: new Date().toISOString(),
    visibility: "private"
  });
  saveUserNotes();
  showToast(`Notat om ${place.name} lagret 📝`);
}

// ============================================================
// PLACE CARD: trykk på beskrivelsen åpner full stedsbeskrivelse
// ============================================================
function getActivePlaceFromPlaceCard() {
  const card = document.getElementById("placeCard");
  const placeId = String(card?.dataset?.currentPlaceId || "").trim();
  if (!placeId) return null;

  const places = Array.isArray(window.PLACES) ? window.PLACES : [];
  return places.find(p => String(p?.id || "").trim() === placeId) || null;
}

function openActivePlaceDescription(e) {
  e.preventDefault();
  e.stopPropagation();

  const place = getActivePlaceFromPlaceCard();
  if (!place) return;

  if (typeof window.showPlacePopup === "function") {
    window.showPlacePopup(place);
  } else {
    window.showToast?.("Stedsbeskrivelse ikke lastet");
  }
}

function bindPlaceDescriptionPopup() {
  const descEl = document.getElementById("pcDesc");
  if (!descEl || descEl.dataset.fullTextPopupBound === "1") return;

  descEl.dataset.fullTextPopupBound = "1";
  descEl.setAttribute("role", "button");
  descEl.setAttribute("tabindex", "0");
  descEl.setAttribute("title", "Trykk for å lese hele teksten");
  descEl.style.cursor = "pointer";

  descEl.addEventListener("click", openActivePlaceDescription);
  descEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      openActivePlaceDescription(e);
    }
  });
}

bindPlaceDescriptionPopup();

// ============================================================
// PLACE POPUP: større og mer lesbar tekst i steds-popupen
// ============================================================
function ensurePlacePopupReadableCss() {
  if (document.getElementById("hg-place-popup-readable-css")) return;

  const style = document.createElement("style");
  style.id = "hg-place-popup-readable-css";
  style.textContent = `
    .hg-popup.place-popup .hg-popup-name,
    .hg-popup.place-popup .hg-popup-title{
      font-size: 28px;
      line-height: 1.15;
    }

    .hg-popup.place-popup .hg-popupdesc{
      font-size: 20px;
      line-height: 1.65;
    }

    .hg-popup.place-popup .hg-wiki{
      font-size: 18px;
      line-height: 1.6;
    }

    .hg-popup.place-popup .hg-section h3{
      font-size: 19px;
      line-height: 1.25;
    }
  `;

  document.head.appendChild(style);
}

ensurePlacePopupReadableCss();

// ============================================================
// PLACE POPUP: bruk popupDesc som fulltekst når den finnes
// ============================================================
(function patchPlacePopupDescriptionSource() {
  const originalShowPlacePopup = window.showPlacePopup;
  if (typeof originalShowPlacePopup !== "function") return;
  if (originalShowPlacePopup.__usesPopupDesc === true) return;

  function getPlacePopupDesc(place) {
    return String(
      place?.popupDesc ??
      place?.popupdesc ??
      place?.description ??
      ""
    ).trim();
  }

  window.showPlacePopup = function showPlacePopupWithPopupDesc(place, ...args) {
    console.log("[popup-debug] patchPlacePopupDescriptionSource wrapper called", {
      placeId: place?.id,
      hasPopupDesc: Boolean(getPlacePopupDesc(place))
    });
    const popupDesc = getPlacePopupDesc(place);

    if (place && typeof place === "object" && popupDesc) {
      return originalShowPlacePopup.call(this, {
        ...place,
        desc: popupDesc,
        popupDesc
      }, ...args);
    }

    return originalShowPlacePopup.call(this, place, ...args);
  };

  window.showPlacePopup.__usesPopupDesc = true;
})();



// ==============================
// 12. KARTMODUS
// ==============================
function enterMapMode() {
  document.body.classList.add("map-only"); // kan beholdes hvis du bruker den visuelt

  if (el.btnSeeMap)  el.btnSeeMap.style.display = "none";
  if (el.btnExitMap) el.btnExitMap.style.display = "block";

   // ✅ bare minimer (ingen hide av hele UI)
  window.setPlaceCardCollapsed?.(true);

   // ✅ kartmodus: kollaps Nearby
  window.setNearbyCollapsed?.(true);

  window.HGMap?.resize?.();
  window.MAP?.resize?.();

  showToast("Kartmodus");
}

function exitMapMode() {
  document.body.classList.remove("map-only");

  if (el.btnSeeMap)  el.btnSeeMap.style.display = "block";
  if (el.btnExitMap) el.btnExitMap.style.display = "none";
  
  window.setPlaceCardCollapsed?.(false);
  // Nearby skal alltid være synlig i explore
  window.setNearbyCollapsed?.(false);
  
  window.HGMap?.resize?.();
  window.MAP?.resize?.();

  showToast("Tilbake til oversikt");
}

el.btnSeeMap?.addEventListener("click", enterMapMode);
el.btnExitMap?.addEventListener("click", exitMapMode);

// Eksponer på window så routes.js og andre subsystemer kan bytte til
// kart-modus før de tegner overlays/ruter.
window.enterMapMode = enterMapMode;
window.exitMapMode = exitMapMode;

window.addEventListener("resize", () => {
  window.MAP?.resize?.();
});

// ============================================================
// PERSON-POPUP ANCHOR
// Person-popup må ligge i samme skalerte app-shell som Nearby.
// Hvis den blir appendet direkte på body, vil hardkodede top-verdier
// bruke viewport-piksler og gi synlig mellomrom på iPad.
// ============================================================

function anchorPersonPopupToAppShell(node) {
  if (!node || !node.classList?.contains("person-popup")) return;

  const shell = document.querySelector(".app-shell");
  if (!shell || node.parentElement === shell) return;

  shell.appendChild(node);
}

const personPopupObserver = new MutationObserver(records => {
  records.forEach(record => {
    record.addedNodes.forEach(node => {
      anchorPersonPopupToAppShell(node);
    });
  });
});

personPopupObserver.observe(document.body, {
  childList: true
});
