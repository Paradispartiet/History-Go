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
  setSearch: (query: string) => number;
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
  HGPlaceOpen?: { preload?: (place: NearbyListPlace) => Promise<unknown> };
  visited?: Record<string, unknown>;
  renderNearbyPlaces?: () => void;
};

const win = window as RuntimeWindow;
const PAGE_SIZE = 48;
let search = "";
let page = 0;
let resultCount = 0;

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
): HTMLButtonElement {
  const image = place.image || place.cardImage || place.popupImage || "";
  const item = document.createElement("button");
  item.type = "button";
  item.className = "nearby-item";

  if (selection.freshPlaceId && String(place.id || "").trim() === selection.freshPlaceId) {
    item.classList.add("is-fresh-discovery");
  }

  const parts = buildMetaParts(place, selection, visited);
  item.innerHTML = `
    <span class="nearby-thumbWrap${image ? "" : " hg-image-missing"}">
      ${image ? `<img class="nearby-thumb" src="${escapeHTML(image)}" alt="" loading="lazy" decoding="async">` : ""}
      <img class="nearby-badge"
           src="bilder/merker/${escapeHTML(place.category)}.PNG"
           loading="lazy" decoding="async"
           alt="">
    </span>
    <span class="nearby-content">
      <span class="nearby-title">${escapeHTML(place.name)}</span>
      <span class="nearby-meta">${escapeHTML(parts.join(" · "))}</span>
    </span>
  `;

  item.addEventListener("click", () => {
    void win.HGPlaceOpen?.preload?.(place);
    routeToPlace(place.id);
  });
  return item;
}

function matchesSearch(place: NearbyListPlace, selection: NearbyPlaceSelection, visited: Record<string, unknown>): boolean {
  const text = [place.name, ...buildMetaParts(place, selection, visited)].join(" ");
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("nb").includes(search);
}

function render(): void {
  const listEl = document.getElementById("nearbyList");
  const pager = document.getElementById("nearbyPlacePager");
  const previous = document.querySelector<HTMLButtonElement>("#nearbyPlacePager [data-page-step='-1']");
  const next = document.querySelector<HTMLButtonElement>("#nearbyPlacePager [data-page-step='1']");
  if (!listEl) return;

  const selection = win.HGNearbyPlaceSelector?.select?.();
  if (!selection) return;

  const { filterMode, sortMode, badgeFilter, favoritesOnly } = selection;
  const filterSignature = JSON.stringify([filterMode, sortMode, badgeFilter, favoritesOnly]);
  if (listEl.dataset.filterSignature !== filterSignature) {
    page = 0;
    listEl.scrollTop = 0;
    listEl.dataset.filterSignature = filterSignature;
  }

  const visited = win.visited || {};
  const matches = search
    ? selection.items.filter((place) => matchesSearch(place, selection, visited))
    : selection.items;
  resultCount = matches.length;
  const lastPage = Math.max(0, Math.ceil(resultCount / PAGE_SIZE) - 1);
  page = Math.min(page, lastPage);
  const items = matches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  if (pager) pager.hidden = listEl.hidden || lastPage === 0;
  if (previous) previous.disabled = page === 0;
  if (next) next.disabled = page === lastPage;

  const renderSignature = JSON.stringify([
    search, page, resultCount, createRenderSignature({ ...selection, items }),
    items.map((place) => Boolean(visited[place.id]))
  ]);
  if (listEl.dataset.renderSignature === renderSignature) return;
  listEl.dataset.renderSignature = renderSignature;

  if (!items.length) {
    if (search) {
      listEl.innerHTML = '<div class="hg-empty-guide">Ingen treff – prøv et annet søk.</div>';
    } else if (selection.favoritesOnly) {
      renderFavoritesEmpty(listEl);
    } else {
      renderBadgeFilterEmpty(listEl, selection.badgeFilter);
    }
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const place of items) fragment.appendChild(createPlaceItem(place, selection, visited));
  listEl.replaceChildren(fragment);
}

function setSearch(query: string): number {
  if (query === search) {
    const list = document.getElementById("nearbyList");
    const pager = document.getElementById("nearbyPlacePager");
    if (list && pager) pager.hidden = list.hidden || resultCount <= PAGE_SIZE;
    return resultCount;
  }

  search = query;
  page = 0;
  render();
  const list = document.getElementById("nearbyList");
  if (list) list.scrollTop = 0;
  return resultCount;
}

document.querySelectorAll<HTMLButtonElement>("#nearbyPlacePager [data-page-step]").forEach((button) => {
  button.addEventListener("click", () => {
    page += Number(button.dataset.pageStep);
    render();
    const list = document.getElementById("nearbyList");
    if (list) list.scrollTop = 0;
  });
});

const api: NearbyPlacesListApi = { render, setSearch };
win.HGNearbyPlacesList = api;
win.renderNearbyPlaces = render;
