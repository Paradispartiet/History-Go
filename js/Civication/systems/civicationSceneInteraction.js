(() => {
  // js/civicationSceneInteraction.ts
  var win = window;
  var VERSION = 1;
  var MODES = /* @__PURE__ */ new Set(["decision", "task", "ack", "info"]);
  function norm(value) {
    return String(value == null ? "" : value).trim();
  }
  function normalizedChoices(scene) {
    return Array.isArray(scene == null ? void 0 : scene.choices) ? scene.choices.filter(Boolean) : [];
  }
  function hasLegacyTaskSignal(scene) {
    if (!scene || typeof scene !== "object") return false;
    if (scene.task_contract && typeof scene.task_contract === "object") return true;
    if (norm(scene.task_id) || norm(scene.task_gate_id)) return true;
    if (scene.task_required === true || scene.requires_task_completion === true) return true;
    const kind = [scene.mail_type, scene.type, scene.kind, scene.slot, scene.task_kind].map((value) => norm(value).toLowerCase()).join(" ");
    return kind.includes("task_gate");
  }
  function resolveTaskContract(scene) {
    const explicit = (scene == null ? void 0 : scene.task_contract) && typeof scene.task_contract === "object" ? scene.task_contract : {};
    const payload = (scene == null ? void 0 : scene.task_payload) && typeof scene.task_payload === "object" ? scene.task_payload : {};
    const taskId = norm(explicit.task_id || (scene == null ? void 0 : scene.task_id) || (scene == null ? void 0 : scene.task_gate_id) || payload.gate_id);
    const completionRule = norm(
      explicit.completion_rule || (scene == null ? void 0 : scene.completion_rule) || (scene == null ? void 0 : scene.expected_output) || payload.expected_output
    );
    if (!taskId || !completionRule) return null;
    const evidenceRefs = Array.isArray(explicit.evidence_refs) ? [...new Set(explicit.evidence_refs.map(norm).filter(Boolean))] : [];
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
    const rawMode = norm(scene == null ? void 0 : scene.interaction_mode).toLowerCase();
    const explicitMode = rawMode || null;
    const mode = explicitMode && MODES.has(explicitMode) ? explicitMode : explicitMode || inferMode(scene, choices);
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
    const actionable = valid && (mode === "decision" || mode === "task" || mode === "ack" && choices.length === 1);
    return {
      version: VERSION,
      mode,
      explicit: Boolean(explicitMode),
      inferred: !explicitMode,
      valid,
      actionable,
      passive: valid && !actionable,
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
      const id = norm((decorated == null ? void 0 : decorated.id) || (decorated == null ? void 0 : decorated.source_mail_id));
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
    const source = candidates;
    return Object.assign(out, {
      ...source.__career_outcome_terminal_closed === true ? { __career_outcome_terminal_closed: true } : {},
      __scene_interaction_input_count: input.length,
      __scene_interaction_blocked_count: blockedIds.length,
      __scene_interaction_passive_count: passiveIds.length,
      __scene_interaction_blocked_ids: blockedIds,
      __scene_interaction_passive_ids: passiveIds,
      __scene_interaction_suppress_legacy_fallback: input.length > 0 && out.length === 0
    });
  }
  var api = {
    version: VERSION,
    modes: [...MODES],
    classify,
    decorate,
    isActionable,
    filterActionable,
    resolveTaskContract
  };
  win.CivicationSceneInteraction = api;
})();
