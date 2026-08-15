// js/Civication/systems/civicationSceneInteraction.js
// Shared Scene Contract v1 interaction semantics for legacy Civication scenes.
(function () {
  "use strict";

  const VERSION = 1;
  const MODES = new Set(["decision", "task", "ack", "info"]);

  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function normalizedChoices(scene) {
    return Array.isArray(scene?.choices) ? scene.choices.filter(Boolean) : [];
  }

  function hasLegacyTaskSignal(scene) {
    if (!scene || typeof scene !== "object") return false;
    if (scene.task_contract && typeof scene.task_contract === "object") return true;
    if (norm(scene.task_id) || norm(scene.task_gate_id)) return true;
    if (scene.task_required === true || scene.requires_task_completion === true) return true;
    const kind = [scene.mail_type, scene.type, scene.kind, scene.slot, scene.task_kind]
      .map((value) => norm(value).toLowerCase())
      .join(" ");
    return kind.includes("task_gate");
  }

  function resolveTaskContract(scene) {
    const explicit = scene?.task_contract && typeof scene.task_contract === "object"
      ? scene.task_contract
      : {};
    const payload = scene?.task_payload && typeof scene.task_payload === "object"
      ? scene.task_payload
      : {};
    const taskId = norm(explicit.task_id || scene?.task_id || scene?.task_gate_id || payload.gate_id);
    const completionRule = norm(
      explicit.completion_rule ||
      scene?.completion_rule ||
      scene?.expected_output ||
      payload.expected_output
    );
    if (!taskId || !completionRule) return null;
    const evidenceRefs = Array.isArray(explicit.evidence_refs)
      ? [...new Set(explicit.evidence_refs.map(norm).filter(Boolean))]
      : [];
    const out = {
      ...explicit,
      task_id: taskId,
      completion_rule: completionRule
    };
    if (norm(explicit.failure_rule)) out.failure_rule = norm(explicit.failure_rule);
    if (evidenceRefs.length) out.evidence_refs = evidenceRefs;
    return out;
  }

  function inferMode(scene, choices) {
    if (hasLegacyTaskSignal(scene)) return "task";
    if (choices.length >= 2) return "decision";
    if (choices.length === 1) return "ack";
    return "info";
  }

  function classify(scene) {
    const choices = normalizedChoices(scene);
    const rawMode = norm(scene?.interaction_mode).toLowerCase();
    const explicitMode = rawMode ? rawMode : null;
    const mode = explicitMode && MODES.has(explicitMode)
      ? explicitMode
      : (explicitMode ? explicitMode : inferMode(scene, choices));
    const taskContract = mode === "task" ? resolveTaskContract(scene) : null;

    let valid = true;
    let blockReason = null;

    if (explicitMode && !MODES.has(explicitMode)) {
      valid = false;
      blockReason = "unknown_interaction_mode";
    } else if (mode === "decision" && choices.length < 2) {
      valid = false;
      blockReason = "decision_requires_two_choices";
    } else if (mode === "task" && !taskContract) {
      valid = false;
      blockReason = "task_requires_contract";
    } else if (mode === "info" && choices.length !== 0) {
      valid = false;
      blockReason = "info_requires_zero_choices";
    } else if (mode === "ack" && choices.length > 1) {
      valid = false;
      blockReason = "ack_allows_at_most_one_choice";
    }

    const actionable = valid && (
      mode === "decision" ||
      mode === "task" ||
      (mode === "ack" && choices.length === 1)
    );
    const passive = valid && !actionable;

    return {
      version: VERSION,
      mode,
      explicit: !!explicitMode,
      inferred: !explicitMode,
      valid,
      actionable,
      passive,
      choice_count: choices.length,
      block_reason: blockReason,
      task_contract: taskContract
    };
  }

  function decorate(scene) {
    if (!scene || typeof scene !== "object") return scene;
    const result = classify(scene);
    const out = {
      ...scene,
      interaction_mode: result.mode,
      interaction_contract_version: VERSION,
      interaction_valid: result.valid,
      interaction_actionable: result.actionable,
      interaction_passive: result.passive,
      interaction_mode_inferred: result.inferred
    };
    if (result.block_reason) out.interaction_block_reason = result.block_reason;
    else delete out.interaction_block_reason;
    if (result.mode === "task" && result.task_contract) out.task_contract = result.task_contract;
    return out;
  }

  function isActionable(scene) {
    return classify(scene).actionable === true;
  }

  function filterActionable(candidates) {
    const input = Array.isArray(candidates) ? candidates : [];
    const out = [];
    const blockedIds = [];
    const passiveIds = [];

    for (const candidate of input) {
      const decorated = decorate(candidate);
      const result = classify(decorated);
      const id = norm(decorated?.id || decorated?.source_mail_id);
      if (!result.valid) {
        if (id) blockedIds.push(id);
        continue;
      }
      if (!result.actionable) {
        if (id) passiveIds.push(id);
        continue;
      }
      out.push(decorated);
    }

    if (input.__career_outcome_terminal_closed === true) {
      out.__career_outcome_terminal_closed = true;
    }
    out.__scene_interaction_input_count = input.length;
    out.__scene_interaction_blocked_count = blockedIds.length;
    out.__scene_interaction_passive_count = passiveIds.length;
    out.__scene_interaction_blocked_ids = blockedIds;
    out.__scene_interaction_passive_ids = passiveIds;
    out.__scene_interaction_suppress_legacy_fallback = input.length > 0 && out.length === 0;
    return out;
  }

  window.CivicationSceneInteraction = {
    version: VERSION,
    modes: [...MODES],
    classify,
    decorate,
    isActionable,
    filterActionable,
    resolveTaskContract
  };
})();