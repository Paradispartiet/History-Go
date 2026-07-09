#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const DATA_PLACES = path.join(ROOT, 'data', 'places');
const MAIN_MANIFEST = path.join(DATA_PLACES, 'manifest.json');
const MAIN_INDEX = path.join(DATA_PLACES, 'places_index.json');

const COORD_FIELDS = [
  'lat',
  'lon',
  'r',
  'coordType',
  'coordStatus',
  'coordSource',
  'coordVerifiedAt',
  'coordNote',
];
const MAX_DIFFS = 100;

function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function rowsFromJson(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.places)) return data.places;
  if (data && typeof data === 'object' && typeof data.id === 'string') return [data];
  return [];
}

function jsonValue(value) {
  return value === undefined ? 'undefined' : JSON.stringify(value);
}

function addRowsToSourceMap(map, file) {
  const data = readJson(file);
  for (const row of rowsFromJson(data)) {
    if (!row || typeof row !== 'object' || typeof row.id !== 'string' || !row.id.trim()) continue;
    map.set(row.id.trim(), { row, file });
  }
}


function splitManifestPathFor(file) {
  const parsed = path.parse(file);
  return path.join(parsed.dir, `${parsed.name}_manifest${parsed.ext || '.json'}`);
}

function isValidSplitManifest(data) {
  return data && typeof data === 'object' && !Array.isArray(data)
    && Array.isArray(data.places)
    && data.places.some((row) => row && typeof row === 'object' && typeof row.file === 'string' && row.file.trim());
}

function addRowsFromManifestEntryToSourceMap(map, file) {
  const splitManifestPath = splitManifestPathFor(file);
  if (fs.existsSync(splitManifestPath)) {
    const splitManifest = readJson(splitManifestPath);
    if (isValidSplitManifest(splitManifest)) {
      for (const entry of splitManifest.places) {
        if (!entry || typeof entry !== 'object' || typeof entry.file !== 'string' || !entry.file.trim()) continue;
        addRowsToSourceMap(map, path.join(path.dirname(splitManifestPath), entry.file));
      }
      return;
    }
  }
  addRowsToSourceMap(map, file);
}

function buildMainSourceMap() {
  const manifest = readJson(MAIN_MANIFEST);
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  const map = new Map();
  for (const manifestPath of files) {
    if (typeof manifestPath !== 'string' || !manifestPath.trim()) continue;
    addRowsFromManifestEntryToSourceMap(map, path.join(ROOT, 'data', manifestPath));
  }
  return map;
}

function indexSourceManifestPath(indexFile) {
  const dir = path.dirname(indexFile);
  const base = path.basename(indexFile, '.json');
  if (!base.endsWith('_index')) return null;
  const sourceBase = base.slice(0, -'_index'.length);
  const candidate = path.join(dir, `${sourceBase}_manifest.json`);
  return fs.existsSync(candidate) ? candidate : null;
}

function buildSplitSourceMap(indexFile) {
  const manifestPath = indexSourceManifestPath(indexFile);
  if (!manifestPath) return null;

  const manifest = readJson(manifestPath);
  if (!Array.isArray(manifest.places)) return null;

  const map = new Map();
  for (const entry of manifest.places) {
    if (!entry || typeof entry !== 'object' || typeof entry.file !== 'string' || !entry.file.trim()) continue;
    addRowsToSourceMap(map, path.join(path.dirname(manifestPath), entry.file));
  }
  return map;
}

function findIndexFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findIndexFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('_index.json')) {
      out.push(full);
    }
  }
  return out.sort((a, b) => rel(a).localeCompare(rel(b)));
}

function compareIndex(indexFile, sourceMap, diffs, options = {}) {
  const indexRows = rowsFromJson(readJson(indexFile));
  for (const indexRow of indexRows) {
    if (!indexRow || typeof indexRow !== 'object' || typeof indexRow.id !== 'string' || !indexRow.id.trim()) continue;
    const id = indexRow.id.trim();
    const source = sourceMap.get(id);
    if (!source) {
      diffs.push({
        id,
        field: '(source)',
        sourceValue: 'missing source row',
        indexValue: 'present in index',
        sourceFile: '(not found)',
        indexFile,
      });
      if (diffs.length >= MAX_DIFFS) return;
      continue;
    }

    for (const field of COORD_FIELDS) {
      if (options.onlyFieldsPresentInIndex && !Object.prototype.hasOwnProperty.call(indexRow, field)) continue;
      const sourceValue = source.row[field];
      const indexValue = indexRow[field];
      if (!equivalentCoordinateValue(sourceValue, indexValue)) {
        diffs.push({
          id,
          field,
          sourceValue,
          indexValue,
          sourceFile: source.file,
          indexFile,
        });
        if (diffs.length >= MAX_DIFFS) return;
      }
    }
  }
}

function applyCoordinateOverrides(sourceMap) {
  const overrideFile = path.join(DATA_PLACES, 'coordinate_overrides.json');
  if (!fs.existsSync(overrideFile)) return;
  const overrides = readJson(overrideFile);
  if (!Array.isArray(overrides)) return;
  for (const override of overrides) {
    if (!override || typeof override !== 'object' || typeof override.id !== 'string' || !override.id.trim()) continue;
    const id = override.id.trim();
    const source = sourceMap.get(id);
    if (!source) continue;
    const row = { ...source.row };
    for (const field of COORD_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(override, field)) row[field] = override[field];
    }
    sourceMap.set(id, { row, file: overrideFile });
  }
}

function equivalentCoordinateValue(sourceValue, indexValue) {
  if (sourceValue === indexValue) return true;
  return (sourceValue === undefined && indexValue === null) || (sourceValue === null && indexValue === undefined);
}

function printDiffs(diffs) {
  console.error('Place coordinate index parity check failed. Index files must be generated copies of source coordinate fields.');
  console.error(`Showing ${diffs.length} difference(s):`);
  for (const diff of diffs) {
    console.error(`- id: ${diff.id}`);
    console.error(`  felt: ${diff.field}`);
    console.error(`  source-verdi: ${jsonValue(diff.sourceValue)}`);
    console.error(`  index-verdi: ${jsonValue(diff.indexValue)}`);
    console.error(`  source-fil: ${rel(diff.sourceFile)}`);
    console.error(`  index-fil: ${rel(diff.indexFile)}`);
  }
}

function main() {
  const mainSourceMap = buildMainSourceMap();
  applyCoordinateOverrides(mainSourceMap);
  const diffs = [];

  compareIndex(MAIN_INDEX, mainSourceMap, diffs);

  for (const indexFile of findIndexFiles(DATA_PLACES)) {
    if (path.resolve(indexFile) === path.resolve(MAIN_INDEX)) continue;
    const splitSourceMap = buildSplitSourceMap(indexFile);
    if (!splitSourceMap) continue;
    compareIndex(indexFile, splitSourceMap, diffs, { onlyFieldsPresentInIndex: true });
    if (diffs.length >= MAX_DIFFS) break;
  }

  if (diffs.length > 0) {
    printDiffs(diffs);
    process.exit(1);
  }

  console.log('Place coordinate index parity OK: runtime index coordinate fields match source files.');
}

main();
