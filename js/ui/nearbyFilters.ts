// Canonical state and persistence controller for Nearby/Utforsk filters.
// Rendering and button binding remain in left-panel.js during the strangler migration.
// Existing window globals are mirrored so legacy consumers such as lists.js continue to work.

import type { CategoryDefinition } from "../core/categories";

export type NearbyPlaceFilter = "unvisited" | "all" | "unlocked";
export type NearbyNatureFilter = "all" | "unlocked" | "flora" | "fauna";
export type NearbySort = "distance" | "oldest" | "newest";

export type NearbyFiltersSnapshot = {
  placeFilter: NearbyPlaceFilter;
  badgeFilter: string;
  sort: NearbySort;
  favoritesOnly: boolean;
  natureFilter: NearbyNatureFilter;
};

export type NearbyFiltersApi = {
  initializeFromStorage: () => NearbyFiltersSnapshot;
  snapshot: () => NearbyFiltersSnapshot;

  normalizeSort: (value: unknown) => NearbySort;
  getSort: () => NearbySort;
  setSort: (value: unknown) => NearbySort;
  cycleSort: () => NearbySort;

  getPlaceFilter: () => NearbyPlaceFilter;
  setPlaceFilter: (value: unknown) => NearbyPlaceFilter;
  cyclePlaceFilter: () => NearbyPlaceFilter;

  getNatureFilter: () => NearbyNatureFilter;
  setNatureFilter: (value: unknown) => NearbyNatureFilter;
  cycleNatureFilter: () => NearbyNatureFilter;

  getFavoritesOnly: () => boolean;
  setFavoritesOnly: (value: unknown) => boolean;
  toggleFavorites: () => boolean;

  getCategoryById: (value: unknown) => CategoryDefinition | null;
  getBadgeOptions: () => string[];
  normalizeBadgeFilter: (value: unknown) => string;
  getActiveBadgeFilter: () => string;
  setActiveBadgeFilter: (value: unknown) => string;
  cycleBadgeFilter: () => string;
  isBadgeFilterActive: () => boolean;
};

type RuntimeWindow = Window & typeof globalThis & {
  CATEGORY_LIST?: CategoryDefinition[];
  HG_NEARBY_FILTER?: string;
  HG_NEARBY_BADGE_FILTER?: string;
  HG_NEARBY_SORT?: string;
  HG_NEARBY_FAVORITES_ONLY?: boolean;
  HG_NATURE_FILTER?: string;
  HGNearbyFilters?: NearbyFiltersApi;
  HG_getActiveBadgeFilter?: () => string;
  HG_isBadgeFilterActive?: () => boolean;
};

const win = window as RuntimeWindow;

const PLACE_FILTER_ORDER = ["unvisited", "all", "unlocked"] as const;
const NATURE_FILTER_ORDER = ["all", "unlocked", "flora", "fauna"] as const;
const SORT_ORDER = ["distance", "oldest", "newest"] as const;

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function normalizeFromOrder<T extends string>(
  value: unknown,
  order: readonly T[],
  fallback: T
): T {
  const normalized = String(value ?? "").trim().toLowerCase() as T;
  return order.includes(normalized) ? normalized : fallback;
}

function normalizeSort(value: unknown): NearbySort {
  return normalizeFromOrder(value, SORT_ORDER, "distance");
}

function normalizePlaceFilter(value: unknown): NearbyPlaceFilter {
  return normalizeFromOrder(value, PLACE_FILTER_ORDER, "unvisited");
}

function normalizeNatureFilter(value: unknown): NearbyNatureFilter {
  return normalizeFromOrder(value, NATURE_FILTER_ORDER, "all");
}

function getCategoryById(value: unknown): CategoryDefinition | null {
  const id = String(value ?? "").trim();
  const categories = Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
  return categories.find(category => String(category.id ?? "").trim() === id) ?? null;
}

function getBadgeOptions(): string[] {
  const categories = Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
  return ["all", ...categories.map(category => String(category.id ?? "").trim()).filter(Boolean)];
}

function normalizeBadgeFilter(value: unknown): string {
  const raw = String(value ?? "all").trim() || "all";
  if (raw === "all") return "all";
  return getCategoryById(raw) ? raw : "all";
}

function getPlaceFilter(): NearbyPlaceFilter {
  return normalizePlaceFilter(win.HG_NEARBY_FILTER);
}

function setPlaceFilter(value: unknown): NearbyPlaceFilter {
  const next = normalizePlaceFilter(value);
  win.HG_NEARBY_FILTER = next;
  writeStorage("hg_nearby_filter_v1", next);
  return next;
}

function getNatureFilter(): NearbyNatureFilter {
  return normalizeNatureFilter(win.HG_NATURE_FILTER);
}

function setNatureFilter(value: unknown): NearbyNatureFilter {
  const next = normalizeNatureFilter(value);
  win.HG_NATURE_FILTER = next;
  writeStorage("hg_nature_filter_v1", next);
  return next;
}

function getSort(): NearbySort {
  return normalizeSort(win.HG_NEARBY_SORT);
}

function setSort(value: unknown): NearbySort {
  const next = normalizeSort(value);
  win.HG_NEARBY_SORT = next;
  writeStorage("hg_nearby_sort_v1", next);
  return next;
}

function getFavoritesOnly(): boolean {
  return Boolean(win.HG_NEARBY_FAVORITES_ONLY);
}

function setFavoritesOnly(value: unknown): boolean {
  const next = Boolean(value);
  win.HG_NEARBY_FAVORITES_ONLY = next;
  writeStorage("hg_nearby_favorites_filter_v1", next ? "1" : "0");
  return next;
}

function getActiveBadgeFilter(): string {
  return normalizeBadgeFilter(win.HG_NEARBY_BADGE_FILTER);
}

function setActiveBadgeFilter(value: unknown): string {
  const next = normalizeBadgeFilter(value);
  win.HG_NEARBY_BADGE_FILTER = next;
  writeStorage("hg_nearby_badge_filter_v1", next);
  return next;
}

function isBadgeFilterActive(): boolean {
  return getActiveBadgeFilter() !== "all";
}

function cycleValue<T extends string>(current: T, order: readonly T[]): T {
  const index = order.indexOf(current);
  return order[(index + 1) % order.length] ?? order[0];
}

function cyclePlaceFilter(): NearbyPlaceFilter {
  return setPlaceFilter(cycleValue(getPlaceFilter(), PLACE_FILTER_ORDER));
}

function cycleNatureFilter(): NearbyNatureFilter {
  return setNatureFilter(cycleValue(getNatureFilter(), NATURE_FILTER_ORDER));
}

function cycleSort(): NearbySort {
  return setSort(cycleValue(getSort(), SORT_ORDER));
}

function toggleFavorites(): boolean {
  return setFavoritesOnly(!getFavoritesOnly());
}

function cycleBadgeFilter(): string {
  const order = getBadgeOptions();
  const current = getActiveBadgeFilter();
  const index = order.indexOf(current);
  return setActiveBadgeFilter(order[(index + 1) % order.length] ?? "all");
}

function snapshot(): NearbyFiltersSnapshot {
  return {
    placeFilter: getPlaceFilter(),
    badgeFilter: getActiveBadgeFilter(),
    sort: getSort(),
    favoritesOnly: getFavoritesOnly(),
    natureFilter: getNatureFilter()
  };
}

function initializeFromStorage(): NearbyFiltersSnapshot {
  // Initialization mirrors the legacy globals without rewriting storage simply by reading it.
  win.HG_NEARBY_FILTER = normalizePlaceFilter(readStorage("hg_nearby_filter_v1"));
  win.HG_NEARBY_BADGE_FILTER = normalizeBadgeFilter(readStorage("hg_nearby_badge_filter_v1"));
  win.HG_NEARBY_SORT = normalizeSort(readStorage("hg_nearby_sort_v1"));
  win.HG_NEARBY_FAVORITES_ONLY = readStorage("hg_nearby_favorites_filter_v1") === "1";
  win.HG_NATURE_FILTER = normalizeNatureFilter(readStorage("hg_nature_filter_v1"));
  return snapshot();
}

const api: NearbyFiltersApi = {
  initializeFromStorage,
  snapshot,
  normalizeSort,
  getSort,
  setSort,
  cycleSort,
  getPlaceFilter,
  setPlaceFilter,
  cyclePlaceFilter,
  getNatureFilter,
  setNatureFilter,
  cycleNatureFilter,
  getFavoritesOnly,
  setFavoritesOnly,
  toggleFavorites,
  getCategoryById,
  getBadgeOptions,
  normalizeBadgeFilter,
  getActiveBadgeFilter,
  setActiveBadgeFilter,
  cycleBadgeFilter,
  isBadgeFilterActive
};

win.HGNearbyFilters = api;
win.HG_getActiveBadgeFilter = getActiveBadgeFilter;
win.HG_isBadgeFilterActive = isBadgeFilterActive;
initializeFromStorage();
