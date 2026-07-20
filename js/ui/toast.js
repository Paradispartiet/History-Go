const HG_TOAST_READY_DELAY_MS = 260;
const HG_TOAST_QUEUE_STAGGER_MS = 350;
const pendingToasts = [];
let toastReadyListenerBound = false;
let toastQueueFlushing = false;

function getToastDuration(msg) {
  const text = String(msg || "").trim();
  const len = text.length;

  if (len <= 20) return 1400;
  if (len <= 55) return 2300;
  if (len <= 110) return 3600;
  return 5200;
}

function ensureToastElement() {
  let toast = window.el?.toast || document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body?.appendChild(toast);
  }

  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.setAttribute("aria-atomic", "true");

  window.el = window.el || {};
  window.el.toast = toast;

  return toast;
}

function isWaitingForIndexAppReady() {
  return !!document.body?.classList.contains("hg-app")
    && window.__HG_APP_READY__ !== true
    && !document.body?.classList.contains("hg-loaded");
}

function normalizeToastArgs(ms, options) {
  if (ms && typeof ms === "object" && !Array.isArray(ms)) {
    return { ms: null, options: ms };
  }

  return {
    ms,
    options: options && typeof options === "object" ? options : {}
  };
}

function applyToastPresentation(toast, closeBtn, options = {}) {
  const compact = options.compact === true;

  if (compact) {
    toast.style.width = "auto";
    toast.style.maxWidth = "min(420px, calc(100vw - 32px))";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "18px";
    toast.style.fontSize = "15px";
    toast.style.fontWeight = "700";
    toast.style.textAlign = "center";
    closeBtn.style.display = "none";
    return;
  }

  toast.style.removeProperty("width");
  toast.style.removeProperty("max-width");
  toast.style.removeProperty("padding");
  toast.style.removeProperty("border-radius");
  toast.style.removeProperty("font-size");
  toast.style.removeProperty("font-weight");
  toast.style.removeProperty("text-align");
  closeBtn.style.removeProperty("display");
}

function showToastNow(msg, ms = null, options = {}) {
  const tt = (key, fallback) => window.HG_I18N?.t?.(key, fallback) || fallback;
  const t = /** @type {HTMLElement & { _hide?: any }} */ (ensureToastElement());

  clearTimeout(t._hide);
  t._hide = null;

  t.innerHTML = "";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "toast-close";
  closeBtn.setAttribute("aria-label", tt("ui.toast.closeMessage", "Lukk melding"));
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => {
    clearTimeout(t._hide);
    t._hide = null;
    t.style.display = "none";
  });

  const body = document.createElement("div");
  body.className = "toast-body";
  body.textContent = String(msg || "");

  t.appendChild(closeBtn);
  t.appendChild(body);
  applyToastPresentation(t, closeBtn, options);
  t.style.display = "block";

  const duration = Number.isFinite(ms) ? Number(ms) : getToastDuration(msg);

  if (duration > 0) {
    t._hide = setTimeout(() => {
      t.style.display = "none";
    }, duration);
  }
}

function flushPendingToasts() {
  if (toastQueueFlushing || !pendingToasts.length) return;
  toastQueueFlushing = true;

  const queue = pendingToasts.splice(0);
  queue.forEach((item, index) => {
    setTimeout(() => {
      showToastNow(item.msg, item.ms, item.options);
      if (index === queue.length - 1) toastQueueFlushing = false;
    }, HG_TOAST_READY_DELAY_MS + index * HG_TOAST_QUEUE_STAGGER_MS);
  });
}

function ensureToastReadyListener() {
  if (toastReadyListenerBound) return;
  toastReadyListenerBound = true;

  window.addEventListener("hg:appReady", flushPendingToasts, { once: true });
}

function showToast(msg, ms = null, options = null) {
  const normalized = normalizeToastArgs(ms, options);

  if (isWaitingForIndexAppReady()) {
    pendingToasts.push({
      msg,
      ms: normalized.ms,
      options: normalized.options
    });
    ensureToastReadyListener();
    return;
  }

  showToastNow(msg, normalized.ms, normalized.options);
}

window.showToast = showToast;
window.API = window.API || {};
window.API.showToast = showToast;