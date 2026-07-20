import type { Place } from "./place";
import type {
  GroundhopperStats,
  MeritsByCategory,
  VisitedPlaces
} from "./storage";

type DataHubFetchOptions = {
  cache?: RequestCache;
  bust?: boolean;
  [key: string]: unknown;
};

type DataHubEnrichedAllResult = {
  enrichedPlaces: Place[];
  enrichedPeople: unknown[];
  enrichedPlacesById: Map<string, Place>;
  enrichedPeopleById: Map<string, unknown>;
};

type DataHubLesesporResult = {
  items: unknown[];
  byPlace?: Record<string, unknown[]>;
  manifest?: unknown;
};

type DataHubApi = {
  fetchJSON?: <T = unknown>(url: string, opts?: DataHubFetchOptions) => Promise<T>;
  clearCache?: (prefix?: string) => void;

  loadTags?: (opts?: DataHubFetchOptions) => Promise<unknown>;
  loadPlacesBase?: (opts?: DataHubFetchOptions) => Promise<Place[]>;
  loadPeopleBase?: (opts?: DataHubFetchOptions) => Promise<unknown[]>;
  loadPlaces?: (opts?: DataHubFetchOptions) => Promise<Place[]>;
  loadPeople?: (opts?: DataHubFetchOptions) => Promise<unknown[]>;
  loadBadges?: (opts?: DataHubFetchOptions) => Promise<unknown[]>;
  loadRoutes?: (opts?: DataHubFetchOptions) => Promise<unknown[]>;
  loadHistoricalRoutes?: (opts?: DataHubFetchOptions) => Promise<unknown[]>;
  loadFullPlace?: (placeId: string | number | null | undefined, opts?: DataHubFetchOptions) => Promise<Place | null>;

  loadPlaceOverlays?: (subjectId: string | null | undefined, opts?: DataHubFetchOptions) => Promise<unknown[]>;
  loadPeopleOverlays?: (subjectId: string | null | undefined, opts?: DataHubFetchOptions) => Promise<unknown[]>;
  getPlaceEnriched?: (placeId: string, subjectId?: string, opts?: DataHubFetchOptions) => Promise<Place | null>;
  getPersonEnriched?: (personId: string, subjectId?: string, opts?: DataHubFetchOptions) => Promise<unknown | null>;
  loadEnrichedAll?: (subjectId?: string, opts?: DataHubFetchOptions) => Promise<DataHubEnrichedAllResult>;

  loadFagManifest?: (opts?: DataHubFetchOptions) => Promise<unknown>;
  loadFagFile?: (subjectId: string, fileType: string, opts?: DataHubFetchOptions) => Promise<unknown | null>;
  loadPensum?: (subjectId: string, opts?: DataHubFetchOptions) => Promise<unknown | null>;
  loadMethods?: (subjectId: string, opts?: DataHubFetchOptions) => Promise<unknown | null>;
  loadSubjectFagkart?: (subjectId: string, opts?: DataHubFetchOptions) => Promise<unknown | null>;
  loadSupersetQuizMal?: (subjectId: string, opts?: DataHubFetchOptions) => Promise<unknown | null>;
  loadEmner?: (themeId: string, opts?: DataHubFetchOptions) => Promise<unknown[]>;
  loadFagkart?: (opts?: DataHubFetchOptions) => Promise<unknown | null>;
  loadFagkartMap?: (opts?: DataHubFetchOptions) => Promise<unknown | null>;

  loadQuizCategory?: (categoryId: string, opts?: DataHubFetchOptions) => Promise<unknown[]>;
  loadNature?: () => Promise<void>;
  loadNatureGroup?: (groupPath: string) => Promise<unknown[]>;
  loadLesespor?: (opts?: DataHubFetchOptions) => Promise<DataHubLesesporResult>;
  normalizeTags?: (rawTags: unknown, tagsRegistry: unknown) => unknown[];

  mergeDeep?: (base: unknown, extra: unknown) => unknown;
  indexBy?: (arr: unknown[], key: string) => Map<unknown, unknown>;

  APP_BASE_PATH?: string;
  DEFAULTS?: {
    DATA_BASE?: string;
    EMNER_BASE?: string;
    [key: string]: unknown;
  };

  [key: string]: unknown;
};

// MapLibre is loaded from a pinned CDN script in index.html rather than as an
// npm dependency. Keep a small, explicit structural contract for the browser
// surface History Go actually uses instead of treating the whole map runtime as
// untyped global state.
type MapLibreEvent = {
  features?: MapLibreFeature[];
  point?: MapLibrePoint;
  originalEvent?: any;
  preventDefault?: () => void;
  [key: string]: unknown;
};

type MapLibrePoint = { x: number; y: number };

type MapLibreFeature = {
  layer?: { id?: string };
  properties?: Record<string, any>;
  [key: string]: unknown;
};

type MapLibreGeoJSONSource = {
  setData: (data: unknown) => void;
};

type MapLibreMap = {
  __hgPlaceHandlers?: any;
  addControl: (control: unknown, position?: string) => MapLibreMap;
  on: {
    (event: string, handler: (event: MapLibreEvent) => void): MapLibreMap;
    (event: string, layerId: string, handler: (event: MapLibreEvent) => void): MapLibreMap;
  };
  once: {
    (event: string, handler: () => void): MapLibreMap;
    (event: string, layerId: string, handler: (event: MapLibreEvent) => void): MapLibreMap;
  };
  off: {
    (event: string, handler: (...args: any[]) => void): MapLibreMap;
    (event: string, layerId: string, handler: (...args: any[]) => void): MapLibreMap;
  };
  resize: () => void;
  isStyleLoaded: () => boolean;
  setStyle: (style: string) => void;
  getSource: (id: string) => MapLibreGeoJSONSource | undefined;
  getLayer: (id: string) => unknown;
  removeLayer: (id: string) => void;
  removeSource: (id: string) => void;
  addSource: (id: string, source: unknown) => void;
  addLayer: (layer: unknown) => void;
  moveLayer: (id: string) => void;
  setPaintProperty: (layerId: string, property: string, value: unknown) => void;
  getStyle: () => { layers?: any[] };
  getCanvas: () => HTMLCanvasElement;
  queryRenderedFeatures: (geometry?: unknown, options?: { layers?: string[] }) => MapLibreFeature[];
  flyTo: (options: Record<string, unknown>) => void;
  getZoom: () => number;
  getPitch: () => number;
};

type MapLibreMarker = {
  setLngLat: (lngLat: [number, number]) => MapLibreMarker;
  addTo: (map: MapLibreMap) => MapLibreMarker;
};

type MapLibreRuntime = {
  Map: new (options: Record<string, unknown>) => MapLibreMap;
  NavigationControl: new (options?: Record<string, unknown>) => unknown;
  Marker: new (options?: Record<string, unknown>) => MapLibreMarker;
};

declare global {
  const maplibregl: MapLibreRuntime;

  interface Window {
    PLACES?: Place[];
    visited: VisitedPlaces;
    merits?: MeritsByCategory;
    DataHub?: DataHubApi;
    maplibregl?: MapLibreRuntime;
    HG_MAPTILER_KEY?: string;
    MAPTILER_KEY?: string;
    HG_NATURTRO_STYLE_URL?: string;
    HG_NATURTRO_STYLE_ID?: string;
    HG_I18N?: {
      localizePlaces?: (places: any[]) => any[];
    };
    HGCoordinateTrust?: {
      getCoordinateTrust: (place: unknown) => "verified" | "review" | "unknown" | "invalid";
    };
    HGMap?: {
      initMap?: (options?: {
        containerId?: string;
        start?: unknown;
      }) => unknown;
      getMap?: () => MapLibreMap | null;
      resize?: () => void;
      setDataReady?: (ready?: unknown) => void;
      setPlaces?: (places: Place[]) => void;
      setVisited?: (visited: VisitedPlaces) => void;
      setCatColor?: (resolver: (categoryId: unknown) => string) => void;
      setOnPlaceClick?: (handler: (placeId: string) => void) => void;
      setUser?: (lat: unknown, lon: unknown, options?: { fly?: boolean }) => void;
      getCoordinateTrust?: (place: unknown) => "verified" | "review" | "unknown" | "invalid";
      maybeDrawMarkers?: () => void;
      refreshMarkers?: () => void;
      [key: string]: unknown;
    };
    renderNearbyPlaces?: () => void;
    renderNearbyMusic?: () => void;
    HG_MUSIC_BY_PLACE?: Record<string, unknown>;
    HGAha?: any;
    HG_PUBLIC_PROFILE?: any;
    HGKnowledgeMatch?: any;
    buildKnowledgeFingerprint?: any;
    getKnowledgeMatches?: any;
    sendMeetInvite?: any;
    // Publisert av js/knowledge.ts (migrert TS, lastet som dist/web/knowledge.js).
    // Tidligere ga window.X = ... i knowledge.js disse typene implisitt; nå som
    // fila er ute av base-.js-programmet må de deklareres for at konsumenter
    // (js/quizzes.js, js/emneDekning.js, m.fl.) skal typecheck-e.
    saveKnowledgeFromQuiz?: (...args: any[]) => any;
    saveKnowledgePoint?: (...args: any[]) => any;
    getKnowledgeUniverse?: (...args: any[]) => any;
    renderKnowledgeSection?: (...args: any[]) => any;
    computeEmneDekning?: (...args: any[]) => any;
    computeEmneDekningV2?: (...args: any[]) => any;
    getLearningLog?: (...args: any[]) => any;
    getUserConceptsFromLearningLog?: (...args: any[]) => any;
    getUserEmneHitsFromLearningLog?: (...args: any[]) => any;
    HGCourseUI?: any;
    // Publisert av js/trivia.ts (migrert TS, lastet som dist/web/trivia.js).
    getTriviaUniverse?: (...args: any[]) => any;
    saveTriviaPoint?: (...args: any[]) => any;
    HGAhaMusic?: {
      FILES: Record<string, string>;
      state: {
        loaded: boolean;
        musicByPlace: Record<string, any>;
        candidates: { artists: any[]; tracks: any[] };
        report: unknown;
      };
      load: (options?: { force?: boolean }) => Promise<unknown>;
      getForPlace: (placeId: unknown) => any;
      buildIndex: (artists: unknown, tracks: unknown) => unknown;
      normalizeArtistUnlock?: (artist: unknown) => any;
      normalizeTrackUnlock?: (track: unknown) => any;
      getUnlockableObjectsForPlace?: (placeId: unknown) => { artists: any[]; tracks: any[] };
      unlockMusicObject?: (musicObject: any) => { ok: boolean; changed?: boolean; object?: any; reason?: string };
      isMusicObjectUnlocked?: (id: unknown) => boolean;
      getUnlockedMusicObjects?: () => any[];
      getMusicUnlockSummary?: () => { total: number; artists: number; tracks: number; places: number };
    };
    saveVisitedFromQuiz?: (placeId: string | number | null | undefined) => void;
    saveMerits?: () => void;
    savePeopleCollected?: (personId: string | number | null | undefined) => void;
    HG_getGroundhopperStats?: () => GroundhopperStats;
    HG_updateGroundhopperFromPlace?: (place: Place | null | undefined) => void;
    HG_isGroundhopperPlace?: (place: Place | null | undefined) => boolean;
    TEST_MODE?: boolean;
    HG_OPEN_MODE?: boolean;
    OPEN_MODE?: boolean;

    // Verifiserte History GO runtime-globaler (deklarasjon-only, ingen runtime-endring).
    // Satt i js/boot-fast.js, js/core/domainRuntime.js, js/ui/place-card-quizcards-patch.js,
    // js/visualDesignCodes.js. Flagg leses/settes som boolske vakter.
    initQuizEngine?: (...args: unknown[]) => unknown;
    __HG_QUIZ_ENGINE_APP_API_BOUND__?: boolean;
    __HG_PLACE_CARD_QUIZCARDS_PATCHED__?: boolean;
    HGDomainRuntime?: Record<string, (...args: unknown[]) => unknown>;
    HGVisualDesignCodes?: any;
  }

  // js/knowledge.js er migrert til TS og lastes nå som dist/web-bundle, så den
  // ligger ikke lenger i base-.js-programmet. js/aha.js refererer
  // getKnowledgeUniverse ved bart navn (typeof-guard), så den trenger en
  // ambient global-deklarasjon for at `npm run typecheck` skal forbli grønn.
  function getKnowledgeUniverse(): any;
}

export {};
