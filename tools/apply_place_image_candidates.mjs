#!/usr/bin/env node
// History Go: apply manually approved place image candidates.
// New places structure only.
//
// Workflow:
//   1. node tools/build_place_image_candidates.mjs
//   2. Open data/places/place_image_candidates.json
//   3. Set exactly one candidate per place to "approved": true
//   4. node tools/apply_place_image_candidates.mjs
//
// Optional overwrite existing image/cardImage:
//   node tools/apply_place_image_candidates.mjs --overwrite
//
// The script downloads approved images to bilder/places/auto/
// and updates only the sourceFile listed in the candidate file.

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const CANDIDATES_PATH = "data/places/place_image_candidates.json";
const OVERWRITE = process.argv.includes("--overwrite");
const USER_AGENT = "HistoryGoImageCandidateBot/1.0 (https://github.com/Paradispartiet/History-Go)";

const abs = rel => path.join(ROOT, rel);
const hasText = value => typeof value === "string" && value.trim().length > 0;

function assertNewSourceFile(sourceFile) {
  if (typeof sourceFile !== "string" || !sourceFile.startsWith("data/places/")) {
    throw new Error(`Ugyldig sourceFile for ny places-struktur: ${sourceFile}`);
  }
}

function assertLocalImagePath(imagePath) {
  if (typeof imagePath !== "string" || !imagePath.startsWith("bilder/places/auto/")) {
    throw new Error(`Ugyldig lokal bildebane: ${imagePath}`);
  }
}

async function readJson(relPath) {
  return JSON.parse(await fs.readFile(abs(relPath), "utf8"));
}

async function writeJson(relPath, data) {
  await fs.writeFile(abs(relPath), JSON.stringify(data, null, 2) + "\n", "utf8");
}

function getApprovedCandidate(placeEntry) {
  const approved = (placeEntry?.candidates || []).filter(candidate => candidate?.approved === true);
  if (approved.length > 1) {
    throw new Error(`${placeEntry.id} har mer enn én approved kandidat. Velg bare én.`);
  }
  return approved[0] || null;
}

async function downloadImage(url, relPath) {
  assertLocalImagePath(relPath);
  await fs.mkdir(path.dirname(abs(relPath)), { recursive: true });

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT
    }
  });

  if (!res.ok) {
    throw new Error(`Kunne ikke laste ned bilde: ${res.status} ${res.statusText} – ${url}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error(`URL returnerte ikke bilde: ${contentType} – ${url}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(abs(relPath), buffer);
}

function buildImageMeta(candidate) {
  return {
    source: candidate.source || "",
    sourceUrl: candidate.pageUrl || candidate.originalUrl || "",
    fileTitle: candidate.fileTitle || "",
    author: candidate.author || "",
    credit: candidate.credit || "",
    license: candidate.licenseShortName || "",
    licenseUrl: candidate.licenseUrl || "",
    verified: true,
    appliedAt: new Date().toISOString()
  };
}

async function main() {
  const candidatesFile = await readJson(CANDIDATES_PATH);
  if (candidatesFile?.schema !== "historygo_place_image_candidates_v1") {
    throw new Error(`${CANDIDATES_PATH} har ukjent schema: ${candidatesFile?.schema}`);
  }

  const approvedEntries = (candidatesFile.places || [])
    .map(entry => ({ entry, candidate: getApprovedCandidate(entry) }))
    .filter(item => item.candidate);

  if (!approvedEntries.length) {
    console.log("Ingen approved kandidater funnet. Ingenting endret.");
    return;
  }

  const bySourceFile = new Map();

  for (const { entry, candidate } of approvedEntries) {
    assertNewSourceFile(entry.sourceFile);
    if (!candidate?.originalUrl) throw new Error(`${entry.id} mangler originalUrl`);

    const imagePath = candidate?.suggested?.image;
    assertLocalImagePath(imagePath);

    if (!bySourceFile.has(entry.sourceFile)) {
      const places = await readJson(entry.sourceFile);
      if (!Array.isArray(places)) throw new Error(`${entry.sourceFile} må være en JSON-array`);
      bySourceFile.set(entry.sourceFile, places);
    }

    await downloadImage(candidate.originalUrl, imagePath);

    const places = bySourceFile.get(entry.sourceFile);
    const place = places.find(item => item?.id === entry.id);
    if (!place) throw new Error(`Fant ikke ${entry.id} i ${entry.sourceFile}`);

    if (OVERWRITE || !hasText(place.image)) {
      place.image = imagePath;
    }

    if (OVERWRITE || !hasText(place.cardImage)) {
      place.cardImage = candidate?.suggested?.cardImage || imagePath;
    }

    place.imageMeta = buildImageMeta(candidate);
    console.log(`Oppdatert ${entry.id}: ${imagePath}`);
  }

  for (const [sourceFile, places] of bySourceFile.entries()) {
    await writeJson(sourceFile, places);
    console.log(`Skrev ${sourceFile}`);
  }

  console.log(`\nFerdig. Godkjente steder brukt: ${approvedEntries.length}`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
