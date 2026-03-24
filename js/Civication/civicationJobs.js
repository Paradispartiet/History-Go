// js/Civication/civicationJobs.js
(function () {
  const LS_OFFERS = "hg_job_offers_v1";
  const LS_JOB_HISTORY = "hg_job_history_v1";
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

  function currentWeekValue() {
    if (typeof window.weekKey === "function") {
      return window.weekKey(new Date());
    }
    return new Date().toISOString();
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

  function getJobHistory() {
    const raw = safeParse(localStorage.getItem(LS_JOB_HISTORY) || "[]", []);
    return Array.isArray(raw) ? raw : [];
  }

  function getLatestJobHistoryEntry() {
    const hist = getJobHistory();
    return hist[0] || null;
  }

  function getState() {
    return window.CivicationState?.getState?.() || {};
  }

  function getActivePosition() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  function hasActiveEmployment() {
    const state = getState();
    const activeJob = state?.career?.activeJob;
    const activePosition = getActivePosition();
    return !!(activeJob || activePosition);
  }

  function getLastExitReason() {
    const state = getState();
    const stateReason = state?.career?.lastExitReason;
    if (stateReason) return String(stateReason);

    const latest = getLatestJobHistoryEntry();
    return latest?.end_reason ? String(latest.end_reason) : null;
  }

  function canReceiveNewOffers() {
    if (hasActiveEmployment()) return false;

    const latest = getLatestJobHistoryEntry();
    if (!latest) return true;

    const reason = getLastExitReason();
    return reason === "fired" ||
      reason === "obligation_fail" ||
      reason === "completed";
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
    if (!canReceiveNewOffers()) return null;

    const offers = expireOffers();
    return offers.find(o => o && o.status === "pending") || null;
  }

  function pushOffer({ career_id, career_name, title, threshold, points_at_offer }) {
    if (!canReceiveNewOffers()) {
      return { ok: false, reason: "employment_locked" };
    }

    const badgeId = String(career_id || "").trim();
    const ttl = String(title || "").trim();
    const thr = Number(threshold);

    if (!badgeId || !ttl || !Number.isFinite(thr)) {
      return { ok: false, reason: "invalid_offer" };
    }

    const offer_key = `${badgeId}:${thr}`;
    const offers = getOffers();

    if (offers.some(o => o && o.offer_key === offer_key)) {
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
      status: "pending",
      created_iso: now.toISOString(),
      expires_iso: expires.toISOString()
    };

    offers.unshift(offer);
    setOffers(offers);

    return { ok: true, offer };
  }

  function endCurrentEmployment(reason, extraCareerPatch = {}) {
    const current = getState();
    const prev = getActivePosition();

    if (!prev && !current?.career?.activeJob) {
      return { ok: false, reason: "no_active_job" };
    }

    if (prev) {
      window.CivicationState?.appendJobHistoryEnded?.(
        prev,
        reason || "ended"
      );
    }

    window.CivicationState?.setActivePosition?.(null);

    window.CivicationState?.setState?.({
      unemployed_since_week: currentWeekValue(),
      active_role_key: null,
      career: {
        ...(current.career || {}),
        activeJob: null,
        obligations: [],
        contract: null,
        lastExitReason: reason || "ended",
        ...extraCareerPatch
      }
    });

    window.dispatchEvent(new Event("updateProfile"));
    return { ok: true, reason: reason || "ended" };
  }

  function completeCurrentEmployment(extraCareerPatch = {}) {
    return endCurrentEmployment("completed", extraCareerPatch);
  }

  function acceptOffer(offer_key) {
    if (hasActiveEmployment()) {
      return { ok: false, reason: "active_job" };
    }

    const offers = expireOffers();
    const idx = offers.findIndex(o => o && o.offer_key === offer_key);
    if (idx < 0) return { ok: false, reason: "not_found" };

    const offer = offers[idx];
    if (offer.status !== "pending") return { ok: false, reason: "not_pending" };

    const nowIso = new Date().toISOString();
    const role_key = slugify(offer.title || offer.career_id || "");

    const nextOffers = offers.map((o, i) => {
      if (!o) return o;
      if (i === idx) {
        return { ...o, status: "accepted", accepted_at: nowIso };
      }
      if (o.status === "pending") {
        return { ...o, status: "withdrawn", withdrawn_at: nowIso };
      }
      return o;
    });

    setOffers(nextOffers);

    const activePosition = {
      career_id: offer.career_id,
      career_name: offer.career_name,
      title: offer.title,
      threshold: offer.threshold ?? null,
      achieved_at: nowIso,
      role_key
    };

    window.CivicationState?.setActivePosition?.(activePosition);

    if (window.CivicationObligationEngine?.activateJob) {
      window.CivicationObligationEngine.activateJob(
        offer.career_id,
        DEFAULT_OBLIGATION_IDS
      );
    } else {
      const current = getState();
      const now = Date.now();
      window.CivicationState?.setState?.({
        unemployed_since_week: null,
        active_role_key: role_key,
        career: {
          ...(current.career || {}),
          activeJob: offer.career_id,
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
            reviewAfterDays: 7,
            completionMode: "obligations_once"
          },
          reputation: Number(current?.career?.reputation || 70),
          salaryModifier: Number(current?.career?.salaryModifier || 1),
          lastExitReason: null
        }
      });
    }

    if (window.HG_CiviEngine?.resetForNewJob) {
      window.HG_CiviEngine.resetForNewJob(role_key);
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
    declineOffer,
    hasActiveEmployment,
    canReceiveNewOffers,
    getLastExitReason,
    endCurrentEmployment,
    completeCurrentEmployment
  };

  // Backward compat for tidligere navn (så du ikke “mister” gamle kall)
  window.hgGetJobOffers = getOffers;
  window.hgSetJobOffers = setOffers;
})();
