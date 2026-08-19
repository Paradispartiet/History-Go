#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const arr = (v) => Array.isArray(v) ? v : [];
const norm = (v) => String(v || '').toLocaleLowerCase('nb').replace(/\s+/g, ' ').trim();
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

const P = {
  fagkart: 'data/fag/filosofi/fagkart_filosofi_canonical_v1.json',
  emner: 'data/fag/filosofi/emner_filosofi_canonical_v1.json',
  thinkers: 'data/fag/filosofi/teoretikere_filosofi_canonical_v2.json',
  articleRegistry: 'data/fagverk/filosofi/filosofi_article_registry_v1.json',
  sourceRegistry: 'data/fagverk/filosofi/filosofi_sources_v1.json'
};

function sectionProse(article, id) {
  return arr(article.sections).find((section) => section.id === id)?.paragraphs?.join(' ') || '';
}

export function auditFilosofiTheoryIntegrity() {
  const fagkart = json(P.fagkart);
  const emner = json(P.emner);
  const thinkersDoc = json(P.thinkers);
  const articleRegistry = json(P.articleRegistry);
  const sourceRegistry = json(P.sourceRegistry);
  const thinkerById = new Map(arr(thinkersDoc.thinkers).map((thinker) => [thinker.id, thinker]));
  const sourceById = new Map(arr(sourceRegistry.sources).map((source) => [source.id, source]));
  const emneById = new Map(arr(emner).map((emne) => [emne.emne_id, emne]));
  const articleById = new Map(arr(articleRegistry.articles).map((row) => [row.id || row.emne_id, json(row.file)]));
  const hookById = new Map();
  for (const category of arr(fagkart.categories)) {
    for (const hook of arr(category.topic_hooks)) {
      assert(hook.id && !hookById.has(hook.id), `Duplikat Philosophy theory hook: ${hook.id}`);
      hookById.set(hook.id, { ...hook, category_id: category.id });
    }
  }

  const fields = [];
  const coveredEmner = new Set();
  const usedThinkers = new Set();
  const usedWorks = new Set();

  assert(fagkart.subject_id === 'filosofi', 'Ugyldig Philosophy fagkart');
  assert(arr(fagkart.categories).length > 0, 'Philosophy mangler canonicale hovedfelt');
  assert(articleById.size === emneById.size, `Philosophy article/emne mismatch: ${articleById.size}/${emneById.size}`);

  for (const category of arr(fagkart.categories)) {
    const fieldEmner = arr(category.emne_ids);
    assert(fieldEmner.length > 0, `Philosophy hovedfelt mangler emner: ${category.id}`);
    const fieldHooks = new Set(arr(category.topic_hooks).map((hook) => hook.id));
    const fieldEvidence = [];

    for (const emneId of fieldEmner) {
      const emne = emneById.get(emneId);
      const article = articleById.get(emneId);
      assert(emne, `Philosophy hovedfelt peker til ukjent emne: ${category.id}/${emneId}`);
      assert(article, `Philosophy emne mangler artikkel: ${emneId}`);
      assert(article.domain_id === category.id, `Philosophy artikkel har feil hovedfelt: ${emneId}/${article.domain_id}/${category.id}`);
      assert(article.editorial_quality === 'university_depth_reviewed', `Philosophy artikkel er ikke university-depth reviewed: ${emneId}`);
      assert(article.quality?.review_state === 'university_depth_reviewed' && article.quality?.reviewed_against_university_gate === true, `Philosophy artikkel mangler reconcilet review-state: ${emneId}`);

      const hookIds = arr(article.theory_hook_ids);
      assert(hookIds.length > 0, `Philosophy artikkel mangler theory hook: ${emneId}`);
      assert(hookIds.every((id) => hookById.has(id)), `Philosophy artikkel peker til ukjent theory hook: ${emneId}`);
      assert(hookIds.some((id) => fieldHooks.has(id)), `Philosophy artikkel mangler theory hook fra eget hovedfelt: ${emneId}`);

      const thinkerIds = arr(article.thinker_refs);
      const works = arr(article.primary_work_refs);
      assert(thinkerIds.length > 0, `Philosophy artikkel mangler teoretiker-/forskerprovenance: ${emneId}`);
      assert(works.length > 0, `Philosophy artikkel mangler primærverk: ${emneId}`);
      for (const id of thinkerIds) {
        const thinker = thinkerById.get(id);
        assert(thinker, `Philosophy artikkel peker til ukjent teoretiker: ${emneId}/${id}`);
        assert(arr(thinker.works).length > 0, `Philosophy teoretiker mangler verk: ${id}`);
        usedThinkers.add(id);
      }
      works.forEach((work) => usedWorks.add(work));

      const sourceIds = arr(article.source_ids);
      assert(sourceIds.length > 0 && sourceIds.every((id) => sourceById.has(id)), `Philosophy artikkel mangler gyldig scholarly source: ${emneId}`);
      const claims = arr(article.claims);
      assert(claims.length > 0, `Philosophy artikkel mangler claims: ${emneId}`);
      assert(claims.some((claim) => claim.type === 'rival_position'), `Philosophy artikkel mangler rival position: ${emneId}`);
      assert(claims.every((claim) => arr(claim.source_ids).length > 0 && arr(claim.source_ids).every((id) => sourceById.has(id))), `Philosophy claim mangler scholarly source: ${emneId}`);

      const theoryProse = norm(sectionProse(article, 'teorihistorie'));
      const disagreementProse = norm(sectionProse(article, 'uenighet'));
      assert(theoryProse.length > 0, `Philosophy artikkel mangler teorihistorie i prosa: ${emneId}`);
      assert(disagreementProse.length > 0, `Philosophy artikkel mangler rival-/uenighetsprosa: ${emneId}`);
      assert(works.some((work) => theoryProse.includes(norm(work))), `Philosophy primærverk er bare metadata: ${emneId}`);
      const thinkerNames = thinkerIds.map((id) => thinkerById.get(id)?.name).filter(Boolean);
      assert(thinkerNames.some((name) => theoryProse.includes(norm(name))), `Philosophy teoretiker er ikke brukt i teoriproasa: ${emneId}`);

      for (const hookId of hookIds) {
        const hook = hookById.get(hookId);
        assert(hook.generator_constraints?.avoid_name_guessing === true, `Philosophy theory hook blokkerer ikke navnetrivia: ${hookId}`);
        for (const thinker of arr(hook.canon?.thinkers)) {
          assert(thinker.id && thinkerById.has(thinker.id), `Philosophy hook peker til ukjent teoretiker: ${hookId}`);
          assert(arr(thinker.works).length > 0, `Philosophy hook-teoretiker mangler verk: ${hookId}/${thinker.id}`);
        }
      }

      coveredEmner.add(emneId);
      fieldEvidence.push({
        emneId,
        theoryHookIds: hookIds,
        thinkerRefs: thinkerIds,
        primaryWorkRefs: works,
        sourceIds,
        rivalClaimIds: claims.filter((claim) => claim.type === 'rival_position').map((claim) => claim.id),
        proseSections: ['teorihistorie','uenighet']
      });
    }

    fields.push({
      id: category.id,
      status: 'green',
      emneCount: fieldEmners.length,
      theoryHookCount: fieldHooks.size,
      evidence: fieldEvidence
    });
  }

  assert(coveredEmner.size === emneById.size, `Philosophy theory integrity dekker ikke alle emner: ${coveredEmner.size}/${emneById.size}`);
  assert(fields.every((field) => field.status === 'green'), 'Philosophy har ikke-grønt hovedfelt');

  return {
    status: 'strong_field_theory_integrity',
    fieldCount: fields.length,
    canonicalEmneCount: emneById.size,
    coveredEmneCount: coveredEmner.size,
    uniqueThinkerCount: usedThinkers.size,
    uniquePrimaryWorkCount: usedWorks.size,
    fields
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = auditFilosofiTheoryIntegrity();
    console.log(JSON.stringify({
      status: result.status,
      fieldCount: result.fieldCount,
      canonicalEmneCount: result.canonicalEmneCount,
      coveredEmneCount: result.coveredEmneCount,
      uniqueThinkerCount: result.uniqueThinkerCount,
      uniquePrimaryWorkCount: result.uniquePrimaryWorkCount,
      fields: result.fields.map((field) => ({ id: field.id, status: field.status, emneCount: field.emneCount, theoryHookCount: field.theoryHookCount }))
    }, null, 2));
  } catch (error) {
    console.error(`Fagverk Filosofi theory integrity FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
