// ------------------------------------------------------------
// CIVICATION – Career rules (lønn, world logic)
// ------------------------------------------------------------
async function ensureCiviCareerRulesLoaded() {
  if (Array.isArray(window.CIVI_CAREER_RULES)) return;

  try {
    const data = await fetch("data/civication_careers_rules_v1.json", {
      cache: "no-store"
    }).then(r => r.json());

    window.CIVI_CAREER_RULES = Array.isArray(data?.careers)
      ? data.careers
      : [];
  } catch {
    window.CIVI_CAREER_RULES = [];
  }
}

// ------------------------------------------------------------
// CIVICATION – Offers + aktiv rolle (1 slot)
// ------------------------------------------------------------
function getJobOffers() {
  try {
    const raw = JSON.parse(localStorage.getItem("hg_job_offers_v1") || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function setJobOffers(arr) {
  try {
    localStorage.setItem("hg_job_offers_v1", JSON.stringify(arr || []));
  } catch (e) {}
}

function getActivePosition() {
  try {
    return JSON.parse(localStorage.getItem("hg_active_position_v1") || "null");
  } catch {
    return null;
  }
}

function setActivePosition(pos) {
  try {
    localStorage.setItem("hg_active_position_v1", JSON.stringify(pos));
  } catch {}
}

function getLatestPendingOffer() {
  const offers = getJobOffers();
  const now = Date.now();
  let dirty = false;

  for (const o of offers) {
    if (!o || o.status !== "pending") continue;

    const exp = o.expires_iso ? new Date(o.expires_iso).getTime() : 0;
    if (exp && exp < now) {
      o.status = "expired";
      dirty = true;
      continue;
    }

    // funnet gyldig pending offer
    if (dirty) setJobOffers(offers); // skriv tilbake hvis vi markerte noe expired på veien
    return o;
  }

  // ingen gyldig pending offer
  if (dirty) setJobOffers(offers);
  return null;
}

function acceptOfferById(offerKey) {
  const offers = getJobOffers();
  const o = offers.find(x => x && x.offer_key === offerKey);
  if (!o || o.status !== "pending") return null;

  o.status = "accepted";
  setJobOffers(offers);

  setActivePosition({
    career_id: o.career_id,
    career_name: o.career_name,
    title: o.title,
    achieved_at: new Date().toISOString(),
    role_key: o.career_id
  });

  return o;
}

function declineOfferById(offerKey) {
  const offers = getJobOffers();
  const o = offers.find(x => x && x.offer_key === offerKey);
  if (!o || o.status !== "pending") return false;

  o.status = "declined";
  setJobOffers(offers);
  return true;
}


// ------------------------------------------------------------
// CIVICATION – Lønn koblet mot Badges + Career Rules
// ------------------------------------------------------------
function getWeeklySalaryFromBadges(careerId, points) {
  if (!Array.isArray(window.BADGES) || !Array.isArray(window.CIVI_CAREER_RULES)) {
    return null;
  }

  const badge = window.BADGES.find(b => b.id === careerId);
  if (!badge) return null;

  const { tierIndex } = deriveTierFromPoints(badge, points);
  if (!Number.isFinite(tierIndex)) return null;

  const rules = window.CIVI_CAREER_RULES.find(c => c.career_id === careerId);
  if (!rules || !rules.economy?.salary_by_tier) return null;

  // tierIndex er 0-basert → +1
  return rules.economy.salary_by_tier[String(tierIndex + 1)] ?? null;
}


function deriveTierFromPoints(badge, points) {
  const tiers = Array.isArray(badge?.tiers) ? badge.tiers : [];
  const p = Number(points || 0);

  if (!tiers.length) return { tierIndex: -1, label: "Nybegynner" };

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

  return { tierIndex, label };
}
