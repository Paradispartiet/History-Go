// ==============================
// GLOBALT SØK
// ==============================
// Canonical TypeScript-runtime for det globale søket.
// Lastes dynamisk etter boot(), slik at window.PLACES/window.PEOPLE finnes.

import type { CategoryDefinition } from "../core/categories";
import type { Place } from "../../schemas/place";

type SearchableItem = {
  id?: string | number;
  name?: string;
  title?: string;
  desc?: string;
  popupDesc?: string;
  type?: string;
  category?: string;
  year?: string | number;
  tags?: unknown[];
  emne_ids?: unknown[];
};

type SearchPerson = SearchableItem & {
  id: string | number;
  name?: string;
  cat?: string;
  categoryId?: string;
};

type SearchPlace = Place & SearchableItem;

type SearchResults = {
  people: SearchPerson[];
  places: SearchPlace[];
  categories: CategoryDefinition[];
};

type PositionSnapshot = {
  lat: number;
  lon: number;
};

type RuntimeI18n = {
  t?: (key: string, fallback?: string) => string;
  localizePlaces?: (places: SearchPlace[]) => SearchPlace[];
};

type RuntimeWindow = Window & typeof globalThis & {
  HG_I18N?: RuntimeI18n;
  CATEGORY_LIST?: CategoryDefinition[];
  PEOPLE?: SearchPerson[];
  PLACES?: SearchPlace[];
  distMeters?: (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => number;
  getPos?: () => PositionSnapshot | null;
  HGHeaderMenu?: { close?: () => void };
  flyToPlace?: (place: SearchPlace) => unknown;
  showPersonPopup?: (person: SearchPerson) => unknown;
  globalSearch?: (query: unknown) => SearchResults;
  renderSearchResults?: (results: SearchResults, query?: string) => void;
  bindGlobalSearch?: () => void;
};

type ScoredRow<T> = {
  item: T;
  score: number;
  distance?: number;
};

const win = window as RuntimeWindow;
const MAX_PER_SECTION = 24;

function tUI(key: string, fallback = ""): string {
  try {
    return win.HG_I18N?.t?.(key, fallback) || fallback;
  } catch {
    return fallback;
  }
}

function tfUI(key: string, fallback = "", vars: Record<string, unknown> = {}): string {
  const template = tUI(key, fallback);
  return String(template).replace(/\{(\w+)\}/g, (_match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
  );
}

function norm(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function html(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getCategory(catId: unknown): CategoryDefinition | null {
  return (win.CATEGORY_LIST || []).find(category => category.id === String(catId ?? "")) || null;
}

function searchableText(item: SearchableItem | null | undefined, extra: unknown[] = []): string {
  return norm([
    item?.name,
    item?.title,
    item?.desc,
    item?.popupDesc,
    item?.type,
    item?.category,
    item?.year,
    ...(Array.isArray(item?.tags) ? item.tags : []),
    ...(Array.isArray(item?.emne_ids) ? item.emne_ids : []),
    ...extra
  ].filter(Boolean).join(" "));
}

function scoreItem(item: SearchableItem, query: string, extra: unknown[] = []): number {
  const name = norm(item?.name || item?.title || "");
  const haystack = searchableText(item, extra);

  if (!haystack.includes(query)) return -1;
  if (name === query) return 100;
  if (name.startsWith(query)) return 80;
  if (name.includes(query)) return 60;
  return 30;
}

function distance(aLat: unknown, aLon: unknown, bLat: unknown, bLon: unknown): number {
  const lat1 = Number(aLat);
  const lon1 = Number(aLon);
  const lat2 = Number(bLat);
  const lon2 = Number(bLon);

  if (typeof win.distMeters === "function") {
    const measured = win.distMeters({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 });
    return Number.isFinite(measured) ? measured : Infinity;
  }

  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return Infinity;

  const earthRadius = 6371e3;
  const toRad = (degrees: number): number => degrees * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const la1 = toRad(lat1);
  const la2 = toRad(lat2);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) *
    Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function globalSearch(query: unknown): SearchResults {
  const normalizedQuery = norm(query);
  if (!normalizedQuery) return { people: [], places: [], categories: [] };

  const people = (win.PEOPLE || [])
    .map((person): ScoredRow<SearchPerson> => {
      const category = getCategory(person.category || person.cat || person.categoryId);
      return {
        item: person,
        score: scoreItem(person, normalizedQuery, [category?.name])
      };
    })
    .filter(row => row.score >= 0)
    .sort((a, b) => b.score - a.score || String(a.item.name || "").localeCompare(String(b.item.name || ""), "nb"))
    .slice(0, MAX_PER_SECTION)
    .map(row => row.item);

  const rawPlaces = win.PLACES || [];
  const localizedPlaces = typeof win.HG_I18N?.localizePlaces === "function"
    ? win.HG_I18N.localizePlaces(rawPlaces)
    : rawPlaces;

  let placeMatches: Array<ScoredRow<SearchPlace> & { distance: number }> = localizedPlaces
    .filter(place => !place.hidden)
    .map(place => {
      const category = getCategory(place.category);
      return {
        item: place,
        score: scoreItem(place, normalizedQuery, [category?.name]),
        distance: Infinity
      };
    })
    .filter(row => row.score >= 0);

  const position = typeof win.getPos === "function" ? win.getPos() : null;
  if (position) {
    placeMatches = placeMatches.map(row => ({
      ...row,
      distance: distance(position.lat, position.lon, row.item.lat, row.item.lon)
    }));
  }

  const places = placeMatches
    .sort((a, b) => b.score - a.score || a.distance - b.distance || String(a.item.name || "").localeCompare(String(b.item.name || ""), "nb"))
    .slice(0, MAX_PER_SECTION)
    .map(row => row.item);

  const categories = (win.CATEGORY_LIST || [])
    .map((category): ScoredRow<CategoryDefinition> => ({
      item: category,
      score: scoreItem(category, normalizedQuery, [category.id])
    }))
    .filter(row => row.score >= 0)
    .sort((a, b) => b.score - a.score || String(a.item.name || "").localeCompare(String(b.item.name || ""), "nb"))
    .map(row => row.item);

  return { people, places, categories };
}

function badge(catId: unknown): string {
  if (!catId) return "";
  return `<img class="sr-badge" src="bilder/merker/${html(catId)}.PNG" alt="">`;
}

function showSearchBox(show: boolean): void {
  const box = document.getElementById("searchResults");
  if (!box) return;
  box.classList.toggle("is-open", show);
  box.style.display = show ? "block" : "none";
}

function renderSearchResults({ people, places, categories }: SearchResults, query = ""): void {
  const box = document.getElementById("searchResults");
  if (!box) return;

  if (!people.length && !places.length && !categories.length) {
    box.innerHTML = `
      <div class="search-section">
        <div class="search-empty">${html(tfUI("ui.search.noResultsFor", "Ingen treff på «{query}»", { query }))}</div>
      </div>
    `;
    showSearchBox(query.trim().length > 1);
    return;
  }

  showSearchBox(true);

  const section = (title: string, rows: string[]): string => rows.length ? `
    <div class="search-section">
      <h3>${html(title)}</h3>
      ${rows.join("")}
    </div>
  ` : "";

  const placeRows = places.map(place => `
    <div class="search-item" role="button" tabindex="0" data-type="place" data-place="${html(place.id)}">
      ${badge(place.category)}
      <div class="title">${html(place.name)}</div>
      <div class="meta">${html(getCategory(place.category)?.name || place.category || tUI("ui.search.placeFallback", "Sted"))}${place.year ? ` · ${html(place.year)}` : ""}</div>
    </div>
  `);

  const peopleRows = people.map(person => `
    <div class="search-item" role="button" tabindex="0" data-type="person" data-person="${html(person.id)}">
      ${badge(person.category)}
      <div class="title">${html(person.name)}</div>
      <div class="meta">${html(getCategory(person.category)?.name || person.category || tUI("ui.search.personFallback", "Person"))}${person.year ? ` · ${html(person.year)}` : ""}</div>
    </div>
  `);

  const categoryRows = categories.map(category => `
    <div class="search-item" role="button" tabindex="0" data-type="category" data-category="${html(category.id)}">
      ${badge(category.id)}
      <div class="title">${html(category.name)}</div>
      <div class="meta">${html(tUI("ui.search.category", "Kategori"))}</div>
    </div>
  `);

  box.innerHTML = `
    ${section(tUI("ui.search.places", "Steder"), placeRows)}
    ${section(tUI("ui.search.people", "Personer"), peopleRows)}
    ${section(tUI("ui.search.categories", "Kategorier"), categoryRows)}
  `;
}

function clearSearch({ blur = false }: { blur?: boolean } = {}): void {
  const input = document.getElementById("globalSearch") as HTMLInputElement | null;
  if (input) {
    input.value = "";
    if (blur) input.blur();
  }
  showSearchBox(false);
}

function openPlaceFromSearch(place: SearchPlace | undefined): void {
  if (!place) return;
  const input = document.getElementById("globalSearch") as HTMLInputElement | null;
  input?.blur();
  showSearchBox(false);
  win.HGHeaderMenu?.close?.();
  win.flyToPlace?.(place);
}

function activateSearchItem(item: HTMLElement): void {
  const placeId = item.dataset.place;
  const personId = item.dataset.person;
  const categoryId = item.dataset.category;

  if (placeId) {
    const place = (win.PLACES || []).find(candidate => String(candidate.id) === String(placeId));
    openPlaceFromSearch(place);
    return;
  }

  if (personId) {
    const person = (win.PEOPLE || []).find(candidate => String(candidate.id) === String(personId));
    const input = document.getElementById("globalSearch") as HTMLInputElement | null;
    input?.blur();
    showSearchBox(false);
    if (person) win.showPersonPopup?.(person);
    return;
  }

  if (categoryId) {
    const input = document.getElementById("globalSearch") as HTMLInputElement | null;
    if (input) input.value = categoryId;
    const places = (win.PLACES || []).filter(place => place.category === categoryId && !place.hidden);
    renderSearchResults({ people: [], places, categories: [] }, categoryId);
  }
}

function closestSearchItem(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const item = target.closest(".search-item");
  return item instanceof HTMLElement ? item : null;
}

function bindGlobalSearch(): void {
  const input = document.getElementById("globalSearch") as HTMLInputElement | null;
  const box = document.getElementById("searchResults");
  if (!input || !box || input.dataset.hgSearchBound === "1") return;

  input.dataset.hgSearchBound = "1";

  input.addEventListener("input", event => {
    const value = event.currentTarget instanceof HTMLInputElement ? event.currentTarget.value : "";
    if (value.trim().length < 2) {
      showSearchBox(false);
      return;
    }
    renderSearchResults(globalSearch(value), value);
  });

  input.addEventListener("focus", event => {
    const value = event.currentTarget instanceof HTMLInputElement ? event.currentTarget.value : "";
    if (value.trim().length >= 2) {
      renderSearchResults(globalSearch(value), value);
    }
  });

  box.addEventListener("click", event => {
    const item = closestSearchItem(event.target);
    if (item) activateSearchItem(item);
  });

  box.addEventListener("keydown", event => {
    if (!(event instanceof KeyboardEvent) || (event.key !== "Enter" && event.key !== " ")) return;
    const item = closestSearchItem(event.target);
    if (!item) return;
    event.preventDefault();
    activateSearchItem(item);
  });

  document.addEventListener("click", event => {
    const clickTarget = event.target;
    if (!(clickTarget instanceof Node)) return;
    if (!box.contains(clickTarget) && !input.contains(clickTarget)) {
      showSearchBox(false);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") clearSearch({ blur: true });
  });
}

bindGlobalSearch();

win.globalSearch = globalSearch;
win.renderSearchResults = renderSearchResults;
win.bindGlobalSearch = bindGlobalSearch;
