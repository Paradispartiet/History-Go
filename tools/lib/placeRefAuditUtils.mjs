import fs from 'fs';
import path from 'path';

export const PLACE_REF_KEYS = [
  'placeId',
  'place_id',
  'places',
  'placeIds',
  'place_ids',
  'related_places',
  'place',
];

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function toArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.people)) return data.people;
  return [];
}

export function manifestFilesToPaths(root, manifestFilePath) {
  if (!fs.existsSync(manifestFilePath)) return [];
  const manifest = readJson(manifestFilePath);
  if (!Array.isArray(manifest?.files)) return [];
  return manifest.files.map((relPath) => path.join(root, 'data', relPath));
}

export function buildActivePlaceIdSet(root, placesManifestPath) {
  const placeIds = new Set();
  const placeFiles = manifestFilesToPaths(root, placesManifestPath);
  for (const filePath of placeFiles) {
    if (!fs.existsSync(filePath)) continue;
    const rows = toArray(readJson(filePath));
    for (const row of rows) {
      if (typeof row?.id === 'string' && row.id.trim()) placeIds.add(row.id.trim());
    }
  }
  return placeIds;
}

export function collectRefsByKeys(node, keys, currentPath = '', refs = []) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectRefsByKeys(v, keys, `${currentPath}[${i}]`, refs));
    return refs;
  }
  if (!node || typeof node !== 'object') return refs;

  for (const [k, v] of Object.entries(node)) {
    const nextPath = currentPath ? `${currentPath}.${k}` : k;
    if (keys.includes(k)) {
      if (typeof v === 'string') refs.push({ key: nextPath, value: v });
      if (Array.isArray(v)) {
        for (const [i, item] of v.entries()) {
          if (typeof item === 'string') refs.push({ key: `${nextPath}[${i}]`, value: item });
        }
      }
    }
    collectRefsByKeys(v, keys, nextPath, refs);
  }
  return refs;
}
