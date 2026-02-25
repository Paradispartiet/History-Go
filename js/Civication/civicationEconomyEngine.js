/* ============================================================
   Civication Economy Engine v2
   - Ingen direkte localStorage
   - Kun CivicationState
   ============================================================ */

(function () {

  function tickWeekly() {

    const state = CivicationState.getState();
    const wallet = { ...state.economy.wallet };
    const active = state.role.active_position;
    const now = new Date();

    const lastIso = wallet.last_tick_iso;
    const lastWeek = lastIso ? weekKey(new Date(lastIso)) : null;
    const thisWeek = weekKey(now);

    if (lastWeek === thisWeek) return;

    const navAfterWeeks =
      Number(window.HG_CAREERS?.global_rules?.unemployment?.nav_after_weeks || 0);

    const navWeeklyPc =
      Number(window.HG_CAREERS?.global_rules?.unemployment?.nav_weekly_pc || 0);

    // =========================================================
    // ARBEIDSLEDIG
    // =========================================================

    if (!active?.career_id) {

      const sinceW = state.unemployed_since_week;

      if (!sinceW) {

        CivicationState.setState({
          unemployed_since_week: thisWeek
        });

        wallet.last_tick_iso = now.toISOString();
        CivicationState.updateWallet(wallet);
        return;
      }

      const weeksPassed =
        weeksPassedBetweenWeekKeys(sinceW, thisWeek);

      if (weeksPassed >= navAfterWeeks && navWeeklyPc > 0) {
        wallet.balance += Math.floor(navWeeklyPc);
      }

      wallet.last_tick_iso = now.toISOString();
      CivicationState.updateWallet(wallet);
      return;
    }

    // =========================================================
    // I JOBB
    // =========================================================

    const career =
      window.HG_CAREERS?.find(
        c => String(c.career_id) === String(active.career_id)
      );

    if (!career) {
      wallet.last_tick_iso = now.toISOString();
      CivicationState.updateWallet(wallet);
      return;
    }

    const merits =
      JSON.parse(localStorage.getItem("merits_by_category") || "{}");

    const points =
      Number(merits[active.career_id]?.points || 0);

    const badge =
      window.BADGES?.find(b => b.id === active.career_id);

    if (!badge) {
      wallet.last_tick_iso = now.toISOString();
      CivicationState.updateWallet(wallet);
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

    const weeklyExpense =
      Math.floor(baseExpense * riskMod);

    wallet.balance -= weeklyExpense;

    // --------------------------------------------------
    // Maintenance-krav
    // --------------------------------------------------

    const minQuiz =
      Number(
        career?.world_logic?.maintenance?.min_quiz_per_weeks || 0
      );

    if (minQuiz > 0) {

      const done =
        getQuizCountLastWeek(active.career_id);

      if (done < minQuiz) {

        let strikes =
          Number(state.strikes || 0) + 1;

        let stability =
          state.stability || "STABLE";

        if (strikes === 1) stability = "WARNING";
        else if (strikes >= 2) stability = "FIRED";

        CivicationState.setState({
          strikes,
          stability,
          lastMaintenanceFailAt: Date.now()
        });
      }
    }

    // --------------------------------------------------
    // Layoff-roll
    // --------------------------------------------------

    const layoffChance =
      Number(career?.economy?.risk?.layoff_chance_per_week || 0);

    const roll = Math.random();

    if (layoffChance > 0 && roll < layoffChance) {

      const prev = state.role.active_position;

      CivicationState.setState({
        role: { active_position: null },
        unemployed_since_week: thisWeek
      });

      if (window.CivicationPsyche?.registerCollapse) {
        window.CivicationPsyche.registerCollapse(
          prev?.career_id,
          "layoff"
        );
      }

      wallet.last_tick_iso = now.toISOString();
      CivicationState.updateWallet(wallet);
      return;
    }

    // --------------------------------------------------
    // Capital engine
    // --------------------------------------------------

    if (window.CAPITAL_ENGINE?.applyCareerCapital) {

      const capitalState =
        state.economy.capital || {};

      const updated =
        window.CAPITAL_ENGINE.applyCareerCapital(
          career,
          tierIndex,
          capitalState
        );

      CivicationState.setState({
        economy: {
          capital: updated
        }
      });
    }

    CivicationState.setState({
      unemployed_since_week: null
    });

    wallet.last_tick_iso = now.toISOString();
    CivicationState.updateWallet(wallet);
  }

  window.CivicationEconomyEngine = {
    tickWeekly
  };

})();
