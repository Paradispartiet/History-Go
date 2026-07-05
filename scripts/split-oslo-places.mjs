import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const srcPath = join(root, 'data/places/by/oslo/places_by.json');
const outDir = join(root, 'data/places/by/oslo');
const placesDir = join(outDir, 'places');

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function stablePlaceFileName(place) {
  if (!place || typeof place.id !== 'string' || !place.id.trim()) {
    throw new Error(`Place is missing a valid id: ${JSON.stringify(place)?.slice(0, 200)}`);
  }
  return `${place.id}.json`;
}

function lightIndexRow(place, file) {
  return {
    id: place.id,
    name: place.name ?? null,
    category: place.category ?? null,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    year: place.year ?? null,
    coordStatus: place.coordStatus ?? null,
    coordType: place.coordType ?? null,
    file,
  };
}

const source = await readFile(srcPath, 'utf8');
const places = JSON.parse(source);

if (!Array.isArray(places)) {
  throw new Error('Expected data/places/by/oslo/places_by.json to be a JSON array.');
}

const seen = new Set();
const duplicateIds = [];
const missingIds = [];

for (const place of places) {
  if (!place?.id) {
    missingIds.push(place?.name ?? '<unnamed>');
    continue;
  }
  if (seen.has(place.id)) duplicateIds.push(place.id);
  seen.add(place.id);
}

if (missingIds.length || duplicateIds.length) {
  throw new Error([
    `Cannot split places_by.json safely.`,
    `Missing ids: ${missingIds.length ? missingIds.join(', ') : '0'}`,
    `Duplicate ids: ${duplicateIds.length ? duplicateIds.join(', ') : '0'}`,
  ].join('\n'));
}

await rm(placesDir, { recursive: true, force: true });
await mkdir(placesDir, { recursive: true });

const manifestRows = [];
const indexRows = [];

for (let i = 0; i < places.length; i += 1) {
  const place = places[i];
  const fileName = stablePlaceFileName(place);
  const relFile = `places/${fileName}`;
  const content = `${JSON.stringify(place, null, 2)}\n`;
  await writeFile(join(placesDir, fileName), content, 'utf8');

  manifestRows.push({
    id: place.id,
    name: place.name ?? null,
    category: place.category ?? null,
    file: relFile,
    order: i,
    sha256: sha256(content),
  });

  indexRows.push(lightIndexRow(place, relFile));
}

const generatedAt = new Date().toISOString();
const manifest = {
  version: 'places_by_split_v1',
  source_file: 'places_by.json',
  source_sha256: sha256(source),
  generated_at: generatedAt,
  place_count: places.length,
  layout: {
    place_files_dir: 'places/',
    one_file_per_place: true,
    filename_rule: '<place.id>.json',
    manifest_preserves_original_order: true,
  },
  places: manifestRows,
};

await writeFile(join(outDir, 'places_by_manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await writeFile(join(outDir, 'places_by_index.json'), `${JSON.stringify(indexRows, null, 2)}\n`, 'utf8');

const report = [
  'places_by split report',
  '',
  'Source: data/places/by/oslo/places_by.json',
  `Source sha256: ${sha256(source)}`,
  `Generated at: ${generatedAt}`,
  '',
  'Result:',
  `- Place files created: ${places.length}`,
  '- Directory: places/',
  '- Manifest: places_by_manifest.json',
  '- Lightweight index: places_by_index.json',
  '',
  'Validation:',
  '- JSON parsed: yes',
  '- Missing place ids: 0',
  '- Duplicate ids: 0',
  '- Existing combined places_by.json left unchanged: yes',
  '',
  'Recommended app structure:',
  'data/places/by/oslo/places_by_manifest.json',
  'data/places/by/oslo/places_by_index.json',
  'data/places/by/oslo/places/<placeId>.json',
  '',
  'Recommended loader logic:',
  '1. Load places_by_manifest.json or places_by_index.json.',
  '2. Use the lightweight index for startup/map rendering.',
  '3. Lazy-load places/<placeId>.json when a place card opens.',
  '4. Keep places_by.json as fallback until runtime migration is complete.',
  '5. Patch existing places/<placeId>.json instead of generating duplicate place files.',
  '',
].join('\n');

await writeFile(join(outDir, 'places_by_split_report.txt'), report, 'utf8');

const readBack = await Promise.all(
  manifestRows.map(async (row) => JSON.parse(await readFile(join(outDir, row.file), 'utf8'))),
);

if (JSON.stringify(readBack) !== JSON.stringify(places)) {
  throw new Error('Round-trip rebuild from split files does not match original array.');
}

console.log(`Split complete: ${places.length} place files written to ${placesDir}`);
