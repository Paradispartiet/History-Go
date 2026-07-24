import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const DATE = '2026-07-24';
const PLACE_ID = 'bryn_industriomrade';
const REPORT_DIR = 'reports/oslo-coordinate-bryn-official-scope-research-post-195';
const PROTOCOL_PATH = 'docs/coordinates/coordinate-control-protocol.md';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/naeringsliv/bryn_industriomrade.json';
const QUEUE_PATH = 'reports/oslo-coordinate-unresolved-queue-audit-post-195/summary.json';
const PLACE_PATH = 'data/places/naeringsliv/oslo/places_naeringsliv/bryn_industriomrade.json';
const OFFICIAL_VPOR_PDF = 'https://innsyn.pbe.oslo.kommune.no/saksinnsyn/showfile.asp?fileid=8647110&jno=2019117697';
const HOVIN_COLLECTION_ID = '09114e10ef2f4e3d9aeeef851351ff52';
const HOVIN_COLLECTION_URL = `https://www.arcgis.com/sharing/rest/content/items/${HOVIN_COLLECTION_ID}`;
const PLANINNSYN_URL = 'https://od2.pbe.oslo.kommune.no/kart/';
const BYLEKSIKON_URL = 'https://oslobyleksikon.no/side/Bryn_%28str%C3%B8k%29';
const BRYN_BBOX = { south: 59.898, west: 10.785, north: 59.925, east: 10.85 };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function safeName(value) {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&aring;', 'å')
    .replaceAll('&oslash;', 'ø')
    .replaceAll('&aelig;', 'æ')
    .replaceAll('&quot;', '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function snippets(text, needles, radius = 360, max = 80) {
  const lower = String(text).toLowerCase();
  const rows = [];
  for (const needle of needles) {
    let from = 0;
    while (rows.length < max) {
      const index = lower.indexOf(needle.toLowerCase(), from);
      if (index < 0) break;
      rows.push({
        needle,
        snippet: normalizeText(String(text).slice(Math.max(0, index - radius), Math.min(String(text).length, index + needle.length + radius)))
      });
      from = index + needle.length;
    }
  }
  return rows;
}

function parseJsonMaybe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractScriptUrls(html, baseUrl) {
  const urls = new Set();
  for (const match of String(html).matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) {
    try {
      urls.add(new URL(match[1], baseUrl).href);
    } catch {}
  }
  return [...urls];
}

function extractUrls(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  const urls = new Set();
  for (const match of text.matchAll(/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+/g)) {
    urls.add(match[0].replaceAll('\\/', '/').replace(/[),.;]+$/, ''));
  }
  return [...urls];
}

function collectItemIds(value) {
  const text = JSON.stringify(value ?? {});
  return [...new Set([...text.matchAll(/\b[a-f0-9]{32}\b/gi)].map((match) => match[0].toLowerCase()))];
}

function collectGeometryObjects(value, sourceLabel, sourceUrl) {
  const out = [];
  const queue = [{ value, path: '$' }];
  let visited = 0;
  while (queue.length && visited < 250000) {
    const current = queue.shift();
    const object = current.value;
    visited += 1;
    if (!object || typeof object !== 'object') continue;

    const raw = JSON.stringify(object);
    const lower = raw.toLowerCase();
    const hasBryn = /\bbryn\b|brynområdet|brynomradet/.test(lower);
    const hasIndustrial = /industri|næring|naering|lager|produksjon|fabrikk|brynsfossen|hovedbanen/.test(lower);
    const hasPlanning = /vpor|veiledende plan|utviklingsområde|utviklingsomrade|knutepunkt|planområde|planomrade|transformasjon/.test(lower);
    const geometry = object.geometry ?? null;
    const hasGeometry = !!geometry
      || Array.isArray(object.rings)
      || Array.isArray(object.paths)
      || Array.isArray(object.points)
      || (Number.isFinite(Number(object.x)) && Number.isFinite(Number(object.y)))
      || (Number.isFinite(Number(object.latitude ?? object.lat)) && Number.isFinite(Number(object.longitude ?? object.lon ?? object.lng)));

    if (hasBryn && hasGeometry) {
      out.push({
        sourceLabel,
        sourceUrl,
        path: current.path,
        hasIndustrialSemantics: hasIndustrial,
        hasPlanningSemantics: hasPlanning,
        name: object.name ?? object.title ?? object.label ?? object.attributes?.name ?? object.attributes?.navn ?? null,
        id: object.id ?? object.objectId ?? object.attributes?.OBJECTID ?? object.attributes?.id ?? null,
        spatialReference: object.spatialReference ?? geometry?.spatialReference ?? null,
        geometryType: geometry?.type ?? (object.rings ? 'Polygon' : object.paths ? 'Polyline' : object.points ? 'Multipoint' : 'Point'),
        geometry: geometry ?? {
          rings: object.rings,
          paths: object.paths,
          points: object.points,
          x: object.x,
          y: object.y,
          lat: object.latitude ?? object.lat,
          lon: object.longitude ?? object.lon ?? object.lng
        },
        rawSnippet: raw.slice(0, 6000)
      });
    }

    if (Array.isArray(object)) {
      object.forEach((child, index) => queue.push({ value: child, path: `${current.path}[${index}]` }));
    } else {
      for (const [key, child] of Object.entries(object)) {
        if (child && typeof child === 'object') queue.push({ value: child, path: `${current.path}.${key}` });
      }
    }
  }
  return out;
}

function collectLayerRefs(value) {
  const refs = [];
  const queue = [value];
  const seen = new Set();
  while (queue.length) {
    const object = queue.shift();
    if (!object || typeof object !== 'object' || seen.has(object)) continue;
    seen.add(object);
    if (typeof object.url === 'string' && /(?:FeatureServer|MapServer)/i.test(object.url)) {
      refs.push({
        url: object.url.replace(/\/$/, ''),
        title: object.title ?? object.name ?? object.id ?? null,
        id: object.id ?? null,
        layerDefinition: object.layerDefinition ?? null
      });
    }
    if (Array.isArray(object)) queue.push(...object);
    else queue.push(...Object.values(object).filter((child) => child && typeof child === 'object'));
  }
  return refs;
}

await mkdir(REPORT_DIR, { recursive: true });

const protocol = await readFile(PROTOCOL_PATH, 'utf8');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const maxBatch = Math.max(...batches);
assert(maxBatch === 195, `Bryn research hard gate failed: protocol max batch ${maxBatch}, expected 195.`);
assert(protocol.includes('| 195 | `frognerstranda` |'), 'Batch 195 row is missing.');
assert(!protocol.includes('| 196 |'), 'Batch 196 already exists; replay from fresh main.');

const evidence = JSON.parse(await readFile(EVIDENCE_PATH, 'utf8'));
assert(evidence.placeId === PLACE_ID, `Unexpected evidence placeId ${evidence.placeId}`);
assert(evidence.evidenceStatus === 'needs_research', `Bryn evidence status drifted: ${evidence.evidenceStatus}`);
assert(evidence.identity?.identityStatus === 'resolved_broad_area', `Bryn identity status drifted: ${evidence.identity?.identityStatus}`);
assert(evidence.decision?.canBecomeVerified === false, 'Bryn is already production-ready; research branch is stale.');

const place = JSON.parse(await readFile(PLACE_PATH, 'utf8'));
assert(place.id === PLACE_ID, `Unexpected split place id ${place.id}`);
assert(place.lat === 59.9129 && place.lon === 10.8251 && place.r === 250, 'Legacy Bryn marker drifted.');

const queueAudit = JSON.parse(await readFile(QUEUE_PATH, 'utf8'));
assert(queueAudit.coordinateMaxBatch === 195, 'Queue audit batch drifted.');
assert(queueAudit.nextCandidate?.placeId === PLACE_ID, `Bryn is no longer the queue head: ${queueAudit.nextCandidate?.placeId}`);

const captures = [];
async function fetchText(label, url, options = {}) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; History-Go-coordinate-research/196; +https://github.com/Paradispartiet/History-Go)',
        accept: 'application/json,text/html,text/plain,application/xml,*/*',
        'accept-language': 'nb-NO,nb;q=0.9,no;q=0.8,en;q=0.6',
        ...options.headers
      },
      ...options
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') ?? '';
    const isBinary = /pdf|octet-stream/i.test(contentType);
    const text = isBinary ? '' : buffer.toString('utf8');
    const extension = /json/i.test(contentType) ? '.json' : /xml/i.test(contentType) ? '.xml' : /html/i.test(contentType) ? '.html' : '.txt';
    if (!isBinary) await writeFile(`${REPORT_DIR}/${safeName(label)}${extension}`, text, 'utf8');
    const row = {
      label,
      requestedUrl: url,
      finalUrl: response.url,
      status: response.status,
      ok: response.ok,
      contentType,
      bytes: buffer.length,
      sha256: sha256(buffer),
      text,
      json: parseJsonMaybe(text),
      buffer,
      reportFile: isBinary ? null : `${REPORT_DIR}/${safeName(label)}${extension}`
    };
    captures.push(row);
    return row;
  } catch (error) {
    const row = { label, requestedUrl: url, status: null, ok: false, error: String(error), text: '', json: null, buffer: Buffer.alloc(0), bytes: 0, sha256: null, reportFile: null };
    captures.push(row);
    return row;
  }
}

const byleksikon = await fetchText('oslo-byleksikon-bryn-strok', BYLEKSIKON_URL);
const planinnsyn = await fetchText('oslo-planinnsyn-main', PLANINNSYN_URL);
const collectionMeta = await fetchText('arcgis-hovinbyen-collection-metadata', `${HOVIN_COLLECTION_URL}?f=json`);
const collectionData = await fetchText('arcgis-hovinbyen-collection-data', `${HOVIN_COLLECTION_URL}/data?f=json`);

const collectionIds = [...new Set([
  ...collectItemIds(collectionMeta.json),
  ...collectItemIds(collectionData.json)
])].filter((id) => id !== HOVIN_COLLECTION_ID).slice(0, 80);

const arcgisItems = [];
for (const id of collectionIds) {
  const meta = await fetchText(`arcgis-item-${id}-metadata`, `https://www.arcgis.com/sharing/rest/content/items/${id}?f=json`);
  const metaText = JSON.stringify(meta.json ?? {}).toLowerCase();
  const relevant = /bryn|hovin|helsfyr|vpor|strategisk plan|delområde|delomrade/.test(metaText);
  if (!relevant) continue;
  const data = await fetchText(`arcgis-item-${id}-data`, `https://www.arcgis.com/sharing/rest/content/items/${id}/data?f=json`);
  arcgisItems.push({
    id,
    metadata: meta.json,
    metadataStatus: meta.status,
    data: data.json,
    dataStatus: data.status,
    metadataUrl: meta.finalUrl ?? meta.requestedUrl,
    dataUrl: data.finalUrl ?? data.requestedUrl
  });
}

const arcgisGeometryCandidates = [];
const layerRefs = [];
for (const item of arcgisItems) {
  arcgisGeometryCandidates.push(...collectGeometryObjects(item.data, `arcgis-item-${item.id}`, item.dataUrl));
  layerRefs.push(...collectLayerRefs(item.data).map((ref) => ({ ...ref, itemId: item.id })));
}

const uniqueLayerRefs = [...new Map(layerRefs.map((ref) => [ref.url, ref])).values()].slice(0, 30);
const serviceCandidates = [];
for (const [index, ref] of uniqueLayerRefs.entries()) {
  const service = await fetchText(`arcgis-service-${index + 1}-metadata`, `${ref.url}?f=json`);
  const serviceJson = service.json ?? {};
  const layers = Array.isArray(serviceJson.layers) ? serviceJson.layers : [];
  const directLayerMatch = ref.url.match(/\/(FeatureServer|MapServer)\/(\d+)$/i);
  const layerTargets = directLayerMatch
    ? [{ id: Number(directLayerMatch[2]), name: ref.title ?? serviceJson.name ?? 'direct-layer', directUrl: ref.url }]
    : layers.filter((layer) => /bryn|vpor|delområde|delomrade|transformasjon|industri|næring|naering/i.test(`${layer.name ?? ''} ${ref.title ?? ''}`)).slice(0, 12);

  for (const layer of layerTargets) {
    const layerUrl = layer.directUrl ?? `${ref.url}/${layer.id}`;
    const layerMeta = await fetchText(`arcgis-service-${index + 1}-layer-${layer.id}-metadata`, `${layerUrl}?f=json`);
    const query = await fetchText(
      `arcgis-service-${index + 1}-layer-${layer.id}-features`,
      `${layerUrl}/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson&resultRecordCount=5000`
    );
    const candidates = collectGeometryObjects(query.json, `arcgis-layer:${layerUrl}`, query.finalUrl ?? query.requestedUrl);
    serviceCandidates.push({
      itemId: ref.itemId,
      serviceUrl: ref.url,
      layerId: layer.id,
      layerName: layer.name,
      layerMetadata: layerMeta.json,
      queryStatus: query.status,
      featureCount: Array.isArray(query.json?.features) ? query.json.features.length : null,
      brynGeometryCandidates: candidates
    });
    arcgisGeometryCandidates.push(...candidates);
  }
}

const vporPdf = await fetchText('official-brynomradet-vpor-pdf', OFFICIAL_VPOR_PDF);
const pdfReport = {
  status: vporPdf.status,
  finalUrl: vporPdf.finalUrl,
  bytes: vporPdf.bytes,
  sha256: vporPdf.sha256,
  contentType: vporPdf.contentType,
  extraction: null
};
if (vporPdf.ok && vporPdf.buffer.length > 0) {
  const tempPdf = '/tmp/history-go-brynomradet-vpor.pdf';
  const tempText = '/tmp/history-go-brynomradet-vpor.txt';
  await writeFile(tempPdf, vporPdf.buffer);
  try {
    const info = await execFileAsync('pdfinfo', [tempPdf], { maxBuffer: 4 * 1024 * 1024 });
    const extracted = await execFileAsync('pdftotext', ['-layout', tempPdf, tempText], { maxBuffer: 4 * 1024 * 1024 });
    const pdfText = await readFile(tempText, 'utf8');
    await writeFile(`${REPORT_DIR}/official-brynomradet-vpor-pdfinfo.txt`, info.stdout, 'utf8');
    await writeFile(`${REPORT_DIR}/official-brynomradet-vpor-extracted.txt`, pdfText, 'utf8');
    pdfReport.extraction = {
      ok: true,
      pdfinfo: info.stdout,
      stderr: `${info.stderr ?? ''}${extracted.stderr ?? ''}`,
      textBytes: Buffer.byteLength(pdfText),
      textSha256: sha256(pdfText),
      snippets: snippets(pdfText, ['Bryn', 'industri', 'næring', 'Brynsfossen', 'Hovedbanen', 'avgrensning', 'planområdet', 'delområde'], 500, 120)
    };
  } catch (error) {
    pdfReport.extraction = { ok: false, error: String(error) };
  }
  await unlink(tempPdf).catch(() => {});
  await unlink(tempText).catch(() => {});
}

const planScriptUrls = extractScriptUrls(planinnsyn.text, planinnsyn.finalUrl ?? PLANINNSYN_URL)
  .filter((url) => !/google|analytics|cookie/i.test(url))
  .slice(0, 12);
const planScripts = [];
for (const [index, url] of planScriptUrls.entries()) {
  planScripts.push(await fetchText(`planinnsyn-script-${index + 1}`, url));
}
const planConfigText = [planinnsyn.text, ...planScripts.map((row) => row.text)].join('\n');
const mapNames = [...new Set([
  ...[...planConfigText.matchAll(/map=([A-Za-z0-9_-]+)/gi)].map((match) => match[1]),
  'PLANPROGRAMOGVPOR',
  'PLANPROGRAM',
  'VPOR',
  'PLANSAK'
])].slice(0, 30);
const wfsCapabilities = [];
for (const mapName of mapNames) {
  const url = `https://od2.pbe.oslo.kommune.no/cgi-bin/wms?map=${encodeURIComponent(mapName)}&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`;
  const capture = await fetchText(`planinnsyn-wfs-${mapName}-capabilities`, url);
  const useful = capture.ok && /FeatureType|WFS_Capabilities/i.test(capture.text);
  wfsCapabilities.push({ mapName, status: capture.status, useful, url: capture.finalUrl ?? url, snippets: useful ? snippets(capture.text, ['Bryn', 'VPOR', 'Planprogram', 'område', 'omrade'], 300, 30) : [] });
}

const overpassQuery = `[out:json][timeout:60];\n(\n  nwr["landuse"="industrial"](${BRYN_BBOX.south},${BRYN_BBOX.west},${BRYN_BBOX.north},${BRYN_BBOX.east});\n  nwr["industrial"](${BRYN_BBOX.south},${BRYN_BBOX.west},${BRYN_BBOX.north},${BRYN_BBOX.east});\n  nwr["historic"="industrial"](${BRYN_BBOX.south},${BRYN_BBOX.west},${BRYN_BBOX.north},${BRYN_BBOX.east});\n  nwr["name"~"Bryn|Bryns|Nils Hansens|Østensjøveien|Brynseng",i](${BRYN_BBOX.south},${BRYN_BBOX.west},${BRYN_BBOX.north},${BRYN_BBOX.east});\n);\nout center tags;`;
const overpass = await fetchText('osm-bryn-industrial-context', 'https://overpass.kumi.systems/api/interpreter', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  body: `data=${encodeURIComponent(overpassQuery)}`
});
const osmElements = Array.isArray(overpass.json?.elements) ? overpass.json.elements : [];
const osmContext = osmElements.map((element) => ({
  type: element.type,
  id: element.id,
  sourceObjectId: `osm-${element.type}:${element.id}`,
  lat: element.lat ?? element.center?.lat ?? null,
  lon: element.lon ?? element.center?.lon ?? null,
  tags: element.tags ?? {}
}));
await writeFile(`${REPORT_DIR}/osm-bryn-industrial-context.json`, `${JSON.stringify(osmContext, null, 2)}\n`, 'utf8');

const dedupedGeometryCandidates = [...new Map(arcgisGeometryCandidates.map((candidate) => [
  `${candidate.sourceLabel}|${candidate.path}|${candidate.id ?? ''}|${JSON.stringify(candidate.geometry).slice(0, 500)}`,
  candidate
])).values()];
const strongOfficialCandidates = dedupedGeometryCandidates.filter((candidate) => candidate.hasIndustrialSemantics);
const planningOnlyCandidates = dedupedGeometryCandidates.filter((candidate) => !candidate.hasIndustrialSemantics && candidate.hasPlanningSemantics);

let decision = 'keep_needs_source';
let nextAction = 'No explicit official Bryn industrial-area geometry was found. Keep the broad record unresolved; do not use the VPOR/development area, one factory, one station or one OSM industrial parcel as a proxy.';
if (strongOfficialCandidates.length === 1) {
  decision = 'single_official_bryn_industrial_scope_candidate_requires_semantic_crosscheck';
  nextAction = 'Crosscheck the single official geometry against the historical Bryn industrial identity, its stated boundaries and current canonical overlaps before any batch 196 production.';
} else if (strongOfficialCandidates.length > 1) {
  decision = 'multiple_official_bryn_industrial_scope_candidates_require_disambiguation';
  nextAction = 'Disambiguate the official Bryn industrial geometries by document title, layer semantics and historical scope; do not select by containment or proximity.';
} else if (planningOnlyCandidates.length > 0) {
  decision = 'official_bryn_planning_geometry_found_but_not_historical_industrial_scope';
  nextAction = 'The official planning/VPOR geometry may define present development scope but does not by itself verify the historical industrial-area record. Establish an explicit scope crosswalk or deliberately redefine the place before production.';
}

const summary = {
  version: DATE,
  protocolMaxBatch: maxBatch,
  placeId: PLACE_ID,
  researchOnly: true,
  canonicalChanged: false,
  hardGates: {
    batch195Present: true,
    batch196Absent: true,
    queueHeadIsBryn: true,
    evidenceStillUnresolved: true,
    legacyMarkerUnchanged: true
  },
  officialIdentity: {
    byleksikonStatus: byleksikon.status,
    snippets: snippets(byleksikon.text, ['Bryn', 'industri', 'Brynsfossen', 'Hovedbanen'], 420, 40)
  },
  officialVporPdf: pdfReport,
  officialArcGis: {
    collectionId: HOVIN_COLLECTION_ID,
    collectionMetadataStatus: collectionMeta.status,
    collectionDataStatus: collectionData.status,
    discoveredItemCount: collectionIds.length,
    relevantItemCount: arcgisItems.length,
    relevantItems: arcgisItems.map((item) => ({
      id: item.id,
      title: item.metadata?.title ?? null,
      type: item.metadata?.type ?? null,
      owner: item.metadata?.owner ?? null,
      orgId: item.metadata?.orgId ?? null,
      metadataStatus: item.metadataStatus,
      dataStatus: item.dataStatus
    })),
    layerReferenceCount: uniqueLayerRefs.length,
    serviceCandidates,
    geometryCandidateCount: dedupedGeometryCandidates.length,
    strongIndustrialCandidateCount: strongOfficialCandidates.length,
    planningOnlyCandidateCount: planningOnlyCandidates.length,
    strongIndustrialCandidates: strongOfficialCandidates,
    planningOnlyCandidates
  },
  officialPlaninnsyn: {
    mainStatus: planinnsyn.status,
    scriptCount: planScripts.length,
    discoveredMapNames: mapNames,
    wfsCapabilities
  },
  osmContext: {
    status: overpass.status,
    elementCount: osmContext.length,
    note: 'Context only. OSM industrial parcels and named features are not accepted as the broad canonical scope without an official semantic crosswalk.'
  },
  captures: captures.map(({ text, json, buffer, ...row }) => row),
  decision,
  nextAction
};

await writeFile(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/arcgis-geometry-candidates.json`, `${JSON.stringify(dedupedGeometryCandidates, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/arcgis-relevant-items.json`, `${JSON.stringify(arcgisItems.map((item) => ({ id: item.id, metadata: item.metadata })), null, 2)}\n`, 'utf8');

const readme = `# Bryn industrial-area official-scope research after batch 195\n\n- Research only: **yes**\n- Canonical/evidence/protocol data changed: **no**\n- Protocol hard gate: **195**\n- Official ArcGIS strong industrial candidates: **${strongOfficialCandidates.length}**\n- Official ArcGIS planning-only candidates: **${planningOnlyCandidates.length}**\n- Decision: **${decision}**\n\n${nextAction}\n\nThe official Brynområdet VPOR, Hovinbyen ArcGIS collection and Planinnsyn services are treated as separate evidence layers. A present-day development boundary is not silently equated with the historical broad industrial identity. OSM is retained only as physical context; no nearest/first-hit or single-factory proxy is used.\n`;
await writeFile(`${REPORT_DIR}/README.md`, readme, 'utf8');

console.log(JSON.stringify({
  status: 'research_complete',
  reportDir: REPORT_DIR,
  decision,
  strongOfficialCandidates: strongOfficialCandidates.length,
  planningOnlyCandidates: planningOnlyCandidates.length,
  relevantArcgisItems: arcgisItems.length,
  osmContextElements: osmContext.length
}, null, 2));
