(function () {
  "use strict";

  const PANEL_ID = "civiDayPhasePanel";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatReason(reason) {
    const normalized = String(reason || "").trim();
    if (!normalized) return "Fasen er ikke klar ennå.";
    return normalized
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^./, function (letter) { return letter.toUpperCase(); });
  }

  function getStatusText(inspection) {
    if (inspection?.canAdvance === true && inspection?.nextPhase) return "Fasen er klar. Du kan gå videre til neste fase.";
    if (inspection?.reason === "open_items_in_phase") return "Svar på åpne meldinger i denne fasen for å gå videre.";
    if (inspection?.reason === "at_last_phase") return "Dagen er fullført.";
    return formatReason(inspection?.reason);
  }

  function getLoopHint(inspection) {
    if (inspection?.reason === "open_items_in_phase") {
      return "Åpne meldinger med valg er aktiv handling nå. Når de er besvart, låses neste fase opp.";
    }
    if (inspection?.canAdvance === true && inspection?.nextPhase) {
      return "Denne fasen er avklart. Gå videre når du er klar.";
    }
    if (!inspection?.nextPhase) {
      return "Ingen flere faser i dag. Nye hendelser kommer neste dag.";
    }
    return "Følg faseflyten: svar på meldinger → fullfør fase → gå videre.";
  }

  function getNextPhaseLabel(nextPhase) {
    if (!nextPhase) return "Ingen";
    const fromCalendar = window.CivicationCalendar?.getPhaseLabel?.(nextPhase);
    return String(fromCalendar || nextPhase);
  }

  function buildOpenItemsList(subjects) {
    const safeSubjects = (Array.isArray(subjects) ? subjects : []).slice(0, 3);
    if (!safeSubjects.length) return "";

    const itemsHtml = safeSubjects
      .map(function (subject) {
        return "<li>" + escapeHtml(subject) + "</li>";
      })
      .join("");

    return "<ul class=\"civi-day-phase-list\">" + itemsHtml + "</ul>";
  }

  function ensurePanel() {
    const panels = document.querySelector(".civi-panels");
    let panel = document.getElementById(PANEL_ID);
    if (!panels) return panel || null;

    if (!panel) {
      panel = document.createElement("section");
      panel.id = PANEL_ID;
      panel.className = "civi-day-phase-panel";
    }

    const controls = document.getElementById("civiLifeHomeControls");
    const anchor = controls && controls.parentElement === panels ? controls.nextElementSibling : panels.firstElementChild;
    if (panel.parentElement !== panels || panel.previousElementSibling !== controls) {
      panels.insertBefore(panel, anchor);
    }

    return panel;
  }

  function bindAdvanceButton(panel) {
    const button = panel.querySelector("[data-civi-day-phase-advance]");
    if (!button) return;

    button.onclick = async function () {
      if (button.disabled) return;
      const progression = window.CivicationDayProgression;
      if (!progression?.advancePhaseIfReady) return;

      await progression.advancePhaseIfReady();
      render();
      window.CivicationInboxTopActionUI?.renderSections?.();
      try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    };
  }

  function render() {
    const progression = window.CivicationDayProgression;
    if (!progression?.inspect) return false;

    const inspection = progression.inspect() || {};
    const panel = ensurePanel();
    if (!panel) return false;

    const nextPhase = inspection.nextPhase || null;
    const nextPhaseLabel = getNextPhaseLabel(nextPhase);
    const canAdvance = inspection.canAdvance === true && !!nextPhase;
    const buttonText = nextPhase ? "Gå til neste fase" : "Dagen er ferdig";

    panel.innerHTML = ""
      + "<div class=\"civi-day-phase-head\">"
      + "<div class=\"civi-day-phase-kicker\">Dagens fase</div>"
      + "<h3 class=\"civi-day-phase-title\">" + escapeHtml(inspection.phaseLabel || inspection.phase || "Ukjent") + "</h3>"
      + "</div>"
      + "<div class=\"civi-day-phase-meta\">Dag " + escapeHtml(inspection.dayIndex || 1) + " · Neste fase: " + escapeHtml(nextPhaseLabel) + "</div>"
      + "<p class=\"civi-day-phase-status\">" + escapeHtml(getStatusText(inspection)) + "</p>"
      + "<p class=\"civi-day-phase-status muted\">" + escapeHtml(getLoopHint(inspection)) + "</p>"
      + (inspection.openItemsInPhase > 0 ? buildOpenItemsList(inspection.openItemSubjects) : "")
      + "<div class=\"civi-day-phase-actions\">"
      + "<button class=\"civi-btn\" type=\"button\" data-civi-day-phase-advance " + (canAdvance ? "" : "disabled") + ">"
      + escapeHtml(buttonText)
      + "</button>"
      + "</div>";

    bindAdvanceButton(panel);
    return true;
  }

  function refresh() {
    return render();
  }

  function setupEvents() {
    document.addEventListener("DOMContentLoaded", refresh);
    window.addEventListener("civi:dayPhaseChanged", refresh);
    window.addEventListener("civi:inboxChanged", refresh);
    window.addEventListener("civi:booted", refresh);
    window.addEventListener("updateProfile", refresh);
  }

  setupEvents();

  window.CivicationDayPhaseUI = {
    render,
    refresh
  };
})();
