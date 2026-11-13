import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const intake = JSON.parse(read('data/badges/vitenskap_v7_candidate_intake_20261113.json'));
const active = JSON.parse(read('data/badges/vitenskap.json'));

test('v7 records exactly three real high-resolution non-active candidates awaiting binary transfer', () => {
  assert.equal(intake.categoryId,'vitenskap');
  assert.equal(intake.version,'v7');
  assert.equal(intake.status,'three_candidate_previews_created_outside_repo_binary_transfer_pending');
  assert.equal(intake.activation,'not_approved_not_active');
  assert.equal(intake.doNotChangeActiveRegistry,true);
  assert.equal(intake.requiredFooter,'VITENSKAP & TEKNOLOGI');
  assert.equal(intake.expected.length,3);
  assert.deepEqual(new Set(intake.expected.map(x=>x.id)),new Set([
    'teknologi_og_ingeniorfag',
    'data_programvare_og_algoritmer',
    'nettverk_og_digital_infrastruktur'
  ]));
  for (const item of intake.expected) {
    assert.equal(item.file,item.id+'-v7-brodert-kandidat.webp');
    assert.ok(/^[a-f0-9]{64}$/.test(item.sha256));
    assert.ok(/^[a-f0-9]{40}$/.test(item.gitBlobSha));
    assert.ok(item.bytes>100000);
    assert.ok(!Object.values(active.subBadgeImages).some(x=>x.includes('v7')));
  }
  assert.equal(Object.keys(active.subBadgeImages).length,16);
});

test('safe importer validates exact bytes and does not target approved art', () => {
  const script=read('scripts/import-vitenskap-v7-candidates.py');
  assert.match(script,/digest\(data\) == expected/);
  assert.match(script,/im\.mode == "RGBA"/);
  assert.match(script,/im\.size == \(1024, 1024\)/);
  assert.match(script,/refusing|Refusing/);
  assert.match(script,/original_catalog_bytes/);
  assert.match(script,/activationRequiresSeparatePR/);
  assert.ok(!script.includes('data/badges/vitenskap.json", "w"'));
});
