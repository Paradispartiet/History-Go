import {
  getPhysicalVisitGate,
  type PhysicalVisitRuntimeWindow,
  type PlaceLike
} from "../visits/physicalVisits";

export type TranslateUi = (key: string, fallback?: string) => string;
export type TranslateUiTemplate = (
  key: string,
  fallback?: string,
  vars?: Record<string, unknown>
) => string;

export type PlaceVisitButtonRuntimeWindow = PhysicalVisitRuntimeWindow & {
  showToast?: (message: string) => unknown;
  pulseMarker?: (lat: unknown, lon: unknown) => unknown;
  HGPos?: { request?: () => Promise<unknown> };
};

export type PlaceVisitButtonController = {
  patch: (place: PlaceLike) => void;
  clear: () => void;
};

export function createPlaceVisitButtonController(options: {
  runtime: PlaceVisitButtonRuntimeWindow;
  document: Document;
  tUI: TranslateUi;
  tfUI: TranslateUiTemplate;
}): PlaceVisitButtonController {
  const { runtime, document, tUI, tfUI } = options;
  let physicalVisitTimer: ReturnType<typeof setInterval> | null = null;
  let requestingPosition = false;

  const clear = (): void => {
    if (physicalVisitTimer === null) return;
    clearInterval(physicalVisitTimer);
    physicalVisitTimer = null;
  };

  const patch = (place: PlaceLike): void => {
    clear();

    // `pcVisit` is the explicit physical-visit action. Keep `pcUnlock` only as
    // a compatibility fallback for older embedders; visiting is not an unlock.
    const oldButton = document.getElementById("pcVisit")
      || document.getElementById("pcUnlock");
    if (!oldButton || !place) return;

    const button = oldButton.cloneNode(true) as HTMLButtonElement;
    oldButton.replaceWith(button);

    const placeId = String(place.id ?? "").trim();
    const setButton = (disabled: boolean, text: string): void => {
      button.disabled = disabled;
      button.textContent = text;
      button.setAttribute("aria-label", text);
    };

    const update = (): void => {
      if (!button.isConnected) {
        clear();
        return;
      }

      if (runtime.HGPhysicalVisits?.isVisited(placeId)) {
        setButton(true, `${tUI("ui.visit.visited", "Besøkt")} ✅`);
        clear();
        return;
      }

      const gate = getPhysicalVisitGate(runtime, place);
      if (!gate.ok) {
        const reason = "reason" in gate ? gate.reason : "too_far";
        if (reason === "no_pos") {
          // A disabled button cannot open the browser's location permission flow.
          setButton(requestingPosition, requestingPosition ? "Henter posisjon…" : "Hent posisjon");
          return;
        }
        if (gate.d != null) {
          const left = Math.max(0, Math.ceil(gate.d - gate.r));
          setButton(
            true,
            tfUI("ui.unlock.goCloserMeters", "Gå nærmere: {meters} m", {
              meters: left
            })
          );
          return;
        }
        setButton(true, reason === "no_anchor" ? "Stedet mangler koordinater" : tUI("ui.unlock.goCloser", "Gå nærmere"));
        return;
      }

      const label = runtime.TEST_MODE
        ? `${tUI("ui.visit.register", "Registrer besøk")} (test)`
        : tUI("ui.visit.register", "Registrer besøk");
      setButton(false, label);
    };

    button.onclick = () => {
      if (runtime.HGPhysicalVisits?.isVisited(placeId)) {
        runtime.showToast?.(
          tUI("ui.visit.alreadyVisited", "Besøket er allerede registrert")
        );
        update();
        return;
      }

      const gate = getPhysicalVisitGate(runtime, place);
      if (!gate.ok) {
        const reason = "reason" in gate ? gate.reason : "too_far";
        if (reason === "no_pos") {
          if (requestingPosition) return;
          if (typeof runtime.HGPos?.request !== "function") {
            runtime.showToast?.("Posisjonsfunksjonen er ikke tilgjengelig på denne enheten.");
            return;
          }
          requestingPosition = true;
          update();
          // A user click is required to request browser geolocation. The
          // physical-visit gate will be checked again on a later click.
          void Promise.resolve(runtime.HGPos.request()).then((position) => {
            runtime.showToast?.(position
              ? "Posisjon funnet. Registrer besøket når du er nær stedet."
              : "Fant ikke posisjonen. Kontroller stedstilgang i nettleseren.");
          }).catch(() => runtime.showToast?.("Kunne ikke hente posisjonen.")).finally(() => {
            requestingPosition = false;
            update();
          });
          return;
        }
        const left = gate.d != null
          ? Math.max(0, Math.ceil(gate.d - gate.r))
          : null;
        runtime.showToast?.(
          left != null
            ? tfUI("ui.unlock.goCloserMeters", "Gå nærmere: {meters} m", {
                meters: left
              })
            : tUI("ui.unlock.goCloser", "Gå nærmere")
        );
        return;
      }

      const result = runtime.HGPhysicalVisits?.record(place) || {
        ok: false as const,
        reason: "persistence_unavailable" as const
      };
      if (!result.ok) {
        runtime.showToast?.(
          tUI("ui.visit.saveFailed", "Kunne ikke registrere besøket")
        );
        return;
      }

      runtime.pulseMarker?.(place.lat, place.lon ?? place.lng);
      runtime.showToast?.(
        `${tUI("ui.visit.registered", "Besøk registrert")}: ${String(
          place.name ?? place.title ?? placeId
        )} ✅`
      );
      update();
    };

    update();
    if (!runtime.TEST_MODE && !runtime.HGPhysicalVisits?.isVisited(placeId)) {
      physicalVisitTimer = setInterval(update, 1200);
    }

    const closeButton = document.getElementById("pcClose");
    closeButton?.addEventListener("click", clear, { once: true });
  };

  return { patch, clear };
}
