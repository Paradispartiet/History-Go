#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');

const readJson = (file: string): unknown => JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const rel = (p: string): string => path.relative(root, p).replace(/\\/g, '/');
const isArchivePath = (p: string): boolean => /(^|\/)arkiv(\/|$)/i.test(p);

function toPlaces(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (isObject(payload) && Array.isArray(payload.places)) return payload.places;
  if (isObject(payload) && Array.isArray(payload.items)) return payload.items;
  return [];
}

const manifest = readJson(manifestPath);
const files = isObject(manifest) && Array.isArray(manifest.files) ? manifest.files : [];
const errors: string[] = [];

for (const rawFile of files) {
  const sourceFile = String(rawFile || '').trim();
  if (!sourceFile) continue;
  const file = path.join(root, 'data', sourceFile);
  if (isArchivePath(rel(file))) continue;
  if (!fs.existsSync(file)) continue;

  const payload = readJson(file);
  for (const place of toPlaces(payload)) {
    if (!isObject(place)) continue;
    const id = typeof place.id === 'string' && place.id.trim() ? place.id.trim() : '(mangler-id)';

    if (Object.prototype.hasOwnProperty.call(place, 'lng')) {
      errors.push(`${sourceFile}#${id}: bruker ugyldig felt lng; bruk lon`);
    }

    const anchors = Array.isArray(place.anchors) ? place.anchors : [];
    for (const [index, anchor] of anchors.entries()) {
      if (isObject(anchor) && Object.prototype.hasOwnProperty.call(anchor, 'lng')) {
        const anchorId = typeof anchor.id === 'string' && anchor.id.trim() ? anchor.id.trim() : `anchor[${index}]`;
        errors.push(`${sourceFile}#${id}/${anchorId}: anchor bruker ugyldig felt lng; bruk lon`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Fant ${errors.length} ugyldige lng-felt i active place-data:`);
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  if (errors.length > 100) console.error(`... +${errors.length - 100} til`);
  process.exit(1);
}

console.log('OK: Ingen active place-data bruker lng. History Go bruker lat/lon.');
