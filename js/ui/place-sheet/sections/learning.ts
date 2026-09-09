type PlaceSheetLearningRuntime = Window & typeof globalThis & {
  HGPlaceSheetSections?: Record<string, unknown> & { learning?: PlaceSheetLearningApi };
};

type PlaceSheetLearningApi = {
  adopt: (placeId: string) => HTMLElement | null;
};

const runtime = window as PlaceSheetLearningRuntime;

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

function embeddedLearning(): HTMLElement | null {
  return document.querySelector<HTMLElement>('#pcUnifiedKnowledgeHost [data-hg-unified-section="learning"]');
}

function ensureSlot(): HTMLElement | null {
  const root = shell();
  if (!(root instanceof HTMLElement)) return null;
  let slot = root.querySelector<HTMLElement>('[data-hg-place-sheet-learning="1"]');
  if (!(slot instanceof HTMLElement)) {
    slot = document.createElement("section");
    slot.className = "pc-sheet-learning";
    slot.setAttribute("data-hg-place-sheet-learning", "1");
    slot.setAttribute("data-hg-place-sheet-section", "learning");
    slot.hidden = true;

    const language = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="language"]');
    const reading = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="reading"]');
    const news = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="news"]');
    const anchor = language || reading || news;
    if (anchor?.nextSibling) root.insertBefore(slot, anchor.nextSibling);
    else root.appendChild(slot);
  }
  return slot;
}

export function adoptCanonicalLearning(placeId: string): HTMLElement | null {
  const id = text(placeId);
  if (!id) return null;
  const learning = embeddedLearning();
  if (!(learning instanceof HTMLElement)) return null;
  if (!learning.querySelector('.hg-place-learning-section')) return null;

  const slot = ensureSlot();
  if (!(slot instanceof HTMLElement)) return null;

  let compat = slot.querySelector<HTMLElement>('[data-hg-place-sheet-learning-compat="1"]');
  if (!(compat instanceof HTMLElement)) {
    compat = document.createElement("div");
    compat.className = "pc-sheet-learning-compat hg-place-popup-v2";
    compat.setAttribute("data-hg-place-sheet-learning-compat", "1");
  }

  learning.hidden = false;
  learning.removeAttribute("aria-hidden");
  learning.setAttribute("role", "region");
  learning.style.scrollMarginTop = "76px";
  compat.replaceChildren(learning);
  slot.replaceChildren(compat);
  slot.hidden = false;
  slot.dataset.placeId = id;
  return slot;
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
