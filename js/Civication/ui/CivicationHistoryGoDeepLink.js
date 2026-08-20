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

  const SESSION_KEY = "hg_civication_mode_v1";

  function clean(value) {
    const text = value == null ? "" : String(value).trim();
    return text || null;
  }

  function shallowObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
  }

  function currentReturnHref() {
    try {
      const href = String(window.location?.href || "");
      const url = new URL(href, "https://history-go.local/");
      const name = url.pathname.split("/").filter(Boolean).pop() || "";
      if (name.toLowerCase() === "civication.html") {
        return `Civication.html${url.search || ""}${url.hash || ""}`;
      }
    } catch {}
    return "Civication.html";
  }

  function roleField(task, payload, context, snake, camel) {
    return clean(task?.[snake]) || clean(task?.[camel]) || clean(payload?.[snake]) || clean(payload?.[camel]) || clean(context?.[snake]) || clean(context?.[camel]);
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

    if (type === "debate") {
      const debateId = clean(p.debate_id) || clean(p.conflict_id) || clean(p.target_id);
      if (debateId) {
        return { href: `index.html#/debate/${encodeURIComponent(debateId)}`, label: "Gå til debatten i History Go", target_type: "debate" };
      }
    }

    // person/knowledge uten quiz, eller manglende id -> ingen trygg rute.
    void personId;
    return null;
  }

  function startSession(taskOrPayload) {
    const task = taskOrPayload && typeof taskOrPayload === "object" ? taskOrPayload : null;
    if (!task) return null;
    const payload = task.task_payload && typeof task.task_payload === "object" ? task.task_payload : task;
    const link = resolve(payload);
    if (!link) return null;

    const context = shallowObject(payload.return_context);
    const now = Date.now();
    const session = {
      version: 1,
      active: true,
      started_at: new Date(now).toISOString(),
      started_ts: now,
      task_id: clean(task.id || task.task_id) || "",
      mail_id: clean(task.mail_id || context.mail_id) || "",
      role_id: roleField(task, payload, context, "role_id", "roleId") || "",
      role_label: roleField(task, payload, context, "role_label", "roleLabel") || "",
      life_role_id: roleField(task, payload, context, "life_role_id", "lifeRoleId") || "",
      life_role_label: roleField(task, payload, context, "life_role_label", "lifeRoleLabel") || "",
      world_id: roleField(task, payload, context, "world_id", "worldId") || "",
      title: clean(payload.title) || "Civication-oppdrag",
      description: clean(payload.description) || "",
      target_type: clean(payload.target_type) || "",
      target_id: clean(payload.target_id) || "",
      place_id: clean(payload.place_id) || "",
      quiz_id: clean(payload.quiz_id) || "",
      category_id: clean(payload.category_id) || "",
      emne_id: clean(payload.emne_id) || "",
      debate_id: clean(payload.debate_id) || "",
      conflict_id: clean(payload.conflict_id) || "",
      unlock_id: clean(payload.unlock_id) || "",
      required_kind: clean(payload.required_kind) || "",
      completion_mode: clean(payload.completion_mode) || "",
      return_href: currentReturnHref(),
      return_context: context,
      expanded: false,
      payload: { ...payload }
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      try {
        window.dispatchEvent?.(new CustomEvent("civi:historyGoSessionStarted", {
          detail: { task_id: session.task_id || null, target_type: session.target_type, target_id: session.target_id || null }
        }));
      } catch {}
      return session;
    } catch {
      return null;
    }
  }

  function go(taskOrPayload) {
    const payload = taskOrPayload?.task_payload && typeof taskOrPayload.task_payload === "object"
      ? taskOrPayload.task_payload
      : taskOrPayload;
    const link = resolve(payload);
    if (!link) return false;
    startSession(taskOrPayload);
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

  function findTaskById(taskId) {
    const wanted = clean(taskId);
    const engine = window.CivicationTaskEngine;
    if (!wanted || !engine?.findOpenHistoryGoTasks) return null;
    const tasks = engine.findOpenHistoryGoTasks();
    return tasks.find(function (task) { return clean(task?.id) === wanted; }) || null;
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
    const taskId = decodeURIComponent(btn.getAttribute("data-task-id") || "");
    const task = findTaskById(taskId) || pickPendingTask();
    if (task) startSession(task);
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
    SESSION_KEY,
    resolve,
    startSession,
    go,
    actionHtml,
    pickPendingTask,
    findTaskById
  };
})();
