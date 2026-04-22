// ------------------------------------------------------------
// CIVICATION: Jobbtilbud (offers) lagres i localStorage
// ------------------------------------------------------------

function qualifiesForTierWithCross(careerId, tierIndex) {
  const career = Array.isArray(window.HG_CAREERS)
    ? window.HG_CAREERS.find(c => String(c.career_id) === String(careerId))
    : window.HG_CAREERS?.careers?.find(c => String(c.career_id) === String(careerId));

  if (!career) return true;

  const cross = career.cross_requirements?.[String(tierIndex)];
  if (!cross) return true;

  for (const req of cross) {
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
    const playerPoints = Number(merits?.[req.badge]?.points || 0);

    const badge = window.BADGES?.find(function (b) {
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

  const badgeId = String(badge.id || "").trim();
  const badgeName = String(badge.name || "").trim();
  const title = String(tier.label || "").trim();
  const thr = Number(tier.threshold);

  if (!badgeId || !title || !Number.isFinite(thr)) {
    return { ok: false, reason: "invalid_offer" };
  }

  return window.CivicationJobs?.pushOffer?.({
    career_id: badgeId,
    career_name: badgeName,
    title,
    threshold: thr,
    points_at_offer: Number(newPoints || 0)
  }) || { ok: false, reason: "jobs_unavailable" };
}

async function rebuildJobOffersFromCurrentMerits() {
  await ensureBadgesLoaded();

  if (window.CivicationJobs?.canReceiveNewOffers &&
      !window.CivicationJobs.canReceiveNewOffers()) {
    return { ok: false, reason: "active_job" };
  }

  const existingOffers = window.CivicationJobs?.getOffers?.() || [];
  const hasPending = existingOffers.some(function (o) {
    return o && o.status === "pending";
  });

  if (hasPending) {
    return { ok: true, reason: "pending_exists" };
  }

  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const badgeList = Array.isArray(window.BADGES) ? window.BADGES : [];

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
      tierIndex: Number(tier.tierIndex || 0),
      threshold: Number(tier.threshold || 0)
    };

    if (!bestCandidate) {
      bestCandidate = candidate;
      continue;
    }

    if (candidate.tierIndex > bestCandidate.tierIndex) {
      bestCandidate = candidate;
      continue;
    }

    if (candidate.tierIndex === bestCandidate.tierIndex &&
        candidate.points > bestCandidate.points) {
      bestCandidate = candidate;
    }
  }

  if (!bestCandidate) {
    return { ok: false, reason: "no_candidate" };
  }

  return hgPushJobOffer(bestCandidate.badge, bestCandidate.tier, bestCandidate.points);
}

// Oppdater "stilling" ved ny poengsum (tiers = karrierestige)
async function updateMeritLevel(cat, oldPoints, newPoints) {
  await ensureBadgesLoaded();

  const catId = String(cat || "").trim();
  const badge = BADGES.find(function (b) {
    return String(b?.id || "").trim() === catId;
  });

  if (!badge || !Array.isArray(badge.tiers) || !badge.tiers.length) return;

  const prev = deriveTierFromPoints(badge, Number(oldPoints || 0));
  const next = deriveTierFromPoints(badge, Number(newPoints || 0));

  if ((next.tierIndex ?? 0) <= (prev.tierIndex ?? 0)) return;

  if (!qualifiesForTierWithCross(badge.id, next.tierIndex)) {
    showToast("🔒 Du trenger bredere erfaring før denne toppstillingen.");
    return;
  }

  if (window.CivicationJobs?.canReceiveNewOffers &&
      !window.CivicationJobs.canReceiveNewOffers()) {
    showToast("📌 Fullfør nåværende jobb eller mist den før neste tilbud.");
    return;
  }

  const newTitle = String(next.label || "").trim() || "Ny stilling";

  const pushed = hgPushJobOffer(badge, next, newPoints);

  if (!pushed?.ok) {
    if (pushed?.reason === "active_job") {
      showToast("📌 Du har allerede en aktiv jobb.");
    }
    return;
  }

  showToast(`💼 Ny stilling i ${badge.name}: ${newTitle}!`);
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
