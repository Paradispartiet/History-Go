// Canonical DOM renderer for the Nearby people list.
// Place rendering lives in nearbyPlacesList.ts; Nature and Collection remain in
// lists.js during the strangler migration.

import type { Place } from "../../schemas/place";
import type { NearbyFiltersApi } from "./nearbyFilters";

export type NearbyPerson = {
  id: string;
  name?: string;
  category?: string;
  placeId?: string;
  places?: string[];
  cardImage?: string;
  image?: string;
  [key: string]: unknown;
};

export type NearbyPeopleListApi = {
  render: () => void;
};

type RelationEntry = {
  person?: string;
};

type I18nRuntime = {
  t?: (key: string, fallback?: string) => string;
};

type RuntimeWindow = Window & typeof globalThis & {
  PEOPLE?: NearbyPerson[];
  PLACES?: Place[];
  visited?: Record<string, unknown>;
  REL_BY_PLACE?: Record<string, RelationEntry[]>;
  getPos?: () => unknown;
  distMeters?: (from: unknown, to: unknown) => number;
  HGNearbyFilters?: NearbyFiltersApi;
  HG_I18N?: I18nRuntime;
  showPersonPopup?: (person: NearbyPerson) => unknown;
  openPersonCard?: (person: NearbyPerson) => unknown;
  HGNearbyPeopleList?: NearbyPeopleListApi;
  renderNearbyPeople?: () => void;
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

function getActiveBadgeFilter(): string {
  return win.HGNearbyFilters?.getActiveBadgeFilter?.() || "all";
}

function isBadgeFilterActive(): boolean {
  return win.HGNearbyFilters?.isBadgeFilterActive?.() || false;
}

function categoryNameForBadgeFilter(): string {
  const id = getActiveBadgeFilter();
  const category = win.HGNearbyFilters?.getCategoryById?.(id);
  return String(category?.name || id);
}

function renderBadgeFilterEmpty(listEl: HTMLElement): void {
  const label = categoryNameForBadgeFilter();
  const noun = tUI("ui.noun.people", "personer");
  listEl.innerHTML = `
    <div class="hg-empty-guide">
      <div class="hg-empty-guide-icon">🏅</div>
      <div class="hg-empty-guide-title">${tUI("ui.empty.noMatches", "Ingen treff")}</div>
      <div class="hg-empty-guide-text">${escapeHTML(tfUI("ui.filter.noMatchesForBadge", "Ingen {noun} passer med badgefilteret {label}. Trykk badgeknappen for å velge et annet badge eller alle.", { noun, label }))}</div>
    </div>
  `;
}

function personPlaceIds(person: NearbyPerson): Set<string> {
  const ids = new Set<string>();
  if (person.placeId) ids.add(String(person.placeId).trim());
  for (const placeId of person.places || []) {
    const id = String(placeId || "").trim();
    if (id) ids.add(id);
  }
  return ids;
}

function personMatchesActiveBadge(person: NearbyPerson, placesById: Map<string, Place>): boolean {
  if (!isBadgeFilterActive()) return true;

  const activeBadge = getActiveBadgeFilter();
  if (String(person.category || "").trim() === activeBadge) return true;

  for (const placeId of personPlaceIds(person)) {
    const place = placesById.get(placeId);
    if (place && String(place.category || "").trim() === activeBadge) return true;
  }

  return false;
}

function distanceForPerson(person: NearbyPerson, placesById: Map<string, Place>, position: unknown): number {
  const distMeters = win.distMeters;
  const placeIds = personPlaceIds(person);
  if (!placeIds.size || !position || typeof distMeters !== "function") return Infinity;

  let min = Infinity;
  for (const placeId of placeIds) {
    const place = placesById.get(placeId);
    if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) continue;

    const distance = distMeters(position, { lat: place.lat, lon: place.lon });
    if (Number.isFinite(distance) && distance < min) min = distance;
  }

  return min;
}

function openPerson(person: NearbyPerson): void {
  if (typeof win.showPersonPopup === "function") {
    win.showPersonPopup(person);
  } else if (typeof win.openPersonCard === "function") {
    win.openPersonCard(person);
  }
}

function render(): void {
  const listEl = document.getElementById("leftPeopleList");
  if (!listEl) return;

  const people = Array.isArray(win.PEOPLE) ? win.PEOPLE : [];
  const places = Array.isArray(win.PLACES) ? win.PLACES : [];
  const visited = win.visited || {};
  const relations = win.REL_BY_PLACE || {};

  listEl.innerHTML = "";

  if (!people.length) {
    listEl.innerHTML = `
      <div class="hg-empty-guide">
        <div class="hg-empty-guide-icon">👤</div>
        <div class="hg-empty-guide-title">${tUI("ui.people.loading", "Folk lastes inn")}</div>
        <div class="hg-empty-guide-text">${tUI("ui.people.loadingText", "Personene som hører til Oslo lastes nå.")}</div>
      </div>
    `;
    return;
  }

  const visitedRelatedIds = new Set<string>();
  for (const placeId of Object.keys(visited).filter((id) => visited[id])) {
    for (const relation of relations[placeId] || []) {
      if (relation.person) visitedRelatedIds.add(relation.person);
    }
  }

  const position = win.getPos?.();
  const placesById = new Map(places.map((place) => [String(place.id || "").trim(), place]));

  let decorated = people.map((person) => ({
    person,
    isVisited: visitedRelatedIds.has(person.id),
    dist: distanceForPerson(person, placesById, position)
  }));

  if (isBadgeFilterActive()) {
    decorated = decorated.filter(({ person }) => personMatchesActiveBadge(person, placesById));
  }

  if (!decorated.length) {
    renderBadgeFilterEmpty(listEl);
    return;
  }

  decorated.sort((a, b) => {
    if (a.isVisited !== b.isVisited) return a.isVisited ? -1 : 1;
    if (a.dist !== b.dist) return a.dist - b.dist;
    return String(a.person.name || "").localeCompare(String(b.person.name || ""), "nb");
  });

  for (const { person, isVisited, dist } of decorated) {
    const image = person.cardImage || person.image || "";
    const distText = Number.isFinite(dist) ? `${Math.round(dist)} m` : "";

    const item = document.createElement("div");
    item.className = `nearby-item${isVisited ? " is-visited" : ""}`;
    item.dataset.personId = String(person.id || "").trim();

    const thumb = image
      ? `<img class="nearby-thumb" src="${image}" alt="${person.name || ""}"
              onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'nearby-thumb nearby-thumb-icon',textContent:'👤'}))">`
      : `<div class="nearby-thumb nearby-thumb-icon">👤</div>`;

    item.innerHTML = `
      <div class="nearby-thumbWrap">${thumb}</div>
      <div class="nearby-content">
        <div class="nearby-title">${person.name || ""}</div>
        ${distText || isVisited ? `<div class="nearby-meta">${distText}${isVisited ? " · ✔" : ""}</div>` : ""}
      </div>
    `;

    item.addEventListener("click", () => openPerson(person));
    listEl.appendChild(item);
  }
}

const api: NearbyPeopleListApi = { render };
win.HGNearbyPeopleList = api;
win.renderNearbyPeople = render;
