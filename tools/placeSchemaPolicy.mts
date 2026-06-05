// Shared place schema and category policy for History Go health scripts.

export const OFFICIAL_HISTORY_GO_CATEGORIES = [
  "historie",
  "vitenskap",
  "kunst",
  "musikk",
  "natur",
  "sport",
  "by",
  "politikk",
  "populaerkultur",
  "subkultur"
] as const;

export const LEGACY_OR_SECONDARY_PLACE_CATEGORIES = [
  "litteratur",
  "naeringsliv",
  "film",
  "film_tv",
  "media",
  "psykologi"
] as const;

export const REQUIRED_PLACE_FIELDS = [
  "id",
  "name",
  "category",
  "lat",
  "lon"
] as const;

export const RECOMMENDED_PLACE_FIELDS = [
  "r",
  "year",
  "desc"
] as const;

export const OPTIONAL_PLACE_FIELDS = [
  "popupDesc",
  "image",
  "frontImage",
  "cardImage",
  "popupImage",
  "emne_ids",
  "quiz_profile",
  "hidden",
  "stub",
  "relations",
  "groundhopper",
  "officialUrl",
  "wikipedia",
  "statsUrl",
  "link"
] as const;

export type PlaceCategoryPolicyStatus = "official" | "legacy_or_secondary" | "unknown";

export const OFFICIAL_HISTORY_GO_CATEGORY_SET = new Set<string>(OFFICIAL_HISTORY_GO_CATEGORIES);
export const LEGACY_OR_SECONDARY_PLACE_CATEGORY_SET = new Set<string>(LEGACY_OR_SECONDARY_PLACE_CATEGORIES);
export const KNOWN_PLACE_CATEGORY_SET = new Set<string>([
  ...OFFICIAL_HISTORY_GO_CATEGORIES,
  ...LEGACY_OR_SECONDARY_PLACE_CATEGORIES
]);

export function getPlaceCategoryPolicyStatus(category: unknown): PlaceCategoryPolicyStatus {
  const normalized = String(category || "").trim();
  if (OFFICIAL_HISTORY_GO_CATEGORY_SET.has(normalized)) return "official";
  if (LEGACY_OR_SECONDARY_PLACE_CATEGORY_SET.has(normalized)) return "legacy_or_secondary";
  return "unknown";
}
