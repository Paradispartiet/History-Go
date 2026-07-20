// Canonical UI controller for Nearby/Utforsk filter controls.
// Filter state/persistence lives in nearbyFilters.ts; list rendering remains legacy during migration.

import type { LeftPanelModeApi } from "./leftPanelMode";
import type { NearbyFiltersApi, NearbySort } from "./nearbyFilters";

export type NearbyFilterControlsApi = {
  init: () => void;
  updateFilterButton: () => void;
  updateBadgeFilterButton: () => void;
  updateFavoritesFilterButton: () => void;
  updateSortButton: () => void;
};

type RuntimeI18n = {
  t?: (key: string, fallback?: string) => string;
};

type RuntimeWindow = Window & typeof globalThis & {
  HG_I18N?: RuntimeI18n;
  HGNearbyFilters?: NearbyFiltersApi;
  HGLeftPanelMode?: LeftPanelModeApi;
  HGNearbyFilterControls?: NearbyFilterControlsApi;
  renderNearbyNature?: () => void;
  updateNearbyFilterButton?: () => void;
  updateNearbyBadgeFilterButton?: () => void;
  updateNearbyFavoritesFilterButton?: () => void;
  updateNearbySortButton?: () => void;
};

const win = window as RuntimeWindow;

const PLACE_ICONS = {
  unvisited: "🎯",
  unlocked: "🔓",
  all: "🌍"
} as const;

const NATURE_ICONS = {
  all: "🌍",
  unlocked: "🔓",
  flora: "🌿",
  fauna: "🐞"
} as const;

const SORT_ICONS: Record<NearbySort, string> = {
  distance: "📍",
  oldest: "⏳",
  newest: "🕰️"
};

let initialized = false;
let badgeTapLockedUntil = 0;
let placeFilterButton: HTMLButtonElement | null = null;
let badgeFilterButton: HTMLButtonElement | null = null;
let favoritesFilterButton: HTMLButtonElement | null = null;
let sortButton: HTMLButtonElement | null = null;

function tUI(key: string, fallback: string): string {
  try {
    return win.HG_I18N?.t?.(key, fallback) || fallback;
  } catch {
    return fallback;
  }
}

function tfUI(key: string, fallback: string, vars: Record<string, unknown>): string {
  const template = tUI(key, fallback);
  return template.replace(/\{(\w+)\}/g, (_match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
  );
}

function getControlsContainer(): Element | null {
  return document.querySelector(".nearby-controls") || placeFilterButton?.parentElement || null;
}

function ensureButton(
  id: string,
  className: string,
  controls: Element,
  ariaLabel?: string
): HTMLButtonElement {
  const existing = document.getElementById(id);
  const button = existing instanceof HTMLButtonElement ? existing : document.createElement("button");

  if (!existing) {
    button.id = id;
    button.className = className;
    button.type = "button";
    if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
  }

  return button;
}

function ensureControls(): boolean {
  const existingPlaceFilter = document.getElementById("nearbyFilterBtn");
  if (!(existingPlaceFilter instanceof HTMLButtonElement)) return false;
  placeFilterButton = existingPlaceFilter;

  const controls = getControlsContainer();
  if (!controls) return false;

  badgeFilterButton = ensureButton(
    "nearbyBadgeFilterBtn",
    "nearby-filter-icon nearby-badge-filter-icon",
    controls,
    tUI("ui.badges.badgeFilter", "Badgefilter")
  );

  favoritesFilterButton = ensureButton(
    "nearbyFavoritesFilterBtn",
    "nearby-filter-icon nearby-favorites-filter-icon",
    controls
  );

  sortButton = ensureButton(
    "nearbySortBtn",
    "nearby-filter-icon nearby-sort-icon",
    controls,
    tUI("ui.sort.sortDistance", "Sortering: avstand")
  );

  controls.insertBefore(
    badgeFilterButton,
    sortButton.parentElement === controls ? sortButton : null
  );
  controls.appendChild(favoritesFilterButton);
  controls.appendChild(sortButton);
  return true;
}

function getMode(): ReturnType<LeftPanelModeApi["getActiveMode"]> {
  return win.HGLeftPanelMode?.getActiveMode?.() || "nearby";
}

function updateVisibility(): void {
  win.HGLeftPanelMode?.updateControlVisibility?.();
}

function updateBadgeFilterButton(): void {
  if (!badgeFilterButton) return;

  if (getMode() === "nature") {
    updateVisibility();
    return;
  }

  const filter = win.HGNearbyFilters?.getActiveBadgeFilter?.() || "all";
  const category = win.HGNearbyFilters?.getCategoryById?.(filter) || null;

  if (!category || filter === "all") {
    badgeFilterButton.textContent = "🏅";
    const label = tUI("ui.badges.badgeFilterAll", "Badgefilter: alle");
    badgeFilterButton.title = label;
    badgeFilterButton.setAttribute("aria-label", label);
    updateVisibility();
    return;
  }

  badgeFilterButton.innerHTML = `<img src="bilder/merker/${category.id}.PNG" alt="" loading="lazy" decoding="async" style="width:22px;height:22px;object-fit:contain;display:block;">`;
  const label = tfUI(
    "ui.badges.badgeFilterCategory",
    "Badgefilter: {category}",
    { category: category.name || category.id }
  );
  badgeFilterButton.title = label;
  badgeFilterButton.setAttribute("aria-label", label);
  updateVisibility();
}

function updateFilterButton(): void {
  if (!placeFilterButton) return;

  const mode = getMode();
  if (mode === "nature") {
    const filter = win.HGNearbyFilters?.getNatureFilter?.() || "all";
    placeFilterButton.style.display = "inline-flex";
    placeFilterButton.textContent = NATURE_ICONS[filter] || "🌍";
    placeFilterButton.title = `Natur-filter: ${filter}`;
  } else if (mode === "nearby") {
    const filter = win.HGNearbyFilters?.getPlaceFilter?.() || "unvisited";
    placeFilterButton.style.display = "inline-flex";
    placeFilterButton.textContent = PLACE_ICONS[filter] || "🎯";
    placeFilterButton.title = `Filter: ${filter}`;
  } else {
    placeFilterButton.style.display = "none";
  }

  updateBadgeFilterButton();
  updateVisibility();
}

function updateFavoritesFilterButton(): void {
  if (!favoritesFilterButton) return;

  const active = win.HGNearbyFilters?.getFavoritesOnly?.() || false;
  favoritesFilterButton.classList.toggle("is-active", active);
  favoritesFilterButton.textContent = active ? "★" : "☆";
  const label = active ? "Favorittfilter: på" : "Favorittfilter: av";
  favoritesFilterButton.title = label;
  favoritesFilterButton.setAttribute("aria-label", label);
  favoritesFilterButton.setAttribute("aria-pressed", active ? "true" : "false");
  updateVisibility();
}

function getSortTitle(sort: NearbySort): string {
  if (sort === "oldest") return tUI("ui.sort.sortOldest", "Sortering: Eldst");
  if (sort === "newest") return tUI("ui.sort.sortNewest", "Sortering: Nyest");
  return tUI("ui.sort.sortDistance", "Sortering: Avstand");
}

function updateSortButton(): void {
  if (!sortButton) return;

  updateVisibility();
  if (getMode() !== "nearby") return;

  const activeSort = win.HGNearbyFilters?.getSort?.() || "distance";
  sortButton.textContent = SORT_ICONS[activeSort] || "📍";
  const title = getSortTitle(activeSort);
  sortButton.title = title;
  sortButton.setAttribute("aria-label", title);
}

function badgeTapIsLocked(): boolean {
  const now = Date.now();
  if (now < badgeTapLockedUntil) return true;
  badgeTapLockedUntil = now + 120;
  return false;
}

function bindInteractions(): void {
  placeFilterButton?.addEventListener("click", () => {
    const mode = getMode();
    if (mode === "nature") {
      win.HGNearbyFilters?.cycleNatureFilter?.();
      updateFilterButton();
      win.renderNearbyNature?.();
      return;
    }

    if (mode === "nearby") {
      win.HGNearbyFilters?.cyclePlaceFilter?.();
      updateFilterButton();
      win.HGLeftPanelMode?.rerender?.();
    }
  });

  badgeFilterButton?.addEventListener("click", () => {
    if (badgeTapIsLocked()) return;
    win.HGNearbyFilters?.cycleBadgeFilter?.();
    updateBadgeFilterButton();
    win.HGLeftPanelMode?.rerender?.();
  });

  favoritesFilterButton?.addEventListener("click", () => {
    if (getMode() !== "nearby") return;
    win.HGNearbyFilters?.toggleFavorites?.();
    updateFavoritesFilterButton();
    win.HGLeftPanelMode?.rerender?.();
  });

  sortButton?.addEventListener("click", () => {
    if (getMode() !== "nearby") return;
    win.HGNearbyFilters?.cycleSort?.();
    updateSortButton();
    win.HGLeftPanelMode?.rerender?.();
  });
}

function init(): void {
  if (initialized) return;
  if (!ensureControls()) return;

  initialized = true;
  bindInteractions();
  updateFilterButton();
  updateBadgeFilterButton();
  updateFavoritesFilterButton();
  updateSortButton();
  updateVisibility();
}

const api: NearbyFilterControlsApi = {
  init,
  updateFilterButton,
  updateBadgeFilterButton,
  updateFavoritesFilterButton,
  updateSortButton
};

win.HGNearbyFilterControls = api;
win.updateNearbyFilterButton = updateFilterButton;
win.updateNearbyBadgeFilterButton = updateBadgeFilterButton;
win.updateNearbyFavoritesFilterButton = updateFavoritesFilterButton;
win.updateNearbySortButton = updateSortButton;
