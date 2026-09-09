import { promoteAutomaticPlaceSheetSection } from "./place-sheet-render-queue";

type UnifiedApi = {
  canonicalSection?: (target: unknown) => string;
  scrollToSection?: (target: unknown, options?: { instant?: boolean; focus?: boolean }) => boolean;
};

type DirectRoutingRuntime = Window & typeof globalThis & {
  PLACES?: Array<Record<string, any>>;
  showPlacePopup?: ((place: any, target?: unknown) => any) & Record<string, any>;
  HGPlacePopupTabs?: Record<string, any> & { openTab?: (place: any, tabId: unknown) => any };
  HGPlaceUnifiedSurface?: UnifiedApi;
  __HG_PLACE_UNIFIED_SURFACE_INSTALLED__?: boolean;
  __HG_PLACE_SHEET_DIRECT_ROUTING_INSTALLED__?: boolean;
};

const runtime = window as DirectRoutingRuntime;
const INSTALL_FLAG = "__HG_PLACE_SHEET_DIRECT_ROUTING_INSTALLED__";
const WRAPPED_FLAG = "__hgPlaceSheetDirectRouting";

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function resolvedPlace(place: any): any {
  if (place && typeof place === "object") return place;
  const id = text(place);
  return (Array.isArray(runtime.PLACES) ? runtime.PLACES : []).find(row => text(row?.id) === id) || place;
}

function placeId(place: any): string {
  const value = resolvedPlace(place);
  return text(value?.id || (typeof value === "string" ? value : ""));
}

function isMicro(place: any): boolean {
  const value = resolvedPlace(place);
  return text(value?.placeTier).toLowerCase() === "micro";
}

function canonicalSection(target: unknown): string {
  const canonical = runtime.HGPlaceUnifiedSurface?.canonicalSection;
  return typeof canonical === "function" ? canonical(target || "about") : text(target || "about");
}

async function finishPromotedRoute(
  value: any,
  promotion: Promise<boolean>,
  sectionId: string
): Promise<any> {
  try { await promotion; } catch {}
  try { runtime.HGPlaceUnifiedSurface?.scrollToSection?.(sectionId); } catch {}
  return value;
}

function wrapShowPlacePopup(): boolean {
  const current = runtime.showPlacePopup;
  if (typeof current !== "function" || (current as any)[WRAPPED_FLAG] === true) return false;
  if ((current as any).__hgUnifiedPlaceSurface !== true) return false;

  const wrapped: any = function showPromotedPlaceSheetSection(this: unknown, place: any, target?: unknown) {
    if (isMicro(place)) return current.apply(this, [place, target]);
    const id = canonicalSection(target || "about");
    const promotion = promoteAutomaticPlaceSheetSection(placeId(place), id);
    const result = current.apply(this, [place, target]);
    return Promise.resolve(result).then(value => finishPromotedRoute(value, promotion, id));
  };
  Object.keys(current as any).forEach(key => { try { wrapped[key] = (current as any)[key]; } catch {} });
  wrapped[WRAPPED_FLAG] = true;
  wrapped.__previous = current;
  runtime.showPlacePopup = wrapped;
  return true;
}

function wrapPopupTabBridge(): boolean {
  const tabs = runtime.HGPlacePopupTabs;
  const current = tabs?.openTab;
  if (!tabs || typeof current !== "function" || (current as any)[WRAPPED_FLAG] === true) return false;

  const wrapped: any = function openPromotedPlaceSheetSection(this: unknown, place: any, tabId: unknown) {
    if (isMicro(place)) return current.apply(this, [place, tabId]);
    const id = canonicalSection(tabId);
    const promotion = promoteAutomaticPlaceSheetSection(placeId(place), id);
    const result = current.apply(this, [place, tabId]);
    return Promise.resolve(result).then(value => finishPromotedRoute(value, promotion, id));
  };
  wrapped[WRAPPED_FLAG] = true;
  wrapped.__previous = current;
  tabs.openTab = wrapped;
  return true;
}

function install(): boolean {
  if (runtime[INSTALL_FLAG]) return true;
  if (runtime.__HG_PLACE_UNIFIED_SURFACE_INSTALLED__ !== true) return false;
  if (!runtime.HGPlaceUnifiedSurface || typeof runtime.showPlacePopup !== "function") return false;
  if ((runtime.showPlacePopup as any).__hgUnifiedPlaceSurface !== true) return false;

  wrapShowPlacePopup();
  wrapPopupTabBridge();
  runtime[INSTALL_FLAG] = true;
  return true;
}

if (!install()) {
  let attempts = 0;
  const timer = runtime.setInterval(() => {
    attempts += 1;
    if (install() || attempts > 400) runtime.clearInterval(timer);
  }, 25);
}
