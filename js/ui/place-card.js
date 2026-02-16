// ============================================================
// 5. PLACE CARD (det store kortpanelet) — REN SAMLET VERSJON
// ============================================================
window.openPlaceCard = async function (place) {
  if (!place) return;

  const card      = document.getElementById("placeCard");
  const imgEl     = document.getElementById("pcImage");
  const titleEl   = document.getElementById("pcTitle");
  const metaEl    = document.getElementById("pcMeta");
  const descEl    = document.getElementById("pcDesc");
  const peopleIcon = document.getElementById("pcPeopleIcon");
  const natureIcon = document.getElementById("pcNatureIcon");
  const badgesIcon = document.getElementById("pcBadgesIcon");

  const iconsWrap = card ? card.querySelector(".pc-icons") : null;

  const peopleEl = document.getElementById("pcPeopleList");
  const natureEl = document.getElementById("pcNatureList");
  const badgesEl = document.getElementById("pcBadgesList");
  
  const btnInfo   = document.getElementById("pcInfo");
  const btnQuiz   = document.getElementById("pcQuiz");
  const btnUnlock = document.getElementById("pcUnlock");
  const btnRoute  = document.getElementById("pcRoute");
  const btnNote   = document.getElementById("pcNote");
  const btnObs    = document.getElementById("pcObserve");
  const btnClose  = document.getElementById("pcClose");

    // ------------------------------------------------------------
  // FIX: Ikke la ikon-klikk boble opp og lukke/kollapse placeCard
  // + Toggle lister uten å påvirke kortet
  // (bindes kun én gang)
  // ------------------------------------------------------------
  if (!card.dataset.pcIconsBound) {
    card.dataset.pcIconsBound = "1";

    const closeAllLists = () => {
      peopleEl?.classList.remove("is-open");
      natureEl?.classList.remove("is-open");
      badgesEl?.classList.remove("is-open");
    };


    iconsWrap?.addEventListener("click", (e) => {
      e.stopPropagation();
     });
    
    peopleIcon?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();           // ⬅️ dette stopper “placeCard lukker seg”
      const open = !peopleEl?.classList.contains("is-open");
      closeAllLists();
      if (open) peopleEl?.classList.add("is-open");
    });

    natureIcon?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = !natureEl?.classList.contains("is-open");
      closeAllLists();
      if (open) natureEl?.classList.add("is-open");
    });

    badgesIcon?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = !badgesEl?.classList.contains("is-open");
      closeAllLists();
      if (open) badgesEl?.classList.add("is-open");
    });

    // Valgfritt men smart: klikk inni listene skal heller ikke lukke kortet
    peopleEl?.addEventListener("click", (e) => e.stopPropagation());
    natureEl?.addEventListener("click", (e) => e.stopPropagation());
    badgesEl?.addEventListener("click", (e) => e.stopPropagation());
  }

// --- pc-actions: ikonmodus (kun på smale skjermer) ---
const isNarrow = window.matchMedia && window.matchMedia("(max-width: 520px)").matches;

const setPcIcon = (btn, icon, label) => {
  if (!btn) return;
  btn.textContent = icon;
  btn.setAttribute("aria-label", label);
  btn.title = label;
  btn.classList.add("pc-iconbtn");
};

const setPcText = (btn, text) => {
  if (!btn) return;
  btn.textContent = text;
  btn.setAttribute("aria-label", text);
  btn.title = text;
  btn.classList.remove("pc-iconbtn");
};

if (isNarrow) {
  setPcIcon(btnInfo,  "ℹ️", "Mer info");
  setPcText(btnQuiz,  "Quiz");
  setPcText(btnRoute, "Rute");
  setPcIcon(btnObs,   "👁️", "Observasjon");
  setPcIcon(btnNote,  "📝", "Notat");
  setPcIcon(btnClose, "✕",  "Lukk");
} else {
  setPcText(btnInfo,  "Mer info");
  setPcText(btnQuiz,  "Ta quiz");
  // btnUnlock settes lenger nede av unlock-UI – la den være
  setPcText(btnRoute, "Rute");
  setPcText(btnObs,   "Observasjon");
  setPcText(btnNote,  "Notat");
  setPcText(btnClose, "Lukk");
}
  
  if (!card) return;

  // Smooth “skifte sted”
  card.classList.add("is-switching");

  // Basic content
  if (imgEl) {
  imgEl.src = place.cardImage || place.image || "";
    
  if (titleEl) titleEl.textContent = place.name || "";
  if (metaEl)  metaEl.textContent  = `${place.category || ""} • radius ${place.r || 150} m`;
  if (descEl)  descEl.textContent  = place.desc || "";

  // (valgfritt men nyttig): beregn avstand live for NextUp hvis mulig
  try {
    const pos = (typeof window.getPos === "function") ? window.getPos() : null;
    if (pos && typeof window.distMeters === "function" && place.lat != null && place.lon != null) {
      place._d = window.distMeters(pos, { lat: place.lat, lon: place.lon });
    }
  } catch {}

  // --- PERSONER (robust: støtter både PEOPLE og window.PEOPLE) ---
  const PEOPLE_LIST =
    (typeof PEOPLE !== "undefined" && Array.isArray(PEOPLE)) ? PEOPLE :
    (Array.isArray(window.PEOPLE) ? window.PEOPLE : []);

  const persons = getPeopleForPlace(place.id);

  // --- FLORA (place.flora = ["flora_id", ...]) ---
  let FLORA_LIST =
    (typeof FLORA !== "undefined" && Array.isArray(FLORA)) ? FLORA :
    (Array.isArray(window.FLORA) ? window.FLORA : []);

  // Hvis flora ikke er lastet globalt ennå: last fra fil én gang og cache på window.FLORA
  if (!FLORA_LIST.length) {
    try {
      const url = new URL("data/nature/flora.json", document.baseURI).toString();
      const r = await fetch(url, { cache: "no-store" });
      if (r.ok) {
        const arr = await r.json();
        if (Array.isArray(arr)) {
          window.FLORA = arr;
          FLORA_LIST = arr;
        }
      }
    } catch {}
  }

  const floraIds = Array.isArray(place.flora) ? place.flora : [];
  const floraHere = floraIds
    .map(id => FLORA_LIST.find(a => String(a?.id || "").trim() === String(id || "").trim()))
    .filter(Boolean);
  
// --- MiniProfile: send TriNext + Fordi ---
try {
  const completedQuiz = hasCompletedQuiz(place.id);
  const isVisited = !!(window.visited && window.visited[place.id]);
  const cat = place.category || "";

  const because = [];
  if (cat) because.push(cat);
  because.push(completedQuiz ? "quiz fullført" : "quiz ikke tatt");
  because.push(isVisited ? "låst opp" : "ikke låst opp");
  if (persons.length) because.push(`${persons.length} personer her`);
  const becauseLine = because.join(" • ");

  const nearbyPlaces = Array.isArray(window.NEARBY_PLACES) ? window.NEARBY_PLACES : [];

  const tri = (window.HGNavigator && typeof window.HGNavigator.buildForPlace === "function")
    ? await window.HGNavigator.buildForPlace(place, { nearbyPlaces, personsHere: persons })
    : null;

  window.dispatchEvent(new CustomEvent("hg:mpNextUp", {
    detail: { tri, becauseLine }
  }));
} catch (e) {
  console.warn("[mpNextUp]", e);
}

 
  
  
// --- PEOPLE LIST ---
if (peopleEl) {
  const restPersons = Array.isArray(persons) ? persons.slice(1) : [];

const peopleHtml = restPersons
  .map(p => `
    <button class="pc-person" data-person="${p.id}">
      <img src="${p.image}" class="pc-person-img" alt="">
      <span>${p.name}</span>
    </button>
  `)
  .join("");

  peopleEl.innerHTML = peopleHtml;

  // people click (som før)
  peopleEl.querySelectorAll("[data-person]").forEach(btn => {
    btn.onclick = () => {
      const pr = PEOPLE_LIST.find(x => x.id === btn.dataset.person);
      if (pr) window.showPersonPopup?.(pr);
    };
  });
}

// people icon preview (første person)
if (peopleIcon) {
  const p0 = persons?.[0];
  peopleIcon.innerHTML = p0?.image
    ? `<img src="${p0.image}" class="pc-person-img" alt="">`
    : "";
}


// --- NATURE LIST (flora) ---
if (natureEl) {
  const floraHtml = floraHere.length
    ? `
      <div class="pc-flora-row">
        ${floraHere.map(a => {
          const img = a.imageCard || a.image || a.img || "";
          if (!img) return "";
          return `
            <button class="pc-flora" data-flora="${a.id}" aria-label="${a.name || ""}">
              <img src="${img}" class="pc-person-img" alt="">
            </button>
          `;
        }).join("")}
      </div>
    `
    : "";

  natureEl.innerHTML = floraHtml;

  // flora click (åpne infokort)
  natureEl.querySelectorAll("[data-flora]").forEach(btn => {
    btn.onclick = () => {
      const a = FLORA_LIST.find(x => String(x?.id || "").trim() === String(btn.dataset.flora || "").trim());
      if (a && typeof window.showFloraPopup === "function") window.showFloraPopup(a);
    };
  });
}

// nature icon preview (første flora med bilde)
if (natureIcon) {
  const f0 = floraHere.find(a => (a.imageCard || a.image || a.img));
  const img = f0 ? (f0.imageCard || f0.image || f0.img || "") : "";
  natureIcon.innerHTML = img
    ? `<img src="${img}" class="pc-person-img" alt="">`
    : "";
}


// --- BADGES LIST (foreløpig tom) ---
// --- BADGES LIST + BADGES ICON ---
if (badgesEl) {
  // Robust: støtter badges fra RELATIONS (REL_BY_PLACE), og fra place-felter/tags
  const BADGES_LIST =
    (typeof BADGES !== "undefined" && Array.isArray(BADGES)) ? BADGES :
    (Array.isArray(window.BADGES) ? window.BADGES : []);

  const rels = (window.REL_BY_PLACE && window.REL_BY_PLACE[place.id]) ? window.REL_BY_PLACE[place.id] : [];

  // 1) samle badge-id'er fra relasjoner + place
  let badgeIds = [];

  // a) RELATIONS → badge/merke-felt (flere mulige navn, så vi er kompatible)
  for (const r of rels) {
    const id =
      r?.badge || r?.badge_id || r?.badgeId ||
      r?.merke || r?.merke_id || r?.merkeId;
    if (id) badgeIds.push(String(id).trim());
  }

  // b) place → eksplisitte felt (hvis de finnes)
  const placeArrays = [
    place.badges, place.badgeIds, place.merker, place.merkeIds
  ];
  for (const arr of placeArrays) {
    if (Array.isArray(arr)) badgeIds.push(...arr.map(x => String(x).trim()));
  }

  // c) fallback: category/tags, men kun hvis de matcher faktiske badge-id'er
  const allBadgeIds = new Set(BADGES_LIST.map(b => String(b.id).trim()));
  if (place.category && allBadgeIds.has(String(place.category).trim())) badgeIds.push(String(place.category).trim());
  if (Array.isArray(place.tags)) {
    for (const t of place.tags) {
      const id = String(t).trim();
      if (allBadgeIds.has(id)) badgeIds.push(id);
    }
  }

  // dedupe
  badgeIds = [...new Set(badgeIds)];

  // 2) slå opp og render
  const badges = badgeIds
    .map(id => BADGES_LIST.find(b => String(b.id).trim() === String(id).trim()))
    .filter(Boolean);

  badgesEl.innerHTML = badges.map(b => `
    <button class="pc-badge" data-badge="${b.id}">
      <img src="${b.image || b.icon || ""}" class="pc-person-img" alt="">
      <span>${b.name || b.title || b.id}</span>
    </button>
  `).join("");

  // 3) ikon-preview (første badge med bilde)
  if (badgesIcon) {
    const b0 = badges.find(b => (b.image || b.icon));
    const img = b0 ? (b0.image || b0.icon || "") : "";
    badgesIcon.innerHTML = img ? `<img src="${img}" class="pc-person-img" alt="">` : "";
  }

  
}  // --- Mer info ---
  if (btnInfo) btnInfo.onclick = () => window.showPlacePopup?.(place);

  // --- Quiz (ny motor) ---
  if (btnQuiz) {
    btnQuiz.onclick = () => {
      if (window.QuizEngine && typeof window.QuizEngine.start === "function") {
        window.QuizEngine.start(place.id);
      } else {
        window.showToast?.("Quiz-modul ikke lastet");
      }
    };
  }

  // --- Rute ---
  if (btnRoute) {
    btnRoute.onclick = () => {
      if (typeof window.showNavRouteToPlace === "function") return window.showNavRouteToPlace(place);
      if (typeof window.showRouteTo === "function") return window.showRouteTo(place);
      window.showToast?.("Rute-funksjon ikke lastet");
    };
  }

  // --- Notat ---
  if (btnNote && typeof window.handlePlaceNote === "function") {
    btnNote.onclick = () => window.handlePlaceNote(place);
  }

  // --- Observasjon ---
  if (btnObs) {
    btnObs.onclick = () => {
      if (!window.HGObservations || typeof window.HGObservations.start !== "function") {
        window.showToast?.("Observasjoner er ikke lastet");
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
        lensId: "by_byliv"
      });
    };
  }

  // --- UNLOCK GATE: oppdater knapp basert på posisjon (stabil, ingen blinking) ---
  let _unlockTimer = null;
  let _lastUnlockText = null;
  let _lastUnlockDisabled = null;

  function setUnlockUI(disabled, text) {
    if (!btnUnlock) return;

    // Ikke skriv til DOM hvis det ikke endrer seg (hindrer "blink")
    if (_lastUnlockDisabled === disabled && _lastUnlockText === text) return;

    _lastUnlockDisabled = disabled;
    _lastUnlockText = text;

    btnUnlock.disabled = disabled;
    btnUnlock.textContent = text;
  }

  function updateUnlockUI() {
    if (!btnUnlock) return;

    const isUnlocked = !!(window.visited && window.visited[place.id]);

    // 1) Allerede låst opp: alltid stabilt
    if (isUnlocked) {
      setUnlockUI(true, "Låst opp ✅");
      return;
    }

    // 2) TEST_MODE: aldri "gå nærmere" — bare la knappen være aktiv
    if (window.TEST_MODE) {
      setUnlockUI(false, "Lås opp (test)");
      return;
    }

    // 3) Live gate
    const gate = canUnlockPlaceNow(place);

    if (!gate.ok) {
      if (gate.reason === "no_pos") {
        setUnlockUI(true, "Aktiver posisjon");
        return;
      }

      if (gate.d != null) {
        const left = Math.max(0, Math.ceil(gate.d - gate.r));
        setUnlockUI(true, `Gå nærmere (${left} m)`);
        return;
      }

      setUnlockUI(true, "Gå nærmere");
      return;
    }

    // Innenfor radius
    setUnlockUI(false, "Lås opp");
  }

  updateUnlockUI();
  _unlockTimer = window.TEST_MODE ? null : setInterval(updateUnlockUI, 1200);

  // --- Lås opp (REELL: gate-check også i onclick) ---
  if (btnUnlock) {
    btnUnlock.onclick = () => {
      if (window.visited && window.visited[place.id]) {
        window.showToast?.("Allerede låst opp");
        return;
      }

      // Reell sperre (bypass i TEST_MODE)
      const gate = canUnlockPlaceNow(place);
      if (!gate.ok) {
        if (gate.reason === "no_pos") {
          window.showToast?.("Aktiver posisjon for å låse opp");
          return;
        }
        const left = gate.d != null ? Math.max(0, Math.ceil(gate.d - gate.r)) : null;
        window.showToast?.(left != null ? `Gå nærmere: ${left} m igjen` : "Gå nærmere for å låse opp");
        return;
      }

      // visited
      window.visited = window.visited || {};
      window.visited[place.id] = true;
      if (typeof window.saveVisited === "function") window.saveVisited();

      // markers
      if (window.HGMap) {
        window.HGMap.setVisited(window.visited);
        window.HGMap.refreshMarkers();
      } else if (typeof window.drawPlaceMarkers === "function") {
        window.drawPlaceMarkers();
      }

      if (typeof window.pulseMarker === "function") {
        window.pulseMarker(place.lat, place.lon);
      }

      // merits
      const badgeId = String(place.badgeId || place.categoryId || "").trim();
       if (badgeId) {
        window.merits = window.merits || {};
        window.merits[badgeId] = window.merits[badgeId] || { points: 0 };
        window.merits[badgeId].points++;
       if (typeof window.saveMerits === "function") window.saveMerits();
       if (typeof window.updateMeritLevel === "function") window.updateMeritLevel(badgeId, window.merits[badgeId].points);
      }

      window.showToast?.(`Låst opp: ${place.name} ✅`);
      window.dispatchEvent(new Event("updateProfile"));

      // oppdater UI umiddelbart
      updateUnlockUI();
    };
  }

  // --- Stop interval når du lukker kortet ---
  if (btnClose) {
    const prev = btnClose.onclick;
    btnClose.onclick = (e) => {
      if (_unlockTimer) { clearInterval(_unlockTimer); _unlockTimer = null; }
      if (typeof prev === "function") prev.call(btnClose, e);
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

  const relPlaces = getPlacesForPerson(person.id);
let place = relPlaces.length ? relPlaces[0] : null;

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
