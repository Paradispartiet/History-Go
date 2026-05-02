#!/usr/bin/env node
/*
  History Go i18n worklist for place translations.

  Purpose:
  - Norwegian place data is master.
  - This script creates a precise translation worklist for one language.
  - It includes only missing, stale, or missing-hash entries by default.
  - It does not translate content and does not change any files.

  Usage:
    node scripts/i18n-worklist-places.js en
    node scripts/i18n-worklist-places.js en --limit=20
    node scripts/i18n-worklist-places.js en --only=missing
    node scripts/i18n-worklist-places.js en --only=stale
    node scripts/i18n-worklist-places.js en --only=missing,stale,missingSourceHash
    node scripts/i18n-worklist-places.js en --out=tmp/i18n/places-en-worklist.json
*/

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createPlaceManifestLoader } = require("./i18n-place-manifest-loader");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_LANG = "en";
const DEFAULT_ONLY = new Set(["missing", "stale", "missingSourceHash"]);
const placeManifestLoader = createPlaceManifestLoader(ROOT, "i18n-worklist");


function parseArgs(argv) {
  const args = {
    lang: DEFAULT_LANG,
    limit: null,
    out: null,
    only: new Set(DEFAULT_ONLY)
  };

  const positional = [];

  for (const raw of argv) {
    const arg = String(raw || "").trim();
    if (!arg) continue;

    if (arg.startsWith("--limit=")) {
      const n = Number(arg.slice("--limit=".length));
      args.limit = Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
      continue;
    }

    if (arg.startsWith("--out=")) {
      args.out = arg.slice("--out=".length).trim() || null;
      continue;
    }

    if (arg.startsWith("--only=")) {
      args.only = new Set(
        arg
          .slice("--only=".length)
          .split(",")
          .map(x => x.trim())
          .filter(Boolean)
      );
      continue;
    }

    positional.push(arg);
  }

  if (positional[0]) args.lang = positional[0];
  return args;
}

function readJson(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function tryReadJson(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(filePath)) return null;
  return readJson(relativePath);
}

function writeJson(relativePath, data) {
  const filePath = path.isAbsolute(relativePath)
    ? relativePath
    : path.join(ROOT, relativePath);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function sourcePayload(place) {
  return {
    name: normalizeText(place.name),
    desc: normalizeText(place.desc),
    popupDesc: normalizeText(place.popupDesc || place.popupdesc)
  };
}

function sourceHash(place) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(sourcePayload(place)))
    .digest("hex")
    .slice(0, 16);
}

function extractRows(data, relativePath) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.places)) return data.places;
  console.warn(`[i18n-worklist] ${relativePath} is not an array and has no .places array. Skipping.`);
  return [];
}

function loadMasterPlaces() {
  const byId = new Map();
  const duplicateIds = [];
  const placeFiles = placeManifestLoader.loadManifestPlaceFiles();

  for (const relativePath of placeFiles) {
    const data = placeManifestLoader.readJson(relativePath);
    const rows = extractRows(data, relativePath);

    for (const place of rows) {
      const id = String(place?.id || "").trim();
      if (!id) continue;
      if (place.hidden === true || place.stub === true) continue;

      if (byId.has(id)) {
        duplicateIds.push(id);
        continue;
      }

      const payload = sourcePayload(place);
      byId.set(id, {
        id,
        sourceFile: relativePath,
        sourceHash: sourceHash(place),
        category: String(place.category || "").trim(),
        year: place.year ?? null,
        source: payload
      });
    }
  }

  return { byId, duplicateIds };
}

function classifyTranslation(masterPlace, translation) {
  if (!translation) return "missing";

  const trHash = String(translation._sourceHash || "").trim();
  if (!trHash) return "missingSourceHash";
  if (trHash !== masterPlace.sourceHash) return "stale";

  return "ok";
}

function buildWorklist(lang, only, limit) {
  const master = loadMasterPlaces();
  const translationPath = `data/i18n/content/places/${lang}.json`;
  const translations = tryReadJson(translationPath) || {};
  const items = [];

  for (const [id, place] of master.byId.entries()) {
    const existing = translations[id] || null;
    const status = classifyTranslation(place, existing);
    if (!only.has(status)) continue;

    items.push({
      id,
      lang,
      status,
      sourceFile: place.sourceFile,
      sourceHash: place.sourceHash,
      category: place.category,
      year: place.year,
      source: place.source,
      existingTranslation: existing
        ? {
            _sourceHash: existing._sourceHash || "",
            _status: existing._status || "",
            name: existing.name || "",
            desc: existing.desc || "",
            popupDesc: existing.popupDesc || existing.popupdesc || ""
          }
        : null,
      requiredOutputShape: {
        _sourceHash: place.sourceHash,
        _status: "machine_translated",
        name: "",
        desc: "",
        popupDesc: ""
      }
    });
  }

  const limitedItems = Number.isFinite(limit) ? items.slice(0, limit) : items;

  return {
    generatedAt: new Date().toISOString(),
    lang,
    sourceLanguage: "nb",
    master: placeManifestLoader.manifestPath,
    translationFile: translationPath,
    policy: {
      norwegianIsMaster: true,
      doNotEditMasterPlaceData: true,
      translateOnlyItemsInThisWorklist: true,
      preserveIdsExactly: true,
      writeTranslationsTo: translationPath
    },
    counts: {
      masterPlaces: master.byId.size,
      duplicateMasterIds: master.duplicateIds.length,
      matchingItemsBeforeLimit: items.length,
      emittedItems: limitedItems.length
    },
    duplicateMasterIds: master.duplicateIds,
    items: limitedItems
  };
}

function printSummary(worklist) {
  const byStatus = worklist.items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  console.log("History Go place translation worklist");
  console.log(`Language: ${worklist.lang}`);
  console.log(`Translation file: ${worklist.translationFile}`);
  console.log(`Master places: ${worklist.counts.masterPlaces}`);
  console.log(`Items before limit: ${worklist.counts.matchingItemsBeforeLimit}`);
  console.log(`Emitted items: ${worklist.counts.emittedItems}`);
  console.log("By status:", byStatus);

  worklist.items.slice(0, 20).forEach(item => {
    console.log(`- ${item.id} | ${item.status} | ${item.sourceHash} | ${item.sourceFile}`);
  });

  if (worklist.items.length > 20) {
    console.log(`... ${worklist.items.length - 20} more`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const worklist = buildWorklist(args.lang, args.only, args.limit);

  if (args.out) {
    writeJson(args.out, worklist);
    printSummary(worklist);
    console.log(`\nWrote ${args.out}`);
    return;
  }

  console.log(JSON.stringify(worklist, null, 2));
}

main();
