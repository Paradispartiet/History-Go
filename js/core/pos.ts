import { createGeolocationRuntime } from "./geolocation";
import { autoUnlockPlacesFromPosition } from "./placeDiscovery";
import {
  clearGrantedPosition,
  emitGeo,
  getLocationOverride,
  getPos,
  getPositionState,
  getPositionStateSnapshot,
  persistLocationOverride,
  removeLocationOverride,
  setGrantedPosition,
  type LocationOverrideInput,
  type PositionSnapshot,
  type PositionState
} from "./positionStore";
import { createLocationPickerRuntime } from "../ui/locationPicker";

export type HGPosApi = {
  request: (options?: PositionOptions) => Promise<PositionSnapshot | null>;
  getPos: () => PositionSnapshot | null;
  openLocationPicker: () => Promise<void>;
  getLocationOverride: typeof getLocationOverride;
  setLocationOverride: (location: LocationOverrideInput) => boolean;
  searchLocationPlaces: ReturnType<typeof createLocationPickerRuntime>["searchLocationPlaces"];
  setLocationFromPlace: ReturnType<typeof createLocationPickerRuntime>["setLocationFromPlace"];
  clearLocationOverride: () => void;
  setPos: (lat: unknown, lon: unknown, acc?: unknown) => void;
  clearPos: (reason?: string | number) => void;
  stopWatch: () => void;
  state: () => PositionState;
};

type RuntimeWindow = Window & typeof globalThis & {
  HGPos?: HGPosApi;
  getPos?: HGPosApi["getPos"];
  setPos?: HGPosApi["setPos"];
  clearPos?: HGPosApi["clearPos"];
  HGMap?: {
    setUser?: (lat: number, lon: number, options?: { fly?: boolean }) => unknown;
  };
  renderNearbyPlaces?: () => unknown;
};

const win = window as RuntimeWindow;
const state = getPositionState();

function refreshGeoConsumers({ recenterMap = false }: { recenterMap?: boolean } = {}): void {
  const position = getPos();
  if (position && win.HGMap?.setUser) {
    win.HGMap.setUser(position.lat, position.lon, { fly: recenterMap });
  }
  win.renderNearbyPlaces?.();
  win.dispatchEvent(new Event("updateProfile"));
  win.dispatchEvent(new Event("hg:locationChanged"));
}

function setPos(lat: unknown, lon: unknown, acc?: unknown): void {
  const updated = setGrantedPosition(lat, lon, acc);
  if (!Number.isFinite(updated.lat) || !Number.isFinite(updated.lon)) return;

  win.HGMap?.setUser?.(updated.lat as number, updated.lon as number);
  autoUnlockPlacesFromPosition(updated.lat as number, updated.lon as number);
  win.renderNearbyPlaces?.();
}

function clearPos(reason: string | number = "blocked"): void {
  clearGrantedPosition(reason);
  win.renderNearbyPlaces?.();
}

function setLocationOverride(location: LocationOverrideInput): boolean {
  const payload = persistLocationOverride(location);
  if (!payload) return false;

  emitGeo({ status: "test", mode: "manual", ...payload });
  autoUnlockPlacesFromPosition(payload.lat, payload.lon);
  refreshGeoConsumers({ recenterMap: true });
  return true;
}

function clearLocationOverride(): void {
  removeLocationOverride();
  refreshGeoConsumers({ recenterMap: true });
}

const geolocation = createGeolocationRuntime({
  state,
  setPos,
  clearPos,
  getPos,
  emit: emitGeo
});

const locationPicker = createLocationPickerRuntime({
  getLocationOverride,
  setLocationOverride,
  clearLocationOverride,
  requestLocation: () => geolocation.request()
});

const HGPos: HGPosApi = {
  request: geolocation.request,
  getPos,
  openLocationPicker: locationPicker.openLocationPicker,
  getLocationOverride,
  setLocationOverride,
  searchLocationPlaces: locationPicker.searchLocationPlaces,
  setLocationFromPlace: locationPicker.setLocationFromPlace,
  clearLocationOverride,
  setPos,
  clearPos,
  stopWatch: geolocation.stopWatch,
  state: getPositionStateSnapshot
};

win.HGPos = HGPos;
win.getPos = getPos;
win.setPos = setPos;
win.clearPos = clearPos;

function bindGeoStatusClick(): void {
  const trigger = document.getElementById("geoStatus");
  if (!trigger || trigger.dataset.hgGeoClickBound === "1") return;
  trigger.dataset.hgGeoClickBound = "1";
  trigger.style.cursor = "pointer";
  trigger.addEventListener("click", () => {
    void locationPicker.openLocationPicker();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindGeoStatusClick, { once: true });
} else {
  bindGeoStatusClick();
}

export { HGPos };
