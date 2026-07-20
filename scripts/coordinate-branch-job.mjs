import { mkdirSync, writeFileSync, rmSync } from 'node:fs';

const base = 'https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner';
const reportDir = 'reports/visitoslo-oslo-east-audit-20260720/ekeberg-helleristninger-v3';
const bbox = [10.754, 59.894, 10.765, 59.901];
const kulturminneId = '41907';
mkdirSync(reportDir, { recursive: true });

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/geo+json, application/json' } });
  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  return { url, ok: response.ok, status: response.status, contentType: response.headers.get('content-type'), data, text: data ? null : text.slice(0, 4000) };
}

function walkStrings(value, output = []) {
  if (value === null || value === undefined) return output;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    output.push(String(value));
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) walkStrings(item, output);
    return output;
  }
  if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      output.push(String(key));
      walkStrings(item, output);
    }
  }
  return output;
}

const collectionsResponse = await fetchJson(`${base}/collections?f=json`);
writeFileSync(`${reportDir}/collections-response.json`, `${JSON.stringify(collectionsResponse, null, 2)}\n`);
if (!collectionsResponse.ok || !Array.isArray(collectionsResponse.data?.collections)) {
  throw new Error(`Could not discover Riksantikvaren OGC collections: HTTP ${collectionsResponse.status}`);
}

const collections = collectionsResponse.data.collections.map((collection) => ({
  id: collection.id,
  title: collection.title ?? '',
  description: collection.description ?? '',
}));
const relevant = collections.filter((collection) => {
  const text = `${collection.id} ${collection.title} ${collection.description}`.toLowerCase();
  return text.includes('lokalit') || text.includes('enkeltminn');
});
const selected = relevant.length ? relevant : collections;
writeFileSync(`${reportDir}/collections-summary.json`, `${JSON.stringify({ collections, selected }, null, 2)}\n`);

const attempts = [];
const exactMatches = [];
const identityMatches = [];
for (const collection of selected) {
  const url = `${base}/collections/${encodeURIComponent(collection.id)}/items?f=json&limit=1000&bbox=${bbox.join(',')}`;
  const response = await fetchJson(url);
  const features = Array.isArray(response.data?.features) ? response.data.features : [];
  const interesting = [];
  for (const feature of features) {
    const searchable = walkStrings({ id: feature.id, properties: feature.properties }).join(' ').toLowerCase();
    const exact = searchable.includes(kulturminneId);
    const identity = searchable.includes('ekeberg') && (searchable.includes('hellerist') || searchable.includes('bergkunst'));
    if (exact) exactMatches.push({ collection: collection.id, feature });
    if (identity) identityMatches.push({ collection: collection.id, feature });
    if (exact || identity) interesting.push({ id: feature.id, properties: feature.properties, geometry: feature.geometry });
  }
  attempts.push({
    collection,
    url,
    ok: response.ok,
    status: response.status,
    returned: features.length,
    interesting,
    errorText: response.ok ? null : response.text,
  });
}

const result = {
  version: '2026-07-20-v3-diagnostic',
  kulturminneId,
  bbox,
  selectedCollections: selected,
  exactMatchCount: exactMatches.length,
  identityMatchCount: identityMatches.length,
  exactMatches,
  identityMatches,
  attempts,
};
writeFileSync(`${reportDir}/diagnostic-result.json`, `${JSON.stringify(result, null, 2)}\n`);
writeFileSync(`${reportDir}/README.md`, `# Ekeberg helleristninger — Riksantikvaren OGC collection diagnostic v3\n\nThis diagnostic discovers collection IDs from the live official OGC API instead of hardcoding \`lokaliteter\` / \`enkeltminner\`.\n\n- Kulturminne ID: **${kulturminneId}**\n- Search bbox: **${bbox.join(', ')}**\n- Discovered collections: **${collections.length}**\n- Selected locality/single-monument collections: **${selected.length}**\n- Exact ID matches: **${exactMatches.length}**\n- Ekeberg rock-art identity matches: **${identityMatches.length}**\n\nSee \`collections-response.json\`, \`collections-summary.json\` and \`diagnostic-result.json\` for the complete saved result.\n`);

console.log(`Discovered ${collections.length} collections; selected ${selected.length}; exact 41907 matches=${exactMatches.length}; Ekeberg rock-art identity matches=${identityMatches.length}.`);
rmSync(new URL(import.meta.url));
