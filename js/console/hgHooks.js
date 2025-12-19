// js/console/hgHooks.js
(function () {
  const D = window.HG_DEVTOOLS;
  if (!D) return;

  window.addEventListener("error", (e) => {
    D.error("window.error:", e.message, e.filename, `line:${e.lineno}`, `col:${e.colno}`);
  });

  window.addEventListener("unhandledrejection", (e) => {
    D.error("unhandledrejection:", e.reason);
  });

  // Fetch hook (logger)
  const _fetch = window.fetch;
  window.fetch = async function (...args) {
    const t0 = performance.now();
    const url = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url);
    try {
      const res = await _fetch.apply(this, args);
      const dt = Math.round(performance.now() - t0);
      D.net("fetch", res.status, dt + "ms", url);
      return res;
    } catch (err) {
      const dt = Math.round(performance.now() - t0);
      D.error("fetch FAIL", dt + "ms", url, err);
      throw err;
    }
  };

  D.log("HG hooks active ✅");
})();
