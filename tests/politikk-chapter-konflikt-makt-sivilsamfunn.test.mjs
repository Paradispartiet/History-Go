import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditPolitikkKonfliktMaktSivilsamfunnChapter,
  hasCompleteClaimTrace,
  hasRenderableWorkedExampleAnalysis
} from '../scripts/audit-politikk-chapter-konflikt-makt-sivilsamfunn.mjs';

test('claimspor krever minst én ikke-tom claim-ID per innholdselement', () => {
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['claim-2', 'claim-3']]), true);
  assert.equal(hasCompleteClaimTrace([['claim-1'], []]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['   ']]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], 'claim-2']), false);
});

test('arbeidseksempelanalysen må være en synlig liste med minst tre trinn', () => {
  assert.equal(hasRenderableWorkedExampleAnalysis([{ analysis: ['ett', 'to', 'tre'] }]), true);
  assert.equal(hasRenderableWorkedExampleAnalysis([{ analysis: 'ett, to, tre' }]), false);
  assert.equal(hasRenderableWorkedExampleAnalysis([{ analysis: ['ett', 'to'] }]), false);
  assert.equal(hasRenderableWorkedExampleAnalysis([{ analysis: ['ett', 'to', '   '] }]), false);
});

test('Konflikt, makt og sivilsamfunn oppfyller Fagverkets kapittelkontrakt', () => {
  const report = auditPolitikkKonfliktMaktSivilsamfunnChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 13);
  assert.equal(report.summary.methodCount, 17);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 49);
  assert.equal(report.summary.sourceCount, 34);
  assert.equal(report.summary.tracedClaimCount, 49);
  assert.equal(report.summary.relatedPlaceCount, 6);
  assert.equal(report.gates.renderableWorkedExampleAnalysis, true);
  assert.equal(report.gates.paragraphLevelClaimTrace, true);
  assert.equal(report.gates.registryAndRuntimeSynced, true);
  assert.equal(report.gates.honestEditorialStatus, true);
});


test('fire nye originalverk er kilde- og avsnittssporbare', async () => {
  const { readFileSync } = await import('node:fs');
  const root = new URL('../data/fagverk/politikk/konflikt-makt-sivilsamfunn/', import.meta.url);
  const read = name => JSON.parse(readFileSync(new URL(name, root), 'utf8'));
  const registry = read('claims.json');
  const modules = ['01-grunnlag.json', '02-fordypning.json', '03-anvendelse.json'].map(read);
  const traces = new Set(modules.flatMap(module => module.sections.flatMap(section => section.paragraphClaimIds.flat())));
  const readingSources = new Set(modules[2].sources.map(source => source.source_id));
  for (const [claimId, sourceId] of [
    ['konflikt-46', 's31-mccarthy-zald-1977'],
    ['konflikt-47', 's32-verba-schlozman-brady-1995'],
    ['konflikt-48', 's33-chenoweth-stephan-2011'],
    ['konflikt-49', 's34-htun-weldon-2012']
  ]) {
    const claim = registry.claims.find(value => value.id === claimId);
    const source = registry.sources.find(value => value.id === sourceId);
    assert.ok(claim && source, `Mangler claim eller kilde: ${claimId}/${sourceId}`);
    assert.ok(traces.has(claimId), `Påstand mangler avsnittssporing: ${claimId}`);
    assert.ok(claim.source_ids.includes(sourceId));
    assert.ok(readingSources.has(sourceId));
    assert.match(source.url, /^https:\/\//);
    assert.ok(source.source_location.length >= 50);
  }
});
