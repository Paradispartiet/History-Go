// js/DomainRegistry.js
// Én eksplisitt sannhet for fag- og runtime-kategorier.
// Maskinlesbar kontrakt: data/categories/category_contract.json

(function () {
  const CANONICAL = [
    "by",
    "historie",
    "kunst",
    "litteratur",
    "media",
    "musikk",
    "naeringsliv",
    "natur",
    "politikk",

    "psykologi",
    "religion",
    "scenekunst",
    "sport",
    "subkultur",
    "vitenskap",
    "filosofi",
    "film_tv"
  ];

  const RUNTIME_CATEGORY_IDS = [
    "by",
    "historie",
    "kunst",
    "litteratur",
    "media",
    "musikk",
    "naeringsliv",
    "natur",
    "politikk",

    "psykologi",
    "religion",
    "scenekunst",
    "sport",
    "subkultur",
    "vitenskap",
    "filosofi",
    "film_tv"
  ];

  const ALIASES = {
    "populaerkultur": "popkultur",






    "philosophy": "filosofi",
    "sci": "vitenskap",
    "science": "vitenskap",

    "teater": "scenekunst",
    "theatre": "scenekunst",
    "theater": "scenekunst",

    "film": "film_tv",
    "tv": "film_tv",
    "journalistikk": "media",

    "history": "historie",
    "city": "by"
  };

  const RUNTIME_ALIASES = {
    "popkultur": "populaerkultur",






    "philosophy": "filosofi",

    "teater": "scenekunst",
    "theatre": "scenekunst",
    "theater": "scenekunst",

    "film": "film_tv",
    "tv": "film_tv",
    "journalistikk": "media"
  };

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

    const known = CANONICAL.concat(Object.keys(ALIASES)).sort();
    throw new Error(
      `[DomainRegistry] UGYLDIG DOMENE: "${id}". ` +
      `Legg det til i CANONICAL eller ALIASES. Kjente: ${known.join(", ")}`
    );
  }

  function toFagSubjectId(raw) {
    return resolve(raw);
  }

  function toRuntimeCategoryId(raw) {
    const id = s(raw);
    if (!id) return null;
    if (isRuntimeCategory(id)) return id;
    if (RUNTIME_ALIASES[id]) return RUNTIME_ALIASES[id];

    const known = RUNTIME_CATEGORY_IDS.concat(Object.keys(RUNTIME_ALIASES)).sort();
    throw new Error(
      `[DomainRegistry] UGYLDIG RUNTIME-KATEGORI: "${id}". ` +
      `Legg den til i RUNTIME_CATEGORY_IDS eller RUNTIME_ALIASES. Kjente: ${known.join(", ")}`
    );
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
    const fn = FILES[kind];
    if (!fn) throw new Error(`[DomainRegistry] Ukjent file-kind: "${kind}"`);
    const id = kind === "quiz"
      ? toRuntimeCategoryId(domainId)
      : toFagSubjectId(domainId);
    return fn(id);
  }

  window.DomainRegistry = {
    resolve,
    toFagSubjectId,
    toRuntimeCategoryId,
    list,
    listRuntimeCategories,
    aliasMap,
    runtimeAliasMap,
    file
  };
})();
