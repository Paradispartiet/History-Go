// js/console/hgDebugCommands.js
(function () {
  const D = window.HG_DEVTOOLS;
  if (!D) return;

  function arr(x) {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    return [x];
  }

  window.HG = window.HG || {};

  window.HG.debugThemes = function () {
    const places = window.PLACES || window.places || [];
    D.log("PLACES count:", places.length);

    if (!places.length) {
      D.warn("PLACES er tom → last/reihefølge eller fetch/data-path problem, ikke kategori.");
      return;
    }

    const sample = places.slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      theme: p.theme,
      themeId: p.themeId,
      subject_id: p.subject_id,
      tags: p.tags
    }));
    console.table(sample);

    const buckets = {};
    for (const p of places) {
      const keys = []
        .concat(arr(p.category))
        .concat(arr(p.theme))
        .concat(arr(p.themeId))
        .concat(arr(p.subject_id))
        .concat(arr(p.tags));

      for (const k of keys) {
        const kk = String(k).trim();
        if (!kk) continue;
        buckets[kk] = (buckets[kk] || 0) + 1;
      }
    }

    const top = Object.entries(buckets).sort((a,b) => b[1]-a[1]).slice(0, 40);
    D.log("Tema/keys funnet i data (topp):");
    console.table(top.map(([k,c]) => ({ key: k, count: c })));

    return { count: places.length, keys: top };
  };

  window.HG.dumpState = function () {
    const out = {
      hasPLACES: !!(window.PLACES || window.places),
      hasPEOPLE: !!(window.PEOPLE || window.people),
      placesCount: (window.PLACES || window.places || []).length,
      peopleCount: (window.PEOPLE || window.people || []).length,
      activeTheme: window.activeTheme || window.ACTIVE_THEME || null
    };
    D.log("HG.dumpState:", out);
    return out;
  };

  D.log("HG debug commands loaded ✅ (HG.debugThemes(), HG.dumpState())");
})();
