#!/usr/bin/env node
// tools/validate_nature_maps.mjs
// Validates that place-level nature maps only reference loaded places and loaded flora/fauna ids.

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

const CONFIG = {
  placesManifest: "data/places/manifest.json",
  floraManifest: "data/natur/flora/manifest.json",
  faunaManifest: "data/natur/fauna/manifest.json",
  maps: [
    "data/natur/nature_place_map.json",
    "data/natur/nature_bird_place_map.json",
    "data/natur/nature_oslo_expansion_place_map.json",
    "data/natur/nature_routes_place_map.json"
  ],
  optionalPlaceIds: new Set([
    "akerselva_industri"
  ])
};

function rel(p) {
  return String(p || "").replaceAll("\\", "/").replace(/^\.\//, "");
}

function abs(p) {
  return path.join(ROOT, p);
}

async function exists(p) {
  try {
    await fs.access(abs(p));
    return true;
  } catch {
    return false;
  }
}

async function readJson(p) {
  return JSON.parse(await fs.readFile(abs(p), "utf8"));
}

async function resolveManifestFile(manifestPath, fileRef) {
  const file = typeof fileRef === "string" ? fileRef : fileRef?.file || fileRef?.path;
  if (!file) return null;

  const clean = rel(file);
  const baseDir = rel(path.dirname(manifestPath));
  const dataDir = rel(path.dirname(baseDir));
  const candidates = [];

  if (clean.startsWith("data/")) candidates.push(clean);
  candidates.push(rel(path.join(baseDir, clean)));
  candidates.push(rel(path.join(dataDir, clean)));
  candidates.push(rel(path.join("data", clean)));

  for (const p of [...new Set(candidates)]) {
    if (await exists(p)) return p;
  }
  return null;
}

function flattenEntries(items) {
  const out = [];
  for (const item of Array.isArray(items) ? items : []) {
    if (!item || typeof item !== "object") continue;
    if (item.kind === "emne_pack" && Array.isArray(item.items)) out.push(...flattenEntries(item.items));
    else if (item.id) out.push(item);
  }
  return out;
}

async function loadPlaces() {
  const manifest = await readJson(CONFIG.placesManifest);
  const files = Array.isArray(manifest?.files) ? manifest.files : [];
  const places = [];
  const loadedFiles = [];

  for (const file of files) {
    const resolved = await resolveManifestFile(CONFIG.placesManifest, file);
    if (!resolved) throw new Error(`Missing place manifest file: ${JSON.stringify(file)}`);
    loadedFiles.push(resolved);
    const data = await readJson(resolved);
    if (Array.isArray(data)) places.push(...data);
    else if (Array.isArray(data?.places)) places.push(...data.places);
  }

  return { places, loadedFiles };
}

async function loadNatureIds(manifestPath) {
  const manifest = await readJson(manifestPath);
  const files = Array.isArray(manifest?.files) ? manifest.files : [];
  const ids = new Set();
  const loadedFiles = [];

  for (const file of files) {
    const resolved = await resolveManifestFile(manifestPath, file);
    if (!resolved) throw new Error(`Missing nature manifest file: ${JSON.stringify(file)} from ${manifestPath}`);
    loadedFiles.push(resolved);
    const data = await readJson(resolved);
    flattenEntries(data).forEach(item => ids.add(String(item.id)));
  }

  return { ids, loadedFiles };
}

async function main() {
  const { places, loadedFiles: placeFiles } = await loadPlaces();
  const placeIds = new Set(places.map(p => String(p.id)).filter(Boolean));

  const flora = await loadNatureIds(CONFIG.floraManifest);
  const fauna = await loadNatureIds(CONFIG.faunaManifest);

  const errors = [];
  const summary = {
    placesLoaded: places.length,
    placeFilesLoaded: placeFiles.length,
    floraIdsLoaded: flora.ids.size,
    faunaIdsLoaded: fauna.ids.size,
    mapsChecked: [],
    missingPlaces: [],
    missingFlora: [],
    missingFauna: []
  };

  for (const mapPath of CONFIG.maps) {
    const raw = await readJson(mapPath);
    const entries = raw?.places && typeof raw.places === "object" ? raw.places : raw;
    const placeCount = Object.keys(entries || {}).length;
    let floraRefCount = 0;
    let faunaRefCount = 0;

    summary.mapsChecked.push({ mapPath, placeCount });

    for (const [placeId, entry] of Object.entries(entries || {})) {
      if (!placeIds.has(placeId) && !CONFIG.optionalPlaceIds.has(placeId)) {
        const err = `${mapPath}: placeId not loaded by manifest: ${placeId}`;
        errors.push(err);
        summary.missingPlaces.push({ mapPath, placeId });
      }

      for (const id of Array.isArray(entry?.flora) ? entry.flora : []) {
        floraRefCount += 1;
        if (!flora.ids.has(String(id))) {
          const err = `${mapPath}: missing flora id ${id} at ${placeId}`;
          errors.push(err);
          summary.missingFlora.push({ mapPath, placeId, id });
        }
      }

      for (const id of Array.isArray(entry?.fauna) ? entry.fauna : []) {
        faunaRefCount += 1;
        if (!fauna.ids.has(String(id))) {
          const err = `${mapPath}: missing fauna id ${id} at ${placeId}`;
          errors.push(err);
          summary.missingFauna.push({ mapPath, placeId, id });
        }
      }
    }

    summary.mapsChecked[summary.mapsChecked.length - 1].floraRefs = floraRefCount;
    summary.mapsChecked[summary.mapsChecked.length - 1].faunaRefs = faunaRefCount;
  }

  console.log(JSON.stringify(summary, null, 2));

  if (errors.length) {
    console.error("\nNature map validation failed:\n" + errors.map(e => `- ${e}`).join("\n"));
    process.exitCode = 1;
  } else {
    console.log("\nNature map validation passed.");
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
