// History Fagverk – exact period deep-link bridge.
// Activates only for ?subject=historie&period=<period_id> and maps the
// canonical curriculum period to the already rendered timeline article.
(function () {
  "use strict";

  const params = new URL(window.location.href).searchParams;
  const subjectId = String(params.get("subject") || "").trim();
  const periodId = String(params.get("period") || "").trim();
  const targetId = periodId ? `historie-periode-${periodId}` : "";
  let observer = null;

  function stopObserver() {
    observer?.disconnect();
    observer = null;
  }

  function applyToRenderedTimeline(periodIds) {
    if (!periodId || !targetId) return false;
    const index = periodIds.indexOf(periodId);
    if (index < 0) return false;

    const articles = document.querySelectorAll(
      "#historie-kronologi .fagverk-history-timeline > .fagverk-curriculum-article"
    );
    const article = /** @type {HTMLElement|undefined} */ (articles[index]);
    if (!article) return false;

    article.id = targetId;
    article.dataset.historyPeriodId = periodId;
    if (window.location.hash === `#${targetId}`) {
      article.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    stopObserver();
    return true;
  }

  async function loadPeriodIds() {
    const response = await fetch("data/fag/historie/curriculum_architecture_historie_v1.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} history curriculum`);
    const payload = await response.json();
    return (Array.isArray(payload?.chronological_spine) ? payload.chronological_spine : [])
      .map((period) => String(period?.id || "").trim())
      .filter(Boolean);
  }

  async function apply() {
    if (subjectId !== "historie" || !periodId) return false;
    const periodIds = await loadPeriodIds();
    if (!periodIds.includes(periodId)) return false;
    if (applyToRenderedTimeline(periodIds)) return true;

    stopObserver();
    observer = new MutationObserver(() => {
      applyToRenderedTimeline(periodIds);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return false;
  }

  Object.assign(window, {
    HGHistoryPeriodDeepLink: { apply, targetId }
  });

  if (subjectId === "historie" && periodId) {
    void apply().catch((err) => {
      console.warn("[HGHistoryPeriodDeepLink] kunne ikke åpne periode", err);
    });
  }
})();
