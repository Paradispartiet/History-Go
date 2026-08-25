const HTTPS_RE = /^https:\/\//i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const MICRO_PLACE_SCHEMA = "history_go_micro_place_profile_v1";
export const MICRO_PLACE_KINDS = new Set([
  "lesekiosk",
  "bokskap",
  "miljostasjon",
  "ombruk_gratis",
  "minneskilt",
  "snublestein",
  "annet_dokumentert_mikrosted"
]);
export const MICRO_PLACE_STATUSES = new Set(["active", "temporary_unavailable", "historic"]);
export const MICRO_PLACE_QUIZ_MODES = new Set(["none", "place"]);

const text = (value) => typeof value === "string" ? value.trim() : "";
const finite = (value) => typeof value === "number" && Number.isFinite(value);

export function findMicroSubcategory(microSubcategories, category, subcategoryId) {
  const rows = microSubcategories?.subcategories?.[category];
  return Array.isArray(rows) ? rows.find((row) => row?.id === subcategoryId) || null : null;
}

export function validateMicroPlace(place, categoryContract, microSubcategories) {
  const errors = [];
  const fail = (field, message) => errors.push({ field, message });

  if (!place || typeof place !== "object" || Array.isArray(place)) {
    return [{ field: "place", message: "Micro Place must be an object" }];
  }
  if (place.placeTier !== "micro") fail("placeTier", "must equal micro");
  if (!text(place.id)) fail("id", "is required");
  if (!text(place.name)) fail("name", "is required");
  if (!finite(place.lat) || place.lat < -90 || place.lat > 90) fail("lat", "must be a valid latitude");
  if (!finite(place.lon) || place.lon < -180 || place.lon > 180) fail("lon", "must be a valid longitude");
  if (!text(place.desc) || text(place.desc).length < 20) fail("desc", "must be a source-led micro description of at least 20 characters");

  const category = text(place.category);
  const subcategoryId = text(place.subcategory_id);
  if (!category || !categoryContract?.runtimeCategories?.includes(category)) {
    fail("category", "must be a canonical runtime category");
  }
  if (!subcategoryId) {
    fail("subcategory_id", "is required");
  } else {
    const row = findMicroSubcategory(microSubcategories, category, subcategoryId);
    if (!row) fail("subcategory_id", `is not registered as a Micro Place subcategory under ${category || "the category"}`);
    else if (row.status !== "active") fail("subcategory_id", `must be active, got ${row.status || "missing status"}`);
  }

  for (const field of ["locatorType", "sourceProvider", "geocodeAccuracy", "coordRole", "coordType", "coordStatus", "coordNote"]) {
    if (!text(place[field])) fail(field, "is required by the micro/coordinate contract");
  }
  if (!text(place.sourceObjectId) && !(place.address && typeof place.address === "object" && !Array.isArray(place.address))) {
    fail("sourceObjectId/address", "one stable coordinate source identity is required");
  }
  if (place.placeScope === "area") fail("placeScope", "a Micro Place cannot be an area Place");
  if (place.place_card_profile) fail("place_card_profile", "Micro Place uses compact PlaceCard and must not declare the four-collection profile");

  const profile = place.micro_place_profile;
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    fail("micro_place_profile", "is required");
    return errors;
  }
  if (profile.schema !== MICRO_PLACE_SCHEMA) fail("micro_place_profile.schema", `must equal ${MICRO_PLACE_SCHEMA}`);
  if (!MICRO_PLACE_KINDS.has(text(profile.kind))) fail("micro_place_profile.kind", "is not a canonical micro kind");
  if (!MICRO_PLACE_STATUSES.has(text(profile.currentStatus))) fail("micro_place_profile.currentStatus", "is not a canonical status");
  if (!HTTPS_RE.test(text(profile.sourceUrl))) fail("micro_place_profile.sourceUrl", "must be an inspectable HTTPS URL");
  if (text(profile.sourceLocation).length < 3) fail("micro_place_profile.sourceLocation", "must identify the source location");
  if (!DATE_RE.test(text(profile.verifiedAt))) fail("micro_place_profile.verifiedAt", "must be YYYY-MM-DD");
  if (!MICRO_PLACE_QUIZ_MODES.has(text(profile.quizMode))) fail("micro_place_profile.quizMode", "must be none or place");

  return errors;
}
