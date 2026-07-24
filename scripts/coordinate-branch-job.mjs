import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const REPORT_DIR = 'reports/oslo-coordinate-regjeringskvartalet-plan-identity-post-193';
const PLAN_ID = '202020172';
const PLAN_NAME = 'S-5100';
const EXPECTED_MAX_BATCH = 193;
const CENTER = { lat: 59.9156, lon: 10.7451, x: 597577.9548029142, y: 6643297.785171356 };
const BBOX = [597150, 6642900, 598050, 6643700];
const MAPS = ['PLANER', 'PLANINNSYN', 'WFS_SOK', 'REGULERING', 'REGTILLEGG', 'PAAGAAENDE'];
const PLANINNSYN_URL = 'https://od2.pbe.oslo.kommune.no/kart/';
const GOVERNMENT_URL = 'https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/id669703/';
const WFS_ENDPOINT = 'https://od2.pbe.oslo.kommune.no/cgi-bin/wms';

mkdirSync(REPORT_DIR, { recursive: true });

function maxProtocolBatch() {
  const text = readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
  const batches = [...text.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
  return Math.max(...batches);
}

function safeName(value) {
  return String(value).replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 140);
}

async function fetchText(url, options = {}, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'user-agent': 'History-Go coordinate research/1.0',
          accept: '*/*',
          ...(options.headers || {})
        },
        signal: AbortSignal.timeout(90000)
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 240)}`);
      return { text, status: response.status, contentType: response.headers.get('content-type') || '' };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }
  throw lastError;
}

function extractFeatureTypes(xml) {
  const names = [...xml.matchAll(/<(?:[A-Za-z0-9_]+:)?Name>([^<]+)<\/(?:[A-Za-z0-9_]+:)?Name>/g)]
    .map((m) => m[1].trim())
    .filter((name) => name.includes(':'));
  return [...new Set(names)];
}

function featureSummary(feature, map, typeName) {
  const properties = feature?.properties && typeof feature.properties === 'object' ? feature.properties : {};
  const text = JSON.stringify(properties);
  return {
    map,
    typeName,
    id: feature?.id ?? null,
    geometryType: feature?.geometry?.type ?? null,
    properties,
    containsPlanId: text.includes(PLAN_ID),
    containsPlanName: new RegExp(`(^|[^0-9A-Z])${PLAN_NAME.replace('-', '\\-')}([^0-9A-Z]|$)`, 'i').test(text),
    containsIdentityText: /Regjeringskvartal/i.test(text)
  };
}

const protocolMax = maxProtocolBatch();
if (protocolMax !== EXPECTED_MAX_BATCH) {
  throw new Error(`Coordinate sequence changed: expected ${EXPECTED_MAX_BATCH}, found ${protocolMax}`);
}

const evidence = JSON.parse(readFileSync('data/coordinate-evidence/oslo/politikk/regjeringskvartalet.json', 'utf8'));
if (evidence.placeId !== 'regjeringskvartalet' || evidence.currentCoordinate?.coordStatus !== 'needs_source') {
  throw new Error(`Unexpected active evidence state: ${JSON.stringify({ placeId: evidence.placeId, coordStatus: evidence.currentCoordinate?.coordStatus })}`);
}

const prior = JSON.parse(readFileSync('reports/oslo-coordinate-regjeringskvartalet-wfs-area-research-post-193/summary.json', 'utf8'));
const covering = prior.geometryContainsCenter || [];
if (covering.length !== 1 || String(covering[0]?.properties?.PLANID) !== PLAN_ID || String(covering[0]?.properties?.PLANNAVN) !== PLAN_NAME) {
  throw new Error('Merged WFS candidate no longer matches locked PLANID/PLANNAVN');
}

const planinnsynPage = await fetchText(PLANINNSYN_URL);
let governmentPage = { text: '', status: null, contentType: '', error: null };
try {
  governmentPage = { ...(await fetchText(GOVERNMENT_URL, {}, 1)), error: null };
} catch (error) {
  governmentPage.error = String(error);
}
writeFileSync(`${REPORT_DIR}/planinnsyn.html`, planinnsynPage.text, 'utf8');
if (governmentPage.text) {
  writeFileSync(`${REPORT_DIR}/regjeringen-regjeringskvartalet.html`, governmentPage.text, 'utf8');
} else {
  writeFileSync(`${REPORT_DIR}/regjeringen-regjeringskvartalet-fetch.json`, `${JSON.stringify({ url: GOVERNMENT_URL, error: governmentPage.error }, null, 2)}\n`, 'utf8');
}

const assetUrls = [...planinnsynPage.text.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)]
  .map((m) => new URL(m[1], PLANINNSYN_URL).href)
  .filter((url) => /\/assets\/.*\.js(?:\?|$)/i.test(url));
const assetReports = [];
for (const assetUrl of [...new Set(assetUrls)]) {
  const asset = await fetchText(assetUrl);
  writeFileSync(`${REPORT_DIR}/${safeName(new URL(assetUrl).pathname.split('/').pop())}`, asset.text, 'utf8');
  const keywords = ['WFS_SOK', 'PLANINNSYN', 'REGTILLEGG', 'autocomplete', 'plannr', 'planid', 'PLANNAVN', 'saksnr'];
  const snippets = [];
  for (const keyword of keywords) {
    let from = 0;
    while (snippets.length < 120) {
      const index = asset.text.toLowerCase().indexOf(keyword.toLowerCase(), from);
      if (index < 0) break;
      snippets.push({ keyword, index, snippet: asset.text.slice(Math.max(0, index - 260), index + 520) });
      from = index + keyword.length;
    }
  }
  const urlStrings = [...asset.text.matchAll(/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%\\-]+/g)]
    .map((m) => m[0].replaceAll('\\/', '/'))
    .filter((url) => /plan|sok|search|wfs|saksinnsyn|cgi-bin/i.test(url));
  assetReports.push({ assetUrl, size: asset.text.length, snippets, urlStrings: [...new Set(urlStrings)].slice(0, 200) });
}
writeFileSync(`${REPORT_DIR}/asset-discovery.json`, `${JSON.stringify(assetReports, null, 2)}\n`, 'utf8');

const wfsReports = [];
const allFeatures = [];
for (const map of MAPS) {
  const capabilitiesUrl = new URL(WFS_ENDPOINT);
  capabilitiesUrl.searchParams.set('map', map);
  capabilitiesUrl.searchParams.set('service', 'WFS');
  capabilitiesUrl.searchParams.set('version', '1.1.0');
  capabilitiesUrl.searchParams.set('request', 'GetCapabilities');
  try {
    const capabilities = await fetchText(capabilitiesUrl.href);
    writeFileSync(`${REPORT_DIR}/capabilities-${map}.xml`, capabilities.text, 'utf8');
    const featureTypes = extractFeatureTypes(capabilities.text);
    const likelyTypes = featureTypes.filter((name) => /plan|regul|omraade|sok|sak/i.test(name)).slice(0, 60);
    const mapReport = { map, capabilitiesUrl: capabilitiesUrl.href, featureTypes, queried: [] };
    for (const typeName of likelyTypes) {
      const featureUrl = new URL(WFS_ENDPOINT);
      featureUrl.searchParams.set('map', map);
      featureUrl.searchParams.set('service', 'WFS');
      featureUrl.searchParams.set('version', '1.1.0');
      featureUrl.searchParams.set('request', 'GetFeature');
      featureUrl.searchParams.set('typeName', typeName);
      featureUrl.searchParams.set('outputFormat', 'application/json');
      featureUrl.searchParams.set('srsName', 'EPSG:32632');
      featureUrl.searchParams.set('bbox', `${BBOX.join(',')},EPSG:32632`);
      featureUrl.searchParams.set('maxFeatures', '500');
      try {
        const result = await fetchText(featureUrl.href, {}, 2);
        let parsed;
        try {
          parsed = JSON.parse(result.text);
        } catch {
          mapReport.queried.push({ typeName, url: featureUrl.href, status: 'non_json', preview: result.text.slice(0, 500) });
          continue;
        }
        const features = Array.isArray(parsed.features) ? parsed.features : [];
        const summaries = features.map((feature) => featureSummary(feature, map, typeName));
        allFeatures.push(...summaries);
        mapReport.queried.push({ typeName, url: featureUrl.href, status: 'ok', featureCount: features.length });
        if (features.length > 0) {
          writeFileSync(`${REPORT_DIR}/features-${map}-${safeName(typeName)}.json`, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
        }
      } catch (error) {
        mapReport.queried.push({ typeName, url: featureUrl.href, status: 'error', error: String(error) });
      }
    }
    wfsReports.push(mapReport);
  } catch (error) {
    wfsReports.push({ map, status: 'capabilities_error', error: String(error), featureTypes: [], queried: [] });
  }
}
writeFileSync(`${REPORT_DIR}/wfs-discovery.json`, `${JSON.stringify(wfsReports, null, 2)}\n`, 'utf8');

const exactMatches = allFeatures.filter((feature) => feature.containsPlanId || feature.containsPlanName || feature.containsIdentityText);
const strongestMatches = exactMatches.filter((feature) =>
  (feature.containsPlanId || feature.containsPlanName) && feature.containsIdentityText
);
const identityChecks = {
  governmentPageFetchOk: Boolean(governmentPage.text),
  governmentMentionsRegjeringskvartalet: /Regjeringskvartalet/i.test(governmentPage.text),
  governmentDefinesAkersgataMollergata: /mellom\s+Akersgata\s+og\s+Møllergata/i.test(governmentPage.text),
  planinnsynSupportsPlanNumberSearch: /plannavn|plannummer|plannr\.?/i.test(planinnsynPage.text),
  priorPolygonContainsCanonicalCenter: covering[0]?.geometryContainsCenter === true
};

const canPromote = strongestMatches.length > 0 && identityChecks.planinnsynSupportsPlanNumberSearch && identityChecks.priorPolygonContainsCanonicalCenter;
const summary = {
  version: '2026-07-24',
  placeId: 'regjeringskvartalet',
  coordinateMaxBatch: protocolMax,
  lockedCandidate: {
    planId: PLAN_ID,
    planName: PLAN_NAME,
    geometryType: covering[0].geometryType,
    properties: covering[0].properties,
    canonicalCenter: CENTER,
    bbox: covering[0].bbox
  },
  supportingGovernmentSource: {
    url: GOVERNMENT_URL,
    liveFetchOk: Boolean(governmentPage.text),
    fetchError: governmentPage.error
  },
  identityChecks,
  assetCount: assetReports.length,
  wfsMapCount: wfsReports.length,
  queriedFeatureCount: allFeatures.length,
  exactMatches,
  strongestMatches,
  canPromote,
  decision: canPromote ? 'official_plan_identity_and_geometry_confirmed' : 'official_plan_geometry_found_but_identity_crosscheck_incomplete',
  nextAction: canPromote
    ? 'Create the next coordinate production batch from the exact official S-5100 polygon.'
    : 'Inspect the saved Planinnsyn asset/WFS search metadata and obtain one official machine-readable title link between S-5100/202020172 and Regjeringskvartalet before production.'
};
writeFileSync(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
writeFileSync(`${REPORT_DIR}/README.md`, `# Regjeringskvartalet official plan identity research\n\nDate: 2026-07-24\n\n- locked official polygon: ${PLAN_NAME} / PLANID ${PLAN_ID}\n- WFS maps queried: ${wfsReports.length}\n- bounded feature records inspected: ${allFeatures.length}\n- exact ID/name/identity matches: ${exactMatches.length}\n- strongest combined identity matches: ${strongestMatches.length}\n- government support-page live fetch: ${governmentPage.text ? 'ok' : 'blocked'}\n\nDecision: **${summary.decision}**\n\n${summary.nextAction}\n`, 'utf8');

console.log(JSON.stringify({ reportDir: REPORT_DIR, decision: summary.decision, exactMatches: exactMatches.length, strongestMatches: strongestMatches.length }, null, 2));
