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
];

export const LEGACY_OR_SECONDARY_PLACE_CATEGORIES = [
  "litteratur",
  "naeringsliv",
  "film",
  "film_tv",
  "media",
  "psykologi"
];

export const REQUIRED_PLACE_FIELDS = [
  "id",
  "name",
  "category",
  "lat",
  "lon"
];

export const RECOMMENDED_PLACE_FIELDS = [
  "r",
  "year",
  "desc"
];

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
];

export const OFFICIAL_HISTORY_GO_CATEGORY_SET = new Set(OFFICIAL_HISTORY_GO_CATEGORIES);
export const LEGACY_OR_SECONDARY_PLACE_CATEGORY_SET = new Set(LEGACY_OR_SECONDARY_PLACE_CATEGORIES);
export const KNOWN_PLACE_CATEGORY_SET = new Set([
  ...OFFICIAL_HISTORY_GO_CATEGORIES,
  ...LEGACY_OR_SECONDARY_PLACE_CATEGORIES
]);

export function getPlaceCategoryPolicyStatus(category) {
  const normalized = String(category || "").trim();
  if (OFFICIAL_HISTORY_GO_CATEGORY_SET.has(normalized)) return "official";
  if (LEGACY_OR_SECONDARY_PLACE_CATEGORY_SET.has(normalized)) return "legacy_or_secondary";
  return "unknown";
}
