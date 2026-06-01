#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  REQUIRED_PLACE_FIELDS,
  getPlaceCategoryPolicyStatus
} from "./placeSchemaPolicy.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const dataRoot = path.join(repoRoot, "data");
const placesRoot = path.join(dataRoot, "places");
const manifestPath = path.join(placesRoot, "manifest.json");
const defaultImportPath = path.join(repoRoot, "data", "import", "new-places.json");

function usage() {
  return `Usage: node tools/importPlaces.mjs [--file data/import/new-places.json] [--dry-run]\n\nOptions:\n  --file <path>   Import JSON array to read. Defaults to data/import/new-places.json.\n  --dry-run       Validate and report without writing place files.\n  --help          Show this help text.`;
}

function parseArgs(argv) {
  const options = {
    file: defaultImportPath,
    dryRun: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--file") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--file requires a path argument.");
      }
      options.file = path.resolve(repoRoot, value);
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read ${label} (${path.relative(repoRoot, filePath)}): ${error.message}`);
  }
}

function slugifyPlaceName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replaceAll("æ", "ae")
    .replaceAll("ø", "o")
    .replaceAll("å", "a")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_");
}

function uniqueGeneratedId(baseId, reservedIds) {
  const fallbackBase = baseId || "place";
  if (!reservedIds.has(fallbackBase)) return fallbackBase;

  let suffix = 2;
  let candidate = `${fallbackBase}_${suffix}`;
  while (reservedIds.has(candidate)) {
    suffix += 1;
    candidate = `${fallbackBase}_${suffix}`;
  }
  return candidate;
}

function loadManifest() {
  const manifest = readJson(manifestPath, "place manifest");
  if (!manifest || !Array.isArray(manifest.files)) {
    throw new Error("data/places/manifest.json must contain a files array.");
  }
  return manifest.files;
}

function loadExistingPlaces(manifestFiles) {
  const existingIds = new Set();
  const placeFiles = new Map();

  for (const manifestFile of manifestFiles) {
    const absolutePath = path.join(dataRoot, manifestFile);
    const places = readJson(absolutePath, `place file ${manifestFile}`);
    if (!Array.isArray(places)) {
      throw new Error(`Manifest file ${manifestFile} must contain a JSON array.`);
    }

    placeFiles.set(manifestFile, {
      absolutePath,
      places
    });

    for (const place of places) {
      if (place && typeof place === "object" && typeof place.id === "string" && place.id.trim()) {
        existingIds.add(place.id);
      }
    }
  }

  return { existingIds, placeFiles };
}

function orderPlaceFields(place) {
  const preferredOrder = ["id", "name", "lat", "lon", "r", "category", "year", "desc"];
  const ordered = {};

  for (const field of preferredOrder) {
    if (Object.prototype.hasOwnProperty.call(place, field)) {
      ordered[field] = place[field];
    }
  }

  for (const [field, value] of Object.entries(place)) {
    if (!Object.prototype.hasOwnProperty.call(ordered, field)) {
      ordered[field] = value;
    }
  }

  return ordered;
}

function validateAndPrepareImport(importRows, manifestFiles, existingIds) {
  const manifestFileSet = new Set(manifestFiles);
  const reservedIds = new Set(existingIds);
  const errors = [];
  const warnings = [];
  const generatedIds = [];
  const preparedByTarget = new Map();

  importRows.forEach((row, index) => {
    const rowLabel = `row ${index + 1}`;

    if (!row || typeof row !== "object" || Array.isArray(row)) {
      errors.push(`${rowLabel}: import post must be a JSON object.`);
      return;
    }

    const targetFile = row.targetFile;
    if (typeof targetFile !== "string" || !targetFile.trim()) {
      errors.push(`${rowLabel}: targetFile is required.`);
    } else if (!manifestFileSet.has(targetFile)) {
      errors.push(`${rowLabel}: targetFile '${targetFile}' is not listed in data/places/manifest.json.`);
    }

    const place = { ...row };
    delete place.targetFile;

    if (place.id === undefined || place.id === null || String(place.id).trim() === "") {
      const generatedId = uniqueGeneratedId(slugifyPlaceName(place.name), reservedIds);
      place.id = generatedId;
      reservedIds.add(generatedId);
      generatedIds.push(`${rowLabel}: ${generatedId}`);
    } else if (typeof place.id !== "string") {
      errors.push(`${rowLabel}: id must be a string when provided.`);
    } else {
      place.id = place.id.trim();
      if (reservedIds.has(place.id)) {
        errors.push(`${rowLabel}: id '${place.id}' already exists.`);
      } else {
        reservedIds.add(place.id);
      }
    }

    if (place.r === undefined || place.r === null) {
      place.r = 150;
    } else if (typeof place.r !== "number" || Number.isNaN(place.r)) {
      errors.push(`${rowLabel}: r must be a number when provided.`);
    }

    for (const field of REQUIRED_PLACE_FIELDS) {
      if (place[field] === undefined || place[field] === null || place[field] === "") {
        errors.push(`${rowLabel}: required field '${field}' is missing.`);
      }
    }

    if (typeof place.lat !== "number" || Number.isNaN(place.lat)) {
      errors.push(`${rowLabel}: lat must be a number.`);
    }
    if (typeof place.lon !== "number" || Number.isNaN(place.lon)) {
      errors.push(`${rowLabel}: lon must be a number.`);
    }
    if (place.year !== undefined && (typeof place.year !== "number" || Number.isNaN(place.year))) {
      errors.push(`${rowLabel}: year must be a number when provided.`);
    }

    const categoryStatus = getPlaceCategoryPolicyStatus(place.category);
    if (categoryStatus === "unknown") {
      errors.push(`${rowLabel}: category '${place.category}' is unknown.`);
    } else if (categoryStatus === "legacy_or_secondary") {
      warnings.push(`${rowLabel}: category '${place.category}' is legacy_or_secondary.`);
    }

    if (typeof place.desc !== "string" || !place.desc.trim()) {
      warnings.push(`${rowLabel}: desc is recommended.`);
    }

    if (targetFile && manifestFileSet.has(targetFile)) {
      if (!preparedByTarget.has(targetFile)) preparedByTarget.set(targetFile, []);
      preparedByTarget.get(targetFile).push(orderPlaceFields(place));
    }
  });

  return {
    errors,
    warnings,
    generatedIds,
    preparedByTarget
  };
}

function printReport({ importCount, inputFile, dryRun, generatedIds, warnings, errors, preparedByTarget }) {
  const targetFiles = [...preparedByTarget.keys()];

  console.log(`Places import${dryRun ? " dry-run" : ""}`);
  console.log(`Input file: ${path.relative(repoRoot, inputFile)}`);
  console.log(`Import posts: ${importCount}`);
  console.log(`Target files that ${dryRun ? "would be" : "will be"} changed: ${targetFiles.length}`);
  for (const targetFile of targetFiles) {
    console.log(`  - ${targetFile}: ${preparedByTarget.get(targetFile).length} place(s)`);
  }

  console.log(`Generated ids: ${generatedIds.length}`);
  for (const generatedId of generatedIds) {
    console.log(`  - ${generatedId}`);
  }

  console.log(`Warnings: ${warnings.length}`);
  for (const warning of warnings) {
    console.log(`  - ${warning}`);
  }

  console.log(`Errors: ${errors.length}`);
  for (const error of errors) {
    console.log(`  - ${error}`);
  }
}

function writeImports(preparedByTarget, placeFiles) {
  for (const [targetFile, newPlaces] of preparedByTarget) {
    const placeFile = placeFiles.get(targetFile);
    const nextPlaces = [...placeFile.places, ...newPlaces];
    fs.writeFileSync(placeFile.absolutePath, `${JSON.stringify(nextPlaces, null, 2)}\n`, "utf8");
  }
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.error(usage());
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    console.log(usage());
    return;
  }

  try {
    const manifestFiles = loadManifest();
    const { existingIds, placeFiles } = loadExistingPlaces(manifestFiles);
    const importRows = readJson(options.file, "import file");

    if (!Array.isArray(importRows)) {
      throw new Error(`Import file must contain a JSON array: ${path.relative(repoRoot, options.file)}`);
    }

    const report = validateAndPrepareImport(importRows, manifestFiles, existingIds);
    printReport({
      importCount: importRows.length,
      inputFile: options.file,
      dryRun: options.dryRun,
      ...report
    });

    if (report.errors.length > 0) {
      console.error("Import aborted because the import file has hard errors. No files were written.");
      process.exitCode = 1;
      return;
    }

    if (options.dryRun) {
      console.log("Dry-run complete. No files were written.");
      return;
    }

    writeImports(report.preparedByTarget, placeFiles);
    console.log("Import complete.");
    console.log("Recommended next checks:");
    console.log("  npm run health:places");
    console.log("  npm run health:data");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
