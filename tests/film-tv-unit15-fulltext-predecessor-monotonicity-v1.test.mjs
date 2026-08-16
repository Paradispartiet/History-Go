import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const oldGate = 'cultural_heritage_canon_stars_memory_source_brief_complete_full_chapter_production';
const fullGate = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const scripts = ["scripts/audit-film-tv-industry-regulation-distribution-fulltext-v1.mjs", "scripts/brief-film-tv-industry-regulation-distribution-sources-v1.mjs", "scripts/materialize-film-tv-industry-regulation-distribution-fulltext-v1.mjs", "scripts/audit-film-tv-reception-participation-audience-methods-fulltext-v1.mjs", "scripts/brief-film-tv-reception-participation-audience-methods-sources-v1.mjs", "scripts/materialize-film-tv-reception-participation-audience-methods-fulltext-v1.mjs", "scripts/audit-film-tv-screen-places-identity-circulation-fulltext-v1.mjs", "scripts/brief-film-tv-screen-places-identity-circulation-sources-v1.mjs", "scripts/materialize-film-tv-screen-places-identity-circulation-fulltext-v1.mjs", "scripts/brief-film-tv-location-production-place-ethics-sources-v1.mjs", "scripts/materialize-film-tv-location-production-place-ethics-fulltext-v1.mjs", "scripts/audit-film-tv-archive-preservation-access-authenticity-fulltext-v1.mjs", "scripts/brief-film-tv-archive-preservation-access-authenticity-sources-v1.mjs", "scripts/materialize-film-tv-archive-preservation-access-authenticity-fulltext-v1.mjs"];
const patchedTests = ["tests/film-tv-industry-regulation-distribution-fulltext-v1.test.mjs", "tests/film-tv-reception-participation-audience-methods-fulltext-v1.test.mjs", "tests/film-tv-screen-places-identity-circulation-fulltext-v1.test.mjs", "tests/film-tv-archive-preservation-access-authenticity-fulltext-v1.test.mjs"];

test('Unit10-14 predecessor engines preserve Unit15 fulltext monotonically', () => {
  assert.equal(scripts.length, 14);
  for (const file of scripts) {
    const source = fs.readFileSync(file, 'utf8');
    assert.ok(source.includes(oldGate), `${file}: missing historical Unit15 source gate`);
    assert.ok(source.includes(fullGate), `${file}: missing Unit15 completion-audit gate`);
    const later = source.match(/const\s+laterGateAlreadyActive\s*=\s*\[([\s\S]*?)\]\s*\.includes\(\s*currentGate\s*\)\s*;/);
    if (later) assert.ok(later[1].includes('UNIT_FIFTEEN_COMPLETION_AUDIT_GATE'), `${file}: laterGateAlreadyActive regresses Unit15 fulltext`);
    assert.doesNotMatch(source, /\b[A-Za-z_$][\w$]*\.nextGate\s*===\s*UNIT_FIFTEEN_SOURCE_GATE\b/, `${file}: direct Unit15 source-gate equality would regress fulltext`);
  }
  for (const file of patchedTests) {
    const source = fs.readFileSync(file, 'utf8');
    assert.ok(source.includes(fullGate), `${file}: missing latest monotone nextGate expectation`);
  }
});
