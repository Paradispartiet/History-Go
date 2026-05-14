import fs from 'fs';
import path from 'path';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root,'data/places/manifest.json'),'utf8'));
const fagMapPath = path.join(root,'data/fag/fagkart_map.json');
const fagMap = JSON.parse(fs.readFileSync(fagMapPath,'utf8'));

const subjectIds = Object.keys(fagMap.subjects || {});
const subjectEmner = new Map();
for (const subjectId of subjectIds) {
  const emnerRel = fagMap.subjects[subjectId]?.emner;
  if (!emnerRel) continue;
  const emnerPath = path.join(root, emnerRel);
  const data = JSON.parse(fs.readFileSync(emnerPath,'utf8'));
  const arr = Array.isArray(data) ? data : Object.values(data);
  subjectEmner.set(subjectId, new Set(arr.map(e => e?.emne_id).filter(Boolean)));
}

const stats = { totalPlaces:0, withEmneIds:0, byCategory:new Map(), byCategoryWithEmne:new Map() };
const invalid = [];
const mismatches = [];

for (const rel of manifest.files) {
  const file = path.join(root,'data',rel);
  const places = JSON.parse(fs.readFileSync(file,'utf8'));
  for (const p of places) {
    stats.totalPlaces++;
    const cat = p.category || 'unknown';
    stats.byCategory.set(cat, (stats.byCategory.get(cat)||0)+1);
    if (Array.isArray(p.emne_ids) && p.emne_ids.length) {
      stats.withEmneIds++;
      stats.byCategoryWithEmne.set(cat, (stats.byCategoryWithEmne.get(cat)||0)+1);
      const allowed = subjectEmner.get(cat);
      for (const id of p.emne_ids) {
        if (!allowed?.has(id)) {
          let foundIn = null;
          for (const [sid,set] of subjectEmner.entries()) if (set.has(id)) {foundIn=sid;break;}
          if (!foundIn) invalid.push({file:rel, place:p.id, category:cat, emne_id:id});
          else mismatches.push({file:rel, place:p.id, category:cat, emne_id:id, foundIn});
        }
      }
    }
  }
}

console.log('total places:', stats.totalPlaces);
console.log('places with emne_ids:', stats.withEmneIds);
console.log('count per category:');
for (const [cat,total] of [...stats.byCategory.entries()].sort()) {
  const withE = stats.byCategoryWithEmne.get(cat)||0;
  console.log(`  ${cat}: ${withE}/${total}`);
}
console.log('invalid emne_ids:', invalid.length);
if (invalid.length) console.log(JSON.stringify(invalid,null,2));
console.log('cross-subject mismatches:', mismatches.length);
if (mismatches.length) console.log(JSON.stringify(mismatches,null,2));

if (invalid.length || mismatches.length) process.exit(1);
