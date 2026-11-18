import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = (file) => readFileSync(path.join(root, '.github/workflows', file), 'utf8');
const readyEvent = /types: \[opened, synchronize, reopened, ready_for_review, converted_to_draft\]/;
const finalGate = /if: github\.event_name != 'pull_request' \|\| github\.event\.pull_request\.draft == false/;

test('full Civication regression is postponed on draft, but still runs when ready', () => {
  const c = workflow('civication.yml');
  assert.match(c, readyEvent);
  assert.match(c, /draft-focused:/);
  assert.match(c, /Civication focused draft validation/);
  assert.match(c, /node scripts\/audit-civication-career-gameplay\.mjs --check/);
  assert.match(c, /node scripts\/audit-civication-role-world-rollout-readiness\.mjs --check/);
  assert.match(c, /node tests\/civication-active-position-recovery-clear\.test\.js/);
  assert.match(c, /regression:\s*\n\s*needs: scope\s*\n\s*if: needs\.scope\.outputs\.regression == 'true' && \(github\.event_name != 'pull_request' \|\| github\.event\.pull_request\.draft == false\)/);
  assert.match(c, /workflow_dispatch:/);
  assert.match(c, /schedule:/);
});

for (const file of ['civication-renholder-lifestory-browser.yml', 'civication-browser-smoke.yml']) {
  test(`${file}: heavy browser job is gated until ready, manual runs remain available`, () => {
    const source = workflow(file);
    assert.match(source, readyEvent);
    assert.match(source, finalGate);
    assert.match(source, /workflow_dispatch:/);
    assert.match(source, /cancel-in-progress: true/);
  });
}

test('Civication routes draft-gate tests and explicitly invokes their contract', () => {
  const c = workflow('civication.yml');
  assert.match(c, /'tests\/ci-civication-draft-gates\.test\.mjs'/);
  assert.match(c, /node --test tests\/ci-civication-scope\.test\.mjs tests\/ci-civication-draft-gates\.test\.mjs/);
});
