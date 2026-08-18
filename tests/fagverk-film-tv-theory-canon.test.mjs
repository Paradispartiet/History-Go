import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvTheoryCanon } from '../scripts/audit-fagverk-film-tv-theory-canon.mjs';

test('Film & TV theory canon dekker 10 domener og bevarer 192 emner',()=>{const r=auditFilmTvTheoryCanon();assert.equal(r.status,'strong_theory_canon');assert.equal(r.domainCount,10);assert.equal(r.canonicalEmneCount,192);assert.equal(r.theoryObjectCount,20);});
test('Film & TV theory canon har akademisk teori-, forsker- og verkbredde',()=>{const r=auditFilmTvTheoryCanon();assert.ok(r.scholarlySourceCount>=20);assert.ok(r.uniquePeopleCount>=25);assert.ok(r.uniqueWorkCount>=20);});
