(() => {
  // js/ui/place-sheet/place-sheet-shell.ts
  var SHELL_ATTR = "data-hg-place-sheet-shell";
  var SHELL_SECTION_ATTR = "data-hg-place-sheet-section";
  function text(value) {
    return String(value == null ? "" : value).trim();
  }
  function card() {
    return document.getElementById("placeCard");
  }
  function body() {
    var _a;
    return ((_a = card()) == null ? void 0 : _a.querySelector(":scope > .pc-body")) || null;
  }
  function isMicro(place) {
    return text(place == null ? void 0 : place.placeTier).toLowerCase() === "micro";
  }
  function ensureShell(place) {
    if (isMicro(place)) return null;
    const root = card();
    const rootBody = body();
    if (!(root instanceof HTMLElement) || !(rootBody instanceof HTMLElement)) return null;
    let shell = rootBody.querySelector(`[${SHELL_ATTR}="1"]`);
    if (!(shell instanceof HTMLElement)) {
      shell = document.createElement("section");
      shell.className = "pc-sheet-shell";
      shell.setAttribute(SHELL_ATTR, "1");
      shell.innerHTML = `
      <div class="pc-sheet-hero" data-hg-place-sheet-hero>
        <div class="pc-sheet-hero-media" data-hg-place-sheet-media></div>
        <div class="pc-sheet-hero-copy" data-hg-place-sheet-copy></div>
      </div>
      <section class="pc-sheet-explore" aria-label="Utforsk stedet">
        <div class="pc-sheet-section-head">
          <span class="pc-sheet-section-eyebrow">Utforsk</span>
          <h2>Fire samlinger</h2>
        </div>
        <div class="pc-sheet-explore-grid" data-hg-place-sheet-collections></div>
      </section>
      <section class="pc-sheet-onsite" data-hg-place-sheet-onsite></section>
    `;
      rootBody.prepend(shell);
    }
    shell.dataset.placeId = text(place.id);
    root.dataset.hgPlaceSheetPhase = "1";
    root.classList.add("is-place-sheet-phase1");
    return shell;
  }
  function movePrimaryNodes(shell) {
    const root = card();
    if (!(root instanceof HTMLElement)) return;
    const media = shell.querySelector("[data-hg-place-sheet-media]");
    const copy = shell.querySelector("[data-hg-place-sheet-copy]");
    const collections = shell.querySelector("[data-hg-place-sheet-collections]");
    const onsite = shell.querySelector("[data-hg-place-sheet-onsite]");
    const front = root.querySelector(".pc-frontcard");
    const textBlock = root.querySelector(".pc-text");
    const sideStack = root.querySelector(".pc-side-stack");
    const events = document.getElementById("pcEventsBox");
    if (front && media && front.parentElement !== media) media.appendChild(front);
    if (textBlock && copy && textBlock.parentElement !== copy) copy.prepend(textBlock);
    if (sideStack && collections && sideStack.parentElement !== collections) collections.appendChild(sideStack);
    if (events instanceof HTMLElement && onsite && events.parentElement !== onsite) onsite.appendChild(events);
    const legacyGrid = root.querySelector(".pc-grid");
    if (legacyGrid && !legacyGrid.children.length) legacyGrid.hidden = true;
  }
  function mountPlaceSheetPhase1(place) {
    var _a;
    if (!place || isMicro(place)) return null;
    const shell = ensureShell(place);
    if (!(shell instanceof HTMLElement)) return null;
    (_a = shell.querySelector(".pc-sheet-canonical-about")) == null ? void 0 : _a.remove();
    const aboutSlot = shell.querySelector("[data-hg-place-sheet-about]");
    if (aboutSlot) aboutSlot.remove();
    movePrimaryNodes(shell);
    return shell;
  }
  function attachCanonicalAboutToPlaceSheet(popup, place) {
    var _a;
    if (isMicro(place)) return null;
    const shell = (_a = card()) == null ? void 0 : _a.querySelector(`[${SHELL_ATTR}="1"]`);
    const copy = shell == null ? void 0 : shell.querySelector("[data-hg-place-sheet-copy]");
    if (!(copy instanceof HTMLElement)) return null;
    let aboutSlot = copy.querySelector("[data-hg-place-sheet-about]");
    if (!(aboutSlot instanceof HTMLElement)) {
      aboutSlot = document.createElement("div");
      aboutSlot.className = "pc-sheet-about";
      aboutSlot.setAttribute("data-hg-place-sheet-about", "1");
      aboutSlot.setAttribute(SHELL_SECTION_ATTR, "about");
      copy.appendChild(aboutSlot);
    }
    aboutSlot.replaceChildren();
    const canonicalAbout = popup.querySelector(".hg-place-about-section");
    if (!(canonicalAbout instanceof HTMLElement)) {
      aboutSlot.hidden = true;
      return null;
    }
    canonicalAbout.classList.add("pc-sheet-canonical-about");
    canonicalAbout.removeAttribute("data-hg-unified-section");
    aboutSlot.hidden = false;
    aboutSlot.appendChild(canonicalAbout);
    return aboutSlot;
  }
  function restoreLegacyPlaceCardStructure() {
    const root = card();
    const rootBody = body();
    if (!(root instanceof HTMLElement) || !(rootBody instanceof HTMLElement)) return;
    const shell = rootBody.querySelector(`[${SHELL_ATTR}="1"]`);
    const textBlock = (shell == null ? void 0 : shell.querySelector(".pc-text")) || root.querySelector(".pc-text");
    const front = (shell == null ? void 0 : shell.querySelector(".pc-frontcard")) || root.querySelector(".pc-frontcard");
    const sideStack = (shell == null ? void 0 : shell.querySelector(".pc-side-stack")) || root.querySelector(".pc-side-stack");
    const events = (shell == null ? void 0 : shell.querySelector("#pcEventsBox")) || document.getElementById("pcEventsBox");
    let legacyGrid = rootBody.querySelector(":scope > .pc-grid");
    if (!(legacyGrid instanceof HTMLElement)) {
      legacyGrid = document.createElement("div");
      legacyGrid.className = "pc-grid";
    }
    legacyGrid.hidden = false;
    if (textBlock instanceof HTMLElement) rootBody.prepend(textBlock);
    if (legacyGrid.parentElement !== rootBody) {
      if (textBlock == null ? void 0 : textBlock.nextSibling) rootBody.insertBefore(legacyGrid, textBlock.nextSibling);
      else rootBody.prepend(legacyGrid);
    }
    if (front instanceof HTMLElement) legacyGrid.appendChild(front);
    if (sideStack instanceof HTMLElement) legacyGrid.appendChild(sideStack);
    if (events instanceof HTMLElement) legacyGrid.appendChild(events);
    shell == null ? void 0 : shell.remove();
    root.classList.remove("is-place-sheet-phase1");
    delete root.dataset.hgPlaceSheetPhase;
  }
  function placeSheetSectionTarget(id) {
    var _a;
    const normalized = text(id);
    if (!normalized) return null;
    return ((_a = card()) == null ? void 0 : _a.querySelector(`[${SHELL_SECTION_ATTR}="${normalized}"]`)) || null;
  }

  // js/ui/place-unified-surface.ts
  (function installPlaceUnifiedSurface(global) {
    "use strict";
    const INSTALL_FLAG = "__HG_PLACE_UNIFIED_SURFACE_INSTALLED__";
    const STYLE_FLAG = "data-hg-place-unified-style";
    const SHEET_STYLE_FLAG = "data-hg-place-sheet-style";
    const HOST_ID = "pcUnifiedKnowledgeHost";
    const EMBEDDED_CLASS = "hg-unified-renderer-embedded";
    const CARD_CLASS = "is-unified-place";
    const STAGING_CLASS = "hg-unified-place-staging";
    const GENERATION_ATTR = "hgUnifiedGeneration";
    const SECTION_ORDER = Object.freeze([
      ["about", "Om"],
      ["history", "Historie"],
      ["stories", "Fortellinger"],
      ["before-after", "F\xF8r/etter"],
      ["news", "Nyheter"],
      ["reading", "Lesespor"],
      ["language", "Spr\xE5k"],
      ["learning", "Fagverk"],
      ["sources", "Kilder"]
    ]);
    const SECTION_ALIASES = Object.freeze({
      about: "about",
      om: "about",
      info: "about",
      more: "about",
      history: "history",
      historie: "history",
      chronology: "history",
      kronologi: "history",
      stories: "stories",
      story: "stories",
      fortellinger: "stories",
      fortelling: "stories",
      "before-after": "before-after",
      beforeafter: "before-after",
      for_na: "before-after",
      forna: "before-after",
      news: "news",
      nyheter: "news",
      reading: "reading",
      lesespor: "reading",
      language: "language",
      sprak: "language",
      "spr\xE5k": "language",
      learning: "learning",
      fagverk: "learning",
      fag: "learning",
      sources: "sources",
      kilder: "sources"
    });
    const text2 = (value) => String(value == null ? "" : value).trim();
    const wait = (ms) => new Promise((resolve) => global.setTimeout(resolve, ms));
    let legacyOpenPlaceCard = null;
    let legacyShowPlacePopup = null;
    let generation = 0;
    let activeMount = Promise.resolve(null);
    function isMicro2(place) {
      return text2(place == null ? void 0 : place.placeTier).toLowerCase() === "micro";
    }
    function placeId(place) {
      return text2(place == null ? void 0 : place.id);
    }
    function card2() {
      return document.getElementById("placeCard");
    }
    function currentPlace() {
      var _a, _b;
      const id = text2((_b = (_a = card2()) == null ? void 0 : _a.dataset) == null ? void 0 : _b.currentPlaceId);
      if (!id) return null;
      return (Array.isArray(global.PLACES) ? global.PLACES : []).find((place) => placeId(place) === id) || null;
    }
    function canonicalSection(value) {
      const key = text2(value).toLowerCase().replace(/\s+/g, "-");
      return SECTION_ALIASES[key] || (SECTION_ORDER.some(([id]) => id === key) ? key : "about");
    }
    function ensureStylesheet() {
      const styles = [
        [STYLE_FLAG, "css/place-unified-surface.css"],
        [SHEET_STYLE_FLAG, "css/place-sheet.css"]
      ];
      for (const [flag, href] of styles) {
        if (document.querySelector(`link[${flag}="1"]`)) continue;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.setAttribute(flag, "1");
        document.head.appendChild(link);
      }
    }
    function ensureHost(place) {
      const root = card2();
      const body2 = root == null ? void 0 : root.querySelector(".pc-body");
      if (!(root instanceof HTMLElement) || !(body2 instanceof HTMLElement)) return null;
      let host = document.getElementById(HOST_ID);
      if (!(host instanceof HTMLElement)) {
        host = document.createElement("section");
        host.id = HOST_ID;
        host.className = "pc-unified-knowledge-host";
        host.setAttribute("aria-label", "Stedets kunnskap");
        host.innerHTML = '<div class="pc-unified-loading" data-hg-unified-loading aria-live="polite">Laster stedets innhold \u2026</div>';
        body2.appendChild(host);
      } else if (host.parentElement !== body2) {
        body2.appendChild(host);
      }
      root.classList.add(CARD_CLASS);
      root.dataset.hgUnifiedPlaceId = placeId(place);
      return host;
    }
    function removeEmbeddedRenderer() {
      document.querySelectorAll(`.hg-popup.place-popup-v2.${EMBEDDED_CLASS}`).forEach((node) => node.remove());
    }
    function clearUnifiedState() {
      var _a, _b;
      restoreLegacyPlaceCardStructure();
      const root = card2();
      root == null ? void 0 : root.classList.remove(CARD_CLASS);
      if (root) {
        delete root.dataset.hgUnifiedPlaceId;
        delete root.dataset[GENERATION_ATTR];
      }
      removeEmbeddedRenderer();
      (_a = document.getElementById(HOST_ID)) == null ? void 0 : _a.remove();
      (_b = document.body) == null ? void 0 : _b.classList.remove(STAGING_CLASS);
    }
    async function waitForPopup(expectedGeneration, place, timeoutMs = 1800) {
      var _a, _b;
      const started = Date.now();
      const expectedName = text2((place == null ? void 0 : place.name) || (place == null ? void 0 : place.title));
      while (Date.now() - started < timeoutMs) {
        if (String(((_b = (_a = card2()) == null ? void 0 : _a.dataset) == null ? void 0 : _b[GENERATION_ATTR]) || "") !== String(expectedGeneration)) return null;
        const candidates = [...document.querySelectorAll(".hg-popup.place-popup-v2")].filter((node) => !node.classList.contains(EMBEDDED_CLASS));
        const popup = expectedName ? candidates.find((node) => {
          var _a2;
          return text2((_a2 = node.querySelector(".hg-modal-title")) == null ? void 0 : _a2.textContent) === expectedName;
        }) : candidates[0];
        if (popup instanceof HTMLElement) return popup;
        await wait(20);
      }
      return null;
    }
    async function waitForTabs(popup, expectedGeneration, timeoutMs = 1800) {
      var _a, _b;
      const started = Date.now();
      while (Date.now() - started < timeoutMs) {
        if (String(((_b = (_a = card2()) == null ? void 0 : _a.dataset) == null ? void 0 : _b[GENERATION_ATTR]) || "") !== String(expectedGeneration)) return null;
        const article = (popup == null ? void 0 : popup.querySelector('.hg-place-popup-v2[data-hg-place-tabs="1"]')) || (popup == null ? void 0 : popup.querySelector(".hg-place-popup-v2"));
        const panels = article == null ? void 0 : article.querySelector(".hg-place-tab-panels");
        if (article instanceof HTMLElement && panels instanceof HTMLElement) return article;
        await wait(20);
      }
      return null;
    }
    function sectionLabel(id) {
      var _a;
      if (id === "about" && placeSheetSectionTarget("about")) return "Mer om stedet";
      return ((_a = SECTION_ORDER.find(([key]) => key === id)) == null ? void 0 : _a[1]) || id;
    }
    function normalizePanels(article) {
      const panelWrap = article.querySelector(".hg-place-tab-panels");
      if (!(panelWrap instanceof HTMLElement)) return;
      [...panelWrap.querySelectorAll("[data-place-panel]")].forEach((panel) => {
        if (!(panel instanceof HTMLElement)) return;
        const id = text2(panel.dataset.placePanel);
        if (id === "more") {
          panel.hidden = true;
          panel.setAttribute("aria-hidden", "true");
          return;
        }
        panel.hidden = false;
        panel.removeAttribute("aria-hidden");
        panel.setAttribute("role", "region");
        panel.dataset.hgUnifiedSection = id;
        panel.style.scrollMarginTop = "76px";
        if (!panel.querySelector(":scope > .pc-unified-section-title")) {
          const heading = document.createElement("h2");
          heading.className = "pc-unified-section-title";
          heading.textContent = sectionLabel(id);
          panel.prepend(heading);
        }
      });
    }
    function bindUnifiedNavigation(popup, article) {
      const tablist = article.querySelector(".hg-place-tabs");
      const panelWrap = article.querySelector(".hg-place-tab-panels");
      if (!(tablist instanceof HTMLElement) || !(panelWrap instanceof HTMLElement)) return;
      tablist.classList.add("pc-unified-section-nav");
      tablist.setAttribute("aria-label", "Hopp til del av stedet");
      tablist.removeAttribute("role");
      [...tablist.querySelectorAll("[data-place-tab]")].forEach((button) => {
        if (!(button instanceof HTMLElement)) return;
        const id = canonicalSection(button.dataset.placeTab);
        if (id === "about" && text2(button.dataset.placeTab) === "more") {
          button.remove();
          return;
        }
        button.removeAttribute("role");
        button.removeAttribute("aria-selected");
        button.removeAttribute("aria-controls");
        button.tabIndex = 0;
        button.dataset.hgUnifiedJump = id;
      });
      const intercept = (event) => {
        const target = event.target instanceof Element ? event.target.closest("[data-hg-unified-jump]") : null;
        if (!(target instanceof HTMLElement) || !popup.contains(target)) return;
        if (event.type === "keydown") {
          const keyboardEvent = event;
          if (!["Enter", " "].includes(keyboardEvent.key)) return;
        }
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        scrollToSection(target.dataset.hgUnifiedJump, { focus: event.type === "keydown" });
      };
      popup.addEventListener("click", intercept, true);
      popup.addEventListener("keydown", intercept, true);
      normalizePanels(article);
      const observer = new MutationObserver(() => normalizePanels(article));
      observer.observe(panelWrap, { childList: true, subtree: false, attributes: true, attributeFilter: ["hidden", "aria-hidden"] });
      popup.__hgUnifiedPanelObserver = observer;
    }
    async function ensureLearningSection(place, article) {
      const api = global.HGPlaceLearningSurface;
      if (!api || typeof api.loadRegistry !== "function" || typeof api.renderLearningSection !== "function") return null;
      let registry = null;
      try {
        registry = await api.loadRegistry();
      } catch {
      }
      if (!registry || !(article == null ? void 0 : article.isConnected)) return null;
      const body2 = article.querySelector(".hg-place-popup-body");
      if (!(body2 instanceof HTMLElement)) return null;
      let wrapper = body2.querySelector('[data-hg-unified-section="learning"]');
      const existingLearning = body2.querySelector(".hg-place-learning-section");
      if (!(wrapper instanceof HTMLElement)) {
        wrapper = document.createElement("section");
        wrapper.className = "hg-place-tab-panel pc-unified-learning-panel";
        wrapper.dataset.hgUnifiedSection = "learning";
        wrapper.setAttribute("role", "region");
        wrapper.style.scrollMarginTop = "76px";
        wrapper.innerHTML = '<h2 class="pc-unified-section-title">Fagverk</h2>';
        if (existingLearning instanceof HTMLElement) {
          wrapper.appendChild(existingLearning);
        } else {
          const rendered = text2(api.renderLearningSection(registry, place));
          if (!rendered) return null;
          wrapper.insertAdjacentHTML("beforeend", rendered);
        }
        const panels = body2.querySelector(".hg-place-tab-panels");
        panels == null ? void 0 : panels.insertAdjacentElement("afterend", wrapper);
      }
      const stableWrapper = wrapper;
      const reconcileLearning = () => {
        if (!stableWrapper.isConnected) return;
        const owned = stableWrapper.querySelector(".hg-place-learning-section");
        [...body2.querySelectorAll(".hg-place-learning-section")].forEach((section) => {
          if (!(section instanceof HTMLElement) || stableWrapper.contains(section)) return;
          if (owned) section.remove();
          else stableWrapper.appendChild(section);
        });
      };
      reconcileLearning();
      if (!stableWrapper.__hgUnifiedLearningObserver) {
        const observer = new MutationObserver(reconcileLearning);
        observer.observe(body2, { childList: true, subtree: true });
        stableWrapper.__hgUnifiedLearningObserver = observer;
        global.setTimeout(() => observer.disconnect(), 1e4);
      }
      const nav = article.querySelector(".pc-unified-section-nav");
      if (nav instanceof HTMLElement && !nav.querySelector('[data-hg-unified-jump="learning"]')) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "hg-place-tab pc-unified-learning-jump";
        button.dataset.hgUnifiedJump = "learning";
        button.textContent = "Fagverk";
        const sourcesButton = nav.querySelector('[data-hg-unified-jump="sources"]');
        nav.insertBefore(button, sourcesButton || null);
      }
      return stableWrapper;
    }
    function prepareEmbeddedPopup(popup, article, place) {
      var _a, _b;
      const host = ensureHost(place);
      if (!(host instanceof HTMLElement)) return null;
      (_a = host.querySelector("[data-hg-unified-loading]")) == null ? void 0 : _a.remove();
      popup.classList.add(EMBEDDED_CLASS);
      popup.dataset.hgUnifiedPlaceId = placeId(place);
      popup.setAttribute("aria-label", `Kunnskap om ${text2((place == null ? void 0 : place.name) || "stedet")}`);
      (_b = popup.querySelector(".hg-popup-close")) == null ? void 0 : _b.setAttribute("hidden", "");
      if (popup.parentElement !== host) host.replaceChildren(popup);
      bindUnifiedNavigation(popup, article);
      normalizePanels(article);
      return popup;
    }
    async function materialize(place, options = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      const id = placeId(place);
      if (!id || isMicro2(place)) {
        clearUnifiedState();
        return null;
      }
      const root = card2();
      if (!(root instanceof HTMLElement)) return null;
      mountPlaceSheetPhase1(place);
      ensureHost(place);
      const currentEmbedded = document.querySelector(`.hg-popup.place-popup-v2.${EMBEDDED_CLASS}`);
      if (!options.refresh && currentEmbedded instanceof HTMLElement && currentEmbedded.dataset.hgUnifiedPlaceId === id) {
        return currentEmbedded;
      }
      const myGeneration = ++generation;
      root.dataset[GENERATION_ATTR] = String(myGeneration);
      removeEmbeddedRenderer();
      const host = ensureHost(place);
      if (host instanceof HTMLElement) {
        host.innerHTML = '<div class="pc-unified-loading" data-hg-unified-loading aria-live="polite">Laster stedets innhold \u2026</div>';
      }
      if (typeof legacyShowPlacePopup !== "function") return null;
      (_a = document.body) == null ? void 0 : _a.classList.add(STAGING_CLASS);
      document.querySelectorAll(`.hg-popup.place-popup-v2:not(.${EMBEDDED_CLASS})`).forEach((node) => node.remove());
      try {
        const result = legacyShowPlacePopup(place, { unifiedHost: host instanceof HTMLElement ? host : null });
        if (result && typeof result.then === "function") await result;
        const popup = await waitForPopup(myGeneration, place);
        if (!(popup instanceof HTMLElement)) return null;
        try {
          (_c = (_b = global.HGPlacePopupTabs) == null ? void 0 : _b.decoratePopup) == null ? void 0 : _c.call(_b, place);
        } catch {
        }
        try {
          (_e = (_d = global.HGPlacePopupDirectTabs) == null ? void 0 : _d.decoratePopup) == null ? void 0 : _e.call(_d, place);
        } catch {
        }
        try {
          const languageResult = (_g = (_f = global.HGLanguageLayer) == null ? void 0 : _f.decoratePopup) == null ? void 0 : _g.call(_f, place);
          if (languageResult && typeof languageResult.then === "function") await languageResult;
        } catch {
        }
        const article = await waitForTabs(popup, myGeneration);
        if (!(article instanceof HTMLElement)) return null;
        if (String(root.dataset[GENERATION_ATTR] || "") !== String(myGeneration)) return null;
        attachCanonicalAboutToPlaceSheet(popup, place);
        const embedded = prepareEmbeddedPopup(popup, article, place);
        if (!(embedded instanceof HTMLElement)) return null;
        await ensureLearningSection(place, article);
        normalizePanels(article);
        (_h = global.dispatchEvent) == null ? void 0 : _h.call(global, new CustomEvent("hg:place-unified-ready", { detail: { placeId: id } }));
        return embedded;
      } catch (error) {
        if (global.DEBUG) console.warn("[place-unified-surface]", error);
        return null;
      } finally {
        if (String(root.dataset[GENERATION_ATTR] || "") === String(myGeneration)) {
          (_i = document.body) == null ? void 0 : _i.classList.remove(STAGING_CLASS);
        }
      }
    }
    function scrollToSection(target, options = {}) {
      var _a, _b;
      const id = canonicalSection(target);
      const root = card2();
      if (!(root instanceof HTMLElement)) return false;
      let section = id === "about" ? placeSheetSectionTarget("about") : null;
      if (!(section instanceof HTMLElement) && id === "learning") {
        section = root.querySelector('[data-hg-unified-section="learning"]');
      } else if (!(section instanceof HTMLElement)) {
        section = [...root.querySelectorAll("[data-place-panel]")].find((panel) => text2(panel.getAttribute("data-place-panel")) === id) || null;
      }
      if (!(section instanceof HTMLElement)) return false;
      try {
        section.scrollIntoView({ behavior: options.instant ? "auto" : "smooth", block: "start" });
      } catch {
        (_a = section.scrollIntoView) == null ? void 0 : _a.call(section);
      }
      if (options.focus) {
        if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
        try {
          section.focus({ preventScroll: true });
        } catch {
          (_b = section.focus) == null ? void 0 : _b.call(section);
        }
      }
      return true;
    }
    async function openSection(place, target = "about") {
      var _a;
      const resolvedPlace = typeof place === "string" ? (Array.isArray(global.PLACES) ? global.PLACES : []).find((row) => placeId(row) === text2(place)) : place;
      if (!resolvedPlace) return false;
      if (isMicro2(resolvedPlace)) {
        if (typeof legacyShowPlacePopup === "function") legacyShowPlacePopup(resolvedPlace);
        return true;
      }
      const root = card2();
      const samePlace = text2((_a = root == null ? void 0 : root.dataset) == null ? void 0 : _a.currentPlaceId) === placeId(resolvedPlace);
      if (!samePlace && typeof global.openPlaceCard === "function") await global.openPlaceCard(resolvedPlace);
      else await materialize(resolvedPlace, { refresh: false });
      const id = canonicalSection(target);
      if (scrollToSection(id)) return true;
      await wait(30);
      return scrollToSection(id);
    }
    function patchOpenPlaceCard() {
      const current = global.openPlaceCard;
      if (typeof current !== "function" || current.__hgUnifiedPlaceSurface === true) return false;
      legacyOpenPlaceCard = current;
      const wrapped = async function openUnifiedPlaceCard(place, ...args) {
        var _a, _b;
        const result = current.call(this, place, ...args);
        const resolved = result && typeof result.then === "function" ? await result : result;
        if (isMicro2(place)) clearUnifiedState();
        else {
          activeMount = materialize(((_b = (_a = global.HGPlaceOpen) == null ? void 0 : _a.getPlace) == null ? void 0 : _b.call(_a, place)) || place, { refresh: true });
          await activeMount;
        }
        return resolved;
      };
      Object.keys(current).forEach((key) => {
        try {
          wrapped[key] = current[key];
        } catch {
        }
      });
      wrapped.__hgUnifiedPlaceSurface = true;
      wrapped.__previous = current;
      global.openPlaceCard = wrapped;
      return true;
    }
    function patchShowPlacePopup() {
      const current = global.showPlacePopup;
      if (typeof current !== "function" || current.__hgUnifiedPlaceSurface === true) return false;
      legacyShowPlacePopup = current;
      const wrapped = function showUnifiedPlaceSurface(place, target) {
        if (isMicro2(place)) return current.apply(this, [place, target]);
        return openSection(place, target || "about");
      };
      Object.keys(current).forEach((key) => {
        try {
          wrapped[key] = current[key];
        } catch {
        }
      });
      wrapped.__hgUnifiedPlaceSurface = true;
      wrapped.__hgPlacePopupV2 = current.__hgPlacePopupV2 === true;
      wrapped.__hgPlacePopupTabs = current.__hgPlacePopupTabs === true;
      wrapped.__hgPlacePopupDirectTabs = current.__hgPlacePopupDirectTabs === true;
      wrapped.__previous = current;
      global.showPlacePopup = wrapped;
      return true;
    }
    function installPopupTabBridge() {
      if (!global.HGPlacePopupTabs) return false;
      global.HGPlacePopupTabs.openTab = function openUnifiedPopupTab(place, tabId) {
        return openSection(place, tabId);
      };
      return true;
    }
    function install() {
      ensureStylesheet();
      if (global[INSTALL_FLAG]) {
        installPopupTabBridge();
        return true;
      }
      if (typeof global.openPlaceCard !== "function" || typeof global.showPlacePopup !== "function") return false;
      if (global.showPlacePopup.__hgPlacePopupV2 !== true) return false;
      if (global.__HG_PLACE_POPUP_DIRECT_TABS_INSTALLED__ !== true) return false;
      patchOpenPlaceCard();
      patchShowPlacePopup();
      installPopupTabBridge();
      global[INSTALL_FLAG] = true;
      global.HGPlaceUnifiedSurface = {
        ensure: (place2, options = {}) => materialize(place2, options),
        open: openSection,
        scrollToSection,
        clear: clearUnifiedState,
        currentPlace,
        canonicalSection,
        sectionIds: SECTION_ORDER.map(([id]) => id),
        get legacyOpenPlaceCard() {
          return legacyOpenPlaceCard;
        },
        get legacyShowPlacePopup() {
          return legacyShowPlacePopup;
        }
      };
      const place = currentPlace();
      if (place && !isMicro2(place)) void materialize(place, { refresh: true });
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
})();
//# sourceMappingURL=place-unified-surface.js.map
