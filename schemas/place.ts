export interface PlaceNatureProfile {
  type?: string;
  title?: string;
  summary?: string;
  themes?: string[];
  nearby_place_ids?: string[];
  [key: string]: unknown;
}


export interface PlaceTasksProfileTask {
  id?: string;
  title?: string;
  instruction?: string;
  why?: string;
  [key: string]: unknown;
}

export interface PlaceTasksProfile {
  title?: string;
  summary?: string;
  tasks?: PlaceTasksProfileTask[];
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
  tasks_profile?: PlaceTasksProfile;
  relations?: unknown[];
  people?: unknown[];
  wonderkammer?: unknown;
  /**
   * Legacy/kuratorisk metadata for PlaceCard-rundinger. PlaceCard-gridet er
   * nå fast og viser 9 canonical rundinger fra kategoriens profil, for eksempel:
   * people, tasks, badges, works, civication, brands, før_nå, fortellinger,
   * leksikon. `rounds`/`rundinger` kan fortsatt brukes som manuell override,
   * men må bruke canonical IDs. Runtime støtter fortsatt legacy aliases for
   * bakoverkompatibilitet: routes -> før_nå, lexicon -> leksikon,
   * stories/story -> fortellinger, wonderkammer -> leksikon, football/music ->
   * works. Nye data trenger normalt ikke å sette `rounds`. Se js/ui/place-card.js.
   */
  rounds?: string[];
  /** Alias for `rounds` (legacy). Foretrekk `rounds` i nye data. */
  rundinger?: string[];
  /** Legacy nature fields: arrays of flora/fauna ids attached to a place. */
  flora?: string[];
  fauna?: string[];
}
