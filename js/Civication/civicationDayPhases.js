(function () {
  function patchCalendar() {
    const cal = window.CivicationCalendar;
    if (!cal || cal.__dayPhasePatched) return;
    cal.__dayPhasePatched = true;

    const DAY_PHASES = ["morning", "lunch", "afternoon", "evening", "day_end"];

    function getSafeClock() {
      const clock = cal.getClock ? cal.getClock() : {};
      return {
        ...(clock || {}),
        phase: String(clock?.phase || "morning"),
        phaseStatus: String(clock?.phaseStatus || "open"),
        dailyFlags:
          clock?.dailyFlags && typeof clock.dailyFlags === "object"
            ? clock.dailyFlags
            : {},
        dailySummary: clock?.dailySummary || null
      };
    }

    function setPhase(phase) {
      const next = DAY_PHASES.includes(String(phase))
        ? String(phase)
        : "morning";

      return cal.setClock({
        phase: next,
        phaseStatus: "open"
      });
    }

    function getPhase() {
      return getSafeClock().phase;
    }

    function getPhaseLabel(phase) {
      switch (String(phase || "")) {
        case "morning":
          return "Morgen";
        case "lunch":
          return "Lunsj";
        case "afternoon":
          return "Ettermiddag";
        case "evening":
          return "Kveld";
        case "day_end":
          return "Dagslutt";
        default:
          return "Morgen";
      }
    }

    function advancePhase() {
      const phase = getPhase();
      const idx = DAY_PHASES.indexOf(phase);

      if (idx === -1) return setPhase("morning");
      if (idx >= DAY_PHASES.length - 1) return resetForNewDay();

      return cal.setClock({
        phase: DAY_PHASES[idx + 1],
        phaseStatus: "open"
      });
    }

    function markDailyFlag(key, value = true) {
      const current = getSafeClock();
      const flags = { ...(current.dailyFlags || {}) };
      flags[String(key)] = value;
      return cal.setClock({ dailyFlags: flags });
    }

    function hasDailyFlag(key) {
      const flags = getSafeClock().dailyFlags || {};
      return !!flags[String(key)];
    }

    function setDailySummary(summary) {
      return cal.setClock({ dailySummary: summary || null });
    }

    function getDailySummary() {
      return getSafeClock().dailySummary || null;
    }

    function resetForNewDay() {
      const current = getSafeClock();

      return cal.setClock({
        dayIndex: Number(current.dayIndex || 1) + 1,
        currentMinutes: Number(current.shiftStartMinutes || 8 * 60),
        phase: "morning",
        phaseStatus: "open",
        dailyFlags: {},
        dailySummary: null,
        lastAdvancedAt: Date.now()
      });
    }

    function getPhaseModel() {
      const current = getSafeClock();

      return {
        dayIndex: Number(current.dayIndex || 1),
        phase: current.phase,
        phaseLabel: getPhaseLabel(current.phase),
        phaseStatus: current.phaseStatus,
        dailyFlags: current.dailyFlags || {},
        dailySummary: current.dailySummary || null,
        phases: DAY_PHASES.slice()
      };
    }

    const originalStartShiftForJob =
      typeof cal.startShiftForJob === "function"
        ? cal.startShiftForJob.bind(cal)
        : null;

    cal.DAY_PHASES = DAY_PHASES;
    cal.getPhase = getPhase;
    cal.setPhase = setPhase;
    cal.advancePhase = advancePhase;
    cal.markDailyFlag = markDailyFlag;
    cal.hasDailyFlag = hasDailyFlag;
    cal.setDailySummary = setDailySummary;
    cal.getDailySummary = getDailySummary;
    cal.resetForNewDay = resetForNewDay;
    cal.getPhaseModel = getPhaseModel;

    cal.startShiftForJob = function (active) {
      const res = originalStartShiftForJob
        ? originalStartShiftForJob(active)
        : getSafeClock();

      cal.setClock({
        phase: "morning",
        phaseStatus: "open",
        dailyFlags: {},
        dailySummary: null
      });

      return res;
    };
  }

  function makeLunchEvent(active) {
    const brandName =
      String(active?.brand_name || "").trim() || "stedet ditt";

    return {
      id: `phase_lunch_${Date.now()}`,
      stage: "stable",
      source: "Civication",
      phase_tag: "lunch",
      subject: "Lunsjpause",
      situation: [
        `Du er ute av morgenpresset og må velge hvordan du bruker lunsjen rundt ${brandName}.`,
        "Valget påvirker resten av dagen."
      ],
      choices: [
        {
          id: "A",
          label: "Spis billig og effektivt",
          effect: 0,
          tags: ["process", "craft"],
          feedback: "Du holder rytmen uten å gjøre noe ekstra ut av lunsjen."
        },
        {
          id: "B",
          label: "Ta en sosial lunsj",
          effect: 1,
          tags: ["visibility", "legitimacy"],
          feedback: "Du blir sett, og dagen åpner seg litt mer sosialt."
        },
        {
          id: "C",
          label: "Hopp over lunsjen og jobb videre",
          effect: -1,
          tags: ["avoidance", "laziness"],
          feedback: "Du sparer tid, men betaler litt for det senere."
        }
      ]
    };
  }

  function makeEveningEvent() {
    return {
      id: `phase_evening_${Date.now()}`,
      stage: "stable",
      source: "Civication",
      phase_tag: "evening",
      subject: "Kveld i Civication",
      situation: [
        "Arbeidsdelen av dagen er over. Nå velger du hva slags kveld dette skal være.",
        "Kvelden handler mer om retning enn plikt."
      ],
      choices: [
        {
          id: "A",
          label: "Ta frivillig overtid",
          effect: 1,
          tags: ["craft", "visibility"],
          feedback: "Du presser dagen litt lenger og får mer ut av den."
        },
        {
          id: "B",
          label: "Trekk hjem og hold kvelden rolig",
          effect: 0,
          tags: ["process", "legitimacy"],
          feedback: "Du holder strukturen og lar dagen lande."
        },
        {
          id: "C",
          label: "Oppsøk folk og miljø",
          effect: 1,
          tags: ["visibility", "shortcut"],
          feedback: "Kvelden blir mer sosial og mer åpen."
        }
      ]
    };
  }

  function makeDayEndEvent() {
    const cal = window.CivicationCalendar;
    const model = cal?.getPhaseModel?.() || {};
    const flags = model.dailyFlags || {};

    const doneCount = [
      "morning_done",
      "lunch_done",
      "afternoon_done",
      "evening_done"
    ].filter((k) => !!flags[k]).length;

    const summary = {
      dayIndex: Number(model.dayIndex || 1),
      completedPhases: doneCount
    };

    cal?.setDailySummary?.(summary);

    return {
      id: `phase_day_end_${Date.now()}`,
      stage: "stable",
      source: "Civication",
      phase_tag: "day_end",
      subject: `Dag ${summary.dayIndex} er over`,
      situation: [
        `Du fullførte ${summary.completedPhases} av 4 hovedfaser i dag.`,
        "Bekreft for å runde dagen og gå videre til neste."
      ],
      choices: [],
      feedback: "Dagen lukkes. En ny dag starter."
    };
  }

  function retagPendingEvent(engine, phaseTag) {
    const inbox = engine.getInbox ? engine.getInbox() : [];
    const idx = Array.isArray(inbox)
      ? inbox.findIndex((x) => x && x.status === "pending" && x.event)
      : -1;

    if (idx < 0) return null;

    inbox[idx] = {
      ...inbox[idx],
      event: {
        ...(inbox[idx].event || {}),
        phase_tag: phaseTag
      }
    };

    if (engine.setInbox) engine.setInbox(inbox);
    return inbox[idx];
  }

  function patchEventEngine() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__dayPhasePatched) return;
    proto.__dayPhasePatched = true;

    const legacyOnAppOpen = proto.onAppOpen;
    const legacyAnswer = proto.answer;

    proto.onAppOpen = async function (opts = {}) {
      const active = window.CivicationState?.getActivePosition?.();

      if (!active) {
        return legacyOnAppOpen
          ? legacyOnAppOpen.call(this, opts)
          : { enqueued: false, reason: "no_active_job" };
      }

      const pending = this.getPendingEvent ? this.getPendingEvent() : null;
      if (pending?.event) {
        return { enqueued: false, reason: "pending_exists" };
      }

      const phase = window.CivicationCalendar?.getPhase?.() || "morning";
      const state = this.getState ? this.getState() : {};

      if (phase === "morning") {
        if (legacyOnAppOpen) {
          const res = await legacyOnAppOpen.call(this, { ...opts, force: true });
          const tagged = retagPendingEvent(this, "morning");
          if (tagged?.event) return { ...(res || {}), event: tagged.event };
        }
        return { enqueued: false, reason: "morning_no_event" };
      }

      if (phase === "lunch") {
        const ev = makeLunchEvent(active);
        this.enqueueEvent(ev);
        return { enqueued: true, type: "lunch", event: ev };
      }

      if (phase === "afternoon") {
        const base = this.makeGenericCareerEvent
          ? this.makeGenericCareerEvent(active, state, "day_phase_afternoon")
          : {
              id: `phase_afternoon_${Date.now()}`,
              stage: "stable",
              source: "Civication",
              subject: "Ettermiddagsleveranse",
              situation: ["Ettermiddagen krever en konkret leveranse."],
              choices: []
            };

        const ev = this.decorateWorkMail
          ? this.decorateWorkMail(
              {
                ...base,
                phase_tag: "afternoon",
                subject: "Ettermiddagsleveranse",
                situation: [
                  "Ettermiddagen handler om å få noe faktisk levert.",
                  "Hvordan du løser dette former inntrykket av deg."
                ],
                task_kind: "work_case"
              },
              active,
              "day_phase_afternoon"
            )
          : { ...base, phase_tag: "afternoon" };

        this.enqueueEvent(ev);
        return { enqueued: true, type: "job", event: ev };
      }

      if (phase === "evening") {
        const ev = makeEveningEvent();
        this.enqueueEvent(ev);
        return { enqueued: true, type: "evening", event: ev };
      }

      if (phase === "day_end") {
        const ev = makeDayEndEvent();
        this.enqueueEvent(ev);
        return { enqueued: true, type: "day_end", event: ev };
      }

      return { enqueued: false, reason: "unknown_phase" };
    };

    proto.answer = function (eventId, choiceId) {
      const pending = this.getPendingEvent ? this.getPendingEvent() : null;
      const phaseTag = pending?.event?.phase_tag || null;

      let originalFollowup = null;
      if (phaseTag && typeof this.enqueueImmediateFollowupEvent === "function") {
        originalFollowup = this.enqueueImmediateFollowupEvent;
        this.enqueueImmediateFollowupEvent = function () {
          return Promise.resolve({
            enqueued: false,
            reason: "day_phase_blocked"
          });
        };
      }

      const result = legacyAnswer
        ? legacyAnswer.call(this, eventId, choiceId)
        : { ok: false };

      if (originalFollowup) {
        this.enqueueImmediateFollowupEvent = originalFollowup;
      }

      if (!result?.ok || !phaseTag) return result;

      const cal = window.CivicationCalendar;
      if (!cal) return result;

      if (phaseTag === "morning") {
        cal.markDailyFlag?.("morning_done", true);
        cal.setPhase?.("lunch");
      } else if (phaseTag === "lunch") {
        cal.markDailyFlag?.("lunch_done", true);
        cal.setPhase?.("afternoon");
      } else if (phaseTag === "afternoon") {
        cal.markDailyFlag?.("afternoon_done", true);
        cal.setPhase?.("evening");
      } else if (phaseTag === "evening") {
        cal.markDailyFlag?.("evening_done", true);
        cal.setPhase?.("day_end");
      } else if (phaseTag === "day_end") {
        cal.resetForNewDay?.();
      }

      setTimeout(() => {
        try {
          window.HG_CiviEngine?.onAppOpen?.({ force: true });
          window.dispatchEvent(new Event("updateProfile"));
        } catch {}
      }, 0);

      return result;
    };
  }

  function patchTaskEngine() {
    const engine = window.CivicationTaskEngine;
    if (!engine || engine.__dayPhasePatched) return;
    engine.__dayPhasePatched = true;

    const originalCreateTaskForMail = engine.createTaskForMail;

    if (typeof originalCreateTaskForMail === "function") {
      engine.createTaskForMail = function (mailEvent, active, options) {
        const task = originalCreateTaskForMail.call(engine, mailEvent, active, options);
        if (!task) return task;

        const phaseModel = window.CivicationCalendar?.getPhaseModel?.() || {};
        const updated = {
          ...task,
          dayIndex: Number(phaseModel.dayIndex || 1),
          phase: String(mailEvent?.phase_tag || phaseModel.phase || "morning"),
          phase_required: true
        };

        const store = engine.getStore ? engine.getStore() : null;
        if (store?.byId?.[updated.id]) {
          store.byId[updated.id] = updated;
          engine.setStore?.(store);
        }

        return updated;
      };
    }

    engine.listOpenTasksForCurrentPhase = function () {
      const store = engine.getStore ? engine.getStore() : { byId: {}, order: [] };
      const order = Array.isArray(store.order) ? store.order : [];
      const phaseModel = window.CivicationCalendar?.getPhaseModel?.() || {};

      return order
        .map((id) => store.byId?.[id] || null)
        .filter(
          (task) =>
            task &&
            task.status === "open" &&
            Number(task.dayIndex || 1) === Number(phaseModel.dayIndex || 1) &&
            String(task.phase || "") === String(phaseModel.phase || "")
        );
    };
  }

  function patchJobs() {
    const jobs = window.CivicationJobs;
    if (!jobs || jobs.__dayPhasePatched) return;
    jobs.__dayPhasePatched = true;

    const originalAcceptOffer = jobs.acceptOffer;
    if (typeof originalAcceptOffer !== "function") return;

    jobs.acceptOffer = function (offerKey) {
      const res = originalAcceptOffer.call(jobs, offerKey);

      if (res?.ok) {
        window.CivicationCalendar?.setPhase?.("morning");
        window.CivicationCalendar?.setDailySummary?.(null);
      }

      return res;
    };
  }

  function patchUI() {
    if (window.__civiDayPhaseUiPatched) return;
    if (typeof window.renderWorkdayPanel !== "function") return;
    window.__civiDayPhaseUiPatched = true;

    const legacyRenderWorkdayPanel = window.renderWorkdayPanel;

    function buildPhaseHud(model) {
      const flags = model.dailyFlags || {};
      const phaseOrder = [
        { id: "morning", label: "Morgen", doneKey: "morning_done" },
        { id: "lunch", label: "Lunsj", doneKey: "lunch_done" },
        { id: "afternoon", label: "Ettermiddag", doneKey: "afternoon_done" },
        { id: "evening", label: "Kveld", doneKey: "evening_done" },
        { id: "day_end", label: "Dagslutt", doneKey: null }
      ];

      return `
        <div class="civi-dayphase-hud" style="margin-bottom:12px;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.04);">
          <div style="font-weight:700;margin-bottom:8px;">Dag ${model.dayIndex} · ${model.phaseLabel}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${phaseOrder
              .map((item) => {
                const isActive = item.id === model.phase;
                const isDone = item.doneKey ? !!flags[item.doneKey] : false;
                const badge = isDone ? "✅" : isActive ? "🔵" : "⬜";
                return `<span style="padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);">${badge} ${item.label}</span>`;
              })
              .join("")}
          </div>
        </div>
      `;
    }

    window.renderWorkdayPanel = function () {
      legacyRenderWorkdayPanel();

      const host = document.getElementById("civiWorkdayPanel");
      if (!host) return;

      const model = window.CivicationCalendar?.getPhaseModel?.();
      if (!model) return;

      const existing = host.querySelector(".civi-dayphase-hud");
      if (existing) existing.remove();

      host.insertAdjacentHTML("afterbegin", buildPhaseHud(model));
    };

    if (window.CivicationUI) {
      window.CivicationUI.renderWorkdayPanel = window.renderWorkdayPanel;
    }
  }

  function initPatches() {
    patchCalendar();
    patchEventEngine();
    patchTaskEngine();
    patchJobs();
    patchUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPatches);
  } else {
    initPatches();
  }
})();
