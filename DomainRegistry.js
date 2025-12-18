// js/domainRegistry.js
// ───────────────────────────────────────────────
// DomainRegistry = EN sannhet for domenenavn
// - Ingen normalisering / gjetting
// - Alias må være eksplisitt
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
  // Nøkkel = det som kan dukke opp i data/UI, verdi = canonical id
  const ALIASES = {
    "populaerkultur": "popkultur", // quiz/merke → emner
    "popular_kultur": "popkultur",
    "popularculture": "popkultur",
    "sci": "vitenskap",
    "science": "vitenskap",
    "history": "historie",
    "city": "by"
  };

  // Filnavn (dersom du vil slå opp hvilke filer som brukes for et domene)
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
    aliasMap,     // {populaerkultur:"popkultur", ...}
    file          // file("quiz","populaerkultur") => "data/quiz/quiz_popkultur.json"
  };
})();
