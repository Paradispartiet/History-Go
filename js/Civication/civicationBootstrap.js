/* ============================================================
   Civication Bootstrap
   - Starter hele Civication-systemet
   - Kobler motorene sammen
   ============================================================ */

(function () {

  async function startCivication() {

    try {

      // 1️⃣ Last careers
      const res = await fetch("/data/Civication/hg_careers.json");
      if (!res.ok) {
        throw new Error("Failed to load careers");
      }

      const data = await res.json();
      window.HG_CAREERS = data;

      // 2️⃣ Instansier Event Engine
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

      // 5️⃣ Kjør event-syklus
      if (window.HG_CiviEngine?.onAppOpen) {
        window.HG_CiviEngine.onAppOpen();
      }

      // 6️⃣ Tier upgrades
      if (typeof window.checkTierUpgrades === "function") {
        window.checkTierUpgrades();
      }

    } catch (e) {
      console.error("Civication bootstrap error:", e);
    }

  }

  // Start når DOM er klar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startCivication);
  } else {
    startCivication();
  }

})();
