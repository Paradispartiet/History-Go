import { mountCanonicalAbout } from "./sections/about";
import { mountCanonicalHistory } from "./sections/history";
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
};

const runtime = window as PlaceSheetShellRuntime;
const SHELL_ATTR = "data-hg-place-sheet-shell";
const SHELL_SECTION_ATTR = "data-hg-place-sheet-section";
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
    nav.innerHTML = NAV_ITEMS.map(([id, label]) => `<button type="button" data-hg-place-sheet-jump="${id}">${label}</button>`).join("");
    const hero = shell.querySelector<HTMLElement>("[data-hg-place-sheet-hero]");
    if (hero?.nextSibling) shell.insertBefore(nav, hero.nextSibling);
    else shell.appendChild(nav);

    nav.addEventListener("click", event => {
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
  nav.dataset.placeId = text(place.id);
  return nav;
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
        <div class="pc-sheet-hero-media" data-hg-place-sheet-media>
          <section class="pc-sheet-explore" aria-label="Utforsk stedet">
            <div class="pc-sheet-section-head">
              <span class="pc-sheet-section-eyebrow">Utforsk</span>
              <h2>Fire samlinger</h2>
            </div>
            <div class="pc-sheet-explore-grid" data-hg-place-sheet-collections></div>
          </section>
          <section class="pc-sheet-onsite" data-hg-place-sheet-onsite aria-label="Events og møter"></section>
        </div>
        <div class="pc-sheet-hero-copy" data-hg-place-sheet-copy></div>
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

function movePrimaryNodes(shell: HTMLElement): void {
  const root = card();
  if (!(root instanceof HTMLElement)) return;

  const media = shell.querySelector<HTMLElement>("[data-hg-place-sheet-media]");
  const copy = shell.querySelector<HTMLElement>("[data-hg-place-sheet-copy]");
  const collections = shell.querySelector<HTMLElement>("[data-hg-place-sheet-collections]");
  const onsite = shell.querySelector<HTMLElement>("[data-hg-place-sheet-onsite]");

  const front = root.querySelector<HTMLElement>(".pc-frontcard");
  const textBlock = root.querySelector<HTMLElement>(".pc-text");
  const sideStack = root.querySelector<HTMLElement>(".pc-side-stack");
  const events = document.getElementById("pcEventsBox");

  if (front && media && front.parentElement !== media) media.prepend(front);
  if (textBlock && copy && textBlock.parentElement !== copy) copy.prepend(textBlock);
  if (sideStack && collections && sideStack.parentElement !== collections) collections.appendChild(sideStack);
  if (events instanceof HTMLElement && onsite && events.parentElement !== onsite) onsite.appendChild(events);

  const legacyGrid = root.querySelector<HTMLElement>(".pc-grid");
  if (legacyGrid && !legacyGrid.children.length) legacyGrid.hidden = true;
}

function ensureAboutSlot(shell: HTMLElement): HTMLElement | null {
  const copy = shell.querySelector<HTMLElement>("[data-hg-place-sheet-copy]");
  if (!(copy instanceof HTMLElement)) return null;
  let aboutSlot = copy.querySelector<HTMLElement>("[data-hg-place-sheet-about]");
  if (!(aboutSlot instanceof HTMLElement)) {
    aboutSlot = document.createElement("div");
    aboutSlot.className = "pc-sheet-about";
    aboutSlot.setAttribute("data-hg-place-sheet-about", "1");
    aboutSlot.setAttribute(SHELL_SECTION_ATTR, "about");
    copy.appendChild(aboutSlot);
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

  movePrimaryNodes(shell);
  const aboutSlot = ensureAboutSlot(shell);
  if (aboutSlot) mountCanonicalAbout(aboutSlot, place, { suppressIfSameAsDesc: true })?.classList.add("pc-sheet-canonical-about");
  const historySlot = ensureHistorySlot(shell);
  if (historySlot) mountCanonicalHistory(historySlot, place)?.classList.add("pc-sheet-canonical-history");
  const storiesSlot = ensureStoriesSlot(shell);
  if (storiesSlot) mountCanonicalStories(storiesSlot, place)?.classList.add("pc-sheet-canonical-stories");
  const beforeAfterSlot = ensureBeforeAfterSlot(shell);
  if (beforeAfterSlot) mountCanonicalBeforeAfter(beforeAfterSlot, place)?.classList.add("pc-sheet-canonical-before-after");

  startAutomaticPlaceSheetRender(text(place.id));
  return shell;
}

export function restoreLegacyPlaceCardStructure(): void {
  cancelAutomaticPlaceSheetRender();
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