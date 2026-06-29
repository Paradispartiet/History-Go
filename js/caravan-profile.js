// js/caravan-profile.js
// Read-only Karavane summary for profile.html. Reads existing local APIs/storage only.
(function () {
  "use strict";

  const PREFIX = "[HG_CARAVAN_PROFILE]";
  const MODES = ["til_fots", "hest", "sykkel"];
  const MODE_LABELS = { til_fots: "Til fots", hest: "Hest", sykkel: "Sykkel" };
  const RESOURCE_LABELS = { energi: "Energi", vann: "Vann", hvile: "Hvile", hestehelse: "Hestehelse", sykkelstand: "Sykkelstand", utstyr: "Utstyr" };
  const RESOURCE_KEYS_BY_MODE = {
    til_fots: ["energi", "vann", "hvile", "utstyr"],
    hest: ["energi", "vann", "hvile", "hestehelse", "utstyr"],
    sykkel: ["energi", "vann", "hvile", "sykkelstand", "utstyr"]
  };

  function warn(message, detail) { if (detail !== undefined) console.warn(PREFIX, message, detail); else console.warn(PREFIX, message); }
  function clean(value) { return String(value ?? "").trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function esc(value) {
    return clean(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }
  function safeApi(name, method) {
    const fn = window[name]?.[method];
    if (typeof fn === "function") return fn.bind(window[name]);
    warn(`${name}.${method} mangler`);
    return null;
  }
  function routes() { return asArray(window.HG_CARAVAN?.routes); }
  function stagesForRoute(routeId) {
    const rid = clean(routeId);
    return asArray(window.HG_CARAVAN?.stages).filter((stage) => clean(stage?.route_id) === rid);
  }
  function latestStatus(routeId) {
    const state = safeApi("HG_CARAVAN_PROGRESS", "getAll")?.();
    const entries = [];
    const progress = state?.progress?.[clean(routeId)] || {};
    for (const [stageId, byMode] of Object.entries(progress)) {
      for (const [mode, entry] of Object.entries(byMode || {})) {
        if (entry?.status && entry.status !== "none") entries.push({ stageId, mode, status: entry.status, updatedAt: clean(entry.updatedAt) });
      }
    }
    entries.sort((a, b) => clean(b.updatedAt).localeCompare(clean(a.updatedAt)));
    const latest = entries[0];
    return latest ? `${MODE_LABELS[latest.mode] || latest.mode}: ${latest.status}` : "";
  }
  function routeModeCount(routeId, mode) {
    const summary = safeApi("HG_CARAVAN_PROGRESS", "getRouteSummary")?.(routeId, mode);
    if (summary) return { completed: Number(summary.completed || 0), total: Number(summary.total || 0) };
    return { completed: 0, total: stagesForRoute(routeId).length };
  }
  function eventChoiceCount() {
    const all = safeApi("HG_CARAVAN_EVENT_LOG", "getAll")?.();
    return asArray(all?.entries).length;
  }
  function getBadgeSummary() {
    const apiSummary = safeApi("HG_CARAVAN_BADGES", "summary")?.() || { total: asArray(window.HG_CARAVAN?.badges).length, unlocked: 0 };
    const unlockedMap = safeApi("HG_CARAVAN_BADGES", "getUnlocked")?.() || {};
    const allBadges = safeApi("HG_CARAVAN_BADGES", "getAllBadges")?.() || asArray(window.HG_CARAVAN?.badges);
    const unlocked = Object.entries(unlockedMap).map(([id, state]) => {
      const badge = allBadges.find((item) => clean(item?.id) === clean(id)) || { id };
      return { id, title: clean(badge.title) || id, unlockedAt: clean(state?.unlockedAt) };
    }).sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt));
    return { total: Number(apiSummary.total || allBadges.length || 0), unlockedCount: Number(apiSummary.unlocked || unlocked.length || 0), unlocked, allBadges };
  }
  function getLatestDiaryEntries(limit = 8) {
    const diary = safeApi("HG_CARAVAN_DIARY", "getEntries");
    let entries = [];
    if (diary) entries = routes().flatMap((route) => asArray(diary(route.id, "all")));
    if (!entries.length) {
      const progress = safeApi("HG_CARAVAN_PROGRESS", "getAll")?.()?.progress || {};
      for (const [routeId, stages] of Object.entries(progress)) for (const [stageId, byMode] of Object.entries(stages || {})) for (const [mode, entry] of Object.entries(byMode || {})) {
        if (entry?.status && entry.status !== "none") entries.push({ type: "progress", route_id: routeId, stage_id: stageId, mode, createdAt: entry.updatedAt, title: `${MODE_LABELS[mode] || mode}: ${entry.status} (${stageId})` });
      }
      const log = safeApi("HG_CARAVAN_EVENT_LOG", "getAll")?.();
      for (const entry of asArray(log?.entries)) entries.push({ type: "event_choice", createdAt: entry.createdAt, title: `Hendelsesvalg: ${entry.choice_id} (${MODE_LABELS[entry.travel_mode] || entry.travel_mode})` });
    }
    return entries.sort((a, b) => clean(b.createdAt).localeCompare(clean(a.createdAt))).slice(0, limit);
  }
  function resourceRows() {
    const all = safeApi("HG_CARAVAN_RESOURCES", "getAll")?.()?.resources || {};
    return Object.entries(all).flatMap(([routeId, byMode]) => Object.entries(byMode || {}).map(([mode, values]) => ({ routeId, mode, values })));
  }
  function getSummary() {
    const totalByMode = Object.fromEntries(MODES.map((mode) => [mode, 0]));
    for (const route of routes()) for (const mode of MODES) totalByMode[mode] += routeModeCount(route.id, mode).completed;
    return { routes: routes().length, stagesCompletedByMode: totalByMode, eventChoices: eventChoiceCount(), badges: getBadgeSummary() };
  }
  function render() {
    const root = document.getElementById("caravanProfileSummary");
    if (!root) return null;
    if (!window.HG_CARAVAN) {
      root.innerHTML = '<p class="muted">Karavanedata er ikke lastet ennå</p>';
      return null;
    }
    const summary = getSummary();
    const routeCards = routes().map((route) => {
      const counts = MODES.map((mode) => {
        const count = routeModeCount(route.id, mode);
        return `<li><strong>${MODE_LABELS[mode]}:</strong> ${count.completed}/${count.total} etapper fullført</li>`;
      }).join("");
      const status = latestStatus(route.id);
      return `<article class="caravan-profile-card"><h3>${esc(route.title || route.id)}</h3><p>${esc(route.subtitle || "")}</p><ul>${counts}</ul>${status ? `<p class="caravan-profile-muted">Siste status: ${esc(status)}</p>` : ""}</article>`;
    }).join("");
    const diary = getLatestDiaryEntries(8).map((entry) => `<li><span>${esc(entry.title || entry.type || "Karavaneaktivitet")}</span>${entry.createdAt ? `<time>${esc(entry.createdAt.slice(0, 10))}</time>` : ""}</li>`).join("");
    const badges = summary.badges;
    const latestBadges = badges.unlocked.slice(0, 8).map((badge) => `<li>${esc(badge.title)}</li>`).join("");
    const resources = resourceRows().map((row) => {
      const route = routes().find((item) => clean(item.id) === clean(row.routeId));
      const lines = (RESOURCE_KEYS_BY_MODE[row.mode] || []).map((key) => `<span>${RESOURCE_LABELS[key] || key} ${Number(row.values?.[key] ?? 100)}</span>`).join("");
      return `<article class="caravan-profile-resource"><h4>${esc(route?.title || row.routeId)} — ${esc(MODE_LABELS[row.mode] || row.mode)}</h4><div>${lines}</div></article>`;
    }).join("");
    root.innerHTML = `<div class="caravan-profile-overview"><h3>Europakaravanen</h3><dl><dt>Etapper fullført</dt><dd>${MODES.map((mode) => `${MODE_LABELS[mode]}: ${summary.stagesCompletedByMode[mode]}`).join(" · ")}</dd><dt>Merker</dt><dd>${badges.unlockedCount}/${badges.total} låst opp</dd><dt>Hendelsesvalg</dt><dd>${summary.eventChoices} valg logget</dd></dl></div><div class="caravan-profile-block"><h3>Ruteoppsummering</h3>${routeCards || '<p class="muted">Ingen karavaneruter er lastet ennå.</p>'}</div><div class="caravan-profile-block"><h3>Siste dagbok</h3>${diary ? `<ul class="caravan-profile-diary">${diary}</ul>` : '<p class="muted">Ingen karavaneaktivitet ennå</p>'}</div><div class="caravan-profile-block"><h3>Merker</h3><p>${badges.unlockedCount}/${badges.total} låst opp</p>${latestBadges ? `<ul class="caravan-profile-badges">${latestBadges}</ul>` : '<p class="muted">Ingen Karavane-merker låst opp ennå.</p>'}</div><div class="caravan-profile-block"><h3>Reisestatus</h3>${resources || '<p class="muted">Ingen reisestatus registrert.</p>'}</div>`;
    return getSummary();
  }
  function init() {
    window.HG_CARAVAN_PROFILE_DEBUG = { render, getSummary, getLatestDiaryEntries, getBadgeSummary };
    const loadThenRender = () => {
      if (window.HGCaravanLoader?.load) window.HGCaravanLoader.load({ cache: "no-store" }).then(render).catch((error) => { warn("lasting feilet", error?.message || error); render(); });
      else render();
    };
    loadThenRender();
    ["hg:caravanProgressUpdated", "hg:caravanEventChoiceUpdated", "hg:caravanConsequencesUpdated", "hg:caravanResourcesUpdated", "hg:caravanBadgeUnlocked"].forEach((eventName) => window.addEventListener(eventName, render));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
