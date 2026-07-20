interface Window {
  maplibregl?: MapLibreGlobal;
  HG_MAPTILER_KEY?: string;
  MAPTILER_KEY?: string;
  HG_NATURTRO_STYLE_URL?: string;
  HG_NATURTRO_STYLE_ID?: string;
  HGCoordinateTrust?: {
    getCoordinateTrust(place: unknown): string;
  };
}

// Legacy map runtime uses one bounded expando on its resize container. Keeping
// that contract explicit is safer than falling back to an untyped cast in map.ts.
interface HTMLElement {
  __hgResizeBound?: boolean;
}

// Event delegation in the legacy runtime receives a generic Element from
// closest(). In this UI all matching targets are HTML/SVG elements with dataset.
interface Element {
  readonly dataset: DOMStringMap;
}

interface MapLibreGlobal {
  Map: new (options: Record<string, unknown>) => MapLibreMapRuntime;
  NavigationControl: new (options?: Record<string, unknown>) => unknown;
  Marker: new (options?: Record<string, unknown>) => MapLibreMarkerRuntime;
}

interface MapLibreMapRuntime {
  addControl(control: unknown, position?: string): unknown;
  on(event: string, handler: (...args: any[]) => void): unknown;
  on(event: string, layer: string, handler: (...args: any[]) => void): unknown;
  once(event: string, handler: (...args: any[]) => void): unknown;
  resize(): void;
  isStyleLoaded(): boolean;
  setStyle(style: string): unknown;
  getSource(id: string): any;
  getLayer(id: string): any;
  addSource(id: string, source: Record<string, unknown>): unknown;
  addLayer(layer: Record<string, unknown>): unknown;
  removeLayer(id: string): unknown;
  removeSource(id: string): unknown;
  moveLayer(id: string): unknown;
  setPaintProperty(layer: string, property: string, value: unknown): unknown;
  setLayoutProperty(layer: string, property: string, value: unknown): unknown;
  queryRenderedFeatures(point: unknown, options?: Record<string, unknown>): any[];
  getCanvas(): HTMLCanvasElement;
  flyTo(options: Record<string, unknown>): unknown;
  getZoom(): number;
  getPitch(): number;
}

interface MapLibreMarkerRuntime {
  setLngLat(coordinates: [number, number]): MapLibreMarkerRuntime;
  addTo(map: MapLibreMapRuntime): MapLibreMarkerRuntime;
  remove(): void;
  getElement?(): HTMLElement;
}

declare const maplibregl: MapLibreGlobal;
