import fs from 'fs';
import path from 'path';

type JsonObject = Record<string, unknown>;
type PlaceRow = JsonObject & {
  id?: unknown;
  emne_ids?: unknown;
};
type EmneRow = JsonObject & {
  id?: unknown;
  emne_id?: unknown;
};
type MissingEmneIdRow = {
  file: string;
  place_id: string;
  emne_id: string;
};
type DuplicateEmneIdsPerPlaceRow = {
  file: string;
  place_id: string;
  duplicate_emne_ids: string[];
};
type DuplicatePlaceIdsAcrossFilesRow = {
  place_id: string;
  files: string[];
};
type DuplicatePlaceIdsWithinFileRow = {
  place_id: string;
  file: string;
  count: number;
};
type DuplicateCanonicalEmneIdRow = {
  emne_id: string;
  files: string[];
};
type CollectCanonicalEmneIdsResult = {
  ids: Set<string>;
  files: string[];
  duplicateCanonicalEmneIds: DuplicateCanonicalEmneIdRow[];
};

const root = process.cwd();

function isJsonObject(data: unknown): data is JsonObject {
  return Boolean(data) && typeof data === 'object' && !Array.isArray(data);
}

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toArray(data: unknown): JsonObject[] {
  if (Array.isArray(data)) return data.filter(isJsonObject);
  if (isJsonObject(data) && Array.isArray(data.places)) return data.places.filter(isJsonObject);
  if (isJsonObject(data) && Array.isArray(data.items)) return data.items.filter(isJsonObject);
  if (isJsonObject(data) && typeof data.id === 'string' && data.id.trim()) return [data];
  return [];
}

function formatRel(filePath: string): string {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function collectActiveEmneFiles(): string[] {
  const fagRoot = path.join(root, 'data', 'fag');
  const manifestPath = path.join(fagRoot, 'fag_manifest.json');
  const manifest = readJson(manifestPath);

  if (!isJsonObject(manifest)) {
    throw new Error(`${formatRel(manifestPath)} must contain a subject object`);
  }

  const relativeFiles = new Set<string>();

  function collectFromEntry(entry: unknown): void {
    if (!isJsonObject(entry)) return;

    if (typeof entry.emner === 'string' && entry.emner.trim()) {
      relativeFiles.add(entry.emner.trim());
    }

    if (isJsonObject(entry.specializations)) {
      for (const specialization of Object.values(entry.specializations)) {
        collectFromEntry(specialization);
      }
    }
  }

  for (const subject of Object.values(manifest)) {
    collectFromEntry(subject);
  }

  const files = [...relativeFiles]
    .map((relativeFile) => path.join(fagRoot, relativeFile))
    .sort((a, b) => a.localeCompare(b));

  const missingFiles = files.filter((file) => !fs.existsSync(file));
  if (missingFiles.length) {
    throw new Error(
      `Active emne file(s) missing from fag manifest: ${missingFiles.map(formatRel).join(', ')}`
    );
  }

  return files;
}

function collectCanonicalEmneIds(): CollectCanonicalEmneIdsResult {
  const files = collectActiveEmneFiles();
  const ids = new Set<string>();
  const idFiles = new Map<string, Set<string>>();

  for (const file of files) {
    const data = readJson(file);
    const entries: EmneRow[] = toArray(data);
    for (const item of entries) {
      const rawId = typeof item.id === 'string'
        ? item.id
        : (typeof item.emne_id === 'string' ? item.emne_id : '');
      const id = rawId.trim();
      if (!id) continue;
      ids.add(id);
      if (!idFiles.has(id)) idFiles.set(id, new Set<string>());
      idFiles.get(id)?.add(formatRel(file));
    }
  }

  const duplicateCanonicalEmneIds: DuplicateCanonicalEmneIdRow[] = [...idFiles.entries()]
    .filter(([, idFileSet]) => idFileSet.size >= 2)
    .map(([emneId, idFileSet]) => ({ emne_id: emneId, files: [...idFileSet].sort() }))
    .sort((a, b) => a.emne_id.localeCompare(b.emne_id));

  return { ids, files, duplicateCanonicalEmneIds };
}

function main(): void {
  const manifestPath = path.join(root, 'data/places/manifest.json');
  const manifest = readJson(manifestPath);
  const activeFiles = isJsonObject(manifest) && Array.isArray(manifest.files)
    ? (manifest.files as string[])
    : [];

  const { ids: canonicalEmneIds, files: canonicalFiles, duplicateCanonicalEmneIds } = collectCanonicalEmneIds();

  const missingEmneIds: MissingEmneIdRow[] = [];
  const duplicateEmneIdsPerPlace: DuplicateEmneIdsPerPlaceRow[] = [];
  const placeIdOccurrences = new Map<string, string[]>();

  for (const rel of activeFiles) {
    const placeFilePath = path.join(root, 'data', rel);
    const places: PlaceRow[] = toArray(readJson(placeFilePath));

    for (const place of places) {
      const placeId = typeof place.id === 'string' ? place.id.trim() : '';
      if (placeId) {
        if (!placeIdOccurrences.has(placeId)) placeIdOccurrences.set(placeId, []);
        placeIdOccurrences.get(placeId)?.push(formatRel(placeFilePath));
      }

      const emneIds = Array.isArray(place.emne_ids)
        ? place.emne_ids
            .filter((id): id is string => typeof id === 'string' && Boolean(id.trim()))
            .map((id) => id.trim())
        : [];

      if (!emneIds.length) continue;

      const seen = new Set<string>();
      const duplicates = new Set<string>();

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

  const duplicatePlaceIdsWithinFile: DuplicatePlaceIdsWithinFileRow[] = [];
  const duplicatePlaceIds: DuplicatePlaceIdsAcrossFilesRow[] = [...placeIdOccurrences.entries()]
    .map(([placeId, files]) => {
      const fileCounts = new Map<string, number>();
      for (const file of files) fileCounts.set(file, (fileCounts.get(file) || 0) + 1);
      for (const [file, count] of fileCounts.entries()) {
        if (count > 1) duplicatePlaceIdsWithinFile.push({ place_id: placeId, file, count });
      }
      return { place_id: placeId, files: [...fileCounts.keys()].sort() };
    })
    .filter(({ files }) => files.length >= 2)
    .sort((a, b) => a.place_id.localeCompare(b.place_id));
  duplicatePlaceIdsWithinFile.sort((a, b) => a.place_id.localeCompare(b.place_id) || a.file.localeCompare(b.file));

  console.log('=== Place emne_id validation ===');
  console.log(`Active place files: ${activeFiles.length}`);
  console.log(`Active manifest emne files scanned: ${canonicalFiles.length}`);
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

  console.log(`Duplicate place ids within same active file: ${duplicatePlaceIdsWithinFile.length}`);
  if (duplicatePlaceIdsWithinFile.length) console.log(JSON.stringify(duplicatePlaceIdsWithinFile, null, 2));
  console.log('');

  console.log(`Duplicate canonical emne_ids across active manifest files: ${duplicateCanonicalEmneIds.length}`);
  if (duplicateCanonicalEmneIds.length) console.log(JSON.stringify(duplicateCanonicalEmneIds, null, 2));

  if (
    missingEmneIds.length ||
    duplicateEmneIdsPerPlace.length ||
    duplicatePlaceIds.length ||
    duplicatePlaceIdsWithinFile.length ||
    duplicateCanonicalEmneIds.length
  ) {
    process.exit(1);
  }
}

main();
