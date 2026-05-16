// js/Civication/systems/civicationCareerOutcomeRuntime.js
// CivicationCareerOutcomeRuntime — terminaltilstander for eksisterende jobbmailflyt.
//
// Prinsipp:
// - Dette er ikke en ny message director.
// - CivicationMailRuntime eier fortsatt jobbmailprogresjon.
// - Denne filen gjør bare én ting: når rolePlan er ferdig, returneres én terminal outcome-mail
//   i stedet for at EventEngine faller tilbake til gamle legacy-mails.
// - Utfallet skal styres av rolePlan.outcome_rules når de finnes.

(function () {
  "use strict";

  const STATE_KEY = "career_outcome_state";
  const PATCHED_FLAG = "__civicationCareerOutcomeRuntimePatched";
  const TERMINAL_STATUSES = ["PROMOTED", "STAGNATED", "FIRED"];

  const DEFAULT_OUTCOME_RULES = {
    fired: {
      stability_values: ["FIRED"],
      strikes_gte: 3,
      score_lte: -3
    },
    promoted: {
      completion_ratio_gte: 1,
      score_gte: 4,
      strikes_lte: 0,
      allow_warning: false
    },
    stagnated: {
      autonomy_delta: -12,
      add_branch_flags: ["career_stagnated", "evening_pressure", "morning_choices_expand"],
      stability: "STAGNATED"
    }
  };

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

  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
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

  function resolveRoleScope(active) {
    const resolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof resolver === "function") {
      const resolved = norm(resolver(active));
      if (resolved && resolved !== "unknown") return resolved;
    }
    return slugify(active?.role_key || active?.title || active?.role_id || "");
  }

  function defaultOutcomeState(state = getState()) {
    const current = state?.[STATE_KEY] && typeof state[STATE_KEY] === "object"
      ? state[STATE_KEY]
      : {};

    return {
      status: norm(current.status || "ACTIVE") || "ACTIVE",
      role_scope: norm(current.role_scope),
      role_plan_id: norm(current.role_plan_id),
      outcome: norm(current.outcome),
      decided_at: current.decided_at || null,
      stagnation_level: Math.max(0, Number(current.stagnation_level || 0)),
      reason: norm(current.reason),
      last_outcome_mail_id: norm(current.last_outcome_mail_id),
      metrics: current.metrics && typeof current.metrics === "object" ? current.metrics : null
    };
  }

  function getRuntime(state = getState()) {
    return state?.mail_runtime_v1 && typeof state.mail_runtime_v1 === "object"
      ? state.mail_runtime_v1
      : {};
  }

  function isPlanComplete(plan, runtime) {
    const sequence = Array.isArray(plan?.sequence) ? plan.sequence : [];
    if (!sequence.length) return false;
    return Number(runtime?.step_index || 0) >= sequence.length;
  }

  function isClosedForPlan(outcomeState, planId) {
    return TERMINAL_STATUSES.includes(norm(outcomeState?.status)) &&
      norm(outcomeState?.role_plan_id) === norm(planId);
  }

  function mergeObject(base, override) {
    return {
      ...(base && typeof base === "object" ? base : {}),
      ...(override && typeof override === "object" ? override : {})
    };
  }

  function getOutcomeRules(plan) {
    const raw = plan?.outcome_rules && typeof plan.outcome_rules === "object"
      ? plan.outcome_rules
      : {};

    return {
      fired: mergeObject(DEFAULT_OUTCOME_RULES.fired, raw.fired),
      promoted: mergeObject(DEFAULT_OUTCOME_RULES.promoted, raw.promoted || raw.promotion),
      stagnated: mergeObject(DEFAULT_OUTCOME_RULES.stagnated, raw.stagnated || raw.stagnation)
    };
  }

  function countOutcomeSignals(state, runtime, plan) {
    const sequence = Array.isArray(plan?.sequence) ? plan.sequence : [];
    const expectedSteps = Math.max(1, sequence.length);
    const score = Number(state?.score || 0);
    const history = Array.isArray(runtime?.history) ? runtime.history : [];
    const plannedHistory = history.filter(row => norm(row?.source_type) === "planned");
    const plannedAnswers = plannedHistory.length;
    const strikes = Number(state?.strikes || 0);
    const warningUsed = state?.warning_used === true;
    const stability = norm(state?.stability || "STABLE").toUpperCase();
    const completionRatio = Math.max(0, Math.min(1, plannedAnswers / expectedSteps));

    return {
      score,
      plannedAnswers,
      expectedSteps,
      completionRatio,
      strikes,
      warningUsed,
      stability
    };
  }

  function decideOutcome(active, plan, runtime, state) {
    const rules = getOutcomeRules(plan);
    const metrics = countOutcomeSignals(state, runtime, plan);

    const firedStabilityValues = Array.isArray(rules.fired?.stability_values)
      ? rules.fired.stability_values.map(v => norm(v).toUpperCase()).filter(Boolean)
      : ["FIRED"];

    const firedByStability = firedStabilityValues.includes(metrics.stability);
    const firedByStrikes = metrics.strikes >= Number(rules.fired?.strikes_gte ?? 3);
    const firedByScore = metrics.score <= Number(rules.fired?.score_lte ?? -3);

    if (firedByStability || firedByStrikes || firedByScore) {
      return {
        status: "FIRED",
        outcome: "fired",
        reason: "Jobbsporet avsluttes fordi signalene har passert grensen for oppsigelse.",
        metrics,
        rules
      };
    }

    const completionOk = metrics.completionRatio >= Number(rules.promoted?.completion_ratio_gte ?? 1);
    const scoreOk = metrics.score >= Number(rules.promoted?.score_gte ?? 4);
    const strikesOk = metrics.strikes <= Number(rules.promoted?.strikes_lte ?? 0);
    const warningOk = rules.promoted?.allow_warning === true || metrics.warningUsed !== true;

    if (completionOk && scoreOk && strikesOk && warningOk) {
      return {
        status: "PROMOTED",
        outcome: "promoted",
        reason: "Jobbsporet er fullført med nok kvalitet, tillit og gjennomføring til forfremmelse.",
        metrics,
        rules
      };
    }

    return {
      status: "STAGNATED",
      outcome: "stagnated",
      reason: "Jobbsporet er fullført, men signalene gir verken forfremmelse eller oppsigelse. Rollen går over i tydelig stagnasjon.",
      metrics,
      rules
    };
  }

  function subjectFor(status, title) {
    if (status === "PROMOTED") return `Vurdering: ${title} — tilbud om mer ansvar`;
    if (status === "FIRED") return `Vurdering: ${title} — arbeidsforholdet avsluttes`;
    return `Vurdering: ${title} — du står fast i rollen`;
  }

  function situationFor(status, title, decision) {
    const metrics = decision?.metrics || {};
    const resultLine = `Resultatgrunnlag: ${Number(metrics.plannedAnswers || 0)} av ${Number(metrics.expectedSteps || 0)} plansteg, score ${Number(metrics.score || 0)}, strikes ${Number(metrics.strikes || 0)}.`;

    if (status === "PROMOTED") {
      return [
        `Arbeidsperioden i rollen ${title} er vurdert.`,
        resultLine,
        "Du har vist nok struktur, dømmekraft og gjennomføring til at systemet tilbyr deg mer ansvar.",
        "Dette avslutter dette jobbsporet som forfremmelse. Neste steg bør være ny rolle, høyere ansvar eller et tydelig tilbud."
      ];
    }

    if (status === "FIRED") {
      return [
        `Arbeidsperioden i rollen ${title} er vurdert.`,
        resultLine,
        "Mønsteret er for svakt til å fortsette i samme rolle. Varsler, feil eller manglende leveranse har fått konsekvens.",
        "Dette avslutter jobbsporet som sparken. Videre meldinger bør gå via NAV, livssituasjon eller ny jobbsøking."
      ];
    }

    return [
      `Arbeidsperioden i rollen ${title} er vurdert.`,
      resultLine,
      "Du får lønn og poeng videre, men rollen utvikler seg ikke. De samme sakene kommer tilbake fordi organisasjonen ikke lenger forventer reell vekst fra deg.",
      "Stagnasjon merkes i spillet: lavere autonomi, flere morgenvalg og mer kveldspress. Repetisjon er nå et faresignal, ikke fallback."
    ];
  }

  function makeChoice(status) {
    if (status === "PROMOTED") {
      return {
        id: "A",
        label: "Ta imot vurderingen og gå videre til mer ansvar",
        effect: 1,
        tags: ["promotion", "responsibility", "career_outcome"],
        feedback: "Jobbsporet avsluttes som forfremmelse."
      };
    }

    if (status === "FIRED") {
      return {
        id: "A",
        label: "Registrer avslutningen og gå videre",
        effect: -1,
        tags: ["fired", "career_outcome"],
        feedback: "Jobbsporet avsluttes med sparken."
      };
    }

    return {
      id: "A",
      label: "Registrer stagnasjonen og fortsett foreløpig",
      effect: 0,
      tags: ["stagnation", "career_outcome"],
      feedback: "Du fortsetter, men med lavere autonomi og tydeligere press."
    };
  }

  function makeOutcomeMail(active, plan, runtime, state) {
    const decision = decideOutcome(active, plan, runtime, state);
    const roleScope = resolveRoleScope(active);
    const planId = norm(plan?.id || runtime?.role_plan_id);
    const title = norm(active?.title || plan?.title || roleScope || "rollen");
    const id = `${roleScope || "role"}_${planId || "plan"}_${decision.status.toLowerCase()}_outcome`;

    return {
      id,
      source: "Civication",
      source_type: "role_outcome",
      mail_type: "job_outcome",
      mail_family: "career_outcome",
      mail_class: "career_outcome",
      role_scope: roleScope,
      role_id: norm(active?.role_id),
      career_id: norm(active?.career_id),
      stage: "stable",
      priority: 999,
      repeatable: false,
      subject: subjectFor(decision.status, title),
      summary: decision.reason,
      situation: situationFor(decision.status, title, decision),
      choices: [makeChoice(decision.status)],
      career_outcome_meta: {
        status: decision.status,
        outcome: decision.outcome,
        reason: decision.reason,
        metrics: decision.metrics,
        applied_rules: decision.rules,
        role_scope: roleScope,
        role_plan_id: planId,
        step_index: Number(runtime?.step_index || 0),
        decided_at: new Date().toISOString()
      },
      mail_tags: [
        "career_outcome",
        "job_outcome",
        decision.status.toLowerCase(),
        roleScope,
        norm(active?.career_id)
      ].filter(Boolean)
    };
  }

  function applyStagnationConsequences(state, meta, patch) {
    const rules = meta?.applied_rules?.stagnated || DEFAULT_OUTCOME_RULES.stagnated;
    const flags = Array.isArray(rules.add_branch_flags)
      ? rules.add_branch_flags.map(norm).filter(Boolean)
      : DEFAULT_OUTCOME_RULES.stagnated.add_branch_flags;

    patch.stability = norm(rules.stability || "STAGNATED") || "STAGNATED";
    patch.mail_branch_state = {
      ...(state.mail_branch_state && typeof state.mail_branch_state === "object" ? state.mail_branch_state : {}),
      flags: [...new Set([...(Array.isArray(state.mail_branch_state?.flags) ? state.mail_branch_state.flags : []), ...flags])]
    };
    patch.career = {
      ...(state.career && typeof state.career === "object" ? state.career : {}),
      stagnation: {
        active: true,
        role_plan_id: norm(meta.role_plan_id),
        role_scope: norm(meta.role_scope),
        started_at: meta.decided_at || new Date().toISOString(),
        evening_pressure: flags.includes("evening_pressure"),
        morning_choices_expand: flags.includes("morning_choices_expand")
      }
    };

    const delta = Number(rules.autonomy_delta ?? -12);
    if (Number.isFinite(delta) && window.CivicationPsyche?.getAutonomy && window.CivicationPsyche?.setAutonomyOverride) {
      const active = getActive();
      const current = Number(window.CivicationPsyche.getAutonomy(active?.career_id || null));
      const next = clampNumber(current + delta, 0, 100, current);
      window.CivicationPsyche.setAutonomyOverride(next);
    }
  }

  function applyFiredConsequences(state, meta, patch) {
    patch.stability = "FIRED";
    patch.unemployed_since_week = typeof window.weekKey === "function" ? window.weekKey(new Date()) : null;
    patch.career = {
      ...(state.career && typeof state.career === "object" ? state.career : {}),
      activeJob: null,
      outcome: {
        status: "FIRED",
        role_plan_id: norm(meta.role_plan_id),
        role_scope: norm(meta.role_scope),
        at: meta.decided_at || new Date().toISOString()
      }
    };

    const active = getActive();
    try { window.CivicationState?.appendJobHistoryEnded?.(active, "fired"); } catch {}
    try { window.CivicationState?.setActivePosition?.(null); } catch {}
    try { window.CivicationPsyche?.registerCollapse?.(active?.career_id || meta.role_scope, "fired"); } catch {}
  }

  function applyPromotedConsequences(state, meta, patch) {
    patch.stability = "PROMOTED";
    patch.career = {
      ...(state.career && typeof state.career === "object" ? state.career : {}),
      promotion_ready: true,
      outcome: {
        status: "PROMOTED",
        role_plan_id: norm(meta.role_plan_id),
        role_scope: norm(meta.role_scope),
        at: meta.decided_at || new Date().toISOString()
      }
    };
  }

  function applyOutcomeState(eventObj) {
    const meta = eventObj?.career_outcome_meta && typeof eventObj.career_outcome_meta === "object"
      ? eventObj.career_outcome_meta
      : null;
    if (!meta || !TERMINAL_STATUSES.includes(norm(meta.status))) return null;

    const state = getState();
    const current = defaultOutcomeState(state);
    const status = norm(meta.status);
    const roleScope = norm(meta.role_scope);
    const planId = norm(meta.role_plan_id);
    const stagnationLevel = status === "STAGNATED"
      ? Math.max(1, Number(current.stagnation_level || 0) + 1)
      : 0;

    const patch = {
      [STATE_KEY]: {
        status,
        role_scope: roleScope,
        role_plan_id: planId,
        outcome: norm(meta.outcome),
        decided_at: meta.decided_at || new Date().toISOString(),
        stagnation_level: stagnationLevel,
        reason: norm(meta.reason),
        last_outcome_mail_id: norm(eventObj.id),
        metrics: meta.metrics || null
      }
    };

    if (status === "STAGNATED") applyStagnationConsequences(state, meta, patch);
    if (status === "FIRED") applyFiredConsequences(state, meta, patch);
    if (status === "PROMOTED") applyPromotedConsequences(state, meta, patch);

    return setState(patch);
  }

  async function getTerminalPlanState(active, state) {
    if (!active) return { done: false, closed: false, mail: null };
    const runtimeApi = window.CivicationMailRuntime;
    if (!runtimeApi?.getPlanPath || !runtimeApi?.loadJson) return { done: false, closed: false, mail: null };

    const planPath = runtimeApi.getPlanPath(active);
    const plan = await runtimeApi.loadJson(planPath);
    if (!plan || !Array.isArray(plan.sequence)) return { done: false, closed: false, mail: null };

    const runtime = getRuntime(state);
    const planId = norm(plan.id);
    const runtimePlanId = norm(runtime.role_plan_id);
    if (planId && runtimePlanId && planId !== runtimePlanId) return { done: false, closed: false, mail: null };
    if (!isPlanComplete(plan, runtime)) return { done: false, closed: false, mail: null };

    const outcomeState = defaultOutcomeState(state);
    if (isClosedForPlan(outcomeState, planId)) {
      return { done: true, closed: true, mail: null };
    }

    return { done: true, closed: false, mail: makeOutcomeMail(active, plan, runtime, state) };
  }

  async function makeTerminalCandidateIfNeeded(active, state) {
    const terminal = await getTerminalPlanState(active, state || getState());
    return terminal.mail || null;
  }

  async function makeOutcomeAwareCandidates(original, active, state) {
    const currentState = state || getState();
    const terminal = await getTerminalPlanState(active, currentState);
    if (terminal.mail) return [terminal.mail];
    if (terminal.closed) {
      const suppressed = [];
      suppressed.__career_outcome_terminal_closed = true;
      return suppressed;
    }
    return original(active, currentState);
  }

  function patchMailRuntime() {
    const runtimeApi = window.CivicationMailRuntime;
    if (!runtimeApi || runtimeApi[PATCHED_FLAG] === true) return false;
    if (typeof runtimeApi.makeCandidateMailsForActiveRole !== "function") return false;

    const original = runtimeApi.makeCandidateMailsForActiveRole.bind(runtimeApi);

    runtimeApi.makeCandidateMailsForActiveRole = async function outcomeAwareCandidates(active, state) {
      return makeOutcomeAwareCandidates(original, active, state);
    };

    runtimeApi.debugCandidates = async function outcomeDebugCandidates() {
      const active = getActive();
      if (!active) return [];
      return runtimeApi.makeCandidateMailsForActiveRole(active, getState());
    };

    const originalInspect = typeof runtimeApi.inspect === "function"
      ? runtimeApi.inspect.bind(runtimeApi)
      : null;

    runtimeApi.inspect = function outcomeInspect() {
      const base = originalInspect ? originalInspect() : {};
      const state = getState();
      return {
        ...base,
        career_outcome_state: defaultOutcomeState(state),
        career_outcome_patched: true
      };
    };

    runtimeApi[PATCHED_FLAG] = true;
    return true;
  }

  function patchEventEngineBuildMailPool() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__civicationCareerOutcomeBuildMailPoolPatched === true) return false;
    if (typeof proto.buildMailPool !== "function") return false;

    const original = proto.buildMailPool;
    proto.buildMailPool = async function outcomeBuildMailPool(active, state, roleKey) {
      const currentState = state || getState();
      const terminal = await getTerminalPlanState(active, currentState);

      if (terminal.mail || terminal.closed) {
        return {
          role: active?.career_id || null,
          tag_rules: { max_tags_per_choice: 2, memory_window: 12 },
          tracks: [],
          mails: terminal.mail ? [terminal.mail] : [],
          __civication_mail_runtime: true,
          __career_outcome_runtime: true,
          __runtime_candidate_count: terminal.mail ? 1 : 0
        };
      }

      return original.call(this, active, currentState, roleKey);
    };

    proto.__civicationCareerOutcomeBuildMailPoolPatched = true;
    return true;
  }

  function patchEventEngineAnswer() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__civicationCareerOutcomeAnswerPatched === true) return false;
    if (typeof proto.answer !== "function") return false;

    const original = proto.answer;
    proto.answer = async function outcomeAnswer(eventId, choiceId) {
      const pending = typeof this.getPendingEvent === "function" ? this.getPendingEvent() : null;
      const eventObj = pending?.event || null;
      const isOutcome = norm(eventObj?.source_type) === "role_outcome" || norm(eventObj?.mail_class) === "career_outcome";

      const outcomeStatus = norm(eventObj?.career_outcome_meta?.status);
      if (isOutcome && outcomeStatus === "FIRED") {
        const current = getState();
        const consumed = (current && typeof current.consumed === "object" && current.consumed !== null)
          ? { ...current.consumed }
          : {};
        setState({ stability: "FIRED", consumed });
      }

      const result = await original.call(this, eventId, choiceId);

      if (result?.ok !== false && isOutcome) {
        applyOutcomeState(eventObj);
        try { window.dispatchEvent(new Event("updateProfile")); } catch {}
      }

      return result;
    };

    proto.__civicationCareerOutcomeAnswerPatched = true;
    return true;
  }

  function boot() {
    patchMailRuntime();
    patchEventEngineBuildMailPool();
    patchEventEngineAnswer();
  }

  window.CivicationCareerOutcomeRuntime = {
    STATE_KEY,
    boot,
    patchMailRuntime,
    patchEventEngineBuildMailPool,
    patchEventEngineAnswer,
    makeTerminalCandidateIfNeeded,
    getTerminalPlanState,
    applyOutcomeState,
    decideOutcome,
    getOutcomeRules,
    inspect() {
      return {
        patched: window.CivicationMailRuntime?.[PATCHED_FLAG] === true,
        build_mail_pool_patched: window.CivicationEventEngine?.prototype?.__civicationCareerOutcomeBuildMailPoolPatched === true,
        answer_patched: window.CivicationEventEngine?.prototype?.__civicationCareerOutcomeAnswerPatched === true,
        state: defaultOutcomeState(getState())
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
