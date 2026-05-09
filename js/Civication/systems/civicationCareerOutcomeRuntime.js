// js/Civication/systems/civicationCareerOutcomeRuntime.js
// CivicationCareerOutcomeRuntime — terminaltilstander for eksisterende jobbmailflyt.
//
// Prinsipp:
// - Dette er ikke en ny message director.
// - CivicationMailRuntime eier fortsatt jobbmailprogresjon.
// - Denne filen gjør bare én ting: når rolePlan er ferdig, returneres én terminal outcome-mail
//   i stedet for at EventEngine faller tilbake til gamle legacy-mails.

(function () {
  "use strict";

  const STATE_KEY = "career_outcome_state";
  const PATCHED_FLAG = "__civicationCareerOutcomeRuntimePatched";
  const TERMINAL_STATUSES = ["PROMOTED", "STAGNATED", "FIRED"];

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

  function setState(patch) {
    return window.CivicationState?.setState?.(patch || {}) || null;
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
      last_outcome_mail_id: norm(current.last_outcome_mail_id)
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

  function countPositiveSignals(state, runtime) {
    const score = Number(state?.score || 0);
    const history = Array.isArray(runtime?.history) ? runtime.history : [];
    const plannedAnswers = history.filter(row => norm(row?.source_type) === "planned").length;
    const strikes = Number(state?.strikes || 0);
    return { score, plannedAnswers, strikes };
  }

  function decideOutcome(active, plan, runtime, state) {
    const sequence = Array.isArray(plan?.sequence) ? plan.sequence : [];
    const { score, plannedAnswers, strikes } = countPositiveSignals(state, runtime);
    const stability = norm(state?.stability || "STABLE").toUpperCase();
    const warningUsed = state?.warning_used === true;

    if (stability === "FIRED" || strikes >= 3) {
      return {
        status: "FIRED",
        outcome: "fired",
        reason: "For mange varsler/strikes eller FIRED-state."
      };
    }

    const cleanCompletion = plannedAnswers >= Math.max(1, sequence.length - 1) && !warningUsed && strikes === 0;
    const strongScore = score >= Math.max(3, Math.ceil(sequence.length * 0.4));

    if (cleanCompletion || strongScore) {
      return {
        status: "PROMOTED",
        outcome: "promoted",
        reason: "Planen er fullført med nok positive signaler til forfremmelse."
      };
    }

    return {
      status: "STAGNATED",
      outcome: "stagnated",
      reason: "Planen er fullført, men signalene er ikke sterke nok til forfremmelse og ikke dårlige nok til sparken."
    };
  }

  function subjectFor(status, title) {
    if (status === "PROMOTED") return `Vurdering: ${title} — tilbud om mer ansvar`;
    if (status === "FIRED") return `Vurdering: ${title} — arbeidsforholdet avsluttes`;
    return `Vurdering: ${title} — du står fast i rollen`;
  }

  function situationFor(status, title) {
    if (status === "PROMOTED") {
      return [
        `Arbeidsperioden i rollen ${title} er vurdert.`,
        "Du har vist nok struktur, dømmekraft og gjennomføring til at systemet tilbyr deg mer ansvar.",
        "Dette avslutter dette jobbsporet som forfremmelse. Neste steg bør være ny rolle, høyere ansvar eller et tydelig tilbud."
      ];
    }

    if (status === "FIRED") {
      return [
        `Arbeidsperioden i rollen ${title} er vurdert.`,
        "Mønsteret er for svakt til å fortsette i samme rolle. Varsler, feil eller manglende leveranse har fått konsekvens.",
        "Dette avslutter jobbsporet som sparken. Videre meldinger bør gå via NAV, livssituasjon eller ny jobbsøking."
      ];
    }

    return [
      `Arbeidsperioden i rollen ${title} er vurdert.`,
      "Du får lønn og poeng videre, men rollen utvikler seg ikke. De samme sakene kommer tilbake fordi organisasjonen ikke lenger forventer reell vekst fra deg.",
      "Stagnasjon skal merkes i spillet: lavere autonomi, flere morgenvalg og mer kveldspress. Repetisjon er nå et faresignal, ikke fallback."
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
      situation: situationFor(decision.status, title),
      choices: [makeChoice(decision.status)],
      career_outcome_meta: {
        status: decision.status,
        outcome: decision.outcome,
        reason: decision.reason,
        role_scope: roleScope,
        role_plan_id: planId,
        step_index: Number(runtime?.step_index || 0),
        decided_at: new Date().toISOString()
      },
      mail_tags: [
        "career_outcome",
        decision.status.toLowerCase(),
        roleScope,
        norm(active?.career_id)
      ].filter(Boolean)
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
        last_outcome_mail_id: norm(eventObj.id)
      }
    };

    if (status === "STAGNATED") {
      patch.stability = "STAGNATED";
      patch.mail_branch_state = {
        ...(state.mail_branch_state && typeof state.mail_branch_state === "object" ? state.mail_branch_state : {}),
        flags: [...new Set([...(Array.isArray(state.mail_branch_state?.flags) ? state.mail_branch_state.flags : []), "career_stagnated", "evening_pressure", "morning_choices_expand"])]
      };
    }

    if (status === "FIRED") {
      patch.stability = "FIRED";
    }

    return setState(patch);
  }

  async function makeTerminalCandidateIfNeeded(active, state) {
    if (!active) return null;
    const runtimeApi = window.CivicationMailRuntime;
    if (!runtimeApi?.getPlanPath || !runtimeApi?.loadJson) return null;

    const planPath = runtimeApi.getPlanPath(active);
    const plan = await runtimeApi.loadJson(planPath);
    if (!plan || !Array.isArray(plan.sequence)) return null;

    const runtime = getRuntime(state);
    const planId = norm(plan.id);
    const runtimePlanId = norm(runtime.role_plan_id);
    if (planId && runtimePlanId && planId !== runtimePlanId) return null;
    if (!isPlanComplete(plan, runtime)) return null;

    const outcomeState = defaultOutcomeState(state);
    const sameTerminal = TERMINAL_STATUSES.includes(outcomeState.status) &&
      norm(outcomeState.role_plan_id) === planId;

    if (sameTerminal) {
      return null;
    }

    return makeOutcomeMail(active, plan, runtime, state);
  }

  function patchMailRuntime() {
    const runtimeApi = window.CivicationMailRuntime;
    if (!runtimeApi || runtimeApi[PATCHED_FLAG] === true) return false;
    if (typeof runtimeApi.makeCandidateMailsForActiveRole !== "function") return false;

    const original = runtimeApi.makeCandidateMailsForActiveRole.bind(runtimeApi);

    runtimeApi.makeCandidateMailsForActiveRole = async function outcomeAwareCandidates(active, state) {
      const currentState = state || getState();
      const terminal = await makeTerminalCandidateIfNeeded(active, currentState);
      if (terminal) return [terminal];
      return original(active, currentState);
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

  function patchEventEngineAnswer() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__civicationCareerOutcomeAnswerPatched === true) return false;
    if (typeof proto.answer !== "function") return false;

    const original = proto.answer;
    proto.answer = async function outcomeAnswer(eventId, choiceId) {
      const pending = typeof this.getPendingEvent === "function" ? this.getPendingEvent() : null;
      const eventObj = pending?.event || null;
      const isOutcome = norm(eventObj?.source_type) === "role_outcome" || norm(eventObj?.mail_class) === "career_outcome";

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
    patchEventEngineAnswer();
  }

  window.CivicationCareerOutcomeRuntime = {
    STATE_KEY,
    boot,
    patchMailRuntime,
    patchEventEngineAnswer,
    makeTerminalCandidateIfNeeded,
    applyOutcomeState,
    inspect() {
      return {
        patched: window.CivicationMailRuntime?.[PATCHED_FLAG] === true,
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
