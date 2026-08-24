// @ts-check
// CivicationSocialStanding — bounded, situated trust/reputation for authored audiences.
//
// career.reputation remains the legacy/global summary. This helper owns only the
// additive audience map and deterministic scene requirements; it grants no authority.
(function (root, factory) {
  "use strict";

  const exported = factory();
  const target = /** @type {any} */ (root);
  if (target) target.CivicationSocialStandingFactory = exported;
  if (typeof module !== "undefined" && module.exports) module.exports = exported;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const VERSION = 1;
  const SCHEMA = "civication_social_standing_v1";
  const MIN_VALUE = -100;
  const MAX_VALUE = 100;
  const AUDIENCE_ID_RE = /^(manager|team|professional|public):[a-z0-9][a-z0-9_.:-]{0,95}$/;

  /** @param {unknown} value */
  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  /** @param {unknown} value */
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  /** @param {number} value */
  function clamp(value) {
    return Math.max(MIN_VALUE, Math.min(MAX_VALUE, value));
  }

  /** @param {unknown} value @param {string} label */
  function audienceId(value, label = "audience_id") {
    const id = text(value);
    if (!AUDIENCE_ID_RE.test(id)) throw new Error(`${label} er ugyldig: ${id || "<tom>"}`);
    return id;
  }

  /** @param {unknown} value */
  function finiteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  /** @param {unknown} value */
  function normalizeState(value) {
    const raw = value && typeof value === "object" && !Array.isArray(value)
      ? /** @type {Record<string, any>} */ (value)
      : {};
    const rawMap = raw.by_audience && typeof raw.by_audience === "object" && !Array.isArray(raw.by_audience)
      ? raw.by_audience
      : {};
    /** @type {Record<string, number>} */
    const byAudience = {};
    for (const [rawId, rawValue] of Object.entries(rawMap).sort(([a], [b]) => a.localeCompare(b, "en"))) {
      if (!AUDIENCE_ID_RE.test(rawId)) continue;
      const number = finiteNumber(rawValue);
      if (number !== null) byAudience[rawId] = clamp(number);
    }
    const appliedEventIds = Array.isArray(raw.applied_event_ids)
      ? Array.from(new Set(raw.applied_event_ids.map(text).filter(Boolean))).slice(-256)
      : [];
    const history = Array.isArray(raw.history)
      ? raw.history.filter((entry) => entry && typeof entry === "object").slice(-128).map(clone)
      : [];
    return {
      schema: SCHEMA,
      version: VERSION,
      by_audience: byAudience,
      applied_event_ids: appliedEventIds,
      history,
      updated_at: text(raw.updated_at) || null
    };
  }

  /** @param {unknown} value @param {number} index */
  function normalizeOperation(value, index) {
    const raw = value && typeof value === "object" && !Array.isArray(value)
      ? /** @type {Record<string, any>} */ (value)
      : {};
    const eventId = text(raw.event_id);
    if (!eventId) throw new Error(`social_standing_ops[${index}].event_id mangler`);
    const delta = finiteNumber(raw.delta);
    if (delta === null || delta === 0) throw new Error(`social_standing_ops[${index}].delta må være et ikke-null tall`);
    return {
      event_id: eventId,
      audience_id: audienceId(raw.audience_id, `social_standing_ops[${index}].audience_id`),
      delta,
      reason: text(raw.reason) || null,
      source_actor_id: text(raw.source_actor_id) || null
    };
  }

  /** @param {unknown} value */
  function standingContext(value) {
    return value && typeof value === "object" && !Array.isArray(value)
      ? /** @type {Record<string, any>} */ (value)
      : null;
  }

  /** @param {unknown} scene @param {unknown} state */
  function evaluateScene(scene, state) {
    const source = scene && typeof scene === "object" && !Array.isArray(scene)
      ? /** @type {Record<string, any>} */ (scene)
      : {};
    const context = standingContext(source.social_standing_context);
    const requirements = Array.isArray(context?.requirements) ? context.requirements : [];
    const normalized = normalizeState(
      state && typeof state === "object" && !Array.isArray(state)
        ? /** @type {Record<string, any>} */ (state).social_standing
        : null
    );
    const base = {
      version: VERSION,
      eligible: true,
      reason: requirements.length ? "standing_requirements_met" : "no_standing_requirements",
      values: /** @type {Record<string, number>} */ ({})
    };
    for (let index = 0; index < requirements.length; index += 1) {
      const requirement = requirements[index] && typeof requirements[index] === "object"
        ? requirements[index]
        : {};
      let id;
      try {
        id = audienceId(requirement.audience_id, `requirements[${index}].audience_id`);
      } catch {
        return { ...base, eligible: false, reason: "invalid_standing_requirement" };
      }
      const value = Number(normalized.by_audience[id] || 0);
      base.values[id] = value;
      const min = finiteNumber(requirement.min);
      const max = finiteNumber(requirement.max);
      if (min !== null && value < min) return { ...base, eligible: false, reason: "standing_below_minimum", failed_audience_id: id };
      if (max !== null && value > max) return { ...base, eligible: false, reason: "standing_above_maximum", failed_audience_id: id };
    }
    return base;
  }

  /** @param {unknown} candidates @param {unknown} state */
  function evaluateCandidates(candidates, state) {
    const source = Array.isArray(candidates) ? candidates : [];
    const result = /** @type {any[] & Record<string, any>} */ (source
      .map((scene) => ({ scene, standing: evaluateScene(scene, state) }))
      .filter((entry) => entry.standing.eligible)
      .map((entry) => ({ ...entry.scene, social_standing_evaluation: entry.standing })));
    for (const key of Object.keys(source)) {
      if (!/^\d+$/.test(key)) result[key] = source[key];
    }
    result.__social_standing_input_count = source.length;
    result.__social_standing_blocked_count = source.length - result.length;
    result.__social_standing_version = VERSION;
    return result;
  }

  /** @param {unknown} scene @param {unknown} choice @param {unknown} state */
  function resolveReactionStanding(scene, choice, state) {
    const source = scene && typeof scene === "object" && !Array.isArray(scene)
      ? /** @type {Record<string, any>} */ (scene)
      : {};
    const context = standingContext(source.social_standing_context);
    const explicit = text(context?.reaction_audience_id);
    const choiceOps = choice && typeof choice === "object" && !Array.isArray(choice)
      ? /** @type {Record<string, any>} */ (choice).effects?.social_standing_ops
      : null;
    const fallback = Array.isArray(choiceOps) ? text(choiceOps[0]?.audience_id) : "";
    const rawId = explicit || fallback;
    if (!rawId || !AUDIENCE_ID_RE.test(rawId)) return null;
    const normalized = normalizeState(
      state && typeof state === "object" && !Array.isArray(state)
        ? /** @type {Record<string, any>} */ (state).social_standing
        : null
    );
    const value = Number(normalized.by_audience[rawId] || 0);
    return {
      audience_id: rawId,
      value,
      band: value >= 3 ? "trusted" : value <= -3 ? "strained" : "unsettled"
    };
  }

  /** @param {{ getState?: Function, setState?: Function }} stateApi */
  function createAdapter(stateApi) {
    if (!stateApi || typeof stateApi.getState !== "function" || typeof stateApi.setState !== "function") {
      throw new Error("CivicationSocialStanding krever getState/setState");
    }

    function getStandingState() {
      const state = stateApi.getState() || {};
      return normalizeState(state.social_standing);
    }

    /** @param {unknown} id */
    function getStanding(id) {
      const key = audienceId(id);
      return Number(getStandingState().by_audience[key] || 0);
    }

    /** @param {unknown} operations @param {{ scene_id?: unknown, choice_id?: unknown, at?: unknown }=} meta */
    function applyOperations(operations, meta = {}) {
      const rows = Array.isArray(operations) ? operations.map(normalizeOperation) : [];
      const batchIds = rows.map((row) => row.event_id);
      if (new Set(batchIds).size !== batchIds.length) throw new Error("social_standing_ops kan ikke gjenbruke event_id i samme batch");
      if (!rows.length) return [];

      const current = getStandingState();
      const applied = new Set(current.applied_event_ids);
      const next = clone(current);
      const at = text(meta.at) || new Date().toISOString();
      const output = [];
      for (const row of rows) {
        if (applied.has(row.event_id)) {
          output.push({ ...row, idempotent: true, value: Number(next.by_audience[row.audience_id] || 0) });
          continue;
        }
        const before = Number(next.by_audience[row.audience_id] || 0);
        const after = clamp(before + row.delta);
        next.by_audience[row.audience_id] = after;
        next.history.push({
          event_id: row.event_id,
          audience_id: row.audience_id,
          delta: row.delta,
          before,
          after,
          at,
          scene_id: text(meta.scene_id) || null,
          choice_id: text(meta.choice_id) || null,
          reason: row.reason,
          source_actor_id: row.source_actor_id
        });
        applied.add(row.event_id);
        output.push({ ...row, idempotent: false, before, value: after });
      }
      next.applied_event_ids = Array.from(applied).slice(-256);
      next.history = next.history.slice(-128);
      next.updated_at = at;
      stateApi.setState({ social_standing: next });
      return output;
    }

    return { getStandingState, getStanding, applyOperations };
  }

  return {
    VERSION,
    SCHEMA,
    MIN_VALUE,
    MAX_VALUE,
    AUDIENCE_ID_RE,
    normalizeState,
    evaluateScene,
    evaluateCandidates,
    resolveReactionStanding,
    createAdapter
  };
});
