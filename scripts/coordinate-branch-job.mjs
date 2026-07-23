#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const DATE = '2026-07-23';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const placeManifestFile = 'data/places/manifest.json';
const runtimeIndexFile = 'data/places/places_index.json';
const reportDir = 'reports/oslo-coordinate-runtime-source-drift-audit-post-179';
const abs = (file) => path.join(root, file);

const toPlaces = (payload) => Array.isArray(payload)
  ? payload
  : Array.isArray(payload?.places)
    ? payload.places
    : Array.isArray(payload?.items)
      ? payload.items
      : [payload];

const protocol = fs.readFileSync(abs(protocolFile), 'utf8');
const unresolvedHeading = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const sectionStart = protocol.indexOf(unresolvedHeading);
if (sectionStart < 0) throw new Error('Could not find unresolved Oslo protocol section');
let sectionEnd = protocol.indexOf('\n## Etne – historiesett', sectionStart);
if (sectionEnd < 0) sectionEnd = protocol.length;
const unresolvedSection = protocol.slice(sectionStart, sectionEnd);
const unresolvedIds = [...unresolvedSection.matchAll(/^\|\s*`([^`]+)`[^\n]*$/gm)].map((match) => match[1]);
if (!unresolvedIds.length) throw new Error('No unresolved Oslo rows found');

const runtimePayload = JSON.parse(fs.readFileSync(abs(runtimeIndexFile), 'utf8'));
const runtimePlaces = toPlaces(runtimePayload);
const runtimeById = new Map(runtimePlaces.filter((place) => place?.id).map((place) => [String(place.id), place]));

const manifest = JSON.parse(fs.readFileSync(abs(placeManifestFile), 'utf8'));
if (!Array.isArray(manifest.files)) throw new Error('data/places/manifest.json has no files array');

const occurrencesById = new Map(unresolvedIds.map((id) => [id, []]));
for (let manifestIndex = 0; manifestIndex < manifest.files.length; manifestIndex += 1) {
  const entry = manifest.files[manifestIndex];
  const file = path.join(root, 'data', entry);
  if (!fs.existsSync(file)) continue;
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`Could not parse manifest source data/${entry}: ${error}`);
  }
  for (const place of toPlaces(payload)) {
    if (!place?.id || !occurrencesById.has(String(place.id))) continue;
    occurrencesById.get(String(place.id)).push({
      manifestIndex,
      manifestEntry: entry,
      sourceFile: `data/${entry}`,
      name: place.name ?? null,
      category: place.category ?? null,
      lat: Number.isFinite(Number(place.lat)) ? Number(place.lat) : null,
      lon: Number.isFinite(Number(place.lon)) ? Number(place.lon) : null,
      r: Number.isFinite(Number(place.r)) ? Number(place.r) : null,
      coordStatus: place.coordStatus ?? null,
      coordType: place.coordType ?? null,
      locatorType: place.locatorType ?? null,
      sourceProvider: place.sourceProvider ?? null,
      sourceObjectId: place.sourceObjectId ?? null,
      coordRole: place.coordRole ?? null,
      geocodeAccuracy: place.geocodeAccuracy ?? null,
      disabled: place.disabled === true,
      hidden: place.hidden === true,
      active: place.active ?? null,
    });
  }
}

const verifiedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const comparableKeys = ['name', 'category', 'lat', 'lon', 'r', 'coordStatus', 'coordType', 'locatorType', 'sourceProvider', 'sourceObjectId', 'coordRole', 'geocodeAccuracy'];
function comparable(place) {
  return Object.fromEntries(comparableKeys.map((key) => [key, place?.[key] ?? null]));
}
function matchesRuntime(occurrence, runtime) {
  if (!runtime) return false;
  return comparableKeys.every((key) => {
    const a = occurrence?.[key] ?? null;
    const b = runtime?.[key] ?? null;
    if ((key === 'lat' || key === 'lon' || key === 'r') && a !== null && b !== null) return Math.abs(Number(a) - Number(b)) < 1e-9;
    return String(a ?? '') === String(b ?? '');
  });
}

const rows = unresolvedIds.map((id) => {
  const occurrences = occurrencesById.get(id) || [];
  const runtime = runtimeById.get(id) ?? null;
  const verifiedOccurrences = occurrences.filter((row) => verifiedStatuses.has(String(row.coordStatus ?? '')));
  const runtimeVerified = Boolean(runtime && verifiedStatuses.has(String(runtime.coordStatus ?? '')));
  const runtimeMatchingOccurrences = occurrences.filter((row) => matchesRuntime(row, runtime));
  const lastOccurrence = occurrences.length ? occurrences[occurrences.length - 1] : null;
  const sourceObjectIds = [...new Set(occurrences.map((row) => row.sourceObjectId).filter(Boolean))];
  const coordinateVariants = [...new Set(occurrences.filter((row) => row.lat !== null && row.lon !== null).map((row) => `${row.lat},${row.lon}`))];
  const statuses = [...new Set(occurrences.map((row) => row.coordStatus ?? 'missing').filter(Boolean))];
  const verifiedSourceShadowed = verifiedOccurrences.length > 0 && !runtimeVerified;
  const runtimeFieldLoss = Boolean(lastOccurrence && runtime && verifiedStatuses.has(String(lastOccurrence.coordStatus ?? '')) && !runtimeVerified);
  return {
    id,
    runtime: runtime ? comparable(runtime) : null,
    occurrenceCount: occurrences.length,
    occurrences,
    lastManifestOccurrence: lastOccurrence,
    runtimeMatchingOccurrenceCount: runtimeMatchingOccurrences.length,
    runtimeMatchingSourceFiles: runtimeMatchingOccurrences.map((row) => row.sourceFile),
    verifiedOccurrenceCount: verifiedOccurrences.length,
    verifiedOccurrences,
    runtimeVerified,
    verifiedSourceShadowed,
    runtimeFieldLoss,
    sourceObjectIds,
    coordinateVariants,
    statuses,
    diagnosis: !runtime
      ? 'missing_from_runtime'
      : verifiedSourceShadowed
        ? 'verified_source_exists_but_runtime_is_unverified'
        : occurrences.length > 1 && runtimeMatchingOccurrences.length === 0
          ? 'multiple_sources_runtime_matches_none_exactly'
          : occurrences.length > 1
            ? 'multiple_manifest_sources'
            : runtime.coordStatus == null
              ? 'single_source_missing_coordinate_metadata'
              : 'genuinely_unresolved_or_requires_manual_review',
  };
});

const driftCandidates = rows.filter((row) => row.verifiedSourceShadowed || row.runtimeFieldLoss || row.diagnosis === 'multiple_sources_runtime_matches_none_exactly');
const missingMetadata = rows.filter((row) => row.runtime && !row.runtime.coordStatus);
const duplicateSourceIds = rows.filter((row) => row.occurrenceCount > 1);

const result = {
  version: DATE,
  generatedAt: new Date().toISOString(),
  sourceProtocol: protocolFile,
  sourceManifest: placeManifestFile,
  sourceRuntimeIndex: runtimeIndexFile,
  unresolvedCount: unresolvedIds.length,
  driftCandidateCount: driftCandidates.length,
  missingRuntimeCoordStatusCount: missingMetadata.length,
  multipleManifestSourceCount: duplicateSourceIds.length,
  driftCandidates: driftCandidates.map((row) => ({
    id: row.id,
    diagnosis: row.diagnosis,
    runtime: row.runtime,
    verifiedOccurrences: row.verifiedOccurrences,
    lastManifestOccurrence: row.lastManifestOccurrence,
  })),
  missingRuntimeCoordinateMetadata: missingMetadata.map((row) => ({
    id: row.id,
    diagnosis: row.diagnosis,
    runtime: row.runtime,
    occurrenceCount: row.occurrenceCount,
    statuses: row.statuses,
    sourceObjectIds: row.sourceObjectIds,
  })),
  rows,
};

fs.mkdirSync(abs(reportDir), { recursive: true });
fs.writeFileSync(abs(`${reportDir}/summary.json`), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/README.md`), `# Oslo unresolved runtime/source drift audit — post batch 179\n\nThis audit does not change canonical place data. It traces every currently unresolved protocol id through every occurrence in the ordered place manifest and compares those source records with the generated runtime index.\n\nThe report distinguishes genuinely unresolved places from source shadowing, duplicate-source precedence and coordinate-metadata loss. In particular, it can identify cases where an earlier source is already verified but a later manifest occurrence or runtime representation drops that verification metadata.\n\nNo coordinate, place identity or protocol row is modified by this job.\n`);

console.log(JSON.stringify({
  unresolvedCount: result.unresolvedCount,
  driftCandidates: result.driftCandidates.map((row) => row.id),
  missingRuntimeCoordinateMetadata: result.missingRuntimeCoordinateMetadata.map((row) => row.id),
  multipleManifestSources: duplicateSourceIds.map((row) => row.id),
}, null, 2));
