// ============================================================
// CivicationTravelState – Civication-owned travel state v1
// ------------------------------------------------------------
// Owns only hg_civi_travel_v1. It records requested destinations
// from Civication UI events without mutating History Go progression,
// calendar/time, home, jobs, mail, active position, maps or UI.
// ============================================================

(function () {
  "use strict";

  const root = typeof window !== "undefined" ? window : globalThis;
  const SOURCE = "CivicationTravelState";

  const DEFAULT_STATE = Object.freeze({
    version: 1,
    currentLocation: null,
    currentDestination: null,
    activeTrip: null,
    pendingTravelRequest: null,
    travelLog: [],
    lastTravelAt: null,
    updatedAt: null
  });

  function nowIso() {
    return new Date().toISOString();
  }

  function adapter() {
    return root.CivicationStorageAdapter || null;
  }

  function cloneDefault() {
    return {
      ...DEFAULT_STATE,
      travelLog: []
    };
  }

  function normalizeState(value) {
    const raw = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    return {
      ...cloneDefault(),
      ...raw,
      version: 1,
      travelLog: Array.isArray(raw.travelLog) ? raw.travelLog.slice() : []
    };
  }

  function readStoredState() {
    const store = adapter();
    if (store && typeof store.readTravelState === "function") {
      return store.readTravelState();
    }
    try {
      const raw = root.localStorage && root.localStorage.getItem("hg_civi_travel_v1");
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function writeStoredState(state) {
    const store = adapter();
    if (store && typeof store.writeTravelState === "function") {
      return store.writeTravelState(state);
    }
    try {
      if (!root.localStorage) return false;
      root.localStorage.setItem("hg_civi_travel_v1", JSON.stringify(state));
      return true;
    } catch (_) {
      return false;
    }
  }

  function getState() {
    return normalizeState(readStoredState());
  }

  function setState(value) {
    const next = normalizeState(value);
    writeStoredState(next);
    return next;
  }

  function dispatch(name, detail) {
    try {
      if (typeof root.dispatchEvent !== "function") return;
      if (typeof root.CustomEvent === "function") {
        root.dispatchEvent(new root.CustomEvent(name, { detail }));
      } else if (typeof CustomEvent === "function") {
        root.dispatchEvent(new CustomEvent(name, { detail }));
      }
    } catch (_) {}
  }

  function updateState(patch, reason) {
    const updatedAt = nowIso();
    const safePatch = patch && typeof patch === "object" && !Array.isArray(patch) ? patch : {};
    const next = normalizeState({
      ...getState(),
      ...safePatch,
      updatedAt
    });

    writeStoredState(next);
    dispatch("civi:travelStateUpdated", {
      state: next,
      patch: safePatch,
      reason: reason || "updateState",
      source: SOURCE,
      updatedAt
    });
    return next;
  }

  function readCalendarSnapshot() {
    let clock = null;

    try {
      if (root.CivicationCalendar && typeof root.CivicationCalendar.getClock === "function") {
        clock = root.CivicationCalendar.getClock() || null;
      }
    } catch (_) {
      clock = null;
    }

    if (!clock) {
      try {
        const store = adapter();
        if (store && typeof store.readCalendar === "function") {
          clock = store.readCalendar() || null;
        }
      } catch (_) {
        clock = null;
      }
    }

    const rawPhase = clock && clock.phase != null ? clock.phase : null;
    let phase = rawPhase == null ? null : String(rawPhase);
    if (phase == null) {
      try {
        if (root.CivicationCalendar && typeof root.CivicationCalendar.getPhase === "function") {
          const calendarPhase = root.CivicationCalendar.getPhase();
          phase = calendarPhase == null ? null : String(calendarPhase);
        }
      } catch (_) {}
    }

    return {
      phase,
      dayIndex: clock && Number.isFinite(Number(clock.dayIndex)) ? Number(clock.dayIndex) : null,
      calendarMinute: clock && Number.isFinite(Number(clock.currentMinutes)) ? Number(clock.currentMinutes) : null
    };
  }

  function detailFromEvent(eventOrDetail) {
    if (eventOrDetail && typeof eventOrDetail === "object" && "detail" in eventOrDetail) {
      return eventOrDetail.detail || {};
    }
    return eventOrDetail || {};
  }

  function placeName(place, placeId) {
    return String(
      place && (place.name || place.title || place.label || place.id) ||
      placeId ||
      "Ukjent sted"
    );
  }

  function placeCategory(place) {
    if (!place || typeof place !== "object") return null;
    const raw = place.raw && typeof place.raw === "object" ? place.raw : {};
    const value = place.category || raw.category || raw.emne || raw.topic || null;
    return value == null ? null : String(value);
  }

  function normalizeTravelRequest(eventOrDetail) {
    const detail = detailFromEvent(eventOrDetail);
    const place = detail && detail.place && typeof detail.place === "object" ? detail.place : null;
    const placeId = detail && detail.placeId != null
      ? String(detail.placeId)
      : place && place.id != null
        ? String(place.id)
        : null;
    const calendar = readCalendarSnapshot();
    const requestedAt = nowIso();
    const source = detail && detail.source ? String(detail.source) : null;
    const origin = place
      ? source === "CivicationHistoryGoPlaceLayer" ? "history_go_place" : "unknown"
      : "unknown";
    const base = {
      source,
      placeId,
      placeName: placeName(place, placeId),
      category: placeCategory(place),
      origin,
      phase: calendar.phase,
      dayIndex: calendar.dayIndex,
      calendarMinute: calendar.calendarMinute,
      requestedAt
    };

    return {
      request: {
        ...base,
        status: "pending"
      },
      destination: {
        ...base,
        status: "requested"
      }
    };
  }

  function setPendingTravelRequest(request) {
    return updateState({ pendingTravelRequest: request || null }, "setPendingTravelRequest");
  }

  function setCurrentDestination(destination) {
    return updateState({ currentDestination: destination || null }, "setCurrentDestination");
  }

  function clearPendingTravelRequest() {
    const updatedAt = nowIso();
    const store = adapter();
    let next;
    if (store && typeof store.clearPendingTravelRequest === "function") {
      next = normalizeState(store.clearPendingTravelRequest());
      next.updatedAt = updatedAt;
    } else {
      next = normalizeState({ ...getState(), pendingTravelRequest: null });
      next.updatedAt = updatedAt;
    }
    writeStoredState(next);
    dispatch("civi:travelStateUpdated", {
      state: next,
      patch: { pendingTravelRequest: null },
      reason: "clearPendingTravelRequest",
      source: SOURCE,
      updatedAt
    });
    return next;
  }

  function getCurrentDestination() {
    return getState().currentDestination || null;
  }

  function getCurrentLocation() {
    return getState().currentLocation || null;
  }

  function appendTravelLog(entry) {
    const state = getState();
    const travelLog = Array.isArray(state.travelLog) ? state.travelLog.slice() : [];
    travelLog.push(entry);
    return updateState({ travelLog }, "appendTravelLog");
  }

  function completeCurrentTravel(options) {
    const state = getState();
    const destination = state.currentDestination || state.pendingTravelRequest;
    if (!destination || typeof destination !== "object") return state;

    const safeOptions = options && typeof options === "object" && !Array.isArray(options) ? options : {};
    const completedAt = nowIso();
    const tripId = String(
      safeOptions.tripId ||
      destination.tripId ||
      `travel-${destination.placeId || "destination"}-${completedAt}`
    );
    const previousLocation = state.currentLocation || null;
    const currentLocation = {
      ...destination,
      status: "arrived",
      arrivedAt: completedAt
    };
    const completedTrip = {
      tripId,
      currentLocation,
      previousLocation,
      completedAt,
      status: "completed",
      source: SOURCE
    };
    const travelLog = state.travelLog.slice();
    travelLog.push(completedTrip);
    const patch = {
      currentLocation,
      currentDestination: null,
      pendingTravelRequest: null,
      activeTrip: null,
      travelLog,
      lastTravelAt: completedAt
    };
    const next = normalizeState({
      ...state,
      ...patch,
      updatedAt: completedAt
    });

    writeStoredState(next);
    dispatch("civi:travelCompleted", {
      tripId,
      currentLocation,
      previousLocation,
      completedAt,
      source: SOURCE
    });
    dispatch("civi:travelStateUpdated", {
      state: next,
      patch,
      reason: "completeCurrentTravel",
      source: SOURCE,
      updatedAt: completedAt
    });
    dispatch("updateProfile", {
      source: SOURCE,
      updatedAt: completedAt
    });

    return next;
  }

  function handleTravelRequest(eventOrDetail) {
    const normalized = normalizeTravelRequest(eventOrDetail);
    const updatedAt = nowIso();
    const patch = {
      pendingTravelRequest: normalized.request,
      currentDestination: normalized.destination,
      lastTravelAt: null
    };
    const next = normalizeState({
      ...getState(),
      ...patch,
      updatedAt
    });

    writeStoredState(next);
    dispatch("civi:travelStateUpdated", {
      state: next,
      patch,
      reason: "historyGoPlaceTravelRequested",
      source: SOURCE,
      updatedAt
    });
    dispatch("civi:travelDestinationSet", {
      destination: normalized.destination,
      request: normalized.request,
      source: SOURCE,
      updatedAt
    });
    dispatch("updateProfile", {
      source: SOURCE,
      updatedAt
    });

    return next;
  }

  const api = {
    getState,
    setState,
    updateState,
    handleTravelRequest,
    setPendingTravelRequest,
    setCurrentDestination,
    clearPendingTravelRequest,
    getCurrentDestination,
    getCurrentLocation,
    appendTravelLog,
    completeCurrentTravel
  };

  root.CivicationTravelState = api;

  if (typeof root.addEventListener === "function") {
    root.addEventListener("civi:historyGoPlaceTravelRequested", handleTravelRequest);
  }
})();
