#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const auditDir = path.join(root, 'reports/oslo-coordinate-retro-compliance-20260721');
const verifiedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const toPlaces = (payload) => Array.isArray(payload) ? payload : Array.isArray(payload?.places) ? payload.places : Array.isArray(payload?.items) ? payload.items : payload?.id ? [payload] : [];

function isOsloSourceFile(sourceFile) {
  return /(^|\/)(?:places_)?oslo(?:\/|_|$)/.test(String(sourceFile || '').replace(/\\/g, '/').toLowerCase());
}

function parseProtocolIds(markdown) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.trim() === '## Oslo');
  if (start < 0) throw new Error('Fant ikke ## Oslo');
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i]) && lines[i].trim() !== '## Oslo') { end = i; break; }
  }
  const ids = new Set();
  for (let i = start; i < end; i++) {
    const match = lines[i].match(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|/);
    if (match) ids.add(match[1]);
  }
  return ids;
}

function classify(place) {
  const provider = String(place.sourceProvider || '');
  const sourceId = String(place.sourceObjectId || '');
  const status = String(place.coordStatus || '');
  const note = String(place.coordNote || '');
  const locator = String(place.locatorType || '');
  const role = String(place.coordRole || '');
  const accuracy = String(place.geocodeAccuracy || '');

  if (provider === 'official_address') {
    const address = place.address || {};
    const hasAddress = ['street', 'number'].every((key) => String(address[key] || '').trim());
    if (sourceId.startsWith('geonorge-adresser-v1:') && hasAddress && status === 'verified' && accuracy === 'rooftop' && role === 'display_marker') {
      return { decision: 'pass', method: 'address_first_official_address', reason: 'Current record carries exact Geonorge address identity and canonical address-first fields.' };
    }
    return { decision: 'review', method: 'address_first_incomplete', reason: 'official_address record lacks one or more canonical address-first fields.' };
  }

  if (provider === 'kartverket') {
    if (sourceId && status === 'verified_geometry' && ['natural_area', 'park', 'linear_area', 'route', 'quay'].includes(locator)) {
      return { decision: 'pass', method: 'official_map_object_type_first', reason: 'Official Kartverket object identity is used for a non-address point/area geometry.' };
    }
    return { decision: 'review', method: 'kartverket_scope_review', reason: 'Kartverket record does not match the expected verified geometry pattern.' };
  }

  if (provider === 'manual_research') {
    const historical = status === 'verified_historical_source' && ['historic_site', 'archaeological_site'].includes(locator) && ['historical_anchor', 'line_anchor', 'area_anchor'].includes(role);
    const geometry = status === 'verified_geometry' && ['linear_area', 'route', 'street', 'park'].includes(locator) && ['line_anchor', 'area_anchor'].includes(role);
    if (sourceId && (historical || geometry) && note.length >= 40) {
      return { decision: 'pass', method: historical ? 'historical_source_first' : 'documented_semantic_geometry', reason: 'Stable research source identity and explicit historical/geometry anchor contract.' };
    }
    return { decision: 'review', method: 'manual_research_scope_review', reason: 'Manual research record needs explicit source/scope confirmation.' };
  }

  if (provider === 'osm') {
    const exactLanguage = /(eksakt navngitt|eksakt.*objekt|riktig objekttype|objekttype|forhåndsdefinert|ikke nearest|first-hit|kildegeometri|geometrisk senter|polygon|osm[- ](?:way|relation|node)|openstreetmap (?:way|relation|node)|overpass)/i.test(note);
    const geometryStatus = status === 'verified_geometry';
    const validAnchor = ['area_anchor', 'line_anchor', 'site_center', 'building_center', 'display_marker'].includes(role);
    const stableOsm = /^osm-(node|way|relation):\d+$/i.test(sourceId);
    if (stableOsm && geometryStatus && validAnchor && exactLanguage) {
      return { decision: 'pass', method: 'object_type_first_exact_osm_geometry', reason: 'Stable exact OSM object with explicit geometry/object-type selection language.' };
    }
    if (stableOsm && status === 'verified' && exactLanguage && ['poi', 'current_place', 'building', 'entrance'].includes(locator)) {
      return { decision: 'pass', method: 'object_type_first_exact_osm_object', reason: 'Stable exact named OSM object with documented semantic/object-type selection.' };
    }
    return { decision: 'review', method: 'osm_method_evidence_review', reason: 'OSM record lacks sufficient explicit evidence that object-type-first exact selection was used.' };
  }

  return { decision: 'review', method: 'unsupported_provider_or_method', reason: 'Provider/method is not automatically classifiable under the locked retrospective rules.' };
}

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
const runtime = toPlaces(readJson(path.join(root, 'data/places/places_index.json')));
const protocolIds = parseProtocolIds(fs.readFileSync(path.join(root, 'docs/coordinates/coordinate-control-protocol.md'), 'utf8'));
const current = runtime.filter((place) => verifiedStatuses.has(String(place.coordStatus || '')) && isOsloSourceFile(place.sourceFile));
const missing = current.filter((place) => !protocolIds.has(String(place.id))).sort((a, b) => String(a.id).localeCompare(String(b.id)));

const rows = missing.map((place) => ({
  placeId: place.id,
  name: place.name,
  sourceFile: place.sourceFile,
  coordStatus: place.coordStatus,
  locatorType: place.locatorType || null,
  sourceProvider: place.sourceProvider || null,
  sourceObjectId: place.sourceObjectId || null,
  geocodeAccuracy: place.geocodeAccuracy || null,
  coordRole: place.coordRole || null,
  coordType: place.coordType || null,
  coordNote: place.coordNote || null,
  ...classify(place)
}));
const pass = rows.filter((row) => row.decision === 'pass');
const review = rows.filter((row) => row.decision !== 'pass');
const byMethod = {};
for (const row of pass) byMethod[row.method] = (byMethod[row.method] || 0) + 1;

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    currentOsloVerified: current.length,
    numericProtocolIds: protocolIds.size,
    missingFromNumericProtocol: rows.length,
    methodPass: pass.length,
    methodReview: review.length
  },
  byMethod,
  pass,
  review
};
writeJson(path.join(auditDir, 'current-oslo-method-classification.json'), report);

const md = [
  '# Current Oslo verified method classification',
  '',
  'Generert: ' + report.generatedAt,
  '',
  '- Current Oslo verified*: **' + report.summary.currentOsloVerified + '**',
  '- Numeriske protokoll-placeId-er: **' + report.summary.numericProtocolIds + '**',
  '- Current verified uten numerisk protokollrad: **' + report.summary.missingFromNumericProtocol + '**',
  '- Automatisk metodisk PASS: **' + report.summary.methodPass + '**',
  '- Krever eksplisitt review: **' + report.summary.methodReview + '**',
  '',
  '## PASS per metode',
  '',
  '```json',
  JSON.stringify(byMethod, null, 2),
  '```',
  '',
  '## Krever review',
  '',
  review.length ? review.map((row) => '- `' + row.placeId + '` - ' + row.method + ': ' + row.reason + ' | provider=' + row.sourceProvider + ' | status=' + row.coordStatus + ' | source=' + row.sourceObjectId).join('\n') : '_Ingen._',
  '',
  'Detaljer: `reports/oslo-coordinate-retro-compliance-20260721/current-oslo-method-classification.json`.'
].join('\n');
writeText(path.join(auditDir, 'CURRENT_SET_METHOD_CLASSIFICATION.md'), md);

console.log(JSON.stringify({
  status: 'method_classification_materialized',
  ...report.summary,
  byMethod,
  reviewIds: review.map((row) => row.placeId)
}, null, 2));
