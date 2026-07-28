// js/ui/place-popup-actions.js
// Overgangsflate for tidligere handlingsrundinger: tasks/training/play skal ikke forsvinne
// når PlaceCard-rundinger avgrenses til visuelle samlinger.
(function installPlacePopupActions(global) {
  "use strict";

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function currentPlace() {
    const id = text(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return (Array.isArray(global.PLACES) ? global.PLACES : []).find(place => text(place?.id) === id) || null;
  }

  function actionRows(items, mode) {
    return list(items).map(item => {
      if (!item || typeof item !== "object") return "";
      const title = text(item.title || item.name);
      const instruction = text(item.instruction || item.desc || item.description || item.activityText);
      const why = text(item.why || item.reason);
      const duration = Number(item.duration_minutes || item.durationMinutes);
      const intensity = text(item.intensity);
      const meta = [Number.isFinite(duration) && duration > 0 ? `${duration} min` : "", intensity].filter(Boolean).join(" · ");
      if (!title && !instruction && !why) return "";
      return `<article class="hg-place-tab-card is-compact" data-place-action-kind="${esc(mode)}">${title ? `<strong>${esc(title)}</strong>` : ""}${meta ? `<span>${esc(meta)}</span>` : ""}${instruction ? `<p>${esc(instruction)}</p>` : ""}${why ? `<p><em>Hvorfor: ${esc(why)}</em></p>` : ""}</article>`;
    }).filter(Boolean).join("");
  }

  function renderActions(place) {
    if (!place) return "";
    const taskProfile = place.tasks_profile && typeof place.tasks_profile === "object" ? place.tasks_profile : null;
    const trainingProfile = place.training_profile && typeof place.training_profile === "object" ? place.training_profile : null;
    const playProfile = place.play_profile && typeof place.play_profile === "object" ? place.play_profile : null;

    const blocks = [];
    if (taskProfile) {
      const rows = actionRows(taskProfile.tasks, "task");
      if (rows || text(taskProfile.summary)) blocks.push(`<section class="hg-section hg-place-section hg-place-tab-section"><h3>${esc(taskProfile.title || "Oppgaver")}</h3>${taskProfile.summary ? `<p>${esc(taskProfile.summary)}</p>` : ""}${rows ? `<div class="hg-place-tab-card-list">${rows}</div>` : ""}</section>`);
    }
    if (trainingProfile) {
      const rows = actionRows(trainingProfile.exercises, "training");
      if (rows || text(trainingProfile.summary) || text(trainingProfile.safety)) blocks.push(`<section class="hg-section hg-place-section hg-place-tab-section"><h3>${esc(trainingProfile.title || "Trening")}</h3>${trainingProfile.summary ? `<p>${esc(trainingProfile.summary)}</p>` : ""}${trainingProfile.safety ? `<p><strong>Trygghet:</strong> ${esc(trainingProfile.safety)}</p>` : ""}${rows ? `<div class="hg-place-tab-card-list">${rows}</div>` : ""}</section>`);
    }
    if (playProfile) {
      const rows = actionRows(playProfile.activities || playProfile.items || playProfile.tasks, "play");
      if (rows || text(playProfile.summary)) blocks.push(`<section class="hg-section hg-place-section hg-place-tab-section"><h3>${esc(playProfile.title || "Lek")}</h3>${playProfile.summary ? `<p>${esc(playProfile.summary)}</p>` : ""}${rows ? `<div class="hg-place-tab-card-list">${rows}</div>` : ""}</section>`);
    }

    return blocks.length ? `<div class="hg-place-tab-generated" data-generated="actions"><h2 class="hg-place-tab-subheading">Gjør på stedet</h2>${blocks.join("")}</div>` : "";
  }

  function inject() {
    const popup = document.querySelector(".hg-popup.place-popup-v2");
    const more = popup?.querySelector('[data-place-panel="more"]');
    if (!more || more.querySelector('[data-generated="actions"]')) return;
    const html = renderActions(currentPlace());
    if (html) more.insertAdjacentHTML("beforeend", html);
  }

  const observer = new MutationObserver(inject);
  const start = () => {
    inject();
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  global.HGPlacePopupActions = { inject, renderActions };
})(window);
