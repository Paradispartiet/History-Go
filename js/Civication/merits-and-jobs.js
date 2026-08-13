// ------------------------------------------------------------
// CIVICATION: Jobbtilbud (offers) lagres i localStorage
// ------------------------------------------------------------

async function ensureCivicationBadgesLoaded() {
  if (Array.isArray(window.BADGES) && window.BADGES.length) return;

  if (typeof window.ensureBadgesLoaded === "function") {
    await window.ensureBadgesLoaded();
    return;
  }

  // Fallback: last fra den ekte kilden, data/badges/index.json (per-domene-
  // filer; en fil kan være { badges: [...] } eller ett enkelt badge-objekt).
  // Den gamle monolitten data/badges.json finnes ikke lenger.
  try {
    const index = await fetch("data/badges/index.json", { cache: "no-store" }).then(r => r.json());
    const files = Array.isArray(index?.files) ? index.files : [];
    const payloads = await Promise.all(files.map(f =>
      fetch(String(f), { cache: "no-store" }).then(r => r.json()).catch(() => null)
    ));
    window.BADGES = payloads.flatMap(p => {
      if (!p || typeof p !== "object") return [];
      if (Array.isArray(p.badges)) return p.badges.filter(b => !!b && typeof b === "object");
      return (typeof p.id === "string" && Array.isArray(p.tiers)) ? [p] : [];
    });
    if (window.BADGES.length) return;
  } catch {}

  window.BADGES = Array.isArray(window.BADGES) ? window.BADGES : [];
}

function getTierCareerContract(tier) {
  if (!tier || typeof tier !== "object") return null;
  if (tier.career_unlock && typeof tier.career_unlock === "object") {
    return { ...tier.career_unlock, contract_source: "career_unlock" };
  }
  if (tier.career_offer && typeof tier.career_offer === "object") {
    return { ...tier.career_offer, contract_source: "career_offer" };
  }
  return null;
}

function findBadgeTierForCareerOffer(offer) {
  const careerId = String(offer?.career_id || "").trim();
  const title = String(offer?.title || "").trim();
  const badgeTierLabel = String(offer?.badge_tier_label || "").trim();
  const threshold = Number(offer?.threshold);
  if (!careerId || !Array.isArray(window.BADGES)) return null;

  const badge = window.BADGES.find(function (candidate) {
    return String(candidate?.id || "").trim() === careerId;
  });
  if (!badge || !Array.isArray(badge.tiers)) return null;

  let tier = null;
  if (badgeTierLabel) {
    tier = badge.tiers.find(function (candidate) {
      return String(candidate?.label || "").trim() === badgeTierLabel;
    }) || null;
  }
  if (!tier && title) {
    tier = badge.tiers.find(function (candidate) {
      return String(candidate?.label || "").trim() === title;
    }) || null;
  }
  if (!tier && Number.isFinite(threshold)) {
    tier = badge.tiers.find(function (candidate) {
      return Number(candidate?.threshold) === threshold;
    }) || null;
  }
  return tier ? { badge, tier } : null;
}

function resolveCareerOfferFromBadgeTier(badge, tier, points) {
  if (!badge || !tier) return null;
  const contract = getTierCareerContract(tier);
  const careerTitle = String(contract?.title || tier?.label || "").trim();
  const tierLabel = String(tier?.label || "").trim();
  const threshold = Number(tier?.threshold);
  if (!careerTitle || !tierLabel || !Number.isFinite(threshold)) return null;

  return {
    career_id: String(badge.id || "").trim(),
    career_name: String(badge.name || badge.id || "").trim(),
    title: careerTitle,
    badge_tier_label: tierLabel,
    life_position_label: tier?.life_position ? tierLabel : null,
    threshold,
    points_at_offer: Number(points || 0)
  };
}

function hasCareerQualifications(qualificationIds) {
  const ids = Array.isArray(qualificationIds)
    ? qualificationIds.map(id => String(id || "").trim()).filter(Boolean)
    : [];
  if (!ids.length) return false;

  const qualifications = window.CivicationQualifications;
  if (typeof qualifications?.hasAll === "function") {
    try { return qualifications.hasAll(ids) === true; } catch {}
  }
  if (typeof qualifications?.has === "function") {
    try { return ids.every(id => qualifications.has(id) === true); } catch {}
  }
  return false;
}

function evaluateCareerOfferPolicy(offer) {
  const resolved = findBadgeTierForCareerOffer(offer);
  if (!resolved) {
    // Legacy/andre tilbud uten canonical Badge-tier endres ikke av denne porten.
    return { ok: true, reason: "no_badge_tier_policy" };
  }

  const careerContract = getTierCareerContract(resolved.tier);
  const policy = String(careerContract?.policy || "direct").trim();
  const qualificationIds = Array.isArray(careerContract?.qualification_ids)
    ? careerContract.qualification_ids.map(id => String(id || "").trim()).filter(Boolean)
    : [];

  if (!policy || policy === "direct") {
    return { ok: true, reason: "direct", policy, qualification_ids: [] };
  }
  if (policy === "not_job") {
    return { ok: false, reason: "career_not_job", policy, qualification_ids: [] };
  }
  if (policy === "review_required") {
    return { ok: false, reason: "career_review_required", policy, qualification_ids: [] };
  }

  const gatedPolicies = new Set([
    "qualification_required",
    "authorization_required",
    "appointment_required"
  ]);
  if (!gatedPolicies.has(policy)) {
    // Ukjent policy skal aldri kunne bli en skjult bypass.
    return { ok: false, reason: "career_policy_unknown", policy, qualification_ids: qualificationIds };
  }

  if (!hasCareerQualifications(qualificationIds)) {
    return {
      ok: false,
      reason: "career_qualification_required",
      policy,
      qualification_ids: qualificationIds
    };
  }

  return { ok: true, reason: "qualification_passed", policy, qualification_ids: qualificationIds };
}

const careerOfferGatedJobs = new WeakSet();

function installCareerOfferGate() {
  const jobs = window.CivicationJobs;
  if (!jobs || typeof jobs.pushOffer !== "function" || careerOfferGatedJobs.has(jobs)) return;

  const originalPushOffer = jobs.pushOffer.bind(jobs);
  jobs.pushOffer = function (offer) {
    const resolved = findBadgeTierForCareerOffer(offer);
    const materialized = resolved
      ? resolveCareerOfferFromBadgeTier(resolved.badge, resolved.tier, offer?.points_at_offer)
      : null;
    const canonicalOffer = materialized ? { ...offer, ...materialized } : offer;
    const gate = evaluateCareerOfferPolicy(canonicalOffer);
    if (!gate.ok) {
      return { ok: false, reason: gate.reason, career_offer_gate: gate };
    }
    return originalPushOffer(canonicalOffer);
  };
  careerOfferGatedJobs.add(jobs);
}

installCareerOfferGate();
window.evaluateCareerOfferPolicy = evaluateCareerOfferPolicy;
window.resolveCareerOfferFromBadgeTier = resolveCareerOfferFromBadgeTier;

function qualifiesForTierWithCross(careerId, tierIndex) {
  const career = Array.isArray(window.HG_CAREERS)
    ? /** @type {Array<{ career_id?: string | number, cross_requirements?: Record<string, Array<{ badge: string, min_tier: number }>> }>} */ (window.HG_CAREERS)
      .find(c => String(c.career_id) === String(careerId))
    : /** @type {Array<{ career_id?: string | number, cross_requirements?: Record<string, Array<{ badge: string, min_tier: number }>> }> | undefined} */ (window.HG_CAREERS?.careers)
      ?.find(c => String(c.career_id) === String(careerId));

  if (!career) return true;

  const cross = career.cross_requirements?.[String(tierIndex)];
  if (!cross) return true;

  for (const req of cross) {
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
    const playerPoints = Number(merits?.[req.badge]?.points || 0);

    const badge = /** @type {Array<{ id?: string }>} */ (window.BADGES || []).find(function (b) {
      return b.id === req.badge;
    });

    if (!badge) return false;

    const tier = deriveTierFromPoints(badge, playerPoints);

    if ((tier.tierIndex ?? 0) < req.min_tier) return false;
  }

  return true;
}

function hgPushJobOffer(badge, tier, newPoints) {
  if (!badge || !tier) {
    return { ok: false, reason: "invalid_offer" };
  }

  const offer = resolveCareerOfferFromBadgeTier(badge, tier, newPoints);
  if (!offer?.career_id || !offer?.title || !Number.isFinite(Number(offer?.threshold))) {
    return { ok: false, reason: "invalid_offer" };
  }

  installCareerOfferGate();
  return window.CivicationJobs?.pushOffer?.(offer) || { ok: false, reason: "jobs_unavailable" };
}

async function rebuildJobOffersFromCurrentMerits() {
  await ensureCivicationBadgesLoaded();
  installCareerOfferGate();

  if (window.CivicationJobs?.canReceiveNewOffers &&
      !window.CivicationJobs.canReceiveNewOffers()) {
    return { ok: false, reason: "active_job" };
  }

  const existingOffers = /** @type {Array<{ status?: string }>} */ (window.CivicationJobs?.getOffers?.() || []);
  const hasPending = existingOffers.some(function (o) {
    return o && o.status === "pending";
  });

  if (hasPending) {
    return { ok: true, reason: "pending_exists" };
  }

  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const badgeList = /** @type {Array<{ id?: string, name?: string, tiers?: Array<unknown> }>} */ (
    Array.isArray(window.BADGES) ? window.BADGES : []
  );

  let bestCandidate = null;

  for (const badge of badgeList) {
    const badgeId = String(badge?.id || "").trim();
    if (!badgeId) continue;

    const points = Number(merits?.[badgeId]?.points || 0);
    if (points <= 0) continue;

    const tier = deriveTierFromPoints(badge, points);
    if (!tier || !Number.isFinite(Number(tier.threshold))) continue;
    if ((tier.tierIndex ?? 0) <= 0) continue;
    if (!qualifiesForTierWithCross(badgeId, tier.tierIndex)) continue;

    const candidate = {
      badge,
      tier,
      points,
      tierIndex: Number(tier.tierIndex || 0)
    };

    if (!bestCandidate ||
        candidate.tierIndex > bestCandidate.tierIndex ||
        (candidate.tierIndex === bestCandidate.tierIndex && candidate.points > bestCandidate.points)) {
      bestCandidate = candidate;
    }
  }

  if (!bestCandidate) {
    return { ok: false, reason: "no_candidate" };
  }

  return hgPushJobOffer(bestCandidate.badge, bestCandidate.tier, bestCandidate.points);
}

// Oppdater Badge-progresjon. tier.label kan være jobb, kunnskapsmilepæl eller livsposisjon.
async function updateMeritLevel(cat, oldPoints, newPoints) {
  await ensureCivicationBadgesLoaded();
  installCareerOfferGate();

  const catId = String(cat || "").trim();
  const badge = BADGES.find(function (b) {
    return String(b?.id || "").trim() === catId;
  });

  if (!badge || !Array.isArray(badge.tiers) || !badge.tiers.length) return;

  const prev = deriveTierFromPoints(badge, Number(oldPoints || 0));
  const next = deriveTierFromPoints(badge, Number(newPoints || 0));

  if ((next.tierIndex ?? 0) <= (prev.tierIndex ?? 0)) return;

  // Feir tier-oppnåelse uavhengig av jobb-kø eller kvalifikasjon.
  // Selve milepælen kan være en livsposisjon og skal aldri omskrives til jobbtittel.
  try {
    window.dispatchEvent(new CustomEvent("hg:badge-tier-unlock", { detail: {
      categoryId: badge.id,
      categoryName: badge.name,
      badgeImage: `bilder/merker/${badge.id}.PNG`,
      prevTierIndex: prev.tierIndex ?? 0,
      nextTierIndex: next.tierIndex ?? 0,
      newTierLabel: String(next.label || "").trim(),
      lifePosition: next?.life_position ? String(next.label || "").trim() : null,
      points: Number(newPoints || 0)
    }}));
  } catch {}

  if (!qualifiesForTierWithCross(badge.id, next.tierIndex)) {
    showToast("🔒 Du trenger bredere erfaring før denne jobbmuligheten.");
    return;
  }

  if (window.CivicationJobs?.canReceiveNewOffers &&
      !window.CivicationJobs.canReceiveNewOffers()) {
    showToast("📌 Du kan beholde livsposisjonen, men fullfør eller mist nåværende jobb før neste jobbtilbud.");
    return;
  }

  const careerOffer = resolveCareerOfferFromBadgeTier(badge, next, newPoints);
  const newTitle = String(careerOffer?.title || next.label || "").trim() || "Ny stilling";

  const pushed = hgPushJobOffer(badge, next, newPoints);

  if (!/** @type {{ ok?: boolean, reason?: string }} */ (pushed)?.ok) {
    const reason = /** @type {{ ok?: boolean, reason?: string }} */ (pushed)?.reason;
    if (reason === "active_job") {
      showToast("📌 Du har allerede en aktiv jobb.");
    } else if (reason === "career_not_job") {
      showToast("🏅 Livsposisjonen er låst opp, men den gir ikke et jobbtilbud.");
    } else if (reason === "career_review_required") {
      showToast("🏅 Milepælen er nådd. Jobbmuligheten må faglig avklares før den kan tilbys.");
    } else if (reason === "career_qualification_required") {
      showToast("🔒 Milepælen er nådd, men jobben krever egen kvalifikasjon, autorisasjon eller utnevnelse.");
    }
    return;
  }

  showToast(`💼 Ny jobbmulighet i ${badge.name}: ${newTitle}!`);
  pulseBadge(badge.name);
}

// Poengsystem – +1 poeng per fullført quiz
async function addCompletedQuizAndMaybePoint(categoryDisplay, quizId) {
  const categoryId = catIdFromDisplay(categoryDisplay);
  const badgeId = categoryId;

  if (!badgeId) return;

  const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  progress[badgeId] = progress[badgeId] || { completed: [] };

  if (progress[badgeId].completed.includes(quizId)) return;

  progress[badgeId].completed.push(quizId);
  localStorage.setItem("quiz_progress", JSON.stringify(progress));

  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  merits[badgeId] = merits[badgeId] || { points: 0 };

  const oldPoints = Number(merits[badgeId].points || 0);
  merits[badgeId].points += 1;

  localStorage.setItem("merits_by_category", JSON.stringify(merits));

  const newPoints = Number(merits[badgeId].points || 0);

  updateMeritLevel(badgeId, oldPoints, newPoints);

  showToast(`🏅 +1 poeng i ${badgeId}!`);
  try {
    if (typeof window.updateKnowledgeFingerprint === "function") {
      window.updateKnowledgeFingerprint({ categoryId: badgeId, quizId });
    }
    if (typeof window.updateSocialMatchIndex === "function") {
      window.updateSocialMatchIndex({ reason: "quiz_completed", categoryId: badgeId, quizId });
    }
    if (typeof window.checkSharedQuizOpportunities === "function") {
      window.checkSharedQuizOpportunities(quizId, { categoryId: badgeId });
    }
  } catch (err) {
    console.warn("[HG Social] quiz integration failed", err);
  }

  window.dispatchEvent(new Event("updateProfile"));
}

window.hgPushJobOffer = hgPushJobOffer;
window.updateMeritLevel = updateMeritLevel;
window.addCompletedQuizAndMaybePoint = addCompletedQuizAndMaybePoint;
window.rebuildJobOffersFromCurrentMerits = rebuildJobOffersFromCurrentMerits;

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    window.rebuildJobOffersFromCurrentMerits?.();
  }, 0);
});
