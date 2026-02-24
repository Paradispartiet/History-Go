state.home ||= {
  status: "homeless",
  district: null,
  level: 0
};

(function(){

  const KEY = "civi_home_v1";

  function load() {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function ensure(state){
    state.house ||= {
      district: "sentrum",
      style: "neutral",
      level: 1
    };

    state.objects ||= []; 
    return state;
  }

  function hasCompletedPlace(placeId) {
  const history = JSON.parse(localStorage.getItem("quiz_history") || "[]");

  return history.some(q =>
    String(q.placeId || "").trim() === String(placeId).trim()
  );
}

// ============================================================
// PURCHASE HOME OBJECT
// ============================================================

function purchaseHomeObject(obj) {
  if (!obj || !obj.id || !obj.placeId) return false;

  const quiz = getUnlockingQuiz(obj.placeId);
  if (!quiz) return false;

  const cost = Number(obj.cost || 0);

  // Hent kapital fra canonical storage
  const capital =
    JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");

  if ((capital.economic || 0) < cost) return false;

  const state = ensure(load());

  state.home ||= {
    status: "homeless",
    district: null,
    level: 0
  };

  state.objects ||= [];

  // Ikke tillat duplikat
  if (state.objects.some(o => o.id === obj.id)) return false;

  // Trekk kapital (skriv tilbake til samme kilde)
  capital.economic =
    Math.max(0, (capital.economic || 0) - cost);

  localStorage.setItem(
    "hg_capital_v1",
    JSON.stringify(capital)
  );

  state.objects.push({
    id: obj.id,
    placeId: obj.placeId,
    unlockedByQuizId: quiz.id,
    unlockedAt: Date.now(),
    economic: obj.capital_effect?.economic || 0,
    cultural: obj.capital_effect?.cultural || 0,
    symbolic: obj.capital_effect?.symbolic || 0,
    autonomy: obj.autonomy || 0
  });

  save(state);

  window.dispatchEvent(new Event("civi:homeChanged"));
  window.dispatchEvent(new Event("updateProfile"));

  return true;
}


function canPurchaseHomeObject(obj) {
  if (!obj || !obj.placeId) return false;

  if (!hasCompletedPlace(obj.placeId)) return false;

  const capital =
    JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");

  if ((capital.economic || 0) < (obj.cost || 0)) return false;

  return true;
}

  // ============================================================
// SELL HOME OBJECT
// ============================================================

function sellHomeObject(objectId) {
  if (!objectId) return false;

  const state = ensure(load());
  if (!Array.isArray(state.objects)) return false;

  const index = state.objects.findIndex(o => o.id === objectId);
  if (index === -1) return false;

  const originalDef =
    window.CIVI_HOME_OBJECTS?.find(o => o.id === objectId);

  const originalCost = Number(originalDef?.cost || 0);
  const refund = Math.round(originalCost * 0.7);

  // Fjern objekt
  state.objects.splice(index, 1);
  save(state);

  // Hent canonical kapital
  const capital =
    JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");

  // Legg til refund
  capital.economic =
    (capital.economic || 0) + refund;

  localStorage.setItem(
    "hg_capital_v1",
    JSON.stringify(capital)
  );

  window.dispatchEvent(new Event("civi:homeChanged"));
  window.dispatchEvent(new Event("updateProfile"));

  return true;
}

  function canPurchase(districtId) {
  const district = DISTRICTS[districtId];
  if (!district) return false;

  const capital =
    JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");

  if ((capital.economic || 0) < district.baseCost) return false;

  const merits =
    JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  for (const cat in district.quizRequirements) {
    const needed = district.quizRequirements[cat];
    const points = merits[cat]?.points || 0;
    if (points < needed) return false;
  }

  return true;
}
  
function purchaseDistrict(districtId){
  write(state => {
    state.home.status = "settled";
    state.home.district = districtId;
    state.home.level = 1;
  });
}
  
  function getState(){
    return ensure(load());
  }

  function addObject(obj){
  const state = ensure(load());
  state.objects.push(obj);
  save(state);

  window.dispatchEvent(new Event("civi:homeChanged"));

  return state;
}

  function getHomeInfluence(){
    const state = ensure(load());

    let influence = {
      economic: 0,
      cultural: 0,
      symbolic: 0,
      autonomy: 0
    };

    for(const obj of state.objects){
      influence.economic += obj.economic || 0;
      influence.cultural += obj.cultural || 0;
      influence.symbolic += obj.symbolic || 0;
      influence.autonomy += obj.autonomy || 0;
    }

    return influence;
  }

function moveDistrict(newId){
  const state = ensure(load());

  if(state.home.status !== "settled") return false;
  if(state.home.district === newId) return false;

  const district = DISTRICTS[newId];
  if(!district) return false;

  if(!canPurchase(newId)) return false;

  write(s => {
    s.home.district = newId;

    // Friksjon
    s.home.moveCount = (s.home.moveCount || 0) + 1;
  });

  window.CivicationPsyche.updateIntegrity(-5);
  window.CivicationPsyche.updateTrust(state.roleBaseline?.role_key, -10);

  return true;
}
  
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
  
  window.CivicationHome = {
  getState,
  addObject,
  getHomeInfluence,
  purchaseHomeObject,
  sellHomeObject,
  purchaseDistrict,
  moveDistrict,
  canPurchase,
  DISTRICTS
};

})();
