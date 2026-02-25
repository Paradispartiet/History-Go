/* ============================================================
   Civication Home Module v1
   - Canonical storage: civi_home_v1
   - Ingen write()
   - Kun home (ikke house)
   ============================================================ */

(function () {

  const KEY = "civi_home_v1";
  const CAPITAL_KEY = "hg_capital_v1";
  const QUIZ_HISTORY_KEY = "quiz_history";
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
    const history =
      JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY) || "[]");

    if (!Array.isArray(history)) return false;

    return history.some(q =>
      String(q.placeId || "").trim() === String(placeId).trim()
    );
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

    window.dispatchEvent(new Event("civi:homeChanged"));

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

    window.dispatchEvent(new Event("civi:homeChanged"));

    return true;
  }

  // ----------------------------------------------------------
  // District Logic
  // ----------------------------------------------------------

  function canPurchaseDistrict(districtId) {

    const district = DISTRICTS[districtId];
    if (!district) return false;

    const capital = getCapital();
    if ((capital.economic || 0) < district.baseCost) return false;

    const merits =
      JSON.parse(localStorage.getItem(MERITS_KEY) || "{}");

    for (const cat in district.quizRequirements) {
      const needed = district.quizRequirements[cat];
      const points = merits[cat]?.points || 0;
      if (points < needed) return false;
    }

    return true;
  }

  function purchaseDistrict(districtId) {

    if (!canPurchaseDistrict(districtId)) return false;

    const state = ensure(load());

    state.home.status = "settled";
    state.home.district = districtId;
    state.home.level = 1;

    save(state);

    window.dispatchEvent(new Event("civi:homeChanged"));

    return true;
  }

  function moveDistrict(newId) {

    const state = ensure(load());

    if (state.home.status !== "settled") return false;
    if (state.home.district === newId) return false;
    if (!canPurchaseDistrict(newId)) return false;

    state.home.district = newId;
    state.home.moveCount =
      (state.home.moveCount || 0) + 1;

    save(state);

    if (window.CivicationPsyche?.updateIntegrity) {
      window.CivicationPsyche.updateIntegrity(-5);
    }

    window.dispatchEvent(new Event("civi:homeChanged"));

    return true;
  }

  // ----------------------------------------------------------
  // District Definitions
  // ----------------------------------------------------------

  const DISTRICTS = {

    frogner: {
      id: "frogner",
      name: "Frogner",
      baseCost: 70,
      quizRequirements: {
        naeringsliv: 2,
        kunst: 1
      },
      modifiers: {
        visibility: 10,
        integrity: -5,
        autonomy: 5
      }
    },

    grunerlokka: {
      id: "grunerlokka",
      name: "Grünerløkka",
      baseCost: 45,
      quizRequirements: {
        subkultur: 2,
        kunst: 1
      },
      modifiers: {
        cultural: 10,
        visibility: 5,
        autonomy: 5
      }
    },

    sagene: {
      id: "sagene",
      name: "Sagene",
      baseCost: 40,
      quizRequirements: {
        historie: 2,
        by: 1
      },
      modifiers: {
        integrity: 10,
        autonomy: 5
      }
    },

    ullern: {
      id: "ullern",
      name: "Ullern",
      baseCost: 65,
      quizRequirements: {
        naeringsliv: 2
      },
      modifiers: {
        economic: 10,
        visibility: 5
      }
    },

    sondre_nordstrand: {
      id: "sondre_nordstrand",
      name: "Søndre Nordstrand",
      baseCost: 30,
      quizRequirements: {
        natur: 1
      },
      modifiers: {
        integrity: 10,
        visibility: -5,
        autonomy: 5
      }
    },

    sentrum: {
      id: "sentrum",
      name: "Sentrum",
      baseCost: 80,
      quizRequirements: {
        politikk: 2,
        naeringsliv: 2
      },
      modifiers: {
        visibility: 15,
        autonomy: -5
      }
    }

  };

  // ----------------------------------------------------------
  // Export
  // ----------------------------------------------------------

  window.CivicationHome = {
    getState,
    getHomeInfluence,
    purchaseHomeObject,
    sellHomeObject,
    purchaseDistrict,
    moveDistrict,
    canPurchaseDistrict,
    canPurchaseHomeObject,
    DISTRICTS
  };

})();
