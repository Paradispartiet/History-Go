// Canonical renderer for the collected places grid.
// Nature rendering remains in lists.js during the strangler migration.

import type { Place } from "../../schemas/place";

export type CollectionListApi = {
  render: () => void;
};

type RuntimeWindow = Window & typeof globalThis & {
  PLACES?: Place[];
  visited?: Record<string, unknown>;
  openPlaceCard?: (place: Place) => unknown;
  HGCollectionList?: CollectionListApi;
  renderCollection?: () => void;
};

const win = window as RuntimeWindow;

function render(): void {
  const grid = document.getElementById("collectionGrid");
  if (!grid) return;

  const places = Array.isArray(win.PLACES) ? win.PLACES : [];
  const visited = win.visited || {};

  grid.innerHTML = "";

  for (const place of places.filter((entry) => visited[entry.id])) {
    const image = place.cardImage || place.image || "";
    const item = document.createElement("div");
    item.className = "collection-item";

    item.innerHTML = `
      <img src="${image}" alt="${place.name || ""}">
      <div>${place.name || ""}</div>
    `;

    item.addEventListener("click", () => {
      if (typeof win.openPlaceCard === "function") {
        win.openPlaceCard(place);
      }
    });

    grid.appendChild(item);
  }
}

const api: CollectionListApi = { render };
win.HGCollectionList = api;
win.renderCollection = render;
