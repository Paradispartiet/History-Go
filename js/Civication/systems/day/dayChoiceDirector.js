(function () {
  "use strict";

  const handlers = [];

  function normStr(v) {
    return String(v || "").trim();
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

  function patchAnswer() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__dayChoiceDirectorPatched || typeof proto.answer !== "function") return;

    const previous = proto.answer;
    proto.__dayChoiceDirectorPatched = true;

    proto.answer = async function (eventId, choiceId) {
      const pending = this.getPendingEvent ? this.getPendingEvent() : null;
      const eventObj = pending?.event || null;
      const choice = Array.isArray(eventObj?.choices)
        ? eventObj.choices.find((c) => c && normStr(c.id) === normStr(choiceId)) || null
        : null;
      const active = window.CivicationState?.getActivePosition?.() || null;
      const stateBefore = window.CivicationState?.getState?.() || {};

      const result = await previous.call(this, eventId, choiceId);

      if (!result?.ok || !eventObj || !choice) {
        return result;
      }

      const ctx = {
        engine: this,
        eventId: normStr(eventId),
        choiceId: normStr(choiceId),
        pending,
        eventObj,
        choice,
        result,
        active,
        stateBefore,
        getState() {
          return window.CivicationState?.getState?.() || {};
        }
      };

      const handlerResults = await runHandlers(ctx);
      result.choice_director = {
        handler_results: handlerResults
      };

      return result;
    };
  }

  window.CivicationChoiceDirector = {
    registerHandler,
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
