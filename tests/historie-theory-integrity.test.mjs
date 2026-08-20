import test from 'node:test';
import assert from 'node:assert/strict';
import { auditHistoryTheoryIntegrity } from '../tools/audit-historie-theory-integrity.mjs';

test('Historie strict theory integrity dekker 23 felt og 230 theory objects',()=>{const r=auditHistoryTheoryIntegrity();assert.equal(r.status,'STRICTLY_PROVEN');assert.equal(r.canonicalFieldCount,23);assert.equal(r.theoryCount,230);});
test('Historie theory evidence og actual fulltekst er universelt dekket',()=>{const r=auditHistoryTheoryIntegrity();assert.equal(r.universalCoverageCells,58);assert.equal(r.theoryEvidenceReadyCount,230);assert.equal(r.fulltextTheoryCount,230);assert.equal(r.theoryBoundSectionCount,230);});
test('Historie har akademisk historiografi per felt og ingen name-only theory trivia',()=>{const r=auditHistoryTheoryIntegrity();assert.equal(r.fieldScholarlyCount,23);assert.equal(r.antiTrivia,true);});
test('Historie named thinkers har konkrete verk og forskningsbidrag',()=>{const r=auditHistoryTheoryIntegrity();assert.ok(r.thinkerCount>=1);assert.equal(r.attributedThinkerCount,r.thinkerCount);});
