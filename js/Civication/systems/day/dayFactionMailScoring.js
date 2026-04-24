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

  function applyFactionPressure(mails) {
    if (!Array.isArray(mails)) return mails;

    return mails
      .map((mail) => {
        const pressure = getPressure(mail);
        if (!pressure) return mail;

        const nextBreakdown = {
          ...(mail._score_breakdown || {}),
          faction_pressure: pressure
        };

        const nextTotal = Number(mail._score_total || 0) + pressure;

        return {
          ...mail,
          _score_total: nextTotal,
          _score_breakdown: nextBreakdown,
          faction_pressure: pressure
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
