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
    if (inspection?.reason === "queued_items_in_phase") return "Det finnes flere hendelser i denne fasen. Åpne bolken eller gjenstående hendelser før du går videre.";
    if (inspection?.reason === "delivered_items_in_phase") return "Åpne og svar på leverte hendelser i denne fasen før du går videre.";
    if (inspection?.reason === "open_items_in_phase") return "Svar på åpne meldinger i denne fasen for å gå videre.";
    if (inspection?.reason === "at_last_phase") return "Dagen er fullført.";
    return formatReason(inspection?.reason);
  }

  function getLoopHint(inspection) {
    if (inspection?.reason === "queued_items_in_phase") {
      return "Åpne hele bolken for å se flere hendelser samlet, eller åpne neste hendelse ved behov.";
    }
    if (inspection?.reason === "open_items_in_phase" || inspection?.reason === "delivered_items_in_phase") {
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

  function shouldShowDayCompleteSummary(inspection) {
    const hasNoNextPhase = !inspection?.nextPhase;
    const hasNoOpenItems = Number(inspection?.openItemsInPhase || 0) === 0;
    const isAtLastPhase = inspection?.reason === "at_last_phase";
    return hasNoNextPhase && hasNoOpenItems && isAtLastPhase;
  }

  function buildDayCompleteSummary(inspection) {
    return ""
      + "<section class=\"civi-day-complete\" aria-label=\"Dagen er fullført\">"
      + "<h4 class=\"civi-day-complete-title\">Dagen er fullført</h4>"
      + "<p class=\"civi-day-complete-text\">Alle åpne handlinger for denne dagen er avklart. Nye hendelser kommer neste dag.</p>"
      + "<dl class=\"civi-day-complete-grid\">"
      + "<div><dt>Dag</dt><dd>" + escapeHtml(inspection.dayIndex || 1) + "</dd></div>"
      + "<div><dt>Fase</dt><dd>" + escapeHtml(inspection.phaseLabel || inspection.phase || "Ukjent") + "</dd></div>"
      + "<div><dt>Åpne handlinger</dt><dd>0</dd></div>"
      + "<div><dt>Neste fase</dt><dd>Ingen</dd></div>"
      + "</dl>"
      + "</section>";
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

  function getItemText(item) {
    const fields = [item?.body, item?.text, item?.situation, item?.description, item?.snippet, item?.prompt, item?.summary];
    for (const field of fields) {
      if (Array.isArray(field)) {
        const text = field.map(function (part) { return String(part || "").trim(); }).filter(Boolean).join(" ");
        if (text) return text;
      } else {
        const text = String(field || "").trim();
        if (text) return text;
      }
    }
    return String(item?.subject || "").trim();
  }

  function isTaskGateItem(item) {
    const haystack = [item?.mail_type, item?.type, item?.slot, item?.kind].map(function (value) { return String(value || "").toLowerCase(); }).join(" ");
    return haystack.includes("task_gate") || haystack.includes("task gate");
  }

  function refreshAfterBundleAction() {
    render();
    window.CivicationInboxTopActionUI?.renderSections?.();
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  async function openPhaseBundle() {
    await window.CivicationDailyMailBuilder?.enqueuePhaseBundle?.(window.HG_CiviEngine || null, { ignorePending: true, limit: 5 });
    refreshAfterBundleAction();
  }

  async function openNextPhaseItem() {
    await window.CivicationDailyMailBuilder?.enqueueNext?.(window.HG_CiviEngine || null, { ignorePending: false });
    refreshAfterBundleAction();
  }

  async function answerBundleItem(eventId, choiceId) {
    if (!eventId || !choiceId) return;
    const builder = window.CivicationDailyMailBuilder;
    if (typeof builder?.answerBundleItem === "function") await builder.answerBundleItem(eventId, choiceId);
    else await builder?.markAnswered?.(eventId, choiceId);
    refreshAfterBundleAction();
  }

  async function handleBundleItem(eventId, handledAs) {
    if (!eventId) return;
    await window.CivicationDailyMailBuilder?.markHandled?.(eventId, handledAs || "handled");
    refreshAfterBundleAction();
  }

  function bindPanelDelegation(panel) {
    if (!panel || panel.__civiDayPhaseDelegated) return;
    panel.__civiDayPhaseDelegated = true;
    panel.addEventListener("click", async function (event) {
      const button = event.target?.closest?.("button");
      if (!button || !panel.contains(button) || button.disabled) return;
      if (button.matches("[data-civi-day-phase-open-bundle]")) { event.preventDefault(); await openPhaseBundle(); return; }
      if (button.matches("[data-civi-day-phase-open-next]")) { event.preventDefault(); await openNextPhaseItem(); return; }
      if (button.matches("[data-civi-bundle-choice]")) { event.preventDefault(); await answerBundleItem(button.getAttribute("data-civi-bundle-event"), button.getAttribute("data-civi-bundle-choice")); return; }
      if (button.matches("[data-civi-bundle-handled]")) { event.preventDefault(); await handleBundleItem(button.getAttribute("data-civi-bundle-handled"), "handled"); return; }
      if (button.matches("[data-civi-bundle-skip]")) { event.preventDefault(); await handleBundleItem(button.getAttribute("data-civi-bundle-skip"), "skipped"); return; }
      if (button.matches("[data-civi-bundle-task]")) {
        event.preventDefault();
        const mailId = button.getAttribute("data-civi-bundle-task");
        if (mailId) window.CivicationUI?.openTaskModalByMailId?.(mailId);
        return;
      }
      if (button.matches("[data-civi-day-phase-advance]")) {
        event.preventDefault();
        await window.CivicationDayProgression?.advancePhaseIfReady?.();
        refreshAfterBundleAction();
      }
    });
  }

  function buildBundleItemsList(inspection) {
    const items = (Number(inspection?.deliveredItemsInPhase || 0) > 0 || Number(inspection?.openItemsInPhase || 0) > 0 || Array.isArray(inspection?.phaseBundle?.items))
      ? (Array.isArray(inspection?.phaseBundle?.items) ? inspection.phaseBundle.items : []).filter((it) => !["answered", "resolved"].includes(String(it.status || "").toLowerCase()))
      : [];
    if (!items.length) return inspection.canAdvance ? '<div class="civi-day-phase-bundle-done">Bolken er ferdig</div>' : "";
    return '<div class="civi-day-phase-bundle"><div class="civi-day-phase-bundle-title">Fortsett bolken</div>'
      + items.map((it) => {
        const id = escapeHtml(it.id || "");
        const optional = it.optional === true || it.required === false;
        const choices = Array.isArray(it.choices) ? it.choices : [];
        const hasChoices = choices.length > 0 || it.hasChoices === true || Number(it.choiceCount || 0) > 0;
        const text = getItemText(it);
        const taskGate = isTaskGateItem(it);
        const meta = escapeHtml(it.mail_type || "mail") + ' · ' + escapeHtml(it.slot || "slot") + ' · ' + escapeHtml(it.status || "status") + ' · ' + (optional ? "Valgfri" : "Påkrevd");
        let actionHtml = "";
        if (taskGate) {
          actionHtml = '<p class="civi-day-phase-status">Oppgave som må gjøres før du kan gå videre</p>'
            + '<button class="civi-btn secondary" type="button" data-civi-bundle-task="' + id + '">Gjør oppgave</button>';
        } else if (hasChoices && choices.length) {
          actionHtml = '<div class="civi-day-phase-choice-list" role="group" aria-label="Svaralternativer">'
            + choices.map(function (choice) {
              return '<button class="civi-btn secondary" type="button" data-civi-bundle-event="' + id + '" data-civi-bundle-choice="' + escapeHtml(choice.id || "") + '">' + escapeHtml(choice.label || choice.id || "Velg") + '</button>';
            }).join(" ") + '</div>';
        } else if (hasChoices) {
          actionHtml = '<button class="civi-btn secondary" type="button" data-civi-bundle-event="' + id + '" data-civi-bundle-choice="A">Vis valg</button>';
        } else {
          actionHtml = '<p class="civi-day-phase-status muted">Dette er en beskjed / automatisk hendelse.</p>'
            + '<button class="civi-btn secondary" type="button" data-civi-bundle-handled="' + id + '">Ferdig med denne</button>';
        }
        const skip = optional ? ' <button class="civi-btn secondary" type="button" data-civi-bundle-skip="' + id + '">Hopp over</button>' : "";
        return '<article class="civi-day-phase-bundle-card"><strong>' + escapeHtml(it.subject || it.slot || it.id || "Hendelse") + '</strong>'
          + '<div class="civi-day-phase-status muted">' + meta + '</div>'
          + (text ? '<p class="civi-day-phase-bundle-text">' + escapeHtml(text) + '</p>' : '')
          + '<div class="civi-day-phase-bundle-actions">' + actionHtml + skip + '</div></article>';
      }).join("") + '</div>';
  }

  function bindBundleItemButtons(_panel) {
    // Bundle actions use delegated clicks on the stable panel root so re-renders and mobile taps keep working.
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
    const blockingItems = Number(inspection.queuedItemsInPhase || 0) + Number(inspection.deliveredItemsInPhase || 0) + Number(inspection.openItemsInPhase || 0);
    const canOpenNext = Number(inspection.queuedItemsInPhase || 0) > 0;
    const canOpenBundle = canOpenNext;
    const canAdvance = inspection.canAdvance === true && !!nextPhase && blockingItems === 0;
    const buttonText = nextPhase ? "Gå til neste fase" : "Dagen er ferdig";
    const dayCompleteSummary = shouldShowDayCompleteSummary(inspection) ? buildDayCompleteSummary(inspection) : "";
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
      + "<p class=\"civi-day-phase-status\">" + escapeHtml(getStatusText(inspection)) + "</p>"
      + "<p class=\"civi-day-phase-status muted\">" + escapeHtml(getLoopHint(inspection)) + "</p>"
      + dayCompleteSummary
      + (inspection.openItemsInPhase > 0 ? buildOpenItemsList(inspection.openItemSubjects) : "")
      + buildBundleItemsList(inspection)
      + "<div class=\"civi-day-phase-actions\">"
      + (canOpenBundle ? "<button class=\"civi-btn\" type=\"button\" data-civi-day-phase-open-bundle>Åpne hele bolken</button>" : "")
      + (canOpenNext ? "<button class=\"civi-btn secondary\" type=\"button\" data-civi-day-phase-open-next>Åpne neste</button>" : "")
      + (blockingItems === 0 ? ("<button class=\"civi-btn\" type=\"button\" data-civi-day-phase-advance " + (canAdvance ? "" : "disabled") + ">" + escapeHtml(buttonText) + "</button>") : "")
      + "</div>";

    bindPanelDelegation(panel);
    bindBundleItemButtons(panel);
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
