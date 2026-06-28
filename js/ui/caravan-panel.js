// js/ui/caravan-panel.js
// Read-only UI for Europakaravanen. Does not draw routes or mutate gameplay state.
(function () {
  "use strict";

  const PREFIX = "[HG_CARAVAN_UI]";
  const PANEL_ID = "hgCaravanPanel";
  const BUTTON_ID = "btnKaravane";
  const MODE_LABELS = {
    til_fots: "Til fots",
    hest: "Hest",
    sykkel: "Sykkel"
  };

  let selectedRouteId = "";

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function attr(value) {
    return esc(value).replace(/`/g, "&#96;");
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function cleanText(value) {
    return String(value ?? "").trim();
  }

  function readableMode(mode) {
    const key = cleanText(mode);
    return MODE_LABELS[key] || key;
  }

  function formatList(value, empty = "—") {
    const items = asArray(value).map(readableMode).filter(Boolean);
    return items.length ? items.join(", ") : empty;
  }

  function uniqueModesForRoute(routeId) {
    const seen = new Set();
    for (const stage of getStages(routeId)) {
      for (const mode of asArray(stage?.allowed_modes)) {
        if (cleanText(mode)) seen.add(cleanText(mode));
      }
    }
    return Array.from(seen).map(readableMode);
  }

  function getRuntime() {
    const runtime = window.HG_CARAVAN;
    if (!runtime || !Array.isArray(runtime.routes)) return null;
    if (!runtime.routes.length && !asArray(runtime.stages).length && !asArray(runtime.nodes).length) return null;
    return runtime;
  }

  function getStages(routeId) {
    const runtime = getRuntime();
    if (!runtime) return [];
    const key = cleanText(routeId);
    const indexed = runtime.indexes?.stagesByRoute?.[key];
    const stages = Array.isArray(indexed)
      ? indexed
      : asArray(runtime.stages).filter((stage) => cleanText(stage?.route_id) === key);
    return stages.slice().sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0));
  }

  function nodeTitle(nodeId) {
    const id = cleanText(nodeId);
    if (!id) return "—";
    const node = getRuntime()?.indexes?.nodesById?.[id] || asArray(getRuntime()?.nodes).find((item) => cleanText(item?.id) === id);
    const title = cleanText(node?.title);
    if (title) return title;
    console.warn(PREFIX, "node mangler", id);
    return id;
  }

  function ensurePanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;

    panel = document.createElement("aside");
    panel.id = PANEL_ID;
    panel.className = "hg-caravan-panel";
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("aria-label", "Karavane");
    document.body.appendChild(panel);
    return panel;
  }

  function routeCard(route) {
    const id = cleanText(route?.id);
    const stages = getStages(id);
    const modes = uniqueModesForRoute(id);
    return `
      <button type="button" class="hg-caravan-route ${id === selectedRouteId ? "is-active" : ""}" data-caravan-route="${attr(id)}">
        <span class="hg-caravan-route-title">${esc(route?.title || id || "Uten tittel")}</span>
        ${cleanText(route?.subtitle) ? `<span class="hg-caravan-route-subtitle">${esc(route.subtitle)}</span>` : ""}
        <span class="hg-caravan-route-meta">ID: ${esc(id || "—")} · ${stages.length} stages · ${esc(modes.join(", ") || "—")}</span>
      </button>`;
  }

  function field(label, value) {
    const text = Array.isArray(value) ? formatList(value) : cleanText(value);
    if (!text || text === "—") return "";
    return `<div class="hg-caravan-stage-field"><dt>${esc(label)}</dt><dd>${esc(text)}</dd></div>`;
  }

  function stageCard(stage) {
    const from = nodeTitle(stage?.from_node);
    const to = nodeTitle(stage?.to_node);
    return `
      <article class="hg-caravan-stage">
        <h4>${esc(stage?.order ?? "—")}. ${esc(from)} → ${esc(to)}</h4>
        <dl>
          ${field("Distanse", stage?.approximate_distance_km != null ? `${stage.approximate_distance_km} km` : "")}
          ${field("Distanse-sikkerhet", stage?.distance_confidence)}
          ${field("Reisemåter", stage?.allowed_modes)}
          ${field("Underlag", stage?.surface_types)}
          ${field("Læringskroker", stage?.learning_hooks)}
          ${field("Risiko", stage?.risk_tags)}
          ${field("Historieprompt", stage?.history_prompt)}
          ${field("Observasjonsprompt", stage?.observation_prompt)}
        </dl>
      </article>`;
  }

  function render(selected = selectedRouteId) {
    selectedRouteId = cleanText(selected);
    const panel = ensurePanel();
    const runtime = getRuntime();

    if (!runtime) {
      panel.innerHTML = shell(`<p class="hg-caravan-empty">Karavanedata er ikke lastet ennå</p>`);
      wire(panel);
      return panel;
    }

    const routes = asArray(runtime.routes);
    const route = routes.find((item) => cleanText(item?.id) === selectedRouteId) || null;
    const stagesHtml = route
      ? `<section class="hg-caravan-stages" aria-live="polite"><h3>${esc(route.title || route.id)} – stages</h3>${getStages(route.id).map(stageCard).join("") || `<p class="hg-caravan-empty">Ingen stages funnet.</p>`}</section>`
      : `<p class="hg-caravan-hint">Velg en route for å se stages i rekkefølge.</p>`;

    panel.innerHTML = shell(`
      <div class="hg-caravan-intro"><strong>Europakaravanen</strong><span>Fra Oslo til Roma, Lisboa og Constanța uten bil</span></div>
      <section class="hg-caravan-routes"><h3>Routes</h3>${routes.map(routeCard).join("") || `<p class="hg-caravan-empty">Ingen routes funnet.</p>`}</section>
      ${stagesHtml}
    `);
    wire(panel);
    return panel;
  }

  function shell(body) {
    return `
      <div class="hg-caravan-panel-card">
        <header class="hg-caravan-head">
          <div><p class="hg-caravan-kicker">Read-only data</p><h2>Karavane</h2></div>
          <button type="button" class="hg-caravan-close" data-caravan-close aria-label="Lukk Karavane">×</button>
        </header>
        ${body}
      </div>`;
  }

  function wire(panel) {
    panel.querySelector("[data-caravan-close]")?.addEventListener("click", close);
    panel.querySelectorAll("[data-caravan-route]").forEach((btn) => {
      btn.addEventListener("click", () => render(btn.getAttribute("data-caravan-route") || ""));
    });
  }

  function open(routeId) {
    const panel = render(routeId || selectedRouteId);
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("hg-caravan-open");
  }

  function close() {
    const panel = ensurePanel();
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("hg-caravan-open");
  }

  function bindEntryButton() {
    document.getElementById(BUTTON_ID)?.addEventListener("click", () => open());
  }

  window.HG_CARAVAN_UI_DEBUG = { open, close, renderRoute: (routeId) => open(routeId) };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEntryButton, { once: true });
  } else {
    bindEntryButton();
  }
})();
