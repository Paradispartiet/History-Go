// js/Civication/civicationJobs.js
(function () {
  const LS_OFFERS = "hg_job_offers_v1";

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  function getOffers() {
    const raw = safeParse(localStorage.getItem(LS_OFFERS) || "[]", []);
    return Array.isArray(raw) ? raw : [];
  }

  function setOffers(arr) {
    localStorage.setItem(
      LS_OFFERS,
      JSON.stringify(Array.isArray(arr) ? arr : [])
    );
  }

  function isExpired(o) {
    if (!o?.expires_iso) return false;
    const t = Date.parse(o.expires_iso);
    return Number.isFinite(t) && t < Date.now();
  }

  function expireOffers() {
    const offers = getOffers();
    let changed = false;

    const next = offers.map(o => {
      if (o?.status === "pending" && isExpired(o)) {
        changed = true;
        return { ...o, status: "expired", expired_at: new Date().toISOString() };
      }
      return o;
    });

    if (changed) setOffers(next);
    return next;
  }

  function getLatestPendingOffer() {
    const offers = expireOffers();
    return offers.find(o => o && o.status === "pending") || null;
  }

  function pushOffer({ career_id, career_name, title, threshold, points_at_offer }) {
    const badgeId = String(career_id || "").trim();
    const ttl = String(title || "").trim();
    const thr = Number(threshold);

    if (!badgeId || !ttl || !Number.isFinite(thr)) return;

    const offer_key = `${badgeId}:${thr}`;
    const offers = getOffers();

    if (offers.some(o => o && o.offer_key === offer_key)) return;

    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    offers.unshift({
      offer_key,
      career_id: badgeId,
      career_name: String(career_name || "").trim(),
      title: ttl,
      threshold: thr,
      points_at_offer: Number(points_at_offer || 0),
      status: "pending",
      created_iso: now.toISOString(),
      expires_iso: expires.toISOString()
    });

    setOffers(offers);
  }

  function acceptOffer(offer_key) {
    const offers = expireOffers();
    const idx = offers.findIndex(o => o && o.offer_key === offer_key);
    if (idx < 0) return { ok: false, reason: "not_found" };

    const offer = offers[idx];
    if (offer.status !== "pending") return { ok: false, reason: "not_pending" };

    offers[idx] = { ...offer, status: "accepted", accepted_at: new Date().toISOString() };
    setOffers(offers);

    window.CivicationState?.setActivePosition?.({
      career_id: offer.career_id,
      career_name: offer.career_name,
      title: offer.title,
      threshold: offer.threshold ?? null,
      achieved_at: new Date().toISOString()
    });

    window.dispatchEvent(new Event("updateProfile"));
    return { ok: true, offer };
  }

  function declineOffer(offer_key) {
    const offers = expireOffers();
    const idx = offers.findIndex(o => o && o.offer_key === offer_key);
    if (idx < 0) return { ok: false, reason: "not_found" };

    const offer = offers[idx];
    if (offer.status !== "pending") return { ok: false, reason: "not_pending" };

    offers[idx] = { ...offer, status: "declined", declined_at: new Date().toISOString() };
    setOffers(offers);

    window.dispatchEvent(new Event("updateProfile"));
    return { ok: true, offer };
  }

  window.CivicationJobs = {
    getOffers,
    setOffers,
    expireOffers,
    getLatestPendingOffer,
    pushOffer,
    acceptOffer,
    declineOffer
  };

  // Backward compat for tidligere navn (så du ikke “mister” gamle kall)
  window.hgGetJobOffers = getOffers;
  window.hgSetJobOffers = setOffers;
})();
