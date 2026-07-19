import fs from 'node:fs';
import path from 'node:path';

const reportDir = 'reports/oslo-coordinate-control-batch-36-raw-map-diagnostic';
fs.mkdirSync(reportDir, { recursive: true });

const headers = { 'User-Agent': 'History-Go-coordinate-control/1.0 repository-coordinate-audit' };
async function fetchText(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
}

function attrs(text) {
  const out = {};
  for (const m of text.matchAll(/([:\w-]+)="([^"]*)"/g)) out[m[1]] = m[2];
  return out;
}
function tags(body) {
  const out = {};
  for (const m of body.matchAll(/<tag\s+([^>]*?)\/>/g)) {
    const a = attrs(m[1]);
    if (a.k != null) out[a.k] = a.v ?? '';
  }
  return out;
}
function parseMap(xml) {
  const nodes = new Map();
  for (const m of xml.matchAll(/<node\s+([^>]*?)\/>/g)) {
    const a = attrs(m[1]);
    if (a.id && a.lat && a.lon) nodes.set(a.id, { lat: Number(a.lat), lon: Number(a.lon) });
  }
  for (const m of xml.matchAll(/<node\s+([^>]*?)>([\s\S]*?)<\/node>/g)) {
    const a = attrs(m[1]);
    if (a.id && a.lat && a.lon) nodes.set(a.id, { lat: Number(a.lat), lon: Number(a.lon) });
  }
  const ways = new Map();
  for (const m of xml.matchAll(/<way\s+([^>]*?)>([\s\S]*?)<\/way>/g)) {
    const a = attrs(m[1]);
    const body = m[2];
    const refs = [...body.matchAll(/<nd\s+ref="([^"]+)"\s*\/>/g)].map((x) => x[1]);
    ways.set(a.id, { id: a.id, refs, tags: tags(body) });
  }
  const relations = [];
  for (const m of xml.matchAll(/<relation\s+([^>]*?)>([\s\S]*?)<\/relation>/g)) {
    const a = attrs(m[1]);
    const body = m[2];
    const members = [...body.matchAll(/<member\s+([^>]*?)\/>/g)].map((x) => attrs(x[1]));
    relations.push({ id: a.id, members, tags: tags(body) });
  }
  return { nodes, ways, relations };
}
function wayPoints(way, nodes) {
  return way.refs.map((ref) => nodes.get(ref)).filter(Boolean);
}
function relationPoints(relation, ways, nodes) {
  const points = [];
  for (const member of relation.members) {
    if (member.type !== 'way') continue;
    const way = ways.get(member.ref);
    if (way) points.push(...wayPoints(way, nodes));
  }
  return points;
}
function geometrySummary(points) {
  if (!points.length) return null;
  const minLat = Math.min(...points.map((p) => p.lat));
  const maxLat = Math.max(...points.map((p) => p.lat));
  const minLon = Math.min(...points.map((p) => p.lon));
  const maxLon = Math.max(...points.map((p) => p.lon));
  return {
    pointCount: points.length,
    bounds: { minLat, maxLat, minLon, maxLon },
    bboxCenter: { lat: (minLat + maxLat) / 2, lon: (minLon + maxLon) / 2 },
    meanPoint: {
      lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
      lon: points.reduce((sum, p) => sum + p.lon, 0) / points.length,
    },
    start: points[0],
    end: points.at(-1),
  };
}
function interesting(tags) {
  const name = String(tags.name || '');
  return tags.natural === 'water' || tags.water || tags.waterway || tags.landuse === 'basin' || tags.leisure === 'park' || /Aln|Vannspeil|Middelalder/i.test(name);
}
function summarizeMap(parsed) {
  const objects = [];
  for (const way of parsed.ways.values()) {
    if (!interesting(way.tags)) continue;
    objects.push({
      sourceObjectId: `osm-way:${way.id}`,
      objectType: 'way',
      tags: way.tags,
      geometry: geometrySummary(wayPoints(way, parsed.nodes)),
    });
  }
  for (const relation of parsed.relations) {
    if (!interesting(relation.tags)) continue;
    objects.push({
      sourceObjectId: `osm-relation:${relation.id}`,
      objectType: 'relation',
      tags: relation.tags,
      members: relation.members,
      geometry: geometrySummary(relationPoints(relation, parsed.ways, parsed.nodes)),
    });
  }
  return objects;
}

const boxes = {
  alnsjoen: [10.84, 59.958, 10.865, 59.973],
  middelalderparken: [10.758, 59.900, 10.768, 59.908],
};
const results = {};
for (const [key, bbox] of Object.entries(boxes)) {
  const url = `https://api.openstreetmap.org/api/0.6/map?bbox=${bbox.join(',')}`;
  const xml = await fetchText(url);
  fs.writeFileSync(path.join(reportDir, `${key}.osm.xml`), xml);
  const parsed = parseMap(xml);
  results[key] = {
    bbox,
    nodeCount: parsed.nodes.size,
    wayCount: parsed.ways.size,
    relationCount: parsed.relations.length,
    objects: summarizeMap(parsed),
  };
}

fs.writeFileSync(path.join(reportDir, 'results.json'), `${JSON.stringify(results, null, 2)}\n`);
const lines = ['# Oslo coordinate control batch 36 – raw OSM map diagnostic', '', 'Read-only raw OSM map extraction for the two unresolved precision questions.', ''];
for (const [key, result] of Object.entries(results)) {
  lines.push(`## ${key}`);
  lines.push(`- bbox: \`${result.bbox.join(',')}\``);
  lines.push(`- parsed: ${result.nodeCount} nodes, ${result.wayCount} ways, ${result.relationCount} relations`);
  for (const object of result.objects) {
    const t = object.tags || {};
    lines.push(`- \`${object.sourceObjectId}\` name=\`${t.name || ''}\` natural=\`${t.natural || ''}\` water=\`${t.water || ''}\` waterway=\`${t.waterway || ''}\` landuse=\`${t.landuse || ''}\` leisure=\`${t.leisure || ''}\` geometry=\`${JSON.stringify(object.geometry)}\``);
  }
  lines.push('');
}
fs.writeFileSync(path.join(reportDir, 'README.md'), `${lines.join('\n')}\n`);
console.log(JSON.stringify({ reportDir, counts: Object.fromEntries(Object.entries(results).map(([k,v]) => [k,v.objects.length])) }, null, 2));
