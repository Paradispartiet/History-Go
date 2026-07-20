// ============================================================
// CIVICATION NEXT ACTION UI
// Hensikt:
// - Eneste aktive svarflate i Civication. Her — og bare her — vises
//   svaralternativene for den aktive fasemailen.
// - Leser CivicationNextActionSelector.getCurrent() slik at saken som vises
//   er nøyaktig den samme som Dagens fase peker på.
// - Dagens fase, Innboks og WorkdayPanel åpner denne flaten i stedet for å
//   rendre egne svarvalg.
// ============================================================

(function () {
  "use strict";

  const MODAL_ID = "civiNextActionModal";
  const BODY_ID = "civiNextActionModalBody";

  // Module-scope references so render/open/close never depend on getElementById re-parsing
  // string innerHTML — keeps the surface testable with lightweight DOM mocks.
  let modalEl = null;
  let bodyEl = null;
  let answerInFlight = false;
  let pendingRefresh = false;
  let answerDebugContext = null;
  let queuedUpdateFrame = 0;

  function perfMark(name) {
    try { if (window.DEBUG && window.performance?.mark) window.performance.mark(name); } catch (_e) {}
  }

  function perfMeasureAnswer() {
    if (!window.DEBUG) return;
    try {
      const marks = [
        "civi-answer-click",
        "civi-answer-after-answerMail",
        "civi-answer-after-markAnswered",
        "civi-answer-after-advanceUntilNextRealAction",
        "civi-answer-after-render"
      ];
      console.debug("[CivicationNextActionUI] answer perf", marks.map(function (name) {
        const entries = window.performance?.getEntriesByName?.(name) || [];
        const last = entries[entries.length - 1];
        return { name, startTime: last ? Math.round(last.startTime) : null };
      }));
    } catch (_e) {}
  }


  function norm(value) {
    return String(value ?? "").trim();
  }

  function getActiveRole() {
    try { return window.CivicationState?.getActivePosition?.() || null; } catch (_e) { return null; }
  }

  function slugify(value) {
    return norm(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function resolveRoleScope(active) {
    const resolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof resolver === "function") {
      const resolved = norm(resolver(active));
      if (resolved && resolved !== "unknown") return resolved;
    }
    return slugify(active?.role_key || active?.title || "");
  }

  function getInboxSummary() {
    let inbox = [];
    try { inbox = window.CivicationMailEngine?.getInbox?.() || window.CivicationState?.getInbox?.() || []; } catch (_e) { inbox = []; }
    return (Array.isArray(inbox) ? inbox : []).map(function (item) {
      const ev = item?.event || item || {};
      return {
        id: norm(item?.id || ev?.id || ev?.mail_key),
        subject: norm(ev?.subject || ev?.title || ev?.kind),
        status: norm(item?.status || ev?.status),
        choiceCount: Array.isArray(ev?.choices) ? ev.choices.length : 0,
        source_type: norm(ev?.source_type),
        mail_type: norm(ev?.mail_type || ev?.type || ev?.kind),
        phase: norm(ev?.phase || ev?.phase_tag)
      };
    });
  }

  function getDayEndSummary() {
    try { return window.CivicationDayProgression?.getDayEndSummary?.() || null; } catch (_e) { return null; }
  }

  function runtimeNeedsRebuild(builderInspection, active) {
    const runtime = builderInspection?.runtime || null;
    const roleScope = resolveRoleScope(active);
    if (!runtime) return { needsRebuild: true, forceNew: false, reason: "missing_runtime" };
    if (norm(runtime.role_scope) !== roleScope) return { needsRebuild: true, forceNew: true, reason: "wrong_role_scope" };
    if (!Array.isArray(runtime.items) || runtime.items.length === 0) return { needsRebuild: true, forceNew: true, reason: "empty_runtime_items" };

    const statuses = runtime.items.map(function (row) { return norm(row?.status).toLowerCase(); });
    const allAnswered = statuses.length > 0 && statuses.every(function (status) { return status === "answered" || status === "resolved" || status === "closed"; });
    const hasDayEndSummary = runtime.items.some(function (row) {
      const ev = row?.event || {};
      const phase = norm(row?.phase || ev?.phase_tag || ev?.daily_mail_meta?.phase).toLowerCase();
      const type = norm(ev?.mail_type || ev?.type || row?.mail_type).toLowerCase();
      const status = norm(row?.status).toLowerCase();
      return (phase === "day_end" || type === "day_end") && (status === "delivered" || status === "pending" || status === "open" || status === "answered") && (getDayEndSummary() || norm(ev?.summary || ev?.subject));
    });
    if (allAnswered && !hasDayEndSummary) return { needsRebuild: true, forceNew: true, reason: "day_complete_without_day_end_summary" };
    return { needsRebuild: false, forceNew: false, reason: "runtime_ok" };
  }

  let lastNoActionDebug = null;

  function collectRecoveryDebug(reason, extra) {
    const active = getActiveRole();
    const detail = {
      reason: reason || "no_current_action",
      activeRole: active,
      resolvedRoleScope: active ? resolveRoleScope(active) : "",
      currentPhase: norm(window.CivicationCalendar?.getPhase?.()),
      dayProgression: null,
      dailyMailBuilder: null,
      inboxSummary: getInboxSummary(),
      extra: extra || null
    };
    try { detail.dayProgression = window.CivicationDayProgression?.inspect?.() || null; } catch (e) { detail.dayProgression = { error: String(e?.message || e) }; }
    try { detail.dailyMailBuilder = window.CivicationDailyMailBuilder?.inspect?.() || null; } catch (e) { detail.dailyMailBuilder = { error: String(e?.message || e) }; }
    lastNoActionDebug = detail;
    if (window.DEBUG) console.warn("[CivicationNextActionUI] recovery failed", detail);
    return detail;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getSelector() {
    return window.CivicationNextActionSelector || null;
  }

  function getCurrentAction() {
    const selector = getSelector();
    if (!selector || typeof selector.getCurrent !== "function") return null;
    try {
      return selector.getCurrent() || null;
    } catch (_e) {
      return null;
    }
  }

  function ensureModal() {
    if (modalEl) return modalEl;
    const existing = document.getElementById(MODAL_ID);
    if (existing) {
      modalEl = existing;
      bodyEl = document.getElementById(BODY_ID) || existing;
      return modalEl;
    }
    if (!document.body) return null;

    const modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "civi-modal";
    modal.setAttribute("aria-hidden", "true");

    const backdrop = document.createElement("div");
    backdrop.className = "civi-modal-backdrop";
    backdrop.setAttribute("data-civi-next-action-close", "1");

    const card = document.createElement("div");
    card.className = "civi-modal-card";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.innerHTML = ""
      + "<div class=\"civi-modal-head\">"
      + "<div>"
      + "<div class=\"civi-task-kicker\">Neste handling</div>"
      + "<h2 id=\"civiNextActionModalTitle\">Neste handling</h2>"
      + "</div>"
      + "<button class=\"civi-modal-close\" type=\"button\" data-civi-next-action-close=\"1\" aria-label=\"Lukk\">×</button>"
      + "</div>";

    const body = document.createElement("div");
    body.className = "civi-modal-body";
    body.id = BODY_ID;

    card.appendChild(body);
    modal.appendChild(backdrop);
    modal.appendChild(card);
    document.body.appendChild(modal);

    modalEl = modal;
    bodyEl = body;
    bindDelegation(modal);
    return modal;
  }

  function metaLine(action) {
    const parts = [
      action.phaseLabel || action.phase,
      action.mail_type,
      action.slot,
      action.status
    ]
      .map(function (part) { return String(part || "").trim(); })
      .filter(Boolean);
    if (!parts.length) return "";
    return "<div class=\"civi-next-action-meta muted\">" + parts.map(escapeHtml).join(" · ") + "</div>";
  }

  // Samlede History Go-personer i rollens kategori (satt av RoleModelRuntime
  // som role_model_meta.history_people). Vises som faglige forbilder på mailen.
  function historyPeopleLine(action) {
    const ev = findInboxEventById(String(action?.id || "")) || {};
    const people = ev?.role_model_meta?.history_people;
    if (!Array.isArray(people) || !people.length) return "";
    const names = people
      .map(function (person) { return String(person?.name || "").trim(); })
      .filter(Boolean)
      .slice(0, 3);
    if (!names.length) return "";
    return "<div class=\"civi-next-action-meta muted\">🎓 Forbilder fra samlingen din: "
      + names.map(escapeHtml).join(", ") + "</div>";
  }

  function bodyLines(action) {
    const lines = Array.isArray(action.situation) && action.situation.length
      ? action.situation
      : [action.body || action.summary || ""];
    return lines
      .map(function (line) { return String(line || "").trim(); })
      .filter(Boolean)
      .slice(0, 6);
  }

  function isQueuedAction(action) {
    return action?.isQueued === true || String(action?.status || "").trim().toLowerCase() === "queued";
  }

  function isAnswerableAction(action) {
    if (!action) return false;
    if (action.canAdvancePhase) return false;
    if (action.isAnswerable === true) return true;
    const status = String(action.status || "").trim().toLowerCase();
    return status === "delivered" || status === "pending" || status === "open";
  }

  function dispatchNextActionUpdates() {
    if (queuedUpdateFrame) return;
    const flush = function () {
      queuedUpdateFrame = 0;
      ["civi:inboxChanged", "civi:dayPhaseChanged", "updateProfile"].forEach(function (eventName) {
        if (answerDebugContext) answerDebugContext.dispatchCount += 1;
        try { window.dispatchEvent(new Event(eventName)); } catch (_e) {}
      });
    };
    if (typeof window.requestAnimationFrame === "function") {
      queuedUpdateFrame = window.requestAnimationFrame(flush);
    } else {
      queuedUpdateFrame = 1;
      setTimeout(flush, 0);
    }
  }

  function disableAnswerButtons() {
    if (!modalEl || typeof modalEl.querySelectorAll !== "function") return;
    modalEl.querySelectorAll("[data-civi-next-action-answer]").forEach(function (button) {
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
    });
  }

  function notifyFailure(message, detail) {
    if (window.DEBUG) console.warn("[CivicationNextActionUI] " + message, detail || "");
    try { window.showToast?.(message); } catch (_e) {}
  }

  // Hvilken task-gate som viser oppgavearket sitt inline (én om gangen).
  let expandedTaskGateId = "";

  function findInboxEventById(mailId) {
    const inbox = window.CivicationMailEngine?.getInbox?.() || window.CivicationState?.getInbox?.() || [];
    const item = Array.isArray(inbox)
      ? inbox.find(function (row) {
        const ev = row?.event || row || {};
        return String(row?.id || ev?.id || "").trim() === mailId || String(ev?.id || "").trim() === mailId;
      })
      : null;
    return item?.event || item || null;
  }

  function buildTaskGateSheetHtml(action, mailId) {
    const ev = findInboxEventById(mailId) || {};
    const task = window.CivicationTaskEngine?.getTaskByMailId?.(mailId) || null;
    const payload = ev.task_payload || {};
    const expected = String(task?.task_payload?.expected_output || payload.expected_output || "").trim();
    const minutes = Number(task?.durationMinutes || ev.work_minutes || ev.duration_minutes || 0);
    const domain = String(ev.task_domain || task?.kind || "").trim();

    const facts = []
      .concat(expected ? ["<div class=\"civi-task-box\"><div class=\"civi-task-kicker\">Forventet leveranse</div><div>" + escapeHtml(expected) + "</div></div>"] : [])
      .concat(minutes ? ["<div class=\"civi-task-box\"><div class=\"civi-task-kicker\">Arbeidstid</div><div>" + escapeHtml(String(minutes)) + " min</div></div>"] : [])
      .concat(domain ? ["<div class=\"civi-task-box\"><div class=\"civi-task-kicker\">Arbeidstype</div><div>" + escapeHtml(domain) + "</div></div>"] : [])
      .join("");

    const choices = resolveActionChoices(action);
    const deliveryButtons = choices.length
      ? choices.map(function (choice) {
        const choiceId = String(choice?.id || "").trim();
        if (!choiceId) return "";
        return "<button class=\"civi-btn\" type=\"button\" data-civi-next-action-answer=\"1\" data-mail-id=\""
          + escapeHtml(mailId) + "\" data-choice-id=\"" + escapeHtml(choiceId) + "\">"
          + escapeHtml(choice?.label || choiceId) + "</button>";
      }).join("")
      : "<button class=\"civi-btn\" type=\"button\" data-civi-next-action-answer=\"1\" data-mail-id=\"" + escapeHtml(mailId) + "\" data-choice-id=\"\">Lever oppgaven</button>";

    return ""
      + "<div class=\"civi-next-action-task-sheet\">"
      + facts
      + "<p class=\"civi-next-action-sub muted\">Velg hvordan du leverer. Leveransen fullfører oppgaven og åpner resten av dagen.</p>"
      + "<div class=\"civi-next-action-choices\" role=\"group\" aria-label=\"Lever oppgaven\">" + deliveryButtons + "</div>"
      + "</div>";
  }

  function buildChoicesHtml(action) {
    const mailId = String(action.id || "");
    if (isQueuedAction(action)) {
      return ""
        + "<p class=\"civi-next-action-sub muted\">Saken er klar, men må åpnes i innboksen før den kan besvares.</p>"
        + "<div class=\"civi-next-action-choices\" role=\"group\" aria-label=\"Åpne handling\">"
        + "<button class=\"civi-btn\" type=\"button\" data-civi-next-action-open-queued=\"1\" data-mail-id=\"" + escapeHtml(mailId) + "\">Åpne saken</button>"
        + "</div>";
    }

    if (action.isTaskGate) {
      if (expandedTaskGateId === mailId) {
        return ""
          + "<p class=\"civi-next-action-sub muted\">Oppgave som må gjøres før du kan gå videre.</p>"
          + buildTaskGateSheetHtml(action, mailId);
      }
      return ""
        + "<p class=\"civi-next-action-sub muted\">Oppgave som må gjøres før du kan gå videre.</p>"
        + "<div class=\"civi-next-action-choices\" role=\"group\" aria-label=\"Oppgave\">"
        + "<button class=\"civi-btn\" type=\"button\" data-civi-next-action-task=\"" + escapeHtml(mailId) + "\">Gjør oppgave</button>"
        + "</div>";
    }

    if (action.canAdvancePhase) {
      if (action.canStartNewDay !== true) return "";
      return ""
        + "<p class=\"civi-next-action-sub muted\">Dagen er ferdig. Du kan starte en ny dag.</p>"
        + "<div class=\"civi-next-action-choices\" role=\"group\" aria-label=\"Fasehandling\">"
        + "<button class=\"civi-btn\" type=\"button\" data-civi-next-action-advance=\"1\">Start ny dag</button>"
        + "</div>";
    }

    if (!isAnswerableAction(action)) {
      return ""
        + "<p class=\"civi-next-action-sub muted\">Dette er en beskjed eller statusmelding.</p>"
        + "<div class=\"civi-next-action-choices\" role=\"group\" aria-label=\"Lukk melding\">"
        + "<button class=\"civi-btn secondary\" type=\"button\" data-civi-next-action-close=\"1\">OK</button>"
        + "</div>";
    }

    const choices = resolveActionChoices(action);
    if (!choices.length) {
      if (isAnswerableAction(action)) {
        notifyFailure("Handlingsmail mangler svaralternativer", action);
        return ""
          + "<p class=\"civi-next-action-sub muted\">Denne åpne saken mangler svaralternativer i aktiv runtime. Prøv å åpne innboksen på nytt.</p>"
          + "<div class=\"civi-next-action-choices\" role=\"group\" aria-label=\"Svaralternativer\">"
          + "<button class=\"civi-btn secondary\" type=\"button\" data-civi-next-action-close=\"1\">Lukk</button>"
          + "</div>";
      }
      // Read-only message / automatic event: a single acknowledge button.
      return ""
        + "<p class=\"civi-next-action-sub muted\">Dette er en beskjed eller automatisk hendelse.</p>"
        + "<div class=\"civi-next-action-choices\" role=\"group\" aria-label=\"Svaralternativer\">"
        + "<button class=\"civi-btn\" type=\"button\" data-civi-next-action-answer=\"1\" data-mail-id=\"" + escapeHtml(mailId) + "\" data-choice-id=\"\">OK</button>"
        + "</div>";
    }

    return ""
      + "<div class=\"civi-next-action-choices\" role=\"group\" aria-label=\"Svaralternativer\">"
      + choices.map(function (choice) {
        const choiceId = String(choice?.id || "").trim();
        if (!choiceId) return "";
        return "<button class=\"civi-btn\" type=\"button\" data-civi-next-action-answer=\"1\" data-mail-id=\""
          + escapeHtml(mailId) + "\" data-choice-id=\"" + escapeHtml(choiceId) + "\">"
          + escapeHtml(choice?.label || choiceId) + "</button>";
      }).join("")
      + "</div>";
  }

  function resolveActionChoices(action) {
    if (Array.isArray(action?.choices) && action.choices.length) return action.choices;
    const mailId = String(action?.id || "").trim();
    if (!mailId) return [];

    const inbox = window.CivicationMailEngine?.getInbox?.() || window.CivicationState?.getInbox?.() || [];
    const inboxItem = Array.isArray(inbox)
      ? inbox.find(function (item) {
        const ev = item?.event || item || {};
        return String(item?.id || ev?.id || ev?.mail_key || "").trim() === mailId;
      })
      : null;
    const inboxChoices = inboxItem?.event?.choices || inboxItem?.choices;
    if (Array.isArray(inboxChoices) && inboxChoices.length) {
      return inboxChoices.map(function (choice) {
        return {
          id: String(choice?.id || "").trim(),
          label: String(choice?.label || choice?.text || choice?.id || "").trim()
        };
      }).filter(function (choice) { return choice.id; });
    }
    return [];
  }

  function renderInto(body) {
    const action = getCurrentAction();
    if (!action) {
      const active = /** @type {{ title?: string, role_key?: string }|null} */ (getActiveRole());
      if (active && lastNoActionDebug) {
        const roleScope = lastNoActionDebug.resolvedRoleScope || resolveRoleScope(active);
        body.innerHTML = "<div class=\"civi-next-action-empty civi-next-action-debug-error\">"
          + "<p><strong>Ingen daily mail kunne bygges for active role.</strong></p>"
          + "<p class=\"muted\">Recovery forsøkte å bygge eller avansere arbeidsdagen, men fant fortsatt ingen reell handling.</p>"
          + "<dl class=\"civi-debug-list\">"
          + "<dt>Rolle</dt><dd>" + escapeHtml(active.title || active.role_key || "Aktiv rolle") + "</dd>"
          + "<dt>role_scope</dt><dd>" + escapeHtml(roleScope) + "</dd>"
          + "<dt>Fase</dt><dd>" + escapeHtml(lastNoActionDebug.currentPhase || "ukjent") + "</dd>"
          + "<dt>Årsak</dt><dd>" + escapeHtml(lastNoActionDebug.reason || "no_current_action") + "</dd>"
          + "</dl>"
          + "</div>"
          + "<div class=\"civi-next-action-choices\"><button class=\"civi-btn secondary\" type=\"button\" data-civi-next-action-close=\"1\">Lukk</button></div>";
        return action;
      }
      body.innerHTML = "<p class=\"civi-next-action-empty muted\">Ingen handling krever svar nå. Innboksen er ajour.</p>"
        + "<div class=\"civi-next-action-choices\"><button class=\"civi-btn secondary\" type=\"button\" data-civi-next-action-close=\"1\">Lukk</button></div>";
      return action;
    }

    lastNoActionDebug = null;

    if (expandedTaskGateId && String(action.id || "") !== expandedTaskGateId) {
      expandedTaskGateId = "";
    }

    const lines = bodyLines(action);
    body.innerHTML = ""
      + "<article class=\"civi-next-action-card\" data-mail-id=\"" + escapeHtml(action.id) + "\">"
      + "<h3 class=\"civi-next-action-subject\">" + escapeHtml(action.subject) + "</h3>"
      + metaLine(action)
      + historyPeopleLine(action)
      + (lines.length ? "<div class=\"civi-next-action-body\">" + lines.map(function (line) {
        return "<p>" + escapeHtml(line) + "</p>";
      }).join("") + "</div>" : "")
      + buildChoicesHtml(action)
      + "</article>";
    return action;
  }

  function render() {
    const modal = ensureModal();
    if (!modal || !bodyEl) return false;
    if (answerDebugContext) answerDebugContext.renderCount += 1;
    renderInto(bodyEl);
    return true;
  }

  function refresh() {
    if (!modalEl || !modalEl.classList || !modalEl.classList.contains("is-open")) return false;
    if (answerInFlight) {
      pendingRefresh = true;
      return false;
    }
    return render();
  }

  function open() {
    const modal = ensureModal();
    if (!modal) return false;
    // Varm alle svaralternativenes datagrunnlag i bakgrunnen mens spilleren
    // leser — svaret skal aldri vente på nettverket.
    try { window.CivicationAnswerPrewarm?.prewarm?.(); } catch {}
    const immediate = getCurrentAction();
    if (immediate) render();
    else if (bodyEl) bodyEl.innerHTML = "<p class=\"civi-next-action-empty muted\">Finner neste handling…</p>";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    prepareNextActionSurface()
      .then(function () { render(); })
      .catch(function (error) {
        collectRecoveryDebug("prepare_exception", { error: String(error?.message || error) });
        render();
      });
    return true;
  }

  function close() {
    if (!modalEl) return false;
    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
    return true;
  }

  function deliverQueuedAction() {
    const result = window.CivicationDailyMailBuilder?.enqueueNext?.(window.HG_CiviEngine || null, { ignorePending: true });
    return Promise.resolve(result)
      .then(function (delivery) {
        dispatchNextActionUpdates();
        render();
        return delivery;
      })
      .catch(function (error) {
        notifyFailure("Kunne ikke åpne saken", error);
        render();
        return { enqueued: false, reason: "exception", error };
      });
  }


  async function prepareNextActionSurface() {
    lastNoActionDebug = null;

    const existing = getCurrentAction();
    const active = getActiveRole();
    if (existing && !active) return { ok: true, action: existing, stage: "current" };
    if (!active) return { ok: true, action: null, stage: "no_active_role" };

    let initialInspection = null;
    try { initialInspection = window.CivicationDailyMailBuilder?.inspect?.() || null; } catch (_e) { initialInspection = null; }
    const initialRebuild = runtimeNeedsRebuild(initialInspection, active);
    if (existing && !initialRebuild.needsRebuild) return { ok: true, action: existing, stage: "current" };

    const advanceResult = existing && initialRebuild.needsRebuild
      ? { advanced: false, action: null, reason: initialRebuild.reason }
      : await advanceUntilNextRealAction();
    let current = existing && initialRebuild.needsRebuild ? null : (advanceResult?.action || getCurrentAction());
    if (current) return { ok: true, action: current, stage: "advanced", advance: advanceResult };

    const builder = window.CivicationDailyMailBuilder || null;
    if (!builder || typeof builder.startToday !== "function") {
      const debug = collectRecoveryDebug("missing_daily_mail_builder", { advance: advanceResult });
      return { ok: false, action: null, reason: debug.reason, debug };
    }

    let inspection = null;
    try { inspection = typeof builder.inspect === "function" ? builder.inspect() : null; } catch (_e) { inspection = null; }
    const rebuild = runtimeNeedsRebuild(inspection, active);

    let startResult = null;
    try {
      startResult = await builder.startToday({
        active,
        engine: window.HG_CiviEngine || null,
        forceNew: rebuild.forceNew === true,
        ignorePending: false
      });
    } catch (error) {
      const debug = collectRecoveryDebug("start_today_exception", { error: String(error?.message || error), rebuild, advance: advanceResult });
      return { ok: false, action: null, reason: debug.reason, debug };
    }

    dispatchNextActionUpdates();
    current = getCurrentAction();
    if (current) return { ok: true, action: current, stage: "start_today", start: startResult, rebuild };

    if (rebuild.needsRebuild && rebuild.forceNew !== true) {
      try {
        startResult = await builder.startToday({
          active,
          engine: window.HG_CiviEngine || null,
          forceNew: true,
          ignorePending: false
        });
        dispatchNextActionUpdates();
        current = getCurrentAction();
        if (current) return { ok: true, action: current, stage: "force_rebuild", start: startResult, rebuild };
      } catch (error) {
        const debug = collectRecoveryDebug("force_start_today_exception", { error: String(error?.message || error), rebuild, advance: advanceResult });
        return { ok: false, action: null, reason: debug.reason, debug };
      }
    }

    const debug = collectRecoveryDebug("no_current_action_after_recovery", {
      advance: advanceResult,
      rebuild,
      startToday: startResult
    });
    return { ok: false, action: null, reason: debug.reason, debug };
  }

  async function advanceUntilNextRealAction() {
    const maxLoops = 12;
    for (let i = 0; i < maxLoops; i += 1) {
      const current = getCurrentAction();
      if (current) return { advanced: i > 0, action: current };

      const inspection = window.CivicationDayProgression?.inspect?.();
      if (!inspection) return { advanced: i > 0, action: null, reason: "no_progression" };
      if (String(inspection.phase || "").trim() === "day_end" || String(inspection.reason || "").trim() === "at_last_phase") {
        return { advanced: i > 0, action: getCurrentAction(), reason: "day_end" };
      }
      if (!inspection.canAdvance) {
        return { advanced: i > 0, action: null, reason: inspection.reason || "not_ready" };
      }

      const result = await Promise.resolve(window.CivicationDayProgression?.advancePhaseIfReady?.());
      dispatchNextActionUpdates();
      if (!result || result.advanced === false) {
        return { advanced: i > 0, action: getCurrentAction(), reason: result?.reason || "advance_failed" };
      }
    }
    if (window.DEBUG) console.warn("[CivicationNextActionUI] advanceUntilNextRealAction stopped by loop guard; day program may be empty or broken.");
    return { advanced: true, action: getCurrentAction(), reason: "loop_guard" };
  }

  function answer(mailId, choiceId) {
    if (!mailId) return Promise.resolve({ ok: false, reason: "missing_mail_id" });
    if (answerInFlight) return Promise.resolve({ ok: false, reason: "answer_in_flight" });

    perfMark("civi-answer-click");
    answerInFlight = true;
    pendingRefresh = false;
    disableAnswerButtons();

    const action = getCurrentAction();
    answerDebugContext = {
      mailId,
      choiceId,
      actionSource: action?.source || "",
      eventSourceType: action?.source_type || "",
      eventMailClass: action?.mail_class || action?.event?.mail_class || "",
      hasDailyMailMeta: !!(action?.daily_mail_meta || action?.event?.daily_mail_meta),
      answerInFlight: true,
      dispatchCount: 0,
      renderCount: 0
    };

    const result = window.CivicationMailEngine?.answerMail
      ? window.CivicationMailEngine.answerMail(mailId, choiceId)
      : window.HG_CiviEngine?.answer?.(mailId, choiceId);

    return Promise.resolve(result)
      .then(function (answerResult) {
        perfMark("civi-answer-after-answerMail");
        if (answerResult?.dailyRuntimeAnswered === true) perfMark("civi-answer-after-markAnswered");
        if (answerDebugContext) {
          answerDebugContext.legacyFollowupSuppressed = answerResult?.legacyImmediateFollowupSuppressed === true;
          answerDebugContext.legacyFollowupEnqueued = answerResult?.legacyImmediateFollowupEnqueued === true;
        }
        if (answerResult?.ok === false) {
          notifyFailure("Kunne ikke svare på mail", answerResult);
          if (answerResult.reason === "not_found" && action?.source === "day_phase") {
            return deliverQueuedAction();
          }
          render();
          return answerResult;
        }
        dispatchNextActionUpdates();
        return advanceUntilNextRealAction().then(function (progressResult) {
          const next = progressResult?.action || getCurrentAction();
          perfMark("civi-answer-after-advanceUntilNextRealAction");
          if (next) render();
          else close();
          perfMark("civi-answer-after-render");
          return answerResult;
        });
      })
      .catch(function (error) {
        notifyFailure("Kunne ikke svare på mail", error);
        render();
        return { ok: false, reason: "exception", error };
      })
      .finally(function () {
        const debug = answerDebugContext;
        answerInFlight = false;
        answerDebugContext = null;
        if (pendingRefresh) {
          pendingRefresh = false;
          render();
        }
        if (window.DEBUG) {
          debug.finalRenderCount = debug.renderCount;
          debug.finalDispatchCount = debug.dispatchCount;
          console.debug("[CivicationNextActionUI] answer complete", debug);
          perfMeasureAnswer();
        }
      });
  }

  function openTaskGate(mailId) {
    if (window.CivicationUI?.openTaskModalByMailId) {
      window.CivicationUI.openTaskModalByMailId(mailId);
    }
  }

  function advancePhase() {
    const current = getCurrentAction();
    const runner = current?.canStartNewDay === true
      ? Promise.resolve(window.CivicationDayProgression?.advancePhaseIfReady?.()).then(function (result) {
        dispatchNextActionUpdates();
        return { advanced: result?.advanced !== false, action: getCurrentAction(), reason: result?.reason };
      })
      : advanceUntilNextRealAction();

    runner
      .then(function (progressResult) {
        dispatchNextActionUpdates();
        const next = progressResult?.action || getCurrentAction();
        if (next) render();
        else close();
      })
      .catch(function (error) {
        if (window.DEBUG) console.warn("[CivicationNextActionUI] Kunne ikke gå til neste fase", error);
      });
  }

  function bindDelegation(modal) {
    if (!modal || typeof modal.addEventListener !== "function" || modal.__civiNextActionDelegated) return;
    modal.__civiNextActionDelegated = true;
    modal.addEventListener("click", function (event) {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;

      const closeEl = target.closest("[data-civi-next-action-close]");
      if (closeEl && modal.contains(closeEl)) {
        event.preventDefault();
        close();
        return;
      }

      const taskBtn = target.closest("[data-civi-next-action-task]");
      if (taskBtn && modal.contains(taskBtn) && !taskBtn.disabled) {
        event.preventDefault();
        // Oppgavearket vises inline i NextAction (eneste svarflate) — den
        // gamle stien åpnet en modal som ikke fantes, så knappen var død.
        expandedTaskGateId = String(taskBtn.getAttribute("data-civi-next-action-task") || "").trim();
        render();
        return;
      }

      const openQueuedBtn = target.closest("[data-civi-next-action-open-queued]");
      if (openQueuedBtn && modal.contains(openQueuedBtn) && !openQueuedBtn.disabled) {
        event.preventDefault();
        openQueuedBtn.disabled = true;
        deliverQueuedAction();
        return;
      }

      const advanceBtn = target.closest("[data-civi-next-action-advance]");
      if (advanceBtn && modal.contains(advanceBtn) && !advanceBtn.disabled) {
        event.preventDefault();
        advanceBtn.disabled = true;
        advancePhase();
        return;
      }

      const answerBtn = target.closest("[data-civi-next-action-answer]");
      if (answerBtn && modal.contains(answerBtn) && !answerBtn.disabled) {
        event.preventDefault();
        if (answerInFlight) return;
        disableAnswerButtons();
        const mailId = String(answerBtn.getAttribute("data-mail-id") || "").trim();
        const rawChoice = answerBtn.getAttribute("data-choice-id");
        const choiceId = rawChoice == null ? null : String(rawChoice).trim();
        answer(mailId, choiceId);
      }
    });
  }

  function setupEvents() {
    ["civi:dayPhaseChanged", "civi:inboxChanged", "updateProfile"].forEach(function (eventName) {
      window.addEventListener(eventName, refresh);
    });
  }

  setupEvents();

  window.CivicationNextActionUI = {
    open,
    close,
    render,
    refresh,
    getCurrent: getCurrentAction,
    advanceUntilNextRealAction,
    prepareNextActionSurface,
    isAnswerInFlight: function () { return answerInFlight; }
  };
})();
