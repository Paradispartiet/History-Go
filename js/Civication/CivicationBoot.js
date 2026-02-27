// ============================================================
// CIVICATION BOOT – single orchestrator
// ============================================================

async function ensureCiviCareerRulesLoaded() {

  if (Array.isArray(window.CIVI_CAREER_RULES)) return;

  try {

    const data = await fetch(
        "data/Civication/hg_careers.json",
      { cache: "no-store" }
    ).then(r => r.json());

    window.CIVI_CAREER_RULES =
      Array.isArray(data?.careers)
        ? data.careers
        : [];

  } catch {

    window.CIVI_CAREER_RULES = [];

  }
}

window.ensureCiviCareerRulesLoaded = ensureCiviCareerRulesLoaded;

async function loadCivicationData() {
  const [badgesRes, careersRes] = await Promise.all([
    fetch("data/badges.json"),
    fetch("data/Civication/hg_careers.json")
  ]);

  const badgesJson = await badgesRes.json();
  const careersJson = await careersRes.json();

  window.BADGES = badgesJson.badges;
  window.HG_CAREERS = careersJson.careers;
}

(function () {

  async function start() {

    console.log("Civication boot start");

    await loadCivicationData();
    await ensureCiviCareerRulesLoaded();

    window.HG_CiviEngine =
      new CivicationEventEngine({
        packBasePath: "data/Civication/jobbmails",
        maxInbox: 1
      });

    if (window.CivicationEconomyEngine?.tickWeekly) {
      CivicationEconomyEngine.tickWeekly();
    }

    if (window.CivicationObligationEngine?.evaluate) {
      CivicationObligationEngine.evaluate();
    }

    window.CivicationUI?.init?.();

    window.HG_CiviEngine?.onAppOpen?.();

    window.dispatchEvent(new Event("civi:dataReady"));
    window.dispatchEvent(new Event("civi:booted"));
  }

  document.addEventListener("DOMContentLoaded", start);

  window.addEventListener("updateProfile", () => {
  if (typeof window.checkTierUpgrades === "function") {
    window.checkTierUpgrades();
  }
});

})();
