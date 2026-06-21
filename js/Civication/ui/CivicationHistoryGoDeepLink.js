// js/Civication/ui/CivicationHistoryGoDeepLink.js
// CivicationHistoryGoDeepLink — companion til completion-bridgen (PR 1 fra task-schema-docen).
// Leser en normalisert task_payload og viser en «Gå til History Go»-handling i arbeidsdags-/
// innbokspanelet som sender spilleren til riktig flate i hovedappen.
// index.html-ruter: #/map, #/place/:id, #/quiz/:id (se js/router/AppRouter.js). Civication.html
// er en egen side, så navigasjon skjer via window.location -> index.html#/...
// Returnerer null for modes uten en trygg rute (debatt, person/kunnskap uten quiz) — vi viser
// aldri en død lenke. Se docs/CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md.
(function () {
  "use strict";

  function clean(value) {
    const text = value == null ? "" : String(value).trim();
    return text || null;
  }

  // Bygg { href, label, target_type } fra en normalisert History Go task_payload, eller null.
  function resolve(payload) {
    const p = payload && typeof payload === "object" ? payload : null;
    if (!p) return null;

    const type = clean(p.target_type);
    const placeId = clean(p.place_id) || (type === "place" ? clean(p.target_id) : null);
    const quizId = clean(p.quiz_id);
    const personId = clean(p.person_id);

    function placeHref(id) {
      return `index.html#/place/${encodeURIComponent(id)}`;
    }
    function quizHref(id) {
      return `index.html#/quiz/${encodeURIComponent(id)}`;
    }

    if (type === "place" && placeId) {
      return { href: placeHref(placeId), label: "Gå til stedet i History Go", target_type: "place" };
    }

    if (type === "person" && quizId) {
      return { href: quizHref(quizId), label: "Undersøk personen i History Go", target_type: "person" };
    }

    if (type === "knowledge" && quizId) {
      return { href: quizHref(quizId), label: "Ta quizen i History Go", target_type: "knowledge" };
    }

    if (type === "unlock") {
      const unlockPlace = placeId || (clean(p.required_kind) === "place" ? clean(p.unlock_id) : null);
      if (unlockPlace) {
        return { href: placeHref(unlockPlace), label: "Lås opp i History Go", target_type: "unlock" };
      }
      if (quizId) {
        return { href: quizHref(quizId), label: "Lås opp i History Go", target_type: "unlock" };
      }
    }

    // person/knowledge uten quiz, debatt, eller manglende id -> ingen trygg rute.
    void personId;
    return null;
  }

  function go(payload) {
    const link = resolve(payload);
    if (!link) return false;
    try {
      window.location.href = link.href;
      return true;
    } catch {
      return false;
    }
  }

  // Finn en åpen History Go-task hvis History Go-del ikke alt er gjort.
  function pickPendingTask() {
    const engine = window.CivicationTaskEngine;
    if (!engine?.findOpenHistoryGoTasks) return null;
    const tasks = engine.findOpenHistoryGoTasks();
    for (let i = 0; i < tasks.length; i += 1) {
      const task = tasks[i];
      if (task && (!task.history_go || !task.history_go.completed_at) && resolve(task.task_payload)) {
        return task;
      }
    }
    return null;
  }

  function actionHtml(task) {
    const link = resolve(task && task.task_payload);
    if (!link) return "";
    return (
      `<div class="civi-hg-deeplink">` +
      `<button type="button" class="civi-hg-deeplink__btn" ` +
      `data-civi-hg-deeplink="${encodeURIComponent(link.href)}" ` +
      `data-task-id="${encodeURIComponent(String(task.id || ""))}">` +
      `${link.label} →</button></div>`
    );
  }

  function ensureStyles() {
    if (document.getElementById("civiHgDeepLinkStyles")) return;
    const style = document.createElement("style");
    style.id = "civiHgDeepLinkStyles";
    style.textContent =
      ".civi-hg-deeplink{margin:8px 0}" +
      ".civi-hg-deeplink__btn{display:inline-block;padding:8px 12px;border:0;border-radius:8px;" +
      "background:#1d4ed8;color:#fff;font-weight:600;cursor:pointer}" +
      ".civi-hg-deeplink__btn:hover{background:#1e40af}";
    document.head.appendChild(style);
  }

  function injectInto(hostId) {
    const host = document.getElementById(hostId);
    if (!host) return;
    const task = pickPendingTask();
    if (!task) return;
    const html = actionHtml(task);
    if (html) host.insertAdjacentHTML("afterbegin", html);
  }

  function patchRenderer(name) {
    const original = /** @type {any} */ (window)[name];
    if (typeof original !== "function" || original.__civiHgDeepLinkWrapped) return;

    const hostId = name === "renderWorkdayPanel" ? "civiWorkdayPanel" : "civiInbox";
    const wrapped = function () {
      const res = original.apply(this, arguments);
      try { injectInto(hostId); } catch {}
      return res;
    };
    wrapped.__civiHgDeepLinkWrapped = true;
    /** @type {any} */ (window)[name] = wrapped;
  }

  function onClick(ev) {
    const target = ev && ev.target;
    if (!target || typeof target.closest !== "function") return;
    const btn = target.closest("[data-civi-hg-deeplink]");
    if (!btn) return;
    const href = decodeURIComponent(btn.getAttribute("data-civi-hg-deeplink") || "");
    if (!href) return;
    ev.preventDefault();
    try { window.location.href = href; } catch {}
  }

  function setup() {
    ensureStyles();
    patchRenderer("renderWorkdayPanel");
    patchRenderer("renderCivicationInbox");
    document.addEventListener("click", onClick);
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setup, { once: true });
    } else {
      setup();
    }
  }

  window.CivicationHistoryGoDeepLink = {
    resolve,
    go,
    actionHtml,
    pickPendingTask
  };
})();
