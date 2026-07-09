// Split Agder history batch 1 aggregate into one JSON file per place.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const outDir = join(root, 'data/places/historie/agder');
const sourceFile = 'places_historie_agder_batch1.json';
const sourceStem = 'places_historie_agder_batch1';
const placesDirName = sourceStem;
const placesDir = join(outDir, placesDirName);

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

const sourceText = await readFile(join(outDir, sourceFile), 'utf8');
const places = JSON.parse(sourceText);

if (!Array.isArray(places)) {
  throw new Error(`Expected data/places/historie/agder/${sourceFile} to be a JSON array.`);
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
    `Cannot split ${sourceFile} safely.`,
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
  const relFile = `${placesDirName}/${fileName}`;
  const content = `${JSON.stringify(place, null, 2)}\n`;
  await writeFile(join(outDir, relFile), content, 'utf8');

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
  version: `${sourceStem}_split_v1`,
  source_file: sourceFile,
  source_path: `data/places/historie/agder/${sourceFile}`,
  source_sha256: sha256(sourceText),
  generated_at: generatedAt,
  place_count: places.length,
  layout: {
    place_files_dir: `${placesDirName}/`,
    one_file_per_place: true,
    filename_rule: '<place.id>.json',
    manifest_preserves_original_order: true,
    original_aggregate_left_unchanged: true,
  },
  places: manifestRows,
};

await writeFile(join(outDir, `${sourceStem}_manifest.json`), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await writeFile(join(outDir, `${sourceStem}_index.json`), `${JSON.stringify(indexRows, null, 2)}\n`, 'utf8');

const report = [
  `${sourceStem} split report`,
  '',
  `Source: data/places/historie/agder/${sourceFile}`,
  `Source sha256: ${sha256(sourceText)}`,
  `Generated at: ${generatedAt}`,
  '',
  'Result:',
  `- Place files created: ${places.length}`,
  `- Directory: ${placesDirName}/`,
  `- Manifest: ${sourceStem}_manifest.json`,
  `- Lightweight index: ${sourceStem}_index.json`,
  '',
  'Validation:',
  '- JSON parsed: yes',
  '- Source is array: yes',
  '- Missing place ids: 0',
  '- Duplicate ids: 0',
  '- Existing aggregate source left unchanged: yes',
  '',
].join('\n');

await writeFile(join(outDir, `${sourceStem}_split_report.txt`), report, 'utf8');

const rebuilt = await Promise.all(
  manifestRows.map(async (row) => JSON.parse(await readFile(join(outDir, row.file), 'utf8'))),
);

if (JSON.stringify(rebuilt) !== JSON.stringify(places)) {
  throw new Error(`Round-trip rebuild from split files does not match ${sourceFile}.`);
}

console.log(`Split complete: ${places.length} files from ${sourceFile}`);
