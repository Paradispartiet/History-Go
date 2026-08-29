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
const compatibilityBySubject = new Map([
  ['historie', fs.readFileSync('data/fag/historie/merke_historie (1).html', 'utf8')],
  ['kunst', fs.readFileSync('data/fag/kunst/merke_kunst (2).html', 'utf8')],
  ['litteratur', fs.readFileSync('data/fag/litteratur/merke_litteratur (1).html', 'utf8')],
  ['media', fs.readFileSync('data/fag/media/merke_media.html', 'utf8')],
  ['religion', fs.readFileSync('data/fag/religion/merke_religion.html', 'utf8')],
  ['scenekunst', fs.readFileSync('data/fag/scenekunst/merke_scenekunst.html', 'utf8')],
  ['filosofi', fs.readFileSync('data/fag/filosofi/merke_filosofi.html', 'utf8')]
]);
const MIGRATED = ['by', 'historie', 'kunst', 'litteratur', 'media', 'religion', 'scenekunst', 'filosofi'];

function runAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-badge-equivalence.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('badge equivalence audit klassifiserer alle canonicale fag uten ukjent familie', () => {
  const audit = runAudit();
  assert.equal(audit.rows.length, audit.canonicalSubjectCount);
  assert.ok(audit.counts.progress_route >= 10);
  assert.ok(audit.counts.rich_runtime >= 1);
  assert.ok(audit.counts.legacy_static_theory >= 1);
  assert.equal(audit.rows.some((row) => ['unknown', 'missing'].includes(row.family)), false);
});

test('generic fallback-fagene og ferdigmigrerte legacy-fag går til integrert Progresjon', () => {
  const byId = new Map(portal.categories.map((item) => [item.id, item]));
  for (const id of ['helse', 'utdanning', ...MIGRATED]) assert.equal(byId.get(id).badgePage, `fagverk.html?subject=${id}#fagverkIaProgresjon`);
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
  const forbiddenBySubject = {
    historie: /id="felt"|id="begreper"/,
    kunst: /id="felt"|id="offentlig-rom"/,
    litteratur: /id="felt"|id="begreper"/,
    media: /id="felt"|id="begreper"|id="bidrag"/,
    religion: /Religionsfaget samler|kildebasert og respektfullt studieløp/,
    scenekunst: /Teater, dans, musikal, revy|scenografi, regi, dramaturgi/,
    filosofi: /Kjerneområder|Eget faggrunnlag|argumentasjon, logikk og begrepsanalyse/
  };
  for (const [subject, source] of compatibilityBySubject) {
    assert.match(source, /location\.replace/);
    assert.match(source, new RegExp(`subject=${subject}#fagverkIaProgresjon`));
    assert.doesNotMatch(source, forbiddenBySubject[subject]);
  }
});

test('Fagverkforsiden skjuler compatibility-lenken når merket allerede er integrert i Progresjon', () => {
  assert.match(portalUi, /integratedBadgeRoute = subjectReady && badgePage === `\$\{subjectPage\}#fagverkIaProgresjon`/);
  assert.match(portalUi, /badgePage && !integratedBadgeRoute/);
  assert.match(portalUi, /class="fagverk-portal-compat"/);
});

test('Alle merker sender ferdigmigrerte fag til integrert Progresjon', () => {
  for (const id of MIGRATED) assert.match(badgeIndex, new RegExp(`href="\\.\\.\\/fagverk\\.html\\?subject=${id}#fagverkIaProgresjon"`));
  assert.doesNotMatch(badgeIndex, /href="\.\.\/data\/fag\/filosofi\/merke_filosofi\.html"/);
  assert.doesNotMatch(badgeIndex, /href="\.\.\/data\/fag\/media\/merke_media\.html"/);
});

test('rich runtime og fortsatt ikke-migrert statisk teori kan ikke auto-redirectes av equivalence-auditen', () => {
  const audit = runAudit();
  const politics = audit.rows.find((row) => row.id === 'politikk');
  const pendingStatic = audit.rows.find((row) => row.family === 'legacy_static_theory');
  assert.equal(politics.family, 'rich_runtime');
  assert.equal(politics.equivalence, 'pending_runtime_migration');
  for (const id of MIGRATED) {
    const migrated = audit.rows.find((row) => row.id === id);
    assert.equal(migrated.family, 'progress_route');
    assert.equal(migrated.equivalence, 'complete');
    assert.equal(migrated.action, 'already_migrated');
  }
  assert.ok(pendingStatic, 'Minst én legacy fullteoriside må fortsatt finnes mens Batch C rulles ut fagvis');
  assert.equal(pendingStatic.equivalence, 'pending_content_audit');
});
