// @ts-nocheck
// Legacy compatibility shim.
//
// Startup recovery used to monkey-patch window.fetch and Node.prototype.appendChild.
// Those global patches changed normal Safari loading semantics and could themselves
// stall History Go. Production boot no longer loads this file from config.js, but
// keep a harmless shim for clients that still have an older cached config.js.
(function () {
  "use strict";
  if (window.__HG_STARTUP_GUARD_INSTALLED__) return;
  window.__HG_STARTUP_GUARD_INSTALLED__ = true;
  window.__HG_BOOT_TRACE__ = window.__HG_BOOT_TRACE__ || { startedAt: Date.now(), legacyGuardDisabled: true };
})();
