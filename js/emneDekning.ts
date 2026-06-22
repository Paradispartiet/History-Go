// emneDekning.js
// Enkel motor for å beregne emne-dekning basert på brukerens begreper

(function () {
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")              // fjerner diakritiske tegn
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/æ/g, "ae")
      .replace(/ø/g, "oe")
      .replace(/å/g, "aa");
  }

  /**
   * userConcepts: array fra HGInsights.getUserConcepts(userId, { categoryId })
   *   forventet form: [{ label: "begrep", count: 3, ... }, ...]
   *
   * emner: array fra Emner.loadForSubject("vitenskap" | "psykologi" | ...)
   *   forventet form: [{ title, core_concepts: [...], key_terms: [...], ... }, ...]
   */
  function computeEmneDekning(userConcepts, emner) {
    if (!Array.isArray(userConcepts) || !Array.isArray(emner)) {
      return [];
    }

    // 1) Normaliser brukerens begreper til et sett (for rask lookup)
    const userSet = new Set();

    userConcepts.forEach(c => {
      if (!c) return;

      if (c.label) {
        userSet.add(norm(c.label));
      }

      // Hvis du senere legger til aliases / varianter:
      if (Array.isArray(c.aliases)) {
        c.aliases.forEach(a => userSet.add(norm(a)));
      }
    });

    // 2) For hvert emne: tell treff på core_concepts + key_terms
    const results = emner.map(emne => {
      const core = Array.isArray(emne.core_concepts)
        ? emne.core_concepts
        : [];

      const keys = Array.isArray(emne.key_terms)
        ? emne.key_terms
        : [];

      const allTerms = [...core, ...keys];

      const total = allTerms.length;
      let matchCount = 0;
      const missing = [];

      allTerms.forEach(term => {
        const n = norm(term);
        if (userSet.has(n)) {
          matchCount++;
        } else {
          missing.push(term);
        }
      });

      const percent =
        total === 0 ? 0 : Math.round((matchCount / total) * 100);

      return {
        emne_id: emne.emne_id,
        title: emne.title || emne.short_label || "(uten tittel)",
        short_label: emne.short_label || emne.title || "",
        area_id: emne.area_id || null,
        area_label: emne.area_label || null,
        level: emne.level || null,

        matchCount,
        total,
        percent,
        missing
      };
    });

    // 3) Sorter: mest dekket først
    results.sort((a, b) => b.percent - a.percent);

    return results;
  }

  // Eksponer globalt
  window.computeEmneDekning = computeEmneDekning;
})();
