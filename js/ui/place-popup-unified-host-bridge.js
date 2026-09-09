// js/ui/place-popup-unified-host-bridge.js
// Compatibility bridge for the Unified Place migration.
// During a standard Unified Place render, route the canonical place-popup HTML
// directly into PlaceCard's knowledge host instead of creating a body modal
// that is moved into PlaceCard afterwards. All non-Unified and Micro popups keep
// the original makePopup contract unchanged.
(function installPlacePopupUnifiedHostBridge(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_PLACE_POPUP_UNIFIED_HOST_BRIDGE_INSTALLED__";
  const WRAPPED_FLAG = "__hgPlacePopupUnifiedHostBridge";
  const STAGING_CLASS = "hg-unified-place-staging";
  const HOST_ID = "pcUnifiedKnowledgeHost";

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function isUnifiedStandardPopup(extraClass) {
    const classes = text(extraClass);
    return document.body?.classList.contains(STAGING_CLASS)
      && classes.split(/\s+/).includes("place-popup-v2")
      && !classes.split(/\s+/).includes("micro-place-popup-shell");
  }

  function directHost() {
    const host = document.getElementById(HOST_ID);
    return host instanceof HTMLElement && host.isConnected ? host : null;
  }

  function renderDirectly(html, extraClass) {
    const host = directHost();
    if (!host) return null;

    // Match makePopup's close-before-open semantics without registering this
    // in the standalone-popup state: PlaceCard owns lifecycle/close from here.
    try { global.closePopup?.(); } catch {}

    const wrapper = document.createElement("div");
    wrapper.className = `hg-popup ${text(extraClass)}`.trim();
    wrapper.dataset.hgUnifiedDirectHost = "1";
    wrapper.innerHTML = `
      <div class="hg-popup-inner hg-modal-card">
        <button class="hg-popup-close hg-modal-close" data-close-popup hidden aria-hidden="true" tabindex="-1">✕</button>
        ${html}
      </div>
    `;
    host.replaceChildren(wrapper);
    try {
      global.dispatchEvent?.(new CustomEvent("hg:place-unified-host-rendered", {
        detail: { placeId: text(document.getElementById("placeCard")?.dataset?.currentPlaceId) }
      }));
    } catch {}
    return wrapper;
  }

  function install() {
    if (global[INSTALL_FLAG]) return true;
    const original = global.makePopup;
    if (typeof original !== "function") return false;
    if (original[WRAPPED_FLAG] === true) {
      global[INSTALL_FLAG] = true;
      return true;
    }

    const wrapped = function makePopupWithUnifiedPlaceHost(html, extraClass = "", onClose = null) {
      if (isUnifiedStandardPopup(extraClass) && directHost()) {
        return renderDirectly(html, extraClass);
      }
      return original.apply(this, [html, extraClass, onClose]);
    };

    Object.keys(original).forEach(key => {
      try { wrapped[key] = original[key]; } catch {}
    });
    wrapped[WRAPPED_FLAG] = true;
    wrapped.__previous = original;
    global.makePopup = wrapped;
    global[INSTALL_FLAG] = true;
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
