// @ts-nocheck
// js/startup-guard.js
// Early History Go boot guard. Loaded from config.js before app.js.
(function () {
  "use strict";
  if (window.__HG_STARTUP_GUARD_INSTALLED__) return;
  window.__HG_STARTUP_GUARD_INSTALLED__ = true;

  const SCRIPT_TIMEOUT_MS = 8000;
  const FETCH_TIMEOUT_MS = 8000;
  const STARTUP_DIAGNOSTIC_MS = 22000;
  const deferredScripts = [];
  const trace = window.__HG_BOOT_TRACE__ = window.__HG_BOOT_TRACE__ || { startedAt: Date.now(), pendingScript: null, deferred: [], timeouts: [] };

  function normalizeUrl(value) {
    try { return new URL(String(value || ""), document.baseURI); } catch { return null; }
  }

  const nativeFetch = typeof window.fetch === "function" ? window.fetch.bind(window) : null;
  if (nativeFetch && typeof AbortController === "function") {
    window.fetch = function boundedHistoryGoFetch(input, init = {}) {
      const requestUrl = normalizeUrl(typeof input === "string" ? input : input?.url);
      const suppliedSignal = init?.signal || input?.signal;
      if (!requestUrl || requestUrl.origin !== location.origin || suppliedSignal) return nativeFetch(input, init);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      return nativeFetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
    };
  }

  const NON_CRITICAL_PATTERNS = [
    "/js/debug/HGRuntimeHealth.js",
    "/js/debug/HGRuntimeSmokeRunner.js",
    "/js/debug/HGRuntimeHealthPanel.js",
    "/js/social/",
    "/js/today/",
    "/js/objectives/HGDailyObjectives.js",
    "/js/progress/HGDailyProgress",
    "/js/integrations/aha-music.js",
    "/js/caravan-",
    "/js/ui/caravan-panel.js"
  ];

  function isNonCriticalScript(script) {
    const url = normalizeUrl(script?.src);
    if (!url || url.origin !== location.origin) return false;
    return NON_CRITICAL_PATTERNS.some((pattern) => url.pathname.includes(pattern));
  }

  const nativeAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function guardedAppendChild(node) {
    const isHeadScript = this === document.head && node?.tagName === "SCRIPT" && node.src;
    if (!isHeadScript) return nativeAppendChild.call(this, node);

    const url = normalizeUrl(node.src);
    const label = url ? url.pathname : String(node.src || "");

    if (window.__HG_APP_READY__ !== true && isNonCriticalScript(node)) {
      node.dataset.hgDeferredBoot = "1";
      node.async = false;
      deferredScripts.push(node);
      trace.deferred.push(label);
      queueMicrotask(() => {
        try {
          if (typeof node.onload === "function") node.onload(new Event("load"));
          else node.dispatchEvent(new Event("load"));
        } catch (error) {
          console.warn("[startup-guard] deferred script resolve failed", label, error);
        }
      });
      return node;
    }

    trace.pendingScript = label;
    let settled = false;
    let timer = null;
    const finish = () => {
      settled = true;
      node.dataset.hgLoaded = "1";
      if (trace.pendingScript === label) trace.pendingScript = null;
      if (timer) clearTimeout(timer);
    };
    node.addEventListener("load", finish, { once: true });
    node.addEventListener("error", finish, { once: true });
    timer = setTimeout(() => {
      if (settled) return;
      trace.timeouts.push({ type: "script", url: label, ts: Date.now() });
      try { node.dispatchEvent(new Event("error")); } catch {}
    }, SCRIPT_TIMEOUT_MS);
    return nativeAppendChild.call(this, node);
  };

  function scheduleIdle(task) {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(task, { timeout: 1000 });
    } else {
      setTimeout(task, 32);
    }
  }

  function flushDeferredScripts() {
    const scripts = deferredScripts.splice(0);
    trace.deferredFlushStartedAt = Date.now();
    trace.deferredFlushCount = scripts.length;

    const loadNext = (index) => {
      if (index >= scripts.length) {
        trace.deferredFlushFinishedAt = Date.now();
        return;
      }

      scheduleIdle(() => {
        const script = scripts[index];
        const label = normalizeUrl(script?.src)?.pathname || String(script?.src || "");
        let advanced = false;
        let fallbackTimer = null;
        const advance = () => {
          if (advanced) return;
          advanced = true;
          if (fallbackTimer) clearTimeout(fallbackTimer);
          scheduleIdle(() => loadNext(index + 1));
        };

        try {
          script.dataset.hgDeferredBoot = "0";
          script.addEventListener("load", advance, { once: true });
          script.addEventListener("error", advance, { once: true });
          fallbackTimer = setTimeout(() => {
            trace.timeouts.push({ type: "deferred-script", url: label, ts: Date.now() });
            advance();
          }, SCRIPT_TIMEOUT_MS);
          nativeAppendChild.call(document.head, script);
        } catch (error) {
          console.warn("[startup-guard] deferred script load failed", script.src, error);
          advance();
        }
      });
    };

    loadNext(0);
  }

  function recordSlowStartup() {
    if (window.__HG_APP_READY__ === true || document.body?.classList.contains("hg-loaded")) return;
    trace.slowAt = Date.now();
    trace.slowPendingScript = trace.pendingScript;
    console.warn("[startup-guard] treg oppstart; lar appen fortsette", {
      pendingScript: trace.pendingScript,
      timeouts: trace.timeouts.slice(-5),
      deferredCount: deferredScripts.length
    });
  }

  window.addEventListener("hg:appReady", () => {
    trace.readyAt = Date.now();
    document.getElementById("hgStartupGuardFailure")?.remove();
    document.body?.classList.remove("hg-load-failed", "hg-startup-timeout");
    flushDeferredScripts();
  }, { once: true });

  const armDiagnostic = () => setTimeout(recordSlowStartup, STARTUP_DIAGNOSTIC_MS);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", armDiagnostic, { once: true });
  else armDiagnostic();
})();
