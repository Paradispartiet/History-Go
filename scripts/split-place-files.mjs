// Generic splitter for all files in data/places/manifest.json.
// Run with: node scripts/split-place-files.mjs
// Output rule: Oslo by keeps places/, all other aggregate files get a folder named after the source stem.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const dataRoot = join(root, 'data');
const manifestPath = join(dataRoot, 'places/manifest.json');

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function stripJson(fileName) {
  return fileName.endsWith('.json') ? fileName.slice(0, -5) : fileName;
}

function safeFileNameFromId(id) {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error(`Missing or invalid place id: ${JSON.stringify(id)}`);
  }
  if (id.includes('/') || id.includes('\\')) {
    throw new Error(`Unsafe place id for filename: ${id}`);
  }
  return `${id}.json`;
}

function outputConfig(relativeSourcePath, sourceStem) {
  if (relativeSourcePath === 'places/by/oslo/places_by.json') {
    return {
      itemDirName: 'places',
      manifestName: 'places_by_manifest.json',
      indexName: 'places_by_index.json',
      reportName: 'places_by_split_report.txt',
    };
  }

  return {
    itemDirName: sourceStem,
    manifestName: `${sourceStem}_manifest.json`,
    indexName: `${sourceStem}_index.json`,
    reportName: `${sourceStem}_split_report.txt`,
  };
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

async function splitOne(relativeSourcePath) {
  const sourcePath = join(dataRoot, relativeSourcePath);
  const sourceText = await readFile(sourcePath, 'utf8');
  const sourceJson = JSON.parse(sourceText);

  if (!Array.isArray(sourceJson)) {
    return {
      source: relativeSourcePath,
      status: 'skipped_non_array',
      count: 0,
    };
  }

  const sourceDirRel = dirname(relativeSourcePath);
  const sourceDirAbs = join(dataRoot, sourceDirRel);
  const sourceBase = basename(relativeSourcePath);
  const sourceStem = stripJson(sourceBase);
  const config = outputConfig(relativeSourcePath, sourceStem);
  const itemsDirAbs = join(sourceDirAbs, config.itemDirName);

  const seen = new Set();
  const missingIds = [];
  const duplicateIds = [];

  for (const place of sourceJson) {
    if (!place?.id || typeof place.id !== 'string') {
      missingIds.push(place?.name ?? '<unnamed>');
      continue;
    }
    if (seen.has(place.id)) duplicateIds.push(place.id);
    seen.add(place.id);
    safeFileNameFromId(place.id);
  }

  if (missingIds.length || duplicateIds.length) {
    throw new Error([
      `Cannot split ${relativeSourcePath} safely.`,
      `Missing ids: ${missingIds.length ? missingIds.join(', ') : '0'}`,
      `Duplicate ids: ${duplicateIds.length ? duplicateIds.join(', ') : '0'}`,
    ].join('\n'));
  }

  await rm(itemsDirAbs, { recursive: true, force: true });
  await mkdir(itemsDirAbs, { recursive: true });

  const manifestRows = [];
  const indexRows = [];

  for (let i = 0; i < sourceJson.length; i += 1) {
    const place = sourceJson[i];
    const fileName = safeFileNameFromId(place.id);
    const itemRelFile = `${config.itemDirName}/${fileName}`;
    const itemText = `${JSON.stringify(place, null, 2)}\n`;
    await writeFile(join(sourceDirAbs, itemRelFile), itemText, 'utf8');

    manifestRows.push({
      id: place.id,
      name: place.name ?? null,
      category: place.category ?? null,
      file: itemRelFile,
      order: i,
      sha256: sha256(itemText),
    });

    indexRows.push(lightIndexRow(place, itemRelFile));
  }

  const generatedAt = new Date().toISOString();
  const sourceSha = sha256(sourceText);
  const splitManifest = {
    version: 'places_split_v1',
    source_file: sourceBase,
    source_path: relativeSourcePath,
    source_sha256: sourceSha,
    generated_at: generatedAt,
    place_count: sourceJson.length,
    layout: {
      place_files_dir: `${config.itemDirName}/`,
      one_file_per_place: true,
      filename_rule: '<place.id>.json',
      manifest_preserves_original_order: true,
      original_aggregate_left_unchanged: true,
    },
    places: manifestRows,
  };

  await writeFile(join(sourceDirAbs, config.manifestName), `${JSON.stringify(splitManifest, null, 2)}\n`, 'utf8');
  await writeFile(join(sourceDirAbs, config.indexName), `${JSON.stringify(indexRows, null, 2)}\n`, 'utf8');

  const report = [
    'places split report',
    '',
    `Source: data/${relativeSourcePath}`,
    `Source sha256: ${sourceSha}`,
    `Generated at: ${generatedAt}`,
    '',
    'Result:',
    `- Place files created: ${sourceJson.length}`,
    `- Directory: ${config.itemDirName}/`,
    `- Manifest: ${config.manifestName}`,
    `- Lightweight index: ${config.indexName}`,
    '',
    'Validation:',
    '- JSON parsed: yes',
    '- Source is array: yes',
    '- Missing place ids: 0',
    '- Duplicate ids: 0',
    '- Existing aggregate source left unchanged: yes',
    '',
    'Recommended loader logic:',
    `1. Load ${config.manifestName} or ${config.indexName}.`,
    '2. Use the lightweight index for startup/map rendering when appropriate.',
    `3. Lazy-load ${config.itemDirName}/<placeId>.json when a place card opens.`,
    '4. Keep the aggregate JSON as fallback until runtime migration is complete.',
    '5. Patch the existing per-place file instead of generating duplicate place files.',
    '',
  ].join('\n');

  await writeFile(join(sourceDirAbs, config.reportName), report, 'utf8');

  const rebuilt = await Promise.all(
    manifestRows.map(async (row) => JSON.parse(await readFile(join(sourceDirAbs, row.file), 'utf8'))),
  );

  if (JSON.stringify(rebuilt) !== JSON.stringify(sourceJson)) {
    throw new Error(`Round-trip rebuild from split files does not match ${relativeSourcePath}.`);
  }

  return {
    source: relativeSourcePath,
    status: 'split',
    count: sourceJson.length,
    itemDir: `${sourceDirRel}/${config.itemDirName}`,
    manifest: `${sourceDirRel}/${config.manifestName}`,
    index: `${sourceDirRel}/${config.indexName}`,
    report: `${sourceDirRel}/${config.reportName}`,
  };
}

const manifestText = await readFile(manifestPath, 'utf8');
const manifest = JSON.parse(manifestText);

if (!Array.isArray(manifest?.files)) {
  throw new Error('Expected data/places/manifest.json to contain a files array.');
}

const results = [];
for (const relativeSourcePath of manifest.files) {
  results.push(await splitOne(relativeSourcePath));
}

const summary = {
  version: 'places_split_all_v1',
  generated_at: new Date().toISOString(),
  source_manifest: 'places/manifest.json',
  source_file_count: manifest.files.length,
  split_file_count: results.filter((row) => row.status === 'split').length,
  skipped_file_count: results.filter((row) => row.status !== 'split').length,
  total_place_count: results.reduce((sum, row) => sum + row.count, 0),
  results,
};

await writeFile(join(dataRoot, 'places/places_split_all_report.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

console.log(
  `Split complete: ${summary.split_file_count}/${summary.source_file_count} aggregate files, ${summary.total_place_count} places.`,
);
