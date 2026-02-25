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

// -------- load careers and THEN start engine --------
fetch("data/Civication/hg_careers.json")
  .then(function (r) {
    if (!r.ok) {
      throw new Error("Failed to load careers");
    }
    return r.json();
  })
  .then(function (data) {

    window.HG_CAREERS = data;



(function () {

  async function start() {
  console.log("Civication boot start");

  // 1️⃣ Load data FIRST
  await loadCivicationData();

  // 2️⃣ Instantiate Event Engine
  window.HG_CiviEngine =
    new CivicationEventEngine({
      packBasePath: "data/Civication",
      maxInbox: 1
    });

  // 3️⃣ Weekly økonomi
  if (window.CivicationEconomyEngine?.tickWeekly) {
    CivicationEconomyEngine.tickWeekly();
  }

  // 4️⃣ Evaluer kontrakter
  if (window.CivicationObligationEngine?.evaluate) {
    CivicationObligationEngine.evaluate();
  }

  // 5️⃣ Init UI after data exists
  window.CivicationUI?.init?.();

  // 6️⃣ Warm engine after data exists
  window.HG_CiviEngine?.onAppOpen?.();

  // 7️⃣ Signal system ready
  window.dispatchEvent(new Event("civi:dataReady"));
  window.dispatchEvent(new Event("civi:booted"));
}

  document.addEventListener("DOMContentLoaded", start);

window.addEventListener("updateProfile", () => {
  checkTierUpgrades();
});
  
})();
