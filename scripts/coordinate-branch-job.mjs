#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BATCH = 168;
const PLACE_ID = 'lillomarka';
const PLACE_NAME = 'Lillomarka';
const RELATION_ID = 5806405;
const LOCKED_LAT = 60.0056538;
const LOCKED_LON = 10.8585573;
const VERIFIED_AT = '2026-07-23';
const PLACE_REL_PATH = 'places/natur/oslo/lillomarka.json';
const PLACE_PATH = path.join(ROOT, 'data', PLACE_REL_PATH);
const EVIDENCE_PATH = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/lillomarka.json');
const MANIFEST_PATH = path.join(ROOT, 'data/places/manifest.json');
const PROTOCOL_PATH = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-168-lillomarka');
const OSM_URL = `https://www.openstreetmap.org/relation/${RELATION_ID}`;
const NOMINATIM_URL = `https://nominatim.openstreetmap.org/lookup?osm_ids=R${RELATION_ID}&format=jsonv2&polygon_geojson=1&extratags=1`;
const MUNICIPAL_URL = 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/marka/';

function fail(message) {
  throw new Error(`[batch-${BATCH}] ${message}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function extractPlaces(doc) {
  if (Array.isArray(doc)) return doc;
  if (doc && Array.isArray(doc.places)) return doc.places;
  if (doc && typeof doc === 'object' && typeof doc.id === 'string') return [doc];
  return [];
}

function haversineM(aLat, aLon, bLat, bLon) {
  const R = 6371000;
  const toRad = (n) => n * Math.PI / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const p = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(p));
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'History-Go-coordinate-control/1.0 (https://github.com/Paradispartiet/History-Go)',
      Accept: 'text/html,application/json;q=0.9,*/*;q=0.8'
    },
    signal: AbortSignal.timeout(45000)
  });
  if (!response.ok) fail(`HTTP ${response.status} from ${url}`);
  return response.text();
}

if (fs.existsSync(PLACE_PATH)) fail(`${PLACE_REL_PATH} already exists on current main`);
if (fs.existsSync(EVIDENCE_PATH)) fail('coordinate evidence already exists on current main');

const manifest = readJson(MANIFEST_PATH);
if (!Array.isArray(manifest.files)) fail('data/places/manifest.json has no files[] array');
if (manifest.files.includes(PLACE_REL_PATH)) fail('manifest already contains Lillomarka file');

const duplicateRows = [];
const targetName = normalize(PLACE_NAME);
for (const relativePath of manifest.files) {
  const absolutePath = path.join(ROOT, 'data', relativePath);
  if (!fs.existsSync(absolutePath)) continue;
  let doc;
  try {
    doc = readJson(absolutePath);
  } catch {
    continue;
  }
  for (const place of extractPlaces(doc)) {
    if (place?.id === PLACE_ID || normalize(place?.name) === targetName) {
      duplicateRows.push({ file: relativePath, id: place?.id, name: place?.name });
    }
  }
}
if (duplicateRows.length) fail(`canonical duplicate gate failed: ${JSON.stringify(duplicateRows)}`);

const [lookupText, municipalHtml] = await Promise.all([
  fetchText(NOMINATIM_URL),
  fetchText(MUNICIPAL_URL)
]);

let lookup;
try {
  lookup = JSON.parse(lookupText);
} catch {
  fail('Nominatim response was not JSON');
}
if (!Array.isArray(lookup) || lookup.length !== 1) fail(`expected one locked OSM lookup result, got ${lookup?.length ?? 'non-array'}`);
const object = lookup[0];
if (object.osm_type !== 'relation' || Number(object.osm_id) !== RELATION_ID) fail('lookup did not resolve locked relation 5806405');
if (object.name !== PLACE_NAME) fail(`locked relation name changed: ${object.name}`);
if (object.category !== 'place' || object.type !== 'woodland') fail(`locked object type changed: ${object.category}/${object.type}`);
if (!['Polygon', 'MultiPolygon'].includes(object.geojson?.type)) fail(`expected woodland area geometry, got ${object.geojson?.type}`);
if (!/Lillomarka/i.test(municipalHtml)) fail('Oslo kommune Marka page no longer names Lillomarka');

const lat = Number(object.lat);
const lon = Number(object.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) fail('locked relation has no finite coordinate');
const driftM = haversineM(LOCKED_LAT, LOCKED_LON, lat, lon);
if (driftM > 30) fail(`fresh relation anchor drifted ${driftM.toFixed(1)} m from locked intake coordinate`);

const coordNote = 'Batch 168 oppretter Lillomarka som ett bredt, navngitt Marka- og skogsområde. Oslo kommune omtaler Lillomarka som en egen del av Oslomarka og knytter området til friluftsliv, folkehelse og naturmangfold. Fresh exact-object lookup hard-gater OSM relation 5806405 som name=Lillomarka, category=place, type=woodland med polygongeometri. Canonical lat/lon er karttjenestens geometriske representasjonspunkt for den eksakte relationen. Punktet representerer hele det navngitte skogsområdet og er ikke en løypestart, markastue, innsjø eller nearest/first-hit-proxy.';

const place = {
  id: PLACE_ID,
  name: PLACE_NAME,
  lat,
  lon,
  r: 450,
  category: 'natur',
  emne_ids: [
    'em_natur_naturopplevelse_folkehelse',
    'em_natur_arter_habitat_mangfold'
  ],
  desc: 'Stort skog- og friluftsområde nordøst i Oslomarka, med sammenhengende skog, vann, stier og utfartsårer mellom Oslo og Nittedal.',
  popupDesc: 'Lillomarka er en egen geografisk del av Oslomarka nordøst for byen. Området strekker seg på tvers av kommunegrensen mellom Oslo og Nittedal og rommer sammenhengende skog, vann, høyder, stier og markastuer. Oslo kommune løfter fram Lillomarka som et område for friluftsliv og folkehelse, samtidig som skogforvaltning og naturmangfold er en del av helheten.\n\nHistory Go-stedet representerer derfor det brede navngitte skogsområdet. Lilloseter, Steinbruvann, Badedammen, turveier og andre konkrete mål kan opptre som egne steder eller innholdslag; ingen av dem brukes som kunstig sentrum for hele Lillomarka.',
  tags: [
    'skog',
    'marka',
    'friluftsliv',
    'naturmangfold',
    'lillomarka'
  ],
  underbadge_ids: [
    'skog',
    'friluftsliv',
    'marka'
  ],
  visual: {
    designCode: 'nature_miniature'
  },
  quiz_profile: {
    place_type: 'markaområde',
    subtype: 'stort_navngitt_skog_og_friluftsomrade',
    signature_features: [
      'egen del av Oslomarka',
      'skogsområde mellom Oslo og Nittedal',
      'vann, stier og markastuer'
    ],
    primary_angles: [
      'skoglandskap',
      'friluftsliv',
      'naturmangfold',
      'by_og_marka'
    ],
    question_families: [
      'gjenkjenning',
      'romlig_lesning',
      'naturbruk',
      'landskapssystem'
    ],
    avoid_angles: [
      'forveksle_hele_området_med_lilloseter',
      'bruke_en_løypestart_som_sentrum'
    ],
    must_include: [
      'at Lillomarka er et bredt navngitt skogsområde',
      'skillet mellom området og konkrete delsteder'
    ],
    contrast_targets: [
      'nordmarka',
      'østmarka',
      'lilloseter'
    ],
    notes: 'Spør om det geografiske Marka-området og dets landskap, ikke som én tur eller ett utfartssted.'
  },
  locatorType: 'natural_area',
  sourceProvider: 'osm',
  sourceObjectId: `osm-relation:${RELATION_ID}`,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: `OpenStreetMap relation ${RELATION_ID} – Lillomarka; scope cross-checked with Oslo kommune – Marka`,
  coordSourceId: `osm-relation:${RELATION_ID}`,
  coordSourceUrl: OSM_URL,
  coordType: 'woodland_area_anchor',
  coordVerifiedAt: VERIFIED_AT,
  coordNote,
  externalLinks: [
    {
      type: 'reference',
      label: 'Oslo kommune – Marka',
      url: MUNICIPAL_URL,
      lang: 'nb',
      verifiedAt: VERIFIED_AT
    },
    {
      type: 'coordinate_source',
      label: `OpenStreetMap – Lillomarka relation ${RELATION_ID}`,
      url: OSM_URL,
      lang: 'nb',
      verifiedAt: VERIFIED_AT
    }
  ]
};

const evidence = {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: `data/${PLACE_REL_PATH}`,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat,
    lon,
    r: 450,
    coordStatus: 'verified_geometry',
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote
  },
  identity: {
    currentName: PLACE_NAME,
    resolvedIdentity: 'Lillomarka som ett bredt navngitt Marka- og skogsområde',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'natural_area',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'exact locked OSM area identity',
    'official municipal scope cross-check',
    'canonical duplicate control against current main'
  ],
  evidence: [
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap – Lillomarka relation ${RELATION_ID}`,
      sourceUrl: OSM_URL,
      sourceObjectId: `osm-relation:${RELATION_ID}`,
      sourceQuality: 'unique_exact_named_woodland_relation',
      finding: `Fresh lookup resolves relation ${RELATION_ID} as name=Lillomarka, category=place, type=woodland and ${object.geojson.type} geometry. Geometric representation point: ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: 'Exact named physical area geometry; no nearest or first-hit selection.'
    },
    {
      sourceProvider: 'municipality',
      sourceName: 'Oslo kommune – Marka',
      sourceUrl: MUNICIPAL_URL,
      sourceObjectId: 'oslo-kommune:marka:lillomarka',
      sourceQuality: 'official_named_marka_scope',
      finding: 'Oslo kommune names Lillomarka as one of the Marka areas and connects Oslomarka to outdoor life, public health and biodiversity.',
      canVerifyCoordinate: false,
      reason: 'Official identity and scope cross-check; exact area geometry comes from the locked OSM relation.'
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: `osm-relation:${RELATION_ID}`,
      canApplyToPlace: true
    },
    {
      sourceProvider: 'municipality',
      sourceObjectId: 'oslo-kommune:marka:lillomarka',
      canApplyToPlace: false
    }
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: `osm-relation:${RELATION_ID}`,
      geometryType: object.geojson.type,
      boundingBox: object.boundingbox?.map(Number) ?? [],
      coordRole: 'area_anchor',
      canApplyToPlace: true
    }
  ],
  coordinateCandidates: [
    {
      lat,
      lon,
      coordRole: 'area_anchor',
      sourceObjectId: `osm-relation:${RELATION_ID}`,
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Exact Lillomarka area identity and geometric representation point are applied to canonical place.'
  },
  notes: [
    coordNote,
    `Fresh anchor drift from the locked intake coordinate: ${driftM.toFixed(2)} m.`,
    'Place-id and normalized name were absent from all current manifest-loaded canonical place data before production.'
  ]
};

writeJson(PLACE_PATH, place);
writeJson(EVIDENCE_PATH, evidence);
manifest.files.push(PLACE_REL_PATH);
writeJson(MANIFEST_PATH, manifest);

let protocol = fs.readFileSync(PROTOCOL_PATH, 'utf8');
if (protocol.includes('| 168 |')) fail('protocol already contains batch 168');
const marker = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
if (!protocol.includes(marker)) fail('protocol insertion marker not found');
const protocolBlock = `| 168 | \`lillomarka\` | Lillomarka | verified_geometry | \`osm-relation:${RELATION_ID}\` |\n\nBatch 168 (${VERIFIED_AT}) oppretter Lillomarka som ett bredt navngitt Marka- og skogsområde, ikke som et utfartssted eller en løypestart. Oslo kommune navngir Lillomarka som en egen del av Oslomarka og knytter Marka til friluftsliv, folkehelse og naturmangfold. Fresh exact-object lookup hard-gater OSM relation ${RELATION_ID} som name=Lillomarka, category=place, type=woodland med arealgeometri. Canonical lat/lon er det geometriske representasjonspunktet for den eksakte relationen. Lilloseter, vann, stier og startpunkter brukes ikke som proxy; nearest/first-hit brukes ikke.\n\n`;
protocol = protocol.replace(marker, `${protocolBlock}${marker}`);
fs.writeFileSync(PROTOCOL_PATH, protocol);

fs.mkdirSync(REPORT_DIR, { recursive: true });
writeJson(path.join(REPORT_DIR, 'nominatim-relation-5806405.json'), lookup);
writeJson(path.join(REPORT_DIR, 'batch-168-result.json'), {
  batch: BATCH,
  placeId: PLACE_ID,
  name: PLACE_NAME,
  status: 'production_applied',
  sourceObjectId: `osm-relation:${RELATION_ID}`,
  sourceObjectType: `${object.category}/${object.type}`,
  geometryType: object.geojson.type,
  coordinate: { lat, lon, r: 450 },
  lockedCoordinate: { lat: LOCKED_LAT, lon: LOCKED_LON },
  driftM,
  duplicateRows,
  manifestFile: PLACE_REL_PATH
});
fs.writeFileSync(path.join(REPORT_DIR, 'oslo-kommune-marka.html'), municipalHtml);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Batch 168 — Lillomarka sources\n\n- Locked geometry: [OpenStreetMap relation ${RELATION_ID}](${OSM_URL})\n- Fresh exact-object lookup: ${NOMINATIM_URL}\n- Official scope cross-check: [Oslo kommune — Marka](${MUNICIPAL_URL})\n\nDecision: produce one broad named woodland/Marka place from the exact relation. Do not substitute Lilloseter, a lake, a trailhead or a route start.\n`);

console.log(`Batch ${BATCH} applied ${PLACE_ID} at ${lat}, ${lon}; drift=${driftM.toFixed(2)}m; source=osm-relation:${RELATION_ID}`);
