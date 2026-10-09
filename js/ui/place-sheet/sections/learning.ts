import "./sources";

type PlaceLike = Record<string, any>;

type PlaceSheetLearningRuntime = Window & typeof globalThis & {
  PLACES?: PlaceLike[];
  HGPlaceOpen?: { getPlace?: (place: unknown) => PlaceLike | null };
  HGPlaceLearningSurface?: {
    loadRegistry?: () => Promise<any> | any;
    renderLearningSection?: (registry: any, place: PlaceLike) => string;
  };
  HGPlaceSheetSections?: Record<string, unknown> & { learning?: PlaceSheetLearningApi };
};

type PlaceSheetLearningApi = {
  adopt: (placeId: string) => HTMLElement | null;
};

const runtime = window as PlaceSheetLearningRuntime;
let hydrationGeneration = 0;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function ensureStylesheet(): void {
  if (document.querySelector('link[data-hg-place-sheet-learning-style="1"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/place-sheet-learning.css";
  link.setAttribute("data-hg-place-sheet-learning-style", "1");
  document.head.appendChild(link);
}

function shell(): HTMLElement | null {
  return document.querySelector<HTMLElement>('#placeCard [data-hg-place-sheet-shell="1"]');
}

function ensureSlot(): HTMLElement | null {
  const root = shell();
  if (!(root instanceof HTMLElement)) return null;
  let slot = root.querySelector<HTMLElement>('[data-hg-place-sheet-learning="1"], [data-hg-place-sheet-section="learning"]');
  if (!(slot instanceof HTMLElement)) {
    slot = document.createElement("section");
    slot.hidden = true;
    const language = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="language"]');
    const reading = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="reading"]');
    const news = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="news"]');
    const anchor = language || reading || news;
    if (anchor?.nextSibling) root.insertBefore(slot, anchor.nextSibling);
    else root.appendChild(slot);
  }
  slot.classList.add("pc-sheet-learning");
  slot.setAttribute("data-hg-place-sheet-learning", "1");
  slot.setAttribute("data-hg-place-sheet-section", "learning");
  return slot;
}

function placeFor(placeId: string): PlaceLike | null {
  const id = text(placeId);
  if (!id) return null;
  try {
    const resolved = runtime.HGPlaceOpen?.getPlace?.(id);
    if (resolved && typeof resolved === "object") return resolved;
  } catch {}
  return (Array.isArray(runtime.PLACES) ? runtime.PLACES : []).find(place => text(place?.id) === id) || null;
}

function invalidate(slot: HTMLElement): void {
  slot.replaceChildren();
  slot.hidden = true;
  delete slot.dataset.placeId;
}

async function hydrate(placeId: string): Promise<void> {
  const id = text(placeId);
  const place = placeFor(id);
  const slot = ensureSlot();
  const api = runtime.HGPlaceLearningSurface;
  if (!id || !place || !(slot instanceof HTMLElement) || typeof api?.loadRegistry !== "function" || typeof api?.renderLearningSection !== "function") return;

  const generation = ++hydrationGeneration;
  invalidate(slot);
  let registry: any = null;
  try { registry = await api.loadRegistry(); } catch {}
  if (generation !== hydrationGeneration || !slot.isConnected || !registry) return;
  const shellId = text(slot.closest<HTMLElement>('[data-hg-place-sheet-shell="1"]')?.dataset.placeId);
  if (shellId && shellId !== id) return;

  let rendered = "";
  try { rendered = text(api.renderLearningSection(registry, place)); } catch {}
  if (!rendered) return;

  const compat = document.createElement("div");
  compat.className = "pc-sheet-learning-compat hg-place-popup-v2";
  compat.setAttribute("data-hg-place-sheet-learning-compat", "1");
  compat.innerHTML = `<section data-hg-place-sheet-owner="learning" data-place-id="${id.replace(/"/g, "&quot;")}">${rendered}</section>`;
  slot.replaceChildren(compat);
  slot.dataset.placeId = id;
  slot.hidden = false;
}

export function adoptCanonicalLearning(placeId: string): HTMLElement | null {
  const id = text(placeId);
  const slot = ensureSlot();
  if (!id || !(slot instanceof HTMLElement)) return null;
  const owner = slot.querySelector<HTMLElement>('[data-hg-place-sheet-owner="learning"]');
  if (!slot.hidden && text(slot.dataset.placeId) === id && owner instanceof HTMLElement) return slot;
  void hydrate(id);
  return null;
}

function onUnifiedReady(event: Event): void {
  const id = text((event as CustomEvent<{ placeId?: string }>).detail?.placeId);
  if (id) adoptCanonicalLearning(id);
}

ensureStylesheet();
runtime.addEventListener("hg:place-unified-ready", onUnifiedReady);

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  learning: { adopt: adoptCanonicalLearning }
};
