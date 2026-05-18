import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST_PATH = "data/wonderkammer/index.json";
const REQUIRED_ENTRY_FIELDS = ["id", "title", "type", "description"];
const ACTIVITY_TEXT_TYPES = new Set([
  "play_zone",
  "play_object",
  "activity",
  "training_zone",
  "training"
]);
const GENERIC_TITLE_LIMIT = 3;

// Valgfrie smart-felt som løfter en chamber fra banal til stedlig.
// Brukes til varsler – ikke hard error – jf. data/wonderkammer/README.md.
const SMART_FIELDS = [
  "observationHook",
  "whyItMatters",
  "placeSpecificDetail",
  "sensoryPrompt",
  "microMission",
  "childAction",
  "adultRole",
  "historyLayer",
  "socialLayer",
  "materialLayer",
  "conceptHook",
  "collectibleHint"
];
const SHORT_DESCRIPTION_LIMIT = 40;
const TREASURE_FIELDS = ["treasureTitle","treasureType","cabinetCategory","curiosity","whereToFind","whatToDo","whatToNotice","material","rarity","collectible","collectionNote","sourceNote"];
const CABINET_CATEGORIES = new Set(["naturalia","artificialia","scientifica","mirabilia","memorabilia","urbania","sonica","lingua","relic"]);
const RARITY_VALUES = new Set(["vanlig","uvanlig","sjelden","skjult","legendarisk","mytisk"]);
const HYPOTHETICAL_PATTERNS=[/\bkan finnes\b/i,/\bkan være\b/i,/\btypisk\b/i,/\bmulig spor\b/i,/\bantatt\b/i];
const GENERIC_ACTIVITY_PATTERNS = [
  /^se etter\b/i,
  /^tell\b/i,
  /^løp\b/i,
  /^finn fem\b/i,
  /^finn tre\b/i
];

const errors = [];
const warnings = [];
const entryIds = new Map();
const titleCounts = new Map();

function repoPath(relativePath) {
  return path.join(ROOT, relativePath);
}

async function pathExists(relativePath) {
  try {
    await fs.stat(repoPath(relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readJson(relativePath) {
  try {
    const raw = await fs.readFile(repoPath(relativePath), "utf8");
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`${relativePath}: JSON kunne ikke parses (${error.message})`);
    return null;
  }
}

async function listJsonFiles(relativePath) {
  if (!(await pathExists(relativePath))) return [];

  const stat = await fs.stat(repoPath(relativePath));
  if (stat.isFile()) {
    return relativePath.endsWith(".json") ? [relativePath] : [];
  }

  const out = [];
  const entries = await fs.readdir(repoPath(relativePath), { withFileTypes: true });

  for (const entry of entries) {
    const child = path.join(relativePath, entry.name).replaceAll(path.sep, "/");
    if (entry.isDirectory()) {
      out.push(...(await listJsonFiles(child)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      out.push(child);
    }
  }

  return out;
}

function collectIds(value, ids) {
  if (Array.isArray(value)) {
    for (const item of value) collectIds(item, ids);
    return;
  }

  if (!value || typeof value !== "object") return;

  if (typeof value.id === "string" && value.id.trim()) {
    ids.add(value.id);
  }

  for (const child of Object.values(value)) {
    collectIds(child, ids);
  }
}

async function collectIdsFromRoots(roots) {
  const ids = new Set();

  for (const root of roots) {
    const files = await listJsonFiles(root);
    if (!files.length) {
      warnings.push(`${root}: fant ingen JSON-filer for ID-sjekk`);
      continue;
    }

    for (const file of files) {
      const json = await readJson(file);
      if (json) collectIds(json, ids);
    }
  }

  return ids;
}

function rememberEntryId(id, location) {
  if (!id) return;
  if (!entryIds.has(id)) {
    entryIds.set(id, []);
  }
  entryIds.get(id).push(location);
}

function rememberTitle(title) {
  if (!title) return;
  titleCounts.set(title, (titleCounts.get(title) || 0) + 1);
}

function hasAnyTreasureField(entry) {
  return TREASURE_FIELDS.some(key => {
    const value = entry?.[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

function hasConcreteThingSignals(entry) {
  return Boolean(
    (typeof entry?.treasureTitle === "string" && entry.treasureTitle.trim()) ||
    (typeof entry?.treasureType === "string" && entry.treasureType.trim()) ||
    (typeof entry?.placeSpecificDetail === "string" && entry.placeSpecificDetail.trim()) ||
    (typeof entry?.observationHook === "string" && entry.observationHook.trim())
  );
}

function containsHypotheticalLanguage(entry) {
  const text = [entry?.description, entry?.activityText, entry?.whatToDo, entry?.whatToNotice, entry?.curiosity]
    .filter(v => typeof v === "string")
    .join(" ");
  return HYPOTHETICAL_PATTERNS.some(rx => rx.test(text));
}

function hasAnySmartField(entry) {
  return SMART_FIELDS.some(key => {
    const value = entry?.[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

function isGenericActivityText(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  if (value.length > 120) return false;
  return GENERIC_ACTIVITY_PATTERNS.some(rx => rx.test(value));
}

function flagBanalEntry(entry, location) {
  if (!entry || typeof entry !== "object") return;

  const description = typeof entry.description === "string" ? entry.description.trim() : "";
  const activityText = typeof entry.activityText === "string" ? entry.activityText.trim() : "";
  const hasSmart = hasAnySmartField(entry);
  const hasPlaceSpecific =
    typeof entry.placeSpecificDetail === "string" && entry.placeSpecificDetail.trim().length > 0;

  // Helt blottet for smart-felt – kan være banal. Varsel, ikke hard error.
  if (!hasSmart && description && description.length < SHORT_DESCRIPTION_LIMIT) {
    warnings.push(
      `${location}: kort description (${description.length} tegn) uten smart-felt – kan virke banal`
    );
  }

  if (!hasSmart && isGenericActivityText(activityText)) {
    warnings.push(
      `${location}: activityText starter generisk ("${activityText.slice(0, 40)}…") uten støttende smart-felt`
    );
  }

  if (!hasPlaceSpecific && !hasSmart) {
    warnings.push(
      `${location}: mangler både placeSpecificDetail og øvrige smart-felt – vurder om chamberen er stedsspesifikk nok`
    );
  }
}

function validateEntry(entry, location) {
  if (!entry || typeof entry !== "object") {
    errors.push(`${location}: entry er ikke et objekt`);
    return;
  }

  for (const field of REQUIRED_ENTRY_FIELDS) {
    if (typeof entry[field] !== "string" || !entry[field].trim()) {
      errors.push(`${location}: mangler ${field}`);
    }
  }

  if (ACTIVITY_TEXT_TYPES.has(entry.type)) {
    if (typeof entry.activityText !== "string" || !entry.activityText.trim()) {
      errors.push(`${location}: type ${entry.type} mangler activityText`);
    }
  }

  flagBanalEntry(entry, location);

  const hasSmart = hasAnySmartField(entry);
  const hasTreasure = hasAnyTreasureField(entry);

  if (!hasSmart && !hasTreasure) {
    warnings.push(`${location}: mangler både smartfelt og treasurefelt`);
  }

  if (typeof entry.activityText === "string" && entry.activityText.trim() && !hasConcreteThingSignals(entry)) {
    warnings.push(`${location}: har activityText, men ingen konkret skatt/ting/spor/detalj`);
  }

  if (typeof entry.whatToDo === "string" && entry.whatToDo.trim()) {
    if (!(typeof entry.treasureTitle === "string" && entry.treasureTitle.trim()) || !(typeof entry.treasureType === "string" && entry.treasureType.trim())) {
      warnings.push(`${location}: har whatToDo, men mangler treasureTitle eller treasureType`);
    }
  }

  if (typeof entry.cabinetCategory === "string" && entry.cabinetCategory.trim() && !CABINET_CATEGORIES.has(entry.cabinetCategory.trim())) {
    warnings.push(`${location}: cabinetCategory utenfor tillatte verdier`);
  }

  if (typeof entry.rarity === "string" && entry.rarity.trim() && !RARITY_VALUES.has(entry.rarity.trim())) {
    warnings.push(`${location}: rarity utenfor tillatte verdier`);
  }

  if (containsHypotheticalLanguage(entry) && !(typeof entry.sourceNote === "string" && entry.sourceNote.trim())) {
    warnings.push(`${location}: hypotetisk formulering uten sourceNote`);
  }

  rememberEntryId(entry.id, location);
  rememberTitle(entry.title);

  if (entry.items !== undefined) {
    if (!Array.isArray(entry.items)) {
      errors.push(`${location}: items må være array hvis feltet finnes`);
      return;
    }

    entry.items.forEach((item, index) => {
      validateEntry(item, `${location}.items[${index}]`);
    });
  }
}

function validatePlaceBlock(block, file, index, validPlaceIds) {
  const location = `${file}.places[${index}]`;
  if (!block || typeof block !== "object") {
    errors.push(`${location}: place-blokk er ikke objekt`);
    return;
  }

  if (typeof block.place_id !== "string" || !block.place_id.trim()) {
    errors.push(`${location}: mangler place_id`);
  } else if (!validPlaceIds.has(block.place_id)) {
    warnings.push(`${location}: place_id finnes ikke i data/places-kildene: ${block.place_id}`);
  }

  if (!Array.isArray(block.chambers)) {
    errors.push(`${location}: chambers må være array`);
    return;
  }

  block.chambers.forEach((chamber, chamberIndex) => {
    validateEntry(chamber, `${location}.chambers[${chamberIndex}]`);
  });
}

function validatePersonBlock(block, file, index, validPersonIds) {
  const location = `${file}.people[${index}]`;
  if (!block || typeof block !== "object") {
    errors.push(`${location}: person-blokk er ikke objekt`);
    return;
  }

  if (typeof block.person_id !== "string" || !block.person_id.trim()) {
    errors.push(`${location}: mangler person_id`);
  } else if (!validPersonIds.has(block.person_id)) {
    warnings.push(`${location}: person_id finnes ikke i data/people-kildene: ${block.person_id}`);
  }

  if (!Array.isArray(block.chambers)) {
    errors.push(`${location}: chambers må være array`);
    return;
  }

  block.chambers.forEach((chamber, chamberIndex) => {
    validateEntry(chamber, `${location}.chambers[${chamberIndex}]`);
  });
}

async function main() {
  const manifest = await readJson(MANIFEST_PATH);
  if (!manifest) {
    printAndExit();
    return;
  }

  if (!Array.isArray(manifest.files)) {
    errors.push(`${MANIFEST_PATH}: files må være array`);
    printAndExit();
    return;
  }

  const validPlaceIds = await collectIdsFromRoots(["data/places", "data/places.json"]);
  const validPersonIds = await collectIdsFromRoots(["data/people", "data/people.json"]);

  for (const file of manifest.files) {
    if (!(await pathExists(file))) {
      errors.push(`${MANIFEST_PATH}: manglende Wonderkammer-fil: ${file}`);
      continue;
    }

    const json = await readJson(file);
    if (!json) continue;

    if (json.places !== undefined) {
      if (!Array.isArray(json.places)) {
        errors.push(`${file}: places må være array`);
      } else {
        json.places.forEach((block, index) => validatePlaceBlock(block, file, index, validPlaceIds));
      }
    }

    if (json.people !== undefined) {
      if (!Array.isArray(json.people)) {
        errors.push(`${file}: people må være array`);
      } else {
        json.people.forEach((block, index) => validatePersonBlock(block, file, index, validPersonIds));
      }
    }
  }

  for (const [id, locations] of entryIds.entries()) {
    if (locations.length > 1) {
      errors.push(`Duplikat Wonderkammer-id: ${id}\n  ${locations.join("\n  ")}`);
    }
  }

  for (const [title, count] of titleCounts.entries()) {
    if (count > GENERIC_TITLE_LIMIT) {
      warnings.push(`Mulig generisk tittel brukt ${count} ganger: "${title}"`);
    }
  }

  console.log(`Wonderkammer-filer sjekket: ${manifest.files.length}`);
  console.log(`Kjente place_id-er: ${validPlaceIds.size}`);
  console.log(`Kjente person_id-er: ${validPersonIds.size}`);
  console.log(`Wonderkammer-entry-id-er: ${entryIds.size}`);

  printAndExit();
}

function printAndExit() {
  if (warnings.length) {
    console.log("\nAdvarsler:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }

  if (errors.length) {
    console.error("\nFeil:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log("\nOK: Wonderkammer-data validerer.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
