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
   * Datastyrte PlaceCard-rundinger som prioriterer hvilke innholdsmoduler
   * som kommer først. `rounds` er ikke hele og eneste visning: PlaceCard
   * fyller opp til 9 synlige rundinger fra en canonical pool på 11. Bruk
   * `rounds` i nye data; `rundinger` støttes som norsk/legacy alias.
   *
   * Canonical id-er: people, fortellinger, leksikon, wonderkammer, routes,
   * badges, tasks, observations, brands, civication, works. Legacy aliases i
   * runtime: lexicon -> leksikon, stories/story -> fortellinger, nature ->
   * wonderkammer, football/music -> works. Nye data skal bruke canonical ids.
   * Se js/ui/place-card.js (PLACE_ROUND_REGISTRY / getPlaceRounds).
   */
  rounds?: string[];
  /** Alias for `rounds` (legacy). Foretrekk `rounds` i nye data. */
  rundinger?: string[];
  /** Legacy nature fields: arrays of flora/fauna ids attached to a place. */
  flora?: string[];
  fauna?: string[];
}
