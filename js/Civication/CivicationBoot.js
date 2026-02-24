// ============================================================
// CIVICATION BOOT – single orchestrator
// ============================================================

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

})();
