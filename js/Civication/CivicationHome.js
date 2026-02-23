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

  

function canPurchase(districtId){
  const district = DISTRICTS[districtId];
  if(!district) return false;

  const capital = window.USER_CAPITAL || {};
  if((capital.economic || 0) < district.baseCost) return false;

  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  for(const cat in district.quizRequirements){
    const needed = district.quizRequirements[cat];
    const points = merits[cat]?.points || 0;
    if(points < needed) return false;
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
    getHomeInfluence
  };

})();
