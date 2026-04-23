(function () {
  "use strict";

  let previousSnapshot = null;
  let latestDelta = null;

  function normStr(v) {
    return String(v || "").trim();
  }

  function activeCareerId() {
    return normStr(window.CivicationState?.getActivePosition?.()?.career_id);
  }

  function currentSnapshot() {
    const careerId = activeCareerId() || null;
    const snap = window.CivicationPsyche?.getSnapshot?.(careerId) || null;
    const branch = window.CivicationState?.getMailBranchState?.() || {
      preferred_types: [],
      preferred_families: [],
      flags: []
    };

    return {
      psyche: snap,
      branch
    };
  }

  function computeDelta(prev, next) {
    const a = prev?.psyche || {};
    const b = next?.psyche || {};

    const trustA = Number(a?.trust?.value || 0);
    const trustB = Number(b?.trust?.value || 0);

    return {
      integrity: Number(b.integrity || 0) - Number(a.integrity || 0),
      visibility: Number(b.visibility || 0) - Number(a.visibility || 0),
      economicRoom: Number(b.economicRoom || 0) - Number(a.economicRoom || 0),
      autonomy: Number(b.autonomy || 0) - Number(a.autonomy || 0),
      trust: trustB - trustA
    };
  }

  function formatDelta(label, value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n === 0) return "";
    const sign = n > 0 ? "+" : "";
    return `<span class="civi-cons-chip ${n > 0 ? "pos" : "neg"}">${label} ${sign}${n}</span>`;
  }

  function renderDeltaRow(delta) {
    if (!delta) return "<div class=\"civi-cons-muted\">Ingen nylige utslag registrert ennå.</div>";

    const html = [
      formatDelta("Trust", delta.trust),
      formatDelta("Integrity", delta.integrity),
      formatDelta("Visibility", delta.visibility),
      formatDelta("Economic", delta.economicRoom),
      formatDelta("Autonomy", delta.autonomy)
    ].filter(Boolean).join("");

    return html || "<div class=\"civi-cons-muted\">Ingen målbare endringer i siste oppdatering.</div>";
  }

  function renderFlags(flags) {
    const arr = Array.isArray(flags) ? flags.slice(-6) : [];
    if (!arr.length) return "<div class=\"civi-cons-muted\">Ingen tydelig retning satt ennå.</div>";
    return arr.map((flag) => `<span class=\"civi-cons-flag\">${flag}</span>`).join("");
  }

  function consequenceBoxHtml() {
    const snap = currentSnapshot();
    const trustValue = Number(snap?.psyche?.trust?.value || 0);
    const trustMax = Number(snap?.psyche?.trust?.max || 0);

    return `
      <div class="civi-cons-box">
        <div class="civi-cons-head">Siste konsekvens</div>
        <div class="civi-cons-row">${renderDeltaRow(latestDelta)}</div>
        <div class="civi-cons-subhead">Retning nå</div>
        <div class="civi-cons-row">${renderFlags(snap?.branch?.flags)}</div>
        <div class="civi-cons-subhead">Nåværende psyke</div>
        <div class="civi-cons-stats">
          <span>Trust ${trustValue}${trustMax ? ` / ${trustMax}` : ""}</span>
          <span>Integrity ${Number(snap?.psyche?.integrity || 0)}</span>
          <span>Visibility ${Number(snap?.psyche?.visibility || 0)}</span>
          <span>Economic ${Number(snap?.psyche?.economicRoom || 0)}</span>
          <span>Autonomy ${Number(snap?.psyche?.autonomy || 0)}</span>
        </div>
      </div>
    `;
  }

  function ensureStyles() {
    if (document.getElementById("civiConsequencesStyle")) return;
    const style = document.createElement("style");
    style.id = "civiConsequencesStyle";
    style.textContent = `
      .civi-cons-box{margin:0 0 12px 0;padding:12px;border:1px solid rgba(0,0,0,.12);border-radius:12px;background:rgba(255,255,255,.7)}
      .civi-cons-head{font-weight:700;margin-bottom:8px}
      .civi-cons-subhead{font-size:12px;opacity:.7;margin:10px 0 6px}
      .civi-cons-row,.civi-cons-stats{display:flex;flex-wrap:wrap;gap:8px}
      .civi-cons-chip,.civi-cons-flag{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:12px;border:1px solid rgba(0,0,0,.12);background:#fff}
      .civi-cons-chip.pos{background:rgba(50,140,80,.10)}
      .civi-cons-chip.neg{background:rgba(180,70,70,.10)}
      .civi-cons-muted{font-size:12px;opacity:.7}
      .civi-cons-stats span{font-size:12px;padding:4px 8px;border-radius:8px;background:rgba(255,255,255,.85);border:1px solid rgba(0,0,0,.08)}
    `;
    document.head.appendChild(style);
  }

  function injectIntoInbox() {
    const host = document.getElementById("civiInbox");
    if (!host) return;
    host.insertAdjacentHTML("afterbegin", consequenceBoxHtml());
  }

  function injectIntoWorkday() {
    const host = document.getElementById("civiWorkdayPanel");
    if (!host) return;
    host.insertAdjacentHTML("afterbegin", consequenceBoxHtml());
  }

  function patchRenderer(name, injector) {
    const original = window[name];
    if (typeof original !== "function" || original.__civiConsequencesWrapped) return;

    const wrapped = function () {
      const res = original.apply(this, arguments);
      try { injector(); } catch {}
      return res;
    };

    wrapped.__civiConsequencesWrapped = true;
    window[name] = wrapped;
  }

  function setup() {
    ensureStyles();
    patchRenderer("renderCivicationInbox", injectIntoInbox);
    patchRenderer("renderWorkdayPanel", injectIntoWorkday);

    previousSnapshot = currentSnapshot();

    window.addEventListener("updateProfile", function () {
      const next = currentSnapshot();
      latestDelta = computeDelta(previousSnapshot, next);
      previousSnapshot = next;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
