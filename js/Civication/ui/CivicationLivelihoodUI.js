(function initCivicationLivelihoodUI(globalScope) {
  "use strict";

  const window = /** @type {any} */ (globalScope);
  let initialized = false;
  let renderQueued = false;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatPc(value) {
    const number = Number(value || 0);
    const prefix = number > 0 ? "+" : "";
    return `${prefix}${Math.round(number)} PC`;
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    const run = () => {
      renderQueued = false;
      render();
    };
    if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(run);
    else window.setTimeout(run, 0);
  }

  function opportunityHtml(opportunity, api) {
    const eligibility = api.isOpportunityEligible(opportunity);
    const sourceLabel = opportunity?.source?.label || opportunity?.source?.id || opportunity?.source?.type || "ukjent kilde";
    const requirement = !eligibility.ok
      ? `<div style="margin-top:3px;font-size:.8em;opacity:.66">Ikke tilgjengelig nå: ${escapeHtml(eligibility.reason)}</div>`
      : "";
    return `
      <div data-livelihood-opportunity="${escapeHtml(opportunity.id)}" style="margin-top:7px;padding:7px 8px;border:1px solid rgba(0,0,0,.12);border-radius:8px">
        <div><strong>${escapeHtml(opportunity.label)}</strong> · ${escapeHtml(opportunity.kind_id)}</div>
        ${opportunity.description ? `<div style="margin-top:2px;font-size:.86em">${escapeHtml(opportunity.description)}</div>` : ""}
        <div style="margin-top:3px;font-size:.8em;opacity:.68">Kilde: ${escapeHtml(sourceLabel)}</div>
        ${requirement}
        <div style="display:flex;gap:6px;margin-top:6px">
          <button type="button" data-livelihood-accept="${escapeHtml(opportunity.id)}"${eligibility.ok ? "" : " disabled"}>Ta muligheten</button>
          <button type="button" data-livelihood-reject="${escapeHtml(opportunity.id)}">Nei takk</button>
        </div>
      </div>`;
  }

  function streamHtml(stream, projectionItem) {
    const projected = projectionItem ? formatPc(projectionItem.net) : "—";
    const sourceLabel = stream?.source?.label || stream?.source?.id || stream?.source?.type || "ukjent kilde";
    return `
      <div data-livelihood-stream="${escapeHtml(stream.id)}" style="margin-top:6px">
        <strong>${escapeHtml(stream.label)}</strong>
        <span style="opacity:.72"> · denne uka ${escapeHtml(projected)}</span>
        <div style="font-size:.8em;opacity:.66">${escapeHtml(sourceLabel)} · ${escapeHtml(stream.kind_id)}</div>
      </div>`;
  }

  function render() {
    const host = document.getElementById("activeJobCard");
    const api = window.CivicationLivelihoods;
    if (!host || !api?.getSnapshot) return;

    host.querySelector("[data-civi-livelihood]")?.remove();

    const snapshot = api.getSnapshot();
    const streams = Array.isArray(snapshot?.active_streams) ? snapshot.active_streams : [];
    const opportunities = Array.isArray(snapshot?.pending_opportunities) ? snapshot.pending_opportunities : [];
    const projectionItems = Array.isArray(snapshot?.current_week_projection?.items)
      ? snapshot.current_week_projection.items
      : [];
    const projectedNet = Number(snapshot?.current_week_projection?.net || 0);

    const block = document.createElement("div");
    block.setAttribute("data-civi-livelihood", "1");
    block.style.cssText = "margin-top:12px;padding-top:12px;border-top:1px solid rgba(0,0,0,.15)";

    const streamRows = streams.map((stream) => {
      const item = projectionItems.find((entry) => entry.stream_id === stream.id) || null;
      return streamHtml(stream, item);
    }).join("");

    const opportunityRows = opportunities.map((opportunity) => opportunityHtml(opportunity, api)).join("");

    block.innerHTML = `
      <div><strong>💸 Levevei</strong></div>
      <div style="margin-top:4px;font-size:.9em">
        ${streams.length
          ? `${streams.length} aktiv${streams.length === 1 ? "" : "e"} inntektsstrøm${streams.length === 1 ? "" : "mer"} · estimert denne uka <strong>${escapeHtml(formatPc(projectedNet))}</strong>`
          : "Ingen side- eller alternativ inntekt registrert."}
      </div>
      ${streamRows}
      ${opportunities.length ? `<div style="margin-top:9px"><strong>Muligheter</strong>${opportunityRows}</div>` : ""}
      <div style="margin-top:7px;font-size:.82em;opacity:.68">Levevei endrer ikke arbeidsstatus eller livsposisjon. Inntekt krever en faktisk kilde og en akseptert mulighet.</div>
    `;

    host.appendChild(block);

    block.querySelectorAll("[data-livelihood-accept]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = String(button.getAttribute("data-livelihood-accept") || "");
        const result = api.acceptOpportunity(id);
        if (result?.ok) queueRender();
      });
    });

    block.querySelectorAll("[data-livelihood-reject]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = String(button.getAttribute("data-livelihood-reject") || "");
        const result = api.rejectOpportunity(id);
        if (result?.ok) queueRender();
      });
    });
  }

  function init() {
    if (initialized) {
      queueRender();
      return;
    }
    initialized = true;
    ["updateProfile", "civi:livelihoodChanged", "civi:livelihoodCatalogLoaded", "civi:dataReady", "civi:lifePositionChanged"]
      .forEach((eventName) => window.addEventListener(eventName, queueRender));
    queueRender();
  }

  window.CivicationLivelihoodUI = { init, render };
})(typeof window !== "undefined" ? window : globalThis);
