export type GeoStatus = "unknown" | "requesting" | "granted" | "blocked" | "unsupported" | "test";

export type PositionState = {
  status: GeoStatus;
  lat: number | null;
  lon: number | null;
  acc: number | null;
  ts: number;
  reason: string | number | null;
  lastError: { code?: number; message?: string } | null;
  watchId: number | null;
};

export type PositionSnapshot = {
  lat: number;
  lon: number;
  acc: number | null;
  ts: number;
  source?: string;
  cityId?: string | null;
  cityLabel?: string | null;
  placeId?: string | null;
  label?: string | null;
  mode?: "manual";
};

export type LocationOverrideInput = {
  cityId?: unknown;
  cityLabel?: unknown;
  placeId?: unknown;
  label?: unknown;
  lat?: unknown;
  lon?: unknown;
  acc?: unknown;
  source?: unknown;
};

export type ManualLocationOverride = {
  mode: "manual";
  cityId: string;
  cityLabel: string;
  placeId: string | null;
  label: string;
  lat: number;
  lon: number;
  acc: number | null;
  source: string;
  ts: number;
};

type RuntimeWindow = Window & typeof globalThis & {
  HG_POS?: PositionState;
  userLat?: number | null;
  userLon?: number | null;
  currentPos?: { lat: number; lon: number } | null;
};

const win = window as RuntimeWindow;
const LOCATION_OVERRIDE_KEY = "hg_location_override_v1";

const HG_POS: PositionState = win.HG_POS ?? {
  status: "unknown",
  lat: null,
  lon: null,
  acc: null,
  ts: 0,
  reason: null,
  lastError: null,
  watchId: null
};
win.HG_POS = HG_POS;

export function emitGeo(detail: Record<string, unknown>): void {
  try {
    win.dispatchEvent(new CustomEvent("hg:geo", { detail }));
  } catch {
    // Event delivery must never break the position state update.
  }
}

export function getPositionState(): PositionState {
  return HG_POS;
}

export function getPositionStateSnapshot(): PositionState {
  return { ...HG_POS, lastError: HG_POS.lastError ? { ...HG_POS.lastError } : null };
}

export function getLocationOverride(): ManualLocationOverride | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LOCATION_OVERRIDE_KEY) || "null");
    if (!parsed || typeof parsed !== "object") return null;
    const raw = parsed as Partial<ManualLocationOverride> & Record<string, unknown>;
    if (raw.mode !== "manual") return null;

    const lat = Number(raw.lat);
    const lon = Number(raw.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    return {
      mode: "manual",
      cityId: String(raw.cityId || "").trim(),
      cityLabel: String(raw.cityLabel || "").trim(),
      placeId: String(raw.placeId || "").trim() || null,
      label: String(raw.label || "").trim() || "Valgt lokasjon",
      lat,
      lon,
      acc: raw.acc == null ? null : Number(raw.acc),
      source: String(raw.source || "civication-location-picker").trim(),
      ts: Number(raw.ts) || 0
    };
  } catch {
    return null;
  }
}

export function persistLocationOverride(input: LocationOverrideInput): ManualLocationOverride | null {
  const lat = Number(input.lat);
  const lon = Number(input.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const payload: ManualLocationOverride = {
    mode: "manual",
    cityId: String(input.cityId || "").trim(),
    cityLabel: String(input.cityLabel || "").trim() || String(input.label || "").trim(),
    placeId: String(input.placeId || "").trim() || null,
    label: String(input.label || "").trim() || "Valgt lokasjon",
    lat,
    lon,
    acc: input.acc == null ? null : Number(input.acc),
    source: String(input.source || "civication-location-picker").trim(),
    ts: Date.now()
  };

  try {
    localStorage.setItem(LOCATION_OVERRIDE_KEY, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

export function removeLocationOverride(): void {
  try {
    localStorage.removeItem(LOCATION_OVERRIDE_KEY);
  } catch {
    // localStorage can be unavailable in privacy-restricted contexts.
  }
}

export function getPos(): PositionSnapshot | null {
  const override = getLocationOverride();
  if (override) {
    return {
      lat: override.lat,
      lon: override.lon,
      acc: override.acc,
      ts: override.ts,
      source: override.source || "civication-location-picker",
      cityId: override.cityId || null,
      cityLabel: override.cityLabel || null,
      placeId: override.placeId,
      label: override.label || null,
      mode: "manual"
    };
  }

  if (Number.isFinite(HG_POS.lat) && Number.isFinite(HG_POS.lon)) {
    return {
      lat: HG_POS.lat as number,
      lon: HG_POS.lon as number,
      acc: HG_POS.acc,
      ts: HG_POS.ts
    };
  }

  return null;
}

export function setGrantedPosition(lat: unknown, lon: unknown, acc?: unknown): PositionState {
  HG_POS.status = "granted";
  HG_POS.lat = Number(lat);
  HG_POS.lon = Number(lon);
  HG_POS.acc = acc == null ? null : Number(acc);
  HG_POS.ts = Date.now();
  HG_POS.reason = null;
  HG_POS.lastError = null;

  win.userLat = HG_POS.lat;
  win.userLon = HG_POS.lon;
  win.currentPos = { lat: HG_POS.lat, lon: HG_POS.lon };

  emitGeo({
    status: "granted",
    lat: HG_POS.lat,
    lon: HG_POS.lon,
    acc: HG_POS.acc,
    ts: HG_POS.ts
  });

  return HG_POS;
}

export function clearGrantedPosition(reason: string | number = "blocked"): PositionState {
  HG_POS.status = reason === "unsupported" ? "unsupported" : "blocked";
  HG_POS.lat = null;
  HG_POS.lon = null;
  HG_POS.acc = null;
  HG_POS.ts = Date.now();
  HG_POS.reason = reason;

  win.userLat = null;
  win.userLon = null;
  win.currentPos = null;

  emitGeo({ status: HG_POS.status, reason: HG_POS.reason, ts: HG_POS.ts });
  return HG_POS;
}
