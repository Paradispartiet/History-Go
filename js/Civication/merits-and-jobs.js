

// ------------------------------------------------------------
// CIVICATION: Jobbtilbud (offers) lagres i localStorage
// ------------------------------------------------------------
function qualifiesForTierWithCross(careerId, tierIndex) {
  if (!window.HG_CAREERS) return true;

  const career = window.HG_CAREERS.careers?.find(
    c => String(c.career_id) === String(careerId)
  );

  if (!career) return true;

  const cross = career.cross_requirements?.[String(tierIndex)];
  if (!cross) return true;

  for (const req of cross) {
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
    const playerPoints = Number(merits?.[req.badge]?.points || 0);

    const badge = window.BADGES?.find(b => b.id === req.badge);
    if (!badge) return false;

    const tier = deriveTierFromPoints(badge, playerPoints);

    if ((tier.tierIndex ?? 0) < req.min_tier) {
      return false;
    }
  }

  return true;
}

function hgGetJobOffers() {
  try {
    const raw = JSON.parse(localStorage.getItem("hg_job_offers_v1") || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function hgSetJobOffers(arr) {
  try {
    localStorage.setItem("hg_job_offers_v1", JSON.stringify(arr || []));
  } catch {}
}

function hgPushJobOffer(badge, tier, newPoints) {
  if (!badge || !tier) return;

  const badgeId = String(badge.id || "").trim();
  const badgeName = String(badge.name || "").trim();
  const title = String(tier.label || "").trim();
  const thr = Number(tier.threshold);

  if (!badgeId || !title || !Number.isFinite(thr)) return;

  const offerKey = `${badgeId}:${thr}`;
  const offers = hgGetJobOffers();

  // Ikke lag samme tilbud flere ganger
  if (offers.some(o => o && o.offer_key === offerKey)) return;

  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dager

  offers.unshift({
    offer_key: offerKey,
    career_id: badgeId,
    career_name: badgeName,
    title,
    threshold: thr,
    points_at_offer: Number(newPoints || 0),
    status: "pending",         // pending | accepted | declined | expired
    created_iso: now.toISOString(),
    expires_iso: expires.toISOString()
  });

  hgSetJobOffers(offers);
}


// Oppdater "stilling" ved ny poengsum (tiers = karrierestige)
async function updateMeritLevel(cat, oldPoints, newPoints) {
  await ensureBadgesLoaded();

  const catId = String(cat || "").trim();
  const badge = BADGES.find(b => String(b?.id || "").trim() === catId);
  if (!badge || !Array.isArray(badge.tiers) || !badge.tiers.length) return;

  const prev = deriveTierFromPoints(badge, Number(oldPoints || 0));
  const next = deriveTierFromPoints(badge, Number(newPoints || 0));

  // Bare gjør noe hvis du faktisk rykker opp i "stilling"
  if ((next.tierIndex ?? 0) <= (prev.tierIndex ?? 0)) return;

  // Sjekk cross-requirements før jobbtilbud
  if (!qualifiesForTierWithCross(badge.id, next.tierIndex)) {
   showToast("🔒 Du trenger bredere erfaring før denne toppstillingen.");
   return;
  }
  
  // tiers.label er nå stillingstittel
  const newTitle = String(next.label || "").trim() || "Ny stilling";

  // 1) UI feedback
  showToast(`💼 Ny stilling i ${badge.name}: ${newTitle}!`);
  pulseBadge(badge.name);

  hgPushJobOffer(badge, next, newPoints);

  }

// Poengsystem – +1 poeng per fullført quiz
async function addCompletedQuizAndMaybePoint(categoryDisplay, quizId) {
  const categoryId = catIdFromDisplay(categoryDisplay);
  const badgeId =
  categoryId === "naering" ? "naeringsliv" : categoryId;  
  const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  progress[canonicalCategoryId] = progress[canonicalCategoryId] || { completed: [] };

if (progress[canonicalCategoryId].completed.includes(quizId)) return;

progress[canonicalCategoryId].completed.push(quizId);
localStorage.setItem("quiz_progress", JSON.stringify(progress));

const badgeId = canonicalCategoryId;  if (!badgeId) return;

const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

merits[badgeId] = merits[badgeId] || { points: 0 };

const oldPoints = Number(merits[badgeId].points || 0);
merits[badgeId].points += 1;

localStorage.setItem("merits_by_category", JSON.stringify(merits));

const newPoints = Number(merits[badgeId].points || 0);  updateMeritLevel(badgeId, oldPoints, newPoints);

  showToast(`🏅 +1 poeng i ${badgeId}!`);
  window.dispatchEvent(new Event("updateProfile"));}


window.hgGetJobOffers = hgGetJobOffers;
window.hgSetJobOffers = hgSetJobOffers;
window.hgPushJobOffer = hgPushJobOffer;

window.updateMeritLevel = updateMeritLevel;
window.addCompletedQuizAndMaybePoint = addCompletedQuizAndMaybePoint;
