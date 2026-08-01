import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const sources = [
  'js/dataHub.js',
  'js/leksikon/leksikon_loader.js'
];

function extractStatusRank(source) {
  const match = source.match(/function getLesesporStatusRank\(item\) \{[\s\S]*?\n  \}/);
  assert.ok(match, 'getLesesporStatusRank must remain inspectable');
  return match[0];
}

for (const path of sources) {
  test(`${path} ranks approved reading tracks ahead of candidates`, () => {
    const fnSource = extractStatusRank(fs.readFileSync(path, 'utf8'))
      .replace('function getLesesporStatusRank', 'function')
      .replace('const status = norm(item?.curation_status);', "const status = String(item?.curation_status || '').trim();");
    const rank = Function(`return (${fnSource});`)();

    assert.ok(rank({ curation_status: 'approved' }) < rank({ curation_status: 'strong_candidate' }));
    assert.ok(rank({ curation_status: 'strong_candidate' }) < rank({ curation_status: 'candidate_needs_review' }));
    assert.ok(rank({ curation_status: 'candidate' }) < rank({ curation_status: 'rejected' }));
  });
}
