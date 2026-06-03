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
const { createPlaceManifestLoader, resolveRepoRoot } = require("./i18n-place-manifest-loader");

const ROOT = resolveRepoRoot(__dirname);
const DEFAULT_LANG = "en";
const DEFAULT_ONLY = new Set(["missing", "stale", "missingSourceHash"]);
const placeManifestLoader = createPlaceManifestLoader(ROOT, "i18n-worklist");

type JsonObject = Record<string, any>;

type SourcePayload = { name: string; desc: string; popupDesc: string };

type TranslationStatus = "missing" | "missingSourceHash" | "stale" | "ok";

type WorklistArgs = {
  lang: string;
  limit: number | null;
  out: string | null;
  only: Set<string>;
};

type MasterPlace = {
  id: string;
  sourceFile: string;
  sourceHash: string;
  category: string;
  year: unknown;
  source: SourcePayload;
};

type MasterPlaces = { byId: Map<string, MasterPlace>; duplicateIds: string[] };

type WorklistItem = {
  id: string;
  lang: string;
  status: TranslationStatus;
  sourceFile: string;
  sourceHash: string;
  category: string;
  year: unknown;
  source: SourcePayload;
  existingTranslation: {
    _sourceHash: any;
    _status: any;
    name: any;
    desc: any;
    popupDesc: any;
  } | null;
  requiredOutputShape: {
    _sourceHash: string;
    _status: string;
    name: string;
    desc: string;
    popupDesc: string;
  };
};

type Worklist = {
  generatedAt: string;
  lang: string;
  sourceLanguage: string;
  master: string;
  translationFile: string;
  policy: JsonObject;
  counts: {
    masterPlaces: number;
    duplicateMasterIds: number;
    matchingItemsBeforeLimit: number;
    emittedItems: number;
  };
  duplicateMasterIds: string[];
  items: WorklistItem[];
};

function parseArgs(argv: string[]): WorklistArgs {
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

function readJson(relativePath: string): any {
  const filePath = path.join(ROOT, relativePath);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function tryReadJson(relativePath: string): any | null {
  const filePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(filePath)) return null;
  return readJson(relativePath);
}

function writeJson(relativePath: string, data: any): void {
  const filePath = path.isAbsolute(relativePath)
    ? relativePath
    : path.join(ROOT, relativePath);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function normalizeText(value: unknown): string {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function sourcePayload(place: JsonObject): SourcePayload {
  return {
    name: normalizeText(place.name),
    desc: normalizeText(place.desc),
    popupDesc: normalizeText(place.popupDesc || place.popupdesc)
  };
}

function sourceHash(place: JsonObject): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(sourcePayload(place)))
    .digest("hex")
    .slice(0, 16);
}

function extractRows(data: any, relativePath: string): JsonObject[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.places)) return data.places;
  console.warn(`[i18n-worklist] ${relativePath} is not an array and has no .places array. Skipping.`);
  return [];
}

function loadMasterPlaces(): MasterPlaces {
  const byId = new Map<string, MasterPlace>();
  const duplicateIds: string[] = [];
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

function classifyTranslation(masterPlace: MasterPlace, translation: JsonObject | null): TranslationStatus {
  if (!translation) return "missing";

  const trHash = String(translation._sourceHash || "").trim();
  if (!trHash) return "missingSourceHash";
  if (trHash !== masterPlace.sourceHash) return "stale";

  return "ok";
}

function buildWorklist(lang: string, only: Set<string>, limit: number | null): Worklist {
  const master = loadMasterPlaces();
  const translationPath = `data/i18n/content/places/${lang}.json`;
  const translations: Record<string, JsonObject> = tryReadJson(translationPath) || {};
  const items: WorklistItem[] = [];

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

function printSummary(worklist: Worklist): void {
  const byStatus = worklist.items.reduce((acc: Record<string, number>, item) => {
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

function main(): void {
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
