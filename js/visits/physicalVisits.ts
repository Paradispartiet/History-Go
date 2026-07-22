import {
  createPlaceProgressSnapshot,
  normalizePlaceId,
  type PlaceProgressInput,
  type PlaceProgressSnapshot
} from "../progress/placeProgress";

export type PlaceLike = {
  id?: unknown;
  name?: unknown;
  title?: unknown;
  lat?: unknown;
  lon?: unknown;
  lng?: unknown;
  r?: unknown;
  [key: string]: unknown;
};

export type PhysicalVisitFailureReason =
  | "missing_place_id"
  | "persistence_unavailable"
  | "persistence_failed";

export type PhysicalVisitRecordResult =
  | {
      ok: true;
      alreadyVisited: boolean;
      placeId: string;
    }
  | {
      ok: false;
      reason: PhysicalVisitFailureReason;
      placeId?: string;
    };

export type PhysicalVisitGateReason = "no_pos" | "no_anchor" | "too_far";

export type PhysicalVisitGateResult =
  | { ok: true; d: number | null; r: number }
  | { ok: false; d: number | null; r: number; reason: PhysicalVisitGateReason };

export type PhysicalVisitProgressInput = Omit<
  PlaceProgressInput,
  "placeId" | "physicallyVisited"
>;

export type PhysicalVisitService = {
  isVisited: (placeId: unknown) => boolean;
  record: (place: PlaceLike | unknown) => PhysicalVisitRecordResult;
  toProgress: (
    placeId: unknown,
    input?: PhysicalVisitProgressInput
  ) => PlaceProgressSnapshot;
};

export type PhysicalVisitRuntimeWindow = Window & typeof globalThis & {
  visited?: Record<string, unknown>;
  TEST_MODE?: boolean;
  saveVisitedFromQuiz?: (placeId: unknown) => unknown;
  HGPhysicalVisits?: PhysicalVisitService;
  getPos?: () => { lat?: unknown; lon?: unknown; lng?: unknown } | null;
  distMeters?: (
    from: { lat?: unknown; lon?: unknown; lng?: unknown },
    to: { lat: number; lon: number }
  ) => number;
  getPlaceDistanceTargets?: (place: PlaceLike) => unknown;
};

export type LegacyVisitWriter = ((placeId: string) => unknown) | null;

type DistanceTarget = {
  lat?: unknown;
  lon?: unknown;
  lng?: unknown;
  r?: unknown;
};

function asPlaceId(place: PlaceLike | unknown): string {
  return normalizePlaceId(place);
}

export function createPhysicalVisitService(
  runtime: PhysicalVisitRuntimeWindow,
  legacySaveVisited: LegacyVisitWriter
): PhysicalVisitService {
  const isVisited = (placeId: unknown): boolean => {
    const id = normalizePlaceId(placeId);
    return Boolean(id && runtime.visited?.[id]);
  };

  const toProgress = (
    placeId: unknown,
    input: PhysicalVisitProgressInput = {}
  ): PlaceProgressSnapshot => {
    const id = normalizePlaceId(placeId);
    return createPlaceProgressSnapshot({
      ...input,
      placeId: id,
      opened: input.opened ?? true,
      physicallyVisited: isVisited(id)
    });
  };

  const record = (place: PlaceLike | unknown): PhysicalVisitRecordResult => {
    const placeId = asPlaceId(place);
    if (!placeId) return { ok: false, reason: "missing_place_id" };
    if (isVisited(placeId)) return { ok: true, alreadyVisited: true, placeId };
    if (typeof legacySaveVisited !== "function") {
      return { ok: false, reason: "persistence_unavailable", placeId };
    }

    try {
      legacySaveVisited(placeId);
    } catch {
      return { ok: false, reason: "persistence_failed", placeId };
    }

    const ok = isVisited(placeId);
    if (!ok) return { ok: false, reason: "persistence_failed", placeId };

    try {
      runtime.dispatchEvent(
        new CustomEvent("hg:physicalVisitRegistered", {
          detail: { placeId, ts: Date.now() }
        })
      );
    } catch {}

    return { ok: true, alreadyVisited: false, placeId };
  };

  return { isVisited, record, toProgress };
}

export function installPhysicalVisitModel(
  runtime: PhysicalVisitRuntimeWindow,
  legacySaveVisited: LegacyVisitWriter
): PhysicalVisitService {
  const service = createPhysicalVisitService(runtime, legacySaveVisited);
  runtime.HGPhysicalVisits = Object.assign(runtime.HGPhysicalVisits || {}, service);

  runtime.saveVisitedFromQuiz = function saveVisitedFromQuizDeprecated() {
    return false;
  };

  return runtime.HGPhysicalVisits;
}

export function getPhysicalVisitGate(
  runtime: PhysicalVisitRuntimeWindow,
  place: PlaceLike
): PhysicalVisitGateResult {
  const fallbackRadius = Number(place?.r || 150);
  if (runtime.TEST_MODE) return { ok: true, d: null, r: fallbackRadius };

  const pos = typeof runtime.getPos === "function" ? runtime.getPos() : null;
  if (!pos || typeof runtime.distMeters !== "function") {
    return { ok: false, d: null, r: fallbackRadius, reason: "no_pos" };
  }

  const rawTargets =
    typeof runtime.getPlaceDistanceTargets === "function"
      ? runtime.getPlaceDistanceTargets(place)
      : [];
  const targets = Array.isArray(rawTargets) ? (rawTargets as DistanceTarget[]) : [];
  if (!targets.length) {
    return { ok: false, d: null, r: fallbackRadius, reason: "no_anchor" };
  }

  let nearest: { d: number; r: number } | null = null;
  for (const target of targets) {
    const lon = Number(target.lon ?? target.lng);
    const d = runtime.distMeters(pos, { lat: Number(target.lat), lon });
    const radius = Number(target.r || fallbackRadius);
    if (!Number.isFinite(d) || !Number.isFinite(radius)) continue;
    if (!nearest || d < nearest.d) nearest = { d, r: radius };
    if (d <= radius) return { ok: true, d, r: radius };
  }

  if (!nearest) {
    return { ok: false, d: null, r: fallbackRadius, reason: "no_anchor" };
  }

  return { ok: false, d: nearest.d, r: nearest.r, reason: "too_far" };
}
