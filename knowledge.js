// Compatibility shim for older knowledge/knowledge_*.html pages.
// The real History Go knowledge engine is migrated to TypeScript and bundled by
// esbuild to dist/web/knowledge.js (publishes window.* knowledge globals).
(function () {
  "use strict";

  const script = document.currentScript;
  const current = script instanceof HTMLScriptElement ? script.src : "";
  const src = current
    ? new URL("dist/web/knowledge.js", current).toString()
    : "dist/web/knowledge.js";

  document.write(`<script src="${src}"><\/script>`);
})();
