// @ts-nocheck
// js/ui/place-popup-shortcuts.js
// Seks faste SVG-snarveier fra PlaceCard til stedspopupen. Om åpnes via stedsnavn eller infotekst.
(function installPlacePopupShortcuts(global) {
  "use strict";

  const WRAP_ATTR = "data-hg-place-popup-shortcuts";
  const BOUND_FLAG = "__HG_PLACE_POPUP_SHORTCUTS_BOUND__";
  const INFO_TARGET_SELECTOR = "#pcTitle, #pcDesc";
  const icon = paths => `<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  const SHORTCUTS = Object.freeze([
    { id: "history", label: "Historie", icon: icon('<circle cx="12" cy="12" r="9"/><path d="M12 7.3v5.2l3.5 2"/><path d="M7.1 4.9 5.4 3.2"/>') },
    { id: "stories", label: "Fortellinger", icon: icon('<path d="M4.5 5.2c2.6-.8 5-.35 7.5 1.25v12c-2.5-1.6-4.9-2.05-7.5-1.25z"/><path d="M19.5 5.2c-2.6-.8-5-.35-7.5 1.25v12c2.5-1.6 4.9-2.05 7.5-1.25z"/>') },
    { id: "before-after", label: "Før/etter", icon: icon('<path d="M4 7h11"/><path d="m12 4 3 3-3 3"/><path d="M20 17H9"/><path d="m12 14-3 3 3 3"/>') },
    { id: "news", label: "Nyheter", icon: icon('<path d="M5 4.5h13.5v15H5z"/><path d="M8 8h7.5"/><path d="M8 11h7.5"/><path d="M8 14h3"/><path d="M13 14h2.5"/>') },
    { id: "reading", label: "Lesespor", icon: icon('<path d="M6 4.5h11a2 2 0 0 1 2 2v13H8a2 2 0 0 1-2-2z"/><path d="M6 16.5h13"/><path d="M9.5 4.5v8l2.4-1.5 2.4 1.5v-8"/>') },
    { id: "sources", label: "Kilder", icon: icon('<path d="M9.5 14.5 8 16a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0"/><path d="m14.5 9.5 1.5-1.5a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0"/><path d="m8.5 15.5 7-7"/>') }
  ]);

  const text = value => String(value == null ? "" : value).trim();

  function currentPlace() {
    const id = text(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? (Array.isArray(global.PLACES) ? global.PLACES : []).find(place => text(place?.id) === id) || null : null;
  }

  function button(def) {
    return `<button type="button" class="pc-place-popup-shortcut" data-place-popup-tab="${def.id}" aria-label="${def.label}" title="${def.label}"><span class="pc-place-popup-shortcut-icon" aria-hidden="true">${def.icon}</span></button>`;
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

  function ensureDom() {
    const card = document.getElementById("placeCard");
    const grid = card?.querySelector(".pc-grid");
    if (!grid) return null;
    let wrap = grid.querySelector(`[${WRAP_ATTR}]`);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "pc-place-popup-shortcuts";
      wrap.setAttribute(WRAP_ATTR, "1");
      wrap.setAttribute("role", "group");
      wrap.setAttribute("aria-label", "Stedsinformasjon");
      wrap.innerHTML = SHORTCUTS.map(button).join("");
      grid.appendChild(wrap);
    } else if (wrap.parentElement !== grid) {
      grid.appendChild(wrap);
    }
    prepareInfoTargets(card);
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
      const shortcut = event.target instanceof Element ? event.target.closest("[data-place-popup-tab]") : null;
      if (shortcut instanceof HTMLElement && shortcut.closest(`[${WRAP_ATTR}]`)) {
        event.preventDefault();
        event.stopPropagation();
        openShortcut(text(shortcut.dataset.placePopupTab));
        return;
      }

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
    ensureDom();
    bind();
  }

  global.HGPlacePopupShortcuts = {
    ensureDom,
    open: openShortcut,
    openAbout: () => openShortcut("about"),
    shortcuts: SHORTCUTS.map(item => ({ ...item }))
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
  ["hg:appReady", "hg:place-selected", "hg:placesUpdated"].forEach(name => global.addEventListener?.(name, ensureDom));
})(window);
