// @ts-nocheck
// js/ui/place-popup-shortcuts.js
// Phase 7 compatibility routing. The former six-button popup rail is retired;
// title/description and programmatic callers still route to canonical sections.
(function installPlacePopupShortcuts(global) {
  "use strict";

  const WRAP_ATTR = "data-hg-place-popup-shortcuts";
  const BOUND_FLAG = "__HG_PLACE_POPUP_SHORTCUTS_BOUND__";
  const INFO_TARGET_SELECTOR = "#pcTitle, #pcDesc";
  const SHORTCUTS = Object.freeze([
    { id: "history", label: "Historie" },
    { id: "stories", label: "Fortellinger" },
    { id: "before-after", label: "Før/etter" },
    { id: "news", label: "Nyheter" },
    { id: "reading", label: "Lesespor" },
    { id: "sources", label: "Kilder" }
  ]);

  const text = value => String(value == null ? "" : value).trim();

  function currentPlace() {
    const id = text(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? (Array.isArray(global.PLACES) ? global.PLACES : []).find(place => text(place?.id) === id) || null : null;
  }

  function prepareInfoTargets(card = document.getElementById("placeCard")) {
    if (!card) return;
    card.querySelectorAll(INFO_TARGET_SELECTOR).forEach(target => {
      target.classList.add("pc-place-popup-info-trigger");
      target.setAttribute("role", "button");
      target.setAttribute("tabindex", "0");
      target.setAttribute("aria-label", "Åpne mer om stedet");
      target.setAttribute("title", "Åpne mer om stedet");
    });
  }

  function retireLegacyGeometry() {
    const card = document.getElementById("placeCard");
    if (!card) return null;
    card.querySelectorAll(`[${WRAP_ATTR}]`).forEach(node => node.remove());
    prepareInfoTargets(card);
    return null;
  }

  function openShortcut(tabId) {
    const place = currentPlace();
    if (!place) return;
    if (typeof global.HGPlacePopupTabs?.openTab === "function") {
      return global.HGPlacePopupTabs.openTab(place, tabId);
    }
    if (typeof global.showPlacePopup !== "function") return;
    return global.showPlacePopup(place, tabId);
  }

  function bind() {
    if (global[BOUND_FLAG]) return;
    global[BOUND_FLAG] = true;
    document.addEventListener("click", event => {
      const infoTarget = event.target instanceof Element ? event.target.closest(INFO_TARGET_SELECTOR) : null;
      if (!(infoTarget instanceof HTMLElement) || !infoTarget.closest("#placeCard")) return;
      event.preventDefault();
      event.stopPropagation();
      openShortcut("about");
    }, true);

    document.addEventListener("keydown", event => {
      if (!["Enter", " "].includes(event.key)) return;
      const infoTarget = event.target instanceof Element ? event.target.closest(INFO_TARGET_SELECTOR) : null;
      if (!(infoTarget instanceof HTMLElement) || !infoTarget.closest("#placeCard")) return;
      event.preventDefault();
      event.stopPropagation();
      openShortcut("about");
    }, true);
  }

  function init() {
    retireLegacyGeometry();
    bind();
  }

  global.HGPlacePopupShortcuts = {
    ensureDom: retireLegacyGeometry,
    open: openShortcut,
    openAbout: () => openShortcut("about"),
    shortcuts: SHORTCUTS.map(item => ({ ...item }))
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
  ["hg:appReady", "hg:place-selected", "hg:placesUpdated"].forEach(name => global.addEventListener?.(name, retireLegacyGeometry));
})(window);
