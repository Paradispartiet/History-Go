import {
  PLACE_SHEET_COMPAT_SECTION_BATCHES,
  PLACE_SHEET_IMMEDIATE_SECTION_IDS,
  PLACE_SHEET_SECTION_IDS,
  hasRenderedPlaceSheetSection,
  nudgePlaceSheetSection,
  placeSheetSectionApplies,
  type PlaceSheetSectionId
} from "./place-section-registry";
import {
  beginPlaceSheetGeneration,
  cancelPlaceSheetGeneration,
  currentPlaceSheetSnapshot,
  isActivePlaceSheetGeneration,
  markPlaceSheetPhase,
  markPlaceSheetSection
} from "./place-sheet-state";

type PlaceSheetQueueHandle = {
  generation: number;
  placeId: string;
  signal: AbortSignal;
  done: Promise<void>;
};

type PlaceSheetQueueRuntime = Window & typeof globalThis & {
  HGPlaceSheetRenderQueue?: {
    start: (placeId: string) => PlaceSheetQueueHandle | null;
    promote: (placeId: string, sectionId: string) => Promise<boolean>;
    cancel: () => void;
    current: () => ReturnType<typeof currentPlaceSheetSnapshot>;
  };
};

const runtime = window as PlaceSheetQueueRuntime;
const compatibilityReady = new Set<number>();
const compatibilityWaiters = new Map<number, () => void>();
const promotedSections = new Map<number, Set<PlaceSheetSectionId>>();
const pendingPromotions = new Map<string, Set<PlaceSheetSectionId>>();
const COMPATIBILITY_SECTION_IDS = new Set<PlaceSheetSectionId>(PLACE_SHEET_COMPAT_SECTION_BATCHES.flat());
let activeHandle: PlaceSheetQueueHandle | null = null;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function canonicalSectionId(value: unknown): PlaceSheetSectionId | null {
  const id = text(value) as PlaceSheetSectionId;
  return PLACE_SHEET_SECTION_IDS.includes(id) ? id : null;
}

function isTerminalStatus(value: unknown): boolean {
  return value === "rendered" || value === "omitted" || value === "failed";
}

function sectionStatus(generation: number, placeId: string, id: PlaceSheetSectionId): string {
  const snapshot = currentPlaceSheetSnapshot();
  if (!snapshot || snapshot.generation !== generation || snapshot.placeId !== placeId) return "";
  return snapshot.sections[id] || "";
}

async function yieldToBrowser(signal: AbortSignal): Promise<void> {
  if (signal.aborted) return;
  const scheduler = (runtime as any).scheduler;
  if (scheduler && typeof scheduler.postTask === "function") {
    try {
      await scheduler.postTask(() => undefined, { priority: "background", signal });
      return;
    } catch {
      if (signal.aborted) return;
    }
  }
  await new Promise<void>(resolve => {
    const finish = () => runtime.setTimeout(resolve, 0);
    if (typeof runtime.requestAnimationFrame === "function") runtime.requestAnimationFrame(finish);
    else finish();
  });
}

function onCompatibilityReady(event: Event): void {
  const placeId = text((event as CustomEvent<{ placeId?: string }>).detail?.placeId);
  const snapshot = currentPlaceSheetSnapshot();
  if (!snapshot || snapshot.placeId !== placeId) return;
  compatibilityReady.add(snapshot.generation);
  compatibilityWaiters.get(snapshot.generation)?.();
}

runtime.addEventListener("hg:place-unified-ready", onCompatibilityReady);

function waitForCompatibility(
  generation: number,
  placeId: string,
  signal: AbortSignal,
  timeoutMs = 2600
): Promise<boolean> {
  if (compatibilityReady.has(generation)) return Promise.resolve(true);
  return new Promise(resolve => {
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      runtime.clearTimeout(timer);
      compatibilityWaiters.delete(generation);
      signal.removeEventListener("abort", onAbort);
      resolve(value);
    };
    const onAbort = () => finish(false);
    const timer = runtime.setTimeout(() => finish(false), timeoutMs);
    compatibilityWaiters.set(generation, () => {
      if (!isActivePlaceSheetGeneration(generation, placeId)) finish(false);
      else finish(true);
    });
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

async function waitForRenderedSection(
  generation: number,
  placeId: string,
  id: PlaceSheetSectionId,
  signal: AbortSignal,
  timeoutMs = 1800
): Promise<boolean> {
  const started = Date.now();
  while (!signal.aborted && isActivePlaceSheetGeneration(generation, placeId)) {
    if (hasRenderedPlaceSheetSection(id)) return true;
    if (Date.now() - started >= timeoutMs) return false;
    await new Promise<void>(resolve => runtime.setTimeout(resolve, 30));
  }
  return false;
}

async function settleImmediateBatch(
  generation: number,
  placeId: string,
  ids: readonly PlaceSheetSectionId[],
  signal: AbortSignal
): Promise<void> {
  const unsettled = ids.filter(id => !isTerminalStatus(sectionStatus(generation, placeId, id)));
  if (!unsettled.length) return;
  unsettled.forEach(id => markPlaceSheetSection(generation, placeId, id, "loading"));
  await yieldToBrowser(signal);
  if (signal.aborted) return;
  unsettled.forEach(id => {
    markPlaceSheetSection(
      generation,
      placeId,
      id,
      hasRenderedPlaceSheetSection(id) ? "rendered" : "omitted"
    );
  });
}

async function settleCompatibilityBatch(
  generation: number,
  placeId: string,
  ids: readonly PlaceSheetSectionId[],
  signal: AbortSignal
): Promise<void> {
  const unsettled = ids.filter(id => !isTerminalStatus(sectionStatus(generation, placeId, id)));
  if (!unsettled.length) return;

  const applicable: PlaceSheetSectionId[] = [];
  unsettled.forEach(id => {
    if (!placeSheetSectionApplies(id, placeId)) {
      markPlaceSheetSection(generation, placeId, id, "omitted");
      return;
    }
    applicable.push(id);
    markPlaceSheetSection(generation, placeId, id, "loading");
    nudgePlaceSheetSection(id, placeId);
  });
  if (!applicable.length) return;

  await yieldToBrowser(signal);
  if (signal.aborted) return;
  const results = await Promise.all(applicable.map(id => waitForRenderedSection(generation, placeId, id, signal)));
  if (signal.aborted) return;
  applicable.forEach((id, index) => {
    const rendered = results[index] === true;
    const requiredWhenApplicable = id === "sources" || id === "special";
    const status = rendered ? "rendered" : (requiredWhenApplicable ? "failed" : "omitted");
    markPlaceSheetSection(generation, placeId, id, status);
  });
}

function registerPromotion(generation: number, id: PlaceSheetSectionId): void {
  let set = promotedSections.get(generation);
  if (!set) {
    set = new Set<PlaceSheetSectionId>();
    promotedSections.set(generation, set);
  }
  set.add(id);
}

async function drainPromotedCompatibilitySections(
  generation: number,
  placeId: string,
  signal: AbortSignal
): Promise<void> {
  const set = promotedSections.get(generation);
  if (!set?.size) return;

  while (!signal.aborted && set.size) {
    const id = [...set].find(candidate => COMPATIBILITY_SECTION_IDS.has(candidate)) || null;
    if (!id) break;
    set.delete(id);
    if (isTerminalStatus(sectionStatus(generation, placeId, id))) continue;
    await settleCompatibilityBatch(generation, placeId, [id], signal);
  }
}

async function runAutomaticQueue(handle: Omit<PlaceSheetQueueHandle, "done">): Promise<void> {
  const { generation, placeId, signal } = handle;
  if (!isActivePlaceSheetGeneration(generation, placeId)) return;
  markPlaceSheetPhase(generation, placeId, "interactive");
  markPlaceSheetPhase(generation, placeId, "rendering-full");

  const immediateBatches = [
    PLACE_SHEET_IMMEDIATE_SECTION_IDS.slice(0, 2),
    PLACE_SHEET_IMMEDIATE_SECTION_IDS.slice(2)
  ];
  for (const batch of immediateBatches) {
    if (signal.aborted) return;
    await settleImmediateBatch(generation, placeId, batch, signal);
  }

  const ready = await waitForCompatibility(generation, placeId, signal);
  if (signal.aborted || !isActivePlaceSheetGeneration(generation, placeId)) return;
  if (!ready) {
    PLACE_SHEET_COMPAT_SECTION_BATCHES.flat().forEach(id => {
      markPlaceSheetSection(generation, placeId, id, "failed");
    });
    markPlaceSheetPhase(generation, placeId, "full-ready");
    return;
  }

  // A direct section request may promote one late compatibility section ahead
  // of its normal batch, but the canonical queue remains intact and continues.
  await drainPromotedCompatibilitySections(generation, placeId, signal);
  for (const batch of PLACE_SHEET_COMPAT_SECTION_BATCHES) {
    if (signal.aborted) return;
    await settleCompatibilityBatch(generation, placeId, batch, signal);
    await drainPromotedCompatibilitySections(generation, placeId, signal);
  }
  if (!signal.aborted && isActivePlaceSheetGeneration(generation, placeId)) {
    markPlaceSheetPhase(generation, placeId, "full-ready");
  }
}

export function startAutomaticPlaceSheetRender(placeIdValue: string): PlaceSheetQueueHandle | null {
  const placeId = text(placeIdValue);
  if (!placeId) return null;
  if (activeHandle && !activeHandle.signal.aborted && activeHandle.placeId === placeId) return activeHandle;

  if (activeHandle) promotedSections.delete(activeHandle.generation);
  const generation = beginPlaceSheetGeneration(placeId);
  const pending = pendingPromotions.get(placeId);
  if (pending?.size) {
    promotedSections.set(generation.generation, new Set(pending));
    pendingPromotions.delete(placeId);
  }

  const base = {
    generation: generation.generation,
    placeId,
    signal: generation.signal
  };
  const done = runAutomaticQueue(base).finally(() => {
    compatibilityReady.delete(base.generation);
    compatibilityWaiters.delete(base.generation);
    promotedSections.delete(base.generation);
  });
  activeHandle = { ...base, done };
  return activeHandle;
}

export async function promoteAutomaticPlaceSheetSection(
  placeIdValue: string,
  sectionIdValue: string
): Promise<boolean> {
  const placeId = text(placeIdValue);
  const id = canonicalSectionId(sectionIdValue);
  if (!placeId || !id) return false;

  const initial = currentPlaceSheetSnapshot();
  if (initial?.placeId === placeId && isTerminalStatus(initial.sections[id])) {
    return initial.sections[id] === "rendered";
  }

  if (activeHandle && !activeHandle.signal.aborted && activeHandle.placeId === placeId) {
    registerPromotion(activeHandle.generation, id);
    if (compatibilityReady.has(activeHandle.generation)) nudgePlaceSheetSection(id, placeId);
  } else {
    let pending = pendingPromotions.get(placeId);
    if (!pending) {
      pending = new Set<PlaceSheetSectionId>();
      pendingPromotions.set(placeId, pending);
    }
    pending.add(id);
  }

  const started = Date.now();
  while (Date.now() - started < 5000) {
    const snapshot = currentPlaceSheetSnapshot();
    if (snapshot?.placeId === placeId) {
      if (isTerminalStatus(snapshot.sections[id])) return snapshot.sections[id] === "rendered";
      registerPromotion(snapshot.generation, id);
      if (compatibilityReady.has(snapshot.generation)) nudgePlaceSheetSection(id, placeId);
    }
    await new Promise<void>(resolve => runtime.setTimeout(resolve, 20));
  }

  pendingPromotions.get(placeId)?.delete(id);
  return hasRenderedPlaceSheetSection(id);
}

export function cancelAutomaticPlaceSheetRender(): void {
  cancelPlaceSheetGeneration();
  if (activeHandle) {
    compatibilityReady.delete(activeHandle.generation);
    compatibilityWaiters.delete(activeHandle.generation);
    promotedSections.delete(activeHandle.generation);
  }
  pendingPromotions.clear();
  activeHandle = null;
}

runtime.HGPlaceSheetRenderQueue = {
  start: startAutomaticPlaceSheetRender,
  promote: promoteAutomaticPlaceSheetSection,
  cancel: cancelAutomaticPlaceSheetRender,
  current: currentPlaceSheetSnapshot
};
