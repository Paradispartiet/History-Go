import type { Place } from "./place";
import type {
  GroundhopperStats,
  MeritsByCategory,
  VisitedPlaces
} from "./storage";

declare global {
  interface Window {
    PLACES?: Place[];
    visited: VisitedPlaces;
    merits?: MeritsByCategory;
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
