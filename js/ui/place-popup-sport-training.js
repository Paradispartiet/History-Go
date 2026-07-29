// @ts-nocheck
// js/ui/place-popup-sport-training.js
// Trening er sportsinnhold i stedspopupen, ikke en generell På stedet-handling.
(function installPlacePopupSportTraining(global) {
  "use strict";

  const FLAG = "__HG_PLACE_POPUP_SPORT_TRAINING_INSTALLED__";
  const SECTION_ATTR = "data-hg-sport-training";

  const text = value => String(value == null ? "" : value).trim();
  const list = value => Array.isArray(value) ? value : [];
  const esc = value => String(value == null ? "" : value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  function isSportsPlace(place) {
    const category = text(place?.category || place?.categoryId).toLowerCase();
    const profile = place?.sport_profile;
    return category === "sport" || Boolean(profile && typeof profile === "object" && Object.keys(profile).length);
  }

  function render(place) {
    if (!isSportsPlace(place)) return "";
    const profile = place?.training_profile && typeof place.training_profile === "object" ? place.training_profile : null;
    if (!profile) return "";
    const exercises = list(profile.exercises).filter(Boolean);
    const summary = text(profile.summary);
    const safety = text(profile.safety);
    if (!summary && !safety && !exercises.length) return "";

    return `
      <section class="hg-section hg-place-section hg-place-sport-training-section" ${SECTION_ATTR}="1">
        <h3>Trening</h3>
        ${summary ? `<p>${esc(summary)}</p>` : ""}
        ${safety ? `<p><strong>Trygghet:</strong> ${esc(safety)}</p>` : ""}
        ${exercises.length ? `<div class="hg-place-sport-training-list">${exercises.map(exercise => {
          const duration = Number(exercise?.duration_minutes);
          const meta = [Number.isFinite(duration) && duration > 0 ? `${duration} min` : "", text(exercise?.intensity)].filter(Boolean).join(" · ");
          return `<article class="hg-place-sport-training-item">${text(exercise?.title) ? `<h4>${esc(exercise.title)}</h4>` : ""}${meta ? `<div class="hg-place-chip-list"><span class="hg-place-chip">${esc(meta)}</span></div>` : ""}${text(exercise?.instruction || exercise?.desc) ? `<p>${esc(exercise.instruction || exercise.desc)}</p>` : ""}${text(exercise?.why) ? `<p><strong>Hvorfor:</strong> ${esc(exercise.why)}</p>` : ""}</article>`;
        }).join("")}</div>` : ""}
      </section>`;
  }

  function inject(place) {
    const html = render(place);
    if (!html) return;
    const body = document.querySelector(".hg-popup.place-popup-v2 .hg-place-popup-body");
    if (!body || body.querySelector(`[${SECTION_ATTR}]`)) return;
    body.insertAdjacentHTML("beforeend", html);
  }

  function install() {
    if (global[FLAG]) return true;
    if (!global.__HG_PLACE_POPUP_V2_INSTALLED__ || typeof global.showPlacePopup !== "function") return false;
    const previous = global.showPlacePopup;
    const wrapped = function showPlacePopupWithSportTraining(place) {
      const result = previous.apply(this, arguments);
      const apply = () => inject(place);
      if (result && typeof result.then === "function") result.then(apply, () => {});
      else global.setTimeout(apply, 0);
      return result;
    };
    // Bevar popup-kontrakten gjennom wrapper-kjeden. place-popup-tabs.js bruker
    // disse markørene for å vite at den kan dekorere den eksisterende V2-popupen.
    wrapped.__hgPlacePopupV2 = previous.__hgPlacePopupV2 === true || global.__HG_PLACE_POPUP_V2_INSTALLED__ === true;
    wrapped.__previous = previous;
    global.showPlacePopup = wrapped;
    global[FLAG] = true;
    global.HGPlacePopupSportTraining = { render, inject, isSportsPlace };
    return true;
  }

  if (!install()) {
    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (install() || attempts > 400) global.clearInterval(timer);
    }, 50);
  }
})(window);
