type PlaceSheetSourcesApi = {
  adopt: (placeId: string) => HTMLElement | null;
};

type PlaceSheetSourcesRuntime = Window & typeof globalThis & {
  HGPlaceSheetSections?: Record<string, unknown> & { sources?: PlaceSheetSourcesApi };
};

const runtime = window as PlaceSheetSourcesRuntime;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function ensureStylesheet(): void {
  if (document.querySelector('link[data-hg-place-sheet-sources-style="1"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/place-sheet-sources.css";
  link.setAttribute("data-hg-place-sheet-sources-style", "1");
  document.head.appendChild(link);
}

function shell(): HTMLElement | null {
  return document.querySelector<HTMLElement>('#placeCard [data-hg-place-sheet-shell="1"]');
}

function embeddedSourcesPanel(): HTMLElement | null {
  return document.querySelector<HTMLElement>('#pcUnifiedKnowledgeHost [data-place-panel="sources"]');
}

function ensureSlot(): HTMLElement | null {
  const root = shell();
  if (!(root instanceof HTMLElement)) return null;

  let slot = root.querySelector<HTMLElement>('[data-hg-place-sheet-sources="1"]');
  if (!(slot instanceof HTMLElement)) {
    slot = document.createElement("section");
    slot.className = "pc-sheet-sources";
    slot.setAttribute("data-hg-place-sheet-sources", "1");
    slot.setAttribute("data-hg-place-sheet-section", "sources");
    slot.hidden = true;

    const learning = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="learning"]');
    const language = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="language"]');
    const reading = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="reading"]');
    const news = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="news"]');
    const anchor = learning || language || reading || news;
    if (anchor?.nextSibling) root.insertBefore(slot, anchor.nextSibling);
    else root.appendChild(slot);
  }
  return slot;
}

export function adoptCanonicalSources(placeId: string): HTMLElement | null {
  const id = text(placeId);
  if (!id) return null;
  const panel = embeddedSourcesPanel();
  if (!(panel instanceof HTMLElement)) return null;

  const slot = ensureSlot();
  if (!(slot instanceof HTMLElement)) return null;

  panel.hidden = false;
  panel.removeAttribute("aria-hidden");
  panel.setAttribute("role", "region");
  panel.style.scrollMarginTop = "76px";
  panel.classList.add("pc-sheet-canonical-sources");

  slot.replaceChildren(panel);
  slot.hidden = false;
  slot.dataset.placeId = id;
  return slot;
}

function onUnifiedReady(event: Event): void {
  const id = text((event as CustomEvent<{ placeId?: string }>).detail?.placeId);
  if (id) adoptCanonicalSources(id);
}

ensureStylesheet();
runtime.addEventListener("hg:place-unified-ready", onUnifiedReady);

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  sources: { adopt: adoptCanonicalSources }
};
