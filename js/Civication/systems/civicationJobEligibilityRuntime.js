// js/Civication/systems/civicationJobEligibilityRuntime.js
// CivicationJobEligibilityRuntime — smal dual-gate-modell for jobbtilgang + fired
// category reentry lock.
//
// Prinsipp:
// - Career outcome (PROMOTED/STAGNATED/FIRED) bestemmer hva som skjer med NÅVÆRENDE
//   arbeidsforhold. Det eies fortsatt av CivicationCareerOutcomeRuntime og er urørt her.
// - Denne filen bestemmer ikke career outcome. Den svarer på et annet, smalere spørsmål:
//   er et jobbtilbud kvalifisert, og gjennom hvilken port?
// - To porter:
//     knowledge_gate = History Go / quiz / merits / kunnskap
//     learning_gate  = Civication / job learning progress / mastered roles / unlocked skills
// - FIRED gir konsekvens uten game over: samme kategori låses midlertidig (reentry lock)
//   til spilleren har jobbet i en annen kategori OG besvart minst én plan-fremmende
//   jobbmail der. FIRED sletter aldri quiz/merits, job_learning_progress, mastered roles,
//   unlocked_skills eller job history.
//
// Avgrensning (denne PR-en):
// - Ikke en full karrieremotor. Ingen auto-promote. Skriver aldri career_outcome_state.
// - Knowledge gate er KONTRAKTSKLAR, men konkrete quizkrav per jobb kommer i en senere PR.
//   Derfor håndheves ikke knowledge gate aggressivt: mangler eksplisitte krav, returneres
//   "not_configured"/"unknown" og tilbud blokkeres ikke av den grunn.

(function () {
  "use strict";

  // Egen state-slice i hg_civi_state_v1. Kategorinøkkel (f.eks. "naeringsliv", "media").
  const LOCKS_KEY = "career_reentry_locks";

  function norm(value) {
    return String(value || "").trim();
  }

  function lower(value) {
    return norm(value).toLowerCase();
  }

  function getState() {
    return window.CivicationState?.getState?.() || {};
  }

  function setState(patch) {
    return window.CivicationState?.setState?.(patch || {}) || null;
  }

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  // Tolerant kategori-resolver. Bruker en stabil kategori fra aktiv stilling / tilbud.
  // Rekkefølge: category → career_id → career → role_id-prefiks (etablert næringslivsprefiks).
  // Returnerer "" når kategori ikke kan løses — da skal ingen lock opprettes (ikke crash,
  // ikke lås alt).
  function resolveCategoryFrom(obj) {
    if (!obj || typeof obj !== "object") return "";
    const direct = lower(obj.category) || lower(obj.career_id) || lower(obj.career);
    if (direct) return direct;
    const roleId = lower(obj.role_id);
    if (roleId.startsWith("naer_") || roleId === "naer") return "naeringsliv";
    return "";
  }

  function resolveCategory(active) {
    return resolveCategoryFrom(active);
  }

  function resolveOfferCategory(offer) {
    return resolveCategoryFrom(offer);
  }

  // ---------------------------------------------------------------------------
  // Reentry locks state slice.
  // ---------------------------------------------------------------------------

  function getReentryLocks(state) {
    const map = state && typeof state === "object" ? state[LOCKS_KEY] : null;
    return map && typeof map === "object" && !Array.isArray(map) ? map : {};
  }

  function isLockActive(lock) {
    return !!lock && typeof lock === "object" && lower(lock.status) === "locked";
  }

  // Returnerer en aktiv (status === "locked") lock for kategorien, ellers null.
  // Cleared/utløpte entries blokkerer ikke.
  function getActiveLockForCategory(state, category) {
    const cat = lower(category);
    if (!cat) return null;
    const lock = getReentryLocks(state)[cat];
    return isLockActive(lock) ? lock : null;
  }

  function isCategoryLocked(state, category) {
    return !!getActiveLockForCategory(state, category);
  }

  function hasAnyActiveLock(state) {
    return Object.values(getReentryLocks(state)).some(isLockActive);
  }

  // ---------------------------------------------------------------------------
  // FIRED → opprett kategori-lock. Pure: returnerer en state-patch
  // ({ career_reentry_locks }) som caller skriver via CivicationState.setState.
  // Bevarer all læringsprogresjon og skills (rører kun låsen). Returnerer null når
  // kategori ikke kan løses (ingen lock uten kategori).
  // ---------------------------------------------------------------------------
  function createFiredReentryLock(state, active, meta) {
    const category = resolveCategory(active);
    if (!category) return null;

    const locks = { ...getReentryLocks(state) };
    locks[category] = {
      status: "locked",
      reason: "fired",
      locked_at: (meta && meta.decided_at) || new Date().toISOString(),
      fired_category: category,
      fired_role_id: norm(active?.role_id) || null,
      fired_role_title: norm(active?.title) || null,
      cleared_by_category: null,
      cleared_by_role_id: null,
      cleared_at: null,
      clear_condition: "worked_other_category"
    };
    return { [LOCKS_KEY]: locks };
  }

  // Samme smale signal som job learning bruker: plan-fremmende jobbmail, men aldri
  // terminal/outcome-mail. Gjenbruker CivicationJobLearningRuntime når den finnes.
  function mailQualifiesForReentry(eventObj) {
    const jl = window.CivicationJobLearningRuntime;
    if (jl && typeof jl.shouldMailGrantLearning === "function") {
      try { return jl.shouldMailGrantLearning(eventObj) === true; } catch (_e) { /* fall through */ }
    }
    const sourceType = norm(eventObj?.source_type || eventObj?.role_content_meta?.source_type);
    if (sourceType === "role_outcome") return false;
    if (norm(eventObj?.mail_class) === "career_outcome") return false;
    if (sourceType === "planned") return true;
    return eventObj?.daily_mail_meta?.advances_role_plan === true;
  }

  // ---------------------------------------------------------------------------
  // Clear lock — KUN etter faktisk jobb i en annen kategori. Krav:
  //   1. aktiv jobb i en annen kategori enn den låste
  //   2. besvart minst én plan-fremmende jobbmail i den andre kategorien
  // Pure: returnerer patch eller null. Beholder cleared entries (status: "cleared")
  // slik at eligibility kun blokkerer status: "locked".
  // ---------------------------------------------------------------------------
  function clearReentryLockIfQualified(state, active, eventObj) {
    if (!mailQualifiesForReentry(eventObj)) return null;

    const activeCategory = resolveCategory(active);
    if (!activeCategory) return null;

    const locks = getReentryLocks(state);
    const next = { ...locks };
    let changed = false;

    for (const [cat, lock] of Object.entries(locks)) {
      if (!isLockActive(lock)) continue;
      if (cat === activeCategory) continue; // samme kategori clearer aldri seg selv
      next[cat] = {
        ...lock,
        status: "cleared",
        cleared_at: new Date().toISOString(),
        cleared_by_category: activeCategory,
        cleared_by_role_id: norm(active?.role_id) || null
      };
      changed = true;
    }

    return changed ? { [LOCKS_KEY]: next } : null;
  }

  // Kombinert beslutning for én besvart mail: FIRED-outcome → opprett lock; ellers,
  // hvis mailen er plan-fremmende → forsøk clear. Returnerer patch eller null.
  function processAnsweredMail(state, activeBefore, eventObj) {
    const isOutcome = norm(eventObj?.source_type) === "role_outcome" ||
      norm(eventObj?.mail_class) === "career_outcome";
    const status = norm(eventObj?.career_outcome_meta?.status).toUpperCase();

    // STAGNATED og PROMOTED gir ALDRI lock (de faller bare gjennom her).
    if (isOutcome && status === "FIRED") {
      return createFiredReentryLock(state, activeBefore, eventObj?.career_outcome_meta);
    }
    return clearReentryLockIfQualified(state, activeBefore, eventObj);
  }

  // ---------------------------------------------------------------------------
  // Dual-gate eligibility.
  // ---------------------------------------------------------------------------

  // Knowledge gate: kontraktsklar, men ikke håndhevet ennå. Har tilbudet/targetRole
  // eksplisitte kunnskapskrav, leses de tolerant; mangler de, returneres "not_configured"
  // og tilbudet blokkeres ALDRI av denne grunn. Konkrete quizkrav per jobb kommer senere.
  function readKnowledgeGate(offer, targetRole) {
    const req =
      offer?.knowledge_requirements ||
      offer?.requirements?.knowledge ||
      offer?.knowledge_gate ||
      targetRole?.knowledge_requirements ||
      targetRole?.requirements?.knowledge ||
      null;

    const hasReq = Array.isArray(req)
      ? req.length > 0
      : (req && typeof req === "object" ? Object.keys(req).length > 0 : !!norm(req));

    if (!hasReq) {
      return {
        status: "not_configured",
        source: "not_configured",
        detail: "Ingen eksplisitte kunnskapskrav er definert for dette tilbudet ennå."
      };
    }
    // Krav finnes, men per-jobb quizkontrakt er ikke implementert ennå: les tolerant,
    // marker som "unknown", og blokker likevel ikke i denne PR-en.
    return {
      status: "unknown",
      source: "offer_requirements",
      detail: "Kunnskapskrav finnes, men håndheves ikke ennå i denne versjonen."
    };
  }

  // Learning gate: bruker job learning-signaler (readiness, mastered roles, unlocked
  // skills). Skriver ALDRI career outcome og promoterer ALDRI automatisk — kun et signal.
  function readLearningGate(state, active) {
    const jl = window.CivicationJobLearningRuntime;
    let signals = null;
    if (jl && typeof jl.getCareerLearningSignals === "function") {
      try { signals = jl.getCareerLearningSignals(state, active); } catch (_e) { signals = null; }
    }

    if (!signals) {
      return {
        status: "not_required",
        source: "not_configured",
        detail: ""
      };
    }

    const level = lower(signals.readinessLevel) || "none";
    const STATUS_BY_LEVEL = {
      strong: "strong",
      ready_for_next_step: "ready_for_next_step",
      building: "building",
      none: "not_required"
    };
    return {
      status: STATUS_BY_LEVEL[level] || "not_required",
      source: "job_learning_progress",
      detail: norm(signals.readinessDetail) || norm(signals.readinessLabel) || ""
    };
  }

  // Career state modifier: leser (men skriver ALDRI) career_outcome_state for å foreslå
  // rute. STAGNATED gir ingen lock — bare en mulig exit-rute.
  function readCareerStateModifier(state) {
    const status = norm(state?.career_outcome_state?.status).toUpperCase();
    if (status === "STAGNATED") return { status: "stagnated" };
    if (status === "PROMOTED") return { status: "promoted" };
    if (status === "FIRED") return { status: "fired" };
    return { status: "clear" };
  }

  function resolveOfferRoute(ctx) {
    if (ctx.blocked) return "recovery_after_fired";
    if (ctx.hasLock && !ctx.active) return "recovery_after_fired";
    if (ctx.careerState === "stagnated") return "exit_from_stagnation";
    if (ctx.active && ctx.activeCategory && ctx.offerCategory) {
      return ctx.activeCategory === ctx.offerCategory ? "internal_progression" : "lateral_move";
    }
    if (ctx.offerCategory) return "external_entry";
    return "unknown";
  }

  /**
   * Pure, DOM-free dual-gate eligibility for et jobbtilbud.
   * @param {any} state Civication state.
   * @param {any} offer Jobbtilbud (career_id/category/title/role_id/requirements ...).
   * @param {{ active?: any, targetRole?: any }} [options]
   */
  function getJobOfferEligibility(state, offer, options) {
    const s = state && typeof state === "object" ? state : getState();
    const opts = options && typeof options === "object" ? options : {};
    const active = opts.active !== undefined ? opts.active : getActive();
    const targetRole = opts.targetRole || null;

    const offerCategory = resolveOfferCategory(offer);
    const activeCategory = resolveCategory(active);

    const knowledgeGate = readKnowledgeGate(offer, targetRole);
    const learningGate = readLearningGate(s, active);
    const careerStateModifier = readCareerStateModifier(s);

    const reasons = [];
    const blockers = [];

    // Reentry lock: blokker KUN samme kategori som en aktiv lock.
    const lock = offerCategory ? getActiveLockForCategory(s, offerCategory) : null;
    let reentryLock;
    if (lock) {
      reentryLock = {
        status: "blocked",
        category: offerCategory,
        reason: norm(lock.reason) || "fired",
        fired_role_id: lock.fired_role_id || null,
        locked_at: lock.locked_at || null
      };
      blockers.push(
        `Kategorien «${offerCategory}» er midlertidig låst etter at du fikk sparken. ` +
        "Jobb i en annen kategori og besvar minst én plan-fremmende jobbmail der før den åpnes igjen."
      );
    } else {
      reentryLock = { status: "clear" };
    }

    if (learningGate.detail) reasons.push(learningGate.detail);

    const eligible = blockers.length === 0;
    const offerRoute = resolveOfferRoute({
      active,
      activeCategory,
      offerCategory,
      careerState: careerStateModifier.status,
      blocked: !!lock,
      hasLock: hasAnyActiveLock(s)
    });

    return {
      eligible,
      offerRoute,
      knowledgeGate,
      learningGate,
      careerStateModifier,
      reentryLock,
      reasons,
      blockers
    };
  }

  // Berik et tilbud med additiv eligibility-metadata (endrer ikke offer-shape destruktivt).
  function decorateOfferWithEligibility(offer, state, active) {
    if (!offer || typeof offer !== "object") return offer;
    const el = getJobOfferEligibility(state, offer, { active });
    return {
      ...offer,
      eligibility: {
        offer_route: el.offerRoute,
        knowledge_gate: el.knowledgeGate.status,
        learning_gate: el.learningGate.status,
        reentry_lock: el.reentryLock.status,
        career_state: el.careerStateModifier.status,
        reasons: el.reasons,
        blockers: el.blockers
      }
    };
  }

  // ---------------------------------------------------------------------------
  // Wiring.
  // ---------------------------------------------------------------------------

  // Patch CivicationEventEngine.answer: etter en vellykket besvarelse, oppdater reentry
  // locks. FIRED-outcome → opprett lock for fired-kategorien; plan-fremmende mail i en
  // annen kategori → clear lock. Speiler hvordan job learning / career outcome patcher
  // answer. Skriver ALDRI career_outcome_state. Idempotent og guardet.
  function patchEventEngineAnswer() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__civicationJobEligibilityAnswerPatched === true) return false;
    if (typeof proto.answer !== "function") return false;

    const original = proto.answer;
    proto.answer = async function jobEligibilityAnswer(eventId, choiceId) {
      const pending = typeof this.getPendingEvent === "function" ? this.getPendingEvent() : null;
      const eventObj = pending?.event || null;
      // Fang aktiv stilling FØR svaret: FIRED-flyten nuller hg_active_position_v1.
      const activeBefore = getActive();

      const result = await original.call(this, eventId, choiceId);

      if (result?.ok !== false && eventObj) {
        try {
          const patch = processAnsweredMail(getState(), activeBefore, eventObj);
          if (patch) {
            setState(patch);
            try { window.dispatchEvent(new Event("updateProfile")); } catch (_e) {}
          }
        } catch (_err) {
          // Reentry-lock er best-effort: aldri bryt svar-flyten.
        }
      }

      return result;
    };

    proto.__civicationJobEligibilityAnswerPatched = true;
    return true;
  }

  // Patch CivicationJobs.pushOffer: trygt filterpunkt. Når et tilbuds kategori er aktivt
  // låst, opprett IKKE tilbudet (returner ok:false + eligibility). Ellers berik det
  // opprettede tilbudet med additiv eligibility-metadata. Alt guardet — feiler aldri
  // den eksisterende offerstrømmen.
  function patchJobsPushOffer() {
    const jobs = window.CivicationJobs;
    if (!jobs || jobs.__civicationEligibilityPushOfferPatched === true) return false;
    if (typeof jobs.pushOffer !== "function") return false;

    const original = jobs.pushOffer.bind(jobs);
    jobs.pushOffer = function eligibilityPushOffer(input) {
      try {
        const state = getState();
        const offerCategory = resolveOfferCategory(input);
        if (offerCategory && getActiveLockForCategory(state, offerCategory)) {
          return {
            ok: false,
            reason: "reentry_locked",
            eligibility: getJobOfferEligibility(state, input, { active: getActive() })
          };
        }
      } catch (_e) { /* fall through to original */ }

      const result = original(input);

      try {
        if (result && result.ok && result.offer && typeof result.offer === "object") {
          const decorated = decorateOfferWithEligibility(result.offer, getState(), getActive());
          result.offer = decorated;
          // Persister beriket tilbud tilbake til lageret (additivt felt).
          if (typeof jobs.getOffers === "function" && typeof jobs.setOffers === "function") {
            const offers = jobs.getOffers();
            const idx = offers.findIndex((o) => o && o.offer_key === decorated.offer_key);
            if (idx >= 0) {
              offers[idx] = decorated;
              jobs.setOffers(offers);
            }
          }
        }
      } catch (_e) { /* enrichment er best-effort */ }

      return result;
    };

    jobs.__civicationEligibilityPushOfferPatched = true;
    return true;
  }

  function boot() {
    patchEventEngineAnswer();
    patchJobsPushOffer();
  }

  window.CivicationJobEligibilityRuntime = {
    LOCKS_KEY,
    // Kategori
    resolveCategory,
    resolveOfferCategory,
    // Locks
    getReentryLocks,
    getActiveLockForCategory,
    isCategoryLocked,
    hasAnyActiveLock,
    createFiredReentryLock,
    clearReentryLockIfQualified,
    mailQualifiesForReentry,
    processAnsweredMail,
    // Eligibility
    getJobOfferEligibility,
    decorateOfferWithEligibility,
    // Wiring
    patchEventEngineAnswer,
    patchJobsPushOffer,
    boot,
    inspect() {
      const state = getState();
      const active = getActive();
      const locks = getReentryLocks(state);
      return {
        active_locks: Object.entries(locks)
          .filter(([, lock]) => isLockActive(lock))
          .map(([category]) => category),
        all_locks: locks,
        answer_patched: window.CivicationEventEngine?.prototype?.__civicationJobEligibilityAnswerPatched === true,
        push_offer_patched: window.CivicationJobs?.__civicationEligibilityPushOfferPatched === true,
        sample_eligibility: getJobOfferEligibility(state, active || {}, { active })
      };
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);
})();
