#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 124;
const date = '2026-07-21';
const oldId = 'lekeplass_frognerborgen';
const newId = 'frognerparken';
const oldSourceFile = path.join(root, 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json');
const oldSourceDir = path.dirname(oldSourceFile);
const oldSplitDir = path.join(oldSourceDir, 'places_oslo_lekeplasser_trening');
const oldSplitManifestFile = path.join(oldSourceDir, 'places_oslo_lekeplasser_trening_manifest.json');
const oldSplitIndexFile = path.join(oldSourceDir, 'places_oslo_lekeplasser_trening_index.json');
const newPlaceRel = 'data/places/by/oslo/frognerparken.json';
const newPlaceFile = path.join(root, newPlaceRel);
const manifestFile = path.join(root, 'data/places/manifest.json');
const civiMappingFile = path.join(root, 'data/Civication/map/historyGoPlaceMapping.sport_lekeplasser_trening.json');
const i18nDir = path.join(root, 'data/i18n/content/places');
const wonderkammerDir = path.join(root, 'data/wonderkammer');
const aliasToolFile = path.join(root, 'tools/check_place_id_aliases.mts');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/by/frognerparken.json');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-124-frognerparken-parent');
fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(path.dirname(evidenceFile), { recursive: true });

const officialSourceName = 'Oslo kommune – Frognerparken';
const officialSourceUrl = 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/frognerparken/';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const rel = (file) => path.relative(root, file).replace(/\\/g, '/');
const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();

function walkJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkJson(full);
    return entry.isFile() && entry.name.endsWith('.json') ? [full] : [];
  });
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

// Object-type-first: query the canonical physical park identity, not the old playground label.
const searchUrl = 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=' + encodeURIComponent('Frognerparken, Oslo, Norway') + '&limit=20&addressdetails=1&namedetails=1&extratags=1&polygon_geojson=1&countrycodes=no&bounded=1&viewbox=10.60%2C59.97%2C10.78%2C59.88';
const searchRows = await fetchJson(searchUrl, { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' });
writeJson(path.join(reportDir, 'frognerparken-nominatim-search.json'), searchRows);
const candidates = (Array.isArray(searchRows) ? searchRows : []).filter((row) => {
  const exactName = normalize(row?.namedetails?.name || row?.name) === normalize('Frognerparken');
  const correctType = row?.type === 'park' && row?.category === 'leisure';
  const stableObject = ['way', 'relation'].includes(String(row?.osm_type || '')) && Number.isFinite(Number(row?.osm_id));
  const geometry = ['Polygon', 'MultiPolygon'].includes(String(row?.geojson?.type || ''));
  const osloScope = Number(row?.lat) > 59.88 && Number(row?.lat) < 59.97 && Number(row?.lon) > 10.60 && Number(row?.lon) < 10.78;
  return exactName && correctType && stableObject && geometry && osloScope;
});
if (candidates.length !== 1) throw new Error(`Frognerparken krever ett eksakt navngitt OSM-parkobjekt; fant ${candidates.length}`);
const osm = candidates[0];
const lat = Number(osm.lat);
const lon = Number(osm.lon);
const sourceObjectId = `osm-${osm.osm_type}:${osm.osm_id}`;
const osmUrl = `https://www.openstreetmap.org/${osm.osm_type}/${osm.osm_id}`;

// Verify approved scope is present in the existing VisitOSLO parks/nature closure.
const scope = readJson(path.join(root, 'reports/visitoslo-parks-nature-audit-20260721/scope.json'));
if (!Array.isArray(scope?.approvedNewPlaces) || !scope.approvedNewPlaces.includes(newId)) {
  throw new Error('VisitOSLO parks/nature scope har ikke Frognerparken som approvedNewPlaces');
}

const oldPlaces = readJson(oldSourceFile);
if (!Array.isArray(oldPlaces)) throw new Error('Lekeplass/trening source må være array');
const oldRecord = oldPlaces.find((place) => place?.id === oldId);
if (!oldRecord) throw new Error(`Mangler ${oldId} i gammel source`);
if (oldPlaces.some((place) => place?.id === newId)) throw new Error(`${newId} finnes allerede i gammel source`);

const newPlace = {
  id: newId,
  name: 'Frognerparken',
  visual: { designCode: 'park_miniature' },
  lat,
  lon,
  r: 320,
  category: 'by',
  rounds: ['people', 'nature', 'badges', 'civication', 'leksikon', 'før_nå'],
  place_type: 'park',
  emne_ids: ['em_by_parker_som_sosial_infrastruktur', 'em_by_opphold_vs_gjennomgang'],
  desc: 'Stor sentral bypark med grøntområder, turveier, Frognerdammene, Frognerborgen og flere selvstendige kultur- og idrettssteder innenfor det større parklandskapet.',
  popupDesc: 'Frognerparken er den største parken i det sentrale Oslo og fungerer som et stort sammenhengende byrom for tur, opphold, rekreasjon og hverdagsliv. Parken rommer flere tydelige understeder, men de skal ikke forveksles med hele parken: Vigelandsparken er skulpturanlegget inne i Frognerparken, Frogner stadion og Frognerbadet ligger i parkens nordøstre del, og Frognerborgen er lekeplassen ved hovedinngangen fra Kirkeveien.\n\nI History Go er `frognerparken` derfor parent-place for selve parklandskapet. Frognerborgen behandles som Wonderkammer-/aktivitetsinnhold under parken, mens allerede selvstendige canonical steder som Vigelandsparken, Frogner stadion og Frogner hovedgård beholder egne identiteter.',
  underbadge_ids: ['park', 'friluftsliv', 'lekeplass'],
  subplaces: [
    {
      id: 'frognerborgen',
      name: 'Frognerborgen',
      type: 'lekeplass',
      status: 'wonderkammer_subfeature',
      summary: oldRecord.desc,
    },
  ],
  locatorType: 'park',
  sourceProvider: 'osm',
  sourceObjectId,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: `OpenStreetMap ${osm.osm_type} ${osm.osm_id} – Frognerparken; scope cross-checked with Oslo kommune`,
  coordSourceId: sourceObjectId,
  coordSourceUrl: osmUrl,
  coordType: 'park_center',
  coordVerifiedAt: date,
  coordNote: `Batch 124 object-type-first: Oslo kommune definerer Frognerparken som hele den sentrale parken og Frognerborgen som en lekeplass ved hovedinngangen inne i parken. Ett eksakt navngitt OSM-parkobjekt (${sourceObjectId}) med polygongeometri ble valgt innen forhåndsdefinert Oslo-scope. Nominatims representasjonspunkt brukes som area-anchor for hele parkobjektet, ikke som koordinat for Vigelandsparken, Frognerborgen eller et annet enkelt understed.`,
  geometry: osm.geojson,
  externalLinks: [
    { type: 'official', label: officialSourceName, url: officialSourceUrl, lang: 'nb', verifiedAt: date },
  ],
};
writeJson(newPlaceFile, newPlace);

// Remove the playground pseudo-place from its old source and split artifacts.
writeJson(oldSourceFile, oldPlaces.filter((place) => place?.id !== oldId));
const oldChildFile = path.join(oldSplitDir, `${oldId}.json`);
if (!fs.existsSync(oldChildFile)) throw new Error(`Mangler split child ${oldId}`);
fs.unlinkSync(oldChildFile);

const splitManifest = readJson(oldSplitManifestFile);
splitManifest.places = (splitManifest.places || []).filter((row) => row?.id !== oldId);
splitManifest.places.forEach((row, index) => { row.order = index; });
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256File(oldSourceFile);
splitManifest.generated_at = new Date().toISOString();
for (const row of splitManifest.places) row.sha256 = sha256File(path.join(oldSourceDir, row.file));
writeJson(oldSplitManifestFile, splitManifest);

const splitIndex = readJson(oldSplitIndexFile);
writeJson(oldSplitIndexFile, splitIndex.filter((row) => row?.id !== oldId));

// Register the new standalone canonical place.
const manifest = readJson(manifestFile);
if (!Array.isArray(manifest?.files)) throw new Error('data/places/manifest.json mangler files-array');
const manifestRel = newPlaceRel.replace(/^data\//, '');
if (!manifest.files.includes(manifestRel)) manifest.files.push(manifestRel);
writeJson(manifestFile, manifest);

// Remove obsolete top-level Civication mapping for the playground pseudo-place.
const civi = readJson(civiMappingFile);
for (const [mappingId, mapping] of Object.entries(civi?.mappings || {})) {
  if (mapping?.historyGoPlaceId === oldId) delete civi.mappings[mappingId];
}
writeJson(civiMappingFile, civi);

// Wonderkammer is the correct destination for Frognerborgen. Retarget only files containing the exact old ID.
const wonderkammerChanges = [];
for (const file of walkJson(wonderkammerDir)) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes(`\"${oldId}\"`)) continue;
  const after = before.split(`\"${oldId}\"`).join(`\"${newId}\"`);
  fs.writeFileSync(file, after);
  wonderkammerChanges.push(rel(file));
}

// Remove obsolete place translations for the subfeature; do not overwrite future parent translations.
const i18nChanges = [];
for (const file of walkJson(i18nDir)) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes(`\"${oldId}\"`)) continue;
  const payload = JSON.parse(before);
  if (Object.prototype.hasOwnProperty.call(payload, oldId)) {
    delete payload[oldId];
    writeJson(file, payload);
    i18nChanges.push(rel(file));
  }
}

// Retarget any remaining active exact references byte-for-byte, excluding handled structural files.
const handled = new Set([
  rel(oldSourceFile), rel(oldSplitManifestFile), rel(oldSplitIndexFile), rel(manifestFile), rel(civiMappingFile), rel(newPlaceFile),
  rel(oldChildFile), ...wonderkammerChanges, ...i18nChanges,
]);
const rawReferenceChanges = [];
for (const file of walkJson(path.join(root, 'data'))) {
  const relative = rel(file);
  if (handled.has(relative) || /(^|\/)(archive|arkiv)(\/|$)/i.test(relative)) continue;
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes(`\"${oldId}\"`)) continue;
  const after = before.split(`\"${oldId}\"`).join(`\"${newId}\"`);
  fs.writeFileSync(file, after);
  rawReferenceChanges.push(relative);
}

// Remove any old coordinate evidence and create evidence for the canonical park.
for (const file of walkJson(path.join(root, 'data/coordinate-evidence'))) {
  let payload;
  try { payload = readJson(file); } catch { continue; }
  if (payload?.placeId === oldId) fs.unlinkSync(file);
}
writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId: newId,
  placeFile: newPlaceRel,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: newPlace.lat,
    lon: newPlace.lon,
    r: newPlace.r,
    coordStatus: newPlace.coordStatus,
    coordSource: newPlace.coordSource,
    coordType: newPlace.coordType,
    coordNote: newPlace.coordNote,
  },
  identity: {
    currentName: newPlace.name,
    resolvedIdentity: 'Frognerparken – hele parklandskapet, med Frognerborgen som subfeature',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'park',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: ['offisiell parent/subfeature-avgrensning', 'ett eksakt navngitt parkobjekt', 'stabil kildeidentitet og polygongeometri'],
  evidence: [
    {
      sourceProvider: 'municipality',
      sourceName: officialSourceName,
      sourceUrl: officialSourceUrl,
      sourceObjectId: 'oslo-kommune:park:frognerparken',
      sourceQuality: 'official_scope_definition',
      finding: 'Oslo kommune definerer Frognerparken som hele parken og Frognerborgen som lekeplassen ved hovedinngangen inne i parken.',
      canVerifyCoordinate: false,
      reason: 'Fastsetter canonical parent/subfeature-scope før geometrivalg.',
    },
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap – Frognerparken (${osm.osm_type} ${osm.osm_id})`,
      sourceUrl: osmUrl,
      sourceObjectId,
      sourceQuality: 'exact_named_polygon_after_object_type_filter',
      finding: 'Ett eksakt navngitt parkobjekt med polygongeometri i forhåndsdefinert Oslo-scope.',
      canVerifyCoordinate: true,
      reason: newPlace.coordNote,
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId, lat, lon, coordRole: 'area_anchor', canApplyToPlace: true }],
  coordinateCandidates: [{ sourceProvider: 'osm', sourceObjectId, lat, lon, coordRole: 'area_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Canonical Frognerparken er produsert; Frognerborgen beholdes som Wonderkammer-subfeature.' },
  notes: [newPlace.coordNote],
});

// Make the identity migration enforceable.
let aliasTool = fs.readFileSync(aliasToolFile, 'utf8');
if (!aliasTool.includes(`${oldId}: '${newId}'`)) {
  aliasTool = aliasTool.replace(/const aliases: AliasMap = \{([^\n]*)\};/, (_match, body) => `const aliases: AliasMap = {${body}, ${oldId}: '${newId}' };`);
}
writeText(aliasToolFile, aliasTool);

// Protocol documentation.
let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 124 (2026-07-21)')) {
  const row = `| 124 | \`frognerparken\` | Frognerparken | verified_geometry | \`${sourceObjectId}\` |`;
  const paragraph = `Batch 124 (2026-07-21) løser Frognerborgen-parentproblemet ved å produsere den allerede scope-godkjente canonical identiteten \`frognerparken\`. Oslo kommune definerer Frognerparken som hele parken og Frognerborgen som lekeplassen ved hovedinngangen inne i parken. \`lekeplass_frognerborgen\` fjernes derfor som egen aktiv kartmarkør og beholdes som Wonderkammer-/subfeature-innhold under \`frognerparken\`. Parkankeret kommer fra ett eksakt navngitt OSM-parkobjekt med polygongeometri etter objekt-type-først-filter; ingen nearest/first-hit-logikk brukes, og Vigelandsparken, Frogner stadion og Frogner hovedgård forblir separate canonical steder.`;
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 124');
  protocol = protocol.replace(marker, `${row}\n\n${paragraph}\n\n${marker}`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  migrated: { oldPlaceId: oldId, newPlaceId: newId },
  sourceObjectId,
  lat,
  lon,
  objectType: 'park',
  officialScopeSource: officialSourceUrl,
  wonderkammerChanges,
  i18nChanges,
  rawReferenceChanges,
  unresolvedFromSourceAfterBatch: ['lekeplass_kirsebarlunden', 'lekeplass_snippen', 'lekeplass_kampen_park', 'aktivitet_rudolf_nilsens_plass', 'treningssted_torshovdalen', 'treningssted_kampen_park', 'treningssted_sognsvann'],
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 124 – Frognerparken canonical parent', '',
  `- \`${oldId}\` → \`${newId}\``,
  `- canonical geometry: \`${sourceObjectId}\``,
  '- Oslo kommune confirms Frognerborgen is a playground inside Frognerparken.',
  '- Frognerborgen is retained as Wonderkammer/subfeature content, not as a duplicate map place.',
  '- Vigelandsparken and other independent places inside/along the park remain separate canonical places.',
].join('\n'));

// Rebuild and run targeted identity guard before standard coordinate runner gates.
execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/check_place_id_aliases.mjs'], { cwd: root, stdio: 'inherit' });

const rebuilt = readJson(path.join(root, 'data/places/places_index.json'));
const rebuiltIds = new Set(rebuilt.map((place) => place?.id).filter(Boolean));
if (!rebuiltIds.has(newId)) throw new Error('Runtime mangler frognerparken etter build');
if (rebuiltIds.has(oldId)) throw new Error('Runtime inneholder fortsatt lekeplass_frognerborgen');

const residuals = [];
for (const file of walkJson(path.join(root, 'data'))) {
  const relative = rel(file);
  if (/(^|\/)(archive|arkiv)(\/|$)/i.test(relative)) continue;
  if (fs.readFileSync(file, 'utf8').includes(`\"${oldId}\"`)) residuals.push(relative);
}
if (residuals.length) throw new Error(`Legacy-ID står igjen i aktiv data: ${JSON.stringify(residuals)}`);

const changedFiles = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (changedFiles.length > 45) throw new Error(`Batch 124 diff-budsjett overskredet: ${changedFiles.length} filer`);
writeJson(path.join(reportDir, 'changed-files.json'), { count: changedFiles.length, files: changedFiles });

console.log(JSON.stringify({ batch, oldId, newId, sourceObjectId, changedFileCount: changedFiles.length }, null, 2));
