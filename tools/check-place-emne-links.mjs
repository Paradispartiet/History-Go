import fs from 'fs';
import path from 'path';

const root = process.cwd();
const placesManifest = JSON.parse(fs.readFileSync(path.join(root, 'data/places/manifest.json'), 'utf8'));
const fagManifest = JSON.parse(fs.readFileSync(path.join(root, 'data/fag/fag_manifest.json'), 'utf8'));

function toArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

function collectIdsDeep(node, out) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) collectIdsDeep(item, out);
    return;
  }
  const directId = node.emne_id || node.id;
  if (typeof directId === 'string' && directId.trim()) out.add(directId.trim());
  if (Array.isArray(node.emne_ids)) {
    for (const eid of node.emne_ids) if (typeof eid === 'string' && eid.trim()) out.add(eid.trim());
  }
  for (const value of Object.values(node)) collectIdsDeep(value, out);
}

function extractCanonicalIdFromEmnerPath(emnerRelPath) {
  const base = path.basename(emnerRelPath);
  const m = base.match(/^emner_(.+?)(?:_canonical.*)?\.json$/);
  return m ? m[1] : null;
}

function loadEmnerIdsFromPath(emnerRelPath) {
  const emnerPath = path.join(root, 'data/fag', emnerRelPath);
  const emnerData = JSON.parse(fs.readFileSync(emnerPath, 'utf8'));
  const emner = toArray(emnerData);
  const ids = new Set();
  collectIdsDeep(emner, ids);
  return ids;
}

function buildSubjectEmneIndex() {
  const index = new Map();

  for (const [subjectId, cfg] of Object.entries(fagManifest)) {
    const emnerRel = cfg?.emner;
    if (!emnerRel) continue;
    const ids = loadEmnerIdsFromPath(emnerRel);
    index.set(subjectId, ids);

    const canonicalFromFile = extractCanonicalIdFromEmnerPath(emnerRel);
    if (canonicalFromFile && canonicalFromFile !== subjectId && !index.has(canonicalFromFile)) {
      index.set(canonicalFromFile, ids);
    }
  }

  return index;
}

function normalizeInputPath(inputPath) {
  return inputPath.startsWith('data/') ? inputPath : path.join('data', inputPath);
}

const explicitFiles = process.argv.slice(2);
const filesToValidate = explicitFiles.length
  ? explicitFiles.map(normalizeInputPath)
  : placesManifest.files.map((rel) => path.join('data', rel));

const subjectEmner = buildSubjectEmneIndex();
const allKnown = new Map();
for (const [subject, ids] of subjectEmner.entries()) {
  for (const id of ids) {
    if (!allKnown.has(id)) allKnown.set(id, new Set());
    allKnown.get(id).add(subject);
  }
}

const stats = { totalPlaces: 0, withEmneIds: 0, byCategory: new Map(), byCategoryWithEmne: new Map() };
const invalid = [];
const mismatches = [];

for (const rel of filesToValidate) {
  const file = path.join(root, rel);
  const placesData = JSON.parse(fs.readFileSync(file, 'utf8'));
  const places = toArray(placesData);

  for (const p of places) {
    stats.totalPlaces++;
    const cat = p.category || 'unknown';
    stats.byCategory.set(cat, (stats.byCategory.get(cat) || 0) + 1);
    if (!Array.isArray(p.emne_ids) || !p.emne_ids.length) continue;

    stats.withEmneIds++;
    stats.byCategoryWithEmne.set(cat, (stats.byCategoryWithEmne.get(cat) || 0) + 1);
    const allowed = subjectEmner.get(cat) || new Set();

    for (const id of p.emne_ids) {
      if (allowed.has(id)) continue;
      const foundIn = allKnown.get(id);
      if (!foundIn) invalid.push({ file: rel, place: p.id, category: cat, emne_id: id });
      else mismatches.push({ file: rel, place: p.id, category: cat, emne_id: id, foundIn: [...foundIn].sort() });
    }
  }
}

console.log('indexed subjects:', subjectEmner.size);
console.log('total known active emne_ids:', allKnown.size);
console.log('validated files:', filesToValidate.length);
console.log('total places:', stats.totalPlaces);
console.log('places with emne_ids:', stats.withEmneIds);
console.log('count per category:');
for (const [cat, total] of [...stats.byCategory.entries()].sort()) {
  const withE = stats.byCategoryWithEmne.get(cat) || 0;
  console.log(`  ${cat}: ${withE}/${total}`);
}
console.log('invalid emne_ids:', invalid.length);
if (invalid.length) console.log(JSON.stringify(invalid, null, 2));
console.log('cross-subject mismatches:', mismatches.length);
if (mismatches.length) console.log(JSON.stringify(mismatches, null, 2));

if (invalid.length || mismatches.length) process.exit(1);
