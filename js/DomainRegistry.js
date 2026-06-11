// js/domainRegistry.js
// ───────────────────────────────────────────────
// DomainRegistry = EN sannhet for fag/editorial domenenavn
// - Ingen implisitt normalisering / gjetting
// - Alias må være eksplisitt
// - resolve() returnerer canonical fag/editorial id
// - toRuntimeCategoryId() returnerer runtime badge/category/progression id
// - popkultur er kortnavn for samme populærkultur-domene som runtime-id populaerkultur
// - Fail-fast hvis noe er ukjent
// ───────────────────────────────────────────────

(function () {
  const CANONICAL = [
    "by",
    "historie",
    "kunst",
    "litteratur",
    "musikk",
    "naeringsliv",
    "natur",
    "politikk",
    "popkultur",
    "psykologi",
    "sport",
    "subkultur",
    "vitenskap"
  ];

  // Runtime badge/category-id-er. Disse brukes for place.category, categoryId,
  // badge id og merits/progression. Ikke bland disse med fag-/editorial-id-er.
  const RUNTIME_CATEGORY_IDS = [
    "by",
    "historie",
    "kunst",
    "litteratur",
    "musikk",
    "naeringsliv",
    "natur",
    "politikk",
    "populaerkultur",
    "psykologi",
    "sport",
    "subkultur",
    "vitenskap",
    "film_tv",
    "media"
  ];

  // Alias: kun det du eksplisitt tillater.
  // Nøkkel = det som kan dukke opp i data/UI/import, verdi = canonical fag/editorial id.
  // NB: Runtime badge/category kan bruke lang id "populaerkultur" for samme domene.
  // Bruk ikke resolve() til å lage et ekstra badge/progresjonsspor for "popkultur".
  const ALIASES = {
    "populaerkultur": "popkultur", // lang runtime-id → kort fag/editorial id for samme badge
    "populærkultur": "popkultur",
    "popular_kultur": "popkultur",
    "popularculture": "popkultur",
    "popular_culture": "popkultur",
    "popular-culture": "popkultur",
    "popular culture": "popkultur",

    "filosofi": "vitenskap",
    "philosophy": "vitenskap",
    "sci": "vitenskap",
    "science": "vitenskap",

    "scenekunst": "kunst",
    "teater": "kunst",
    "theatre": "kunst",
    "theater": "kunst",

    "history": "historie",
    "city": "by"
  };

  const RUNTIME_ALIASES = {
    "popkultur": "populaerkultur",
    "populærkultur": "populaerkultur",
    "popular_kultur": "populaerkultur",
    "popularculture": "populaerkultur",
    "popular_culture": "populaerkultur",
    "popular-culture": "populaerkultur",
    "popular culture": "populaerkultur"
  };

  // Filnavn (dersom du vil slå opp hvilke filer som brukes for et fagdomene)
  // Her låser vi naming-konvensjonen eksplisitt.
  const FILES = {
    emner: (id) => `emner/emner_${id}.json`,
    quiz: (id) => `data/quiz/quiz_${id}.json`,
    merke: (id) => `merker/merke_${id}.html`
  };

  function s(raw) {
    return String(raw || "").trim();
  }

  function isCanonical(id) {
    return CANONICAL.includes(id);
  }

  function isRuntimeCategory(id) {
    return RUNTIME_CATEGORY_IDS.includes(id);
  }

  function resolve(raw) {
    const id = s(raw);
    if (!id) return null;

    if (isCanonical(id)) return id;
    if (ALIASES[id]) return ALIASES[id];

    // Fail fast: ukjent domene = bug
    const known = CANONICAL.concat(Object.keys(ALIASES)).sort();
    const msg =
      `[DomainRegistry] UGYLDIG DOMENE: "${id}". ` +
      `Legg det til i CANONICAL eller ALIASES. ` +
      `Kjente: ${known.join(", ")}`;
    throw new Error(msg);
  }

  // Fag/emne/pensum-retning.
  // Bruk denne når du skal inn i data/fag/<subjectId>/ eller emner/pensum.
  function toFagSubjectId(raw) {
    return resolve(raw);
  }

  // Runtime category/badge/progression-retning.
  // Bruk denne før place.category/categoryId sammenlignes med badges eller merits_by_category.
  function toRuntimeCategoryId(raw) {
    const id = s(raw);
    if (!id) return null;

    if (isRuntimeCategory(id)) return id;
    if (RUNTIME_ALIASES[id]) return RUNTIME_ALIASES[id];

    // Ikke gjett via resolve() her. Runtime-id-er er et eget kontraktlag.
    const known = RUNTIME_CATEGORY_IDS.concat(Object.keys(RUNTIME_ALIASES)).sort();
    const msg =
      `[DomainRegistry] UGYLDIG RUNTIME-KATEGORI: "${id}". ` +
      `Legg den til i RUNTIME_CATEGORY_IDS eller RUNTIME_ALIASES. ` +
      `Kjente: ${known.join(", ")}`;
    throw new Error(msg);
  }

  function list() {
    return [...CANONICAL];
  }

  function listRuntimeCategories() {
    return [...RUNTIME_CATEGORY_IDS];
  }

  function aliasMap() {
    return { ...ALIASES };
  }

  function runtimeAliasMap() {
    return { ...RUNTIME_ALIASES };
  }

  function file(kind, domainId) {
    const id = toFagSubjectId(domainId);
    const fn = FILES[kind];
    if (!fn) {
      throw new Error(`[DomainRegistry] Ukjent file-kind: "${kind}"`);
    }
    return fn(id);
  }

  // Export globalt (passer ditt “vanlig JS”-oppsett)
  window.DomainRegistry = {
    resolve,              // resolve("populaerkultur") => "popkultur"
    toFagSubjectId,       // toFagSubjectId("populaerkultur") => "popkultur"
    toRuntimeCategoryId,  // toRuntimeCategoryId("popkultur") => "populaerkultur"
    list,                 // ["by", "historie", ... fag/editorial]
    listRuntimeCategories,// ["by", "historie", ..., "populaerkultur", "film_tv", "media"]
    aliasMap,             // {populaerkultur:"popkultur", filosofi:"vitenskap", ...}
    runtimeAliasMap,      // {popkultur:"populaerkultur", ...}
    file                  // file("quiz","populaerkultur") => "data/quiz/quiz_popkultur.json"
  };
})();
