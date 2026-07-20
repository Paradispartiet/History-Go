import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const base = 'https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner';
const reportDir = 'reports/visitoslo-oslo-east-audit-20260720/mariakirken-ruin-diagnostic';
mkdirSync(reportDir, { recursive: true });
const bbox = '10.755,59.900,10.770,59.908';
const bboxCrs = encodeURIComponent('http://www.opengis.net/def/crs/OGC/1.3/CRS84');

async function fetchAttempt(name, url) {
  const response = await fetch(url, { headers: { accept: 'application/geo+json, application/json' } });
  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  const result = { name, url, ok: response.ok, status: response.status, data, text: data ? null : text.slice(0, 5000) };
  writeFileSync(`${reportDir}/${name}.json`, `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

function strings(value, output = []) {
  if (value === null || value === undefined) return output;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') { output.push(String(value)); return output; }
  if (Array.isArray(value)) { for (const item of value) strings(item, output); return output; }
  if (typeof value === 'object') { for (const [k, v] of Object.entries(value)) { output.push(k); strings(v, output); } }
  return output;
}

function identityScore(feature) {
  const text = strings({ id: feature.id, properties: feature.properties }).join(' ').toLowerCase();
  let score = 0;
  if (text.includes('mariakirken')) score += 10;
  if (text.includes('maria kirke')) score += 8;
  if (text.includes('maria-kirke')) score += 8;
  if (text.includes('oslo')) score += 2;
  if (text.includes('middelalder')) score += 2;
  if (text.includes('kirkeruin') || text.includes('ruin')) score += 2;
  return { score, text };
}

const attempts = [];
for (const collection of ['lokaliteter', 'enkeltminner']) {
  attempts.push(await fetchAttempt(
    `${collection}-bbox-crs84`,
    `${base}/collections/${collection}/items?f=json&limit=1000&bbox=${bbox}&bbox-crs=${bboxCrs}`
  ));
  attempts.push(await fetchAttempt(
    `${collection}-name-filter`,
    `${base}/collections/${collection}/items?f=json&limit=1000&filter-lang=cql2-text&filter=${encodeURIComponent("navn LIKE '%Mariakirken%'")}`
  ));
}

const candidates = [];
for (const attempt of attempts) {
  const features = Array.isArray(attempt.data?.features) ? attempt.data.features : [];
  for (const feature of features) {
    const { score } = identityScore(feature);
    if (score > 0) candidates.push({ attempt: attempt.name, score, feature });
  }
}
const deduped = [...new Map(candidates.map((entry) => [`${entry.feature.id}`, entry])).values()]
  .sort((a, b) => b.score - a.score);

const rawIndex = JSON.parse(readFileSync('data/places/places_index.json', 'utf8'));
const places = Array.isArray(rawIndex) ? rawIndex : rawIndex.places ?? [];
const canonicalMatches = places.filter((place) => {
  const text = `${place.id ?? ''} ${place.name ?? ''} ${place.desc ?? ''}`.toLowerCase();
  return text.includes('mariakirken') || text.includes('maria kirke');
}).map(({ id, name, category, sourceFile }) => ({ id, name, category, sourceFile }));

const summary = {
  version: '2026-07-20-v1',
  candidateId: 'mariakirken_ruin_oslo',
  candidateName: 'Mariakirken-ruinen i middelalder-Oslo',
  bbox,
  bboxCrs: 'CRS84',
  attempts: attempts.map((attempt) => ({
    name: attempt.name,
    ok: attempt.ok,
    status: attempt.status,
    numberMatched: attempt.data?.numberMatched ?? null,
    numberReturned: attempt.data?.numberReturned ?? attempt.data?.features?.length ?? null
  })),
  officialIdentityCandidates: deduped,
  canonicalIdentityMatches: canonicalMatches,
  nextGate: deduped.length === 1 && canonicalMatches.length === 0 ? 'direct_feature_verification' : 'identity_review'
};
writeFileSync(`${reportDir}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`);
writeFileSync(`${reportDir}/README.md`, `# Mariakirken-ruinen — Riksantikvaren objektdiagnose\n\n- Søk: eksplisitt CRS84-bbox over Middelalderbyen + CQL2 navnefilterforsøk\n- Offisielle identitetskandidater: **${deduped.length}**\n- Canonical identitetsmatcher: **${canonicalMatches.length}**\n- Neste gate: **${summary.nextGate}**\n\nDenne jobben oppretter ingen place-data. Hvis ett eksakt offisielt objekt identifiseres, skal neste steg være direkte feature-oppslag før koordinaten kan brukes.\n`);
console.log(`Mariakirken diagnostic: official candidates=${deduped.length}, canonical matches=${canonicalMatches.length}, gate=${summary.nextGate}`);
rmSync(new URL(import.meta.url));
