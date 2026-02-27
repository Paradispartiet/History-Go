function checkTierUpgrades() {

    const merits =
      JSON.parse(
        localStorage.getItem("merits_by_category") || "{}"
      );

    const tierState =
      JSON.parse(
        localStorage.getItem("hg_badge_tiers_v1") || "{}"
      );

    const newTierState = Object.assign({}, tierState);

    const offers = [];

    const badges =
      Array.isArray(window.BADGES)
        ? window.BADGES
        : [];

    for (let i = 0; i < badges.length; i++) {

      const badge = badges[i];

      const points =
        Number(
          (merits[badge.id] &&
           merits[badge.id].points) || 0
        );

      const tierData =
        deriveTierFromPoints(badge, points);

      const tierIndex = tierData.tierIndex;
      const label = tierData.label;

      const previousTier =
        Number(tierState[badge.id] || -1);

      if (tierIndex > previousTier) {

        let career = null;

        if (Array.isArray(window.HG_CAREERS)) {
          for (let j = 0; j < window.HG_CAREERS.length; j++) {
            const c = window.HG_CAREERS[j];
            if (String(c.career_id) === String(badge.id)) {
              career = c;
              break;
            }
          }
        }

        if (career) {
  const tiers = Array.isArray(badge?.tiers) ? badge.tiers : [];

  // robust: push tilbud for alle nivåer du passerer
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
    }

    localStorage.setItem(
      "hg_badge_tiers_v1",
      JSON.stringify(newTierState)
    );

    if (offers.length &&
        typeof setJobOffers === "function") {
      setJobOffers(offers);
    }
  }

window.checkTierUpgrades = checkTierUpgrades;



(function () {

  function tickPCIncomeWeekly() {

  const state = window.CivicationState.getState();
  let wallet = normalizeWallet(
    window.CivicationState.getWallet()
  );

  const active =
    window.CivicationState.getActivePosition();

  const now = new Date();

  const lastIso = wallet.last_tick_iso;
  const lastWeek = lastIso
    ? weekKey(new Date(lastIso))
    : null;

  const thisWeek = weekKey(now);

  if (lastWeek === thisWeek) return;

  // =========================================================
  // GLOBAL RULES (hent fra CIVI_CAREER_RULES hvis tilgjengelig)
  // =========================================================

  let navAfterWeeks = 0;
  let navWeeklyPc = 0;

  if (Array.isArray(window.CIVI_CAREER_RULES)) {
    const any = window.CIVI_CAREER_RULES[0];
    navAfterWeeks =
      Number(any?.global_rules?.unemployment?.nav_after_weeks || 0);
    navWeeklyPc =
      Number(any?.global_rules?.unemployment?.nav_weekly_pc || 0);
  }

  // =========================================================
  // ARBEIDSLEDIG
  // =========================================================

  if (!active?.career_id) {

    const sinceW = state.unemployed_since_week;

    if (!sinceW) {

      window.CivicationState.setState({
        unemployed_since_week: thisWeek
      });

      wallet.last_tick_iso = now.toISOString();
      window.CivicationState.updateWallet(wallet);
      return;
    }

    const weeksPassed =
      weeksPassedBetweenWeekKeys(sinceW, thisWeek);

    if (weeksPassed >= navAfterWeeks && navWeeklyPc > 0) {
      wallet.balance += Math.floor(navWeeklyPc);
    }

    wallet.last_tick_iso = now.toISOString();
    window.CivicationState.updateWallet(wallet);
    return;
  }

  // =========================================================
  // I JOBB
  // =========================================================

  const career =
    Array.isArray(window.HG_CAREERS)
      ? window.HG_CAREERS.find(
          c => String(c.career_id) === String(active.career_id)
        )
      : null;

  if (!career) {
    wallet.last_tick_iso = now.toISOString();
    window.CivicationState.updateWallet(wallet);
    return;
  }

  const merits =
    JSON.parse(
      localStorage.getItem("merits_by_category") || "{}"
    );

  const points =
    Number(merits[active.career_id]?.points || 0);

  const badge =
    window.BADGES?.find(
      b => b.id === active.career_id
    );

  if (!badge) {
    wallet.last_tick_iso = now.toISOString();
    window.CivicationState.updateWallet(wallet);
    return;
  }

  const { tierIndex } =
    deriveTierFromPoints(badge, points);

  // 1️⃣ Lønn

  const weeklyIncome =
    calculateWeeklySalary(career, tierIndex);

  wallet.balance += Math.floor(weeklyIncome);

  // 2️⃣ Utgifter

  const baseExpense =
    Number(career?.economy?.weekly_expenses?.base || 0);

  const riskMod =
    Number(career?.economy?.weekly_expenses?.risk_modifier || 1);

  wallet.balance -= Math.floor(baseExpense * riskMod);

  // 3️⃣ Maintenance

  const minQuiz =
    Number(
      career?.world_logic?.maintenance?.min_quiz_per_weeks || 0
    );

  if (minQuiz > 0) {

    const done =
      getQuizCountLastWeek(active.career_id);

    if (done < minQuiz) {

      const strikes =
        Number(state.strikes || 0) + 1;

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
      unemployed_since_week: thisWeek
    });

    try {
      window.CivicationPsyche?.registerCollapse?.(
        prev?.career_id,
        "layoff"
      );
    } catch (e) {}

    wallet.last_tick_iso = now.toISOString();
    window.CivicationState.updateWallet(wallet);
    return;
  }

  // 5️⃣ Capital

  const capitalState =
    state?.economy?.capital || {};

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
    unemployed_since_week: null
  });

  wallet.last_tick_iso = now.toISOString();
  window.CivicationState.updateWallet(wallet);
}
  

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

  if (window.HG_CAREERS &&
      window.HG_CAREERS.global_rules &&
      window.HG_CAREERS.global_rules.salary &&
      window.HG_CAREERS.global_rules.salary.rounding) {

    rounding =
      window.HG_CAREERS.global_rules.salary.rounding;
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



function getCapital() {

  return JSON.parse(
    localStorage.getItem("hg_capital_v1") || "{}"
  );
}



function saveCapital(cap) {

  localStorage.setItem(
    "hg_capital_v1",
    JSON.stringify(cap)
  );

  window.dispatchEvent(
    new Event("updateProfile")
  );
}


function getWeeklySalaryFromBadges(careerId, points) {
  if (!Array.isArray(window.BADGES) || !Array.isArray(window.CIVI_CAREER_RULES)) {
    return null;
  }

  const badge = window.BADGES.find(b => b.id === careerId);
  if (!badge) return null;

  const { tierIndex } = deriveTierFromPoints(badge, points);
  if (!Number.isFinite(tierIndex)) return null;

  const rules = window.CIVI_CAREER_RULES.find(c => c.career_id === careerId);
  if (!rules || !rules.economy?.salary_by_tier) return null;

  // tierIndex er 0-basert → +1
  return rules.economy.salary_by_tier[String(tierIndex + 1)] ?? null;
}

  

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


  
window.CivicationEconomyEngine = {
  tickWeekly: tickPCIncomeWeekly
};

})();
