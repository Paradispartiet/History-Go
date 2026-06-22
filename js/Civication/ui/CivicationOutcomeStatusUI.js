// js/Civication/ui/CivicationOutcomeStatusUI.js
// Robust karriere-outcome-visning som overlever at dagsfase-panelet ryddes bort. Dagsfase-panelet
// (CivicationDayPhaseUI) viser outcome-banneret, men når en FIRED-outcome rydder bort den aktive
// jobben forsvinner hele panelet — og dermed outcome-statusen. Denne modulen viser en frittstående
// status i den alltid-tilstedeværende `.civi-panels`-containeren NÅR det finnes en terminal outcome
// men ingen aktiv jobb. Display-only: leser state via CivicationCareerOutcomeRuntime, skriver ingenting.
(function () {
  "use strict";

  const CONTAINER_ID = "civiOutcomeStatus";

  function norm(value) { return String(value == null ? "" : value).trim(); }

  function getViewModel() {
    const runtime = window.CivicationCareerOutcomeRuntime;
    if (!runtime || typeof runtime.getOutcomeViewModel !== "function") return null;
    const state = window.CivicationState?.getState?.() || {};
    try { return runtime.getOutcomeViewModel(state); } catch { return null; }
  }

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  // Vis frittstående KUN når det finnes en terminal outcome og ingen aktiv jobb — da er
  // dagsfase-panelet (som ellers eier outcome-banneret) borte, og statusen ville forsvunnet.
  function shouldShow(viewModel, active) {
    return !!(viewModel && viewModel.hasOutcome && !active);
  }

  function escapeHtml(value) {
    return norm(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function bannerHtml(vm) {
    const kind = norm(vm.status).toLowerCase() || "outcome";
    const label = escapeHtml(vm.statusLabel || "Karrierestatus");
    const detail = escapeHtml(vm.statusDetail || vm.reason || "");
    return (
      `<div class="civi-outcome-status__card is-${kind}">` +
      `<div class="civi-outcome-status__kicker">Karrierestatus</div>` +
      `<div class="civi-outcome-status__label">${label}</div>` +
      (detail ? `<p class="civi-outcome-status__detail">${detail}</p>` : "") +
      `</div>`
    );
  }

  function ensureStyles() {
    if (typeof document === "undefined" || document.getElementById("civiOutcomeStatusStyles")) return;
    const style = document.createElement("style");
    style.id = "civiOutcomeStatusStyles";
    style.textContent =
      ".civi-outcome-status{margin:0 0 12px}" +
      ".civi-outcome-status__card{border-radius:14px;padding:14px 16px;border-left:5px solid #6b7280;" +
      "background:#f3f4f6;color:#111827}" +
      ".civi-outcome-status__card.is-fired{border-left-color:#dc2626;background:#fef2f2}" +
      ".civi-outcome-status__card.is-promoted{border-left-color:#16a34a;background:#f0fdf4}" +
      ".civi-outcome-status__card.is-stagnated{border-left-color:#d97706;background:#fffbeb}" +
      ".civi-outcome-status__kicker{font-size:12px;font-weight:700;letter-spacing:.03em;" +
      "text-transform:uppercase;opacity:.7}" +
      ".civi-outcome-status__label{margin-top:4px;font-size:16px;font-weight:800}" +
      ".civi-outcome-status__detail{margin:6px 0 0;font-size:13px;opacity:.85}";
    document.head?.appendChild(style);
  }

  function render() {
    if (typeof document === "undefined") return false;
    const panels = document.querySelector(".civi-panels");
    if (!panels) return false;

    const vm = getViewModel();
    const active = getActive();
    let el = document.getElementById(CONTAINER_ID);

    if (!shouldShow(vm, active)) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      return false;
    }

    ensureStyles();
    if (!el) {
      el = document.createElement("section");
      el.id = CONTAINER_ID;
      el.className = "civi-outcome-status";
      el.setAttribute("aria-label", "Karrierestatus");
    }
    // Sørg for at banneret er festet øverst i panels (også hvis det tidligere ble fjernet).
    if (el.parentNode !== panels) {
      panels.insertBefore(el, panels.firstChild);
    }
    el.innerHTML = bannerHtml(vm);
    return true;
  }

  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("updateProfile", render);
    window.addEventListener("civi:inboxChanged", render);
  }
  if (typeof document !== "undefined" && document.addEventListener) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", render, { once: true });
    } else {
      render();
    }
  }

  window.CivicationOutcomeStatusUI = { render, shouldShow, getViewModel };
})();
