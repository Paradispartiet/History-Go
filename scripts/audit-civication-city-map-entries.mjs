// scripts/audit-civication-city-map-entries.mjs
// Read-only audit/generator for Civication city map entries fra History Go by-mapping.
//
// Validerer at History Go -> Civication city map mappingen kan transformeres til rene
// Civication map entries uten UI-endringer, og lager en in-memory transformasjon.
//
// Leser:
//   data/Civication/map/historyGoPlaceMapping.by.json
//   data/places/by/oslo/places_by.json
//   data/Civication/map/buildingTypes.json
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
const ROOT = path.resolve(__dirname, "..");

const MAPPING_FILE = path.join(ROOT, "data", "Civication", "map", "historyGoPlaceMapping.by.json");
const PLACES_FILE = path.join(ROOT, "data", "places", "by", "oslo", "places_by.json");
const BUILDING_TYPES_FILE = path.join(ROOT, "data", "Civication", "map", "buildingTypes.json");

const EXPECTED_SOURCE_FILE = "places/by/oslo/places_by.json";
const MAPPING_FILE_REL = "data/Civication/map/historyGoPlaceMapping.by.json";
const PLACES_FILE_REL = "data/places/by/oslo/places_by.json";

async function readJSON(file) {
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
function extractBuildingTypeIds(buildingTypesData) {
  const ids = new Set();
  const root = buildingTypesData?.buildingTypes ?? buildingTypesData;

  if (Array.isArray(root)) {
    for (const item of root) {
      if (typeof item?.id === "string" && item.id.trim()) {
        ids.add(item.id);
      }
    }
    return ids;
  }

  if (root && typeof root === "object") {
    for (const [key, value] of Object.entries(root)) {
      if (typeof value?.id === "string" && value.id.trim()) {
        ids.add(value.id);
      } else if (typeof key === "string" && key.trim()) {
        ids.add(key);
      }
    }
  }

  return ids;
}

function indexPlacesById(placesData) {
  const byId = new Map();
  if (!Array.isArray(placesData)) {
    return byId;
  }
  for (const place of placesData) {
    if (place && typeof place.id === "string") {
      byId.set(place.id, place);
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

async function main() {
  let mappingData;
  let placesData;
  let buildingTypesData;

  try {
    [mappingData, placesData, buildingTypesData] = await Promise.all([
      readJSON(MAPPING_FILE),
      readJSON(PLACES_FILE),
      readJSON(BUILDING_TYPES_FILE),
    ]);
  } catch (err) {
    console.error(`FEIL: ${err.message}`);
    process.exit(1);
  }

  const fatal = [];

  // 1. Toppnivå-validering av mapping-filen.
  if (typeof mappingData?.schema === "undefined") {
    fatal.push("Mappingfilen mangler schema");
  }
  if (typeof mappingData?.version === "undefined") {
    fatal.push("Mappingfilen mangler version");
  }
  if (mappingData?.sourceFile !== EXPECTED_SOURCE_FILE) {
    fatal.push(
      `Mappingfilen har feil sourceFile: forventet "${EXPECTED_SOURCE_FILE}", fikk ${JSON.stringify(mappingData?.sourceFile)}`
    );
  }

  const mappings = mappingData?.mappings;
  const mappingsIsObject = mappings && typeof mappings === "object" && !Array.isArray(mappings);
  if (!mappingsIsObject) {
    fatal.push("Mappingfilen mangler et gyldig mappings-objekt");
  }

  const placesById = indexPlacesById(placesData);
  const placesCount = Array.isArray(placesData) ? placesData.length : 0;
  if (!Array.isArray(placesData)) {
    fatal.push(`${PLACES_FILE_REL} er ikke en liste over steder`);
  }

  const definedBuildingTypeIds = extractBuildingTypeIds(buildingTypesData);

  const mappingEntries = mappingsIsObject ? Object.entries(mappings) : [];

  // Tellere for unikhet.
  const seenMappingIds = new Map();
  const seenHistoryGoPlaceIds = new Map();
  const seenCivicationPlaceIds = new Map();

  const usedBuildingTypeIds = new Set();
  const mappedHistoryGoPlaceIds = new Set();
  const needsEnrichmentList = [];

  const cityMapEntries = [];

  function requireString(value) {
    return typeof value === "string" && value.length > 0;
  }

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
    if (m.historyGoSourceFile !== EXPECTED_SOURCE_FILE) {
      fatal.push(
        `${label}: historyGoSourceFile må være "${EXPECTED_SOURCE_FILE}", fikk ${JSON.stringify(m.historyGoSourceFile)}`
      );
    }
    if (!requireString(m.civicationPlaceId)) {
      fatal.push(`${label}: mangler gyldig civicationPlaceId (string)`);
    }
    if (!requireString(m.name)) {
      fatal.push(`${label}: mangler gyldig name (string)`);
    }
    if (m.category !== "by") {
      fatal.push(`${label}: category må være "by", fikk ${JSON.stringify(m.category)}`);
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

    // 3. Unikhet.
    if (requireString(m.id)) {
      if (seenMappingIds.has(m.id)) {
        fatal.push(`${label}: mapping.id "${m.id}" er ikke unik (også brukt i ${seenMappingIds.get(m.id)})`);
      } else {
        seenMappingIds.set(m.id, label);
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
      if (seenCivicationPlaceIds.has(m.civicationPlaceId)) {
        fatal.push(
          `${label}: civicationPlaceId "${m.civicationPlaceId}" er ikke unik (også brukt i ${seenCivicationPlaceIds.get(m.civicationPlaceId)})`
        );
      } else {
        seenCivicationPlaceIds.set(m.civicationPlaceId, label);
      }
    }

    // 6. Geodata-grenser.
    if (typeof m.lat === "number" && !isValidLat(m.lat)) {
      fatal.push(`${label}: lat ${m.lat} er utenfor gyldig område (-90..90)`);
    }
    if (typeof m.lon === "number" && !isValidLon(m.lon)) {
      fatal.push(`${label}: lon ${m.lon} er utenfor gyldig område (-180..180)`);
    }

    // 4. Kildekobling mot places_by.json.
    if (requireString(m.historyGoPlaceId)) {
      mappedHistoryGoPlaceIds.add(m.historyGoPlaceId);
      const place = placesById.get(m.historyGoPlaceId);
      if (!place) {
        fatal.push(`${label}: historyGoPlaceId "${m.historyGoPlaceId}" finnes ikke i ${PLACES_FILE_REL}`);
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
      category: "by",
      lat: m.lat,
      lon: m.lon,
      buildingTypeId: m.buildingTypeId,
      mapRole: m.mapRole,
      visibleAs: m.visibleAs,
      socialFunctions: m.socialFunctions,
      phaseTypes: m.phaseTypes,
      groundhopperRelevant: m.groundhopperRelevant,
      source: {
        mappingFile: MAPPING_FILE_REL,
        historyGoSourceFile: PLACES_FILE_REL,
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

  printReport({
    placesCount,
    mappingsCount: mappingEntries.length,
    cityMapEntriesCount: cityMapEntries.length,
    uniqueCivicationPlaceIds: seenCivicationPlaceIds.size,
    uniqueHistoryGoPlaceIds: seenHistoryGoPlaceIds.size,
    uniqueBuildingTypeIds: usedBuildingTypeIds.size,
    unmappedPlaces,
    needsEnrichmentList,
    fatal,
  });

  process.exit(fatal.length > 0 ? 1 : 0);
}

function printReport(report) {
  const line = (text = "") => console.log(text);

  line("=== Civication city map entries audit ===");
  line(`Mapping:       ${MAPPING_FILE_REL}`);
  line(`Source places: ${PLACES_FILE_REL}`);
  line(`BuildingTypes: data/Civication/map/buildingTypes.json`);
  line("");
  line("Sammendrag:");
  line(`  Places i places_by.json:                ${report.placesCount}`);
  line(`  Mappings i historyGoPlaceMapping.by:    ${report.mappingsCount}`);
  line(`  cityMapEntries generert (i minnet):     ${report.cityMapEntriesCount}`);
  line(`  Unike civicationPlaceId:                ${report.uniqueCivicationPlaceIds}`);
  line(`  Unike historyGoPlaceId:                 ${report.uniqueHistoryGoPlaceIds}`);
  line(`  Unike buildingTypeId brukt:             ${report.uniqueBuildingTypeIds}`);
  line(`  Unmapped places fra places_by.json:     ${report.unmappedPlaces.length}`);
  line(`  Mappings med needsEnrichment: true:     ${report.needsEnrichmentList.length}`);
  line("");

  printSection(
    "Unmapped places (finnes i places_by.json, men ikke i mappingen)",
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
    line(`RESULTAT: ${report.fatal.length} alvorlig(e) feil – exit 1`);
    line("In-memory cityMapEntries kan IKKE genereres trygt. Ingen datafiler ble endret.");
  } else {
    line("RESULTAT: ingen alvorlige feil – exit 0");
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
