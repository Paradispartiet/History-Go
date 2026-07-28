// @ts-nocheck
// js/startup-guard.js
// Early History Go boot guard. Loaded from config.js before app.js.
(function () {
  "use strict";
  if (window.__HG_STARTUP_GUARD_INSTALLED__) return;
  window.__HG_STARTUP_GUARD_INSTALLED__ = true;

  const SCRIPT_TIMEOUT_MS = 8000;
  const FETCH_TIMEOUT_MS = 8000;
  const STARTUP_DEADLINE_MS = 22000;
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

  function flushDeferredScripts() {
    const scripts = deferredScripts.splice(0);
    for (const script of scripts) {
      try {
        script.dataset.hgDeferredBoot = "0";
        nativeAppendChild.call(document.head, script);
      } catch (error) {
        console.warn("[startup-guard] deferred script load failed", script.src, error);
      }
    }
  }

  function showStartupFailure() {
    const body = document.body;
    if (!body || body.classList.contains("hg-loaded")) return;
    body.classList.add("hg-loaded", "hg-load-failed", "hg-startup-timeout");
    window.__HG_APP_READY__ = false;
    if (document.getElementById("hgStartupGuardFailure")) return;
    const panel = document.createElement("div");
    panel.id = "hgStartupGuardFailure";
    panel.setAttribute("role", "alert");
    panel.style.cssText = ["position:fixed","left:50%","top:50%","transform:translate(-50%,-50%)","z-index:2147483647","width:min(460px,calc(100vw - 28px))","box-sizing:border-box","padding:18px","border:1px solid rgba(255,255,255,.25)","border-radius:16px","background:rgba(5,8,13,.97)","color:#fff","font:600 14px/1.4 system-ui,-apple-system,sans-serif"].join(";");
    const pending = trace.pendingScript ? ` Ventet sist på: ${trace.pendingScript}` : "";
    panel.innerHTML = `<strong style="display:block;font-size:16px;margin-bottom:6px">History Go stoppet under oppstart</strong><span style="opacity:.78">Den evige loaderen er brutt.${pending}</span>`;
    document.body.appendChild(panel);
  }

  window.addEventListener("hg:appReady", () => {
    trace.readyAt = Date.now();
    document.getElementById("hgStartupGuardFailure")?.remove();
    flushDeferredScripts();
  }, { once: true });

  const armDeadline = () => setTimeout(showStartupFailure, STARTUP_DEADLINE_MS);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", armDeadline, { once: true });
  else armDeadline();
})();
