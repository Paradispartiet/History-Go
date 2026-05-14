import fs from 'fs';
import path from 'path';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/places/manifest.json'), 'utf8'));

function collectJsonFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectJsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function collectEmneIds(node, out) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) collectEmneIds(item, out);
    return;
  }

  if (typeof node.emne_id === 'string' && node.emne_id.trim()) out.add(node.emne_id.trim());
  if (Array.isArray(node.emne_ids)) {
    for (const id of node.emne_ids) if (typeof id === 'string' && id.trim()) out.add(id.trim());
  }

  for (const value of Object.values(node)) collectEmneIds(value, out);
}

function buildSubjectEmneIndex() {
  const fagRoot = path.join(root, 'data/fag');
  const index = new Map();
  const unreadableJsonFiles = [];

  for (const entry of fs.readdirSync(fagRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const subject = entry.name;
    const subjectDir = path.join(fagRoot, subject);

    const jsonFiles = collectJsonFiles(subjectDir).filter((file) => !file.includes(`${path.sep}arkiv${path.sep}`));
    if (!jsonFiles.length) continue;

    const ids = new Set();
    for (const file of jsonFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        collectEmneIds(data, ids);
      } catch {
        unreadableJsonFiles.push(path.relative(root, file));
      }
    }

    if (ids.size) index.set(subject, ids);
  }

  if (unreadableJsonFiles.length) {
    console.log(`skipped non-JSON files in data/fag: ${unreadableJsonFiles.length}`);
  }

  return index;
}

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

for (const rel of manifest.files) {
  const file = path.join(root, 'data', rel);
  const places = JSON.parse(fs.readFileSync(file, 'utf8'));
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
console.log('total known emne_ids:', allKnown.size);
console.log('total places:', stats.totalPlaces);
console.log('places with emne_ids:', stats.withEmneIds);
console.log('count per category:');
for (const [cat, total] of [...stats.byCategory.entries()].sort()) {
  const withE = stats.byCategoryWithEmne.get(cat) || 0;
  console.log(`  ${cat}: ${withE}/${total}`);
}
console.log('invalid emne_ids:', invalid.length);
if (invalid.length) console.log(JSON.stringify(invalid, null, 2));
console.log('cross-subject mismatches (warning):', mismatches.length);
if (mismatches.length) console.log(JSON.stringify(mismatches, null, 2));

if (invalid.length) process.exit(1);
