#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');
const vestlandNatureRoot = path.join(root, 'data/places/natur/vestland');
const storyRoot = path.join(root, 'data/stories');
const leksikonRoot = path.join(root, 'data/leksikon/places/vestland/etne/natur');
const outDir = path.join(root, 'reports/etne-natur-quality-audit');
const jsonOut = path.join(outDir, 'report.json');
const mdOut = path.join(outDir, 'report.md');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const rel = (file) => path.relative(root, file).replace(/\\/g, '/');
const asArray = (value) => Array.isArray(value) ? value : [];
const text = (value) => typeof value === 'string' ? value.trim() : '';
const hasText = (value) => text(value).length > 0;
const normalize = (value) => text(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9æøå]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const stopwords = new Set([
  'og','i','på','ved','til','fra','med','som','for','av','en','et','ei','den','det','de','der','her',
  'eller','om','mot','mellom','uten','under','over','langs','gjennom','område','omradet','natur','sted',
  'etne','kommune','history','go','runding','profil','friluftsliv','trygg','trygt','offentlig','lokal'
]);

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const out = [];
  const stack = [directory];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
    }
  }
  return out.sort((a, b) => rel(a).localeCompare(rel(b), 'nb'));
}

function items(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ['stories', 'articles', 'entries', 'items', 'places']) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return payload && typeof payload === 'object' ? [payload] : [];
}

function isEtneNature(record) {
  return record?.category === 'natur' && text(record?.kommune) === 'Etne';
}

function linkedPlaceId(item) {
  return text(item?.place_id || item?.placeId || item?.place);
}

function tokens(value) {
  return normalize(value).split(' ').filter((token) => token.length >= 4 && !stopwords.has(token));
}

function localTokens(place) {
  return [...new Set([
    place.id,
    place.name,
    ...asArray(place.tags),
    ...asArray(place.nature_profile?.themes),
    ...asArray(place.quiz_profile?.signature_features),
    ...asArray(place.quiz_profile?.primary_angles),
    ...asArray(place.quiz_profile?.must_include)
  ].flatMap(tokens))];
}

function containsLocal(value, placeTokens) {
  const normalized = normalize(value);
  return placeTokens.some((token) => normalized.includes(token));
}

function normalizedTemplate(value, placeTokens) {
  let normalized = normalize(value);
  for (const token of [...placeTokens].sort((a, b) => b.length - a.length)) {
    normalized = normalized.replace(new RegExp(`\\b${token}\\b`, 'g'), '<sted>');
  }
  return normalized.replace(/\b\d+\b/g, '<n>').replace(/\s+/g, ' ').trim();
}

function similarity(a, b) {
  const aa = new Set(tokens(a));
  const bb = new Set(tokens(b));
  if (!aa.size || !bb.size) return 0;
  let overlap = 0;
  for (const value of aa) if (bb.has(value)) overlap += 1;
  return overlap / (aa.size + bb.size - overlap);
}

function indexLinkedContent(directory) {
  const index = new Map();
  for (const file of listJsonFiles(directory)) {
    let payload;
    try {
      payload = readJson(file);
    } catch {
      continue;
    }
    for (const item of items(payload)) {
      const placeId = linkedPlaceId(item);
      if (!placeId) continue;
      if (!index.has(placeId)) index.set(placeId, []);
      index.get(placeId).push({ file: rel(file), item });
    }
  }
  return index;
}

function countUrls(value) {
  if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countUrls(entry), 0);
  if (!value || typeof value !== 'object') return 0;
  let count = 0;
  for (const [key, entry] of Object.entries(value)) {
    if ((key === 'url' || key === 'source_url') && /^https?:\/\//.test(text(entry))) count += 1;
    count += countUrls(entry);
  }
  return count;
}

function internalSources(entries) {
  const found = [];
  const walk = (value, trail = []) => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => walk(entry, [...trail, String(index)]));
      return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, entry] of Object.entries(value)) {
      const next = [...trail, key];
      if (
        next.some((segment) => /source/i.test(segment))
        && typeof entry === 'string'
        && /history go (place data|data|markør|marker)/i.test(entry)
      ) {
        found.push({ trail: next.join('.'), value: entry });
      }
      walk(entry, next);
    }
  };
  entries.forEach((entry) => walk(entry.item));
  return found;
}

function addFinding(findings, severity, code, message, evidence = null) {
  findings.push({ severity, code, message, ...(evidence ? { evidence } : {}) });
}

function hasSafetyBoundary(value) {
  const normalized = normalize(value);
  return [
    'privat', 'skilting', 'merka', 'merket', 'offentlig', 'lovleg', 'lovlig', 'stopp',
    'forholda', 'forholdene', 'glatt', 'bratt', 'vatn', 'vann', 'foss', 'kant', 'is', 'ver'
  ].some((needle) => normalized.includes(normalize(needle)));
}

const manifest = readJson(manifestPath);
const validRelatedPlaceIds = new Set();
const activeEtneEntries = new Set();
for (const manifestEntry of asArray(manifest.files).map(String)) {
  const file = path.join(root, 'data', manifestEntry);
  if (!fs.existsSync(file)) continue;
  try {
    const records = items(readJson(file));
    for (const record of records) {
      if (record?.id) validRelatedPlaceIds.add(String(record.id));
      if (isEtneNature(record)) activeEtneEntries.add(manifestEntry);
    }
  } catch {
    // Other repository gates own malformed non-Etne files.
  }
}

const canonical = [];
for (const file of listJsonFiles(vestlandNatureRoot)) {
  let payload;
  try {
    payload = readJson(file);
  } catch {
    continue;
  }
  for (const record of items(payload)) {
    if (isEtneNature(record)) canonical.push({ file, payload, record });
  }
}
canonical.sort((a, b) => String(a.record.id).localeCompare(String(b.record.id), 'nb'));

const storyIndex = indexLinkedContent(storyRoot);
const leksikonIndex = indexLinkedContent(leksikonRoot);
const etnePlaceIds = new Set(canonical.map((entry) => String(entry.record.id)));
for (const id of etnePlaceIds) validRelatedPlaceIds.add(id);

const places = [];
const taskTemplates = [];
const trainingTemplates = [];
const civicationTitleGroups = new Map();

for (const { file, payload, record: place } of canonical) {
  const fileEntry = rel(file).replace(/^data\//, '');
  const placeId = text(place.id) || path.basename(file, '.json');
  const findings = [];
  const placeTokens = localTokens(place);
  const active = activeEtneEntries.has(fileEntry);
  const recordsInFile = items(payload);

  if (!active) addFinding(findings, 'blocker', 'missing_manifest_entry', 'Canonical Etne-naturfil mangler i aktivt place-manifest.', { manifestEntry: fileEntry });
  if (recordsInFile.length !== 1) addFinding(findings, 'warning', 'multi_record_file', 'Etne-naturfilen bør inneholde nøyaktig én stedspost.', { count: recordsInFile.length });
  if ('rounds' in place || 'rundinger' in place) addFinding(findings, 'blocker', 'manual_round_override', 'Manuell rounds/rundinger-override bryter canonical naturprofil.');

  const tasks = asArray(place.tasks_profile?.tasks);
  const training = asArray(place.training_profile?.exercises);
  const civication = asArray(place.civication_store);
  const brands = asArray(place.brands);
  const badges = asArray(place.underbadge_ids);

  if (!hasText(place.nature_profile?.summary)) addFinding(findings, 'blocker', 'missing_nature_profile', 'Nature-rundingen mangler en substansiell summary.');
  if (tasks.length !== 4) addFinding(findings, 'blocker', 'task_count', 'Tasks-rundingen skal ha nøyaktig fire oppgaver.', { count: tasks.length });
  if (training.length !== 3) addFinding(findings, 'blocker', 'training_count', 'Training-rundingen skal ha nøyaktig tre øvelser.', { count: training.length });
  if (civication.length !== 4) addFinding(findings, 'blocker', 'civication_count', 'Civication-rundingen skal ha nøyaktig fire objekter.', { count: civication.length });
  if (brands.length < 3) addFinding(findings, 'warning', 'brand_count', 'Brands-rundingen bør ha minst tre dokumenterte stedskontekster.', { count: brands.length });
  if (badges.length < 3) addFinding(findings, 'warning', 'badge_count', 'Badge-rundingen bør ha minst tre relevante undermerker.', { count: badges.length });
  if (!hasText(place.for_na?.before) || !hasText(place.for_na?.now) || !hasText(place.for_na?.change)) {
    addFinding(findings, 'blocker', 'before_now_contract', 'Før/nå-rundingen mangler before, now eller change.');
  }
  if (countUrls(place.externalLinks) === 0) addFinding(findings, 'blocker', 'missing_external_source', 'Stedsposten mangler ekstern kilde-URL.');

  const taskIds = new Set();
  const taskTitles = new Set();
  tasks.forEach((task, index) => {
    const label = `Oppgave ${index + 1}`;
    if (!hasText(task.id) || taskIds.has(task.id)) addFinding(findings, 'blocker', 'task_id', `${label} mangler unik id.`, { id: task.id });
    taskIds.add(task.id);
    const titleKey = normalize(task.title);
    if (!titleKey || taskTitles.has(titleKey)) addFinding(findings, 'blocker', 'task_title', `${label} mangler unik tittel.`, { title: task.title });
    taskTitles.add(titleKey);
    if (text(task.instruction).length < 80) addFinding(findings, 'warning', 'task_instruction_depth', `${label} har for kort instruksjon.`, { length: text(task.instruction).length });
    if (text(task.why).length < 45) addFinding(findings, 'warning', 'task_why_depth', `${label} har for svak faglig begrunnelse.`, { length: text(task.why).length });
    if (!containsLocal(`${task.title} ${task.instruction} ${task.why}`, placeTokens)) addFinding(findings, 'warning', 'task_place_specificity', `${label} bruker ingen tydelig lokal signaturterm.`);
    taskTemplates.push({ placeId, id: task.id, value: normalizedTemplate(`${task.title} ${task.instruction}`, placeTokens) });
  });

  const safetyText = [place.training_profile?.safety, ...tasks.map((entry) => entry.instruction), ...training.map((entry) => entry.instruction)].join(' ');
  if (!hasSafetyBoundary(safetyText)) addFinding(findings, 'blocker', 'missing_safety_boundary', 'Oppgaver og trening mangler tydelige ferdsels- eller sikkerhetsgrenser.');

  const trainingIds = new Set();
  training.forEach((exercise, index) => {
    const label = `Trening ${index + 1}`;
    if (!hasText(exercise.id) || trainingIds.has(exercise.id)) addFinding(findings, 'blocker', 'training_id', `${label} mangler unik id.`, { id: exercise.id });
    trainingIds.add(exercise.id);
    if (!Number.isFinite(exercise.duration_minutes) || exercise.duration_minutes <= 0) addFinding(findings, 'warning', 'training_duration', `${label} mangler gyldig varighet.`, { duration: exercise.duration_minutes });
    if (!hasText(exercise.intensity)) addFinding(findings, 'warning', 'training_intensity', `${label} mangler intensitet.`);
    if (!containsLocal(`${exercise.title} ${exercise.instruction} ${exercise.why}`, placeTokens)) addFinding(findings, 'warning', 'training_place_specificity', `${label} bruker ingen tydelig lokal signaturterm.`);
    trainingTemplates.push({ placeId, id: exercise.id, value: normalizedTemplate(`${exercise.title} ${exercise.instruction}`, placeTokens) });
  });

  civication.forEach((object, index) => {
    const label = `Civication-objekt ${index + 1}`;
    if (object.physicalObject !== true) addFinding(findings, 'blocker', 'civication_physical', `${label} er ikke eksplisitt fysisk.`);
    if (object.placeSpecific !== true) addFinding(findings, 'blocker', 'civication_specific', `${label} er ikke eksplisitt stedsspesifikt.`);
    if (!asArray(object.source_urls).some((url) => /^https?:\/\//.test(text(url)))) addFinding(findings, 'warning', 'civication_source', `${label} mangler kilde-URL.`);
    if (text(object.placeSpecificReason).length < 55) addFinding(findings, 'warning', 'civication_reason_depth', `${label} har for svak stedsspesifikk begrunnelse.`);
    const titleKey = normalize(object.title);
    if (titleKey) {
      if (!civicationTitleGroups.has(titleKey)) civicationTitleGroups.set(titleKey, []);
      civicationTitleGroups.get(titleKey).push({ placeId, id: object.id });
    }
  });

  brands.forEach((brand, index) => {
    if (!hasText(brand.id) || !hasText(brand.name) || !hasText(brand.brand_kind) || !hasText(brand.brand_type)) {
      addFinding(findings, 'warning', 'brand_contract', `Brand ${index + 1} mangler id, name, brand_kind eller brand_type.`);
    }
  });

  const stories = storyIndex.get(placeId) || [];
  const articles = leksikonIndex.get(placeId) || [];
  if (stories.length < 1) addFinding(findings, 'blocker', 'story_count', 'Stedet skal ha minst én manifestlastet fortelling.', { count: stories.length, files: stories.map((entry) => entry.file) });
  if (articles.length !== 1) addFinding(findings, 'blocker', 'leksikon_count', 'Stedet skal ha nøyaktig én leksikonartikkel.', { count: articles.length, files: articles.map((entry) => entry.file) });

  const editorialPattern = /(komplett\s+rundingsprofil|rundingsproduksjon|history\s+go\s+samlar|history\s+go\s+samler|produsert\s+i\s+2026)/i;
  for (const article of articles) {
    asArray(article.item?.chronology).forEach((entry, index) => {
      const value = `${entry?.period || ''} ${entry?.desc || ''}`;
      if (editorialPattern.test(value)) addFinding(findings, 'blocker', 'editorial_chronology', 'Leksikonets kronologi inneholder app-produksjon i stedet for stedshistorie.', { file: article.file, index, value });
    });
  }

  const circular = internalSources([...stories, ...articles]);
  if (circular.length) addFinding(findings, 'warning', 'circular_internal_sources', 'Fortelling eller leksikon bruker intern History Go-data som faktakilde.', { occurrences: circular.slice(0, 12) });
  const storyArticleUrls = countUrls(stories.map((entry) => entry.item)) + countUrls(articles.map((entry) => entry.item));
  if (storyArticleUrls === 0) addFinding(findings, 'warning', 'story_article_source_urls', 'Fortelling og leksikon mangler eksplisitte eksterne kilde-URL-er.');

  const related = [
    ...asArray(place.nature_profile?.nearby_place_ids),
    ...articles.flatMap((entry) => asArray(entry.item?.links?.related_places))
  ];
  for (const relatedId of related) {
    if (!validRelatedPlaceIds.has(String(relatedId))) addFinding(findings, 'warning', 'invalid_related_place', 'Relatert place-id finnes ikke i aktivt place-manifest.', { relatedId });
  }

  places.push({
    placeId,
    name: place.name,
    file: rel(file),
    active,
    coordinateSnapshot: {
      lat: place.lat ?? null,
      lon: place.lon ?? null,
      r: place.r ?? null,
      coordStatus: place.coordStatus ?? '',
      coordSource: place.coordSource ?? '',
      coordType: place.coordType ?? '',
      coordNote: place.coordNote ?? ''
    },
    counts: {
      tasks: tasks.length,
      training: training.length,
      civication: civication.length,
      brands: brands.length,
      badges: badges.length,
      stories: stories.length,
      leksikon: articles.length,
      externalSourceUrls: countUrls(place.externalLinks),
      storyArticleSourceUrls: storyArticleUrls
    },
    findings
  });
}

function addNearDuplicates(records, code, label, threshold = 0.86) {
  for (let i = 0; i < records.length; i += 1) {
    for (let j = i + 1; j < records.length; j += 1) {
      if (records[i].placeId === records[j].placeId) continue;
      if (Math.min(tokens(records[i].value).length, tokens(records[j].value).length) < 9) continue;
      const value = similarity(records[i].value, records[j].value);
      if (value < threshold) continue;
      const a = places.find((entry) => entry.placeId === records[i].placeId);
      const b = places.find((entry) => entry.placeId === records[j].placeId);
      addFinding(a.findings, 'warning', code, `${label} er svært lik innhold ved et annet Etne-sted.`, { otherPlaceId: b.placeId, similarity: Number(value.toFixed(3)), firstId: records[i].id, secondId: records[j].id });
      addFinding(b.findings, 'warning', code, `${label} er svært lik innhold ved et annet Etne-sted.`, { otherPlaceId: a.placeId, similarity: Number(value.toFixed(3)), firstId: records[j].id, secondId: records[i].id });
    }
  }
}

addNearDuplicates(taskTemplates, 'near_duplicate_task', 'Oppgave');
addNearDuplicates(trainingTemplates, 'near_duplicate_training', 'Treningsøvelse');

for (const [title, records] of civicationTitleGroups) {
  const ids = [...new Set(records.map((entry) => entry.placeId))];
  if (ids.length < 2) continue;
  for (const placeId of ids) {
    const place = places.find((entry) => entry.placeId === placeId);
    addFinding(place.findings, 'warning', 'duplicate_civication_title', 'Civication-tittel er gjenbrukt på flere Etne-steder.', { title, placeIds: ids });
  }
}

const findingCodeTotals = {};
for (const place of places) {
  place.blockers = place.findings.filter((entry) => entry.severity === 'blocker').length;
  place.warnings = place.findings.filter((entry) => entry.severity === 'warning').length;
  place.score = Math.max(0, 100 - place.blockers * 12 - place.warnings * 3);
  for (const finding of place.findings) findingCodeTotals[finding.code] = (findingCodeTotals[finding.code] || 0) + 1;
}
places.sort((a, b) => a.score - b.score || text(a.name).localeCompare(text(b.name), 'nb'));

const report = {
  generatedAt: process.env.AUDIT_GENERATED_AT || new Date().toISOString(),
  scope: {
    activeManifestEntries: activeEtneEntries.size,
    totalCanonicalFiles: canonical.length,
    expectedPlaces: 26,
    completeScope: canonical.length === 26,
    missingFromManifest: canonical
      .map((entry) => rel(entry.file).replace(/^data\//, ''))
      .filter((entry) => !activeEtneEntries.has(entry)),
    manifestEntries: [...activeEtneEntries].sort((a, b) => a.localeCompare(b, 'nb'))
  },
  totals: {
    places: places.length,
    blockers: places.reduce((sum, entry) => sum + entry.blockers, 0),
    warnings: places.reduce((sum, entry) => sum + entry.warnings, 0),
    averageScore: places.length ? Number((places.reduce((sum, entry) => sum + entry.score, 0) / places.length).toFixed(1)) : 0,
    placesBelow90: places.filter((entry) => entry.score < 90).length,
    placesWithBlockers: places.filter((entry) => entry.blockers > 0).length,
    inactiveCanonicalFiles: places.filter((entry) => !entry.active).length,
    findingCodeTotals
  },
  places
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(jsonOut, `${JSON.stringify(report, null, 2)}\n`);

const rows = places.map((entry) => `| ${entry.placeId} | ${entry.active ? 'ja' : 'nei'} | ${entry.score} | ${entry.blockers} | ${entry.warnings} | ${entry.counts.tasks}/${entry.counts.training}/${entry.counts.civication} | ${entry.findings.slice(0, 4).map((finding) => finding.code).join(', ') || 'OK'} |`).join('\n');
const detail = places.map((entry) => {
  const findings = entry.findings.length
    ? entry.findings.map((finding) => `- **${finding.severity} · ${finding.code}:** ${finding.message}${finding.evidence ? ` — \`${JSON.stringify(finding.evidence)}\`` : ''}`).join('\n')
    : '- Ingen funn.';
  return `## ${entry.name} (\`${entry.placeId}\`)\n\nFil: \`${entry.file}\`\n\nAktiv: **${entry.active ? 'ja' : 'nei'}** · score: **${entry.score}** · blockers: **${entry.blockers}** · warnings: **${entry.warnings}**\n\n${findings}`;
}).join('\n\n');
const codeRows = Object.entries(findingCodeTotals)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([code, count]) => `| ${code} | ${count} |`)
  .join('\n');

const md = `# Etne natur – kvalitetsaudit av rundinger\n\nGenerert: ${report.generatedAt}\n\n## Omfang\n\n- Aktive Etne-naturfiler i manifestet: **${report.scope.activeManifestEntries}**\n- Canonical Etne-naturfiler på disk: **${report.scope.totalCanonicalFiles}**\n- Mangler i manifestet: **${report.scope.missingFromManifest.length}**\n- Forventet produksjonsomfang: **26**\n- Komplett filomfang: **${report.scope.completeScope ? 'ja' : 'nei'}**\n- Blockers: **${report.totals.blockers}**\n- Warnings: **${report.totals.warnings}**\n- Gjennomsnittsscore: **${report.totals.averageScore}**\n\n## Funnkoder\n\n| kode | antall |\n|---|---:|\n${codeRows}\n\n## Samlet oversikt\n\n| placeId | aktiv | score | blockers | warnings | tasks/training/civication | viktigste funn |\n|---|---|---:|---:|---:|---:|---|\n${rows}\n\n${detail}\n`;
fs.writeFileSync(mdOut, md);

console.log(`Etne nature quality audit: ${places.length} files, ${activeEtneEntries.size} active, ${report.totals.blockers} blockers, ${report.totals.warnings} warnings, average ${report.totals.averageScore}.`);
console.log(`Reports: ${rel(jsonOut)}, ${rel(mdOut)}`);
if (!report.scope.completeScope) process.exitCode = 2;
