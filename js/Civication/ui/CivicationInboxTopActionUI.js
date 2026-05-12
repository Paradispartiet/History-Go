// ============================================================
// CIVICATION INBOX TOP ACTION UI
// Hensikt:
// - Toppkortet skal bare vise "Krever svar" når en hendelse faktisk
//   er pending OG har valg brukeren kan svare på.
// - Vanlige meldinger uten valg skal vises som melding/status, ikke som krav.
// - Innkommende vises med tydelig skille mellom jobbmail og personlige meldinger.
// - Dette er presentasjonslogikk, ikke motor/state-mutasjon.
// ============================================================

(function () {
  "use strict";

  function getInbox() {
    const fromMailEngine = window.CivicationMailEngine?.getInbox?.();
    if (Array.isArray(fromMailEngine)) return fromMailEngine;

    const fromState = window.CivicationState?.getInbox?.();
    if (Array.isArray(fromState)) return fromState;

    try {
      const stored = JSON.parse(localStorage.getItem("hg_civi_inbox_v1") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  function splitInbox() {
    const inbox = getInbox();
    const splitter = window.CivicationEventChannels?.splitInbox;
    if (typeof splitter !== "function") {
      return { messages: inbox, workday: [], milestones: [], system: [], unknown: [] };
    }
    return splitter(inbox);
  }

  function splitInboxByMessageChannel() {
    const inbox = getInbox();
    const splitter = window.CivicationEventChannels?.splitInboxByMessageChannel;
    if (typeof splitter === "function") {
      return splitter(inbox);
    }

    return (Array.isArray(inbox) ? inbox : []).reduce(function (acc, item) {
      const ev = eventOf(item);
      const sourceType = normalize(ev?.source_type);
      const mailClass = normalize(ev?.mail_class);
      const mailType = normalize(ev?.mail_type || ev?.type || ev?.kind);
      const isPrivate = sourceType === "life" || mailClass === "private_message" || mailType === "private" || mailType === "personal";
      const isSystem = sourceType === "system" || mailClass === "system" || mailType === "status";

      if (isSystem) acc.system.push(item);
      else if (isPrivate) acc.private.push(item);
      else acc.job.push(item);
      return acc;
    }, { job: [], private: [], system: [], unknown: [] });
  }

  function eventOf(item) {
    return item?.event || item || null;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function isPending(item) {
    return !!item && String(item.status || "pending") === "pending" && item.resolved !== true;
  }

  function hasChoices(item) {
    const ev = eventOf(item);
    return Array.isArray(ev?.choices) && ev.choices.length > 0;
  }

  function titleOf(item) {
    const ev = eventOf(item);
    return String(ev?.subject || ev?.title || ev?.kind || ev?.mail_type || "Innkommende").trim();
  }

  function kindOf(item) {
    const ev = eventOf(item);
    return String(ev?.kind || ev?.mail_type || ev?.type || "Innkommende").trim();
  }

  function fromOf(item) {
    const ev = eventOf(item);
    return String(ev?.from || ev?.source || ev?.sender || "Civication").trim();
  }

  function mailIdOf(item) {
    const ev = eventOf(item);
    return String(item?.id || ev?.id || ev?.mail_key || "").trim();
  }

  function metaOf(item, channelLabel) {
    const ev = eventOf(item);
    const parts = [
      channelLabel,
      ev?.mail_type,
      ev?.source_type,
      ev?.phase || ev?.phase_tag,
      item?.enqueued_at ? new Date(item.enqueued_at).toLocaleString("no-NO") : null
    ];

    return parts
      .map(function (part) { return String(part || "").trim(); })
      .filter(Boolean)
      .join(" · ");
  }

  function bodyLinesOf(item) {
    const ev = eventOf(item);
    const raw = Array.isArray(ev?.situation)
      ? ev.situation
      : [ev?.summary || ev?.body || item?.body || ""];

    return raw
      .map(function (line) { return String(line || "").trim(); })
      .filter(Boolean)
      .slice(0, 4);
  }

  function pendingActionItems() {
    const split = splitInbox();
    return (split.messages || [])
      .concat(split.unknown || [], split.workday || [])
      .filter(function (item) {
        return isPending(item) && hasChoices(item);
      });
  }

  function pendingMilestones() {
    const split = splitInbox();
    return (split.milestones || []).filter(isPending);
  }

  function visibleMessages() {
    const split = splitInbox();
    return (split.messages || [])
      .concat(split.unknown || [], split.milestones || [], split.system || [])
      .filter(isPending);
  }

  function openInboxPopup() {
    const section = document.getElementById("civiInboxSection");
    if (!section || !window.CivicationMiniSectionsUI?.openPopup) return;

    window.CivicationMiniSectionsUI.openPopup(section, {
      label: "Innkommende",
      accent: "📨"
    });
  }

  function setTopCard(model) {
    const card = document.getElementById("civiTopActionCard");
    if (!card) return false;

    const title = card.querySelector(".civi-top-action-title");
    const summary = card.querySelector(".civi-top-action-summary");
    const chip = card.querySelector(".civi-top-action-chip");
    const btn = card.querySelector("[data-civi-top-action]");

    card.classList.toggle("is-urgent", model.mode === "urgent");
    card.classList.toggle("is-calm", model.mode !== "urgent");
    card.classList.toggle("is-milestone", model.tone === "milestone");

    if (title) title.textContent = model.title;
    if (summary) summary.textContent = model.summary;
    if (chip) chip.textContent = model.chip;
    if (btn) btn.textContent = model.action;

    const handler = function () {
      if (model.openInbox) openInboxPopup();
    };

    if (btn) btn.onclick = handler;
    card.onclick = function (event) {
      const target = event.target;
      if (target && target.closest("button")) return;
      handler();
    };

    return true;
  }

  function buildTopModel() {
    const milestones = pendingMilestones();
    if (milestones.length) {
      const first = milestones[0];
      return {
        mode: "urgent",
        tone: "milestone",
        title: "Ny milepæl",
        summary: titleOf(first),
        chip: "Milepæl",
        action: "Se milepæl",
        openInbox: true
      };
    }

    const actionable = pendingActionItems();
    if (actionable.length) {
      const first = actionable[0];
      return {
        mode: "urgent",
        title: "Krever svar",
        summary: `${titleOf(first)} · ${kindOf(first)}`,
        chip: "Krever svar",
        action: "Svar nå",
        openInbox: true
      };
    }

    const messages = visibleMessages();
    if (messages.length) {
      const first = messages[0];
      return {
        mode: "info",
        title: "Ny melding",
        summary: `${titleOf(first)} · ${kindOf(first)}`,
        chip: "Melding",
        action: "Åpne innkommende",
        openInbox: true
      };
    }

    return {
      mode: "calm",
      title: "Ingen handling krever svar nå",
      summary: "Innboksen er ajour. Du kan utforske valgt livsområde i roligere tempo.",
      chip: "Stabilt",
      action: "Se dashboard",
      openInbox: false
    };
  }

  function renderChoiceButtons(item) {
    const ev = eventOf(item);
    const choices = Array.isArray(ev?.choices) ? ev.choices : [];
    if (!isPending(item) || !choices.length) return "";

    const mailId = mailIdOf(item);
    if (!mailId) return "";

    return `
      <div class="civi-inbox-card-actions">
        ${choices.map(function (choice) {
          const choiceId = String(choice?.id || "").trim();
          if (!choiceId) return "";
          return `
            <button
              class="civi-btn civi-inbox-answer-btn"
              type="button"
              data-civi-inbox-answer="1"
              data-mail-id="${escapeHtml(mailId)}"
              data-choice-id="${escapeHtml(choiceId)}"
            >${escapeHtml(choice?.label || choiceId)}</button>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderInboxCard(item, channelLabel) {
    const lines = bodyLinesOf(item);
    const pending = isPending(item);

    return `
      <article class="civi-inbox-card ${pending ? "is-pending" : "is-resolved"}">
        <div class="civi-inbox-card-head">
          <div>
            <strong>${escapeHtml(titleOf(item))}</strong>
            <div class="muted">Fra: ${escapeHtml(fromOf(item))}</div>
          </div>
          <span class="civi-inbox-status">${pending ? "Åpen" : "Avklart"}</span>
        </div>
        <div class="muted">${escapeHtml(metaOf(item, channelLabel))}</div>
        ${lines.length ? `<div class="civi-inbox-body">${lines.map(function (line) {
          return `<p>${escapeHtml(line)}</p>`;
        }).join("")}</div>` : ""}
        ${renderChoiceButtons(item)}
      </article>
    `;
  }

  function isResolved(item) {
    const status = normalize(item?.status);
    return item?.resolved === true || status === "resolved" || status === "answered";
  }

  function renderInboxSection(label, intro, items, emptyText) {
    const visible = (Array.isArray(items) ? items : [])
      .filter(function (item) { return item && item.deleted !== true && item.archived !== true; });

    const openItems = visible.filter(function (item) {
      const status = normalize(item?.status || "pending");
      return (status === "pending" || status === "open") && item?.resolved !== true;
    });

    const resolvedItems = visible.filter(isResolved);
    const pendingCount = openItems.length;

    return `
      <section class="civi-inbox-channel-section">
        <div class="civi-inbox-channel-head">
          <div>
            <h3>${escapeHtml(label)}</h3>
            <p class="muted">${escapeHtml(intro)}</p>
          </div>
          <strong>${pendingCount} åpne</strong>
        </div>
        <div class="civi-inbox-channel-list">
          ${openItems.length
            ? openItems.map(function (item) { return renderInboxCard(item, label); }).join("")
            : `<div class="civi-inbox-empty muted">${escapeHtml(emptyText)}</div>`
          }
          ${resolvedItems.length
            ? `<p class="civi-inbox-subheading muted">Avklart</p>${resolvedItems.map(function (item) { return renderInboxCard(item, label); }).join("")}`
            : ""
          }
        </div>
      </section>
    `;
  }

  function answerFromInbox(button) {
    const mailId = String(button?.getAttribute("data-mail-id") || "").trim();
    const choiceId = String(button?.getAttribute("data-choice-id") || "").trim();
    if (!mailId || !choiceId) return;

    button.disabled = true;

    const result = window.CivicationMailEngine?.answerMail
      ? window.CivicationMailEngine.answerMail(mailId, choiceId)
      : window.HG_CiviEngine?.answer?.(mailId, choiceId);

    Promise.resolve(result)
      .then(function () {
        try { window.dispatchEvent(new Event("updateProfile")); } catch {}
        scheduleRefresh();
        scheduleInboxSectionsRefresh();
      })
      .catch(function (error) {
        button.disabled = false;
        if (window.DEBUG) console.warn("[CivicationInboxTopActionUI] Kunne ikke svare på mail", error);
      });
  }

  function wireInboxResponses(host) {
    host.querySelectorAll("[data-civi-inbox-answer]").forEach(function (button) {
      button.addEventListener("click", function () {
        answerFromInbox(button);
      });
    });
  }

  function renderInboxSections() {
    const host = document.getElementById("civiInbox");
    if (!host) return false;

    const split = splitInboxByMessageChannel();
    const job = (split.job || []).concat(split.unknown || []);
    const privateMessages = split.private || [];
    const systemMessages = split.system || [];

    host.innerHTML = `
      <div class="civi-inbox-sections" data-civi-inbox-sections="1">
        ${renderInboxSection(
          "Jobbmail",
          "Arbeid, stilling, rolleprogresjon, arbeidsdag, konflikter, forfremmelse, stagnasjon og oppsigelse.",
          job,
          "Ingen jobbmail akkurat nå."
        )}
        ${renderInboxSection(
          "Personlige meldinger",
          "Kveld, fritid, private relasjoner og livshendelser utenfor jobblogikken.",
          privateMessages,
          "Ingen personlige meldinger akkurat nå."
        )}
        ${systemMessages.length ? renderInboxSection(
          "System",
          "Statusmeldinger og tekniske beskjeder.",
          systemMessages,
          "Ingen systemmeldinger."
        ) : ""}
      </div>
    `;

    wireInboxResponses(host);
    return true;
  }

  function refreshTopAction() {
    setTopCard(buildTopModel());
  }

  function scheduleRefresh() {
    window.setTimeout(refreshTopAction, 0);
    window.setTimeout(refreshTopAction, 80);
    window.setTimeout(refreshTopAction, 260);
  }

  function scheduleInboxSectionsRefresh() {
    window.setTimeout(renderInboxSections, 0);
    window.setTimeout(renderInboxSections, 80);
    window.setTimeout(renderInboxSections, 260);
  }

  function wrapMiniRefresh() {
    const api = window.CivicationMiniSectionsUI;
    if (!api || api.__civiInboxTopActionWrapped) return;

    const originalRefresh = api.refresh;
    api.refresh = function wrappedRefresh() {
      const result = typeof originalRefresh === "function"
        ? originalRefresh.apply(this, arguments)
        : undefined;
      scheduleRefresh();
      scheduleInboxSectionsRefresh();
      return result;
    };

    api.__civiInboxTopActionWrapped = true;
  }

  function wrapLegacyInboxRenderer() {
    const originalRender = window.renderCivicationInbox;
    if (typeof originalRender !== "function") return;
    if (originalRender.__civiInboxSectionsWrapped) return;

    const wrappedRender = function wrappedRenderCivicationInbox() {
      const result = originalRender.apply(this, arguments);
      scheduleInboxSectionsRefresh();
      return result;
    };

    wrappedRender.__civiInboxSectionsWrapped = true;
    wrappedRender.__civiOriginalRender = originalRender;
    window.renderCivicationInbox = wrappedRender;
  }

  function boot() {
    wrapMiniRefresh();
    wrapLegacyInboxRenderer();
    scheduleRefresh();
    scheduleInboxSectionsRefresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  [
    "civi:inboxChanged",
    "civi:dataReady",
    "civi:booted",
    "updateProfile",
    "civi:homeChanged"
  ].forEach(function (eventName) {
    window.addEventListener(eventName, function () {
      scheduleRefresh();
      scheduleInboxSectionsRefresh();
    });
  });

  window.CivicationInboxTopActionUI = {
    refresh: refreshTopAction,
    renderSections: renderInboxSections,
    getActionable: pendingActionItems,
    getMessages: visibleMessages,
    splitChannels: splitInboxByMessageChannel
  };
})();
