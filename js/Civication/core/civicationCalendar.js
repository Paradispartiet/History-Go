(function () {
  const LS_CLOCK = "hg_civi_calendar_v1";

  const DEFAULT_CLOCK = {
    dayIndex: 1,
    currentMinutes: 8 * 60,
    shiftStartMinutes: 8 * 60,
    shiftEndMinutes: 16 * 60,
    isLoggedIn: false,
    activeJobKey: null,
    lastAdvancedAt: null
  };

  function safeParse(raw, fallback) {
    try {
      const v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  function getClock() {
    const raw = safeParse(localStorage.getItem(LS_CLOCK), {});
    return {
      ...DEFAULT_CLOCK,
      ...(raw || {})
    };
  }

  function setClock(patch) {
    const next = {
      ...getClock(),
      ...(patch || {})
    };
    localStorage.setItem(LS_CLOCK, JSON.stringify(next));
    return next;
  }

  function pad2(n) {
    return String(Math.max(0, Number(n || 0))).padStart(2, "0");
  }

  function minutesToLabel(totalMinutes) {
    const mins = Math.max(0, Number(totalMinutes || 0));
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${pad2(h)}:${pad2(m)}`;
  }

  function normalizeDayAndMinutes(dayIndex, minutes) {
    let d = Number(dayIndex || 1);
    let m = Number(minutes || 0);

    while (m >= 24 * 60) {
      m -= 24 * 60;
      d += 1;
    }

    while (m < 0) {
      m += 24 * 60;
      d = Math.max(1, d - 1);
    }

    return {
      dayIndex: d,
      minutes: m
    };
  }

  function getJobKey(active) {
    if (!active) return null;

    const career = String(active.career_id || "").trim();
    const brand = String(active.brand_id || "").trim();

    return `${career}::${brand}`;
  }

  function startShiftForJob(active) {
    const current = getClock();
    const jobKey = getJobKey(active);

    const next = {
      ...current,
      dayIndex: current.dayIndex || 1,
      currentMinutes: current.shiftStartMinutes || 8 * 60,
      isLoggedIn: true,
      activeJobKey: jobKey,
      lastAdvancedAt: Date.now()
    };

    localStorage.setItem(LS_CLOCK, JSON.stringify(next));
    return next;
  }

  function ensureShiftForActiveJob(active) {
    const current = getClock();
    const jobKey = getJobKey(active);

    if (!jobKey) return current;

    if (current.activeJobKey !== jobKey || current.isLoggedIn !== true) {
      return startShiftForJob(active);
    }

    return current;
  }

  function logoutShift() {
    return setClock({
      isLoggedIn: false,
      lastAdvancedAt: Date.now()
    });
  }

  function advanceByMinutes(minutes) {
    const current = getClock();
    const add = Math.max(0, Number(minutes || 0));

    const normalized = normalizeDayAndMinutes(
      current.dayIndex,
      Number(current.currentMinutes || 0) + add
    );

    return setClock({
      dayIndex: normalized.dayIndex,
      currentMinutes: normalized.minutes,
      lastAdvancedAt: Date.now()
    });
  }

  function getWindow(durationMinutes) {
    const c = getClock();
    const dur = Math.max(5, Number(durationMinutes || 60));

    const start = normalizeDayAndMinutes(
      c.dayIndex,
      c.currentMinutes
    );

    const end = normalizeDayAndMinutes(
      start.dayIndex,
      start.minutes + dur
    );

    return {
      dayIndex: start.dayIndex,
      startsAtMinutes: start.minutes,
      startsAtLabel: minutesToLabel(start.minutes),
      deadlineDayIndex: end.dayIndex,
      deadlineAtMinutes: end.minutes,
      deadlineAtLabel: minutesToLabel(end.minutes),
      durationMinutes: dur
    };
  }

  function getDisplayModel() {
    const c = getClock();

    return {
      ...c,
      currentLabel: minutesToLabel(c.currentMinutes),
      shiftStartLabel: minutesToLabel(c.shiftStartMinutes),
      shiftEndLabel: minutesToLabel(c.shiftEndMinutes)
    };
  }

  window.CivicationCalendar = {
    getClock,
    setClock,
    getDisplayModel,
    minutesToLabel,
    getWindow,
    advanceByMinutes,
    startShiftForJob,
    ensureShiftForActiveJob,
    logoutShift
  };
})();
