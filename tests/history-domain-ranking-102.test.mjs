import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const theories = readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json');
const evidence = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json');
const curriculum = readJson('data/fag/historie/historiepensum_canonical_v4_5.json');

const qualifying = new Set((evidence.entries || []).filter((e) => e.status === 'evidence_ready').map((e) => e.theory_id));
const byDomain = new Map();
for (const theory of theories) {
  for (const domainId of theory.explanatory_scope || []) {
    const row = byDomain.get(domainId) || { domain_id: domainId, theory_ids: [] };
    row.theory_ids.push(theory.theory_id);
    byDomain.set(domainId, row);
  }
}

const labelById = new Map();
function walk(value) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) { for (const x of value) walk(x); return; }
  const id = value.domain_id || value.id;
  const label = value.label || value.title || value.name;
  if (typeof id === 'string' && id.startsWith('his_') && typeof label === 'string') labelById.set(id, label);
  for (const v of Object.values(value)) walk(v);
}
walk(curriculum);

const ranking = [...byDomain.values()].map((row) => {
  const ids = [...new Set(row.theory_ids)];
  const qualified = ids.filter((id) => qualifying.has(id));
  const missing = ids.filter((id) => !qualifying.has(id));
  return {
    domain_id: row.domain_id,
    label: labelById.get(row.domain_id) || null,
    qualified: qualified.length,
    total: ids.length,
    missing_count: missing.length,
    qualified_theory_ids: qualified,
    missing_theory_ids: missing
  };
}).sort((a, b) => {
  const aComplete = a.missing_count === 0 ? 1 : 0;
  const bComplete = b.missing_count === 0 ? 1 : 0;
  return aComplete - bComplete || b.qualified - a.qualified || a.domain_id.localeCompare(b.domain_id);
});

console.log('HISTORY_DOMAIN_RANKING_102_START');
console.log(JSON.stringify({ qualifying_total: qualifying.size, domain_count: ranking.length, ranking }, null, 2));
console.log('HISTORY_DOMAIN_RANKING_102_END');

test('current History domain ranking is internally consistent', () => {
  assert.equal(qualifying.size, 102);
  assert.equal(theories.length, 230);
  assert.equal(ranking.length, 23);
  for (const row of ranking) assert.equal(row.total, 10, `${row.domain_id} must contain 10 theory objects`);
});
