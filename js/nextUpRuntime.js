// ============================================================
// HISTORY GO – NextUp Runtime v2
// Eier hele NextUp-panelet: knapp, rendering, åpne/lukke, historikk og debug.
// Anbefalingslogikken eies av js/hgNavigator.js.
// ============================================================

(function () {
  "use strict";

  const PANEL_ID = "footerNextUpPanel";
  const BUTTON_ID = "pcNextUpBtn";
  const TRI_KEY = "hg_nextup_tri";
  const BECAUSE_KEY = "hg_nextup_because";
  const HISTORY_KEY = "hg_nextup_history_v1";
  const MAX_HISTORY = 200;

  function s(value) {
    return String(value ?? "").trim();
  }

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

  function readJSON(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "");
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function readTri() {
    const tri = readJSON(TRI_KEY, {});
    return tri && typeof tri === "object" ? tri : {};
  }

  function readHistory() {
    const history = readJSON(HISTORY_KEY, []);
    return Array.isArray(history) ? history : [];
  }

  function appendHistory(entry) {
    const next = [
      {
        ts: Date.now(),
        iso: new Date().toISOString(),
        ...entry
      },
      ...readHistory()
    ].slice(0, MAX_HISTORY);

    writeJSON(HISTORY_KEY, next);
  }

  function dispatchProfileUpdate() {
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  function suggestionIcon(type) {
    return {
      spatial: "🧭",
      wonderkammer: "🗃️",
      narrative: "📖",
      concept: "🧠",
      quiz: "❓",
      badge: "🏅"
    }[type] || "➜";
  }

  function suggestionTitle(type) {
    return {
      spatial: "Neste sted",
      wonderkammer: "Wonderkammer",
      narrative: "Neste scene",
      concept: "Forstå",
      quiz: "Neste quiz",
      badge: "Neste merke"
    }[type] || "Neste";
  }

  function legacySuggestions(tri) {
    const out = [];

    if (tri?.spatial) {
      out.push({
        type: "spatial",
        target_id: s(tri.spatial.place_id),
        label: s(tri.spatial.label),
        reason: s(tri.spatial.because),
        score: Number(tri.spatial.score || 60),
        source: s(tri.spatial.source || "places"),
        meta: { place_id: s(tri.spatial.place_id) }
      });
    }

    if (tri?.wk) {
      out.push({
        type: "wonderkammer",
        target_id: s(tri.wk.entry_id),
        label: s(tri.wk.label),
        reason: s(tri.wk.because),
        score: Number(tri.wk.score || 55),
        source: s(tri.wk.source || "wonderkammer"),
        meta: { entry_id: s(tri.wk.entry_id) }
      });
    }

    if (tri?.narrative) {
      out.push({
        type: "narrative",
        target_id: s(tri.narrative.next_place_id),
        label: s(tri.narrative.label),
        reason: s(tri.narrative.because),
        score: Number(tri.narrative.score || 70),
        source: s(tri.narrative.source || "stories"),
        meta: {
          next_place_id: s(tri.narrative.next_place_id),
          story_id: s(tri.narrative.story_id)
        }
      });
    }

    if (tri?.concept) {
      out.push({
        type: "concept",
        target_id: s(tri.concept.emne_id),
        label: s(tri.concept.label),
        reason: s(tri.concept.because),
        score: Number(tri.concept.score || 65),
        source: s(tri.concept.source || "knowledge"),
        href: s(tri.concept.knowledge_href),
        meta: {
          emne_id: s(tri.concept.emne_id),
          subject_id: s(tri.concept.subject_id)
        }
      });
    }

    return out.filter(x => x.type && x.target_id && x.label);
  }

  function normalizeSuggestions(tri) {
    const raw = Array.isArray(tri?.suggestions) && tri.suggestions.length
      ? tri.suggestions
      : legacySuggestions(tri);

    return raw
      .filter(sug => sug && s(sug.type) && s(sug.target_id) && s(sug.label))
      .map(sug => ({
        type: s(sug.type),
        target_id: s(sug.target_id),
        label: s(sug.label),
        reason: s(sug.reason),
        score: Number(sug.score || 0),
        source: s(sug.source),
        href: s(sug.href),
        meta: sug.meta && typeof sug.meta === "object" ? sug.meta : {}
      }))
      .sort((a, b) => b.score - a.score);
  }

  function setOpen(open) {
    const panel = document.getElementById(PANEL_ID);
    const btn = document.getElementById(BUTTON_ID);
    if (!panel || !btn) return;

    panel.classList.toggle("is-open", !!open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    panel.style.display = open ? "grid" : "none";
    panel.style.opacity = open ? "1" : "0";
    panel.style.visibility = open ? "visible" : "hidden";
    panel.style.pointerEvents = open ? "auto" : "none";
    panel.style.transform = open ? "translateY(0)" : "translateY(10px)";

    btn.classList.toggle("is-active", !!open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function toggleNextUp() {
    const panel = ensurePanel();
    if (!panel) return;

    setOpen(!panel.classList.contains("is-open"));
  }

  function ensurePanel() {
    if (document.body?.classList.contains("profile-page")) return null;

    const footer = document.querySelector(".app-footer");
    const shell = document.querySelector(".app-shell");
    if (!footer || !shell) return null;

    ensureCss("css/footer-nextup.css");

    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement("div");
      panel.id = PANEL_ID;
      panel.className = "footer-nextup-panel";
      panel.setAttribute("aria-hidden", "true");
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

    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleNextUp();
      return false;
    };

    if (!panel.classList.contains("is-open")) {
      setOpen(false);
    }

    return panel;
  }

  function openPlace(placeId) {
    const id = s(placeId);
    const place = (window.PLACES || []).find(p => s(p?.id) === id);
    if (place && typeof window.openPlaceCard === "function") {
      window.openPlaceCard(place);
      return;
    }
    window.showToast?.("Fant ikke stedet");
  }

  function openWonderkammer(entryId) {
    const id = s(entryId);
    if (!id) return;

    if (window.Wonderkammer && typeof window.Wonderkammer.openEntry === "function") {
      window.Wonderkammer.openEntry(id);
      return;
    }

    if (typeof window.openWonderkammerEntry === "function") {
      window.openWonderkammerEntry(id);
      return;
    }

    window.showToast?.("Fant ikke Wonderkammer-visning");
  }

  function openConcept(sug) {
    const href = s(sug.href);
    if (href) {
      window.location.href = href;
      return;
    }

    const emneId = s(sug.meta?.emne_id || sug.target_id);
    const subject = s(sug.meta?.subject_id || "by");
    if (!emneId) return;
    window.location.href = `knowledge/knowledge_${encodeURIComponent(subject)}.html#${encodeURIComponent(emneId)}`;
  }

  function handleSuggestionClick(sug) {
    appendHistory({
      event: "click",
      place_id: s(readTri()?.current_place_id),
      type: sug.type,
      target_id: sug.target_id,
      label: sug.label,
      score: sug.score,
      source: sug.source,
      reason: sug.reason
    });

    dispatchProfileUpdate();

    if (sug.type === "spatial") return openPlace(sug.meta?.place_id || sug.target_id);
    if (sug.type === "narrative") return openPlace(sug.meta?.next_place_id || sug.target_id);
    if (sug.type === "wonderkammer") return openWonderkammer(sug.meta?.entry_id || sug.target_id);
    if (sug.type === "concept") return openConcept(sug);
  }

  function logShow(tri, suggestions) {
    if (!suggestions.length) return;

    appendHistory({
      event: "show",
      place_id: s(tri?.current_place_id),
      category_id: s(tri?.category_id),
      shown: suggestions.map(sug => ({
        type: sug.type,
        target_id: sug.target_id,
        label: sug.label,
        score: sug.score,
        source: sug.source
      }))
    });
  }

  function renderNextUpV2(tri = readTri(), options = {}) {
    if (document.body?.classList.contains("profile-page")) return;

    const panel = ensurePanel();
    if (!panel) return;

    const wasOpen = panel.classList.contains("is-open");
    const suggestions = normalizeSuggestions(tri);

    if (!suggestions.length) {
      panel.innerHTML = `
        <div class="mp-nextup-line mp-nextup-empty">
          <button class="mp-nextup-link" disabled>
            ➜ <b>Neste</b><span>Ingen forslag ennå</span>
          </button>
        </div>
      `;
      setOpen(wasOpen);
      return;
    }

    panel.innerHTML = suggestions.map((sug, index) => `
      <div class="mp-nextup-line" data-nextup-type="${attr(sug.type)}">
        <button class="mp-nextup-link" type="button" data-nextup-index="${index}" title="${attr(sug.reason)}">
          ${suggestionIcon(sug.type)} <b>${esc(suggestionTitle(sug.type))}</b>
          <span>${esc(sug.label)}</span>
          <small>${Math.round(sug.score)} · ${esc(sug.source || "system")}</small>
        </button>
      </div>
    `).join("");

    panel.querySelectorAll("[data-nextup-index]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const sug = suggestions[Number(btn.dataset.nextupIndex)];
        if (sug) handleSuggestionClick(sug);
      });
    });

    if (options.logShow !== false) {
      logShow(tri, suggestions);
    }

    setOpen(wasOpen);
  }

  function debugNextUp() {
    const tri = readTri();
    const suggestions = normalizeSuggestions(tri);
    const panel = document.getElementById(PANEL_ID);
    const btn = document.getElementById(BUTTON_ID);

    const result = {
      HGNavigator: typeof window.HGNavigator,
      buildForPlace: typeof window.HGNavigator?.buildForPlace,
      runtime: "nextUpRuntime.js",
      panelExists: !!panel,
      buttonExists: !!btn,
      panelOpen: !!panel?.classList.contains("is-open"),
      schema: s(tri?.schema || "legacy/empty"),
      current_place_id: s(tri?.current_place_id),
      category_id: s(tri?.category_id),
      suggestions,
      missing: {
        spatial: !suggestions.some(x => x.type === "spatial"),
        wonderkammer: !suggestions.some(x => x.type === "wonderkammer"),
        narrative: !suggestions.some(x => x.type === "narrative"),
        concept: !suggestions.some(x => x.type === "concept")
      },
      because: localStorage.getItem(BECAUSE_KEY) || "",
      recentHistory: readHistory().slice(0, 5)
    };

    console.table(suggestions.map(x => ({
      type: x.type,
      label: x.label,
      score: x.score,
      source: x.source,
      target: x.target_id
    })));
    console.log("[History Go] debugNextUp", result);
    return result;
  }

  function boot() {
    if (document.body?.classList.contains("profile-page")) return;
    ensurePanel();
    window.setTimeout(() => renderNextUpV2(readTri(), { logShow: false }), 40);
  }

  window.renderNextUpV2 = renderNextUpV2;
  window.toggleFooterNextUp = toggleNextUp;
  window.debugNextUp = debugNextUp;
  window.getNextUpHistory = readHistory;

  window.addEventListener("hg:mpNextUp", (e) => {
    const tri = e.detail?.tri || {};
    const becauseLine = e.detail?.becauseLine || "";

    try {
      localStorage.setItem(TRI_KEY, JSON.stringify(tri || {}));
      localStorage.setItem(BECAUSE_KEY, String(becauseLine || ""));
    } catch {}

    window.setTimeout(() => renderNextUpV2(tri), 0);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", boot);
})();
