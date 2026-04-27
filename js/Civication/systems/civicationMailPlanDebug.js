(function () {
  "use strict";

  async function inspect() {
    return window.CivicationMailRuntime?.inspect?.() || null;
  }

  async function candidates() {
    return await window.CivicationMailRuntime?.debugCandidates?.() || [];
  }

  window.CiviMailPlanDebug = {
    inspect,
    debugCandidates: candidates,
    simulate: candidates,
    simulateRepeated: candidates,
    simulateRepeatedAll: candidates,
    simulateArbeider: candidates,
    simulateFagarbeider: candidates,
    simulateMellomleder: candidates,
    simulateArbeiderRepeated: candidates,
    simulateFagarbeiderRepeated: candidates,
    simulateMellomlederRepeated: candidates
  };
})();
