#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 126;
const date = '2026-07-21';
const sourceFile = path.join(root, 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json');
const sourceDir = path.dirname(sourceFile);
const splitDir = path.join(sourceDir, 'places_oslo_lekeplasser_trening');
const splitManifestFile = path.join(sourceDir, 'places_oslo_lekeplasser_trening_manifest.json');
const splitIndexFile = path.join(sourceDir, 'places_oslo_lekeplasser_trening_index.json');
const manifestFile = path.join(root, 'data/places/manifest.json');
const runtimeIndexFile = path.join(root, 'data/places/places_index.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const aliasToolFile = path.join(root, 'tools/check_place_id_aliases.mts');
const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-126-kampen-rudolf-canonical');
fs.mkdirSync(reportDir, { recursive: true });

const migrations = {
  lekeplass_kampen_park: 'kampen_park',
  treningssted_kampen_park: 'kampen_park',
  aktivitet_rudolf_nilsens_plass: 'rudolf_nilsens_plass',
};
const retiredIds = new Set(Object.keys(migrations));
const newIds = new Set(Object.values(migrations));

const definitions = {
  kampen_park: {
    name: 'Kampen park',
    searchQuery: 'Kampen park, Oslo, Norway',
    expectedSourceObjectId: 'osm-way:4870715',
    officialSourceName: 'Oslo kommune – Kampen park',
    officialSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/kampen-park/',
    newPlaceRel: 'data/places/by/oslo/kampen_park.json',
    evidenceEntry: 'oslo/by/kampen_park.json',
    r: 240,
  },
  rudolf_nilsens_plass: {
    name: 'Rudolf Nilsens plass',
    searchQuery: 'Rudolf Nilsens plass, Oslo, Norway',
    expectedSourceObjectId: 'osm-way:36972584',
    officialSourceName: 'Oslo kommune – Rudolf Nilsens plass',
    officialSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/rudolf-nilsens-plass/',
    newPlaceRel: 'data/places/by/oslo/rudolf_nilsens_plass.json',
    evidenceEntry: 'oslo/by/rudolf_nilsens_plass.json',
    r: 160,
  },
};

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

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

async function resolvePark(definition) {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=' + encodeURIComponent(definition.searchQuery) + '&limit=20&addressdetails=1&namedetails=1&extratags=1&polygon_geojson=1&countrycodes=no&bounded=1&viewbox=10.45%2C60.05%2C10.95%2C59.80';
  const rows = await fetchJson(url);
  const slug = definition.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  writeJson(path.join(reportDir, `${slug}-nominatim-search.json`), rows);
  const exact = (Array.isArray(rows) ? rows : []).filter((row) => {
    const exactName = normalize(row?.namedetails?.name || row?.name) === normalize(definition.name);
    const correctType = row?.category === 'leisure' && row?.type === 'park';
    const stableGeometry = ['way', 'relation'].includes(String(row?.osm_type || '')) && ['Polygon', 'MultiPolygon'].includes(String(row?.geojson?.type || ''));
    const osloScope = Number(row?.lat) > 59.80 && Number(row?.lat) < 60.05 && Number(row?.lon) > 10.45 && Number(row?.lon) < 10.95;
    return exactName && correctType && stableGeometry && osloScope;
  });
  if (exact.length !== 1) throw new Error(`${definition.name}: krever ett eksakt navngitt parkpolygon; fant ${exact.length}`);
  const row = exact[0];
  const sourceObjectId = `osm-${row.osm_type}:${row.osm_id}`;
  if (sourceObjectId !== definition.expectedSourceObjectId) {
    throw new Error(`${definition.name}: stable object drift: forventet ${definition.expectedSourceObjectId}, fikk ${sourceObjectId}`);
  }
  return {
    lat: Number(row.lat),
    lon: Number(row.lon),
    geometry: row.geojson,
    sourceObjectId,
    sourceUrl: `https://www.openstreetmap.org/${row.osm_type}/${row.osm_id}`,
    sourceLabel: `OpenStreetMap ${row.osm_type} ${row.osm_id} – ${definition.name}`,
  };
}

const runtimeBefore = readJson(runtimeIndexFile);
const runtimeIds = new Set(runtimeBefore.map((place) => place?.id).filter(Boolean));
for (const oldId of retiredIds) if (!runtimeIds.has(oldId)) throw new Error(`Mangler legacy source-ID i runtime: ${oldId}`);
for (const newId of newIds) if (runtimeIds.has(newId)) throw new Error(`Canonical ID finnes allerede: ${newId}`);

const geometry = {
  kampen_park: await resolvePark(definitions.kampen_park),
  rudolf_nilsens_plass: await resolvePark(definitions.rudolf_nilsens_plass),
};

const sourcePlaces = readJson(sourceFile);
if (!Array.isArray(sourcePlaces)) throw new Error('Lekeplass/trening source må være array');
const byId = new Map(sourcePlaces.map((place) => [place.id, place]));
for (const oldId of retiredIds) if (!byId.has(oldId)) throw new Error(`Mangler source record ${oldId}`);

const kampenPlay = byId.get('lekeplass_kampen_park');
const kampenTrain = byId.get('treningssted_kampen_park');
const rudolfOld = byId.get('aktivitet_rudolf_nilsens_plass');

const kampen = {
  id: 'kampen_park',
  name: 'Kampen park',
  visual: { designCode: 'park_miniature' },
  lat: geometry.kampen_park.lat,
  lon: geometry.kampen_park.lon,
  r: definitions.kampen_park.r,
  category: 'by',
  rounds: ['people', 'nature', 'badges', 'civication', 'leksikon', 'routes', 'før_nå'],
  place_type: 'park',
  emne_ids: Array.from(new Set([...(kampenPlay.emne_ids || []), ...(kampenTrain.emne_ids || []), 'em_by_parker_som_sosial_infrastruktur', 'em_by_opphold_vs_gjennomgang'])),
  desc: 'Historisk park på Kampen med utsikt, variert terreng, lekeplass, bordtennis, trapper, grusbane og mange muligheter for både rolig opphold og aktivitet.',
  popupDesc: 'Kampen park er et sammenhengende parklandskap på en høyde i Oslo øst. Oslo kommune beskriver parken både som sted for piknik, utsikt og ro og som et aktivitetsområde med trapper ved grottefontenen, frisbee på grusbanen, bordtennis, naturisbane og lekeplass.\n\nI History Go er selve parken den canonical fysiske identiteten. De tidligere markørene `lekeplass_kampen_park` og `treningssted_kampen_park` beskrev to bruksmåter i det samme fysiske området og samles derfor i `kampen_park`. Lek og trening beholdes som Wonderkammer- og aktivitetslag, ikke som overlappende kartsteder.',
  underbadge_ids: Array.from(new Set([...(kampenPlay.underbadge_ids || []), ...(kampenTrain.underbadge_ids || []), 'park'])),
  activity_profile: {
    playground: kampenPlay.activity_profile || null,
    training: kampenTrain.activity_profile || null,
  },
  subplaces: [
    { id: 'kampen_park_lekeplass', name: 'Lekeplassen i Kampen park', type: 'lekeplass', status: 'wonderkammer_subfeature' },
    { id: 'kampen_park_trening', name: 'Trening i Kampen park', type: 'activity_layer', status: 'wonderkammer_subfeature' },
  ],
  locatorType: 'park',
  sourceProvider: 'osm',
  sourceObjectId: geometry.kampen_park.sourceObjectId,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: `${geometry.kampen_park.sourceLabel}; scope cross-checked with Oslo kommune`,
  coordSourceId: geometry.kampen_park.sourceObjectId,
  coordSourceUrl: geometry.kampen_park.sourceUrl,
  coordType: 'park_center',
  coordVerifiedAt: date,
  coordNote: `Batch 126 canonical migration: Oslo kommune definerer Kampen park som hele parklandskapet og lister både lekeplass og treningsmuligheter som fasiliteter/bruk inne i parken. Ett eksakt navngitt OSM-parkpolygon (${geometry.kampen_park.sourceObjectId}) er valgt etter objekt-type-først-filter. Punktet er area-anchor for parken; de to gamle aktivitets-ID-ene blir innholdslag, ikke egne overlappende places.`,
  geometry: geometry.kampen_park.geometry,
  externalLinks: [
    { type: 'official', label: definitions.kampen_park.officialSourceName, url: definitions.kampen_park.officialSourceUrl, lang: 'nb', verifiedAt: date },
  ],
};

const rudolf = {
  ...rudolfOld,
  id: 'rudolf_nilsens_plass',
  name: 'Rudolf Nilsens plass',
  category: 'by',
  place_type: 'park_og_byrom',
  visual: { designCode: 'park_miniature' },
  rounds: ['people', 'nature', 'badges', 'civication', 'leksikon', 'før_nå'],
  emne_ids: Array.from(new Set([...(rudolfOld.emne_ids || []), 'em_by_parker_som_sosial_infrastruktur', 'em_by_opphold_vs_gjennomgang'])),
  desc: 'Historisk park og byrom på Tøyen med lekeplass, multibane, treningsapparater, plen, kunstgress og kunstis om vinteren.',
  popupDesc: 'Rudolf Nilsens plass er et historisk park- og byrom på Tøyen. Oslo kommune beskriver plassen som en samlet park med kunstgressbane og kunstis, treningsapparater, plenarealer, lekeplass og multibane.\n\nDen tidligere `aktivitet_rudolf_nilsens_plass`-markøren gjorde aktivitetsprogrammet til selve identiteten. I History Go er derfor `rudolf_nilsens_plass` den canonical fysiske identiteten, mens lek, trening, skøyter og ballspill er aktivitetslag innenfor samme sted.',
  lat: geometry.rudolf_nilsens_plass.lat,
  lon: geometry.rudolf_nilsens_plass.lon,
  r: definitions.rudolf_nilsens_plass.r,
  locatorType: 'park',
  sourceProvider: 'osm',
  sourceObjectId: geometry.rudolf_nilsens_plass.sourceObjectId,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: `${geometry.rudolf_nilsens_plass.sourceLabel}; scope cross-checked with Oslo kommune`,
  coordSourceId: geometry.rudolf_nilsens_plass.sourceObjectId,
  coordSourceUrl: geometry.rudolf_nilsens_plass.sourceUrl,
  coordType: 'park_center',
  coordVerifiedAt: date,
  coordNote: `Batch 126 canonical migration: Oslo kommune definerer Rudolf Nilsens plass som et samlet park-/byrom med flere aktivitetsfunksjoner. Ett eksakt navngitt OSM-parkpolygon (${geometry.rudolf_nilsens_plass.sourceObjectId}) er valgt etter objekt-type-først-filter. Punktet er area-anchor for hele plassen; den gamle aktivitets-ID-en blir et brukslag, ikke et eget overlappende place.`,
  geometry: geometry.rudolf_nilsens_plass.geometry,
  externalLinks: [
    { type: 'official', label: definitions.rudolf_nilsens_plass.officialSourceName, url: definitions.rudolf_nilsens_plass.officialSourceUrl, lang: 'nb', verifiedAt: date },
  ],
};
delete rudolf.coordPrecisionM;

for (const [newId, place] of [['kampen_park', kampen], ['rudolf_nilsens_plass', rudolf]]) {
  const target = path.join(root, definitions[newId].newPlaceRel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  writeJson(target, place);
}

// Remove the three purpose-specific records from the old source and split artifacts.
const remaining = sourcePlaces.filter((place) => !retiredIds.has(place?.id));
writeJson(sourceFile, remaining);
for (const oldId of retiredIds) {
  const child = path.join(splitDir, `${oldId}.json`);
  if (!fs.existsSync(child)) throw new Error(`Mangler split child ${oldId}`);
  fs.unlinkSync(child);
}

const splitManifest = readJson(splitManifestFile);
splitManifest.places = (splitManifest.places || []).filter((row) => !retiredIds.has(row?.id));
splitManifest.places.forEach((row, index) => { row.order = index; });
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256File(sourceFile);
splitManifest.generated_at = new Date().toISOString();
for (const row of splitManifest.places) row.sha256 = sha256File(path.join(sourceDir, row.file));
writeJson(splitManifestFile, splitManifest);
writeJson(splitIndexFile, readJson(splitIndexFile).filter((row) => !retiredIds.has(row?.id)));

// Register the two canonical standalone files.
const manifest = readJson(manifestFile);
for (const definition of Object.values(definitions)) {
  const manifestRel = definition.newPlaceRel.replace(/^data\//, '');
  if (!manifest.files.includes(manifestRel)) manifest.files.push(manifestRel);
}
writeJson(manifestFile, manifest);

// Remove obsolete top-level Civication mappings for retired purpose-specific IDs.
const civicationChanges = [];
for (const file of walkJson(path.join(root, 'data/Civication'))) {
  const before = fs.readFileSync(file, 'utf8');
  if (![...retiredIds].some((id) => before.includes(`\"${id}\"`))) continue;
  const payload = JSON.parse(before);
  let changed = false;
  function prune(value) {
    if (Array.isArray(value)) return value.map(prune).filter((item) => item !== undefined);
    if (!value || typeof value !== 'object') return value;
    if (typeof value.historyGoPlaceId === 'string' && retiredIds.has(value.historyGoPlaceId)) { changed = true; return undefined; }
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      const next = prune(child);
      if (next !== undefined) out[key] = next;
    }
    return out;
  }
  const next = prune(payload);
  if (changed) {
    writeJson(file, next);
    civicationChanges.push(rel(file));
  }
}

// Wonderkammer may now contain two Kampen parent entries. Retarget structurally and merge them.
const wonderkammerChanges = [];
for (const file of walkJson(path.join(root, 'data/wonderkammer'))) {
  const before = fs.readFileSync(file, 'utf8');
  if (![...retiredIds].some((id) => before.includes(`\"${id}\"`))) continue;
  let payload = JSON.parse(before);
  function replace(value, key = '') {
    if (typeof value === 'string') return key === 'id' ? value : (migrations[value] ?? value);
    if (Array.isArray(value)) return value.map((item) => replace(item, key));
    if (!value || typeof value !== 'object') return value;
    const out = {};
    for (const [childKey, child] of Object.entries(value)) out[childKey] = replace(child, childKey);
    return out;
  }
  payload = replace(payload);
  if (Array.isArray(payload?.places)) {
    const merged = [];
    const byPlaceId = new Map();
    for (const entry of payload.places) {
      const id = String(entry?.place_id || '');
      if (!id || !byPlaceId.has(id)) {
        merged.push(entry);
        if (id) byPlaceId.set(id, entry);
        continue;
      }
      const target = byPlaceId.get(id);
      if (!Array.isArray(target?.chambers) || !Array.isArray(entry?.chambers)) throw new Error(`Wonderkammer duplicate ${id} uten mergebare chambers`);
      const seen = new Set(target.chambers.map((chamber) => chamber?.id).filter(Boolean));
      for (const chamber of entry.chambers) {
        if (chamber?.id && seen.has(chamber.id)) continue;
        target.chambers.push(chamber);
        if (chamber?.id) seen.add(chamber.id);
      }
    }
    payload.places = merged;
  }
  writeJson(file, payload);
  wonderkammerChanges.push(rel(file));
}

// Remove old place-i18n keys rather than risk merging purpose-specific descriptions into canonical parent text.
const i18nChanges = [];
for (const file of walkJson(path.join(root, 'data/i18n/content/places'))) {
  const before = fs.readFileSync(file, 'utf8');
  if (![...retiredIds].some((id) => before.includes(`\"${id}\"`))) continue;
  const payload = JSON.parse(before);
  let changed = false;
  for (const oldId of retiredIds) {
    if (Object.prototype.hasOwnProperty.call(payload, oldId)) {
      delete payload[oldId];
      changed = true;
    }
  }
  if (changed) {
    writeJson(file, payload);
    i18nChanges.push(rel(file));
  }
}

// Retarget remaining exact active references byte-for-byte. This intentionally leaves filenames unchanged.
const handled = new Set([
  rel(sourceFile), rel(splitManifestFile), rel(splitIndexFile), rel(manifestFile),
  ...Object.values(definitions).map((definition) => definition.newPlaceRel),
  ...civicationChanges, ...wonderkammerChanges, ...i18nChanges,
  ...[...retiredIds].map((id) => rel(path.join(splitDir, `${id}.json`))),
]);
const referenceChanges = [];
for (const file of walkJson(path.join(root, 'data'))) {
  const relative = rel(file);
  if (handled.has(relative) || /(^|\/)(archive|arkiv)(\/|$)/i.test(relative)) continue;
  const before = fs.readFileSync(file, 'utf8');
  if (![...retiredIds].some((id) => before.includes(`\"${id}\"`))) continue;
  let after = before;
  for (const [oldId, newId] of Object.entries(migrations)) after = after.split(`\"${oldId}\"`).join(`\"${newId}\"`);
  if (after !== before) {
    fs.writeFileSync(file, after);
    referenceChanges.push(relative);
  }
}

// Retire old coordinate evidence and register canonical evidence.
for (const file of walkJson(path.join(root, 'data/coordinate-evidence'))) {
  let payload;
  try { payload = readJson(file); } catch { continue; }
  if (retiredIds.has(payload?.placeId)) fs.unlinkSync(file);
}

const evidenceManifest = readJson(evidenceManifestFile);
const retiredEvidenceNames = new Set([
  'oslo/sport/lekeplass_kampen_park.json',
  'oslo/sport/treningssted_kampen_park.json',
  'oslo/sport/aktivitet_rudolf_nilsens_plass.json',
]);
evidenceManifest.files = (evidenceManifest.files || []).filter((entry) => !retiredEvidenceNames.has(entry));
for (const definition of Object.values(definitions)) {
  if (!evidenceManifest.files.includes(definition.evidenceEntry)) evidenceManifest.files.push(definition.evidenceEntry);
}
evidenceManifest.files.sort((a, b) => a.localeCompare(b, 'nb'));
writeJson(evidenceManifestFile, evidenceManifest);

for (const [newId, place] of [['kampen_park', kampen], ['rudolf_nilsens_plass', rudolf]]) {
  const definition = definitions[newId];
  const evidencePath = path.join(root, 'data/coordinate-evidence', definition.evidenceEntry);
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  writeJson(evidencePath, {
    schemaVersion: '1.0',
    placeId: newId,
    placeFile: definition.newPlaceRel,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: place.name, resolvedIdentity: `${place.name} – canonical park/byrom identity`, identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'park', requiresSplit: false, splitReason: '' },
    requiredEvidence: ['official physical-place definition', 'exact named stable park polygon', 'explicit retirement of purpose-specific overlapping IDs'],
    evidence: [
      { sourceProvider: 'municipality', sourceName: definition.officialSourceName, sourceUrl: definition.officialSourceUrl, sourceObjectId: `oslo-kommune:park:${newId}`, sourceQuality: 'official_physical_scope_definition', finding: `${definition.officialSourceName} defines the physical park/byrom and its internal activity functions.`, canVerifyCoordinate: false, reason: 'Resolves the physical identity before geometry selection.' },
      { sourceProvider: 'osm', sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: 'exact_named_polygon_after_object_type_filter', finding: 'One exact named park polygon in predefined Oslo scope, matching the saved intake candidate stable ID.', canVerifyCoordinate: true, reason: place.coordNote },
    ],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: place.sourceObjectId, lat: place.lat, lon: place.lon, coordRole: 'area_anchor', canApplyToPlace: true }],
    coordinateCandidates: [{ sourceProvider: 'osm', sourceObjectId: place.sourceObjectId, lat: place.lat, lon: place.lon, coordRole: 'area_anchor', canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: `Canonical ${newId} applied and overlapping purpose-specific IDs retired.` },
    notes: [place.coordNote],
  });
}

// Enforce legacy aliases.
let aliasTool = fs.readFileSync(aliasToolFile, 'utf8');
for (const [oldId, newId] of Object.entries(migrations)) {
  if (!aliasTool.includes(`${oldId}: '${newId}'`)) aliasTool = aliasTool.replace(/const aliases: AliasMap = \{([^\n]*)\};/, (_match, body) => `const aliases: AliasMap = {${body}, ${oldId}: '${newId}' };`);
}
writeText(aliasToolFile, aliasTool);

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 126 (2026-07-21)')) {
  const rows = [kampen, rudolf].map((place) => `| 126 | \`${place.id}\` | ${place.name} | ${place.coordStatus} | \`${place.sourceObjectId}\` |`).join('\n');
  const paragraph = 'Batch 126 (2026-07-21) normaliserer aktivitetsorienterte pseudo-ID-er til de fysiske park-/byromidentitetene. `lekeplass_kampen_park` og `treningssted_kampen_park` samles i `kampen_park`; `aktivitet_rudolf_nilsens_plass` blir `rudolf_nilsens_plass`. Oslo kommune beskriver Kampen park som én park med blant annet lekeplass, bordtennis og treningsmuligheter, og Rudolf Nilsens plass som ett samlet park-/byrom med lekeplass, treningsapparater, multibane og kunstgress/kunstis. Begge canonical steder bruker ett eksakt navngitt OSM-parkpolygon med stable ID fra den tidligere intake-kontrollen. De gamle aktivitets-ID-ene fjernes og beholdes kun som alias/innholdslag; ingen overlappende markører opprettes.';
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 126');
  protocol = protocol.replace(marker, `${rows}\n\n${paragraph}\n\n${marker}`);
  writeText(protocolFile, protocol);
}

writeJson(path.join(reportDir, 'results.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  migrations: [
    { oldIds: ['lekeplass_kampen_park', 'treningssted_kampen_park'], newId: 'kampen_park', sourceObjectId: kampen.sourceObjectId, lat: kampen.lat, lon: kampen.lon },
    { oldIds: ['aktivitet_rudolf_nilsens_plass'], newId: 'rudolf_nilsens_plass', sourceObjectId: rudolf.sourceObjectId, lat: rudolf.lat, lon: rudolf.lon },
  ],
  civicationChanges,
  wonderkammerChanges,
  i18nChanges,
  referenceChanges,
  remainingSourceIds: remaining.map((place) => place.id),
});
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 126 – Kampen park and Rudolf Nilsens plass canonical identities', '',
  '- `lekeplass_kampen_park` + `treningssted_kampen_park` → `kampen_park`',
  '- `aktivitet_rudolf_nilsens_plass` → `rudolf_nilsens_plass`', '',
  `Kampen park geometry: \`${kampen.sourceObjectId}\``,
  `Rudolf Nilsens plass geometry: \`${rudolf.sourceObjectId}\``, '',
  'Activity/play/training content is retained as use layers, while the physical park/byrom is the canonical map identity.',
].join('\n'));

// Rebuild and enforce identity/evidence integrity before standard runner gates.
execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/check_place_id_aliases.mjs'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });

const rebuiltIds = new Set(readJson(runtimeIndexFile).map((place) => place?.id).filter(Boolean));
for (const oldId of retiredIds) if (rebuiltIds.has(oldId)) throw new Error(`Runtime inneholder fortsatt legacy ${oldId}`);
for (const newId of newIds) if (!rebuiltIds.has(newId)) throw new Error(`Runtime mangler canonical ${newId}`);

const residuals = [];
for (const file of walkJson(path.join(root, 'data'))) {
  const relative = rel(file);
  if (/(^|\/)(archive|arkiv)(\/|$)/i.test(relative)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const oldId of retiredIds) if (text.includes(`\"${oldId}\"`)) residuals.push({ file: relative, oldId });
}
if (residuals.length) throw new Error(`Legacy-ID-er står igjen i aktiv data: ${JSON.stringify(residuals.slice(0, 100))}`);

const changedFiles = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
if (changedFiles.length > 70) throw new Error(`Batch 126 diff-budsjett overskredet: ${changedFiles.length} filer`);
writeJson(path.join(reportDir, 'changed-files.json'), { count: changedFiles.length, files: changedFiles });

console.log(JSON.stringify({ batch, newIds: [...newIds], changedFileCount: changedFiles.length }, null, 2));
