(function initCivicationBrandEmployerBridge(globalScope) {
  function normalize(v) { return String(v || '').trim(); }
  function lower(v) { return normalize(v).toLowerCase(); }

  function isEkspeditorOffer(payload) {
    const careerId = lower(payload?.career_id);
    const title = lower(payload?.title);
    return careerId === 'naeringsliv' && (title.includes('ekspedit') || title.includes('butikkmedarbeider'));
  }

  function toHashSeed(offer) {
    return normalize(offer?.offer_key || offer?.title || offer?.threshold || 'naeringsliv-ekspeditor');
  }

  function hashString(input) {
    let hash = 0;
    const str = normalize(input);
    for (let i = 0; i < str.length; i += 1) hash = ((hash << 5) - hash) + str.charCodeAt(i);
    return Math.abs(hash);
  }

  function selectBestEmployer(employers, offer) {
    const role = lower(offer?.title);
    const relevanceOrder = ['kiosk', 'retail', 'books', 'fashion', 'beauty', 'coffee', 'design', 'jewelry', 'sports_retail'];
    const accessOrder = ['completed_place_quiz', 'unlocked_place', 'visited_place', 'place_progress'];
    const seed = hashString(toHashSeed(offer));

    function rank(employer) {
      const text = [employer.brand_type, employer.brand_group, employer.sector, employer.brand_name].map(lower).join(' ');
      const roleFit = role.includes('ekspedit') || role.includes('butikkmedarbeider') ? 1 : 0;
      const relevance = relevanceOrder.findIndex(function (token) { return text.includes(token); });
      const relevanceScore = relevance === -1 ? 99 : relevance;
      const historicalPenalty = lower(employer?.status) === 'historical' || lower(employer?.state) === 'historical' ? 1 : 0;
      const verifiedBonus = employer?.verified === true || lower(employer?.catalog_status) === 'verified' ? 1 : 0;
      const accessScore = Math.max(0, accessOrder.indexOf(lower(employer?.access_source)));
      const stableTie = hashString([seed, employer.brand_id, employer.place_id].join(':'));
      return [-roleFit, relevanceScore, historicalPenalty, -verifiedBonus, accessScore, stableTie];
    }

    return employers.slice().sort(function (a, b) {
      const ar = rank(a);
      const br = rank(b);
      for (let i = 0; i < ar.length; i += 1) {
        if (ar[i] !== br[i]) return ar[i] - br[i];
      }
      return lower(a.brand_id).localeCompare(lower(b.brand_id));
    })[0];
  }

  function selectEmployer(offer) {
    const employers = globalScope.CivicationBrandAccess?.getUnlockedBrandEmployers?.({
      career_id: offer.career_id,
      role_scope: 'ekspeditor'
    }) || [];
    if (!employers.length) return { ok: false, reason: 'no_unlocked_brand_employer', career_id: 'naeringsliv', role_scope: 'ekspeditor' };
    const selected = selectBestEmployer(employers, offer);
    return {
      ok: true,
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
      if (!pick.ok) {
        globalScope.console?.info?.('[CivicationBrandEmployerBridge] Blocked ekspeditør offer: no unlocked brand employer.');
        return pick;
      }
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

  const api = { boot, selectEmployer, selectBestEmployer };
  globalScope.CivicationBrandEmployerBridge = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  boot();
})(typeof window !== 'undefined' ? window : globalThis);
