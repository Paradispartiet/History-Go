// Compatibility shim for older knowledge/knowledge_*.html pages.
// The real History Go knowledge engine lives in js/knowledge.js.
(function () {
  "use strict";

  const script = document.currentScript;
  const current = script instanceof HTMLScriptElement ? script.src : "";
  const src = current
    ? new URL("js/knowledge.js", current).toString()
    : "js/knowledge.js";

  document.write(`<script src="${src}"><\/script>`);
})();
