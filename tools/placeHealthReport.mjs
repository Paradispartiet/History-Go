#!/usr/bin/env node

// tools/placeHealthReport.mjs
// Read-only health report for data/places/manifest.json and all declared place files.
// Reports structural errors, content/asset warnings and canonical emne warnings without modifying source data.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "data", "places", "manifest.json");
const FAG_ROOT = path.join(ROOT, "data", "fag");

const VALID_CATEGORIES = new Set([
  "historie",
  "vitenskap",
  "kunst",
  "musikk",
  "natur",
  "sport",
  "by",
  "politikk",
  "populaerkultur",
  "subkultur",
  "litteratur",
  "naeringsliv",
  "film",
  "film_tv",
  "media"
]);

const CATEGORY_EMNE_PREFIX = {
  historie: "em_his_",
  vitenskap: "em_vit_",
  kunst: "em_kunst_",
  musikk: "em_musikk_",
  natur: "em_natur_",
  sport: "em_sport_",
  by: "em_by_",
  politikk: "em_pol_",
  populaerkultur: "em_pop_",
  subkultur: "em_sub_",
  litteratur: "em_lit_",
  naeringsliv: "em_naering_",
  film: "em_film_tv_",
  film_tv: "em_film_tv_",
  media: "em_media_"
};

const errors = [];
const warnings = [];
const stats = {
  files: 0,
  places: 0,
  hidden: 0,
  stubs: 0,
  emneIds: 0,
  canonicalEmneIds: 0,
  unknownEmneIds: 0,
  wrongPrefixEmneIds: 0,
  filesWithCanonicalEmner: 0
};

function rel(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, "/");
}

function readJson(filePath, { reportError = true } = {}) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    if (reportError) {
      errors.push(`${rel(filePath)}: could not read/parse JSON (${error.message})`);
    }
    return null;
  }
}

function walkFiles(dirPath, predicate, found = []) {
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

function loadCanonicalEmneRegistry() {
  const registry = new Map();
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
      const emneId = String(item?.emne_id || "").trim();
      if (!emneId) continue;
      fileContributed = true;
      registry.set(emneId, rel(filePath));
    }

    if (fileContributed) stats.filesWithCanonicalEmner += 1;
  }

  for (const filePath of domainMatrixFiles) {
    const data = readJson(filePath, { reportError: false });
    if (!data || typeof data !== "object" || Array.isArray(data)) continue;
    if (!Array.isArray(data.domains)) continue;

    let fileContributed = false;

    for (const domain of data.domains) {
      if (!Array.isArray(domain?.emne_ids)) continue;
      for (const raw of domain.emne_ids) {
        const emneId = String(raw || "").trim();
        if (!emneId) continue;
        fileContributed = true;
        registry.set(emneId, rel(filePath));
      }
    }

    if (fileContributed) stats.filesWithCanonicalEmner += 1;
  }

  return registry;
}

function resolveManifestEntry(entry) {
  const clean = String(entry || "").trim();
  if (!clean) return "";
  if (clean.startsWith("data/")) return path.join(ROOT, clean);
  if (clean.startsWith("places/")) return path.join(ROOT, "data", clean);
  return path.join(ROOT, "data", "places", clean);
}

function asPlacesArray(data, filePath) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.places)) return data.places;
  errors.push(`${rel(filePath)}: expected JSON array or object with places[]`);
  return [];
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function pathExistsFromRoot(assetPath) {
  if (!isNonEmptyString(assetPath)) return false;
  return fs.existsSync(path.join(ROOT, assetPath));
}

function validateTextField(place, field, context, { warnOnly = false } = {}) {
  if (!isNonEmptyString(place[field])) {
    const message = `${context}: missing ${field}`;
    (warnOnly ? warnings : errors).push(message);
  }
}

function validateEmneIds(place, context, canonicalEmneRegistry) {
  if (place.emne_ids == null) return;

  if (!Array.isArray(place.emne_ids)) {
    warnings.push(`${context}: emne_ids should be an array when present`);
    return;
  }

  const category = String(place.category || "").trim();
  const expectedPrefix = CATEGORY_EMNE_PREFIX[category];

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

    if (expectedPrefix && !emneId.startsWith(expectedPrefix)) {
      stats.wrongPrefixEmneIds += 1;
      warnings.push(`${context}: emne_id "${emneId}" does not match category "${category}" expected prefix "${expectedPrefix}"`);
    }

    if (canonicalEmneRegistry.has(emneId)) {
      stats.canonicalEmneIds += 1;
    } else {
      stats.unknownEmneIds += 1;
      warnings.push(`${context}: emne_id "${emneId}" not found in canonical emner registry`);
    }
  });
}

function validatePlace(place, context, seenIds, canonicalEmneRegistry) {
  if (!place || typeof place !== "object" || Array.isArray(place)) {
    errors.push(`${context}: place entry must be an object`);
    return;
  }

  const id = String(place.id || "").trim();
  const hidden = place.hidden === true;
  const stub = place.stub === true;

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

  validateTextField(place, "name", context);
  validateTextField(place, "category", context);

  if (!VALID_CATEGORIES.has(String(place.category || "").trim())) {
    errors.push(`${context}: invalid category "${place.category}"`);
  }

  if (!isFiniteNumber(place.lat) || place.lat < -90 || place.lat > 90) {
    errors.push(`${context}: invalid lat "${place.lat}"`);
  }

  if (!isFiniteNumber(place.lon) || place.lon < -180 || place.lon > 180) {
    errors.push(`${context}: invalid lon "${place.lon}"`);
  }

  if (place.r != null && (!isFiniteNumber(place.r) || place.r <= 0)) {
    errors.push(`${context}: invalid r "${place.r}"`);
  }

  if (place.year != null && !Number.isFinite(Number(place.year))) {
    warnings.push(`${context}: year should be numeric when present`);
  }

  validateEmneIds(place, context, canonicalEmneRegistry);

  if (stub || hidden) return;

  validateTextField(place, "desc", context, { warnOnly: true });
  validateTextField(place, "popupDesc", context, { warnOnly: true });

  if (!isNonEmptyString(place.image)) {
    warnings.push(`${context}: missing image`);
  } else if (!pathExistsFromRoot(place.image)) {
    warnings.push(`${context}: image file not found (${place.image})`);
  }

  if (!isNonEmptyString(place.cardImage)) {
    warnings.push(`${context}: missing cardImage`);
  } else if (!pathExistsFromRoot(place.cardImage)) {
    warnings.push(`${context}: cardImage file not found (${place.cardImage})`);
  }

  if (place.frontImage != null && !pathExistsFromRoot(place.frontImage)) {
    warnings.push(`${context}: frontImage file not found (${place.frontImage})`);
  }

  if (place.popupImage != null && !pathExistsFromRoot(place.popupImage)) {
    warnings.push(`${context}: popupImage file not found (${place.popupImage})`);
  }
}

function main() {
  const canonicalEmneRegistry = loadCanonicalEmneRegistry();
  const manifest = readJson(MANIFEST_PATH);
  const files = Array.isArray(manifest?.files) ? manifest.files : [];

  if (!canonicalEmneRegistry.size) {
    warnings.push(`${rel(FAG_ROOT)}: no canonical emne registry files found`);
  }

  if (!files.length) {
    errors.push(`${rel(MANIFEST_PATH)}: missing files[]`);
  }

  const seenIds = new Map();

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
      const id = place?.id ? `#${place.id}` : `[${index}]`;
      validatePlace(place, `${rel(filePath)} ${id}`, seenIds, canonicalEmneRegistry);
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
