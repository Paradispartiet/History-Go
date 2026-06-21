// js/Civication/ui/CivicationConsequenceFeedback.js
// Viser kort, lesbar feedback når et svar gir en metrisk konsekvens i Civication. Lytter på
// `civication:consequence` (dispatchet av CivicationBrandJobState.applyChoiceConsequences) og
// rendrer en flyktig «Svaret ga …»-melding med metrikk-deltaene. Display-only: leser ingen
// data og skriver ingen state. Selvstendige injiserte stiler (CSS-lista er låst).
(function () {
  "use strict";

  const LABELS = {
    brand_tillit: "Merketillit",
    leder_tillit: "Ledertillit",
    kollega_tillit: "Kollegatillit",
    kundetillit: "Kundetillit",
    faglighet: "Faglighet",
    driftsflyt: "Driftsflyt",
    salgserfaring: "Salgserfaring",
    stress: "Stress",
    risiko: "Risiko",
    integritet: "Integritet"
  };

  function labelFor(key) {
    return LABELS[key] || String(key || "").replace(/_/g, " ");
  }

  // Gjør et delta-objekt om til lesbare linjer: { kundetillit: 1, integritet: -1 }
  // -> [{ key, label, value, dir: "up"|"down", text: "Kundetillit +1" }]
  function formatDelta(delta) {
    if (!delta || typeof delta !== "object") return [];
    return Object.keys(delta)
      .map((key) => ({ key, value: Number(delta[key]) || 0 }))
      .filter((row) => row.value !== 0)
      .map((row) => {
        const sign = row.value > 0 ? "+" : "−"; // unicode minus for negative
        const arrow = row.value > 0 ? "▲" : "▼";
        return {
          key: row.key,
          label: labelFor(row.key),
          value: row.value,
          dir: row.value > 0 ? "up" : "down",
          text: `${labelFor(row.key)} ${sign}${Math.abs(row.value)}`,
          arrow
        };
      });
  }

  function ensureStyles() {
    if (typeof document === "undefined" || document.getElementById("civiConsequenceStyles")) return;
    const style = document.createElement("style");
    style.id = "civiConsequenceStyles";
    style.textContent =
      ".civi-consequence{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(8px);" +
      "z-index:9999;max-width:min(92vw,420px);background:#111827;color:#fff;border-radius:12px;" +
      "padding:12px 16px;box-shadow:0 8px 24px rgba(0,0,0,.28);opacity:0;transition:opacity .18s,transform .18s;" +
      "font-size:14px;display:flex;flex-direction:column;gap:6px}" +
      ".civi-consequence.is-visible{opacity:1;transform:translateX(-50%) translateY(0)}" +
      ".civi-consequence__title{font-weight:700;font-size:13px;opacity:.85}" +
      ".civi-consequence__items{display:flex;flex-wrap:wrap;gap:6px}" +
      ".civi-consequence__item{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;" +
      "font-weight:600;font-size:13px;background:rgba(255,255,255,.12)}" +
      ".civi-consequence__item.is-up{color:#86efac}" +
      ".civi-consequence__item.is-down{color:#fca5a5}";
    document.head?.appendChild(style);
  }

  let activeEl = null;
  let hideTimer = null;
  let removeTimer = null;

  function render(detail) {
    const items = formatDelta(detail && detail.delta);
    if (!items.length || typeof document === "undefined" || !document.body) return null;

    ensureStyles();
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (removeTimer) { clearTimeout(removeTimer); removeTimer = null; }
    if (activeEl && activeEl.parentNode) activeEl.parentNode.removeChild(activeEl);

    const el = document.createElement("div");
    el.className = "civi-consequence";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");

    const title = document.createElement("div");
    title.className = "civi-consequence__title";
    title.textContent = "Svaret ga konsekvens";
    el.appendChild(title);

    const wrap = document.createElement("div");
    wrap.className = "civi-consequence__items";
    items.forEach((row) => {
      const chip = document.createElement("span");
      chip.className = "civi-consequence__item " + (row.dir === "up" ? "is-up" : "is-down");
      chip.textContent = `${row.arrow} ${row.text}`;
      wrap.appendChild(chip);
    });
    el.appendChild(wrap);

    document.body.appendChild(el);
    activeEl = el;
    // force-show on next frame so the transition runs
    const show = () => el.classList.add("is-visible");
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(show); else show();

    hideTimer = setTimeout(() => { el.classList.remove("is-visible"); }, 4200);
    removeTimer = setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); if (activeEl === el) activeEl = null; }, 4600);
    return el;
  }

  function onConsequence(ev) {
    render(ev && ev.detail);
  }

  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("civication:consequence", onConsequence);
  }

  window.CivicationConsequenceFeedback = { render, formatDelta, labelFor };
})();
