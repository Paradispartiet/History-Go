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

type DataHubApi = {
  fetchJSON?: <T = unknown>(url: string, opts?: DataHubFetchOptions) => Promise<T>;
  clearCache?: (prefix?: string) => void;

  loadTags?: (opts?: DataHubFetchOptions) => Promise<unknown>;
  loadPlacesBase?: (opts?: DataHubFetchOptions) => Promise<Place[]>;
  loadPeopleBase?: (opts?: DataHubFetchOptions) => Promise<unknown[]>;
  loadBadges?: (opts?: DataHubFetchOptions) => Promise<unknown[]>;
  loadRoutes?: (opts?: DataHubFetchOptions) => Promise<unknown[]>;
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
  normalizeTags?: (rawTags: unknown, tagsRegistry: unknown) => unknown[];

  mergeDeep?: (base: unknown, extra: unknown) => unknown;
  indexBy?: (arr: unknown[], key: string) => Map<unknown, unknown>;

  APP_BASE_PATH?: string;
  DEFAULTS?: {
    DATA_BASE?: string;
    EMNERS_BASE?: string;
    EMNER_BASE?: string;
    [key: string]: unknown;
  };

  [key: string]: unknown;
};

declare global {
  interface Window {
    PLACES?: Place[];
    visited: VisitedPlaces;
    merits?: MeritsByCategory;
    DataHub?: DataHubApi;
    HGMap?: {
      setVisited?: (visited: VisitedPlaces) => void;
      refreshMarkers?: () => void;
      initMap?: (options?: {
        containerId?: string;
        start?: unknown;
      }) => unknown;
      [key: string]: unknown;
    };
    renderNearbyPlaces?: () => void;
    saveVisitedFromQuiz?: (placeId: string | number | null | undefined) => void;
    saveMerits?: () => void;
    savePeopleCollected?: (personId: string | number | null | undefined) => void;
    HG_getGroundhopperStats?: () => GroundhopperStats;
    HG_updateGroundhopperFromPlace?: (place: Place | null | undefined) => void;
    HG_isGroundhopperPlace?: (place: Place | null | undefined) => boolean;
    TEST_MODE?: boolean;
    HG_OPEN_MODE?: boolean;
    OPEN_MODE?: boolean;
  }
}

export {};
