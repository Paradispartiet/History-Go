import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { auditMediaPopularCultureRetirement } from '../scripts/audit-fagverk-media-populaerkultur-retirement.mjs';

// Denne testen eies av den felles Fagverk-porten fordi den bruker JSDOM.

const ACTIVE = 'data/fag/media/populaerkultur_som_mediefelt/merke_populaerkultur.html';
const ARCHIVE = 'data/fag/media/populaerkultur_som_mediefelt/archive/merke_populaerkultur_full_teori_legacy_20260830.html';
const TARGET = 'fagverk.html?subject=media#fagverkIaEmner';

test('Populærkultur-legacy er bytearkivert og direkte URL går til Media-emner', () => {
  const report = auditMediaPopularCultureRetirement();
  assert.equal(report.source.activePage, ACTIVE);
  assert.equal(report.source.archivePage, ARCHIVE);
  assert.equal(report.source.originalBlobSha, '737ea0dd1a8233d108877d8b58030ba96417c43d');
  assert.equal(report.source.archiveBlobSha, report.source.originalBlobSha);
  assert.equal(report.navigation.redirectTarget, TARGET);
  assert.equal(report.navigation.routeRetired, true);
  assert.deepEqual(report.navigation.directInboundReferences, []);

  const active = fs.readFileSync(ACTIVE, 'utf8');
  assert.match(active, /rel="canonical" href="\.\.\/\.\.\/\.\.\/\.\.\/fagverk\.html\?subject=media#fagverkIaEmner"/);
  assert.match(active, /location\.replace\(target\)/);
  assert.doesNotMatch(active, /merke-blokk|<h2>1\. Felt<\/h2>|id="begreper"/i);
  const dom = new JSDOM(active, { url: `file://${process.cwd()}/${ACTIVE}` });
  assert.equal(dom.window.document.querySelector('link[rel="canonical"]')?.getAttribute('href'), '../../../../fagverk.html?subject=media#fagverkIaEmner');
  assert.equal(dom.window.document.querySelector('body a')?.getAttribute('href'), '../../../../fagverk.html?subject=media#fagverkIaEmner');
  dom.window.close();
});

test('alle ti kunnskapsseksjoner har eksplisitt canonical Media-eier uten kunstig migrering', () => {
  const report = auditMediaPopularCultureRetirement();
  assert.equal(report.summary.legacySectionCount, 11);
  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.equal(report.summary.canonicalSupersedesCount, 10);
  assert.equal(report.summary.migratedSectionCount, 0);
  assert.equal(report.summary.retiredProductCopyCount, 1);
  assert.equal(report.summary.redirectReady, true);
  for (const row of report.rows.filter((item) => item.role === 'knowledge')) {
    assert.equal(row.anchorCoverage, 1, row.id);
    assert.deepEqual(row.missingAnchors, [], row.id);
    assert.equal(row.disposition, 'canonical_supersedes', row.id);
    assert.ok(row.ownerFiles.length > 0, row.id);
    assert.deepEqual(row.migrationRefs, [], row.id);
  }
  const contribution = report.rows.find((row) => row.id === 'bidrag');
  assert.equal(contribution.disposition, 'retire_legacy_product_copy');
  assert.deepEqual(contribution.ownerFiles, []);
});

test('Populærkultur forblir komplett nested Media-felt og aldri konkurrerende toppfag', () => {
  const report = auditMediaPopularCultureRetirement();
  assert.equal(report.canonical.owner, 'media');
  assert.equal(report.canonical.manifestStatus, 'migrated_subfield');
  assert.equal(report.canonical.topLevelSubject, false);
  assert.equal(report.canonical.domainCount, 6);
  assert.equal(report.canonical.emneCount, 56);
  assert.equal(report.canonical.methodCount, 48);
  assert.equal(report.canonical.mappingCount, 56);
});

test('det delte gamle merker-stilarket fjernes først etter null aktive referanser', () => {
  const report = auditMediaPopularCultureRetirement();
  assert.equal(report.cleanup.removedStylesheet, 'merker/merker.css');
  assert.deepEqual(report.cleanup.activeStylesheetReferences, []);
  assert.equal(report.cleanup.deadStylesheetRemoved, true);
  assert.equal(fs.existsSync('merker/merker.css'), false);
});
