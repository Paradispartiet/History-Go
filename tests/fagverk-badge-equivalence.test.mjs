import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const portal = JSON.parse(fs.readFileSync('data/fagverk/fagverk_portal.json', 'utf8'));
const html = fs.readFileSync('fagverk.html', 'utf8');
const badgeUi = fs.readFileSync('js/fagverk-ia-v3-badge-progress.js', 'utf8');
const fallback = fs.readFileSync('js/merke-fallback.js', 'utf8');
const portalUi = fs.readFileSync('js/fagverk-forside.js', 'utf8');
const badgeIndex = fs.readFileSync('merker/merker.html', 'utf8');
const historieCompatibility = fs.readFileSync('data/fag/historie/merke_historie (1).html', 'utf8');
const kunstCompatibility = fs.readFileSync('data/fag/kunst/merke_kunst (2).html', 'utf8');
const litteraturCompatibility = fs.readFileSync('data/fag/litteratur/merke_litteratur (1).html', 'utf8');
const religionCompatibility = fs.readFileSync('data/fag/religion/merke_religion.html', 'utf8');
const scenekunstCompatibility = fs.readFileSync('data/fag/scenekunst/merke_scenekunst.html', 'utf8');

function runAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-badge-equivalence.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('badge equivalence audit klassifiserer alle canonicale fag uten ukjent familie', () => {
  const audit = runAudit();
  assert.equal(audit.rows.length, audit.canonicalSubjectCount);
  assert.ok(audit.counts.progress_route >= 8);
  assert.ok(audit.counts.rich_runtime >= 1);
  assert.ok(audit.counts.legacy_static_theory >= 1);
  assert.ok(audit.counts.legacy_stub >= 1);
  assert.equal(audit.rows.some((row) => ['unknown', 'missing'].includes(row.family)), false);
});

test('generic fallback-fagene og ferdigmigrerte legacy-fag går til integrert Progresjon', () => {
  const byId = new Map(portal.categories.map((item) => [item.id, item]));
  for (const id of ['helse', 'utdanning', 'by', 'historie', 'kunst', 'litteratur', 'religion', 'scenekunst']) {
    assert.equal(byId.get(id).badgePage, `fagverk.html?subject=${id}#fagverkIaProgresjon`);
  }
  assert.equal(portal.categories.some((item) => String(item.badgePage).startsWith('merke.html?badge=')), false);
  assert.equal(byId.get('politikk').badgePage, 'data/fag/politikk/merke_politikk.html');
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

test('gamle direkte URL-er er compatibility-redirects etter arkivering', () => {
  for (const [source, subject, forbidden] of [
    [historieCompatibility, 'historie', /id="felt"|id="begreper"/],
    [kunstCompatibility, 'kunst', /id="felt"|id="offentlig-rom"/],
    [litteraturCompatibility, 'litteratur', /id="felt"|id="begreper"/],
    [religionCompatibility, 'religion', /Religionsfaget samler|kildebasert og respektfullt studieløp/],
    [scenekunstCompatibility, 'scenekunst', /Teater, dans, musikal, revy|scenografi, regi, dramaturgi/]
  ]) {
    assert.match(source, /location\.replace/);
    assert.match(source, new RegExp(`subject=${subject}#fagverkIaProgresjon`));
    assert.doesNotMatch(source, forbidden);
  }
});

test('Fagverkforsiden skjuler compatibility-lenken når merket allerede er integrert i Progresjon', () => {
  assert.match(portalUi, /integratedBadgeRoute = subjectReady && badgePage === `\$\{subjectPage\}#fagverkIaProgresjon`/);
  assert.match(portalUi, /badgePage && !integratedBadgeRoute/);
  assert.match(portalUi, /class="fagverk-portal-compat"/);
});

test('Alle merker sender ferdigmigrerte fag til integrert Progresjon', () => {
  for (const id of ['by', 'historie', 'kunst', 'litteratur', 'religion', 'scenekunst']) {
    assert.match(badgeIndex, new RegExp(`href="\\.\\.\\/fagverk\\.html\\?subject=${id}#fagverkIaProgresjon"`));
  }
  assert.doesNotMatch(badgeIndex, /href="\.\.\/data\/fag\/by\/merke_by\.html"/);
  assert.doesNotMatch(badgeIndex, /href="\.\.\/data\/fag\/historie\/merke_historie \(1\)\.html"/);
  assert.doesNotMatch(badgeIndex, /href="\.\.\/data\/fag\/kunst\/merke_kunst \(2\)\.html"/);
  assert.doesNotMatch(badgeIndex, /href="\.\.\/data\/fag\/litteratur\/merke_litteratur \(1\)\.html"/);
  assert.doesNotMatch(badgeIndex, /href="\.\.\/data\/fag\/religion\/merke_religion\.html"/);
  assert.doesNotMatch(badgeIndex, /href="\.\.\/data\/fag\/scenekunst\/merke_scenekunst\.html"/);
});

test('rich runtime og fortsatt ikke-migrert statisk teori kan ikke auto-redirectes av equivalence-auditen', () => {
  const audit = runAudit();
  const politics = audit.rows.find((row) => row.id === 'politikk');
  const migratedIds = ['historie', 'by', 'kunst', 'litteratur', 'religion', 'scenekunst'];
  const pendingStatic = audit.rows.find((row) => row.family === 'legacy_static_theory');
  assert.equal(politics.family, 'rich_runtime');
  assert.equal(politics.equivalence, 'pending_runtime_migration');
  for (const id of migratedIds) {
    const migrated = audit.rows.find((row) => row.id === id);
    assert.equal(migrated.family, 'progress_route');
    assert.equal(migrated.equivalence, 'complete');
    assert.equal(migrated.action, 'already_migrated');
  }
  assert.ok(pendingStatic, 'Minst én legacy fullteoriside må fortsatt finnes mens Batch C rulles ut fagvis');
  assert.equal(pendingStatic.equivalence, 'pending_content_audit');
});
