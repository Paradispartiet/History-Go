import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HISTORICAL_DIR = path.join(ROOT, "data/routes/historical");
const ROUTE_MANIFEST = path.join(HISTORICAL_DIR, "manifest.json");
const PLACE_MANIFEST = path.join(ROOT, "data/places/manifest.json");
const ROUTE_ARCHETYPE_LABELS = new Set([
  "urban_time_route",
  "trade_route",
  "escape_route",
  "smuggling_route",
  "industrial_work_route",
  "pilgrimage_route",
  "military_route",
  "sea_route",
  "migration_route",
  "postal_route",
  "rail_route",
  "river_route",
  "spy_route",
  "resistance_route"
]);

const errors = [];
const warnings = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(ROOT, file)} kunne ikke leses/parses: ${error.message}`);
    return null;
  }
}

function requireField(object, field, context) {
  if (object?.[field] === undefined || object?.[field] === null || object?.[field] === "") {
    errors.push(`${context} mangler påkrevd felt "${field}"`);
  }
}

const routeManifest = readJson(ROUTE_MANIFEST);
const routeFiles = Array.isArray(routeManifest?.files) ? routeManifest.files : [];
if (!routeFiles.length) errors.push("Historisk rutemanifest mangler files");

const routes = routeFiles.flatMap((file) => {
  const data = readJson(path.join(HISTORICAL_DIR, file));
  if (!Array.isArray(data)) {
    errors.push(`data/routes/historical/${file} må inneholde en array`);
    return [];
  }
  return data;
});

const placeManifest = readJson(PLACE_MANIFEST);
const placeFiles = Array.isArray(placeManifest?.files) ? placeManifest.files : [];
if (!placeFiles.length) errors.push("Place-manifest mangler aktive source-filer");
if (placeFiles.some((file) => path.basename(file) === "places_index.json")) {
  errors.push("data/places/places_index.json skal ikke brukes som source of truth");
}

const placeIds = new Set();
for (const file of placeFiles) {
  const data = readJson(path.join(ROOT, "data", file));
  const places = Array.isArray(data) ? data : (Array.isArray(data?.places) ? data.places : []);
  for (const place of places) {
    if (place?.id) placeIds.add(place.id);
  }
}

const routeIds = new Set();
const chapterIds = new Set();
for (const [routeIndex, route] of routes.entries()) {
  const context = `Rute ${route?.id || `#${routeIndex + 1}`}`;
  for (const field of ["id", "title", "narrativeText", "routeArchetype", "historicalPeriod", "playModes", "rewards"]) {
    requireField(route, field, context);
  }
  if (routeIds.has(route?.id)) errors.push(`Duplikat route id: ${route.id}`);
  if (route?.id) routeIds.add(route.id);
  if (route?.type !== "historical_route") errors.push(`${context} har ugyldig type`);
  if (route?.feature !== "historiske_ruter") errors.push(`${context} har ugyldig feature`);
  if (route?.playModes?.online?.enabled !== true) errors.push(`${context} må ha playModes.online.enabled === true`);
  if (!route?.rewards || typeof route.rewards !== "object" || Array.isArray(route.rewards)) {
    errors.push(`${context} må ha rewards-objekt`);
  }
  if (!ROUTE_ARCHETYPE_LABELS.has(route?.routeArchetype)) {
    warnings.push(`${context} bruker routeArchetype uten label: ${route?.routeArchetype || "(mangler)"}`);
  }
  if (!Array.isArray(route?.chapters) || !route.chapters.length) {
    errors.push(`${context} må ha minst ett chapter`);
    continue;
  }

  for (const [chapterIndex, chapter] of route.chapters.entries()) {
    const chapterContext = `${context}, chapter ${chapter?.id || `#${chapterIndex + 1}`}`;
    requireField(chapter, "id", chapterContext);
    if (chapterIds.has(chapter?.id)) errors.push(`Duplikat chapter id: ${chapter.id}`);
    if (chapter?.id) chapterIds.add(chapter.id);

    const chapterPlaceId = String(chapter?.placeId || "").trim();
    const physicalPlaceId = String(chapter?.physical?.placeId || "").trim();
    for (const [field, placeId] of [["chapter.placeId", chapterPlaceId], ["chapter.physical.placeId", physicalPlaceId]]) {
      if (placeId && !placeIds.has(placeId)) errors.push(`${chapterContext}: ${field} "${placeId}" finnes ikke i aktive place source-filer`);
    }

    if (!chapterPlaceId && chapter?.physical?.enabled !== false) {
      errors.push(`${chapterContext}: chapter uten placeId må ha physical.enabled === false`);
    }
    if (chapter?.physical?.enabled === true) {
      const physicalTarget = physicalPlaceId || chapterPlaceId;
      if (!physicalTarget || !placeIds.has(physicalTarget)) {
        errors.push(`${chapterContext}: physical.enabled === true krever minst én gyldig placeId`);
      }
    }
  }
}

console.log(`Historiske ruter: ${routes.length} ruter, ${chapterIds.size} kapitler`);
console.log(`Aktive place sources: ${placeFiles.length} filer, ${placeIds.size} unike placeIds`);
for (const warning of warnings) console.warn(`ADVARSEL: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`FEIL: ${error}`);
  console.error(`Audit feilet med ${errors.length} feil.`);
  process.exitCode = 1;
} else {
  console.log(`OK: Historiske ruter besto audit${warnings.length ? ` med ${warnings.length} advarsel(er)` : ""}.`);
}
