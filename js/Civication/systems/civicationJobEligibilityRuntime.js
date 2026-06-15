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
// - Knowledge gate har nå en smal, reell evaluering mot eksisterende History Go quiz-
//   progresjon (quiz_progress[category].completed), styrt av en liten datafil
//   data/Civication/jobKnowledgeRequirements.json. Den håndheves forsiktig:
//     not_required / not_configured / unknown blokkerer ALDRI,
//     soft_required forklarer men blokkerer ikke,
//     kun required + sikkert "missing" kan blokkere.
//   Mangler quiz-kilden, returneres "unknown" (aldri en falsk "missing").

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

  // ---------------------------------------------------------------------------
  // Knowledge gate: knowledge requirements registry + History Go progress resolver.
  //
  // History Go-siden av dual-gaten. Krav kommer fra to steder:
  //   1. eksplisitte krav på offer/targetRole, eller
  //   2. data/Civication/jobKnowledgeRequirements.json (lastet best-effort, keyet på
  //      offer-kategori / role_id), registrert i KNOWLEDGE_REQUIREMENTS.
  //
  // Progresjon leses tolerant fra eksisterende History Go quiz-signaler
  // (quiz_progress[category].completed) — fra den innsendte staten først, så
  // localStorage. Ingenting skrives. Manglende/uleselig kilde gir "unknown", aldri en
  // falsk "missing".
  // ---------------------------------------------------------------------------

  // Registry populated best-effort fra jobKnowledgeRequirements.json og/eller
  // registerKnowledgeRequirements(). Null til noe registreres, slik at et tilbud uten
  // konfig faller tilbake til "not_configured" (blokkerer aldri).
  let KNOWLEDGE_REQUIREMENTS = null;

  function isPlainObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function readJsonLocalStorage(key) {
    try {
      if (typeof localStorage === "undefined" || !localStorage) return undefined;
      const raw = localStorage.getItem(key);
      if (raw == null) return undefined;
      const parsed = JSON.parse(raw);
      return parsed == null ? undefined : parsed;
    } catch (_e) {
      return undefined;
    }
  }

  // Plukk en kunnskapskilde fra innsendt state først (slik at tester/callere kan injisere
  // den), så fra localStorage (den faktiske History Go-lagringen). Returnerer objektet og
  // om en brukbar kilde faktisk fantes — sistnevnte avgjør unknown vs missing.
  function readKnowledgeSource(state, key) {
    if (state && typeof state === "object" && isPlainObject(state[key])) {
      return { value: state[key], present: true };
    }
    const fromLs = readJsonLocalStorage(key);
    if (isPlainObject(fromLs)) return { value: fromLs, present: true };
    return { value: {}, present: false };
  }

  // Tolerant snapshot av History Go kunnskapsprogresjon. Kaster aldri, skriver aldri.
  // quizCompletedByCategory[cat] = antall fullførte quiz registrert i
  // quiz_progress[cat].completed. hasQuizSource er false når ingen quiz_progress kunne
  // leses (da blir krav "unknown", ikke "missing").
  function getKnowledgeProgressSnapshot(state) {
    const quiz = readKnowledgeSource(state, "quiz_progress");
    const merits = readKnowledgeSource(state, "merits_by_category");

    const quizCompletedByCategory = {};
    for (const [cat, entry] of Object.entries(quiz.value)) {
      const key = lower(cat);
      if (!key) continue;
      const completed = entry && Array.isArray(entry.completed) ? entry.completed : [];
      quizCompletedByCategory[key] = completed.filter((id) => norm(id)).length;
    }

    const meritPointsByCategory = {};
    for (const [cat, entry] of Object.entries(merits.value)) {
      const key = lower(cat);
      if (!key) continue;
      const points = Number(entry && entry.points);
      meritPointsByCategory[key] = Number.isFinite(points) ? points : 0;
    }

    return {
      hasQuizSource: quiz.present,
      hasMeritSource: merits.present,
      quizCompletedByCategory,
      meritPointsByCategory
    };
  }

  // Evaluer ett enkelt kunnskapskrav mot snapshotet. Returnerer et lite, serialiserbart
  // resultat. Ukjente/ustøttede kravtyper og uleselige kilder gir "unknown" (aldri en
  // falsk "missing").
  function evaluateKnowledgeRequirement(state, requirement, snapshot) {
    const snap = snapshot || getKnowledgeProgressSnapshot(state);

    // Strengkrav (legacy/opake id-er) kan ikke evalueres ennå.
    if (typeof requirement === "string") {
      return { type: "opaque", raw: requirement, status: "unknown", detail: "Kravet kan ikke tolkes ennå." };
    }
    if (!isPlainObject(requirement)) {
      return { type: "invalid", status: "unknown", detail: "Ugyldig kunnskapskrav." };
    }

    const type = lower(requirement.type);

    if (type === "category_quiz_count") {
      const category = lower(requirement.category);
      const min = Number(requirement.min_completed);
      const minCompleted = Number.isFinite(min) && min > 0 ? Math.floor(min) : 1;
      if (!category) {
        return { type, status: "unknown", detail: "Kravet mangler kategori." };
      }
      if (!snap.hasQuizSource) {
        return {
          type, category, min_completed: minCompleted, observed: null,
          status: "unknown", detail: "Quiz-progresjon kunne ikke leses."
        };
      }
      const observed = Number(snap.quizCompletedByCategory[category]) || 0;
      const ok = observed >= minCompleted;
      return {
        type,
        category,
        min_completed: minCompleted,
        observed,
        status: ok ? "passed" : "missing",
        detail: ok
          ? `Fullført ${observed} quiz i ${category}.`
          : `Fullført ${observed} av ${minCompleted} quiz i ${category}.`
      };
    }

    return { type: type || "unknown", status: "unknown", detail: "Ukjent kravtype." };
  }

  function normalizeRequirementList(req) {
    if (Array.isArray(req)) return req.slice();
    if (isPlainObject(req)) {
      if (Array.isArray(req.requirements)) return req.requirements.slice();
      return [req];
    }
    if (norm(req)) return [norm(req)];
    return [];
  }

  // Resolve kunnskapskrav-konfig for et tilbud/targetRole. Rekkefølge:
  //   1. eksplisitte krav på offer/targetRole (source "offer_requirements")
  //   2. role-keyet konfig i jobKnowledgeRequirements.roles[role_id]
  //   3. kategori-keyet konfig i jobKnowledgeRequirements.categories[category]
  // Returnerer null når ingenting gjelder (=> not_configured, blokkerer aldri).
  function getKnowledgeRequirementForOffer(offer, targetRole) {
    const explicit =
      offer?.knowledge_requirements ||
      offer?.requirements?.knowledge ||
      offer?.knowledge_gate ||
      targetRole?.knowledge_requirements ||
      targetRole?.requirements?.knowledge ||
      null;
    const explicitList = normalizeRequirementList(explicit);
    if (explicitList.length > 0) {
      const mode = isPlainObject(explicit) && norm(explicit.mode) ? lower(explicit.mode) : "required";
      return { source: "offer_requirements", mode, label: "", requirements: explicitList };
    }

    const registry = isPlainObject(KNOWLEDGE_REQUIREMENTS) ? KNOWLEDGE_REQUIREMENTS : null;
    if (!registry) return null;

    const roles = isPlainObject(registry.roles) ? registry.roles : {};
    const roleId = norm(offer?.role_id) || norm(targetRole?.role_id);
    if (roleId && isPlainObject(roles[roleId])) {
      const cfg = roles[roleId];
      return {
        source: "jobKnowledgeRequirements",
        mode: lower(cfg.mode) || "not_required",
        label: norm(cfg.label),
        requirements: normalizeRequirementList(cfg.requirements)
      };
    }

    const categories = isPlainObject(registry.categories) ? registry.categories : {};
    const category = resolveOfferCategory(offer);
    if (category && isPlainObject(categories[category])) {
      const cfg = categories[category];
      return {
        source: "jobKnowledgeRequirements",
        mode: lower(cfg.mode) || "not_required",
        label: norm(cfg.label),
        requirements: normalizeRequirementList(cfg.requirements)
      };
    }

    return null;
  }

  // Full knowledge-gate-evaluering for et tilbud. Bøtter hvert krav i
  // passed/missing/unknown og utleder en samlet status. Blokkerer aldri her — caller
  // avgjør blokkering (kun mode "required" + et bekreftet "missing").
  function evaluateKnowledgeGate(state, offer, targetRole) {
    const config = getKnowledgeRequirementForOffer(offer, targetRole);

    if (!config) {
      return {
        status: "not_configured",
        source: "not_configured",
        mode: "not_required",
        detail: "Ingen eksplisitte kunnskapskrav er definert for dette tilbudet ennå.",
        requirements: [],
        passed: [],
        missing: [],
        unknown: []
      };
    }

    const mode = config.mode || "not_required";
    const reqList = Array.isArray(config.requirements) ? config.requirements : [];

    if (mode === "not_required" || reqList.length === 0) {
      return {
        status: "not_required",
        source: config.source,
        mode: "not_required",
        detail: "Ingen kunnskapskrav blokkerer dette tilbudet.",
        requirements: [],
        passed: [],
        missing: [],
        unknown: []
      };
    }

    const snapshot = getKnowledgeProgressSnapshot(state);
    const evaluated = reqList.map((req) => evaluateKnowledgeRequirement(state, req, snapshot));
    const passed = evaluated.filter((r) => r.status === "passed");
    const missing = evaluated.filter((r) => r.status === "missing");
    const unknown = evaluated.filter((r) => r.status === "unknown");

    let status;
    let detail;
    if (missing.length > 0) {
      status = "missing";
      detail = mode === "required"
        ? "Denne jobben krever kunnskap du ennå ikke har bekreftet."
        : "Denne jobben bygger på kunnskap du kan styrke med relevante quiz.";
    } else if (unknown.length > 0) {
      status = "unknown";
      detail = "Kunnskapskrav finnes, men progresjonen kunne ikke bekreftes ennå.";
    } else {
      status = "passed";
      detail = "Du har kunnskapsgrunnlaget for denne jobbkategorien.";
    }

    return {
      status,
      source: config.source,
      mode,
      label: config.label || "",
      detail,
      requirements: evaluated,
      passed,
      missing,
      unknown
    };
  }

  // Bakoverkompatibelt inngangspunkt brukt av getJobOfferEligibility.
  function readKnowledgeGate(state, offer, targetRole) {
    return evaluateKnowledgeGate(state, offer, targetRole);
  }

  // Merge knowledge requirements-data inn i registryet. Tar den parsede
  // jobKnowledgeRequirements.json (eller et kompatibelt delsett). Best-effort og
  // tolerant: ugyldig input ignoreres.
  function registerKnowledgeRequirements(data) {
    if (!isPlainObject(data)) return KNOWLEDGE_REQUIREMENTS;
    const base = isPlainObject(KNOWLEDGE_REQUIREMENTS) ? KNOWLEDGE_REQUIREMENTS : {};
    KNOWLEDGE_REQUIREMENTS = {
      schema: norm(data.schema) || base.schema || "",
      version: Number.isFinite(Number(data.version)) ? Number(data.version) : base.version,
      default: isPlainObject(data.default) ? data.default : (base.default || { mode: "not_required" }),
      categories: {
        ...(isPlainObject(base.categories) ? base.categories : {}),
        ...(isPlainObject(data.categories) ? data.categories : {})
      },
      roles: {
        ...(isPlainObject(base.roles) ? base.roles : {}),
        ...(isPlainObject(data.roles) ? data.roles : {})
      }
    };
    return KNOWLEDGE_REQUIREMENTS;
  }

  // Best-effort lasting av jobKnowledgeRequirements.json. Blokkerer aldri boot; feil
  // svelges og tilbud faller bare tilbake til "not_configured".
  function loadKnowledgeRequirements() {
    try {
      if (typeof fetch !== "function") return;
      fetch("data/Civication/jobKnowledgeRequirements.json")
        .then((res) => (res && res.ok ? res.json() : null))
        .then((json) => { if (json) registerKnowledgeRequirements(json); })
        .catch(() => {});
    } catch (_err) {
      // Eligibility virker uten filen; tilbud defaulter til not_configured.
    }
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

    const knowledgeGate = readKnowledgeGate(s, offer, targetRole);
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

    // Knowledge gate: kun mode "required" + et bekreftet "missing" kan blokkere.
    // soft_required forklarer uten å blokkere; passed/unknown/not_configured/not_required
    // blokkerer aldri. Reentry-lock-blokkeringen over er uavhengig og har fortsatt
    // prioritet: en passert knowledge gate fjerner den ikke.
    if (knowledgeGate.status === "missing" && knowledgeGate.mode === "required") {
      blockers.push(
        "Denne jobben krever History Go-kunnskap du ennå ikke har bekreftet. " +
        "Fullfør relevante quiz for å låse den opp."
      );
    } else if (knowledgeGate.detail &&
      (knowledgeGate.status === "missing" ||
        knowledgeGate.status === "passed" ||
        knowledgeGate.status === "unknown")) {
      reasons.push(knowledgeGate.detail);
    }

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
    const jobs = /** @type {any} */ (window.CivicationJobs);
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
    loadKnowledgeRequirements();
    patchEventEngineAnswer();
    patchJobsPushOffer();
  }

  window.CivicationJobEligibilityRuntime = {
    LOCKS_KEY,
    // Kategori
    resolveCategory,
    resolveOfferCategory,
    // Knowledge gate
    loadKnowledgeRequirements,
    registerKnowledgeRequirements,
    getKnowledgeRequirementForOffer,
    getKnowledgeProgressSnapshot,
    evaluateKnowledgeRequirement,
    evaluateKnowledgeGate,
    readKnowledgeGate,
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
        push_offer_patched: /** @type {any} */ (window.CivicationJobs)?.__civicationEligibilityPushOfferPatched === true,
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
