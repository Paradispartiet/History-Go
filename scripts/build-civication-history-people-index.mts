// scripts/build-civication-history-people-index.mts
// Genererer data/Civication/historyPeople_index.json fra data/people/manifest.json:
// en lett, kategorigruppert indeks over History Go-personene som Civication kan
// laste i én fetch (i stedet for ~600 småfiler). Brukes av
// js/Civication/systems/civicationHistoryPeopleBridge.js til å vise ekte,
// samlede personer i stedet for konstruerte arketyper.
//
// Kjør:   npm run civication:history-people:build
// Sjekk:  npm run civication:history-people:check   (regenererer og feiler ved avvik)
//
// Output er deterministisk (kategorier og personer sortert), så indeksen kan
// committes og sync-sjekkes på samme måte som places_index.json.
// Validerer også at alle `hg_categories`-verdier i
// data/Civication/people_access_map.json finnes som personkategori (fail fast,
// ingen normalisering/gjetting av kategori-id-er).

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "data", "people", "manifest.json");
const OUTPUT_PATH = path.join(ROOT, "data", "Civication", "historyPeople_index.json");
const ACCESS_MAP_PATH = path.join(ROOT, "data", "Civication", "people_access_map.json");

const CHECK_MODE = process.argv.includes("--check");

type PersonRow = Record<string, unknown>;
type LightPerson = {
  id: string;
  name: string;
  category: string;
  desc?: string;
  placeId?: string;
  year?: number;
  image?: string;
  cardImage?: string;
};

function readJSON(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function personsFromFileData(data: unknown): PersonRow[] {
  if (Array.isArray(data)) return data.filter((row): row is PersonRow => !!row && typeof row === "object");
  if (data && typeof data === "object" && Array.isArray((data as { people?: unknown[] }).people)) {
    return ((data as { people: unknown[] }).people).filter((row): row is PersonRow => !!row && typeof row === "object");
  }
  // Enkeltperson-filer er bare objekter (f.eks. people/sport/oslo/**/harald_hennum.json).
  if (data && typeof data === "object" && str((data as PersonRow).id)) {
    return [data as PersonRow];
  }
  return [];
}

function toLightPerson(row: PersonRow): LightPerson | null {
  const id = str(row.id);
  const name = str(row.name);
  const category = str(row.category);
  if (!id || !name || !category) return null;

  const light: LightPerson = { id, name, category };
  const desc = str(row.desc);
  if (desc) light.desc = desc;
  const placeId = str(row.placeId);
  if (placeId) light.placeId = placeId;
  const year = Number(row.year);
  if (Number.isFinite(year)) light.year = year;
  const image = str(row.image);
  if (image) light.image = image;
  const cardImage = str(row.cardImage);
  if (cardImage) light.cardImage = cardImage;
  return light;
}

function buildIndex(): { json: string; categories: Map<string, LightPerson[]>; skipped: number; duplicates: number } {
  const manifest = readJSON(MANIFEST_PATH) as { files?: unknown[] };
  const files = Array.isArray(manifest.files) ? manifest.files.map(str).filter(Boolean) : [];
  if (!files.length) {
    throw new Error(`Fant ingen filer i ${path.relative(ROOT, MANIFEST_PATH)}`);
  }

  const byId = new Map<string, LightPerson>();
  let skipped = 0;
  let duplicates = 0;

  for (const rel of files) {
    const abs = path.join(ROOT, "data", rel);
    const rows = personsFromFileData(readJSON(abs));
    for (const row of rows) {
      const light = toLightPerson(row);
      if (!light) {
        skipped += 1;
        continue;
      }
      if (byId.has(light.id)) {
        // Første forekomst i manifest-rekkefølge vinner (deterministisk).
        duplicates += 1;
        continue;
      }
      byId.set(light.id, light);
    }
  }

  const categories = new Map<string, LightPerson[]>();
  for (const person of byId.values()) {
    const list = categories.get(person.category) || [];
    list.push(person);
    categories.set(person.category, list);
  }

  const sortedCategories: Record<string, LightPerson[]> = {};
  for (const cat of [...categories.keys()].sort()) {
    sortedCategories[cat] = (categories.get(cat) || []).sort((a, b) => a.id.localeCompare(b.id));
  }

  const out = {
    schema: "civication_history_people_index_v1",
    version: 1,
    generated_by: "scripts/build-civication-history-people-index.mts",
    source: "data/people/manifest.json",
    note: "GENERERT FIL – ikke rediger for hånd. Regenerer med npm run civication:history-people:build.",
    person_count: byId.size,
    categories: sortedCategories
  };

  return { json: JSON.stringify(out, null, 2) + "\n", categories, skipped, duplicates };
}

function validateAccessMap(categories: Map<string, LightPerson[]>): void {
  const accessMap = readJSON(ACCESS_MAP_PATH) as { people?: unknown[] };
  const entries = Array.isArray(accessMap.people) ? accessMap.people : [];
  const known = new Set(categories.keys());
  const errors: string[] = [];

  for (const raw of entries) {
    if (!raw || typeof raw !== "object") continue;
    const entry = raw as { id?: unknown; hg_categories?: unknown };
    const hgCategories = Array.isArray(entry.hg_categories) ? entry.hg_categories.map(str).filter(Boolean) : [];
    for (const cat of hgCategories) {
      if (!known.has(cat)) {
        errors.push(`people_access_map.json: "${str(entry.id)}" refererer ukjent personkategori "${cat}"`);
      }
    }
  }

  if (errors.length) {
    for (const err of errors) console.error(`FEIL: ${err}`);
    console.error(`Kjente kategorier: ${[...known].sort().join(", ")}`);
    process.exit(1);
  }
}

function main(): void {
  const { json, categories, skipped, duplicates } = buildIndex();
  validateAccessMap(categories);

  if (CHECK_MODE) {
    const actual = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, "utf8") : "";
    if (actual !== json) {
      console.error(`FEIL: ${path.relative(ROOT, OUTPUT_PATH)} er ikke i sync med kildene i data/people/.`);
      console.error("Kjør: npm run civication:history-people:build");
      process.exit(1);
    }
    console.log(`OK: ${path.relative(ROOT, OUTPUT_PATH)} er i sync (${categories.size} kategorier).`);
    return;
  }

  fs.writeFileSync(OUTPUT_PATH, json, "utf8");
  const total = [...categories.values()].reduce((sum, list) => sum + list.length, 0);
  console.log(`Skrev ${path.relative(ROOT, OUTPUT_PATH)}: ${total} personer i ${categories.size} kategorier.`);
  if (skipped) console.log(`Hoppet over ${skipped} personer uten id/name/category.`);
  if (duplicates) console.log(`Ignorerte ${duplicates} duplikate person-id-er (første forekomst vinner).`);
}

main();
