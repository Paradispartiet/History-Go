import test from 'node:test';
import assert from 'node:assert/strict';
import { probeLitteraturTheoryIntegrity } from '../tools/probe-litteratur-theory-integrity.mjs';

test('Litteratur strict proof probe is read-only and covers all 28 canonical areas',()=>{
  const r=probeLitteraturTheoryIntegrity();
  assert.equal(r.status,'diagnostic_read_only');
  assert.equal(r.subject_id,'litteratur');
  assert.equal(r.rules.contentRewriteForbidden,true);
  assert.equal(r.rules.completionStatusReadOnly,true);
  assert.equal(r.rules.missingProofIsNotContentGap,true);
  assert.equal(r.summary.canonicalMajorFields,28);
  assert.equal(r.summary.expandedFullFieldAreas,18);
  assert.equal(r.summary.chapterOverviewAreas,10);
  assert.equal(r.areas.length,28);
  assert.ok(r.areas.every(a=>a.moduleCount===3));
  assert.ok(r.areas.every(a=>a.verifiedProseBoundClaims>=4));
});
