(function () {
  function deriveTierFromPoints(badge, points) {
    const tiers = Array.isArray(badge?.tiers) ? badge.tiers : [];
    const p = Number(points || 0);

    if (!tiers.length) {
      return { tierIndex: -1, label: "Nybegynner", threshold: 0 };
    }

    let tierIndex = 0;
    let label = String(tiers[0].label || "Nybegynner").trim() || "Nybegynner";

    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      const thr = Number(t.threshold || 0);
      if (p >= thr) {
        tierIndex = i;
        label = String(t.label || "").trim() || label;
      }
    }

    const threshold = Number(tiers[tierIndex]?.threshold || 0);
    return { tierIndex, label, threshold };
  }

  window.deriveTierFromPoints = deriveTierFromPoints;
})();
