/**
 * @typedef {Record<string, any>} CiviEconomyRecord
 * @typedef {CiviEconomyRecord & { id?: string, name?: string, tiers?: CiviEconomyRecord[] }} CiviEconomyBadge
 * @typedef {CiviEconomyRecord & { balance?: number, pc?: number, last_tick_iso?: string | null, lastTickIso?: string | null, weekly_income?: number, weeklyIncome?: number, history?: unknown[] }} CiviEconomyWallet
 * @typedef {CiviEconomyRecord & { career_id?: string, id?: string, role_id?: string, badge_id?: string, title?: string, name?: string, tier?: number, salary?: number, base_salary?: number, career_mod?: number, curve?: string, status?: string, economy?: CiviEconomyRecord, world_logic?: CiviEconomyRecord }} CiviEconomyCareer
 * @typedef {CiviEconomyRecord & { points?: number, completed?: any[], tierIndex?: number, badgeId?: string, badge_id?: string, label?: string, progress?: number }} CiviEconomyProgress
 * @typedef {CiviEconomyRecord & { ok?: boolean, balance?: number, delta?: number, weekly?: number, reason?: string, career?: CiviEconomyCareer | null, wallet?: CiviEconomyWallet }} CiviEconomyTickResult
 */
function checkTierUpgrades(onlyCareerId) {
  function dispatchProfileUpdate() {
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  function getLastQuizCategoryId() {
    const hist = window.HGLearningLog?.getQuizHistory?.() ?? [];
    if (!hist.length) return null;

    // Finn siste på dato (robust hvis array ikke er append)
    let best = null;
    let bestT = -1;

    for (let i = 0; i < hist.length; i++) {
      const h = hist[i];
      const t = h?.date ? Date.parse(h.date) : NaN;
      if (Number.isFinite(t) && t > bestT) {
        bestT = t;
        best = h;
      }
    }

    // Fallback: siste element
    const last = best || hist[hist.length - 1];

    const cid = String(last?.categoryId || "").trim();
    return cid || null;
  }

  function prunePendingOffersToCareer(careerId) {
    if (!careerId) return;

    const getOffers = window.CivicationJobs?.getOffers;
    const setOffers = window.CivicationJobs?.setOffers;
    if (typeof getOffers !== "function" || typeof setOffers !== "function") return;

    const offers = getOffers();
    if (!Array.isArray(offers) || !offers.length) return;

    const nowIso = new Date().toISOString();
    let changed = false;

    const next = offers.map(o => {
      if (!o || o.status !== "pending") return o;

      const oid = String(o.career_id || "").trim();
      if (oid && oid !== careerId) {
        changed = true;
        return {
          ...o,
          status: "expired",
          expired_at: nowIso,
          expired_reason: "other_category_pruned"
        };
      }
      return o;
    });

    if (changed) setOffers(next);
  }

  // 0) Finn hvilken kategori som faktisk skal trigge tilbud
  const targetCareerId = String(onlyCareerId || "").trim() || getLastQuizCategoryId();
  if (!targetCareerId) return;

  // 1) Prune gamle pending offers i andre kategorier
  prunePendingOffersToCareer(targetCareerId);

  const merits =
    JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  const tierState =
    JSON.parse(localStorage.getItem("hg_badge_tiers_v1") || "{}");

  const newTierState = Object.assign({}, tierState);

  /** @type {CiviEconomyBadge[]} */
  const badges =
    Array.isArray(window.BADGES)
      ? /** @type {CiviEconomyBadge[]} */ (window.BADGES)
      : [];

  // 2) Finn kun badge for targetCareerId (ikke loop alle)
  const badge =
    badges.find(b => String(b?.id || "").trim() === targetCareerId);

  if (!badge) return;

  const points =
    Number((merits[badge.id] && merits[badge.id].points) || 0);

  const tierData =
    deriveTierFromPoints(badge, points);

  const tierIndex = tierData.tierIndex;

  const previousTier =
    Number(tierState[badge.id] || -1);

  if (tierIndex > previousTier) {

    /** @type {CiviEconomyCareer | null} */
    let career = null;

    if (Array.isArray(window.HG_CAREERS)) {
      for (let j = 0; j < window.HG_CAREERS.length; j++) {
        const c = /** @type {CiviEconomyCareer} */ (window.HG_CAREERS[j]);
        if (String(c.career_id) === String(badge.id)) {
          career = c;
          break;
        }
      }
    }

    if (career) {
      const tiers = Array.isArray(badge?.tiers) ? badge.tiers : [];

      // push tilbud for nivåer du passerer (innen samme kategori)
      for (let t = previousTier + 1; t <= tierIndex; t++) {
        const thr = Number(tiers[t]?.threshold);
        const lbl = String(tiers[t]?.label || "").trim();

        if (!Number.isFinite(thr) || !lbl) continue;

        window.CivicationJobs?.pushOffer?.({
          career_id: String(badge.id),
          career_name: String(badge.name || badge.id),
          title: lbl,
          threshold: thr,
          points_at_offer: points
        });
      }
    }

    newTierState[badge.id] = tierIndex;
  }

  const tierStateChanged = JSON.stringify(newTierState) !== JSON.stringify(tierState);
  if (tierStateChanged) {
    localStorage.setItem(
      "hg_badge_tiers_v1",
      JSON.stringify(newTierState)
    );
    dispatchProfileUpdate();
  }
}

window.checkTierUpgrades = checkTierUpgrades;



(function () {

// Freeze employment and the applicable wage at the end of each *played* day.
// This prevents a job selected on payout day from being credited for the entire
// preceding week. The canonical wallet persists these checkpoints for reloads.
function recordCompletedGameDay(rawDay) {
  const day = Number(rawDay);
  if (!Number.isSafeInteger(day) || day < 1) return;
  const state = window.CivicationState;
  if (!state?.getWallet || !state?.updateWallet) return;
  const wallet = normalizeWallet(state.getWallet());
  let start = Number(wallet.last_tick_day_index);
  if (!Number.isSafeInteger(start) || start < 1 || start > day) {
    // Old saves start here without creating back-pay for earlier days.
    wallet.last_tick_day_index = day;
    start = day;
  }
  if (day < start) return;
  const previous = Array.isArray(wallet.completed_game_days_v1)
    ? wallet.completed_game_days_v1.filter((r) => Number.isSafeInteger(r?.dayIndex) && r.dayIndex >= start)
    : [];
  if (previous.some((r) => r.dayIndex === day)) return;
  const careerId = String(state.getActivePosition?.()?.career_id || "").trim();
  /** @type {CiviEconomyCareer | null} */
  const career = Array.isArray(window.HG_CAREERS)
    ? /** @type {CiviEconomyCareer | null} */ (window.HG_CAREERS.find(
        /** @param {CiviEconomyCareer} c */
        (c) => String(c?.career_id || "") === careerId
      ) || null)
    : null;
  const badge = Array.isArray(window.BADGES)
    ? window.BADGES.find((b) => String(b?.id || "") === careerId)
    : null;
  let weeklyNet = 0;
  if (career && badge) {
    const merits = readMeritsByCategorySafe();
    const points = Number(merits?.[careerId]?.points || 0);
    let tier = 0;
    try { tier = Number(deriveTierFromPoints(badge, points)?.tierIndex || 0); } catch {}
    const weeklySalary = Math.floor(calculateWeeklySalary(career, tier));
    const expense = Math.floor(Number(career.economy?.weekly_expenses?.base || 0)
      * Number(career.economy?.weekly_expenses?.risk_modifier || 1));
    weeklyNet = weeklySalary - (Number.isFinite(expense) ? expense : 0);
  }
  // Eligibility is based on the first completed day without work; returning
  // to a job cancels the unemployment streak, including across job changes.
  const currentState = state.getState?.() || {};
  const sinceDay = Number(currentState.unemployed_since_day_index);
  if (!careerId && (!Number.isSafeInteger(sinceDay) || sinceDay < 1)) {
    state.setState?.({ unemployed_since_day_index: day });
  } else if (careerId && currentState.unemployed_since_day_index != null) {
    state.setState?.({ unemployed_since_day_index: null, unemployed_since_week: null });
  }
  // One record per completed day; same-day retries never accrue twice.
  wallet.completed_game_days_v1 = previous.concat({ dayIndex: day, careerId, weeklyNet });
  state.updateWallet(wallet);
}

/** @returns {void | CiviEconomyTickResult} */
function tickPCIncomeWeekly() {

  const state = window.CivicationState.getState();
  /** @type {CiviEconomyRecord} */
  const stateView = /** @type {CiviEconomyRecord} */ (state);
  let wallet = normalizeWallet(
    window.CivicationState.getWallet()
  );

  /** @type {CiviEconomyCareer | null} */
  const active =
    /** @type {CiviEconomyCareer | null} */ (window.CivicationState.getActivePosition());

  const now = new Date();

  // Weekly wallet settlement follows Civication's actual days, not Mondays.
  // Migrate existing wallets without granting retroactive earnings.
  const dayIndex = Number(window.CivicationCalendar?.getClock?.()?.dayIndex);
  if (!Number.isSafeInteger(dayIndex) || dayIndex < 1) return;
  const lastDay = Number(wallet.last_tick_day_index);
  if (!Number.isSafeInteger(lastDay) || lastDay < 1 || lastDay > dayIndex) {
    wallet.last_tick_day_index = dayIndex;
    window.CivicationState.updateWallet(wallet);
    if (!active?.career_id && (!Number.isSafeInteger(Number(stateView.unemployed_since_day_index)) || Number(stateView.unemployed_since_day_index) < 1)) {
      window.CivicationState.setState({ unemployed_since_day_index: dayIndex });
    }
    return;
  }
  if (dayIndex - lastDay < 7) return;

  const settlementDay = lastDay + 7;
  const records = Array.isArray(wallet.completed_game_days_v1)
    ? wallet.completed_game_days_v1.filter((r) => Number.isSafeInteger(r?.dayIndex)
      && r.dayIndex >= lastDay && r.dayIndex < settlementDay)
    : [];
  // Daily snapshots are authoritative when available; old saves with none
  // retain the legacy whole-week calculation until their first full week.
  // Sum integer weekly-net shares before dividing, so floating-point
  // rounding cannot turn seven 170-PC days into 169 PC at settlement.
  const recordedNet = records.length
    ? Math.floor(records.reduce((sum, r) => sum + (Number.isFinite(Number(r.weeklyNet)) ? Number(r.weeklyNet) : 0), 0) / 7)
    : null;
  const thisWeek = typeof weekKey === "function" ? weekKey(now) : null;
  const stampSettledWeek = () => {
    wallet.last_tick_day_index = settlementDay;
    if (Array.isArray(wallet.completed_game_days_v1)) {
      wallet.completed_game_days_v1 = wallet.completed_game_days_v1.filter((r) => Number(r?.dayIndex) >= settlementDay);
    }
    wallet.last_tick_iso = now.toISOString(); // diagnostic timestamp, not the game clock
    window.CivicationState.updateWallet(wallet);
  };

  // =========================================================
  // GLOBAL RULES (hent fra CIVI_CAREER_RULES hvis tilgjengelig)
  // =========================================================

  let navAfterWeeks = 0;
  let navWeeklyPc = 0;

  if (Array.isArray(window.CIVI_CAREER_RULES)) {
    const any = /** @type {CiviEconomyRecord} */ (window.CIVI_CAREER_RULES[0]);
    navAfterWeeks =
      Number(any?.global_rules?.unemployment?.nav_after_weeks || 0);
    navWeeklyPc =
      Number(any?.global_rules?.unemployment?.nav_weekly_pc || 0);
  }

  // =========================================================
  // ARBEIDSLEDIG
  // =========================================================

  if (!active?.career_id) {

    // Retain wages earned earlier this week before losing the job.
    if (recordedNet !== null) wallet.balance += recordedNet;
    const sinceDay = Number(stateView.unemployed_since_day_index);
    if (!Number.isSafeInteger(sinceDay) || sinceDay < 1 || sinceDay > settlementDay) {
      window.CivicationState.setState({
        unemployed_since_day_index: settlementDay,
        unemployed_since_week: thisWeek
      });
      stampSettledWeek();
      return;
    }

    const weeksPassed = Math.floor((settlementDay - sinceDay) / 7);

    if (weeksPassed >= navAfterWeeks && navWeeklyPc > 0) {
      wallet.balance += Math.floor(navWeeklyPc);
    }

    stampSettledWeek();
    return;
  }

  // =========================================================
  // I JOBB
  // =========================================================

  /** @type {CiviEconomyCareer | null} */
  const career =
    Array.isArray(window.HG_CAREERS)
      ? /** @type {CiviEconomyCareer | null} */ (window.HG_CAREERS.find(
          /** @param {CiviEconomyCareer} c */
          c => String(c.career_id) === String(active.career_id)
        ) || null)
      : null;

  if (!career) {
    // An unavailable current job must not erase wages from recorded days.
    if (recordedNet !== null) wallet.balance += recordedNet;
    stampSettledWeek();
    return;
  }

  const merits =
    JSON.parse(
      localStorage.getItem("merits_by_category") || "{}"
    );

  const points =
    Number(merits[active.career_id]?.points || 0);

  const badge =
    /** @type {CiviEconomyBadge | undefined} */ (window.BADGES?.find(
      /** @param {CiviEconomyBadge} b */
      b => b.id === active.career_id
    ));

  if (!badge) {
    if (recordedNet !== null) wallet.balance += recordedNet;
    stampSettledWeek();
    return;
  }

  const { tierIndex } =
    deriveTierFromPoints(badge, points);

  // 1️⃣ Lønn

  const weeklyIncome =
    calculateWeeklySalary(career, tierIndex);

  if (recordedNet === null) wallet.balance += Math.floor(weeklyIncome);
  else wallet.balance += recordedNet;

  // 2️⃣ Utgifter

  const baseExpense =
    Number(career?.economy?.weekly_expenses?.base || 0);

  const riskMod =
    Number(career?.economy?.weekly_expenses?.risk_modifier || 1);

  if (recordedNet === null) wallet.balance -= Math.floor(baseExpense * riskMod);

  // 3️⃣ Maintenance

  const minQuiz =
    Number(
      career?.world_logic?.maintenance?.min_quiz_per_weeks || 0
    );

  if (minQuiz > 0) {

    /** @type {number} */
    const done =
      Number(
        window.CivicationObligationEngine?.getQuizCountLastWeek?.(active.career_id) ?? 0
      );

    if (done < minQuiz) {

      const strikes =
        Number(stateView.strikes || 0) + 1;

      let stability = "STABLE";

      if (strikes === 1) stability = "WARNING";
      if (strikes >= 2) stability = "FIRED";

      window.CivicationState.setState({
        strikes,
        stability,
        lastMaintenanceFailAt: Date.now()
      });
    }
  }

  // 4️⃣ Layoff

  const layoffChance =
    Number(
      career?.economy?.risk?.layoff_chance_per_week || 0
    );

  if (layoffChance > 0 && Math.random() < layoffChance) {

    const prev = active;

    window.CivicationState.setActivePosition(null);

    window.CivicationState.setState({
      unemployed_since_week: thisWeek,
      unemployed_since_day_index: settlementDay
    });

    try {
      window.CivicationPsyche?.registerCollapse?.(
        prev?.career_id,
        "layoff"
      );
    } catch (e) {}

    stampSettledWeek();
    return;
  }

  // 5️⃣ Capital

  const capitalState =
    stateView?.economy?.capital || {};

  if (window.CAPITAL_ENGINE?.applyCareerCapital) {

    const updated =
      window.CAPITAL_ENGINE.applyCareerCapital(
        career,
        tierIndex,
        capitalState
      );

    window.CivicationState.setState({
      economy: { capital: updated }
    });
  }

  window.CivicationState.setState({
    unemployed_since_week: null,
    unemployed_since_day_index: null
  });

  stampSettledWeek();
}
  

/**
 * @param {CiviEconomyCareer | CiviEconomyRecord | null | undefined} career
 * @param {number} tierIndex
 * @returns {number}
 */
function calculateWeeklySalary(career, tierIndex) {

  const tier =
    (Number.isFinite(tierIndex) ? tierIndex : 0) + 1;

  let byTier = null;

  if (career &&
      career.economy &&
      career.economy.salary_by_tier) {

    byTier = career.economy.salary_by_tier;
  }

  let weekly = 0;

  if (byTier &&
      Object.prototype.hasOwnProperty.call(byTier, String(tier))) {

    weekly = Number(byTier[String(tier)]);

  } else if (byTier &&
             Object.prototype.hasOwnProperty.call(byTier, tier)) {

    weekly = Number(byTier[tier]);
  }

  if (!Number.isFinite(weekly)) {
    weekly = 0;
  }

  let rounding = "nearest";

  /** @type {CiviEconomyRecord} */
  const careersGlobalRules =
    /** @type {CiviEconomyRecord} */ (window.HG_CAREERS);

  if (careersGlobalRules &&
      careersGlobalRules.global_rules &&
      careersGlobalRules.global_rules.salary &&
      careersGlobalRules.global_rules.salary.rounding) {

    rounding =
      careersGlobalRules.global_rules.salary.rounding;
  }

  switch (rounding) {

    case "floor":
      weekly = Math.floor(weekly);
      break;

    case "ceil":
      weekly = Math.ceil(weekly);
      break;

    case "nearest":
    default:
      weekly = Math.round(weekly);
      break;
  }

  return weekly;
}

window.calculateWeeklySalary = calculateWeeklySalary;

function payWeeklySalary(player, career, tierIndex) {

  const weekly =
    calculateWeeklySalary(career, tierIndex);

  player.balance =
    (Number(player.balance) || 0) + weekly;

  return weekly;
}



/** @returns {CiviEconomyRecord} */
function getCapital() {

  return JSON.parse(
    localStorage.getItem("hg_capital_v1") || "{}"
  );
}



/** @param {CiviEconomyRecord} cap */
function saveCapital(cap) {

  localStorage.setItem(
    "hg_capital_v1",
    JSON.stringify(cap)
  );

  window.dispatchEvent(
    new Event("updateProfile")
  );
}


/**
 * @param {string} careerId
 * @param {number} points
 * @returns {number | null}
 */
function getWeeklySalaryFromBadges(careerId, points) {
  if (!Array.isArray(window.BADGES) || !Array.isArray(window.CIVI_CAREER_RULES)) {
    return null;
  }

  const badge = /** @type {CiviEconomyBadge | undefined} */ (window.BADGES.find(
    /** @param {CiviEconomyBadge} b */
    b => b.id === careerId
  ));
  if (!badge) return null;

  const { tierIndex } = deriveTierFromPoints(badge, points);
  if (!Number.isFinite(tierIndex)) return null;

  const rules = /** @type {CiviEconomyCareer | undefined} */ (window.CIVI_CAREER_RULES.find(
    /** @param {CiviEconomyCareer} c */
    c => c.career_id === careerId
  ));
  if (!rules || !rules.economy?.salary_by_tier) return null;

  // tierIndex er 0-basert → +1
  return rules.economy.salary_by_tier[String(tierIndex + 1)] ?? null;
}

  

/**
 * @param {CiviEconomyWallet | CiviEconomyRecord | null | undefined} w
 * @returns {CiviEconomyWallet}
 */
function normalizeWallet(w) {

    if (!w || typeof w !== "object") {
      return { balance: 0, last_tick_iso: null };
    }

    let balance = 0;

    if (Number.isFinite(Number(w.balance))) {
      balance = Number(w.balance);
    } else if (Number.isFinite(Number(w.pc))) {
      balance = Number(w.pc);
    }

    const out = Object.assign({}, w);
    out.balance = balance;
    out.last_tick_iso = w.last_tick_iso || null;

    return out;
  }

  
function qualifiesForCareer(player, career) {

  if (!career.required_badges) return true;

  return career.required_badges.every(function (req) {

    let tier = 0;

    if (player.badges &&
        Object.prototype.hasOwnProperty.call(player.badges, req.badge)) {

      tier = player.badges[req.badge];
    }

    return tier >= req.min_tier;
  });
}



/** @returns {CiviEconomyRecord} */
function readMeritsByCategorySafe() {
  try {
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
    return merits && typeof merits === "object" ? merits : {};
  } catch {
    return {};
  }
}

/** @returns {CiviEconomyRecord | null} */
function getHomeSnapshotSafe() {
  try {
    const snap = window.CivicationHome?.getHomeSnapshot?.();
    if (snap && typeof snap === "object") return snap;
  } catch {}
  try {
    const state = window.CivicationHome?.getState?.();
    return state && typeof state === "object" ? state : null;
  } catch {}
  return null;
}

/** @param {CiviEconomyRecord | null} home @returns {number} */
function getHomeRent(home) {
  const candidates = [
    home?.currentDistrict?.rent,
    home?.district?.rent,
    home?.home?.currentDistrict?.rent,
    home?.state?.currentDistrict?.rent,
    home?.state?.home?.currentDistrict?.rent,
    home?.state?.home?.rent,
    home?.rent,
    home?.lastRentAmount
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

/** @returns {string} */
function currentEconomyWeekKey() {
  try {
    if (typeof weekKey === "function") return String(weekKey(new Date()));
  } catch {}
  try {
    if (typeof window.weekKey === "function") return String(window.weekKey(new Date()));
  } catch {}
  return new Date().toISOString().slice(0, 10);
}

/** @param {string | null | undefined} iso @returns {string | null} */
function economyWeekKeyFromIso(iso) {
  if (!iso) return null;
  try {
    if (typeof weekKey === "function") return String(weekKey(new Date(iso)));
  } catch {}
  try {
    if (typeof window.weekKey === "function") return String(window.weekKey(new Date(iso)));
  } catch {}
  return null;
}

/** @param {number} balance @returns {CiviEconomyRecord} */
function getAffordabilitySnapshot(balance) {
  const base = {
    balance,
    canAffordVisiblePacksCount: null,
    cheapestVisiblePackPrice: null,
    cheapestVisiblePackId: null,
    canAffordCheapestVisiblePack: null,
    notes: []
  };
  try {
    const visible = window.HG_CiviShop?.getVisiblePacks?.();
    if (!Array.isArray(visible)) {
      base.notes.push("visible_packs_async_or_unavailable");
      return base;
    }
    let cheapest = null;
    let count = 0;
    for (const pack of visible) {
      if (!pack || typeof pack !== "object") continue;
      const price = Number(pack.price_pc ?? pack.price ?? pack.pc ?? pack.cost);
      if (!Number.isFinite(price)) continue;
      if (balance >= price) count += 1;
      if (!cheapest || price < cheapest.price) cheapest = { id: pack.id ?? pack.pack_id ?? null, price };
    }
    return {
      ...base,
      canAffordVisiblePacksCount: count,
      cheapestVisiblePackPrice: cheapest ? cheapest.price : null,
      cheapestVisiblePackId: cheapest ? cheapest.id : null,
      canAffordCheapestVisiblePack: cheapest ? balance >= cheapest.price : null,
      notes: base.notes
    };
  } catch {
    base.notes.push("visible_packs_async_or_unavailable");
    return base;
  }
}

/** @returns {CiviEconomyRecord} */
function getEconomySnapshot() {
  const warnings = [];
  let rawWallet = null;
  try { rawWallet = window.CivicationState?.getWallet?.() || null; } catch {}
  if (!rawWallet || typeof rawWallet !== "object") warnings.push("wallet_missing");
  const wallet = normalizeWallet(rawWallet || { balance: 0, last_tick_iso: null });
  const balance = Number(wallet.balance || 0);

  /** @type {CiviEconomyCareer | null} */
  let activePosition = null;
  try { activePosition = window.CivicationState?.getActivePosition?.() || null; } catch {}
  const careerId = String(activePosition?.career_id || "").trim();
  if (!careerId) warnings.push("no_active_position");

  /** @type {CiviEconomyCareer | null} */
  const career = careerId && Array.isArray(window.HG_CAREERS)
    ? (window.HG_CAREERS.find(c => c && String(/** @type {CiviEconomyCareer} */ (c).career_id) === careerId) || null)
    : null;
  if (careerId && !career) warnings.push("no_career_data");

  /** @type {CiviEconomyBadge | null} */
  const badge = careerId && Array.isArray(window.BADGES)
    ? (window.BADGES.find(b => b && String(b.id) === careerId) || null)
    : null;
  const merits = readMeritsByCategorySafe();
  const points = Number(merits?.[careerId]?.points || 0);
  let tierIndex = 0;
  try { tierIndex = badge ? Number(deriveTierFromPoints(badge, points).tierIndex || 0) : 0; } catch { tierIndex = 0; }
  const tierLabel = badge?.tiers?.[tierIndex]?.label || null;
  const weeklySalary = career ? calculateWeeklySalary(career, tierIndex) : 0;
  const baseExpense = Number(career?.economy?.weekly_expenses?.base || 0);
  const riskMod = Number(career?.economy?.weekly_expenses?.risk_modifier || 1);
  const weeklyJobExpenses = Number.isFinite(baseExpense * riskMod) ? baseExpense * riskMod : 0;
  const weeklyNetBeforeHome = weeklySalary - weeklyJobExpenses;
  const home = getHomeSnapshotSafe();
  const homeRent = getHomeRent(home);
  const estimatedNetAfterHome = weeklySalary - weeklyJobExpenses - homeRent;
  const lastTickIso = wallet.last_tick_iso || null;
  const gameDay = Number(window.CivicationCalendar?.getClock?.()?.dayIndex);
  const lastSettledDay = Number(wallet.last_tick_day_index);
  const hasGameWeek = Number.isSafeInteger(gameDay) && gameDay >= 1
    && Number.isSafeInteger(lastSettledDay) && lastSettledDay >= 1
    && lastSettledDay <= gameDay;
  const currentWeekKey = Number.isSafeInteger(gameDay) && gameDay >= 1
    ? "game-week-" + String(Math.floor((gameDay - 1) / 7) + 1)
    : null;
  const alreadyTickedThisWeek = hasGameWeek && gameDay - lastSettledDay < 7;
  const canTickNow = hasGameWeek && gameDay - lastSettledDay >= 7;
  if (alreadyTickedThisWeek) warnings.push("already_ticked_this_week");
  if (estimatedNetAfterHome < 0) warnings.push("negative_estimated_net");
  if (["pressure", "crisis"].includes(String(home?.housingPressure || home?.state?.home?.housingPressure || ""))) warnings.push("rent_pressure");

  return {
    wallet,
    activePosition,
    career,
    badge,
    merits,
    tierIndex,
    tierLabel,
    weeklySalary,
    weeklyJobExpenses,
    weeklyNetBeforeHome,
    home,
    homeRent,
    estimatedNetAfterHome,
    balance,
    lastTickIso,
    tickStatus: { lastTickIso, currentWeekKey, dayIndex: gameDay, lastSettledDay, alreadyTickedThisWeek, canTickNow },
    affordability: getAffordabilitySnapshot(balance),
    warnings
  };
}


  
window.CivicationEconomyEngine = {
  tickWeekly: tickPCIncomeWeekly,
  recordCompletedDay: recordCompletedGameDay,
  getEconomySnapshot
};

window.HG_CiviEconomySnapshot = getEconomySnapshot;

})();
