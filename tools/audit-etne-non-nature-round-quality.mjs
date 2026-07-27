#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');
const storyRoot = path.join(root, 'data/stories');
const leksikonRoot = path.join(root, 'data/leksikon');
const outDir = path.join(root, 'reports/etne-non-nature-quality-audit');
const jsonOut = path.join(outDir, 'report.json');
const mdOut = path.join(outDir, 'report.md');

const asArray = (value) => Array.isArray(value) ? value : [];
const text = (value) => typeof value === 'string' ? value.trim() : '';
const normalize = (value) => text(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9æøå]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const rel = (file) => path.relative(root, file).replace(/\\/g, '/');

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const out = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) out.push(...listJsonFiles(file));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(file);
  }
  return out;
}

function items(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  for (const key of ['places', 'stories', 'articles', 'items', 'entries', 'data']) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [payload];
}

function linkedPlaceId(item) {
  return text(item?.place_id || item?.placeId || item?.place?.id);
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
    if (key === 'source_urls' && Array.isArray(entry)) count += entry.filter((url) => /^https?:\/\//.test(text(url))).length;
    count += countUrls(entry);
  }
  return count;
}

function addFinding(findings, severity, code, message, evidence = null) {
  findings.push({ severity, code, message, ...(evidence ? { evidence } : {}) });
}

function localTokens(place) {
  const raw = [place.id, place.name, place.shortName, place.area, place.address, place.category]
    .filter(Boolean)
    .join(' ');
  return [...new Set(normalize(raw).split(' ').filter((token) => token.length >= 4 && !['etne', 'sted', 'plass'].includes(token)))];
}

function containsLocal(value, tokens) {
  const normalized = ` ${normalize(value)} `;
  return tokens.some((token) => normalized.includes(` ${token} `));
}

function hasSafetyBoundary(value) {
  const normalized = normalize(value);
  return [
    'privat', 'skilting', 'merka', 'merket', 'offentlig', 'lovleg', 'lovlig', 'stopp',
    'trafikk', 'veg', 'vei', 'kant', 'glatt', 'bratt', 'vatn', 'vann', 'bane', 'anlegg',
    'instruktor', 'vakt', 'sikkerhet', 'trygg', 'ferdsel', 'publikum', 'tilgang'
  ].some((needle) => normalized.includes(normalize(needle)));
}

function findInternalSources(entries) {
  const found = [];
  const sourceKey = /(source|sources|source_name|source_label|citation|reference|references|kilde|kilder)/i;
  const walk = (value, trail = []) => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => walk(entry, [...trail, String(index)]));
      return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, entry] of Object.entries(value)) {
      const next = [...trail, key];
      if (sourceKey.test(key) && typeof entry === 'string' && /history go/i.test(entry)) {
        found.push({ trail: next.join('.'), value: entry });
      }
      walk(entry, next);
    }
  };
  entries.forEach((entry) => walk(entry.item));
  return found;
}

function hasPeopleRound(place) {
  return [
    place.people_profile,
    place.people,
    place.people_ids,
    place.person_ids,
    place.related_people_ids,
    place.actors
  ].some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object' && Object.keys(value).length));
}

function hasWorksRound(place) {
  return [place.works, place.work_ids, place.works_profile, place.related_works]
    .some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object' && Object.keys(value).length));
}

function profileSummary(profile) {
  if (!profile || typeof profile !== 'object') return '';
  return text(profile.summary || profile.description || profile.intro || profile.title);
}

function normalizeTemplate(value, local) {
  let normalized = normalize(value);
  for (const token of local) normalized = normalized.replaceAll(token, '{local}');
  return normalized.replace(/\b\d+\b/g, '{n}').replace(/\s+/g, ' ').trim();
}

function tokenSet(value) {
  return new Set(normalize(value).split(' ').filter((token) => token.length >= 4));
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  return overlap / (a.size + b.size - overlap);
}

const manifest = readJson(manifestPath);
const manifestEntries = asArray(manifest.files).map(String);
const storyIndex = indexLinkedContent(storyRoot);
const leksikonIndex = indexLinkedContent(leksikonRoot);
const allActivePlaceIds = new Set();
const activeEtne = [];

for (const entry of manifestEntries) {
  const file = path.join(root, 'data', entry);
  if (!fs.existsSync(file)) continue;
  let payload;
  try {
    payload = readJson(file);
  } catch {
    continue;
  }
  for (const record of items(payload)) {
    if (record?.id) allActivePlaceIds.add(String(record.id));
    if (text(record?.kommune) === 'Etne' && text(record?.category) !== 'natur') {
      activeEtne.push({ manifestEntry: entry, file, payload, record });
    }
  }
}

const categoryCounts = {};
const categoryKeyCounts = {};
const places = [];
const civicationTitles = new Map();
const activityTemplates = [];

for (const source of activeEtne) {
  const { manifestEntry, file, record: place } = source;
  const placeId = text(place.id) || path.basename(file, '.json');
  const category = text(place.category) || 'ukjent';
  const findings = [];
  const tokens = localTokens(place);
  categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  if (!categoryKeyCounts[category]) categoryKeyCounts[category] = {};
  for (const key of Object.keys(place).sort()) categoryKeyCounts[category][key] = (categoryKeyCounts[category][key] || 0) + 1;

  if ('rounds' in place || 'rundinger' in place) addFinding(findings, 'blocker', 'manual_round_override', 'Manuell rounds/rundinger-override bryter canonical kategorioppsett.');
  if (!hasPeopleRound(place)) addFinding(findings, 'blocker', 'missing_people_round', 'People-rundingen mangler koblet innhold.');
  if (!hasWorksRound(place)) addFinding(findings, 'blocker', 'missing_works_round', 'Works-rundingen mangler koblet innhold.');

  const badges = asArray(place.underbadge_ids);
  const civication = asArray(place.civication_store);
  const brands = asArray(place.brands);
  if (badges.length < 3) addFinding(findings, 'warning', 'badge_count', 'Badge-rundingen bør ha minst tre relevante undermerker.', { count: badges.length });
  if (civication.length !== 4) addFinding(findings, 'blocker', 'civication_count', 'Civication-rundingen skal ha nøyaktig fire objekter.', { count: civication.length });
  if (brands.length < 3) addFinding(findings, 'warning', 'brand_count', 'Brands-rundingen bør ha minst tre dokumenterte stedskontekster.', { count: brands.length });
  if (!text(place.for_na?.before) || !text(place.for_na?.now) || !text(place.for_na?.change)) {
    addFinding(findings, 'blocker', 'before_now_contract', 'Før/nå-rundingen mangler before, now eller change.');
  }
  if (countUrls(place.externalLinks) === 0) addFinding(findings, 'blocker', 'missing_external_source', 'Stedsposten mangler eksplisitt ekstern kilde-URL.');

  const isSport = category === 'sport';
  const activityProfile = isSport ? place.training_profile : place.nature_profile;
  if (!profileSummary(activityProfile)) {
    addFinding(findings, 'blocker', isSport ? 'missing_training_profile' : 'missing_nature_profile', `${isSport ? 'Training' : 'Nature'}-rundingen mangler en substansiell profiltekst.`);
  }

  const activities = isSport ? asArray(place.training_profile?.exercises) : asArray(place.nature_profile?.observations || place.nature_profile?.features || place.nature_profile?.items);
  if (isSport && activities.length < 3) addFinding(findings, 'blocker', 'training_count', 'Sportstedet bør ha minst tre dokumenterte treningsøvelser.', { count: activities.length });
  const safetyText = [place.training_profile?.safety, ...activities.map((entry) => `${entry?.instruction || ''} ${entry?.safety || ''}`)].join(' ');
  if (isSport && !hasSafetyBoundary(safetyText)) addFinding(findings, 'blocker', 'missing_safety_boundary', 'Treningsrundingen mangler tydelig sikkerhets- eller ferdselsgrense.');

  activities.forEach((entry, index) => {
    const value = `${entry?.title || ''} ${entry?.instruction || ''} ${entry?.why || ''} ${entry?.description || ''}`;
    if (isSport && text(entry?.instruction).length < 70) addFinding(findings, 'warning', 'activity_instruction_depth', `Treningsøvelse ${index + 1} har for kort instruksjon.`, { length: text(entry?.instruction).length });
    if (isSport && !containsLocal(value, tokens)) addFinding(findings, 'warning', 'activity_place_specificity', `Treningsøvelse ${index + 1} bruker ingen tydelig lokal signaturterm.`);
    if (isSport) activityTemplates.push({ placeId, id: entry?.id, template: normalizeTemplate(value, tokens) });
  });

  civication.forEach((object, index) => {
    const label = `Civication-objekt ${index + 1}`;
    if (object.physicalObject !== true) addFinding(findings, 'blocker', 'civication_physical', `${label} er ikke eksplisitt fysisk.`);
    if (object.placeSpecific !== true) addFinding(findings, 'blocker', 'civication_specific', `${label} er ikke eksplisitt stedsspesifikt.`);
    if (!asArray(object.source_urls).some((url) => /^https?:\/\//.test(text(url)))) addFinding(findings, 'warning', 'civication_source', `${label} mangler kilde-URL.`);
    if (text(object.placeSpecificReason).length < 55) addFinding(findings, 'warning', 'civication_reason_depth', `${label} har for svak stedsspesifikk begrunnelse.`);
    const titleKey = normalize(object.title);
    if (titleKey) {
      if (!civicationTitles.has(titleKey)) civicationTitles.set(titleKey, []);
      civicationTitles.get(titleKey).push({ placeId, id: object.id });
    }
  });

  brands.forEach((brand, index) => {
    if (!text(brand.id) || !text(brand.name) || !text(brand.brand_kind) || !text(brand.brand_type)) {
      addFinding(findings, 'warning', 'brand_contract', `Brand ${index + 1} mangler id, name, brand_kind eller brand_type.`);
    }
  });

  const stories = storyIndex.get(placeId) || [];
  const articles = leksikonIndex.get(placeId) || [];
  if (stories.length < 1) addFinding(findings, 'blocker', 'story_count', 'Stedet mangler manifestlastet fortelling.', { count: stories.length });
  if (articles.length < 1) addFinding(findings, 'blocker', 'leksikon_count', 'Stedet mangler leksikonartikkel.', { count: articles.length });

  const editorialPattern = /(komplett\s+rundingsprofil|rundingsproduksjon|history\s+go\s+samlar|history\s+go\s+samler|produsert\s+i\s+2026|placecard)/i;
  for (const article of articles) {
    asArray(article.item?.chronology).forEach((entry, index) => {
      const value = `${entry?.period || ''} ${entry?.desc || ''}`;
      if (editorialPattern.test(value)) addFinding(findings, 'blocker', 'editorial_chronology', 'Leksikonets kronologi inneholder app-produksjon i stedet for stedshistorie.', { file: article.file, index, value });
    });
  }

  const internal = findInternalSources([...stories, ...articles]);
  if (internal.length) addFinding(findings, 'warning', 'circular_internal_sources', 'Fortelling eller leksikon bruker History Go som kilde.', { occurrences: internal.slice(0, 12) });
  const storyArticleUrls = countUrls(stories.map((entry) => entry.item)) + countUrls(articles.map((entry) => entry.item));
  if (storyArticleUrls === 0) addFinding(findings, 'warning', 'story_article_source_urls', 'Fortelling og leksikon mangler eksplisitte eksterne kilde-URL-er.');

  const related = [
    ...asArray(place.nature_profile?.nearby_place_ids),
    ...asArray(place.related_place_ids),
    ...articles.flatMap((entry) => asArray(entry.item?.links?.related_places))
  ];
  for (const relatedId of related) {
    if (!allActivePlaceIds.has(String(relatedId))) addFinding(findings, 'warning', 'invalid_related_place', 'Relatert place-id finnes ikke i aktivt place-manifest.', { relatedId });
  }

  places.push({
    placeId,
    name: place.name,
    category,
    file: rel(file),
    manifestEntry,
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
      badges: badges.length,
      civication: civication.length,
      brands: brands.length,
      activities: activities.length,
      stories: stories.length,
      leksikon: articles.length,
      externalSourceUrls: countUrls(place.externalLinks),
      storyArticleSourceUrls
    },
    findings
  });
}

for (const [title, records] of civicationTitles) {
  const placeIds = [...new Set(records.map((entry) => entry.placeId))];
  if (placeIds.length < 2) continue;
  for (const placeId of placeIds) {
    const target = places.find((entry) => entry.placeId === placeId);
    addFinding(target.findings, 'warning', 'duplicate_civication_title', 'Civication-tittel er gjenbrukt på flere Etne-steder.', { title, placeIds });
  }
}

for (let i = 0; i < activityTemplates.length; i += 1) {
  for (let j = i + 1; j < activityTemplates.length; j += 1) {
    if (activityTemplates[i].placeId === activityTemplates[j].placeId) continue;
    const similarity = jaccard(tokenSet(activityTemplates[i].template), tokenSet(activityTemplates[j].template));
    if (similarity < 0.86) continue;
    for (const [record, other] of [[activityTemplates[i], activityTemplates[j]], [activityTemplates[j], activityTemplates[i]]]) {
      const target = places.find((entry) => entry.placeId === record.placeId);
      addFinding(target.findings, 'warning', 'near_duplicate_activity', 'Treningsøvelsen er svært lik innhold ved et annet Etne-sted.', { otherPlaceId: other.placeId, similarity: Number(similarity.toFixed(3)), firstId: record.id, secondId: other.id });
    }
  }
}

const findingCodeTotals = {};
for (const place of places) {
  for (const finding of place.findings) findingCodeTotals[finding.code] = (findingCodeTotals[finding.code] || 0) + 1;
  const blockers = place.findings.filter((entry) => entry.severity === 'blocker').length;
  const warnings = place.findings.filter((entry) => entry.severity === 'warning').length;
  place.blockers = blockers;
  place.warnings = warnings;
  place.score = Math.max(0, 100 - blockers * 12 - warnings * 3);
}
places.sort((a, b) => a.score - b.score || a.category.localeCompare(b.category, 'nb') || text(a.name).localeCompare(text(b.name), 'nb'));

const report = {
  generatedAt: process.env.AUDIT_GENERATED_AT || new Date().toISOString(),
  scope: {
    activeEtneNonNaturePlaces: places.length,
    categories: categoryCounts,
    manifestEntries: places.map((entry) => entry.manifestEntry).sort((a, b) => a.localeCompare(b, 'nb'))
  },
  totals: {
    places: places.length,
    blockers: places.reduce((sum, entry) => sum + entry.blockers, 0),
    warnings: places.reduce((sum, entry) => sum + entry.warnings, 0),
    averageScore: places.length ? Number((places.reduce((sum, entry) => sum + entry.score, 0) / places.length).toFixed(1)) : 0,
    placesBelow90: places.filter((entry) => entry.score < 90).length,
    placesWithBlockers: places.filter((entry) => entry.blockers > 0).length,
    findingCodeTotals
  },
  categoryKeyCounts,
  places
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(jsonOut, `${JSON.stringify(report, null, 2)}\n`);
const rows = places.map((entry) => `| ${entry.placeId} | ${entry.category} | ${entry.score} | ${entry.blockers} | ${entry.warnings} | ${entry.findings.slice(0, 4).map((finding) => finding.code).join(', ') || 'OK'} |`).join('\n');
const categoryRows = Object.entries(categoryCounts).sort((a, b) => a[0].localeCompare(b[0], 'nb')).map(([category, count]) => `| ${category} | ${count} |`).join('\n');
const detail = places.map((entry) => {
  const findings = entry.findings.length
    ? entry.findings.map((finding) => `- **${finding.severity} · ${finding.code}:** ${finding.message}${finding.evidence ? ` — \`${JSON.stringify(finding.evidence)}\`` : ''}`).join('\n')
    : '- Ingen funn.';
  return `## ${entry.name} (\`${entry.placeId}\`)\n\nKategori: **${entry.category}**  \nFil: \`${entry.file}\`  \nScore: **${entry.score}** · blockers: **${entry.blockers}** · warnings: **${entry.warnings}**\n\n${findings}`;
}).join('\n\n');
const md = `# Etne – kvalitetsaudit av øvrige rundinger\n\nGenerert: ${report.generatedAt}\n\nNaturkategorien er utelatt fordi den allerede har egen fullført 26-steders audit.\n\n## Omfang\n\n- Aktive Etne-steder utenfor natur: **${places.length}**\n- Blockers: **${report.totals.blockers}**\n- Warnings: **${report.totals.warnings}**\n- Gjennomsnittsscore: **${report.totals.averageScore}**\n\n## Kategorier\n\n| kategori | steder |\n|---|---:|\n${categoryRows}\n\n## Samlet oversikt\n\n| placeId | kategori | score | blockers | warnings | viktigste funn |\n|---|---|---:|---:|---:|---|\n${rows}\n\n${detail}\n`;
fs.writeFileSync(mdOut, md);
console.log(`Etne non-nature quality audit: ${places.length} places, ${report.totals.blockers} blockers, ${report.totals.warnings} warnings, average ${report.totals.averageScore}.`);
console.log(`Reports: ${rel(jsonOut)}, ${rel(mdOut)}`);
