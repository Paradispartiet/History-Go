(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function uniq(arr) {
    return Array.from(new Set((Array.isArray(arr) ? arr : []).map(normStr).filter(Boolean)));
  }

  function activeCareerId() {
    return normStr(window.CivicationState?.getActivePosition?.()?.career_id);
  }

  function activeRoleScope() {
    const active = window.CivicationState?.getActivePosition?.() || {};
    return normStr(window.CiviMailPlanBridge?.resolveRoleScope?.(active) || active.role_scope);
  }

  function mergeBranchState(delta) {
    const current = window.CivicationState?.getMailBranchState?.() || {
      preferred_types: [],
      preferred_families: [],
      flags: []
    };

    const next = {
      preferred_types: uniq([...(current.preferred_types || []), ...((delta && delta.preferred_types) || [])]).slice(-6),
      preferred_families: uniq([...(current.preferred_families || []), ...((delta && delta.preferred_families) || [])]).slice(-8),
      flags: uniq([...(current.flags || []), ...((delta && delta.flags) || [])]).slice(-16)
    };

    window.CivicationState?.setMailBranchState?.(next);
    return next;
  }

  function applyPsycheDelta(delta) {
    if (!delta) return null;

    const careerId = activeCareerId();

    if (Number(delta.integrity || 0)) {
      window.CivicationPsyche?.updateIntegrity?.(Number(delta.integrity || 0));
    }

    if (Number(delta.visibility || 0)) {
      window.CivicationPsyche?.updateVisibility?.(Number(delta.visibility || 0));
    }

    if (Number(delta.economicRoom || 0)) {
      window.CivicationPsyche?.updateEconomicRoom?.(Number(delta.economicRoom || 0));
    }

    if (careerId && Number(delta.trust || 0)) {
      window.CivicationPsyche?.updateTrust?.(careerId, Number(delta.trust || 0));
    }

    return delta;
  }

  function applyChoiceConsequences(ctx) {
    const { eventObj, choice, result } = ctx;

    if (activeRoleScope() !== "mellomleder") return null;

    mergeBranchState({ flags: [normStr(eventObj?.mail_family)] });
    applyPsycheDelta({ integrity: Number(choice?.effect || 0) });

    window.dispatchEvent(new Event("updateProfile"));
    return true;
  }

  function register() {
    if (!window.CivicationChoiceDirector) return;

    window.CivicationChoiceDirector.registerHandler(
      "dayConsequences",
      applyChoiceConsequences,
      10
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }
})();
