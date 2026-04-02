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
