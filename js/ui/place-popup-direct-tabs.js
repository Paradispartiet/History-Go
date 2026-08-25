// js/ui/place-popup-direct-tabs.js
// Legacy «Mer» er kun et internt staging-panel. Innholdet rutes til riktig
// brukerflate i stedet for å bli en serie permanente popupfaner.
// Språk er en fast stedspopupfane for alle Places; dialektlaget er fortsatt valgfritt.
(function installPlacePopupDirectTabs(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_PLACE_POPUP_DIRECT_TABS_INSTALLED__";
  const BRIDGE_FLAG = "hgOwnedSurfaceTabBridge";
  const MORE_ID = "more";
  const bridgedDecorators = new WeakSet();

  const text = value => String(value == null ? "" : value).trim();

  const REMOVED_DIRECT_TAB_IDS = Object.freeze([
    "objects", "notice", "meaning", "counterpoints", "relations", "knowledge", "observations"
  ]);

  function directChildren(panelWrap) {
    return [...panelWrap.children].filter(node => node instanceof HTMLElement && node.hasAttribute("data-place-panel"));
  }

  function activate(tablist, panelWrap, id, focus = false) {
    const selected = tablist.querySelector(`[data-place-tab="${CSS.escape(text(id))}"]`);
    if (!(selected instanceof HTMLElement)) return;

    tablist.querySelectorAll("[role=tab]").forEach(button => {
      const active = button === selected;
      button.setAttribute("aria-selected", active ? "true" : "false");
      if (button instanceof HTMLElement) button.tabIndex = active ? 0 : -1;
    });
    directChildren(panelWrap).forEach(panel => {
      panel.hidden = panel.dataset.placePanel !== id;
    });
    try {
      selected.scrollIntoView({ behavior: focus ? "smooth" : "auto", block: "nearest", inline: "nearest" });
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
      const index = document.activeElement instanceof HTMLElement ? buttons.indexOf(document.activeElement) : -1;
      if (index < 0 || !buttons.length) return;
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % buttons.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const button = buttons[next];
      if (button instanceof HTMLElement) activate(tablist, panelWrap, text(button.dataset.placeTab), true);
    }, true);
  }

  function ensureLanguageTab(tablist, panelWrap) {
    let button = tablist.querySelector('[data-place-tab="language"]');
    let panel = panelWrap.querySelector('[data-place-panel="language"]');
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "hg-place-tab hg-place-tab-dynamic";
      button.id = "hg-place-tab-language";
      button.dataset.placeTab = "language";
      button.textContent = "Språk";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "hg-place-panel-language");
      button.setAttribute("aria-selected", "false");
      button.tabIndex = -1;
      tablist.appendChild(button);
    }
    if (!panel) {
      panel = document.createElement("section");
      panel.className = "hg-place-tab-panel hg-place-tab-panel-dynamic";
      panel.id = "hg-place-panel-language";
      panel.dataset.placePanel = "language";
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.hidden = true;
      panelWrap.appendChild(panel);
    }
    if (!text(panel.textContent) && !panel.querySelector("[data-required-language-gap]")) {
      const gap = document.createElement("div");
      gap.className = "hg-place-tab-empty";
      gap.dataset.requiredLanguageGap = "1";
      gap.innerHTML = "<strong>Språkgrunnlaget er ikke materialisert ennå.</strong><p>Alle steder skal ha stedsspesifikke begreper i Språkleksikonet. Dialektinnhold er bare aktuelt når kildene og place-scope tillater det.</p>";
      panel.appendChild(gap);
    }
    return panel;
  }

  function moveToAbout(node, panelWrap) {
    const about = panelWrap.querySelector('[data-place-panel="about"]');
    if (!(about instanceof HTMLElement) || !(node instanceof HTMLElement)) return node?.remove?.();
    about.appendChild(node);
  }

  function routeNode(node, article, tablist, panelWrap) {
    if (!(node instanceof HTMLElement)) return;

    // renderMore() samler flere semantiske seksjoner i én holder. Splitt den
    // og rut hver seksjon til sin canonical brukerflate.
    if (node.classList.contains("hg-place-tab-generated") && node.dataset.generated === "more") {
      [...node.children].forEach(child => routeNode(child, article, tablist, panelWrap));
      node.remove();
      return;
    }

    const heading = text(node.querySelector("h2,h3,h4")?.textContent).toLowerCase();

    // Disse dataene beholdes hos Leksikon/relasjonskilden. Collection-routing
    // leser den samme canonical kilden når Objects/People-popupen åpnes.
    if (heading === "spor og objekter" || heading === "legg merke til") {
      node.remove();
      return;
    }
    if (node.classList.contains("hg-place-relations-section") || node.querySelector(".hg-place-relations-section")) {
      node.remove();
      return;
    }

    if (heading === "språkleksikon") {
      const languageLayerExists = Boolean(
        panelWrap.querySelector(".hg-place-language-panel")
        || article.dataset.hgLanguageLayer === "1"
      );
      if (languageLayerExists) {
        node.remove();
        return;
      }
      const languagePanel = ensureLanguageTab(tablist, panelWrap);
      languagePanel.querySelector("[data-required-language-gap]")?.remove();
      languagePanel.appendChild(node);
      return;
    }

    // Betydning, motpunkter, Knowledge og observasjonskunnskap er kunnskap om
    // stedet og blir seksjoner under Om. De er ikke egne navigasjonsnivåer.
    if (
      heading === "hvorfor det betyr noe"
      || heading === "motpunkter"
      || node.classList.contains("hg-place-knowledge-section")
      || node.classList.contains("hg-place-observations-section")
      || node.querySelector(".hg-place-knowledge-section,.hg-place-observations-section")
    ) {
      moveToAbout(node, panelWrap);
      return;
    }

    // Ukjent legacy-innhold skal aldri forsvinne eller bli en ny restfane.
    moveToAbout(node, panelWrap);
  }

  function drainMore(morePanel, article, tablist, panelWrap) {
    [...morePanel.children].forEach(node => routeNode(node, article, tablist, panelWrap));
  }

  function cleanupOldDirectTabs(tablist, panelWrap) {
    for (const id of REMOVED_DIRECT_TAB_IDS) {
      tablist.querySelector(`[data-place-tab="${CSS.escape(id)}"]`)?.remove();
      panelWrap.querySelector(`[data-place-panel="${CSS.escape(id)}"]`)?.remove();
    }
  }

  function decoratePopup(place = null) {
    const article = document.querySelector('.hg-place-popup-v2[data-hg-place-tabs="1"]');
    const tablist = article?.querySelector(".hg-place-tabs");
    const panelWrap = article?.querySelector(".hg-place-tab-panels");
    if (!(article instanceof HTMLElement) || !(tablist instanceof HTMLElement) || !(panelWrap instanceof HTMLElement)) return false;
    if (place?.id) article.dataset.placeId = text(place.id);
    if (article.dataset.hgDirectTabs === "1") {
      ensureLanguageTab(tablist, panelWrap);
      return true;
    }

    const morePanel = panelWrap.querySelector(`[data-place-panel="${MORE_ID}"]`);
    if (!(morePanel instanceof HTMLElement)) return false;

    article.dataset.hgDirectTabs = "1";
    installNavigationBridge(tablist, panelWrap);
    cleanupOldDirectTabs(tablist, panelWrap);
    tablist.querySelector(`[data-place-tab="${MORE_ID}"]`)?.remove();
    ensureLanguageTab(tablist, panelWrap);

    drainMore(morePanel, article, tablist, panelWrap);
    const observer = new MutationObserver(() => drainMore(morePanel, article, tablist, panelWrap));
    observer.observe(morePanel, { childList: true, subtree: true });

    // Staging-panelet skal ikke inngå i den synlige panelstrukturen, men beholdes
    // frakoblet så den gamle hydratoren kan skrive til det mens observeren ruter.
    morePanel.remove();
    return true;
  }

  function installDecoratorBridge() {
    const api = global.HGPlacePopupTabs;
    const currentDecorate = api?.decoratePopup;
    if (typeof currentDecorate !== "function" || bridgedDecorators.has(currentDecorate)) return;

    const wrappedDecorate = function decoratePopupWithOwnedSurfaces(place) {
      const result = currentDecorate.apply(this, arguments);
      try { decoratePopup(place); } catch (error) { if (global.DEBUG) console.warn("[place-popup-direct-tabs]", error); }
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

    const wrapped = function showPlacePopupWithOwnedSurfaces(place) {
      const result = current.apply(this, arguments);
      const route = () => {
        try { decoratePopup(place); } catch (error) { if (global.DEBUG) console.warn("[place-popup-direct-tabs]", error); }
      };
      if (result && typeof result.then === "function") void result.then(route).catch(error => { if (global.DEBUG) console.warn("[place-popup-direct-tabs]", error); });
      else if (typeof global.queueMicrotask === "function") global.queueMicrotask(route);
      else global.setTimeout(route, 0);
      return result;
    };
    wrapped.__hgPlacePopupDirectTabs = true;
    wrapped.__hgPlacePopupTabs = true;
    wrapped.__hgPlacePopupV2 = current.__hgPlacePopupV2 === true;
    wrapped.__previous = current;
    global.showPlacePopup = wrapped;
    global.HGPlacePopupDirectTabs = {
      decoratePopup,
      activate,
      requiredTabs: ["language"],
      visibleOptionalTabs: []
    };
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
