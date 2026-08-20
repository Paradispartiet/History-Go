// js/Civication/ui/CivicationHistoryGoDeepLink.js
// CivicationHistoryGoDeepLink — companion til completion-bridgen.
// Leser en normalisert task_payload, oppretter en midlertidig Civication-session i
// delt localStorage og sender spilleren til riktig History Go-flate. Sessionen
// brukes av History Go sitt Civication-modus-overlay og fjernes ved retur.
(function () {
  "use strict";

  const SESSION_KEY = "hg_civication_mode_v1";

  function clean(value) {
    const text = value == null ? "" : String(value).trim();
    return text || null;
  }

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

    void personId;
    return null;
  }

  function currentCivicationHref() {
    try {
      const href = clean(window.location?.href);
      if (!href) return "Civication.html";
      const match = href.match(/(?:^|\/)(Civication\.html(?:[?#].*)?)$/i);
      if (match) return match[1];
      const url = new URL(href, "https://history-go.invalid/");
      const file = String(url.pathname || "").split("/").filter(Boolean).pop();
      if (String(file || "").toLowerCase() === "civication.html") {
        return `Civication.html${url.search || ""}${url.hash || ""}`;
      }
    } catch {}
    return "Civication.html";
  }

  function startSession(taskOrPayload) {
    const task = taskOrPayload && typeof taskOrPayload === "object" && taskOrPayload.task_payload
      ? taskOrPayload
      : null;
    const rawPayload = task ? task.task_payload : taskOrPayload;
    if (!rawPayload || typeof rawPayload !== "object") return null;

    const engine = window.CivicationTaskEngine;
    const normalized = typeof engine?.normalizeHistoryGoTaskPayload === "function"
      ? engine.normalizeHistoryGoTaskPayload(rawPayload)
      : { ...rawPayload };
    if (!resolve(normalized)) return null;

    const returnContext = normalized.return_context && typeof normalized.return_context === "object"
      ? { ...normalized.return_context }
      : {};
    const now = Date.now();
    const taskId = clean(task?.id);
    const mailId = clean(task?.mail_id || returnContext.mail_id);
    const targetId = clean(normalized.target_id);
    const roleId = clean(task?.role_id || task?.career_id || returnContext.role_id || returnContext.career_id);
    const roleLabel = clean(task?.role_label || task?.career_name || returnContext.role_label || returnContext.career_name);
    const lifeRoleId = clean(task?.life_role_id || returnContext.life_role_id);
    const lifeRoleLabel = clean(task?.life_role_label || returnContext.life_role_label);

    const session = {
      version: 1,
      active: true,
      session_id: `civi_hg_${taskId || mailId || targetId || "task"}_${now}`,
      started_at: new Date(now).toISOString(),
      started_ts: now,
      task_id: taskId,
      mail_id: mailId,
      role_id: roleId,
      role_label: roleLabel,
      life_role_id: lifeRoleId,
      life_role_label: lifeRoleLabel,
      world_id: clean(task?.world_id || returnContext.world_id || task?.career_id),
      title: clean(normalized.title || task?.title) || "Civication-oppdrag",
      description: clean(normalized.description || task?.description),
      target_type: clean(normalized.target_type),
      target_id: targetId,
      place_id: clean(normalized.place_id),
      person_id: clean(normalized.person_id),
      quiz_id: clean(normalized.quiz_id),
      category_id: clean(normalized.category_id),
      emne_id: clean(normalized.emne_id),
      debate_id: clean(normalized.debate_id),
      conflict_id: clean(normalized.conflict_id),
      unlock_id: clean(normalized.unlock_id),
      required_kind: clean(normalized.required_kind),
      completion_mode: clean(normalized.completion_mode),
      return_href: currentCivicationHref(),
      return_context: returnContext,
      expanded: false,
      payload: { ...rawPayload, ...normalized }
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch {
      return null;
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
      return true;
    } catch {
      return false;
    }
  }

  function go(payload, task) {
    const link = resolve(payload);
    if (!link) return false;
    startSession(task || payload);
    try {
      window.location.href = link.href;
      return true;
    } catch {
      return false;
    }
  }

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

    const taskId = decodeURIComponent(btn.getAttribute("data-task-id") || "");
    const engine = window.CivicationTaskEngine;
    const task = taskId && typeof engine?.getTaskById === "function"
      ? engine.getTaskById(taskId)
      : pickPendingTask();
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
    go,
    startSession,
    clearSession,
    actionHtml,
    pickPendingTask
  };
})();
