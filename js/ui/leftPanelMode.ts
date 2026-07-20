// Canonical mode/render controller for the left Nearby panel.
// The legacy left-panel shell still owns filter button setup and event binding;
// this module owns mode selection, list visibility and render scheduling.

import type { NearbyFiltersApi } from "./nearbyFilters";

export type LeftPanelMode = "nearby" | "people" | "nature" | "routes" | "badges";

export type LeftPanelModeApi = {
  getActiveMode: () => LeftPanelMode;
  setMode: (mode: unknown) => LeftPanelMode;
  renderNow: () => void;
  rerender: () => void;
  updateControlVisibility: () => void;
};

type ResizeApi = {
  resize?: () => void;
};

type RuntimeWindow = Window & typeof globalThis & {
  HGLeftPanelMode?: LeftPanelModeApi;
  HGNearbyFilters?: Pick<NearbyFiltersApi, "setActiveBadgeFilter">;
  renderNearbyPlaces?: () => void;
  renderNearbyPeople?: () => void;
  renderNearbyNature?: () => void;
  renderLeftRoutesList?: () => void;
  renderLeftBadges?: () => void;
  updateNearbyFilterButton?: () => void;
  updateNearbyBadgeFilterButton?: () => void;
  updateNearbySortButton?: () => void;
  HGMap?: ResizeApi;
  MAP?: ResizeApi;
};

const win = window as RuntimeWindow;

const LIST_IDS_BY_MODE: Record<LeftPanelMode, string> = {
  nearby: "nearbyList",
  people: "leftPeopleList",
  nature: "leftNatureList",
  routes: "leftRoutesList",
  badges: "leftBadgesList"
};

const MODES = new Set<LeftPanelMode>(Object.keys(LIST_IDS_BY_MODE) as LeftPanelMode[]);

let renderRaf = 0;
let renderTimer = 0;

function normalizeMode(mode: unknown): LeftPanelMode {
  const normalized = String(mode ?? "").trim() as LeftPanelMode;
  return MODES.has(normalized) ? normalized : "nearby";
}

function getActiveMode(): LeftPanelMode {
  const activeMode = document
    .querySelector(".nearby-tab.is-active")
    ?.getAttribute("data-leftmode");
  return normalizeMode(activeMode);
}

function updateControlVisibility(): void {
  const mode = getActiveMode();
  const placeFilterButton = document.getElementById("nearbyFilterBtn");
  const badgeButton = document.getElementById("nearbyBadgeFilterBtn");
  const sortButton = document.getElementById("nearbySortBtn");
  const favoritesButton = document.getElementById("nearbyFavoritesFilterBtn");

  if (placeFilterButton) {
    placeFilterButton.style.display = mode === "nearby" || mode === "nature" ? "inline-flex" : "none";
  }
  if (badgeButton) {
    badgeButton.style.display = mode === "nature" ? "none" : "inline-flex";
  }
  if (sortButton) {
    sortButton.style.display = mode === "nearby" ? "inline-flex" : "none";
  }
  if (favoritesButton) {
    favoritesButton.style.display = mode === "nearby" ? "inline-flex" : "none";
  }
}

function renderNow(): void {
  const mode = getActiveMode();

  if (mode === "nearby") win.renderNearbyPlaces?.();
  if (mode === "people") win.renderNearbyPeople?.();
  if (mode === "nature") win.renderNearbyNature?.();
  if (mode === "routes") win.renderLeftRoutesList?.();
  if (mode === "badges") win.renderLeftBadges?.();
}

function rerender(): void {
  // Badge/filter controls can be tapped rapidly on iPad/Safari. Coalesce repeated
  // requests into one render instead of rebuilding the active list per tap.
  if (typeof win.requestAnimationFrame === "function") {
    if (renderRaf) win.cancelAnimationFrame(renderRaf);
    renderRaf = win.requestAnimationFrame(() => {
      renderRaf = 0;
      renderNow();
    });
    return;
  }

  if (renderTimer) win.clearTimeout(renderTimer);
  renderTimer = win.setTimeout(() => {
    renderTimer = 0;
    renderNow();
  }, 0);
}

function setMode(input: unknown): LeftPanelMode {
  const mode = normalizeMode(input);

  for (const [candidateMode, id] of Object.entries(LIST_IDS_BY_MODE) as Array<[LeftPanelMode, string]>) {
    const list = document.getElementById(id);
    if (list) list.hidden = candidateMode !== mode;
  }

  if (mode === "nature") {
    win.HGNearbyFilters?.setActiveBadgeFilter?.("all");
  }

  try {
    localStorage.setItem("hg_leftpanel_mode_v1", mode);
  } catch {}

  document.querySelectorAll(".nearby-tab").forEach(button => {
    const active = button.getAttribute("data-leftmode") === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });

  win.updateNearbyFilterButton?.();
  win.updateNearbyBadgeFilterButton?.();
  win.updateNearbySortButton?.();

  updateControlVisibility();
  rerender();

  win.HGMap?.resize?.();
  win.MAP?.resize?.();

  return mode;
}

win.HGLeftPanelMode = {
  getActiveMode,
  setMode,
  renderNow,
  rerender,
  updateControlVisibility
};
