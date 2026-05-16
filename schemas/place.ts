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
  relations?: unknown[];
  people?: unknown[];
  wonderkammer?: unknown;
}
