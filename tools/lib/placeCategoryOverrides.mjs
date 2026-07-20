import { promises as fs } from 'node:fs';
import path from 'node:path';

const CATEGORY_ID_PATTERN = /^[a-z0-9_]+$/;

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

async function readJsonIfExists(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return null;
    throw error;
  }
}

function parseOverrideRows(data, sourceFile) {
  if (data === null) return [];
  if (!Array.isArray(data)) {
    throw new Error(`[category-overrides] ${sourceFile}: expected a JSON array.`);
  }

  const seenIds = new Set();
  return data.map((raw, index) => {
    if (!isObject(raw)) {
      throw new Error(`[category-overrides] ${sourceFile}[${index}]: expected an object.`);
    }

    const id = String(raw.id || '').trim();
    const category = String(raw.category || '').trim();

    if (!id) {
      throw new Error(`[category-overrides] ${sourceFile}[${index}]: missing non-empty id.`);
    }
    if (!category || !CATEGORY_ID_PATTERN.test(category)) {
      throw new Error(`[category-overrides] ${sourceFile}#${id}: invalid category id "${category}".`);
    }
    if (seenIds.has(id)) {
      throw new Error(`[category-overrides] ${sourceFile}: duplicate place id "${id}" in the same override layer.`);
    }
    seenIds.add(id);

    return { id, category, sourceFile };
  });
}

function resolveBatchPath(overridesDir, rawEntry) {
  const entry = String(rawEntry || '').trim();
  if (!entry) {
    throw new Error('[category-overrides] index.json contains an empty file entry.');
  }
  if (path.isAbsolute(entry)) {
    throw new Error(`[category-overrides] index.json contains an absolute path: ${entry}`);
  }

  const resolved = path.resolve(overridesDir, entry);
  const relative = path.relative(overridesDir, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`[category-overrides] index.json file escapes category_overrides/: ${entry}`);
  }
  return resolved;
}

export async function readCategoryOverrides(root = process.cwd()) {
  const placesDir = path.join(root, 'data/places');
  const basePath = path.join(placesDir, 'category_overrides.json');
  const overridesDir = path.join(placesDir, 'category_overrides');
  const manifestPath = path.join(overridesDir, 'index.json');

  const layers = [];
  const baseData = await readJsonIfExists(basePath);
  layers.push(...parseOverrideRows(baseData, path.relative(root, basePath)));

  const manifest = await readJsonIfExists(manifestPath);
  if (manifest !== null) {
    if (!isObject(manifest) || !Array.isArray(manifest.files)) {
      throw new Error(`[category-overrides] ${path.relative(root, manifestPath)}: expected an object with a files array.`);
    }

    const seenManifestFiles = new Set();
    for (const rawEntry of manifest.files) {
      const entry = String(rawEntry || '').trim();
      if (seenManifestFiles.has(entry)) {
        throw new Error(`[category-overrides] ${path.relative(root, manifestPath)}: duplicate file entry "${entry}".`);
      }
      seenManifestFiles.add(entry);

      const batchPath = resolveBatchPath(overridesDir, entry);
      const batchData = await readJsonIfExists(batchPath);
      if (batchData === null) {
        throw new Error(`[category-overrides] manifest file not found: ${path.relative(root, batchPath)}`);
      }
      layers.push(...parseOverrideRows(batchData, path.relative(root, batchPath)));
    }
  }

  // Base layer is applied first. Later manifest batches deliberately win for the same place id.
  return new Map(layers.map((override) => [override.id, override]));
}

export function applyCategoryOverride(place, overrides) {
  if (!isObject(place) || !(overrides instanceof Map)) return place;
  const id = String(place.id || '').trim();
  const override = id ? overrides.get(id) : null;
  if (!override || place.category === override.category) return place;
  return { ...place, category: override.category };
}
