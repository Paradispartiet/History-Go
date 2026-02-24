// ============================================================
// CIVICATION BOOT – single orchestrator
// ============================================================
async function loadCivicationData() {
  const [badgesRes, careersRes] = await Promise.all([
    fetch("/History-Go/data/badges.json"),
    fetch("/History-Go/data/hg_careers.json")
  ]);

  const badgesJson = await badgesRes.json();
  const careersJson = await careersRes.json();

  window.BADGES = badgesJson.badges;
  window.HG_CAREERS = careersJson.careers;
}


(function(){

  function start() {
    console.log("Civication boot start");

    // 1. UI
    window.CivicationUI?.init?.();

    // 2. Engine warmup (hvis finnes)
    window.HG_CiviEngine?.onAppOpen?.();

    // 3. Signal at system er klart
    window.dispatchEvent(new Event("civi:booted"));
  }

  document.addEventListener("DOMContentLoaded", start);

  document.addEventListener("DOMContentLoaded", async () => {
  console.log("Civication boot start");

  await loadCivicationData();

  window.dispatchEvent(new Event("civi:dataReady"));
});

})();
