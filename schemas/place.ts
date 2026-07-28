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
  /** Små visuelle detaljer som skilt, symboler, inskripsjoner, ornamenter og fysiske spor. */
  details?: PlaceVisualRoundItem[];
  visual_details?: PlaceVisualRoundItem[];
  site_details?: PlaceVisualRoundItem[];
  /** Fysiske delpunkter/delsteder som ikke nødvendigvis er egne canonical Places. */
  spots?: PlaceVisualRoundItem[];
  subplaces?: PlaceVisualRoundItem[];
  subPlaces?: PlaceVisualRoundItem[];
  /** Legacy fysisk objektfelt som kan brukes som Objects-kilde under migrering. */
  artifacts?: PlaceVisualRoundItem[];

  /**
   * Canonical PlaceCard-rundinger er visuelle samlinger. Paletten er:
   * badges, people, works, objects, details, spots, nature, brands.
   *
   * Nye/reviderte steder skal vise nøyaktig 4 eller 6 rundinger. `badges` er
   * obligatorisk og leder til stedets fagverkside. `rounds`/`rundinger` brukes
   * til eksplisitt kuratering; hvis feltet mangler bruker presentasjonslaget
   * kategoriens 4-runders kjerneprofil. Seks rundinger er en eksplisitt utvidelse
   * når stedet har seks reelle visuelle samlinger.
   *
   * Leksikon/Stories/Før-etter og handlinger er ikke rundinger. Wonderkammer og
   * Civication er heller ikke canonical rundinger; fysiske Store-objekter kan
   * presenteres gjennom Objects uten at Store-dataene flyttes.
   * Se data/places/README_place_rounds.md og js/ui/place-rounds-visual-collections.js.
   */
  rounds?: string[];
  /** Alias for `rounds` (legacy). Foretrekk `rounds` i nye data. */
  rundinger?: string[];
  /** Kan fjerne en valgfri standardrunding; `badges` kan ikke ekskluderes. */
  rounds_exclude?: string[];
  /** Legacy nature fields: arrays of flora/fauna ids attached to a place. */
  flora?: string[];
  fauna?: string[];
}
