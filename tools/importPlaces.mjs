#!/usr/bin/env node

// tools/importPlaces.mjs
// Safe importer for appending new History Go places to existing manifest-listed place files.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  getPlaceCategoryPolicyStatus,
  REQUIRED_PLACE_FIELDS,
  RECOMMENDED_PLACE_FIELDS
} from "./placeSchemaPolicy.mjs";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "data", "places", "manifest.json");
const DEFAULT_IMPORT_PATH = path.join(ROOT, "data", "import", "new-places.json");

function rel(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, "/");
}

function usage() {
  console.log(`Usage: node tools/importPlaces.mjs [--file <path>] [--dry-run]\n\nOptions:\n  --file <path>  Import JSON array to read (default: data/import/new-places.json)\n  --dry-run      Validate and report without writing files\n  --help         Show this help`);
}

function parseArgs(argv) {
  const options = {
    file: DEFAULT_IMPORT_PATH,
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--file") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--file requires a path");
      }
      options.file = path.resolve(ROOT, value);
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function resolveManifestEntry(entry) {
  const clean = String(entry || "").trim();
  if (!clean) return "";
  if (clean.startsWith("data/")) return path.join(ROOT, clean);
  if (clean.startsWith("places/")) return path.join(ROOT, "data", clean);
  return path.join(ROOT, "data", "places", clean);
}

function asPlacesArray(data, filePath, errors) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.places)) return data.places;
  errors.push(`${rel(filePath)}: expected JSON array or object with places[]`);
  return [];
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function slugifyPlaceId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("æ", "ae")
    .replaceAll("ø", "o")
    .replaceAll("å", "a")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s_.-]+/g, "")
    .replace(/[\s_.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function uniqueGeneratedId(baseId, usedIds) {
  const fallbackBase = baseId || "place";
  if (!usedIds.has(fallbackBase)) return fallbackBase;

  let suffix = 2;
  while (usedIds.has(`${fallbackBase}_${suffix}`)) {
    suffix += 1;
  }
  return `${fallbackBase}_${suffix}`;
}

function formatList(items, emptyLabel = "(none)") {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : emptyLabel;
}

function loadManifest(errors) {
  let manifest;
  try {
    manifest = readJson(MANIFEST_PATH);
  } catch (error) {
    errors.push(`${rel(MANIFEST_PATH)}: could not read/parse JSON (${error.message})`);
    return { entries: [], entryToPath: new Map() };
  }

  const entries = Array.isArray(manifest?.files) ? manifest.files : [];
  if (!entries.length) {
    errors.push(`${rel(MANIFEST_PATH)}: missing files[]`);
  }

  const entryToPath = new Map();
  for (const entry of entries) {
    const cleanEntry = String(entry || "").trim();
    if (!cleanEntry) {
      errors.push(`${rel(MANIFEST_PATH)}: empty manifest entry`);
      continue;
    }
    entryToPath.set(cleanEntry, resolveManifestEntry(cleanEntry));
  }

  return { entries, entryToPath };
}

function loadExistingPlaces(entryToPath, errors) {
  const existingIds = new Set();
  const fileData = new Map();

  for (const [entry, filePath] of entryToPath.entries()) {
    if (!fs.existsSync(filePath)) {
      errors.push(`${rel(MANIFEST_PATH)}: manifest entry not found (${entry} -> ${rel(filePath)})`);
      continue;
    }

    let data;
    try {
      data = readJson(filePath);
    } catch (error) {
      errors.push(`${rel(filePath)}: could not read/parse JSON (${error.message})`);
      continue;
    }

    const places = asPlacesArray(data, filePath, errors);
    fileData.set(entry, { filePath, data, places });

    for (const place of places) {
      const id = String(place?.id || "").trim();
      if (id) existingIds.add(id);
    }
  }

  return { existingIds, fileData };
}

function validateAndPrepareImport(importItems, entryToPath, existingIds) {
  const errors = [];
  const warnings = [];
  const usedIds = new Set(existingIds);
  const preparedPlaces = [];
  const targetFiles = new Set();

  importItems.forEach((item, index) => {
    const context = `import[${index}]`;

    if (!isPlainObject(item)) {
      errors.push(`${context}: import entry must be an object`);
      return;
    }

    const targetFile = String(item.targetFile || "").trim();
    if (!targetFile) {
      errors.push(`${context}: missing targetFile`);
    } else if (!entryToPath.has(targetFile)) {
      errors.push(`${context}: targetFile not found in manifest (${targetFile})`);
    } else {
      targetFiles.add(targetFile);
    }

    const place = { ...item };
    delete place.targetFile;

    if (!isNonEmptyString(place.id)) {
      const generatedId = uniqueGeneratedId(slugifyPlaceId(place.name), usedIds);
      place.id = generatedId;
      warnings.push(`${context}: generated id "${generatedId}" from name`);
    } else {
      place.id = String(place.id).trim();
      if (existingIds.has(place.id)) {
        errors.push(`${context}: id "${place.id}" already exists`);
      } else if (usedIds.has(place.id)) {
        errors.push(`${context}: duplicate import id "${place.id}"`);
      }
    }

    if (isNonEmptyString(place.id)) {
      usedIds.add(place.id);
    }

    if (place.r == null) {
      place.r = 150;
      warnings.push(`${context} #${place.id}: missing r; defaulted to 150`);
    }

    for (const field of REQUIRED_PLACE_FIELDS) {
      if (field === "lat" || field === "lon") continue;
      if (!isNonEmptyString(place[field])) {
        errors.push(`${context}: missing ${field}`);
      }
    }

    const categoryStatus = getPlaceCategoryPolicyStatus(place.category);
    if (categoryStatus === "unknown") {
      errors.push(`${context} #${place.id}: unknown category "${place.category}"`);
    } else if (categoryStatus === "legacy_or_secondary") {
      warnings.push(`${context} #${place.id}: legacy/secondary category "${place.category}"`);
    }

    if (!isFiniteNumber(place.lat)) {
      errors.push(`${context} #${place.id}: lat must be a number`);
    }

    if (!isFiniteNumber(place.lon)) {
      errors.push(`${context} #${place.id}: lon must be a number`);
    }

    if (place.year != null && !isFiniteNumber(place.year)) {
      errors.push(`${context} #${place.id}: year must be a number when present`);
    }

    if (!isNonEmptyString(place.desc)) {
      warnings.push(`${context} #${place.id}: missing desc`);
    }

    for (const field of RECOMMENDED_PLACE_FIELDS) {
      if (field === "r" || field === "desc" || field === "year") continue;
      if (place[field] == null) {
        warnings.push(`${context} #${place.id}: missing recommended field ${field}`);
      }
    }

    preparedPlaces.push({ targetFile, place });
  });

  return { errors, warnings, preparedPlaces, targetFiles: [...targetFiles].sort() };
}

function writeImports(preparedPlaces, fileData) {
  const changedFiles = new Set();
  const byTarget = new Map();

  for (const prepared of preparedPlaces) {
    if (!byTarget.has(prepared.targetFile)) byTarget.set(prepared.targetFile, []);
    byTarget.get(prepared.targetFile).push(prepared.place);
  }

  for (const [targetFile, placesToAdd] of byTarget.entries()) {
    const target = fileData.get(targetFile);
    target.places.push(...placesToAdd);
    fs.writeFileSync(target.filePath, `${JSON.stringify(target.data, null, 2)}\n`);
    changedFiles.add(rel(target.filePath));
  }

  return [...changedFiles].sort();
}

function printReport({ dryRun, importCount, targetFiles, ids, warnings, errors, changedFiles = [] }) {
  console.log("History Go Places Import");
  console.log(`Mode: ${dryRun ? "dry-run" : "import"}`);
  console.log(`Import entries: ${importCount}`);

  if (dryRun) {
    console.log("\nTarget files that would be changed:");
    console.log(formatList(targetFiles));
    console.log("\nIDs that exist/would be used:");
    console.log(formatList(ids));
  } else {
    console.log(`Imported places: ${errors.length ? 0 : importCount}`);
    console.log("\nChanged files:");
    console.log(formatList(changedFiles));
    console.log(`\n${errors.length ? "IDs prepared (not written):" : "IDs added:"}`);
    console.log(formatList(ids));
  }

  console.log(`\nWarnings: ${warnings.length}`);
  if (warnings.length) console.log(formatList(warnings));

  console.log(`\nErrors: ${errors.length}`);
  if (errors.length) console.log(formatList(errors));

  if (dryRun) {
    console.log(`\nDry-run result: ${errors.length ? "BLOCKED - import would not write files" : "OK - import would be allowed"}`);
  } else if (!errors.length) {
    console.log("\nNext recommended checks:");
    console.log("- npm run health:places");
    console.log("- npm run health:data");
  }
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    usage();
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    usage();
    return;
  }

  const setupErrors = [];
  const { entryToPath } = loadManifest(setupErrors);
  const { existingIds, fileData } = loadExistingPlaces(entryToPath, setupErrors);

  let importItems = [];
  try {
    importItems = readJson(options.file);
  } catch (error) {
    setupErrors.push(`${rel(options.file)}: could not read/parse JSON (${error.message})`);
  }

  if (!Array.isArray(importItems)) {
    setupErrors.push(`${rel(options.file)}: expected JSON array`);
    importItems = [];
  }

  const prepared = validateAndPrepareImport(importItems, entryToPath, existingIds);
  const errors = [...setupErrors, ...prepared.errors];
  const ids = prepared.preparedPlaces.map(({ place }) => place.id).filter(Boolean);

  if (errors.length) {
    printReport({
      dryRun: options.dryRun,
      importCount: importItems.length,
      targetFiles: prepared.targetFiles,
      ids,
      warnings: prepared.warnings,
      errors
    });
    process.exitCode = 1;
    return;
  }

  let changedFiles = [];
  if (!options.dryRun) {
    changedFiles = writeImports(prepared.preparedPlaces, fileData);
  }

  printReport({
    dryRun: options.dryRun,
    importCount: importItems.length,
    targetFiles: prepared.targetFiles,
    ids,
    warnings: prepared.warnings,
    errors,
    changedFiles
  });
}

main();
