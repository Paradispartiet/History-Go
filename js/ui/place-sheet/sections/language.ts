type PlaceLike = Record<string, any>;

type PlaceSheetLanguageRuntime = Window & typeof globalThis & {
  PLACES?: PlaceLike[];
  HGPlaceOpen?: { getPlace?: (place: unknown) => PlaceLike | null };
  HGLanguageLayer?: {
    decoratePopup?: (place: PlaceLike, root?: HTMLElement | null) => Promise<unknown> | unknown;
  };
  HGPlaceSheetSections?: Record<string, unknown> & { language?: PlaceSheetLanguageApi };
};

type PlaceSheetLanguageApi = {
  adopt: (placeId: string) => HTMLElement | null;
};

const runtime = window as PlaceSheetLanguageRuntime;
let hydrationGeneration = 0;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function ensureStylesheet(): void {
  if (document.querySelector('link[data-hg-place-sheet-language-style="1"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/place-sheet-language.css";
  link.setAttribute("data-hg-place-sheet-language-style", "1");
  document.head.appendChild(link);
}

function placeSheetShell(): HTMLElement | null {
  return document.querySelector<HTMLElement>('#placeCard [data-hg-place-sheet-shell="1"]');
}

function ensureLanguageSlot(): HTMLElement | null {
  const shell = placeSheetShell();
  if (!(shell instanceof HTMLElement)) return null;
  let slot = shell.querySelector<HTMLElement>('[data-hg-place-sheet-language="1"]');
  if (!(slot instanceof HTMLElement)) {
    slot = document.createElement("section");
    slot.className = "pc-sheet-language";
    slot.setAttribute("data-hg-place-sheet-language", "1");
    slot.setAttribute("data-hg-place-sheet-section", "language");
    slot.setAttribute("data-place-panel", "language");
    slot.hidden = true;
    const reading = shell.querySelector<HTMLElement>('[data-hg-place-sheet-section="reading"]');
    const news = shell.querySelector<HTMLElement>('[data-hg-place-sheet-section="news"]');
    const anchor = reading || news;
    if (anchor?.nextSibling) shell.insertBefore(slot, anchor.nextSibling);
    else shell.appendChild(slot);
  }
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

function directScaffold(): HTMLElement {
  const compat = document.createElement("div");
  compat.className = "pc-sheet-language-compat hg-place-popup-v2";
  compat.setAttribute("data-hg-place-sheet-language-compat", "1");
  compat.setAttribute("data-hg-language-layer", "1");
  compat.innerHTML = `
    <div class="hg-popup place-popup-v2" data-hg-place-sheet-language-scaffold="1">
      <article class="hg-place-popup-v2" data-hg-place-tabs="1">
        <nav class="hg-place-tabs" role="tablist" aria-label="Språk"></nav>
        <div class="hg-place-tab-panels">
          <section class="hg-place-tab-panel" data-place-panel="more" hidden></section>
        </div>
      </article>
    </div>
  `;
  return compat;
}

async function hydrate(placeId: string): Promise<void> {
  const id = text(placeId);
  const place = placeFor(id);
  const slot = ensureLanguageSlot();
  const decorate = runtime.HGLanguageLayer?.decoratePopup;
  if (!id || !place || !(slot instanceof HTMLElement) || typeof decorate !== "function") return;

  const generation = ++hydrationGeneration;
  slot.hidden = true;
  delete slot.dataset.placeId;
  const compat = directScaffold();
  slot.replaceChildren(compat);
  const popup = compat.querySelector<HTMLElement>('[data-hg-place-sheet-language-scaffold="1"]');
  if (!(popup instanceof HTMLElement)) return;

  try {
    const result = decorate(place, popup);
    if (result && typeof (result as Promise<unknown>).then === "function") await result;
  } catch {}
  if (generation !== hydrationGeneration || !slot.isConnected) return;
  const shellId = text(slot.closest<HTMLElement>('[data-hg-place-sheet-shell="1"]')?.dataset.placeId);
  if (shellId && shellId !== id) return;

  const panel = compat.querySelector<HTMLElement>('.hg-place-language-panel[data-place-panel="language"]');
  if (!(panel instanceof HTMLElement)) {
    slot.replaceChildren();
    slot.hidden = true;
    delete slot.dataset.placeId;
    return;
  }

  panel.hidden = false;
  panel.removeAttribute("aria-hidden");
  panel.removeAttribute("aria-labelledby");
  panel.setAttribute("role", "region");
  panel.setAttribute("data-hg-place-sheet-owner", "language");
  panel.style.scrollMarginTop = "76px";

  // Keep only the owner-rendered language panel. The temporary tab scaffold is
  // never a standard Place popup and is discarded immediately after rendering.
  compat.replaceChildren(panel);
  slot.dataset.placeId = id;
  slot.hidden = false;
}

export function adoptCanonicalLanguage(placeId: string): HTMLElement | null {
  const id = text(placeId);
  if (!id) return null;
  const slot = ensureLanguageSlot();
  if (!(slot instanceof HTMLElement)) return null;
  const owner = slot.querySelector<HTMLElement>('[data-hg-place-sheet-owner="language"]');
  if (!slot.hidden && text(slot.dataset.placeId) === id && owner instanceof HTMLElement) return slot;
  void hydrate(id);
  return null;
}

function onUnifiedReady(event: Event): void {
  const id = text((event as CustomEvent<{ placeId?: string }>).detail?.placeId);
  if (id) adoptCanonicalLanguage(id);
}

ensureStylesheet();
runtime.addEventListener("hg:place-unified-ready", onUnifiedReady);

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  language: { adopt: adoptCanonicalLanguage }
};
