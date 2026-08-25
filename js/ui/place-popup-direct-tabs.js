// js/ui/place-popup-direct-tabs.js
// Legacy «Mer» er kun et internt staging-panel. Innholdet rutes til riktig
// brukerflate i stedet for å bli en serie permanente popupfaner.
(function installPlacePopupDirectTabs(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_PLACE_POPUP_DIRECT_TABS_INSTALLED__";
  const MORE_ID = "more";
  const bridgedDecorators = new WeakSet();
  const supplementStore = global.__HG_PLACE_COLLECTION_SUPPLEMENTS__ instanceof Map
    ? global.__HG_PLACE_COLLECTION_SUPPLEMENTS__
    : new Map();
  global.__HG_PLACE_COLLECTION_SUPPLEMENTS__ = supplementStore;

  const text = value => String(value == null ? "" : value).trim();
  const esc = value => String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const REMOVED_DIRECT_TAB_IDS = Object.freeze([
    "objects", "notice", "meaning", "counterpoints", "relations", "knowledge", "observations"
  ]);

  function currentPlaceId(article) {
    return text(
      document.getElementById("placeCard")?.dataset?.currentPlaceId
      || article?.dataset?.placeId
      || article?.getAttribute?.("data-place-id")
    );
  }

  function storeSupplement(placeId, kind, node) {
    if (!placeId || !(node instanceof HTMLElement)) return;
    const key = `${placeId}:${kind}`;
    const rows = supplementStore.get(key) || [];
    const html = node.outerHTML;
    if (!rows.includes(html)) rows.push(html);
    supplementStore.set(key, rows);
  }

  function getSupplements(placeId, kind) {
    return [...(supplementStore.get(`${text(placeId)}:${text(kind)}`) || [])];
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
    const placeId = currentPlaceId(article);

    if (heading === "spor og objekter" || heading === "legg merke til") {
      storeSupplement(placeId, "objects", node);
      node.remove();
      return;
    }

    if (node.classList.contains("hg-place-relations-section") || node.querySelector(".hg-place-relations-section")) {
      storeSupplement(placeId, "people", node);
      node.remove();
      return;
    }

    if (heading === "språkleksikon") {
      const languageLayerExists = Boolean(
        panelWrap.querySelector('.hg-place-language-panel,[data-place-panel="language"]')
        || article.dataset.hgLanguageLayer === "1"
      );
      if (languageLayerExists) {
        node.remove();
        return;
      }
      ensureLanguageTab(tablist, panelWrap).appendChild(node);
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

  function decoratePopup() {
    const article = document.querySelector('.hg-place-popup-v2[data-hg-place-tabs="1"]');
    const tablist = article?.querySelector(".hg-place-tabs");
    const panelWrap = article?.querySelector(".hg-place-tab-panels");
    if (!(article instanceof HTMLElement) || !(tablist instanceof HTMLElement) || !(panelWrap instanceof HTMLElement)) return false;
    if (article.dataset.hgDirectTabs === "1") return true;

    const morePanel = panelWrap.querySelector(`[data-place-panel="${MORE_ID}"]`);
    if (!(morePanel instanceof HTMLElement)) return false;

    article.dataset.hgDirectTabs = "1";
    cleanupOldDirectTabs(tablist, panelWrap);
    tablist.querySelector(`[data-place-tab="${MORE_ID}"]`)?.remove();

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

    const wrapped = function showPlacePopupWithOwnedSurfaces(place) {
      const result = current.apply(this, arguments);
      const route = () => {
        try { decoratePopup(); } catch (error) { if (global.DEBUG) console.warn("[place-popup-direct-tabs]", error); }
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
      getSupplements,
      visibleOptionalTabs: ["language"]
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
