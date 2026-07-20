// Canonical selector for the Nearby place list.
// This module owns place decoration, filtering and sorting. DOM rendering remains
// in lists.js during the strangler migration.

import type { Place } from "../../schemas/place";
import type {
  NearbyFiltersApi,
  NearbyPlaceFilter,
  NearbySort
} from "./nearbyFilters";

export type NearbySourcePlace = Place & {
  start_year?: unknown;
  startYear?: unknown;
  epokeLabel?: unknown;
};

export type NearbyListPlace = NearbySourcePlace & {
  _d: number | null;
  _timeSortKey: number | null;
  _timeLabel: string;
  _epokeLabel: string;
  _isZeitgeist: boolean;
};

export type NearbyPlaceSelection = {
  items: NearbyListPlace[];
  filterMode: NearbyPlaceFilter;
  sortMode: NearbySort;
  badgeFilter: string;
  favoritesOnly: boolean;
  freshPlaceId: string;
};

export type NearbyPlaceSelectorApi = {
  select: () => NearbyPlaceSelection;
  getPlaceDistanceMeters: (place: NearbySourcePlace, position: unknown) => number | null;
};

type ResolvedPlaceTime = {
  year?: unknown;
  startYear?: unknown;
  epokeLabel?: unknown;
  isZeitgeist?: unknown;
};

type FavoritePlacesRuntime = {
  has?: (placeId: string) => boolean;
};

type TimeResolverRuntime = {
  resolvePlaceTime?: (place: NearbySourcePlace) => ResolvedPlaceTime | null | undefined;
};

type RuntimeWindow = Window & typeof globalThis & {
  PLACES?: NearbySourcePlace[];
  visited?: Record<string, unknown>;
  getPos?: () => unknown;
  distMeters?: (from: unknown, to: unknown) => number;
  getPlaceDistanceTargets?: (place: NearbySourcePlace) => Array<{ lat?: number; lon?: number }> | null | undefined;
  HGFavoritePlaces?: FavoritePlacesRuntime;
  HGNearbyFilters?: NearbyFiltersApi;
  HGTimeResolver?: TimeResolverRuntime;
  HG_LAST_DISCOVERED_PLACE_ID?: unknown;
  HG_NEARBY_FILTER?: unknown;
  HG_NEARBY_SORT?: unknown;
  HG_NEARBY_BADGE_FILTER?: unknown;
  HG_NEARBY_FAVORITES_ONLY?: unknown;
  HGNearbyPlaceSelector?: NearbyPlaceSelectorApi;
};

const win = window as RuntimeWindow;

function normalizePlaceFilter(value: unknown): NearbyPlaceFilter {
  const raw = String(value ?? "unvisited").trim().toLowerCase();
  if (raw === "all" || raw === "unlocked") return raw;
  return "unvisited";
}

function normalizeSort(value: unknown): NearbySort {
  const raw = String(value ?? "distance").trim().toLowerCase();
  if (raw === "oldest" || raw === "newest") return raw;
  return "distance";
}

function getPlaceDistanceMeters(place: NearbySourcePlace, position: unknown): number | null {
  const distMeters = win.distMeters;
  if (!place || !position || typeof distMeters !== "function") return null;

  const getTargets = win.getPlaceDistanceTargets;
  const targets = typeof getTargets === "function"
    ? getTargets(place)
    : [{ lat: place.lat, lon: place.lon }];

  let best = Infinity;
  for (const target of targets || []) {
    const distance = distMeters(position, { lat: target.lat, lon: target.lon });
    if (Number.isFinite(distance) && distance < best) best = distance;
  }

  return Number.isFinite(best) ? Math.round(best) : null;
}

function readSortYear(place: NearbySourcePlace, resolved: ResolvedPlaceTime | null): number | null {
  const candidates = [
    resolved?.year,
    resolved?.startYear,
    place.year,
    place.start_year,
    place.startYear
  ];

  for (const candidate of candidates) {
    if (candidate == null) continue;
    if (typeof candidate === "string" && candidate.trim() === "") continue;
    const value = Number(candidate);
    if (Number.isFinite(value)) return value;
  }

  return null;
}

function distanceAndNameCompare(a: NearbyListPlace, b: NearbyListPlace): number {
  const distanceDelta = (a._d ?? 1e12) - (b._d ?? 1e12);
  if (distanceDelta !== 0) return distanceDelta;
  return String(a.name || "").localeCompare(String(b.name || ""), "nb");
}

function comparePlaces(sortMode: NearbySort, a: NearbyListPlace, b: NearbyListPlace): number {
  if (sortMode === "distance") return distanceAndNameCompare(a, b);

  const aTime = a._timeSortKey;
  const bTime = b._timeSortKey;
  const aHasTime = typeof aTime === "number" && Number.isFinite(aTime);
  const bHasTime = typeof bTime === "number" && Number.isFinite(bTime);

  if (aHasTime !== bHasTime) return aHasTime ? -1 : 1;
  if (!aHasTime || !bHasTime || aTime == null || bTime == null) {
    return distanceAndNameCompare(a, b);
  }

  const delta = sortMode === "oldest"
    ? aTime - bTime
    : bTime - aTime;

  if (delta !== 0) return delta;
  return distanceAndNameCompare(a, b);
}

function select(): NearbyPlaceSelection {
  const places = Array.isArray(win.PLACES) ? win.PLACES : [];
  const visited = win.visited || {};
  const position = win.getPos?.();
  const filters = win.HGNearbyFilters;

  const filterMode = filters?.getPlaceFilter?.() || normalizePlaceFilter(win.HG_NEARBY_FILTER);
  const sortMode = filters?.getSort?.() || normalizeSort(win.HG_NEARBY_SORT);
  const badgeFilter = filters?.getActiveBadgeFilter?.()
    || String(win.HG_NEARBY_BADGE_FILTER || "all").trim()
    || "all";
  const favoritesOnly = filters?.getFavoritesOnly?.() ?? Boolean(win.HG_NEARBY_FAVORITES_ONLY);
  const freshPlaceId = String(win.HG_LAST_DISCOVERED_PLACE_ID || "").trim();

  const timeResolver = win.HGTimeResolver;
  const resolvePlaceTime = timeResolver?.resolvePlaceTime;
  const resolveTime = typeof resolvePlaceTime === "function"
    ? (place: NearbySourcePlace) => resolvePlaceTime.call(timeResolver, place)
    : null;

  let items: NearbyListPlace[] = places.map((place) => {
    const resolved = resolveTime ? (resolveTime(place) || null) : null;
    const sortYear = readSortYear(place, resolved);
    const hasTime = typeof sortYear === "number" && Number.isFinite(sortYear);
    const legacyEpokeLabel = (place as NearbySourcePlace).epokeLabel;

    return {
      ...place,
      _d: getPlaceDistanceMeters(place, position),
      _timeSortKey: hasTime ? sortYear : null,
      _timeLabel: hasTime ? String(sortYear) : "",
      _epokeLabel: String(resolved?.epokeLabel ?? legacyEpokeLabel ?? "").trim(),
      _isZeitgeist: Boolean(resolved?.isZeitgeist)
    };
  });

  if (filterMode === "unvisited") {
    items = items.filter((place) => !visited[place.id]);
  } else if (filterMode === "unlocked") {
    items = items.filter((place) => Boolean(visited[place.id]));
  }

  if (favoritesOnly) {
    items = items.filter((place) => Boolean(win.HGFavoritePlaces?.has?.(place.id)));
  }

  if (badgeFilter !== "all") {
    items = items.filter((place) => String(place.category || "").trim() === badgeFilter);
  }

  items.sort((a, b) => comparePlaces(sortMode, a, b));

  return {
    items,
    filterMode,
    sortMode,
    badgeFilter,
    favoritesOnly,
    freshPlaceId
  };
}

const api: NearbyPlaceSelectorApi = {
  select,
  getPlaceDistanceMeters
};

win.HGNearbyPlaceSelector = api;
