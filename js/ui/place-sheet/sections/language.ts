type PlaceSheetLanguageRuntime = Window & typeof globalThis & {
  HGPlaceSheetSections?: Record<string, unknown> & { language?: PlaceSheetLanguageApi };
};

type PlaceSheetLanguageApi = {
  adopt: (placeId: string) => HTMLElement | null;
};

const runtime = window as PlaceSheetLanguageRuntime;

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

function embeddedLanguagePanel(): HTMLElement | null {
  return document.querySelector<HTMLElement>('#pcUnifiedKnowledgeHost .hg-place-language-panel[data-place-panel="language"]');
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
    // Until the section registry replaces the compatibility adapter, the
    // unified navigation can resolve direct sections through data-place-panel.
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

function removeEmbeddedLanguageTeaser(): void {
  document.querySelectorAll('#pcUnifiedKnowledgeHost [data-language-teaser]')
    .forEach(node => node.remove());
}

export function adoptCanonicalLanguage(placeId: string): HTMLElement | null {
  const id = text(placeId);
  if (!id) return null;

  const panel = embeddedLanguagePanel();
  if (!(panel instanceof HTMLElement)) return null;
  const languageRoot = panel.querySelector<HTMLElement>('[data-language-place]');
  const renderedPlaceId = text(languageRoot?.getAttribute("data-language-place"));
  if (renderedPlaceId && renderedPlaceId !== id) return null;

  const slot = ensureLanguageSlot();
  if (!(slot instanceof HTMLElement)) return null;

  let compat = slot.querySelector<HTMLElement>('[data-hg-place-sheet-language-compat="1"]');
  if (!(compat instanceof HTMLElement)) {
    compat = document.createElement("div");
    // The existing language stylesheet is intentionally scoped to this
    // compatibility root. Keeping that root during migration preserves the
    // atlas, filters and collection interactions without duplicating CSS.
    compat.className = "pc-sheet-language-compat hg-place-popup-v2";
    compat.setAttribute("data-hg-place-sheet-language-compat", "1");
    compat.setAttribute("data-hg-language-layer", "1");
  }

  panel.hidden = false;
  panel.removeAttribute("aria-hidden");
  panel.removeAttribute("aria-labelledby");
  panel.setAttribute("role", "region");
  panel.style.scrollMarginTop = "76px";

  compat.replaceChildren(panel);
  slot.replaceChildren(compat);
  slot.hidden = false;
  slot.dataset.placeId = id;
  removeEmbeddedLanguageTeaser();
  return slot;
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
