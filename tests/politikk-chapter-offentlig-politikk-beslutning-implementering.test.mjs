import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { auditPolitikkOffentligPolitikkChapter } from '../scripts/audit-politikk-chapter-offentlig-politikk-beslutning-implementering.mjs';

test('Offentlig politikk, beslutning og implementering oppfyller Fagverkets kapittelkontrakt', () => {
  const report = auditPolitikkOffentligPolitikkChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 5);
  assert.equal(report.summary.methodCount, 5);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 37);
  assert.equal(report.summary.sourceCount, 25);
  assert.equal(report.summary.tracedClaimCount, 37);
  assert.equal(report.gates.paragraphLevelClaimTrace, true);
  assert.equal(report.gates.registryAndRuntimeSynced, true);
  assert.equal(report.gates.honestEditorialStatus, true);
});

test('fire policy-klassikere er kildeført og knyttet til den faktiske kapittelteksten', () => {
  const root = new URL('../data/fagverk/politikk/offentlig-politikk-beslutning-implementering/', import.meta.url);
  const read = name => JSON.parse(readFileSync(new URL(name, root), 'utf8'));
  const claims = read('claims.json');
  const modules = ['01-grunnlag.json', '02-fordypning.json', '03-anvendelse.json'].map(read);
  const referenced = new Set(modules.flatMap(module => module.sections.flatMap(section => section.paragraphClaimIds.flat())));
  for (const [claimId, sourceId] of [
    ['claim_034', 'kingdon_1984'],
    ['claim_035', 'pressman_wildavsky_1973'],
    ['claim_036', 'sabatier_1986'],
    ['claim_037', 'hall_1993']
  ]) {
    const claim = claims.claims.find(value => value.id === claimId);
    const source = claims.sources.find(value => value.id === sourceId);
    assert.ok(claim && source, `Mangler påstand eller originalkilde: ${claimId}/${sourceId}`);
    assert.ok(referenced.has(claimId), `Ny påstand uten avsnittssporing: ${claimId}`);
    assert.ok(claim.source_ids.includes(sourceId));
    assert.match(source.url, /^https:\/\//);
    assert.ok(source.source_location.length >= 40);
  }
});
