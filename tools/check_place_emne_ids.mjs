import fs from 'fs';
import path from 'path';

const root = process.cwd();

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

function walkFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(fullPath, out);
    else out.push(fullPath);
  }
  return out;
}

function collectCanonicalEmneIds() {
  const fagRoot = path.join(root, 'data', 'fag');
  const files = walkFiles(fagRoot).filter((file) =>
    /emner.*_canonical.*\.json$/i.test(path.basename(file))
  );

  const ids = new Set();
  const aliasIssues = [];
  for (const file of files) {
    const data = readJson(file);
    const entries = toArray(data);
    for (const item of entries) {
      if (!item || typeof item !== 'object') continue;
      const rawId = typeof item.id === 'string' ? item.id : (typeof item.emne_id === 'string' ? item.emne_id : '');
      const id = rawId.trim();
      if (id) {
        if (ids.has(id)) aliasIssues.push({ type: 'duplicate_emne_id', file: formatRel(file), emne_id: id });
        ids.add(id);
      }
    }

    for (const item of entries) {
      if (!item || typeof item !== 'object') continue;
      if (item.canonical_status !== 'canonical_alias') continue;
      const emneId = String(item.emne_id || '').trim();
      const aliasOf = String(item.alias_of || '').trim();
      if (!emneId) aliasIssues.push({ type: 'alias_missing_emne_id', file: formatRel(file) });
      if (!aliasOf) aliasIssues.push({ type: 'alias_missing_alias_of', file: formatRel(file), emne_id: emneId || '<missing-emne-id>' });
      if (emneId && aliasOf && emneId === aliasOf) aliasIssues.push({ type: 'alias_self_reference', file: formatRel(file), emne_id: emneId });
      if (aliasOf && !ids.has(aliasOf)) aliasIssues.push({ type: 'alias_target_missing', file: formatRel(file), emne_id: emneId || '<missing-emne-id>', alias_of: aliasOf });
    }
  }

  return { ids, files, aliasIssues };
}

function formatRel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function main() {
  const manifestPath = path.join(root, 'data/places/manifest.json');
  const manifest = readJson(manifestPath);
  const activeFiles = Array.isArray(manifest.files) ? manifest.files : [];

  const { ids: canonicalEmneIds, files: canonicalFiles, aliasIssues } = collectCanonicalEmneIds();

  const missingEmneIds = [];
  const duplicateEmneIdsPerPlace = [];
  const placeIdOccurrences = new Map();

  for (const rel of activeFiles) {
    const placeFilePath = path.join(root, 'data', rel);
    const places = toArray(readJson(placeFilePath));

    for (const place of places) {
      if (!place || typeof place !== 'object') continue;
      const placeId = typeof place.id === 'string' ? place.id.trim() : '';
      if (placeId) {
        if (!placeIdOccurrences.has(placeId)) placeIdOccurrences.set(placeId, []);
        placeIdOccurrences.get(placeId).push(formatRel(placeFilePath));
      }

      const emneIds = Array.isArray(place.emne_ids)
        ? place.emne_ids.filter((id) => typeof id === 'string' && id.trim()).map((id) => id.trim())
        : [];

      if (!emneIds.length) continue;

      const seen = new Set();
      const duplicates = new Set();

      for (const emneId of emneIds) {
        if (!canonicalEmneIds.has(emneId)) {
          missingEmneIds.push({
            file: formatRel(placeFilePath),
            place_id: placeId || '<missing-place-id>',
            emne_id: emneId
          });
        }

        if (seen.has(emneId)) duplicates.add(emneId);
        seen.add(emneId);
      }

      if (duplicates.size) {
        duplicateEmneIdsPerPlace.push({
          file: formatRel(placeFilePath),
          place_id: placeId || '<missing-place-id>',
          duplicate_emne_ids: [...duplicates].sort()
        });
      }
    }
  }

  const duplicatePlaceIds = [...placeIdOccurrences.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([placeId, files]) => ({ place_id: placeId, files: [...new Set(files)].sort() }))
    .sort((a, b) => a.place_id.localeCompare(b.place_id));

  console.log('=== Place emne_id validation ===');
  console.log(`Active place files: ${activeFiles.length}`);
  console.log(`Canonical emne files scanned: ${canonicalFiles.length}`);
  console.log(`Canonical emne ids loaded: ${canonicalEmneIds.size}`);
  console.log('');

  console.log(`Missing emne_ids: ${missingEmneIds.length}`);
  if (missingEmneIds.length) console.log(JSON.stringify(missingEmneIds, null, 2));
  console.log('');

  console.log(`Duplicate emne_ids within same place: ${duplicateEmneIdsPerPlace.length}`);
  if (duplicateEmneIdsPerPlace.length) console.log(JSON.stringify(duplicateEmneIdsPerPlace, null, 2));
  console.log('');

  console.log(`Duplicate place ids across active files: ${duplicatePlaceIds.length}`);
  if (duplicatePlaceIds.length) console.log(JSON.stringify(duplicatePlaceIds, null, 2));

  console.log('');
  console.log(`Canonical alias integrity issues: ${aliasIssues.length}`);
  if (aliasIssues.length) console.log(JSON.stringify(aliasIssues, null, 2));

  if (missingEmneIds.length || duplicateEmneIdsPerPlace.length || duplicatePlaceIds.length || aliasIssues.length) {
    process.exit(1);
  }
}

main();
