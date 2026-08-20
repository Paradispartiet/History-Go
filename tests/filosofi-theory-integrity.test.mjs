import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilosofiTheoryIntegrity } from '../tools/audit-filosofi-theory-integrity.mjs';

test('Filosofi strict-proves alle 22 canonicale major fields',()=>{
  const report=auditFilosofiTheoryIntegrity();
  assert.equal(report.status,'STRICTLY_PROVEN');
  assert.equal(report.summary.canonicalMajorFields,22);
  assert.equal(report.summary.fieldsStrictlyProven,22);
  assert.equal(report.summary.canonicalDomains,20);
  assert.ok(report.fields.every(field=>field.strictlyProven));
});

test('den universelle porten kontrollerer 68/68 artikler og hele registrerte baselinen',()=>{
  const report=auditFilosofiTheoryIntegrity();
  assert.equal(report.summary.canonicalArticles,68);
  assert.equal(report.summary.articlesStrictlyProven,68);
  assert.equal(report.summary.canonicalChapters,20);
  assert.equal(report.summary.canonicalConcepts,204);
  assert.equal(report.summary.canonicalMethods,34);
  assert.equal(report.summary.canonicalHooks,51);
  assert.equal(report.universalArticleGate.articles.length,68);
  assert.ok(report.universalArticleGate.articles.every(article=>article.strictlyProven));
});

test('strict proof er claim-, kilde-, fulltekst- og person→verk-bundet',()=>{
  const report=auditFilosofiTheoryIntegrity();
  assert.equal(report.summary.claims,428);
  assert.equal(report.summary.exactProseBoundClaims,396);
  assert.equal(report.summary.claimSourceBindings,1317);
  assert.equal(report.summary.scholarlySourceRecords,110);
  assert.equal(report.summary.usedScholarlySources,109);
  assert.equal(report.summary.personWorkAnchors,174);
  assert.ok(report.universalArticleGate.articles.every(article=>article.exactProseBoundClaims>=5));
  assert.ok(report.universalArticleGate.articles.every(article=>article.scholarlySources>=3));
  assert.ok(report.universalArticleGate.articles.every(article=>article.personWorkAnchors>=2));
});

test('proof-reconciliation omskriver ikke Filosofi-corpuset eller completion-status',()=>{
  const report=auditFilosofiTheoryIntegrity();
  assert.equal(report.completion_status_read_only,true);
  assert.equal(report.content_rewrite_required,false);
  assert.equal(report.summary.substantiveContentGapsProven,0);
});
