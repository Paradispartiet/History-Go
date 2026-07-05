// Split data/places/film/oslo/places_oslo_film.json into one file per place.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const sourcePath = join(root, 'data/places/film/oslo/places_oslo_film.json');
const outDir = join(root, 'data/places/film/oslo');
const placesDir = join(outDir, 'places');

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function fileNameFor(place) {
  if (!place?.id || typeof place.id !== 'string') {
    throw new Error(`Place is missing a valid id: ${JSON.stringify(place)?.slice(0, 200)}`);
  }
  if (place.id.includes('/') || place.id.includes('\\')) {
    throw new Error(`Unsafe place id for filename: ${place.id}`);
  }
  return `${place.id}.json`;
}

function indexRow(place, file) {
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

const sourceText = await readFile(sourcePath, 'utf8');
const places = JSON.parse(sourceText);

if (!Array.isArray(places)) {
  throw new Error('Expected data/places/film/oslo/places_oslo_film.json to be a JSON array.');
}

const seen = new Set();
const duplicateIds = [];
const missingIds = [];

for (const place of places) {
  if (!place?.id || typeof place.id !== 'string') {
    missingIds.push(place?.name ?? '<unnamed>');
    continue;
  }
  if (seen.has(place.id)) duplicateIds.push(place.id);
  seen.add(place.id);
  fileNameFor(place);
}

if (missingIds.length || duplicateIds.length) {
  throw new Error([
    'Cannot split places_oslo_film.json safely.',
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
  const fileName = fileNameFor(place);
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

  indexRows.push(indexRow(place, relFile));
}

const generatedAt = new Date().toISOString();
const manifest = {
  version: 'places_oslo_film_split_v1',
  source_file: 'places_oslo_film.json',
  source_path: 'data/places/film/oslo/places_oslo_film.json',
  source_sha256: sha256(sourceText),
  generated_at: generatedAt,
  place_count: places.length,
  layout: {
    place_files_dir: 'places/',
    one_file_per_place: true,
    filename_rule: '<place.id>.json',
    manifest_preserves_original_order: true,
    original_aggregate_left_unchanged: true,
  },
  places: manifestRows,
};

await writeFile(join(outDir, 'places_oslo_film_manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await writeFile(join(outDir, 'places_oslo_film_index.json'), `${JSON.stringify(indexRows, null, 2)}\n`, 'utf8');

const report = [
  'places_oslo_film split report',
  '',
  'Source: data/places/film/oslo/places_oslo_film.json',
  `Source sha256: ${sha256(sourceText)}`,
  `Generated at: ${generatedAt}`,
  '',
  'Result:',
  `- Place files created: ${places.length}`,
  '- Directory: places/',
  '- Manifest: places_oslo_film_manifest.json',
  '- Lightweight index: places_oslo_film_index.json',
  '',
  'Validation:',
  '- JSON parsed: yes',
  '- Source is array: yes',
  '- Missing place ids: 0',
  '- Duplicate ids: 0',
  '- Existing aggregate source left unchanged: yes',
  '',
].join('\n');

await writeFile(join(outDir, 'places_oslo_film_split_report.txt'), report, 'utf8');

const rebuilt = await Promise.all(
  manifestRows.map(async (row) => JSON.parse(await readFile(join(outDir, row.file), 'utf8'))),
);

if (JSON.stringify(rebuilt) !== JSON.stringify(places)) {
  throw new Error('Round-trip rebuild from split files does not match places_oslo_film.json.');
}

console.log(`Split complete: ${places.length} film/oslo place files written to ${placesDir}`);
