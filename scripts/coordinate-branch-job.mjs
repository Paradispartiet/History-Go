import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const tempScript = path.join(ROOT, "scripts", ".remove-popkultur-domain-runner.mjs");
const evidenceRoot = path.join(ROOT, "data", "coordinate-evidence");
const evidenceManifestPath = path.join(evidenceRoot, "manifest.json");
const evidenceReport = path.join(ROOT, "reports", "coordinate-evidence-audit.md");
const sourceUrl = "https://raw.githubusercontent.com/Paradispartiet/History-Go/667fc1d0c72c1227b2a079148ddbb9bab8d0eb5d/scripts/remove-popkultur-domain.mjs";

const EVIDENCE_TARGETS = {
  chat_noir: "scenekunst",
  cinemateket_oslo: "film_tv",
  colosseum_kino: "film_tv",
  edderkoppen_scene: "scenekunst",
  frognerstranda: "media",
  grand_hotel: "media",
  house_of_nerds: "subkultur",
  latter: "scenekunst",
  slottsplassen: "politikk",
};

function run(command, args) {
  execFileSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function records(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.places)) return payload.places;
  if (Array.isArray(payload?.items)) return payload.items;
  return [payload];
}

async function buildActivePlaceFileMap() {
  const manifest = await readJson(path.join(ROOT, "data", "places", "manifest.json"));
  const byId = new Map();
  for (const entry of manifest.files || []) {
    const file = path.join(ROOT, "data", entry);
    if (!(await exists(file))) continue;
    const payload = await readJson(file);
    for (const place of records(payload)) {
      if (place?.id) byId.set(String(place.id), `data/${entry}`);
    }
  }
  return byId;
}

async function repairCoordinateEvidence() {
  const manifest = await readJson(evidenceManifestPath);
  const activePlaceFiles = await buildActivePlaceFileMap();
  const nextFiles = [];

  for (const entry of manifest.files || []) {
    if (!entry.startsWith("oslo/popkultur/")) {
      nextFiles.push(entry);
      continue;
    }

    const id = path.basename(entry, ".json");
    const target = EVIDENCE_TARGETS[id];
    if (!target) throw new Error(`Mangler evidensmål for ${id}`);

    const correctEntry = `oslo/${target}/${id}.json`;
    const correctFile = path.join(evidenceRoot, correctEntry);
    const fallbackEntry = `oslo/media/${id}.json`;
    const fallbackFile = path.join(evidenceRoot, fallbackEntry);

    if (!(await exists(correctFile)) && await exists(fallbackFile)) {
      await fs.mkdir(path.dirname(correctFile), { recursive: true });
      await fs.rename(fallbackFile, correctFile);
    }
    if (!(await exists(correctFile))) {
      throw new Error(`Migrert evidensfil finnes ikke: ${correctEntry}`);
    }

    const evidence = await readJson(correctFile);
    const activePlaceFile = activePlaceFiles.get(String(evidence.placeId || id));
    if (!activePlaceFile) {
      throw new Error(`Aktiv place-fil mangler for evidens ${id}`);
    }
    evidence.placeFile = activePlaceFile;
    await writeJson(correctFile, evidence);
    nextFiles.push(correctEntry);
  }

  manifest.files = nextFiles;
  await writeJson(evidenceManifestPath, manifest);
}

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Kunne ikke hente migreringsscript: ${response.status} ${response.statusText}`);
}

let source = await response.text();
source = source.replace("await audit();", "");
source = source.replace("await writeReport();", "await writeReport();\nexport { audit };");
await fs.writeFile(tempScript, source, "utf8");

try {
  const moduleUrl = `${pathToFileURL(tempScript).href}?run=${Date.now()}`;
  const migration = await import(moduleUrl);

  await repairCoordinateEvidence();
  run("npm", ["run", "places:index:build"]);
  run("npm", ["run", "build:web"]);
  run("npm", ["run", "typecheck:web"]);

  if (typeof migration.audit !== "function") {
    throw new Error("Migreringsscriptet eksporterte ikke audit-funksjonen.");
  }
  await migration.audit();

  try {
    run("npm", ["run", "places:coords:evidence:audit"]);
  } catch (error) {
    try {
      console.error(await fs.readFile(evidenceReport, "utf8"));
    } catch {
      console.error("Koordinat-evidensrapporten ble ikke skrevet.");
    }
    throw error;
  }
} finally {
  await fs.rm(tempScript, { force: true });
}
