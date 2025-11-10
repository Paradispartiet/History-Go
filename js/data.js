// ============================================================
// === HISTORY GO – DATA.JS (v3.1, stabil cache og koblinger) ==
// ============================================================
//
//  • Leser og cacher JSON-data fra /data/
//  • Gir søk og filtrering av steder, personer, merker og quizer
//  • Holder alt i minne via HG.data for rask tilgang
// ============================================================

const Data = (() => {

  const CACHE = {
    places: [],
    people: [],
    badges: [],
    routes: [],
    quizzes: {}
  };

  // ----------------------------------------------------------
  // 1) LASTING OG CACHE
  // ----------------------------------------------------------
  async function loadAll() {
    try {
      console.log("🔄 Laster alle History Go-data ...");

      const [places, people, badges, routes] = await Promise.all([
        fetchJSON("data/places.json"),
        fetchJSON("data/people.json"),
        fetchJSON("data/badges.json"),
        fetchJSON("data/routes.json")
      ]);

      CACHE.places = places || [];
      CACHE.people = people || [];
      CACHE.badges = badges || [];
      CACHE.routes = routes || [];

      // Forhåndslast quiz-filer (valgfritt)
      const quizFiles = [
        "historie", "vitenskap", "kunst", "litteratur",
        "musikk", "naeringsliv", "natur", "politikk",
        "populaerkultur", "sport", "subkultur"
      ];

      for (const qf of quizFiles) {
        const data = await fetchJSON(`data/quiz_${qf}.json`);
        CACHE.quizzes[qf] = data || [];
      }

      // Koble til global struktur slik at alle moduler kan lese
      window.HG = window.HG || {};
      HG.data = CACHE;

      console.log(`✅ Data lastet (${CACHE.places.length} steder)`);
      return CACHE;

    } catch (err) {
      console.error("❌ Feil ved lasting av data:", err);
      return null;
    }
  }

  // ----------------------------------------------------------
  // 2) HENTE DATA
  // ----------------------------------------------------------
  const getPlaces  = () => CACHE.places;
  const getPeople  = () => CACHE.people;
  const getBadges  = () => CACHE.badges;
  const getRoutes  = () => CACHE.routes;
  const getQuizzes = (categoryId) => CACHE.quizzes[categoryId] || [];

  // ----------------------------------------------------------
  // 3) FILTRERING OG KOBLINGER
  // ----------------------------------------------------------
  const getPeopleAtPlace = (placeId) => CACHE.people.filter(p => p.placeId === placeId);
  const getPlaceById     = (id)      => CACHE.places.find(p => p.id === id);
  const getBadgeByCategory = (cat)   => CACHE.badges.find(b => norm(cat) === b.id);
  const getRouteByCategory = (cat)   => CACHE.routes.find(r => norm(r.category) === norm(cat));

  // ----------------------------------------------------------
  // 4) SØK OG FILTRERINGSFUNKSJONER
  // ----------------------------------------------------------
  function searchPlaces(keyword = "") {
    const k = keyword.toLowerCase();
    return CACHE.places.filter(p =>
      p.name.toLowerCase().includes(k) ||
      (p.desc || "").toLowerCase().includes(k)
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
  const exportCache = () => structuredClone(CACHE);

  // ----------------------------------------------------------
  // 6) EKSPORT
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
    exportCache
  };
})();
