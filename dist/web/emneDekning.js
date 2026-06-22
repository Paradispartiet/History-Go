(() => {
  // js/emneDekning.ts
  (function() {
    function norm(s) {
      return String(s || "").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa");
    }
    function computeEmneDekning(userConcepts, emner) {
      if (!Array.isArray(userConcepts) || !Array.isArray(emner)) {
        return [];
      }
      const userSet = /* @__PURE__ */ new Set();
      userConcepts.forEach((c) => {
        if (!c) return;
        if (c.label) {
          userSet.add(norm(c.label));
        }
        if (Array.isArray(c.aliases)) {
          c.aliases.forEach((a) => userSet.add(norm(a)));
        }
      });
      const results = emner.map((emne) => {
        const core = Array.isArray(emne.core_concepts) ? emne.core_concepts : [];
        const keys = Array.isArray(emne.key_terms) ? emne.key_terms : [];
        const allTerms = [...core, ...keys];
        const total = allTerms.length;
        let matchCount = 0;
        const missing = [];
        allTerms.forEach((term) => {
          const n = norm(term);
          if (userSet.has(n)) {
            matchCount++;
          } else {
            missing.push(term);
          }
        });
        const percent = total === 0 ? 0 : Math.round(matchCount / total * 100);
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
      results.sort((a, b) => b.percent - a.percent);
      return results;
    }
    window.computeEmneDekning = computeEmneDekning;
  })();
})();
//# sourceMappingURL=emneDekning.js.map
