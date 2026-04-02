// js/Civication/civicationJobs.js
(function () {
  const LS_OFFERS = "hg_job_offers_v1";
  const DEFAULT_OBLIGATION_IDS = [
    "weekly_login",
    "event_response",
    "reputation_floor"
  ];

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  function slugify(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 64);
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

    const next = offers.map(function (o) {
      if (o?.status === "pending" && isExpired(o)) {
        changed = true;
        return {
          ...o,
          status: "expired",
          expired_at: new Date().toISOString()
        };
      }
      return o;
    });

    if (changed) setOffers(next);
    return next;
  }

  function hasActiveEmployment() {
    const activePos = window.CivicationState?.getActivePosition?.();
    const state = window.CivicationState?.getState?.() || {};
    const activeJob = state?.career?.activeJob;
    return !!(activePos || activeJob);
  }

  function canReceiveNewOffers() {
    return !hasActiveEmployment();
  }

  function getLatestPendingOffer() {
    if (!canReceiveNewOffers()) return null;

    const offers = expireOffers();
    return offers.find(function (o) {
      return o && o.status === "pending";
    }) || null;
  }

  function pushOffer({
    career_id,
    career_name,
    title,
    threshold,
    points_at_offer,
    brand_id,
    brand_name
  }) {
    if (!canReceiveNewOffers()) {
      return { ok: false, reason: "active_job" };
    }

    const badgeId = String(career_id || "").trim();
    const ttl = String(title || "").trim();
    const thr = Number(threshold);

    if (!badgeId || !ttl || !Number.isFinite(thr)) {
      return { ok: false, reason: "invalid_offer" };
    }

    const offer_key = `${badgeId}:${thr}`;
    const offers = getOffers();

    if (offers.some(function (o) {
      return o && o.offer_key === offer_key;
    })) {
      return { ok: false, reason: "duplicate" };
    }

    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const offer = {
      offer_key,
      career_id: badgeId,
      career_name: String(career_name || "").trim(),
      title: ttl,
      threshold: thr,
      points_at_offer: Number(points_at_offer || 0),
      brand_id: String(brand_id || "").trim() || null,
      brand_name: String(brand_name || "").trim() || null,
      status: "pending",
      created_iso: now.toISOString(),
      expires_iso: expires.toISOString()
    };

    offers.unshift(offer);
    setOffers(offers);

    return { ok: true, offer: offer };
  }

  function acceptOffer(offer_key) {
    if (hasActiveEmployment()) {
      return { ok: false, reason: "active_job" };
    }

    const offers = expireOffers();
    const idx = offers.findIndex(function (o) {
      return o && o.offer_key === offer_key;
    });

    if (idx < 0) return { ok: false, reason: "not_found" };

    const offer = offers[idx];
    if (offer.status !== "pending") {
      return { ok: false, reason: "not_pending" };
    }

    const nowIso = new Date().toISOString();
    const role_key = slugify(offer.title || offer.career_id || "");

    const nextOffers = offers.map(function (o, i) {
      if (!o) return o;

      if (i === idx) {
        return {
          ...o,
          status: "accepted",
          accepted_at: nowIso
        };
      }

      if (o.status === "pending") {
        return {
          ...o,
          status: "withdrawn",
          withdrawn_at: nowIso
        };
      }

      return o;
    });

    setOffers(nextOffers);

    window.CivicationState?.setActivePosition?.({
      career_id: offer.career_id,
      career_name: offer.career_name,
      title: offer.title,
      threshold: offer.threshold ?? null,
      achieved_at: nowIso,
      role_key: role_key,
      brand_id: String(offer.brand_id || "").trim() || null,
      brand_name: String(offer.brand_name || "").trim() || null
    });

    if (window.CivicationObligationEngine?.activateJob) {
      window.CivicationObligationEngine.activateJob(
        offer.career_id,
        DEFAULT_OBLIGATION_IDS
      );
    } else {
      const now = Date.now();

      window.CivicationState?.setState?.({
        stability: "STABLE",
        warning_used: false,
        unemployed_since_week: null,
        active_role_key: role_key,
        career: {
          activeJob: offer.career_id,
          reputation: 70,
          salaryModifier: 1,
          obligations: DEFAULT_OBLIGATION_IDS.map(function (id) {
            return {
              id: id,
              lastCompleted: now,
              periodStart: now,
              progress: 0,
              status: "ok"
            };
          }),
          contract: {
            startedAt: now,
            mailsPerDay: 3,
            warningAfterDays: 7,
            fireAfterDays: 14,
            minCompletionRate: 0.30
          },
          progress: {
            expectedCount: 0,
            answeredCount: 0,
            completionRate: 1,
            daysSinceStart: 0,
            daysSinceLogin: 0,
            lastEvaluatedAt: now
          }
        }
      });
    }

    try {
      const active = window.CivicationState?.getActivePosition?.();
      window.CivicationCalendar?.startShiftForJob?.(active);
    } catch (e) {
      console.warn("Calendar shift start failed", e);
    }

    try {
      window.HG_CiviEngine?.onAppOpen?.({ force: true });
    } catch (e) {
      console.warn("Initial job mail trigger failed", e);
    }

    window.dispatchEvent(new Event("updateProfile"));
    return { ok: true, offer: nextOffers[idx] };
  }

  function declineOffer(offer_key) {
    const offers = expireOffers();
    const idx = offers.findIndex(function (o) {
      return o && o.offer_key === offer_key;
    });

    if (idx < 0) return { ok: false, reason: "not_found" };

    const offer = offers[idx];
    if (offer.status !== "pending") {
      return { ok: false, reason: "not_pending" };
    }

    offers[idx] = {
      ...offer,
      status: "declined",
      declined_at: new Date().toISOString()
    };

    setOffers(offers);

    window.dispatchEvent(new Event("updateProfile"));
    return { ok: true, offer: offers[idx] };
  }

  window.CivicationJobs = {
    getOffers,
    setOffers,
    expireOffers,
    getLatestPendingOffer,
    pushOffer,
    acceptOffer,
    declineOffer,
    hasActiveEmployment,
    canReceiveNewOffers
  };

  window.hgGetJobOffers = getOffers;
  window.hgSetJobOffers = setOffers;
})();
