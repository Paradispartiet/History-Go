type CategoryMeta = {
  id: string;
  name?: string;
  icon?: string;
  color?: string;
  aliases?: string[];
};

type MapPlace = {
  category?: unknown;
  [key: string]: unknown;
};

type PositionSnapshot = {
  lat?: unknown;
  lon?: unknown;
};

type MapInstance = {
  flyTo: (options: {
    center: [number, number];
    zoom: number;
    pitch: number;
    speed: number;
    essential: boolean;
  }) => unknown;
  getZoom?: () => number;
  getPitch?: () => number;
};

type MapApi = {
  setPlaces?: (places: MapPlace[]) => unknown;
  getMap?: () => MapInstance | null;
  __hgCategoryFilterPatched?: boolean;
};

type MapCategoryFilterApi = {
  get: () => string;
  set: (categoryId: string) => void;
  showAll: () => void;
  refresh: () => void;
};

type RuntimeWindow = Window & typeof globalThis & {
  CATEGORY_LIST?: CategoryMeta[];
  PLACES?: MapPlace[];
  HGMap?: MapApi;
  HGPos?: { request?: () => Promise<unknown> | unknown };
  getPos?: () => PositionSnapshot | null;
  showToast?: (message: string, duration?: number) => unknown;
  LayerManager?: { setMode?: (mode: "explore" | "map") => unknown };
  exitMapMode?: () => unknown;
  HGMapCategoryFilter?: MapCategoryFilterApi;
};

const win = window as RuntimeWindow;
const FILTER_KEY = "hg_map_category_filter_v1";
const ALL = "all";

let activeCategory = readSavedCategory();
let sourcePlaces: MapPlace[] = [];
let originalSetPlaces: ((places: MapPlace[]) => unknown) | null = null;

function readSavedCategory(): string {
  try {
    return localStorage.getItem(FILTER_KEY) || ALL;
  } catch {
    return ALL;
  }
}

function categories(): CategoryMeta[] {
  return Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
}

function normalizeCategory(value: unknown): string {
  const id = String(value || ALL).trim() || ALL;
  if (id === ALL) return ALL;
  return categories().some((category) => String(category.id || "") === id) ? id : ALL;
}

function placeCategory(place: MapPlace): string {
  const raw = String(place?.category || "").trim();
  const match = categories().find((category) =>
    String(category.id || "") === raw ||
    (Array.isArray(category.aliases) && category.aliases.some((alias) => String(alias) === raw))
  );
  return String(match?.id || raw);
}

function filteredPlaces(places: MapPlace[]): MapPlace[] {
  const list = Array.isArray(places) ? places : [];
  activeCategory = normalizeCategory(activeCategory);
  return activeCategory === ALL
    ? list
    : list.filter((place) => placeCategory(place) === activeCategory);
}

function createCategoryFilter(): HTMLDivElement {
  const filter = document.createElement("div");
  filter.className = "hg-map-category-filter";
  filter.innerHTML = `
    <button class="hg-map-category-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="hgMapCategoryOptions">
      <span class="hg-map-category-trigger-icon" aria-hidden="true">🌍</span>
      <span class="hg-map-category-trigger-label">Alle prikker</span>
      <span class="hg-map-category-trigger-caret" aria-hidden="true">⌄</span>
    </button>
    <div id="hgMapCategoryOptions" class="hg-map-category-options" role="menu" aria-label="Filtrer kartprikker etter kategori" hidden></div>`;
  return filter;
}

function createIconButton(
  id: string,
  className: string,
  label: string,
  title: string,
  iconMarkup: string
): HTMLButtonElement {
  const button = document.createElement("button");
  button.id = id;
  button.className = className;
  button.type = "button";
  button.title = title;
  button.setAttribute("aria-label", label);
  button.innerHTML = iconMarkup;
  return button;
}

function createUtilityRow(): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "hg-map-utility-row";

  const center = createIconButton(
    "btnCenter",
    "hg-map-utility-btn hg-map-center-btn",
    "Sentrer kartet på posisjonen din",
    "Sentrer",
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="5.2"></circle><path d="M12 2.6v3M12 18.4v3M2.6 12h3M18.4 12h3"></path></svg>`
  );

  const exit = createIconButton(
    "btnExitMap",
    "hg-map-utility-btn hg-map-exit-btn",
    "Lukk kartmodus",
    "Lukk kartmodus",
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"></path></svg>`
  );

  row.append(center, exit);
  return row;
}

function ensureControls(): HTMLElement | null {
  if (!document.getElementById("mapLayer")) return null;

  let controls = document.querySelector<HTMLElement>(".map-controls");
  if (!controls) {
    controls = document.createElement("div");
    controls.className = "map-controls";
    controls.setAttribute("aria-label", "Kartkontroller");
    document.body.appendChild(controls);
  }

  if (!controls.querySelector(".hg-map-category-filter")) {
    controls.appendChild(createCategoryFilter());
  }

  if (!controls.querySelector(".hg-map-utility-row")) {
    controls.appendChild(createUtilityRow());
  }

  return controls;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function categoryMeta(categoryId: string): CategoryMeta {
  if (categoryId === ALL) {
    return { id: ALL, name: "Alle prikker", icon: "🌍", color: "#60758a" };
  }

  return categories().find((category) => String(category.id || "") === categoryId) || {
    id: categoryId,
    name: categoryId,
    icon: "•",
    color: "#60758a"
  };
}

function renderCategoryUi(): void {
  if (!categories().length) return;

  activeCategory = normalizeCategory(activeCategory);
  const trigger = document.querySelector<HTMLButtonElement>(".hg-map-category-trigger");
  const icon = trigger?.querySelector<HTMLElement>(".hg-map-category-trigger-icon");
  const label = trigger?.querySelector<HTMLElement>(".hg-map-category-trigger-label");
  const options = document.getElementById("hgMapCategoryOptions");
  if (!trigger || !icon || !label || !options) return;

  const active = categoryMeta(activeCategory);
  icon.textContent = active.icon || "•";
  label.textContent = active.name || active.id;
  trigger.title = activeCategory === ALL
    ? "Viser alle kategorier"
    : `Viser bare ${active.name || active.id}`;

  options.innerHTML = [categoryMeta(ALL), ...categories()].map((category) => {
    const id = String(category.id || ALL);
    const selected = id === activeCategory;
    return `<button class="hg-map-category-option${selected ? " is-active" : ""}" type="button" role="menuitemradio" aria-checked="${selected}" data-map-category="${escapeHtml(id)}" style="--hg-cat-color:${escapeHtml(category.color || "#60758a")}"><span class="hg-map-category-option-icon" aria-hidden="true">${escapeHtml(category.icon || "•")}</span><span class="hg-map-category-option-label">${escapeHtml(category.name || id)}</span><span class="hg-map-category-option-check" aria-hidden="true">✓</span></button>`;
  }).join("");
}

function installFilterHook(): boolean {
  const api = win.HGMap;
  if (!api || typeof api.setPlaces !== "function") return false;
  if (api.__hgCategoryFilterPatched) return true;

  originalSetPlaces = api.setPlaces.bind(api);
  api.setPlaces = (places: MapPlace[]) => {
    sourcePlaces = Array.isArray(places) ? places : [];
    return originalSetPlaces?.(filteredPlaces(sourcePlaces));
  };
  api.__hgCategoryFilterPatched = true;

  if (Array.isArray(win.PLACES) && win.PLACES.length) {
    sourcePlaces = win.PLACES;
    originalSetPlaces(filteredPlaces(sourcePlaces));
  }

  return true;
}

function applyFilter(categoryId: string): void {
  activeCategory = normalizeCategory(categoryId);
  try {
    localStorage.setItem(FILTER_KEY, activeCategory);
  } catch {
    // Storage is optional; the in-memory filter still works.
  }

  if (!sourcePlaces.length && Array.isArray(win.PLACES)) {
    sourcePlaces = win.PLACES;
  }

  originalSetPlaces?.(filteredPlaces(sourcePlaces));
  renderCategoryUi();
  win.dispatchEvent(new CustomEvent("hg:map-category-filter", {
    detail: { category: activeCategory }
  }));
}

function closeMenu(): void {
  const trigger = document.querySelector<HTMLButtonElement>(".hg-map-category-trigger");
  const options = document.getElementById("hgMapCategoryOptions");
  if (!trigger || !options) return;
  trigger.setAttribute("aria-expanded", "false");
  options.hidden = true;
}

async function centerMap(): Promise<void> {
  const button = document.getElementById("btnCenter") as HTMLButtonElement | null;
  if (button) button.disabled = true;

  try {
    let pos = win.getPos?.() || null;
    const hasCoordinates = () =>
      Number.isFinite(Number(pos?.lat)) && Number.isFinite(Number(pos?.lon));

    if (!hasCoordinates() && win.HGPos?.request) {
      try {
        await win.HGPos.request();
      } catch {
        // Position feedback is handled below if no usable position is available.
      }
      pos = win.getPos?.() || null;
    }

    const lat = Number(pos?.lat);
    const lon = Number(pos?.lon);
    const map = win.HGMap?.getMap?.() || null;
    if (!map || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      win.showToast?.("Fant ikke posisjonen din");
      return;
    }

    map.flyTo({
      center: [lon, lat],
      zoom: Math.max(Number(map.getZoom?.()) || 13, 15),
      pitch: Math.max(Number(map.getPitch?.()) || 0, 35),
      speed: 1.2,
      essential: true
    });
  } finally {
    if (button) button.disabled = false;
  }
}

function bindUi(): void {
  const trigger = document.querySelector<HTMLButtonElement>(".hg-map-category-trigger");
  const options = document.getElementById("hgMapCategoryOptions");
  const center = document.getElementById("btnCenter") as HTMLButtonElement | null;
  const exit = document.getElementById("btnExitMap") as HTMLButtonElement | null;

  if (trigger && trigger.dataset.hgBound !== "1") {
    trigger.dataset.hgBound = "1";
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = trigger.getAttribute("aria-expanded") !== "true";
      trigger.setAttribute("aria-expanded", String(open));
      if (options) options.hidden = !open;
      if (open) renderCategoryUi();
    });
  }

  if (options && options.dataset.hgBound !== "1") {
    options.dataset.hgBound = "1";
    options.addEventListener("click", (event) => {
      const target = event.target;
      const option = target instanceof Element
        ? target.closest<HTMLElement>("[data-map-category]")
        : null;
      if (!option) return;
      applyFilter(option.dataset.mapCategory || ALL);
      closeMenu();
    });
  }

  if (center && center.dataset.hgBound !== "1") {
    center.dataset.hgBound = "1";
    center.addEventListener("click", () => {
      void centerMap();
    });
  }

  if (exit && exit.dataset.hgRuntimeBound !== "1") {
    exit.dataset.hgRuntimeBound = "1";
    exit.addEventListener("click", () => {
      win.LayerManager?.setMode?.("explore");
      win.exitMapMode?.();
    });
  }
}

function refresh(): void {
  ensureControls();
  bindUi();
  installFilterHook();
  renderCategoryUi();
}

function init(): void {
  refresh();

  let attempts = 0;
  const timer = window.setInterval(() => {
    refresh();
    attempts += 1;
    if ((win.HGMap?.__hgCategoryFilterPatched && categories().length) || attempts > 80) {
      window.clearInterval(timer);
    }
  }, 150);

  win.addEventListener("hg:appReady", refresh);
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest(".hg-map-category-filter")) {
      closeMenu();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

win.HGMapCategoryFilter = {
  get: () => activeCategory,
  set: applyFilter,
  showAll: () => applyFilter(ALL),
  refresh
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

export {};
