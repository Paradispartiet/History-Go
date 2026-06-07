import fs from 'fs';
import path from 'path';

type JsonObject = Record<string, unknown>;
type JsonArray = unknown[];
type RefRow = {
  key: string;
  value: string;
};
type ManifestData = {
  files?: unknown;
};

export const PLACE_REF_KEYS = [
  'placeId',
  'place_id',
  'places',
  'placeIds',
  'place_ids',
  'related_places',
  'place',
];

function isJsonObject(data: unknown): data is JsonObject {
  return Boolean(data) && typeof data === 'object' && !Array.isArray(data);
}

export function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
}

export function toArray(data: unknown): JsonArray {
  if (Array.isArray(data)) return data;
  if (!isJsonObject(data)) return [];
  if (Array.isArray(data.places)) return data.places;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.people)) return data.people;
  return [];
}

export function manifestFilesToPaths(root: string, manifestFilePath: string): string[] {
  if (!fs.existsSync(manifestFilePath)) return [];
  const manifest = readJson(manifestFilePath) as ManifestData;
  if (!Array.isArray(manifest?.files)) return [];
  return manifest.files.map((relPath) => path.join(root, 'data', relPath as string));
}

export function buildActivePlaceIdSet(root: string, placesManifestPath: string): Set<string> {
  const placeIds = new Set<string>();
  const placeFiles = manifestFilesToPaths(root, placesManifestPath);
  for (const filePath of placeFiles) {
    if (!fs.existsSync(filePath)) continue;
    const rows = toArray(readJson(filePath));
    for (const row of rows) {
      if (isJsonObject(row) && typeof row.id === 'string' && row.id.trim()) placeIds.add(row.id.trim());
    }
  }
  return placeIds;
}

export function collectRefsByKeys(
  node: unknown,
  keys: readonly string[],
  currentPath = '',
  refs: RefRow[] = [],
): RefRow[] {
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectRefsByKeys(v, keys, `${currentPath}[${i}]`, refs));
    return refs;
  }
  if (!isJsonObject(node)) return refs;

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
