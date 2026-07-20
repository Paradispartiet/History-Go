// Canonical DOM renderer for the Nearby places list.
// Selection/filtering/sorting lives in nearbyPlaceSelector.ts. People, Nature and
// Collection rendering remain in lists.js during the strangler migration.

import type {
  NearbyListPlace,
  NearbyPlaceSelection,
  NearbyPlaceSelectorApi
} from "./nearbyPlaceSelector";
import type { NearbyFiltersApi } from "./nearbyFilters";

export type NearbyPlacesListApi = {
  render: () => void;
};

type I18nRuntime = {
  t?: (key: string, fallback?: string) => string;
};

type RouterRuntime = {
  navigate?: (hash: string) => unknown;
};

type RuntimeWindow = Window & typeof globalThis & {
  HGNearbyPlacesList?: NearbyPlacesListApi;
  HGNearbyPlaceSelector?: NearbyPlaceSelectorApi;
  HGNearbyFilters?: NearbyFiltersApi;
  HG_I18N?: I18nRuntime;
  HGAppRouter?: RouterRuntime;
  visited?: Record<string, unknown>;
  renderNearbyPlaces?: () => void;
};

const win = window as RuntimeWindow;

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

function escapeHTML(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function routeToPlace(placeId: unknown): void {
  const id = String(placeId || "").trim();
  if (!id) return;

  const next = `#/place/${encodeURIComponent(id)}`;
  if (typeof win.HGAppRouter?.navigate === "function") {
    win.HGAppRouter.navigate(next);
  } else if (window.location.hash !== next) {
    window.location.hash = next;
  }
}

function categoryNameForBadgeFilter(badgeFilter: string): string {
  const category = win.HGNearbyFilters?.getCategoryById?.(badgeFilter);
  return String(category?.name || badgeFilter);
}

function renderBadgeFilterEmpty(listEl: HTMLElement, badgeFilter: string): void {
  const label = categoryNameForBadgeFilter(badgeFilter);
  const noun = tUI("ui.noun.places", "steder");

  listEl.innerHTML = `
    <div class="hg-empty-guide">
      <div class="hg-empty-guide-icon">🏅</div>
      <div class="hg-empty-guide-title">${tUI("ui.empty.noMatches", "Ingen treff")}</div>
      <div class="hg-empty-guide-text">${escapeHTML(tfUI("ui.filter.noMatchesForBadge", "Ingen {noun} passer med badgefilteret {label}. Trykk badgeknappen for å velge et annet badge eller alle.", { noun, label }))}</div>
    </div>
  `;
}

function renderFavoritesEmpty(listEl: HTMLElement): void {
  listEl.innerHTML = `
    <div class="hg-empty-guide">
      <div class="hg-empty-guide-icon">☆</div>
      <div class="hg-empty-guide-title">Ingen favoritter ennå</div>
      <div class="hg-empty-guide-text">Slå av favorittfilteret, eller åpne et sted og bruk stjernen i stedskortet for å lagre det som favoritt.</div>
    </div>
  `;
}

function createRenderSignature(selection: NearbyPlaceSelection): string {
  const { items, filterMode, sortMode, badgeFilter, favoritesOnly, freshPlaceId } = selection;
  return JSON.stringify({
    ids: items.map((place) => String(place.id || "").trim()),
    filterMode,
    sortMode,
    badge: badgeFilter,
    favoritesOnly,
    freshPlaceId,
    distances: items.map((place) => place._d ?? null)
  });
}

function buildMetaParts(
  place: NearbyListPlace,
  selection: NearbyPlaceSelection,
  visited: Record<string, unknown>
): string[] {
  const parts: string[] = [];

  if (selection.sortMode === "distance") {
    if (place._d != null) parts.push(`${place._d} m`);
  } else {
    if (place._timeLabel) {
      parts.push(place._epokeLabel
        ? `${place._timeLabel} · ${place._epokeLabel}`
        : place._timeLabel
      );
    }
    if (place._d != null) parts.push(`${place._d} m`);
  }

  if (visited[place.id]) parts.push("✔");
  if (selection.freshPlaceId && String(place.id || "").trim() === selection.freshPlaceId) {
    parts.push("Ny");
  }

  return parts;
}

function createPlaceItem(
  place: NearbyListPlace,
  selection: NearbyPlaceSelection,
  visited: Record<string, unknown>
): HTMLDivElement {
  const image = place.image || place.cardImage || "";
  const item = document.createElement("div");
  item.className = "nearby-item";

  if (selection.freshPlaceId && String(place.id || "").trim() === selection.freshPlaceId) {
    item.classList.add("is-fresh-discovery");
  }

  const parts = buildMetaParts(place, selection, visited);
  item.innerHTML = `
    <div class="nearby-thumbWrap">
      <img class="nearby-thumb" src="${escapeHTML(image)}" alt="${escapeHTML(place.name || "")}" loading="lazy" decoding="async">
      <img class="nearby-badge"
           src="bilder/merker/${escapeHTML(place.category || "")}.PNG"
           alt="">
    </div>

    <div class="nearby-content">
      <div class="nearby-title">${escapeHTML(place.name || "")}</div>
      <div class="nearby-meta">
        ${escapeHTML(parts.join(" · "))}
      </div>
    </div>
  `;

  item.addEventListener("click", () => routeToPlace(place.id));
  return item;
}

function render(): void {
  const listEl = document.getElementById("nearbyList");
  if (!listEl) return;

  const selection = win.HGNearbyPlaceSelector?.select?.();
  if (!selection) {
    console.warn("[Nearby] HGNearbyPlaceSelector is not available");
    return;
  }

  const renderSignature = createRenderSignature(selection);
  if (listEl.dataset.renderSignature === renderSignature) return;
  listEl.dataset.renderSignature = renderSignature;
  listEl.innerHTML = "";

  if (!selection.items.length) {
    if (selection.favoritesOnly) {
      renderFavoritesEmpty(listEl);
    } else {
      renderBadgeFilterEmpty(listEl, selection.badgeFilter);
    }
    return;
  }

  const visited = win.visited || {};
  for (const place of selection.items) {
    listEl.appendChild(createPlaceItem(place, selection, visited));
  }
}

const api: NearbyPlacesListApi = { render };
win.HGNearbyPlacesList = api;
win.renderNearbyPlaces = render;
