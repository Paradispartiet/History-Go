// js/Civication/systems/day/dayChoiceDirector.js
// CivicationChoiceDirector — canonical svargrense + prioritert svarpipeline.
// Patcher EventEngine.answer én gang. Andre Civication-moduler skal registrere rundt-svar-
// middleware her i stedet for å monkey-patche answer selv. Valg-handlere kjøres i et fast
// punkt etter inner pipeline og før outer post-success-middleware.
(function () {
  "use strict";

  const ANSWER_CONTRACT_VERSION = 1;
  const CHOICE_STAGE_PRIORITY = 20;
  const DEFERRED_QUEUE_KEY = "__civicationChoiceAnswerMiddlewareQueue";
  const handlers = [];
  const answerMiddlewares = [];
  const runtimeWindow = /** @type {Window & typeof globalThis & { __civicationChoiceAnswerMiddlewareQueue?: Array<{ name?: unknown, fn?: Function, priority?: unknown }> }} */ (window);

  function normStr(v) {
    return String(v || "").trim();
  }

  function normalizedChoices(eventObj) {
    return Array.isArray(eventObj?.choices) ? eventObj.choices.filter(Boolean) : [];
  }

  function getInteraction(eventObj) {
    const classify = window.CivicationSceneInteraction?.classify;
    if (typeof classify !== "function" || !eventObj) return null;
    try {
      return classify(eventObj);
    } catch (err) {
      console.warn("[dayChoiceDirector] interaction classification failed", err);
      return {
        valid: false,
        actionable: false,
        mode: normStr(eventObj?.interaction_mode) || "unknown",
        block_reason: "interaction_classification_failed"
      };
    }
  }

  function validateAnswerBoundary(eventObj, choiceId) {
    const interaction = getInteraction(eventObj);
    const choices = normalizedChoices(eventObj);
    const resolvedChoiceId = normStr(choiceId);
    const choice = choices.find((candidate) => (
      candidate && normStr(candidate.id) === resolvedChoiceId
    )) || null;

    // Legacy/test contexts that have not loaded SceneInteraction yet retain their old path.
    // Production Civication loads SceneInteraction before ChoiceDirector.
    if (!interaction) {
      return {
        ok: true,
        interaction: null,
        choice
      };
    }

    if (interaction.valid !== true) {
      return {
        ok: false,
        reason: normStr(interaction.block_reason) || "invalid_interaction",
        interaction,
        choice: null
      };
    }

    if (interaction.actionable !== true) {
      return {
        ok: false,
        reason: "interaction_not_actionable",
        interaction,
        choice: null
      };
    }

    const mode = normStr(interaction.mode);
    const choiceRequired = mode === "decision" || mode === "ack" || (mode === "task" && choices.length > 0);
    if (choiceRequired && !choice) {
      return {
        ok: false,
        reason: "bad_choice",
        interaction,
        choice: null
      };
    }

    return {
      ok: true,
      interaction,
      choice
    };
  }

  function blockedAnswerResult(boundary) {
    return {
      ok: false,
      reason: boundary?.reason || "interaction_blocked",
      interaction_mode: boundary?.interaction?.mode || null,
      choice_director: {
        version: ANSWER_CONTRACT_VERSION,
        blocked: true,
        interaction_mode: boundary?.interaction?.mode || null,
        interaction_valid: boundary?.interaction?.valid === true,
        interaction_actionable: boundary?.interaction?.actionable === true,
        handler_results: []
      }
    };
  }

  function sortHandlers() {
    handlers.sort((a, b) => Number(a.priority || 100) - Number(b.priority || 100));
  }

  function registerHandler(name, fn, priority = 100) {
    if (typeof fn !== "function") return false;
    const key = normStr(name || `handler_${handlers.length + 1}`);
    const exists = handlers.find((h) => h && h.name === key);
    if (exists) return true;
    handlers.push({ name: key, fn, priority: Number(priority || 100) });
    sortHandlers();
    return true;
  }

  async function runHandlers(ctx) {
    const results = [];

    for (const handler of handlers) {
      try {
        const value = await handler.fn(ctx);
        results.push({ name: handler.name, ok: true, value });
      } catch (err) {
        console.warn(`[dayChoiceDirector] handler failed: ${handler.name}`, err);
        results.push({ name: handler.name, ok: false, error: String(err?.message || err) });
      }
    }

    return results;
  }

  function sortAnswerMiddlewares() {
    answerMiddlewares.sort((a, b) => {
      const priorityDiff = Number(a.priority || 100) - Number(b.priority || 100);
      if (priorityDiff !== 0) return priorityDiff;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }

  function registerAnswerMiddleware(name, fn, priority = 100) {
    if (typeof fn !== "function") return false;
    const key = normStr(name || `answer_middleware_${answerMiddlewares.length + 1}`);
    if (!key) return false;
    const existing = answerMiddlewares.find((entry) => entry && entry.name === key);
    if (existing) return true;
    answerMiddlewares.push({ name: key, fn, priority: Number(priority || 100) });
    sortAnswerMiddlewares();
    return true;
  }

  function adoptDeferredAnswerMiddlewares() {
    const queue = Array.isArray(runtimeWindow[DEFERRED_QUEUE_KEY])
      ? runtimeWindow[DEFERRED_QUEUE_KEY]
      : [];
    if (!queue.length) return 0;
    let adopted = 0;
    for (const entry of queue.splice(0)) {
      if (registerAnswerMiddleware(entry?.name, entry?.fn, Number(normStr(entry?.priority) || "100"))) adopted += 1;
    }
    return adopted;
  }

  function factionChoiceHandler(ctx) {
    const mailType = normStr(ctx?.eventObj?.mail_type);
    if (mailType !== "faction_choice") return null;

    const choiceId = normStr(ctx?.choiceId);
    const state = /** @type {{ activeFaction?: unknown }} */ (window.CivicationState?.getState?.() || {});

    state.activeFaction = choiceId;

    if (window.CivicationState?.setState) {
      window.CivicationState.setState(state);
    }

    return { activeFaction: choiceId };
  }

  async function choiceTransactionMiddleware(ctx, next) {
    const eventObj = ctx?.eventObj || null;
    const pendingEventId = normStr(eventObj?.id);
    const requestedEventId = normStr(ctx?.eventId);

    // La underliggende EventEngine eie not_found/ID-feil. Interaksjonsgrensen validerer
    // bare scenen som faktisk forsøkes besvart.
    if (!eventObj || (pendingEventId && requestedEventId && pendingEventId !== requestedEventId)) {
      return next();
    }

    const boundary = validateAnswerBoundary(eventObj, ctx?.choiceId);
    if (!boundary.ok) {
      return blockedAnswerResult(boundary);
    }

    const active = window.CivicationState?.getActivePosition?.() || null;
    const stateBefore = window.CivicationState?.getState?.() || {};
    const result = await next();

    if (!result?.ok || !eventObj) {
      return result;
    }

    const interaction = boundary.interaction;
    const choice = boundary.choice;
    let handlerResults = [];

    if (choice) {
      const handlerCtx = {
        ...ctx,
        eventId: requestedEventId,
        choiceId: normStr(ctx?.choiceId),
        choice,
        interaction,
        result,
        active,
        stateBefore,
        getState() {
          return window.CivicationState?.getState?.() || {};
        }
      };

      handlerResults = await runHandlers(handlerCtx);
    }

    result.choice_director = {
      version: ANSWER_CONTRACT_VERSION,
      blocked: false,
      interaction_mode: interaction?.mode || null,
      interaction_valid: interaction ? interaction.valid === true : null,
      interaction_actionable: interaction ? interaction.actionable === true : null,
      choice_id: choice ? normStr(choice.id) : null,
      handler_results: handlerResults
    };

    return result;
  }

  async function runAnswerPipeline(ctx, terminal) {
    adoptDeferredAnswerMiddlewares();

    const stages = [
      ...answerMiddlewares,
      {
        name: "choice_contract",
        fn: choiceTransactionMiddleware,
        priority: CHOICE_STAGE_PRIORITY,
        builtin: true
      }
    ].sort((a, b) => {
      const priorityDiff = Number(a.priority || 100) - Number(b.priority || 100);
      if (priorityDiff !== 0) return priorityDiff;
      if (a.builtin === true && b.builtin !== true) return -1;
      if (b.builtin === true && a.builtin !== true) return 1;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });

    let index = -1;
    async function dispatch(nextIndex) {
      if (nextIndex <= index) throw new Error("choice_director_next_called_twice");
      index = nextIndex;
      const stage = stages[nextIndex];
      if (!stage) return terminal();
      return stage.fn(ctx, () => dispatch(nextIndex + 1));
    }

    return dispatch(0);
  }

  function patchAnswer() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__dayChoiceDirectorPatched || typeof proto.answer !== "function") return false;

    const previous = proto.answer;
    proto.__dayChoiceDirectorPatched = true;
    adoptDeferredAnswerMiddlewares();

    proto.answer = async function (eventId, choiceId) {
      const pending = this.getPendingEvent ? this.getPendingEvent() : null;
      const eventObj = pending?.event || null;
      const ctx = {
        engine: this,
        eventId: normStr(eventId),
        choiceId: normStr(choiceId),
        pending,
        eventObj
      };

      return runAnswerPipeline(ctx, () => previous.call(this, eventId, choiceId));
    };

    registerHandler("faction_choice", factionChoiceHandler, 10);
    return true;
  }

  window.CivicationChoiceDirector = {
    version: ANSWER_CONTRACT_VERSION,
    registerHandler,
    registerAnswerMiddleware,
    validateAnswer(eventObj, choiceId) {
      return validateAnswerBoundary(eventObj, choiceId);
    },
    listHandlers() {
      return handlers.map((h) => ({ name: h.name, priority: h.priority }));
    },
    listAnswerMiddlewares() {
      adoptDeferredAnswerMiddlewares();
      return [
        ...answerMiddlewares.map((entry) => ({ name: entry.name, priority: entry.priority, builtin: false })),
        { name: "choice_contract", priority: CHOICE_STAGE_PRIORITY, builtin: true }
      ].sort((a, b) => Number(a.priority || 100) - Number(b.priority || 100));
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchAnswer, { once: true });
  } else {
    patchAnswer();
  }
})();
