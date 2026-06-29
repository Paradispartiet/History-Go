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

  function bodyLines(action) {
    const lines = Array.isArray(action.situation) && action.situation.length
      ? action.situation
      : [action.body || action.summary || ""];
    return lines
      .map(function (line) { return String(line || "").trim(); })
      .filter(Boolean)
      .slice(0, 6);
  }

  function buildChoicesHtml(action) {
    const mailId = String(action.id || "");
    if (action.isTaskGate) {
      return ""
        + "<p class=\"civi-next-action-sub muted\">Oppgave som må gjøres før du kan gå videre.</p>"
        + "<div class=\"civi-next-action-choices\" role=\"group\" aria-label=\"Oppgave\">"
        + "<button class=\"civi-btn\" type=\"button\" data-civi-next-action-task=\"" + escapeHtml(mailId) + "\">Gjør oppgave</button>"
        + "</div>";
    }

    const choices = Array.isArray(action.choices) ? action.choices : [];
    if (!choices.length) {
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

  function renderInto(body) {
    const action = getCurrentAction();
    if (!action) {
      body.innerHTML = "<p class=\"civi-next-action-empty muted\">Ingen handling krever svar nå. Innboksen er ajour.</p>"
        + "<div class=\"civi-next-action-choices\"><button class=\"civi-btn secondary\" type=\"button\" data-civi-next-action-close=\"1\">Lukk</button></div>";
      return action;
    }

    const lines = bodyLines(action);
    body.innerHTML = ""
      + "<article class=\"civi-next-action-card\" data-mail-id=\"" + escapeHtml(action.id) + "\">"
      + "<h3 class=\"civi-next-action-subject\">" + escapeHtml(action.subject) + "</h3>"
      + metaLine(action)
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
    renderInto(bodyEl);
    return true;
  }

  function refresh() {
    if (!modalEl || !modalEl.classList || !modalEl.classList.contains("is-open")) return false;
    return render();
  }

  function open() {
    const modal = ensureModal();
    if (!modal) return false;
    render();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    return true;
  }

  function close() {
    if (!modalEl) return false;
    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
    return true;
  }

  function answer(mailId, choiceId) {
    if (!mailId) return;
    const result = window.CivicationMailEngine?.answerMail
      ? window.CivicationMailEngine.answerMail(mailId, choiceId)
      : window.HG_CiviEngine?.answer?.(mailId, choiceId);

    Promise.resolve(result)
      .then(function () {
        try { window.dispatchEvent(new Event("updateProfile")); } catch (_e) {}
        // Re-render so the next phase action (if any) appears; close when nothing remains.
        const next = getCurrentAction();
        if (next) render();
        else close();
      })
      .catch(function (error) {
        if (window.DEBUG) console.warn("[CivicationNextActionUI] Kunne ikke svare på mail", error);
      });
  }

  function openTaskGate(mailId) {
    if (window.CivicationUI?.openTaskModalByMailId) {
      window.CivicationUI.openTaskModalByMailId(mailId);
    }
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
        openTaskGate(String(taskBtn.getAttribute("data-civi-next-action-task") || "").trim());
        return;
      }

      const answerBtn = target.closest("[data-civi-next-action-answer]");
      if (answerBtn && modal.contains(answerBtn) && !answerBtn.disabled) {
        event.preventDefault();
        answerBtn.disabled = true;
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
    getCurrent: getCurrentAction
  };
})();
