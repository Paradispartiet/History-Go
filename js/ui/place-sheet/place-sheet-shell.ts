type PlaceSheetPlace = {
  id?: string;
  name?: string;
  title?: string;
  placeTier?: string;
};

const SHELL_ATTR = "data-hg-place-sheet-shell";
const SHELL_SECTION_ATTR = "data-hg-place-sheet-section";

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
        <div class="pc-sheet-hero-media" data-hg-place-sheet-media></div>
        <div class="pc-sheet-hero-copy" data-hg-place-sheet-copy></div>
      </div>
      <section class="pc-sheet-explore" aria-label="Utforsk stedet">
        <div class="pc-sheet-section-head">
          <span class="pc-sheet-section-eyebrow">Utforsk</span>
          <h2>Fire samlinger</h2>
        </div>
        <div class="pc-sheet-explore-grid" data-hg-place-sheet-collections></div>
      </section>
      <section class="pc-sheet-onsite" data-hg-place-sheet-onsite></section>
    `;
    rootBody.prepend(shell);
  }

  shell.dataset.placeId = text(place.id);
  root.dataset.hgPlaceSheetPhase = "1";
  root.classList.add("is-place-sheet-phase1");
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

  if (front && media && front.parentElement !== media) media.appendChild(front);
  if (textBlock && copy && textBlock.parentElement !== copy) copy.prepend(textBlock);
  if (sideStack && collections && sideStack.parentElement !== collections) collections.appendChild(sideStack);
  if (events instanceof HTMLElement && onsite && events.parentElement !== onsite) onsite.appendChild(events);

  const legacyGrid = root.querySelector<HTMLElement>(".pc-grid");
  if (legacyGrid && !legacyGrid.children.length) legacyGrid.hidden = true;
}

export function mountPlaceSheetPhase1(place: PlaceSheetPlace): HTMLElement | null {
  if (!place || isMicro(place)) return null;
  const shell = ensureShell(place);
  if (!(shell instanceof HTMLElement)) return null;

  shell.querySelector(".pc-sheet-canonical-about")?.remove();
  const aboutSlot = shell.querySelector<HTMLElement>("[data-hg-place-sheet-about]");
  if (aboutSlot) aboutSlot.remove();

  movePrimaryNodes(shell);
  return shell;
}

export function attachCanonicalAboutToPlaceSheet(popup: HTMLElement, place: PlaceSheetPlace): HTMLElement | null {
  if (isMicro(place)) return null;
  const shell = card()?.querySelector<HTMLElement>(`[${SHELL_ATTR}="1"]`);
  const copy = shell?.querySelector<HTMLElement>("[data-hg-place-sheet-copy]");
  if (!(copy instanceof HTMLElement)) return null;

  let aboutSlot = copy.querySelector<HTMLElement>("[data-hg-place-sheet-about]");
  if (!(aboutSlot instanceof HTMLElement)) {
    aboutSlot = document.createElement("div");
    aboutSlot.className = "pc-sheet-about";
    aboutSlot.setAttribute("data-hg-place-sheet-about", "1");
    aboutSlot.setAttribute(SHELL_SECTION_ATTR, "about");
    copy.appendChild(aboutSlot);
  }

  aboutSlot.replaceChildren();
  const canonicalAbout = popup.querySelector<HTMLElement>(".hg-place-about-section");
  if (!(canonicalAbout instanceof HTMLElement)) {
    aboutSlot.hidden = true;
    return null;
  }

  canonicalAbout.classList.add("pc-sheet-canonical-about");
  canonicalAbout.removeAttribute("data-hg-unified-section");
  aboutSlot.hidden = false;
  aboutSlot.appendChild(canonicalAbout);
  return aboutSlot;
}

export function restoreLegacyPlaceCardStructure(): void {
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
  root.classList.remove("is-place-sheet-phase1");
  delete root.dataset.hgPlaceSheetPhase;
}

export function placeSheetSectionTarget(id: string): HTMLElement | null {
  const normalized = text(id);
  if (!normalized) return null;
  return card()?.querySelector<HTMLElement>(`[${SHELL_SECTION_ATTR}="${normalized}"]`) || null;
}
