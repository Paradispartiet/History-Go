// Canonical state and persistence controller for Nearby/Utforsk filters.
// Button rendering and event binding remain in left-panel.js during the strangler migration.
// State transitions preserve the legacy window globals while persistence is centralized here.

import type { CategoryDefinition } from "../core/categories";

export type NearbyPlaceFilter = "unvisited" | "all" | "unlocked";
export type NearbyNatureFilter = "all" | "unlocked" | "flora" | "fauna";
export type NearbySort = "distance" | "oldest" | "newest";

export type NearbyFiltersApi = {
  initializeFromStorage: () => void;
  normalizeSort: (value: unknown) => NearbySort;
  normalizeBadgeFilter: (value: unknown) => string;
  getCategoryById: (value: unknown) => CategoryDefinition | null;
  getBadgeOptions: () => string[];
  getActiveBadgeFilter: () => string;
  setActiveBadgeFilter: (value: unknown) => string;
  isBadgeFilterActive: () => boolean;
  cyclePlaceFilter: () => NearbyPlaceFilter;
  cycleNatureFilter: () => NearbyNatureFilter;
  toggleFavorites: () => boolean;
  cycleSort: () => NearbySort;
};

type RuntimeWindow = Window & typeof globalThis & {
  CATEGORY_LIST?: CategoryDefinition[];
  HG_NEARBY_FILTER?: string;
  HG_NEARBY_BADGE_FILTER?: string;
  HG_NEARBY_SORT?: NearbySort;
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

function normalizeSort(value: unknown): NearbySort {
  const raw = String(value || "distance").trim().toLowerCase();
  if (raw === "oldest" || raw === "newest") return raw;
  return "distance";
}

function getCategoryById(value: unknown): CategoryDefinition | null {
  const id = String(value || "").trim();
  const categories = Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
  return categories.find((category) => category.id.trim() === id) ?? null;
}

function getBadgeOptions(): string[] {
  const categories = Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
  return ["all", ...categories.map((category) => category.id.trim()).filter(Boolean)];
}

function normalizeBadgeFilter(value: unknown): string {
  const raw = String(value || "all").trim() || "all";
  if (raw === "all") return "all";
  return getCategoryById(raw) ? raw : "all";
}

function getActiveBadgeFilter(): string {
  return normalizeBadgeFilter(win.HG_NEARBY_BADGE_FILTER || "all");
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

function cyclePlaceFilter(): NearbyPlaceFilter {
  const current = String(win.HG_NEARBY_FILTER || "unvisited");
  const index = PLACE_FILTER_ORDER.indexOf(current as NearbyPlaceFilter);
  const next = PLACE_FILTER_ORDER[(index + 1) % PLACE_FILTER_ORDER.length];
  win.HG_NEARBY_FILTER = next;
  writeStorage("hg_nearby_filter_v1", next);
  return next;
}

function cycleNatureFilter(): NearbyNatureFilter {
  const current = String(win.HG_NATURE_FILTER || "all");
  const index = NATURE_FILTER_ORDER.indexOf(current as NearbyNatureFilter);
  const next = NATURE_FILTER_ORDER[(index + 1) % NATURE_FILTER_ORDER.length];
  win.HG_NATURE_FILTER = next;
  writeStorage("hg_nature_filter_v1", next);
  return next;
}

function toggleFavorites(): boolean {
  const next = !Boolean(win.HG_NEARBY_FAVORITES_ONLY);
  win.HG_NEARBY_FAVORITES_ONLY = next;
  writeStorage("hg_nearby_favorites_filter_v1", next ? "1" : "0");
  return next;
}

function cycleSort(): NearbySort {
  const current = normalizeSort(win.HG_NEARBY_SORT);
  const index = SORT_ORDER.indexOf(current);
  const next = SORT_ORDER[(index + 1) % SORT_ORDER.length];
  win.HG_NEARBY_SORT = next;
  writeStorage("hg_nearby_sort_v1", next);
  return next;
}

function initializeFromStorage(): void {
  win.HG_NEARBY_FILTER = readStorage("hg_nearby_filter_v1") || "unvisited";
  win.HG_NEARBY_BADGE_FILTER = normalizeBadgeFilter(readStorage("hg_nearby_badge_filter_v1") || "all");
  win.HG_NEARBY_SORT = normalizeSort(readStorage("hg_nearby_sort_v1") || "distance");
  win.HG_NEARBY_FAVORITES_ONLY = readStorage("hg_nearby_favorites_filter_v1") === "1";
  win.HG_NATURE_FILTER = readStorage("hg_nature_filter_v1") || "all";
}

const api: NearbyFiltersApi = {
  initializeFromStorage,
  normalizeSort,
  normalizeBadgeFilter,
  getCategoryById,
  getBadgeOptions,
  getActiveBadgeFilter,
  setActiveBadgeFilter,
  isBadgeFilterActive,
  cyclePlaceFilter,
  cycleNatureFilter,
  toggleFavorites,
  cycleSort
};

win.HGNearbyFilters = api;
win.HG_getActiveBadgeFilter = getActiveBadgeFilter;
win.HG_isBadgeFilterActive = isBadgeFilterActive;
initializeFromStorage();
