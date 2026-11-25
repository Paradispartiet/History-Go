// Fysen catalog records are external map features, not canonical History Go Places.
type MapFeature = {
  type?: string;
  geometry: { type: string; coordinates: [number, number] };
  properties: { slug?: string; name?: string; address?: string; cluster?: boolean; point_count?: number };
};
type MapCatalog = { type: "FeatureCollection"; features: MapFeature[] };
type MapEvent = { point?: unknown };
type FysenMap = {
  getStyle: () => unknown;
  getLayer: (id: string) => unknown;
  getSource: (id: string) => unknown;
  addSource: (id: string, source: Record<string, unknown>) => unknown;
  addLayer: (layer: Record<string, unknown>) => unknown;
  removeLayer: (id: string) => unknown;
  removeSource: (id: string) => unknown;
  on: (event: string, handler: (event: MapEvent) => void) => unknown;
  off: (event: string, handler: (event: MapEvent) => void) => unknown;
  queryRenderedFeatures: (point: unknown, options: { layers: string[] }) => MapFeature[];
  easeTo: (options: { center: [number, number]; zoom: number }) => unknown;
  getZoom: () => number;
};
type FysenPopup = {
  remove: () => unknown;
  setLngLat: (coords: [number, number]) => FysenPopup;
  setDOMContent: (node: HTMLElement) => FysenPopup;
  addTo: (map: FysenMap) => FysenPopup;
};
type FysenWindow = Window & {
  HGMap?: { getMap?: () => FysenMap | null };
  showToast?: (message: string) => unknown;
  maplibregl?: { Popup: new (options: { closeButton: boolean; maxWidth: string }) => FysenPopup };
  HGFysenMap?: { isEnabled: () => boolean; setEnabled: (value: boolean) => Promise<boolean>; decorateOptions: typeof decorateOptions; parseCatalog: typeof parseCatalog };
};
const win = window as unknown as FysenWindow;

const DATA_URL = "https://raw.githubusercontent.com/Paradispartiet/fysen/fysen-public-restaurant-map/restaurants.json";
const APP_URL = "https://fysen.vercel.app/";
const SOURCE = "hg-fysen-restaurants";
const CLUSTERS = "hg-fysen-clusters";
const COUNTS = "hg-fysen-cluster-count";
const POINTS = "hg-fysen-points";
const LABELS = "hg-fysen-labels";
const layers = [LABELS, POINTS, COUNTS, CLUSTERS];
let enabled = false;
let loading = false;
let generation = 0;
let request: AbortController | null = null;
let catalog: MapCatalog | null = null;
let boundMap: FysenMap | null = null;
let popup: FysenPopup | null = null;

function validText(value: unknown, limit: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= limit;
}
function parseCatalog(raw: unknown): MapCatalog {
  if (!raw || typeof raw !== "object") throw new Error("Invalid Fysen catalog");
  const data = raw as Record<string, unknown>;
  if (data?.schemaVersion !== 1 || data.source !== "fysen-catalog" || data.city !== "Oslo" ||
      typeof data.sourceCommit !== "string" || !/^[a-f0-9]{40}$/.test(data.sourceCommit) ||
      typeof data.catalogCount !== "number" || !Number.isSafeInteger(data.catalogCount) || data.catalogCount < 1 || data.catalogCount > 10000 ||
      !Array.isArray(data.restaurants) || !data.restaurants.length ||
      data.restaurants.length > data.catalogCount) throw new Error("Invalid Fysen catalog");
  const seen = new Set<string>();
  const features = data.restaurants.map((rawRow: unknown): MapFeature => {
    if (!rawRow || typeof rawRow !== "object") throw new Error("Invalid Fysen restaurant");
    const row = rawRow as Record<string, unknown>;
    if (!validText(row?.slug, 160) || !/^[a-z0-9][a-z0-9-]*$/.test(row.slug) ||
        seen.has(row.slug) || !validText(row.name, 240) || !validText(row.address, 500) ||
        typeof row.latitude !== "number" || !Number.isFinite(row.latitude) || row.latitude < 59.7 || row.latitude > 60.2 ||
        typeof row.longitude !== "number" || !Number.isFinite(row.longitude) || row.longitude < 10.4 || row.longitude > 11.1) {
      throw new Error("Invalid Fysen restaurant");
    }
    seen.add(row.slug);
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [row.longitude, row.latitude] },
      properties: { slug: row.slug, name: row.name, address: row.address }
    };
  });
  return { type: "FeatureCollection", features };
}
function notify() {
  win.dispatchEvent(new CustomEvent("hg:fysen-map-change"));
}
function toast(message: string) { win.showToast?.(message); }
function removePopup() { popup?.remove(); popup = null; }
function clearLayers(map: FysenMap | null) {
  if (!map) return;
  for (const id of layers) if (map.getLayer(id)) map.removeLayer(id);
  if (map.getSource(SOURCE)) map.removeSource(SOURCE);
}
function syncLayers() {
  const map = boundMap;
  if (!map || !enabled || !catalog || !map.getStyle?.()) return;
  try {
    if (!map.getSource(SOURCE)) {
      map.addSource(SOURCE, { type: "geojson", data: catalog, cluster: true, clusterRadius: 48, clusterMaxZoom: 14 });
    }
    if (!map.getLayer(CLUSTERS)) map.addLayer({
      id: CLUSTERS, type: "circle", source: SOURCE, filter: ["has", "point_count"],
      paint: { "circle-color": "#277447", "circle-radius": ["step", ["get", "point_count"], 17, 25, 21, 100, 25], "circle-stroke-color": "#fff", "circle-stroke-width": 2 }
    });
    if (!map.getLayer(COUNTS)) map.addLayer({
      id: COUNTS, type: "symbol", source: SOURCE, filter: ["has", "point_count"],
      layout: { "text-field": ["to-string", ["get", "point_count"]], "text-size": 12 },
      paint: { "text-color": "#fff", "text-halo-color": "#225e3b", "text-halo-width": 1 }
    });
    if (!map.getLayer(POINTS)) map.addLayer({
      id: POINTS, type: "circle", source: SOURCE, filter: ["!", ["has", "point_count"]],
      paint: { "circle-color": "#3e985d", "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 16, 10], "circle-stroke-color": "#fff", "circle-stroke-width": 2 }
    });
    if (!map.getLayer(LABELS)) map.addLayer({
      id: LABELS, type: "symbol", source: SOURCE, minzoom: 15, filter: ["!", ["has", "point_count"]],
      layout: { "text-field": ["get", "name"], "text-size": 12, "text-anchor": "top", "text-offset": [0, 1.15], "text-max-width": 12 },
      paint: { "text-color": "#173825", "text-halo-color": "#fff", "text-halo-width": 1.5 }
    });
  } catch (error) {
    // The next style.load/idle restores layers if a basemap is still loading.
    console.warn("[HGFysenMap] map layers not ready", error);
  }
}
function openRestaurant(feature: MapFeature) {
  const properties = feature.properties;
  if (!properties || !win.maplibregl?.Popup) return;
  removePopup();
  const card = document.createElement("div");
  card.className = "hg-fysen-map-popup";
  const heading = document.createElement("strong");
  heading.textContent = properties.name;
  const address = document.createElement("p");
  address.textContent = properties.address;
  const note = document.createElement("small");
  note.textContent = "Registrert i Fysen. Åpningstid og dagens meny er ikke bekreftet.";
  const link = document.createElement("a");
  link.href = APP_URL;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Åpne Fysen ↗";
  card.append(heading, address, note, link);
  popup = new win.maplibregl.Popup({ closeButton: true, maxWidth: "270px" })
    .setLngLat(feature.geometry.coordinates).setDOMContent(card).addTo(boundMap);
}
function handleClick(event: MapEvent) {
  if (!enabled || !boundMap) return;
  const activeLayers = [POINTS, CLUSTERS].filter(id => boundMap.getLayer(id));
  if (!activeLayers.length) return;
  const feature = boundMap.queryRenderedFeatures(event.point, { layers: activeLayers })[0];
  if (!feature) return;
  if (feature.properties?.cluster) {
    removePopup();
    boundMap.easeTo({ center: feature.geometry.coordinates, zoom: Math.min(18, boundMap.getZoom() + 2) });
  } else openRestaurant(feature);
}
function bindMap(map: FysenMap) {
  if (boundMap === map) return;
  if (boundMap) {
    removePopup();
    clearLayers(boundMap);
    boundMap.off("style.load", syncLayers);
    boundMap.off("idle", syncLayers);
    boundMap.off("click", handleClick);
  }
  boundMap = map;
  map.on("style.load", syncLayers);
  map.on("idle", syncLayers);
  map.on("click", handleClick);
}
async function setEnabled(value: boolean): Promise<boolean> {
  if (!value) {
    if (!enabled && !loading) return false;
    generation += 1;
    request?.abort();
    request = null;
    enabled = false;
    loading = false;
    removePopup();
    clearLayers(boundMap);
    notify();
    return false;
  }
  if (enabled || loading) return enabled;
  const map = win.HGMap?.getMap?.();
  if (!map) { toast("Kartet er ikke tilgjengelig ennå."); return false; }
  const ticket = ++generation;
  loading = true;
  notify();
  try {
    if (!catalog) {
      request = new AbortController();
      const response = await fetch(DATA_URL, {
        method: "GET", credentials: "omit", referrerPolicy: "no-referrer",
        mode: "cors", redirect: "error", signal: request.signal
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const parsed = parseCatalog(await response.json());
      if (ticket !== generation) return false;
      catalog = parsed;
    }
    if (ticket !== generation) return false;
    bindMap(map);
    enabled = true;
    loading = false;
    request = null;
    syncLayers();
    notify();
    toast(catalog.features.length + " restauranter fra Fysen");
    return true;
  } catch (error) {
    if (ticket !== generation) return false;
    enabled = false;
    loading = false;
    request = null;
    console.warn("[HGFysenMap] catalog unavailable", error);
    notify();
    toast("Fysen-kartet er ikke tilgjengelig akkurat nå.");
    return false;
  }
}
function foodLogo() {
  const img = document.createElement("img");
  img.className = "hg-map-category-logo";
  img.src = "bilder/merker/fysen-mat.svg";
  img.alt = "";
  return img;
}
function decorateOptions(options: HTMLElement, trigger: HTMLButtonElement, logos: HTMLElement, label: HTMLElement) {
  const button = document.createElement("button");
  button.className = "hg-map-category-option hg-fysen-map-option" + (enabled ? " is-active" : "");
  button.type = "button";
  button.setAttribute("role", "menuitemcheckbox");
  button.setAttribute("aria-checked", String(enabled));
  button.setAttribute("aria-label", loading ? "Mat · Fysen, laster" : "Mat · Fysen");
  button.title = "Mat · Fysen";
  button.disabled = loading;
  const logoBox = document.createElement("span");
  logoBox.className = "hg-map-category-option-logos";
  logoBox.append(foodLogo());
  const text = document.createElement("span");
  text.className = "hg-map-category-option-label hg-fysen-map-option-label";
  text.textContent = loading ? "Laster…" : "Mat · Fysen";
  const check = document.createElement("span");
  check.className = "hg-map-category-option-check";
  check.textContent = "✓";
  check.setAttribute("aria-hidden", "true");
  button.append(logoBox, text, check);
  button.addEventListener("click", event => {
    event.stopPropagation();
    void setEnabled(!enabled);
  });
  options.prepend(button);
  if (enabled) {
    for (const item of options.querySelectorAll("[data-map-category]")) {
      item.classList.remove("is-active");
      item.setAttribute("aria-checked", "false");
    }
    logos.replaceChildren(foodLogo());
    label.textContent = "Mat · Fysen";
    trigger.title = "Viser restauranter fra Fysen";
    trigger.setAttribute("aria-label", "Filter aktivt: Mat · Fysen");
  }
}
win.HGFysenMap = Object.freeze({
  isEnabled: () => enabled, setEnabled, decorateOptions, parseCatalog
});

export {};
