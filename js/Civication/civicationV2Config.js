// js/Civication/civicationV2Config.js
//
// Civication — konfigurasjon og debug-bryter.
// Lastes som FØRSTE Civication-script på Civication.html.
//
// Regelen (docs/civication-life-story-system.md):
//   Civication-skallet (kart, dashboard, paneler, rolle/arbeidsdag …) er
//   hovedproduktet og lastes som standard. «Min dag» (Life Story) er
//   primærpanelet — ÉN modul i skallet, ikke hele appen.
//
// Bryteren under gjelder IKKE lenger om skallet lastes (det gjør det alltid).
// Den slår kun på ekstra legacy/debugpaneler. Det rike Canvas/WebGL-kartet
// er standard i normal runtime; ?civicationLite=1 eller test-mock gir lett fallback. Debug slås på eksplisitt:
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
