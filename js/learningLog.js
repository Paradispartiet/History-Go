// js/learningLog.js
// HGLearningLog — én sannhet for quiz-historikk og observasjoner.
// All data ligger i hg_learning_log_v1 (append-only event-logg).
// Denne modulen eksponerer et lesegrensesnitt som gir tilbake
// entries i samme form som gamle quiz_history, slik at eksisterende
// lesere (badge-modal, mini-profile, Civication m.fl.) ikke trenger
// å kjenne til event-formatet direkte.
//
// Kontrakt:
// - getQuizHistory() → array av { id, targetId, categoryId, name,
//   image, date, correctCount, total, correctAnswers } sortert
//   stigende på date.
// - migrateLegacy() → flytter evt. gammel quiz_history inn som
//   events (én gang) og fjerner den gamle nøkkelen.

(function (global) {
  "use strict";

  const LEARNING_KEY = "hg_learning_log_v1";
  const LEGACY_KEY = "quiz_history";
  const MIGRATED_FLAG = "hg_learning_log_migrated_v1";
  function dispatchProfileUpdate() {
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  function safeParse(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }

  function isQuizEvent(evt) {
    const t = evt && evt.type;
    return t === "quiz_perfect" || t === "quiz_set_complete" || t === "quiz_legacy";
  }

  function toHistoryEntry(evt) {
    const ts = Number.isFinite(evt.ts) ? evt.ts : null;
    const date = evt.date || (ts ? new Date(ts).toISOString() : "");
    return {
      id: evt.id || evt.targetId || "",
      targetId: evt.targetId || evt.id || "",
      categoryId: evt.categoryId || "",
      name: evt.name || "",
      image: evt.image || "",
      date,
      correctCount: Number.isFinite(evt.correctCount) ? evt.correctCount : 0,
      total: Number.isFinite(evt.total) ? evt.total : 0,
      correctAnswers: Array.isArray(evt.correctAnswers) ? evt.correctAnswers : []
    };
  }

  function getEvents() {
    const v = safeParse(LEARNING_KEY, []);
    return Array.isArray(v) ? v : [];
  }

  function getQuizHistory() {
    return getEvents()
      .filter(isQuizEvent)
      .map(toHistoryEntry)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }

  function migrateLegacy() {
    if (localStorage.getItem(MIGRATED_FLAG) === "1") return { migrated: 0, skipped: true };

    const legacy = safeParse(LEGACY_KEY, null);
    if (!Array.isArray(legacy) || !legacy.length) {
      localStorage.setItem(MIGRATED_FLAG, "1");
      try { localStorage.removeItem(LEGACY_KEY); } catch {}
      return { migrated: 0, skipped: false };
    }

    const existing = getEvents();
    const extras = legacy.map((entry) => ({
      schema: 1,
      type: "quiz_legacy",
      ts: Date.parse(entry?.date || "") || Date.now(),
      id: entry?.id || entry?.targetId || "",
      targetId: entry?.targetId || entry?.id || "",
      categoryId: entry?.categoryId || "",
      name: entry?.name || "",
      image: entry?.image || "",
      date: entry?.date || new Date().toISOString(),
      correctCount: Number.isFinite(entry?.correctCount) ? entry.correctCount : 0,
      total: Number.isFinite(entry?.total) ? entry.total : 0,
      correctAnswers: Array.isArray(entry?.correctAnswers) ? entry.correctAnswers : []
    }));

    safeWrite(LEARNING_KEY, existing.concat(extras));
    localStorage.setItem(MIGRATED_FLAG, "1");
    try { localStorage.removeItem(LEGACY_KEY); } catch {}
    dispatchProfileUpdate();

    if (window.DEBUG) console.log(`[HGLearningLog] migrerte ${extras.length} quiz_history-oppføringer`);
    return { migrated: extras.length, skipped: false };
  }

  global.HGLearningLog = {
    getEvents,
    getQuizHistory,
    migrateLegacy,
    KEYS: { LEARNING: LEARNING_KEY, LEGACY: LEGACY_KEY, MIGRATED_FLAG }
  };
})(window);

// ------------------------------------------------------------
// NextUp persistence + footer-toggle
// - NextUp er kontekstuell for sist åpne placeCard
// - Knappen ligger i footeren
// - Raden ligger i eget isolert panel: #footerNextUpPanel
// ------------------------------------------------------------
(function () {
  "use strict";

  const PANEL_ID = "footerNextUpPanel";
  const BUTTON_ID = "pcNextUpBtn";

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[ch]));
  }

  function attr(value) {
    return esc(value);
  }

  function ensureCss(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function readTri() {
    try {
      const parsed = JSON.parse(localStorage.getItem("hg_nextup_tri") || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function forcePanelState(panel, open) {
    if (!panel) return;

    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");

    // Direkte inline-styring for at åpning skal fungere selv ved cachet/overstyrende CSS.
    panel.style.display = open ? "grid" : "none";
    panel.style.opacity = open ? "1" : "0";
    panel.style.visibility = open ? "visible" : "hidden";
    panel.style.pointerEvents = open ? "auto" : "none";
    panel.style.transform = open ? "translateY(0)" : "translateY(10px)";
  }

  function forceButtonState(btn, open) {
    if (!btn) return;

    btn.classList.toggle("is-active", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function setOpen(open) {
    const panel = document.getElementById(PANEL_ID);
    const btn = document.getElementById(BUTTON_ID);

    forcePanelState(panel, open);
    forceButtonState(btn, open);
  }

  function toggleFooterNextUp() {
    const panel = ensureFooterNextUp();
    const btn = document.getElementById(BUTTON_ID);
    const open = !panel.classList.contains("is-open");

    forcePanelState(panel, open);
    forceButtonState(btn, open);
  }

  function ensureFooterNextUp() {
    const footer = document.querySelector(".app-footer");
    const shell = document.querySelector(".app-shell");
    if (!footer || !shell) return null;

    ensureCss("css/footer-nextup.css");

    // Gammel permanente NextUp-linje skal ikke brukes som panel lenger.
    const oldMpNextUp = document.getElementById("mpNextUp");
    if (oldMpNextUp) oldMpNextUp.remove();

    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement("div");
      panel.id = PANEL_ID;
      panel.className = "footer-nextup-panel";
      shell.appendChild(panel);
    }

    let btn = document.getElementById(BUTTON_ID);
    if (!btn) {
      btn = document.createElement("button");
      btn.id = BUTTON_ID;
      btn.className = "iconbtn pc-nextup-btn";
      btn.type = "button";
      btn.setAttribute("aria-label", "Neste");
      btn.setAttribute("aria-expanded", "false");
      btn.title = "Neste";
      btn.textContent = "➜";
      footer.appendChild(btn);
    }

    // Bruk onclick direkte i tillegg til global funksjon. Dette er enklere og mer robust på iPad/Safari.
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleFooterNextUp();
      return false;
    };

    window.toggleFooterNextUp = toggleFooterNextUp;

    if (!panel.classList.contains("is-open")) {
      setOpen(false);
    }

    return panel;
  }

  function bindNextUp(panel) {
    panel.querySelectorAll("[data-mp]").forEach((btn) => {
      btn.onclick = () => {
        const t = btn.dataset.mp;

        if (t === "goto") {
          const id = btn.dataset.place;
          if (!id) return;
          const pl = (window.PLACES || []).find(x => String(x.id) === String(id));
          if (pl) return window.openPlaceCard?.(pl);
          return window.showToast?.("Fant ikke stedet");
        }

        if (t === "wk") {
          const id = btn.dataset.wk;
          if (!id) return;

          if (window.Wonderkammer && typeof window.Wonderkammer.openEntry === "function") {
            window.Wonderkammer.openEntry(id);
          } else if (typeof window.openWonderkammerEntry === "function") {
            window.openWonderkammerEntry(id);
          } else {
            console.warn("[NextUp] No Wonderkammer open handler found for", id);
            window.showToast?.("Fant ikke Wonderkammer-visning");
          }
          return;
        }

        if (t === "story") {
          const nextId = btn.dataset.nextplace;
          if (!nextId) return;
          const pl = (window.PLACES || []).find(x => String(x.id) === String(nextId));
          if (pl) return window.openPlaceCard?.(pl);
          return window.showToast?.("Fant ikke neste kapittel-sted");
        }

        if (t === "emne") {
          const emneId = btn.dataset.emne;
          if (!emneId) return;
          window.location.href = `knowledge_by.html#${encodeURIComponent(emneId)}`;
        }
      };
    });
  }

  function renderFooterNextUp(tri = readTri()) {
    if (document.body?.classList.contains("profile-page")) return;

    const panel = ensureFooterNextUp();
    if (!panel) return;

    const wasOpen = panel.classList.contains("is-open");

    tri = tri && typeof tri === "object" ? tri : {};

    const spatial = tri.spatial || null;
    const narrative = tri.narrative || null;
    const concept = tri.concept || null;
    const wk = tri.wk || null;

    panel.innerHTML = `
      <div class="mp-nextup-line">
        <button class="mp-nextup-link" data-mp="goto"
          ${spatial ? `data-place="${attr(spatial.place_id)}"` : "disabled"}>
          🧭 <b>Neste sted</b><span>${spatial ? esc(spatial.label) : "—"}</span>
        </button>
      </div>

      <div class="mp-nextup-line">
        <button class="mp-nextup-link" data-mp="wk"
          ${wk ? `data-wk="${attr(wk.entry_id)}" title="${attr(wk.because || "")}"` : "disabled"}>
          🗃️ <b>Wonderkammer</b><span>${wk ? esc(wk.label) : "—"}</span>
        </button>
      </div>

      <div class="mp-nextup-line">
        <button class="mp-nextup-link" data-mp="story"
          ${narrative ? `data-nextplace="${attr(narrative.next_place_id)}"` : "disabled"}>
          📖 <b>Neste scene</b><span>${narrative ? esc(narrative.label) : "—"}</span>
        </button>
      </div>

      <div class="mp-nextup-line">
        <button class="mp-nextup-link" data-mp="emne"
          ${concept ? `data-emne="${attr(concept.emne_id)}"` : "disabled"}>
          🧠 <b>Forstå</b><span>${concept ? esc(concept.label) : "—"}</span>
        </button>
      </div>
    `;

    bindNextUp(panel);
    setOpen(wasOpen);
  }

  function bootNextUpFooter() {
    if (document.body?.classList.contains("profile-page")) {
      ensureCss("css/profile-nextup.css");

      if (!document.querySelector('script[src="js/ui/profile-nextup.js"]')) {
        const script = document.createElement("script");
        script.src = "js/ui/profile-nextup.js";
        script.defer = true;
        document.body.appendChild(script);
      }
      return;
    }

    renderFooterNextUp(readTri());
  }

  window.renderFooterNextUp = renderFooterNextUp;

  window.addEventListener("hg:mpNextUp", (e) => {
    const tri = e.detail?.tri || {};
    const becauseLine = e.detail?.becauseLine || "";

    try {
      localStorage.setItem("hg_nextup_because", String(becauseLine || ""));
      localStorage.setItem("hg_nextup_tri", JSON.stringify(tri || {}));
    } catch {}

    window.setTimeout(() => renderFooterNextUp(tri), 0);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootNextUpFooter);
  } else {
    bootNextUpFooter();
  }

  window.addEventListener("load", bootNextUpFooter);
})();
