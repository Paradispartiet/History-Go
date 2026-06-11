// js/domainRegistry.js
// ───────────────────────────────────────────────
// DomainRegistry = EN sannhet for fag/editorial domenenavn
// - Ingen implisitt normalisering / gjetting
// - Alias må være eksplisitt
// - resolve() returnerer canonical fag/editorial id
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

  // Filnavn (dersom du vil slå opp hvilke filer som brukes for et fagdomene)
  // Her låser vi naming-konvensjonen eksplisitt.
  const FILES = {
    emner: (id) => `emner/emner_${id}.json`,
    quiz: (id) => `data/quiz/quiz_${id}.json`,
    merke: (id) => `merker/merke_${id}.html`
  };

  function isCanonical(id) {
    return CANONICAL.includes(id);
  }

  function resolve(raw) {
    const id = String(raw || "").trim();
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

  function list() {
    return [...CANONICAL];
  }

  function aliasMap() {
    return { ...ALIASES };
  }

  function file(kind, domainId) {
    const id = resolve(domainId);
    const fn = FILES[kind];
    if (!fn) {
      throw new Error(`[DomainRegistry] Ukjent file-kind: "${kind}"`);
    }
    return fn(id);
  }

  // Export globalt (passer ditt “vanlig JS”-oppsett)
  window.DomainRegistry = {
    resolve,      // resolve("populaerkultur") => "popkultur"
    list,         // ["by", "historie", ...]
    aliasMap,     // {populaerkultur:"popkultur", filosofi:"vitenskap", ...}
    file          // file("quiz","populaerkultur") => "data/quiz/quiz_popkultur.json"
  };
})();
