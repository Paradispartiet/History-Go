import { mountCanonicalAbout } from "./sections/about";
import { mountCanonicalHistory } from "./sections/history";
import { mountCanonicalChronology } from "./sections/chronology";
import { mountCanonicalStories } from "./sections/stories";
import { mountCanonicalBeforeAfter } from "./sections/before-after";
import "./sections/news";
import "./sections/reading";
import "./sections/language";
import "./sections/learning";
import "./sections/special-sections";
import { cancelAutomaticPlaceSheetRender, startAutomaticPlaceSheetRender } from "./place-sheet-render-queue";
import "./place-sheet-direct-routing";

type PlaceSheetPlace = Record<string, any> & {
  id?: string;
  name?: string;
  title?: string;
  placeTier?: string;
};

type PlaceSheetShellRuntime = Window & typeof globalThis & {
  HGPlaceUnifiedSurface?: {
    open?: (place: unknown, target?: unknown) => Promise<boolean> | boolean;
    scrollToSection?: (target: unknown, options?: { instant?: boolean; focus?: boolean }) => boolean;
  };
  HGPlaceCardCollections?: {
    get?: (place: PlaceSheetPlace) => Array<{ id?: string; label?: string }>;
    getItems?: (place: PlaceSheetPlace, id: string) => unknown[];
  };
};

const runtime = window as PlaceSheetShellRuntime;
const SHELL_ATTR = "data-hg-place-sheet-shell";
const SHELL_SECTION_ATTR = "data-hg-place-sheet-section";
let sectionNavObserver: MutationObserver | null = null;
let observedShell: HTMLElement | null = null;
const NAV_ITEMS = [
  ["about", "Om"],
  ["history", "Historie"],
  ["stories", "Fortellinger"],
  ["before-after", "Før/etter"],
  ["news", "Nyheter"],
  ["reading", "Lesespor"],
  ["language", "Språk"],
  ["learning", "Fagverk"],
  ["sources", "Kilder"]
] as const;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function card(): HTMLElement | null {
  return document.getElementById("placeCard");
}

function body(): HTMLElement | null {
  return card()?.querySelector<HTMLElement>(":scope > .pc-body") || null;
}

function isMicro(place: PlaceSheetPlace | null | undefined): boolean {
  return text(place?.placeTier).toLowerCase() === "micro";
}

function ensureSectionNav(shell: HTMLElement, place: PlaceSheetPlace): HTMLElement {
  let nav = shell.querySelector<HTMLElement>('[data-hg-place-sheet-nav="1"]');
  if (!(nav instanceof HTMLElement)) {
    nav = document.createElement("nav");
    nav.className = "pc-sheet-section-nav";
    nav.setAttribute("data-hg-place-sheet-nav", "1");
    nav.setAttribute("aria-label", "Hopp til del av stedet");
    nav.innerHTML = NAV_ITEMS.map(([id, label]) => `<button type="button" data-hg-place-sheet-jump="${id}" hidden>${label}</button>`).join("");
    nav.addEventListener("click", event => {
      const collectionButton = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-hg-place-sheet-collection-link]")
        : null;
      if (collectionButton instanceof HTMLElement && nav?.contains(collectionButton)) {
        const collectionId = text(collectionButton.dataset.hgPlaceSheetCollectionLink);
        if (!collectionId) return;
        event.preventDefault();
        const root = card();
        const collection = root
          ? Array.from(root.querySelectorAll<HTMLElement>(".pc-collection"))
              .find(node => text(node.dataset.collectionId) === collectionId)
          : null;
        collection?.click();
        return;
      }

      const button = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-hg-place-sheet-jump]") : null;
      if (!(button instanceof HTMLElement) || !nav?.contains(button)) return;
      const target = text(button.dataset.hgPlaceSheetJump);
      const placeId = text(shell.dataset.placeId);
      if (!target || !placeId) return;
      event.preventDefault();
      const open = runtime.HGPlaceUnifiedSurface?.open;
      if (typeof open === "function") {
        void Promise.resolve(open(placeId, target));
      } else {
        runtime.HGPlaceUnifiedSurface?.scrollToSection?.(target);
      }
    });
  }
  if (shell.firstElementChild !== nav) shell.prepend(nav);
  nav.dataset.placeId = text(place.id);
  return nav;
}

function hasSectionContent(shell: HTMLElement, placeId: string, sectionId: string): boolean {
  const section = shell.querySelector<HTMLElement>(`[data-hg-place-sheet-section="${sectionId}"]`);
  if (!(section instanceof HTMLElement) || section.hidden) return false;

  // Compatibility sections load asynchronously and must belong to this Place,
  // not to the Place previously displayed in the reused shell.
  if (["news", "reading", "language", "learning", "sources"].includes(sectionId)
      && text(section.dataset.placeId) !== placeId) return false;

  if (sectionId === "sources") {
    // The Sources owner can render an empty-state message; that is not content.
    return Boolean(section.querySelector(".hg-place-source-list li, .hg-place-source-link-list a"));
  }

  const owner = section.querySelector<HTMLElement>(
    `[data-hg-place-sheet-owner="${sectionId}"]` +
    (sectionId === "history" ? ', [data-hg-place-sheet-owner="chronology"]' : "")
  );
  return Boolean(owner && text(owner.textContent) && !owner.querySelector(".hg-place-tab-empty"));
}

function syncSectionNav(shell: HTMLElement): void {
  const nav = shell.querySelector<HTMLElement>('[data-hg-place-sheet-nav="1"]');
  const placeId = text(shell.dataset.placeId);
  if (!(nav instanceof HTMLElement) || !placeId) return;
  nav.querySelectorAll<HTMLButtonElement>("[data-hg-place-sheet-jump]").forEach(button => {
    const visible = hasSectionContent(shell, placeId, text(button.dataset.hgPlaceSheetJump));
    if (button.hidden === visible) button.hidden = !visible;
  });
}

function hasCollectionContent(place: PlaceSheetPlace, id: string, sideStack: HTMLElement | null): boolean {
  let items: unknown;
  try { items = runtime.HGPlaceCardCollections?.getItems?.(place, id); } catch {}
  if (Array.isArray(items) && items.length) return true;

  const icon = sideStack
    ? Array.from(sideStack.querySelectorAll<HTMLElement>(".pc-collection"))
        .find(node => text(node.dataset.collectionId) === id)
    : null;
  if (!(icon instanceof HTMLElement) || icon.hidden || icon.getAttribute("aria-hidden") === "true") return false;
  const count = text(icon.dataset.collectionItemCount);
  if (count) return Number(count) > 0;
  // Preserve existing visible legacy previews while excluding known-empty
  // canonical collections.
  return !Array.isArray(items);
}

function syncCollectionNav(nav: HTMLElement, place: PlaceSheetPlace, sideStack: HTMLElement | null): Element | null {
  nav.querySelectorAll<HTMLElement>("[data-hg-place-sheet-collection-link]").forEach(button => button.remove());

  const configured = runtime.HGPlaceCardCollections?.get?.(place) || [];
  const fallback = sideStack
    ? Array.from(sideStack.querySelectorAll<HTMLElement>(".pc-collection"))
        .filter(node => !node.hidden && text(node.dataset.collectionId))
        .map(node => ({
          id: text(node.dataset.collectionId),
          label: text(node.getAttribute("aria-label") || node.title)
        }))
    : [];
  const source = (configured.length ? configured : fallback)
    .filter(item => hasCollectionContent(place, text(item?.id), sideStack));
  const seen = new Set<string>();
  let insertAfter = nav.querySelector<HTMLElement>('[data-hg-place-sheet-jump="about"]');

  for (const item of source) {
    const id = text(item?.id);
    const label = text(item?.label);
    if (!id || !label || seen.has(id)) continue;
    seen.add(id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pc-sheet-collection-link";
    button.dataset.hgPlaceSheetCollectionLink = id;
    button.textContent = label;
    insertAfter?.after(button);
    if (!insertAfter) nav.prepend(button);
    insertAfter = button;
  }

  return insertAfter;
}

function observeSectionNav(shell: HTMLElement, place: PlaceSheetPlace): void {
  if (observedShell !== shell) {
    sectionNavObserver?.disconnect();
    observedShell = shell;
    sectionNavObserver = new MutationObserver(mutations => {
      if (!observedShell?.isConnected) return;
      let sectionsChanged = false;
      let collectionsChanged = false;
      for (const mutation of mutations) {
        const target = mutation.target;
        if (!(target instanceof Element) || target.closest('[data-hg-place-sheet-nav="1"]')) continue;
        if (target.closest("[data-hg-place-sheet-section]")) sectionsChanged = true;
        if (target.closest(".pc-side-stack")) collectionsChanged = true;
      }
      if (sectionsChanged) syncSectionNav(shell);
      if (collectionsChanged) {
        const nav = shell.querySelector<HTMLElement>('[data-hg-place-sheet-nav="1"]');
        if (nav) {
          syncCollectionNav(nav, place, shell.querySelector<HTMLElement>(".pc-side-stack"));
        }
      }
    });
    sectionNavObserver.observe(shell, {
      subtree: true, childList: true, attributes: true,
      attributeFilter: ["hidden", "aria-hidden", "data-place-id", "data-collection-item-count", "data-collection-id"]
    });
  }
}

function ensureShell(place: PlaceSheetPlace): HTMLElement | null {
  if (isMicro(place)) return null;
  const root = card();
  const rootBody = body();
  if (!(root instanceof HTMLElement) || !(rootBody instanceof HTMLElement)) return null;

  let shell = rootBody.querySelector<HTMLElement>(`[${SHELL_ATTR}="1"]`);
  if (!(shell instanceof HTMLElement)) {
    shell = document.createElement("section");
    shell.className = "pc-sheet-shell";
    shell.setAttribute(SHELL_ATTR, "1");
    shell.innerHTML = `
      <div class="pc-sheet-hero" data-hg-place-sheet-hero>
        <div class="pc-sheet-hero-copy" data-hg-place-sheet-copy></div>
        <div class="pc-sheet-hero-media" data-hg-place-sheet-media>
          <div class="pc-sheet-explore-grid" data-hg-place-sheet-collections></div>
        </div>
      </div>
      <section class="pc-sheet-history" data-hg-place-sheet-history hidden></section>
      <section class="pc-sheet-stories" data-hg-place-sheet-stories hidden></section>
      <section class="pc-sheet-before-after" data-hg-place-sheet-before-after hidden></section>
      <section class="pc-sheet-news" data-hg-place-sheet-news data-hg-place-sheet-section="news" hidden></section>
    `;
    rootBody.prepend(shell);
  }

  shell.dataset.placeId = text(place.id);
  ensureSectionNav(shell, place);
  root.dataset.hgPlaceSheetPhase = "6";
  root.classList.add("is-place-sheet-phase1", "is-place-sheet-direct");
  return shell;
}

function movePrimaryNodes(shell: HTMLElement, place: PlaceSheetPlace): void {
  const root = card();
  if (!(root instanceof HTMLElement)) return;

  const media = shell.querySelector<HTMLElement>("[data-hg-place-sheet-media]");
  const copy = shell.querySelector<HTMLElement>("[data-hg-place-sheet-copy]");
  const collections = shell.querySelector<HTMLElement>("[data-hg-place-sheet-collections]");
  const nav = shell.querySelector<HTMLElement>('[data-hg-place-sheet-nav="1"]');

  const front = root.querySelector<HTMLElement>(".pc-frontcard");
  const textBlock = root.querySelector<HTMLElement>(".pc-text");
  const sideStack = root.querySelector<HTMLElement>(".pc-side-stack");
  const events = document.getElementById("pcEventsBox");

  if (front && media && front.parentElement !== media) media.prepend(front);
  if (textBlock && copy && textBlock.parentElement !== copy) copy.prepend(textBlock);
  if (sideStack instanceof HTMLElement && collections && sideStack.parentElement !== collections) {
    collections.appendChild(sideStack);
  }

  const insertAfter = nav ? syncCollectionNav(nav, place, sideStack) : null;
  if (events instanceof HTMLElement && nav) {
    insertAfter?.after(events);
    if (!insertAfter) nav.prepend(events);
  }

  const legacyGrid = root.querySelector<HTMLElement>(".pc-grid");
  if (legacyGrid && !legacyGrid.children.length) legacyGrid.hidden = true;
}

function ensureAboutSlot(shell: HTMLElement): HTMLElement | null {
  let aboutSlot = shell.querySelector<HTMLElement>("[data-hg-place-sheet-about]");
  if (!(aboutSlot instanceof HTMLElement)) {
    aboutSlot = document.createElement("section");
    aboutSlot.className = "pc-sheet-about";
    aboutSlot.setAttribute("data-hg-place-sheet-about", "1");
    aboutSlot.setAttribute(SHELL_SECTION_ATTR, "about");
    const hero = shell.querySelector<HTMLElement>("[data-hg-place-sheet-hero]");
    if (hero?.nextSibling) shell.insertBefore(aboutSlot, hero.nextSibling);
    else shell.appendChild(aboutSlot);
  }
  return aboutSlot;
}

function ensureHistorySlot(shell: HTMLElement): HTMLElement | null {
  let historySlot = shell.querySelector<HTMLElement>("[data-hg-place-sheet-history]");
  if (!(historySlot instanceof HTMLElement)) {
    historySlot = document.createElement("section");
    historySlot.className = "pc-sheet-history";
    historySlot.setAttribute("data-hg-place-sheet-history", "1");
    shell.appendChild(historySlot);
  }
  historySlot.setAttribute(SHELL_SECTION_ATTR, "history");
  return historySlot;
}

function ensureStoriesSlot(shell: HTMLElement): HTMLElement | null {
  let storiesSlot = shell.querySelector<HTMLElement>("[data-hg-place-sheet-stories]");
  if (!(storiesSlot instanceof HTMLElement)) {
    storiesSlot = document.createElement("section");
    storiesSlot.className = "pc-sheet-stories";
    storiesSlot.setAttribute("data-hg-place-sheet-stories", "1");
    shell.appendChild(storiesSlot);
  }
  storiesSlot.setAttribute(SHELL_SECTION_ATTR, "stories");
  return storiesSlot;
}

function ensureBeforeAfterSlot(shell: HTMLElement): HTMLElement | null {
  let slot = shell.querySelector<HTMLElement>("[data-hg-place-sheet-before-after]");
  if (!(slot instanceof HTMLElement)) {
    slot = document.createElement("section");
    slot.className = "pc-sheet-before-after";
    slot.setAttribute("data-hg-place-sheet-before-after", "1");
    shell.appendChild(slot);
  }
  slot.setAttribute(SHELL_SECTION_ATTR, "before-after");
  return slot;
}

export function mountPlaceSheetPhase1(place: PlaceSheetPlace): HTMLElement | null {
  if (!place || isMicro(place)) return null;
  const shell = ensureShell(place);
  if (!(shell instanceof HTMLElement)) return null;

  movePrimaryNodes(shell, place);
  const aboutSlot = ensureAboutSlot(shell);
  if (aboutSlot) mountCanonicalAbout(aboutSlot, place, { suppressIfSameAsDesc: true })?.classList.add("pc-sheet-canonical-about");
  const historySlot = ensureHistorySlot(shell);
  if (historySlot) {
    mountCanonicalHistory(historySlot, place)?.classList.add("pc-sheet-canonical-history");
    mountCanonicalChronology(historySlot, place)?.classList.add("pc-sheet-canonical-history");
  }
  const storiesSlot = ensureStoriesSlot(shell);
  if (storiesSlot) mountCanonicalStories(storiesSlot, place)?.classList.add("pc-sheet-canonical-stories");
  const beforeAfterSlot = ensureBeforeAfterSlot(shell);
  if (beforeAfterSlot) mountCanonicalBeforeAfter(beforeAfterSlot, place)?.classList.add("pc-sheet-canonical-before-after");

  syncSectionNav(shell);
  observeSectionNav(shell, place);
  startAutomaticPlaceSheetRender(text(place.id));
  return shell;
}

export function restoreLegacyPlaceCardStructure(): void {
  cancelAutomaticPlaceSheetRender();
  sectionNavObserver?.disconnect();
  sectionNavObserver = null;
  observedShell = null;
  const root = card();
  const rootBody = body();
  if (!(root instanceof HTMLElement) || !(rootBody instanceof HTMLElement)) return;

  const shell = rootBody.querySelector<HTMLElement>(`[${SHELL_ATTR}="1"]`);
  const textBlock = shell?.querySelector<HTMLElement>(".pc-text") || root.querySelector<HTMLElement>(".pc-text");
  const front = shell?.querySelector<HTMLElement>(".pc-frontcard") || root.querySelector<HTMLElement>(".pc-frontcard");
  const sideStack = shell?.querySelector<HTMLElement>(".pc-side-stack") || root.querySelector<HTMLElement>(".pc-side-stack");
  const events = shell?.querySelector<HTMLElement>("#pcEventsBox") || document.getElementById("pcEventsBox");

  let legacyGrid = rootBody.querySelector<HTMLElement>(":scope > .pc-grid");
  if (!(legacyGrid instanceof HTMLElement)) {
    legacyGrid = document.createElement("div");
    legacyGrid.className = "pc-grid";
  }
  legacyGrid.hidden = false;

  if (textBlock instanceof HTMLElement) rootBody.prepend(textBlock);
  if (legacyGrid.parentElement !== rootBody) {
    if (textBlock?.nextSibling) rootBody.insertBefore(legacyGrid, textBlock.nextSibling);
    else rootBody.prepend(legacyGrid);
  }
  if (front instanceof HTMLElement) legacyGrid.appendChild(front);
  if (sideStack instanceof HTMLElement) legacyGrid.appendChild(sideStack);
  if (events instanceof HTMLElement) legacyGrid.appendChild(events);

  shell?.remove();
  root.classList.remove("is-place-sheet-phase1", "is-place-sheet-direct");
  delete root.dataset.hgPlaceSheetPhase;
}

export function placeSheetSectionTarget(id: string): HTMLElement | null {
  const normalized = text(id);
  if (!normalized) return null;
  const target = card()?.querySelector<HTMLElement>(`[${SHELL_SECTION_ATTR}="${normalized}"]`) || null;
  return target instanceof HTMLElement && !target.hidden ? target : null;
}
