// js/Civication/systems/civicationJobLearningRuntime.js
// CivicationJobLearningRuntime — job learning view model for the active role.
//
// Prinsipp:
// - Dette er IKKE career outcome. Career outcome (PROMOTED/STAGNATED/FIRED) handler
//   om hva som skjer med ARBEIDSFORHOLDET, og eies fortsatt av
//   CivicationCareerOutcomeRuntime.
// - Denne filen handler om JOB LEARNING: hva spilleren faktisk har lært av jobben.
//   De to begrepene er bevisst teknisk adskilt i hver sin fil.
// - Et selvstendig mål i jobbspillet er å bli i en jobb lenge nok til å lære det
//   jobben kan lære deg. Forfremmelse er derfor ikke det samme som å være utlært,
//   og det å bli værende er ikke automatisk stagnasjon.
// - Dette er foreløpig en ren view model/status som leser eksisterende state. Det er
//   IKKE en full progresjonsmotor. Faktisk læringsprogresjon per rolle, mastery
//   thresholds og nyttig/ikke-nyttig jobbdata er bevisst utsatt til senere.

(function () {
  "use strict";

  // Antall planlagte læringssteg en typisk rolle gir før den regnes som utlært.
  // Bevisst frikoblet fra career outcome sin plan-fullføring: en kort plan kan
  // fullføres (og gi forfremmelse) før spilleren faktisk er utlært.
  const DEFAULT_MASTERY_THRESHOLD = 6;

  // Andel av mastery_threshold som markerer at spilleren begynner å bli utlært.
  const NEARING_RATIO = 0.6;

  // Et tydelig sted å forberede jobb-metadata. Reelle per-rolle-profiler kan legges i
  // data/Civication/jobLearningProfiles.json og registreres via registerProfiles().
  // Standardprofilen brukes når en rolle ikke har egne læringsdata ennå.
  const DEFAULT_PROFILE = {
    learning_value: "standard", // "high" | "standard" | "low"
    teaches: [],
    mastery_threshold: DEFAULT_MASTERY_THRESHOLD,
    usefulness: "standard", // "high" | "standard" | "low"
    transferable_skills: [],
    dead_end_risk: "low" // "low" | "medium" | "high" eller 0..1
  };

  const LEARNING_LABELS = {
    still_learning: "Jobben lærer deg fortsatt noe",
    nearing_mastery: "Du begynner å bli utlært",
    mastered: "Utlært i rollen",
    low_value: "Lite nyttig læring igjen",
    routine: "Rutine uten utvikling"
  };

  const LEARNING_DETAILS = {
    still_learning: "Rollen har fortsatt noe å lære deg. Å bli værende kan være verdt det en stund til.",
    nearing_mastery: "Du har lært det meste rollen kan lære deg. Snart er det lite nytt igjen.",
    mastered: "Du har lært det denne rollen kan lære deg. Videre læring må komme fra en ny rolle eller mer ansvar.",
    low_value: "Denne rollen lærer deg lite nyttig. Tiden gir lønn, men lite ny, overførbar kompetanse.",
    routine: "Rollen gjentar seg uten utvikling. Dette er rutine, ikke ny læring."
  };

  // In-memory registry of per-role learning profiles. Populated best-effort from
  // data/Civication/jobLearningProfiles.json and/or registerProfiles(). The view
  // model never blocks on this — it just reads whatever is registered, or defaults.
  /** @type {Record<string, any>} */
  let PROFILE_REGISTRY = {};

  function norm(value) {
    return String(value || "").trim();
  }

  function slugify(value) {
    return norm(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
  }

  function getState() {
    return window.CivicationState?.getState?.() || {};
  }

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  function resolveRoleScope(active) {
    const resolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof resolver === "function") {
      const resolved = norm(resolver(active));
      if (resolved && resolved !== "unknown") return resolved;
    }
    return slugify(active?.role_key || active?.title || active?.role_id || active?.career_id || "");
  }

  // Normalize dead_end_risk into a 0..1 number regardless of input shape.
  function deadEndRiskLevel(value) {
    const raw = norm(value).toLowerCase();
    if (raw === "high") return 1;
    if (raw === "medium" || raw === "mid") return 0.5;
    if (raw === "low") return 0;
    const n = Number(value);
    if (Number.isFinite(n)) return Math.max(0, Math.min(1, n));
    return 0;
  }

  // Normalize a profile into the "high" | "standard" | "low" learning value bucket.
  function normalizeLearningValue(profile) {
    const explicit = norm(profile?.learning_value).toLowerCase();
    if (["high", "standard", "low"].includes(explicit)) return explicit;

    const usefulness = norm(profile?.usefulness).toLowerCase();
    if (deadEndRiskLevel(profile?.dead_end_risk) >= 0.66) return "low";
    if (usefulness === "low") return "low";
    if (usefulness === "high") return "high";
    return "standard";
  }

  function mergeObject(base, override) {
    return {
      ...(base && typeof base === "object" ? base : {}),
      ...(override && typeof override === "object" ? override : {})
    };
  }

  // Resolve the learning profile for the active role. Sources, in priority order:
  // 1. metadata embedded on the active position (active.job_learning / learning_meta)
  // 2. a registry entry keyed by role scope / role_id / career_id
  // 3. the registry "default" entry (if any)
  // 4. the built-in DEFAULT_PROFILE
  function getLearningProfile(active) {
    const scope = resolveRoleScope(active);
    const registry = PROFILE_REGISTRY && typeof PROFILE_REGISTRY === "object" ? PROFILE_REGISTRY : {};
    const fromRegistry =
      registry[scope] ||
      registry[norm(active?.role_id)] ||
      registry[slugify(active?.role_id)] ||
      registry[norm(active?.career_id)] ||
      null;
    const embedded = active?.job_learning || active?.learning_meta || null;

    let profile = mergeObject(DEFAULT_PROFILE, registry.default);
    profile = mergeObject(profile, fromRegistry);
    profile = mergeObject(profile, embedded);
    return profile;
  }

  // How many learning-bearing steps the player has taken in the current role.
  // Read from existing mail progression state; tolerant of partial/legacy shapes.
  function getStepsTaken(state) {
    const candidates = [
      state?.mail_plan_progress,
      state?.mail_system,
      state?.mail_runtime_v1
    ];
    for (const source of candidates) {
      if (source && typeof source === "object" && Number.isFinite(Number(source.step_index))) {
        return Math.max(0, Number(source.step_index));
      }
    }
    return 0;
  }

  function stagnationFlagSet(state) {
    const flags = Array.isArray(state?.mail_branch_state?.flags)
      ? state.mail_branch_state.flags.map(norm)
      : [];
    return new Set(flags).has("career_stagnated");
  }

  // Pure decision: given the learning signals, what is the learning status?
  // Deliberately independent of career_outcome_state.status. "utlært" (mastered)
  // can be reported even when there is no career outcome at all.
  function deriveLearningStatus({ progress, jobMastered, lowValue, stagnated }) {
    if (jobMastered) {
      // Utlært + stagnasjon = rutine uten utvikling. Uten stagnasjon er det bare
      // å være utlært, som ikke i seg selv er negativt.
      return stagnated ? "routine" : "mastered";
    }
    if (lowValue) return "low_value";
    if (progress >= NEARING_RATIO) return "nearing_mastery";
    return "still_learning";
  }

  /**
   * Pure, DOM-free job learning view model for the active role.
   *
   * Reads existing mail-progression state and an optional per-role learning
   * profile, and returns a small status object the UI can render directly.
   * Tolerates empty / partial / malformed state without throwing. Never reads
   * career_outcome_state to decide whether the job is mastered — career outcome
   * and job learning are kept separate on purpose.
   *
   * @param {any} [state] Civication state object.
   * @param {any} [active] Active position; falls back to CivicationState when omitted.
   */
  function getJobLearningViewModel(state, active) {
    const s = state && typeof state === "object" ? state : {};
    const activePosition = active !== undefined ? active : getActive();

    const profile = getLearningProfile(activePosition);
    const learningValue = normalizeLearningValue(profile);
    const lowValue = learningValue === "low";

    const masteryThreshold = Math.max(1, Number(profile?.mastery_threshold) || DEFAULT_MASTERY_THRESHOLD);
    const stepsTaken = getStepsTaken(s);
    const progress = Math.max(0, Math.min(1, stepsTaken / masteryThreshold));

    // jobMastered is a LEARNING signal (steps vs threshold), never a career outcome
    // signal. A PROMOTED player is not automatically "utlært".
    const jobMastered = stepsTaken >= masteryThreshold;
    const stagnated = stagnationFlagSet(s);

    // There is a learning picture to show whenever there is an active role context
    // or any recorded progression. Otherwise there is nothing meaningful to surface.
    const hasLearningState = !!activePosition || stepsTaken > 0;

    if (!hasLearningState) {
      return {
        hasLearningState: false,
        learningStatus: "",
        learningLabel: "",
        learningDetail: "",
        jobMastered: false,
        jobHasMoreToTeach: false,
        jobLearningValue: learningValue,
        masteryThreshold,
        stepsTaken,
        progress,
        teaches: Array.isArray(profile?.teaches) ? profile.teaches.slice(0, 6) : [],
        indicators: []
      };
    }

    const learningStatus = deriveLearningStatus({ progress, jobMastered, lowValue, stagnated });
    // "Still has something useful to teach" is false once mastered or when the role
    // is a low-value dead end — that is exactly when staying stops paying off.
    const jobHasMoreToTeach = !jobMastered && !lowValue;

    const learningLabel = LEARNING_LABELS[learningStatus] || "";
    const learningDetail = LEARNING_DETAILS[learningStatus] || "";

    const indicators = [
      {
        id: "job_learning",
        kind: learningStatus,
        label: "Læring: " + learningLabel,
        text: learningDetail
      }
    ];

    return {
      hasLearningState: true,
      learningStatus,
      learningLabel,
      learningDetail,
      jobMastered,
      jobHasMoreToTeach,
      jobLearningValue: learningValue,
      masteryThreshold,
      stepsTaken,
      progress,
      teaches: Array.isArray(profile?.teaches) ? profile.teaches.slice(0, 6) : [],
      indicators
    };
  }

  // Register or merge per-role learning profiles. Keyed by role scope / role_id /
  // career_id, plus an optional "default" entry applied to every role.
  function registerProfiles(map) {
    if (!map || typeof map !== "object") return PROFILE_REGISTRY;
    const next = { ...PROFILE_REGISTRY };
    for (const [key, value] of Object.entries(map)) {
      const k = norm(key);
      if (!k || !value || typeof value !== "object") continue;
      next[k] = mergeObject(next[k], value);
    }
    PROFILE_REGISTRY = next;
    return PROFILE_REGISTRY;
  }

  // Best-effort load of the prepared (currently mostly empty) profiles data file.
  // Never blocks the view model: failures are swallowed and defaults are used.
  function loadProfilesData() {
    try {
      if (typeof fetch !== "function") return;
      fetch("data/Civication/jobLearningProfiles.json")
        .then((res) => (res && res.ok ? res.json() : null))
        .then((json) => {
          if (json && typeof json === "object" && json.profiles && typeof json.profiles === "object") {
            registerProfiles(json.profiles);
          }
        })
        .catch(() => {});
    } catch (_err) {
      // Ignore: the view model works without any external data.
    }
  }

  function boot() {
    loadProfilesData();
  }

  window.CivicationJobLearningRuntime = {
    getJobLearningViewModel,
    getLearningProfile,
    registerProfiles,
    normalizeLearningValue,
    DEFAULT_PROFILE,
    DEFAULT_MASTERY_THRESHOLD,
    inspect() {
      return {
        profiles: Object.keys(PROFILE_REGISTRY),
        default_mastery_threshold: DEFAULT_MASTERY_THRESHOLD,
        sample: getJobLearningViewModel(getState(), getActive())
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
