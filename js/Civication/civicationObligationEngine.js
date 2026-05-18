/* ============================================================
   Civication Obligation Engine v2
   - Matcher civicationJobs (4).js og civicationEventEngine (33).js
   - Beholder pulse/tidsur i EventEngine
   - 7 dager => warning
   - 14 dager + <30% besvart => fired
   ============================================================ */

(function () {
  /**
   * @typedef {Record<string, any>} CiviObligationRecord
   *
   * @typedef {CiviObligationRecord & {
   *   career_id?: string,
   *   role_key?: string,
   *   title?: string,
   *   career_name?: string,
   *   achieved_at?: string
   * }} CiviObligationActivePosition
   *
   * @typedef {CiviObligationRecord & {
   *   id?: string,
   *   lastCompleted?: number,
   *   periodStart?: number,
   *   progress?: number,
   *   status?: string
   * }} CiviObligationItem
   *
   * @typedef {CiviObligationRecord & {
   *   startedAt?: number,
   *   mailsPerDay?: number,
   *   warningAfterDays?: number,
   *   fireAfterDays?: number,
   *   minCompletionRate?: number
   * }} CiviObligationContract
   *
   * @typedef {CiviObligationRecord & {
   *   activeJob?: string | null,
   *   obligations?: CiviObligationItem[],
   *   contract?: CiviObligationContract | null,
   *   progress?: CiviObligationRecord | null,
   *   reputation?: number,
   *   salaryModifier?: number
   * }} CiviObligationCareer
   *
   * @typedef {CiviObligationRecord & {
   *   career?: CiviObligationCareer,
   *   warning_used?: boolean
   * }} CiviObligationState
   */

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

  /**
   * @returns {CiviObligationState}
   */
  function getState() {
    return /** @type {CiviObligationState} */ (CivicationState.getState());
  }

  /**
   * @returns {CiviObligationCareer}
   */
  function getCareer() {
    const state = getState();
    return state && state.career ? state.career : {};
  }

  /**
   * @returns {CiviObligationActivePosition | null}
   */
  function getActivePosition() {
    return /** @type {CiviObligationActivePosition | null} */ (CivicationState.getActivePosition());
  }

  /**
   * @param {number|string} startedAt
   * @param {string[] | undefined} ids
   * @returns {CiviObligationItem[]}
   */
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

  /**
   * @param {CiviObligationItem[] | unknown} obligations
   * @param {string} id
   * @returns {CiviObligationItem | null}
   */
  function getObligation(obligations, id) {
    if (!Array.isArray(obligations)) return null;

    return obligations.find(function (ob) {
      return ob && ob.id === id;
    }) || null;
  }

  /**
   * @param {CiviObligationCareer | CiviObligationRecord | null | undefined} career
   * @param {CiviObligationActivePosition | null | undefined} active
   * @returns {CiviObligationContract}
   */
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

  /**
   * @returns {{
   *   state: CiviObligationState,
   *   career: CiviObligationCareer,
   *   active: CiviObligationActivePosition | null,
   *   bootstrapped: boolean
   * }}
   */
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

    const career = /** @type {CiviObligationCareer} */ (state.career || {});
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

  /**
   * @param {CiviObligationContract} contract
   * @param {number} now
   * @returns {number}
   */
  function computeExpectedTaskCount(contract, now) {
    const elapsedDays = Math.max(
      0,
      Math.floor(daysBetween(contract.startedAt, now))
    );

    return elapsedDays * Number(contract.mailsPerDay || 3);
  }

  /**
   * @param {number} answered
   * @param {number} expected
   * @returns {number}
   */
  function computeCompletionRate(answered, expected) {
    if (!Number.isFinite(expected) || expected <= 0) return 1;
    return Number(answered || 0) / expected;
  }

  /**
   * @param {CiviObligationCareer} career
   * @param {CiviObligationActivePosition | null} active
   * @param {number} now
   * @returns {CiviObligationRecord}
   */
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

  /**
   * @param {CiviObligationActivePosition | null} active
   * @param {CiviObligationRecord} metrics
   * @returns {CiviObligationRecord}
   */
  function buildMailContext(active, metrics) {
    const rate = Number(metrics?.completionRate || 0);

    return {
      role_key: String(
        active?.role_key ||
        active?.career_id ||
        "job"
      ),
      title: String(
        active?.title ||
        active?.career_name ||
        "Stilling"
      ),
      career_id: String(active?.career_id || ""),
      career_name: String(active?.career_name || ""),
      expectedCount: Number(metrics?.expectedCount || 0),
      answeredCount: Number(metrics?.answeredCount || 0),
      completionRate: rate,
      completionPercent: Math.max(
        0,
        Math.min(100, Math.round(rate * 100))
      ),
      daysSinceStart: Number(metrics?.daysSinceStart || 0),
      daysSinceLogin: Number(metrics?.daysSinceLogin || 0),
      daysLeft: Math.max(
        0,
        Number(metrics?.contract?.fireAfterDays || 14) -
        Math.floor(Number(metrics?.daysSinceStart || 0))
      )
    };
  }

  /**
   * @param {string} reason
   * @param {number} reputation
   * @returns {CiviObligationRecord}
   */
  function fireCurrentEmployment(reason, reputation) {
    const prev = getActivePosition();
    const current = getState();

    if (prev) {
      CivicationState.appendJobHistoryEnded(
        prev,
        reason || "obligation_fail"
      );
    }

    CivicationState.setActivePosition(null);

    CivicationState.setState({
      stability: "FIRED",
      warning_used: false,
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

    const mailContext = buildMailContext(active, metrics);

    if (shouldFireForReputation || shouldFireForWorkload) {
      const ended = fireCurrentEmployment("obligation_fail", reputation);

      return {
        ...ended,
        shouldEnqueueFired: true,
        mailContext: mailContext
      };
    }

    const shouldEnqueueWarning =
      shouldWarn && state.warning_used !== true;

    CivicationState.setState({
      stability: nextStability,
      warning_used:
        nextStability === "WARNING"
          ? state.warning_used
          : false,
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
      shouldEnqueueWarning: shouldEnqueueWarning,
      mailContext: mailContext,
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
    const history = window.HGLearningLog?.getQuizHistory?.() ?? [];

    if (!Array.isArray(history)) {
      return 0;
    }

    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    return history.filter(function (h) {
      /** @type {CiviObligationRecord} */
      const item = /** @type {CiviObligationRecord} */ (h || {});
      if (!h || !item.date) return false;

      if (String(item.categoryId) !== String(careerId)) {
        return false;
      }

      const t = new Date(String(item.date)).getTime();
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
