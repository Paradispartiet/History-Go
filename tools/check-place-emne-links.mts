import fs from 'fs';
import path from 'path';

type JsonRecord = Record<string, unknown>;

const root = process.cwd();
const placesManifest = JSON.parse(fs.readFileSync(path.join(root, 'data/places/manifest.json'), 'utf8'));
const fagManifest = JSON.parse(fs.readFileSync(path.join(root, 'data/fag/fag_manifest.json'), 'utf8')) as Record<string, JsonRecord>;

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

function walkFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(fullPath, out);
    else out.push(fullPath);
  }
  return out;
}

function extractCanonicalIdFromEmnerPath(emnerRelPath) {
  const base = path.basename(emnerRelPath);
  const m = base.match(/^emner_(.+?)(?:_canonical.*)?\.json$/);
  return m ? m[1] : null;
}

function normalizeSubjectId(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function loadFagkartMapSubjectIds() {
  const fagkartMapPath = path.join(root, 'data/fag/fagkart_map.json');
  if (!fs.existsSync(fagkartMapPath)) return new Set();
  const data = JSON.parse(fs.readFileSync(fagkartMapPath, 'utf8'));
  const subjects = data && typeof data === 'object' && !Array.isArray(data)
    ? (data.subjects && typeof data.subjects === 'object' && !Array.isArray(data.subjects) ? data.subjects : data)
    : {};
  return new Set(Object.keys(subjects).map(normalizeSubjectId).filter(Boolean));
}

function loadEmnerIdsFromPath(emnerRelPath) {
  const emnerPath = path.isAbsolute(emnerRelPath) ? emnerRelPath : path.join(root, 'data/fag', emnerRelPath);
  const emnerData = JSON.parse(fs.readFileSync(emnerPath, 'utf8'));
  const emner = toArray(emnerData);
  const ids = new Set();
  collectIdsDeep(emner, ids);
  return ids;
}

function addSubjectIndex(index, subjectId, ids) {
  const normalizedSubjectId = normalizeSubjectId(subjectId);
  if (!normalizedSubjectId || index.has(normalizedSubjectId)) return;
  index.set(normalizedSubjectId, ids);
}

function buildSubjectEmneIndex() {
  const index = new Map();
  const fagkartMapSubjects = loadFagkartMapSubjectIds();

  for (const [subjectId, cfg] of Object.entries(fagManifest)) {
    const emnerRel = cfg?.emner;
    if (!emnerRel) continue;
    const ids = loadEmnerIdsFromPath(emnerRel);
    addSubjectIndex(index, subjectId, ids);

    const canonicalFromFile = extractCanonicalIdFromEmnerPath(emnerRel);
    if (canonicalFromFile) addSubjectIndex(index, canonicalFromFile, ids);
  }

  const fagRoot = path.join(root, 'data/fag');
  const canonicalEmnerFiles = walkFiles(fagRoot).filter((file) =>
    /emner.*_canonical.*\.json$/i.test(path.basename(file))
  );

  for (const file of canonicalEmnerFiles) {
    const canonicalFromFile = extractCanonicalIdFromEmnerPath(file);
    if (!canonicalFromFile || index.has(canonicalFromFile)) continue;
    const ids = loadEmnerIdsFromPath(file);
    addSubjectIndex(index, canonicalFromFile, ids);

    const folderSubject = normalizeSubjectId(path.basename(path.dirname(file)));
    if (folderSubject && (folderSubject === canonicalFromFile || fagkartMapSubjects.has(folderSubject))) {
      addSubjectIndex(index, folderSubject, ids);
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
