// Canonical controller for the Nearby/Utforsk filter control strip.
// Filter state lives in nearbyFilters.ts; this module owns button creation,
// presentation and interactions while preserving the legacy window update hooks.

import type { NearbyFiltersApi, NearbySort } from "./nearbyFilters";
import type { LeftPanelMode, LeftPanelModeApi } from "./leftPanelMode";

export type NearbyControlsApi = {
  bind: () => void;
  refresh: () => void;
  updateFilterButton: () => void;
  updateBadgeFilterButton: () => void;
  updateFavoritesFilterButton: () => void;
  updateSortButton: () => void;
  badgeFilterTapIsLocked: () => boolean;
};

type I18nRuntime = {
  t?: (key: string, fallback?: string) => string;
};

type RuntimeWindow = Window & typeof globalThis & {
  HGNearbyControls?: NearbyControlsApi;
  HGNearbyFilters?: NearbyFiltersApi;
  HGLeftPanelMode?: LeftPanelModeApi;
  HG_I18N?: I18nRuntime;
  renderNearbyNature?: () => void;
  renderLeftBadges?: () => void;
  updateNearbyFilterButton?: () => void;
  updateNearbyBadgeFilterButton?: () => void;
  updateNearbyFavoritesFilterButton?: () => void;
  updateNearbySortButton?: () => void;
};

const win = window as RuntimeWindow;

const PLACE_ICONS: Record<string, string> = {
  unvisited: "🎯",
  unlocked: "🔓",
  all: "🌍"
};

const NATURE_ICONS: Record<string, string> = {
  all: "🌍",
  unlocked: "🔓",
  flora: "🌿",
  fauna: "🐞"
};

const SORT_ICONS: Record<NearbySort, string> = {
  distance: "📍",
  oldest: "⏳",
  newest: "🕰️"
};

let badgeFilterTapLockedUntil = 0;

function tUI(key: string, fallback = ""): string {
  try {
    return win.HG_I18N?.t?.(key, fallback) || fallback;
  } catch {
    return fallback;
  }
}

function tfUI(key: string, fallback = "", vars: Record<string, unknown> = {}): string {
  const template = tUI(key, fallback);
  return String(template).replace(/\{(\w+)\}/g, (_, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
  );
}

function getActiveMode(): LeftPanelMode {
  return win.HGLeftPanelMode?.getActiveMode?.() || "nearby";
}

function updateControlVisibility(): void {
  win.HGLeftPanelMode?.updateControlVisibility?.();
}

function rerenderActiveMode(): void {
  win.HGLeftPanelMode?.rerender?.();
}

function getControlsContainer(placeFilterButton: HTMLButtonElement | null): HTMLElement | null {
  const controls = document.querySelector<HTMLElement>(".nearby-controls");
  return controls || placeFilterButton?.parentElement || null;
}

function getPlaceFilterButton(): HTMLButtonElement | null {
  const element = document.getElementById("nearbyFilterBtn");
  return element instanceof HTMLButtonElement ? element : null;
}

function ensureBadgeFilterButton(placeFilterButton: HTMLButtonElement | null): HTMLButtonElement | null {
  if (!placeFilterButton) return null;

  const controls = getControlsContainer(placeFilterButton);
  if (!controls) return null;

  const existing = document.getElementById("nearbyBadgeFilterBtn");
  const button = existing instanceof HTMLButtonElement ? existing : document.createElement("button");

  if (!button.id) {
    button.id = "nearbyBadgeFilterBtn";
    button.className = "nearby-filter-icon nearby-badge-filter-icon";
    button.type = "button";
    button.setAttribute("aria-label", tUI("ui.badges.badgeFilter", "Badgefilter"));
  }

  const sortButton = document.getElementById("nearbySortBtn");
  controls.insertBefore(button, sortButton?.parentElement === controls ? sortButton : null);
  return button;
}

function ensureFavoritesFilterButton(placeFilterButton: HTMLButtonElement | null): HTMLButtonElement | null {
  if (!placeFilterButton) return null;

  const controls = getControlsContainer(placeFilterButton);
  if (!controls) return null;

  const existing = document.getElementById("nearbyFavoritesFilterBtn");
  const button = existing instanceof HTMLButtonElement ? existing : document.createElement("button");

  if (!button.id) {
    button.id = "nearbyFavoritesFilterBtn";
    button.className = "nearby-filter-icon nearby-favorites-filter-icon";
    button.type = "button";
  }

  controls.appendChild(button);
  return button;
}

function ensureSortButton(placeFilterButton: HTMLButtonElement | null): HTMLButtonElement | null {
  if (!placeFilterButton) return null;

  const controls = getControlsContainer(placeFilterButton);
  if (!controls) return null;

  const existing = document.getElementById("nearbySortBtn");
  const button = existing instanceof HTMLButtonElement ? existing : document.createElement("button");

  if (!button.id) {
    button.id = "nearbySortBtn";
    button.className = "nearby-filter-icon nearby-sort-icon";
    button.type = "button";
    button.setAttribute("aria-label", tUI("ui.sort.sortDistance", "Sortering: avstand"));
  }

  controls.appendChild(button);
  return button;
}

function badgeFilterTapIsLocked(): boolean {
  const now = Date.now();
  if (now < badgeFilterTapLockedUntil) return true;
  badgeFilterTapLockedUntil = now + 120;
  return false;
}

function updateBadgeFilterButton(): void {
  const button = document.getElementById("nearbyBadgeFilterBtn");
  if (!(button instanceof HTMLButtonElement)) return;

  if (getActiveMode() === "nature") {
    updateControlVisibility();
    return;
  }

  const filter = win.HGNearbyFilters?.getActiveBadgeFilter?.() || "all";
  const category = win.HGNearbyFilters?.getCategoryById?.(filter) || null;

  if (!category || filter === "all") {
    button.textContent = "🏅";
    const label = tUI("ui.badges.badgeFilterAll", "Badgefilter: alle");
    button.title = label;
    button.setAttribute("aria-label", label);
    updateControlVisibility();
    return;
  }

  button.innerHTML = `<img src="bilder/merker/${category.id}.PNG" alt="" loading="lazy" decoding="async" style="width:22px;height:22px;object-fit:contain;display:block;">`;
  const label = tfUI(
    "ui.badges.badgeFilterCategory",
    "Badgefilter: {category}",
    { category: category.name || category.id }
  );
  button.title = label;
  button.setAttribute("aria-label", label);
  updateControlVisibility();
}

function updateFilterButton(): void {
  const button = getPlaceFilterButton();
  if (!button) return;

  const mode = getActiveMode();
  if (mode === "nature") {
    const filter = win.HGNearbyFilters?.getNatureFilter?.() || "all";
    button.style.display = "inline-flex";
    button.textContent = NATURE_ICONS[filter] || "🌍";
    button.title = `Natur-filter: ${filter}`;
  } else if (mode === "nearby") {
    const filter = win.HGNearbyFilters?.getPlaceFilter?.() || "unvisited";
    button.style.display = "inline-flex";
    button.textContent = PLACE_ICONS[filter] || "🎯";
    button.title = `Filter: ${filter}`;
  } else {
    button.style.display = "none";
  }

  updateBadgeFilterButton();
  updateControlVisibility();
}

function updateFavoritesFilterButton(): void {
  const button = document.getElementById("nearbyFavoritesFilterBtn");
  if (!(button instanceof HTMLButtonElement)) return;

  const active = win.HGNearbyFilters?.getFavoritesOnly?.() || false;
  button.classList.toggle("is-active", active);
  button.textContent = active ? "★" : "☆";
  const label = active ? "Favorittfilter: på" : "Favorittfilter: av";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", active ? "true" : "false");
  updateControlVisibility();
}

function getSortTitle(sort: NearbySort): string {
  if (sort === "oldest") return tUI("ui.sort.sortOldest", "Sortering: Eldst");
  if (sort === "newest") return tUI("ui.sort.sortNewest", "Sortering: Nyest");
  return tUI("ui.sort.sortDistance", "Sortering: Avstand");
}

function updateSortButton(): void {
  const button = document.getElementById("nearbySortBtn");
  if (!(button instanceof HTMLButtonElement)) return;

  updateControlVisibility();
  if (getActiveMode() !== "nearby") return;

  const sort = win.HGNearbyFilters?.getSort?.() || "distance";
  button.textContent = SORT_ICONS[sort] || "📍";
  const title = getSortTitle(sort);
  button.title = title;
  button.setAttribute("aria-label", title);
}

function bindButtonOnce(button: HTMLButtonElement | null, key: string, handler: () => void): void {
  if (!button || button.dataset[key] === "1") return;
  button.dataset[key] = "1";
  button.addEventListener("click", handler);
}

function bind(): void {
  const placeFilterButton = getPlaceFilterButton();
  const badgeButton = ensureBadgeFilterButton(placeFilterButton);
  const favoritesButton = ensureFavoritesFilterButton(placeFilterButton);
  const sortButton = ensureSortButton(placeFilterButton);

  bindButtonOnce(placeFilterButton, "hgNearbyFilterBound", () => {
    const mode = getActiveMode();
    if (mode === "nature") {
      win.HGNearbyFilters?.cycleNatureFilter?.();
      updateFilterButton();
      win.renderNearbyNature?.();
      return;
    }

    if (mode === "nearby") {
      win.HGNearbyFilters?.cyclePlaceFilter?.();
      updateFilterButton();
      rerenderActiveMode();
    }
  });

  bindButtonOnce(badgeButton, "hgNearbyBadgeFilterBound", () => {
    if (badgeFilterTapIsLocked()) return;

    win.HGNearbyFilters?.cycleBadgeFilter?.();
    updateBadgeFilterButton();

    if (getActiveMode() === "badges") {
      win.renderLeftBadges?.();
    } else {
      rerenderActiveMode();
    }
  });

  bindButtonOnce(favoritesButton, "hgNearbyFavoritesFilterBound", () => {
    if (getActiveMode() !== "nearby") return;
    win.HGNearbyFilters?.toggleFavorites?.();
    updateFavoritesFilterButton();
    rerenderActiveMode();
  });

  bindButtonOnce(sortButton, "hgNearbySortBound", () => {
    if (getActiveMode() !== "nearby") return;
    win.HGNearbyFilters?.cycleSort?.();
    updateSortButton();
    rerenderActiveMode();
  });

  refresh();
}

function refresh(): void {
  updateFilterButton();
  updateBadgeFilterButton();
  updateFavoritesFilterButton();
  updateSortButton();
  updateControlVisibility();
}

const api: NearbyControlsApi = {
  bind,
  refresh,
  updateFilterButton,
  updateBadgeFilterButton,
  updateFavoritesFilterButton,
  updateSortButton,
  badgeFilterTapIsLocked
};

win.HGNearbyControls = api;
win.updateNearbyFilterButton = updateFilterButton;
win.updateNearbyBadgeFilterButton = updateBadgeFilterButton;
win.updateNearbyFavoritesFilterButton = updateFavoritesFilterButton;
win.updateNearbySortButton = updateSortButton;
