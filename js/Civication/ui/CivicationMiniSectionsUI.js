// ============================================================
// CIVICATION MINI SECTIONS UI
// Gjør Civication-seksjoner til funksjonelle minikort som standard.
// Ingen state-mutasjon: kun DOM-struktur og presentasjon.
// ============================================================

(function () {
  const STORAGE_KEY = "hg_civi_expanded_sections_v1";

  const SECTION_CONFIG = {
    activeJobSection: {
      label: "Aktiv rolle",
      accent: "💼",
      source: "activeJobCard",
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
      summary: function () {
        const pending = window.HG_CiviEngine?.getPendingEvent?.();
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
      summary: function () {
        const inbox = getInbox();
        if (!inbox.length) return "Ingen åpne hendelser.";
        const first = inbox[0]?.event || inbox[0] || null;
        const title = first?.subject || first?.title || first?.kind || "Åpen hendelse";
        return `${inbox.length} åpen${inbox.length === 1 ? "" : "e"} · ${title}`;
      }
    },
    civiHomeStatus: {
      label: "Hjem",
      accent: "🏠",
      source: "homeStatusContent",
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
      summary: function () {
        return firstText("civiOnboardingPanel") || "Neste anbefalte Civication-steg.";
      }
    },
    civiCapital: {
      selector: ".civi-capital",
      label: "Kapital",
      accent: "💎",
      source: "capEconomic",
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
      summary: function () {
        return firstText("identityDominant") || "Identitet og hvordan du blir oppfattet.";
      }
    },
    civiPublicFeedSection: {
      label: "Offentlig",
      accent: "📢",
      source: "civiPublicFeed",
      summary: function () {
        return firstText("civiPublicFeed") || "Ingen offentlig feed akkurat nå.";
      }
    },
    civiDebateSection: {
      label: "Debatt",
      accent: "💬",
      source: "civiDebatePanel",
      summary: function () {
        return firstText("civiDebatePanel") || "Ingen aktiv debatt.";
      }
    },
    civiPeopleSection: {
      label: "Mennesker",
      accent: "👥",
      source: "civiPeoplePanel",
      summary: function () {
        return firstText("civiPeoplePanel") || "Ingen aktive møter.";
      }
    },
    civiStoreSection: {
      label: "Butikker",
      accent: "🛒",
      source: "civiStorePanel",
      summary: function () {
        return firstText("civiStorePanel") || "Ingen åpne butikker eller pakker.";
      }
    },
    civiTrackHUD: {
      label: "Aktiv retning",
      accent: "🎯",
      source: "civiTrackName",
      summary: function () {
        const name = firstText("civiTrackName");
        const progress = firstText("civiTrackProgress");
        if (!name || name === "–" || name === "-") return "Ingen aktiv retning.";
        return progress && progress !== "–" ? `${name} · ${progress}` : name;
      }
    }
  };

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

  function textOf(id) {
    const el = document.getElementById(id);
    return String(el?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function firstText(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    return String(el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 140);
  }

  function loadExpanded() {
    try {
      const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  function saveExpanded(set) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  function resolveSection(key, config) {
    if (config.selector) return document.querySelector(config.selector);
    return document.getElementById(key);
  }

  function ensureMiniStructure(section, key, config, expandedSet) {
    if (!section || section.dataset.civiMiniReady === "1") return;
    if (section.id === "civiDashboardSection") return;

    const existingChildren = Array.from(section.childNodes);
    const body = document.createElement("div");
    body.className = "civi-section-body";
    existingChildren.forEach(function (node) {
      body.appendChild(node);
    });

    const head = document.createElement("button");
    head.type = "button";
    head.className = "civi-mini-head";
    head.setAttribute("aria-expanded", "false");

    head.innerHTML = `
      <div class="civi-mini-main">
        <div class="civi-mini-title-row">
          <span class="civi-mini-accent" aria-hidden="true">${config.accent || "•"}</span>
          <h2>${config.label || "Seksjon"}</h2>
        </div>
        <div class="civi-mini-summary" data-civi-mini-summary>—</div>
        <div class="civi-mini-count" data-civi-mini-count>Kan brukes direkte</div>
      </div>
      <span class="civi-mini-toggle" aria-hidden="true">+</span>
    `;

    section.appendChild(head);
    section.appendChild(body);
    section.dataset.civiMiniReady = "1";
    section.dataset.civiMiniKey = key;

    const shouldExpand = expandedSet.has(key);
    setExpanded(section, shouldExpand, false);

    head.addEventListener("click", function () {
      const next = !section.classList.contains("is-expanded");
      setExpanded(section, next, true);
    });
  }

  function setExpanded(section, expanded, persist) {
    const head = section.querySelector(":scope > .civi-mini-head");
    const toggle = section.querySelector(":scope > .civi-mini-head .civi-mini-toggle");
    const key = section.dataset.civiMiniKey;

    section.classList.toggle("is-expanded", expanded);
    if (head) head.setAttribute("aria-expanded", expanded ? "true" : "false");
    if (toggle) toggle.textContent = expanded ? "–" : "+";

    if (persist && key) {
      const set = loadExpanded();
      if (expanded) set.add(key);
      else set.delete(key);
      saveExpanded(set);
    }
  }

  function refreshSummaries() {
    Object.entries(SECTION_CONFIG).forEach(function ([key, config]) {
      const section = resolveSection(key, config);
      if (!section || section.dataset.civiMiniReady !== "1") return;

      const summaryEl = section.querySelector(":scope > .civi-mini-head [data-civi-mini-summary]");
      const countEl = section.querySelector(":scope > .civi-mini-head [data-civi-mini-count]");
      const source = config.source ? document.getElementById(config.source) : null;

      let summary = "—";
      try {
        summary = config.summary?.() || "—";
      } catch {
        summary = "—";
      }

      const childCount = source ? source.children.length : 0;
      const hasText = source ? String(source.textContent || "").trim().length > 0 : false;
      const count = section.classList.contains("is-expanded")
        ? "Full visning"
        : (childCount > 0
            ? `${childCount} element${childCount === 1 ? "" : "er"} · direkte valg`
            : (hasText ? "Direkte innhold" : "Miniversjon"));

      if (summaryEl) summaryEl.textContent = summary;
      if (countEl) countEl.textContent = count;
    });
  }

  function bootMiniSections() {
    document.body.classList.add("civi-mini-mode");
    const expandedSet = loadExpanded();

    Object.entries(SECTION_CONFIG).forEach(function ([key, config]) {
      const section = resolveSection(key, config);
      ensureMiniStructure(section, key, config, expandedSet);
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
    refresh: refreshSummaries
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
