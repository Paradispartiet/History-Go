import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const SCRIPT = new URL('../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs', import.meta.url);

test('advanced theory maintenance materializer exists and groups work by canonical primary domain', async () => {
  assert.equal(fs.existsSync(SCRIPT), true, 'advanced theory maintenance materializer must exist');
  const { buildOverlays } = await import(SCRIPT.href);
  const canon = {
    works: [
      { id: 'w1', author: 'A', title: 'T1', first_published: 2001, source_url: 'https://example.com/1', source_type: 'primary', theory_units: [
        { id: 't1', name: 'N1', summary: 'S1', analytic_question: 'Q1?', misuse_guardrail: 'G1' },
        { id: 't2', name: 'N2', summary: 'S2', analytic_question: 'Q2?', misuse_guardrail: 'G2' },
        { id: 't3', name: 'N3', summary: 'S3', analytic_question: 'Q3?', misuse_guardrail: 'G3' }
      ]},
      { id: 'w2', author: 'B', title: 'T2', first_published: 2002, source_url: 'https://example.com/2', source_type: 'primary', theory_units: [
        { id: 't4', name: 'N4', summary: 'S4', analytic_question: 'Q4?', misuse_guardrail: 'G4' },
        { id: 't5', name: 'N5', summary: 'S5', analytic_question: 'Q5?', misuse_guardrail: 'G5' },
        { id: 't6', name: 'N6', summary: 'S6', analytic_question: 'Q6?', misuse_guardrail: 'G6' }
      ]}
    ]
  };
  const contract = {
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    work_refreshes: [
      { work_id: 'w1', primary_domain_id: 'd1', theory_unit_ids: ['t1','t2','t3'] },
      { work_id: 'w2', primary_domain_id: 'd2', theory_unit_ids: ['t4','t5','t6'] }
    ]
  };
  const overlays = buildOverlays(canon, contract);
  assert.equal(overlays.length, 2);
  assert.deepEqual(overlays.map((row) => row.domain_id), ['d1','d2']);
  assert.equal(overlays.flatMap((row) => row.works).length, 2);
  assert.equal(overlays.flatMap((row) => row.works.flatMap((work) => work.theory_units)).length, 6);
  assert.equal(overlays[0].works[0].theory_units[0].summary, 'S1');
  assert.equal(overlays[0].works[0].theory_units[0].analytic_question, 'Q1?');
  assert.equal(overlays[0].works[0].theory_units[0].misuse_guardrail, 'G1');
});
