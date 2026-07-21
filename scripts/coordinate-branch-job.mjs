import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const outDir = path.join(root, 'reports/visitoslo-parks-nature-audit-20260721');
fs.mkdirSync(outDir, { recursive: true });

const indexRaw = JSON.parse(fs.readFileSync(path.join(root, 'data/places/places_index.json'), 'utf8'));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];

const entries = [
  { sourceName: 'Vigelandsparken', expectedIds: ['vigelandsparken', 'vigeland_sculpture_park'] },
  { sourceName: 'Ekebergparken skulpturpark', expectedIds: ['ekebergparken', 'ekebergparken_skulpturpark'] },
  { sourceName: 'Stovnertårnet', expectedIds: ['stovnertarnet', 'stovnertårnet'] },
  { sourceName: 'Bærums Verk', outsideOslo: true, expectedIds: ['baerums_verk'] },
  { sourceName: 'Botanisk hage', expectedIds: ['botanisk_hage'] },
  { sourceName: 'Bleikøya', expectedIds: ['bleikoya'] },
  { sourceName: 'Frognerparken', expectedIds: ['frognerparken'] },
  { sourceName: 'Ingierstrand bad', outsideOslo: true, expectedIds: ['ingierstrand_bad', 'ingierstrand'] },
  { sourceName: 'Akerselva', expectedIds: ['akerselva'] },
  { sourceName: 'Lillomarka', expectedIds: ['lillomarka'] },
  { sourceName: 'Torshovparken', expectedIds: ['torshovparken', 'torshov_park'] },
  { sourceName: 'Gressholmen, Heggholmen og Rambergøya', groupIds: ['gressholmen', 'heggholmen', 'rambergoya'] },
  { sourceName: 'Sofienbergparken', expectedIds: ['sofienbergparken', 'sofienbergparken_subkultur'] },
  { sourceName: 'Langøyene', expectedIds: ['langoyene', 'langøyene'] },
  { sourceName: 'Steilene', outsideOslo: true, expectedIds: ['steilene'] },
  { sourceName: 'Lindøya', expectedIds: ['lindoya'] },
  { sourceName: 'Sognsvann', expectedIds: ['sognsvann'] },
  { sourceName: 'Grorudparken', expectedIds: ['grorudparken', 'grorud_park'] },
  { sourceName: 'Helleristningene på Ekeberg', expectedIds: ['helleristningene_ekeberg', 'ekeberg_helleristninger', 'helleristningene_pa_ekeberg'] },
  { sourceName: 'Aamot bru', expectedIds: ['aamot_bru', 'aamodt_bru', 'aamodtbrua'] },
  { sourceName: 'Ormøya og Malmøya', groupIds: ['ormoya', 'malmoya'] },
  { sourceName: 'Bogstadvannet', expectedIds: ['bogstadvannet'] },
  { sourceName: 'Klosterenga skulpturpark', expectedIds: ['klosterenga_skulpturpark', 'klosterenga'] },
  { sourceName: 'Frysja / Brekkedammen', expectedIds: ['frysja', 'brekkedammen', 'frysja_brekkedammen'] },
  { sourceName: 'Ulvøya', expectedIds: ['ulvoya'] },
  { sourceName: 'Østensjøvannet', expectedIds: ['ostensjovannet', 'østensjøvannet'] },
  { sourceName: 'Oscarshall', expectedIds: ['oscarshall'] },
  { sourceName: 'Peer Gynt-parken', expectedIds: ['peer_gynt_parken', 'peer_gyntparken'] },
  { sourceName: 'Bygdøy', expectedIds: ['bygdoy', 'bygdoy_natur'] },
  { sourceName: 'Torshovdalen', expectedIds: ['torshovdalen'] }
];

function norm(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function compact(value) {
  return norm(value).replace(/\s+/g, '');
}

function summary(place) {
  return {
    id: place.id,
    name: place.name,
    category: place.category,
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    sourceFile: place.sourceFile
  };
}

const byId = new Map(places.map((p) => [p.id, p]));
const results = entries.map((entry) => {
  const expectedIds = entry.groupIds ?? entry.expectedIds ?? [];
  const exactIdMatches = expectedIds.filter((id) => byId.has(id)).map((id) => summary(byId.get(id)));
  const sourceNorm = norm(entry.sourceName);
  const sourceCompact = compact(entry.sourceName);
  const nameMatches = places
    .filter((p) => {
      const n = norm(p.name);
      const c = compact(p.name);
      if (!n) return false;
      if (n === sourceNorm || c === sourceCompact) return true;
      if (sourceNorm.length >= 8 && (n.includes(sourceNorm) || sourceNorm.includes(n))) return true;
      return false;
    })
    .slice(0, 20)
    .map(summary);

  const idFragments = expectedIds.map(norm).filter(Boolean);
  const fragmentMatches = places
    .filter((p) => {
      const hay = `${norm(p.id)} ${norm(p.name)}`;
      return idFragments.some((fragment) => fragment.length >= 5 && hay.includes(fragment));
    })
    .slice(0, 20)
    .map(summary);

  const merged = [...exactIdMatches, ...nameMatches, ...fragmentMatches];
  const unique = [...new Map(merged.map((m) => [m.id, m])).values()];

  return {
    ...entry,
    exactIdMatches,
    nameMatches,
    fragmentMatches,
    uniqueMatches: unique,
    runtimeResolution:
      entry.outsideOslo ? 'outside_oslo' :
      entry.groupIds && entry.groupIds.every((id) => byId.has(id)) ? 'group_fully_represented' :
      exactIdMatches.length > 0 ? 'exact_id_present' :
      unique.length > 0 ? 'possible_alias_or_overlap' :
      'no_runtime_match'
  };
});

const counts = results.reduce((acc, row) => {
  acc[row.runtimeResolution] = (acc[row.runtimeResolution] ?? 0) + 1;
  return acc;
}, {});

const report = {
  capturedAt: '2026-07-21',
  source: 'VisitOSLO – Attraksjoner: Parker / naturattraksjoner',
  sourceUrl: 'https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/attraksjoner/parker-naturattraksjoner/',
  scopeRule: '30 visible result cards surfaced before the current Vis flere control in the indexed Norwegian page snapshot',
  sourceEntryCount: entries.length,
  runtimePlaceCount: places.length,
  counts,
  results
};

fs.writeFileSync(path.join(outDir, 'runtime-match.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, 'source.json'), `${JSON.stringify({
  capturedAt: '2026-07-21',
  source: report.source,
  sourceUrl: report.sourceUrl,
  scopeRule: report.scopeRule,
  entries: entries.map(({ sourceName, outsideOslo = false }) => ({ sourceName, outsideOslo }))
}, null, 2)}\n`);

fs.rmSync(fileURLToPath(import.meta.url));
console.log(JSON.stringify({ sourceEntryCount: entries.length, runtimePlaceCount: places.length, counts }, null, 2));
