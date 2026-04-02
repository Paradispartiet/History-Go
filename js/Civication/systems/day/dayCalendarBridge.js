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

    function getPhaseMinutes(phase, clock) {
  const shiftStart = Number(clock?.shiftStartMinutes || 8 * 60);

  const anchors = {
    morning: shiftStart,        // 08:00
    lunch: shiftStart + 4 * 60, // 12:00
    afternoon: shiftStart + 6 * 60, // 14:00
    evening: shiftStart + 9 * 60,   // 17:00
    day_end: shiftStart + 11 * 60   // 19:00
  };

  return Number(anchors[String(phase)] || shiftStart);
}

function setPhase(phase) {
  const current = getSafeClock();
  const next = DAY_PHASES.includes(String(phase))
    ? String(phase)
    : "morning";

  return cal.setClock({
    phase: next,
    phaseStatus: "open",
    currentMinutes: getPhaseMinutes(next, current),
    lastAdvancedAt: Date.now()
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

  return setPhase(DAY_PHASES[idx + 1]);
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
  const existingSummary =
    current.dailySummary && typeof current.dailySummary === "object"
      ? current.dailySummary
      : {};

  const carryover =
    existingSummary.nextDayCarryover && typeof existingSummary.nextDayCarryover === "object"
      ? existingSummary.nextDayCarryover
      : {
          visibilityBias: 0,
          processBias: 0,
          fatigue: 0
        };

  return cal.setClock({
    dayIndex: Number(current.dayIndex || 1) + 1,
    currentMinutes: Number(current.shiftStartMinutes || 8 * 60),
    phase: "morning",
    phaseStatus: "open",
    dailyFlags: {},
    dailySummary: {
      choiceLog: [],
      nextDayCarryover: carryover
    },
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

  function initDayCalendarBridge() {
    patchCalendar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDayCalendarBridge);
  } else {
    initDayCalendarBridge();
  }
})();
