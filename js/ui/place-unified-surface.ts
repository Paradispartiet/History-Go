import { mountPlaceSheetPhase1, placeSheetSectionTarget, restoreLegacyPlaceCardStructure } from "./place-sheet/place-sheet-shell";
import { promoteAutomaticPlaceSheetSection } from "./place-sheet/place-sheet-render-queue";

// Phase 7 compatibility router: standard Places are owned by Place Sheet.
// Legacy popup runtimes remain compatibility-only for Micro and old callers.
type HistoryGoUnifiedRuntime = Window & typeof globalThis & {
  DEBUG?: boolean;
  PLACES?: Array<Record<string, any>>;
  openPlaceCard?: (...args: any[]) => any;
  showPlacePopup?: (...args: any[]) => any;
  HGPlaceOpen?: { getPlace?: (place: unknown) => any };
  HGPlacePopupTabs?: Record<string, any>;
  HGPlaceUnifiedSurface?: Record<string, any>;
  __HG_PLACE_UNIFIED_SURFACE_INSTALLED__?: boolean;
};

(function installPlaceUnifiedSurface(global: HistoryGoUnifiedRuntime) {
  "use strict";

  const INSTALL_FLAG = "__HG_PLACE_UNIFIED_SURFACE_INSTALLED__";
  const STYLE_FLAG = "data-hg-place-unified-style";
  const SHEET_STYLE_FLAG = "data-hg-place-sheet-style";
  const PHASE6_STYLE_FLAG = "data-hg-place-sheet-phase6-style";
  const CARD_CLASS = "is-unified-place";

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
  let legacyOpenPlaceCard: ((...args: any[]) => any) | null = null;
  let legacyShowPlacePopup: ((...args: any[]) => any) | null = null;
  let readyGeneration = 0;
  let activeMount: Promise<HTMLElement | null> = Promise.resolve(null);
  let compatibilityTimer: number | null = null;

  function isMicro(place: any): boolean {
    return text(place?.placeTier).toLowerCase() === "micro";
  }

  function placeId(place: any): string {
    return text(place?.id);
  }

  function card(): HTMLElement | null {
    return document.getElementById("placeCard");
  }

  function resolvedPlace(place: any): any | null {
    if (place && typeof place === "object") return global.HGPlaceOpen?.getPlace?.(place) || place;
    const id = text(place);
    if (!id) return null;
    try {
      const enriched = global.HGPlaceOpen?.getPlace?.(id);
      if (enriched) return enriched;
    } catch {}
    return (Array.isArray(global.PLACES) ? global.PLACES : []).find(row => placeId(row) === id) || null;
  }

  function currentPlace(): any | null {
    const id = text(card()?.dataset?.currentPlaceId || card()?.dataset?.hgUnifiedPlaceId);
    return resolvedPlace(id);
  }

  function canonicalSection(value: unknown): string {
    const key = text(value).toLowerCase().replace(/\s+/g, "-");
    return SECTION_ALIASES[key] || (SECTION_ORDER.some(([id]) => id === key) ? key : "about");
  }

  function ensureStylesheet(): void {
    const styles = [
      [STYLE_FLAG, "css/place-unified-surface.css"],
      [SHEET_STYLE_FLAG, "css/place-sheet.css?v=20260912-onsite-under-explore1"],
      [PHASE6_STYLE_FLAG, "css/place-sheet-phase6.css"]
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

  function clearUnifiedState(): void {
    ++readyGeneration;
    restoreLegacyPlaceCardStructure();
    const root = card();
    root?.classList.remove(CARD_CLASS, "is-place-sheet-direct");
    if (root) {
      delete root.dataset.hgUnifiedPlaceId;
      delete root.dataset.hgUnifiedGeneration;
    }
  }

  function dispatchDirectReady(place: any, generation: number): void {
    global.setTimeout(() => {
      if (generation !== readyGeneration) return;
      const root = card();
      if (!(root instanceof HTMLElement) || text(root.dataset.hgUnifiedPlaceId) !== placeId(place)) return;
      global.dispatchEvent?.(new CustomEvent("hg:place-unified-ready", {
        detail: { placeId: placeId(place), direct: true, phase: 7 }
      }));
    }, 0);
  }

  async function materialize(placeInput: any, _options: { refresh?: boolean } = {}): Promise<HTMLElement | null> {
    const place = resolvedPlace(placeInput) || placeInput;
    const id = placeId(place);
    if (!id || isMicro(place)) {
      clearUnifiedState();
      return null;
    }

    const root = card();
    if (!(root instanceof HTMLElement)) return null;
    const shell = mountPlaceSheetPhase1(place);
    if (!(shell instanceof HTMLElement)) return null;

    root.classList.add(CARD_CLASS, "is-place-sheet-direct");
    root.dataset.hgUnifiedPlaceId = id;
    const generation = ++readyGeneration;
    root.dataset.hgUnifiedGeneration = String(generation);

    dispatchDirectReady(place, generation);
    return shell;
  }

  function scrollToSection(target: unknown, options: { instant?: boolean; focus?: boolean } = {}): boolean {
    const id = canonicalSection(target);
    const section = placeSheetSectionTarget(id);
    if (!(section instanceof HTMLElement)) return false;

    try { section.scrollIntoView({ behavior: options.instant ? "auto" : "smooth", block: "start" }); }
    catch { section.scrollIntoView?.(); }
    if (options.focus) {
      if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
      try { section.focus({ preventScroll: true }); } catch { section.focus?.(); }
    }
    return true;
  }

  async function openSection(placeInput: any, target: unknown = "about"): Promise<boolean> {
    const place = resolvedPlace(placeInput);
    if (!place) return false;
    if (isMicro(place)) {
      if (typeof legacyShowPlacePopup === "function") legacyShowPlacePopup(place, target);
      return true;
    }

    const id = canonicalSection(target);
    const promotion = promoteAutomaticPlaceSheetSection(placeId(place), id);
    const root = card();
    const samePlace = text(root?.dataset?.currentPlaceId || root?.dataset?.hgUnifiedPlaceId) === placeId(place);
    if (!samePlace && typeof global.openPlaceCard === "function") await global.openPlaceCard(place);
    else await materialize(place, { refresh: false });

    try { await promotion; } catch {}
    if (scrollToSection(id)) return true;
    await new Promise<void>(resolve => global.setTimeout(resolve, 20));
    return scrollToSection(id);
  }

  function patchOpenPlaceCard(): boolean {
    const current = global.openPlaceCard;
    if (typeof current !== "function" || (current as any).__hgUnifiedPlaceSurface === true) return false;
    legacyOpenPlaceCard = current;

    const wrapped: any = async function openUnifiedPlaceCard(this: unknown, place: any, ...args: any[]) {
      const result = current.call(this, place, ...args);
      const resolved = result && typeof result.then === "function" ? await result : result;
      const canonical = resolvedPlace(place) || place;
      if (isMicro(canonical)) clearUnifiedState();
      else {
        activeMount = materialize(canonical, { refresh: true });
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
      const canonical = resolvedPlace(place) || place;
      if (isMicro(canonical)) return current.apply(this, [canonical, target]);
      return openSection(canonical, target || "about");
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

  function compatibilityReady(): boolean {
    const popupReady = typeof global.showPlacePopup === "function"
      && (global.showPlacePopup as any).__hgUnifiedPlaceSurface === true;
    const tabsReady = !!global.HGPlacePopupTabs && typeof global.HGPlacePopupTabs.openTab === "function";
    return popupReady && tabsReady;
  }

  function installCompatibilityRoutes(): boolean {
    patchShowPlacePopup();
    installPopupTabBridge();
    return compatibilityReady();
  }

  function armCompatibilityRetry(): void {
    if (compatibilityReady() || compatibilityTimer != null) return;
    let attempts = 0;
    compatibilityTimer = global.setInterval(() => {
      attempts += 1;
      if (installCompatibilityRoutes() || attempts > 400) {
        if (compatibilityTimer != null) global.clearInterval(compatibilityTimer);
        compatibilityTimer = null;
      }
    }, 50);
  }

  function install(): boolean {
    ensureStylesheet();
    if (global[INSTALL_FLAG]) {
      installCompatibilityRoutes();
      armCompatibilityRetry();
      return true;
    }
    if (typeof global.openPlaceCard !== "function") return false;

    patchOpenPlaceCard();
    global[INSTALL_FLAG] = true;
    global.HGPlaceUnifiedSurface = {
      ensure: (place: any, options: { refresh?: boolean } = {}) => materialize(place, options),
      open: openSection,
      scrollToSection,
      clear: clearUnifiedState,
      currentPlace,
      canonicalSection,
      sectionIds: SECTION_ORDER.map(([id]) => id),
      phase: 7,
      directStandardPlaces: true,
      get legacyOpenPlaceCard() { return legacyOpenPlaceCard; },
      get legacyShowPlacePopup() { return legacyShowPlacePopup; }
    };
    installCompatibilityRoutes();
    armCompatibilityRetry();

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
