// ============================================================
// 5. PLACE CARD (det store kortpanelet) — REN SAMLET VERSJON
// ============================================================
window.openPlaceCard = async function (place) {
  if (!place) return;

  // 🎓 Learning: mark seen for place-emner
   if (window.KnowledgeLearning && Array.isArray(place.emne_ids)) {
    place.emne_ids.forEach(emneId => {
     window.KnowledgeLearning.setSeen(emneId);
    });
   }

const card = document.getElementById("placeCard");
const frontImgEl = document.getElementById("pcFrontImage");
const cardImgEl  = document.getElementById("pcCardImage");
const titleEl    = document.getElementById("pcTitle");
const metaEl     = document.getElementById("pcMeta");
const descEl     = document.getElementById("pcDesc");

const peopleIcon          = document.getElementById("pcPeopleIcon");
const natureIcon          = document.getElementById("pcNatureIcon");
const badgesIcon          = document.getElementById("pcBadgesIcon");
const storiesIcon         = document.getElementById("pcStoriesIcon");
const wonderkammerIcon    = document.getElementById("pcWonderkammerIcon");
const civicationStoreIcon = document.getElementById("pcCivicationStoreIcon");

const iconsWrap = card ? card.querySelector(".pc-icons-quad") : null;

const peopleEl          = document.getElementById("pcPeopleList");
const natureEl          = document.getElementById("pcNatureList");
const badgesEl          = document.getElementById("pcBadgesList");
const storiesEl         = document.getElementById("pcStoriesList");
const wonderkammerEl    = document.getElementById("pcWonderkammerList");
const civicationStoreEl = document.getElementById("pcCivicationStoreList");

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
    storiesEl?.classList.remove("is-open");
    wonderkammerEl?.classList.remove("is-open");
    civicationStoreEl?.classList.remove("is-open");
  };

  const bindIconToggle = (iconEl, listEl) => {
    iconEl?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = !listEl?.classList.contains("is-open");
      closeAllLists();
      if (open) listEl?.classList.add("is-open");
    });
  };

  iconsWrap?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  bindIconToggle(peopleIcon, peopleEl);
  bindIconToggle(natureIcon, natureEl);
  bindIconToggle(badgesIcon, badgesEl);
  bindIconToggle(storiesIcon, storiesEl);
  bindIconToggle(wonderkammerIcon, wonderkammerEl);
  bindIconToggle(civicationStoreIcon, civicationStoreEl);

  peopleEl?.addEventListener("click", (e) => e.stopPropagation());
  natureEl?.addEventListener("click", (e) => e.stopPropagation());
  badgesEl?.addEventListener("click", (e) => e.stopPropagation());
  storiesEl?.addEventListener("click", (e) => e.stopPropagation());
  wonderkammerEl?.addEventListener("click", (e) => e.stopPropagation());
  civicationStoreEl?.addEventListener("click", (e) => e.stopPropagation());
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

const setRoundLabel = (el, emoji, count = 0) => {
  if (!el) return;
  el.innerHTML = `
    <div class="pc-round-label">
      <span class="pc-round-emoji">${emoji}</span>
      <span class="pc-round-count">${count}</span>
    </div>
  `;
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
  if (frontImgEl) frontImgEl.src = (place.image ?? place.cardImage ?? "");
  if (cardImgEl) cardImgEl.src  = (place.cardImage ?? place.image ?? "");
  // ---- MINI PREVIEW BILDE ----
  const miniImgEl = document.getElementById("pcMiniImg");
  if (miniImgEl) {
    miniImgEl.src = frontImgEl?.src || (place.image ?? "");
   }
  
  if (titleEl) titleEl.textContent = place.name || "";
  if (metaEl)  metaEl.textContent  = place.category || "";
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
  if (p0?.image) {
    peopleIcon.innerHTML = `<img src="${p0.image}" class="pc-person-img" alt="">`;
  } else {
    setRoundLabel(peopleIcon, "👥", persons.length);
  }
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
  if (img) {
    natureIcon.innerHTML = `<img src="${img}" class="pc-person-img" alt="">`;
  } else {
    setRoundLabel(natureIcon, "🌿", floraHere.length);
  }
}


// --- BADGES LIST + BADGES ICON ---
if (badgesEl) {
  const BADGES_LIST =
    (typeof BADGES !== "undefined" && Array.isArray(BADGES)) ? BADGES :
    (Array.isArray(window.BADGES) ? window.BADGES : []);

  const rels = (window.REL_BY_PLACE && window.REL_BY_PLACE[place.id]) ? window.REL_BY_PLACE[place.id] : [];

  let badgeIds = [];

  for (const r of rels) {
    const id =
      r?.badge || r?.badge_id || r?.badgeId ||
      r?.merke || r?.merke_id || r?.merkeId;
    if (id) badgeIds.push(String(id).trim());
  }

  const placeArrays = [
    place.badges, place.badgeIds, place.merker, place.merkeIds
  ];

  for (const arr of placeArrays) {
    if (Array.isArray(arr)) badgeIds.push(...arr.map(x => String(x).trim()));
  }

  const allBadgeIds = new Set(BADGES_LIST.map(b => String(b.id).trim()));
  if (place.category && allBadgeIds.has(String(place.category).trim())) {
    badgeIds.push(String(place.category).trim());
  }

  if (Array.isArray(place.tags)) {
    for (const t of place.tags) {
      const id = String(t).trim();
      if (allBadgeIds.has(id)) badgeIds.push(id);
    }
  }

  badgeIds = [...new Set(badgeIds)];

  const badges = badgeIds
    .map(id => BADGES_LIST.find(b => String(b.id).trim() === String(id).trim()))
    .filter(Boolean);

  badgesEl.innerHTML = badges.length
    ? badges.map(b => `
        <button class="pc-badge" data-badge="${b.id}">
          <img src="${b.image || b.icon || ""}" class="pc-person-img" alt="">
          <span>${b.name || b.title || b.id}</span>
        </button>
      `).join("")
    : `<div class="pc-empty">Ingen merker ennå</div>`;

  if (badgesIcon) {
    const b0 = badges.find(b => (b.image || b.icon));
    const img = b0 ? (b0.image || b0.icon || "") : "";
    if (img) {
      badgesIcon.innerHTML = `<img src="${img}" class="pc-person-img" alt="">`;
    } else {
      setRoundLabel(badgesIcon, "🏅", badges.length);
    }
  }
}

// --- STORIES LIST + STORIES ICON ---
if (storiesEl) {
  let stories = [];

  try {
    if (window.HGStories && typeof window.HGStories.init === "function") {
      await window.HGStories.init();
      stories = window.HGStories.getByPlace(place.id) || [];
    }
  } catch (err) {
    console.warn("[stories]", err);
  }

  storiesEl.innerHTML = stories.length
    ? stories.map(st => `
        <article class="pc-story" data-story="${st.id}">
          <div class="pc-story-top">
            <span class="pc-story-type">${st.type || "story"}</span>
            ${st.year ? `<span class="pc-story-year">${st.year}</span>` : ""}
          </div>
          <div class="pc-story-title">${st.title || ""}</div>
          <div class="pc-story-text">${st.summary || st.story || ""}</div>
        </article>
      `).join("")
    : `<div class="pc-empty">Ingen historier ennå</div>`;

  setRoundLabel(storiesIcon, "📖", stories.length);
}

// --- WONDERKAMMER LIST + WONDERKAMMER ICON ---
if (wonderkammerEl) {
  const wkChambers = Array.isArray(window.WK_BY_PLACE?.[place.id])
    ? window.WK_BY_PLACE[place.id]
    : [];

  const wkEntriesHtml = wkChambers.length
    ? `
      <div class="pc-wk-chambers">
        ${wkChambers.map(c => {
          const id = String(c?.id ?? "").trim();
          const label = String(c?.title ?? c?.label ?? c?.name ?? id).trim();
          if (!id) return "";
          return `
            <button class="pc-wk-entry" data-wk="${id}">
              <span class="pc-wk-entry-title">${label}</span>
            </button>
          `;
        }).join("")}
      </div>
    `
    : "";

  const wkRelationsHtml =
    (typeof window.wonderChambersForPlace === "function")
      ? window.wonderChambersForPlace(place)
      : "";

  wonderkammerEl.innerHTML =
    (wkEntriesHtml || wkRelationsHtml)
      ? `${wkEntriesHtml}${wkRelationsHtml}`
      : `<div class="pc-empty">Ingen Wonderkammer-koblinger ennå</div>`;

  wonderkammerEl.querySelectorAll("[data-wk]").forEach(btn => {
    btn.onclick = () => {
      const id = String(btn.dataset.wk || "").trim();
      if (!id) return;

      if (window.Wonderkammer && typeof window.Wonderkammer.openEntry === "function") {
        window.Wonderkammer.openEntry(id);
      } else if (typeof window.openWonderkammerEntry === "function") {
        window.openWonderkammerEntry(id);
      } else {
        window.showToast?.("Wonderkammer-handler ikke lastet");
      }
    };
  });

  const wkCount =
    wonderkammerEl.querySelectorAll("[data-wk]").length ||
    wonderkammerEl.querySelectorAll(".hg-rel-link").length ||
    0;

  setRoundLabel(wonderkammerIcon, "🗃️", wkCount);
}

// --- CIVICATION STORE LIST + ICON ---
if (civicationStoreEl) {
  ...
  setRoundLabel(civicationStoreIcon, "🛒", storeItems.length);
  

  // --- Mer info ---
  if (btnInfo) btnInfo.onclick = () => window.showPlacePopup?.(place);
  
  // --- Quiz (ny motor) ---
  if (btnQuiz) {
    ...
  }

  ...
  requestAnimationFrame(() => {
    card.classList.remove("is-switching");
  });

  card.setAttribute("aria-hidden", "false");
  expandPlaceCard();
  };


// ============================================================
// PLACE CARD – bottom sheet bridge (engine-controlled)
// ============================================================

function setPlaceCardMiniVisible(on){
  const mini = document.getElementById("pcMini");
  if (!mini) return;
  mini.style.display = on ? "block" : "none";
  mini.setAttribute("aria-hidden", on ? "false" : "true");
}

function getPlaceCardEl() {
  return hg$("placeCard");
}

function isPlaceCardCollapsed() {
  return !!getPlaceCardEl()?.classList.contains("is-collapsed");
}

function requestMapResize(){
  requestAnimationFrame(() => {
    window.hgMap?.resize?.();
    window.HGMap?.resize?.();
    window.MAP?.resize?.();
  });
}

function collapsePlaceCard() {
  const pc = getPlaceCardEl();
  if (!pc) return;

  // Kompatibilitet: behold flagg + body-hook (hvis andre steder bruker det)
  pc.classList.add("is-collapsed");
  document.body.classList.add("pc-collapsed");

  if (window.LayerManager) {
  LayerManager.setMode(LayerManager.getMode());
}

  try { localStorage.setItem("hg_placecard_collapsed_v1", "1"); } catch {}

  setPlaceCardMiniVisible(true);

 if (window.bottomSheetController?.hide) {
  window.bottomSheetController.hide();
} else if (window.bottomSheetController?.setState) {
  window.bottomSheetController.setState("hidden");
}

  requestMapResize();
}

function expandPlaceCard() {
  const pc = getPlaceCardEl();
  if (!pc) return;

  pc.classList.remove("is-collapsed");
  document.body.classList.remove("pc-collapsed");

  if (window.LayerManager) {
  LayerManager.setMode(LayerManager.getMode());
}

  try { localStorage.setItem("hg_placecard_collapsed_v1", "0"); } catch {}

  setPlaceCardMiniVisible(false);

  if (window.bottomSheetController?.open) {
  window.bottomSheetController.open();
} else if (window.bottomSheetController?.setState) {
  window.bottomSheetController.setState("open"); // fallback
}

  requestMapResize();
}

function togglePlaceCard() {
  isPlaceCardCollapsed() ? expandPlaceCard() : collapsePlaceCard();
}

function initPlaceCardCollapse() {
  const pc = getPlaceCardEl();
  if (!pc) return;

  // default: hvis BottomSheetController finnes, start i open/hidden basert på storage
  let collapsed = false;
  try { collapsed = (localStorage.getItem("hg_placecard_collapsed_v1") === "1"); } catch {}

  if (collapsed) collapsePlaceCard();
  else expandPlaceCard();
}

// Bind 1 gang når DOM er klar
document.addEventListener("DOMContentLoaded", () => {
  initPlaceCardCollapse();

  const btn = document.getElementById("pcCollapseBtn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlaceCard();
    });
  }

  const mini = document.getElementById("pcMini");
  if (mini) {
    mini.addEventListener("click", (e) => {
      e.preventDefault();
      expandPlaceCard();
    });
  }
});

window.collapsePlaceCard = collapsePlaceCard;
window.expandPlaceCard = expandPlaceCard;
window.togglePlaceCard = togglePlaceCard;
window.isPlaceCardCollapsed = isPlaceCardCollapsed;
