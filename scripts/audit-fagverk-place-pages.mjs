import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const registry = readJson('data/fagverk/fagverk_registry.json');
const portal = readJson('data/fagverk/fagverk_portal.json');
const categories = readJson('data/categories/category_contract.json');
const indexDocument = readJson('data/places/places_index.json');
const schema = readJson('data/places/regler/place_fagverk_v2.schema.json');
const fagManifest = readJson('data/fag/fag_manifest.json');
const indexRows = Array.isArray(indexDocument) ? indexDocument : indexDocument.places || [];
const portalById = new Map((portal.categories || []).map((row) => [row.id, row]));
const mapping = registry.placePage?.fallbackSubjectByCategory || {};
const allowedIndexKeys = new Set(['sourceFile', 'field', 'schema', 'level', 'status']);
const forbiddenIndexKeys = new Set([
  'title',
  'intro',
  'article',
  'emneIds',
  'emne_ids',
  'lenses',
  'guidingQuestions',
  'guiding_questions',
  'concepts',
  'observable_traces',
  'source_urls'
]);
const placeholderPattern = /(?:lorem|todo|tbd|kommer senere|fyll inn|generisk|standardspørsmål|eksempeltekst)/iu;

function list(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return String(value == null ? '' : value).trim();
}

function words(value) {
  return text(value).split(/\s+/u).filter(Boolean).length;
}

function normalized(value) {
  return text(value)
    .normalize('NFKD')
    .toLocaleLowerCase('nb-NO')
    .replace(/[^a-z0-9æøå]+/gu, ' ')
    .trim();
}

function isHttpUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(text(value)).protocol);
  } catch {
    return false;
  }
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/u.test(text(value)) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function hasDuplicates(values) {
  const normalizedValues = list(values).map((value) => normalized(typeof value === 'string' ? value : JSON.stringify(value)));
  return new Set(normalizedValues).size !== normalizedValues.length;
}

function loadPlace(row) {
  const sourceFile = text(row.sourceFile);
  if (!sourceFile) return { place: row, sourceFile: '' };
  const absolute = path.join(root, 'data', sourceFile);
  return {
    place: fs.existsSync(absolute) ? readJson(`data/${sourceFile}`) : row,
    sourceFile
  };
}

function foundationEmneIds(subjectId, subject) {
  if (text(subject?.canonicalModel?.schemaFamily) !== 'foundation_v1') return [];
  const pointer = text(fagManifest?.[subjectId]?.emner);
  if (!pointer) return [];
  const document = readJson(`data/fag/${pointer}`);
  const rows = Array.isArray(document) ? document : list(document.emners || document.emner || document.items);
  return rows.map((row) => text(row?.emne_id || row?.id)).filter(Boolean);
}

function buildSubjectTargets() {
  const targets = new Map();
  for (const [subjectId, subject] of Object.entries(registry.subjects || {})) {
    const emneIds = new Set();
    const chapterIds = new Set();
    for (const chapter of list(subject.chapters)) {
      if (text(chapter.id)) chapterIds.add(chapter.id);
      for (const emneId of list(chapter.emne_ids)) emneIds.add(emneId);
    }
    for (const emneId of foundationEmneIds(subjectId, subject)) emneIds.add(emneId);
    const chapterlessFoundation = text(subject?.canonicalModel?.schemaFamily) === 'foundation_v1' && chapterIds.size === 0;
    targets.set(subjectId, { emneIds, chapterIds, chapterlessFoundation });
  }
  return targets;
}

const subjectTargets = buildSubjectTargets();
const reusedSubstance = new Map();

function registerUniqueSubstance(errors, placeId, kind, value) {
  const key = `${kind}:${normalized(value)}`;
  if (!normalized(value)) return;
  const owner = reusedSubstance.get(key);
  if (owner && owner !== placeId) errors.push(`${placeId}: ${kind} gjenbruker ordrett stedssubstans fra ${owner}`);
  else reusedSubstance.set(key, placeId);
}

function validateIndexEntry(errors, placeId, sourceFile, fagverk, entry) {
  if (!entry) {
    errors.push(`${placeId}: Place-eid fagverk mangler registry-indeks`);
    return;
  }
  for (const key of Object.keys(entry)) {
    if (!allowedIndexKeys.has(key)) errors.push(`${placeId}: registry-indeksen har ulovlig felt ${key}`);
  }
  for (const key of forbiddenIndexKeys) {
    if (Object.hasOwn(entry, key)) errors.push(`${placeId}: registryet eier fortsatt stedlig innhold i ${key}`);
  }
  if (entry.sourceFile !== sourceFile) errors.push(`${placeId}: registry-indeksen peker til feil sourceFile`);
  if (entry.field !== 'fagverk') errors.push(`${placeId}: registry-indeksen peker ikke til fagverk-feltet`);
  for (const key of ['schema', 'level', 'status']) {
    if (entry[key] !== fagverk[key]) errors.push(`${placeId}: registry-indeksen er usynkronisert for ${key}`);
  }
}

function validateFagverk(place, sourceFile, indexEntry) {
  const fagverk = place.fagverk;
  const errors = [];
  const prefix = `${place.id}:`;
  if (!fagverk) return errors;

  if (fagverk.schema !== 'history_go_place_fagverk_v2') errors.push(`${prefix} ugyldig fagverk-schema`);
  if (!['full', 'standard', 'micro'].includes(fagverk.level)) errors.push(`${prefix} ugyldig produksjonsnivå`);
  if (!['curated', 'in_production'].includes(fagverk.status)) errors.push(`${prefix} ugyldig fagverk-status`);
  if (!isIsoDate(fagverk.verified_at)) errors.push(`${prefix} verified_at er ikke en gyldig dato`);

  for (const field of ['article', 'subject_ids', 'emne_ids', 'chapter_ids', 'lenses', 'guiding_questions', 'concepts', 'observable_traces', 'source_urls']) {
    if (!Array.isArray(fagverk[field])) errors.push(`${prefix} ${field} skal være en array`);
    else if (hasDuplicates(fagverk[field])) errors.push(`${prefix} ${field} inneholder duplikater`);
  }
  if (!list(fagverk.subject_ids).length) errors.push(`${prefix} mangler fagbinding`);
  if (!list(fagverk.emne_ids).length) errors.push(`${prefix} mangler emnebinding`);
  if (words(fagverk.intro) < 12) errors.push(`${prefix} læringsinngangen er for kort`);
  if (placeholderPattern.test(JSON.stringify(fagverk))) errors.push(`${prefix} inneholder plassholder- eller generisk språk`);

  const externalLinks = new Map(list(place.externalLinks || place.external_links)
    .filter((row) => row && typeof row === 'object' && isHttpUrl(row.url))
    .map((row) => [row.url, row]));
  for (const url of list(fagverk.source_urls)) {
    if (!isHttpUrl(url)) errors.push(`${prefix} ugyldig kontrollert kilde-URL ${url}`);
    const linked = externalLinks.get(url);
    if (!linked || !text(linked.label || linked.title || linked.name)) {
      errors.push(`${prefix} fagverkskilden mangler navngitt operativ externalLinks-oppføring: ${url}`);
    }
  }

  for (const subjectId of list(fagverk.subject_ids)) {
    if (!subjectTargets.has(subjectId)) errors.push(`${prefix} ukjent subject_id ${subjectId}`);
  }
  for (const emneId of list(fagverk.emne_ids)) {
    const owners = list(fagverk.subject_ids).filter((subjectId) => subjectTargets.get(subjectId)?.emneIds.has(emneId));
    if (!owners.length) errors.push(`${prefix} uløst canonical emne_id ${emneId}`);
  }
  for (const chapterId of list(fagverk.chapter_ids)) {
    const owners = list(fagverk.subject_ids).filter((subjectId) => subjectTargets.get(subjectId)?.chapterIds.has(chapterId));
    if (!owners.length) errors.push(`${prefix} uløst canonical chapter_id ${chapterId}`);
  }

  validateIndexEntry(errors, place.id, sourceFile, fagverk, indexEntry);
  if (fagverk.status !== 'curated') return errors;

  const requirements = {
    full: { articleWords: 220, paragraphs: 5, lenses: [3, 5], questions: [4, 6], concepts: 6, traces: 2, sources: 4, chapters: 1 },
    standard: { articleWords: 70, paragraphs: 1, lenses: [3, 5], questions: [4, 6], concepts: 3, traces: 1, sources: 2, chapters: 1 },
    micro: { articleWords: 0, paragraphs: 0, lenses: [0, 2], questions: [1, 2], concepts: 1, traces: 1, sources: 1, chapters: 0 }
  }[fagverk.level];
  if (!requirements) return errors;

  if (words(list(fagverk.article).join(' ')) < requirements.articleWords) errors.push(`${prefix} fagartikkelen mangler substans`);
  if (list(fagverk.article).length < requirements.paragraphs) errors.push(`${prefix} fagartikkelen har for få redigerte avsnitt`);
  if (list(fagverk.lenses).length < requirements.lenses[0] || list(fagverk.lenses).length > requirements.lenses[1]) {
    errors.push(`${prefix} antall linser passer ikke nivået`);
  }
  if (list(fagverk.guiding_questions).length < requirements.questions[0] || list(fagverk.guiding_questions).length > requirements.questions[1]) {
    errors.push(`${prefix} antall undersøkelsesspørsmål passer ikke nivået`);
  }
  if (list(fagverk.concepts).length < requirements.concepts) errors.push(`${prefix} for få sentrale begreper`);
  if (list(fagverk.observable_traces).length < requirements.traces) errors.push(`${prefix} for få observerbare spor`);
  if (list(fagverk.source_urls).length < requirements.sources) errors.push(`${prefix} for få kontrollerte kilder`);
  const selectedTargets = list(fagverk.subject_ids).map((subjectId) => subjectTargets.get(subjectId)).filter(Boolean);
  const chapterlessFoundation = selectedTargets.length > 0 && selectedTargets.every((target) => target.chapterlessFoundation);
  const requiredChapters = fagverk.level === 'standard' && chapterlessFoundation ? 0 : requirements.chapters;
  if (list(fagverk.chapter_ids).length < requiredChapters) errors.push(`${prefix} mangler relevante canonicale kapitler`);

  const lensIds = new Set();
  for (const lens of list(fagverk.lenses)) {
    if (!text(lens.id) || lensIds.has(lens.id)) errors.push(`${prefix} linse-ID mangler eller er duplisert`);
    lensIds.add(lens.id);
    if (words(lens.title) < 2 || words(lens.prompt) < 8 || !text(lens.prompt).endsWith('?') || words(lens.evidence) < 6) {
      errors.push(`${prefix} svak linse ${lens.id || '<uten id>'}`);
    }
    if (!list(fagverk.subject_ids).includes(lens.subject_id)) errors.push(`${prefix} linsen ${lens.id} peker til ukjent fag`);
    if (!list(fagverk.emne_ids).includes(lens.emne_id)) errors.push(`${prefix} linsen ${lens.id} peker utenfor stedets emner`);
    if (!subjectTargets.get(lens.subject_id)?.emneIds.has(lens.emne_id)) errors.push(`${prefix} linsen ${lens.id} har dødt emnemål`);
    registerUniqueSubstance(errors, place.id, 'linse', lens.prompt);
  }

  for (const question of list(fagverk.guiding_questions)) {
    if (words(question) < 7 || !text(question).endsWith('?')) errors.push(`${prefix} svakt undersøkelsesspørsmål`);
    registerUniqueSubstance(errors, place.id, 'spørsmål', question);
  }
  for (const trace of list(fagverk.observable_traces)) {
    if (words(trace.title) < 2 || words(trace.observation) < 6 || words(trace.interpretation_boundary) < 6) {
      errors.push(`${prefix} svakt observerbart spor`);
    }
    if (!list(trace.source_urls).length) errors.push(`${prefix} observerbart spor mangler kildebevis`);
    for (const url of list(trace.source_urls)) {
      if (!list(fagverk.source_urls).includes(url)) errors.push(`${prefix} spor-kilde er ikke kontrollert på toppnivå: ${url}`);
    }
    registerUniqueSubstance(errors, place.id, 'spor', trace.observation);
  }

  const articleParagraphs = new Set(text(place.popupDesc).split(/\n\s*\n/u).map(normalized).filter(Boolean));
  for (const paragraph of list(fagverk.article)) {
    if (articleParagraphs.has(normalized(paragraph)) || normalized(paragraph) === normalized(place.desc)) {
      errors.push(`${prefix} vanlig stedsbeskrivelse er kopiert ordrett som fagartikkel`);
    }
  }
  registerUniqueSubstance(errors, place.id, 'læringsinngang', fagverk.intro);
  return errors;
}

if (schema.$id !== 'history_go_place_fagverk_v2' || schema.additionalProperties !== false) {
  throw new Error('place_fagverk_v2.schema.json har feil identitet eller åpen toppkontrakt');
}

const errors = [];
for (const subjectId of categories.fagSubjects || []) {
  const portalEntry = portalById.get(subjectId);
  if (mapping[subjectId] !== subjectId) errors.push(`${subjectId}: mangler eksakt kategori-til-fag-mapping`);
  if (portalEntry?.subjectStatus !== 'materialized' || portalEntry?.subjectPage !== `fagverk.html?subject=${subjectId}`) {
    errors.push(`${subjectId}: mangler materialisert canonical fagside`);
  }
}
if (registry.placePage?.contentOwner !== 'data/places/**#fagverk') errors.push('registry: feil Place-eier');
if (registry.placePage?.contentSchema !== 'history_go_place_fagverk_v2') errors.push('registry: feil innholdsschema');
if (registry.placePage?.unfinishedFallback !== 'honest_compact_status') errors.push('registry: feil uferdigstatus');

const summary = { all: 0, curated: 0, in_production: 0, linked_unfinished: 0, category_only_unfinished: 0 };
const byCategory = {};
const queues = { in_production: [], linked_unfinished: [], category_only_unfinished: [] };
const canonicalIds = new Set();
let unresolvedLegacyBindingCount = 0;

for (const row of indexRows) {
  const { place: loaded, sourceFile } = loadPlace(row);
  const place = { ...loaded, id: text(loaded.id || row.id), category: text(loaded.category || row.category) };
  canonicalIds.add(place.id);
  const fallbackSubject = mapping[place.category];
  if (!fallbackSubject || !portalById.has(fallbackSubject)) errors.push(`${place.id}: kategori ${place.category} mangler operativt fagmål`);

  const indexEntry = registry.placeLinks?.[place.id];
  errors.push(...validateFagverk(place, sourceFile, indexEntry));
  if (indexEntry && !place.fagverk) errors.push(`${place.id}: registryet peker til manglende Place-eid fagverk`);

  const documentedEmneIds = list(place.fagverk?.emne_ids || place.emne_ids || place.emneIds);
  const resolvedBindings = documentedEmneIds.filter((id) => subjectTargets.get(fallbackSubject)?.emneIds.has(id));
  unresolvedLegacyBindingCount += documentedEmneIds.length - resolvedBindings.length;
  const status = place.fagverk?.status === 'curated'
    ? 'curated'
    : place.fagverk
      ? 'in_production'
      : resolvedBindings.length
        ? 'linked_unfinished'
        : 'category_only_unfinished';

  summary.all += 1;
  summary[status] += 1;
  byCategory[place.category] ||= { all: 0, curated: 0, in_production: 0, linked_unfinished: 0, category_only_unfinished: 0 };
  byCategory[place.category].all += 1;
  byCategory[place.category][status] += 1;
  if (queues[status]) queues[status].push(place.id);
}

for (const placeId of Object.keys(registry.placeLinks || {})) {
  if (!canonicalIds.has(placeId)) errors.push(`${placeId}: foreldreløs registry-indeks`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const report = {
  schema: 'history-go.fagverk-place-page-coverage.v2',
  generatedFrom: [
    'data/places/places_index.json',
    'data/places/**#fagverk',
    'data/places/regler/place_fagverk_v2.schema.json',
    'data/fagverk/fagverk_registry.json',
    'data/fagverk/fagverk_portal.json'
  ],
  interpretation: {
    curated: 'Place-eid, nivåvalidert, stedsspesifikt og kildebelagt Fagverk-sted v2-innhold.',
    in_production: 'Place-eid fagverkblokk finnes, men vises fortsatt med ærlig uferdigstatus.',
    linked_unfinished: 'Ingen fagverkblokk; bare eksisterende, løste fag- og emnekoblinger vises som operative lenker.',
    category_only_unfinished: 'Ingen fagverkblokk eller løste emnebindinger; bare kategoriens canonicale faginngang vises.'
  },
  linkIntegrity: {
    curatedTargetsValidated: true,
    visibleUnresolvedTargets: 0,
    unresolvedLegacyBindingsNotRendered: unresolvedLegacyBindingCount
  },
  summary,
  byCategory,
  queues
};

if (process.argv.includes('--write')) {
  const output = path.join(root, 'reports/fagverk/fagverk-place-page-coverage-v2.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(
  `Fagverk-sted v2: ${summary.curated} curated, ${summary.in_production} in production, ` +
  `${summary.linked_unfinished} linked unfinished, ${summary.category_only_unfinished} category-only unfinished.`
);

export { report, validateFagverk };
