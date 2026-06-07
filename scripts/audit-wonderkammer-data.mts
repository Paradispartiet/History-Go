import fs from "node:fs/promises";
import path from "node:path";

type JsonObject = Record<string, unknown>;

interface WonderkammerManifest extends JsonObject {
  files?: unknown;
}

interface WonderkammerEntry extends JsonObject {
  id?: unknown;
  title?: unknown;
  type?: unknown;
  description?: unknown;
  activityText?: unknown;
  items?: unknown;
}

interface WonderkammerPlaceBlock extends JsonObject {
  place_id?: unknown;
  chambers?: unknown;
}

interface WonderkammerPersonBlock extends JsonObject {
  person_id?: unknown;
  chambers?: unknown;
}

type IssueList = string[];

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
const TREASURE_FIELDS = ["treasureTitle","treasureType","treasureScope","cabinetCategory","curiosity","whereToFind","whatToDo","whatToNotice","material","rarity","collectible","collectionNote","sourceNote"];
const CABINET_CATEGORIES = new Set(["naturalia","artificialia","scientifica","mirabilia","memorabilia","urbania","sonica","lingua","relic"]);
const RARITY_VALUES = new Set(["vanlig","uvanlig","sjelden","skjult","legendarisk","mytisk"]);
const TREASURE_SCOPE_VALUES = new Set(["actual_site_treasure","category_object"]);
const CATEGORY_OBJECT_GROUNDING_FIELDS = ["placeSpecificDetail","whereToFind","sourceNote","historyLayer","materialLayer"];
const CATEGORY_OBJECT_GENERIC_PATTERNS = [
  /^en\s+løpebane\.?$/i,
  /^en\s+tribune\.?$/i,
  /^en\s+huske\.?$/i,
  /^en\s+sklie\.?$/i,
  /^en\s+rampe\.?$/i,
  /^en\s+benk\.?$/i,
  /^en\s+sti\.?$/i,
  /^en\s+port\.?$/i,
  /^en\s+scene\.?$/i,
  /^en\s+målstripe\.?$/i
];
const CATEGORY_OBJECT_MAX_RATIO = 0.3;
const HYPOTHETICAL_PATTERNS=[/\bkan finnes\b/i,/\bkan være\b/i,/\btypisk\b/i,/\bmulig spor\b/i,/\bantatt\b/i];
const GENERIC_ACTIVITY_PATTERNS = [
  /^se etter\b/i,
  /^tell\b/i,
  /^løp\b/i,
  /^finn fem\b/i,
  /^finn tre\b/i
];

const errors: IssueList = [];
const warnings: IssueList = [];
const entryIds = new Map<unknown, string[]>();
const titleCounts = new Map<unknown, number>();

function repoPath(relativePath: string): string {
  return path.join(ROOT, relativePath);
}

async function pathExists(relativePath: string): Promise<boolean> {
  try {
    await fs.stat(repoPath(relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readJson(relativePath: string): Promise<unknown | null> {
  try {
    const raw = await fs.readFile(repoPath(relativePath), "utf8");
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`${relativePath}: JSON kunne ikke parses (${error.message})`);
    return null;
  }
}

async function listJsonFiles(relativePath: string): Promise<string[]> {
  if (!(await pathExists(relativePath))) return [];

  const stat = await fs.stat(repoPath(relativePath));
  if (stat.isFile()) {
    return relativePath.endsWith(".json") ? [relativePath] : [];
  }

  const out: string[] = [];
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

function collectIds(value: unknown, ids: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) collectIds(item, ids);
    return;
  }

  if (!value || typeof value !== "object") return;

  const objectValue = value as JsonObject;

  if (typeof objectValue.id === "string" && objectValue.id.trim()) {
    ids.add(objectValue.id);
  }

  for (const child of Object.values(objectValue)) {
    collectIds(child, ids);
  }
}

async function collectIdsFromRoots(roots: string[]): Promise<Set<string>> {
  const ids = new Set<string>();

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

function rememberEntryId(id: unknown, location: string): void {
  if (!id) return;
  if (!entryIds.has(id)) {
    entryIds.set(id, []);
  }
  entryIds.get(id)!.push(location);
}

function rememberTitle(title: unknown): void {
  if (!title) return;
  titleCounts.set(title, (titleCounts.get(title) || 0) + 1);
}

function hasAnyTreasureField(entry: WonderkammerEntry): boolean {
  return TREASURE_FIELDS.some(key => {
    const value = entry?.[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

function hasConcreteThingSignals(entry: WonderkammerEntry): boolean {
  return Boolean(
    (typeof entry?.treasureTitle === "string" && entry.treasureTitle.trim()) ||
    (typeof entry?.treasureType === "string" && entry.treasureType.trim()) ||
    (typeof entry?.placeSpecificDetail === "string" && entry.placeSpecificDetail.trim()) ||
    (typeof entry?.observationHook === "string" && entry.observationHook.trim())
  );
}

function containsHypotheticalLanguage(entry: WonderkammerEntry): boolean {
  const text = [entry?.description, entry?.activityText, entry?.whatToDo, entry?.whatToNotice, entry?.curiosity]
    .filter(v => typeof v === "string")
    .join(" ");
  return HYPOTHETICAL_PATTERNS.some(rx => rx.test(text));
}

function hasAnySmartField(entry: WonderkammerEntry): boolean {
  return SMART_FIELDS.some(key => {
    const value = entry?.[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

function isGenericActivityText(text: unknown): boolean {
  const value = String(text || "").trim();
  if (!value) return false;
  if (value.length > 120) return false;
  return GENERIC_ACTIVITY_PATTERNS.some(rx => rx.test(value));
}

function flagBanalEntry(entry: unknown, location: string): void {
  if (!entry || typeof entry !== "object") return;

  const typedEntry = entry as WonderkammerEntry;
  const description = typeof typedEntry.description === "string" ? typedEntry.description.trim() : "";
  const activityText = typeof typedEntry.activityText === "string" ? typedEntry.activityText.trim() : "";
  const hasSmart = hasAnySmartField(typedEntry);
  const hasPlaceSpecific =
    typeof typedEntry.placeSpecificDetail === "string" && typedEntry.placeSpecificDetail.trim().length > 0;

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

function validateEntry(entry: unknown, location: string): void {
  if (!entry || typeof entry !== "object") {
    errors.push(`${location}: entry er ikke et objekt`);
    return;
  }

  const typedEntry = entry as WonderkammerEntry;

  for (const field of REQUIRED_ENTRY_FIELDS) {
    if (typeof typedEntry[field] !== "string" || !typedEntry[field].trim()) {
      errors.push(`${location}: mangler ${field}`);
    }
  }

  if (ACTIVITY_TEXT_TYPES.has(typedEntry.type as string)) {
    if (typeof typedEntry.activityText !== "string" || !typedEntry.activityText.trim()) {
      errors.push(`${location}: type ${typedEntry.type} mangler activityText`);
    }
  }

  flagBanalEntry(typedEntry, location);

  const hasSmart = hasAnySmartField(typedEntry);
  const hasTreasure = hasAnyTreasureField(typedEntry);

  if (!hasSmart && !hasTreasure) {
    warnings.push(`${location}: mangler både smartfelt og treasurefelt`);
  }

  if (typeof typedEntry.activityText === "string" && typedEntry.activityText.trim() && !hasConcreteThingSignals(typedEntry)) {
    warnings.push(`${location}: har activityText, men ingen konkret skatt/ting/spor/detalj`);
  }

  if (typeof typedEntry.whatToDo === "string" && typedEntry.whatToDo.trim()) {
    if (!(typeof typedEntry.treasureTitle === "string" && typedEntry.treasureTitle.trim()) || !(typeof typedEntry.treasureType === "string" && typedEntry.treasureType.trim())) {
      warnings.push(`${location}: har whatToDo, men mangler treasureTitle eller treasureType`);
    }
  }

  if (typeof typedEntry.cabinetCategory === "string" && typedEntry.cabinetCategory.trim() && !CABINET_CATEGORIES.has(typedEntry.cabinetCategory.trim())) {
    warnings.push(`${location}: cabinetCategory utenfor tillatte verdier`);
  }

  if (typeof typedEntry.rarity === "string" && typedEntry.rarity.trim() && !RARITY_VALUES.has(typedEntry.rarity.trim())) {
    warnings.push(`${location}: rarity utenfor tillatte verdier`);
  }

  const hasTreasureTitle = typeof typedEntry.treasureTitle === "string" && typedEntry.treasureTitle.trim();
  const rawTreasureScope = typeof typedEntry.treasureScope === "string" ? typedEntry.treasureScope.trim() : "";

  if (hasTreasureTitle && !rawTreasureScope) {
    warnings.push(`${location}: har treasureTitle, men mangler treasureScope`);
  }

  if (rawTreasureScope && !TREASURE_SCOPE_VALUES.has(rawTreasureScope)) {
    warnings.push(`${location}: treasureScope utenfor tillatte verdier ("${rawTreasureScope}")`);
  }

  if (rawTreasureScope === "category_object") {
    const hasGrounding = CATEGORY_OBJECT_GROUNDING_FIELDS.some(key => {
      const value = typedEntry?.[key];
      return typeof value === "string" && value.trim().length > 0;
    });
    if (!hasGrounding) {
      warnings.push(
        `${location}: treasureScope er category_object, men mangler placeSpecificDetail, whereToFind, sourceNote eller annen konkret stedlig forankring`
      );
    }

    const candidateTexts = [typedEntry?.treasureTitle, typedEntry?.description]
      .filter(v => typeof v === "string")
      .map(v => v.trim())
      .filter(Boolean);
    const looksGeneric = candidateTexts.some(text => CATEGORY_OBJECT_GENERIC_PATTERNS.some(rx => rx.test(text)));
    if (looksGeneric && !hasGrounding) {
      warnings.push(
        `${location}: treasureScope er category_object og teksten virker helt generisk uten stedsspesifikk detalj`
      );
    }
  }

  if (containsHypotheticalLanguage(typedEntry) && !(typeof typedEntry.sourceNote === "string" && typedEntry.sourceNote.trim())) {
    warnings.push(`${location}: hypotetisk formulering uten sourceNote`);
  }

  rememberEntryId(typedEntry.id, location);
  rememberTitle(typedEntry.title);

  if (typedEntry.items !== undefined) {
    if (!Array.isArray(typedEntry.items)) {
      errors.push(`${location}: items må være array hvis feltet finnes`);
      return;
    }

    typedEntry.items.forEach((item, index) => {
      validateEntry(item, `${location}.items[${index}]`);
    });
  }
}

function validatePlaceBlock(block: unknown, file: string, index: number, validPlaceIds: Set<string>): void {
  const location = `${file}.places[${index}]`;
  if (!block || typeof block !== "object") {
    errors.push(`${location}: place-blokk er ikke objekt`);
    return;
  }

  const typedBlock = block as WonderkammerPlaceBlock;

  if (typeof typedBlock.place_id !== "string" || !typedBlock.place_id.trim()) {
    errors.push(`${location}: mangler place_id`);
  } else if (!validPlaceIds.has(typedBlock.place_id)) {
    warnings.push(`${location}: place_id finnes ikke i data/places-kildene: ${typedBlock.place_id}`);
  }

  if (!Array.isArray(typedBlock.chambers)) {
    errors.push(`${location}: chambers må være array`);
    return;
  }

  typedBlock.chambers.forEach((chamber, chamberIndex) => {
    validateEntry(chamber, `${location}.chambers[${chamberIndex}]`);
  });

  checkTreasureScopeBalance(typedBlock.chambers, location);
}

function collectTreasureScopes(entries: unknown, scopes: string[]): void {
  if (!Array.isArray(entries)) return;
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const typedEntry = entry as WonderkammerEntry;
    const scope = typeof typedEntry.treasureScope === "string" ? typedEntry.treasureScope.trim() : "";
    if (scope) scopes.push(scope);
    if (Array.isArray(typedEntry.items)) {
      collectTreasureScopes(typedEntry.items, scopes);
    }
  }
}

function checkTreasureScopeBalance(chambers: unknown, location: string): void {
  const scopes: string[] = [];
  collectTreasureScopes(chambers, scopes);
  if (scopes.length < 2) return;

  const categoryCount = scopes.filter(s => s === "category_object").length;
  const ratio = categoryCount / scopes.length;
  if (ratio > CATEGORY_OBJECT_MAX_RATIO) {
    warnings.push(
      `${location}: for mange kategoriobjekter – Wonderkammer bør domineres av faktiske stedsskatter ` +
      `(${categoryCount}/${scopes.length} entries med treasureScope er category_object)`
    );
  }
}

function validatePersonBlock(block: unknown, file: string, index: number, validPersonIds: Set<string>): void {
  const location = `${file}.people[${index}]`;
  if (!block || typeof block !== "object") {
    errors.push(`${location}: person-blokk er ikke objekt`);
    return;
  }

  const typedBlock = block as WonderkammerPersonBlock;

  if (typeof typedBlock.person_id !== "string" || !typedBlock.person_id.trim()) {
    errors.push(`${location}: mangler person_id`);
  } else if (!validPersonIds.has(typedBlock.person_id)) {
    warnings.push(`${location}: person_id finnes ikke i data/people-kildene: ${typedBlock.person_id}`);
  }

  if (!Array.isArray(typedBlock.chambers)) {
    errors.push(`${location}: chambers må være array`);
    return;
  }

  typedBlock.chambers.forEach((chamber, chamberIndex) => {
    validateEntry(chamber, `${location}.chambers[${chamberIndex}]`);
  });
}

async function main(): Promise<void> {
  const manifest = await readJson(MANIFEST_PATH);
  if (!manifest) {
    printAndExit();
    return;
  }

  const typedManifest = manifest as WonderkammerManifest;

  if (!Array.isArray(typedManifest.files)) {
    errors.push(`${MANIFEST_PATH}: files må være array`);
    printAndExit();
    return;
  }

  const validPlaceIds = await collectIdsFromRoots(["data/places", "data/places.json"]);
  const validPersonIds = await collectIdsFromRoots(["data/people", "data/people.json"]);

  for (const file of typedManifest.files) {
    if (!(await pathExists(file))) {
      errors.push(`${MANIFEST_PATH}: manglende Wonderkammer-fil: ${file}`);
      continue;
    }

    const json = await readJson(file);
    if (!json) continue;

    const typedJson = json as JsonObject;

    if (typedJson.places !== undefined) {
      if (!Array.isArray(typedJson.places)) {
        errors.push(`${file}: places må være array`);
      } else {
        typedJson.places.forEach((block, index) => validatePlaceBlock(block, file, index, validPlaceIds));
      }
    }

    if (typedJson.people !== undefined) {
      if (!Array.isArray(typedJson.people)) {
        errors.push(`${file}: people må være array`);
      } else {
        typedJson.people.forEach((block, index) => validatePersonBlock(block, file, index, validPersonIds));
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

  console.log(`Wonderkammer-filer sjekket: ${typedManifest.files.length}`);
  console.log(`Kjente place_id-er: ${validPlaceIds.size}`);
  console.log(`Kjente person_id-er: ${validPersonIds.size}`);
  console.log(`Wonderkammer-entry-id-er: ${entryIds.size}`);

  printAndExit();
}

function printAndExit(): void {
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
