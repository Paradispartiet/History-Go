// ============================================================
// === HISTORY GO – DATA.JS (v3.0, cache og koblinger) ========
// ============================================================
//
// Ansvar:
//  • Lese og cache JSON-data fra /data/
//  • Tilby søk og filtrering av steder, personer, merker og quizer
//  • Håndtere sammenhenger mellom steder, personer og kategorier
//  • Sikre at alle moduler kan hente data raskt fra minne
//
// ============================================================

const Data = (() => {

  // Lokal cache i minnet
  const CACHE = {
    places: [],
    people: [],
    badges: [],
    routes: [],
    quizzes: {},
  };

  // ----------------------------------------------------------
  // 1) LASTING OG CACHE
  // ----------------------------------------------------------
  async function loadAll() {
    try {
      const [places, people, badges, routes] = await Promise.all([
        fetchJSON("data/places.json"),
        fetchJSON("data/people.json"),
        fetchJSON("data/badges.json"),
        fetchJSON("data/routes.json"),
      ]);

      CACHE.places = places || [];
      CACHE.people = people || [];
      CACHE.badges = badges || [];
      CACHE.routes = routes || [];

      // Forhåndslast quiz-filer for alle kategorier (valgfritt)
      const quizFiles = [
        "historie", "vitenskap", "kunst", "litteratur",
        "musikk", "naeringsliv", "natur", "politikk",
        "populaerkultur", "sport", "subkultur"
      ];
      for (const qf of quizFiles) {
        const data = await fetchJSON(`data/quiz_${qf}.json`);
        CACHE.quizzes[qf] = data || [];
      }

      console.log("🧠 Data lastet og cachet");
      return CACHE;

    } catch (err) {
      console.error("Feil ved lasting av data:", err);
      return null;
    }
  }

  // ----------------------------------------------------------
  // 2) HENTE DATA
  // ----------------------------------------------------------
  function getPlaces() {
    return CACHE.places;
  }

  function getPeople() {
    return CACHE.people;
  }

  function getBadges() {
    return CACHE.badges;
  }

  function getRoutes() {
    return CACHE.routes;
  }

  function getQuizzes(categoryId) {
    return CACHE.quizzes[categoryId] || [];
  }

  // ----------------------------------------------------------
  // 3) FILTRERING OG KOBLINGER
  // ----------------------------------------------------------
  function getPeopleAtPlace(placeId) {
    return CACHE.people.filter(p => p.placeId === placeId);
  }

  function getPlaceById(id) {
    return CACHE.places.find(p => p.id === id);
  }

  function getBadgeByCategory(cat) {
    const id = norm(cat);
    return CACHE.badges.find(b => b.id === id);
  }

  function getRouteByCategory(cat) {
    return CACHE.routes.find(r => r.category === cat);
  }

  // ----------------------------------------------------------
  // 4) SØK OG FILTRERINGSFUNKSJONER
  // ----------------------------------------------------------
  function searchPlaces(keyword = "") {
    const k = keyword.toLowerCase();
    return CACHE.places.filter(p =>
      p.name.toLowerCase().includes(k) || p.desc.toLowerCase().includes(k)
    );
  }

  function filterPlacesByCategory(category) {
    const id = norm(category);
    return CACHE.places.filter(p => norm(p.category) === id);
  }

  function filterPeopleByTag(tag) {
    const t = norm(tag);
    return CACHE.people.filter(p =>
      (p.tags || []).some(tt => norm(tt) === t)
    );
  }

  // ----------------------------------------------------------
  // 5) TILGANG FOR ANDRE MODULER
  // ----------------------------------------------------------
  function exportCache() {
    return structuredClone(CACHE);
  }

  // ----------------------------------------------------------
  // 6) EKSPORTERTE FUNKSJONER
  // ----------------------------------------------------------
  return {
    loadAll,
    getPlaces,
    getPeople,
    getBadges,
    getRoutes,
    getQuizzes,
    getPeopleAtPlace,
    getPlaceById,
    getBadgeByCategory,
    getRouteByCategory,
    searchPlaces,
    filterPlacesByCategory,
    filterPeopleByTag,
    exportCache,
  };
})();
