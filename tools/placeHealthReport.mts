#!/usr/bin/env node

// tools/placeHealthReport.mts
// Read-only health report for data/places/manifest.json and all declared place files.
// Reports structural errors, content/asset warnings and canonical emne warnings without modifying source data.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  getPlaceCategoryPolicyStatus,
  REQUIRED_PLACE_FIELDS
} from "./placeSchemaPolicy.mjs";

type JsonObject = { [key: string]: unknown };

type PlaceRow = JsonObject & {
  id?: unknown;
  name?: unknown;
  category?: unknown;
  lat?: unknown;
  lon?: unknown;
  r?: unknown;
  year?: unknown;
  desc?: unknown;
  popupDesc?: unknown;
  image?: unknown;
  frontImage?: unknown;
  cardImage?: unknown;
  popupImage?: unknown;
  emne_ids?: unknown;
  hidden?: unknown;
  stub?: unknown;
};

type PlaceManifest = JsonObject & {
  files?: unknown;
};

type CanonicalEmneEntry = JsonObject & {
  emne_id?: unknown;
};

type CanonicalEmneRegistryEntry = {
  sourcePath: string;
  family: string;
};

type PlaceHealthStats = {
  files: number;
  places: number;
  hidden: number;
  stubs: number;
  emneIds: number;
  canonicalEmneIds: number;
  unknownEmneIds: number;
  wrongPrefixEmneIds: number;
  allowlistedCrossDisciplinaryEmneIds: number;
  filesWithCanonicalEmner: number;
};

type ReadJsonOptions = {
  reportError?: boolean;
};

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "data", "places", "manifest.json");
const FAG_ROOT = path.join(ROOT, "data", "fag");

const CATEGORY_EMNE_PREFIXES: Record<string, string[]> = {
  historie: ["em_his_"],
  vitenskap: ["em_vit_"],
  kunst: ["em_kunst_"],
  musikk: ["em_musikk_"],
  natur: ["em_natur_"],
  sport: ["em_sport_"],
  by: ["em_by_"],
  politikk: ["em_pol_"],
  populaerkultur: ["em_pop_"],
  subkultur: ["em_sub_"],
  litteratur: ["em_lit_"],
  naeringsliv: ["em_naering_", "em_naer_"],
  film: ["em_film_tv_"],
  film_tv: ["em_film_tv_"],
  media: ["em_media_"],
  psykologi: ["em_psykologi_", "em_psy_"]
};

// Batch 31: explicit health allowlist for editorially approved cross-disciplinary
// emne_ids. This is intentionally a category -> canonical fagfamilie policy, not
// a blind prefix rewrite. Unknown/missing emne_ids are never allowlisted because
// the canonical family is only read from the canonical registry after a hit.
// Batch 33: by -> film_tv covers urban spaces with an explicitly documented
// film/TV location or representation layer. populaerkultur -> film_tv covers
// cinemas and film/TV places while film/TV remains under populaerkultur in
// place data.
// Batch 35: by -> populaerkultur applies only to urban spaces with an
// explicitly documented popular-cultural secondary layer in the place text, for
// example icon status, shared culture, audience rhythms, social belonging,
// representation or mediated publicness. The pair was allowlisted only after
// Batch 34 cleaned up miscategorized pop-culture places and weak pop-culture
// links. politikk -> populaerkultur, natur -> kunst and subkultur ->
// naeringsliv remain outside the allowlist.
const ALLOWED_CROSS_DISCIPLINARY_EMNE_FAMILIES: Record<string, string[]> = {
  natur: ["by", "historie"],
  litteratur: ["by"],
  naeringsliv: ["by", "historie"],
  historie: ["by", "kunst"],
  politikk: ["historie", "by"],
  by: ["kunst", "historie", "film_tv", "populaerkultur"],
  populaerkultur: ["film_tv"],
  kunst: ["by", "historie"],
  subkultur: ["by", "musikk", "historie", "kunst"]
};

const CANONICAL_FAMILY_BY_FAG_DIR: Record<string, string> = {
  TV_og_Film: "film_tv",
  by: "by",
  historie: "historie",
  kunst: "kunst",
  litteratur: "litteratur",
  media: "media",
  musikk: "musikk",
  naeringsliv: "naeringsliv",
  natur: "natur",
  politikk: "politikk",
  popkultur: "populaerkultur",
  psykologi: "psykologi",
  sport: "sport",
  subkultur: "subkultur",
  vitenskap: "vitenskap"
};

const errors: string[] = [];
const warnings: string[] = [];
const stats: PlaceHealthStats = {
  files: 0,
  places: 0,
  hidden: 0,
  stubs: 0,
  emneIds: 0,
  canonicalEmneIds: 0,
  unknownEmneIds: 0,
  wrongPrefixEmneIds: 0,
  allowlistedCrossDisciplinaryEmneIds: 0,
  filesWithCanonicalEmner: 0
};

function isJsonObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function rel(filePath: string): string {
  return path.relative(ROOT, filePath).replaceAll(path.sep, "/");
}

function readJson(filePath: string, { reportError = true }: ReadJsonOptions = {}): unknown {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
  } catch (error) {
    if (reportError) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${rel(filePath)}: could not read/parse JSON (${message})`);
    }
    return null;
  }
}

function walkFiles(dirPath: string, predicate: (filePath: string) => boolean, found: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return found;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, predicate, found);
    } else if (entry.isFile() && predicate(fullPath)) {
      found.push(fullPath);
    }
  }
  return found;
}

function canonicalFamilyFromPath(filePath: string): string {
  const relativeParts = rel(filePath).split("/");
  const fagIndex = relativeParts.indexOf("fag");
  const fagDir = fagIndex >= 0 ? relativeParts[fagIndex + 1] : "";
  return CANONICAL_FAMILY_BY_FAG_DIR[fagDir] || "";
}

function isAllowedCrossDisciplinaryEmneFamily(category: string, canonicalFamily: string): boolean {
  return (ALLOWED_CROSS_DISCIPLINARY_EMNE_FAMILIES[category] || []).includes(canonicalFamily);
}

function loadCanonicalEmneRegistry(): Map<string, CanonicalEmneRegistryEntry> {
  const registry = new Map<string, CanonicalEmneRegistryEntry>();
  const canonicalFiles = walkFiles(
    FAG_ROOT,
    (filePath) => /(^|\/)emner_.*_canonical_v4_5\.json$/.test(filePath.replaceAll(path.sep, "/"))
  );
  const domainMatrixFiles = walkFiles(
    FAG_ROOT,
    (filePath) => /(?:pensum|matrix)\.json$/.test(path.basename(filePath))
  );

  for (const filePath of canonicalFiles) {
    const data = readJson(filePath, { reportError: false });
    if (!Array.isArray(data)) continue;

    let fileContributed = false;

    for (const item of data) {
      const canonicalItem = item as CanonicalEmneEntry;
      const emneId = String(canonicalItem?.emne_id || "").trim();
      if (!emneId) continue;
      fileContributed = true;
      registry.set(emneId, { sourcePath: rel(filePath), family: canonicalFamilyFromPath(filePath) });
    }

    if (fileContributed) stats.filesWithCanonicalEmner += 1;
  }

  for (const filePath of domainMatrixFiles) {
    const data = readJson(filePath, { reportError: false });
    if (!isJsonObject(data)) continue;
    if (!Array.isArray(data.domains)) continue;

    let fileContributed = false;

    for (const domain of data.domains) {
      if (!isJsonObject(domain)) continue;
      if (!Array.isArray(domain.emne_ids)) continue;
      for (const raw of domain.emne_ids) {
        const emneId = String(raw || "").trim();
        if (!emneId) continue;
        fileContributed = true;
        registry.set(emneId, { sourcePath: rel(filePath), family: canonicalFamilyFromPath(filePath) });
      }
    }

    if (fileContributed) stats.filesWithCanonicalEmner += 1;
  }

  return registry;
}

function resolveManifestEntry(entry: unknown): string {
  const clean = String(entry || "").trim();
  if (!clean) return "";
  if (clean.startsWith("data/")) return path.join(ROOT, clean);
  if (clean.startsWith("places/")) return path.join(ROOT, "data", clean);
  return path.join(ROOT, "data", "places", clean);
}

function asPlacesArray(data: unknown, filePath: string): unknown[] {
  if (Array.isArray(data)) return data;
  if (isJsonObject(data) && Array.isArray(data.places)) return data.places;
  errors.push(`${rel(filePath)}: expected JSON array or object with places[]`);
  return [];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function pathExistsFromRoot(assetPath: unknown): boolean {
  if (!isNonEmptyString(assetPath)) return false;
  return fs.existsSync(path.join(ROOT, assetPath));
}

function validateTextField(place: PlaceRow, field: keyof PlaceRow, context: string, { warnOnly = false } = {}): void {
  if (!isNonEmptyString(place[field])) {
    const message = `${context}: missing ${field}`;
    (warnOnly ? warnings : errors).push(message);
  }
}

function validateEmneIds(place: PlaceRow, context: string, canonicalEmneRegistry: Map<string, CanonicalEmneRegistryEntry>): void {
  if (place.emne_ids == null) return;

  if (!Array.isArray(place.emne_ids)) {
    warnings.push(`${context}: emne_ids should be an array when present`);
    return;
  }

  const category = String(place.category || "").trim();
  const expectedPrefixes = CATEGORY_EMNE_PREFIXES[category] || [];
  const expectedPrefixLabel = expectedPrefixes.join(" or ");

  place.emne_ids.forEach((raw, index) => {
    const emneId = String(raw || "").trim();
    stats.emneIds += 1;

    if (!emneId) {
      warnings.push(`${context}: empty emne_ids[${index}]`);
      return;
    }

    if (!emneId.startsWith("em_")) {
      warnings.push(`${context}: emne_id "${emneId}" should start with em_`);
      return;
    }

    const canonicalEntry = canonicalEmneRegistry.get(emneId);

    if (canonicalEntry) {
      stats.canonicalEmneIds += 1;
    } else {
      stats.unknownEmneIds += 1;
      warnings.push(`${context}: emne_id "${emneId}" not found in canonical emner registry`);
    }

    if (expectedPrefixes.length && !expectedPrefixes.some((prefix) => emneId.startsWith(prefix))) {
      if (canonicalEntry && isAllowedCrossDisciplinaryEmneFamily(category, canonicalEntry.family)) {
        stats.allowlistedCrossDisciplinaryEmneIds += 1;
      } else {
        stats.wrongPrefixEmneIds += 1;
        warnings.push(`${context}: emne_id "${emneId}" does not match category "${category}" expected prefix "${expectedPrefixLabel}"`);
      }
    }
  });
}

function validatePlace(
  place: unknown,
  context: string,
  seenIds: Map<string, string>,
  canonicalEmneRegistry: Map<string, CanonicalEmneRegistryEntry>
): void {
  if (!isJsonObject(place)) {
    errors.push(`${context}: place entry must be an object`);
    return;
  }

  const placeRow: PlaceRow = place;
  const id = String(placeRow.id || "").trim();
  const hidden = placeRow.hidden === true;
  const stub = placeRow.stub === true;

  stats.places += 1;
  if (hidden) stats.hidden += 1;
  if (stub) stats.stubs += 1;

  if (!id) {
    errors.push(`${context}: missing id`);
  } else if (seenIds.has(id)) {
    errors.push(`${context}: duplicate id "${id}" also seen in ${seenIds.get(id)}`);
  } else {
    seenIds.set(id, context);
  }

  for (const field of REQUIRED_PLACE_FIELDS) {
    if (["id", "lat", "lon"].includes(field)) continue;
    validateTextField(placeRow, field, context);
  }

  const categoryStatus = getPlaceCategoryPolicyStatus(placeRow.category);
  if (categoryStatus === "unknown") {
    errors.push(`${context}: invalid category "${placeRow.category}"`);
  } else if (categoryStatus === "legacy_or_secondary") {
    warnings.push(`${context}: legacy/secondary category "${placeRow.category}"`);
  }

  if (!isFiniteNumber(placeRow.lat) || placeRow.lat < -90 || placeRow.lat > 90) {
    errors.push(`${context}: invalid lat "${placeRow.lat}"`);
  }

  if (!isFiniteNumber(placeRow.lon) || placeRow.lon < -180 || placeRow.lon > 180) {
    errors.push(`${context}: invalid lon "${placeRow.lon}"`);
  }

  if (placeRow.r != null && (!isFiniteNumber(placeRow.r) || placeRow.r <= 0)) {
    errors.push(`${context}: invalid r "${placeRow.r}"`);
  }

  if (placeRow.year != null && !Number.isFinite(Number(placeRow.year))) {
    warnings.push(`${context}: year should be numeric when present`);
  }

  validateEmneIds(placeRow, context, canonicalEmneRegistry);

  if (stub || hidden) return;

  validateTextField(placeRow, "desc", context, { warnOnly: true });
  validateTextField(placeRow, "popupDesc", context, { warnOnly: true });

  if (!isNonEmptyString(placeRow.image)) {
    warnings.push(`${context}: missing image`);
  } else if (!pathExistsFromRoot(placeRow.image)) {
    warnings.push(`${context}: image file not found (${placeRow.image})`);
  }

  if (!isNonEmptyString(placeRow.cardImage)) {
    warnings.push(`${context}: missing cardImage`);
  } else if (!pathExistsFromRoot(placeRow.cardImage)) {
    warnings.push(`${context}: cardImage file not found (${placeRow.cardImage})`);
  }

  if (placeRow.frontImage != null && !pathExistsFromRoot(placeRow.frontImage)) {
    warnings.push(`${context}: frontImage file not found (${placeRow.frontImage})`);
  }

  if (placeRow.popupImage != null && !pathExistsFromRoot(placeRow.popupImage)) {
    warnings.push(`${context}: popupImage file not found (${placeRow.popupImage})`);
  }
}

function main(): void {
  const canonicalEmneRegistry = loadCanonicalEmneRegistry();
  const manifest = readJson(MANIFEST_PATH) as PlaceManifest | null;
  const files = manifest && Array.isArray(manifest.files) ? manifest.files : [];

  if (!canonicalEmneRegistry.size) {
    warnings.push(`${rel(FAG_ROOT)}: no canonical emne registry files found`);
  }

  if (!files.length) {
    errors.push(`${rel(MANIFEST_PATH)}: missing files[]`);
  }

  const seenIds = new Map<string, string>();

  for (const entry of files) {
    const filePath = resolveManifestEntry(entry);
    if (!filePath) {
      errors.push(`${rel(MANIFEST_PATH)}: empty manifest entry`);
      continue;
    }

    if (!fs.existsSync(filePath)) {
      errors.push(`${rel(MANIFEST_PATH)}: manifest entry not found (${entry} -> ${rel(filePath)})`);
      continue;
    }

    stats.files += 1;
    const data = readJson(filePath);
    const places = asPlacesArray(data, filePath);

    places.forEach((place, index) => {
      const placeId = isJsonObject(place) && place.id ? `#${place.id}` : `[${index}]`;
      validatePlace(place, `${rel(filePath)} ${placeId}`, seenIds, canonicalEmneRegistry);
    });
  }

  console.log("History Go PlaceHealthReport");
  console.log(`Files checked: ${stats.files}`);
  console.log(`Places checked: ${stats.places}`);
  console.log(`Hidden places: ${stats.hidden}`);
  console.log(`Stub places: ${stats.stubs}`);
  console.log(`Canonical emne files checked: ${stats.filesWithCanonicalEmner}`);
  console.log(`emne_ids checked: ${stats.emneIds}`);
  console.log(`Canonical emne_ids: ${stats.canonicalEmneIds}`);
  console.log(`Unknown emne_ids: ${stats.unknownEmneIds}`);
  console.log(`Wrong-prefix emne_ids: ${stats.wrongPrefixEmneIds}`);
  console.log(`Allowlisted cross-disciplinary emne_ids: ${stats.allowlistedCrossDisciplinaryEmneIds}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (errors.length) {
    console.log("\nErrors:");
    for (const error of errors) console.log(`- ${error}`);
  }

  if (warnings.length) {
    console.log("\nWarnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }

  if (errors.length) {
    process.exitCode = 1;
  }
}

main();
