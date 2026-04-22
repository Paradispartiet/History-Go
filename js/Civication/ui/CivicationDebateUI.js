(function () {
  "use strict";

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  function renderDebatePanel() {
    const host = document.getElementById("civiDebatePanel");
    if (!host) return;

    const active = getActive();
    if (!active) {
      host.innerHTML = `
        <div class="muted">Du trenger en aktiv rolle før du kan gå inn i samfunnsdebatter.</div>
      `;
      return;
    }

    const engine = window.CivicationDebateEngine;
    if (!engine) {
      host.innerHTML = `<div class="muted">Debattmotoren er ikke lastet.</div>`;
      return;
    }

    const last = engine.getLastResult?.();
    if (last) {
      host.innerHTML = `
        <div class="latest-knowledge-box">
          <div class="lk-topic">Forrige debatt: ${last.theme || "Debatt"}</div>
          <div class="lk-category">Motpart: ${last.opponent || "—"}</div>
          <div class="lk-category">Strategi: ${last.strategy_label || "—"}</div>
          <div class="lk-category">Utfall: ${formatOutcome(last.outcome)}</div>
          <div class="lk-text">${last.text || "—"}</div>
          <div class="profile-subaction" style="margin-top:10px;">
            <button id="civiDebateNextBtn" class="btn">Neste debatt</button>
          </div>
        </div>
      `;

      document.getElementById("civiDebateNextBtn")?.addEventListener("click", function () {
        engine.dismissLastResult?.();
        renderDebatePanel();
      });
      return;
    }

    const current = engine.getCurrentDebate?.(active);
    if (!current?.scenario) {
      host.innerHTML = `<div class="muted">Ingen debatt tilgjengelig akkurat nå.</div>`;
      return;
    }

    const scenario = current.scenario;
    const options = engine.getStrategyOptions?.(scenario) || [];
    const knowledge = engine.getKnowledgeScore?.(scenario.relevant_categories || []) || 0;

    host.innerHTML = `
      <div class="latest-knowledge-box">
        <div class="lk-topic">${scenario.title || "Debatt"}</div>
        <div class="lk-category">Motpart: ${scenario.opponent || "—"}</div>
        <div class="lk-category">Tema: ${scenario.theme || "—"}</div>
        <div class="lk-text">${scenario.description || "—"}</div>
        <div class="lk-category" style="margin-top:10px;">Relevant kunnskapsscore: <strong>${knowledge}</strong></div>
        <div class="lk-category">Kategorier: ${(scenario.relevant_categories || []).join(", ")}</div>
      </div>

      <div id="civiDebateChoices" class="profile-subaction" style="display:flex;flex-direction:column;gap:8px;margin-top:10px;"></div>
      <div id="civiDebatePreview" class="lk-category" style="margin-top:10px;"></div>
    `;

    const choiceBox = document.getElementById("civiDebateChoices");
    const previewEl = document.getElementById("civiDebatePreview");

    options.forEach(function (option) {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = option.label;

      btn.addEventListener("click", function () {
        const result = engine.resolveCurrentDebate?.(option.id, active);
        if (!result?.ok) return;
        renderDebatePanel();
      });

      btn.addEventListener("mouseenter", function () {
        const preview = engine.previewStrategy?.(active, option.id);
        if (!previewEl || !preview) return;
        previewEl.textContent = `Trykk: ${preview.total} · Motstand: ${preview.resistance} · Sannsynlig utfall: ${formatOutcome(preview.outcome)}`;
      });

      btn.addEventListener("focus", function () {
        const preview = engine.previewStrategy?.(active, option.id);
        if (!previewEl || !preview) return;
        previewEl.textContent = `Trykk: ${preview.total} · Motstand: ${preview.resistance} · Sannsynlig utfall: ${formatOutcome(preview.outcome)}`;
      });

      choiceBox?.appendChild(btn);
    });
  }

  function formatOutcome(outcome) {
    if (outcome === "decisive_win") return "klar seier";
    if (outcome === "win") return "seier";
    if (outcome === "partial") return "delvis gjennomslag";
    return "tap";
  }

  window.CivicationDebateUI = {
    render: renderDebatePanel
  };

  document.addEventListener("DOMContentLoaded", renderDebatePanel);
  window.addEventListener("updateProfile", renderDebatePanel);
  window.addEventListener("civi:booted", renderDebatePanel);
})();
