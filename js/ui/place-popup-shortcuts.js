// @ts-nocheck
// js/ui/place-popup-shortcuts.js
// Åtte faste snarveier fra PlaceCard til de canonical stedspopup-fanene.
(function installPlacePopupShortcuts(global) {
  "use strict";

  const WRAP_ATTR = "data-hg-place-popup-shortcuts";
  const BOUND_FLAG = "__HG_PLACE_POPUP_SHORTCUTS_BOUND__";
  const SHORTCUTS = Object.freeze([
    { id: "about", label: "Om", icon: "ⓘ" },
    { id: "history", label: "Historie", icon: "◷" },
    { id: "stories", label: "Fortellinger", icon: "✦" },
    { id: "before-after", label: "Før/etter", icon: "⇄" },
    { id: "news", label: "Nyheter", icon: "▤" },
    { id: "reading", label: "Lesespor", icon: "▥" },
    { id: "sources", label: "Kilder", icon: "⌁" },
    { id: "more", label: "Mer", icon: "•••" }
  ]);

  const text = value => String(value == null ? "" : value).trim();

  function currentPlace() {
    const id = text(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? (Array.isArray(global.PLACES) ? global.PLACES : []).find(place => text(place?.id) === id) || null : null;
  }

  function button(def) {
    return `<button type="button" class="pc-place-popup-shortcut" data-place-popup-tab="${def.id}" aria-label="${def.label}" title="${def.label}"><span class="pc-place-popup-shortcut-icon" aria-hidden="true">${def.icon}</span><span class="pc-place-popup-shortcut-label">${def.label}</span></button>`;
  }

  function ensureDom() {
    const card = document.getElementById("placeCard");
    const side = card?.querySelector(".pc-side-stack");
    if (!side) return null;
    let wrap = side.querySelector(`[${WRAP_ATTR}]`);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "pc-place-popup-shortcuts";
      wrap.setAttribute(WRAP_ATTR, "1");
      wrap.setAttribute("role", "group");
      wrap.setAttribute("aria-label", "Stedsinformasjon");
      wrap.innerHTML = SHORTCUTS.map(button).join("");
      side.appendChild(wrap);
    }
    return wrap;
  }

  function openShortcut(tabId) {
    const place = currentPlace();
    if (!place) return;
    if (typeof global.HGPlacePopupTabs?.openTab === "function") {
      global.HGPlacePopupTabs.openTab(place, tabId);
      return;
    }
    if (typeof global.showPlacePopup !== "function") return;
    global.showPlacePopup(place);
    let attempts = 0;
    const activate = () => {
      attempts += 1;
      const tab = document.querySelector(`.hg-popup.place-popup-v2 [data-place-tab="${tabId}"]`);
      if (tab instanceof HTMLElement) {
        tab.click();
        return;
      }
      if (attempts < 30) global.requestAnimationFrame?.(activate) || global.setTimeout(activate, 16);
    };
    activate();
  }

  function bind() {
    if (global[BOUND_FLAG]) return;
    global[BOUND_FLAG] = true;
    document.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target.closest("[data-place-popup-tab]") : null;
      if (!(target instanceof HTMLElement) || !target.closest(`[${WRAP_ATTR}]`)) return;
      event.preventDefault();
      event.stopPropagation();
      openShortcut(text(target.dataset.placePopupTab));
    }, true);
  }

  function init() {
    ensureDom();
    bind();
  }

  global.HGPlacePopupShortcuts = { ensureDom, open: openShortcut, shortcuts: SHORTCUTS.map(item => ({ ...item })) };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
  ["hg:appReady", "hg:place-selected", "hg:placesUpdated"].forEach(name => global.addEventListener?.(name, ensureDom));
})(window);
