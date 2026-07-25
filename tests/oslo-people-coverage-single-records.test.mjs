import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

test('Oslo People audit materializes single-record person files before places arrays', () => {
  execFileSync(process.execPath, ['--experimental-strip-types', 'tools/audit-oslo-people-coverage.mts'], { stdio: 'pipe' });
  const report = JSON.parse(fs.readFileSync('reports/oslo-people-coverage.json', 'utf8'));
  const covered = new Map(report.coveredRequired.map((row) => [row.placeId, row]));
  const ids = (placeId) => new Set((covered.get(placeId)?.people ?? []).map((person) => person.id));
  assert.ok(ids('latter').has('elina_krantz'));
  assert.ok(ids('bla_skilt_aud_schonemann_vetlandsveien_69d').has('aud_schonemann'));
  assert.ok(ids('chateau_neuf').has('harald_eia'));
  assert.equal(report.totals.invalidPeopleRefs, 0);
});
