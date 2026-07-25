import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataRoot = path.join(root, 'data/places/naeringsliv/oslo');
const evidencePath = path.join(root, 'data/coordinate-evidence/oslo/naeringsliv/bryn_industriomrade.json');
const reportDir = path.join(root, 'reports/oslo-coordinate-bryn-status-normalization-20260725');
await fs.mkdir(reportDir, { recursive: true });

const placeId = 'bryn_industriomrade';
const sourceObjectId = 'oslobyleksikon:bryn-strok';
const sourceUrl = 'https://oslobyleksikon.no/side/Bryn_%28str%C3%B8k%29';
const blockedReason = 'Bredt og uavgrenset industriområde mangler kildebelagt geometri/anchors.';
const nextAction = 'Definer fysisk scope og hent offisiell områdegeometri eller flere kildebelagte area-ankre før canonical koordinat kan godkjennes.';
const note = `${blockedReason} Dagens koordinat beholdes kun som redaksjonell områdeproxy og skal ikke tolkes som dokumentert fysisk sentrum. ${nextAction}`;

async function walk(dir) {
  const out = [];
  let entries = [];
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}
const rel = (file) => path.relative(root, file).split(path.sep).join('/');
const isFullPlace = (node) => node && typeof node === 'object' && (
  Object.prototype.hasOwnProperty.call(node, 'desc')
  || Object.prototype.hasOwnProperty.call(node, 'popupDesc')
  || Array.isArray(node.emne_ids)
  || Object.prototype.hasOwnProperty.call(node, 'quiz_profile')
);
function mergeLinks(existing) {
  const result = Array.isArray(existing) ? [...existing] : [];
  if (!result.some((item) => item?.url === sourceUrl)) {
    result.push({ type: 'source', label: 'Oslo byleksikon – Bryn', url: sourceUrl, lang: 'nb', verifiedAt: '2026-07-25' });
  }
  return result;
}

let before = null;
const occurrences = [];
function updateNode(node, filePath) {
  if (Array.isArray(node)) return node.map((value) => updateNode(value, filePath));
  if (!node || typeof node !== 'object') return node;
  let current = node;
  if (node.id === placeId && Number.isFinite(node.lat) && Number.isFinite(node.lon) && Number.isFinite(node.r)) {
    const full = isFullPlace(node);
    if (full && !before) {
      before = { lat: node.lat, lon: node.lon, r: node.r, year: node.year ?? null, coordStatus: node.coordStatus ?? null, coordType: node.coordType ?? null };
    }
    current = {
      ...node,
      coordStatus: 'needs_source',
      coordType: 'unverified_area_anchor',
    };
    if (full) {
      current = {
        ...current,
        locatorType: 'linear_area',
        sourceProvider: 'manual_research',
        sourceObjectId,
        geocodeAccuracy: 'approximate',
        coordRole: 'area_anchor',
        coordSource: 'manual_research',
        coordSourceId: sourceObjectId,
        coordSourceUrl: sourceUrl,
        coordNote: note,
        externalLinks: mergeLinks(node.externalLinks),
      };
    }
    occurrences.push({ file: filePath, fullPlace: full });
  }
  const result = { ...current };
  for (const [key, value] of Object.entries(result)) {
    if (key === 'externalLinks' || key === 'geometry') continue;
    if (value && typeof value === 'object') result[key] = updateNode(value, filePath);
  }
  return result;
}

const changedFiles = [];
for (const file of await walk(dataRoot)) {
  const filePath = rel(file);
  if (filePath.includes('/arkiv/')) continue;
  let payload;
  try { payload = JSON.parse(await fs.readFile(file, 'utf8')); } catch { continue; }
  const beforeText = `${JSON.stringify(payload, null, 2)}\n`;
  const updated = updateNode(payload, filePath);
  const afterText = `${JSON.stringify(updated, null, 2)}\n`;
  if (beforeText !== afterText) {
    await fs.writeFile(file, afterText, 'utf8');
    changedFiles.push(filePath);
  }
}
if (!before) throw new Error('Bryn full canonical record not found');
if (!occurrences.length) throw new Error('Bryn coordinate occurrences not found');

const evidence = JSON.parse(await fs.readFile(evidencePath, 'utf8'));
const normalizedEvidence = {
  ...evidence,
  schemaVersion: '1.0',
  evidenceStatus: 'needs_research',
  coordinateDecision: 'needs_geometry',
  currentCoordinate: {
    lat: before.lat,
    lon: before.lon,
    r: before.r,
    coordStatus: 'needs_source',
    coordSource: 'manual_research',
    coordType: 'unverified_area_anchor',
    coordNote: note,
  },
  coordinateCandidates: [
    {
      lat: before.lat,
      lon: before.lon,
      coordRole: 'area_anchor',
      sourceObjectId,
      canApplyToPlace: false,
      reason: 'Redaksjonell områdeproxy uten kildebelagt avgrensning.',
    },
  ],
  decision: {
    canBecomeVerified: false,
    blockedReason,
    nextAction,
  },
  notes: [note, 'Statusnormalisering 2026-07-25; ingen koordinatendring.'],
};
await fs.writeFile(evidencePath, `${JSON.stringify(normalizedEvidence, null, 2)}\n`, 'utf8');

const summary = {
  version: '2026-07-25',
  productionApplied: true,
  placeId,
  before,
  after: {
    lat: before.lat,
    lon: before.lon,
    r: before.r,
    coordStatus: 'needs_source',
    coordType: 'unverified_area_anchor',
    locatorType: 'linear_area',
    sourceProvider: 'manual_research',
    sourceObjectId,
  },
  coordinateChanged: false,
  changedDataFiles: changedFiles,
  occurrencesUpdated: occurrences,
  evidenceFile: rel(evidencePath),
  canonicalYearPreserved: true,
};
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), '# Bryn coordinate status normalization\n\nThe existing proxy coordinate is unchanged. Canonical status is now explicitly `needs_source` with an updated evidence record.\n', 'utf8');
console.log(JSON.stringify(summary, null, 2));
