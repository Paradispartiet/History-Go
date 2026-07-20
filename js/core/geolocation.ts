import type { PositionSnapshot, PositionState } from "./positionStore";

const WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 10_000
};

export type GeolocationRuntimeDependencies = {
  state: PositionState;
  setPos: (lat: unknown, lon: unknown, acc?: unknown) => void;
  clearPos: (reason?: string | number) => void;
  getPos: () => PositionSnapshot | null;
  emit: (detail: Record<string, unknown>) => void;
};

export type GeolocationRuntime = {
  request: (options?: PositionOptions) => Promise<PositionSnapshot | null>;
  stopWatch: () => void;
};

export function createGeolocationRuntime(deps: GeolocationRuntimeDependencies): GeolocationRuntime {
  const stopWatch = (): void => {
    try {
      if (deps.state.watchId != null && navigator.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(deps.state.watchId);
      }
    } catch {
      // Nothing to clear when the browser revokes the API during teardown.
    }
    deps.state.watchId = null;
  };

  const startWatch = (options: PositionOptions = {}): number | null => {
    if (!navigator.geolocation?.watchPosition) return null;
    stopWatch();
    deps.state.watchId = navigator.geolocation.watchPosition(
      (position) => {
        deps.setPos(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
      },
      (error) => {
        deps.state.lastError = { code: error.code, message: error.message };
      },
      { ...WATCH_OPTIONS, ...options }
    );
    return deps.state.watchId;
  };

  const request = (options: PositionOptions = {}): Promise<PositionSnapshot | null> => {
    if (!navigator.geolocation) {
      deps.clearPos("unsupported");
      return Promise.resolve(null);
    }

    deps.state.status = "requesting";
    deps.state.reason = null;
    deps.state.lastError = null;
    deps.emit({ status: "requesting" });
    const resolvedOptions = { ...WATCH_OPTIONS, ...options };

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          deps.setPos(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
          startWatch(resolvedOptions);
          resolve(deps.getPos());
        },
        (error) => {
          deps.state.lastError = { code: error.code, message: error.message };
          deps.clearPos(error.code || "blocked");
          resolve(null);
        },
        resolvedOptions
      );
    });
  };

  return { request, stopWatch };
}
