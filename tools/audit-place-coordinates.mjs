import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const reportsDir = path.join(root, 'reports');
const manifestPath = path.join(root, 'data/places/manifest.json');

const osloBox = { minLat: 59.75, maxLat: 60.1, minLon: 10.45, maxLon: 11.05 };

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const rel = (p) => path.relative(root, p).replace(/\\/g, '/');
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const round6 = (n) => Math.round(n * 1e6) / 1e6;

function findPlaceJsonFiles(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...findPlaceJsonFiles(full));
    else if (/places?.*\.json$/i.test(name) || /^places_.*\.json$/i.test(name)) out.push(full);
  }
  return out;
}

function toPlaces(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.places)) return data.places;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

const manifest = readJson(manifestPath);
const usedByApp = new Set((manifest.files || []).map((f) => rel(path.join(root, 'data', f))));

const allPlaceFiles = findPlaceJsonFiles(dataDir).filter((f) => !/\/quiz\//.test(f));
const parseable = [];
const parseErrors = [];

for (const file of allPlaceFiles) {
  try {
    const json = readJson(file);
    const places = toPlaces(json);
    if (places.length) parseable.push({ file: rel(file), full: file, places, json });
  } catch (e) {
    parseErrors.push({ file: rel(file), error: String(e) });
  }
}

const rows = [];
const byId = new Map();
const byName = new Map();
const byCoord = new Map();

for (const pf of parseable) {
  for (const p of pf.places) {
    const row = {
      file: pf.file,
      id: p?.id ?? null,
      name: p?.name ?? null,
      category: p?.category ?? null,
      lat: p?.lat ?? null,
      lon: p?.lon ?? null,
      r: p?.r ?? null,
      image: p?.image ?? null,
      cardImage: p?.cardImage ?? null,
      frontImage: p?.frontImage ?? null,
      status: 'ok',
      flags: [],
      reason: ''
    };

    if (row.lat == null || row.lon == null) row.flags.push('missing_lat_lon');
    if ((row.lat != null && typeof row.lat !== 'number') || (row.lon != null && typeof row.lon !== 'number')) row.flags.push('non_numeric_lat_lon');
    if (isNum(row.lat) && isNum(row.lon) && (row.lat < -90 || row.lat > 90 || row.lon < -180 || row.lon > 180)) row.flags.push('invalid_lat_lon');
    if (row.r == null) row.flags.push('missing_radius');
    if (isNum(row.r) && row.r < 40) row.flags.push('suspicious_radius_low');
    if (isNum(row.r) && row.r > 500) row.flags.push('suspicious_radius_high');
    if (isNum(row.lat) && isNum(row.lon)) {
      const latPrec = String(row.lat).split('.')[1]?.length || 0;
      const lonPrec = String(row.lon).split('.')[1]?.length || 0;
      if (Math.min(latPrec, lonPrec) < 4) row.flags.push('low_precision_coord');
      const inOslo = row.lat >= osloBox.minLat && row.lat <= osloBox.maxLat && row.lon >= osloBox.minLon && row.lon <= osloBox.maxLon;
      const osloish = /oslo|akershus|by|historie|kunst|musikk|sport|politikk|natur/i.test(`${row.file} ${row.category ?? ''} ${row.name ?? ''}`);
      if (!inOslo && osloish) row.flags.push('outside_oslo_possible_intended');
      if (!inOslo && /places_by|oslo\//i.test(row.file)) row.flags.push('outside_expected_area');
    }
    const text = `${row.name ?? ''} ${row.category ?? ''}`.toLowerCase();
    if (/(gate|vei|veien|rute|route|ring\s*\d)/.test(text) && isNum(row.r) && row.r <= 300) row.flags.push('street_or_route_as_single_point');
    if (/(park|parken|skog|marka|område|fjord|elva|vann)/.test(text) && isNum(row.r) && row.r < 500) row.flags.push('area_or_park_needs_manual_review');
    if (isNum(row.r) && row.r > 250 && /(statue|statuen|kirke|museum|bygning|minnesmerke|opera|teater)/.test(text)) row.flags.push('area_or_park_needs_manual_review');

    if (row.id) {
      if (!byId.has(row.id)) byId.set(row.id, []);
      byId.get(row.id).push(row);
    }
    if (row.name) {
      const key = row.name.trim().toLowerCase();
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key).push(row);
    }
    if (isNum(row.lat) && isNum(row.lon)) {
      const ckey = `${round6(row.lat)},${round6(row.lon)}`;
      if (!byCoord.has(ckey)) byCoord.set(ckey, []);
      byCoord.get(ckey).push(row);
    }
    rows.push(row);
  }
}

for (const [, list] of byId) {
  if (list.length > 1) {
    for (const r of list) r.flags.push('duplicate_id');
    const coords = new Set(list.map((r) => `${r.lat},${r.lon}`));
    if (coords.size > 1) for (const r of list) r.flags.push('duplicate_id_different_coord');
  }
}
for (const [, list] of byName) {
  if (list.length > 1) {
    const coords = new Set(list.map((r) => `${r.lat},${r.lon}`));
    if (coords.size > 1) for (const r of list) r.flags.push('same_name_different_coord');
  }
}
for (const [, list] of byCoord) {
  const uniq = new Set(list.map((r) => r.name));
  if (uniq.size >= 4) for (const r of list) r.flags.push('same_coord_many_places');
}

const invalidFlags = new Set(['missing_lat_lon', 'invalid_lat_lon', 'non_numeric_lat_lon', 'missing_radius']);
const conflictFlags = new Set(['duplicate_id_different_coord', 'same_name_different_coord']);
for (const r of rows) {
  r.flags = [...new Set(r.flags)];
  if (r.flags.some((f) => invalidFlags.has(f))) r.status = 'invalid';
  else if (r.flags.some((f) => conflictFlags.has(f))) r.status = 'conflict';
  else if (r.flags.includes('duplicate_id')) r.status = 'duplicate';
  else if (r.flags.includes('outside_expected_area') || r.flags.includes('outside_oslo_possible_intended')) r.status = 'outside_expected_area';
  else if (r.flags.length) r.status = 'needs_review';
  r.reason = r.flags.join(', ');
}

const fileHashes = parseable.map((p) => ({ file: p.file, hash: crypto.createHash('sha1').update(JSON.stringify(p.json)).digest('hex') }));
const hashGroups = new Map();
for (const x of fileHashes) { if (!hashGroups.has(x.hash)) hashGroups.set(x.hash, []); hashGroups.get(x.hash).push(x.file); }
const duplicateFiles = [...hashGroups.values()].filter((g) => g.length > 1);

const knownSet = new Set(parseable.map((p) => p.file));
const unused = [...knownSet].filter((f) => !usedByApp.has(f));

const summary = {
  generatedAt: new Date().toISOString(),
  placeFilesRead: parseable.length,
  placesRead: rows.length,
  ok: rows.filter((r) => r.status === 'ok').length,
  needs_review: rows.filter((r) => r.status === 'needs_review').length,
  conflict: rows.filter((r) => r.status === 'conflict').length,
  invalid: rows.filter((r) => r.status === 'invalid').length,
  duplicate: rows.filter((r) => r.status === 'duplicate').length,
  outside_expected_area: rows.filter((r) => r.status === 'outside_expected_area').length,
};

const report = {
  ...summary,
  usedByApp: [...usedByApp].filter((f) => knownSet.has(f)).sort(),
  inRepoButUnused: unused.sort(),
  parseErrors,
  duplicateFiles,
  highPriorityFindings: rows.filter((r) => ['invalid', 'conflict'].includes(r.status)),
  coordMetadataSuggestion: {
    fields: ['coordType', 'coordStatus', 'coordSource', 'coordPrecisionM', 'coordVerifiedAt'],
    coordTypeValues: ['entrance','building_center','statue','square_center','park_center','area_center','street_midpoint','route_midpoint','historical_site','approximate']
  },
  flaggedPlaces: rows.filter((r) => r.status !== 'ok')
};

fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(path.join(reportsDir, 'place-coordinate-audit.json'), JSON.stringify(report, null, 2));

let md = `# Place coordinate audit\n\nGenerert: ${report.generatedAt}\n\n`;
md += `## Sammendrag\n- Place-filer lest: **${report.placeFilesRead}**\n- Steder lest: **${report.placesRead}**\n- ok: **${report.ok}**\n- needs_review: **${report.needs_review}**\n- conflict: **${report.conflict}**\n- invalid: **${report.invalid}**\n- duplicate: **${report.duplicate}**\n- outside_expected_area: **${report.outside_expected_area}**\n\n`;
md += `## Filer brukt av appen\n${report.usedByApp.map((f) => `- ${f}`).join('\n')}\n\n`;
md += `## Filer i repo som ikke ser ut brukt av appen\n${report.inRepoButUnused.map((f) => `- ${f}`).join('\n') || '- Ingen'}\n\n`;
md += `## Mulige duplikatfiler\n${report.duplicateFiles.map((g) => `- ${g.join(' = ')}`).join('\n') || '- Ingen'}\n\n`;
md += `## Høyprioriterte funn\n${report.highPriorityFindings.slice(0, 50).map((r) => `- ${r.file} | ${r.id} | ${r.name} | ${r.status} | ${r.reason}`).join('\n') || '- Ingen'}\n\n`;
md += `## Flaggede steder\n\n| file | id | name | category | lat | lon | r | status | flags |\n|---|---|---|---|---:|---:|---:|---|---|\n`;
for (const r of report.flaggedPlaces) md += `| ${r.file} | ${r.id ?? ''} | ${r.name ?? ''} | ${r.category ?? ''} | ${r.lat ?? ''} | ${r.lon ?? ''} | ${r.r ?? ''} | ${r.status} | ${r.flags.join(', ')} |\n`;

fs.writeFileSync(path.join(reportsDir, 'place-coordinate-audit.md'), md);
console.log(`Audit ferdig. Filer: ${summary.placeFilesRead}, steder: ${summary.placesRead}, flagget: ${report.flaggedPlaces.length}`);
