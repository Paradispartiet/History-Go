#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const fixtureRel = 'data/Civication/narratives/leisure/__scenehenger_badge_scope_probe.json';
const fixturePath = path.join(ROOT, fixtureRel);
const auditRel = 'data/Civication/lifePositionRoleWorldReadiness.json';
const reportRel = 'reports/civication-life-position-role-world-readiness.md';
const auditPath = path.join(ROOT, auditRel);
const reportPath = path.join(ROOT, reportRel);
const script = path.join(ROOT, 'scripts/audit-civication-life-position-role-world-readiness.mjs');

const originalAudit = fs.readFileSync(auditPath, 'utf8');
const originalReport = fs.readFileSync(reportPath, 'utf8');

const fixture = {
  schema: 'civication_narrative_stream_v1',
  id: 'scenehenger_badge_scope_probe',
  type: 'leisure',
  title: 'Scenehenger badge-scope probe',
  sociological_theme: 'scenehenger_badge_scope_probe',
  applies_when: {
    any_tags: ['musikk:scenehenger']
  },
  storylets: Array.from({ length: 4 }, (_, index) => ({
    id: 'probe_' + (index + 1),
    situation: ['Badge-scope probe only.']
  }))
};

try {
  fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + '\n');
  execFileSync(process.execPath, [script, '--write'], {
    cwd: ROOT,
    stdio: 'pipe'
  });

  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  const music = audit.positions.find((row) => row.key === 'musikk/scenehenger');
  const stage = audit.positions.find((row) => row.key === 'scenekunst/scenehenger');

  assert.ok(music, 'musikk/scenehenger missing from audit');
  assert.ok(stage, 'scenekunst/scenehenger missing from audit');

  assert.equal(music.classification, 'ready');
  assert.equal(music.authored_depth.max_narrative_depth, 4);
  assert.ok(music.evidence.exact_source_refs.includes(fixtureRel));

  assert.equal(stage.classification, 'needs_authored_depth');
  assert.equal(stage.authored_depth.max_narrative_depth, 0);
  assert.ok(!stage.evidence.exact_source_refs.includes(fixtureRel));

  assert.equal(
    audit.semantics.duplicate_life_position_ids_or_labels_require_badge_scoped_governed_binding,
    true
  );

  console.log('civication life-position readiness badge scope ok: musikk/scenehenger isolated from scenekunst/scenehenger');
} finally {
  if (fs.existsSync(fixturePath)) fs.unlinkSync(fixturePath);
  fs.writeFileSync(auditPath, originalAudit);
  fs.writeFileSync(reportPath, originalReport);
}
