#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');
const relationsPath = path.join(root, 'data/relations.json');
const storyRoot = path.join(root, 'data/stories');
const leksikonRoot = path.join(root, 'data/leksikon');
const outDir = path.join(root, 'reports/etne-non-nature-quality-audit');
const jsonOut = path.join(outDir, 'report.json');
const mdOut = path.join(outDir, 'report.md');

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
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const rel = (file) => path.relative(root, file).replace(/\\/g, '/');

const STOPWORDS = new Set([
  'etne', 'sted', 'plass', 'kommune', 'historie', 'sport', 'kunst', 'litteratur', 'politikk',
  'natur', 'media', 'religion', 'psykologi', 'vitenskap', 'naeringsliv', 'runding', 'profil',
  'den', 'det', 'der', 'dette', 'med', 'som', 'for', 'fra', 'til', 'ved', 'eller', 'under',
  'over', 'gjennom', 'mellom', 'skal', 'kan', 'ikkje', 'ikke', 'samt', 'sine', 'sin', 'eit', 'ett'
]);

const CATEGORY_ROUNDS = Object.freeze({
  by: ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'],
  historie: ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'],
  historisk: ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'],
  sport: ['people', 'training', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'],
  politikk: ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'],
  kunst: ['people', 'works', 'badges', 'nature', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'],
  litteratur: ['people', 'works', 'badges', 'nature', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'],
  musikk: ['people', 'works', 'badges', 'nature', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'],
  vitenskap: ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'],
  media: ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'],
  psykologi: ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'],
  religion: ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'],
  naeringsliv: ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'],
  transport: ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon']
});
const DEFAULT_ROUNDS = CATEGORY_ROUNDS.by;

function listJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const out = [];
  const stack = [directory];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(file);
      else if (entry.isFile() && entry.name.endsWith('.json')) out.push(file);
    }
  }
  return out.sort((a, b) => rel(a).localeCompare(rel(b), 'nb'));
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
  if (typeof item?.place === 'string') return text(item.place);
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
  if (typeof value === 'string') return /^https?:\/\//.test(text(value)) ? 1 : 0;
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

function tokens(value) {
  return normalize(value).split(' ').filter((token) => token.length >= 4 && !STOPWORDS.has(token));
}

function localTokens(place) {
  return [...new Set([
    place.id,
    place.name,
    place.shortName,
    place.area,
    place.address,
    ...asArray(place.tags),
    ...asArray(place.quiz_profile?.signature_features),
    ...asArray(place.quiz_profile?.primary_angles),
    ...asArray(place.quiz_profile?.must_include),
    ...asArray(place.nature_profile?.themes)
  ].flatMap(tokens))];
}

function containsLocal(value, placeTokens) {
  const normalized = normalize(value);
  return placeTokens.some((token) => normalized.includes(token));
}

function hasSafetyBoundary(value) {
  const normalized = normalize(value);
  return [
    'privat', 'skilting', 'merka', 'merket', 'offentlig', 'lovleg', 'lovlig', 'stopp',
    'trafikk', 'veg', 'vei', 'kant', 'glatt', 'bratt', 'vatn', 'vann', 'bane', 'anlegg',
    'instruktor', 'vakt', 'sikkerhet', 'trygg', 'ferdsel', 'publikum', 'tilgang', 'hjelm',
    'skyteleder', 'våpen', 'vapen', 'fri', 'avstand'
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

function normalizeTemplate(value, placeTokens) {
  let normalized = normalize(value);
  for (const token of [...placeTokens].sort((a, b) => b.length - a.length)) {
    normalized = normalized.replace(new RegExp(`\\b${token}\\b`, 'g'), '{local}');
  }
  return normalized.replace(/\b\d+\b/g, '{n}').replace(/\s+/g, ' ').trim();
}

function tokenSet(value) {
  return new Set(tokens(value));
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  return overlap / (a.size + b.size - overlap);
}

function profileSummary(profile) {
  if (!profile || typeof profile !== 'object') return '';
  return text(profile.summary || profile.description || profile.intro || profile.title);
}

function roundPresence(place, relations, stories, articles) {
  return {
    people: relations.length > 0,
    nature: Boolean(place.nature_profile && typeof place.nature_profile === 'object' && profileSummary(place.nature_profile)),
    training: Boolean(place.training_profile && typeof place.training_profile === 'object' && profileSummary(place.training_profile)),
    badges: asArray(place.underbadge_ids).length > 0,
    works: asArray(place.works).length > 0,
    civication: asArray(place.civication_store).length > 0,
    brands: asArray(place.brands).length > 0,
    før_nå: Boolean(place.for_na && typeof place.for_na === 'object'),
    fortellinger: stories.length > 0,
    leksikon: articles.length > 0
  };
}

const manifest = readJson(manifestPath);
const relations = asArray(readJson(relationsPath));
const relationsByPlace = new Map();
for (const row of relations) {
  const placeId = text(row?.place || row?.place_id || row?.placeId);
  if (!placeId) continue;
  if (!relationsByPlace.has(placeId)) relationsByPlace.set(placeId, []);
  relationsByPlace.get(placeId).push(row);
}

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
const places = [];
const civicationTitles = new Map();
const activityTemplates = [];

for (const source of activeEtne) {
  const { manifestEntry, file, record: place } = source;
  const placeId = text(place.id) || path.basename(file, '.json');
  const category = text(place.category) || 'ukjent';
  const findings = [];
  const placeTokens = localTokens(place);
  const placeRelations = relationsByPlace.get(placeId) || [];
  const stories = storyIndex.get(placeId) || [];
  const articles = leksikonIndex.get(placeId) || [];
  const expectedRounds = CATEGORY_ROUNDS[category] || DEFAULT_ROUNDS;
  const presence = roundPresence(place, placeRelations, stories, articles);

  categoryCounts[category] = (categoryCounts[category] || 0) + 1;

  if ('rounds' in place || 'rundinger' in place) {
    addFinding(findings, 'blocker', 'manual_round_override', 'Manuell rounds/rundinger-override bryter canonical kategorioppsett.');
  }

  for (const roundId of expectedRounds) {
    if (!presence[roundId]) {
      addFinding(findings, 'blocker', `missing_${roundId}_round`, `Canonical ${roundId}-runding mangler koblet innhold.`);
    }
  }

  const works = asArray(place.works);
  const badges = asArray(place.underbadge_ids);
  const civication = asArray(place.civication_store);
  const brands = asArray(place.brands);
  const isSport = category === 'sport';
  const activities = isSport ? asArray(place.training_profile?.exercises) : [];

  if (works.length > 0 && works.length < 3) addFinding(findings, 'warning', 'works_depth', 'Works-rundingen har færre enn tre stedsspesifikke spor.', { count: works.length });
  if (badges.length > 0 && badges.length < 3) addFinding(findings, 'advisory', 'badge_depth', 'Badge-rundingen har færre enn tre relevante undermerker.', { count: badges.length });
  if (civication.length > 0 && civication.length < 2) addFinding(findings, 'warning', 'civication_depth', 'Civication-rundingen har bare ett samlingsobjekt.', { count: civication.length });
  if (brands.length > 0 && brands.length < 2) addFinding(findings, 'advisory', 'brand_depth', 'Aktør-rundingen har bare én dokumentert aktør.', { count: brands.length });

  if (!text(place.for_na?.before) || !text(place.for_na?.now) || !text(place.for_na?.change)) {
    addFinding(findings, 'blocker', 'before_now_contract', 'Før/nå-rundingen mangler before, now eller change.');
  }
  if (countUrls(place.externalLinks) === 0) {
    addFinding(findings, 'blocker', 'missing_external_source', 'Stedsposten mangler eksplisitt ekstern kilde-URL.');
  }
  if (countUrls(place.for_na?.sources) === 0) {
    addFinding(findings, 'warning', 'before_now_sources', 'Før/nå-rundingen mangler eksplisitte kilde-URL-er.');
  }

  works.forEach((work, index) => {
    const hasSource = hasText(work?.source_note || work?.sourceNote) || countUrls(work?.source_urls || work?.sources) > 0;
    if (!hasSource) addFinding(findings, 'warning', 'work_source', `Verk/spor ${index + 1} mangler kildehenvisning.`);
    if (text(work?.why_here || work?.placeSpecificReason || work?.why).length < 30) {
      addFinding(findings, 'warning', 'work_place_specificity', `Verk/spor ${index + 1} har for svak stedsspesifikk begrunnelse.`);
    }
  });

  if (isSport) {
    if (activities.length < 3) addFinding(findings, 'blocker', 'training_count', 'Sportstedet skal ha minst tre dokumenterte treningsøvelser.', { count: activities.length });
    const safetyText = [place.training_profile?.safety, ...activities.map((entry) => `${entry?.instruction || ''} ${entry?.safety || ''}`)].join(' ');
    if (!hasSafetyBoundary(safetyText)) addFinding(findings, 'blocker', 'missing_safety_boundary', 'Treningsrundingen mangler tydelig sikkerhets- eller ferdselsgrense.');

    activities.forEach((entry, index) => {
      const value = `${entry?.title || ''} ${entry?.instruction || ''} ${entry?.why || ''} ${entry?.description || ''}`;
      if (!hasText(entry?.id)) addFinding(findings, 'warning', 'training_id', `Treningsøvelse ${index + 1} mangler id.`);
      if (text(entry?.instruction).length < 70) addFinding(findings, 'warning', 'activity_instruction_depth', `Treningsøvelse ${index + 1} har for kort instruksjon.`, { length: text(entry?.instruction).length });
      if (text(entry?.why).length < 35) addFinding(findings, 'warning', 'activity_why_depth', `Treningsøvelse ${index + 1} har for svak faglig begrunnelse.`, { length: text(entry?.why).length });
      if (!containsLocal(value, placeTokens)) addFinding(findings, 'warning', 'activity_place_specificity', `Treningsøvelse ${index + 1} bruker ingen tydelig lokal signaturterm.`);
      activityTemplates.push({ placeId, id: entry?.id, template: normalizeTemplate(value, placeTokens) });
    });
  }

  civication.forEach((object, index) => {
    const label = `Civication-objekt ${index + 1}`;
    if (!hasText(object?.id) || !hasText(object?.title)) addFinding(findings, 'blocker', 'civication_identity', `${label} mangler id eller tittel.`);
    if (object?.physicalObject !== true) addFinding(findings, 'blocker', 'civication_physical', `${label} er ikke eksplisitt fysisk.`);
    if (object?.placeSpecific !== true) addFinding(findings, 'blocker', 'civication_specific', `${label} er ikke eksplisitt stedsspesifikt.`);
    if (!asArray(object?.source_urls).some((url) => /^https?:\/\//.test(text(url)))) addFinding(findings, 'warning', 'civication_source', `${label} mangler kilde-URL.`);
    if (text(object?.placeSpecificReason).length < 45) addFinding(findings, 'warning', 'civication_reason_depth', `${label} har for svak stedsspesifikk begrunnelse.`);
    const titleKey = normalize(object?.title);
    if (titleKey) {
      if (!civicationTitles.has(titleKey)) civicationTitles.set(titleKey, []);
      civicationTitles.get(titleKey).push({ placeId, id: object?.id });
    }
  });

  brands.forEach((brand, index) => {
    const classifier = brand?.brand_kind || brand?.brand_type || brand?.kind || brand?.type || brand?.role;
    if (!hasText(brand?.id) || !hasText(brand?.name) || !hasText(classifier)) {
      addFinding(findings, 'warning', 'brand_contract', `Aktør ${index + 1} mangler id, name eller rolle/type.`);
    }
  });

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
  if (internal.length) addFinding(findings, 'warning', 'circular_internal_sources', 'Fortelling eller leksikon bruker History Go som faktakilde.', { occurrences: internal.slice(0, 12) });
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
    expectedRounds,
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
      peopleRelations: placeRelations.length,
      works: works.length,
      badges: badges.length,
      civication: civication.length,
      brands: brands.length,
      activities: activities.length,
      stories: stories.length,
      leksikon: articles.length,
      externalSourceUrls: countUrls(place.externalLinks),
      storyArticleSourceUrls: storyArticleUrls
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
    if (Math.min(tokenSet(activityTemplates[i].template).size, tokenSet(activityTemplates[j].template).size) < 9) continue;
    const similarity = jaccard(tokenSet(activityTemplates[i].template), tokenSet(activityTemplates[j].template));
    if (similarity < 0.86) continue;
    for (const [record, other] of [[activityTemplates[i], activityTemplates[j]], [activityTemplates[j], activityTemplates[i]]]) {
      const target = places.find((entry) => entry.placeId === record.placeId);
      addFinding(target.findings, 'warning', 'near_duplicate_activity', 'Treningsøvelsen er svært lik innhold ved et annet Etne-sted.', { otherPlaceId: other.placeId, similarity: Number(similarity.toFixed(3)), firstId: record.id, secondId: other.id });
    }
  }
}

const findingCodeTotals = {};
const findingCodePlaceIds = {};
for (const place of places) {
  for (const finding of place.findings) {
    findingCodeTotals[finding.code] = (findingCodeTotals[finding.code] || 0) + 1;
    if (!findingCodePlaceIds[finding.code]) findingCodePlaceIds[finding.code] = [];
    if (!findingCodePlaceIds[finding.code].includes(place.placeId)) findingCodePlaceIds[finding.code].push(place.placeId);
  }
  place.blockers = place.findings.filter((entry) => entry.severity === 'blocker').length;
  place.warnings = place.findings.filter((entry) => entry.severity === 'warning').length;
  place.score = Math.max(0, 100 - place.blockers * 12 - place.warnings * 3);
}

for (const ids of Object.values(findingCodePlaceIds)) ids.sort((a, b) => a.localeCompare(b, 'nb'));
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
    findingCodeTotals,
    findingCodePlaceIds
  },
  places
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(jsonOut, `${JSON.stringify(report, null, 2)}\n`);

const rows = places.map((entry) => `| ${entry.placeId} | ${entry.category} | ${entry.score} | ${entry.blockers} | ${entry.warnings} | ${entry.counts.peopleRelations}/${entry.counts.works}/${entry.counts.civication}/${entry.counts.brands} | ${entry.findings.slice(0, 4).map((finding) => finding.code).join(', ') || 'OK'} |`).join('\n');
const categoryRows = Object.entries(categoryCounts).sort((a, b) => a[0].localeCompare(b[0], 'nb')).map(([category, count]) => `| ${category} | ${count} |`).join('\n');
const codeRows = Object.entries(findingCodeTotals).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'nb')).map(([code, count]) => `| ${code} | ${count} | ${findingCodePlaceIds[code].join(', ')} |`).join('\n');
const detail = places.map((entry) => {
  const findings = entry.findings.length
    ? entry.findings.map((finding) => `- **${finding.severity} · ${finding.code}:** ${finding.message}${finding.evidence ? ` — \`${JSON.stringify(finding.evidence)}\`` : ''}`).join('\n')
    : '- Ingen funn.';
  return `## ${entry.name} (\`${entry.placeId}\`)\n\nKategori: **${entry.category}**  \nFil: \`${entry.file}\`  \nScore: **${entry.score}** · blockers: **${entry.blockers}** · warnings: **${entry.warnings}**\n\n${findings}`;
}).join('\n\n');

const md = `# Etne – kvalitetsaudit av øvrige rundinger\n\nGenerert: ${report.generatedAt}\n\nNaturkategorien er utelatt fordi den allerede har egen fullført 26-steders audit. People-rundingen måles gjennom canonical person–sted-relasjoner i \`data/relations.json\`.\n\n## Omfang\n\n- Aktive Etne-steder utenfor natur: **${places.length}**\n- Blockers: **${report.totals.blockers}**\n- Warnings: **${report.totals.warnings}**\n- Gjennomsnittsscore: **${report.totals.averageScore}**\n- Steder under 90: **${report.totals.placesBelow90}**\n- Steder med blockers: **${report.totals.placesWithBlockers}**\n\n## Kategorier\n\n| kategori | steder |\n|---|---:|\n${categoryRows}\n\n## Funnkoder\n\n| kode | antall | steder |\n|---|---:|---|\n${codeRows}\n\n## Samlet oversikt\n\n| placeId | kategori | score | blockers | warnings | people/works/civication/brands | viktigste funn |\n|---|---|---:|---:|---:|---:|---|\n${rows}\n\n${detail}\n`;
fs.writeFileSync(mdOut, md);

console.log(`Etne non-nature quality audit: ${places.length} places, ${report.totals.blockers} blockers, ${report.totals.warnings} warnings, average ${report.totals.averageScore}.`);
console.log(`Reports: ${rel(jsonOut)}, ${rel(mdOut)}`);
