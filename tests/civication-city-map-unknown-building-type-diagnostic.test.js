#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const overview = readJson('data/Civication/map/historyGoPlaceMapping.json');
const buildingTypesData = readJson('data/Civication/map/buildingTypes.json');
const root = buildingTypesData.buildingTypes ?? buildingTypesData;
const known = new Set(Array.isArray(root)
  ? root.map((item) => item && item.id).filter(Boolean)
  : Object.entries(root || {}).map(([key, value]) => value && value.id ? value.id : key));

const files = [];
const seenFiles = new Set();
for (const entry of Object.values(overview.sourceFileMappings || {})) {
  const rel = entry && entry.perPlaceMappingFile;
  if (typeof rel === 'string' && rel && !seenFiles.has(rel)) {
    seenFiles.add(rel);
    files.push(rel);
  }
}

const unknown = [];
for (const rel of files) {
  const payload = readJson(rel);
  for (const [mappingKey, mapping] of Object.entries(payload.mappings || {})) {
    const id = mapping && mapping.buildingTypeId;
    if (typeof id === 'string' && id && !known.has(id)) {
      unknown.push({ buildingTypeId: id, mappingKey, historyGoPlaceId: mapping.historyGoPlaceId, file: rel });
    }
  }
}

console.log('unknown Civication building types:', JSON.stringify(unknown));
assert.deepStrictEqual(unknown, [], 'alle Civication mappinger skal bruke en registrert buildingTypeId');
console.log('civication city map building types ok');