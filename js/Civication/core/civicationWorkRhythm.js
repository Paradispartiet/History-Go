// @ts-check
// CivicationWorkRhythm — pure, deterministic selection signals for authored work scenes.
//
// The existing day/phase runtime remains the clock and SceneDirector remains the
// candidate owner. This helper only interprets additive work_context metadata.
(function (root, factory) {
  "use strict";

  const exported = factory();
  const target = /** @type {any} */ (root);
  if (target) target.CivicationWorkRhythm = exported;
  if (typeof module !== "undefined" && module.exports) module.exports = exported;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const VERSION = 1;
  const PRIORITY_SCORE = Object.freeze({ low: 0, normal: 100, high: 200, urgent: 300 });
  const PHASE_RANK = Object.freeze({
    morning: 0,
    forenoon: 1,
    workday: 2,
    lunch: 3,
    afternoon: 4,
    dinner: 5,
    evening: 6,
    day_end: 7,
    any: 0
  });
  const RHYTHM_KEYS = Object.freeze([
    "deadline_day",
    "deadline_phase",
    "blocked_by_object_id",
    "waiting_for_actor_id",
    "handoff_to_actor_id",
    "priority",
    "interrupts",
    "rework_of_scene_id",
    "rework_of_object_transition"
  ]);

  /** @param {unknown} value */
  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  /** @param {unknown} value */
  function positiveInteger(value) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 1 ? number : null;
  }

  /** @param {unknown} value */
  function workContext(value) {
    return value && typeof value === "object" && !Array.isArray(value)
      ? /** @type {Record<string, any>} */ (value)
      : null;
  }

  /** @param {unknown} state */
  function objectsById(state) {
    const raw = state && typeof state === "object" && !Array.isArray(state)
      ? /** @type {Record<string, any>} */ (state)
      : {};
    const objects = raw.work_world?.objects_by_id;
    return objects && typeof objects === "object" && !Array.isArray(objects) ? objects : {};
  }

  /** @param {Record<string, any> | null} context */
  function hasRhythmSignals(context) {
    return !!context && RHYTHM_KEYS.some((key) => Object.prototype.hasOwnProperty.call(context, key));
  }

  /** @param {Record<string, any>} object */
  function isClosed(object) {
    return text(object?.status) === "closed" || !!text(object?.closed_at);
  }

  /** @param {Record<string, any>} object */
  function isWaiting(object) {
    const status = text(object?.status).toLowerCase();
    const phase = text(object?.phase).toLowerCase();
    return status === "pending" || status === "waiting" || status.startsWith("awaiting_") ||
      phase === "pending" || phase === "waiting" || phase.startsWith("awaiting_");
  }

  /** @param {Record<string, any>} object @param {string} sceneId */
  function hasSceneHistory(object, sceneId) {
    return Array.isArray(object?.history) && object.history.some((event) => text(event?.scene_id) === sceneId);
  }

  /** @param {Record<string, any>} object @param {string} eventId */
  function hasTransitionHistory(object, eventId) {
    return Array.isArray(object?.history) && object.history.some((event) =>
      text(event?.id) === eventId && ["transition", "closed"].includes(text(event?.op))
    );
  }

  /**
   * @param {unknown} scene
   * @param {unknown} state
   * @param {{ day_index?: unknown, phase?: unknown }=} clock
   */
  function evaluateScene(scene, state, clock = {}) {
    const source = scene && typeof scene === "object" && !Array.isArray(scene)
      ? /** @type {Record<string, any>} */ (scene)
      : {};
    const context = workContext(source.work_context);
    const base = {
      version: VERSION,
      eligible: true,
      state: "routine",
      reason: "no_rhythm_constraints",
      priority_score: 0,
      deadline_state: "none"
    };
    if (!hasRhythmSignals(context)) return base;

    const world = objectsById(state);
    const objectIds = Array.isArray(context?.object_ids) ? context.object_ids.map(text).filter(Boolean) : [];
    const objects = objectIds.map((id) => world[id]).filter(Boolean);
    const priority = Object.prototype.hasOwnProperty.call(PRIORITY_SCORE, text(context?.priority))
      ? text(context?.priority)
      : "normal";
    let score = PRIORITY_SCORE[priority];
    let rhythmState = "routine";
    let reason = "rhythm_ready";

    const blockerId = text(context?.blocked_by_object_id);
    if (blockerId) {
      const blocker = world[blockerId];
      if (!blocker) {
        return { ...base, eligible: false, state: "blocked", reason: "blocker_missing", priority_score: score, blocked_by_object_id: blockerId };
      }
      if (!isClosed(blocker)) {
        return { ...base, eligible: false, state: "blocked", reason: "blocked_by_open_object", priority_score: score, blocked_by_object_id: blockerId };
      }
    }

    const waitingActorId = text(context?.waiting_for_actor_id);
    if (waitingActorId) {
      if (!objects.length) {
        return { ...base, eligible: false, state: "waiting", reason: "waiting_object_missing", priority_score: score, waiting_for_actor_id: waitingActorId };
      }
      if (!objects.some(isWaiting)) {
        return { ...base, eligible: false, state: "waiting", reason: "waiting_state_absent", priority_score: score, waiting_for_actor_id: waitingActorId };
      }
      rhythmState = "waiting";
      reason = "waiting_for_actor";
    }

    const reworkSceneId = text(context?.rework_of_scene_id);
    if (reworkSceneId && !objects.some((object) => hasSceneHistory(object, reworkSceneId))) {
      return { ...base, eligible: false, state: "rework", reason: "rework_scene_missing", priority_score: score, rework_of_scene_id: reworkSceneId };
    }
    const reworkTransitionId = text(context?.rework_of_object_transition);
    if (reworkTransitionId && !objects.some((object) => hasTransitionHistory(object, reworkTransitionId))) {
      return { ...base, eligible: false, state: "rework", reason: "rework_transition_missing", priority_score: score, rework_of_object_transition: reworkTransitionId };
    }
    if (reworkSceneId || reworkTransitionId) {
      rhythmState = "rework";
      reason = "rework_ready";
      score += 100;
    }

    const handoffActorId = text(context?.handoff_to_actor_id);
    if (handoffActorId && rhythmState === "routine") {
      rhythmState = "handoff";
      reason = "handoff_ready";
    }

    if (context?.interrupts === true) {
      score += 400;
      if (rhythmState === "routine") {
        rhythmState = "interrupt";
        reason = "interrupt_ready";
      }
    }

    const deadlineDay = positiveInteger(context?.deadline_day);
    const currentDay = positiveInteger(clock?.day_index) || 1;
    const deadlinePhase = text(context?.deadline_phase);
    const currentPhase = text(clock?.phase);
    let deadlineState = "none";
    if (deadlineDay) {
      const pastPhase = deadlinePhase && deadlinePhase !== "any" && currentPhase &&
        Number(PHASE_RANK[currentPhase] ?? -1) > Number(PHASE_RANK[deadlinePhase] ?? 99);
      if (currentDay > deadlineDay || (currentDay === deadlineDay && pastPhase)) {
        deadlineState = "overdue";
        score += 500;
      } else if (currentDay === deadlineDay) {
        deadlineState = "due";
        score += 300;
      } else if (currentDay === deadlineDay - 1) {
        deadlineState = "next_day";
        score += 100;
      } else {
        deadlineState = "scheduled";
      }
      if (["due", "overdue"].includes(deadlineState) && rhythmState === "routine") {
        rhythmState = "deadline_pressure";
        reason = deadlineState === "overdue" ? "deadline_overdue" : "deadline_due";
      }
    }

    return {
      version: VERSION,
      eligible: true,
      state: rhythmState,
      reason,
      priority,
      priority_score: score,
      deadline_state: deadlineState,
      ...(deadlineDay ? { deadline_day: deadlineDay } : {}),
      ...(deadlinePhase ? { deadline_phase: deadlinePhase } : {}),
      ...(waitingActorId ? { waiting_for_actor_id: waitingActorId } : {}),
      ...(handoffActorId ? { handoff_to_actor_id: handoffActorId } : {}),
      ...(reworkSceneId ? { rework_of_scene_id: reworkSceneId } : {}),
      ...(reworkTransitionId ? { rework_of_object_transition: reworkTransitionId } : {})
    };
  }

  /**
   * @param {unknown} candidates
   * @param {unknown} state
   * @param {{ day_index?: unknown, phase?: unknown }=} clock
   */
  function evaluateCandidates(candidates, state, clock = {}) {
    const source = Array.isArray(candidates) ? candidates : [];
    const evaluated = source.map((scene, index) => ({
      scene,
      index,
      rhythm: evaluateScene(scene, state, clock)
    }));
    const result = evaluated
      .filter((entry) => entry.rhythm.eligible)
      .sort((a, b) => Number(b.rhythm.priority_score) - Number(a.rhythm.priority_score) || a.index - b.index)
      .map((entry) => ({ ...entry.scene, work_rhythm: entry.rhythm }));
    for (const key of Object.keys(source)) {
      if (!/^\d+$/.test(key)) result[key] = source[key];
    }
    result.__work_rhythm_input_count = source.length;
    result.__work_rhythm_blocked_count = evaluated.filter((entry) => !entry.rhythm.eligible).length;
    result.__work_rhythm_version = VERSION;
    return result;
  }

  return {
    VERSION,
    PRIORITY_SCORE,
    PHASE_RANK,
    RHYTHM_KEYS,
    hasRhythmSignals,
    evaluateScene,
    evaluateCandidates
  };
});
