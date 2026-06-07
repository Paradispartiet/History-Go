// scripts/audit-civication-historygo-place-mapping.mjs
// Read-only audit av Civication-mappingen for History Go by-steder.
//
// Validerer at:
//   data/Civication/map/historyGoPlaceMapping.by.json
// stemmer mot kildefilen:
//   data/places/by/oslo/places_by.json
//
// Scriptet endrer ingen datafiler og genererer ingen ny mappingdata.
//
// Kjør:  node scripts/audit-civication-historygo-place-mapping.mjs
//        npm run audit:civication-place-mapping
//
// Avslutter med:
//   exit 0  – ingen alvorlige feil (manglende videre mapping er forventet)
//   exit 1  – ukjent historyGoPlaceId, manglende obligatoriske felt,
//             navn/koordinater/emne_ids matcher ikke kilden, eller JSON-feil

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const MAPPING_FILE = path.join(ROOT, "data", "Civication", "map", "historyGoPlaceMapping.by.json");
const PLACES_FILE = path.join(ROOT, "data", "places", "by", "oslo", "places_by.json");

const EXPECTED_SOURCE_FILE = "places/by/oslo/places_by.json";
const EXPECTED_CATEGORY = "by";

// Obligatoriske felt per mapping (jf. oppgavens punkt 4).
const REQUIRED_FIELDS = [
  "id",
  "historyGoPlaceId",
  "historyGoSourceFile",
  "civicationPlaceId",
  "name",
  "category",
  "lat",
  "lon",
  "buildingTypeId",
  "mapRole",
  "visibleAs",
  "socialFunctions",
  "phaseTypes",
  "groundhopperRelevant",
  "needsVerification",
];

// Liten toleranse for flyttallssammenligning av koordinater.
const COORD_EPSILON = 1e-9;

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

function coordsMatch(a, b) {
  if (typeof a !== "number" || typeof b !== "number") return false;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= COORD_EPSILON;
}

function emneIdsEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function placesFromData(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.places)) return data.places;
  return [];
}

async function main() {
  // --- Last og parse begge filer (JSON-parsefeil => exit 1). ---
  let mappingData;
  let placesData;
  try {
    [mappingData, placesData] = await Promise.all([
      readJSON(MAPPING_FILE),
      readJSON(PLACES_FILE),
    ]);
  } catch (err) {
    console.error(`FEIL: ${err.message}`);
    process.exit(1);
  }

  const fatal = []; // alvorlige feil => exit 1

  // --- Validér toppnivå-felt i mappingfilen. ---
  for (const key of ["schema", "version", "sourceFile", "mappings"]) {
    if (!(key in mappingData)) {
      fatal.push(`Mappingfilen mangler toppnivå-felt: "${key}"`);
    }
  }

  if (mappingData.sourceFile !== EXPECTED_SOURCE_FILE) {
    fatal.push(
      `sourceFile er "${mappingData.sourceFile}", forventet "${EXPECTED_SOURCE_FILE}"`
    );
  }

  const mappingsIsObject =
    mappingData.mappings &&
    typeof mappingData.mappings === "object" &&
    !Array.isArray(mappingData.mappings);
  if (!mappingsIsObject) {
    fatal.push("mappings er ikke et objekt");
  }

  // Hvis grunnstrukturen mangler, er det ingen vits i å fortsette.
  if (fatal.length > 0) {
    printReport({
      placesCount: placesFromData(placesData).length,
      mappingCount: mappingsIsObject ? Object.keys(mappingData.mappings).length : 0,
      needsEnrichmentCount: 0,
      unknownPlaceIds: [],
      unmappedPlaces: [],
      wrongName: [],
      wrongCoords: [],
      wrongEmneIds: [],
      missingFields: [],
      fatal,
    });
    process.exit(1);
  }

  // --- Bygg oppslag fra kildefilen. ---
  const places = placesFromData(placesData);
  const placesById = new Map();
  for (const place of places) {
    const id = place?.id;
    if (id != null) placesById.set(String(id), place);
  }

  const mappings = mappingData.mappings;
  const mappingKeys = Object.keys(mappings);

  // Rapportbøtter.
  const unknownPlaceIds = []; // mapping -> ukjent historyGoPlaceId (fatal)
  const wrongName = [];
  const wrongCoords = [];
  const wrongEmneIds = [];
  const missingFields = [];
  const mappedPlaceIds = new Set();
  let needsEnrichmentCount = 0;

  for (const key of mappingKeys) {
    const m = mappings[key];

    // Obligatoriske felt.
    const missing = REQUIRED_FIELDS.filter((f) => !(f in (m || {})));
    if (missing.length > 0) {
      missingFields.push({ mappingId: key, missing });
    }

    if (m?.needsEnrichment === true) needsEnrichmentCount++;

    const placeId = m?.historyGoPlaceId;
    if (placeId != null) mappedPlaceIds.add(String(placeId));

    // historyGoSourceFile må peke på kilden.
    if (m?.historyGoSourceFile !== EXPECTED_SOURCE_FILE) {
      fatal.push(
        `${key}: historyGoSourceFile er "${m?.historyGoSourceFile}", forventet "${EXPECTED_SOURCE_FILE}"`
      );
    }

    // category må være "by".
    if (m?.category !== EXPECTED_CATEGORY) {
      fatal.push(`${key}: category er "${m?.category}", forventet "${EXPECTED_CATEGORY}"`);
    }

    // historyGoPlaceId må finnes i kilden.
    const place = placeId != null ? placesById.get(String(placeId)) : undefined;
    if (!place) {
      unknownPlaceIds.push({ mappingId: key, historyGoPlaceId: placeId ?? null });
      // Uten kilde kan vi ikke sammenligne navn/koordinater/emne_ids.
      continue;
    }

    // Navn må matche kilden.
    if (m.name !== place.name) {
      wrongName.push({ mappingId: key, mappingName: m.name, sourceName: place.name });
    }

    // Koordinater må matche kilden.
    if (!coordsMatch(m.lat, place.lat) || !coordsMatch(m.lon, place.lon)) {
      wrongCoords.push({
        mappingId: key,
        mapping: { lat: m.lat, lon: m.lon },
        source: { lat: place.lat, lon: place.lon },
      });
    }

    // emne_ids-regler.
    const sourceHasEmne = Array.isArray(place.emne_ids) && place.emne_ids.length > 0;
    if (sourceHasEmne) {
      if (!emneIdsEqual(m.emne_ids, place.emne_ids)) {
        wrongEmneIds.push({
          mappingId: key,
          reason: "emne_ids matcher ikke kilden",
          mapping: m.emne_ids ?? null,
          source: place.emne_ids,
        });
      }
    } else {
      // Kilden mangler emne_ids: mapping.emne_ids skal være [] og needsEnrichment true.
      const emneIsEmptyArray = Array.isArray(m.emne_ids) && m.emne_ids.length === 0;
      if (!emneIsEmptyArray || m.needsEnrichment !== true) {
        wrongEmneIds.push({
          mappingId: key,
          reason: "kilden mangler emne_ids; krever emne_ids: [] og needsEnrichment: true",
          mapping: m.emne_ids ?? null,
          needsEnrichment: m.needsEnrichment ?? null,
        });
      }
    }
  }

  // Steder i kilden som ikke er dekket av mappingen (forventet, ikke fatal).
  const unmappedPlaces = [];
  for (const place of places) {
    const id = place?.id;
    if (id != null && !mappedPlaceIds.has(String(id))) {
      unmappedPlaces.push(String(id));
    }
  }

  // --- Avgjør alvorlige feil. ---
  if (unknownPlaceIds.length > 0) {
    for (const u of unknownPlaceIds) {
      fatal.push(`${u.mappingId}: ukjent historyGoPlaceId "${u.historyGoPlaceId}"`);
    }
  }
  if (missingFields.length > 0) {
    for (const mf of missingFields) {
      fatal.push(`${mf.mappingId}: mangler obligatoriske felt: ${mf.missing.join(", ")}`);
    }
  }
  if (wrongName.length > 0) {
    for (const w of wrongName) {
      fatal.push(`${w.mappingId}: navn "${w.mappingName}" matcher ikke kilden "${w.sourceName}"`);
    }
  }
  if (wrongCoords.length > 0) {
    for (const w of wrongCoords) {
      fatal.push(
        `${w.mappingId}: koordinater (${w.mapping.lat}, ${w.mapping.lon}) matcher ikke kilden (${w.source.lat}, ${w.source.lon})`
      );
    }
  }
  if (wrongEmneIds.length > 0) {
    for (const w of wrongEmneIds) {
      fatal.push(`${w.mappingId}: ${w.reason}`);
    }
  }

  printReport({
    placesCount: places.length,
    mappingCount: mappingKeys.length,
    needsEnrichmentCount,
    unknownPlaceIds,
    unmappedPlaces,
    wrongName,
    wrongCoords,
    wrongEmneIds,
    missingFields,
    fatal,
  });

  process.exit(fatal.length > 0 ? 1 : 0);
}

function printReport(r) {
  const line = (s = "") => console.log(s);

  line("=== Civication History Go place-mapping audit ===");
  line(`Kilde:   data/places/by/oslo/places_by.json`);
  line(`Mapping: data/Civication/map/historyGoPlaceMapping.by.json`);
  line("");
  line("Sammendrag:");
  line(`  Steder i places_by.json:                 ${r.placesCount}`);
  line(`  Mappinger i historyGoPlaceMapping.by:    ${r.mappingCount}`);
  line(`  Mappinger med needsEnrichment: true:     ${r.needsEnrichmentCount}`);
  line(`  Steder uten mapping (unmappedPlaces):    ${r.unmappedPlaces.length}`);
  line("");

  const section = (title, items, fmt) => {
    line(`${title}: ${items.length}`);
    for (const it of items) line(`  - ${fmt(it)}`);
  };

  section(
    "Mappinger med ukjent historyGoPlaceId",
    r.unknownPlaceIds,
    (i) => `${i.mappingId} -> "${i.historyGoPlaceId}"`
  );
  section(
    "Mappinger som mangler obligatoriske felt",
    r.missingFields,
    (i) => `${i.mappingId}: ${i.missing.join(", ")}`
  );
  section(
    "Mappinger med feil navn",
    r.wrongName,
    (i) => `${i.mappingId}: "${i.mappingName}" != kilde "${i.sourceName}"`
  );
  section(
    "Mappinger med feil koordinater",
    r.wrongCoords,
    (i) =>
      `${i.mappingId}: (${i.mapping.lat}, ${i.mapping.lon}) != kilde (${i.source.lat}, ${i.source.lon})`
  );
  section(
    "Mappinger med feil/manglende emne_ids",
    r.wrongEmneIds,
    (i) => `${i.mappingId}: ${i.reason}`
  );
  line("");
  section(
    "unmappedPlaces (steder i kilden uten mapping – forventet, gir ikke exit 1)",
    r.unmappedPlaces,
    (id) => id
  );
  line("");

  if (r.fatal.length > 0) {
    line(`RESULTAT: ${r.fatal.length} alvorlig(e) feil – exit 1`);
  } else {
    line("RESULTAT: ingen alvorlige feil – exit 0");
  }
}

main().catch((err) => {
  console.error(`Uventet feil: ${err?.stack || err}`);
  process.exit(1);
});
