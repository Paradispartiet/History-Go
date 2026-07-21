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
const rel = file => path.relative(ROOT, file).replaceAll("\\", "/");
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
  const output = [];
  async function walk(current) {
    for (const entry of await fs.readdir(abs(current), { withFileTypes: true })) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(child);
      else if (entry.isFile() && entry.name.endsWith(".json")) output.push(child.replaceAll("\\", "/"));
    }
  }
  await walk(dir);
  return output.sort();
}

function isRecord(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function extractPlaces(value) {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (isRecord(value) && Array.isArray(value.places)) return value.places.filter(isRecord);
  if (isRecord(value) && value.id) return [value];
  return [];
}

function stringIds(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map(item => typeof item === "string" ? item : isRecord(item) ? item.id : "")
    .map(value => String(value || "").trim())
    .filter(Boolean);
}

function sameSet(left, right) {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

const activeIndex = await readJson("data/places/places_index.json");
const activeIds = new Set(activeIndex.map(place => String(place?.id || "").trim()).filter(Boolean));

const mapByPlace = new Map();
for (const mapFile of MAP_FILES) {
  const map = await readJson(mapFile);
  for (const [placeId, entry] of Object.entries(map.places || {})) {
    if (!mapByPlace.has(placeId)) {
      mapByPlace.set(placeId, { flora: new Set(), fauna: new Set(), sourceMaps: [] });
    }
    const target = mapByPlace.get(placeId);
    for (const id of stringIds(entry?.flora)) target.flora.add(id);
    for (const id of stringIds(entry?.fauna)) target.fauna.add(id);
    target.sourceMaps.push(mapFile);
  }
}

const byId = new Map();
for (const file of await listJsonFiles("data/places/natur/oslo")) {
  let data;
  try {
    data = await readJson(file);
  } catch {
    continue;
  }
  for (const place of extractPlaces(data)) {
    const id = String(place.id || "").trim();
    if (!id || place.category !== "natur" || !activeIds.has(id)) continue;
    if (!byId.has(id)) byId.set(id, { place, files: [] });
    byId.get(id).files.push(file);
  }
}

const rows = [...byId.entries()].map(([id, source]) => {
  const place = source.place;
  const profile = isRecord(place.nature_profile) ? place.nature_profile : null;
  const mapped = mapByPlace.get(id) || { flora: new Set(), fauna: new Set(), sourceMaps: [] };
  const mappedFlora = [...mapped.flora].sort();
  const mappedFauna = [...mapped.fauna].sort();
  const inventory = profile && isRecord(profile.species_inventory) ? profile.species_inventory : null;
  const inventoryFlora = stringIds(inventory?.flora);
  const inventoryFauna = stringIds(inventory?.fauna);
  const profileComplete = !!profile
    && String(profile.type || "").length >= 12
    && String(profile.title || "").length >= 12
    && String(profile.summary || "").length >= 240
    && Array.isArray(profile.themes)
    && profile.themes.length >= 5;
  const inventoryExact = !!inventory
    && sameSet(inventoryFlora, mappedFlora)
    && sameSet(inventoryFauna, mappedFauna)
    && Number(inventory.total_species) === mappedFlora.length + mappedFauna.length;
  const quiz = isRecord(place.quiz_profile) ? place.quiz_profile : null;
  const quizProfileComplete = !!quiz
    && Array.isArray(quiz.signature_features)
    && quiz.signature_features.length >= 4
    && Array.isArray(quiz.question_families)
    && quiz.question_families.length >= 3;
  const mapEntryPresent = mapped.sourceMaps.length > 0;
  const mappedSpeciesCount = mappedFlora.length + mappedFauna.length;
  let priority = 4;
  let nextAction = "kontroller sted og geometri før artsarbeid";
  if (profileComplete && mapEntryPresent && mappedSpeciesCount > 0 && !inventoryExact) {
    priority = 1;
    nextAction = "bygg species_inventory fra eksisterende aktive kartarter";
  } else if (profileComplete && inventoryExact && !quizProfileComplete) {
    priority = 2;
    nextAction = "bygg quiz, fortelling og leksikon rundt ferdig artsinventar";
  } else if (!profileComplete && mapEntryPresent) {
    priority = 3;
    nextAction = "bygg stedprofil og komplett artsinventar fra aktive kartarter";
  } else if (profileComplete && !mapEntryPresent) {
    priority = 4;
    nextAction = "gjennomfør stedlig Artskart-revisjon; ikke gjett arter";
  }
  return {
    id,
    name: place.name || place.title || id,
    files: source.files,
    profileComplete,
    mapEntryPresent,
    mappedSpeciesCount,
    mappedFloraCount: mappedFlora.length,
    mappedFaunaCount: mappedFauna.length,
    sourceMaps: mapped.sourceMaps,
    speciesInventoryPresent: !!inventory,
    speciesInventoryExact: inventoryExact,
    quizProfileComplete,
    priority,
    nextAction
  };
}).sort((a, b) => a.priority - b.priority || b.mappedSpeciesCount - a.mappedSpeciesCount || a.id.localeCompare(b.id));

const duplicatePlaceIds = rows.filter(row => row.files.length > 1).map(row => ({ id: row.id, files: row.files }));
const summary = {
  generatedAt: new Date().toISOString(),
  scope: "active category=natur place files under data/places/natur/oslo",
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
  duplicatePlaceIds: duplicatePlaceIds.length
};

await writeJson(OUT_JSON, { summary, duplicatePlaceIds, places: rows });

const lines = [
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
  "- Dupliserte aktive place-ID-er i Oslo naturkorpus: **" + summary.duplicatePlaceIds + "**",
  "",
  "## Neste kandidater",
  "",
  "| Prioritet | Sted | Kartarter | Profil | Inventar | Quizprofil | Neste handling |",
  "|---:|---|---:|---|---|---|---|"
];
for (const row of rows.slice(0, 50)) {
  lines.push("| " + row.priority + " | `" + row.id + "` – " + String(row.name).replaceAll("|", "/") + " | " + row.mappedSpeciesCount + " | " + (row.profileComplete ? "ja" : "nei") + " | " + (row.speciesInventoryExact ? "eksakt" : row.speciesInventoryPresent ? "avvik" : "mangler") + " | " + (row.quizProfileComplete ? "ja" : "nei") + " | " + row.nextAction + " |");
}
lines.push("", "## Regel", "", "En artsrunding regnes ikke som ferdig bare fordi et sted har `nature_profile`. `species_inventory` må samsvare nøyaktig med unionen av aktive flora- og fauna-ID-er i de fire Oslo-naturkartene. Steder uten kartoppføring sendes til egen stedlig artsrevisjon; arter skal ikke konstrueres.");
await writeText(OUT_MD, lines.join("\n"));

const validation = spawnSync("npx", ["tsx", "tools/validate_nature_maps.mts"], { cwd: ROOT, stdio: "inherit" });
if (validation.status !== 0) process.exit(validation.status || 1);

console.log(JSON.stringify(summary, null, 2));
console.log("Skrev " + OUT_JSON + " og " + OUT_MD);
