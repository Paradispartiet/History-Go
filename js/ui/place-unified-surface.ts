import { mountPlaceSheetPhase1, placeSheetSectionTarget, restoreLegacyPlaceCardStructure } from "./place-sheet/place-sheet-shell";

// js/ui/place-unified-surface.ts
// Unified Place Surface: embeds the canonical place-popup knowledge renderer
// inside PlaceCard, preserving existing data owners and public entry points.

type HistoryGoUnifiedRuntime = Window & typeof globalThis & {
  DEBUG?: boolean;
  PLACES?: Array<Record<string, unknown>>;
  openPlaceCard?: (...args: any[]) => any;
  showPlacePopup?: (...args: any[]) => any;
  HGPlaceOpen?: { getPlace?: (place: unknown) => any };
  HGPlacePopupTabs?: Record<string, any>;
  HGPlacePopupDirectTabs?: Record<string, any>;
  HGLanguageLayer?: Record<string, any>;
  HGPlaceLearningSurface?: Record<string, any>;
  HGPlaceUnifiedSurface?: Record<string, any>;
  __HG_PLACE_POPUP_DIRECT_TABS_INSTALLED__?: boolean;
  __HG_PLACE_UNIFIED_SURFACE_INSTALLED__?: boolean;
};

(function installPlaceUnifiedSurface(global: HistoryGoUnifiedRuntime) {
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
    ["before-after", "Før/etter"],
    ["news", "Nyheter"],
    ["reading", "Lesespor"],
    ["language", "Språk"],
    ["learning", "Fagverk"],
    ["sources", "Kilder"]
  ] as const);

  const SECTION_ALIASES: Readonly<Record<string, string>> = Object.freeze({
    about: "about", om: "about", info: "about", more: "about",
    history: "history", historie: "history", chronology: "history", kronologi: "history",
    stories: "stories", story: "stories", fortellinger: "stories", fortelling: "stories",
    "before-after": "before-after", beforeafter: "before-after", for_na: "before-after", forna: "before-after",
    news: "news", nyheter: "news",
    reading: "reading", lesespor: "reading",
    language: "language", sprak: "language", "språk": "language",
    learning: "learning", fagverk: "learning", fag: "learning",
    sources: "sources", kilder: "sources"
  });

  const text = (value: unknown): string => String(value == null ? "" : value).trim();
  const wait = (ms: number): Promise<void> => new Promise(resolve => global.setTimeout(resolve, ms));

  let legacyOpenPlaceCard: ((...args: any[]) => any) | null = null;
  let legacyShowPlacePopup: ((...args: any[]) => any) | null = null;
  let generation = 0;
  let activeMount: Promise<HTMLElement | null> = Promise.resolve(null);

  function isMicro(place: any): boolean {
    return text(place?.placeTier).toLowerCase() === "micro";
  }

  function placeId(place: any): string {
    return text(place?.id);
  }

  function card(): HTMLElement | null {
    return document.getElementById("placeCard");
  }

  function currentPlace(): any | null {
    const id = text(card()?.dataset?.currentPlaceId);
    if (!id) return null;
    return (Array.isArray(global.PLACES) ? global.PLACES : []).find(place => placeId(place) === id) || null;
  }

  function canonicalSection(value: unknown): string {
    const key = text(value).toLowerCase().replace(/\s+/g, "-");
    return SECTION_ALIASES[key] || (SECTION_ORDER.some(([id]) => id === key) ? key : "about");
  }

  function ensureStylesheet(): void {
    const styles = [
      [STYLE_FLAG, "css/place-unified-surface.css"],
      [SHEET_STYLE_FLAG, "css/place-sheet.css"]
    ] as const;
    for (const [flag, href] of styles) {
      if (document.querySelector(`link[${flag}="1"]`)) continue;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute(flag, "1");
      document.head.appendChild(link);
    }
  }

  function ensureHost(place: any): HTMLElement | null {
    const root = card();
    const body = root?.querySelector(".pc-body");
    if (!(root instanceof HTMLElement) || !(body instanceof HTMLElement)) return null;

    let host = document.getElementById(HOST_ID);
    if (!(host instanceof HTMLElement)) {
      host = document.createElement("section");
      host.id = HOST_ID;
      host.className = "pc-unified-knowledge-host";
      host.setAttribute("aria-label", "Stedets kunnskap");
      host.innerHTML = '<div class="pc-unified-loading" data-hg-unified-loading aria-live="polite">Laster stedets innhold …</div>';
      body.appendChild(host);
    } else if (host.parentElement !== body) {
      body.appendChild(host);
    }

    root.classList.add(CARD_CLASS);
    root.dataset.hgUnifiedPlaceId = placeId(place);
    return host;
  }

  function removeEmbeddedRenderer(): void {
    document.querySelectorAll(`.hg-popup.place-popup-v2.${EMBEDDED_CLASS}`).forEach(node => node.remove());
  }

  function clearUnifiedState(): void {
    restoreLegacyPlaceCardStructure();
    const root = card();
    root?.classList.remove(CARD_CLASS);
    if (root) {
      delete root.dataset.hgUnifiedPlaceId;
      delete root.dataset[GENERATION_ATTR];
    }
    removeEmbeddedRenderer();
    document.getElementById(HOST_ID)?.remove();
    document.body?.classList.remove(STAGING_CLASS);
  }

  async function waitForPopup(expectedGeneration: number, place: any, timeoutMs = 1800): Promise<HTMLElement | null> {
    const started = Date.now();
    const expectedName = text(place?.name || place?.title);
    while (Date.now() - started < timeoutMs) {
      if (String(card()?.dataset?.[GENERATION_ATTR] || "") !== String(expectedGeneration)) return null;
      const candidates = [...document.querySelectorAll(".hg-popup.place-popup-v2")]
        .filter(node => !node.classList.contains(EMBEDDED_CLASS));
      const popup = expectedName
        ? candidates.find(node => text(node.querySelector(".hg-modal-title")?.textContent) === expectedName)
        : candidates[0];
      if (popup instanceof HTMLElement) return popup;
      await wait(20);
    }
    return null;
  }

  async function waitForTabs(popup: HTMLElement, expectedGeneration: number, timeoutMs = 1800): Promise<HTMLElement | null> {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (String(card()?.dataset?.[GENERATION_ATTR] || "") !== String(expectedGeneration)) return null;
      const article = popup?.querySelector('.hg-place-popup-v2[data-hg-place-tabs="1"]')
        || popup?.querySelector(".hg-place-popup-v2");
      const panels = article?.querySelector(".hg-place-tab-panels");
      if (article instanceof HTMLElement && panels instanceof HTMLElement) return article;
      await wait(20);
    }
    return null;
  }

  function sectionLabel(id: string): string {
    if (id === "about" && placeSheetSectionTarget("about")) return "Mer om stedet";
    return SECTION_ORDER.find(([key]) => key === id)?.[1] || id;
  }

  function normalizePanels(article: HTMLElement): void {
    const panelWrap = article.querySelector(".hg-place-tab-panels");
    if (!(panelWrap instanceof HTMLElement)) return;

    [...panelWrap.querySelectorAll("[data-place-panel]")].forEach(panel => {
      if (!(panel instanceof HTMLElement)) return;
      const id = text(panel.dataset.placePanel);
      if (id === "more" || ((id === "before-after" || id === "news") && placeSheetSectionTarget(id))) {
        panel.hidden = true;
        panel.setAttribute("aria-hidden", "true");
        panel.dataset.hgUnifiedSection = id;
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

  function bindUnifiedNavigation(popup: HTMLElement, article: HTMLElement): void {
    const tablist = article.querySelector(".hg-place-tabs");
    const panelWrap = article.querySelector(".hg-place-tab-panels");
    if (!(tablist instanceof HTMLElement) || !(panelWrap instanceof HTMLElement)) return;

    tablist.classList.add("pc-unified-section-nav");
    tablist.setAttribute("aria-label", "Hopp til del av stedet");
    tablist.removeAttribute("role");

    [...tablist.querySelectorAll("[data-place-tab]")].forEach(button => {
      if (!(button instanceof HTMLElement)) return;
      const id = canonicalSection(button.dataset.placeTab);
      if (id === "about" && text(button.dataset.placeTab) === "more") {
        button.remove();
        return;
      }
      button.removeAttribute("role");
      button.removeAttribute("aria-selected");
      button.removeAttribute("aria-controls");
      button.tabIndex = 0;
      button.dataset.hgUnifiedJump = id;
    });

    const intercept = (event: Event): void => {
      const target = event.target instanceof Element ? event.target.closest("[data-hg-unified-jump]") : null;
      if (!(target instanceof HTMLElement) || !popup.contains(target)) return;
      if (event.type === "keydown") {
        const keyboardEvent = event as KeyboardEvent;
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
    (popup as any).__hgUnifiedPanelObserver = observer;
  }

  async function ensureLearningSection(place: any, article: HTMLElement): Promise<HTMLElement | null> {
    const api = global.HGPlaceLearningSurface;
    if (!api || typeof api.loadRegistry !== "function" || typeof api.renderLearningSection !== "function") return null;
    let registry: any = null;
    try { registry = await api.loadRegistry(); } catch {}
    if (!registry || !article?.isConnected) return null;

    const body = article.querySelector(".hg-place-popup-body");
    if (!(body instanceof HTMLElement)) return null;
    let wrapper: HTMLElement | null = body.querySelector<HTMLElement>('[data-hg-unified-section="learning"]');
    const existingLearning = body.querySelector(".hg-place-learning-section");

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
        const rendered = text(api.renderLearningSection(registry, place));
        if (!rendered) return null;
        wrapper.insertAdjacentHTML("beforeend", rendered);
      }

      const panels = body.querySelector(".hg-place-tab-panels");
      panels?.insertAdjacentElement("afterend", wrapper);
    }

    const stableWrapper = wrapper as HTMLElement;
    const reconcileLearning = (): void => {
      if (!stableWrapper.isConnected) return;
      const owned = stableWrapper.querySelector(".hg-place-learning-section");
      [...body.querySelectorAll(".hg-place-learning-section")].forEach(section => {
        if (!(section instanceof HTMLElement) || stableWrapper.contains(section)) return;
        if (owned) section.remove();
        else stableWrapper.appendChild(section);
      });
    };
    reconcileLearning();
    if (!(stableWrapper as any).__hgUnifiedLearningObserver) {
      const observer = new MutationObserver(reconcileLearning);
      observer.observe(body, { childList: true, subtree: true });
      (stableWrapper as any).__hgUnifiedLearningObserver = observer;
      global.setTimeout(() => observer.disconnect(), 10000);
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

  function prepareEmbeddedPopup(popup: HTMLElement, article: HTMLElement, place: any): HTMLElement | null {
    const host = ensureHost(place);
    if (!(host instanceof HTMLElement)) return null;

    host.querySelector("[data-hg-unified-loading]")?.remove();
    popup.classList.add(EMBEDDED_CLASS);
    popup.dataset.hgUnifiedPlaceId = placeId(place);
    popup.setAttribute("aria-label", `Kunnskap om ${text(place?.name || "stedet")}`);
    popup.querySelector(".hg-popup-close")?.setAttribute("hidden", "");
    if (popup.parentElement !== host) host.replaceChildren(popup);

    bindUnifiedNavigation(popup, article);
    normalizePanels(article);
    return popup;
  }

  async function materialize(place: any, options: { refresh?: boolean } = {}): Promise<HTMLElement | null> {
    const id = placeId(place);
    if (!id || isMicro(place)) {
      clearUnifiedState();
      return null;
    }

    const root = card();
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
      host.innerHTML = '<div class="pc-unified-loading" data-hg-unified-loading aria-live="polite">Laster stedets innhold …</div>';
    }

    if (typeof legacyShowPlacePopup !== "function") return null;
    document.body?.classList.add(STAGING_CLASS);
    document.querySelectorAll(`.hg-popup.place-popup-v2:not(.${EMBEDDED_CLASS})`).forEach(node => node.remove());

    try {
      const ownsHistory = placeSheetSectionTarget("history") instanceof HTMLElement;
      const ownsStories = placeSheetSectionTarget("stories") instanceof HTMLElement;
      const result = legacyShowPlacePopup(place, {
        unifiedHost: host instanceof HTMLElement ? host : null,
        suppressPlaceAbout: true,
        suppressPlaceHistory: ownsHistory,
        suppressPlaceStories: ownsStories
      });
      if (result && typeof result.then === "function") await result;
      const popup = await waitForPopup(myGeneration, place);
      if (!(popup instanceof HTMLElement)) return null;

      try { global.HGPlacePopupTabs?.decoratePopup?.(place, popup); } catch {}
      try { global.HGPlacePopupDirectTabs?.decoratePopup?.(place, popup); } catch {}
      try {
        const languageResult = global.HGLanguageLayer?.decoratePopup?.(place, popup);
        if (languageResult && typeof languageResult.then === "function") await languageResult;
      } catch {}

      const article = await waitForTabs(popup, myGeneration);
      if (!(article instanceof HTMLElement)) return null;
      if (String(root.dataset[GENERATION_ATTR] || "") !== String(myGeneration)) return null;

      // Phase 2: About and canonical history_layers are already rendered directly by Place Sheet.
      // Remove only compatibility duplicates if an older/custom popup renderer ignored suppression.
      if (placeSheetSectionTarget("about")) popup.querySelector(".hg-place-about-section")?.remove();
      if (placeSheetSectionTarget("history")) popup.querySelector(".hg-place-history-section")?.remove();
      if (placeSheetSectionTarget("stories")) popup.querySelector(".hg-section-stories")?.remove();
      if (placeSheetSectionTarget("before-after")) popup.querySelector('[data-generated="before-after"]')?.remove();
      if (placeSheetSectionTarget("news")) popup.querySelector('[data-generated="news"]')?.remove();
      const embedded = prepareEmbeddedPopup(popup, article, place);
      if (!(embedded instanceof HTMLElement)) return null;
      await ensureLearningSection(place, article);
      normalizePanels(article);
      global.dispatchEvent?.(new CustomEvent("hg:place-unified-ready", { detail: { placeId: id } }));
      return embedded;
    } catch (error) {
      if (global.DEBUG) console.warn("[place-unified-surface]", error);
      return null;
    } finally {
      if (String(root.dataset[GENERATION_ATTR] || "") === String(myGeneration)) {
        document.body?.classList.remove(STAGING_CLASS);
      }
    }
  }

  function scrollToSection(target: unknown, options: { instant?: boolean; focus?: boolean } = {}): boolean {
    const id = canonicalSection(target);
    const root = card();
    if (!(root instanceof HTMLElement)) return false;

    let section: Element | null = (["about", "history", "stories", "before-after", "news"].includes(id)) ? placeSheetSectionTarget(id) : null;
    if (!(section instanceof HTMLElement) && id === "learning") {
      section = root.querySelector('[data-hg-unified-section="learning"]');
    } else if (!(section instanceof HTMLElement)) {
      section = [...root.querySelectorAll("[data-place-panel]")]
        .find(panel => text(panel.getAttribute("data-place-panel")) === id) || null;
    }
    if (!(section instanceof HTMLElement)) return false;

    try { section.scrollIntoView({ behavior: options.instant ? "auto" : "smooth", block: "start" }); }
    catch { section.scrollIntoView?.(); }
    if (options.focus) {
      if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
      try { section.focus({ preventScroll: true }); } catch { section.focus?.(); }
    }
    return true;
  }

  async function openSection(place: any, target: unknown = "about"): Promise<boolean> {
    const resolvedPlace = typeof place === "string"
      ? (Array.isArray(global.PLACES) ? global.PLACES : []).find(row => placeId(row) === text(place))
      : place;
    if (!resolvedPlace) return false;
    if (isMicro(resolvedPlace)) {
      if (typeof legacyShowPlacePopup === "function") legacyShowPlacePopup(resolvedPlace);
      return true;
    }

    const root = card();
    const samePlace = text(root?.dataset?.currentPlaceId) === placeId(resolvedPlace);
    if (!samePlace && typeof global.openPlaceCard === "function") await global.openPlaceCard(resolvedPlace);
    else await materialize(resolvedPlace, { refresh: false });

    const id = canonicalSection(target);
    if (scrollToSection(id)) return true;
    await wait(30);
    return scrollToSection(id);
  }

  function patchOpenPlaceCard(): boolean {
    const current = global.openPlaceCard;
    if (typeof current !== "function" || (current as any).__hgUnifiedPlaceSurface === true) return false;
    legacyOpenPlaceCard = current;

    const wrapped: any = async function openUnifiedPlaceCard(this: unknown, place: any, ...args: any[]) {
      const result = current.call(this, place, ...args);
      const resolved = result && typeof result.then === "function" ? await result : result;
      if (isMicro(place)) clearUnifiedState();
      else {
        activeMount = materialize(global.HGPlaceOpen?.getPlace?.(place) || place, { refresh: true });
        await activeMount;
      }
      return resolved;
    };
    Object.keys(current as any).forEach(key => { try { wrapped[key] = (current as any)[key]; } catch {} });
    wrapped.__hgUnifiedPlaceSurface = true;
    wrapped.__previous = current;
    global.openPlaceCard = wrapped;
    return true;
  }

  function patchShowPlacePopup(): boolean {
    const current = global.showPlacePopup;
    if (typeof current !== "function" || (current as any).__hgUnifiedPlaceSurface === true) return false;
    legacyShowPlacePopup = current;

    const wrapped: any = function showUnifiedPlaceSurface(this: unknown, place: any, target?: unknown) {
      if (isMicro(place)) return current.apply(this, [place, target]);
      return openSection(place, target || "about");
    };
    Object.keys(current as any).forEach(key => { try { wrapped[key] = (current as any)[key]; } catch {} });
    wrapped.__hgUnifiedPlaceSurface = true;
    wrapped.__hgPlacePopupV2 = (current as any).__hgPlacePopupV2 === true;
    wrapped.__hgPlacePopupTabs = (current as any).__hgPlacePopupTabs === true;
    wrapped.__hgPlacePopupDirectTabs = (current as any).__hgPlacePopupDirectTabs === true;
    wrapped.__previous = current;
    global.showPlacePopup = wrapped;
    return true;
  }

  function installPopupTabBridge(): boolean {
    if (!global.HGPlacePopupTabs) return false;
    global.HGPlacePopupTabs.openTab = function openUnifiedPopupTab(place: any, tabId: unknown) {
      return openSection(place, tabId);
    };
    return true;
  }

  function install(): boolean {
    ensureStylesheet();
    if (global[INSTALL_FLAG]) {
      installPopupTabBridge();
      return true;
    }
    if (typeof global.openPlaceCard !== "function" || typeof global.showPlacePopup !== "function") return false;
    if ((global.showPlacePopup as any).__hgPlacePopupV2 !== true) return false;
    if (global.__HG_PLACE_POPUP_DIRECT_TABS_INSTALLED__ !== true) return false;

    patchOpenPlaceCard();
    patchShowPlacePopup();
    installPopupTabBridge();
    global[INSTALL_FLAG] = true;

    global.HGPlaceUnifiedSurface = {
      ensure: (place: any, options: { refresh?: boolean } = {}) => materialize(place, options),
      open: openSection,
      scrollToSection,
      clear: clearUnifiedState,
      currentPlace,
      canonicalSection,
      sectionIds: SECTION_ORDER.map(([id]) => id),
      get legacyOpenPlaceCard() { return legacyOpenPlaceCard; },
      get legacyShowPlacePopup() { return legacyShowPlacePopup; }
    };

    const place = currentPlace();
    if (place && !isMicro(place)) void materialize(place, { refresh: true });
    return true;
  }

  if (!install()) {
    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (install() || attempts > 400) global.clearInterval(timer);
    }, 50);
  }
})(window as HistoryGoUnifiedRuntime);

export {};
