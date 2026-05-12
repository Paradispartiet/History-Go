#!/usr/bin/env node

// tools/placeHealthReport.mjs
// Read-only health report for data/places/manifest.json and all declared place files.
// Reports structural errors and content/asset warnings without modifying source data.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "data", "places", "manifest.json");

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

const errors = [];
const warnings = [];
const stats = {
  files: 0,
  places: 0,
  hidden: 0,
  stubs: 0
};

function rel(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, "/");
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${rel(filePath)}: could not read/parse JSON (${error.message})`);
    return null;
  }
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

function validatePlace(place, context, seenIds) {
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

  if (place.emne_ids != null && !Array.isArray(place.emne_ids)) {
    warnings.push(`${context}: emne_ids should be an array when present`);
  }
}

function main() {
  const manifest = readJson(MANIFEST_PATH);
  const files = Array.isArray(manifest?.files) ? manifest.files : [];

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
      validatePlace(place, `${rel(filePath)} ${id}`, seenIds);
    });
  }

  console.log("History Go PlaceHealthReport");
  console.log(`Files checked: ${stats.files}`);
  console.log(`Places checked: ${stats.places}`);
  console.log(`Hidden places: ${stats.hidden}`);
  console.log(`Stub places: ${stats.stubs}`);
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
