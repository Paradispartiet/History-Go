// js/Civication/systems/day/dayChoiceDirector.js
// CivicationChoiceDirector — canonical svargrense + prioritert register av valg-håndterere.
// Patcher EventEngine.answer én gang, validerer Scene Interaction-kontrakten før state muteres,
// og kjører registrerte valg-handlere etter et vellykket svar med et reelt kildeeid valg.
(function () {
  "use strict";

  const ANSWER_CONTRACT_VERSION = 1;
  const handlers = [];

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

  function patchAnswer() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__dayChoiceDirectorPatched || typeof proto.answer !== "function") return;

    const previous = proto.answer;
    proto.__dayChoiceDirectorPatched = true;

    proto.answer = async function (eventId, choiceId) {
      const pending = this.getPendingEvent ? this.getPendingEvent() : null;
      const eventObj = pending?.event || null;
      const pendingEventId = normStr(eventObj?.id);
      const requestedEventId = normStr(eventId);

      // La den underliggende motoren eie not_found/ID-feil. Interaksjonsgrensen skal bare
      // validere den scenen som faktisk forsøkes besvart.
      if (!eventObj || (pendingEventId && requestedEventId && pendingEventId !== requestedEventId)) {
        return previous.call(this, eventId, choiceId);
      }

      const boundary = validateAnswerBoundary(eventObj, choiceId);
      if (!boundary.ok) {
        return blockedAnswerResult(boundary);
      }

      const active = window.CivicationState?.getActivePosition?.() || null;
      const stateBefore = window.CivicationState?.getState?.() || {};
      const result = await previous.call(this, eventId, choiceId);

      if (!result?.ok || !eventObj) {
        return result;
      }

      const interaction = boundary.interaction;
      const choice = boundary.choice;
      let handlerResults = [];

      if (choice) {
        const ctx = {
          engine: this,
          eventId: requestedEventId,
          choiceId: normStr(choiceId),
          pending,
          eventObj,
          choice,
          interaction,
          result,
          active,
          stateBefore,
          getState() {
            return window.CivicationState?.getState?.() || {};
          }
        };

        handlerResults = await runHandlers(ctx);
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
    };

    registerHandler("faction_choice", factionChoiceHandler, 10);
  }

  window.CivicationChoiceDirector = {
    version: ANSWER_CONTRACT_VERSION,
    registerHandler,
    validateAnswer(eventObj, choiceId) {
      return validateAnswerBoundary(eventObj, choiceId);
    },
    listHandlers() {
      return handlers.map((h) => ({ name: h.name, priority: h.priority }));
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchAnswer, { once: true });
  } else {
    patchAnswer();
  }
})();
