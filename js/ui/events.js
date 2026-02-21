// ==============================
// 9. HENDELSER (CLICK-DELEGATION) OG SHEETS
// ==============================
function openSheet(sheet) {
  sheet?.setAttribute("aria-hidden", "false");
}
function closeSheet(sheet) {
  sheet?.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", e => {
  const target = e.target;


  
  // --- PlaceCard: toggle icon lists (people / nature / badges) ---
  const toggleBtn = target.closest?.("[data-toggle]");
  if (toggleBtn) {
    const type = toggleBtn.dataset.toggle;

    const map = {
      people: "pcPeopleList",
      nature: "pcNatureList",
      badges: "pcBadgesList"
    };

    const listId = map[type];
    if (listId) {
      document.getElementById(listId)?.classList.toggle("is-open");
    }

    e.preventDefault();
    return;
  }

  // --- Åpne sted fra kort (data-open) ---
  const openEl = target.closest?.("[data-open]");
  const openId = openEl?.getAttribute("data-open");

  if (openId) {
    const p = PLACES.find(x => x.id === openId);
    if (p) openPlaceCard(p);
    return;
  }

  // --- Mer info (Google) ---
  const infoName = target.getAttribute?.("data-info");
  if (infoName) {
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(infoName + " Oslo")}`,
      "_blank"
    );
    return;
  }

// --- SNakk med person ---
  const chatPersonId = target.getAttribute?.("data-chat-person");
  if (chatPersonId) {
    const person = PEOPLE.find(p => p.id === chatPersonId);
    if (person) {
      handlePersonChat(person);
    }
    return;
  }

  // --- Notat om person ---
  const notePersonId = target.getAttribute?.("data-note-person");
  if (notePersonId) {
    const person = PEOPLE.find(p => p.id === notePersonId);
    if (person) {
      handlePersonNote(person);
    }
    return;
  }


  // Quiz
  // Quiz (robust på iPad/Safari)
  const quizEl = target.closest?.("[data-quiz]");
  const quizId = quizEl?.getAttribute?.("data-quiz");

  if (quizId) {
  if (window.QuizEngine?.start) {
    QuizEngine.start(quizId);
  } else {
    showToast("Quiz-modul ikke lastet");
  }
  return;
}

  // --- SØKERESULTAT: STED ---
const placeId = target.closest?.(".search-item")?.getAttribute("data-place");
if (placeId) {
  const p = PLACES.find(x => x.id === placeId);
  if (p) {
    // lukk søkeresultater
    document.getElementById("searchResults").style.display = "none";
    // åpne popup/kort
    openPlaceCard(p);
    // zoom kart
    if (p.lat && p.lon) focusMap(p.lat, p.lon);
  }
  return;
}

// --- SØKERESULTAT: PERSON ---
const personId = target.closest?.(".search-item")?.getAttribute("data-person");
if (personId) {
  const pe = PEOPLE.find(x => x.id === personId);
  if (pe) {
    document.getElementById("searchResults").style.display = "none";
    showPersonPopup(pe);

    // zoom til sted personen hører til (hvis finnes)
    if (pe.placeId) {
      const plc = PLACES.find(p => p.id === pe.placeId);
      if (plc) focusMap(plc.lat, plc.lon);
    }
  }
  return;
}

// --- SØKERESULTAT: MERKE ---
const badgeId = target.closest?.(".search-item")?.getAttribute("data-badge");
if (badgeId) {
  // lukk søket
  document.getElementById("searchResults").style.display = "none";

  // finn badge i datasettet
  const badgeEl = document.querySelector(`[data-badge-id="${badgeId}"]`);

  // bruk samme funksjon som vanlig
  if (badgeEl) {
    handleBadgeClick(badgeEl);
  }

  return;
}

  
  // Badge-klikk
  const badgeEl = target.closest?.("[data-badge-id]");
  if (badgeEl) {
    handleBadgeClick(badgeEl);
    return;
  }
});

// Sheets med data-close
document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    const sel = btn.getAttribute("data-close");
    document.querySelector(sel)?.setAttribute("aria-hidden", "true");
  });
});


