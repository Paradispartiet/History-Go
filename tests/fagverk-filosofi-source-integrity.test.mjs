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

const distinctiveToken = (name) => {
  const tokens = normalize(name).split(/\s+/).filter((token) => token.length >= 3);
  return tokens.at(-1) ?? normalize(name);
};

const containsName = (text, name) => {
  const haystack = ` ${normalize(text)} `;
  const full = normalize(name);
  const token = distinctiveToken(name);
  return (full && haystack.includes(` ${full} `)) || (token && haystack.includes(` ${token} `));
};

const sectionText = (article, sectionIds) => (article.sections ?? [])
  .filter((section) => sectionIds.includes(section.id))
  .flatMap((section) => section.paragraphs ?? [])
  .join('\n');

const theoryParagraphs = (article) => (article.sections ?? [])
  .find((section) => section.id === 'teorihistorie')?.paragraphs ?? [];

const thinkersRegistry = readJson(THINKERS_PATH);
const thinkerById = new Map((thinkersRegistry.thinkers ?? []).map((thinker) => [thinker.id, thinker]));
const thinkerByNormalizedName = new Map((thinkersRegistry.thinkers ?? []).map((thinker) => [normalize(thinker.name), thinker]));

const articleFiles = fs.readdirSync(ARTICLES_DIR)
  .filter((name) => name.endsWith('.json'))
  .sort();

const auditArticle = (article, file) => {
  const substantiveText = sectionText(article, ['problem', 'begreper', 'argument', 'uenighet', 'teorihistorie', 'avgrensning']);
  const theory = theoryParagraphs(article);
  const thinkerRefs = article.thinker_refs ?? [];
  const primaryWorkRefs = article.primary_work_refs ?? [];
  const debateThinkers = article.university_quality?.debate_thinkers ?? [];

  const resolvedThinkers = thinkerRefs.map((id) => thinkerById.get(id)).filter(Boolean);
  const unresolvedThinkerRefs = thinkerRefs.filter((id) => !thinkerById.has(id));
  const decorativeThinkerRefs = resolvedThinkers
    .filter((thinker) => !containsName(substantiveText, thinker.name))
    .map((thinker) => ({ id: thinker.id, name: thinker.name }));

  const explicitPrimaryAnchors = primaryWorkRefs.filter((work) => theory.some((paragraph) => {
    const hasWork = normalize(paragraph).includes(normalize(work));
    if (!hasWork) return false;
    return debateThinkers.some((name) => containsName(paragraph, name))
      || resolvedThinkers.some((thinker) => containsName(paragraph, thinker.name));
  }));
  const decorativePrimaryWorkRefs = primaryWorkRefs.filter((work) => !explicitPrimaryAnchors.includes(work));

  const missingCanonicalDebateThinkerRefs = debateThinkers.flatMap((name) => {
    const canonical = thinkerByNormalizedName.get(normalize(name));
    if (!canonical || thinkerRefs.includes(canonical.id)) return [];
    return [{ name, expected_ref: canonical.id }];
  });

  const debateThinkersMissingFromProse = debateThinkers.filter((name) => !containsName(substantiveText, name));
  const genericTheoryPrimaryTemplate = theory.some((paragraph) => /Primærverkene .+ brukes for å følge hvordan de navngitte posisjonene/u.test(paragraph));

  const issues = {};
  if (unresolvedThinkerRefs.length) issues.unresolved_thinker_refs = unresolvedThinkerRefs;
  if (decorativeThinkerRefs.length) issues.decorative_thinker_refs = decorativeThinkerRefs;
  if (decorativePrimaryWorkRefs.length) issues.decorative_primary_work_refs = decorativePrimaryWorkRefs;
  if (missingCanonicalDebateThinkerRefs.length) issues.missing_canonical_debate_thinker_refs = missingCanonicalDebateThinkerRefs;
  if (debateThinkersMissingFromProse.length) issues.debate_thinkers_missing_from_prose = debateThinkersMissingFromProse;
  if (genericTheoryPrimaryTemplate) issues.generic_theory_primary_template = true;
  if (explicitPrimaryAnchors.length < 2) issues.explicit_primary_anchor_count = explicitPrimaryAnchors.length;

  return {
    file,
    id: article.id,
    title: article.title,
    domain_id: article.domain_id,
    thinker_refs: thinkerRefs,
    debate_thinkers: debateThinkers,
    primary_work_refs: primaryWorkRefs,
    explicit_primary_anchors: explicitPrimaryAnchors,
    issues
  };
};

test('all university-reviewed Philosophy articles have source-integrity alignment', () => {
  const articles = articleFiles.map((file) => ({ file, article: readJson(path.join(ARTICLES_DIR, file)) }));
  assert.equal(articles.length, 68, 'canonical Philosophy article count changed');

  const reviewed = articles.filter(({ article }) => article.quality?.review_state === 'university_depth_reviewed');
  assert.equal(reviewed.length, 68, 'all canonical Philosophy articles must remain university_depth_reviewed');

  const audit = reviewed.map(({ article, file }) => auditArticle(article, file));
  const offenders = audit.filter((entry) => Object.keys(entry.issues).length > 0);

  if (offenders.length) {
    console.error(JSON.stringify({
      schema: 'history_go_filosofi_source_integrity_audit_v1',
      article_count: audit.length,
      offender_count: offenders.length,
      offenders
    }, null, 2));
  }

  assert.equal(
    offenders.length,
    0,
    `${offenders.length}/68 Philosophy articles fail source-integrity alignment; see structured audit above`
  );
});
