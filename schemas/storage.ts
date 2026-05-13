export type IdBoolMap = Record<string, boolean>;
export type StringList = string[];
export type StringCountMap = Record<string, number>;
export type IsoDateString = string;

export interface HistoryGoProgress {
  [key: string]: unknown;
}

export type VisitedPlaces = IdBoolMap;
export type PeopleCollected = IdBoolMap;
export type MeritsByCategory = Record<string, number | Record<string, unknown>>;

export interface PersonDialogEntry {
  [key: string]: unknown;
}

export interface UserNoteEntry {
  [key: string]: unknown;
}

export type PersonDialogs = PersonDialogEntry[];
export type UserNotes = UserNoteEntry[];

export interface GroundhopperStats {
  version: number;
  visited_groundhopper_places: StringList;
  visited_by_venue_kind: StringCountMap;
  visited_by_sport: StringCountMap;
  visited_by_groundhopper_type: StringCountMap;
  clubs_collected: StringList;
  teams_collected: StringList;
  first_visit_by_place: Record<string, IsoDateString>;
  last_visit_by_place: Record<string, IsoDateString>;
  visit_count_by_place: StringCountMap;
  total_groundhopper_places_visited: number;
  total_football_grounds_visited: number;
  total_ice_arenas_visited: number;
  total_athletics_venues_visited: number;
  total_winter_sport_places_visited: number;
  total_national_arenas_visited: number;
  updated_at: IsoDateString | null;
}

export interface HistoryGoStorageShape {
  visited_places: VisitedPlaces;
  people_collected: PeopleCollected;
  merits_by_category: MeritsByCategory;
  historygo_progress: HistoryGoProgress;
  hg_person_dialogs_v1: PersonDialogs;
  hg_user_notes_v1: UserNotes;
  hg_groundhopper_stats_v1: GroundhopperStats;
}
