// js/Civication/civicationJobs.js
(function () {
  const LS_OFFERS = "hg_job_offers_v1";
  const LS_FIRST_JOB_SEQ = "hg_first_job_sequence_v1";
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

  function getFirstJobSequenceState() {
    return safeParse(localStorage.getItem(LS_FIRST_JOB_SEQ) || "{}", {});
  }

  function setFirstJobSequenceState(obj) {
    localStorage.setItem(LS_FIRST_JOB_SEQ, JSON.stringify(obj && typeof obj === "object" ? obj : {}));
  }

  function markFirstJobSequenceDone(offerKey) {
    const current = getFirstJobSequenceState();
    current[String(offerKey || "")] = new Date().toISOString();
    setFirstJobSequenceState(current);
  }

  function hasFirstJobSequenceRun(offerKey) {
    const current = getFirstJobSequenceState();
    return !!current[String(offerKey || "")];
  }

  function makeInboxEnvelope(eventObj) {
    return {
      status: "pending",
      createdAt: Date.now(),
      event: eventObj
    };
  }

  function prependInboxEvents(events) {
    const valid = Array.isArray(events) ? events.filter(Boolean) : [];
    if (!valid.length) return;

    const existing = window.HG_CiviEngine?.getInbox?.() || [];
    const existingIds = new Set(existing.map(x => String(x?.event?.id || "")).filter(Boolean));
    const next = valid
      .filter(ev => !existingIds.has(String(ev.id || "")))
      .map(makeInboxEnvelope)
      .concat(existing);

    window.HG_CiviEngine?.setInbox?.(next);
  }

  function buildFirstJobIntroMail(offer) {
    const roleName = String(offer?.title || offer?.career_name || "rollen").trim() || "rollen";
    const careerName = String(offer?.career_name || "faget").trim() || "faget";
    return {
      id: `job_intro_${slugify(offer?.offer_key || roleName)}_${Date.now()}`,
      source: "Civication",
      subject: `Velkommen inn i ${roleName}`,
      situation: [
        `Du går nå inn i ${roleName}. Dette er den første tydelige overgangen fra quizkunnskap til faktisk rolleliv i Civication.`,
        `Det du har lært i ${careerName} er grunnen til at denne stillingen finnes for deg i det hele tatt.`,
        "Målet nå er ikke bare å svare riktig, men å finne rytmen i rollen og se hvordan byen begynner å forme hverdagen din.",
        "Når du åpner neste meldinger og hendelser, vil du se hvordan arbeid, miljø og personer begynner å henge sammen."
      ],
      choices: [
        {
          id: "A",
          label: "Gå inn i rollen og se hva den krever",
          effect: 1,
          tags: ["role_entry", "legitimacy"],
          feedback: "Du går inn i rollen med åpenhet. Nå begynner spillet å få en faktisk sosial retning."
        }
      ],
      feedback: "Du har tatt steget inn i rollen.",
      onboarding_tag: "first_job_intro"
    };
  }

  function buildFirstJobDayEvent(offer) {
    const roleName = String(offer?.title || offer?.career_name || "rollen").trim() || "rollen";
    return {
      id: `phase_first_day_${slugify(offer?.offer_key || roleName)}_${Date.now()}`,
      source: "Civication",
      subject: `Første dag i ${roleName}`,
      stage: "stable",
      situation: [
        `Dette er første dag i ${roleName}. Ingen forventer at du kan alt ennå, men de merker fort hvilken holdning du går inn med.`,
        "Det viktige nå er å finne tempoet, lese rommet og forstå hva slags person rollen faktisk belønner.",
        "Valget ditt her setter tonen for de neste meldingene, møtene og konfliktene du får."
      ],
      choices: [
        {
          id: "A",
          label: "Observer først og bygg forståelse",
          effect: 1,
          tags: ["craft", "process"],
          feedback: "Du går rolig inn i rytmen og begynner å forstå feltet før du prøver å markere deg."
        },
        {
          id: "B",
          label: "Ta initiativ tidlig og gjør deg synlig",
          effect: 0,
          tags: ["visibility", "initiative"],
          feedback: "Du gjør deg raskt synlig. Det kan gi fart, men også mer friksjon om du leser situasjonen feil."
        },
        {
          id: "C",
          label: "Hold lav profil og kom deg gjennom dagen",
          effect: 0,
          tags: ["caution", "self_protection"],
          feedback: "Du tar minst mulig plass. Det kjøper ro, men gir mindre eierskap til rollen."
        }
      ],
      feedback: "Første dag er satt i bevegelse.",
      onboarding_tag: "first_job_day"
    };
  }

  function ensureCuratedFirstJobSequence(offer) {
    if (!offer?.offer_key) return;
    if (hasFirstJobSequenceRun(offer.offer_key)) return;

    const events = [
      buildFirstJobDayEvent(offer),
      buildFirstJobIntroMail(offer)
    ];

    prependInboxEvents(events);
    markFirstJobSequenceDone(offer.offer_key);
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

    try {
      ensureCuratedFirstJobSequence(offer);
    } catch (e) {
      console.warn("Curated first job sequence failed", e);
    }

    if (typeof window.showToast === "function") {
      window.showToast(`💼 Du har gått inn i ${offer.title}. I inboxen ligger nå en første introduksjon og en første dagshendelse som setter tonen for rollen.`);
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
