import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditPolitikkInternasjonalPolitikkChapter,
  hasCompleteClaimTrace
} from '../scripts/audit-politikk-chapter-internasjonal-politikk-sikkerhet-samarbeid.mjs';

test('claimspor krever minst én ikke-tom claim-ID per innholdselement', () => {
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['claim-2', 'claim-3']]), true);
  assert.equal(hasCompleteClaimTrace([['claim-1'], []]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['   ']]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], 'claim-2']), false);
});

test('Internasjonal politikk, sikkerhet og samarbeid oppfyller Fagverkets kapittelkontrakt', () => {
  const report = auditPolitikkInternasjonalPolitikkChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 5);
  assert.equal(report.summary.methodCount, 4);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 34);
  assert.equal(report.summary.claimCount, 41);
  assert.equal(report.summary.sourceCount, 26);
  assert.equal(report.summary.tracedClaimCount, 41);
  assert.equal(report.gates.paragraphLevelClaimTrace, true);
  assert.equal(report.gates.registryAndRuntimeSynced, true);
  assert.equal(report.gates.honestEditorialStatus, true);
});

test('nye primærkilder er knyttet til egne claim-spor', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, resolve } = await import('node:path');
  const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../data/fagverk/politikk/internasjonal-politikk-sikkerhet-samarbeid');
  const claims = JSON.parse(await readFile(resolve(dir, 'claims.json'), 'utf8'));
  const modules = await Promise.all(['01-grunnlag', '02-fordypning', '03-anvendelse'].map(async name => JSON.parse(await readFile(resolve(dir, `${name}.json`), 'utf8'))));
  for (const [number, source] of [[38,'schelling_arms_influence_1966'],[39,'barnett_finnemore_io_1999'],[40,'walter_civil_war_1997'],[41,'fortna_peacekeeping_2004']]) {
    const id = `claim_${String(number).padStart(3, '0')}`; const claim = claims.claims.find(c => c.id === id);
    assert.ok(claim, `Missing ${id}`); assert.deepEqual(claim.source_ids, [source]);
    assert.ok(claims.sources.some(s => s.id === source && s.url.startsWith('https://')));
    assert.ok(modules.some(m => m.sections.some(s => s.paragraphClaimIds.some(ids => ids.includes(id)))));
  }
});
