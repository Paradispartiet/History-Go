import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'reports/ovre-spinneri-ra-heritage-objects-20260720');
fs.mkdirSync(outDir, { recursive: true });

const apiBase = 'https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner';
const bbox = '10.763,59.953,10.768,59.957';

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-research/1.0' },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

function flattenCoordinates(geometry) {
  if (!geometry?.coordinates) return [];
  const out = [];
  const walk = (value) => {
    if (!Array.isArray(value)) return;
    if (
      value.length >= 2 &&
      Number.isFinite(Number(value[0])) &&
      Number.isFinite(Number(value[1])) &&
      !Array.isArray(value[0])
    ) {
      out.push({ lon: Number(value[0]), lat: Number(value[1]) });
      return;
    }
    for (const child of value) walk(child);
  };
  walk(geometry.coordinates);
  return out;
}

function geometrySummary(geometry) {
  const points = flattenCoordinates(geometry);
  if (!points.length) return { type: geometry?.type ?? null, pointCount: 0, bbox: null, center: null };
  const lats = points.map((point) => point.lat);
  const lons = points.map((point) => point.lon);
  const bboxValue = [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
  return {
    type: geometry?.type ?? null,
    pointCount: points.length,
    bbox: bboxValue,
    center: {
      lon: (bboxValue[0] + bboxValue[2]) / 2,
      lat: (bboxValue[1] + bboxValue[3]) / 2,
    },
  };
}

function compactFeature(feature) {
  const p = feature.properties || {};
  return {
    id: feature.id ?? p.id ?? p.kulturminneId ?? null,
    kulturminneId: p.kulturminneId ?? null,
    lokalitetId: p.lokalitetId ?? null,
    lokalId: p.lokalId ?? null,
    navn: p.navn ?? null,
    informasjon: p.informasjon ?? null,
    enkeltminnekategori: p.enkeltminnekategori ?? null,
    enkeltminneart: p.enkeltminneart ?? null,
    opprinneligFunksjon: p.opprinneligFunksjon ?? null,
    kommune: p.kommune ?? null,
    vernetype: p.vernetype ?? null,
    linkKulturminnesok: p.linkKulturminnesøk ?? p.linkKulturminnesok ?? null,
    linkAskeladden: p.linkAskeladden ?? null,
    geometry: geometrySummary(feature.geometry),
    allProperties: p,
  };
}

const collectionResults = {};
for (const collection of ['lokaliteter', 'enkeltminner']) {
  const url = `${apiBase}/collections/${collection}/items?bbox=${bbox}&limit=1000&f=json`;
  const data = await fetchJson(url);
  fs.writeFileSync(path.join(outDir, `${collection}-bbox-raw.json`), `${JSON.stringify({ url, data }, null, 2)}\n`);
  collectionResults[collection] = {
    url,
    numberMatched: data.numberMatched ?? null,
    numberReturned: data.numberReturned ?? data.features?.length ?? 0,
    features: (data.features || []).map(compactFeature),
  };
}

const directUrls = [
  `${apiBase}/collections/lokaliteter/items/165570?f=json`,
  `${apiBase}/collections/enkeltminner/items/165570-1?f=json`,
  `${apiBase}/collections/enkeltminner/items/165570-2?f=json`,
  `${apiBase}/collections/enkeltminner/items/165570-3?f=json`,
  `${apiBase}/collections/enkeltminner/items/165570-4?f=json`,
  `${apiBase}/collections/enkeltminner/items/165570-5?f=json`,
  `${apiBase}/collections/enkeltminner/items/165570-6?f=json`,
  `${apiBase}/collections/enkeltminner/items/165570-7?f=json`,
  `${apiBase}/collections/enkeltminner/items/165570-8?f=json`,
  `${apiBase}/collections/enkeltminner/items/165570-9?f=json`,
  `${apiBase}/collections/enkeltminner/items/165570-10?f=json`,
];
const directItems = [];
for (const url of directUrls) {
  try {
    const data = await fetchJson(url);
    directItems.push({ url, ok: true, feature: compactFeature(data) });
  } catch (error) {
    directItems.push({ url, ok: false, error: String(error) });
  }
}
fs.writeFileSync(path.join(outDir, 'direct-items.json'), `${JSON.stringify(directItems, null, 2)}\n`);

const relevant = {
  localiteter: collectionResults.lokaliteter.features.filter((feature) => {
    const values = [feature.id, feature.kulturminneId, feature.lokalitetId, feature.lokalId].map(String);
    return values.some((value) => value === '165570' || value.startsWith('165570-'));
  }),
  enkeltminner: collectionResults.enkeltminner.features.filter((feature) => {
    const values = [feature.id, feature.kulturminneId, feature.lokalitetId, feature.lokalId].map(String);
    return values.some((value) => value === '165570' || value.startsWith('165570-'));
  }),
};

const namedNearby = {
  localiteter: collectionResults.lokaliteter.features.filter((feature) => feature.navn),
  enkeltminner: collectionResults.enkeltminner.features.filter((feature) => feature.navn),
};

const summary = {
  date: '2026-07-20',
  placeId: 'seilduksfabrikken_nydalen',
  source: {
    dataset: 'Riksantikvaren – Kulturminner: Lokaliteter, Enkeltminner og Sikringssoner',
    apiBase,
    bbox,
    rationale:
      'Riksantikvaren defines an enkeltminne as the physical cultural heritage object with its own geometry, while a lokalitet can represent the wider multi-building complex. This pass checks whether Kulturminne-ID 165570 exposes separate physical sub-objects for Nydalens Compagnie.',
  },
  relevant,
  namedNearby,
  directItems,
  conclusion: {
    has165570Locality: relevant.localiteter.length > 0 || directItems.some((item) => item.ok && String(item.feature?.id) === '165570'),
    numberOf165570Enkeltminner: relevant.enkeltminner.length,
    decision:
      relevant.enkeltminner.length > 0
        ? 'inspect_named_or_geometrically_separate_heritage_subobjects'
        : 'no_public_165570_subobjects_found_in_bbox',
  },
};

fs.writeFileSync(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(
  path.join(outDir, 'README.md'),
  `# Øvre Spinneri — Riksantikvaren heritage-object research\n\nDate: 2026-07-20\n\nThis pass queries Riksantikvaren's public OGC Features API for all localities and individual heritage objects in a tight bounding box around Campus G12, then isolates Kulturminne-ID 165570 and attempts direct sub-object IDs.\n\nThe purpose is to replace visual or OSM-based guessing with official heritage geometry. Riksantikvaren's data model distinguishes a wider locality from physical individual heritage objects (enkeltminner), each of which can carry its own geometry and information.\n\n165570 enkeltminner found in the bounding box: **${relevant.enkeltminner.length}**\n\nDecision: **${summary.conclusion.decision}**\n`,
);

console.log(JSON.stringify(summary, null, 2));
