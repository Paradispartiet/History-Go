import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');
const dataHubPath = path.join(root, 'js/dataHub.js');
const buildIndexPath = path.join(root, 'tools/build_places_index.mts');

function toPosix(value) {
  return value.replace(/\\/g, '/');
}

function splitManifestRelFor(rel) {
  return rel.replace(/\.json$/, '_manifest.json');
}

function isSplitManifest(data) {
  return Boolean(data && typeof data === 'object' && Array.isArray(data.places) && data.places.some((row) => row && typeof row === 'object' && typeof row.file === 'string'));
}

async function patchManifest() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.files)) throw new Error('data/places/manifest.json missing files[]');

  let replaced = 0;
  const files = [];
  for (const entry of manifest.files) {
    const rel = String(entry || '').trim();
    const splitRel = splitManifestRelFor(rel);
    const splitAbs = path.join(root, 'data', splitRel);
    if (splitRel !== rel && existsSync(splitAbs)) {
      const splitData = JSON.parse(await readFile(splitAbs, 'utf8'));
      if (isSplitManifest(splitData)) {
        files.push(splitRel);
        replaced += 1;
        continue;
      }
    }
    files.push(rel);
  }

  manifest.files = files;
  await writeFile(manifestPath, `${JSON.stringify(manifest)}\n`, 'utf8');
  return replaced;
}

async function patchBuildIndex() {
  let text = await readFile(buildIndexPath, 'utf8');

  if (!text.includes('type SplitPlaceManifest')) {
    text = text.replace(
      `type PlaceExclusions = JsonObject & {\n  disabledPlaceIds?: unknown[];\n};`,
      `type PlaceExclusions = JsonObject & {\n  disabledPlaceIds?: unknown[];\n};\ntype SplitPlaceManifestRow = JsonObject & {\n  file?: unknown;\n};\ntype SplitPlaceManifest = JsonObject & {\n  places?: unknown[];\n};`
    );
  }

  if (!text.includes('function placeRowsFromData')) {
    text = text.replace(
      `async function readJson(p: string): Promise<unknown> {\n  const raw = await fs.readFile(p, 'utf8');\n  return JSON.parse(raw) as unknown;\n}\n`,
      `async function readJson(p: string): Promise<unknown> {\n  const raw = await fs.readFile(p, 'utf8');\n  return JSON.parse(raw) as unknown;\n}\n\nfunction placeRowsFromData(data: unknown): PlaceRow[] {\n  if (Array.isArray(data)) return data.filter(isPlaceRow);\n  if (hasObjectType(data) && Array.isArray(data.places)) return data.places.filter(isPlaceRow);\n  if (isPlaceRow(data) && typeof data.id === 'string') return [data];\n  return [];\n}\n\nfunction isSplitPlaceManifest(value: unknown): value is SplitPlaceManifest {\n  return hasObjectType(value)\n    && Array.isArray(value.places)\n    && value.places.some((row) => hasObjectType(row) && typeof row.file === 'string' && row.file.trim().length > 0);\n}\n\nfunction splitManifestRowFile(row: unknown): string {\n  return hasObjectType(row) && typeof row.file === 'string' ? row.file.trim() : '';\n}\n\nasync function readPlaceRowsFromManifestEntry(sourceFile: string): Promise<Array<{ place: PlaceRow; sourceFile: string }>> {\n  const fullPath = path.join(ROOT, 'data', sourceFile);\n  const data = await readJson(fullPath);\n\n  if (isSplitPlaceManifest(data)) {\n    const dir = path.dirname(sourceFile);\n    const rows: Array<{ place: PlaceRow; sourceFile: string }> = [];\n    for (const manifestRow of data.places) {\n      const file = splitManifestRowFile(manifestRow);\n      if (!file) continue;\n      const childSourceFile = path.join(dir, file).replace(/\\\\/g, '/');\n      const childData = await readJson(path.join(ROOT, 'data', childSourceFile));\n      for (const place of placeRowsFromData(childData)) rows.push({ place, sourceFile: childSourceFile });\n    }\n    return rows;\n  }\n\n  return placeRowsFromData(data).map((place) => ({ place, sourceFile }));\n}\n`
    );
  }

  const oldLoop = `    const fullPath = path.join(ROOT, 'data', sourceFile);\n    const data = await readJson(fullPath);\n    const places = Array.isArray(data)\n      ? data\n      : (hasObjectType(data) && Array.isArray(data.places)\n        ? data.places\n        : (isPlaceRow(data) && typeof data.id === 'string' ? [data] : []));\n    for (const rawPlace of places) {\n      if (!isPlaceRow(rawPlace)) continue;\n      assertNoLegacyLng(rawPlace, sourceFile);\n      const place = applyCoordinateOverride(rawPlace, coordinateOverrides);`;
  const newLoop = `    const placeRows = await readPlaceRowsFromManifestEntry(sourceFile);\n    for (const { place: rawPlace, sourceFile: placeSourceFile } of placeRows) {\n      assertNoLegacyLng(rawPlace, placeSourceFile);\n      const place = applyCoordinateOverride(rawPlace, coordinateOverrides);`;
  if (text.includes(oldLoop)) text = text.replace(oldLoop, newLoop);
  text = text.replaceAll('pickLight(place, sourceFile)', 'pickLight(place, placeSourceFile)');

  await writeFile(buildIndexPath, text, 'utf8');
}

async function patchDataHub() {
  let text = await readFile(dataHubPath, 'utf8');

  const helperPattern = /function placesFromPlaceData\(data\) \{\n  if \(Array\.isArray\(data\)\) return data;\n  if \(Array\.isArray\(data\?\.places\)\) return data\.places;\n  if \(data && typeof data === "object" && !Array\.isArray\(data\) && typeof data\.id === "string"\) return \[data\];\n  return \[\];\n\}\n\n/g;
  const helperBlock = `function placesFromPlaceData(data) {\n  if (Array.isArray(data)) return data;\n  if (Array.isArray(data?.places) && !isSplitPlaceManifest(data)) return data.places;\n  if (data && typeof data === "object" && !Array.isArray(data) && typeof data.id === "string") return [data];\n  return [];\n}\n\nfunction isSplitPlaceManifest(data) {\n  return Boolean(data && typeof data === "object" && Array.isArray(data.places) && data.places.some((row) => row && typeof row === "object" && typeof row.file === "string"));\n}\n\nfunction joinManifestRelativeFile(manifestFile, childFile) {\n  const dir = String(manifestFile || "").split("/").slice(0, -1).join("/");\n  const child = String(childFile || "").trim().replace(/^\\.?\\//, "");\n  return dir ? `${dir}/${child}`.replace(/\\/+/g, "/") : child;\n}\n\nasync function loadPlaceEntriesFromManifestFile(file, opts = {}) {\n  const data = await fetchJSON(pData(file), opts);\n  if (isSplitPlaceManifest(data)) {\n    const entries = [];\n    for (const row of data.places) {\n      const childFile = joinManifestRelativeFile(file, row?.file);\n      if (!childFile) continue;\n      const childData = await fetchJSON(pData(childFile), opts);\n      for (const place of placesFromPlaceData(childData)) entries.push({ place, file: childFile });\n    }\n    return entries;\n  }\n  return placesFromPlaceData(data).map((place) => ({ place, file }));\n}\n\n`;
  text = text.replace(helperPattern, '');
  text = text.replace(/async function loadPlacesBase/, `${helperBlock}async function loadPlacesBase`);

  text = text.replace(
    `  for (const file of manifest.files) {\n    const data = await fetchJSON(pData(file), opts);\n    places.push(...placesFromPlaceData(data));\n  }`,
    `  for (const file of manifest.files) {\n    const entries = await loadPlaceEntriesFromManifestFile(file, opts);\n    places.push(...entries.map((entry) => entry.place));\n  }`
  );

  text = text.replace(
    `      for (const file of files) {\n        const data = await fetchJSON(pData(file), opts);\n        const places = placesFromPlaceData(data);\n        for (const p of places) {\n          const id = String(p?.id || "").trim();\n          if (id && !disabled.has(id) && !map.has(id)) map.set(id, file);\n        }\n      }`,
    `      for (const file of files) {\n        const entries = await loadPlaceEntriesFromManifestFile(file, opts);\n        for (const { place: p, file: sourceFile } of entries) {\n          const id = String(p?.id || "").trim();\n          if (id && !disabled.has(id) && !map.has(id)) map.set(id, sourceFile);\n        }\n      }`
  );

  text = text.replace(
    `    const data = await fetchJSON(pData(file), opts);\n    const places = placesFromPlaceData(data);\n    const fullPlace = places.find((p) => String(p?.id || "").trim() === id) || null;`,
    `    const entries = await loadPlaceEntriesFromManifestFile(file, opts);\n    const fullPlace = entries.map((entry) => entry.place).find((p) => String(p?.id || "").trim() === id) || null;`
  );

  await writeFile(dataHubPath, text, 'utf8');
}

const replaced = await patchManifest();
await patchBuildIndex();
await patchDataHub();

await mkdir(path.join(root, 'reports'), { recursive: true });
await writeFile(path.join(root, 'reports/use-split-place-manifests-report.json'), `${JSON.stringify({ status: 'ok', replaced_manifest_entries: replaced }, null, 2)}\n`, 'utf8');
console.log(`Replaced ${replaced} manifest entries with split manifests.`);
