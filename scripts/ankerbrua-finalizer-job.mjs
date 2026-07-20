import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const selfPath = 'scripts/ankerbrua-finalizer-job.mjs';

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

function readMainJson(relPath) {
  return JSON.parse(git(['show', `origin/main:${relPath}`]));
}

function writeJson(relPath, value) {
  const abs = path.join(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`);
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.items)) return value.items;
  if (value && Array.isArray(value.places)) return value.places;
  if (value && Array.isArray(value.entries)) return value.entries;
  return null;
}

function findFirst(value, predicate) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirst(item, predicate);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    if (predicate(value)) return value;
    for (const child of Object.values(value)) {
      const found = findFirst(child, predicate);
      if (found) return found;
    }
  }
  return null;
}

function replaceFirst(value, predicate, replacement) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      if (value[i] && typeof value[i] === 'object' && predicate(value[i])) {
        value[i] = structuredClone(replacement);
        return true;
      }
      if (replaceFirst(value[i], predicate, replacement)) return true;
    }
    return false;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (child && typeof child === 'object' && predicate(child)) {
        value[key] = structuredClone(replacement);
        return true;
      }
      if (replaceFirst(child, predicate, replacement)) return true;
    }
  }
  return false;
}

function mergeRecordFromBranch(relPath, predicate) {
  const branchData = readJson(relPath);
  const replacement = findFirst(branchData, predicate);
  if (!replacement) throw new Error(`Missing branch record in ${relPath}`);

  const mainData = readMainJson(relPath);
  if (!replaceFirst(mainData, predicate, replacement)) {
    const collection = asArray(mainData);
    if (!collection) throw new Error(`Could not find collection for ${relPath}`);
    collection.push(structuredClone(replacement));
  }
  writeJson(relPath, mainData);
}

// Ensure origin/main is the current remote main used as the canonical merge base.
git(['fetch', 'origin', 'main:refs/remotes/origin/main']);

// 1. Move Dyre Vaa out of the unrelated Fredrik Ferdinand Hausmann file.
const hausmannPeoplePath = 'data/people/historie/oslo/akerselva/fredrik_ferdinand_hausmann.json';
const branchHausmannPeople = readJson(hausmannPeoplePath);
const dyreVaa = findFirst(branchHausmannPeople, (row) => row?.id === 'dyre_vaa');
if (!dyreVaa) throw new Error('Dyre Vaa not found in the pre-normalized Ankerbrua branch state');
writeJson(hausmannPeoplePath, readMainJson(hausmannPeoplePath));

const dyrePath = 'data/people/kunst/oslo/dyre_vaa.json';
writeJson(dyrePath, [dyreVaa]);

const peopleManifestPath = 'data/people/manifest.json';
const peopleManifest = readMainJson(peopleManifestPath);
const dyreManifestPath = 'people/kunst/oslo/dyre_vaa.json';
if (!Array.isArray(peopleManifest.files)) throw new Error('People manifest has no files array');
if (!peopleManifest.files.includes(dyreManifestPath)) {
  const lastOsloKunst = peopleManifest.files.reduce(
    (last, entry, index) => (entry.startsWith('people/kunst/oslo/') ? index : last),
    -1,
  );
  peopleManifest.files.splice(lastOsloKunst >= 0 ? lastOsloKunst + 1 : peopleManifest.files.length, 0, dyreManifestPath);
}
writeJson(peopleManifestPath, peopleManifest);

// 2. Move the Ankerbrua story out of the Hausmannsbrua story file.
const hausmannStoryPath = 'data/stories/stories_hausmannsbrua.json';
const branchHausmannStories = readJson(hausmannStoryPath);
const ankerStory = findFirst(branchHausmannStories, (row) => row?.id === 'st_ankerbrua_broen_som_ble_et_eventyr');
if (!ankerStory) throw new Error('Ankerbrua story not found in the pre-normalized branch state');
writeJson(hausmannStoryPath, readMainJson(hausmannStoryPath));

const ankerStoryPath = 'data/stories/stories_ankerbrua.json';
writeJson(ankerStoryPath, [ankerStory]);

const storiesManifestPath = 'data/stories/stories_manifest.json';
const storiesManifest = readMainJson(storiesManifestPath);
if (!Array.isArray(storiesManifest.files)) throw new Error('Stories manifest has no files array');
if (!storiesManifest.files.some((row) => row?.entity_id === 'ankerbrua')) {
  storiesManifest.files.push({
    category: 'by',
    entity_id: 'ankerbrua',
    path: ankerStoryPath,
  });
}
writeJson(storiesManifestPath, storiesManifest);

// 3. Rebase shared registries/data collections semantically onto current main,
// preserving only Ankerbrua's branch record in each file.
mergeRecordFromBranch(
  'data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json',
  (row) => row?.place_id === 'ankerbrua' || row?.placeId === 'ankerbrua',
);
mergeRecordFromBranch(
  'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json',
  (row) => row?.id === 'ankerbrua',
);
mergeRecordFromBranch(
  'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json',
  (row) => row?.id === 'ankerbrua',
);
mergeRecordFromBranch(
  'data/places/places_index.json',
  (row) => row?.id === 'ankerbrua' || row?.placeId === 'ankerbrua',
);

// 4. Remove this one-shot script so it cannot retrigger itself indefinitely.
fs.rmSync(path.join(root, selfPath));

console.log('Ankerbrua branch normalized against current main.');
console.log('- Dyre Vaa moved to a dedicated canonical people file and manifest entry.');
console.log('- Ankerbrua story moved to its own story file and manifest entry.');
console.log('- Hausmannsbrua/Fredrik Ferdinand Hausmann restored from current main.');
console.log('- Shared indexes and leksikon rebased record-by-record onto current main.');
