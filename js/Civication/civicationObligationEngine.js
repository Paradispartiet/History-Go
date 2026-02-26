/* ============================================================
   Civication Obligation Engine v1
   - Evaluering av kontraktsforpliktelser
   - Ingen UI
   - Ingen localStorage direkte
   ============================================================ */

(function () {

  // --------------------------------------------------
  // Obligation definitions
  // --------------------------------------------------

  const OBLIGATION_TYPES = {

    weekly_login: {
      type: "time_based",
      intervalDays: 7,
      onFail: { reputation: -5 }
    },

    event_response: {
      type: "count_based",
      required: 1,
      intervalDays: 7,
      onFail: { reputation: -3 }
    },

    reputation_floor: {
      type: "threshold",
      minValue: 60,
      onFail: { fire: true }
    }

  };

  // --------------------------------------------------
  // Utilities
  // --------------------------------------------------

  function daysBetween(a, b) {
    return (b - a) / (1000 * 60 * 60 * 24);
  }

  // --------------------------------------------------
  // Core evaluation
  // --------------------------------------------------

  function evaluate() {

    const state = CivicationState.getState();
    const career = state.career;

    if (!career?.activeJob) return;

    const now = Date.now();
    let reputation = Number(career.reputation || 0);
    let obligations = Array.isArray(career.obligations)
      ? career.obligations.slice()
      : [];

    let fired = false;

    obligations = obligations.map(function (ob) {

      const def = OBLIGATION_TYPES[ob.id];
      if (!def) return ob;

      // -----------------------------
      // TIME BASED
      // -----------------------------
      if (def.type === "time_based") {

        const last = Number(ob.lastCompleted || 0);
        const days = daysBetween(last, now);

        if (days > def.intervalDays) {
          reputation += Number(def.onFail?.reputation || 0);
          ob.status = "failed";
        }
      }

      // -----------------------------
      // COUNT BASED
      // -----------------------------
      if (def.type === "count_based") {

        const start = Number(ob.periodStart || 0);
        const days = daysBetween(start, now);

        if (days > def.intervalDays) {

          if (Number(ob.progress || 0) < def.required) {
            reputation += Number(def.onFail?.reputation || 0);
            ob.status = "failed";
          }

          ob.periodStart = now;
          ob.progress = 0;
        }
      }

// -----------------------------
// THRESHOLD
// -----------------------------
if (def.type === "threshold") {

  if (reputation < def.minValue) {
    fired = true;
  }
}

return ob;
});

// 🔽 Clamp reputation
if (reputation > 100) reputation = 100;
if (reputation < 0) reputation = 0;

// 🔽 Fired handling
if (fired) {

  const prev = CivicationState.getActivePosition();
  const roleKey = CivicationState.getState().active_role_key;

  CivicationState.appendJobHistoryEnded(prev, "obligation_fail");
  CivicationState.setActivePosition(null);

  const current = CivicationState.getState();

CivicationState.setState({
  unemployed_since_week: new Date().toISOString(),
  career: {
    ...current.career,
    activeJob: null,
    obligations: [],
    reputation: reputation
  }
});

  // 🔽 GENERER FIRED EVENT
  if (window.HG_CiviEngine?.makeFiredEvent) {
    const firedEv = window.HG_CiviEngine.makeFiredEvent(roleKey);
    window.HG_CiviEngine.enqueueEvent(firedEv);
  }

  return;
}

    CivicationState.setState({
      career: {
        reputation: reputation,
        obligations: obligations
      }
    });

  }

  // --------------------------------------------------
  // Registration helpers
  // --------------------------------------------------

  function registerLogin() {

    const state = CivicationState.getState();
    const career = state.career;

    if (!career?.obligations) return;

    const now = Date.now();

    const updated = career.obligations.map(function (ob) {
      if (ob.id === "weekly_login") {
        return {
          ...ob,
          lastCompleted: now,
          status: "ok"
        };
      }
      return ob;
    });

    CivicationState.setState({
      career: {
        obligations: updated
      }
    });

  }

  function registerEventResponse() {

    const state = CivicationState.getState();
    const career = state.career;

    if (!career?.obligations) return;

    const updated = career.obligations.map(function (ob) {
      if (ob.id === "event_response") {
        return {
          ...ob,
          progress: Number(ob.progress || 0) + 1
        };
      }
      return ob;
    });

    CivicationState.setState({
      career: {
        obligations: updated
      }
    });

  }

  // --------------------------------------------------
  // Activate new job
  // --------------------------------------------------

  function activateJob(jobId, obligationIds) {

    const now = Date.now();

    const obligations = (obligationIds || []).map(function (id) {
      return {
        id: id,
        lastCompleted: now,
        periodStart: now,
        progress: 0,
        status: "ok"
      };
    });

    CivicationState.setState({
      career: {
        activeJob: jobId,
        reputation: 70,
        salaryModifier: 1,
        obligations: obligations
      }
    });

  }

function getQuizCountLastWeek(careerId) {

  const history =
    JSON.parse(
      localStorage.getItem("quiz_history") || "[]"
    );

  if (!Array.isArray(history)) {
    return 0;
  }

  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  return history.filter(function (h) {

    if (!h || !h.date) return false;

    if (String(h.categoryId) !== String(careerId)) {
      return false;
    }

    const t = new Date(h.date).getTime();
    return (now - t) <= oneWeek;

  }).length;
}
   
  // --------------------------------------------------
  // Export
  // --------------------------------------------------

  window.CivicationObligationEngine = {
    evaluate,
    registerLogin,
    registerEventResponse,
    activateJob
  };

})();
