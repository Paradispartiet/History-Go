import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { preserveNewerFagverkMetadata } from '../scripts/lib/preserve-fagverk-metadata.mjs';

const MATERIALIZERS = [
  'psykisk-helse-institusjoner-behandling',
  'fagtradisjoner-teori',
  'utvikling-oppvekst-laring',
  'kognisjon-folelser-atferd',
  'sosialpsykologi-normalitet-stigma',
  'traume-krise-resiliens-omsorg'
].map((name) => `scripts/materialize-psykologi-${name}-phase4.mjs`);

test('Psykologi-materialisering kan ikke nedgradere delt Fagverk-metadata', () => {
  const newer = { version: '2.85.0', updatedAt: '2026-08-12' };
  preserveNewerFagverkMetadata(newer, '2.84.0', '2026-08-11');
  assert.deepEqual(newer, { version: '2.85.0', updatedAt: '2026-08-12' });

  const older = { version: '2.64.9', updatedAt: '2026-08-10' };
  preserveNewerFagverkMetadata(older, '2.65.0', '2026-08-11');
  assert.deepEqual(older, { version: '2.65.0', updatedAt: '2026-08-11' });

  for (const file of MATERIALIZERS) {
    const source = fs.readFileSync(file, 'utf8');
    assert.match(source, /preserveNewerFagverkMetadata/);
    assert.doesNotMatch(source, /(?:registry|status)\.(?:version|updatedAt)\s*=/);
  }
});
