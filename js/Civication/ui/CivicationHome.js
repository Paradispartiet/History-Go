/* ============================================================
   Civication Home Module v2
   - Canonical storage: civi_home_v1
   - Velgbare nabolag/distrikter fra start
   - Tre gratis startalternativer
   ============================================================ */

(function () {

  const KEY = "civi_home_v1";
  const CAPITAL_KEY = "hg_capital_v1";
  const MERITS_KEY = "merits_by_category";

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }

  function ensure(state) {

    state.home ||= {
      status: "homeless",
      district: null,
      level: 0,
      moveCount: 0
    };

    state.objects ||= [];

    return state;
  }

  function dispatchHomeChanged() {
    window.dispatchEvent(new Event("civi:homeChanged"));
    window.dispatchEvent(new Event("updateProfile"));
  }

  function getCapital() {
    try {
      return JSON.parse(localStorage.getItem(CAPITAL_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveCapital(cap) {
    try {
      localStorage.setItem(CAPITAL_KEY, JSON.stringify(cap));
      window.dispatchEvent(new Event("updateProfile"));
    } catch {}
  }

  function hasCompletedPlace(placeId) {
    const history = window.HGLearningLog?.getQuizHistory?.() ?? [];

    return history.some(q =>
      String(q.targetId || q.id || "").trim() === String(placeId).trim()
    );
  }

  function normalizeList(xs) {
    return Array.isArray(xs) ? xs.map(String).filter(Boolean) : [];
  }

  function getDistrict(districtId) {
    const key = String(districtId || "").trim();
    return key ? (DISTRICTS[key] || null) : null;
  }

  function getDistrictName(districtId) {
    const district = getDistrict(districtId);
    return district?.name || String(districtId || "");
  }

  function getCurrentDistrict() {
    const state = ensure(load());
    return getDistrict(state?.home?.district);
  }

  function getAvailableDistricts() {
    return Object.values(DISTRICTS);
  }

  function getStartDistricts() {
    return getAvailableDistricts().filter((district) => district.isStartOption === true);
  }

  function getSelectedDistrictAccess() {
    const district = getCurrentDistrict();

    if (!district) {
      return {
        id: null,
        name: null,
        housing: [],
        store: [],
        choice_tags: []
      };
    }

    return {
      id: district.id,
      name: district.name,
      housing: normalizeList(district.housing_access),
      store: normalizeList(district.store_access),
      choice_tags: normalizeList(district.choice_tags)
    };
  }

  function formatCost(district) {
    const cost = Number(district?.baseCost || 0);
    return cost <= 0 ? "Gratis" : `${cost} kapital`;
  }

  function requirementText(district) {
    const reqs = district?.quizRequirements || {};
    const entries = Object.entries(reqs);

    if (!entries.length) return "Åpent fra start";

    return entries
      .map(([cat, value]) => `${cat}: ${value}`)
      .join(" · ");
  }

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  function getState() {
    return ensure(load());
  }

  function getHomeInfluence() {
    const state = ensure(load());

    const influence = {
      economic: 0,
      cultural: 0,
      symbolic: 0,
      autonomy: 0
    };

    const district = getDistrict(state?.home?.district);
    const districtModifiers = district?.modifiers || {};

    influence.economic += Number(districtModifiers.economic || 0);
    influence.cultural += Number(districtModifiers.cultural || 0);
    influence.symbolic += Number(districtModifiers.symbolic || 0);
    influence.autonomy += Number(districtModifiers.autonomy || 0);

    for (const obj of state.objects) {
      influence.economic += obj.economic || 0;
      influence.cultural += obj.cultural || 0;
      influence.symbolic += obj.symbolic || 0;
      influence.autonomy += obj.autonomy || 0;
    }

    return influence;
  }

  // ----------------------------------------------------------
  // Purchase Object
  // ----------------------------------------------------------

  function canPurchaseHomeObject(obj) {

    if (!obj || !obj.placeId) return false;
    if (!hasCompletedPlace(obj.placeId)) return false;

    const capital = getCapital();
    if ((capital.economic || 0) < (obj.cost || 0)) return false;

    return true;
  }

  function purchaseHomeObject(obj) {

    if (!obj || !obj.id || !obj.placeId) return false;
    if (!canPurchaseHomeObject(obj)) return false;

    const capital = getCapital();
    const cost = Number(obj.cost || 0);

    capital.economic =
      Math.max(0, (capital.economic || 0) - cost);

    saveCapital(capital);

    const state = ensure(load());

    // Ikke tillat duplikat
    if (state.objects.some(o => o.id === obj.id)) return false;

    state.objects.push({
      id: obj.id,
      placeId: obj.placeId,
      unlockedAt: Date.now(),
      economic: obj.capital_effect?.economic || 0,
      cultural: obj.capital_effect?.cultural || 0,
      symbolic: obj.capital_effect?.symbolic || 0,
      autonomy: obj.autonomy || 0
    });

    save(state);
    dispatchHomeChanged();

    return true;
  }

  // ----------------------------------------------------------
  // Sell Object
  // ----------------------------------------------------------

  function sellHomeObject(objectId) {

    if (!objectId) return false;

    const state = ensure(load());
    const index = state.objects.findIndex(o => o.id === objectId);

    if (index === -1) return false;

    const originalDef =
      window.CIVI_HOME_OBJECTS?.find(o => o.id === objectId);

    const originalCost = Number(originalDef?.cost || 0);
    const refund = Math.round(originalCost * 0.7);

    state.objects.splice(index, 1);
    save(state);

    const capital = getCapital();
    capital.economic = (capital.economic || 0) + refund;
    saveCapital(capital);

    dispatchHomeChanged();

    return true;
  }

  // ----------------------------------------------------------
  // District Logic
  // ----------------------------------------------------------

  function canPurchaseDistrict(districtId) {

    const district = getDistrict(districtId);
    if (!district) return false;

    const capital = getCapital();
    if ((capital.economic || 0) < Number(district.baseCost || 0)) return false;

    const merits =
      JSON.parse(localStorage.getItem(MERITS_KEY) || "{}");

    const requirements = district.quizRequirements || {};

    for (const cat in requirements) {
      const needed = requirements[cat];
      const points = merits[cat]?.points || 0;
      if (points < needed) return false;
    }

    return true;
  }

  function purchaseDistrict(districtId) {

    const district = getDistrict(districtId);
    if (!district) return false;
    if (!canPurchaseDistrict(districtId)) return false;

    const state = ensure(load());

    state.home.status = "settled";
    state.home.district = district.id;
    state.home.level = Math.max(1, Number(state.home.level || 0));
    state.home.selectedAt = Date.now();

    save(state);
    dispatchHomeChanged();

    return true;
  }

  function moveDistrict(newId) {

    const district = getDistrict(newId);
    if (!district) return false;

    const state = ensure(load());

    if (state.home.status !== "settled") return false;
    if (state.home.district === newId) return true;
    if (!canPurchaseDistrict(newId)) return false;

    state.home.district = district.id;
    state.home.moveCount =
      (state.home.moveCount || 0) + 1;
    state.home.movedAt = Date.now();

    save(state);

    if (window.CivicationPsyche?.updateIntegrity) {
      window.CivicationPsyche.updateIntegrity(-5);
    }

    dispatchHomeChanged();

    return true;
  }

  function selectDistrict(districtId) {
    const state = ensure(load());

    if (state.home.status === "settled") {
      return moveDistrict(districtId);
    }

    return purchaseDistrict(districtId);
  }

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  function renderDistrictCard(district, currentId) {
    const isCurrent = String(currentId || "") === String(district.id || "");
    const canSelect = canPurchaseDistrict(district.id);
    const tagText = normalizeList(district.choice_tags).join(" · ");
    const classes = ["civi-district-card"];

    if (district.isStartOption) classes.push("is-start-option");
    if (isCurrent) classes.push("is-current");

    return `
      <div class="${classes.join(" ")}" style="padding:12px;border:1px solid rgba(255,255,255,0.10);border-radius:14px;background:rgba(255,255,255,0.04);">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div>
            <div style="font-weight:700;">${district.name}</div>
            <div style="font-size:0.88rem;opacity:0.78;margin-top:3px;">${district.isStartOption ? "Startnabolag" : "Låses opp senere"} · ${formatCost(district)}</div>
          </div>
          ${isCurrent ? `<span style="font-size:0.82rem;opacity:0.8;">Valgt</span>` : ""}
        </div>
        <div style="margin-top:8px;line-height:1.45;">${district.shortDesc || ""}</div>
        <div style="font-size:0.86rem;opacity:0.78;margin-top:8px;">${requirementText(district)}</div>
        ${tagText ? `<div style="font-size:0.82rem;opacity:0.7;margin-top:6px;">${tagText}</div>` : ""}
        <div style="margin-top:10px;">
          <button class="btn" data-civi-district-select="${district.id}" ${canSelect || isCurrent ? "" : "disabled"}>${isCurrent ? "Valgt" : "Velg"}</button>
        </div>
      </div>
    `;
  }

  function renderDistrictList() {
    const list = document.getElementById("districtList");
    if (!list) return;

    const state = ensure(load());
    const currentId = state?.home?.district || null;
    const start = getStartDistricts();
    const rest = getAvailableDistricts().filter((district) => district.isStartOption !== true);
    const districts = start.concat(rest);

    list.innerHTML = districts
      .map((district) => renderDistrictCard(district, currentId))
      .join("");
  }

  function renderHomeStatus() {
    const host = document.getElementById("homeStatusContent");
    if (!host) return;

    const state = ensure(load());
    const current = getDistrict(state?.home?.district);

    if (!current) {
      const startDistricts = getStartDistricts().slice(0, 3);

      host.innerHTML = `
        <div class="latest-knowledge-box">
          <div class="lk-topic">Velg nabolag</div>
          <div class="lk-category">Tre gratis alternativer fra start</div>
          <div class="lk-text">Nabolaget setter hjemfølelse, hverdag, butikktilgang og boligspor i Civication.</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">
          ${startDistricts.map((district) => renderDistrictCard(district, null)).join("")}
        </div>
        <button class="btn" data-civi-open-districts style="margin-top:12px;">Se alle nabolag</button>
      `;

      renderDistrictList();
      return;
    }

    const access = getSelectedDistrictAccess();

    host.innerHTML = `
      <div class="latest-knowledge-box">
        <div class="lk-topic">Hjem</div>
        <div class="lk-category">${current.name}</div>
        <div class="lk-text">${current.shortDesc || "Du har valgt nabolag."}</div>
      </div>
      <div style="margin-top:10px;padding:12px;border:1px solid rgba(255,255,255,0.10);border-radius:14px;background:rgba(255,255,255,0.04);">
        <div style="font-weight:700;">Boligtilgang</div>
        <div style="font-size:0.9rem;opacity:0.82;margin-top:6px;">${access.housing.length ? access.housing.join(" · ") : "Ingen egne boligtagger"}</div>
        <div style="font-size:0.9rem;opacity:0.82;margin-top:6px;">Flyttinger: ${Number(state?.home?.moveCount || 0)}</div>
        <button class="btn" data-civi-open-districts style="margin-top:10px;">Bytt nabolag</button>
      </div>
    `;

    renderDistrictList();
  }

  function openDistrictModal() {
    renderDistrictList();
    const modal = document.getElementById("districtModal");
    if (modal) modal.style.display = "flex";
  }

  function closeDistrictModal() {
    const modal = document.getElementById("districtModal");
    if (modal) modal.style.display = "none";
  }

  let handlersBound = false;

  function bindHandlers() {
    if (handlersBound) return;
    handlersBound = true;

    document.addEventListener("click", function (event) {
      const target = /** @type {HTMLElement | null} */ (event.target instanceof HTMLElement ? event.target : null);
      if (!target) return;

      const openButton = target.closest("[data-civi-open-districts]");
      if (openButton) {
        event.preventDefault();
        openDistrictModal();
        return;
      }

      const selectButton = target.closest("[data-civi-district-select]");
      if (selectButton) {
        event.preventDefault();
        const districtId = selectButton.getAttribute("data-civi-district-select");
        if (!districtId) return;
        const ok = selectDistrict(districtId);
        if (ok) closeDistrictModal();
        renderHomeStatus();
        return;
      }

      if (target.id === "closeDistrictModal") {
        event.preventDefault();
        closeDistrictModal();
      }
    });
  }

  function boot() {
    bindHandlers();
    renderHomeStatus();
  }

  // ----------------------------------------------------------
  // District Definitions
  // ----------------------------------------------------------

  const DISTRICTS = {

    grunerlokka: {
      id: "grunerlokka",
      name: "Grünerløkka",
      baseCost: 0,
      isStartOption: true,
      shortDesc: "Kreativt, sosialt og litt kantete. Bra for kultur, små steder, kollektivfølelse og byliv.",
      quizRequirements: {},
      housing_access: ["stable_home", "collective", "edge_district", "creative_collective"],
      store_access: ["home"],
      choice_tags: ["culture", "local", "community", "street"],
      modifiers: {
        cultural: 10,
        visibility: 5,
        autonomy: 5
      }
    },

    sagene: {
      id: "sagene",
      name: "Sagene",
      baseCost: 0,
      isStartOption: true,
      shortDesc: "Roligere hverdagsby med park, rutiner og nabolagsfølelse. Bra for stabilitet og hjemlig rytme.",
      quizRequirements: {},
      housing_access: ["stable_home", "quiet_district", "family_friendly"],
      store_access: ["home"],
      choice_tags: ["family", "security", "local", "budget"],
      modifiers: {
        integrity: 10,
        autonomy: 5
      }
    },

    sondre_nordstrand: {
      id: "sondre_nordstrand",
      name: "Søndre Nordstrand",
      baseCost: 0,
      isStartOption: true,
      shortDesc: "Mer plass, grønnere kanter og større avstand til sentrum. Bra for ro, natur og handlingsrom.",
      quizRequirements: {},
      housing_access: ["stable_home", "quiet_district", "green_edge"],
      store_access: ["home"],
      choice_tags: ["outdoor", "security", "family", "frugality"],
      modifiers: {
        integrity: 10,
        visibility: -5,
        autonomy: 5
      }
    },

    frogner: {
      id: "frogner",
      name: "Frogner",
      baseCost: 70,
      isStartOption: false,
      shortDesc: "Status, fasade og tung symbolsk kapital. Dyrt, synlig og sosialt kodet.",
      quizRequirements: {
        naeringsliv: 2,
        kunst: 1
      },
      housing_access: ["status_district", "central_comfort", "representational"],
      store_access: ["home", "luxury"],
      choice_tags: ["status", "luxury", "visibility"],
      modifiers: {
        visibility: 10,
        integrity: -5,
        autonomy: 5
      }
    },

    ullern: {
      id: "ullern",
      name: "Ullern",
      baseCost: 65,
      isStartOption: false,
      shortDesc: "Komfort, familieøkonomi og trygg avstand. Stabilt, men krevende å opprettholde.",
      quizRequirements: {
        naeringsliv: 2
      },
      housing_access: ["quiet_district", "family_friendly", "status_district"],
      store_access: ["home"],
      choice_tags: ["family", "security", "status"],
      modifiers: {
        economic: 10,
        visibility: 5
      }
    },

    sentrum: {
      id: "sentrum",
      name: "Sentrum",
      baseCost: 80,
      isStartOption: false,
      shortDesc: "Tett, dyrt og effektivt. Gir nærhet til alt, men også mer press og mindre ro.",
      quizRequirements: {
        politikk: 2,
        naeringsliv: 2
      },
      housing_access: ["urban_core", "high_density", "central_comfort"],
      store_access: ["home", "electronics", "coffee"],
      choice_tags: ["mobility", "status", "visibility", "process"],
      modifiers: {
        visibility: 15,
        autonomy: -5
      }
    }

  };

  // ----------------------------------------------------------
  // Export
  // ----------------------------------------------------------

  window.CivicationHome = /** @type {any} */ ({
    getState,
    getHomeInfluence,
    getDistrict,
    getDistrictName,
    getCurrentDistrict,
    getAvailableDistricts,
    getStartDistricts,
    getSelectedDistrictAccess,
    purchaseHomeObject,
    sellHomeObject,
    purchaseDistrict,
    moveDistrict,
    selectDistrict,
    canPurchaseDistrict,
    canPurchaseHomeObject,
    render: renderHomeStatus,
    boot,
    DISTRICTS
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    window.setTimeout(boot, 0);
  }

  window.addEventListener("civi:dataReady", renderHomeStatus);
  window.addEventListener("civi:booted", renderHomeStatus);
  window.addEventListener("updateProfile", renderHomeStatus);
  window.addEventListener("civi:homeChanged", renderHomeStatus);

})();