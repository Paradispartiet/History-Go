import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditMediaPhase3 } from '../scripts/audit-fagverk-media-phase3.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Media er individuelt materialisert og auditert som andre Fase 3-fag', () => {
  const { report } = auditMediaPhase3();
  assert.deepEqual(report.subject, {
    id: 'media',
    title: 'Media',
    schemaFamily: 'standard_canonical',
    adapter: 'standard',
    navigationStatus: 'materialized',
    assessmentStatus: 'audited',
    editorialStatus: 'complete',
    nextGate: 'maintenance_source_refresh_and_place_case_expansion',
    subjectPage: 'fagverk.html?subject=media',
    badgePage: 'fagverk.html?subject=media#fagverkIaProgresjon'
  });
  assert.deepEqual(report.summary, {
    domainCount: 6,
    emneCount: 120,
    methodCount: 163,
    primaryMethodCount: 115,
    mappingCount: 120,
    hookCount: 60,
    registeredChapterCount: 6,
    explicitMappingRowCount: 120
  });
});

test('alle hovedemner er integrert uten syntetiske Media-områder', () => {
  const { report, model } = auditMediaPhase3();
  assert.deepEqual(report.domainEmneCounts, {
    presse_redaksjoner_avishus: 21,
    offentlighet_ytringsfrihet_etikk: 21,
    kilder_kritikk_sannhet: 20,
    plattformer_algoritmer_distribusjon: 20,
    propaganda_pavirkning_informasjonskrig: 18,
    medieokonomi_eierskap_arbeid: 20
  });
  assert.ok(model.domains.every((domain) => domain.sourceKind === 'pensum_domain'));
  assert.equal(report.gates.allMainMediaEmnersIntegrated, true);
  assert.equal(report.gates.explicitMappingAndGeneratorCountsSynchronized, true);
});

test('de to etterregistrerte Media-emnene bruker eksisterende områder og hooks', () => {
  const { report, model } = auditMediaPhase3();
  assert.equal(model.emnersById.get('em_media_av_og_tv_produksjon').domainId, 'presse_redaksjoner_avishus');
  assert.equal(model.emnersById.get('em_media_kritikk_kommentar').domainId, 'offentlighet_ytringsfrihet_etikk');
  assert.equal(report.gates.twoLateMediaEmnersIntegratedInExistingDomainsAndHooks, true);
});

test('Populærkultur er komplett nested mediefelt og ikke et toppfag', () => {
  const { report, supplementModel } = auditMediaPhase3();
  assert.deepEqual(report.nestedSupplement.domainEmneCounts, {
    massemedier_formater_distribusjon: 15,
    ikoner_kjendiser_karakterer: 13,
    fandom_identitet_tilhorighet: 7,
    internett_memer_plattformer: 7,
    representasjon_normer_fantasi: 8,
    steder_objekter_kommers_oppmerksomhet: 6
  });
  assert.equal(report.nestedSupplement.topLevelSubject, false);
  assert.equal(supplementModel.emners.length, 56);
  assert.equal(report.gates.noCompetingPopularCultureTopSubject, true);
});

test('Media compatibility-URL peker til integrert Progresjon og Fagverk-forsiden', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/media/merke_media.html'), 'utf8');
  assert.match(html, /fagverk-forside\.html/);
  assert.match(html, /fagverk\.html\?subject=media#fagverkIaProgresjon/);
  assert.match(html, /location\.replace/);
  assert.doesNotMatch(html, /id="felt"|id="begreper"|id="bidrag"/);
});
