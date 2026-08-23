// @ts-check
// CivicationChoiceAffordance — pure, fail-closed resolver for choices that become
// professionally available after completed History Go learning tasks.
//
// Ownership rule: History Go evidence is owned by CivicationTaskEngine / the existing
// completion bridge. This module never reads raw History Go localStorage and never writes
// task state. It only projects an event's visible choices from already-persisted task truth.
(function (root, factory) {
  "use strict";
  const exported = factory();
  const target = /** @type {any} */ (root);
  if (target) target.CivicationChoiceAffordance = exported;
  if (typeof module !== "undefined" && module.exports) module.exports = exported;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function normalizeIds(value) {
    const seen = new Set();
    const out = [];
    for (const raw of Array.isArray(value) ? value : []) {
      const id = text(raw);
      if (!id || !ID_RE.test(id) || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
    return out;
  }

  function normalizeHistoryGoGate(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const taskMailIds = normalizeIds(value.task_mail_ids);
    if (!taskMailIds.length) return null;
    const minEffect = Number(value.min_effect);
    return {
      task_mail_ids: taskMailIds,
      require_task_completed: value.require_task_completed !== false,
      require_history_go_correct: value.require_history_go_correct !== false,
      min_effect: Number.isFinite(minEffect) ? minEffect : null
    };
  }

  function normalizeAffordance(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const historyGo = normalizeHistoryGoGate(value.history_go);
    return historyGo ? { history_go: historyGo } : null;
  }

  function taskByMailId(taskEngine, mailId) {
    if (!taskEngine || typeof taskEngine.getTaskByMailId !== "function") return null;
    try {
      return taskEngine.getTaskByMailId(mailId) || null;
    } catch {
      return null;
    }
  }

  function evaluateHistoryGoGate(gate, taskEngine) {
    const normalized = normalizeHistoryGoGate(gate);
    if (!normalized) {
      return {
        available: false,
        reason: "invalid_history_go_affordance",
        requirements: [],
        missing_task_mail_ids: []
      };
    }

    const requirements = normalized.task_mail_ids.map((mailId) => {
      const task = taskByMailId(taskEngine, mailId);
      const completed = !!task && task.status === "completed";
      const historyGoCorrect = !!task?.history_go?.completed_at && task.history_go.correct === true;
      const effect = Number(task?.result?.effect);
      const effectOk = normalized.min_effect == null
        ? true
        : Number.isFinite(effect) && effect >= normalized.min_effect;
      const satisfied = !!task
        && (!normalized.require_task_completed || completed)
        && (!normalized.require_history_go_correct || historyGoCorrect)
        && effectOk;
      return {
        task_mail_id: mailId,
        task_id: task?.id || null,
        exists: !!task,
        completed,
        history_go_correct: historyGoCorrect,
        effect: Number.isFinite(effect) ? effect : null,
        satisfied
      };
    });

    const available = requirements.every((row) => row.satisfied === true);
    return {
      available,
      reason: available ? "history_go_learning_satisfied" : "history_go_learning_required",
      requirements,
      missing_task_mail_ids: requirements.filter((row) => !row.exists).map((row) => row.task_mail_id)
    };
  }

  function evaluateChoice(choice, taskEngine) {
    const rawAffordance = choice?.affordance;
    if (rawAffordance == null) {
      return { available: true, reason: "no_affordance_gate", requirements: [] };
    }
    const affordance = normalizeAffordance(rawAffordance);
    if (!affordance) {
      return { available: false, reason: "invalid_choice_affordance", requirements: [] };
    }
    return evaluateHistoryGoGate(affordance.history_go, taskEngine);
  }

  function availableChoices(eventObj, taskEngine) {
    const choices = Array.isArray(eventObj?.choices) ? eventObj.choices : [];
    return choices.filter((choice) => evaluateChoice(choice, taskEngine).available === true);
  }

  function projectEvent(eventObj, options = {}) {
    if (!eventObj || typeof eventObj !== "object") return eventObj;
    const choices = Array.isArray(eventObj.choices) ? eventObj.choices : [];
    if (!choices.some((choice) => choice?.affordance != null)) return eventObj;
    const taskEngine = options.task_engine || null;
    return {
      ...eventObj,
      choices: availableChoices(eventObj, taskEngine)
    };
  }

  function projectInboxItem(item, options = {}) {
    if (!item || typeof item !== "object" || !item.event) return item;
    const event = projectEvent(item.event, options);
    return event === item.event ? item : { ...item, event };
  }

  return {
    version: 1,
    normalizeAffordance,
    evaluateHistoryGoGate,
    evaluateChoice,
    availableChoices,
    projectEvent,
    projectInboxItem
  };
});
