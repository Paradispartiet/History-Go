(function () {

  async function loadConflicts(category) {
    if (!category) return null;

    try {
      const res = await fetch(`data/Civication/conflicts/${category}_conflicts.json`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function getConflictForTier(conflictData, tierLabel) {
    if (!conflictData || !Array.isArray(conflictData.levels)) return null;

    return conflictData.levels.find(l => l.tier_label === tierLabel) || null;
  }

  window.CivicationConflicts = {
    load: loadConflicts,
    getForTier: getConflictForTier
  };

})();
