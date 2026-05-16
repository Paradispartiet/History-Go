import fs from 'fs';
import path from 'path';
import { PLACE_REF_KEYS, collectRefsByKeys, manifestFilesToPaths, readJson, toArray } from './lib/placeRefAuditUtils.mjs';

const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');
const reportPath = path.join(root, 'reports/place-data-audit.md');
const worklistPath = path.join(root, 'reports/place-data-worklist.json');

const requiredFields = ['id', 'name', 'lat', 'lon', 'r', 'category', 'year', 'desc'];
const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 };

function isMissing(v) { return v === undefined || v === null || (typeof v === 'string' && v.trim() === ''); }
function hasCoordinates(p) { return !isMissing(p?.lat) && !isMissing(p?.lon); }
function hasNonEmptyObject(v) { return !!(v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0); }

function fileExistsLikeAsset(rawPath) {
  if (typeof rawPath !== 'string' || !rawPath.trim()) return false;
  const cleaned = rawPath.trim();
  const candidates = [path.join(root, cleaned), path.join(root, cleaned.replace(/^\/+/, '')), path.join(root, cleaned.replace(/^\.\//, ''))];
  return candidates.some((p) => fs.existsSync(p));
}

function listJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const files = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full); else if (entry.isFile() && full.endsWith('.json')) files.push(full);
    }
  };
  walk(dirPath);
  return files;
}


const generatedAt = new Date().toISOString();
const manifest = readJson(manifestPath);
const placeFiles = manifest.files.map((rel) => path.join(root, 'data', rel));

const allPlaces = [];
const perFile = [];
const duplicatesMap = new Map();

for (const filePath of placeFiles) {
  const rel = path.relative(root, filePath).replace(/\\/g, '/');
  let json;
  try { json = readJson(filePath); } catch (e) { perFile.push({ file: rel, parseError: String(e), places: [] }); continue; }
  const places = toArray(json);
  const findings = [];
  for (const p of places) {
    const missingRequired = requiredFields.filter((f) => isMissing(p?.[f]));
    const missing = { missingRequired, popupDesc: isMissing(p?.popupDesc), image: isMissing(p?.image), cardImage: isMissing(p?.cardImage), emne_ids: !Array.isArray(p?.emne_ids) || p.emne_ids.length === 0, quiz_profile: isMissing(p?.quiz_profile), usesImageCard: !isMissing(p?.imageCard), stub: p?.stub === true, hidden: p?.hidden === true };
    const badPaths = [];
    for (const k of ['image', 'cardImage', 'imageCard']) if (!isMissing(p?.[k]) && !fileExistsLikeAsset(p[k])) badPaths.push({ field: k, value: p[k] });
    const placeId = p?.id;
    if (!isMissing(placeId)) { if (!duplicatesMap.has(placeId)) duplicatesMap.set(placeId, []); duplicatesMap.get(placeId).push({ file: rel, name: p?.name ?? '' }); }
    findings.push({ id: placeId ?? '(mangler id)', name: p?.name ?? '(mangler name)', missing, badPaths });
    allPlaces.push({ file: rel, place: p });
  }
  perFile.push({ file: rel, places: findings });
}

const duplicateIds = [...duplicatesMap.entries()].filter(([, arr]) => arr.length > 1);
const validPlaceIds = new Set(allPlaces.map((x) => x.place?.id).filter((id) => typeof id === 'string' && id.trim() !== ''));

const coverageSources = [
  { name: 'quiz', files: listJsonFiles(path.join(root, 'data/quiz')), keys: ['placeId', 'place_id', 'place'] },
  { name: 'people', files: manifestFilesToPaths(root, path.join(root, 'data/people/manifest.json')), keys: PLACE_REF_KEYS },
  { name: 'nature', files: listJsonFiles(path.join(root, 'data/natur')), keys: ['placeId', 'place_id', 'places', 'placeIds'] },
  { name: 'badges', files: [path.join(root, 'data/badges.json'), ...listJsonFiles(path.join(root, 'data/badges'))], keys: ['placeId', 'place_id', 'places', 'placeIds'] },
  { name: 'wonderkammer', files: [path.join(root, 'data/wonderkammer/index.json'), ...listJsonFiles(path.join(root, 'data/wonderkammer'))], keys: ['placeId', 'place_id', 'places', 'placeIds'] },
  { name: 'relations', files: listJsonFiles(path.join(root, 'data/relations')), keys: PLACE_REF_KEYS },
  { name: 'leksikon', files: listJsonFiles(path.join(root, 'data/leksikon/places')), keys: PLACE_REF_KEYS },
  { name: 'sprakleksikon', files: listJsonFiles(path.join(root, 'data/leksikon/sprak/places')), keys: PLACE_REF_KEYS },
  { name: 'external/offisielle lenker', files: listJsonFiles(path.join(root, 'data/external')), keys: PLACE_REF_KEYS },
];

const coverageBySource = {};
for (const source of coverageSources) {
  const seen = new Set(); const dangling = [];
  for (const filePath of source.files) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const refs = collectRefsByKeys(readJson(filePath), source.keys);
      for (const ref of refs) { seen.add(ref.value); if (!validPlaceIds.has(ref.value)) dangling.push({ file: path.relative(root, filePath).replace(/\\/g, '/'), key: ref.key, value: ref.value }); }
    } catch {}
  }
  coverageBySource[source.name] = { seen, dangling, files: source.files.length };
}

const peopleManifestFiles = manifestFilesToPaths(root, path.join(root, 'data/people/manifest.json'));
const refTargets = ['data/badges.json','data/routes.json','data/routes_walks.json','data/wonderkammer/index.json','data/Civication/place_access_map.json','data/Civication/place_contexts.json','data/Civication/people_access_map.json'].map((p) => path.isAbsolute(p) ? p : path.join(root, p));

const danglingRefs = [];
for (const filePath of peopleManifestFiles) {
  if (!fs.existsSync(filePath)) continue;
  try {
    const refs = collectRefsByKeys(readJson(filePath), PLACE_REF_KEYS);
    for (const ref of refs) if (!validPlaceIds.has(ref.value)) danglingRefs.push({ file: path.relative(root, filePath).replace(/\\/g, '/'), ...ref });
  } catch {}
}

for (const filePath of refTargets) {
  if (!fs.existsSync(filePath)) continue;
  try {
    const refs = collectRefsByKeys(readJson(filePath), PLACE_REF_KEYS);
    for (const ref of refs) if (!validPlaceIds.has(ref.value)) danglingRefs.push({ file: path.relative(root, filePath).replace(/\\/g, '/'), ...ref });
  } catch {}
}

const totals = { files: perFile.length, places: allPlaces.length, missingRequired: 0, missingPopupDesc: 0, missingImage: 0, missingCardImage: 0, missingEmneIds: 0, missingQuizProfile: 0, usesImageCard: 0, stubOrHidden: 0, badAssetPaths: 0 };
for (const f of perFile) for (const p of f.places ?? []) { if (p.missing.missingRequired.length) totals.missingRequired++; if (p.missing.popupDesc) totals.missingPopupDesc++; if (p.missing.image) totals.missingImage++; if (p.missing.cardImage) totals.missingCardImage++; if (p.missing.emne_ids) totals.missingEmneIds++; if (p.missing.quiz_profile) totals.missingQuizProfile++; if (p.missing.usesImageCard) totals.usesImageCard++; if (p.missing.stub || p.missing.hidden) totals.stubOrHidden++; totals.badAssetPaths += p.badPaths.length; }

const workItems = allPlaces.map(({ file, place }) => {
  const core = {
    hasId: !isMissing(place?.id), hasName: !isMissing(place?.name), hasCoordinates: hasCoordinates(place), hasRadius: !isMissing(place?.r), hasCategory: !isMissing(place?.category), hasYear: !isMissing(place?.year), hasDesc: !isMissing(place?.desc), hasPopupDesc: !isMissing(place?.popupDesc), hasImage: !isMissing(place?.image), hasCardImage: !isMissing(place?.cardImage), hasEmneIds: Array.isArray(place?.emne_ids) && place.emne_ids.length > 0, hasQuizProfile: !isMissing(place?.quiz_profile) && (typeof place.quiz_profile !== 'object' || hasNonEmptyObject(place.quiz_profile)),
  };
  const placeId = core.hasId ? place.id : '(mangler id)';
  const coverage = {
    hasQuiz: core.hasId && coverageBySource.quiz.seen.has(place.id), hasPeople: core.hasId && coverageBySource.people.seen.has(place.id), hasNature: core.hasId && coverageBySource.nature.seen.has(place.id), hasBadges: core.hasId && coverageBySource.badges.seen.has(place.id), hasWonderkammer: core.hasId && coverageBySource.wonderkammer.seen.has(place.id), hasRelations: core.hasId && coverageBySource.relations.seen.has(place.id), hasLeksikon: core.hasId && coverageBySource.leksikon.seen.has(place.id), hasSprakleksikon: core.hasId && coverageBySource.sprakleksikon.seen.has(place.id), hasExternalLinks: core.hasId && coverageBySource['external/offisielle lenker'].seen.has(place.id),
  };
  const missing = {
    core: Object.entries(core).filter(([, ok]) => !ok).map(([k]) => k),
    coverage: Object.entries(coverage).filter(([, ok]) => !ok).map(([k]) => k),
  };
  const readyForQuiz = core.hasId && core.hasName && core.hasCategory && core.hasDesc && core.hasPopupDesc && core.hasEmneIds && core.hasQuizProfile && !coverage.hasQuiz;
  const readyForWonderkammer = core.hasId && core.hasName && core.hasCategory && core.hasDesc && core.hasPopupDesc && !coverage.hasWonderkammer;
  const readyForSprakleksikon = core.hasId && core.hasName && core.hasCategory && core.hasDesc && core.hasPopupDesc && !coverage.hasSprakleksikon;

  const invalidBase = !core.hasId || !core.hasName || !core.hasCategory || !core.hasCoordinates || !core.hasRadius;
  let priority = 'low';
  if (invalidBase) priority = 'critical';
  else if (readyForQuiz || !core.hasPopupDesc || !core.hasEmneIds || !core.hasQuizProfile) priority = 'high';
  else if (!coverage.hasWonderkammer || !coverage.hasSprakleksikon || !coverage.hasPeople || !coverage.hasNature || !coverage.hasBadges || !coverage.hasRelations || !coverage.hasExternalLinks) priority = 'medium';

  let recommendedNextAction = 'Lav prioritet – god dekning';
  if (invalidBase) recommendedNextAction = 'Rett basisstruktur';
  else if (!core.hasPopupDesc || !core.hasEmneIds || !core.hasQuizProfile) recommendedNextAction = 'Fyll popupDesc, emne_ids og quiz_profile før quiz';
  else if (readyForQuiz) recommendedNextAction = 'Lag quiz';
  else if (readyForWonderkammer) recommendedNextAction = 'Lag Wonderkammer';
  else if (readyForSprakleksikon) recommendedNextAction = coverage.hasLeksikon ? 'Lag språkleksikon (har allerede vanlig leksikon)' : 'Lag språkleksikon';
  else if (!coverage.hasExternalLinks) recommendedNextAction = 'Legg til offisielle lenker';
  else if (!coverage.hasPeople || !coverage.hasNature || !coverage.hasBadges || !coverage.hasRelations) recommendedNextAction = 'Øk people/nature/badges/relations-dekning';

  return { placeId, name: place?.name ?? '(mangler name)', category: place?.category ?? '(mangler category)', sourceFile: file, core, coverage, missing, readyForQuiz, readyForWonderkammer, readyForSprakleksikon, priority, recommendedNextAction };
});

workItems.sort((a, b) => {
  const pr = priorityRank[a.priority] - priorityRank[b.priority]; if (pr !== 0) return pr;
  if (a.readyForQuiz !== b.readyForQuiz) return a.readyForQuiz ? -1 : 1;
  if (a.readyForWonderkammer !== b.readyForWonderkammer) return a.readyForWonderkammer ? -1 : 1;
  if (a.readyForSprakleksikon !== b.readyForSprakleksikon) return a.readyForSprakleksikon ? -1 : 1;
  const c = String(a.category).localeCompare(String(b.category), 'nb'); if (c !== 0) return c;
  return String(a.placeId).localeCompare(String(b.placeId), 'nb');
});

const workTotals = {
  places: workItems.length,
  readyForQuiz: workItems.filter((x) => x.readyForQuiz).length,
  readyForWonderkammer: workItems.filter((x) => x.readyForWonderkammer).length,
  readyForSprakleksikon: workItems.filter((x) => x.readyForSprakleksikon).length,
  critical: workItems.filter((x) => x.priority === 'critical').length,
  high: workItems.filter((x) => x.priority === 'high').length,
  medium: workItems.filter((x) => x.priority === 'medium').length,
  low: workItems.filter((x) => x.priority === 'low').length,
};

const worklist = { generatedAt, totals: workTotals, items: workItems };

let md = '# Place Data Audit\n\n';
md += `Generert: ${generatedAt}\n\n`;
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
const missingRounds = allPlaces.map((x) => x.place).filter((p) => typeof p?.id === 'string').filter((p) => isMissing(p?.r)).map((p) => p.id);
md += '## Manglende rundinger og quizdekning\n\n';
md += `- Manglende rundinger (r): **${missingRounds.length}**\n`;
if (missingRounds.length) md += `  - ${missingRounds.slice(0, 100).join(', ')}${missingRounds.length > 100 ? ' ...' : ''}\n`;
md += `- Manglende quizdekning: **${missingQuizCoverage.length}**\n`;
if (missingQuizCoverage.length) md += `  - ${missingQuizCoverage.slice(0, 100).join(', ')}${missingQuizCoverage.length > 100 ? ' ...' : ''}\n`;
md += '\n';

md += '## Funn per fil\n\n';
for (const f of perFile) {
  md += `### ${f.file}\n\n`;
  if (f.parseError) { md += `- Parse-feil: ${f.parseError}\n\n`; continue; }
  const problemPlaces = f.places.filter((p) => p.missing.missingRequired.length || p.missing.popupDesc || p.missing.image || p.missing.cardImage || p.missing.emne_ids || p.missing.quiz_profile || p.missing.usesImageCard || p.missing.stub || p.missing.hidden || p.badPaths.length);
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
if (!duplicateIds.length) md += '- Ingen duplikate id-er funnet.\n\n'; else { for (const [id, hits] of duplicateIds) md += `- ${id}: ${hits.map((h) => `${h.file} (${h.name})`).join(' ; ')}\n`; md += '\n'; }
md += '## Ødelagte asset paths\n\n';
const broken = [];
for (const f of perFile) for (const p of f.places) for (const b of p.badPaths) broken.push({ file: f.file, id: p.id, field: b.field, value: b.value });
if (!broken.length) md += '- Ingen ødelagte asset paths funnet.\n\n'; else { for (const b of broken) md += `- ${b.file} :: ${b.id} :: ${b.field} -> ${b.value}\n`; md += '\n'; }

md += '## Referanser til place-id-er som ikke finnes\n\n';
if (!danglingRefs.length) md += '- Ingen ugyldige place-referanser i people/badges/routes/wonderkammer/civication-filer som ble sjekket.\n\n'; else { for (const d of danglingRefs) md += `- ${d.file} :: ${d.key} -> ${d.value}\n`; md += '\n'; }

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
md += '4. Øk dekning i people/nature/badges/wonderkammer/leksikon/external ved å koble placeId/places mot eksisterende steder.\n\n';

md += '## Maskinlesbar arbeidsliste\n\n';
md += '- Fil: `reports/place-data-worklist.json`\n';
md += `- Antall steder klare for quiz: **${workTotals.readyForQuiz}**\n`;
md += `- Antall steder klare for Wonderkammer: **${workTotals.readyForWonderkammer}**\n`;
md += `- Antall steder klare for språkleksikon: **${workTotals.readyForSprakleksikon}**\n`;
md += `- Prioritet: critical **${workTotals.critical}**, high **${workTotals.high}**, medium **${workTotals.medium}**, low **${workTotals.low}**\n\n`;
md += '### Topp 25 anbefalte neste steder\n\n';
for (const item of workItems.slice(0, 25)) md += `- ${item.placeId} | ${item.name} | ${item.category} | ${item.priority} | ${item.recommendedNextAction}\n`;
md += '\n';

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, md, 'utf8');
fs.writeFileSync(worklistPath, `${JSON.stringify(worklist, null, 2)}\n`, 'utf8');
console.log(`Audit complete: ${path.relative(root, reportPath)}`);
console.log(`Worklist complete: ${path.relative(root, worklistPath)}`);
