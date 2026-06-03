#!/usr/bin/env node
/*
  History Go i18n audit for place translations.

  Purpose:
  - Norwegian place data is the source/master.
  - Translation files under data/i18n/content/places/{lang}.json are derived content.
  - This script reports missing, stale and extra place translations without changing app data.

  TypeScript migration note:
  - This source is typechecked by tsconfig.scripts.json.
  - No emitted JS/run target is configured yet.
*/

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createPlaceManifestLoader } = require("./i18n-place-manifest-loader");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_LANGS = ["en"];
const placeManifestLoader = createPlaceManifestLoader(ROOT, "i18n-audit");

type JsonObject = Record<string, any>;

type MasterPlace = JsonObject & {
  id?: unknown;
  name?: unknown;
  desc?: unknown;
  popupDesc?: unknown;
  popupdesc?: unknown;
  hidden?: boolean;
  stub?: boolean;
  _sourceFile: string;
  _sourceHash: string;
};

type MasterPlaces = {
  byId: Map<string, MasterPlace>;
  duplicateIds: string[];
};

type AuditRow = {
  id: string;
  sourceFile?: string;
  sourceHash?: string;
  translationHash?: string;
};

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

function normalizeText(value: unknown): string {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function sourcePayload(place: JsonObject): { name: string; desc: string; popupDesc: string } {
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
  console.warn(`[i18n-audit] ${relativePath} is not an array and has no .places array. Skipping.`);
  return [];
}

function loadMasterPlaces(): MasterPlaces {
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

      byId.set(id, {
        ...place,
        _sourceFile: relativePath,
        _sourceHash: sourceHash(place)
      });
    }
  }

  return { byId, duplicateIds };
}

function auditLanguage(lang: string, master: MasterPlaces) {
  const relativePath = `data/i18n/content/places/${lang}.json`;
  const translations = tryReadJson(relativePath) || {};
  const translationIds = new Set(Object.keys(translations));

  const missing = [];
  const stale = [];
  const missingSourceHash = [];
  const ok = [];
  const extra = [];

  for (const [id, place] of master.byId.entries()) {
    const tr = translations[id];
    if (!tr) {
      missing.push({ id, sourceFile: place._sourceFile, sourceHash: place._sourceHash });
      continue;
    }

    const trHash = String(tr._sourceHash || "").trim();
    if (!trHash) {
      missingSourceHash.push({ id, sourceFile: place._sourceFile, sourceHash: place._sourceHash });
      continue;
    }

    if (trHash !== place._sourceHash) {
      stale.push({
        id,
        sourceFile: place._sourceFile,
        translationHash: trHash,
        sourceHash: place._sourceHash
      });
      continue;
    }

    ok.push({ id, sourceFile: place._sourceFile, sourceHash: place._sourceHash });
  }

  for (const id of translationIds) {
    if (!master.byId.has(id)) extra.push({ id });
  }

  return {
    lang,
    file: relativePath,
    exists: !!tryReadJson(relativePath),
    counts: {
      masterPlaces: master.byId.size,
      ok: ok.length,
      missing: missing.length,
      stale: stale.length,
      missingSourceHash: missingSourceHash.length,
      extra: extra.length
    },
    ok,
    missing,
    stale,
    missingSourceHash,
    extra
  };
}

function printList(title: string, rows: AuditRow[], limit = 25): void {
  console.log(`\n${title}: ${rows.length}`);
  rows.slice(0, limit).forEach(row => {
    const parts = [`- ${row.id}`];
    if (row.sourceHash) parts.push(`sourceHash=${row.sourceHash}`);
    if (row.translationHash) parts.push(`translationHash=${row.translationHash}`);
    if (row.sourceFile) parts.push(`file=${row.sourceFile}`);
    console.log(parts.join(" | "));
  });
  if (rows.length > limit) console.log(`... ${rows.length - limit} more`);
}

function main(): void {
  const langs = process.argv.slice(2).map(x => String(x || "").trim()).filter(Boolean);
  const targetLangs = langs.length ? langs : DEFAULT_LANGS;

  const master = loadMasterPlaces();

  console.log("History Go place translation audit");
  console.log("Norwegian place data is master. Translation files are derived.");
  console.log(`Master places: ${master.byId.size}`);

  if (master.duplicateIds.length) {
    printList("Duplicate master place IDs", master.duplicateIds.map(id => ({ id })), 50);
  }

  let hasProblems = false;

  for (const lang of targetLangs) {
    const result = auditLanguage(lang, master);
    const c = result.counts;

    console.log(`\n================ ${lang} ================`);
    console.log(`File: ${result.file}${result.exists ? "" : " (missing)"}`);
    console.log(`OK: ${c.ok}`);
    console.log(`Missing: ${c.missing}`);
    console.log(`Stale: ${c.stale}`);
    console.log(`Missing _sourceHash: ${c.missingSourceHash}`);
    console.log(`Extra translation IDs: ${c.extra}`);

    printList("Stale translations", result.stale);
    printList("Translations missing _sourceHash", result.missingSourceHash);
    printList("Missing translations", result.missing);
    printList("Extra translation IDs", result.extra);

    if (c.missing || c.stale || c.missingSourceHash || c.extra) {
      hasProblems = true;
    }
  }

  if (hasProblems) {
    console.log("\nAudit completed with translation work needed.");
    process.exitCode = 1;
  } else {
    console.log("\nAudit completed. All checked translations are in sync.");
  }
}

main();
