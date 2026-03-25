/* ============================================================
   Civication Obligation Engine v2
   - Matcher civicationJobs (4).js og civicationEventEngine (33).js
   - Beholder pulse/tidsur i EventEngine
   - 7 dager => warning
   - 14 dager + <30% besvart => fired
   ============================================================ */

(function () {

  const DEFAULT_OBLIGATION_IDS = [
    "weekly_login",
    "event_response",
    "reputation_floor"
  ];

  const OBLIGATION_TYPES = {
    weekly_login: {
      type: "time_based",
      intervalDays: 7
    },

    event_response: {
      type: "count_based",
      mailsPerDay: 3,
      warningAfterDays: 7,
      fireAfterDays: 14,
      minCompletionRate: 0.30
    },

    reputation_floor: {
      type: "threshold",
      minValue: 60
    }
  };

  function daysBetween(a, b) {
    return (Number(b) - Number(a)) / (1000 * 60 * 60 * 24);
  }

  function toMs(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : Number(fallback || Date.now());
  }

  function getState() {
    return CivicationState.getState();
  }

  function getCareer() {
    const state = getState();
    return state && state.career ? state.career : {};
  }

  function getActivePosition() {
    return CivicationState.getActivePosition();
  }

  function buildDefaultObligations(startedAt, ids) {
    const base = toMs(startedAt, Date.now());

    return (Array.isArray(ids) && ids.length ? ids : DEFAULT_OBLIGATION_IDS)
      .map(function (id) {
        return {
          id: id,
          lastCompleted: base,
          periodStart: base,
          progress: 0,
          status: "ok"
        };
      });
  }

  function getObligation(obligations, id) {
    if (!Array.isArray(obligations)) return null;

    return obligations.find(function (ob) {
      return ob && ob.id === id;
    }) || null;
  }

  function getContract(career, active) {
    const achievedAt =
      active && active.achieved_at
        ? new Date(active.achieved_at).getTime()
        : Date.now();

    const contract = career && career.contract ? career.contract : {};

    return {
      startedAt: toMs(contract.startedAt, achievedAt),
      mailsPerDay: Number(contract.mailsPerDay || 3),
      warningAfterDays: Number(contract.warningAfterDays || 7),
      fireAfterDays: Number(contract.fireAfterDays || 14),
      minCompletionRate: Number(contract.minCompletionRate || 0.30)
    };
  }

  function ensureCareerBootstrapped() {
    const state = getState();
    const active = getActivePosition();

    if (!active || !active.career_id) {
      return {
        state: state,
        career: state.career || {},
        active: active,
        bootstrapped: false
      };
    }

    const career = state.career || {};
    let changed = false;

    const nextCareer = {
      ...career
    };

    if (!nextCareer.activeJob) {
      nextCareer.activeJob = String(active.career_id);
      changed = true;
    }

    const contract = getContract(nextCareer, active);

    if (!nextCareer.contract) {
      nextCareer.contract = {
        startedAt: contract.startedAt,
        mailsPerDay: contract.mailsPerDay,
        warningAfterDays: contract.warningAfterDays,
        fireAfterDays: contract.fireAfterDays,
        minCompletionRate: contract.minCompletionRate
      };
      changed = true;
    }

    if (!Array.isArray(nextCareer.obligations) || !nextCareer.obligations.length) {
      nextCareer.obligations = buildDefaultObligations(
        nextCareer.contract.startedAt,
        DEFAULT_OBLIGATION_IDS
      );
      changed = true;
    }

    if (!Number.isFinite(Number(nextCareer.reputation))) {
      nextCareer.reputation = 70;
      changed = true;
    }

    if (!Number.isFinite(Number(nextCareer.salaryModifier))) {
      nextCareer.salaryModifier = 1;
      changed = true;
    }

    if (!nextCareer.progress || typeof nextCareer.progress !== "object") {
      nextCareer.progress = {
        expectedCount: 0,
        answeredCount: 0,
        completionRate: 1,
        daysSinceStart: 0,
        daysSinceLogin: 0,
        lastEvaluatedAt: Date.now()
      };
      changed = true;
    }

    if (changed) {
      CivicationState.setState({
        career: nextCareer
      });
    }

    const fresh = getState();

    return {
      state: fresh,
      career: fresh.career || {},
      active: active,
      bootstrapped: changed
    };
  }

  function computeExpectedTaskCount(contract, now) {
    const elapsedDays = Math.max(
      0,
      Math.floor(daysBetween(contract.startedAt, now))
    );

    return elapsedDays * Number(contract.mailsPerDay || 3);
  }

  function computeCompletionRate(answered, expected) {
    if (!Number.isFinite(expected) || expected <= 0) return 1;
    return Number(answered || 0) / expected;
  }

  function makeCareerMetrics(career, active, now) {
    const contract = getContract(career, active);
    const obligations = Array.isArray(career.obligations)
      ? career.obligations
      : [];

    const loginOb = getObligation(obligations, "weekly_login");
    const responseOb = getObligation(obligations, "event_response");

    const lastLoginAt = toMs(
      loginOb && loginOb.lastCompleted,
      contract.startedAt
    );

    const answeredCount = Number(
      (responseOb && responseOb.progress) || 0
    );

    const expectedCount = computeExpectedTaskCount(contract, now);
    const completionRate = computeCompletionRate(
      answeredCount,
      expectedCount
    );

    return {
      contract: contract,
      obligations: obligations,
      lastLoginAt: lastLoginAt,
      daysSinceStart: daysBetween(contract.startedAt, now),
      daysSinceLogin: daysBetween(lastLoginAt, now),
      answeredCount: answeredCount,
      expectedCount: expectedCount,
      completionRate: completionRate
    };
  }

  function fireCurrentEmployment(reason, reputation) {
    const prev = getActivePosition();
    const roleKey = getState().active_role_key;
    const current = getState();

    if (prev) {
      CivicationState.appendJobHistoryEnded(prev, reason || "obligation_fail");
    }

    CivicationState.setActivePosition(null);

    CivicationState.setState({
      stability: "FIRED",
      warning_used: true,
      active_role_key: null,
      unemployed_since_week:
        (typeof weekKey === "function")
          ? weekKey(new Date())
          : new Date().toISOString(),
      career: {
        ...(current.career || {}),
        activeJob: null,
        obligations: [],
        contract: null,
        progress: null,
        reputation: Number(reputation || 0)
      }
    });

    if (window.HG_CiviEngine?.makeFiredEvent) {
      const firedEv = window.HG_CiviEngine.makeFiredEvent(roleKey);
      window.HG_CiviEngine.enqueueEvent(firedEv);
    }

    window.dispatchEvent(new Event("updateProfile"));

    return {
      ok: true,
      reason: reason || "obligation_fail"
    };
  }

  function evaluate() {
    const ensured = ensureCareerBootstrapped();
    const state = ensured.state;
    const career = ensured.career;
    const active = ensured.active;

    if (!career?.activeJob || !active) {
      return { ok: false, reason: "no_active_job" };
    }

    const now = Date.now();
    let reputation = Number(career.reputation || 0);

    const metrics = makeCareerMetrics(career, active, now);
    const contract = metrics.contract;
    const obligations = metrics.obligations.slice();

    const reputationRule = OBLIGATION_TYPES.reputation_floor;

    const shouldWarn =
      metrics.daysSinceStart >= contract.warningAfterDays &&
      (
        metrics.daysSinceLogin >= contract.warningAfterDays ||
        metrics.completionRate < contract.minCompletionRate
      );

    const shouldFireForWorkload =
      metrics.daysSinceStart >= contract.fireAfterDays &&
      metrics.completionRate < contract.minCompletionRate;

    const shouldFireForReputation =
      reputation < Number(reputationRule.minValue || 60);

    const nextStability =
      shouldWarn ? "WARNING" : "STABLE";

    const updatedObligations = obligations.map(function (ob) {
      if (!ob) return ob;

      if (ob.id === "weekly_login") {
        return {
          ...ob,
          status: metrics.daysSinceLogin >= contract.warningAfterDays
            ? "warning"
            : "ok"
        };
      }

      if (ob.id === "event_response") {
        return {
          ...ob,
          status: shouldFireForWorkload
            ? "failed"
            : (shouldWarn ? "warning" : "ok")
        };
      }

      if (ob.id === "reputation_floor") {
        return {
          ...ob,
          status: shouldFireForReputation ? "failed" : "ok"
        };
      }

      return ob;
    });

    if (reputation > 100) reputation = 100;
    if (reputation < 0) reputation = 0;

    if (shouldFireForReputation || shouldFireForWorkload) {
      return fireCurrentEmployment("obligation_fail", reputation);
    }

    CivicationState.setState({
      stability: nextStability,
      warning_used: shouldWarn ? true : state.warning_used,
      career: {
        ...(state.career || {}),
        activeJob: career.activeJob,
        reputation: reputation,
        obligations: updatedObligations,
        contract: {
          startedAt: contract.startedAt,
          mailsPerDay: contract.mailsPerDay,
          warningAfterDays: contract.warningAfterDays,
          fireAfterDays: contract.fireAfterDays,
          minCompletionRate: contract.minCompletionRate
        },
        progress: {
          expectedCount: metrics.expectedCount,
          answeredCount: metrics.answeredCount,
          completionRate: metrics.completionRate,
          daysSinceStart: metrics.daysSinceStart,
          daysSinceLogin: metrics.daysSinceLogin,
          lastEvaluatedAt: now
        }
      }
    });

    return {
      ok: true,
      reason: nextStability === "WARNING" ? "warning" : "active",
      expectedCount: metrics.expectedCount,
      answeredCount: metrics.answeredCount,
      completionRate: metrics.completionRate
    };
  }

  function registerLogin() {
    const ensured = ensureCareerBootstrapped();
    const career = ensured.career;

    if (!career?.activeJob || !Array.isArray(career.obligations)) return;

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
        ...(getCareer() || {}),
        obligations: updated
      }
    });
  }

  function registerEventResponse() {
    const ensured = ensureCareerBootstrapped();
    const career = ensured.career;

    if (!career?.activeJob || !Array.isArray(career.obligations)) return;

    const updated = career.obligations.map(function (ob) {
      if (ob.id === "event_response") {
        return {
          ...ob,
          progress: Number(ob.progress || 0) + 1,
          status: "ok"
        };
      }
      return ob;
    });

    CivicationState.setState({
      career: {
        ...(getCareer() || {}),
        obligations: updated
      }
    });
  }

  function activateJob(jobId, obligationIds) {
    const active = getActivePosition();
    const startedAt =
      active && active.achieved_at
        ? new Date(active.achieved_at).getTime()
        : Date.now();

    const ids =
      Array.isArray(obligationIds) && obligationIds.length
        ? obligationIds
        : DEFAULT_OBLIGATION_IDS;

    CivicationState.setState({
      stability: "STABLE",
      warning_used: false,
      career: {
        activeJob: jobId,
        reputation: 70,
        salaryModifier: 1,
        obligations: buildDefaultObligations(startedAt, ids),
        contract: {
          startedAt: startedAt,
          mailsPerDay: 3,
          warningAfterDays: 7,
          fireAfterDays: 14,
          minCompletionRate: 0.30
        },
        progress: {
          expectedCount: 0,
          answeredCount: 0,
          completionRate: 1,
          daysSinceStart: 0,
          daysSinceLogin: 0,
          lastEvaluatedAt: Date.now()
        }
      }
    });
  }

  function getQuizCountLastWeek(careerId) {
    const history =
      JSON.parse(localStorage.getItem("quiz_history") || "[]");

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

  window.CivicationObligationEngine = {
    evaluate,
    registerLogin,
    registerEventResponse,
    activateJob,
    getQuizCountLastWeek
  };

})();
