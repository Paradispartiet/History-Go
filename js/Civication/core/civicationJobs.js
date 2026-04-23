// js/Civication/civicationJobs.js
(function () {
  const LS_OFFERS = "hg_job_offers_v1";
  const LS_FIRST_JOB_SEQ = "hg_first_job_sequence_v1";
  const LS_RECOVERY = "hg_civi_recovery_v1";
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

  function defaultRecoveryState() {
    return {
      active: false,
      reason: null,
      progress: 0,
      target: 3,
      previous_role: null,
      preferred_rebuild_flags: [],
      blocked_flags: [],
      arc_stage: "entry",
      arc_order: ["entry", "reckoning", "rebuild", "return"],
      completed_stages: []
    };
  }

  function getRecoveryState() {
    const raw = safeParse(localStorage.getItem(LS_RECOVERY) || "{}", {});
    return raw && typeof raw === "object"
      ? { ...defaultRecoveryState(), ...raw }
      : defaultRecoveryState();
  }

  function setRecoveryState(next) {
    const safeNext = next && typeof next === "object"
      ? { ...defaultRecoveryState(), ...next }
      : defaultRecoveryState();
    localStorage.setItem(LS_RECOVERY, JSON.stringify(safeNext));
    return safeNext;
  }

  function getRecoveryProfile(reason) {
    const key = String(reason || "setback").trim();

    if (key === "demotion_after_risk") {
      return {
        target: 4,
        preferred_rebuild_flags: [
          "systemsannhet",
          "ansvarssporing",
          "laringslinje",
          "signaturansvar"
        ],
        blocked_flags: [
          "midlertidig_redning",
          "hurtig_lukking",
          "glattet_fortelling"
        ],
        arc_order: ["entry", "reckoning", "rebuild", "return"]
      };
    }

    if (key === "lost_lead_role") {
      return {
        target: 4,
        preferred_rebuild_flags: [
          "uformell_ledelse",
          "systemsannhet",
          "krisefaglighet",
          "ansvarssporing"
        ],
        blocked_flags: [
          "midlertidig_redning",
          "hurtig_lukking",
          "glattet_fortelling"
        ],
        arc_order: ["entry", "reckoning", "rebuild", "return"]
      };
    }

    return {
      target: 3,
      preferred_rebuild_flags: [
        "systemsannhet",
        "erkjent_usynlig_kunnskap",
        "mentorlinje"
      ],
      blocked_flags: [
        "glidende_standard",
        "systemtilpasning",
        "flat_produksjonslogikk"
      ],
      arc_order: ["entry", "reckoning", "rebuild", "return"]
    };
  }

  function startRecovery(reason, active) {
    const profile = getRecoveryProfile(reason);

    const state = {
      active: true,
      reason: String(reason || "setback"),
      progress: 0,
      target: Number(profile.target || 3),
      preferred_rebuild_flags: Array.isArray(profile.preferred_rebuild_flags)
        ? profile.preferred_rebuild_flags
        : [],
      blocked_flags: Array.isArray(profile.blocked_flags)
        ? profile.blocked_flags
        : [],
      arc_stage: "entry",
      arc_order: Array.isArray(profile.arc_order) && profile.arc_order.length
        ? profile.arc_order
        : ["entry", "reckoning", "rebuild", "return"],
      completed_stages: [],
      started_at: new Date().toISOString(),
      previous_role: active ? {
        career_id: active.career_id || null,
        career_name: active.career_name || null,
        title: active.title || null,
        threshold: active.threshold ?? null
      } : null
    };

    setRecoveryState(state);

    if (typeof window.showToast === "function") {
      window.showToast("🛠️ Du er i en gjenoppbyggingsfase. Vis stabilitet før nye roller åpner seg igjen.");
    }

    window.dispatchEvent(new Event("updateProfile"));
    return state;
  }

  function clearRecovery() {
    return setRecoveryState({
      active: false,
      reason: null,
      progress: 0,
      target: 3,
      previous_role: null,
      preferred_rebuild_flags: [],
      blocked_flags: [],
      arc_stage: "entry",
      arc_order: ["entry", "reckoning", "rebuild", "return"],
      completed_stages: [],
      started_at: null,
      completed_at: new Date().toISOString()
    });
  }

  function getBranchFlags() {
    const branch = window.CivicationState?.getMailBranchState?.() || {};
    return Array.isArray(branch.flags) ? branch.flags : [];
  }

  function getRecoveryArcStage() {
    const state = getRecoveryState();
    return String(state.arc_stage || "entry");
  }

  function advanceRecoveryArc() {
    const current = getRecoveryState();
    if (!current.active) return current;

    const arcOrder = Array.isArray(current.arc_order) && current.arc_order.length
      ? current.arc_order
      : ["entry", "reckoning", "rebuild", "return"];

    const currentStage = String(current.arc_stage || arcOrder[0] || "entry");
    const currentIndex = Math.max(0, arcOrder.indexOf(currentStage));
    const nextIndex = Math.min(arcOrder.length - 1, currentIndex + 1);
    const nextStage = arcOrder[nextIndex] || currentStage;
    const completed = Array.isArray(current.completed_stages)
      ? current.completed_stages.slice()
      : [];

    if (!completed.includes(currentStage)) {
      completed.push(currentStage);
    }

    const next = {
      ...current,
      arc_stage: nextStage,
      completed_stages: completed,
      last_arc_transition_at: new Date().toISOString()
    };

    setRecoveryState(next);
    window.dispatchEvent(new Event("updateProfile"));
    return next;
  }

  function advanceRecovery() {
    const current = getRecoveryState();
    if (!current.active) return current;

    const flags = getBranchFlags();
    const preferred = Array.isArray(current.preferred_rebuild_flags)
      ? current.preferred_rebuild_flags
      : [];
    const blocked = Array.isArray(current.blocked_flags)
      ? current.blocked_flags
      : [];

    const matchedPreferred = preferred.filter((flag) => flags.includes(flag)).length;
    const matchedBlocked = blocked.filter((flag) => flags.includes(flag)).length;

    let delta = 0;
    if (matchedPreferred > 0) delta += 1;
    if (matchedPreferred >= 2) delta += 1;
    if (matchedBlocked > 0) delta -= 1;

    const nextProgress = Math.max(
      0,
      Math.min(Number(current.target || 3), Number(current.progress || 0) + delta)
    );

    const next = {
      ...current,
      progress: nextProgress,
      last_delta: delta,
      last_flags_snapshot: flags.slice(0, 12),
      last_progress_at: new Date().toISOString()
    };

    if (delta <= 0 && typeof window.showToast === "function") {
      window.showToast("🧩 Gjenoppbygging krever andre valg. Du står ikke helt støtt ennå.");
    }

    if (next.progress >= Number(next.target || 3)) {
      const advanced = advanceRecoveryArc();
      const updated = getRecoveryState();
      if (String(updated.arc_stage) === "return") {
        const done = clearRecovery();
        if (typeof window.showToast === "function") {
          window.showToast("✅ Du har bygget deg opp igjen. Karriereveier åpner seg på nytt.");
        }
        return done;
      }

      setRecoveryState({
        ...advanced,
        progress: 0,
        target: Number(current.target || 3)
      });
      return getRecoveryState();
    }

    setRecoveryState(next);
    window.dispatchEvent(new Event("updateProfile"));
    return next;
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

  function removeActivePosition(reason) {
    const active = window.CivicationState?.getActivePosition?.();
    if (active) {
      window.CivicationState?.appendJobHistoryEnded?.(active, reason || "ended");
    }

    window.CivicationState?.setActivePosition?.(null);
    window.CivicationState?.setState?.({
      active_role_key: null,
      career: {
        activeJob: null,
        obligations: [],
        reputation: 50,
        salaryModifier: 1
      }
    });
  }

  function maybeApplyNegativeCareerOutcome(active) {
    const currentTitle = String(active?.title || "").trim().toLowerCase();
    const currentCareerId = String(active?.career_id || "").trim();
    if (currentCareerId !== "naeringsliv") return null;

    const flags = getBranchFlags();

    const severeRisk = [
      "midlertidig_redning",
      "hurtig_lukking",
      "glattet_fortelling"
    ];

    const stagnationRisk = [
      "glidende_standard",
      "systembevarer",
      "barer_videre",
      "flat_produksjonslogikk",
      "systemtilpasning"
    ];

    const hasSevereRisk = severeRisk.some((flag) => flags.includes(flag));
    const hasStagnationRisk = stagnationRisk.some((flag) => flags.includes(flag));

    if (currentTitle === "formann" && hasSevereRisk) {
      startRecovery("demotion_after_risk", active);
      removeActivePosition("demoted_after_risk_path");
      if (typeof window.showToast === "function") {
        window.showToast("⚠️ Du mistet tillit i rollen. Formannsansvaret ble trukket tilbake.");
      }
      window.dispatchEvent(new Event("updateProfile"));
      return { ok: true, type: "demotion", reason: "severe_risk_formann" };
    }

    if (currentTitle === "mellomleder" && hasSevereRisk) {
      startRecovery("lost_lead_role", active);
      removeActivePosition("lost_lead_role_after_risk_path");
      if (typeof window.showToast === "function") {
        window.showToast("⚠️ Rollen som mellomleder holdt ikke. Du falt ut av lederløpet.");
      }
      window.dispatchEvent(new Event("updateProfile"));
      return { ok: true, type: "role_loss", reason: "severe_risk_mellomleder" };
    }

    if (currentTitle === "fagarbeider" && hasStagnationRisk) {
      if (typeof window.showToast === "function") {
        window.showToast("📉 Du holder deg i arbeid, men utviklingen stagnerer. Ingen ny rolle åpner seg ennå.");
      }
      return { ok: true, type: "stagnation", reason: "stagnation_path" };
    }

    return null;
  }

  function maybeOfferCareerProgression(active) {
    const recovery = getRecoveryState();
    if (recovery.active) {
      advanceRecovery();
      return { ok: false, reason: "recovery_active", recovery: getRecoveryState() };
    }

    const negative = maybeApplyNegativeCareerOutcome(active);
    if (negative?.type === "demotion" || negative?.type === "role_loss") {
      return negative;
    }

    const currentTitle = String(active?.title || "").trim().toLowerCase();
    const currentCareerId = String(active?.career_id || "").trim();
    if (currentCareerId !== "naeringsliv") return negative || null;

    const flags = getBranchFlags();

    if (currentTitle === "fagarbeider") {
      const qualifiesForMellomleder = [
        "uformell_ledelse",
        "styrer_uten_tittel",
        "systemsannhet",
        "ansvarssporing",
        "krisefaglighet"
      ].some((flag) => flags.includes(flag));

      if (!qualifiesForMellomleder) return negative || null;

      return pushOffer({
        career_id: currentCareerId,
        career_name: String(active?.career_name || "Næringsliv").trim(),
        title: "Mellomleder",
        threshold: Number(active?.threshold || 0) + 1,
        points_at_offer: Number(active?.threshold || 0) + 1
      });
    }

    if (currentTitle === "mellomleder") {
      const qualifiesForFormann = [
        "systemsannhet",
        "krisefaglighet",
        "verdighetslinje",
        "sprik_synliggjort"
      ].some((flag) => flags.includes(flag));

      if (!qualifiesForFormann) return negative || null;

      return pushOffer({
        career_id: currentCareerId,
        career_name: String(active?.career_name || "Næringsliv").trim(),
        title: "Formann",
        threshold: Number(active?.threshold || 0) + 1,
        points_at_offer: Number(active?.threshold || 0) + 1
      });
    }

    return negative || null;
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
      onboarding_tag: "first_job_intro",
      mail_class: "onboarding"
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
      onboarding_tag: "first_job_day",
      mail_class: "onboarding"
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

    const active = window.CivicationState?.getActivePosition?.();
    window.CivicationState?.ensureOnboardingState?.(active);
    window.CivicationState?.setOnboardingState?.(active, {
      intro_done: false,
      first_day_done: false,
      complete: false
    });

    clearRecovery();

    if (window.CivicationObligationEngine?.activateJob) {
      window.CivicationObligationEngine.activateJob(
        offer.career_id,
        DEFAULT_OBLIGATION_IDS
      );
    }

    try {
      window.CivicationCalendar?.startShiftForJob?.(active);
    } catch (e) {
      console.warn("Calendar shift start failed", e);
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
    canReceiveNewOffers,
    maybeOfferCareerProgression,
    maybeApplyNegativeCareerOutcome,
    getRecoveryState,
    setRecoveryState,
    startRecovery,
    clearRecovery,
    advanceRecovery,
    getRecoveryProfile,
    getRecoveryArcStage,
    advanceRecoveryArc
  };

  window.hgGetJobOffers = getOffers;
  window.hgSetJobOffers = setOffers;
})();
