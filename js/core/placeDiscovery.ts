import type { Place } from "../../schemas/place";

const TODAY_VISITED_KEY = "hg_today_visited_v1";
const DISCOVERY_COOLDOWN_MS = 15_000;

export type PositionPoint = { lat: number; lon: number };
export type UnlockAnchor = { lat?: unknown; lon?: unknown; r?: unknown };

type DiscoveryWindow = Window & typeof globalThis & {
  PLACES?: Place[];
  visited?: Record<string, unknown>;
  HG_LAST_DISCOVERED_PLACE_ID?: string;
  distMeters?: (a: PositionPoint, b: PositionPoint) => number;
  saveVisitedFromQuiz?: (placeId: string) => unknown;
  getPlaceUnlockAnchors?: (place: Place) => UnlockAnchor[];
  showToast?: (message: string, duration?: number) => unknown;
  renderNearbyPlaces?: () => unknown;
  openPlaceCard?: (place: Place) => unknown;
};

const win = window as DiscoveryWindow;
const discoveryCooldowns = new Map<string, number>();

type TodayVisitedState = { date: string; ids: string[] };

function getTodayKey(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadTodayVisited(): TodayVisitedState {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(TODAY_VISITED_KEY) || "{}");
    if (!parsed || typeof parsed !== "object") return { date: getTodayKey(), ids: [] };
    const raw = parsed as { date?: unknown; ids?: unknown };
    return {
      date: String(raw.date || "").trim() || getTodayKey(),
      ids: Array.isArray(raw.ids) ? raw.ids.filter(Boolean).map(String) : []
    };
  } catch {
    return { date: getTodayKey(), ids: [] };
  }
}

function saveTodayVisited(state: TodayVisitedState): void {
  try {
    localStorage.setItem(TODAY_VISITED_KEY, JSON.stringify(state));
  } catch {
    // Progress still works in-memory when storage is unavailable.
  }
}

function ensureTodayVisitedStore(): TodayVisitedState {
  const today = getTodayKey();
  const state = loadTodayVisited();
  if (state.date === today) return state;
  const fresh = { date: today, ids: [] };
  saveTodayVisited(fresh);
  return fresh;
}

function markPlaceVisitedToday(placeId: string): boolean {
  const id = String(placeId || "").trim();
  if (!id) return false;

  const state = ensureTodayVisitedStore();
  if (state.ids.includes(id)) return false;

  state.ids.push(id);
  saveTodayVisited(state);
  try {
    win.dispatchEvent(new CustomEvent("hg:todayVisited", {
      detail: { placeId: id, date: state.date }
    }));
  } catch {
    // Event listeners are optional consumers.
  }
  return true;
}

function isInDiscoveryCooldown(placeId: string): boolean {
  const last = discoveryCooldowns.get(String(placeId || "").trim());
  return Number.isFinite(last) && Date.now() - (last as number) < DISCOVERY_COOLDOWN_MS;
}

function markDiscoveryCooldown(placeId: string): void {
  const id = String(placeId || "").trim();
  if (id) discoveryCooldowns.set(id, Date.now());
}

function shouldAutoOpenPlace(place: Place): boolean {
  if (!place.id) return false;
  const card = document.getElementById("placeCard");
  const currentPlaceId = String(card?.dataset.currentPlaceId || "").trim();
  const cardVisible = card?.getAttribute("aria-hidden") === "false";
  if (!cardVisible || !currentPlaceId) return true;
  return currentPlaceId !== place.id;
}

function announceDiscovery(
  place: Place,
  { isNewUnlock = false, isNewToday = false }: { isNewUnlock?: boolean; isNewToday?: boolean } = {}
): void {
  if (!place.id || isInDiscoveryCooldown(place.id)) return;

  markDiscoveryCooldown(place.id);
  win.HG_LAST_DISCOVERED_PLACE_ID = place.id;

  const placeName = place.name || place.title || place.id;
  const prefix = isNewUnlock ? "📍 Låst opp" : "📍 Besøkt";
  const suffix = isNewToday && !isNewUnlock ? " i dag" : "";
  win.showToast?.(`${prefix}: ${placeName}${suffix}`, 2600);
  win.renderNearbyPlaces?.();

  if (shouldAutoOpenPlace(place) && win.openPlaceCard) {
    window.setTimeout(() => win.openPlaceCard?.(place), 450);
  }

  win.dispatchEvent(new CustomEvent("hg:placeDiscovered", {
    detail: {
      placeId: place.id,
      name: placeName,
      isNewUnlock,
      isNewToday
    }
  }));
}

export function autoUnlockPlacesFromPosition(lat: number, lon: number): void {
  const places = Array.isArray(win.PLACES) ? win.PLACES : [];
  if (!places.length || !win.distMeters || !win.saveVisitedFromQuiz) return;

  const userPos = { lat, lon };
  for (const place of places) {
    if (!place || place.hidden || place.stub) continue;

    const anchors = win.getPlaceUnlockAnchors?.(place) ?? [
      { lat: place.lat, lon: place.lon, r: place.r }
    ];

    const canUnlock = anchors.some((anchor) => {
      const anchorLat = Number(anchor?.lat);
      const anchorLon = Number(anchor?.lon);
      const radius = Number(anchor?.r);
      if (![anchorLat, anchorLon, radius].every(Number.isFinite) || radius <= 0) return false;
      const distance = win.distMeters?.(userPos, { lat: anchorLat, lon: anchorLon });
      return Number.isFinite(distance) && (distance as number) <= radius;
    });
    if (!canUnlock) continue;

    const wasVisited = Boolean(win.visited?.[place.id]);
    const isNewToday = markPlaceVisitedToday(place.id);

    if (!wasVisited) {
      win.saveVisitedFromQuiz(place.id);
      announceDiscovery(place, { isNewUnlock: true, isNewToday: true });
    } else if (isNewToday) {
      announceDiscovery(place, { isNewToday: true });
    }
  }
}
