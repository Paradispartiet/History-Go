// js/Civication/systems/civicationMailDirectorV2ForceRoleMail.js
// Gir manuell testvei for V2-rollemail utenfor morning-fasen.
// Vanlig spillflyt påvirkes ikke: patchen aktiveres bare når
// enqueueNext(..., { allowNonMorningRoleMail: true }) brukes.

(function () {
  "use strict";

  function patch() {
    const director = window.CivicationMailDirectorV2;
    const calendar = window.CivicationCalendar;

    if (!director || typeof director.enqueueNext !== "function") return false;
    if (!calendar || typeof calendar.getPhase !== "function") return false;
    if (director.__forceRoleMailPatchApplied) return true;

    const original = director.enqueueNext.bind(director);

    director.enqueueNext = async function forceRoleMailEnqueueNext(engine, opts = {}) {
      if (opts?.allowNonMorningRoleMail !== true) {
        return original(engine, opts);
      }

      const originalGetPhase = calendar.getPhase;
      calendar.getPhase = function () {
        return "morning";
      };

      try {
        return await original(engine, opts);
      } finally {
        calendar.getPhase = originalGetPhase;
      }
    };

    director.__forceRoleMailPatchApplied = true;
    return true;
  }

  function boot() {
    patch();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:booted", boot);
  window.addEventListener("civi:dataReady", boot);

  window.CivicationMailDirectorV2ForceRoleMail = {
    patch
  };
})();
