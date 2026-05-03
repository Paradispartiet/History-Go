// ============================================================
// CIVICATION INBOX TOP ACTION UI
// Hensikt:
// - Toppkortet skal bare vise "Krever svar" når en hendelse faktisk
//   er pending OG har valg brukeren kan svare på.
// - Vanlige meldinger uten valg skal vises som melding/status, ikke som krav.
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

  function eventOf(item) {
    return item?.event || item || null;
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

  function refreshTopAction() {
    setTopCard(buildTopModel());
  }

  function scheduleRefresh() {
    window.setTimeout(refreshTopAction, 0);
    window.setTimeout(refreshTopAction, 80);
    window.setTimeout(refreshTopAction, 260);
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
      return result;
    };

    api.__civiInboxTopActionWrapped = true;
  }

  function boot() {
    wrapMiniRefresh();
    scheduleRefresh();
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
    window.addEventListener(eventName, scheduleRefresh);
  });

  window.CivicationInboxTopActionUI = {
    refresh: refreshTopAction,
    getActionable: pendingActionItems,
    getMessages: visibleMessages
  };
})();
