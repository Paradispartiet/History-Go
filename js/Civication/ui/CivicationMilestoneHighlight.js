// js/Civication/ui/CivicationMilestoneHighlight.js
// Fremhever en ny jobb-milepæl tydelig når den utløses i Civication. Lytter på
// `civication:milestone` (dispatchet av CivicationBrandJobProgression når en metrikk krysser en
// terskel og en milepæl-mail legges i innboksen) og viser et fremtredende kort med tittel og
// hva som utløste den. Display-only: leser ingen data og skriver ingen state. Selvstendige
// injiserte stiler (CSS-lista er låst).
(function () {
  "use strict";

  function norm(value) { return String(value == null ? "" : value).trim(); }

  function metricLabel(key) {
    // Gjenbruk konsekvens-feedbackens etiketter når tilgjengelig; ellers humaniser.
    const viaShared = window.CivicationConsequenceFeedback?.labelFor;
    if (typeof viaShared === "function") return viaShared(key);
    return norm(key).replace(/_/g, " ");
  }

  // Bygg en kort «hvorfor»-linje: «Kundetillit nådde 3».
  function reasonText(detail) {
    const metric = norm(detail && detail.metric);
    const threshold = Number(detail && detail.threshold);
    if (!metric) return "";
    const label = metricLabel(metric);
    return threshold ? `${label} nådde ${threshold}` : label;
  }

  function ensureStyles() {
    if (typeof document === "undefined" || document.getElementById("civiMilestoneStyles")) return;
    const style = document.createElement("style");
    style.id = "civiMilestoneStyles";
    style.textContent =
      ".civi-milestone{position:fixed;left:50%;top:18%;transform:translate(-50%,-8px);z-index:10000;" +
      "width:min(92vw,440px);background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border-radius:16px;" +
      "padding:18px 20px;box-shadow:0 16px 40px rgba(49,46,129,.45);opacity:0;transition:opacity .2s,transform .2s;" +
      "cursor:pointer}" +
      ".civi-milestone.is-visible{opacity:1;transform:translate(-50%,0)}" +
      ".civi-milestone__kicker{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;" +
      "letter-spacing:.04em;text-transform:uppercase;opacity:.9}" +
      ".civi-milestone__title{margin:8px 0 0;font-size:18px;font-weight:800;line-height:1.25}" +
      ".civi-milestone__reason{margin:8px 0 0;font-size:13px;opacity:.92;display:inline-flex;align-items:center;gap:6px}" +
      ".civi-milestone__summary{margin:8px 0 0;font-size:13px;opacity:.85}" +
      ".civi-milestone__dismiss{margin-top:12px;font-size:12px;opacity:.8}";
    document.head?.appendChild(style);
  }

  let activeEl = null;
  let hideTimer = null;
  let removeTimer = null;

  function dismiss() {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (removeTimer) { clearTimeout(removeTimer); removeTimer = null; }
    const el = activeEl;
    if (!el) return;
    el.classList.remove("is-visible");
    removeTimer = setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); if (activeEl === el) activeEl = null; }, 220);
  }

  function render(detail) {
    const subject = norm(detail && detail.subject);
    if (!subject || typeof document === "undefined" || !document.body) return null;

    ensureStyles();
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (removeTimer) { clearTimeout(removeTimer); removeTimer = null; }
    if (activeEl && activeEl.parentNode) activeEl.parentNode.removeChild(activeEl);

    const el = document.createElement("div");
    el.className = "civi-milestone";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");

    const kicker = document.createElement("div");
    kicker.className = "civi-milestone__kicker";
    kicker.textContent = "🏆 Milepæl nådd";
    el.appendChild(kicker);

    const title = document.createElement("div");
    title.className = "civi-milestone__title";
    title.textContent = subject;
    el.appendChild(title);

    const reason = reasonText(detail);
    if (reason) {
      const r = document.createElement("div");
      r.className = "civi-milestone__reason";
      r.textContent = "▲ " + reason;
      el.appendChild(r);
    }

    const summary = norm(detail && detail.summary);
    if (summary) {
      const s = document.createElement("div");
      s.className = "civi-milestone__summary";
      s.textContent = summary;
      el.appendChild(s);
    }

    const hint = document.createElement("div");
    hint.className = "civi-milestone__dismiss";
    hint.textContent = "Trykk for å lukke";
    el.appendChild(hint);

    el.addEventListener("click", dismiss);

    document.body.appendChild(el);
    activeEl = el;
    const show = () => el.classList.add("is-visible");
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(show); else show();

    hideTimer = setTimeout(dismiss, 6500);
    return el;
  }

  function onMilestone(ev) {
    render(ev && ev.detail);
  }

  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("civication:milestone", onMilestone);
  }

  window.CivicationMilestoneHighlight = { render, reasonText, metricLabel };
})();
