import {
  PLACE_SHEET_COMPAT_SECTION_BATCHES,
  PLACE_SHEET_IMMEDIATE_SECTION_IDS,
  hasRenderedPlaceSheetSection,
  nudgePlaceSheetSection,
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
    cancel: () => void;
    current: () => ReturnType<typeof currentPlaceSheetSnapshot>;
  };
};

const runtime = window as PlaceSheetQueueRuntime;
const compatibilityReady = new Set<number>();
const compatibilityWaiters = new Map<number, () => void>();
let activeHandle: PlaceSheetQueueHandle | null = null;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
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
  ids.forEach(id => markPlaceSheetSection(generation, placeId, id, "loading"));
  await yieldToBrowser(signal);
  if (signal.aborted) return;
  ids.forEach(id => {
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
  ids.forEach(id => {
    markPlaceSheetSection(generation, placeId, id, "loading");
    nudgePlaceSheetSection(id, placeId);
  });
  await yieldToBrowser(signal);
  if (signal.aborted) return;
  const results = await Promise.all(ids.map(id => waitForRenderedSection(generation, placeId, id, signal)));
  if (signal.aborted) return;
  ids.forEach((id, index) => {
    const rendered = results[index] === true;
    const status = rendered ? "rendered" : (id === "sources" ? "failed" : "omitted");
    markPlaceSheetSection(generation, placeId, id, status);
  });
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

  for (const batch of PLACE_SHEET_COMPAT_SECTION_BATCHES) {
    if (signal.aborted) return;
    await settleCompatibilityBatch(generation, placeId, batch, signal);
  }
  if (!signal.aborted && isActivePlaceSheetGeneration(generation, placeId)) {
    markPlaceSheetPhase(generation, placeId, "full-ready");
  }
}

export function startAutomaticPlaceSheetRender(placeIdValue: string): PlaceSheetQueueHandle | null {
  const placeId = text(placeIdValue);
  if (!placeId) return null;
  if (activeHandle && !activeHandle.signal.aborted && activeHandle.placeId === placeId) return activeHandle;

  const generation = beginPlaceSheetGeneration(placeId);
  const base = {
    generation: generation.generation,
    placeId,
    signal: generation.signal
  };
  const done = runAutomaticQueue(base).finally(() => {
    compatibilityReady.delete(base.generation);
    compatibilityWaiters.delete(base.generation);
  });
  activeHandle = { ...base, done };
  return activeHandle;
}

export function cancelAutomaticPlaceSheetRender(): void {
  cancelPlaceSheetGeneration();
  if (activeHandle) {
    compatibilityReady.delete(activeHandle.generation);
    compatibilityWaiters.delete(activeHandle.generation);
  }
  activeHandle = null;
}

runtime.HGPlaceSheetRenderQueue = {
  start: startAutomaticPlaceSheetRender,
  cancel: cancelAutomaticPlaceSheetRender,
  current: currentPlaceSheetSnapshot
};
