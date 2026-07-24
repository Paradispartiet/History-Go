import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataRoot = path.join(root, 'data');
const retiredId = 'ostensjovannet_sivbelte';
const parentId = 'ostensjovannet';
const reportRel = 'reports/oslo-coordinate-retire-ostensjovannet-sivbelte-post-195';
const reportDir = path.join(root, reportRel);
const placesManifestRel = 'data/places/manifest.json';
const exclusionsRel = 'data/places/place_exclusions.json';
const globalIndexRel = 'data/places/places_index.json';
const evidenceRel = 'data/coordinate-evidence/oslo/natur/ostensjovannet_sivbelte.json';
const evidenceManifestRel = 'data/coordinate-evidence/manifest.json';
const knownTargetSplitRel = 'data/places/natur/oslo/places_oslo_natur_ostensjovannet/ostensjovannet_sivbelte.json';
const knownParentSplitRel = 'data/places/natur/oslo/places_oslo_natur_hovedsteder/ostensjovannet.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const rel = (fullPath) => path.relative(root, fullPath).split(path.sep).join('/');
const exists = async (relativePath) => {
  try {
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
};
const readText = async (relativePath) => fs.readFile(path.join(root, relativePath), 'utf8');
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));
const writeJson = async (relativePath, value) => {
  await fs.mkdir(path.dirname(path.join(root, relativePath)), { recursive: true });
  await fs.writeFile(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const sha256File = async (relativePath) => crypto
  .createHash('sha256')
  .update(await fs.readFile(path.join(root, relativePath)))
  .digest('hex');
const asDataRel = (entry) => {
  const normalized = String(entry).trim().replaceAll('\\', '/');
  return normalized.startsWith('data/') ? normalized : `data/${normalized}`;
};
const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const placesFrom = (value) => {
  if (Array.isArray(value)) return value.filter(isObject);
  if (isObject(value) && Array.isArray(value.places)) return value.places.filter(isObject);
  if (isObject(value) && typeof value.id === 'string') return [value];
  return [];
};
const appendUnique = (values, additions) => [
  ...new Set([...(Array.isArray(values) ? values : []), ...additions]),
];

const walkJson = async (directory) => {
  const output = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walkJson(full));
    else if (entry.name.endsWith('.json')) output.push(full);
  }
  return output;
};

const identityFields = [
  'id',
  'placeId',
  'place_id',
  'historyGoPlaceId',
  'history_go_place_id',
  'targetId',
];
const hasRetiredIdentity = (value) => isObject(value) &&
  identityFields.some((field) => value[field] === retiredId);

const pruneRetiredReference = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== retiredId && !hasRetiredIdentity(item))
      .map(pruneRetiredReference);
  }
  if (!isObject(value)) return value;
  const output = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === retiredId || key === `map_${retiredId}`) continue;
    if (child === retiredId || hasRetiredIdentity(child)) continue;
    output[key] = pruneRetiredReference(child);
  }
  return output;
};

const pruneSourceButPreserveRetiredRecord = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => hasRetiredIdentity(item) ? item : pruneRetiredReference(item));
  }
  if (isObject(value) && Array.isArray(value.places)) {
    return {
      ...value,
      places: value.places.map((item) =>
        hasRetiredIdentity(item) ? item : pruneRetiredReference(item)),
    };
  }
  return value;
};

const replacePlace = (value, placeId, replacement) => {
  let replacements = 0;
  if (Array.isArray(value)) {
    return {
      value: value.map((item) => {
        if (isObject(item) && item.id === placeId) {
          replacements += 1;
          return replacement;
        }
        return item;
      }),
      replacements,
    };
  }
  if (isObject(value) && Array.isArray(value.places)) {
    return {
      value: {
        ...value,
        places: value.places.map((item) => {
          if (isObject(item) && item.id === placeId) {
            replacements += 1;
            return replacement;
          }
          return item;
        }),
      },
      replacements,
    };
  }
  if (isObject(value) && value.id === placeId) {
    return { value: replacement, replacements: 1 };
  }
  return { value, replacements: 0 };
};

const protocolBefore = await readText(protocolRel);
const protocolBatches = [...protocolBefore.matchAll(/^\|\s*(\d+)\s*\|/gm)]
  .map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...protocolBatches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocolBefore),
  'Batch 196 already exists; rerun this retirement from the new state.');

const audit = await readJson(
  'reports/oslo-coordinate-ostensjovannet-sivbelte-model-audit-post-195/summary.json',
);
assert(audit.placeId === retiredId, 'Model audit has the wrong place ID.');
assert(audit.parentId === parentId, 'Model audit has the wrong parent ID.');
assert(
  audit.decision === 'model_as_parent_habitat_retire_separate_marker',
  `Unexpected model decision: ${audit.decision}`,
);
assert(audit.canonicalChanged === false, 'Research audit unexpectedly changed canonical data.');
assert(audit.findings?.officialReedFeatureCount === 0,
  'An official reed geometry candidate now exists; automatic retirement must stop.');
assert(audit.findings?.officialExactFeatureCount === 0,
  'An exact official habitat feature now exists; automatic retirement must stop.');
assert(audit.findings?.kartverketOsloExactCandidates === 0,
  'An exact Kartverket candidate now exists; automatic retirement must stop.');
assert(audit.findings?.overpassExactNamedElements === 0,
  'An exact named contextual object now exists; automatic retirement must stop.');

const runtimeIndexBefore = await readJson(globalIndexRel);
const runtimePlacesBefore = placesFrom(runtimeIndexBefore);
assert(runtimePlacesBefore.some((place) => place.id === retiredId),
  'Separate sivbelte marker is already absent from runtime.');
assert(runtimePlacesBefore.some((place) => place.id === parentId),
  'Verified Østensjøvannet parent is absent from runtime.');

const placesManifest = await readJson(placesManifestRel);
const manifestFiles = (placesManifest.files ?? []).map(asDataRel);
const activeTargetSources = [];
const activeParentSources = [];
for (const sourceRel of manifestFiles) {
  if (!(await exists(sourceRel))) continue;
  let data;
  try {
    data = await readJson(sourceRel);
  } catch {
    continue;
  }
  const ids = new Set(placesFrom(data).map((place) => place.id));
  if (ids.has(retiredId)) activeTargetSources.push(sourceRel);
  if (ids.has(parentId)) activeParentSources.push(sourceRel);
}
assert(activeTargetSources.length >= 1,
  'No manifest-loaded source contains the sivbelte marker.');
assert(activeParentSources.length >= 1,
  'No manifest-loaded source contains Østensjøvannet.');
assert(await exists(knownParentSplitRel),
  'The authoritative Østensjøvannet split record is missing.');

const authoritativeParent = await readJson(knownParentSplitRel);
assert(authoritativeParent.id === parentId,
  'The authoritative Østensjøvannet split record has the wrong ID.');
assert(authoritativeParent.coordStatus === 'verified_geometry',
  'The authoritative Østensjøvannet record is not verified geometry.');
const authoritativeNatureText = JSON.stringify(authoritativeParent.nature_profile ?? {});
assert(
  authoritativeNatureText.includes('sivbelter') ||
    JSON.stringify(authoritativeParent).includes('sivbeltene'),
  'The authoritative Østensjøvannet record no longer preserves sivbelte knowledge.',
);
const lockedParentCoordinate = {
  lat: authoritativeParent.lat,
  lon: authoritativeParent.lon,
  r: authoritativeParent.r,
};

const migratedParent = {
  ...authoritativeParent,
  sourceHint: 'Hovedpunktet representerer hele Østensjøvannet naturreservat med Miljødirektoratets offisielle vernegeometri. Delankrene bygges kun fra verifiserte konkrete komponenter: Vadedammen, fugleskjulet på vestsiden, Bølerbekkens utløp og Bogerudmyra. Det generiske sivbelte-recordet er deaktivert som separat kartsted; sivbelter og våtmarkskanter formidles i hovedstedets naturprofil.',
  rounds: appendUnique(authoritativeParent.rounds, ['nature', 'leksikon', 'routes']),
  routeId: 'ostensjovannet_vatmark',
};
assert(migratedParent.coordStatus === 'verified_geometry',
  'Parent verification status changed.');
assert(
  migratedParent.lat === lockedParentCoordinate.lat &&
    migratedParent.lon === lockedParentCoordinate.lon &&
    migratedParent.r === lockedParentCoordinate.r,
  'Parent coordinate changed.',
);

const modified = new Set();
const writeIfChanged = async (relativePath, before, after) => {
  if (JSON.stringify(before) === JSON.stringify(after)) return false;
  await writeJson(relativePath, after);
  modified.add(relativePath);
  return true;
};

const parentPaths = new Set();
for (const sourceRel of activeParentSources) {
  const before = await readJson(sourceRel);
  const pruned = pruneRetiredReference(before);
  const replaced = replacePlace(pruned, parentId, migratedParent);
  assert(replaced.replacements >= 1, `Parent disappeared from ${sourceRel}.`);
  await writeIfChanged(sourceRel, before, replaced.value);
  parentPaths.add(sourceRel);
}
{
  const before = await readJson(knownParentSplitRel);
  const replaced = replacePlace(before, parentId, migratedParent);
  assert(replaced.replacements === 1,
    'Known Østensjøvannet split file has the wrong shape.');
  await writeIfChanged(knownParentSplitRel, before, replaced.value);
  parentPaths.add(knownParentSplitRel);
}

const exclusions = await readJson(exclusionsRel);
assert(Array.isArray(exclusions.disabledPlaceIds),
  'place_exclusions.json has no disabledPlaceIds array.');
assert(!exclusions.disabledPlaceIds.includes(retiredId),
  'Separate sivbelte marker is already disabled.');
exclusions.disabledPlaceIds.push(retiredId);
exclusions.reason = 'Hybrid-/akse-/vegg-/undergang-/passasje-objekter, pensjonerte duplikatposter og tematiske eller skiftende habitatlokaliteter uten publiserbar egen geometri skal ikke være aktive History Go-steder. Kildedata kan beholdes for historikk eller migrering, men ID-ene filtreres ut av aktiv place-index og runtime.';
await writeJson(exclusionsRel, exclusions);
modified.add(exclusionsRel);

const allDataJson = await walkJson(dataRoot);
const targetSourcePaths = new Set(activeTargetSources);
if (await exists(knownTargetSplitRel)) targetSourcePaths.add(knownTargetSplitRel);
const targetSplitMetadataPaths = new Set();
for (const fullPath of allDataJson) {
  const relativePath = rel(fullPath);
  if (!relativePath.startsWith('data/places/') ||
      !relativePath.endsWith('_manifest.json')) continue;
  let manifest;
  try {
    manifest = JSON.parse(await fs.readFile(fullPath, 'utf8'));
  } catch {
    continue;
  }
  const row = Array.isArray(manifest.places)
    ? manifest.places.find((item) => item?.id === retiredId)
    : null;
  if (!row) continue;
  targetSplitMetadataPaths.add(relativePath);
  if (typeof row.file === 'string') {
    targetSourcePaths.add(rel(path.join(path.dirname(fullPath), row.file)));
  }
  const indexRel = relativePath.replace(/_manifest\.json$/, '_index.json');
  if (await exists(indexRel)) targetSplitMetadataPaths.add(indexRel);
}

for (const sourceRel of targetSourcePaths) {
  if (!(await exists(sourceRel))) continue;
  const before = await readJson(sourceRel);
  const after = pruneSourceButPreserveRetiredRecord(before);
  await writeIfChanged(sourceRel, before, after);
}

const protectedReferences = new Set([
  ...targetSourcePaths,
  ...targetSplitMetadataPaths,
  exclusionsRel,
  evidenceRel,
  evidenceManifestRel,
  globalIndexRel,
  placesManifestRel,
  ...parentPaths,
]);
const derivativeFilesChanged = [];
for (const fullPath of allDataJson) {
  const relativePath = rel(fullPath);
  if (protectedReferences.has(relativePath)) continue;
  const text = await fs.readFile(fullPath, 'utf8');
  if (!text.includes(`"${retiredId}"`)) continue;
  let before;
  try {
    before = JSON.parse(text);
  } catch {
    continue;
  }
  const after = pruneRetiredReference(before);
  if (await writeIfChanged(relativePath, before, after)) {
    derivativeFilesChanged.push(relativePath);
  }
}

const refreshManifest = async (manifestRel) => {
  const manifest = await readJson(manifestRel);
  if (!isObject(manifest) || !Array.isArray(manifest.places)) return false;
  const baseDir = path.dirname(manifestRel);
  const sourceRel = manifest.source_path
    ? asDataRel(manifest.source_path)
    : path.join(baseDir, String(manifest.source_file ?? '')).replaceAll('\\', '/');
  const childPaths = manifest.places
    .filter((row) => typeof row.file === 'string')
    .map((row) => path.join(baseDir, row.file).replaceAll('\\', '/'));
  const touchesManifest = modified.has(sourceRel) ||
    childPaths.some((childRel) => modified.has(childRel));
  if (!touchesManifest) return false;
  if (await exists(sourceRel)) manifest.source_sha256 = await sha256File(sourceRel);
  manifest.generated_at = new Date().toISOString();
  manifest.place_count = manifest.places.length;
  for (const row of manifest.places) {
    if (typeof row.file !== 'string') continue;
    const childRel = path.join(baseDir, row.file).replaceAll('\\', '/');
    if (await exists(childRel)) row.sha256 = await sha256File(childRel);
  }
  await writeJson(manifestRel, manifest);
  modified.add(manifestRel);
  return true;
};
for (const fullPath of allDataJson) {
  const relativePath = rel(fullPath);
  if (relativePath.startsWith('data/places/') &&
      relativePath.endsWith('_manifest.json')) {
    await refreshManifest(relativePath);
  }
}

const protocolRow = `| \`${retiredId}\` | Separat kartmarkør avviklet; sivbelteinnholdet ligger i \`${parentId}\` | \`reports/oslo-coordinate-ostensjovannet-sivbelte-model-audit-post-195/summary.json\` | Verifisert reservatanker og konkrete kildebelagte delankre beholdes; vilkårlig sivbelte-midpunkt publiseres ikke |`;
assert(!protocolBefore.includes(protocolRow),
  'Protocol already contains the sivbelte retirement row.');
await fs.writeFile(
  path.join(root, protocolRel),
  `${protocolBefore.trimEnd()}\n${protocolRow}\n`,
  'utf8',
);
modified.add(protocolRel);

const parentAfterRecords = [];
for (const sourceRel of activeParentSources) {
  const data = await readJson(sourceRel);
  parentAfterRecords.push(...placesFrom(data).filter((place) => place.id === parentId));
}
assert(parentAfterRecords.length >= 1,
  'Migrated parent disappeared from active sources.');
for (const parentAfter of parentAfterRecords) {
  assert(parentAfter.coordStatus === 'verified_geometry',
    'Parent lost verified status.');
  assert(
    parentAfter.lat === lockedParentCoordinate.lat &&
      parentAfter.lon === lockedParentCoordinate.lon &&
      parentAfter.r === lockedParentCoordinate.r,
    'Parent coordinate changed.',
  );
  assert(parentAfter.routeId === 'ostensjovannet_vatmark',
    'Wetland route was not attached to the parent.');
  assert(!JSON.stringify(parentAfter).includes(retiredId),
    'Parent still references the disabled marker ID.');
}
assert((await readJson(exclusionsRel)).disabledPlaceIds.includes(retiredId),
  'Disabled marker ID was not persisted.');
assert(await exists(evidenceRel),
  'Coordinate evidence was deleted; source history must be preserved.');
assert(await exists(knownTargetSplitRel),
  'Source-led sivbelte record was deleted; it must remain as disabled history.');

const allowedReferencePaths = new Set([
  ...targetSourcePaths,
  ...targetSplitMetadataPaths,
  exclusionsRel,
  evidenceRel,
  evidenceManifestRel,
  globalIndexRel,
]);
const remainingUnexpectedReferences = [];
const generatedReferencesPendingRebuild = [];
for (const fullPath of await walkJson(dataRoot)) {
  const relativePath = rel(fullPath);
  const text = await fs.readFile(fullPath, 'utf8');
  if (!text.includes(`"${retiredId}"`)) continue;
  if (relativePath === globalIndexRel) {
    generatedReferencesPendingRebuild.push(relativePath);
  } else if (!allowedReferencePaths.has(relativePath)) {
    remainingUnexpectedReferences.push(relativePath);
  }
}
assert(
  remainingUnexpectedReferences.length === 0,
  `Disabled marker remains in active derivative JSON: ${remainingUnexpectedReferences.join(', ')}`,
);

await fs.mkdir(reportDir, { recursive: true });
const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  placeId: retiredId,
  parentId,
  decision: 'disabled_separate_marker_preserved_in_verified_parent',
  canonicalChanged: true,
  coordinatePromoted: false,
  sourceRecordPreserved: true,
  coordinateEvidencePreserved: true,
  parentCoordinateChanged: false,
  reason: 'No official or named public geometry supports a separate changing sivbelte marker. The source record is disabled for audit history, while the verified Østensjøvannet parent continues to carry the complete reed-belt and wetland-edge learning model.',
  sourceAudit: 'reports/oslo-coordinate-ostensjovannet-sivbelte-model-audit-post-195/summary.json',
  activeTargetSources,
  activeParentSources,
  authoritativeParentSource: knownParentSplitRel,
  targetSourcePaths: [...targetSourcePaths].sort(),
  derivativeFilesChanged: derivativeFilesChanged.sort(),
  modifiedFiles: [...modified].sort(),
  remainingUnexpectedReferences,
  generatedReferencesPendingRebuild,
  queueStatus: 'post_195_unresolved_queue_complete',
  nextQueueCandidate: null,
};
await fs.writeFile(
  path.join(reportDir, 'summary.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
  'utf8',
);
await fs.writeFile(
  path.join(reportDir, 'README.md'),
  `# Retire Østensjøvannet sivbelte marker after batch 195\n\n- Disabled marker: **\`${retiredId}\`**\n- Verified parent: **\`${parentId}\`**\n- Coordinate promoted: **no**\n- Source record preserved: **yes**\n- Coordinate evidence preserved: **yes**\n- Parent coordinate changed: **no**\n- Unexpected active derivative references: **${remainingUnexpectedReferences.length}**\n- Queue status: **post-195 unresolved queue complete**\n\nThe separate legacy marker is filtered from runtime. Sivbelter and wetland edges remain part of the verified Østensjøvannet habitat model, while concrete child stops are limited to independently verifiable public geometry.\n`,
  'utf8',
);

console.log(JSON.stringify({
  status: 'parent_habitat_migration_applied',
  reportDir: reportRel,
  placeId: retiredId,
  parentId,
  authoritativeParentSource: knownParentSplitRel,
  derivativeFilesChanged: derivativeFilesChanged.length,
  modifiedFiles: modified.size,
  remainingUnexpectedReferences: remainingUnexpectedReferences.length,
  generatedReferencesPendingRebuild: generatedReferencesPendingRebuild.length,
  queueStatus: 'post_195_unresolved_queue_complete',
  nextQueueCandidate: null,
}, null, 2));
