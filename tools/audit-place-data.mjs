import fs from 'fs';
import path from 'path';

const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');
const reportPath = path.join(root, 'reports/place-data-audit.md');

const requiredFields = ['id', 'name', 'lat', 'lon', 'r', 'category', 'year', 'desc'];
const PLACE_REF_KEYS = ['placeId', 'place_id', 'places', 'placeIds', 'place_ids', 'related_places', 'place'];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

function isMissing(v) {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

function fileExistsLikeAsset(rawPath) {
  if (typeof rawPath !== 'string' || !rawPath.trim()) return false;
  const cleaned = rawPath.trim();
  const candidates = [
    path.join(root, cleaned),
    path.join(root, cleaned.replace(/^\/+/, '')),
    path.join(root, cleaned.replace(/^\.\//, '')),
  ];
  return candidates.some((p) => fs.existsSync(p));
}

function listJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const files = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && full.endsWith('.json')) files.push(full);
    }
  };
  walk(dirPath);
  return files;
}

function collectRefsByKeys(node, keys, currentPath = '', refs = []) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectRefsByKeys(v, keys, `${currentPath}[${i}]`, refs));
    return refs;
  }
  if (!node || typeof node !== 'object') return refs;
  for (const [k, v] of Object.entries(node)) {
    const nextPath = currentPath ? `${currentPath}.${k}` : k;
    if (keys.includes(k)) {
      if (typeof v === 'string') refs.push({ key: nextPath, value: v });
      if (Array.isArray(v)) {
        for (const item of v) if (typeof item === 'string') refs.push({ key: nextPath, value: item });
      }
    }
    collectRefsByKeys(v, keys, nextPath, refs);
  }
  return refs;
}

const manifest = readJson(manifestPath);
const placeFiles = manifest.files.map((rel) => path.join(root, 'data', rel));

const allPlaces = [];
const perFile = [];
const duplicatesMap = new Map();

for (const filePath of placeFiles) {
  const rel = path.relative(root, filePath).replace(/\\/g, '/');
  let json;
  try {
    json = readJson(filePath);
  } catch (e) {
    perFile.push({ file: rel, parseError: String(e), places: [] });
    continue;
  }
  const places = toArray(json);
  const findings = [];
  for (const p of places) {
    const missingRequired = requiredFields.filter((f) => isMissing(p?.[f]));
    const missing = {
      missingRequired,
      popupDesc: isMissing(p?.popupDesc),
      image: isMissing(p?.image),
      cardImage: isMissing(p?.cardImage),
      emne_ids: !Array.isArray(p?.emne_ids) || p.emne_ids.length === 0,
      quiz_profile: isMissing(p?.quiz_profile),
      usesImageCard: !isMissing(p?.imageCard),
      stub: p?.stub === true,
      hidden: p?.hidden === true,
    };

    const badPaths = [];
    for (const k of ['image', 'cardImage', 'imageCard']) {
      if (!isMissing(p?.[k]) && !fileExistsLikeAsset(p[k])) {
        badPaths.push({ field: k, value: p[k] });
      }
    }

    const placeId = p?.id;
    if (!isMissing(placeId)) {
      if (!duplicatesMap.has(placeId)) duplicatesMap.set(placeId, []);
      duplicatesMap.get(placeId).push({ file: rel, name: p?.name ?? '' });
    }

    findings.push({ id: placeId ?? '(mangler id)', name: p?.name ?? '(mangler name)', missing, badPaths });
    allPlaces.push({ file: rel, place: p });
  }
  perFile.push({ file: rel, places: findings });
}

const duplicateIds = [...duplicatesMap.entries()].filter(([, arr]) => arr.length > 1);

const validPlaceIds = new Set(
  allPlaces.map((x) => x.place?.id).filter((id) => typeof id === 'string' && id.trim() !== '')
);

const coverageSources = [
  { name: 'quiz', files: listJsonFiles(path.join(root, 'data/quiz')), keys: ['placeId', 'place_id', 'place'] },
  { name: 'people', files: [path.join(root, 'data/people.json')], keys: ['placeId', 'place_id', 'places', 'placeIds', 'related_places'] },
  { name: 'nature', files: listJsonFiles(path.join(root, 'data/natur')), keys: ['placeId', 'place_id', 'places', 'placeIds'] },
  { name: 'badges', files: [path.join(root, 'data/badges.json'), ...listJsonFiles(path.join(root, 'data/badges'))], keys: ['placeId', 'place_id', 'places', 'placeIds'] },
  { name: 'wonderkammer', files: [path.join(root, 'data/wonderkammer/index.json'), ...listJsonFiles(path.join(root, 'data/wonderkammer'))], keys: ['placeId', 'place_id', 'places', 'placeIds'] },
  { name: 'relations', files: listJsonFiles(path.join(root, 'data/relations')), keys: PLACE_REF_KEYS },
  { name: 'leksikon', files: [...listJsonFiles(path.join(root, 'data/leksikon/places')), ...listJsonFiles(path.join(root, 'data/leksikon/sprak/places'))], keys: PLACE_REF_KEYS },
  { name: 'external/offisielle lenker', files: listJsonFiles(path.join(root, 'data/external')), keys: PLACE_REF_KEYS },
];

const coverageBySource = {};
for (const source of coverageSources) {
  const seen = new Set();
  const dangling = [];
  for (const filePath of source.files) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const json = readJson(filePath);
      const refs = collectRefsByKeys(json, source.keys);
      for (const ref of refs) {
        seen.add(ref.value);
        if (!validPlaceIds.has(ref.value)) {
          dangling.push({ file: path.relative(root, filePath).replace(/\\/g, '/'), key: ref.key, value: ref.value });
        }
      }
    } catch {
      // ignore parse errors for coverage sources
    }
  }
  coverageBySource[source.name] = { seen, dangling, files: source.files.length };
}

const refTargets = [
  'data/people.json',
  'data/badges.json',
  'data/routes.json',
  'data/routes_walks.json',
  'data/wonderkammer/index.json',
  'data/Civication/place_access_map.json',
  'data/Civication/place_contexts.json',
  'data/Civication/people_access_map.json',
].map((p) => path.join(root, p));

function collectPlaceRefs(node, currentPath = '', refs = []) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectPlaceRefs(v, `${currentPath}[${i}]`, refs));
    return refs;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      const nextPath = currentPath ? `${currentPath}.${k}` : k;
      const keyLooksLikePlace = /place/i.test(k);
      if (typeof v === 'string' && keyLooksLikePlace) refs.push({ key: nextPath, value: v });
      if (Array.isArray(v) && keyLooksLikePlace) {
        for (const item of v) {
          if (typeof item === 'string') refs.push({ key: nextPath, value: item });
        }
      }
      collectPlaceRefs(v, nextPath, refs);
    }
  }
  return refs;
}

const danglingRefs = [];
for (const filePath of refTargets) {
  if (!fs.existsSync(filePath)) continue;
  try {
    const json = readJson(filePath);
    const refs = collectPlaceRefs(json);
    for (const ref of refs) {
      if (!validPlaceIds.has(ref.value)) {
        danglingRefs.push({ file: path.relative(root, filePath).replace(/\\/g, '/'), ...ref });
      }
    }
  } catch {
    // ignore parse errors for ref files
  }
}

const totals = {
  files: perFile.length,
  places: allPlaces.length,
  missingRequired: 0,
  missingPopupDesc: 0,
  missingImage: 0,
  missingCardImage: 0,
  missingEmneIds: 0,
  missingQuizProfile: 0,
  usesImageCard: 0,
  stubOrHidden: 0,
  badAssetPaths: 0,
};

for (const f of perFile) {
  for (const p of f.places ?? []) {
    if (p.missing.missingRequired.length) totals.missingRequired++;
    if (p.missing.popupDesc) totals.missingPopupDesc++;
    if (p.missing.image) totals.missingImage++;
    if (p.missing.cardImage) totals.missingCardImage++;
    if (p.missing.emne_ids) totals.missingEmneIds++;
    if (p.missing.quiz_profile) totals.missingQuizProfile++;
    if (p.missing.usesImageCard) totals.usesImageCard++;
    if (p.missing.stub || p.missing.hidden) totals.stubOrHidden++;
    totals.badAssetPaths += p.badPaths.length;
  }
}

let md = '# Place Data Audit\n\n';
md += `Generert: ${new Date().toISOString()}\n\n`;
md += '## Totalsammendrag\n\n';
md += `- Place-filer i manifest: **${totals.files}**\n`;
md += `- Totalt antall places: **${totals.places}**\n`;
md += `- Steder med manglende obligatoriske felt: **${totals.missingRequired}**\n`;
md += `- Steder med manglende popupDesc: **${totals.missingPopupDesc}**\n`;
md += `- Steder med manglende image: **${totals.missingImage}**\n`;
md += `- Steder med manglende cardImage: **${totals.missingCardImage}**\n`;
md += `- Steder med manglende emne_ids: **${totals.missingEmneIds}**\n`;
md += `- Steder med manglende quiz_profile: **${totals.missingQuizProfile}**\n`;
md += `- Steder som bruker imageCard-felt: **${totals.usesImageCard}**\n`;
md += `- Steder med stub:true eller hidden:true: **${totals.stubOrHidden}**\n`;
md += `- Antall ødelagte asset paths: **${totals.badAssetPaths}**\n`;
md += `- Antall place-referanser til ikke-eksisterende id-er: **${danglingRefs.length}**\n\n`;
md += '## Dekning per datasett (placeId/places)\n\n';
for (const source of coverageSources) {
  const cov = coverageBySource[source.name];
  const covered = [...validPlaceIds].filter((id) => cov.seen.has(id)).length;
  const missing = validPlaceIds.size - covered;
  md += `- **${source.name}**: ${covered}/${validPlaceIds.size} steder dekket (mangler ${missing}, ugyldige refs ${cov.dangling.length})\n`;
}
md += '\n';

const missingQuizCoverage = [...validPlaceIds].filter((id) => !coverageBySource.quiz.seen.has(id));
const missingRounds = allPlaces
  .map((x) => x.place)
  .filter((p) => typeof p?.id === 'string')
  .filter((p) => isMissing(p?.r))
  .map((p) => p.id);

md += '## Manglende rundinger og quizdekning\n\n';
md += `- Manglende rundinger (r): **${missingRounds.length}**\n`;
if (missingRounds.length) md += `  - ${missingRounds.slice(0, 100).join(', ')}${missingRounds.length > 100 ? ' ...' : ''}\n`;
md += `- Manglende quizdekning: **${missingQuizCoverage.length}**\n`;
if (missingQuizCoverage.length) md += `  - ${missingQuizCoverage.slice(0, 100).join(', ')}${missingQuizCoverage.length > 100 ? ' ...' : ''}\n`;
md += '\n';

md += '## Funn per fil\n\n';
for (const f of perFile) {
  md += `### ${f.file}\n\n`;
  if (f.parseError) {
    md += `- Parse-feil: ${f.parseError}\n\n`;
    continue;
  }
  const problemPlaces = f.places.filter((p) =>
    p.missing.missingRequired.length || p.missing.popupDesc || p.missing.image || p.missing.cardImage || p.missing.emne_ids || p.missing.quiz_profile || p.missing.usesImageCard || p.missing.stub || p.missing.hidden || p.badPaths.length
  );
  md += `- Antall places: ${f.places.length}\n`;
  md += `- Places med funn: ${problemPlaces.length}\n\n`;
  for (const p of problemPlaces) {
    const parts = [];
    if (p.missing.missingRequired.length) parts.push(`mangler felt: ${p.missing.missingRequired.join(', ')}`);
    if (p.missing.popupDesc) parts.push('mangler popupDesc');
    if (p.missing.image) parts.push('mangler image');
    if (p.missing.cardImage) parts.push('mangler cardImage');
    if (p.missing.emne_ids) parts.push('mangler emne_ids');
    if (p.missing.quiz_profile) parts.push('mangler quiz_profile');
    if (p.missing.usesImageCard) parts.push('bruker imageCard');
    if (p.missing.stub) parts.push('stub:true');
    if (p.missing.hidden) parts.push('hidden:true');
    if (p.badPaths.length) parts.push(`ødelagte paths: ${p.badPaths.map((b) => `${b.field}=${b.value}`).join('; ')}`);
    md += `- ${p.id} (${p.name}): ${parts.join(' | ')}\n`;
  }
  md += '\n';
}

md += '## Duplikate id-er\n\n';
if (!duplicateIds.length) {
  md += '- Ingen duplikate id-er funnet.\n\n';
} else {
  for (const [id, hits] of duplicateIds) {
    md += `- ${id}: ${hits.map((h) => `${h.file} (${h.name})`).join(' ; ')}\n`;
  }
  md += '\n';
}

md += '## Ødelagte asset paths\n\n';
const broken = [];
for (const f of perFile) {
  for (const p of f.places) {
    for (const b of p.badPaths) broken.push({ file: f.file, id: p.id, field: b.field, value: b.value });
  }
}
if (!broken.length) md += '- Ingen ødelagte asset paths funnet.\n\n';
else {
  for (const b of broken) md += `- ${b.file} :: ${b.id} :: ${b.field} -> ${b.value}\n`;
  md += '\n';
}

md += '## Referanser til place-id-er som ikke finnes\n\n';
if (!danglingRefs.length) md += '- Ingen ugyldige place-referanser i people/badges/routes/wonderkammer/civication-filer som ble sjekket.\n\n';
else {
  for (const d of danglingRefs) md += `- ${d.file} :: ${d.key} -> ${d.value}\n`;
  md += '\n';
}

md += '## Anbefalt rekkefølge for ferdigstilling\n\n';
md += '1. Rett duplikate id-er og ugyldige place-referanser i avhengige datasett.\n';
md += '2. Fyll inn obligatoriske basisfelt (id, name, lat, lon, r, category, year, desc).\n';
md += '3. Fyll inn popupDesc, emne_ids og quiz_profile på alle steder.\n';
md += '4. Standardiser bilde-felter: bytt imageCard -> cardImage og fyll manglende image/cardImage.\n';
md += '5. Korriger ødelagte asset paths og fjern/avklar stub:true og hidden:true.\n';
md += '\n## Neste arbeid (prioritert)\n\n';
md += `1. Lag quiz for ${missingQuizCoverage.length} steder uten quizdekning (start med steder som også mangler popupDesc/emne_ids).\n`;
md += `2. Fyll inn rundinger (r) for ${missingRounds.length} steder som mangler dette feltet.\n`;
md += '3. Rydd opp ugyldige place-referanser i datasett med høyest antall dangling refs (se dekningsseksjonen).\n';
md += '4. Øk dekning i people/nature/badges/wonderkammer/leksikon/external ved å koble placeId/places mot eksisterende steder.\n';

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, md, 'utf8');
console.log(`Audit complete: ${path.relative(root, reportPath)}`);
