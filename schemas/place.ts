export interface PlaceNatureProfile {
  type?: string;
  title?: string;
  summary?: string;
  themes?: string[];
  nearby_place_ids?: string[];
  [key: string]: unknown;
}

export interface PlaceSportProfile {
  groundhopper_relevant?: boolean;
  sports?: string[];
  venue_kind?: string;
  groundhopper_type?: string;
  clubs_or_teams?: string[];
  teams?: string[];
  [key: string]: unknown;
}

export interface Place {
  id: string;
  name?: string;
  title?: string;
  lat?: number;
  lon?: number;
  /**
   * Temporary alias used by some in-flight TypeScript migrations.
   * Prefer `lon` to match the repository's established data contract.
   */
  lng?: number;
  r?: number;
  category?: string;
  year?: number;
  desc?: string;
  popupDesc?: string;
  image?: string;
  frontImage?: string;
  cardImage?: string;
  popupImage?: string;
  emne_ids?: string[];
  hidden?: boolean;
  stub?: boolean;
  sport_profile?: PlaceSportProfile;
  quiz_profile?: Record<string, unknown>;
  nature_profile?: PlaceNatureProfile;
  relations?: unknown[];
  people?: unknown[];
  wonderkammer?: unknown;
  /**
   * Datastyrte PlaceCard-rundinger. Bestemmer hvilke runding-knapper kortet
   * viser for dette stedet, i den rekkefølgen de listes.
   * Gyldige id-er: people, stories, wonderkammer, nature, badges, routes,
   * football, lexicon (i tillegg støttes civication, brands, music).
   * Mangler feltet, brukes standard-fallback: people, stories, wonderkammer,
   * nature, badges. Se js/ui/place-card.js (PLACE_ROUND_REGISTRY / getPlaceRounds).
   */
  rounds?: string[];
  /** Alias for `rounds` (legacy). Foretrekk `rounds` i nye data. */
  rundinger?: string[];
  /** Legacy nature fields: arrays of flora/fauna ids attached to a place. */
  flora?: string[];
  fauna?: string[];
}
