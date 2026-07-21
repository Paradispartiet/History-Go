#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUT_JSON = "reports/oslo-nature-round-coverage-20260721.json";
const OUT_MD = "reports/oslo-nature-round-coverage-20260721.md";
const MAP_FILES = [
  "data/natur/nature_place_map.json",
  "data/natur/nature_bird_place_map.json",
  "data/natur/nature_oslo_expansion_place_map.json",
  "data/natur/nature_routes_place_map.json"
];
const abs = file => path.join(ROOT, file);
const readJson = async file => JSON.parse(await fs.readFile(abs(file), "utf8"));
const writeJson = async (file, value) => {
  await fs.mkdir(path.dirname(abs(file)), { recursive: true });
  await fs.writeFile(abs(file), JSON.stringify(value, null, 2) + "\n", "utf8");
};
const writeText = async (file, value) => {
  await fs.mkdir(path.dirname(abs(file)), { recursive: true });
  await fs.writeFile(abs(file), value.endsWith("\n") ? value : value + "\n", "utf8");
};
async function listJsonFiles(dir) {
  const out = [];
  async function walk(current) {
    for (const entry of await fs.readdir(abs(current), { withFileTypes: true })) {
      const child = path.join(current, entry.name).replaceAll("\\", "/");
      if (entry.isDirectory()) await walk(child);
      else if (entry.isFile() && entry.name.endsWith(".json")) out.push(child);
    }
  }
  await walk(dir);
  return out.sort();
}
function isRecord(value) { return !!value && typeof value === "object" && !Array.isArray(value); }
function extractPlaces(value) {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (isRecord(value) && Array.isArray(value.places)) return value.places.filter(isRecord);
  if (isRecord(value) && value.id) return [value];
  return [];
}
function ids(items) {
  return Array.isArray(items) ? items.map(item => typeof item === "string" ? item : isRecord(item) ? item.id : "").map(String).map(s => s.trim()).filter(Boolean) : [];
}
function sameSet(a, b) {
  const left = [...new Set(a)].sort();
  const right = [...new Set(b)].sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
function sourceScore(id, candidate) {
  const base = path.basename(candidate.file, ".json");
  let score = base === id ? 1000 : 0;
  if (candidate.place.nature_profile) score += 200;
  if (candidate.place.quiz_profile) score += 50;
  if (candidate.file.includes("_index.json")) score -= 500;
  if (candidate.file.includes("_manifest.json")) score -= 600;
  return score;
}

const active = new Set((await readJson("data/places/places_index.json")).map(place => String(place?.id || "").trim()).filter(Boolean));
const mapped = new Map();
for (const mapFile of MAP_FILES) {
  const map = await readJson(mapFile);
  for (const [placeId, entry] of Object.entries(map.places || {})) {
    if (!mapped.has(placeId)) mapped.set(placeId, { flora: new Set(), fauna: new Set(), sourceMaps: [] });
    const target = mapped.get(placeId);
    ids(entry?.flora).forEach(id => target.flora.add(id));
    ids(entry?.fauna).forEach(id => target.fauna.add(id));
    target.sourceMaps.push(mapFile);
  }
}

const candidatesById = new Map();
for (const file of await listJsonFiles("data/places/natur/oslo")) {
  let data;
  try { data = await readJson(file); } catch { continue; }
  for (const place of extractPlaces(data)) {
    const id = String(place.id || "").trim();
    if (!id || place.category !== "natur" || !active.has(id)) continue;
    if (!candidatesById.has(id)) candidatesById.set(id, []);
    candidatesById.get(id).push({ file, place });
  }
}

const rows = [];
const representationConflicts = [];
for (const [id, candidates] of candidatesById) {
  candidates.sort((a, b) => sourceScore(id, b) - sourceScore(id, a) || a.file.localeCompare(b.file));
  const selected = candidates[0];
  const canonicalFiles = candidates.filter(candidate => path.basename(candidate.file, ".json") === id).map(candidate => candidate.file);
  if (canonicalFiles.length > 1) representationConflicts.push({ id, canonicalFiles });
  const place = selected.place;
  const profile = isRecord(place.nature_profile) ? place.nature_profile : null;
  const map = mapped.get(id) || { flora: new Set(), fauna: new Set(), sourceMaps: [] };
  const flora = [...map.flora].sort();
  const fauna = [...map.fauna].sort();
  const inventory = profile && isRecord(profile.species_inventory) ? profile.species_inventory : null;
  const profileComplete = !!profile && String(profile.type || "").length >= 12 && String(profile.title || "").length >= 12 && String(profile.summary || "").length >= 240 && Array.isArray(profile.themes) && profile.themes.length >= 5;
  const inventoryExact = !!inventory && sameSet(ids(inventory.flora), flora) && sameSet(ids(inventory.fauna), fauna) && Number(inventory.total_species) === flora.length + fauna.length;
  const quiz = isRecord(place.quiz_profile) ? place.quiz_profile : null;
  const quizComplete = !!quiz && Array.isArray(quiz.signature_features) && quiz.signature_features.length >= 4 && Array.isArray(quiz.question_families) && quiz.question_families.length >= 3;
  const mapEntryPresent = map.sourceMaps.length > 0;
  const speciesCount = flora.length + fauna.length;
  let priority = 4;
  let nextAction = "gjennomfør stedlig artsrevisjon; ikke gjett arter";
  if (profileComplete && mapEntryPresent && speciesCount > 0 && !inventoryExact) {
    priority = 1;
    nextAction = "bygg species_inventory fra eksisterende aktive kartarter";
  } else if (profileComplete && inventoryExact && !quizComplete) {
    priority = 2;
    nextAction = "bygg quiz, fortelling og leksikon rundt ferdig artsinventar";
  } else if (!profileComplete && mapEntryPresent) {
    priority = 3;
    nextAction = "bygg stedprofil og komplett artsinventar fra aktive kartarter";
  }
  rows.push({
    id,
    name: place.name || place.title || id,
    selectedFile: selected.file,
    representations: candidates.map(candidate => candidate.file),
    profileComplete,
    mapEntryPresent,
    mappedSpeciesCount: speciesCount,
    mappedFloraCount: flora.length,
    mappedFaunaCount: fauna.length,
    sourceMaps: map.sourceMaps,
    speciesInventoryPresent: !!inventory,
    speciesInventoryExact: inventoryExact,
    quizProfileComplete: quizComplete,
    priority,
    nextAction
  });
}
rows.sort((a, b) => a.priority - b.priority || b.mappedSpeciesCount - a.mappedSpeciesCount || a.id.localeCompare(b.id));
const summary = {
  generatedAt: new Date().toISOString(),
  scope: "active category=natur place files under data/places/natur/oslo; canonical per-place file preferred",
  activeOsloNaturePlaces: rows.length,
  completeProfiles: rows.filter(row => row.profileComplete).length,
  placesWithMapEntry: rows.filter(row => row.mapEntryPresent).length,
  placesWithMappedSpecies: rows.filter(row => row.mappedSpeciesCount > 0).length,
  exactSpeciesInventories: rows.filter(row => row.speciesInventoryExact).length,
  completeQuizProfiles: rows.filter(row => row.quizProfileComplete).length,
  priority1InventoryBuilds: rows.filter(row => row.priority === 1).length,
  priority2ContentBuilds: rows.filter(row => row.priority === 2).length,
  priority3ProfileAndInventoryBuilds: rows.filter(row => row.priority === 3).length,
  priority4SpeciesAudits: rows.filter(row => row.priority === 4).length,
  conflictingCanonicalFiles: representationConflicts.length
};
await writeJson(OUT_JSON, { summary, representationConflicts, places: rows });
const md = [
  "# Oslo Natur-rundinger – dekningsaudit",
  "",
  "Generert: " + summary.generatedAt,
  "",
  "## Sammendrag",
  "",
  "- Aktive Oslo-natursteder: **" + summary.activeOsloNaturePlaces + "**",
  "- Komplette stedprofiler: **" + summary.completeProfiles + "**",
  "- Steder med aktiv kartoppføring: **" + summary.placesWithMapEntry + "**",
  "- Steder med minst én kartlagt art: **" + summary.placesWithMappedSpecies + "**",
  "- Eksakte `species_inventory`: **" + summary.exactSpeciesInventories + "**",
  "- Komplette `quiz_profile`: **" + summary.completeQuizProfiles + "**",
  "- Prioritet 1 – bygg inventar fra eksisterende kartarter: **" + summary.priority1InventoryBuilds + "**",
  "- Prioritet 2 – bygg quiz/fortelling/leksikon: **" + summary.priority2ContentBuilds + "**",
  "- Prioritet 3 – bygg profil og inventar: **" + summary.priority3ProfileAndInventoryBuilds + "**",
  "- Prioritet 4 – trenger stedlig artsrevisjon: **" + summary.priority4SpeciesAudits + "**",
  "- Konflikter mellom flere kanoniske `/<place-id>.json`: **" + summary.conflictingCanonicalFiles + "**",
  "",
  "## Neste kandidater",
  "",
  "| Prioritet | Sted | Kartarter | Profil | Inventar | Quizprofil | Kanonisk fil | Neste handling |",
  "|---:|---|---:|---|---|---|---|---|"
];
for (const row of rows.slice(0, 60)) md.push("| " + row.priority + " | `" + row.id + "` – " + String(row.name).replaceAll("|", "/") + " | " + row.mappedSpeciesCount + " | " + (row.profileComplete ? "ja" : "nei") + " | " + (row.speciesInventoryExact ? "eksakt" : row.speciesInventoryPresent ? "avvik" : "mangler") + " | " + (row.quizProfileComplete ? "ja" : "nei") + " | `" + row.selectedFile + "` | " + row.nextAction + " |");
md.push("", "## Regel", "", "Aggregat-, indeks- og manifestrepresentasjoner er forventede avledede kopier og regnes ikke som duplikater. Kanonisk per-place-fil prioriteres. En artsrunding regnes ikke som ferdig bare fordi stedet har `nature_profile`; `species_inventory` må samsvare nøyaktig med unionen av aktive Oslo-naturkart.");
await writeText(OUT_MD, md.join("\n"));
const validation = spawnSync("npx", ["tsx", "tools/validate_nature_maps.mts"], { cwd: ROOT, stdio: "inherit" });
if (validation.status !== 0) process.exit(validation.status || 1);
console.log(JSON.stringify(summary, null, 2));
console.log("Skrev korrigert Oslo-natur-dekningsaudit");
