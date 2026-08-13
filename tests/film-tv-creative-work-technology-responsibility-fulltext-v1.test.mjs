import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditFilmTvCreativeWorkTechnologyResponsibilityFulltextV1 } from '../scripts/audit-film-tv-creative-work-technology-responsibility-fulltext-v1.mjs';
import { buildFilmTvCreativeWorkTechnologyResponsibilityFulltextV1 } from '../scripts/materialize-film-tv-creative-work-technology-responsibility-fulltext-v1.mjs';

const versionAtLeast = (actual, minimum) => {
  const a = String(actual).split('.').map(Number), b = String(minimum).split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  }
  return true;
};

test('niende planenhet er komplett, claimsporet og registrert', () => {
  const report = auditFilmTvCreativeWorkTechnologyResponsibilityFulltextV1();
  assert.equal(report.summary.emne_count, 11);
  assert.equal(report.summary.module_count, 4);
  assert.equal(report.summary.section_count, 11);
  assert.equal(report.summary.paragraph_count, 48);
  assert.equal(report.summary.verified_claim_count, 48);
  assert.equal(report.summary.used_source_count, 29);
  assert.equal(report.summary.case_count, 23);
  assert.ok(report.summary.method_count > 0);
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('produksjonsansvar har separate evidensgrenser', () => {
  const report = auditFilmTvCreativeWorkTechnologyResponsibilityFulltextV1();
  for (const gate of ['consent_boundary','safety_boundary','accessibility_boundary','carbon_boundary','ai_effect_boundary','next_unit_scope']) {
    assert.equal(report.gates[gate], true);
  }
});

test('kildebriefen forblir et uendret historisk input mens sluttclaimene registreres separat', () => {
  const report = auditFilmTvCreativeWorkTechnologyResponsibilityFulltextV1();
  assert.equal(report.gates.immutable_source_brief, true);
  assert.equal(report.gates.forty_eight_verified_claims, true);
  assert.equal(report.gates.twenty_nine_sources_used, true);
});

test('rekonstruksjon senker aldri delt versjon eller dato', () => {
  const { registry, status } = buildFilmTvCreativeWorkTechnologyResponsibilityFulltextV1();
  assert.equal(versionAtLeast(registry.version, '2.91.0'), true);
  assert.equal(versionAtLeast(status.version, '1.84.0'), true);
  assert.ok(registry.updatedAt >= '2026-08-13');
  assert.ok(status.updatedAt >= '2026-08-13');
});

test('materializeren inneholder ingen SCM-synk eller GitHub-push', () => {
  const source = fs.readFileSync(new URL('../scripts/materialize-film-tv-creative-work-technology-responsibility-fulltext-v1.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
});
