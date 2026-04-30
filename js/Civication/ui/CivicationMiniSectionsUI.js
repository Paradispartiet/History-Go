// ============================================================
// CIVICATION MINI SECTIONS UI
// Forsiden viser bare det nødvendige: status + valgknapp.
// Fullt innhold og alle valg åpnes i mørk popup.
// Ingen state-mutasjon: kun DOM-struktur og presentasjon.
// ============================================================

(function () {
  const SECTION_CONFIG = {
    activeJobSection: {
      label: "Aktiv rolle",
      accent: "💼",
      source: "activeJobCard",
      empty: "Ingen aktiv rolle ennå.",
      action: "Åpne rolle",
      urgentAction: "Svar på tilbud",
      summary: function () {
        const active = window.CivicationState?.getActivePosition?.();
        if (!active) return "Ingen aktiv rolle ennå.";
        return String(active.title || active.career_name || active.career_id || "Aktiv rolle");
      }
    },
    civiWorkdaySection: {
      label: "Arbeidsdag",
      accent: "🕐",
      source: "civiWorkdayPanel",
      empty: "Ingen arbeidsdag uten aktiv rolle.",
      action: "Åpne arbeidsdag",
      urgentAction: "Åpne oppgave",
      forceUrgent: function () {
        const split = splitInbox();
        if ((split.workday || []).some(function (item) { return item && item.status === "pending"; })) return true;
        return hasBodyAction("civiWorkdaySection");
      },
      summary: function () {
        const split = splitInbox();
        const pending = (split.workday || []).find(function (item) { return item && item.status === "pending"; });
        const ev = pending?.event || null;
        if (ev?.subject) return String(ev.subject);
        const active = window.CivicationState?.getActivePosition?.();
        return active ? "Arbeidsdag, oppgaver og kontraktspress." : "Ingen arbeidsdag uten aktiv rolle.";
      }
    },
    civiInboxSection: {
      label: "Innkommende",
      accent: "📨",
      source: "civiInbox",
      empty: "Ingen åpne hendelser.",
      action: "Åpne inbox",
      urgentAction: "Svar nå",
      forceUrgent: function () {
        const split = splitInbox();
        return ((split.messages || []).length + (split.unknown || []).length) > 0;
      },
      summary: function () {
        const split = splitInbox();
        const inbox = (split.messages || []).concat(split.unknown || []);
        if (!inbox.length) return "Ingen åpne meldinger.";
        const first = inbox[0]?.event || inbox[0] || null;
        const title = first?.subject || first?.title || first?.kind || "Åpen hendelse";
        return `${inbox.length} melding${inbox.length === 1 ? "" : "er"} · ${title}`;
      }
    },
    civiHomeStatus: {
      label: "Hjem",
      accent: "🏠",
      source: "homeStatusContent",
      empty: "Ikke valgt nabolag.",
      action: "Åpne hjem",
      urgentAction: "Velg nabolag",
      forceUrgent: function () {
        const home = window.CivicationHome?.getState?.()?.home || null;
        return home?.status !== "settled";
      },
      summary: function () {
        const home = window.CivicationHome?.getState?.()?.home || null;
        if (home?.status === "settled") return `Bosatt: ${home.district || "valgt nabolag"}`;
        return "Ikke valgt nabolag.";
      }
    },
    civiOnboardingSection: {
      label: "Neste steg",
      accent: "🎯",
      source: "civiOnboardingPanel",
      empty: "Ingen neste steg akkurat nå.",
      action: "Åpne neste steg",
      urgentAction: "Fortsett",
      summary: function () {
        return firstText("civiOnboardingPanel") || "Neste anbefalte Civication-steg.";
      }
    },
    civiCapital: {
      selector: ".civi-capital",
      label: "Kapital",
      accent: "💎",
      source: "capEconomic",
      empty: "Kapitalverdier ikke beregnet ennå.",
      action: "Se kapital",
      summary: function () {
        const values = [
          ["Øk", textOf("capEconomic")],
          ["Kul", textOf("capCultural")],
          ["Sos", textOf("capSocial")],
          ["Sym", textOf("capSymbolic")],
          ["Pol", textOf("capPolitical")]
        ].filter(function (pair) { return pair[1] && pair[1] !== "—"; });

        if (!values.length) return "Kapitalverdier ikke beregnet ennå.";
        return values.map(function (pair) { return `${pair[0]} ${pair[1]}`; }).join(" · ");
      }
    },
    civiPsyche: {
      selector: ".civi-psyche",
      label: "Psyke",
      accent: "🧠",
      source: "psyAutonomy",
      empty: "Psykeverdier ikke beregnet ennå.",
      action: "Se psyke",
      summary: function () {
        const auto = textOf("psyAutonomy");
        const trust = textOf("psyTrust");
        if (auto && auto !== "—") return `Selvstendighet ${auto}${trust && trust !== "—" ? ` · Tillit ${trust}` : ""}`;
        return "Psykeverdier ikke beregnet ennå.";
      }
    },
    civiIdentity: {
      selector: ".civi-identity",
      label: "Identitet",
      accent: "🧭",
      source: "identityDominant",
      empty: "Identitet ikke beregnet ennå.",
      action: "Se identitet",
      summary: function () {
        return firstText("identityDominant") || "Identitet og hvordan du blir oppfattet.";
      }
    },
    civiPublicFeedSection: {
      label: "Offentlig",
      accent: "📢",
      source: "civiPublicFeed",
      empty: "Ingen offentlig feed akkurat nå.",
      action: "Åpne offentlig",
      summary: function () {
        return firstText("civiPublicFeed") || "Ingen offentlig feed akkurat nå.";
      }
    },
    civiDebateSection: {
      label: "Debatt",
      accent: "💬",
      source: "civiDebatePanel",
      empty: "Ingen aktiv debatt.",
      action: "Åpne debatt",
      urgentAction: "Svar nå",
      forceUrgent: function () {
        return hasBodyAction("civiDebateSection");
      },
      summary: function () {
        return firstText("civiDebatePanel") || "Ingen aktiv debatt.";
      }
    },
    civiPeopleSection: {
      label: "Mennesker",
      accent: "👥",
      source: "civiPeoplePanel",
      empty: "Ingen aktive møter.",
      action: "Se mennesker",
      urgentAction: "Svar nå",
      forceUrgent: function () {
        return hasBodyAction("civiPeopleSection");
      },
      summary: function () {
        return firstText("civiPeoplePanel") || "Ingen aktive møter.";
      }
    },
    civiStoreSection: {
      label: "Butikker",
      accent: "🛒",
      source: "civiStorePanel",
      empty: "Ingen åpne butikker eller pakker.",
      action: "Åpne butikk",
      summary: function () {
        return firstText("civiStorePanel") || "Ingen åpne butikker eller pakker.";
      }
    },
    civiTrackHUD: {
      label: "Aktiv retning",
      accent: "🎯",
      source: "civiTrackName",
      empty: "Ingen aktiv retning.",
      action: "Se retning",
      summary: function () {
        const name = firstText("civiTrackName");
        const progress = firstText("civiTrackProgress");
        if (!name || name === "–" || name === "-") return "Ingen aktiv retning.";
        return progress && progress !== "–" ? `${name} · ${progress}` : name;
      }
    }
  };

  let activeModalSection = null;
  let activeModalBody = null;

  function getInbox() {
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
    if (typeof splitter !== "function") return { messages: inbox, workday: [], milestones: [], system: [], unknown: [] };
    return splitter(inbox);
  }

  function textOf(id) {
    const el = document.getElementById(id);
    return String(el?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function firstText(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    return String(el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 140);
  }

  function resolveSection(key, config) {
    if (config.selector) return document.querySelector(config.selector);
    return document.getElementById(key);
  }


  function hasBodyAction(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return false;
    const body = section.querySelector(":scope > .civi-section-body") || section;
    const selector = [
      "button:not(.civi-mini-action):not(.civi-popup-close):not([disabled])",
      "input:not([type='hidden']):not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])"
    ].join(",");
    return !!body.querySelector(selector);
  }

  function getSectionSource(section, config) {
    if (!section || !config?.source) return null;
    return document.getElementById(config.source);
  }

  function hasActionRequired(section, config) {
    if (!section) return false;

    if (typeof config.forceUrgent === "function") {
      try {
        if (config.forceUrgent()) return true;
      } catch {}
    }

    const body = section.querySelector(":scope > .civi-section-body");
    if (!body) return false;

    const selector = [
      "button:not(.civi-mini-action):not(.civi-popup-close):not([disabled])",
      "input:not([type='hidden']):not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])"
    ].join(",");

    return !!body.querySelector(selector);
  }

  function ensureModal() {
    let modal = document.getElementById("civiSectionPopup");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "civiSectionPopup";
    modal.className = "civi-section-popup";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="civi-section-popup-backdrop" data-civi-popup-close></div>
      <div class="civi-section-popup-panel" role="dialog" aria-modal="true" aria-labelledby="civiSectionPopupTitle">
        <div class="civi-section-popup-head">
          <div>
            <div class="civi-section-popup-kicker">Civication</div>
            <h2 id="civiSectionPopupTitle">Seksjon</h2>
          </div>
          <button type="button" class="civi-popup-close" data-civi-popup-close>×</button>
        </div>
        <div id="civiSectionPopupBody" class="civi-section-popup-body"></div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll("[data-civi-popup-close]").forEach(function (el) {
      el.addEventListener("click", closePopup);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closePopup();
      }
    });

    return modal;
  }

  function openPopup(section, config) {
    if (!section || !config) return;

    const body = section.querySelector(":scope > .civi-section-body");
    if (!body) return;

    closePopup();

    const modal = ensureModal();
    const title = modal.querySelector("#civiSectionPopupTitle");
    const host = modal.querySelector("#civiSectionPopupBody");

    activeModalSection = section;
    activeModalBody = body;

    if (title) title.textContent = `${config.accent || ""} ${config.label || "Seksjon"}`.trim();
    if (host) host.appendChild(body);

    body.classList.add("is-in-popup");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("civi-popup-open");
  }

  function closePopup() {
    const modal = document.getElementById("civiSectionPopup");

    if (activeModalSection && activeModalBody) {
      activeModalBody.classList.remove("is-in-popup");
      activeModalSection.appendChild(activeModalBody);
    }

    activeModalSection = null;
    activeModalBody = null;

    if (modal) {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }

    document.body.classList.remove("civi-popup-open");
    window.CivicationMiniSectionsUI?.refresh?.();
  }

  function ensureMiniStructure(section, key, config) {
    if (!section || section.dataset.civiMiniReady === "1") return;
    if (section.id === "civiDashboardSection") return;

    const existingChildren = Array.from(section.childNodes);
    const body = document.createElement("div");
    body.className = "civi-section-body";
    existingChildren.forEach(function (node) {
      body.appendChild(node);
    });

    const card = document.createElement("div");
    card.className = "civi-mini-card";
    card.setAttribute("role", "group");

    card.innerHTML = `
      <div class="civi-mini-title-row">
        <span class="civi-mini-accent" aria-hidden="true">${config.accent || "•"}</span>
        <h2>${config.label || "Seksjon"}</h2>
      </div>
      <div class="civi-mini-summary" data-civi-mini-summary>—</div>
      <div class="civi-mini-status" data-civi-mini-status>Ingen valg</div>
      <button type="button" class="civi-mini-action" data-civi-mini-open>Åpne</button>
    `;

    section.appendChild(card);
    section.appendChild(body);
    section.dataset.civiMiniReady = "1";
    section.dataset.civiMiniKey = key;

    card.addEventListener("click", function (event) {
      const target = event.target;
      if (target && target.closest("button")) return;
      openPopup(section, config);
    });

    card.querySelector("[data-civi-mini-open]")?.addEventListener("click", function () {
      openPopup(section, config);
    });
  }

  function refreshSummaries() {
    Object.entries(SECTION_CONFIG).forEach(function ([key, config]) {
      const section = resolveSection(key, config);
      if (!section || section.dataset.civiMiniReady !== "1") return;

      const summaryEl = section.querySelector(":scope > .civi-mini-card [data-civi-mini-summary]");
      const statusEl = section.querySelector(":scope > .civi-mini-card [data-civi-mini-status]");
      const actionEl = section.querySelector(":scope > .civi-mini-card [data-civi-mini-open]");
      const source = getSectionSource(section, config);

      let summary = "—";
      try {
        summary = config.summary?.() || config.empty || "—";
      } catch {
        summary = config.empty || "—";
      }

      const childCount = source ? source.children.length : 0;
      const hasText = source ? String(source.textContent || "").trim().length > 0 : false;
      const urgent = hasActionRequired(section, config);

      section.classList.toggle("needs-feedback", urgent);
      section.classList.toggle("is-info", !urgent && hasText);
      section.classList.toggle("is-empty", !urgent && !hasText);

      if (summaryEl) summaryEl.textContent = summary;

      if (statusEl) {
        if (urgent) statusEl.textContent = "Krever tilbakemelding";
        else if (childCount > 0) statusEl.textContent = `${childCount} element${childCount === 1 ? "" : "er"}`;
        else if (hasText) statusEl.textContent = "Har innhold";
        else statusEl.textContent = "Ingen handling nå";
      }

      if (actionEl) {
        actionEl.textContent = urgent
          ? (config.urgentAction || "Svar nå")
          : (config.action || "Åpne");
      }
    });
  }

  function bootMiniSections() {
    document.body.classList.add("civi-mini-mode");
    ensureModal();

    Object.entries(SECTION_CONFIG).forEach(function ([key, config]) {
      const section = resolveSection(key, config);
      ensureMiniStructure(section, key, config);
    });

    refreshSummaries();
  }

  function scheduleRefresh() {
    window.setTimeout(function () {
      bootMiniSections();
      refreshSummaries();
    }, 0);
    window.setTimeout(refreshSummaries, 140);
    window.setTimeout(refreshSummaries, 520);
  }

  window.CivicationMiniSectionsUI = {
    boot: bootMiniSections,
    refresh: refreshSummaries,
    openPopup,
    closePopup
  };

  document.addEventListener("DOMContentLoaded", scheduleRefresh);

  [
    "civi:dataReady",
    "civi:booted",
    "updateProfile",
    "civi:homeChanged",
    "civiPublicUpdated"
  ].forEach(function (eventName) {
    window.addEventListener(eventName, scheduleRefresh);
  });
})();
