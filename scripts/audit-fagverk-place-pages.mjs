import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const registry = readJson('data/fagverk/fagverk_registry.json');
const portal = readJson('data/fagverk/fagverk_portal.json');
const categories = readJson('data/categories/category_contract.json');
const indexDocument = readJson('data/places/places_index.json');
const indexRows = Array.isArray(indexDocument) ? indexDocument : indexDocument.places || [];
const portalById = new Map((portal.categories || []).map((row) => [row.id, row]));
const mapping = registry.placePage?.fallbackSubjectByCategory || {};

function loadPlace(row) {
  const sourceFile = String(row.sourceFile || '').trim();
  if (!sourceFile) return row;
  const file = path.join(root, 'data', sourceFile);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : row;
}

function emptyCategory() {
  return { all: 0, curated: 0, source_linked: 0, article_only: 0, binding_only: 0, missing: 0 };
}

const errors = [];
for (const subjectId of categories.fagSubjects || []) {
  const portalEntry = portalById.get(subjectId);
  if (mapping[subjectId] !== subjectId) errors.push(`${subjectId}: mangler eksakt kategori-til-fag-mapping`);
  if (portalEntry?.subjectStatus !== 'materialized' || portalEntry?.subjectPage !== `fagverk.html?subject=${subjectId}`) {
    errors.push(`${subjectId}: mangler materialisert canonical fagside`);
  }
}

const summary = emptyCategory();
const byCategory = {};
const queues = { article_only: [], binding_only: [], missing: [] };

for (const row of indexRows) {
  const place = loadPlace(row);
  const id = String(place.id || row.id || '').trim();
  const category = String(place.category || row.category || '').trim();
  const subjectId = mapping[category];
  if (!subjectId || !portalById.has(subjectId)) errors.push(`${id}: kategori ${category} mangler operativt fagmål`);
  const article = Boolean(String(place.popupDesc || place.desc || '').trim());
  const emneIds = Array.isArray(place.emne_ids || place.emneIds) ? (place.emne_ids || place.emneIds).filter(Boolean) : [];
  const curated = registry.placeLinks?.[id];
  const curatedReady = Boolean(
    curated &&
    (curated.lenses || []).length &&
    (curated.guidingQuestions || []).length &&
    (curated.lenses || []).every((lens) => lens.emneId && (curated.emneIds || []).includes(lens.emneId))
  );
  let status = 'missing';
  if (curatedReady && article) status = 'curated';
  else if (article && emneIds.length) status = 'source_linked';
  else if (article) status = 'article_only';
  else if (emneIds.length) status = 'binding_only';
  summary.all += 1;
  summary[status] += 1;
  byCategory[category] ||= emptyCategory();
  byCategory[category].all += 1;
  byCategory[category][status] += 1;
  if (queues[status]) queues[status].push(id);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const report = {
  schema: 'history-go.fagverk-place-page-coverage.v2',
  generatedFrom: ['data/places/places_index.json', 'data/places/**', 'data/fagverk/fagverk_registry.json', 'data/fagverk/fagverk_portal.json'],
  interpretation: {
    curated: 'Redigert stedsartikkel, canonicale emnebindinger, stedsspesifikke linser med operative emnemål og stedsspesifikke spørsmål.',
    source_linked: 'Redigert stedsartikkel og canonicale emnebindinger; runtime materialiserer unike, klikkbare linser fra eide fagdata.',
    article_only: 'Redigert stedsartikkel og operativ faginngang, men mangler eksplisitt emnekuratering.',
    binding_only: 'Canonical emnebinding finnes, men redigert stedsartikkel mangler.',
    missing: 'Mangler både redigert stedsartikkel og emnebinding.'
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

console.log(`Fagverk-sted coverage: ${summary.curated} curated, ${summary.source_linked} source-linked, ${summary.article_only} article-only, ${summary.binding_only} binding-only, ${summary.missing} missing.`);

export { report };
