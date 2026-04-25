(function () {
  "use strict";

  const FACTION_FAMILIES = {
    industri: [
      "mellomleder_planlegging",
      "driftskrise",
      "mellomleder_mastery",
      "industri_og_systembygging",
      "teknologi_og_risiko",
      "kvalitet_og_standarder",
      "modernisering_og_marked",
      "handel_og_lokal_produksjon"
    ],
    kontroll: [
      "rapportering_og_styring",
      "administrasjon_og_hverdagsmakt",
      "krysspress",
      "mellomleder_mastery"
    ],
    institusjon: [
      "institusjonell_krise",
      "bedrift_og_symbolsk_kapital",
      "mellomleder_identitet",
      "krysspress",
      "rapportering_og_styring"
    ],
    menneske: [
      "mellomleder_identitet",
      "administrasjon_og_hverdagsmakt",
      "institusjonell_krise",
      "kvalitet_og_standarder"
    ]
  };

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
    const preferred = FACTION_FAMILIES[faction] || [];

    if (preferred.includes(family)) return 20;
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

  window.CivicationFactionMailScoring = {
    applyFactionPressure,
    factionMatchScore,
    FACTION_FAMILIES
  };
})();
