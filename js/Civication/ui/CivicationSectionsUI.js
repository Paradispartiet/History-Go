// ============================================================
// CIVICATION SECTIONS UI
// Gjør Civication-seksjoner minimerbare.
// Bevarer eksisterende render-funksjoner og state; dette er kun UI.
// ============================================================

(function () {
  const STORAGE_PREFIX = "hg_civi_section_open:";

  const TITLES = {
    civiOnboardingSection: "Neste steg",
    activeJobSection: "Aktiv rolle",
    civiWorkdaySection: "Arbeidsdag",
    civiInboxSection: "Innkommende",
    civiHomeStatus: "Hjem",
    civiPublicFeedSection: "Offentlig",
    civiDebateSection: "Debatt / konfrontasjon",
    civiPeopleSection: "Mennesker",
    civiStoreSection: "Butikker og pakker"
  };

  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/^[—–-]+\s*/, "")
      .trim();
  }

  function shortText(value, fallback) {
    const text = cleanText(value);
    if (!text) return fallback || "Minioversikt";
    return text.length > 82 ? `${text.slice(0, 79).trim()}…` : text;
  }

  function readOpenState(section) {
    const key = STORAGE_PREFIX + getSectionKey(section);
    const stored = localStorage.getItem(key);
    if (stored === "1") return true;
    if (stored === "0") return false;

    // Standard: Civication-siden skal være ryddig og vise miniversjoner.
    return false;
  }

  function writeOpenState(section, isOpen) {
    const key = STORAGE_PREFIX + getSectionKey(section);
    localStorage.setItem(key, isOpen ? "1" : "0");
  }

  function getSectionKey(section) {
    return section.id || Array.from(section.classList || []).join(".") || "section";
  }

  function getSectionTitle(section, h2) {
    const idTitle = TITLES[section.id];
    if (idTitle) return idTitle;
    return cleanText(h2?.textContent) || "Seksjon";
  }

  function getCapitalSummary(section) {
    const items = Array.from(section.querySelectorAll(".capital-item"));
    const values = items
      .map(function (item) {
        const label = cleanText(item.querySelector(".capital-label")?.textContent);
        const value = cleanText(item.querySelector(".capital-value")?.textContent);
        if (!label || !value || value === "—") return "";
        return `${label}: ${value}`;
      })
      .filter(Boolean)
      .slice(0, 3);

    return values.length ? values.join(" · ") : "Kapitalverdier";
  }

  function getPsycheSummary(section) {
    const autonomy = cleanText(section.querySelector("#psyAutonomy")?.textContent);
    const trust = cleanText(section.querySelector("#psyTrust")?.textContent);
    const integrity = cleanText(section.querySelector("#psyIntegrity")?.textContent);

    const parts = [];
    if (autonomy && autonomy !== "—") parts.push(`Selvstendighet: ${autonomy}`);
    if (trust && trust !== "—") parts.push(`Tillit: ${trust}`);
    if (integrity && integrity !== "—") parts.push(`Integritet: ${integrity}`);

    return parts.length ? parts.join(" · ") : "Psykeverdier";
  }

  function getWorkdaySummary(section) {
    const time = cleanText(section.querySelector(".civi-workday-time")?.textContent);
    const task = cleanText(section.querySelector(".civi-workday-task-title")?.textContent);
    const status = Array.from(section.querySelectorAll(".civi-workday-row"))
      .map(function (row) { return cleanText(row.textContent); })
      .find(function (txt) { return txt.toLowerCase().includes("status"); });

    const parts = [];
    if (time && time !== "—") parts.push(time);
    if (task && task !== "—") parts.push(task);
    if (status) parts.push(status.replace(/^Status\s*/i, "Status: "));

    return parts.length ? parts.join(" · ") : "Arbeidsdag";
  }

  function getInboxSummary(section) {
    const inbox = window.CivicationState?.getInbox?.() || [];
    const pending = window.HG_CiviEngine?.getPendingEvent?.();
    const event = pending?.event || inbox?.[0]?.event || null;
    const subject = cleanText(event?.subject || event?.title || section.textContent);

    if (Array.isArray(inbox) && inbox.length) {
      return `${inbox.length} åpen${inbox.length === 1 ? "" : "e"} · ${shortText(subject, "Hendelse")}`;
    }

    return "Ingen åpne hendelser";
  }

  function getActiveRoleSummary(section) {
    const active = window.CivicationState?.getActivePosition?.();
    const salary = cleanText(section.querySelector("#activeJobCard")?.textContent)
      .match(/Lønn:\s*([^\n]+)/i)?.[1];

    if (active?.title) {
      const field = cleanText(active.career_name || active.career_id || "");
      const parts = [active.title];
      if (field) parts.push(field);
      if (salary) parts.push(`Lønn: ${salary}`);
      return parts.join(" · ");
    }

    return "Ingen aktiv rolle";
  }

  function getHomeSummary(section) {
    const state = window.CivicationHome?.getState?.();
    if (state?.home?.status === "settled") {
      return `${state.home.district || "Hjem"} · Nivå ${state.home.level || 1}`;
    }

    return shortText(section.querySelector("#homeStatusContent")?.textContent, "Ikke valgt");
  }

  function getIdentitySummary(section) {
    return shortText(
      section.querySelector("#identityDominant")?.textContent ||
      section.querySelector("#identityPerception")?.textContent,
      "Identitetskompass"
    );
  }

  function getGenericSummary(section) {
    const clone = section.cloneNode(true);
    clone.querySelector(".civi-section-toggle")?.remove();
    return shortText(clone.textContent, "Minioversikt");
  }

  function getSummary(section) {
    if (section.classList.contains("civi-capital")) return getCapitalSummary(section);
    if (section.classList.contains("civi-psyche")) return getPsycheSummary(section);
    if (section.classList.contains("civi-identity")) return getIdentitySummary(section);

    switch (section.id) {
      case "activeJobSection": return getActiveRoleSummary(section);
      case "civiWorkdaySection": return getWorkdaySummary(section);
      case "civiInboxSection": return getInboxSummary(section);
      case "civiHomeStatus": return getHomeSummary(section);
      default: return getGenericSummary(section);
    }
  }

  function setOpen(section, isOpen) {
    section.classList.toggle("is-collapsed", !isOpen);
    section.classList.toggle("is-open", isOpen);
    const btn = section.querySelector(":scope > .civi-section-toggle");
    if (btn) btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function refreshSummary(section) {
    const summary = section.querySelector(":scope > .civi-section-toggle .civi-section-mini");
    if (!summary) return;
    summary.textContent = getSummary(section);
  }

  function enhanceSection(section) {
    if (!section || section.dataset.civiSectionReady === "1") return;

    const h2 = section.querySelector(":scope > h2");
    if (!h2) return;

    section.dataset.civiSectionReady = "1";
    section.classList.add("civi-section-collapsible");

    const titleText = getSectionTitle(section, h2);
    h2.textContent = titleText;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "civi-section-toggle";
    toggle.setAttribute("aria-expanded", "false");

    const title = document.createElement("div");
    title.className = "civi-section-title";
    title.appendChild(h2);

    const mini = document.createElement("div");
    mini.className = "civi-section-mini";
    mini.textContent = "Minioversikt";

    const marker = document.createElement("span");
    marker.className = "civi-section-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = "+";

    toggle.appendChild(title);
    toggle.appendChild(mini);
    toggle.appendChild(marker);

    const body = document.createElement("div");
    body.className = "civi-section-body";

    section.insertBefore(toggle, section.firstChild);

    while (toggle.nextSibling) {
      body.appendChild(toggle.nextSibling);
    }

    section.appendChild(body);

    toggle.addEventListener("click", function () {
      const nextOpen = !section.classList.contains("is-open");
      setOpen(section, nextOpen);
      writeOpenState(section, nextOpen);
      refreshSummary(section);
    });

    const observer = new MutationObserver(function () {
      refreshSummary(section);
    });
    observer.observe(body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    setOpen(section, readOpenState(section));
    refreshSummary(section);
  }

  function enhanceAll() {
    document.querySelectorAll(".civi-panels > section").forEach(function (section) {
      if (section.id === "civiDashboardSection") return;
      enhanceSection(section);
    });

    refreshAll();
  }

  function refreshAll() {
    document.querySelectorAll(".civi-section-collapsible").forEach(refreshSummary);
  }

  function scheduleRefresh() {
    window.setTimeout(refreshAll, 0);
    window.setTimeout(refreshAll, 140);
    window.setTimeout(refreshAll, 500);
  }

  window.CivicationSectionsUI = {
    enhanceAll,
    refreshAll
  };

  document.addEventListener("DOMContentLoaded", function () {
    enhanceAll();
    scheduleRefresh();
  });

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
