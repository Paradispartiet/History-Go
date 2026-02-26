// ============================================================
// CIVICATION BOOT – single orchestrator
// ============================================================

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

    window.HG_CiviEngine =
      new CivicationEventEngine({
        packBasePath: "data/Civication",
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
    checkTierUpgrades();
  });

})();
