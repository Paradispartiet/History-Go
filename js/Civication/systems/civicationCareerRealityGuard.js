(function initCivicationCareerRealityGuard(globalScope) {
  "use strict";

  const window = /** @type {any} */ (globalScope);

  function getBadge(careerId) {
    const id = String(careerId || "").trim();
    const badges = Array.isArray(window.BADGES) ? window.BADGES : [];
    return badges.find((badge) => String(badge?.id || "").trim() === id) || null;
  }

  function findTier(badge, { threshold, title } = {}) {
    const tiers = Array.isArray(badge?.tiers) ? badge.tiers : [];
    const numericThreshold = Number(threshold);
    if (Number.isFinite(numericThreshold)) {
      const byThreshold = tiers.find((tier) => Number(tier?.threshold) === numericThreshold);
      if (byThreshold) return byThreshold;
    }
    const normalizedTitle = String(title || "").trim();
    if (normalizedTitle) {
      return tiers.find((tier) => String(tier?.label || "").trim() === normalizedTitle) || null;
    }
    return null;
  }

  function isPureLifeTier(tier) {
    return !!tier?.life_position && !tier?.career_offer && !tier?.career_unlock;
  }

  function resolveActiveJobTierIndex(activePosition, badge) {
    if (!activePosition || !badge) return null;
    const tiers = Array.isArray(badge.tiers) ? badge.tiers : [];
    const explicit = Number(activePosition.job_tier_index);
    if (Number.isInteger(explicit) && explicit >= 0 && explicit < tiers.length) return explicit;

    const threshold = Number(activePosition.threshold);
    if (Number.isFinite(threshold)) {
      const index = tiers.findIndex((tier) => Number(tier?.threshold) === threshold);
      if (index >= 0) return index;
    }

    const title = String(activePosition.title || "").trim();
    if (title) {
      const index = tiers.findIndex((tier) => String(tier?.label || "").trim() === title);
      if (index >= 0) return index;
    }
    return null;
  }

  function resolveActiveSalaryTierIndex(activePosition, badge, fallbackTierIndex) {
    if (!activePosition || !badge) return fallbackTierIndex;

    const explicitSalaryTier = Number(activePosition.salary_tier);
    if (Number.isInteger(explicitSalaryTier) && explicitSalaryTier >= 1) {
      return explicitSalaryTier - 1;
    }

    const jobTierIndex = resolveActiveJobTierIndex(activePosition, badge);
    if (!Number.isInteger(jobTierIndex)) return fallbackTierIndex;

    const tier = badge.tiers?.[jobTierIndex] || null;
    const salaryTier = Number(tier?.career_offer?.salary_tier ?? tier?.career_unlock?.salary_tier);
    if (Number.isInteger(salaryTier) && salaryTier >= 1) {
      return salaryTier - 1;
    }

    // Bakoverkompatibilitet: Badges som fortsatt bruker Badge-tier som
    // lønnsnivå beholder eksisterende oppførsel til de eksplisitt får
    // career_offer.salary_tier. Vi gjetter aldri et nytt lønnsbånd.
    return fallbackTierIndex;
  }

  function installJobOfferGuard() {
    const jobs = window.CivicationJobs;
    if (!jobs || typeof jobs.pushOffer !== "function") return false;
    if (jobs.__pureLifePositionGuardAttached) return true;

    const basePushOffer = jobs.pushOffer.bind(jobs);
    jobs.pushOffer = function pushOfferWithLifeGuard(input) {
      const payload = input && typeof input === "object" ? input : {};
      const badge = getBadge(payload.career_id);
      const tier = findTier(badge, { threshold: payload.threshold, title: payload.title });
      if (isPureLifeTier(tier)) {
        return {
          ok: false,
          reason: "life_position_not_job",
          life_position: tier.life_position,
          tier_label: tier.label,
          threshold: tier.threshold
        };
      }
      return basePushOffer(payload);
    };

    jobs.__pureLifePositionGuardAttached = true;
    return true;
  }

  function installSalaryGuard() {
    const calculate = window.calculateWeeklySalary;
    if (typeof calculate !== "function") return false;
    if (calculate.__careerRealityGuardAttached) return true;

    const guarded = function calculateWeeklySalaryForAcceptedJob(career, currentBadgeTierIndex) {
      const active = window.CivicationState?.getActivePosition?.() || null;
      const careerId = String(career?.career_id || career?.id || "").trim();
      const activeCareerId = String(active?.career_id || active?.id || "").trim();
      let salaryTierIndex = currentBadgeTierIndex;

      if (active && careerId && careerId === activeCareerId) {
        const badge = getBadge(careerId);
        salaryTierIndex = resolveActiveSalaryTierIndex(active, badge, currentBadgeTierIndex);
      }

      return calculate(career, salaryTierIndex);
    };
    guarded.__careerRealityGuardAttached = true;
    guarded.__baseCalculateWeeklySalary = calculate;
    window.calculateWeeklySalary = guarded;
    return true;
  }

  function install() {
    return {
      jobOfferGuard: installJobOfferGuard(),
      salaryGuard: installSalaryGuard()
    };
  }

  window.CivicationCareerRealityGuard = {
    getBadge,
    findTier,
    isPureLifeTier,
    resolveActiveJobTierIndex,
    resolveActiveSalaryTierIndex,
    installJobOfferGuard,
    installSalaryGuard,
    install
  };

  install();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = window.CivicationCareerRealityGuard;
  }
})(typeof window !== "undefined" ? window : globalThis);
