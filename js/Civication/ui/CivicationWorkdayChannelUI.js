// js/Civication/ui/CivicationWorkdayChannelUI.js
// Phase-1 channel cleanup: Arbeidsdag-panelet skal bare vise workday-events.
// Det endrer ikke storage, answer-flow, mailruntime eller eventmotoren.

(function () {
  "use strict";

  function getInbox() {
    const inbox = window.CivicationState?.getInbox?.();
    return Array.isArray(inbox) ? inbox : [];
  }

  function getWorkdayItems() {
    const inbox = getInbox();
    const splitter = window.CivicationEventChannels?.splitInbox;
    if (typeof splitter !== "function") return [];
    const split = splitter(inbox);
    return Array.isArray(split?.workday) ? split.workday : [];
  }

  function getActiveWorkdayEvent() {
    const workday = getWorkdayItems();
    const pending = workday.find(function (item) {
      return item && item.status === "pending";
    }) || null;

    const item = pending || workday[0] || null;
    return item?.event || item || null;
  }

  function getTaskForEvent(ev) {
    if (ev?.task_id && window.CivicationTaskEngine?.getTaskById) {
      return window.CivicationTaskEngine.getTaskById(ev.task_id);
    }
    if (ev?.id && window.CivicationTaskEngine?.getTaskByMailId) {
      return window.CivicationTaskEngine.getTaskByMailId(ev.id);
    }
    return null;
  }

  function getTaskWindowLabel(task, ev) {
    if (ev?.calendar_label) return ev.calendar_label;

    const tw = task?.time_window;
    if (!tw) return "—";

    return `${tw.startsAtLabel}–${tw.deadlineAtLabel}`;
  }

  function renderWorkdayPanelChannelOnly() {
    const host = document.getElementById("civiWorkdayPanel");
    if (!host) return;

    const active = window.CivicationState?.getActivePosition?.();
    const state = window.CivicationState?.getState?.() || {};
    const career = state?.career || {};
    const progress = career?.progress || {};
    const contract = career?.contract || {};
    const ev = getActiveWorkdayEvent();

    const clock = window.CivicationCalendar?.getDisplayModel?.() || null;
    const task = getTaskForEvent(ev);

    if (!active) {
      host.innerHTML = `
        <div class="civi-workday-empty">
          <div>Ingen aktiv jobb akkurat nå.</div>
          <div class="muted">Ta imot et jobbtilbud for å starte arbeidsdagen.</div>
        </div>
      `;
      return;
    }

    const brandName =
      String(active?.brand_name || "").trim() ||
      String(ev?.brand_name || "").trim() ||
      "Ikke satt";

    const currentTime = clock?.currentLabel || "—";
    const shiftLabel = clock ? `${clock.shiftStartLabel}–${clock.shiftEndLabel}` : "—";

    const taskTitle = task?.title || ev?.subject || "Ingen aktive arbeidssituasjoner akkurat nå";
    const taskDesc = task?.description ||
      (Array.isArray(ev?.situation) ? ev.situation[0] : "") ||
      "Arbeidsdagen har ingen pending workday-hendelse. Meldinger og milestones vises i sine egne kanaler.";

    const windowLabel = getTaskWindowLabel(task, ev);

    const answered = Number(progress?.answeredCount || 0);
    const expected = Number(progress?.expectedCount || 0);
    const pct = Math.max(0, Math.min(100, Math.round(Number(progress?.completionRate || 0) * 100)));

    const stability = String(state?.stability || "STABLE").toUpperCase();
    const statusLabel =
      stability === "WARNING"
        ? "Advarsel"
        : stability === "FIRED"
          ? "Sparket"
          : "Stabil";

    const daysSinceStart = Number(progress?.daysSinceStart || 0);
    const daysLeft = Math.max(0, Number(contract?.fireAfterDays || 14) - Math.floor(daysSinceStart));
    const openButton = ev?.id
      ? `<button class="civi-task-open-btn" data-open-task="${ev.id}">Hva gjør du?</button>`
      : ``;

    host.innerHTML = `
      <div class="civi-workday">
        <div class="civi-workday-top">
          <div class="civi-workday-clock">
            <div class="civi-workday-label">Klokke</div>
            <div class="civi-workday-time">${currentTime}</div>
            <div class="civi-workday-sub">Skift: ${shiftLabel}</div>
          </div>

          <div class="civi-workday-meta">
            <div class="civi-workday-row">
              <span class="muted">Rolle</span>
              <strong>${active?.title || "—"}</strong>
            </div>
            <div class="civi-workday-row">
              <span class="muted">Brand / sted</span>
              <strong>${brandName}</strong>
            </div>
            <div class="civi-workday-row">
              <span class="muted">Status</span>
              <strong>${statusLabel}</strong>
            </div>
          </div>
        </div>

        <div class="civi-workday-grid">
          <div class="civi-workday-card">
            <div class="civi-workday-label">Situasjon</div>
            <div class="civi-workday-task-title">${taskTitle}</div>
            <div class="civi-workday-task-desc">${taskDesc}</div>
            ${openButton}
          </div>

          <div class="civi-workday-card">
            <div class="civi-workday-label">Tidsvindu</div>
            <div class="civi-workday-big">${windowLabel}</div>
            <div class="civi-workday-sub">Neste deadline i denne arbeidsøkten</div>
          </div>

          <div class="civi-workday-card">
            <div class="civi-workday-label">Ukeprogresjon</div>
            <div class="civi-workday-big">${answered} / ${expected}</div>
            <div class="civi-workday-sub">${pct}% fullført</div>
          </div>

          <div class="civi-workday-card">
            <div class="civi-workday-label">Kontraktspress</div>
            <div class="civi-workday-big">${daysLeft} dager</div>
            <div class="civi-workday-sub">igjen før ny vurdering</div>
          </div>
        </div>
      </div>
    `;

    host.querySelectorAll("[data-open-task]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const mailId = btn.getAttribute("data-open-task");
        if (!mailId) return;
        window.openTaskModalByMailId?.(mailId);
      });
    });
  }

  function install() {
    window.renderWorkdayPanel = renderWorkdayPanelChannelOnly;
    try { renderWorkdayPanel = renderWorkdayPanelChannelOnly; } catch {}
  }

  window.CivicationWorkdayChannelUI = {
    install,
    render: renderWorkdayPanelChannelOnly,
    inspect() {
      const workday = getWorkdayItems();
      const ev = getActiveWorkdayEvent();
      return {
        workday_count: workday.length,
        active_event_id: ev?.id || null,
        active_event_subject: ev?.subject || null,
        buckets: window.CivicationEventChannels?.inspect?.(getInbox())?.counts || null
      };
    }
  };

  install();
})();
