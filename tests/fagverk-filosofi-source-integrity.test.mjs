import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = path.join(ROOT, 'data/fagverk/filosofi/articles');
const THINKERS_PATH = path.join(ROOT, 'data/fag/filosofi/teoretikere_filosofi_canonical_v2.json');

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const normalize = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();
const distinctiveToken = (name) => normalize(name).split(/\s+/).filter((token) => token.length >= 3).at(-1) ?? normalize(name);
const containsName = (text, name) => {
  const haystack = ` ${normalize(text)} `;
  const full = normalize(name);
  const token = distinctiveToken(name);
  return (full && haystack.includes(` ${full} `)) || (token && haystack.includes(` ${token} `));
};
const sectionText = (article, ids) => (article.sections ?? [])
  .filter((section) => ids.includes(section.id))
  .flatMap((section) => section.paragraphs ?? [])
  .join('\n');

const registry = readJson(THINKERS_PATH);
const thinkers = registry.thinkers ?? [];
const thinkerById = new Map(thinkers.map((thinker) => [thinker.id, thinker]));
const thinkerByName = new Map(thinkers.map((thinker) => [normalize(thinker.name), thinker]));
const thinkersByLastToken = new Map();
for (const thinker of thinkers) {
  const token = normalize(thinker.name).split(/\s+/).at(-1);
  const rows = thinkersByLastToken.get(token) ?? [];
  rows.push(thinker);
  thinkersByLastToken.set(token, rows);
}
const resolveThinker = (name) => {
  const direct = thinkerByName.get(normalize(name));
  if (direct) return direct;
  const candidates = thinkersByLastToken.get(normalize(name).split(/\s+/).at(-1)) ?? [];
  return candidates.length === 1 ? candidates[0] : null;
};

const articleFiles = fs.readdirSync(ARTICLES_DIR).filter((name) => name.endsWith('.json')).sort();

test('all 68 university-reviewed Philosophy articles align debate thinkers, refs and primary works', () => {
  assert.equal(articleFiles.length, 68, 'canonical Philosophy article count changed');
  const offenders = [];

  for (const file of articleFiles) {
    const article = readJson(path.join(ARTICLES_DIR, file));
    assert.equal(article.quality?.review_state, 'university_depth_reviewed', `${article.id}: review state changed`);

    const debateNames = article.university_quality?.debate_thinkers ?? [];
    const resolvedDebate = debateNames.map((name) => ({ name, thinker: resolveThinker(name) }));
    const canonicalDebate = resolvedDebate.filter((row) => row.thinker).map((row) => row.thinker);
    const thinkerRefs = article.thinker_refs ?? [];
    const resolvedRefs = thinkerRefs.map((id) => thinkerById.get(id)).filter(Boolean);
    const primaryWorks = article.primary_work_refs ?? [];
    const substantive = sectionText(article, ['problem', 'argument', 'uenighet', 'teorihistorie', 'avgrensning']);
    const theory = sectionText(article, ['teorihistorie']);
    const issues = {};

    const unresolvedRefs = thinkerRefs.filter((id) => !thinkerById.has(id));
    if (unresolvedRefs.length) issues.unresolved_thinker_refs = unresolvedRefs;

    const unresolvedDebate = resolvedDebate.filter((row) => !row.thinker).map((row) => row.name);
    if (unresolvedDebate.length) issues.unresolved_debate_thinkers = unresolvedDebate;

    const missingDebateRefs = canonicalDebate.filter((thinker) => !thinkerRefs.includes(thinker.id)).map((thinker) => thinker.id);
    if (missingDebateRefs.length) issues.missing_debate_thinker_refs = missingDebateRefs;

    const decorativeRefs = resolvedRefs.filter((thinker) => !containsName(substantive, thinker.name)).map((thinker) => thinker.id);
    if (decorativeRefs.length) issues.decorative_thinker_refs = decorativeRefs;

    const nonDebateRefs = resolvedRefs.filter((thinker) => !canonicalDebate.some((debate) => debate.id === thinker.id)).map((thinker) => thinker.id);
    if (nonDebateRefs.length) issues.non_debate_thinker_refs = nonDebateRefs;

    const ownedWorks = new Map();
    for (const thinker of resolvedRefs) {
      for (const work of thinker.works ?? []) ownedWorks.set(normalize(work), thinker.id);
    }
    const unownedWorks = primaryWorks.filter((work) => !ownedWorks.has(normalize(work)));
    if (unownedWorks.length) issues.primary_works_not_owned_by_debate_refs = unownedWorks;

    const ungroundedWorks = primaryWorks.filter((work) => !normalize(theory).includes(normalize(work)));
    if (ungroundedWorks.length) issues.primary_works_missing_from_theory_history = ungroundedWorks;

    if (primaryWorks.length < 2) issues.primary_work_count = primaryWorks.length;
    if (article.university_quality?.primary_work_count !== primaryWorks.length) {
      issues.stale_primary_work_count = article.university_quality?.primary_work_count;
    }
    if (article.quality?.source_integrity?.state !== 'reviewed') issues.source_integrity_state = article.quality?.source_integrity?.state ?? null;

    if (Object.keys(issues).length) offenders.push({
      id: article.id,
      title: article.title,
      debate_thinkers: debateNames,
      thinker_refs: thinkerRefs,
      primary_work_refs: primaryWorks,
      issues
    });
  }

  if (offenders.length) console.error(JSON.stringify({
    schema: 'history_go_filosofi_source_integrity_audit_v2',
    article_count: articleFiles.length,
    offender_count: offenders.length,
    offenders
  }, null, 2));

  assert.equal(offenders.length, 0, `${offenders.length}/68 Philosophy articles fail debate-aligned source integrity`);
});
