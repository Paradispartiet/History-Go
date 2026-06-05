#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'data/places/manifest.json');
const OUTPUT_PATH = path.join(ROOT, 'data/places/places_index.json');

type JsonObject = Record<string, unknown>;
type PlaceManifest = JsonObject & {
  files?: unknown[];
};
type PlaceRow = JsonObject & {
  id?: unknown;
  name?: unknown;
  lat?: unknown;
  lon?: unknown;
  r?: unknown;
  category?: unknown;
  year?: unknown;
  desc?: unknown;
  image?: unknown;
  cardImage?: unknown;
  frontImage?: unknown;
  hidden?: unknown;
  stub?: unknown;
};
type LightField = keyof PlaceRow;
type LightPlace = Partial<Record<LightField, unknown>>;

const LIGHT_FIELDS: LightField[] = [
  'id','name','lat','lon','r','category','year','desc','image','cardImage','frontImage','hidden','stub'
];

function hasObjectType(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object';
}

function isPlaceManifest(value: unknown): value is PlaceManifest {
  return hasObjectType(value) && (!Object.prototype.hasOwnProperty.call(value, 'files') || Array.isArray(value.files));
}

function isPlaceRow(value: unknown): value is PlaceRow {
  return hasObjectType(value);
}

function pickLight(place: PlaceRow): LightPlace {
  const out: LightPlace = {};
  for (const key of LIGHT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(place, key)) out[key] = place[key];
  }
  return out;
}

async function readJson(p: string): Promise<unknown> {
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw) as unknown;
}

async function main(): Promise<void> {
  const manifest = await readJson(MANIFEST_PATH);
  const files = isPlaceManifest(manifest) && Array.isArray(manifest.files) ? manifest.files : [];
  const out: LightPlace[] = [];

  for (const rel of files) {
    const fullPath = path.join(ROOT, 'data', rel as string);
    const data = await readJson(fullPath);
    const places = Array.isArray(data) ? data : (hasObjectType(data) && Array.isArray(data.places) ? data.places : []);
    for (const place of places) {
      if (!isPlaceRow(place)) continue;
      out.push(pickLight(place));
    }
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${out.length} places -> ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
