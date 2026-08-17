import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = path.join(ROOT, 'data/fagverk/filosofi/articles');
const THINKERS_PATH = path.join(ROOT, 'data/fag/filosofi/teoretikere_filosofi_canonical_v2.json');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const normalize = (value) => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const token = (name) => normalize(name).split(/\s+/).filter((part) => part.length >= 3).at(-1) ?? normalize(name);
const containsName = (text, name) => {
  const haystack = ` ${normalize(text)} `;
  return haystack.includes(` ${normalize(name)} `) || haystack.includes(` ${token(name)} `);
};
const sectionText = (article, ids) => (article.sections ?? []).filter((s) => ids.includes(s.id)).flatMap((s) => s.paragraphs ?? []).join('\n');

const registry = readJson(THINKERS_PATH);
const thinkers = registry.thinkers ?? [];
const thinkerById = new Map(thinkers.map((t) => [t.id, t]));
const thinkerByName = new Map(thinkers.map((t) => [normalize(t.name), t]));
const THINKER_ALIASES = new Map([
  [normalize('Averroes'), 'ibn_rushd'],
  [normalize('Kyle Whyte'), 'kyle_whyte']
]);
const resolveThinker = (name) => {
  const direct = thinkerByName.get(normalize(name));
  if (direct) return direct;
  const aliasId = THINKER_ALIASES.get(normalize(name));
  return aliasId ? thinkerById.get(aliasId) ?? null : null;
};

const articleFiles = fs.readdirSync(ARTICLES_DIR).filter((name) => name.endsWith('.json')).sort();

test('all 68 university-reviewed Philosophy articles have debate-aligned source integrity', () => {
  assert.equal(articleFiles.length, 68, 'canonical Philosophy article count changed');
  const offenders = [];

  for (const file of articleFiles) {
    const article = readJson(path.join(ARTICLES_DIR, file));
    const debateActors = article.university_quality?.debate_thinkers ?? [];
    const sourceIntegrity = article.quality?.source_integrity;
    const thinkerRefs = article.thinker_refs ?? [];
    const primaryWorks = article.primary_work_refs ?? [];
    const anchors = sourceIntegrity?.primary_work_anchors ?? [];
    const substantive = sectionText(article, ['problem', 'argument', 'uenighet', 'teorihistorie', 'avgrensning']);
    const theory = sectionText(article, ['teorihistorie']);
    const issues = {};

    if (article.quality?.review_state !== 'university_depth_reviewed') issues.review_state = article.quality?.review_state ?? null;
    if (sourceIntegrity?.state !== 'reviewed') issues.source_integrity_state = sourceIntegrity?.state ?? null;
    if (sourceIntegrity?.standard !== 'debate_aligned_primary_works_v2') issues.source_integrity_standard = sourceIntegrity?.standard ?? null;
    if (JSON.stringify(sourceIntegrity?.debate_actors ?? []) !== JSON.stringify(debateActors)) issues.stale_debate_actors = sourceIntegrity?.debate_actors ?? [];

    const resolvedRefs = thinkerRefs.map((id) => thinkerById.get(id));
    const unresolvedRefs = thinkerRefs.filter((id, index) => !resolvedRefs[index]);
    if (unresolvedRefs.length) issues.unresolved_thinker_refs = unresolvedRefs;

    const canonicalDebateIds = debateActors.map(resolveThinker).filter(Boolean).map((t) => t.id);
    const missingCanonicalDebateRefs = canonicalDebateIds.filter((id) => !thinkerRefs.includes(id));
    const nonDebateRefs = thinkerRefs.filter((id) => !canonicalDebateIds.includes(id));
    if (missingCanonicalDebateRefs.length) issues.missing_canonical_debate_refs = missingCanonicalDebateRefs;
    if (nonDebateRefs.length) issues.non_debate_thinker_refs = nonDebateRefs;

    const decorativeRefs = resolvedRefs.filter(Boolean).filter((thinker) => !containsName(substantive, thinker.name)).map((thinker) => thinker.id);
    if (decorativeRefs.length) issues.decorative_thinker_refs = decorativeRefs;

    if (anchors.length < 2) issues.primary_anchor_count = anchors.length;
    if (new Set(anchors.map((anchor) => normalize(anchor.work))).size !== anchors.length) issues.duplicate_primary_anchors = true;
    if (JSON.stringify(primaryWorks) !== JSON.stringify(anchors.map((anchor) => anchor.work))) issues.primary_work_refs_mismatch = true;
    if (article.university_quality?.primary_work_count !== primaryWorks.length) issues.stale_primary_work_count = article.university_quality?.primary_work_count;

    const debateActorKeys = new Set(debateActors.map(normalize));
    for (const anchor of anchors) {
      if (!debateActorKeys.has(normalize(anchor.actor))) {
        (issues.anchor_actor_not_in_debate ??= []).push(anchor);
        continue;
      }
      if (!normalize(theory).includes(normalize(anchor.work)) || !containsName(theory, anchor.actor)) {
        (issues.ungrounded_primary_anchors ??= []).push(anchor);
      }
      const canonical = resolveThinker(anchor.actor);
      if (canonical) {
        if (anchor.canonical_ref !== canonical.id) (issues.bad_canonical_anchor_ref ??= []).push(anchor);
        if (!(canonical.works ?? []).some((work) => normalize(work) === normalize(anchor.work))) {
          (issues.canonical_actor_work_mismatch ??= []).push(anchor);
        }
      } else if (anchor.canonical_ref !== null) {
        (issues.noncanonical_actor_with_ref ??= []).push(anchor);
      }
    }

    if (Object.keys(issues).length) offenders.push({ id: article.id, title: article.title, debate_actors: debateActors, thinker_refs: thinkerRefs, primary_work_refs: primaryWorks, issues });
  }

  if (offenders.length) console.error(JSON.stringify({ schema: 'history_go_filosofi_source_integrity_audit_v3', article_count: articleFiles.length, offender_count: offenders.length, offenders }, null, 2));
  assert.equal(offenders.length, 0, `${offenders.length}/68 Philosophy articles fail debate-aligned source integrity`);
});
