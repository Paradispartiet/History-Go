export interface PlaceNatureProfile {
  type?: string;
  title?: string;
  summary?: string;
  themes?: string[];
  nearby_place_ids?: string[];
  [key: string]: unknown;
}

export interface PlaceTrainingProfileExercise {
  id?: string;
  title?: string;
  instruction?: string;
  why?: string;
  duration_minutes?: number;
  intensity?: string;
  [key: string]: unknown;
}

export interface PlaceTrainingProfile {
  title?: string;
  summary?: string;
  safety?: string;
  exercises?: PlaceTrainingProfileExercise[];
  [key: string]: unknown;
}

export interface PlaceForNaProfile {
  title?: string;
  before?: string;
  now?: string;
  change?: string;
  lookFor?: string[];
  sources?: string[];
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

/** Generic visual/content item. The historical name is retained for type compatibility. */
export interface PlaceVisualRoundItem {
  id?: string;
  title?: string;
  name?: string;
  label?: string;
  description?: string;
  desc?: string;
  summary?: string;
  image?: string;
  imageCard?: string;
  img?: string;
  photo?: string;
  thumbnail?: string;
  cover?: string;
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
  for_na?: PlaceForNaProfile;
  training_profile?: PlaceTrainingProfile;
  relations?: unknown[];
  people?: unknown[];
  wonderkammer?: unknown;

  /** Fysiske, identifiserbare gjenstander. Civication-egenskaper kan ligge på samme objekt. */
  objects?: PlaceVisualRoundItem[];
  /** Gyldig place-/popupdata. Om feltet presenteres som runding bestemmes ikke av schemaet. */
  details?: PlaceVisualRoundItem[];
  visual_details?: PlaceVisualRoundItem[];
  site_details?: PlaceVisualRoundItem[];
  /** Gyldige fysiske delpunkter/delsteder; rundingidentitet bestemmes ikke av schemaet. */
  spots?: PlaceVisualRoundItem[];
  subplaces?: PlaceVisualRoundItem[];
  subPlaces?: PlaceVisualRoundItem[];
  /** Legacy fysisk objektfelt som kan brukes som Objects-kilde under migrering. */
  artifacts?: PlaceVisualRoundItem[];

  /**
   * Legacy/compatibility-felt fra tidligere rundingsmodeller.
   * De skal ikke styre ny canonical PlaceCard-presentasjon.
   * Rundingsmodellen eies bare av data/places/README_place_rounds.md og den
   * aktive runtime-en i js/ui/place-rounds-visual-collections.js.
   */
  rounds?: string[];
  /** Legacy alias for `rounds`. */
  rundinger?: string[];
  /** Legacy felt fra den tidligere dynamiske rundingsmodellen. */
  rounds_exclude?: string[];

  /** Canonical naturkoblinger brukt av Flora/Fauna-presentasjon og natursystemet. */
  flora?: string[];
  fauna?: string[];
}
