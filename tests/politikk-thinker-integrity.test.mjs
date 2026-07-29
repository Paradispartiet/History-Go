import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPolitikkThinkerIntegrity } from '../scripts/audit-politikk-thinker-integrity.mjs';

test('Politikk kobler hver tenker-ID til riktig canonicalt visningsnavn', () => {
  const report = auditPolitikkThinkerIntegrity();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.registryCount, report.summary.usedThinkerCount);
  assert.ok(report.summary.verifiedPairCount > report.summary.usedThinkerCount);
  assert.equal(report.gates.everyDisplayNameMatchesId, true);
  assert.equal(report.gates.noRawIdAsDisplayName, true);
});
