import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const CHAPTER = 'data/fagverk/sport/inkludering-helse-lek-samfunn.json';

function audit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-sport-legacy-theory.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Sport-legacygapet ekskludering materialiseres i eksisterende canonicalt inkluderingskapittel', () => {
  const chapter = JSON.parse(fs.readFileSync(CHAPTER, 'utf8'));
  const text = JSON.stringify(chapter).toLocaleLowerCase('nb-NO');

  assert.equal(chapter.subject, 'sport');
  assert.equal(chapter.id, 'inkludering-helse-lek-samfunn');
  assert.equal(chapter.emne_ids.length, 19);
  assert.equal(chapter.method_ids.length, 20);
  assert.match(text, /ekskludering/);
  assert.match(text, /inkludering/);
  assert.match(text, /deltakelse|delta/);
  assert.match(text, /barriere/);
  assert.match(text, /frafall/);
});

test('Sport raw legacy-audit går fra 9/10 til 10/10 uten å åpne redirect', () => {
  const report = audit();
  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.equal(report.summary.anchorCompleteCount, 10);
  assert.equal(report.summary.manualReviewCount, 0);
  assert.deepEqual(report.summary.manualReview, []);
  assert.equal(report.summary.redirectReady, false);

  const social = report.rows.find((row) => row.id === 'sosial');
  assert.ok(social);
  assert.equal(social.anchorCoverage, 1);
  assert.equal(social.foundCount, social.anchorCount);
  assert.deepEqual(social.missingAnchors, []);
});
