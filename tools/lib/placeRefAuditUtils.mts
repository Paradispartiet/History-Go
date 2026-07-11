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

function repoPath(root: string, filePath: string): string {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function listJsonFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listJsonFilesRecursive(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }

  return out;
}

export function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
}

export function toArray(data: unknown): JsonArray {
  if (Array.isArray(data)) return data;
  if (!isJsonObject(data)) return [];

  // A canonical single-record file can contain array-valued fields such as
  // `places`. Recognize the record itself before testing wrapper arrays, or a
  // person file is incorrectly flattened into its place-reference strings.
  if (typeof data.id === 'string' && data.id.trim()) return [data];

  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.people)) return data.people;
  if (Array.isArray(data.places)) return data.places;
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
  const seenFiles = new Set<string>();

  const addFromFile = (filePath: string) => {
    const rel = repoPath(root, filePath);
    if (seenFiles.has(rel) || !fs.existsSync(filePath)) return;
    seenFiles.add(rel);

    for (const row of toArray(readJson(filePath))) {
      if (isJsonObject(row) && typeof row.id === 'string' && row.id.trim()) placeIds.add(row.id.trim());
    }
  };

  for (const filePath of manifestFilesToPaths(root, placesManifestPath)) addFromFile(filePath);

  // Places are being migrated from monolithic manifest files into category and
  // per-place JSON files. Audits that validate people/place refs must accept real
  // committed place IDs even before every new file is wired into the legacy
  // manifest. Keep the manifest as the primary source, then scan data/places as a
  // transition-safe fallback.
  for (const filePath of listJsonFilesRecursive(path.join(root, 'data', 'places'))) addFromFile(filePath);

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
