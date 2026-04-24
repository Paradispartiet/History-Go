(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function getPressure(mail) {
    const api = window.CivicationFactionConflictSystem;
    if (!api || typeof api.getPressureForFamily !== "function") return 0;
    return api.getPressureForFamily(normStr(mail?.mail_family));
  }

  function getActiveFaction() {
    const state = window.CivicationState?.getState?.() || {};
    return normStr(state?.activeFaction);
  }

  function factionMatchScore(mail) {
    const faction = getActiveFaction();
    if (!faction) return 0;

    const family = normStr(mail?.mail_family);

    if (faction === "industri" && ["mellomleder_planlegging","driftskrise","sliten_nokkelperson"].includes(family)) return 20;
    if (faction === "kontroll" && ["krysspress","mellomleder_mastery"].includes(family)) return 20;
    if (faction === "institusjon" && ["mellomleder_identitet","krysspress"].includes(family)) return 20;
    if (faction === "menneske" && ["sliten_nokkelperson","mellomleder_identitet"].includes(family)) return 20;

    return -10;
  }

  function applyFactionPressure(mails) {
    if (!Array.isArray(mails)) return mails;

    return mails
      .map((mail) => {
        const pressure = getPressure(mail);
        const factionScore = factionMatchScore(mail);

        const totalAdd = pressure + factionScore;

        if (!totalAdd) return mail;

        const nextBreakdown = {
          ...(mail._score_breakdown || {}),
          faction_pressure: pressure,
          faction_alignment: factionScore
        };

        const nextTotal = Number(mail._score_total || 0) + totalAdd;

        return {
          ...mail,
          _score_total: nextTotal,
          _score_breakdown: nextBreakdown
        };
      })
      .sort((a, b) => Number(b._score_total || 0) - Number(a._score_total || 0));
  }

  function patch() {
    const bridge = window.CiviMailPlanBridge;
    if (!bridge || typeof bridge.makeCandidateMailsForActiveRole !== "function") return;
    if (bridge.__factionPressurePatched) return;

    const original = bridge.makeCandidateMailsForActiveRole.bind(bridge);

    bridge.makeCandidateMailsForActiveRole = async function (active, state) {
      const mails = await original(active, state);
      return applyFactionPressure(mails);
    };

    bridge.__factionPressurePatched = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patch, { once: true });
  } else {
    patch();
  }
})();
