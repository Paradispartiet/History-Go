// scripts/audit-civication-building-types.mjs
// Read-only audit av buildingTypeId-referanser brukt av Civication History Go mapping.
//
// Validerer at alle buildingTypeId brukt i:
//   data/Civication/map/historyGoPlaceMapping.by.json
// finnes som definisjon i:
//   data/Civication/map/buildingTypes.json
//
// Scriptet endrer ingen datafiler.
//
// Kjør:  node scripts/audit-civication-building-types.mjs
//        npm run audit:civication-building-types

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();

const MAPPING_FILE = path.join(ROOT, "data", "Civication", "map", "historyGoPlaceMapping.by.json");
const BUILDING_TYPES_FILE = path.join(ROOT, "data", "Civication", "map", "buildingTypes.json");

async function readJSON(file): Promise<Record<string, unknown> | unknown[]> {
  let raw;
  try {
    raw = await readFile(file, "utf8");
  } catch (err) {
    throw new Error(`Kunne ikke lese ${path.relative(ROOT, file)}: ${err.message}`);
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Kunne ikke parse ${path.relative(ROOT, file)} som JSON: ${err.message}`);
  }
}

type JsonObject = Record<string, unknown>;
function asObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

function extractBuildingTypeIds(buildingTypesData: unknown) {
  const ids = new Set();
  const dataObject = asObject(buildingTypesData);
  const root = dataObject?.buildingTypes ?? buildingTypesData;

  if (Array.isArray(root)) {
    for (const item of root) {
      const itemObject = asObject(item);
      if (typeof itemObject?.id === "string" && itemObject.id.trim()) {
        ids.add(itemObject.id);
      }
    }
    return ids;
  }

  if (root && typeof root === "object") {
    for (const [key, value] of Object.entries(root as JsonObject)) {
      const valueObject = asObject(value);
      if (typeof valueObject?.id === "string" && valueObject.id.trim()) {
        ids.add(valueObject.id);
      } else if (typeof key === "string" && key.trim()) {
        ids.add(key);
      }
    }
  }

  return ids;
}

async function main() {
  let mappingData;
  let buildingTypesData;

  try {
    [mappingData, buildingTypesData] = await Promise.all([
      readJSON(MAPPING_FILE),
      readJSON(BUILDING_TYPES_FILE),
    ]);
  } catch (err) {
    console.error(`FEIL: ${err.message}`);
    process.exit(1);
  }

  const fatal = [];

  const mappingObject = asObject(mappingData);
  const mappings = asObject(mappingObject?.mappings);
  if (!mappings || typeof mappings !== "object" || Array.isArray(mappings)) {
    fatal.push("Mappingfilen mangler et gyldig mappings-objekt");
  }

  const definedBuildingTypeIds = extractBuildingTypeIds(buildingTypesData);
  const usedBuildingTypeIds = new Set();
  const missingBuildingTypeIdField = [];
  const nonStringBuildingTypeId = [];
  const missingDefinitions = [];
  const mappingEntries = mappings && typeof mappings === "object" && !Array.isArray(mappings)
    ? Object.entries(mappings) as [string, JsonObject][]
    : [];

  for (const [mappingKey, mapping] of mappingEntries) {
    if (!Object.hasOwn(mapping ?? {}, "buildingTypeId")) {
      missingBuildingTypeIdField.push(mappingKey);
      continue;
    }

    const buildingTypeId = mapping?.buildingTypeId;
    if (typeof buildingTypeId !== "string" || !buildingTypeId.trim()) {
      nonStringBuildingTypeId.push({ mappingId: mappingKey, buildingTypeId });
      continue;
    }

    usedBuildingTypeIds.add(buildingTypeId);
    if (!definedBuildingTypeIds.has(buildingTypeId)) {
      missingDefinitions.push({ mappingId: mappingKey, buildingTypeId });
    }
  }

  for (const mappingId of missingBuildingTypeIdField) {
    fatal.push(`${mappingId}: mangler buildingTypeId`);
  }

  for (const item of nonStringBuildingTypeId) {
    fatal.push(`${item.mappingId}: buildingTypeId må være string, fikk ${JSON.stringify(item.buildingTypeId)}`);
  }

  for (const item of missingDefinitions) {
    fatal.push(`${item.mappingId}: buildingTypeId "${item.buildingTypeId}" mangler i buildingTypes.json`);
  }

  const unusedBuildingTypeIds = [...definedBuildingTypeIds]
    .filter((id) => !usedBuildingTypeIds.has(id))
    .sort();

  printReport({
    usedBuildingTypeIds: [...usedBuildingTypeIds].sort(),
    definedBuildingTypeIds: [...definedBuildingTypeIds].sort(),
    missingDefinitions,
    unusedBuildingTypeIds,
    missingBuildingTypeIdField,
    nonStringBuildingTypeId,
    fatal,
  });

  process.exit(fatal.length > 0 ? 1 : 0);
}

function printReport(report) {
  const line = (text = "") => console.log(text);

  line("=== Civication building types audit ===");
  line(`Mapping:       data/Civication/map/historyGoPlaceMapping.by.json`);
  line(`BuildingTypes: data/Civication/map/buildingTypes.json`);
  line("");
  line("Sammendrag:");
  line(`  Unike buildingTypeId brukt i mappingen: ${report.usedBuildingTypeIds.length}`);
  line(`  Building types definert i registry:     ${report.definedBuildingTypeIds.length}`);
  line(`  Manglende definisjoner:                 ${report.missingDefinitions.length}`);
  line(`  Ubrukte building types:                 ${report.unusedBuildingTypeIds.length}`);
  line(`  Mappinger uten buildingTypeId:          ${report.missingBuildingTypeIdField.length}`);
  line(`  Mappinger med ugyldig buildingTypeId:   ${report.nonStringBuildingTypeId.length}`);
  line("");

  printSection(
    "buildingTypeId brukt i mappingen som mangler definisjon",
    report.missingDefinitions,
    (item) => `${item.mappingId} -> ${item.buildingTypeId}`
  );

  printSection(
    "buildingTypeId definert i buildingTypes.json, men ikke brukt av mappingen",
    report.unusedBuildingTypeIds,
    (id) => id
  );

  printSection(
    "mappinger som mangler buildingTypeId",
    report.missingBuildingTypeIdField,
    (id) => id
  );

  printSection(
    "mappinger der buildingTypeId ikke er string",
    report.nonStringBuildingTypeId,
    (item) => `${item.mappingId} -> ${JSON.stringify(item.buildingTypeId)}`
  );

  line("");
  if (report.fatal.length > 0) {
    line(`RESULTAT: ${report.fatal.length} alvorlig(e) feil – exit 1`);
  } else {
    line("RESULTAT: ingen alvorlige feil – exit 0");
  }
}

function printSection(title, items, format) {
  console.log(`${title}: ${items.length}`);
  for (const item of items) {
    console.log(`  - ${format(item)}`);
  }
}

main().catch((err) => {
  console.error(`Uventet feil: ${err?.stack || err}`);
  process.exit(1);
});
