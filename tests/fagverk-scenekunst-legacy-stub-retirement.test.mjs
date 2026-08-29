import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const SCRIPT = 'scripts/audit-fagverk-scenekunst-legacy-stub.mjs';
const ARCHIVE = 'data/fag/scenekunst/archive/merke_scenekunst_legacy_20260829.html';
const COMPATIBILITY = 'data/fag/scenekunst/merke_scenekunst.html';
const TARGET = 'fagverk.html?subject=scenekunst#fagverkIaProgresjon';

function audit() {
  const result = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Scenekunst-stubben har ingen unik kunnskap eller runtime som må migreres', () => {
  const report = audit();
  assert.equal(report.subject, 'scenekunst');
  assert.equal(report.legacy.noIndependentRuntime, true);
  assert.equal(report.summary.uniqueKnowledgeMigrationRequired, false);
  assert.equal(report.summary.uniqueRuntimeMigrationRequired, false);
  assert.deepEqual(report.canonical.missingDescriptiveAnchors, []);
  assert.deepEqual(report.navigation.unknownArchiveLinks, []);
  assert.equal(report.summary.redirectReady, true);
});

test('Scenekunst-stubbens faglige ord er allerede canonicalt eid', () => {
  const report = audit();
  const found = report.canonical.descriptiveAnchors.map((row) => row.found);
  for (const expected of ['teater', 'dans', 'scenografi', 'dramaturgi']) assert.ok(found.includes(expected), `Mangler canonical dekning for ${expected}`);
  assert.ok(found.some((value) => ['musikal', 'musikkteater'].includes(value)));
  assert.ok(found.some((value) => ['standup', 'stand up'].includes(value)));
  assert.ok(found.some((value) => ['improvisasjon', 'impro'].includes(value)));
  assert.ok(found.some((value) => ['regi', 'regissør'].includes(value)));
});

test('Scenekunst compatibility-ruten kan ikke bli faglig innhold igjen og original stub er arkivert', () => {
  const report = audit();
  assert.equal(report.navigation.target, TARGET);
  assert.equal(report.navigation.portalRoute, TARGET);
  assert.equal(report.navigation.portalRedirected, true);
  assert.equal(report.navigation.compatibilityRedirectPresent, true);

  assert.ok(fs.existsSync(ARCHIVE));
  const compatibility = fs.readFileSync(COMPATIBILITY, 'utf8');
  const archive = fs.readFileSync(ARCHIVE, 'utf8');
  assert.match(compatibility, /location\.replace/);
  assert.doesNotMatch(compatibility, /Teater, dans, musikal, revy|scenografi, regi, dramaturgi/);
  assert.match(archive, /Teater, dans, musikal, revy, standup, improvisasjon, scenografi, regi, dramaturgi og levende fremføring/);
});
