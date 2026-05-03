#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'data/places/manifest.json');
const OUTPUT_PATH = path.join(ROOT, 'data/places/places_index.json');

const LIGHT_FIELDS = [
  'id','name','lat','lon','r','category','year','desc','image','cardImage','frontImage','hidden','stub'
];

function pickLight(place) {
  const out = {};
  for (const key of LIGHT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(place, key)) out[key] = place[key];
  }
  return out;
}

async function readJson(p) {
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const manifest = await readJson(MANIFEST_PATH);
  const files = Array.isArray(manifest?.files) ? manifest.files : [];
  const out = [];

  for (const rel of files) {
    const fullPath = path.join(ROOT, 'data', rel);
    const data = await readJson(fullPath);
    const places = Array.isArray(data) ? data : (Array.isArray(data?.places) ? data.places : []);
    for (const place of places) {
      if (!place || typeof place !== 'object') continue;
      out.push(pickLight(place));
    }
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${out.length} places -> ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
