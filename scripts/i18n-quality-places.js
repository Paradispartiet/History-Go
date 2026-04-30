#!/usr/bin/env node
/*
  History Go place translation quality audit.
  Norwegian place data is master. This script only reads files.

  Usage:
    node scripts/i18n-quality-places.js en
    node scripts/i18n-quality-places.js en --fail-on-warning
*/

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const lang = (process.argv.find(a => !a.startsWith("--") && a !== __filename && a !== process.argv[0]) || "en").trim();
const failOnWarning = process.argv.includes("--fail-on-warning");

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

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function tryReadJson(rel) {
  const full = path.join(ROOT, rel);
  return fs.existsSync(full) ? readJson(rel) : {};
}

function norm(x) {
  return String(x || "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function words(x) {
  const s = norm(x).toLowerCase().replace(/[^a-z0-9æøåéèêàáäöüñçßа-я一-龥ぁ-んァ-ン가-힣\s]+/gi, " ").replace(/\s+/g, " ").trim();
  return s ? s.split(" ").length : 0;
}

function paras(x) {
  return String(x || "").split(/\n\s*\n/g).map(p => p.trim()).filter(Boolean).length;
}

function payload(p) {
  return {
    name: norm(p.name),
    desc: norm(p.desc),
    popupDesc: norm(p.popupDesc || p.popupdesc)
  };
}

function hash(p) {
  return crypto.createHash("sha256").update(JSON.stringify(payload(p))).digest("hex").slice(0, 16);
}

function rows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data && data.places)) return data.places;
  return [];
}

function loadMaster() {
  const map = new Map();
  for (const file of PLACE_FILES) {
    for (const p of rows(readJson(file))) {
      const id = norm(p && p.id);
      if (!id || p.hidden === true || p.stub === true || map.has(id)) continue;
      map.set(id, { id, file, hash: hash(p), source: payload(p) });
    }
  }
  return map;
}

function add(list, severity, code, text) {
  list.push({ severity, code, text });
}

const master = loadMaster();
const trPath = `data/i18n/content/places/${lang}.json`;
const translations = tryReadJson(trPath);
const results = [];
let errors = 0;
let warnings = 0;

for (const [id, tr] of Object.entries(translations)) {
  const m = master.get(id);
  const issues = [];

  if (!m) {
    add(issues, "error", "extra_translation_id", "Translation id has no master place.");
  } else {
    const name = norm(tr.name);
    const desc = norm(tr.desc);
    const popup = norm(tr.popupDesc || tr.popupdesc);
    const sourcePopupWords = words(m.source.popupDesc);
    const translatedPopupWords = words(popup);

    if (!name) add(issues, "error", "missing_name", "Missing translated name.");
    if (!desc) add(issues, "error", "missing_desc", "Missing translated desc.");
    if (!popup) add(issues, "error", "missing_popupDesc", "Missing translated popupDesc.");

    if (!tr._sourceHash) add(issues, "error", "missing_sourceHash", "Missing _sourceHash.");
    else if (tr._sourceHash !== m.hash) add(issues, "error", "stale_sourceHash", `Expected ${m.hash}, got ${tr._sourceHash}.`);

    if (desc && popup && desc.toLowerCase() === popup.toLowerCase()) {
      add(issues, "error", "popup_equals_desc", "popupDesc is identical to desc.");
    }

    if (sourcePopupWords >= 80 && translatedPopupWords < 40) {
      add(issues, "error", "popup_too_short", `Source popupDesc has ${sourcePopupWords} words; translation has ${translatedPopupWords}.`);
    }

    if (sourcePopupWords >= 120 && translatedPopupWords / sourcePopupWords < 0.45) {
      add(issues, "warning", "popup_much_shorter", `Source popupDesc has ${sourcePopupWords} words; translation has ${translatedPopupWords}.`);
    }

    if (paras(m.source.popupDesc) >= 2 && paras(popup) < 2) {
      add(issues, "warning", "paragraphs_collapsed", "Source popupDesc has multiple paragraphs; translation does not.");
    }
  }

  if (issues.length) {
    for (const i of issues) i.severity === "error" ? errors++ : warnings++;
    results.push({ id, file: m && m.file, issues });
  }
}

console.log("History Go place translation quality audit");
console.log(`Language: ${lang}`);
console.log(`Translation file: ${trPath}`);
console.log(`Entries checked: ${Object.keys(translations).length}`);
console.log(`Entries with issues: ${results.length}`);
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);

for (const row of results.slice(0, 50)) {
  console.log(`\n${row.id}${row.file ? ` | ${row.file}` : ""}`);
  for (const i of row.issues) console.log(`- [${i.severity}] ${i.code}: ${i.text}`);
}
if (results.length > 50) console.log(`\n... ${results.length - 50} more entries with issues`);

if (errors || (failOnWarning && warnings)) process.exitCode = 1;
