import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-23';
const BATCH = 191;
const LEGACY_ID = 'akerselva_industri';
const CANONICAL_ID = 'akerselva';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-191-akerselva-industri-thematic-migration';

const LEGACY_AGGREGATE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const LEGACY_SPLIT = 'data/places/naeringsliv/oslo/places_naeringsliv/akerselva_industri.json';
const LEGACY_SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const LEGACY_SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const LEGACY_EVIDENCE = 'data/coordinate-evidence/oslo/naeringsliv/akerselva_industri.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const LEGACY_EVIDENCE_ENTRY = 'oslo/naeringsliv/akerselva_industri.json';

const CANONICAL_CHILD = 'data/places/by/oslo/places/akerselva.json';
const CANONICAL_AGGREGATE = 'data/places/by/oslo/places_by.json';
const CANONICAL_MANIFEST = 'data/places/by/oslo/places_by_manifest.json';
const CANONICAL_INDEX = 'data/places/by/oslo/places_by_index.json';
const CANONICAL_SOURCE_ID = 'oslo-kommune:river:akerselva';

const CIVICATION = 'data/Civication/map/historyGoPlaceMapping.naeringsliv.json';
const ALIAS_TOOL = 'tools/check_place_id_aliases.mts';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const AUDIT_REPORT = 'reports/oslo-coordinate-akerselva-industri-model-audit-post-190/summary.json';
const GENERATED_INDEX = 'data/places/places_index.json';

mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const unique = (items) => [...new Set(items)];

function grepExactQuoted(id, scope = 'data') {
  const result = spawnSync('git', ['grep', '-n', '-F', `"${id}"`, '--', scope], { encoding: 'utf8' });
  if (![0, 1].includes(result.status)) throw new Error(`git grep failed for ${id}: ${result.stderr}`);
  return String(result.stdout || '').trim().split('\n').filter(Boolean);
}

function grepFilesExactQuoted(id) {
  const result = spawnSync('git', ['grep', '-l', '-F', `"${id}"`, '--', 'data'], { encoding: 'utf8' });
  if (![0, 1].includes(result.status)) throw new Error(`git grep -l failed for ${id}: ${result.stderr}`);
  return String(result.stdout || '').trim().split('\n').filter(Boolean);
}

function transformLegacyId(value, stats, path = []) {
  if (typeof value === 'string') {
    if (value === LEGACY_ID) {
      stats.valueReplacements += 1;
      return CANONICAL_ID;
    }
    return value;
  }
  if (Array.isArray(value)) {
    const transformed = value.map((item, index) => transformLegacyId(item, stats, [...path, index]));
    if (transformed.every((item) => typeof item === 'string')) return unique(transformed);
    return transformed;
  }
  if (!value || typeof value !== 'object') return value;

  const result = {};
  const entries = Object.entries(value).sort(([a], [b]) => Number(a === LEGACY_ID) - Number(b === LEGACY_ID));
  for (const [key, child] of entries) {
    const newKey = key === LEGACY_ID ? CANONICAL_ID : key;
    const transformed = transformLegacyId(child, stats, [...path, newKey]);
    if (key === LEGACY_ID) stats.keyReplacements += 1;
    if (Object.prototype.hasOwnProperty.call(result, newKey)) {
      stats.keyCollisions.push(path.concat(newKey).join('.'));
      if (key === LEGACY_ID) continue;
    }
    result[newKey] = transformed;
  }
  return result;
}

function countMappings(root, placeId) {
  let count = 0;
  const visit = (value) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    if (value.historyGoPlaceId === placeId) count += 1;
    Object.values(value).forEach(visit);
  };
  visit(root);
  return count;
}

function removeMappings(root, placeId, stats) {
  if (Array.isArray(root)) {
    const kept = [];
    for (const item of root) {
      if (item && typeof item === 'object' && item.historyGoPlaceId === placeId) {
        stats.removed += 1;
        continue;
      }
      kept.push(removeMappings(item, placeId, stats));
    }
    return kept;
  }
  if (!root || typeof root !== 'object') return root;
  for (const key of Object.keys(root)) {
    const child = root[key];
    if (child && typeof child === 'object' && !Array.isArray(child) && child.historyGoPlaceId === placeId) {
      delete root[key];
      stats.removed += 1;
    } else {
      root[key] = removeMappings(child, placeId, stats);
    }
  }
  return root;
}

let protocol = readFileSync(PROTOCOL, 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((m) => Number(m[1])));
if (maxBatch !== 190) throw new Error(`Expected coordinate max batch 190, got ${maxBatch}`);

const audit = readJson(AUDIT_REPORT);
if (audit.runtime?.canonical?.id !== CANONICAL_ID || audit.runtime?.legacy?.id !== LEGACY_ID) throw new Error('Merged model audit does not describe the expected two records');
if (!String(audit.conclusion || '').startsWith('Prefer thematic migration/retirement')) throw new Error(`Merged audit does not authorize thematic migration: ${audit.conclusion}`);

const preRefs = grepExactQuoted(LEGACY_ID);
if (preRefs.length !== 97) throw new Error(`Expected 97 exact legacy reference lines from merged audit, got ${preRefs.length}`);

const canonicalChild = readJson(CANONICAL_CHILD);
if (canonicalChild.id !== CANONICAL_ID || canonicalChild.coordStatus !== 'verified_geometry' || canonicalChild.sourceObjectId !== CANONICAL_SOURCE_ID) {
  throw new Error('Canonical Akerselva no longer matches the verified geometry lock');
}
if (!Array.isArray(canonicalChild.anchors) || canonicalChild.anchors.length < 3) throw new Error('Canonical Akerselva no longer has the expected multi-anchor route model');

const legacyAggregate = readJson(LEGACY_AGGREGATE);
if (!Array.isArray(legacyAggregate)) throw new Error(`${LEGACY_AGGREGATE} is not an array`);
const legacyMatches = legacyAggregate.filter((place) => place?.id === LEGACY_ID);
if (legacyMatches.length !== 1) throw new Error(`Expected one ${LEGACY_ID}, got ${legacyMatches.length}`);
const legacyPlace = legacyMatches[0];
if (legacyPlace.coordStatus || legacyPlace.sourceObjectId || legacyPlace.locatorType) throw new Error('Legacy industrial corridor unexpectedly has coordinate contract metadata');

const legacyEvidence = readJson(LEGACY_EVIDENCE);
if (legacyEvidence.placeId !== LEGACY_ID || legacyEvidence.coordinateDecision !== 'needs_geometry') throw new Error('Unexpected legacy Akerselva industry evidence state');
if (!String(legacyEvidence.identity?.identityProblem || '').includes('overlapper canonical `akerselva`')) throw new Error('Legacy evidence no longer records the canonical overlap');

// Enrich the one physical canonical Akerselva with the business/industry topic classification from the retired proxy.
const mergedCanonical = {
  ...canonicalChild,
  emne_ids: unique([...(canonicalChild.emne_ids || []), ...(legacyPlace.emne_ids || [])]),
  underbadge_ids: unique([...(canonicalChild.underbadge_ids || []), ...(legacyPlace.underbadge_ids || [])])
};
writeJson(CANONICAL_CHILD, mergedCanonical);

const canonicalAggregate = readJson(CANONICAL_AGGREGATE);
if (!Array.isArray(canonicalAggregate) || canonicalAggregate.filter((place) => place?.id === CANONICAL_ID).length !== 1) throw new Error('Unexpected canonical Akerselva aggregate state');
writeJson(CANONICAL_AGGREGATE, canonicalAggregate.map((place) => place?.id === CANONICAL_ID ? mergedCanonical : place));

// Retire the duplicate business place and its coordinate-evidence record.
writeJson(LEGACY_AGGREGATE, legacyAggregate.filter((place) => place?.id !== LEGACY_ID));
if (!existsSync(LEGACY_SPLIT)) throw new Error(`Missing legacy split file ${LEGACY_SPLIT}`);
rmSync(LEGACY_SPLIT);
if (!existsSync(LEGACY_EVIDENCE)) throw new Error(`Missing legacy evidence ${LEGACY_EVIDENCE}`);
rmSync(LEGACY_EVIDENCE);

const legacyManifest = readJson(LEGACY_SPLIT_MANIFEST);
if (!Array.isArray(legacyManifest.places) || legacyManifest.places.filter((row) => row?.id === LEGACY_ID).length !== 1) throw new Error('Unexpected legacy split-manifest state');
legacyManifest.places = legacyManifest.places.filter((row) => row?.id !== LEGACY_ID).map((row, order) => ({ ...row, order }));
legacyManifest.place_count = legacyManifest.places.length;
writeJson(LEGACY_SPLIT_MANIFEST, legacyManifest);

const legacyIndex = readJson(LEGACY_SPLIT_INDEX);
if (!Array.isArray(legacyIndex) || legacyIndex.filter((place) => place?.id === LEGACY_ID).length !== 1) throw new Error('Unexpected legacy split-index state');
writeJson(LEGACY_SPLIT_INDEX, legacyIndex.filter((place) => place?.id !== LEGACY_ID));

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (!Array.isArray(evidenceManifest.files) || !evidenceManifest.files.includes(LEGACY_EVIDENCE_ENTRY)) throw new Error('Legacy coordinate-evidence manifest entry missing');
evidenceManifest.files = evidenceManifest.files.filter((entry) => entry !== LEGACY_EVIDENCE_ENTRY);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

// Remove the duplicate Civication map object when canonical Akerselva already has its own mapping.
const civication = readJson(CIVICATION);
const canonicalMappingCount = countMappings(civication, CANONICAL_ID);
const legacyMappingCount = countMappings(civication, LEGACY_ID);
if (legacyMappingCount !== 1) throw new Error(`Expected one legacy Civication mapping, got ${legacyMappingCount}`);
const civiStats = { removed: 0 };
let updatedCivication;
if (canonicalMappingCount >= 1) {
  updatedCivication = removeMappings(civication, LEGACY_ID, civiStats);
  if (civiStats.removed !== 1) throw new Error(`Expected one duplicate Civication mapping removal, got ${civiStats.removed}`);
} else {
  throw new Error('Canonical Akerselva has no Civication mapping; explicit retarget path is required before retirement');
}
writeJson(CIVICATION, updatedCivication);

// Retarget every remaining exact JSON value/key to the one canonical Akerselva ID.
const remainingFiles = grepFilesExactQuoted(LEGACY_ID).filter((file) => file !== GENERATED_INDEX);
const transformedFiles = [];
const transformStats = { valueReplacements: 0, keyReplacements: 0, keyCollisions: [] };
for (const file of remainingFiles) {
  let parsed;
  try {
    parsed = readJson(file);
  } catch (error) {
    throw new Error(`Could not parse JSON reference file ${file}: ${error.message}`);
  }
  const before = JSON.stringify(parsed);
  const localStats = { valueReplacements: 0, keyReplacements: 0, keyCollisions: [] };
  const transformed = transformLegacyId(parsed, localStats);
  const after = JSON.stringify(transformed);
  if (before !== after) {
    writeJson(file, transformed);
    transformedFiles.push({ file, ...localStats });
    transformStats.valueReplacements += localStats.valueReplacements;
    transformStats.keyReplacements += localStats.keyReplacements;
    transformStats.keyCollisions.push(...localStats.keyCollisions.map((path) => `${file}:${path}`));
  }
}

// Finalize split metadata after all semantic reference rewrites.
legacyManifest.source_sha256 = sha256(LEGACY_AGGREGATE);
legacyManifest.generated_at = new Date().toISOString();
writeJson(LEGACY_SPLIT_MANIFEST, legacyManifest);

const canonicalManifest = readJson(CANONICAL_MANIFEST);
if (!Array.isArray(canonicalManifest.places)) throw new Error(`${CANONICAL_MANIFEST} missing places[]`);
const canonicalManifestRows = canonicalManifest.places.filter((row) => row?.id === CANONICAL_ID);
if (canonicalManifestRows.length !== 1) throw new Error(`Expected one canonical manifest row, got ${canonicalManifestRows.length}`);
canonicalManifestRows[0].name = mergedCanonical.name;
canonicalManifestRows[0].sha256 = sha256(CANONICAL_CHILD);
canonicalManifest.source_sha256 = sha256(CANONICAL_AGGREGATE);
canonicalManifest.generated_at = new Date().toISOString();
writeJson(CANONICAL_MANIFEST, canonicalManifest);

const canonicalIndex = readJson(CANONICAL_INDEX);
if (!Array.isArray(canonicalIndex)) throw new Error(`${CANONICAL_INDEX} is not an array`);
const canonicalIndexRows = canonicalIndex.filter((place) => place?.id === CANONICAL_ID);
if (canonicalIndexRows.length !== 1) throw new Error(`Expected one canonical index row, got ${canonicalIndexRows.length}`);
const oldCanonicalIndexRow = canonicalIndexRows[0];
writeJson(CANONICAL_INDEX, canonicalIndex.map((place) => place?.id === CANONICAL_ID ? { ...mergedCanonical, file: oldCanonicalIndexRow.file } : place));

// Lock the retired physical duplicate ID to the canonical river place.
let aliasTool = readFileSync(ALIAS_TOOL, 'utf8');
if (aliasTool.includes(`${LEGACY_ID}: '${CANONICAL_ID}'`) || aliasTool.includes(`'${LEGACY_ID}': '${CANONICAL_ID}'`)) throw new Error('Akerselva industrial legacy alias already exists unexpectedly');
const aliasNeedle = 'const aliases: AliasMap = {';
if (!aliasTool.includes(aliasNeedle)) throw new Error('Could not locate place alias registry');
aliasTool = aliasTool.replace(aliasNeedle, `${aliasNeedle} ${LEGACY_ID}: '${CANONICAL_ID}',`);
writeFileSync(ALIAS_TOOL, aliasTool, 'utf8');

// Remove unresolved row and record the no-new-coordinate thematic migration batch.
const protocolLines = protocol.split('\n');
const legacyRows = protocolLines.map((line, index) => line.includes(`\`${LEGACY_ID}\``) ? index : -1).filter((index) => index >= 0);
if (legacyRows.length !== 1) throw new Error(`Expected one unresolved protocol row for ${LEGACY_ID}, got ${legacyRows.length}`);
protocol = protocolLines.filter((_, index) => !legacyRows.includes(index)).join('\n');
protocol = `${protocol.trimEnd()}\n\n| ${BATCH} | \`${LEGACY_ID}\` | retired thematic duplicate → \`${CANONICAL_ID}\` | no new coordinate | \`${CANONICAL_SOURCE_ID}\` |\n\nBatch ${BATCH} (${DATE}) løser \`${LEGACY_ID}\` som en tematisk duplikat av den allerede canonical og geometri-verifiserte elvekorridoren \`${CANONICAL_ID}\`. Akerselva har tre dokumenterte ruteankre og beskriver eksplisitt industrilagene langs elva; den separate næringslivsrecorden hadde ingen egen fysisk geometri og overlappet samme korridor. Næringslivs- og industriemner flyttes inn på canonical Akerselva, aktive ID-referanser retargetes, quiz- og ruteinnhold beholdes gjennom samme canonical placeId, mens den doble næringslivsmarkøren, split-artefakten, coordinate evidence og Civication-kopien pensjoneres. Legacy-ID-en låses som alias til \`${CANONICAL_ID}\`. Ingen ny koordinat opprettes.\n`;
writeFileSync(PROTOCOL, protocol, 'utf8');

// Rebuild runtime index before hard residual-ID and alias checks.
const runtimeRebuild = spawnSync('npm', ['run', 'places:index:build'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/places-index-precheck-build.log`, `${runtimeRebuild.stdout || ''}${runtimeRebuild.stderr || ''}`, 'utf8');
if (runtimeRebuild.status !== 0) throw new Error(`Runtime place-index rebuild failed with ${runtimeRebuild.status}`);

const postRefs = grepExactQuoted(LEGACY_ID);
if (postRefs.length) throw new Error(`Legacy ID remains after migration:\n${postRefs.join('\n')}`);

const aliasCheck = spawnSync('npx', ['tsx', ALIAS_TOOL], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/place-id-alias-check.log`, `${aliasCheck.stdout || ''}${aliasCheck.stderr || ''}`, 'utf8');
if (aliasCheck.status !== 0) throw new Error(`Place ID alias check failed with ${aliasCheck.status}:\n${aliasCheck.stdout || ''}\n${aliasCheck.stderr || ''}`);

const peopleCheck = spawnSync('npm', ['run', 'audit:people-of-places'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/people-of-places.log`, `${peopleCheck.stdout || ''}${peopleCheck.stderr || ''}`, 'utf8');
if (peopleCheck.status !== 0) throw new Error(`People-of-places audit failed with ${peopleCheck.status}:\n${peopleCheck.stdout || ''}\n${peopleCheck.stderr || ''}`);

const result = {
  version: DATE,
  batch: BATCH,
  legacyId: LEGACY_ID,
  canonicalId: CANONICAL_ID,
  status: 'retired_thematic_duplicate_migrated_to_existing_canonical_geometry',
  canonical: {
    file: CANONICAL_CHILD,
    name: mergedCanonical.name,
    coordinate: { lat: mergedCanonical.lat, lon: mergedCanonical.lon, r: mergedCanonical.r },
    sourceObjectId: mergedCanonical.sourceObjectId,
    coordStatus: mergedCanonical.coordStatus,
    anchors: mergedCanonical.anchors,
    mergedEmneIds: mergedCanonical.emne_ids,
    mergedUnderbadgeIds: mergedCanonical.underbadge_ids || []
  },
  retired: {
    oldName: legacyPlace.name,
    oldCoordinate: { lat: legacyPlace.lat, lon: legacyPlace.lon, r: legacyPlace.r },
    aggregateFile: LEGACY_AGGREGATE,
    splitFile: LEGACY_SPLIT,
    evidenceFile: LEGACY_EVIDENCE
  },
  migration: {
    preExactReferenceLines: preRefs.length,
    transformedFileCount: transformedFiles.length,
    transformedFiles,
    valueReplacements: transformStats.valueReplacements,
    keyReplacements: transformStats.keyReplacements,
    keyCollisionsResolvedByCanonicalKey: transformStats.keyCollisions,
    canonicalCivicationMappingsBefore: canonicalMappingCount,
    removedLegacyCivicationMappings: civiStats.removed,
    aliasRegistered: `${LEGACY_ID} -> ${CANONICAL_ID}`,
    postExactReferenceLines: postRefs.length
  },
  decision: 'The industrial corridor is learning context on the same physical Akerselva route, not a second physical place. No new coordinate was created.'
};
writeJson(`${REPORT_DIR}/batch-191-result.json`, result);
console.log(JSON.stringify({ batch: BATCH, legacyId: LEGACY_ID, canonicalId: CANONICAL_ID, preExactReferenceLines: preRefs.length, transformedFileCount: transformedFiles.length, valueReplacements: transformStats.valueReplacements, keyReplacements: transformStats.keyReplacements, keyCollisionCount: transformStats.keyCollisions.length, postExactReferenceLines: postRefs.length }, null, 2));
