export interface PlaceNatureProfile {
  type?: string;
  title?: string;
  summary?: string;
  themes?: string[];
  nearby_place_ids?: string[];
  destinations?: PlaceVisualRoundItem[];
  tour_targets?: PlaceVisualRoundItem[];
  trail_targets?: PlaceVisualRoundItem[];
  viewpoints?: PlaceVisualRoundItem[];
  [key: string]: unknown;
}

export interface PlaceCircularProfile {
  schema?: "history_go_circular_place_profile_v1" | string;
  place_type?: "large_recycling_station" | "small_recycling_station" | "environment_station" | "reuse_point" | "sharing_point" | string;
  operation_status?: "active" | "temporary_unavailable" | "historic" | string;
  free_takeaway?: boolean;
  reuse_sale?: boolean;
  restricted_access?: boolean;
  self_service?: boolean;
  mobile_service?: boolean;
  reuse?: PlaceVisualRoundItem[];
  materials?: PlaceVisualRoundItem[];
  environment?: PlaceVisualRoundItem[];
  systems?: PlaceVisualRoundItem[];
  source_url?: string;
  verified_at?: string;
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
  beforeImage?: string;
  beforeImageLabel?: string;
  nowImage?: string;
  nowImageLabel?: string;
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
  competitions?: PlaceVisualRoundItem[];
  matches?: PlaceVisualRoundItem[];
  tournaments?: PlaceVisualRoundItem[];
  major_events?: PlaceVisualRoundItem[];
  notable_events?: PlaceVisualRoundItem[];
  events?: PlaceVisualRoundItem[];
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
  cardImage?: string;
  img?: string;
  photo?: string;
  thumbnail?: string;
  cover?: string;
  src?: string;
  type?: string;
  kind?: string;
  category?: string;
  place_id?: string;
  placeId?: string;
  target_id?: string;
  targetId?: string;
  [key: string]: unknown;
}

export type PlaceCardCollectionId =
  | "people"
  | "objects"
  | "brands"
  | "map"
  | "flora"
  | "fauna"
  | "productions"
  | "structures"
  | "competitions"
  | "related"
  | "destinations"
  | "reuse"
  | "materials"
  | "environment"
  | "systems";

export interface PlaceCardProfileV2 {
  schema: "history_go_place_card_profile_v2";
  /** Nøyaktig fire samlinger i fast kategori-/underkategoriavhengig 2 × 2-komposisjon. Bilder eies av medieflaten. */
  collection_ids: PlaceCardCollectionId[];
  reason: string;
  verifiedAt: string;
}

export interface LegacyPlaceRoundProfileV1 {
  schema?: "history_go_place_round_profile_v1" | string;
  /** Leses bare gjennom kompatibilitetsadapteren; `images` filtreres bort. */
  content_round_ids: string[];
  reason: string;
  verifiedAt?: string;
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
  /** Canonical specialization beneath the existing top category. Never creates a new map color. */
  subcategory_id?: string;
  year?: number;
  desc?: string;
  popupDesc?: string;
  image?: string;
  frontImage?: string;
  cardImage?: string;
  popupImage?: string;
  /** Alternative public names used for search without changing canonical identity. */
  aliases?: string[];
  emne_ids?: string[];
  hidden?: boolean;
  stub?: boolean;
  sport_profile?: PlaceSportProfile;
  quiz_profile?: Record<string, unknown>;
  nature_profile?: PlaceNatureProfile;
  circular_profile?: PlaceCircularProfile;
  for_na?: PlaceForNaProfile;
  training_profile?: PlaceTrainingProfile;
  relations?: unknown[];
  people?: unknown[];
  wonderkammer?: unknown;

  /** Canonical PlaceCard-samlingsprofil for nye og fullproduserte steder. */
  place_card_profile?: PlaceCardProfileV2;
  /** Legacy-profil som fortsatt leses, men ikke skal opprettes ved ny produksjon. */
  round_profile?: LegacyPlaceRoundProfileV1;

  /** Fysiske, identifiserbare gjenstander. Civication-egenskaper kan ligge på samme objekt. */
  objects?: PlaceVisualRoundItem[];
  /** Legacy fysisk objektfelt som kan brukes som Objects-kilde under migrering. */
  artifacts?: PlaceVisualRoundItem[];

  /** Kategoriens reelle produksjoner. Runtime gir samlingen et konkret kategorinavn. */
  works?: PlaceVisualRoundItem[];
  productions?: PlaceVisualRoundItem[];
  publications?: PlaceVisualRoundItem[];
  artworks?: PlaceVisualRoundItem[];
  books?: PlaceVisualRoundItem[];
  texts?: PlaceVisualRoundItem[];
  songs?: PlaceVisualRoundItem[];
  albums?: PlaceVisualRoundItem[];
  films?: PlaceVisualRoundItem[];
  series?: PlaceVisualRoundItem[];
  performances?: PlaceVisualRoundItem[];
  releases?: PlaceVisualRoundItem[];

  /** Navngitte bygninger og anlegg som kan kvalifisere til fjerde runding. */
  buildings?: PlaceVisualRoundItem[];
  structures?: PlaceVisualRoundItem[];
  facilities?: PlaceVisualRoundItem[];
  venues?: PlaceVisualRoundItem[];
  architecture?: PlaceVisualRoundItem[];

  /** Dokumenterte sportslige konkurranser. */
  competitions?: PlaceVisualRoundItem[];
  matches?: PlaceVisualRoundItem[];
  tournaments?: PlaceVisualRoundItem[];
  sport_events?: PlaceVisualRoundItem[];
  sporting_events?: PlaceVisualRoundItem[];

  /** Faktiske relasjoner til andre History GO-steder. */
  related_places?: Array<string | PlaceVisualRoundItem>;
  relatedPlaces?: Array<string | PlaceVisualRoundItem>;
  related_place_ids?: string[];

  /** Navngitte turmål for natursteder. */
  destinations?: PlaceVisualRoundItem[];
  tour_targets?: PlaceVisualRoundItem[];
  trail_targets?: PlaceVisualRoundItem[];
  viewpoints?: PlaceVisualRoundItem[];
  attractions?: PlaceVisualRoundItem[];

  /** Dokumenterte bilder som eies av frontImage-/medieflaten, ikke av en PlaceCard-samling. */
  images?: Array<string | PlaceVisualRoundItem>;
  gallery?: Array<string | PlaceVisualRoundItem>;
  photos?: Array<string | PlaceVisualRoundItem>;
  imageGallery?: Array<string | PlaceVisualRoundItem>;
  media?: { images?: Array<string | PlaceVisualRoundItem>; [key: string]: unknown };

  /** Steddata som ikke automatisk gir en PlaceCard-runding. */
  details?: PlaceVisualRoundItem[];
  visual_details?: PlaceVisualRoundItem[];
  site_details?: PlaceVisualRoundItem[];
  spots?: PlaceVisualRoundItem[];
  subplaces?: PlaceVisualRoundItem[];
  subPlaces?: PlaceVisualRoundItem[];

  /**
   * Legacy presentasjonsfelt. Hele rundingskontrakten eies av
   * data/places/README_place_rounds.md; schemaet gjentar ikke profiler eller palett.
   */
  rounds?: string[];
  /** Alias for `rounds` (legacy). Foretrekk `rounds` i nye data. */
  rundinger?: string[];
  /** Legacy presentasjonsfelt; skal ikke styre nye/reviderte canonical rundingssett. */
  rounds_exclude?: string[];
  /** Legacy nature fields: arrays of flora/fauna ids attached to a place. */
  flora?: string[];
  fauna?: string[];
}
