// js/Civication/civicationLegacyLoader.js
//
// Bakoverkompatibel wrapper for gammelt navn. Produkt-skallet lastes nå av
// civicationShellLoader.js; «legacy» betyr bare eksplisitt full debug når
// Civication.html?civicationLegacy=1 er satt.

(function (globalScope) {
  "use strict";

  if (typeof module !== "undefined" && module.exports) {
    module.exports = require("./civicationShellLoader.js");
    return;
  }

  if (/** @type {any} */ (globalScope).CivicationShellLoader) {
    /** @type {any} */ (globalScope).CivicationLegacyLoader = /** @type {any} */ (globalScope).CivicationShellLoader;
    return;
  }

  const doc = /** @type {any} */ (globalScope).document;
  if (!doc) return;
  const script = doc.createElement("script");
  script.src = "js/Civication/civicationShellLoader.js";
  script.async = false;
  doc.body.appendChild(script);
})(typeof window !== "undefined" ? window : globalThis);
