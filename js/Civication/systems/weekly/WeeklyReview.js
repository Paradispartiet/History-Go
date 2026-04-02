const CIVI_WEEKLY_REVIEW_KEY = "hg_civi_weekly_review_v1";

function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const dayNum = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayNum + 3);

  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const firstDayNum = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNum + 3);

  const weekNo =
    1 + Math.round((d - firstThursday) / (7 * 24 * 60 * 60 * 1000));

  return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getWeeklyReview() {
  try {
    const raw = JSON.parse(
      localStorage.getItem(CIVI_WEEKLY_REVIEW_KEY) || "null"
    );

    if (!raw || typeof raw !== "object") {
      return {
        weekKey: getWeekKey(),
        days: [],
        summary: null,
        applied: false
      };
    }

    return {
      weekKey: String(raw.weekKey || getWeekKey()),
      days: Array.isArray(raw.days) ? raw.days : [],
      summary: raw.summary && typeof raw.summary === "object" ? raw.summary : null,
      applied: !!raw.applied
    };
  } catch {
    return {
      weekKey: getWeekKey(),
      days: [],
      summary: null,
      applied: false
    };
  }
}

function saveWeeklyReview(review) {
  const safeReview = {
    weekKey: String(review?.weekKey || getWeekKey()),
    days: Array.isArray(review?.days) ? review.days : [],
    summary: review?.summary && typeof review.summary === "object"
      ? review.summary
      : null,
    applied: !!review?.applied
  };

  localStorage.setItem(CIVI_WEEKLY_REVIEW_KEY, JSON.stringify(safeReview));
  return safeReview;
}

function saveDailySummaryToWeek(summary) {
  if (!summary || typeof summary !== "object") return null;

  const currentWeekKey = getWeekKey();
  const review = getWeeklyReview();

  const baseReview =
    review.weekKey === currentWeekKey
      ? review
      : {
          weekKey: currentWeekKey,
          days: [],
          summary: null,
          applied: false
        };

  const entry = {
    dayIndex: Number(summary.dayIndex || 0),
    completedPhases: Number(summary.completedPhases || 0),
    score: Number(summary.score || 0),
    stability: String(summary.stability || "STABLE"),
    quality: String(summary.quality || "jevn"),
    nextDayCarryover:
      summary.nextDayCarryover && typeof summary.nextDayCarryover === "object"
        ? {
            visibilityBias: Number(summary.nextDayCarryover.visibilityBias || 0),
            processBias: Number(summary.nextDayCarryover.processBias || 0),
            fatigue: Number(summary.nextDayCarryover.fatigue || 0)
          }
        : {
            visibilityBias: 0,
            processBias: 0,
            fatigue: 0
          },
    choiceLog: Array.isArray(summary.choiceLog)
      ? summary.choiceLog.map((x) => ({
          phase: String(x?.phase || ""),
          subject: String(x?.subject || ""),
          choiceId: x?.choiceId ?? null,
          label: String(x?.label || ""),
          feedback: String(x?.feedback || ""),
          effect: Number(x?.effect || 0)
        }))
      : []
  };

  const existingIdx = baseReview.days.findIndex(
    (d) => Number(d?.dayIndex || 0) === entry.dayIndex
  );

  const nextDays =
    existingIdx >= 0
      ? baseReview.days.map((d, i) => (i === existingIdx ? entry : d))
      : baseReview.days.concat([entry]);

  const weeklySummary = buildWeeklySummary(nextDays);

return saveWeeklyReview({
  ...baseReview,
  days: nextDays,
  summary: weeklySummary,
  applied: false
});
}

function buildWeeklySummary(days) {
  const safeDays = Array.isArray(days) ? days : [];

  const summary = {
    daysCount: safeDays.length,
    strongDays: 0,
    evenDays: 0,
    unevenDays: 0,
    visibilityDays: 0,
    processDays: 0,
    fatigueDays: 0,
    avgScore: 0
  };

  if (!safeDays.length) return summary;

  let scoreTotal = 0;

  for (const day of safeDays) {
    const quality = String(day?.quality || "jevn");
    const score = Number(day?.score || 0);
    const carry = day?.nextDayCarryover && typeof day.nextDayCarryover === "object"
      ? day.nextDayCarryover
      : { visibilityBias: 0, processBias: 0, fatigue: 0 };

    scoreTotal += score;

    if (quality === "sterk") summary.strongDays += 1;
    else if (quality === "ujevn") summary.unevenDays += 1;
    else summary.evenDays += 1;

    if (Number(carry.visibilityBias || 0) > Number(carry.processBias || 0)) {
      summary.visibilityDays += 1;
    }

    if (Number(carry.processBias || 0) > 0) {
      summary.processDays += 1;
    }

    if (Number(carry.fatigue || 0) > 1 || quality === "ujevn") {
      summary.fatigueDays += 1;
    }
  }

  summary.avgScore = Number((scoreTotal / safeDays.length).toFixed(2));
  return summary;
}

function applyWeeklyConsequences(summary, activeCareerId) {
  const safe = summary && typeof summary === "object" ? summary : {};

  const strongDays = Number(safe.strongDays || 0);
  const unevenDays = Number(safe.unevenDays || 0);
  const visibilityDays = Number(safe.visibilityDays || 0);
  const processDays = Number(safe.processDays || 0);
  const fatigueDays = Number(safe.fatigueDays || 0);
  const avgScore = Number(safe.avgScore || 0);

  const trustDelta = 0;
  let integrityDelta = 0;
  let visibilityDelta = 0;
  let economicRoomDelta = 0;
  let burnoutPressure = 0;

  if (strongDays >= 3) {
    economicRoomDelta += 1;
  }

  if (unevenDays >= 2 || fatigueDays >= 2) {
    integrityDelta -= 1;
    economicRoomDelta -= 1;
    burnoutPressure += 1;
  }

  if (visibilityDays >= 3) {
    visibilityDelta += 1;
    burnoutPressure += 1;
  }

  if (processDays >= 3) {
    integrityDelta += 1;
  }

  if (avgScore >= 1.5) {
    economicRoomDelta += 1;
  } else if (avgScore < 0) {
    economicRoomDelta -= 1;
  }

  try {
    if (integrityDelta !== 0) {
      window.CivicationPsyche?.updateIntegrity?.(integrityDelta);
    }

    if (visibilityDelta !== 0) {
      window.CivicationPsyche?.updateVisibility?.(visibilityDelta);
    }

    if (economicRoomDelta !== 0) {
      window.CivicationPsyche?.updateEconomicRoom?.(economicRoomDelta);
    }

    if (burnoutPressure > 0) {
      window.CivicationPsyche?.updateIntegrity?.(-1 * burnoutPressure);
    }
  } catch {}

  return {
    integrityDelta,
    visibilityDelta,
    economicRoomDelta,
    burnoutPressure,
    trustDelta,
    activeCareerId: String(activeCareerId || "")
  };
}


function finalizeWeekIfNeeded(activeCareerId) {
  const review = getWeeklyReview();
  const summary =
    review?.summary && typeof review.summary === "object"
      ? review.summary
      : null;

  if (!summary) return null;
  if (review?.applied) return review;
  if (Number(summary.daysCount || 0) < 3) return review;

  const effects = applyWeeklyConsequences(summary, activeCareerId);

  const nextReview = saveWeeklyReview({
    ...review,
    applied: true,
    summary: {
      ...summary,
      appliedEffects: effects,
      weeklyNote:
        Number(summary.strongDays || 0) >= 3
          ? "Uken hang godt sammen og gir deg litt mer rom."
          : Number(summary.unevenDays || 0) >= 2
            ? "Uken ble ujevn, og presset setter noen spor."
            : Number(summary.visibilityDays || 0) >= 3
              ? "Du har vært synlig denne uken, men det koster litt."
              : Number(summary.processDays || 0) >= 3
                ? "Du har holdt struktur gjennom uken og bygger troverdighet."
                : "Uken gir et lite, men merkbart avtrykk."
    }
  });

  return nextReview;
}
  

function buildWeeklyReportHtml() {
  const review = getWeeklyReview();
  const summary =
    review?.summary && typeof review.summary === "object"
      ? review.summary
      : null;

  if (!summary) return "";

  const daysCount = Number(summary.daysCount || 0);
  if (daysCount <= 0) return "";

  const note = String(summary.weeklyNote || "").trim();
  const effects =
    summary.appliedEffects && typeof summary.appliedEffects === "object"
      ? summary.appliedEffects
      : null;

  const effectBits = [];
  if (effects) {
    if (Number(effects.integrityDelta || 0) !== 0) {
      effectBits.push(`Integritet ${effects.integrityDelta > 0 ? "+" : ""}${effects.integrityDelta}`);
    }
    if (Number(effects.visibilityDelta || 0) !== 0) {
      effectBits.push(`Synlighet ${effects.visibilityDelta > 0 ? "+" : ""}${effects.visibilityDelta}`);
    }
    if (Number(effects.economicRoomDelta || 0) !== 0) {
      effectBits.push(`Handlingsrom ${effects.economicRoomDelta > 0 ? "+" : ""}${effects.economicRoomDelta}`);
    }
    if (Number(effects.burnoutPressure || 0) > 0) {
      effectBits.push(`Press +${effects.burnoutPressure}`);
    }
  }

  return `
    <div class="civi-weekly-report" style="margin-bottom:12px;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.04);">
      <div style="font-weight:700;margin-bottom:8px;">Ukerapport · ${String(review.weekKey || "")}</div>
      <div style="font-size:0.95rem;line-height:1.4;">
        Dager: ${daysCount} · Sterke: ${Number(summary.strongDays || 0)} · Jevne: ${Number(summary.evenDays || 0)} · Ujevne: ${Number(summary.unevenDays || 0)}
      </div>
      <div style="font-size:0.95rem;line-height:1.4;margin-top:4px;">
        Synlighet: ${Number(summary.visibilityDays || 0)} · Struktur: ${Number(summary.processDays || 0)} · Slitasje: ${Number(summary.fatigueDays || 0)} · Snittscore: ${Number(summary.avgScore || 0)}
      </div>
      ${note ? `<div style="margin-top:8px;font-size:0.95rem;line-height:1.45;">${note}</div>` : ""}
      ${effectBits.length ? `<div style="margin-top:8px;font-size:0.9rem;opacity:0.9;">${effectBits.join(" · ")}</div>` : ""}
    </div>
  `;
}
