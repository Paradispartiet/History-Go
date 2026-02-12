// boot.js

async function boot() {
    // ✅ OpenModus (betalingsmodus) – må settes tidlig
  window.OPEN_MODE = localStorage.getItem("HG_OPEN_MODE") === "1";
  const openEl = document.getElementById("openToggle");
  if (openEl) openEl.checked = window.OPEN_MODE;

  // ✅ "Åpne alt"-knapp: riktig synlighet ved reload
  const btnUA = document.getElementById("btnUnlockAll");
  if (btnUA) btnUA.style.display = window.OPEN_MODE ? "inline-flex" : "none";


  // Eksponer START globalt (routes.js bruker START som fallback)
window.START = START;

  // Init map + ...
  // Init map + eksponer global MAP (routes.js forventer MAP)
  const map = window.HGMap?.initMap({ containerId: "map", start: START });
if (map) {
  MAP = map;        // ← viktig: lokal variabel i app.js
  window.MAP = map; // ← viktig: global for routes.js
}


  
// ==============================
// LAST BASISDATA (uten PEOPLE)
// ==============================
let places, relations, wonderkammer, tags;

try {
  [
    places,
    relations,
    wonderkammer,
    tags
  ] = await Promise.all([
    fetch("data/places.json", { cache: "no-store" }).then(r => r.json()),
    fetch("data/relations.json", { cache: "no-store" }).then(r => r.json()).catch(() => []),
    fetch("data/wonderkammer.json", { cache: "no-store" }).then(r => r.json()).catch(() => null),
    fetch("data/tags.json", { cache: "no-store" }).then(r => r.json()).catch(() => null)
  ]);
} catch (e) {
  console.warn("[boot] base data feilet:", e);
  places = [];
  relations = [];
  wonderkammer = null;
  tags = null;
}

// ==============================
// PEOPLE – last fra flere filer
// ==============================
let peopleAll = [];

try {
  const peoplePairs = await Promise.all(
    Object.entries(PEOPLE_FILES).map(async ([domain, url]) => {
      const data = await fetch(url, { cache: "no-store" })
        .then(r => r.json())
        .catch(() => []);

      return Array.isArray(data)
        ? data.map(p => ({ ...p, __source: domain }))
        : [];
    })
  );

  peopleAll = peoplePairs.flat();
} catch (e) {
  console.warn("[people] multi-load feilet:", e);
  peopleAll = [];
}


// ==============================
// SETT RUNTIME-VARIABLER
// ==============================
PLACES = Array.isArray(places) ? places : [];
PEOPLE = peopleAll;
RELATIONS = Array.isArray(relations) ? relations : [];

window.PLACES = PLACES;
window.PEOPLE = PEOPLE;
window.RELATIONS = RELATIONS;


// ==============================
// RELATIONS – runtime-indekser
// ==============================
window.REL_BY_PLACE = Object.create(null);
window.REL_BY_PERSON = Object.create(null);

for (const r of window.RELATIONS) {
  const place = String(r.place || "").trim();
  const person = String(r.person || "").trim();

  if (place) (window.REL_BY_PLACE[place] ||= []).push(r);
  if (person) (window.REL_BY_PERSON[person] ||= []).push(r);
}







// ✅ EPOKER (runtime) – last alle epoker per merke/domain via registry
let epokerByDomain = {};
try {
  const pairs = await Promise.all(
    Object.entries(EPOKER_FILES).map(async ([domain, url]) => {
      const data = await fetch(url, { cache: "no-store" })
        .then(r => r.json())
        .catch(() => []);
      return [domain, Array.isArray(data) ? data : []];
    })
  );
  epokerByDomain = Object.fromEntries(pairs);
} catch (e) {
  console.warn("[epoker] fetch feilet:", e);
  epokerByDomain = {};
}

window.EPOKER = epokerByDomain;

try {
  window.EPOKER_INDEX = buildEpokerRuntimeIndex(window.EPOKER);
  window.getEpoke = getEpoke; // eksponer helper (valgfritt)
} catch (e) {
  console.warn("[epoker] buildEpokerRuntimeIndex feilet:", e);
  window.EPOKER_INDEX = { byKey: Object.create(null), byDomain: Object.create(null), all: [] };
}
    
// ✅ WONDERKAMMER (connections) – separat fra relations
window.WONDERKAMMER = (wonderkammer && typeof wonderkammer === "object") ? wonderkammer : null;

// Runtime-indekser: WK_BY_PLACE / WK_BY_PERSON
window.WK_BY_PLACE = Object.create(null);
window.WK_BY_PERSON = Object.create(null);

if (window.WONDERKAMMER) {
  // Støtter både:
  //  A) { places:[{ place:"id", chambers:[] }], people:[{ person:"id", chambers:[] }] }
  //  B) { places:[{ place_id:"id", chambers:[] }], people:[{ person_id:"id", chambers:[] }] }
  const wkPlaces = Array.isArray(window.WONDERKAMMER.places) ? window.WONDERKAMMER.places : [];
  const wkPeople = Array.isArray(window.WONDERKAMMER.people) ? window.WONDERKAMMER.people : [];

  for (const row of wkPlaces) {
    const pid = String(row?.place || row?.place_id || "").trim();
    if (!pid) continue;
    window.WK_BY_PLACE[pid] = Array.isArray(row?.chambers) ? row.chambers : [];
  }

  for (const row of wkPeople) {
  const per = String(row?.person || row?.person_id || "").trim();
  if (!per) continue;

  window.WK_BY_PERSON[per] = Array.isArray(row?.chambers) ? row.chambers : [];

  window.WK_PLACE_DOC  = window.WK_PLACE_DOC  || Object.create(null);
  window.WK_PERSON_DOC = window.WK_PERSON_DOC || Object.create(null);

  window.WK_PERSON_DOC[per] = row;
}
}
    
TAGS_REGISTRY = tags || {};

if (window.HGAuditMissingImages) {
  HGAuditMissingImages.run({ people: PEOPLE, places: PLACES });
}

if (typeof linkPeopleToPlaces === "function") {
  linkPeopleToPlaces();
} else {
  if (DEBUG) console.warn("linkPeopleToPlaces() mangler – hopper over linking");
}


try {
  await loadNature();

  window.API = window.API || {};
  window.API.addCompletedQuizAndMaybePoint = (...args) =>
    addCompletedQuizAndMaybePoint(...args);

  // ✅ INIT QUIZ-MODUL (ETTER at PLACES/PEOPLE er lastet)
  if (window.QuizEngine) {
    QuizEngine.init({
      getPersonById: id => PEOPLE.find(p => p.id === id),
      getPlaceById:  id => PLACES.find(p => p.id === id),

      getVisited: () => visited,
      isTestMode: () => !!window.OPEN_MODE,

      showToast,

      // progression / rewards
      addCompletedQuizAndMaybePoint: (...args) => {
        // 1) kjør eksisterende progresjon
        addCompletedQuizAndMaybePoint(...args);

        // 2) finn sted/person-ID i args
        let foundId = null;
        for (const a of args) {
          if (a == null) continue;
          const s = String(a);
          if (!s) continue;

          if (PLACES?.some(p => String(p.id) === s)) { foundId = s; break; }
          if (PEOPLE?.some(p => String(p.id) === s)) { foundId = s; break; }
        }

        if (!foundId) return;

        // 3) unlock basert på ID
        if (PLACES?.some(p => String(p.id) === foundId)) {
          saveVisitedFromQuiz(foundId);
          return;
        }

        if (PEOPLE?.some(p => String(p.id) === foundId)) {
          peopleCollected[foundId] = true;
          savePeople();
          window.dispatchEvent(new Event("updateProfile"));
        }
      },

      showRewardPerson,
      showRewardPlace,
      showPersonPopup,
      showPlacePopup,

      // wrappers
      pulseMarker: (lat, lon) => {
        if (typeof window.pulseMarker === "function") {
          window.pulseMarker(lat, lon);
        }
      },
      savePeopleCollected: (personId) => {
        peopleCollected[personId] = true;
        savePeople();
      },
      saveVisitedFromQuiz: (placeId) => {
        saveVisitedFromQuiz(placeId);
      },
      dispatchProfileUpdate: () =>
        window.dispatchEvent(new Event("updateProfile")),

      // ✅ hooks (kun ved riktige svar)
      saveKnowledgeFromQuiz: window.saveKnowledgeFromQuiz || null,
      saveTriviaPoint: window.saveTriviaPoint || null
    });
  } else {
    if (DEBUG) console.warn("QuizEngine ikke lastet");
  }

} catch (e) {
  console.error("Feil ved loadNature / quiz-init:", e);
  if (DEBUG && e?.stack) console.error(e.stack);
}


// ✅ Gi kartmodulen data + callbacks (ETTER data er lastet)
if (window.HGMap) {
  HGMap.setPlaces(PLACES);
  HGMap.setVisited(visited);
  HGMap.setCatColor(catColor);
  HGMap.setOnPlaceClick((id) => {
    const p = PLACES.find(x => x.id === id);
    if (p) openPlaceCard(p);
  });
  HGMap.setDataReady(true);
  HGMap.maybeDrawMarkers();
}

await ensureBadgesLoaded();
wire();
requestLocation();
renderCollection();
renderGallery();
}


requestAnimationFrame(() => {
  window.scrollTo(0, 0);
});
