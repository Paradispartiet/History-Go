(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function listify(arr) {
    return Array.isArray(arr) ? arr.map(normStr).filter(Boolean) : [];
  }

  function getAllianceState() {
    const api = window.CivicationAllianceSystem;
    if (!api || typeof api.getState !== "function") {
      return { allies: [], enemies: [], tensions: [] };
    }
    const state = api.getState() || {};
    return {
      allies: Array.isArray(state.allies) ? state.allies : [],
      enemies: Array.isArray(state.enemies) ? state.enemies : [],
      tensions: Array.isArray(state.tensions) ? state.tensions : []
    };
  }

  function scoreRow(row, mail) {
    const rowId = normStr(row?.id);
    const peopleRef = normStr(mail?.people_ref);
    const family = normStr(mail?.mail_family);
    const type = normStr(mail?.mail_type);
    const focusFamilies = listify(row?.focus_families);
    const trust = Number(row?.trust_score || 0);

    let score = 0;

    if (peopleRef && rowId && peopleRef === rowId) score += 18;
    if (family && focusFamilies.includes(family)) score += 12;

    if (type === "people" && peopleRef && rowId && peopleRef === rowId) score += 8;
    if (type === "story" && Math.abs(trust) >= 3) score += 5;

    return score;
  }

  function scoreAllianceForMail(mail) {
    const state = getAllianceState();
    const family = normStr(mail?.mail_family);
    const type = normStr(mail?.mail_type);

    let score = 0;

    state.allies.forEach((ally) => {
      score += scoreRow(ally, mail);
      if (family === "sliten_nokkelperson") score += 3;
      if (family === "mellomleder_identitet") score += 4;
      if (type === "people") score += 2;
    });

    state.enemies.forEach((enemy) => {
      score += scoreRow(enemy, mail);
      if (family === "krysspress") score += 8;
      if (family === "driftskrise") score += 5;
      if (type === "conflict") score += 6;
    });

    state.tensions.forEach((tension) => {
      score += Math.round(scoreRow(tension, mail) * 0.5);
      if (family === "mellomleder_planlegging") score += 2;
      if (type === "story") score += 2;
    });

    return score;
  }

  function applyAllianceScoring(mails) {
    if (!Array.isArray(mails) || !mails.length) return mails;

    return mails
      .map((mail) => {
        const allianceScore = scoreAllianceForMail(mail);
        const nextBreakdown = {
          ...(mail._score_breakdown || {}),
          alliances: allianceScore
        };
        const nextTotal = Number(mail._score_total || 0) + allianceScore;

        return {
          ...mail,
          _score_total: nextTotal,
          _score_breakdown: nextBreakdown,
          alliance_score: allianceScore
        };
      })
      .sort((a, b) => Number(b._score_total || 0) - Number(a._score_total || 0));
  }

  function patchMailPlanBridge() {
    const bridge = window.CiviMailPlanBridge;
    if (!bridge || typeof bridge.makeCandidateMailsForActiveRole !== "function") return false;
    if (bridge.__allianceMailScoringPatched) return true;

    const original = bridge.makeCandidateMailsForActiveRole.bind(bridge);

    bridge.makeCandidateMailsForActiveRole = async function patchedMakeCandidateMailsForActiveRole(active, state) {
      const mails = await original(active, state);
      return applyAllianceScoring(mails);
    };

    bridge.__allianceMailScoringPatched = true;
    return true;
  }

  if (!patchMailPlanBridge()) {
    document.addEventListener("DOMContentLoaded", patchMailPlanBridge, { once: true });
  }

  window.CivicationAllianceMailScoring = {
    applyAllianceScoring,
    scoreAllianceForMail,
    patchMailPlanBridge
  };
})();
