import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS = path.join(ROOT, 'scripts');
// Predecessor audits are historical safeguards: once Unit15 exists, rebuilding them must preserve the later completion-audit gate rather than regress Film & TV state.
const OBSOLETE_GATE_FRAGMENT = '(?:source_brief_complete_full_chapter_production|full_chapter_complete_next_unit_source_brief)$';
const FINAL_GATE_FRAGMENT = 'full_chapter_complete_completion_audit';

function filmTvAuditFiles() {
  return fs.readdirSync(SCRIPTS)
    .filter((name) => name.endsWith('.mjs'))
    .filter((name) => name.startsWith('audit-film-tv-') || name.startsWith('audit-fagverk-film-tv-'))
    .sort();
}

test('Film & TV predecessor audits remain monotone through the Unit15 completion-audit gate', () => {
  const files = filmTvAuditFiles();
  assert.ok(files.length > 0, 'expected Film & TV audit scripts');

  const stale = [];
  let finalGateAware = 0;
  for (const name of files) {
    const source = fs.readFileSync(path.join(SCRIPTS, name), 'utf8');
    if (source.includes(OBSOLETE_GATE_FRAGMENT)) stale.push(name);
    if (source.includes(FINAL_GATE_FRAGMENT)) finalGateAware += 1;
  }

  assert.deepEqual(
    stale,
    [],
    `Film & TV audits still hard-code the pre-Unit15 two-gate production suffix: ${stale.join(', ')}`
  );
  assert.ok(finalGateAware >= 4, 'expected the canonical final gate to be explicit across predecessor audits');
});
