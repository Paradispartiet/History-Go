#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");
const RUNTIME_DIR = path.join(ROOT, "data/runtime");
const GENERATED_FILES = new Set();
const SHARD_TARGET_BYTES = 240_000;

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
const exists = (file) => fs.existsSync(path.join(ROOT, file));
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? "").trim();
const rows = (value, key) => Array.isArray(value)
  ? value
  : Array.isArray(value?.[key])
    ? value[key]
    : value && typeof value === "object" && text(value.id || value.place_id)
      ? [value]
      : [];

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function output(file, value) {
  const target = path.join(ROOT, file);
  GENERATED_FILES.add(target);
  const content = `${JSON.stringify(stable(value))}\n`;
  if (CHECK) {
    const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
    if (current !== content) throw new Error(`${file} is not synchronized; run npm run place-open:build`);
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function shardRows(values) {
  const chunks = [];
  let chunk = [];
  let bytes = 2;
  for (const value of list(values)) {
    const valueBytes = Buffer.byteLength(JSON.stringify(stable(value))) + (chunk.length ? 1 : 0);
    if (chunk.length && bytes + valueBytes > SHARD_TARGET_BYTES) {
      chunks.push(chunk);
      chunk = [];
      bytes = 2;
    }
    chunk.push(value);
    bytes += valueBytes;
  }
  if (chunk.length) chunks.push(chunk);
  return chunks;
}

function outputShardedArray(name, values) {
  const files = shardRows(values).map((chunk, index) => {
    const file = `data/runtime/${name}/part-${String(index + 1).padStart(3, "0")}.json`;
    output(file, chunk);
    return file;
  });
  output(`data/runtime/${name}.json`, { schema: "history-go-runtime-shards-v1", files });
}

function outputShardedGroups(name, groups) {
  const files = {};
  for (const [group, values] of Object.entries(groups)) {
    files[group] = shardRows(values).map((chunk, index) => {
      const file = `data/runtime/${name}/${group}-${String(index + 1).padStart(3, "0")}.json`;
      output(file, chunk);
      return file;
    });
  }
  output(`data/runtime/${name}.json`, { schema: "history-go-runtime-shards-v1", groups: files });
}

function readManifestRows(manifestFile, key, entryPath = (entry) => typeof entry === "string" ? entry : entry?.path) {
  if (!exists(manifestFile)) return [];
  const manifest = readJson(manifestFile);
  const out = [];
  for (const entry of list(manifest.files)) {
    const file = text(entryPath(entry));
    if (!file || !exists(file)) continue;
    out.push(...rows(readJson(file), key));
  }
  return out;
}

function uniqById(values, fallback) {
  const seen = new Set();
  return list(values).filter((value, index) => {
    const key = text(value?.id) || text(fallback?.(value, index));
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function linkedPlaceIds(person) {
  return [
    person?.placeId,
    person?.place_id,
    person?.place,
    person?.places,
    person?.placeIds,
    person?.place_ids,
    person?.source_place_id
  ].flatMap((value) => Array.isArray(value) ? value : [value]).map(text).filter(Boolean);
}

function loadPeople() {
  const manifest = readJson("data/people/manifest.json");
  const all = [];
  for (const entry of list(manifest.files)) {
    const relative = text(entry).replace(/^data\//, "");
    const file = relative.startsWith("people/") ? `data/${relative}` : `data/people/${relative}`;
    if (!exists(file)) continue;
    all.push(...rows(readJson(file), "people"));
  }
  return uniqById(all);
}

function loadStories() {
  const manifestFiles = fs.readdirSync(path.join(ROOT, "data/stories"))
    .filter((name) => /^stories_manifest.*\.json$/u.test(name))
    .map((name) => `data/stories/${name}`)
    .sort();
  const all = [];
  for (const manifestFile of manifestFiles) {
    const manifest = readJson(manifestFile);
    for (const entry of list(manifest.files)) {
      const file = text(entry?.path || entry);
      if (file && exists(file)) all.push(...rows(readJson(file), "stories"));
    }
  }
  return uniqById(all);
}

function loadLeksikon() {
  return uniqById(readManifestRows("data/leksikon/manifest.json", "places"), (row, index) => `${row?.place_id}:${row?.title}:${index}`);
}

function loadLesespor() {
  const manifest = readJson("data/lesespor/manifest.json");
  const all = [];
  for (const entry of list(manifest.files)) {
    const relative = text(entry).replace(/^\/?data\/lesespor\//, "").replace(/^\.\//, "");
    const file = `data/lesespor/${relative}`;
    if (exists(file)) all.push(...rows(readJson(file), "items"));
  }
  return uniqById(all, (row, index) => `${row?.title}:${index}`);
}

function loadNature(group) {
  const manifestFile = `data/natur/${group}/manifest.json`;
  if (!exists(manifestFile)) return [];
  const all = [];
  for (const entry of list(readJson(manifestFile).files)) {
    const file = `data/natur/${group}/${text(entry)}`;
    if (exists(file)) all.push(...rows(readJson(file), group));
  }
  return uniqById(all);
}

function loadWonderkammer() {
  const manifest = readJson("data/wonderkammer/index.json");
  const sources = [];
  for (const entry of list(manifest.files)) {
    const file = text(entry).startsWith("data/") ? text(entry) : `data/wonderkammer/${text(entry)}`;
    if (file && exists(file)) sources.push(readJson(file));
  }
  const places = [];
  const people = [];
  for (const source of sources) {
    if (Array.isArray(source?.places) || Array.isArray(source?.people)) {
      places.push(...list(source.places));
      people.push(...list(source.people));
      continue;
    }
    if (text(source?.place_id || source?.place)) places.push(source);
    if (text(source?.person_id || source?.person)) people.push(source);
  }
  return { places, people };
}

function loadBrands() {
  const master = exists("data/brands/brands_master.json") ? list(readJson("data/brands/brands_master.json")) : [];
  const byPlace = exists("data/brands/brands_by_place.json") ? readJson("data/brands/brands_by_place.json") : {};
  const actorsByPlace = exists("data/brands/actors_by_place.json") ? readJson("data/brands/actors_by_place.json") : {};
  const byId = new Map(master.map((brand) => [text(brand?.id), brand]).filter(([id]) => id));
  for (const actors of Object.values(actorsByPlace)) {
    for (const actor of list(actors)) if (text(actor?.id)) byId.set(text(actor.id), actor);
  }
  return { byId, byPlace, actorsByPlace };
}

function relationPlaceId(relation) {
  return text(relation?.placeId || relation?.place_id || relation?.place)
    || (text(relation?.fromType || relation?.from_type) === "place" ? text(relation?.fromId || relation?.from_id) : "")
    || (text(relation?.toType || relation?.to_type) === "place" ? text(relation?.toId || relation?.to_id) : "");
}

function relationPersonIds(relation) {
  return [
    relation?.personId,
    relation?.person_id,
    relation?.person,
    text(relation?.fromType || relation?.from_type) === "person" ? relation?.fromId || relation?.from_id : "",
    text(relation?.toType || relation?.to_type) === "person" ? relation?.toId || relation?.to_id : ""
  ].map(text).filter(Boolean);
}

function loadFullPlace(indexPlace) {
  const sourceFile = text(indexPlace?.sourceFile).replace(/^data\//, "");
  const file = sourceFile ? `data/${sourceFile}` : "";
  if (!file || !exists(file)) return indexPlace;
  const source = readJson(file);
  const candidates = Array.isArray(source) ? source : Array.isArray(source?.places) ? source.places : [source];
  const full = candidates.find((place) => text(place?.id) === text(indexPlace?.id));
  return full && typeof full === "object" ? { ...indexPlace, ...full, sourceFile } : indexPlace;
}

const places = readJson("data/places/places_index.json");
const people = loadPeople();
const peopleById = new Map(people.map((person) => [text(person?.id), person]));
const relations = uniqById([
  ...rows(readJson("data/relations.json"), "relations"),
  ...rows(readJson("data/relations_philanthropy.json"), "relations")
]);
const stories = loadStories();
const leksikon = loadLeksikon();
const lesespor = loadLesespor();
const flora = loadNature("flora");
const fauna = loadNature("fauna");
const floraById = new Map(flora.map((item) => [text(item?.id), item]));
const faunaById = new Map(fauna.map((item) => [text(item?.id), item]));
const wonderkammer = loadWonderkammer();
const brands = loadBrands();
const languageManifest = exists("data/leksikon/sprak/manifest.json") ? readJson("data/leksikon/sprak/manifest.json") : { place_files: {} };
const events = exists("data/events/events_manifest.json")
  ? readManifestRows("data/events/events_manifest.json", "events")
  : [];

outputShardedArray("people-all", people);
outputShardedArray("stories-all", stories);
outputShardedArray("leksikon-all", leksikon);
output("data/runtime/lesespor-all.json", lesespor);
outputShardedGroups("nature-all", { flora, fauna });
outputShardedGroups("wonderkammer-all", wonderkammer);
output("data/runtime/events-all.json", events);

for (const indexPlace of places) {
  const placeId = text(indexPlace?.id);
  if (!placeId) continue;
  const fullPlace = loadFullPlace(indexPlace);
  const placeRelations = relations.filter((relation) => relationPlaceId(relation) === placeId);
  const relationPeople = new Set(placeRelations.flatMap(relationPersonIds));
  const placePeople = people.filter((person) => linkedPlaceIds(person).includes(placeId) || relationPeople.has(text(person?.id)));
  const languageFile = text(languageManifest?.place_files?.[placeId]);
  const language = languageFile && exists(languageFile) ? readJson(languageFile) : null;
  const placeBrands = uniqById([
    ...list(brands.byPlace?.[placeId]).map((id) => brands.byId.get(text(id))).filter(Boolean),
    ...list(brands.actorsByPlace?.[placeId])
  ]);
  const payload = {
    schema: "history-go-place-open-v1",
    place: fullPlace,
    people: placePeople,
    relations: placeRelations,
    stories: stories.filter((story) => text(story?.place_id || story?.placeId || story?.place) === placeId),
    leksikon: leksikon.filter((article) => text(article?.place_id || article?.place) === placeId),
    lesespor: lesespor.filter((item) => list(item?.place_ids).map(text).includes(placeId)),
    flora: list(fullPlace?.flora).map((id) => floraById.get(text(id))).filter(Boolean),
    fauna: list(fullPlace?.fauna).map((id) => faunaById.get(text(id))).filter(Boolean),
    wonderkammer: wonderkammer.places.filter((item) => text(item?.place_id || item?.place) === placeId),
    events: events.filter((event) => text(event?.place_id || event?.placeId || event?.place) === placeId),
    brands: placeBrands,
    language
  };
  const file = `data/runtime/place-open/${placeId}.json`;
  output(file, payload);
}

function visitGeneratedDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) visitGeneratedDirectory(file);
    else if (entry.name.endsWith(".json") && !GENERATED_FILES.has(file)) {
      const relative = path.relative(ROOT, file);
      if (CHECK) throw new Error(`${relative} is stale; run npm run place-open:build`);
      fs.unlinkSync(file);
    }
  }
}

visitGeneratedDirectory(RUNTIME_DIR);

console.log(`${CHECK ? "verified" : "built"} ${places.length} place-open payloads`);
