#!/usr/bin/env node
/*
  History Go i18n source-hash stamper for place translations.

  Purpose:
  - Adds/updates _sourceHash on existing place translations.
  - Does not create new translations.
  - Does not edit master place data.

  Usage:
    node scripts/i18n-stamp-places.js
    node scripts/i18n-stamp-places.js en
*/

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_LANGS = ["en"];

const PLACE_FILES = [
  "data/places/places_by.json",
  "data/places/places_historie.json",
  "data/places/places_kunst.json",
  "data/places/places_litteratur.json",
  "data/places/places_musikk.json",
  "data/places/places_naeringsliv.json",
  "data/places/places_natur.json",
  "data/places/places_politikk.json",
  "data/places/places_sport.json",
  "data/places/places_subkultur.json",
  "data/places/places_vitenskap.json"
];

function readJson(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function writeJson(relativePath, data) {
  const filePath = path.join(ROOT, relativePath);
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
  console.warn(`[i18n-stamp] ${relativePath} is not an array and has no .places array. Skipping.`);
  return [];
}

function loadMasterPlaces() {
  const byId = new Map();

  for (const relativePath of PLACE_FILES) {
    const data = readJson(relativePath);
    const rows = extractRows(data, relativePath);

    for (const place of rows) {
      const id = String(place?.id || "").trim();
      if (!id) continue;
      if (place.hidden === true || place.stub === true) continue;
      if (byId.has(id)) continue;

      byId.set(id, {
        ...place,
        _sourceFile: relativePath,
        _sourceHash: sourceHash(place)
      });
    }
  }

  return byId;
}

function stampLanguage(lang, masterById) {
  const relativePath = `data/i18n/content/places/${lang}.json`;
  const filePath = path.join(ROOT, relativePath);

  if (!fs.existsSync(filePath)) {
    console.log(`[i18n-stamp] ${relativePath} does not exist. Skipping.`);
    return { lang, changed: 0, missingMaster: 0, total: 0 };
  }

  const translations = readJson(relativePath);
  let changed = 0;
  let missingMaster = 0;
  let total = 0;

  for (const [id, entry] of Object.entries(translations || {})) {
    total += 1;
    const master = masterById.get(id);
    if (!master) {
      missingMaster += 1;
      continue;
    }

    if (!entry || typeof entry !== "object") continue;

    const nextHash = master._sourceHash;
    if (entry._sourceHash !== nextHash) {
      entry._sourceHash = nextHash;
      changed += 1;
    }

    if (!entry._status) entry._status = "machine_translated";
  }

  if (changed) writeJson(relativePath, translations);

  return { lang, changed, missingMaster, total };
}

function main() {
  const langs = process.argv.slice(2).map(x => String(x || "").trim()).filter(Boolean);
  const targetLangs = langs.length ? langs : DEFAULT_LANGS;
  const masterById = loadMasterPlaces();

  console.log("History Go place translation source-hash stamper");
  console.log(`Master places: ${masterById.size}`);

  for (const lang of targetLangs) {
    const result = stampLanguage(lang, masterById);
    console.log(`\n${lang}`);
    console.log(`- entries: ${result.total}`);
    console.log(`- hashes changed: ${result.changed}`);
    console.log(`- translation IDs without master place: ${result.missingMaster}`);
  }

  console.log("\nDone.");
}

main();
