// ============================================================
// CIVICATION BOOT – single orchestrator (correct order)
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

    // 1. Load data FIRST
    await loadCivicationData();

    // 2. Init UI after data exists
    window.CivicationUI?.init?.();

    // 3. Warm engine after data exists
    window.HG_CiviEngine?.onAppOpen?.();

    // 4. Signal system ready
    window.dispatchEvent(new Event("civi:dataReady"));
    window.dispatchEvent(new Event("civi:booted"));
  }

  document.addEventListener("DOMContentLoaded", start);

})();
