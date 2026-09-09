import { PLACE_SHEET_SECTION_IDS, type PlaceSheetSectionId } from "./place-section-registry";

export type PlaceSheetPhase = "opening" | "interactive" | "rendering-full" | "full-ready";
export type PlaceSheetSectionStatus = "pending" | "loading" | "rendered" | "omitted" | "failed";

export type PlaceSheetSnapshot = {
  generation: number;
  placeId: string;
  phase: PlaceSheetPhase;
  sections: Record<PlaceSheetSectionId, PlaceSheetSectionStatus>;
};

type ActiveGeneration = PlaceSheetSnapshot & {
  controller: AbortController;
};

type PlaceSheetStateRuntime = Window & typeof globalThis & {
  HGPlaceSheetState?: {
    snapshot: () => PlaceSheetSnapshot | null;
    cancel: () => void;
  };
};

const runtime = window as PlaceSheetStateRuntime;
let generationCounter = 0;
let active: ActiveGeneration | null = null;

function cloneSnapshot(value: ActiveGeneration): PlaceSheetSnapshot {
  return {
    generation: value.generation,
    placeId: value.placeId,
    phase: value.phase,
    sections: { ...value.sections }
  };
}

function root(): HTMLElement | null {
  return document.getElementById("placeCard");
}

function emit(name: string, value: ActiveGeneration): void {
  try {
    runtime.dispatchEvent(new CustomEvent(name, { detail: cloneSnapshot(value) }));
  } catch {}
}

function syncRoot(value: ActiveGeneration): void {
  const card = root();
  if (!(card instanceof HTMLElement)) return;
  card.dataset.hgPlaceSheetRenderGeneration = String(value.generation);
  card.dataset.hgPlaceSheetRenderPlaceId = value.placeId;
  card.dataset.hgPlaceSheetRenderState = value.phase;
}

export function beginPlaceSheetGeneration(placeId: string): { generation: number; placeId: string; signal: AbortSignal } {
  cancelPlaceSheetGeneration();
  const controller = new AbortController();
  const sections = Object.fromEntries(
    PLACE_SHEET_SECTION_IDS.map(id => [id, "pending"])
  ) as Record<PlaceSheetSectionId, PlaceSheetSectionStatus>;
  active = {
    generation: ++generationCounter,
    placeId,
    phase: "opening",
    sections,
    controller
  };
  syncRoot(active);
  emit("hg:place-sheet-state", active);
  return { generation: active.generation, placeId, signal: controller.signal };
}

export function isActivePlaceSheetGeneration(generation: number, placeId: string): boolean {
  return Boolean(active && !active.controller.signal.aborted && active.generation === generation && active.placeId === placeId);
}

export function markPlaceSheetPhase(generation: number, placeId: string, phase: PlaceSheetPhase): boolean {
  if (!isActivePlaceSheetGeneration(generation, placeId) || !active) return false;
  active.phase = phase;
  syncRoot(active);
  emit("hg:place-sheet-state", active);
  if (phase === "full-ready") emit("hg:place-sheet-full-ready", active);
  return true;
}

export function markPlaceSheetSection(
  generation: number,
  placeId: string,
  id: PlaceSheetSectionId,
  status: PlaceSheetSectionStatus
): boolean {
  if (!isActivePlaceSheetGeneration(generation, placeId) || !active) return false;
  active.sections[id] = status;
  const node = document.querySelector<HTMLElement>(`#placeCard [data-hg-place-sheet-section="${id}"]`);
  if (node instanceof HTMLElement) node.dataset.hgPlaceSheetRenderState = status;
  emit("hg:place-sheet-state", active);
  return true;
}

export function currentPlaceSheetSnapshot(): PlaceSheetSnapshot | null {
  return active ? cloneSnapshot(active) : null;
}

export function cancelPlaceSheetGeneration(): void {
  if (active && !active.controller.signal.aborted) active.controller.abort();
  active = null;
  const card = root();
  if (card instanceof HTMLElement) {
    delete card.dataset.hgPlaceSheetRenderGeneration;
    delete card.dataset.hgPlaceSheetRenderPlaceId;
    delete card.dataset.hgPlaceSheetRenderState;
  }
}

runtime.HGPlaceSheetState = {
  snapshot: currentPlaceSheetSnapshot,
  cancel: cancelPlaceSheetGeneration
};
