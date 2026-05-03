// ============================================================
// 5. PLACE CARD (det store kortpanelet) — REN SAMLET VERSJON
// ============================================================
window.openPlaceCard = async function (place) {
  if (!place) return;
  const tt = (key, fallback) => window.HG_I18N?.t?.(key, fallback) || fallback;

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
const brandsIcon          = document.getElementById("pcBrandsIcon");
const leksikonIcon        = document.getElementById("pcLeksikonIcon");
const routesIcon          = document.getElementById("pcRoutesIcon");
  
card.dataset.currentPlaceId = String(place.id || "").trim();
  
const iconsWrap = card ? card.querySelector(".pc-icons-quad") : null;

const peopleEl          = document.getElementById("pcPeopleList");
const natureEl          = document.getElementById("pcNatureList");
const badgesEl          = document.getElementById("pcBadgesList");
const storiesEl         = document.getElementById("pcStoriesList");
const wonderkammerEl    = document.getElementById("pcWonderkammerList");
const civicationStoreEl = document.getElementById("pcCivicationStoreList");
const brandsEl          = document.getElementById("pcBrandsList");
const leksikonEl        = document.getElementById("pcLeksikonList");
const routesEl          = document.getElementById("pcRoutesList");

const eventsBox         = document.getElementById("pcEventsBox");
const addEventBtn       = document.getElementById("pcAddEvent");
  
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
    brandsEl?.classList.remove("is-open");
    leksikonEl?.classList.remove("is-open");
    routesEl?.classList.remove("is-open");
  };

  const bindRoundPopup = (iconEl, listEl, title, kind) => {
  iconEl?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    closeAllLists();

    const currentPlaceId = String(card?.dataset?.currentPlaceId || "").trim();
    const currentPlace = (Array.isArray(window.PLACES) ? window.PLACES : []).find(
      p => String(p?.id || "").trim() === currentPlaceId
    ) || place;

    const html = (listEl && listEl.innerHTML && listEl.innerHTML.trim())
      ? listEl.innerHTML
      : `<div class="pc-empty">Ingen innhold ennå</div>`;

    if (typeof window.showPlaceCardRoundPopup === "function") {
      window.showPlaceCardRoundPopup({
        title,
        subtitle: currentPlace?.name || "",
        html,
        place: currentPlace,
        kind
      });
    }
  });
};

iconsWrap?.addEventListener("click", (e) => {
  e.stopPropagation();
});

bindRoundPopup(peopleIcon, peopleEl, "People", "people");
bindRoundPopup(natureIcon, natureEl, "Nature", "nature");
bindRoundPopup(badgesIcon, badgesEl, "Badges", "badges");
bindRoundPopup(storiesIcon, storiesEl, "Stories", "stories");
bindRoundPopup(wonderkammerIcon, wonderkammerEl, "Wonderkammer", "wonderkammer");
bindRoundPopup(civicationStoreIcon, civicationStoreEl, "Civication Store", "civication");
bindRoundPopup(brandsIcon, brandsEl, "Brands", "brands");
bindRoundPopup(leksikonIcon, leksikonEl, "Leksikon", "leksikon");
bindRoundPopup(routesIcon, routesEl, "Ruter", "routes");

peopleEl?.addEventListener("click", (e) => e.stopPropagation());
natureEl?.addEventListener("click", (e) => e.stopPropagation());
badgesEl?.addEventListener("click", (e) => e.stopPropagation());
storiesEl?.addEventListener("click", (e) => e.stopPropagation());
wonderkammerEl?.addEventListener("click", (e) => e.stopPropagation());
civicationStoreEl?.addEventListener("click", (e) => e.stopPropagation());
brandsEl?.addEventListener("click", (e) => e.stopPropagation());
leksikonEl?.addEventListener("click", (e) => e.stopPropagation());
routesEl?.addEventListener("click", (e) => e.stopPropagation());
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
  setPcIcon(btnInfo,  "ℹ️", tt("ui.place.moreInfo", "Mer info"));
  setPcText(btnQuiz,  tt("ui.place.takeQuiz", "Ta quiz"));
  setPcText(btnRoute, tt("ui.place.route", "Rute"));
  setPcIcon(btnObs,   "👁️", tt("ui.place.observe", "Observer"));
  setPcIcon(btnNote,  "📝", tt("ui.place.note", "Notat"));
  setPcIcon(btnClose, "✕",  tt("ui.quiz.close", "Lukk"));
} else {
  setPcText(btnInfo,  tt("ui.place.moreInfo", "Mer info"));
  setPcText(btnQuiz,  tt("ui.place.takeQuiz", "Ta quiz"));
  // btnUnlock settes lenger nede av unlock-UI – la den være
  setPcText(btnRoute, tt("ui.place.route", "Rute"));
  setPcText(btnObs,   tt("ui.place.observe", "Observer"));
  setPcText(btnNote,  tt("ui.place.note", "Notat"));
  setPcText(btnClose, tt("ui.quiz.close", "Lukk"));
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
    if (pos && typeof window.distMeters === "function") {
      const getTargets = (typeof window.getPlaceDistanceTargets === "function")
        ? window.getPlaceDistanceTargets
        : null;
      const targets = getTargets ? getTargets(place) : [{ lat: place.lat, lon: place.lon }];
      let best = Infinity;
      for (const target of targets) {
        const d = window.distMeters(pos, { lat: target.lat, lon: target.lon });
        if (Number.isFinite(d) && d < best) best = d;
      }
      if (Number.isFinite(best)) place._d = best;
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

  // Hvis flora ikke er lastet globalt ennå: last via DataHub og cache på window.FLORA
  if (!FLORA_LIST.length && window.DataHub?.loadNature) {
    try {
      await window.DataHub.loadNature();
      if (Array.isArray(window.FLORA)) FLORA_LIST = window.FLORA;
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
  const popupPersons = Array.isArray(persons) ? persons : [];
  const personIdsInList = new Set(popupPersons.map(p => String(p?.id || "").trim()).filter(Boolean));

  const relationPeopleById = new Map();
  const relationTextRows = [];

  const placeRels = (typeof getRelationsForPlace === "function") ? getRelationsForPlace(place.id) : [];
  const curatedPlaceRels = (typeof filterCuratedRels === "function") ? filterCuratedRels(placeRels) : placeRels;

  curatedPlaceRels.forEach(r => {
    const personIds = (typeof getPersonIdsFromRel === "function")
      ? getPersonIdsFromRel(r)
      : [];

    let hadKnownPerson = false;

    personIds.forEach(pid => {
      const id = String(pid || "").trim();
      if (!id) return;

      const personObj = PEOPLE_LIST.find(p => String(p?.id || "").trim() === id);
      if (personObj) {
        hadKnownPerson = true;
        if (!personIdsInList.has(id)) {
          relationPeopleById.set(id, personObj);
        }
      }
    });

    if (!hadKnownPerson) {
      const type = String(r?.type || r?.rel || r?.kind || "relasjon").trim();
      const why = String(r?.why || r?.reason || r?.desc || r?.note || "").trim();
      const label = String(r?.label || r?.title || r?.name || "").trim();
      const text = [type, label, why].filter(Boolean).join(" – ");
      if (text) relationTextRows.push(text);
    }
  });

  const relationPeople = [...relationPeopleById.values()];
  const uniqueRelationTexts = [...new Set(relationTextRows)];
  const allPeopleRows = [...popupPersons, ...relationPeople];

  const peopleHtml = allPeopleRows
    .map(p => {
      const personDesc = String(p.popupdesc || p.desc || "").trim();

      return `
        <button class="pc-person" data-person="${p.id}">
          <img src="${p.image}" class="pc-person-img" alt="">
          <div class="pc-person-meta">
            <div class="pc-person-name-row">
              <span class="pc-person-name">${p.name || ""}</span>
              ${p.year ? `<span class="pc-person-year">${p.year}</span>` : ""}
            </div>
            ${personDesc ? `<div class="pc-person-desc">${personDesc}</div>` : ""}
          </div>
        </button>
      `;
    })
    .join("");

  const relationTextHtml = uniqueRelationTexts.length
    ? `
      <div class="pc-people-reltext">
        ${uniqueRelationTexts.map(t => `<div class="pc-rel-text">${t}</div>`).join("")}
      </div>
    `
    : "";

  peopleEl.innerHTML =
    (peopleHtml || relationTextHtml)
      ? `${peopleHtml}${relationTextHtml}`
      : `<div class="pc-empty">Ingen personer ennå</div>`;

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


function getBadgeForPlace(place, badgesSource) {
  const badges = Array.isArray(badgesSource)
    ? badgesSource
    : ((typeof BADGES !== "undefined" && Array.isArray(BADGES)) ? BADGES : (Array.isArray(window.BADGES) ? window.BADGES : []));

  const categoryId = String(place?.category || "").trim();
  if (!categoryId || !badges.length) return null;

  return badges.find(b => String(b?.id || "").trim() === categoryId) || null;
}

function formatSubcategoryLabel(rawValue) {
  const raw = String(rawValue || "").trim();
  if (!raw) return "";
  return raw
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
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

  const placeBadge = getBadgeForPlace(place, BADGES_LIST);
  const badgeSubcategories = Array.isArray(placeBadge?.sub) ? placeBadge.sub : [];

  badgesEl.innerHTML = placeBadge
    ? `
      <div class="pc-badge-header">
        <strong>${placeBadge.name || placeBadge.title || placeBadge.id || "Badge"}</strong>
      </div>
      ${
        badgeSubcategories.length
          ? badgeSubcategories.map(sub => `
            <div class="pc-badge">
              <span>${formatSubcategoryLabel(sub)}</span>
            </div>
          `).join("")
          : `<div class="pc-empty">Ingen underkategorier definert for ${placeBadge.name || placeBadge.id}</div>`
      }
    `
    : `<div class="pc-empty">Badges.json mangler badge for category: ${String(place?.category || "ukjent").trim() || "ukjent"}</div>`;

  if (badgesIcon) {
    const img = placeBadge ? (placeBadge.image || placeBadge.icon || "") : "";
    if (img) {
      const label = placeBadge?.name || placeBadge?.title || placeBadge?.id || "Badge";
      badgesIcon.innerHTML = `<img src="${img}" class="pc-person-img" alt="${label}" title="${label}">`;
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

  wonderkammerEl.innerHTML =
    wkEntriesHtml || `<div class="pc-empty">Ingen Wonderkammer-koblinger ennå</div>`;

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

  const wkCount = wonderkammerEl.querySelectorAll("[data-wk]").length || 0;

  setRoundLabel(wonderkammerIcon, "🗃️", wkCount);
}

// --- CIVICATION STORE LIST + ICON ---
if (civicationStoreEl) {
  const rawStoreItems = [
    ...(Array.isArray(window.CIVICATION_STORE_BY_PLACE?.[place.id]) ? window.CIVICATION_STORE_BY_PLACE[place.id] : []),
    ...(Array.isArray(place.civication_store) ? place.civication_store : []),
    ...(Array.isArray(place.civicationStore) ? place.civicationStore : []),
    ...(Array.isArray(place.civication_items) ? place.civication_items : []),
    ...(Array.isArray(place.civicationItems) ? place.civicationItems : [])
  ];

  const seenStore = new Set();
  const storeItems = rawStoreItems
    .map((item, i) => {
      if (typeof item === "string") {
        return {
          id: item,
          label: item,
          image: ""
        };
      }

      return {
        id: String(item?.id ?? item?.slug ?? item?.key ?? `civi_${i}`).trim(),
        label: String(item?.title ?? item?.name ?? item?.label ?? item?.id ?? `Objekt ${i + 1}`).trim(),
        image: String(item?.image ?? item?.icon ?? "").trim()
      };
    })
    .filter(item => item.id && item.label)
    .filter(item => {
      if (seenStore.has(item.id)) return false;
      seenStore.add(item.id);
      return true;
    });

  civicationStoreEl.innerHTML = storeItems.length
    ? storeItems.map(item => `
        <button class="pc-civi-entry" data-civi-store="${item.id}">
          ${item.image ? `<img src="${item.image}" class="pc-person-img" alt="">` : `<span class="pc-civi-emoji">🛒</span>`}
          <span class="pc-civi-entry-title">${item.label}</span>
        </button>
      `).join("")
    : `<div class="pc-empty">Ingen Civication-objekter ennå</div>`;

  civicationStoreEl.querySelectorAll("[data-civi-store]").forEach(btn => {
    btn.onclick = () => {
      const id = String(btn.dataset.civiStore || "").trim();
      if (!id) return;

      if (window.CivicationStore && typeof window.CivicationStore.openEntry === "function") {
        window.CivicationStore.openEntry(id, place);
      } else if (typeof window.openCivicationStoreEntry === "function") {
        window.openCivicationStoreEntry(id, place);
      } else {
        window.showToast?.("Civication Store-handler ikke lastet");
      }
    };
  });

  setRoundLabel(civicationStoreIcon, "🛒", storeItems.length);
}

// --- BRANDS LIST + BRANDS ICON ---
if (brandsEl) {
  const rawBrands = [
    ...(Array.isArray(window.BRANDS_BY_PLACE?.[place.id]) ? window.BRANDS_BY_PLACE[place.id] : []),
    ...(Array.isArray(place.brands) ? place.brands : []),
    ...(Array.isArray(place.brand_ids) ? place.brand_ids : [])
  ];

const seenBrands = new Set();

const brands = rawBrands
  .map((item, i) => {
    if (typeof item === "string") {
      const resolved = window.HGBrands?.getById?.(item);
      return {
        id: item,
        label: resolved?.name || item,
        logo: resolved?.logo || ""
      };
    }

    return {
      id: String(item?.id ?? item?.slug ?? `brand_${i}`).trim(),
      label: String(item?.title ?? item?.name ?? item?.label ?? item?.id ?? `Brand ${i + 1}`).trim(),
      logo: String(item?.logo ?? item?.image ?? item?.icon ?? "").trim()
    };
  })
  .filter(item => item.id && item.label)
  .filter(item => {
    if (seenBrands.has(item.id)) return false;
    seenBrands.add(item.id);
    return true;
  });

  brandsEl.innerHTML = brands.length
  ? brands.map(item => `
      <button class="pc-brand-entry" data-brand="${item.id}">
        ${item.logo ? `<img src="${item.logo}" class="pc-person-img" alt="">` : `<span class="pc-brand-emoji">🏷️</span>`}
        <span class="pc-brand-entry-title">${item.label}</span>
      </button>
    `).join("")
  : `<div class="pc-empty">Ingen brands ennå</div>`;

const b0 = brands.find(b => b.logo);
if (b0?.logo) {
  brandsIcon.innerHTML = `<img src="${b0.logo}" class="pc-person-img" alt="">`;
} else {
  setRoundLabel(brandsIcon, "🏷️", brands.length);
}
}

// --- EVENTS BOX (ikke runding) ---
if (eventsBox) {
  const rawEvents = [
    ...(Array.isArray(window.HGEvents?.getByPlace?.(place.id)) ? window.HGEvents.getByPlace(place.id) : []),
    ...(Array.isArray(place.events) ? place.events : [])
  ];

  const events = rawEvents
    .map((evt, i) => ({
      id: String(evt?.id ?? `evt_${i}`).trim(),
      title: String(evt?.title ?? evt?.name ?? "Event").trim(),
      meta: String(evt?.start ?? evt?.date ?? evt?.time ?? "").trim(),
      url: String(evt?.url ?? evt?.link ?? "").trim()
    }))
    .filter(evt => evt.title);

  const head = `
    <div class="pc-events-head">
      <span class="pc-events-title">På stedet</span>
      <button id="pcAddEvent" class="pc-events-add" type="button" aria-label="Legg til">＋</button>
    </div>
  `;

  const body = events.length
    ? `
      <div class="pc-events-list">
        ${events.slice(0, 4).map(evt => `
          <a class="pc-event-entry" href="${evt.url || "#"}" ${evt.url ? `target="_blank" rel="noopener"` : ""}>
            <span class="pc-event-entry-title">${evt.title}</span>
            ${evt.meta ? `<span class="pc-event-entry-meta">${evt.meta}</span>` : ""}
          </a>
        `).join("")}
      </div>
    `
    : `<div class="pc-empty">Ingen events ennå</div>`;

  eventsBox.innerHTML = head + body;

  const addBtn = document.getElementById("pcAddEvent");
  if (addBtn) {
    addBtn.onclick = () => {
      window.showToast?.("Event-generator / event-innsending kommer her");
    };
  }
}

// --- LEKSIKON LIST + LEKSIKON ICON ---
if (leksikonEl) {
  const leksikonPath = `/leksikon/${String(place.category || "by").trim()}/${String(place.id || "").trim()}.html`;

  leksikonEl.innerHTML = `
    <a class="pc-leksikon-entry" href="${leksikonPath}" target="_blank" rel="noopener">
      <span class="pc-leksikon-entry-title">Åpne leksikon</span>
      <span class="pc-leksikon-entry-meta">${place.name}</span>
    </a>
  `;

  setRoundLabel(leksikonIcon, "📚", 1);
}

// --- ROUTES LIST + ROUTES ICON ---
if (routesEl) {
  const allRoutes = (window.HGRoutes?.load ? await window.HGRoutes.load() : (Array.isArray(window.ROUTES) ? window.ROUTES : [])) || [];
  const placeRoutes = allRoutes.filter(route =>
    Array.isArray(route?.stops) && route.stops.some(stop => String(stop?.placeId || "").trim() === String(place.id || "").trim())
  );

  routesEl.innerHTML = placeRoutes.length
    ? placeRoutes.map(route => `
        <button class="pc-route-entry" data-route="${route.id}">
          <span class="pc-route-entry-title">${route.title || route.name || route.id}</span>
          ${Array.isArray(route.stops) ? `<span class="pc-route-entry-meta">${route.stops.length} stopp</span>` : ""}
        </button>
      `).join("")
    : `<div class="pc-empty">Ingen ruter ennå</div>`;

  routesEl.querySelectorAll("[data-route]").forEach(btn => {
    btn.onclick = () => {
      const id = String(btn.dataset.route || "").trim();
      if (!id) return;
      const route = placeRoutes.find(r => String(r.id || "").trim() === id);
      const stopIndex = Array.isArray(route?.stops)
        ? route.stops.findIndex(s => String(s?.placeId || "").trim() === String(place.id || "").trim())
        : -1;

      if (typeof window.showRouteOverlay === "function") {
        window.showRouteOverlay(id, stopIndex >= 0 ? stopIndex : 0);
      } else {
        window.showToast?.("Rute-funksjon ikke lastet");
      }
    };
  });

  setRoundLabel(routesIcon, "🗺️", placeRoutes.length);
}


  
// --- Mer info ---
  
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

// --- UNLOCK GATE ---
let _unlockTimer = null;
let _lastUnlockText = null;
let _lastUnlockDisabled = null;

function setUnlockUI(disabled, text) {
  if (!btnUnlock) return;
  if (_lastUnlockDisabled === disabled && _lastUnlockText === text) return;
  _lastUnlockDisabled = disabled;
  _lastUnlockText = text;
  btnUnlock.disabled = disabled;
  btnUnlock.textContent = text;
}

function updateUnlockUI() {
  if (!btnUnlock) return;

  const isUnlocked = !!(window.visited && window.visited[place.id]);

  if (isUnlocked) {
    setUnlockUI(true, `${tt("ui.unlock.unlocked", "Låst opp")} ✅`);
    return;
  }

  if (window.TEST_MODE) {
    setUnlockUI(false, `${tt("ui.unlock.locked", "Lås opp")} (test)`);
    return;
  }

  const gate = canUnlockPlaceNow(place);

  if (!gate.ok) {
    if (gate.reason === "no_pos") {
      setUnlockUI(true, tt("ui.position.loading", "Henter posisjon…"));
      return;
    }

    if (gate.d != null) {
      const left = Math.max(0, Math.ceil(gate.d - gate.r));
      setUnlockUI(true, `${tt("ui.unlock.goCloser", "Gå nærmere")} (${left} m)`);
      return;
    }

    setUnlockUI(true, tt("ui.unlock.goCloser", "Gå nærmere"));
    return;
  }

  setUnlockUI(false, tt("ui.unlock.locked", "Lås opp"));
}

updateUnlockUI();
_unlockTimer = window.TEST_MODE ? null : setInterval(updateUnlockUI, 1200);

if (btnUnlock) {
  btnUnlock.onclick = () => {
    if (window.visited && window.visited[place.id]) {
      window.showToast?.("Allerede låst opp");
      return;
    }

    const gate = canUnlockPlaceNow(place);
    if (!gate.ok) {
      if (gate.reason === "no_pos") {
        window.showToast?.(`${tt("ui.position.loading", "Henter posisjon…")} (${tt("ui.place.unlock", "Lås opp")})`);
        return;
      }
      const left = gate.d != null ? Math.max(0, Math.ceil(gate.d - gate.r)) : null;
      window.showToast?.(left != null ? `${tt("ui.unlock.goCloser", "Gå nærmere")}: ${left} m` : `${tt("ui.unlock.goCloser", "Gå nærmere")} (${tt("ui.place.unlock", "Lås opp")})`);
      return;
    }

    window.visited = window.visited || {};
    window.visited[place.id] = true;
    if (typeof window.saveVisited === "function") window.saveVisited();

    if (window.HGMap) {
      window.HGMap.setVisited(window.visited);
      window.HGMap.refreshMarkers();
    } else if (typeof window.drawPlaceMarkers === "function") {
      window.drawPlaceMarkers();
    }

    if (typeof window.pulseMarker === "function") {
      window.pulseMarker(place.lat, place.lon);
    }

    const badgeId = String(place.badgeId || place.categoryId || "").trim();
    if (badgeId) {
      window.merits = window.merits || {};
      window.merits[badgeId] = window.merits[badgeId] || { points: 0 };
      window.merits[badgeId].points++;
      if (typeof window.saveMerits === "function") window.saveMerits();
      if (typeof window.updateMeritLevel === "function") {
        window.updateMeritLevel(badgeId, window.merits[badgeId].points);
      }
    }

    window.showToast?.(`Låst opp: ${place.name} ✅`);
    window.dispatchEvent(new Event("updateProfile"));
    updateUnlockUI();
  };
}

if (btnClose) {
  const prev = btnClose.onclick;

  btnClose.onclick = (e) => {
    if (_unlockTimer) {
      clearInterval(_unlockTimer);
      _unlockTimer = null;
    }

    if (typeof window.collapsePlaceCard === "function") {
      window.collapsePlaceCard();
      return;
    }

    if (typeof prev === "function") prev.call(btnClose, e);
  };
}

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

function requestMapResize() {}

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
}

function togglePlaceCard() {
  isPlaceCardCollapsed() ? expandPlaceCard() : collapsePlaceCard();
}

function initPlaceCardCollapse() {
  const pc = getPlaceCardEl();
  if (!pc) return;

  let collapsed = false;
  try {
    collapsed = (localStorage.getItem("hg_placecard_collapsed_v1") === "1");
  } catch {}

  if (collapsed) collapsePlaceCard();
  else expandPlaceCard();

  if (pc.dataset.pcCollapseBound === "1") return;
  pc.dataset.pcCollapseBound = "1";

  const btn = document.getElementById("pcCollapseBtn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePlaceCard();
    });
  }

  const expandBtn = document.getElementById("pcExpandBtn");
  if (expandBtn) {
    expandBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      expandPlaceCard();
    });
  }

  const mini = document.getElementById("pcMini");
  if (mini) {
    mini.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      expandPlaceCard();
    });
  }
}

window.initPlaceCardCollapse = initPlaceCardCollapse;
window.collapsePlaceCard = collapsePlaceCard;
window.expandPlaceCard = expandPlaceCard;
window.togglePlaceCard = togglePlaceCard;
window.isPlaceCardCollapsed = isPlaceCardCollapsed;

window.addEventListener("hg:langchange", () => {
  const card = document.getElementById("placeCard");
  const placeId = String(card?.dataset?.currentPlaceId || "").trim();
  if (!placeId || !Array.isArray(window.PLACES)) return;
  const place = window.PLACES.find((p) => String(p?.id || "").trim() === placeId);
  if (place && typeof window.openPlaceCard === "function") {
    window.openPlaceCard(place);
  }
});
