// js/ui/place-popup-direct-tabs.js
// Materialiserer alt legacy-innhold som place-popup-tabs tidligere la i «Mer»
// som egne datastyrte faner i samme horisontale fanestripe.
// Source-data og subsystemeierskap endres ikke.
(function installPlacePopupDirectTabs(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_PLACE_POPUP_DIRECT_TABS_INSTALLED__";
  const BRIDGE_FLAG = "hgDirectTabBridge";
  const MORE_ID = "more";
  const bridgedDecorators = new WeakSet();

  const text = value => String(value == null ? "" : value).trim();
  const slug = value => text(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const HEADING_TABS = Object.freeze({
    "spor og objekter": ["objects", "Spor & objekter"],
    "legg merke til": ["notice", "Legg merke til"],
    "hvorfor det betyr noe": ["meaning", "Betydning"],
    "motpunkter": ["counterpoints", "Motpunkter"],
    "språkleksikon": ["language", "Språk"]
  });

  const CLASS_TABS = Object.freeze([
    ["hg-place-relations-section", "relations", "Relasjoner"],
    ["hg-place-knowledge-section", "knowledge", "Kunnskap"],
    ["hg-place-observations-section", "observations", "Observasjoner"]
  ]);

  function directChildren(panelWrap) {
    return [...panelWrap.children].filter(node => node instanceof HTMLElement && node.hasAttribute("data-place-panel"));
  }

  function ensureTab(tablist, panelWrap, id, label) {
    let button = /** @type {HTMLButtonElement | null} */ (tablist.querySelector(`[data-place-tab="${CSS.escape(id)}"]`));
    let panel = /** @type {HTMLElement | null} */ (panelWrap.querySelector(`[data-place-panel="${CSS.escape(id)}"]`));

    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "hg-place-tab hg-place-tab-dynamic";
      button.id = `hg-place-tab-${id}`;
      button.dataset.placeTab = id;
      button.textContent = label;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", `hg-place-panel-${id}`);
      button.setAttribute("aria-selected", "false");
      button.tabIndex = -1;
      tablist.appendChild(button);
    }

    if (!panel) {
      panel = document.createElement("section");
      panel.className = "hg-place-tab-panel hg-place-tab-panel-dynamic";
      panel.id = `hg-place-panel-${id}`;
      panel.dataset.placePanel = id;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.hidden = true;
      panelWrap.appendChild(panel);
    }

    return panel;
  }

  function activate(tablist, panelWrap, id, focus = false) {
    const selected = /** @type {HTMLElement | null} */ (tablist.querySelector(`[data-place-tab="${CSS.escape(id)}"]`));
    if (!selected) return;

    tablist.querySelectorAll("[role=tab]").forEach(button => {
      const active = button === selected;
      button.setAttribute("aria-selected", active ? "true" : "false");
      if (button instanceof HTMLElement) button.tabIndex = active ? 0 : -1;
    });

    directChildren(panelWrap).forEach(panel => {
      panel.hidden = panel.dataset.placePanel !== id;
    });

    try {
      selected.scrollIntoView({
        behavior: focus ? "smooth" : "auto",
        block: "nearest",
        inline: "nearest"
      });
    } catch {}
    if (focus) selected.focus();
  }

  function installNavigationBridge(tablist, panelWrap) {
    if (tablist.dataset[BRIDGE_FLAG] === "1") return;
    tablist.dataset[BRIDGE_FLAG] = "1";

    tablist.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target.closest("[data-place-tab]") : null;
      if (!(target instanceof HTMLElement) || !tablist.contains(target)) return;
      event.stopImmediatePropagation();
      activate(tablist, panelWrap, text(target.dataset.placeTab), false);
    }, true);

    tablist.addEventListener("keydown", event => {
      const buttons = [...tablist.querySelectorAll("[role=tab]")].filter(button => button instanceof HTMLElement);
      const activeElement = document.activeElement;
      const index = activeElement instanceof HTMLElement ? buttons.indexOf(activeElement) : -1;
      if (index < 0 || !buttons.length) return;
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const nextButton = buttons[next];
      if (nextButton instanceof HTMLElement) activate(tablist, panelWrap, text(nextButton.dataset.placeTab), true);
    }, true);
  }

  function tabSpecForNode(node) {
    if (!(node instanceof HTMLElement)) return null;

    for (const [className, id, label] of CLASS_TABS) {
      if (node.classList.contains(className) || node.querySelector(`.${className}`)) return { id, label };
    }

    const heading = text(node.matches("section") ? node.querySelector("h2,h3,h4")?.textContent : node.querySelector("h2,h3,h4")?.textContent).toLowerCase();
    if (HEADING_TABS[heading]) {
      const [id, label] = HEADING_TABS[heading];
      return { id, label };
    }

    const label = text(node.querySelector("h2,h3,h4")?.textContent) || "Tillegg";
    return { id: `extra-${slug(label) || "content"}`, label };
  }

  function moveNode(node, tablist, panelWrap) {
    if (!(node instanceof HTMLElement)) return;

    // renderMore() legger flere faglig ulike seksjoner i én generert holder.
    // Splitt holderen før flytting slik at hver del blir en ekte direktefane.
    if (node.classList.contains("hg-place-tab-generated") && node.dataset.generated === "more") {
      [...node.children].forEach(child => moveNode(child, tablist, panelWrap));
      node.remove();
      return;
    }

    const spec = tabSpecForNode(node);
    if (!spec) return node.remove();

    if (spec.id === "language") {
      const existingLanguage = panelWrap.querySelector('[data-place-panel="language"]');
      if (existingLanguage?.classList.contains("hg-place-language-panel") || panelWrap.closest("[data-hg-language-layer=\"1\"]")) {
        node.remove();
        return;
      }
    }

    const panel = ensureTab(tablist, panelWrap, spec.id, spec.label);
    panel.appendChild(node);
  }

  function drainMore(morePanel, tablist, panelWrap) {
    [...morePanel.children].forEach(node => moveNode(node, tablist, panelWrap));
  }

  function decoratePopup() {
    const article = document.querySelector('.hg-place-popup-v2[data-hg-place-tabs="1"]');
    const tablist = /** @type {HTMLElement | null} */ (article?.querySelector(".hg-place-tabs") || null);
    const panelWrap = /** @type {HTMLElement | null} */ (article?.querySelector(".hg-place-tab-panels") || null);
    if (!article || !tablist || !panelWrap || article.dataset.hgDirectTabs === "1") return false;

    const moreTab = tablist.querySelector(`[data-place-tab="${MORE_ID}"]`);
    const morePanel = /** @type {HTMLElement | null} */ (panelWrap.querySelector(`[data-place-panel="${MORE_ID}"]`) || null);
    if (!morePanel) return false;

    article.dataset.hgDirectTabs = "1";
    installNavigationBridge(tablist, panelWrap);

    // More er kun et bakoverkompatibelt staging-panel fra den gamle hydratoren.
    // Det skal aldri være en brukerrettet fane.
    moreTab?.remove();
    morePanel.remove();

    drainMore(morePanel, tablist, panelWrap);
    const observer = new MutationObserver(() => drainMore(morePanel, tablist, panelWrap));
    observer.observe(morePanel, { childList: true, subtree: true });

    const selected = tablist.querySelector('[role="tab"][aria-selected="true"]');
    if (selected instanceof HTMLElement) activate(tablist, panelWrap, text(selected.dataset.placeTab), false);
    return true;
  }

  function installDecoratorBridge() {
    const api = global.HGPlacePopupTabs;
    const currentDecorate = api?.decoratePopup;
    if (typeof currentDecorate !== "function" || bridgedDecorators.has(currentDecorate)) return;

    const wrappedDecorate = function decoratePopupWithDirectTabs(place) {
      const result = currentDecorate.apply(this, arguments);
      try { decoratePopup(); } catch (error) { if (global.DEBUG) console.warn("[place-popup-direct-tabs]", error); }
      return result;
    };
    bridgedDecorators.add(wrappedDecorate);
    api.decoratePopup = wrappedDecorate;
  }

  function install() {
    if (global[INSTALL_FLAG]) {
      installDecoratorBridge();
      return true;
    }
    const current = global.showPlacePopup;
    if (typeof current !== "function" || current.__hgPlacePopupTabs !== true) return false;

    const wrapped = function showPlacePopupWithDirectTabs(place) {
      const result = current.apply(this, arguments);
      const revealDirectTabs = () => {
        try { decoratePopup(); } catch (error) { if (global.DEBUG) console.warn("[place-popup-direct-tabs]", error); }
      };
      if (result && typeof result.then === "function") void result.then(revealDirectTabs).catch(error => { if (global.DEBUG) console.warn("[place-popup-direct-tabs]", error); });
      else if (typeof global.queueMicrotask === "function") global.queueMicrotask(revealDirectTabs);
      else global.setTimeout(revealDirectTabs, 0);
      return result;
    };
    wrapped.__hgPlacePopupDirectTabs = true;
    wrapped.__hgPlacePopupTabs = true;
    wrapped.__hgPlacePopupV2 = current.__hgPlacePopupV2 === true;
    wrapped.__previous = current;
    global.showPlacePopup = wrapped;
    global.HGPlacePopupDirectTabs = { decoratePopup, activate };
    installDecoratorBridge();
    global[INSTALL_FLAG] = true;
    try { decoratePopup(); } catch (error) { if (global.DEBUG) console.warn("[place-popup-direct-tabs]", error); }
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
