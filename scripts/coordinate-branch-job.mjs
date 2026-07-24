import fs from 'node:fs';
import path from 'node:path';

const OUT = 'reports/visitoslo-galleries-audit-20260723/distinct-anchor-research';
fs.mkdirSync(OUT, { recursive: true });

const write = (name, value) => fs.writeFileSync(path.join(OUT, name), typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'History-Go-coordinate-research/1.0 (Paradispartiet/History-Go)',
      'Accept': '*/*',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, url: response.url, text, headers: Object.fromEntries(response.headers.entries()) };
}

async function fetchJson(url, options = {}) {
  const result = await fetchText(url, options);
  let json = null;
  try { json = JSON.parse(result.text); } catch {}
  return { ...result, json };
}

function nominatimUrl(q) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    q,
    limit: '10',
    addressdetails: '1',
    namedetails: '1',
    extratags: '1'
  });
  return `https://nominatim.openstreetmap.org/search?${params}`;
}

async function overpass(query) {
  return fetchJson('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data: query }).toString()
  });
}

function compactHttp(result) {
  return {
    ok: result.ok,
    status: result.status,
    url: result.url,
    json: result.json,
    bodyPreview: result.json ? undefined : result.text.slice(0, 5000)
  };
}

const report = {
  version: '2026-07-24',
  status: 'research_in_progress',
  policy: [
    'Official address was attempted first for both candidates and is unusable because each ordinary address point exactly overlaps an existing canonical marker.',
    'No VisitOSLO coordinate is accepted as canonical evidence.',
    'No synthetic offset is allowed.',
    'Fallback research may use stable OSM objects or Kartverket/official-map objects under Coordinate Source Contract v1 when corroborated by the institution’s own physical-location statement.'
  ],
  officialStatements: {
    rom_for_kunst_og_arkitektur: {
      source: 'https://rom.no/kontakt',
      statement: 'ROM identifies its venue as Maridalsveien 3, building O, with an entrance from the Maridalsveien/Brenneriveien intersection and another route through the property entrance.'
    },
    soft_galleri: {
      source: 'https://www.softgalleri.no/om-oss/',
      statement: 'SOFT states that its entrance is on the corner at Rådhusgata 20 and that the large gallery window faces northeast toward Rådhusgata.'
    }
  },
  queries: {},
  decisions: {}
};

// Nominatim / OSM named-object searches.
for (const [key, q] of Object.entries({
  rom_named: 'ROM for kunst og arkitektur, Maridalsveien 3, Oslo, Norway',
  rom_address: 'Maridalsveien 3, 0178 Oslo, Norway',
  soft_named: 'SOFT galleri, Rådhusgata 20, Oslo, Norway',
  soft_address: 'Rådhusgata 20, 0151 Oslo, Norway',
  fotografiens_hus: 'Fotografiens Hus, Rådhusgata 20, Oslo, Norway'
})) {
  const result = await fetchJson(nominatimUrl(q));
  report.queries[key] = compactHttp(result);
  await sleep(1100);
}

// OSM objects around each shared property, including named venues, entrances, addresses and road geometry.
const romOverpass = `[out:json][timeout:60];
(
  nwr(around:300,59.92065765555904,10.751597362221323)["name"~"ROM|X-Ray|Xray|NORA",i];
  nwr(around:300,59.92065765555904,10.751597362221323)["addr:street"="Maridalsveien"]["addr:housenumber"="3"];
  node(around:300,59.92065765555904,10.751597362221323)["entrance"];
  way(around:350,59.92065765555904,10.751597362221323)["name"="Maridalsveien"];
  way(around:350,59.92065765555904,10.751597362221323)["name"="Brenneriveien"];
);
out center tags geom;`;
const romOsm = await overpass(romOverpass);
report.queries.rom_overpass = compactHttp(romOsm);
await sleep(1200);

const softOverpass = `[out:json][timeout:60];
(
  nwr(around:180,59.90947,10.74247)["name"~"SOFT|Fotografiens Hus|Fotografiens",i];
  nwr(around:180,59.90947,10.74247)["addr:street"="Rådhusgata"]["addr:housenumber"="20"];
  node(around:180,59.90947,10.74247)["entrance"];
  way(around:220,59.90947,10.74247)["name"="Rådhusgata"];
);
out center tags geom;`;
const softOsm = await overpass(softOverpass);
report.queries.soft_overpass = compactHttp(softOsm);

// Kartverket open Matrikkelen building-point WFS. Save capabilities and attempt JSON bbox queries.
const capsUrl = 'https://wfs.geonorge.no/skwms1/wfs.matrikkelen-bygningspunkt?service=WFS&Request=GetCapabilities';
const caps = await fetchText(capsUrl);
write('kartverket-bygningspunkt-capabilities.xml', caps.text);
const typeNames = [...caps.text.matchAll(/<(?:\w+:)?Name>([^<]*Byg[^<]*)<\/(?:\w+:)?Name>/gi)].map((m) => m[1]);
report.queries.kartverket_capabilities = {
  ok: caps.ok,
  status: caps.status,
  url: caps.url,
  discoveredTypeNames: [...new Set(typeNames)]
};

const preferredType = [...new Set(typeNames)][0] || 'app:Bygning';
async function wfsBbox(name, bbox) {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: preferredType,
    bbox: `${bbox.join(',')},EPSG:4326`,
    srsName: 'EPSG:4326',
    outputFormat: 'application/json'
  });
  const result = await fetchJson(`https://wfs.geonorge.no/skwms1/wfs.matrikkelen-bygningspunkt?${params}`);
  report.queries[name] = compactHttp(result);
}
await wfsBbox('kartverket_rom_bbox', [10.7498, 59.9196, 10.7533, 59.9220]);
await wfsBbox('kartverket_soft_bbox', [10.7408, 59.9085, 10.7440, 59.9106]);

// Conservative machine resolution: only mark a candidate ready when a stable named OSM object is returned at a coordinate distinct from the conflicting existing marker.
function stableOsmCandidates(payload, pattern) {
  const elements = payload?.json?.elements || [];
  return elements
    .filter((e) => pattern.test(String(e.tags?.name || '')))
    .map((e) => ({
      type: e.type,
      id: e.id,
      lat: e.lat ?? e.center?.lat ?? null,
      lon: e.lon ?? e.center?.lon ?? null,
      tags: e.tags || {}
    }))
    .filter((e) => Number.isFinite(e.lat) && Number.isFinite(e.lon));
}

const romNamedOsm = stableOsmCandidates(report.queries.rom_overpass, /ROM/i);
const softNamedOsm = stableOsmCandidates(report.queries.soft_overpass, /SOFT/i);

report.decisions.rom_for_kunst_og_arkitektur = romNamedOsm.length === 1 ? {
  status: 'candidate_osm_object_found_requires_manual_identity_check',
  candidate: romNamedOsm[0],
  sourceObjectId: `osm:${romNamedOsm[0].type}/${romNamedOsm[0].id}`,
  nextGate: 'Confirm the OSM object is physically the ROM building/entrance described by ROM and is not the X-Ray marker before production.'
} : {
  status: 'still_requires_anchor_resolution',
  namedOsmCandidates: romNamedOsm,
  nextGate: 'Use the raw OSM road/building/entrance objects and Kartverket building points to identify a stable source-defined building O or entrance anchor; do not infer a random point.'
};

report.decisions.soft_galleri = softNamedOsm.length === 1 ? {
  status: 'candidate_osm_object_found_requires_manual_identity_check',
  candidate: softNamedOsm[0],
  sourceObjectId: `osm:${softNamedOsm[0].type}/${softNamedOsm[0].id}`,
  nextGate: 'Confirm the OSM object represents SOFT itself or its corner entrance, distinct from Fotografiens Hus, before production.'
} : {
  status: 'still_requires_anchor_resolution',
  namedOsmCandidates: softNamedOsm,
  nextGate: 'Use the official corner-entrance statement together with stable OSM/Kartverket geometry; do not choose a corner solely by visual guess.'
};

report.status = 'research_complete';
write('anchor-research.json', report);
write('README.md', `# VisitOSLO Galleries — distinct anchor research\n\nDate: 2026-07-24\n\nThis pass researches non-guessed coordinate anchors for ROM for kunst og arkitektur and SOFT galleri after ordinary address-first coordinates were rejected because they exactly overlap existing canonical markers.\n\nSources queried:\n- institution-owned physical-location statements\n- OpenStreetMap/Nominatim named objects and nearby entrance/road geometry\n- Kartverket open Matrikkelen Bygningspunkt WFS\n\nNo canonical coordinates are changed by this research pass. See \`anchor-research.json\` for raw responses and conservative machine decisions.\n`);

console.log(JSON.stringify({ status: report.status, decisions: report.decisions }, null, 2));
