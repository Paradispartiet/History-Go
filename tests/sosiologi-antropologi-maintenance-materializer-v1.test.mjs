import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const SCRIPT = new URL('../scripts/materialize-sosiologi-antropologi-maintenance-v1.mjs', import.meta.url);

test('sosiologi maintenance materializer preserves strict completion before advanced theory refresh', async () => {
  assert.equal(fs.existsSync(SCRIPT), true, 'sosiologi maintenance materializer must exist');
  const { MATERIALIZER_CHAIN } = await import(SCRIPT.href);
  assert.deepEqual(MATERIALIZER_CHAIN, [
    'materialize-sosiologi-antropologi-applied-public-ethics-decolonization-fulltext-v1.mjs',
    'materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs'
  ]);
});
