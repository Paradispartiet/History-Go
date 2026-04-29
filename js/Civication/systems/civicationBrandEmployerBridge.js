(function initCivicationBrandEmployerBridge(globalScope) {
  function normalize(v) { return String(v || '').trim(); }
  function lower(v) { return normalize(v).toLowerCase(); }

  function isEkspeditorOffer(payload) {
    const careerId = lower(payload?.career_id);
    const title = lower(payload?.title);
    return careerId === 'naeringsliv' && (title.includes('ekspedit') || title.includes('butikkmedarbeider'));
  }

  function selectEmployer(offer) {
    const employers = globalScope.CivicationBrandAccess?.getUnlockedBrandEmployers?.({
      career_id: offer.career_id,
      role_scope: 'ekspeditor'
    }) || [];
    if (!employers.length) return { offer, reason: 'no_unlocked_brand_employer' };
    const selected = employers[0];
    return {
      offer: {
        ...offer,
        brand_id: selected.brand_id,
        brand_name: selected.brand_name,
        brand_type: selected.brand_type,
        brand_group: selected.brand_group,
        sector: selected.sector,
        place_id: selected.place_id,
        employer_context: selected.employer_context
      },
      reason: null
    };
  }

  function boot() {
    const jobs = globalScope.CivicationJobs;
    if (!jobs || jobs.__brandEmployerBridgePatched) return false;

    const originalPushOffer = jobs.pushOffer;
    const originalAcceptOffer = jobs.acceptOffer;

    jobs.pushOffer = function patchedPushOffer(payload) {
      const source = payload || {};
      if (!isEkspeditorOffer(source)) return originalPushOffer.call(this, source);
      const pick = selectEmployer(source);
      return originalPushOffer.call(this, pick.offer);
    };

    jobs.acceptOffer = function patchedAcceptOffer(offerKey) {
      const result = originalAcceptOffer.call(this, offerKey);
      if (!result?.ok) return result;
      const offer = result.offer || {};
      const active = globalScope.CivicationState?.getActivePosition?.();
      if (!active) return result;
      globalScope.CivicationState?.setActivePosition?.({
        ...active,
        brand_id: normalize(offer.brand_id) || null,
        brand_name: normalize(offer.brand_name) || null,
        brand_type: normalize(offer.brand_type) || null,
        brand_group: normalize(offer.brand_group) || null,
        sector: normalize(offer.sector) || null,
        place_id: normalize(offer.place_id) || null,
        employer_context: offer.employer_context || active.employer_context || null
      });
      return result;
    };

    jobs.__brandEmployerBridgePatched = true;
    jobs.__brandEmployerBridgeSelectEmployer = selectEmployer;
    return true;
  }

  const api = { boot, selectEmployer };
  globalScope.CivicationBrandEmployerBridge = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  boot();
})(typeof window !== 'undefined' ? window : globalThis);
