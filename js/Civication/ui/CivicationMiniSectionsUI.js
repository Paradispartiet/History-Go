// ============================================================
// CIVICATION MINI SECTIONS UI
// Civication Home:
// - Forsiden viser livsområder, rik status og viktigste handling.
// - Mail/Inbox vises ikke som eget kort; det brukes som global "Krever svar".
// - Fullt innhold og alle valg åpnes i mørk popup.
// - Ingen state-mutasjon: kun DOM-struktur og presentasjon.
// ============================================================

(function () {
  const CATEGORY_STORAGE_KEY = "hg_civi_selected_life_category_v1";

  const CATEGORY_CONFIG = {
    personlig: { label: "Personlig" },
    karriere: { label: "Karriere" },
    fritid: { label: "Fritid" },
    kommers: { label: "Kommers" },
    kultur: { label: "Kultur" }
  };

  const SECTION_CONFIG = {
    activeJobSection: {
      category: "karriere",
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
      },
      details: function () {
        const active = window.CivicationState?.getActivePosition?.() || {};
        const wallet = firstText("civiDashWallet");
        const income = firstText("civiDashIncome");
        return [
          active.brand_name ? `Arbeidssted: ${active.brand_name}` : null,
          active.workplace ? `Arbeidssted: ${active.workplace}` : null,
          income && income !== "Ingen ukeinntekt" ? income : null,
          wallet && wallet !== "0 PC" ? `Saldo: ${wallet}` : null,
          active.status ? `Jobbstatus: ${active.status}` : null
        ];
      }
    },

    civiWorkdaySection: {
      category: "karriere",
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
      },
      details: function () {
        const split = splitInbox();
        const workday = (split.workday || []).filter(function (item) { return item && item.status === "pending"; });
        const active = window.CivicationState?.getActivePosition?.() || null;
        const first = workday[0]?.event || workday[0] || null;
        return [
          active?.title ? `Rolle: ${active.title}` : null,
          workday.length ? `Ventende arbeidsvalg: ${workday.length}` : null,
          first?.pressure ? `Press: ${Array.isArray(first.pressure) ? first.pressure.join(", ") : first.pressure}` : null,
          first?.task_domain ? `Domene: ${String(first.task_domain).replace(/_/g, " ")}` : null
        ];
      }
    },

    // Systemseksjon: skal IKKE vises som eget kort i kategorigridet.
    // Den åpnes kun via toppkortet "Krever svar".
    civiInboxSection: {
      category: "system",
      hideFromGrid: true,
      label: "Innkommende",
      accent: "📨",
      source: "civiInbox",
      empty: "Ingen åpne hendelser.",
      action: "Åpne inbox",
      urgentAction: "Svar nå",
      forceUrgent: function () {
        const split = splitInbox();
        return ((split.messages || []).length + (split.unknown || []).length + (split.milestones || []).length) > 0;
      },
      summary: function () {
        const split = splitInbox();
        const inbox = (split.messages || []).concat(split.unknown || [], split.milestones || []);
        if (!inbox.length) return "Ingen åpne meldinger.";
        const first = inbox[0]?.event || inbox[0] || null;
        const title = first?.subject || first?.title || first?.kind || "Åpen hendelse";
        return `${inbox.length} melding${inbox.length === 1 ? "" : "er"} · ${title}`;
      }
    },

    civiHomeStatus: {
      category: "personlig",
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
      },
      details: function () {
        const home = window.CivicationHome?.getState?.()?.home || null;
        return [
          home?.district ? `Nabolag: ${home.district}` : "Nabolag ikke valgt",
          home?.status ? `Bostatus: ${home.status}` : null,
          home?.cost ? `Kostnad: ${home.cost}` : null
        ];
      }
    },

    civiOnboardingSection: {
      category: "karriere",
      label: "Neste steg",
      accent: "🎯",
      source: "civiOnboardingPanel",
      empty: "Ingen neste steg akkurat nå.",
      action: "Åpne neste steg",
      urgentAction: "Fortsett",
      summary: function () {
        return firstText("civiOnboardingPanel") || "Neste anbefalte Civication-steg.";
      },
      details: function () {
        const host = document.getElementById("civiOnboardingPanel");
        const buttons = host ? host.querySelectorAll("button:not([disabled])").length : 0;
        return [
          buttons ? `Mulige valg: ${buttons}` : null,
          hasBodyAction("civiOnboardingSection") ? "Handling tilgjengelig" : null,
          firstText("civiDashFocus") ? `Fokus: ${firstText("civiDashFocus")}` : null
        ];
      }
    },

    civiCapital: {
      category: "kultur",
      selector: ".civi-capital",
      label: "Kapital",
      accent: "💎",
      source: "capEconomic",
      empty: "Kapitalverdier ikke beregnet ennå.",
      action: "Se kapital",
      summary: function () {
        const values = capitalPairs().filter(function (pair) { return pair.value && pair.value !== "—"; });
        if (!values.length) return "Kapitalverdier ikke beregnet ennå.";
        return values.map(function (pair) { return `${pair.short} ${pair.value}`; }).join(" · ");
      },
      details: function () {
        const values = capitalPairs().filter(function (pair) { return pair.value && pair.value !== "—"; });
        const ranked = values
          .map(function (pair) { return { ...pair, num: Number(String(pair.value).replace(",", ".")) }; })
          .filter(function (pair) { return Number.isFinite(pair.num); })
          .sort(function (a, b) { return b.num - a.num; });

        return [
          ranked[0] ? `Sterkest: ${ranked[0].label}` : null,
          ranked.length > 1 ? `Svakest: ${ranked[ranked.length - 1].label}` : null,
          values.length ? `Kapitalfelt: ${values.length}/5 aktive` : null
        ];
      }
    },

    civiPsyche: {
      category: "personlig",
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
      },
      details: function () {
        return [
          validText("psyIntegrity") ? `Integritet: ${textOf("psyIntegrity")}` : null,
          validText("psyVisibility") ? `Synlighet: ${textOf("psyVisibility")}` : null,
          validText("psyEconomic") ? `Handlingsrom: ${textOf("psyEconomic")}` : null,
          textOf("psyBurnout") ? `Burnout/stress: ${textOf("psyBurnout")}` : null
        ];
      }
    },

    civiIdentity: {
      category: "personlig",
      selector: ".civi-identity",
      label: "Identitet",
      accent: "🧭",
      source: "identityDominant",
      empty: "Identitet ikke beregnet ennå.",
      action: "Se identitet",
      summary: function () {
        return firstText("identityDominant") || "Identitet og hvordan du blir oppfattet.";
      },
      details: function () {
        const compass = firstText("identityCompass");
        const perception = firstText("identityPerception");
        return [
          compass ? `Kompass: ${compass}` : null,
          perception ? `Persepsjon: ${perception}` : null,
          document.getElementById("identityPerceptionBtn") ? "Kan vise hvordan andre oppfatter deg" : null
        ];
      }
    },

    civiPublicFeedSection: {
      category: "kultur",
      label: "Offentlig",
      accent: "📢",
      source: "civiPublicFeed",
      empty: "Ingen offentlig feed akkurat nå.",
      action: "Åpne offentlig",
      summary: function () {
        return firstText("civiPublicFeed") || "Ingen offentlig feed akkurat nå.";
      },
      details: function () {
        const host = document.getElementById("civiPublicFeed");
        const count = host ? host.children.length : 0;
        return [
          count ? `Offentlige elementer: ${count}` : null,
          hasBodyAction("civiPublicFeedSection") ? "Handling tilgjengelig" : null,
          count ? "Påvirker synlighet og omdømme" : null
        ];
      }
    },

    civiDebateSection: {
      category: "kultur",
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
      },
      details: function () {
        const host = document.getElementById("civiDebatePanel");
        const buttons = host ? host.querySelectorAll("button:not([disabled])").length : 0;
        return [
          buttons ? `Svarvalg: ${buttons}` : null,
          hasBodyAction("civiDebateSection") ? "Debatt krever valg" : null,
          host?.children?.length ? `Debattelementer: ${host.children.length}` : null
        ];
      }
    },

    civiPeopleSection: {
      category: "personlig",
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
      },
      details: function () {
        const host = document.getElementById("civiPeoplePanel");
        const buttons = host ? host.querySelectorAll("button:not([disabled])").length : 0;
        return [
          host?.children?.length ? `Møter/elementer: ${host.children.length}` : null,
          buttons ? `Mulige svar: ${buttons}` : null,
          hasBodyAction("civiPeopleSection") ? "Relasjon krever valg" : null
        ];
      }
    },

    civiStoreSection: {
      category: "kommers",
      label: "Butikker",
      accent: "🛒",
      source: "civiStorePanel",
      empty: "Ingen åpne butikker eller pakker.",
      action: "Åpne butikk",
      summary: function () {
        return firstText("civiStorePanel") || "Ingen åpne butikker eller pakker.";
      },
      details: function () {
        const host = document.getElementById("civiStorePanel");
        const wallet = firstText("civiDashWallet");
        const buttons = host ? host.querySelectorAll("button:not([disabled])").length : 0;
        return [
          wallet ? `PC: ${wallet}` : null,
          host?.children?.length ? `Tilbud/elementer: ${host.children.length}` : null,
          buttons ? `Kjøpsvalg: ${buttons}` : null
        ];
      }
    },

    civiTrackHUD: {
      category: "karriere",
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
      },
      details: function () {
        const tags = firstText("civiTrackTags");
        return [
          validText("civiTrackProgress") ? `Fremdrift: ${firstText("civiTrackProgress")}` : null,
          tags ? `Tagger: ${tags}` : null,
          validText("civiTrackName") ? "Karriereretning aktiv" : null
        ];
      }
    }
  };

  let activeModalSection = null;
  let activeModalBody = null;
  let selectedCategory = null;

  function getPreferredDefaultCategory() {
    const active = window.CivicationState?.getActivePosition?.();
    return active ? "karriere" : "personlig";
  }

  function getSelectedCategory() {
    const stored = String(localStorage.getItem(CATEGORY_STORAGE_KEY) || "").toLowerCase();
    if (CATEGORY_CONFIG[stored]) return stored;
    return getPreferredDefaultCategory();
  }

  function setSelectedCategory(category) {
    const next = CATEGORY_CONFIG[category] ? category : getPreferredDefaultCategory();
    selectedCategory = next;
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, next);
    } catch {}
  }

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

  function textOf(id) {
    const el = document.getElementById(id);
    return String(el?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function firstText(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    return String(el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 140);
  }

  function validText(id) {
    const value = textOf(id);
    return !!value && value !== "—" && value !== "–" && value !== "-";
  }

  function capitalPairs() {
    return [
      { short: "Øk", label: "Økonomisk", value: textOf("capEconomic") },
      { short: "Kul", label: "Kulturell", value: textOf("capCultural") },
      { short: "Sos", label: "Sosial", value: textOf("capSocial") },
      { short: "Sym", label: "Symbolsk", value: textOf("capSymbolic") },
      { short: "Pol", label: "Politisk", value: textOf("capPolitical") }
    ];
  }

  function normalizeUiLine(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[•·:;,.!?()[\]{}"'«»]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function uniqueDetailLines(lines, summary) {
    const out = [];
    const seen = new Set();
    const summaryNorm = normalizeUiLine(summary);

    (Array.isArray(lines) ? lines : []).forEach(function (line) {
      const text = String(line || "").replace(/\s+/g, " ").trim();
      const norm = normalizeUiLine(text);
      if (!text || !norm || seen.has(norm)) return;

      const duplicateOfSummary = summaryNorm && norm.length > 5 && (
        norm === summaryNorm ||
        summaryNorm.includes(norm) ||
        norm.includes(summaryNorm)
      );
      if (duplicateOfSummary) return;

      seen.add(norm);
      out.push(text);
    });

    return out.slice(0, 4);
  }

  function resolveSection(key, config) {
    if (config?.selector) return document.querySelector(config.selector);
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

  function getTopAction() {
    const split = splitInbox();

    const milestonePending = (split.milestones || []).find(function (item) {
      return item && item.status === "pending";
    });
    if (milestonePending) {
      const ev = milestonePending.event || milestonePending;
      return {
        mode: "urgent",
        tone: "milestone",
        title: "Ny milepæl",
        summary: ev?.subject || "Du har låst opp en milepæl.",
        action: "Se milepæl",
        sectionKey: "civiInboxSection"
      };
    }

    const inbox = (split.messages || []).concat(split.unknown || []);
    if (inbox.length) {
      const first = inbox[0]?.event || inbox[0] || null;
      return {
        mode: "urgent",
        title: "Krever svar",
        summary: `${first?.subject || first?.title || "Du har en åpen hendelse i inbox."} · ${first?.kind || "Innkommende"}`,
        action: "Svar nå",
        sectionKey: "civiInboxSection"
      };
    }

    const home = window.CivicationHome?.getState?.()?.home || null;
    if (home?.status !== "settled") {
      return {
        mode: "urgent",
        title: "Neste handling",
        summary: "Du må velge nabolag før hverdagen stabiliseres.",
        action: "Velg nabolag",
        sectionKey: "civiHomeStatus"
      };
    }

    if (hasBodyAction("civiWorkdaySection")) {
      return {
        mode: "urgent",
        title: "Neste handling",
        summary: "Arbeidsdagen inneholder en oppgave som venter på deg.",
        action: "Åpne oppgave",
        sectionKey: "civiWorkdaySection"
      };
    }

    if (hasBodyAction("civiDebateSection")) {
      return {
        mode: "urgent",
        title: "Neste handling",
        summary: "Debatten trenger svar for å holde momentum.",
        action: "Åpne hendelse",
        sectionKey: "civiDebateSection"
      };
    }

    if (hasBodyAction("civiPeopleSection")) {
      return {
        mode: "urgent",
        title: "Neste handling",
        summary: "En relasjon venter på et valg fra deg.",
        action: "Åpne hendelse",
        sectionKey: "civiPeopleSection"
      };
    }

    return {
      mode: "calm",
      title: "Ingen handling krever svar nå",
      summary: "Du kan utforske valgt livsområde i roligere tempo.",
      action: "Se dashboard",
      sectionKey: null
    };
  }

  function ensureHomeControls() {
    const dashboard = document.getElementById("civiDashboardSection");
    if (!dashboard || !dashboard.parentElement) return null;

    let controls = document.getElementById("civiLifeHomeControls");
    if (!controls) {
      controls = document.createElement("section");
      controls.id = "civiLifeHomeControls";
      controls.className = "civi-home-controls";
      controls.innerHTML = `
        <article id="civiTopActionCard" class="civi-top-action-card is-calm">
          <div class="civi-top-action-head">
            <p class="civi-top-action-title">Neste handling</p>
            <span class="civi-top-action-chip">Rolig</span>
          </div>
          <p class="civi-top-action-summary">Ingen handling krever svar nå.</p>
          <button type="button" class="civi-top-action-button" data-civi-top-action>Se dashboard</button>
        </article>
        <nav class="civi-category-nav" aria-label="Civication livsområder"></nav>
      `;
      dashboard.insertAdjacentElement("afterend", controls);
    }

    if (controls.previousElementSibling !== dashboard) {
      dashboard.insertAdjacentElement("afterend", controls);
    }

    return controls;
  }

  function refreshCategoryNav() {
    const nav = ensureHomeControls()?.querySelector(".civi-category-nav");
    if (!nav) return;

    nav.innerHTML = "";
    Object.entries(CATEGORY_CONFIG).forEach(function ([key, item]) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "civi-category-tab" + (key === selectedCategory ? " is-active" : "");
      btn.dataset.category = key;
      btn.textContent = item.label;
      btn.addEventListener("click", function () {
        setSelectedCategory(key);
        refreshCategoryNav();
        applyCategoryFilter();
        refreshSummaries();
      });
      nav.appendChild(btn);
    });
  }

  function applyCategoryFilter() {
    if (!selectedCategory) selectedCategory = getSelectedCategory();

    Object.entries(SECTION_CONFIG).forEach(function ([key, config]) {
      const section = resolveSection(key, config);
      if (!section) return;

      const shouldHide = config.hideFromGrid || config.category === "system" || config.category !== selectedCategory;
      section.classList.toggle("civi-hidden-by-category", shouldHide);
      section.dataset.civiLifeCategory = config.category || "system";
    });

    const hasVisible = Object.entries(SECTION_CONFIG).some(function ([key, config]) {
      if (config.hideFromGrid || config.category === "system") return false;
      return config.category === selectedCategory && !!resolveSection(key, config);
    });

    const controls = ensureHomeControls();
    let empty = document.getElementById("civiCategoryEmptyCard");
    if (!empty) {
      empty = document.createElement("article");
      empty.id = "civiCategoryEmptyCard";
      empty.className = "civi-category-empty";
      empty.innerHTML = "<h3>Ingen aktive fritidsvalg akkurat nå.</h3><p>Fritid kan senere kobles til sport, natur, steder og aktiviteter.</p>";
      controls?.insertAdjacentElement("afterend", empty);
    }

    empty.classList.toggle("is-visible", selectedCategory === "fritid" && !hasVisible);
  }

  function refreshTopActionCard() {
    const card = ensureHomeControls()?.querySelector("#civiTopActionCard");
    if (!card) return;

    const next = getTopAction();
    card.classList.toggle("is-urgent", next.mode === "urgent");
    card.classList.toggle("is-calm", next.mode !== "urgent");
    card.classList.toggle("is-milestone", next.tone === "milestone");

    card.querySelector(".civi-top-action-title").textContent = next.title;
    card.querySelector(".civi-top-action-summary").textContent = next.summary;
    card.querySelector(".civi-top-action-chip").textContent = next.tone === "milestone" ? "Milepæl" : (next.mode === "urgent" ? "Krever svar" : "Stabilt");

    const actionBtn = card.querySelector("[data-civi-top-action]");
    actionBtn.textContent = next.action;

    const openFromTopCard = function () {
      if (!next.sectionKey) return;
      const section = resolveSection(next.sectionKey, SECTION_CONFIG[next.sectionKey]);
      if (section) openPopup(section, SECTION_CONFIG[next.sectionKey]);
    };

    actionBtn.onclick = openFromTopCard;
    card.onclick = function (event) {
      const target = event.target;
      if (target && target.closest("button")) return;
      openFromTopCard();
    };
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
      <div class="civi-mini-details" data-civi-mini-details></div>
      <div class="civi-mini-status" data-civi-mini-status>Ingen valg</div>
      <button type="button" class="civi-mini-action" data-civi-mini-open>Åpne</button>
    `;

    section.appendChild(card);
    section.appendChild(body);
    section.dataset.civiMiniReady = "1";
    section.dataset.civiMiniKey = key;
    section.dataset.civiLifeCategory = config.category || "system";

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
      const detailsEl = section.querySelector(":scope > .civi-mini-card [data-civi-mini-details]");
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

      const detailLines = (() => {
        try {
          const lines = typeof config.details === "function" ? config.details() : [];
          return uniqueDetailLines(lines, summary);
        } catch {
          return [];
        }
      })();

      if (detailsEl) {
        detailsEl.innerHTML = "";
        detailLines.forEach(function (line) {
          const row = document.createElement("div");
          row.className = "civi-mini-detail-line";
          row.textContent = line;
          detailsEl.appendChild(row);
        });
      }

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

    refreshTopActionCard();
    applyCategoryFilter();
  }

  function bootMiniSections() {
    document.body.classList.add("civi-mini-mode");
    ensureModal();
    ensureHomeControls();

    if (!selectedCategory) setSelectedCategory(getSelectedCategory());

    Object.entries(SECTION_CONFIG).forEach(function ([key, config]) {
      const section = resolveSection(key, config);
      ensureMiniStructure(section, key, config);
    });

    refreshTopActionCard();
    refreshCategoryNav();
    refreshSummaries();
    applyCategoryFilter();
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleRefresh);
  } else {
    scheduleRefresh();
  }

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
