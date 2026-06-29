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

  function getNextPhaseLabel(nextPhase) {
    if (!nextPhase) return "Ingen";
    const fromCalendar = window.CivicationCalendar?.getPhaseLabel?.(nextPhase);
    return String(fromCalendar || nextPhase);
  }

  function getOutcomeViewModel() {
    const runtime = window.CivicationCareerOutcomeRuntime;
    if (!runtime?.getOutcomeViewModel) return null;
    const state = window.CivicationState?.getState?.() || {};
    return runtime.getOutcomeViewModel(state);
  }

  function getLearningViewModel() {
    const runtime = window.CivicationJobLearningRuntime;
    if (!runtime?.getJobLearningViewModel) return null;
    const state = window.CivicationState?.getState?.() || {};
    const active = window.CivicationState?.getActivePosition?.() || null;
    return runtime.getJobLearningViewModel(state, active);
  }

  function formatUnlockedLearningList(items) {
    const seen = new Set();
    const uniqueItems = (Array.isArray(items) ? items : [])
      .map(function (item) { return String(item || "").trim(); })
      .filter(function (item) {
        if (!item) return false;
        const key = item.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    if (!uniqueItems.length) return "";

    const visible = uniqueItems.slice(0, 3);
    const remaining = uniqueItems.length - visible.length;
    return visible.join(", ") + (remaining > 0 ? " +" + remaining + " til" : "");
  }

  function buildUnlockedLearningLine(viewModel) {
    const skills = formatUnlockedLearningList(viewModel?.unlockedSkills);
    if (skills) return "Du tok med deg: " + skills;

    const teaches = formatUnlockedLearningList(viewModel?.unlockedTeaches);
    if (teaches) return "Du lærte: " + teaches;

    return "";
  }

  function buildCareerReadinessLine(viewModel) {
    const readiness = viewModel?.careerReadiness || null;
    const level = String(readiness?.level || "");
    if (level !== "ready_for_next_step" && level !== "strong") return "";
    const label = String(readiness?.label || "").trim();
    if (!label) return "";
    return "Karrieregrunnlag: " + label.charAt(0).toLowerCase() + label.slice(1);
  }

  // Job learning is shown separately from career outcome (Forfremmelse / Stagnasjon /
  // Arbeidsforhold avsluttet). Staying in a job that still teaches is framed as
  // potentially positive, not as stagnation.
  function buildLearningBanner(viewModel) {
    if (!viewModel || !viewModel.hasLearningState || !viewModel.learningLabel) return "";

    const unlockedLine = buildUnlockedLearningLine(viewModel);
    const readinessLine = buildCareerReadinessLine(viewModel);

    return ""
      + "<section class=\"civi-learning-banner\" aria-label=\"Læringsstatus\">"
      + "<div class=\"civi-learning-kicker\">Læring</div>"
      + "<p class=\"civi-learning-status\" data-learning-status=\"" + escapeHtml(viewModel.learningStatus) + "\">"
      + "<span class=\"civi-learning-label\">Læring: " + escapeHtml(viewModel.learningLabel) + "</span>"
      + "<span class=\"civi-learning-detail\">" + escapeHtml(viewModel.learningDetail) + "</span>"
      + (unlockedLine ? "<span class=\"civi-learning-detail civi-learning-unlocked\">" + escapeHtml(unlockedLine) + "</span>" : "")
      + (readinessLine ? "<span class=\"civi-learning-detail civi-learning-readiness\">" + escapeHtml(readinessLine) + "</span>" : "")
      + "</p>"
      + "</section>";
  }

  // Safe category labels. Known Civication categories get a curated label; unknown
  // keys are humanized gently so the system tolerates more categories later.
  const CATEGORY_LABELS = {
    naeringsliv: "Næringsliv",
    media: "Media",
    vitenskap: "Vitenskap",
    by: "By"
  };

  function humanizeCategoryKey(key) {
    return String(key || "")
      .trim()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^./, function (letter) { return letter.toUpperCase(); });
  }

  function getCategoryLabel(key) {
    const normalized = String(key || "").trim().toLowerCase();
    if (!normalized) return "";
    return CATEGORY_LABELS[normalized] || humanizeCategoryKey(key);
  }

  function buildReentryLockDetail(label, firedRoleTitle) {
    if (firedRoleTitle) {
      return "Du fikk sparken som " + firedRoleTitle + ". " + label
        + " åpnes igjen når du har jobbet én runde i en annen kategori.";
    }
    return "Du kan ikke gå rett tilbake til " + label.toLowerCase()
      + " etter at du fikk sparken der. Ta en jobb i en annen kategori og fullfør "
      + "én arbeidsrunde for å åpne kategorien igjen.";
  }

  // Reads active reentry locks directly from runtime/state. A locked-category offer can
  // be refused in CivicationJobs.pushOffer before it is ever stored, so the UI cannot rely
  // on a blocked offer existing — it must read career_reentry_locks itself. Only entries
  // with status === "locked" are shown; cleared entries never produce a banner.
  function getReentryLockViewModel() {
    const runtime = window.CivicationJobEligibilityRuntime;
    if (!runtime || typeof runtime.getReentryLocks !== "function") {
      return { hasLocks: false, items: [] };
    }

    const state = window.CivicationState?.getState?.() || {};
    let locks = null;
    try { locks = runtime.getReentryLocks(state); } catch (_e) { locks = null; }
    if (!locks || typeof locks !== "object") return { hasLocks: false, items: [] };

    const items = [];
    for (const [key, lock] of Object.entries(locks)) {
      if (!lock || typeof lock !== "object") continue;
      if (String(lock.status || "").trim().toLowerCase() !== "locked") continue;

      const category = String(lock.fired_category || key || "").trim().toLowerCase();
      if (!category) continue;
      const label = getCategoryLabel(category);
      if (!label) continue;

      const firedRoleTitle = String(lock.fired_role_title || "").trim();
      items.push({
        category,
        label,
        reason: String(lock.reason || "").trim() || "fired",
        firedRoleTitle: firedRoleTitle || null,
        detail: buildReentryLockDetail(label, firedRoleTitle)
      });
    }

    return { hasLocks: items.length > 0, items };
  }

  function buildReentryLockBanner(viewModel) {
    if (!viewModel || !viewModel.hasLocks || !Array.isArray(viewModel.items) || !viewModel.items.length) {
      return "";
    }

    const itemsHtml = viewModel.items
      .map(function (item) {
        return ""
          + "<li class=\"civi-reentry-lock-item\" data-reentry-lock-category=\"" + escapeHtml(item.category) + "\">"
          + "<span class=\"civi-reentry-lock-label\">" + escapeHtml(item.label) + "</span>"
          + "<span class=\"civi-reentry-lock-detail\">" + escapeHtml(item.detail) + "</span>"
          + "</li>";
      })
      .join("");

    return ""
      + "<section class=\"civi-reentry-lock-banner\" aria-label=\"Midlertidig låst kategori\">"
      + "<div class=\"civi-reentry-lock-kicker\">Midlertidig låst kategori</div>"
      + "<ul class=\"civi-reentry-lock-list\">" + itemsHtml + "</ul>"
      + "</section>";
  }

  function getAutonomyNote() {
    const psyche = window.CivicationPsyche;
    if (!psyche?.getAutonomy) return "";
    /** @type {{ career_id?: string | number | null } | null} */
    const active = window.CivicationState?.getActivePosition?.();
    const value = Number(psyche.getAutonomy(active?.career_id ?? null));
    if (!Number.isFinite(value)) return "";
    return " Autonomi nå: " + Math.round(value) + ".";
  }

  function buildOutcomeBanner(viewModel) {
    if (!viewModel || !viewModel.hasAnything || !Array.isArray(viewModel.indicators) || !viewModel.indicators.length) {
      return "";
    }

    const itemsHtml = viewModel.indicators
      .map(function (indicator) {
        const extra = indicator.kind === "stagnated" ? getAutonomyNote() : "";
        return ""
          + "<li class=\"civi-outcome-indicator\" data-outcome-kind=\"" + escapeHtml(indicator.kind) + "\">"
          + "<span class=\"civi-outcome-indicator-label\">" + escapeHtml(indicator.label) + "</span>"
          + "<span class=\"civi-outcome-indicator-text\">" + escapeHtml(indicator.text + extra) + "</span>"
          + "</li>";
      })
      .join("");

    return ""
      + "<section class=\"civi-outcome-banner\" aria-label=\"Karrierestatus\">"
      + "<div class=\"civi-outcome-kicker\">Karrierestatus</div>"
      + "<ul class=\"civi-outcome-list\">" + itemsHtml + "</ul>"
      + "</section>";
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

  // The day phase panel is a read-only status card. Answering happens only on the
  // NextAction surface (the inbox top action), so this routes to the exact same entry
  // the top action card uses instead of rendering any answer choices here.
  function goToNextAction() {
    const section = document.getElementById("civiInboxSection");
    if (section && typeof window.CivicationMiniSectionsUI?.openPopup === "function") {
      window.CivicationMiniSectionsUI.openPopup(section, { label: "Innkommende", accent: "📨" });
      return true;
    }
    const topButton = document.querySelector("#civiTopActionCard [data-civi-top-action]");
    if (topButton && typeof topButton.click === "function") {
      topButton.click();
      return true;
    }
    return false;
  }

  function bindPanelDelegation(panel) {
    if (!panel || typeof panel.addEventListener !== "function" || panel.__civiDayPhaseDelegated) return;
    panel.__civiDayPhaseDelegated = true;
    panel.addEventListener("click", function (event) {
      const button = event.target?.closest?.("button");
      if (!button || !panel.contains(button) || button.disabled) return;
      if (button.matches("[data-civi-day-phase-next-action]")) {
        event.preventDefault();
        goToNextAction();
      }
    });
  }

  function getNextItemTitle(inspection) {
    const nextItem = inspection?.pendingItem || inspection?.nextQueuedItem || null;
    return String(nextItem?.subject || "").trim();
  }

  function getOpenItemsText(openCount) {
    if (openCount <= 0) return "Ingen åpne saker i denne fasen.";
    return openCount + (openCount === 1 ? " åpen sak i denne fasen." : " åpne saker i denne fasen.");
  }

  function render() {
    const progression = window.CivicationDayProgression;
    if (!progression?.inspect) return false;

    const inspection = progression.inspect() || {};
    const panel = ensurePanel();
    if (!panel) return false;

    const nextPhaseLabel = getNextPhaseLabel(inspection.nextPhase || null);
    const openCount = Number(inspection.openItemsInPhase || 0);
    const nextItemTitle = getNextItemTitle(inspection);
    const outcomeBanner = buildOutcomeBanner(getOutcomeViewModel());
    const reentryLockBanner = buildReentryLockBanner(getReentryLockViewModel());
    const learningBanner = buildLearningBanner(getLearningViewModel());

    panel.innerHTML = ""
      + "<div class=\"civi-day-phase-head\">"
      + "<div class=\"civi-day-phase-kicker\">Dagens fase</div>"
      + "<h3 class=\"civi-day-phase-title\">" + escapeHtml(inspection.phaseLabel || inspection.phase || "Ukjent") + "</h3>"
      + "</div>"
      + outcomeBanner
      + reentryLockBanner
      + learningBanner
      + "<div class=\"civi-day-phase-meta\">Dag " + escapeHtml(inspection.dayIndex || 1) + " · Neste fase: " + escapeHtml(nextPhaseLabel) + "</div>"
      + "<p class=\"civi-day-phase-status\">" + escapeHtml(getOpenItemsText(openCount)) + "</p>"
      + (nextItemTitle ? "<p class=\"civi-day-phase-status muted\">Neste sak: " + escapeHtml(nextItemTitle) + "</p>" : "")
      + "<div class=\"civi-day-phase-actions\">"
      + "<button class=\"civi-btn\" type=\"button\" data-civi-day-phase-next-action>Gå til neste handling</button>"
      + "</div>";

    bindPanelDelegation(panel);
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
