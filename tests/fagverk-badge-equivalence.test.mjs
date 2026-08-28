import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const portal = JSON.parse(fs.readFileSync('data/fagverk/fagverk_portal.json', 'utf8'));
const html = fs.readFileSync('fagverk.html', 'utf8');
const badgeUi = fs.readFileSync('js/fagverk-ia-v3-badge-progress.js', 'utf8');
const fallback = fs.readFileSync('js/merke-fallback.js', 'utf8');
const portalUi = fs.readFileSync('js/fagverk-forside.js', 'utf8');

function runAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-badge-equivalence.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('badge equivalence audit klassifiserer alle canonicale fag uten ukjent familie', () => {
  const audit = runAudit();
  assert.equal(audit.rows.length, audit.canonicalSubjectCount);
  assert.ok(audit.counts.progress_route >= 2);
  assert.ok(audit.counts.rich_runtime >= 1);
  assert.ok(audit.counts.legacy_static_theory >= 1);
  assert.ok(audit.counts.legacy_stub >= 1);
  assert.equal(audit.rows.some((row) => ['unknown', 'missing'].includes(row.family)), false);
});

test('bare den sikre generic-fallbackfamilien er migrert i denne batchen', () => {
  const byId = new Map(portal.categories.map((item) => [item.id, item]));
  assert.equal(byId.get('helse').badgePage, 'fagverk.html?subject=helse#fagverkIaProgresjon');
  assert.equal(byId.get('utdanning').badgePage, 'fagverk.html?subject=utdanning#fagverkIaProgresjon');
  assert.equal(portal.categories.some((item) => String(item.badgePage).startsWith('merke.html?badge=')), false);
  assert.equal(byId.get('politikk').badgePage, 'data/fag/politikk/merke_politikk.html');
  assert.equal(byId.get('by').badgePage, 'data/fag/by/merke_by.html');
});

test('Fagverk Progresjon overtar generic merkesides badgeidentitet, nivåstige og undermerker', () => {
  assert.match(html, /href="css\/fagverk-ia-v3-badge-progress\.css"/);
  assert.match(html, /src="js\/fagverk-ia-v3\.js"[\s\S]*src="js\/fagverk-ia-v3-badge-progress\.js"/);
  assert.match(badgeUi, /data\/badges\/\$\{encodeURIComponent\(model\.subject\.id\)\}\.json/);
  assert.match(badgeUi, /badge\?\.description/);
  assert.match(badgeUi, /badge\?\.tiers/);
  assert.match(badgeUi, /badge\?\.sub/);
  assert.match(badgeUi, /place\?\.source/);
  assert.match(badgeUi, /progress\.visited\?\.has/);
  assert.match(badgeUi, /Nivåstige/);
  assert.match(badgeUi, /Undermerker/);
  assert.doesNotMatch(badgeUi, /localStorage\.setItem|sessionStorage\.setItem|indexedDB/);
});

test('den gamle generiske merke-URL-en er compatibility-redirect, ikke en ny produktflate', () => {
  assert.match(fallback, /global\.location\.replace\(target\)/);
  assert.match(fallback, /#fagverkIaProgresjon/);
  assert.match(fallback, /subjectStatus\)!=='materialized'/);
  assert.doesNotMatch(fallback, /genericBadgeTiers|genericBadgeProgress|renderSubjectAction/);
});

test('Fagverkforsiden skjuler compatibility-lenken når merket allerede er integrert i Progresjon', () => {
  assert.match(portalUi, /integratedBadgeRoute = subjectReady && badgePage === `\$\{subjectPage\}#fagverkIaProgresjon`/);
  assert.match(portalUi, /badgePage && !integratedBadgeRoute/);
  assert.match(portalUi, /class="fagverk-portal-compat"/);
});

test('rich runtime og statisk teori kan ikke auto-redirectes av equivalence-auditen', () => {
  const audit = runAudit();
  const politics = audit.rows.find((row) => row.id === 'politikk');
  const by = audit.rows.find((row) => row.id === 'by');
  assert.equal(politics.family, 'rich_runtime');
  assert.equal(politics.equivalence, 'pending_runtime_migration');
  assert.equal(by.family, 'legacy_static_theory');
  assert.equal(by.equivalence, 'pending_content_audit');
});
