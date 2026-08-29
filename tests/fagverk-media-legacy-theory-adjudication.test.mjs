import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const LEGACY_ARCHIVE = 'data/fag/media/archive/merke_media_full_teori_legacy_20260829.html';
const COMPATIBILITY_ROUTE = 'data/fag/media/merke_media.html';
const PROGRESS_ROUTE = 'fagverk.html?subject=media#fagverkIaProgresjon';
const METHODS_OWNER = 'data/fag/media/methods_media_canonical_v4_5.json';
const PENSUM_OWNER = 'data/fag/media/mediapensum_canonical_v4_5.json';
const EXPECTED_CHAPTER_OWNERS = [
  'data/fagverk/media/presse-redaksjoner-og-avishus.json',
  'data/fagverk/media/kilder-kritikk-og-sannhet.json',
  'data/fagverk/media/offentlighet-ytringsfrihet-og-medieetikk.json',
  'data/fagverk/media/plattformer-algoritmer-og-distribusjon.json',
  'data/fagverk/media/propaganda-pavirkning-og-informasjonskrig.json',
  'data/fagverk/media/medieokonomi-eierskap-og-arbeid.json'
];

function adjudicationAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-media-legacy-adjudication.mjs'], {
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Media-adjudiseringen avgjør alle ti kunnskapsseksjoner uten innholdsmigrering', () => {
  const report = adjudicationAudit();
  assert.equal(report.subject, 'media');
  assert.equal(report.summary.legacySectionCount, 11);
  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.equal(report.summary.adjudicatedKnowledgeCount, 10);
  assert.equal(report.summary.migratedSectionCount, 0);
  assert.equal(report.summary.canonicalSupersedesCount, 10);
  assert.equal(report.summary.retiredProductCopyCount, 1);
  assert.equal(
    report.rows.filter((row) => row.role === 'knowledge').every((row) => row.disposition === 'canonical_supersedes'),
    true
  );
});

test('alle Media-kunnskapsseksjoner har tillatte eksisterende canonicale eiere', () => {
  const report = adjudicationAudit();
  const allowedOwners = new Set([PENSUM_OWNER, METHODS_OWNER, ...EXPECTED_CHAPTER_OWNERS]);
  assert.equal(report.summary.canonicalOwnerFileCount, 8);
  assert.deepEqual(new Set(report.inputs.registryChapterOwnerFiles), new Set(EXPECTED_CHAPTER_OWNERS));

  for (const row of report.rows.filter((item) => item.role === 'knowledge')) {
    assert.equal(row.anchorCoverage, 1, `${row.id} mangler full canonical ankerdekning`);
    assert.ok(row.ownerFiles.length > 0, `${row.id} mangler canonical eier`);
    assert.deepEqual(row.migrationRefs, [], `${row.id} skal ikke hevde migrering`);
    for (const ownerFile of row.ownerFiles) {
      assert.ok(allowedOwners.has(ownerFile), `${row.id} peker utenfor adjudisert owner-sett: ${ownerFile}`);
      assert.ok(fs.existsSync(ownerFile), `${row.id} peker til manglende owner-fil: ${ownerFile}`);
    }
  }
});

test('Media-metodene og den brede feltmodellen bindes til canonical metodekatalog og pensum', () => {
  const report = adjudicationAudit();
  const method = report.rows.find((row) => row.id === 'metode');
  const field = report.rows.find((row) => row.id === 'felt');
  assert.ok(method.ownerFiles.includes(METHODS_OWNER));
  assert.ok(field.ownerFiles.includes(PENSUM_OWNER));
  for (const chapterOwner of EXPECTED_CHAPTER_OWNERS) {
    assert.ok(field.ownerFiles.includes(chapterOwner), `felt mangler canonical kapittel-eier ${chapterOwner}`);
  }
  assert.match(method.rationale, /Ingen metode må migreres/i);
  assert.match(field.rationale, /uten at legacy-prosa kopieres/i);
});

test('Media-adjudiseringen låser permanent route-retirement etter grønn gate', () => {
  const report = adjudicationAudit();
  assert.equal(report.summary.anchorAuditRedirectReady, false, 'anker-auditen alene skal aldri godkjenne redirect');
  assert.equal(report.summary.redirectReady, true);
  assert.equal(report.summary.redirectTarget, PROGRESS_ROUTE);
  assert.equal(report.summary.portalRoute, PROGRESS_ROUTE);
  assert.equal(report.summary.portalRedirected, true);
  assert.equal(report.summary.legacyBadgeSourcePreserved, true);
  assert.equal(report.summary.compatibilityRedirectPresent, true);
  assert.equal(report.inputs.legacyBadgePage, LEGACY_ARCHIVE);
  assert.equal(report.inputs.compatibilityBadgePage, COMPATIBILITY_ROUTE);

  const compatibilityHtml = fs.readFileSync(COMPATIBILITY_ROUTE, 'utf8');
  assert.match(compatibilityHtml, /location\.replace/);
  assert.match(compatibilityHtml, /subject=media#fagverkIaProgresjon/);
  assert.doesNotMatch(compatibilityHtml, /id="felt"|id="begreper"|id="bidrag"/);
});

test('Media bidrag er legacy-produkttekst og får ingen kunstig kunnskapseier', () => {
  const report = adjudicationAudit();
  const contribution = report.rows.find((row) => row.id === 'bidrag');
  assert.equal(contribution.role, 'legacy_product_copy');
  assert.equal(contribution.disposition, 'retire_legacy_product_copy');
  assert.deepEqual(contribution.ownerFiles, []);
  assert.deepEqual(contribution.migrationRefs, []);
  assert.match(contribution.rationale, /produkttekst/i);
});
