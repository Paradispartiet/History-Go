// js/Civication/civicationV2Config.js
//
// Civication v2 — konfigurasjon og legacy-bryter.
// Lastes som FØRSTE Civication-script på Civication.html og avgjør om det
// gamle motormaskineriet (mailmotorer, next-action, workday-runtime,
// day progression osv.) i det hele tatt skal lastes.
//
// Regelen (docs/civication-life-story-system.md):
//   Civication v2 = Life Story System er primær spillflyt.
//   Civication v1 = legacy. Lastes KUN når legacy-flagget eksplisitt er på.
//
// Legacy slås på eksplisitt, aldri implisitt:
//   - URL:          Civication.html?civicationLegacy=1
//   - localStorage: civication_legacy_enabled = "1"
//   - konsoll:      CivicationV2Config.enableLegacy() + reload

(function (globalScope) {
  "use strict";

  const LEGACY_FLAG_STORAGE_KEY = "civication_legacy_enabled";
  const LEGACY_URL_PARAM = "civicationLegacy";

  /** @returns {boolean} */
  function resolveLegacyEnabled() {
    const g = /** @type {any} */ (globalScope);
    try {
      if (typeof g.location !== "undefined" && g.location.search) {
        const params = new URLSearchParams(g.location.search);
        const raw = params.get(LEGACY_URL_PARAM);
        if (raw === "1" || raw === "true") return true;
        if (raw === "0" || raw === "false") return false;
      }
      if (typeof g.localStorage !== "undefined") {
        return g.localStorage.getItem(LEGACY_FLAG_STORAGE_KEY) === "1";
      }
    } catch {
      /* blokkert lagring => v2 uten legacy */
    }
    return false;
  }

  /** @returns {boolean} */
  function isLegacyEnabled() {
    return /** @type {any} */ (globalScope).CIVICATION_LEGACY_ENABLED === true;
  }

  /** Skru på legacy for neste sidelast (persistert). */
  function enableLegacy() {
    try { /** @type {any} */ (globalScope).localStorage?.setItem(LEGACY_FLAG_STORAGE_KEY, "1"); } catch { /* uten lagring gjelder kun URL-param */ }
  }

  /** Tilbake til ren v2. */
  function disableLegacy() {
    try { /** @type {any} */ (globalScope).localStorage?.removeItem(LEGACY_FLAG_STORAGE_KEY); } catch { /* uten lagring gjelder kun URL-param */ }
  }

  /** @type {any} */ (globalScope).CIVICATION_LEGACY_ENABLED = resolveLegacyEnabled();

  const api = { LEGACY_FLAG_STORAGE_KEY, LEGACY_URL_PARAM, resolveLegacyEnabled, isLegacyEnabled, enableLegacy, disableLegacy };
  /** @type {any} */ (globalScope).CivicationV2Config = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
