// scripts/audit-civication-city-map-entries.mjs
// Read-only audit/generator for Civication city map entries fra History Go-mappingene.
//
// Validerer at History Go -> Civication city map mappingene kan transformeres til rene
// Civication map entries uten UI-endringer, og lager en in-memory transformasjon.
//
// Leser per-place mappingfilene (data/Civication/map/
// historyGoPlaceMapping.<kategori>.json, se TARGETS nedenfor), kildefilene
// deres under data/places/, og data/Civication/map/buildingTypes.json.
//
// Scriptet:
//   - skriver ingen filer
//   - endrer ingen data
//   - kobler ingenting inn i UI
//
// Kjør:  node scripts/audit-civication-city-map-entries.mjs
//        npm run audit:civication-city-map-entries

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = process.cwd();

const BUILDING_TYPES_FILE = path.join(ROOT, "data", "Civication", "map", "buildingTypes.json");

// Per-place mappingfiler som transformeres til city map entries. Nye kategorier
// legges til her etter hvert som kartet bygges ut.
const TARGETS = [
  {
    label: "by (Oslo)",
    mappingFile: path.join(ROOT, "data", "Civication", "map", "historyGoPlaceMapping.by.json"),
    mappingFileRel: "data/Civication/map/historyGoPlaceMapping.by.json",
    placesFile: path.join(ROOT, "data", "places", "by", "oslo", "places_by.json"),
    placesFileRel: "data/places/by/oslo/places_by.json",
    expectedSourceFile: "places/by/oslo/places_by.json",
    expectedCategory: "by",
  },
  {
    label: "historie (Oslo)",
    mappingFile: path.join(ROOT, "data", "Civication", "map", "historyGoPlaceMapping.historie.json"),
    mappingFileRel: "data/Civication/map/historyGoPlaceMapping.historie.json",
    placesFile: path.join(ROOT, "data", "places", "historie", "oslo", "places_historie.json"),
    placesFileRel: "data/places/historie/oslo/places_historie.json",
    expectedSourceFile: "places/historie/oslo/places_historie.json",
    expectedCategory: "historie",
  },
  {
    label: "historie added batch 01 (Oslo)",
    mappingFile: path.join(ROOT, "data", "Civication", "map", "historyGoPlaceMapping.historie_added_batch_01.json"),
    mappingFileRel: "data/Civication/map/historyGoPlaceMapping.historie_added_batch_01.json",
    placesFile: path.join(ROOT, "data", "places", "historie", "oslo", "places_historie_added_batch_01.json"),
    placesFileRel: "data/places/historie/oslo/places_historie_added_batch_01.json",
    expectedSourceFile: "places/historie/oslo/places_historie_added_batch_01.json",
    expectedCategory: "historie",
  },
  {
    label: "kunst (Oslo)",
    mappingFile: path.join(ROOT, "data", "Civication", "map", "historyGoPlaceMapping.kunst.json"),
    mappingFileRel: "data/Civication/map/historyGoPlaceMapping.kunst.json",
    placesFile: path.join(ROOT, "data", "places", "kunst", "oslo", "places_kunst.json"),
    placesFileRel: "data/places/kunst/oslo/places_kunst.json",
    expectedSourceFile: "places/kunst/oslo/places_kunst.json",
    expectedCategory: "kunst",
  },
  {
    label: "musikk (Oslo)",
    mappingFile: path.join(ROOT, "data", "Civication", "map", "historyGoPlaceMapping.musikk.json"),
    mappingFileRel: "data/Civication/map/historyGoPlaceMapping.musikk.json",
    placesFile: path.join(ROOT, "data", "places", "musikk", "oslo", "places_musikk.json"),
    placesFileRel: "data/places/musikk/oslo/places_musikk.json",
    expectedSourceFile: "places/musikk/oslo/places_musikk.json",
    expectedCategory: "musikk",
  },
  {
    label: "litteratur (Oslo)",
    mappingFile: path.join(ROOT, "data", "Civication", "map", "historyGoPlaceMapping.litteratur.json"),
    mappingFileRel: "data/Civication/map/historyGoPlaceMapping.litteratur.json",
    placesFile: path.join(ROOT, "data", "places", "litteratur", "oslo", "places_litteratur.json"),
    placesFileRel: "data/places/litteratur/oslo/places_litteratur.json",
    expectedSourceFile: "places/litteratur/oslo/places_litteratur.json",
    expectedCategory: "litteratur",
  },
];

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

// Støtter samme former som audit-civication-building-types.mjs:
//   { "buildingTypes": { "<id>": { ... } } }
//   { "buildingTypes": [ { "id": "..." } ] }
//   { "<id>": { ... } }
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

function indexPlacesById(placesData: unknown) {
  const byId = new Map();
  if (!Array.isArray(placesData)) {
    return byId;
  }
  for (const place of placesData) {
    const placeObject = asObject(place);
    if (typeof placeObject?.id === "string") {
      byId.set(placeObject.id, placeObject);
    }
  }
  return byId;
}

function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function isValidLat(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLon(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= -180 && value <= 180;
}

function requireString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

// civicationPlaceId og mapping.id må være unike på tvers av alle mappingfilene,
// siden alle entries til slutt havner på det samme kartet.
const globalSeenCivicationPlaceIds = new Map();
const globalSeenMappingIds = new Map();

async function auditTarget(target, definedBuildingTypeIds) {
  let mappingData;
  let placesData;

  try {
    [mappingData, placesData] = await Promise.all([
      readJSON(target.mappingFile),
      readJSON(target.placesFile),
    ]);
  } catch (err) {
    console.error(`FEIL: ${err.message}`);
    return 1;
  }

  const fatal = [];

  // 1. Toppnivå-validering av mapping-filen.
  if (typeof mappingData?.schema === "undefined") {
    fatal.push("Mappingfilen mangler schema");
  }
  if (typeof mappingData?.version === "undefined") {
    fatal.push("Mappingfilen mangler version");
  }
  if (mappingData?.sourceFile !== target.expectedSourceFile) {
    fatal.push(
      `Mappingfilen har feil sourceFile: forventet "${target.expectedSourceFile}", fikk ${JSON.stringify(mappingData?.sourceFile)}`
    );
  }

  const mappingObject = asObject(mappingData);
  const mappings = asObject(mappingObject?.mappings);
  const mappingsIsObject = mappings && typeof mappings === "object" && !Array.isArray(mappings);
  if (!mappingsIsObject) {
    fatal.push("Mappingfilen mangler et gyldig mappings-objekt");
  }

  const placesById: Map<string, JsonObject> = indexPlacesById(placesData);
  const placesCount = Array.isArray(placesData) ? placesData.length : 0;
  if (!Array.isArray(placesData)) {
    fatal.push(`${target.placesFileRel} er ikke en liste over steder`);
  }

  const mappingEntries = mappingsIsObject ? Object.entries(mappings as JsonObject) as [string, JsonObject][] : [];

  // Tellere for unikhet (per fil, i tillegg til de globale settene).
  const seenHistoryGoPlaceIds = new Map();

  const usedBuildingTypeIds = new Set();
  const mappedHistoryGoPlaceIds = new Set();
  const needsEnrichmentList = [];

  const cityMapEntries = [];

  // 2-6. Per-mapping validering.
  for (const [mappingKey, mapping] of mappingEntries) {
    const m = mapping ?? {};
    const label = mappingKey;

    // 2. Obligatoriske felt og typer.
    if (!requireString(m.id)) {
      fatal.push(`${label}: mangler gyldig id (string)`);
    }
    if (!requireString(m.historyGoPlaceId)) {
      fatal.push(`${label}: mangler gyldig historyGoPlaceId (string)`);
    }
    if (m.historyGoSourceFile !== target.expectedSourceFile) {
      fatal.push(
        `${label}: historyGoSourceFile må være "${target.expectedSourceFile}", fikk ${JSON.stringify(m.historyGoSourceFile)}`
      );
    }
    if (!requireString(m.civicationPlaceId)) {
      fatal.push(`${label}: mangler gyldig civicationPlaceId (string)`);
    }
    if (!requireString(m.name)) {
      fatal.push(`${label}: mangler gyldig name (string)`);
    }
    if (m.category !== target.expectedCategory) {
      fatal.push(`${label}: category må være "${target.expectedCategory}", fikk ${JSON.stringify(m.category)}`);
    }
    if (typeof m.lat !== "number") {
      fatal.push(`${label}: lat må være number, fikk ${JSON.stringify(m.lat)}`);
    }
    if (typeof m.lon !== "number") {
      fatal.push(`${label}: lon må være number, fikk ${JSON.stringify(m.lon)}`);
    }
    if (!requireString(m.buildingTypeId)) {
      fatal.push(`${label}: mangler gyldig buildingTypeId (string)`);
    }
    if (!requireString(m.mapRole)) {
      fatal.push(`${label}: mangler gyldig mapRole (string)`);
    }
    if (!requireString(m.visibleAs)) {
      fatal.push(`${label}: mangler gyldig visibleAs (string)`);
    }
    if (!Array.isArray(m.socialFunctions)) {
      fatal.push(`${label}: socialFunctions må være array`);
    } else if (m.socialFunctions.length < 1) {
      fatal.push(`${label}: socialFunctions må ha minst 1 entry`);
    }
    if (!Array.isArray(m.phaseTypes)) {
      fatal.push(`${label}: phaseTypes må være array`);
    } else if (m.phaseTypes.length < 1) {
      fatal.push(`${label}: phaseTypes må ha minst 1 entry`);
    }
    if (typeof m.groundhopperRelevant !== "boolean") {
      fatal.push(`${label}: groundhopperRelevant må være boolean`);
    }
    if (typeof m.needsVerification !== "boolean") {
      fatal.push(`${label}: needsVerification må være boolean`);
    }

    // 3. Unikhet (globalt på tvers av mappingfiler).
    if (requireString(m.id)) {
      if (globalSeenMappingIds.has(m.id)) {
        fatal.push(`${label}: mapping.id "${m.id}" er ikke unik (også brukt i ${globalSeenMappingIds.get(m.id)})`);
      } else {
        globalSeenMappingIds.set(m.id, `${target.label}/${label}`);
      }
    }
    if (requireString(m.historyGoPlaceId)) {
      if (seenHistoryGoPlaceIds.has(m.historyGoPlaceId)) {
        fatal.push(
          `${label}: historyGoPlaceId "${m.historyGoPlaceId}" er ikke unik (også brukt i ${seenHistoryGoPlaceIds.get(m.historyGoPlaceId)})`
        );
      } else {
        seenHistoryGoPlaceIds.set(m.historyGoPlaceId, label);
      }
    }
    if (requireString(m.civicationPlaceId)) {
      if (globalSeenCivicationPlaceIds.has(m.civicationPlaceId)) {
        fatal.push(
          `${label}: civicationPlaceId "${m.civicationPlaceId}" er ikke unik (også brukt i ${globalSeenCivicationPlaceIds.get(m.civicationPlaceId)})`
        );
      } else {
        globalSeenCivicationPlaceIds.set(m.civicationPlaceId, `${target.label}/${label}`);
      }
    }

    // 6. Geodata-grenser.
    if (typeof m.lat === "number" && !isValidLat(m.lat)) {
      fatal.push(`${label}: lat ${m.lat} er utenfor gyldig område (-90..90)`);
    }
    if (typeof m.lon === "number" && !isValidLon(m.lon)) {
      fatal.push(`${label}: lon ${m.lon} er utenfor gyldig område (-180..180)`);
    }

    // 4. Kildekobling mot kildefilen.
    if (requireString(m.historyGoPlaceId)) {
      mappedHistoryGoPlaceIds.add(m.historyGoPlaceId);
      const place = placesById.get(m.historyGoPlaceId);
      if (!place) {
        fatal.push(`${label}: historyGoPlaceId "${m.historyGoPlaceId}" finnes ikke i ${target.placesFileRel}`);
      } else {
        if (m.name !== place.name) {
          fatal.push(
            `${label}: name "${m.name}" matcher ikke kilde "${place.name}"`
          );
        }
        if (m.lat !== place.lat) {
          fatal.push(`${label}: lat ${m.lat} matcher ikke kilde ${place.lat}`);
        }
        if (m.lon !== place.lon) {
          fatal.push(`${label}: lon ${m.lon} matcher ikke kilde ${place.lon}`);
        }
        if (m.category !== place.category) {
          fatal.push(
            `${label}: category "${m.category}" matcher ikke kilde "${place.category}"`
          );
        }

        const placeHasEmneIds = Array.isArray(place.emne_ids) && place.emne_ids.length > 0;
        if (placeHasEmneIds) {
          if (!arraysEqual(m.emne_ids, place.emne_ids)) {
            fatal.push(
              `${label}: emne_ids matcher ikke kilde nøyaktig (mapping=${JSON.stringify(m.emne_ids)}, kilde=${JSON.stringify(place.emne_ids)})`
            );
          }
        } else {
          // place.emne_ids mangler -> mapping.emne_ids skal være [] og needsEnrichment true.
          if (!Array.isArray(m.emne_ids) || m.emne_ids.length !== 0) {
            fatal.push(
              `${label}: kilden mangler emne_ids, så mapping.emne_ids skal være [] (fikk ${JSON.stringify(m.emne_ids)})`
            );
          }
          if (m.needsEnrichment !== true) {
            fatal.push(
              `${label}: kilden mangler emne_ids, så mapping.needsEnrichment skal være true`
            );
          }
        }
      }
    }

    // 5. Building type-kobling.
    if (requireString(m.buildingTypeId) && !definedBuildingTypeIds.has(m.buildingTypeId)) {
      fatal.push(`${label}: buildingTypeId "${m.buildingTypeId}" mangler i buildingTypes.json`);
    }
    if (requireString(m.buildingTypeId)) {
      usedBuildingTypeIds.add(m.buildingTypeId);
    }

    if (m.needsEnrichment === true) {
      needsEnrichmentList.push(m.id ?? label);
    }

    // 7. In-memory transformasjon til city map entry.
    cityMapEntries.push({
      id: m.civicationPlaceId,
      historyGoPlaceId: m.historyGoPlaceId,
      name: m.name,
      category: m.category,
      lat: m.lat,
      lon: m.lon,
      buildingTypeId: m.buildingTypeId,
      mapRole: m.mapRole,
      visibleAs: m.visibleAs,
      socialFunctions: m.socialFunctions,
      phaseTypes: m.phaseTypes,
      groundhopperRelevant: m.groundhopperRelevant,
      source: {
        mappingFile: target.mappingFileRel,
        historyGoSourceFile: target.placesFileRel,
      },
    });
  }

  // 8. Valider cityMapEntries.
  if (cityMapEntries.length !== mappingEntries.length) {
    fatal.push(
      `Antall cityMapEntries (${cityMapEntries.length}) er ulik antall mappings (${mappingEntries.length})`
    );
  }
  const seenEntryIds = new Set();
  for (const entry of cityMapEntries) {
    if (typeof entry.id !== "string" || !entry.id) {
      fatal.push(`cityMapEntry mangler gyldig id`);
    } else if (seenEntryIds.has(entry.id)) {
      fatal.push(`cityMapEntry id "${entry.id}" er ikke unik`);
    } else {
      seenEntryIds.add(entry.id);
    }
    if (typeof entry.lat !== "number") {
      fatal.push(`cityMapEntry "${entry.id}": lat er ikke number`);
    }
    if (typeof entry.lon !== "number") {
      fatal.push(`cityMapEntry "${entry.id}": lon er ikke number`);
    }
    if (typeof entry.buildingTypeId !== "string" || !definedBuildingTypeIds.has(entry.buildingTypeId)) {
      fatal.push(`cityMapEntry "${entry.id}": buildingTypeId mangler i buildingTypes.json`);
    }
    for (const field of ["name", "category", "mapRole", "visibleAs"]) {
      if (typeof entry[field] !== "string" || !entry[field]) {
        fatal.push(`cityMapEntry "${entry.id}": mangler ${field}`);
      }
    }
  }

  // 11. Unmapped places (forventet, gir ikke exit 1).
  const unmappedPlaces = [];
  if (Array.isArray(placesData)) {
    for (const place of placesData) {
      if (place && typeof place.id === "string" && !mappedHistoryGoPlaceIds.has(place.id)) {
        unmappedPlaces.push(place.id);
      }
    }
  }

  printReport(target, {
    placesCount,
    mappingsCount: mappingEntries.length,
    cityMapEntriesCount: cityMapEntries.length,
    uniqueHistoryGoPlaceIds: seenHistoryGoPlaceIds.size,
    uniqueBuildingTypeIds: usedBuildingTypeIds.size,
    unmappedPlaces,
    needsEnrichmentList,
    fatal,
  });

  return fatal.length > 0 ? 1 : 0;
}

async function main() {
  let buildingTypesData;
  try {
    buildingTypesData = await readJSON(BUILDING_TYPES_FILE);
  } catch (err) {
    console.error(`FEIL: ${err.message}`);
    process.exit(1);
  }
  const definedBuildingTypeIds = extractBuildingTypeIds(buildingTypesData);

  let exitCode = 0;
  for (const target of TARGETS) {
    const code = await auditTarget(target, definedBuildingTypeIds);
    if (code !== 0) exitCode = 1;
    console.log("");
  }
  process.exit(exitCode);
}

function printReport(target, report) {
  const line = (text = "") => console.log(text);

  line(`=== Civication city map entries audit [${target.label}] ===`);
  line(`Mapping:       ${target.mappingFileRel}`);
  line(`Source places: ${target.placesFileRel}`);
  line(`BuildingTypes: data/Civication/map/buildingTypes.json`);
  line("");
  line("Sammendrag:");
  line(`  Places i kildefilen:                    ${report.placesCount}`);
  line(`  Mappings i mappingfilen:                ${report.mappingsCount}`);
  line(`  cityMapEntries generert (i minnet):     ${report.cityMapEntriesCount}`);
  line(`  Unike historyGoPlaceId:                 ${report.uniqueHistoryGoPlaceIds}`);
  line(`  Unike buildingTypeId brukt:             ${report.uniqueBuildingTypeIds}`);
  line(`  Unmapped places fra kildefilen:         ${report.unmappedPlaces.length}`);
  line(`  Mappings med needsEnrichment: true:     ${report.needsEnrichmentList.length}`);
  line("");

  printSection(
    "Unmapped places (finnes i kildefilen, men ikke i mappingen)",
    report.unmappedPlaces,
    (id) => id
  );

  printSection(
    "Mappings med needsEnrichment: true",
    report.needsEnrichmentList,
    (id) => id
  );

  printSection("Alvorlige feil", report.fatal, (msg) => msg);

  line("");
  if (report.fatal.length > 0) {
    line(`RESULTAT [${target.label}]: ${report.fatal.length} alvorlig(e) feil – exit 1`);
    line("In-memory cityMapEntries kan IKKE genereres trygt. Ingen datafiler ble endret.");
  } else {
    line(`RESULTAT [${target.label}]: ingen alvorlige feil – exit 0`);
    line(`In-memory cityMapEntries kan genereres trygt (${report.cityMapEntriesCount} entries).`);
    line(`Unmapped places: ${report.unmappedPlaces.length} (forventet, mappingen bygges gradvis).`);
    line(`needsEnrichment: ${report.needsEnrichmentList.length}.`);
    line("Ingen datafiler ble endret.");
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
