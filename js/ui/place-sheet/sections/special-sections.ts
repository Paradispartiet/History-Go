type SpecialPlace = Record<string, any>;

type PlaceSheetSpecialApi = {
  applies: (placeId: string) => boolean;
  adopt: (placeId: string) => HTMLElement | null;
};

type PlaceSheetSpecialRuntime = Window & typeof globalThis & {
  PLACES?: SpecialPlace[];
  HGPlaceOpen?: { getPlace?: (place: unknown) => SpecialPlace | null };
  HGPlacePopupSportTraining?: {
    isSportsPlace?: (place: SpecialPlace) => boolean;
  };
  HGPlaceSheetSections?: Record<string, unknown> & { special?: PlaceSheetSpecialApi };
};

const runtime = window as PlaceSheetSpecialRuntime;
const SPECIAL_SELECTOR = ".hg-place-nature-section, [data-hg-sport-training=\"1\"]";
let observer: MutationObserver | null = null;
let observerTimer = 0;
let observedPlaceId = "";

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function list<T = SpecialPlace>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function shell(): HTMLElement | null {
  return document.querySelector<HTMLElement>('#placeCard [data-hg-place-sheet-shell="1"]');
}

function embeddedHost(): HTMLElement | null {
  return document.getElementById("pcUnifiedKnowledgeHost");
}

function placeFor(placeId: string): SpecialPlace | null {
  const id = text(placeId);
  if (!id) return null;
  try {
    const resolved = runtime.HGPlaceOpen?.getPlace?.(id);
    if (resolved && typeof resolved === "object") return resolved;
  } catch {}
  return list<SpecialPlace>(runtime.PLACES).find(place => text(place?.id) === id) || null;
}

function hasTrainingContent(place: SpecialPlace | null): boolean {
  if (!place) return false;
  const profile = place?.training_profile;
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) return false;
  const summary = text(profile.summary);
  const safety = text(profile.safety);
  const exercises = list(profile.exercises).filter(Boolean);
  if (!summary && !safety && !exercises.length) return false;

  try {
    if (typeof runtime.HGPlacePopupSportTraining?.isSportsPlace === "function") {
      return runtime.HGPlacePopupSportTraining.isSportsPlace(place) === true;
    }
  } catch {}
  const category = text(place?.category || place?.categoryId).toLowerCase();
  const sportProfile = place?.sport_profile;
  return category === "sport" || Boolean(sportProfile && typeof sportProfile === "object" && Object.keys(sportProfile).length);
}

function currentSpecialNodes(): HTMLElement[] {
  const host = embeddedHost();
  if (!(host instanceof HTMLElement)) return [];
  return [...host.querySelectorAll<HTMLElement>(SPECIAL_SELECTOR)];
}

function existingSpecialNodes(placeId: string): HTMLElement[] {
  const id = text(placeId);
  const root = shell();
  if (!(root instanceof HTMLElement)) return [];
  const slot = root.querySelector<HTMLElement>('[data-hg-place-sheet-special="1"]');
  if (!(slot instanceof HTMLElement) || text(slot.dataset.placeId) !== id) return [];
  return [...slot.querySelectorAll<HTMLElement>(SPECIAL_SELECTOR)];
}

function ensureStylesheet(): void {
  if (document.querySelector('link[data-hg-place-sheet-special-style="1"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/place-sheet-special.css";
  link.setAttribute("data-hg-place-sheet-special-style", "1");
  document.head.appendChild(link);
}

function ensureSlot(placeId: string): HTMLElement | null {
  const root = shell();
  if (!(root instanceof HTMLElement)) return null;
  let slot = root.querySelector<HTMLElement>('[data-hg-place-sheet-special="1"]');
  if (!(slot instanceof HTMLElement)) {
    slot = document.createElement("section");
    slot.className = "pc-sheet-special";
    slot.setAttribute("data-hg-place-sheet-special", "1");
    slot.setAttribute("data-hg-place-sheet-section", "special");
    slot.hidden = true;
    const sources = root.querySelector<HTMLElement>('[data-hg-place-sheet-section="sources"]');
    if (sources?.nextSibling) root.insertBefore(slot, sources.nextSibling);
    else root.appendChild(slot);
  }
  slot.dataset.placeId = text(placeId);
  return slot;
}

function stopObserver(): void {
  observer?.disconnect();
  observer = null;
  if (observerTimer) runtime.clearTimeout(observerTimer);
  observerTimer = 0;
  observedPlaceId = "";
}

function moveOwnedNodes(placeId: string): HTMLElement | null {
  const id = text(placeId);
  if (!id) return null;
  const nodes = currentSpecialNodes();
  const slot = ensureSlot(id);
  if (!(slot instanceof HTMLElement)) return null;

  nodes.forEach(node => {
    node.hidden = false;
    node.removeAttribute("aria-hidden");
    node.setAttribute("role", "region");
    node.style.scrollMarginTop = "76px";
    node.dataset.hgPlaceSheetSpecialOwner = node.matches('[data-hg-sport-training="1"]') ? "sport-training" : "nature-landscape";
    slot.appendChild(node);
  });

  const hasContent = Boolean(slot.querySelector(SPECIAL_SELECTOR));
  slot.hidden = !hasContent;
  return hasContent ? slot : null;
}

function watchForLateTraining(placeId: string): void {
  const id = text(placeId);
  if (!id || !hasTrainingContent(placeFor(id))) return;
  if (existingSpecialNodes(id).some(node => node.matches('[data-hg-sport-training="1"]'))) return;
  const host = embeddedHost();
  if (!(host instanceof HTMLElement)) return;
  if (observer && observedPlaceId === id) return;

  stopObserver();
  observedPlaceId = id;
  observer = new MutationObserver(() => {
    if (text(shell()?.dataset.placeId) !== id) {
      stopObserver();
      return;
    }
    moveOwnedNodes(id);
    if (existingSpecialNodes(id).some(node => node.matches('[data-hg-sport-training="1"]'))) stopObserver();
  });
  observer.observe(host, { childList: true, subtree: true });
  observerTimer = runtime.setTimeout(stopObserver, 2600);
}

export function specialSectionsApply(placeId: string): boolean {
  const id = text(placeId);
  if (!id) return false;
  if (existingSpecialNodes(id).length || currentSpecialNodes().length) return true;
  return hasTrainingContent(placeFor(id));
}

export function adoptCanonicalSpecialSections(placeId: string): HTMLElement | null {
  const id = text(placeId);
  if (!id) return null;
  const slot = moveOwnedNodes(id);
  watchForLateTraining(id);
  return slot;
}

function onUnifiedReady(event: Event): void {
  const id = text((event as CustomEvent<{ placeId?: string }>).detail?.placeId);
  if (id && specialSectionsApply(id)) adoptCanonicalSpecialSections(id);
}

ensureStylesheet();
runtime.addEventListener("hg:place-unified-ready", onUnifiedReady);

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  special: {
    applies: specialSectionsApply,
    adopt: adoptCanonicalSpecialSections
  }
};
