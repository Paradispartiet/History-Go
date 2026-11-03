// Daily progression acknowledgements use History Go's shared transient toast lane.
(function () {
  "use strict";

  const root = typeof window !== "undefined" ? window : globalThis;
  const ID = "hgDailyProgressToast";
  const STYLE_ID = "hgDailyProgressToastStyle";
  const DISPLAY_MS = 2600;
  const allowedTypes = new Set(["objective_completed", "blocker_cleared", "profile_ready"]);

  const staged = [];
  const jobs = new Set();
  let active = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  function ensure() {
    if (!root.document?.body) return null;
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `#${ID}{
        position:fixed;left:50%;transform:translateX(-50%);
        bottom:calc(130px + env(safe-area-inset-bottom, 0px));
        z-index:2147481800;
        width:max-content;max-width:min(420px,calc(100vw - 24px));
        padding:13px 16px;border-radius:14px;
        background:#14532d;color:#fff;
        box-shadow:0 12px 32px rgba(0,0,0,.28);
        font:14px/1.35 system-ui,sans-serif;overflow-wrap:anywhere;
      }
      #${ID} strong{display:block}
      body.hg-app:has(#hgCivicationModeToast) #${ID}{
        bottom:var(--hg-mission-notification-bottom,calc(env(safe-area-inset-bottom,0px) + 162px));
      }`;
      document.head?.appendChild(style);
    }
    let element = document.getElementById(ID);
    if (!element) {
      element = document.createElement("div");
      element.id = ID;
      element.setAttribute("role", "status");
      element.setAttribute("aria-live", "polite");
      document.body.appendChild(element);
    }
    return element;
  }

  function finish(job) {
    if (!job || job.finished) return;
    job.finished = true;
    clearTimeout(job.timer);
    jobs.delete(job);
    if (active === job) {
      active = null;
      root.document?.getElementById?.(ID)?.remove?.();
    }
    const done = job.done;
    job.done = null;
    done?.();
  }

  function present(job, done) {
    if (job.finished) { done(); return; }
    const element = ensure();
    if (!element) { finish(job); done(); return; }
    active = job;
    job.done = done;
    element.innerHTML = `<strong>${escapeHtml(job.title)}</strong><span>${escapeHtml(job.subtitle)}</span>`;
    job.timer = setTimeout(() => finish(job), DISPLAY_MS);
  }

  function flushPending() {
    const enqueue = root.HGToastRuntime?.enqueueReward;
    if (typeof enqueue !== "function") return false;
    while (staged.length) {
      const job = staged.shift();
      if (!job.finished) enqueue(done => present(job, done));
    }
    return true;
  }

  function show(title, subtitle, options) {
    if (options?.disabled || root.HG_REDUCED_UI) return false;
    if (!allowedTypes.has(options?.type || "objective_completed")) return false;
    const job = {
      title: String(title || "Mål fullført"),
      subtitle: String(subtitle || "Dagens framgang er oppdatert."),
      timer: null,
      done: null,
      finished: false
    };
    jobs.add(job);
    staged.push(job);
    flushPending();
    return true;
  }

  function hide() {
    // Suppress notices that have not reached the display lane, too.
    staged.splice(0);
    for (const job of [...jobs]) finish(job);
  }

  function isVisible() {
    return !!root.document?.getElementById?.(ID);
  }

  root.HG_DailyProgressToast = { show, hide, isVisible, flushPending };
  root.addEventListener?.("hg:appReady", flushPending, { once: true });
})();
