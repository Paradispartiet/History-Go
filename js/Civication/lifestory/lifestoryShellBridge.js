// js/Civication/lifestory/lifestoryShellBridge.js
//
// Life Story -> skallets psyke: énveis konsekvensbro.
// Når spilleren tar et valg i Min dag, skrives de faktiske meter-endringene
// (etter clamping i Player State) videre til skallets psyke-motor, slik at
// psyke-panelet og dashboardet speiler dagens valg.
//
// Broen er bevisst smal — kun målere med 1:1-semantikk i skallet broes:
//
//   Life Story-måler   ->  CivicationPsyche
//   integritet             updateIntegrity   (0..100, resiliens-dempet)
//   synlighet              updateVisibility  (0..100, resiliens-dempet)
//   handlingsrom           updateEconomicRoom (0..100, «buffer», IKKE PC-saldo)
//
// Bevisst IKKE broet (ingen gjetting, ingen dobbel økonomi):
//   - penger: skallets PC-saldo eies av økonomimotoren (ukesinntekt, butikk).
//     Life Story-penger er rollens egen skala. To kilder som skriver samme
//     saldo ville drifte fra hverandre.
//   - psyke/energi: skallets psyke er akser (integritet/synlighet/rom/
//     tillit), ikke én samlemåler. Ingen kanonisk motpart => ingen mapping.
//   - relasjoner: rollens personer (Kari, Amina, …) er fortellingspersoner,
//     ikke skallets people-system.
//
// Kontrakt:
//   - Énveis: leser ALDRI psyke tilbake inn i Player State.
//   - Testmodus skriver ALDRI (test er fullt isolert, jf. CLAUDE.md).
//   - Mangler psyke-motoren (ren Min dag-flate uten skall) => stille no-op.
//   - Dispatcher updateProfile én gang etter faktiske skriv, så skallets
//     paneler re-rendrer. Psyke-motoren dispatcher ingenting selv, og
//     render-sveipet skriver ingenting — ingen løkke.
//
// DOM-fri og dual-eksportert (window + module.exports) som resten av
// lifestory-kjernen, så den testes rett i Node med mocket psyke.

(function (globalScope) {
  "use strict";

  /** Life Story-måler -> metodenavn på CivicationPsyche. Kun 1:1-semantikk. */
  const METER_TO_PSYCHE = {
    integritet: "updateIntegrity",
    synlighet: "updateVisibility",
    handlingsrom: "updateEconomicRoom"
  };

  /**
   * Test-/debugøkter skal aldri skrive progresjon til skallet. Samme
   * signaler som skallet selv bruker (CivicationUI/CivicationTestModeUI).
   * @returns {boolean}
   */
  function isTestOrDebugSession() {
    const g = /** @type {any} */ (globalScope);
    try {
      if (g.CIVICATION_TEST_MODE === true || g.TEST_MODE === true || g.CiviTestMode === true) return true;
      if (g.localStorage?.getItem?.("civication_test_mode_v1") === "true") return true;
      const active = g.CivicationState?.getActivePosition?.();
      if (active && active.is_test_session === true) return true;
    } catch { /* blokkert lagring => behandle som vanlig økt */ }
    return false;
  }

  /**
   * Skriv Life Story-meterdeltaer til skallets psyke.
   * @param {Record<string, number>|null|undefined} meterDeltas
   *   Faktiske endringer fra ett valg (etter clamping), f.eks.
   *   { integritet: 5, energi: -4 }. Umappede målere ignoreres stille.
   * @returns {{ applied: Record<string, number>, skipped: string|null }}
   *   applied: det som faktisk ble skrevet. skipped: hvorfor ingenting ble
   *   skrevet ("test_mode" | "psyche_unavailable" | null).
   */
  function applyMeterDeltasToShell(meterDeltas) {
    const psyche = /** @type {any} */ (globalScope).CivicationPsyche;
    if (!psyche) return { applied: {}, skipped: "psyche_unavailable" };
    if (isTestOrDebugSession()) return { applied: {}, skipped: "test_mode" };

    /** @type {Record<string, number>} */
    const applied = {};
    for (const [meter, rawDelta] of Object.entries(meterDeltas || {})) {
      const method = METER_TO_PSYCHE[meter];
      if (!method || typeof psyche[method] !== "function") continue;
      const delta = Number(rawDelta);
      if (!Number.isFinite(delta) || delta === 0) continue;
      try {
        psyche[method](delta);
        applied[meter] = delta;
      } catch (error) {
        console.warn(`[CivicationLifestoryShellBridge] psyke-skriv feilet for ${meter}`, error);
      }
    }

    if (Object.keys(applied).length && typeof /** @type {any} */ (globalScope).dispatchEvent === "function" && typeof /** @type {any} */ (globalScope).Event === "function") {
      try { /** @type {any} */ (globalScope).dispatchEvent(new (/** @type {any} */ (globalScope).Event)("updateProfile")); } catch { /* uten event-miljø (Node) er skrivet fortsatt gjort */ }
    }
    return { applied, skipped: null };
  }

  const api = { METER_TO_PSYCHE, isTestOrDebugSession, applyMeterDeltasToShell };
  /** @type {any} */ (globalScope).CivicationLifestoryShellBridge = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
