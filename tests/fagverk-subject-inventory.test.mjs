import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditRepository, buildBaselineReport } from '../scripts/audit-fagverk-subject-inventory.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

test('inventaret dekker 17 toppfag, Teknologi-spesialiseringen og alle required core-filer', () => {
  const r = auditRepository();
  assert.equal(r.subjectCount, 17);
  assert.equal(r.specializationCount, 1);
  assert.equal(r.coreFileAudit.length, 72);
  assert.equal(r.report.summary.schemaFamilyCount, 4);
});

test('statusregisteret tillater bare dokumentert fremdrift gjennom materialized og audited', () => {
  const s = readJson('data/fagverk/subject_status.json');
  const p = readJson('data/fagverk/fagverk_portal.json');
  const pb = new Map(p.categories.map((i) => [i.id, i]));
  for (const x of s.subjects) {
    const e = pb.get(x.id);
    assert.equal(x.navigationStatus, e.subjectStatus);
    if (x.editorialStatus !== 'not_started') {
      assert.equal(x.navigationStatus, 'materialized');
      assert.equal(x.assessmentStatus, 'audited');
    }
    if (x.navigationStatus === 'planned') {
      assert.equal(x.editorialStatus, 'not_started');
      assert.equal(e.subjectPage, '');
    }
  }
});

test('Auditerte fag har dokumentert og statusriktig fremdrift gjennom den generelle motoren', () => {
  const s = readJson('data/fagverk/subject_status.json');
  const audited = s.subjects.filter((x) => x.assessmentStatus === 'audited');
  assert.deepEqual(audited.map((x) => x.id), [
    'by', 'historie', 'kunst', 'litteratur', 'media', 'musikk', 'naeringsliv', 'natur',
    'politikk', 'psykologi', 'religion', 'scenekunst', 'sport', 'subkultur', 'vitenskap',
    'filosofi', 'film_tv'
  ]);
  for (const id of audited.map((x) => x.id)) {
    const subject = s.subjects.find((x) => x.id === id);
    assert.equal(subject.navigationStatus, 'materialized');
    assert.equal(subject.assessmentStatus, 'audited');
  }

  for (const id of ['by', 'kunst', 'litteratur', 'musikk', 'naeringsliv', 'natur', 'subkultur']) {
    assert.equal(s.subjects.find((x) => x.id === id).editorialStatus, 'complete');
  }
  for (const id of ['historie', 'politikk']) {
    const subject = s.subjects.find((x) => x.id === id);
    assert.equal(subject.editorialStatus, 'expanded_and_audited');
    assert.equal(subject.nextGate, 'source_refresh_and_case_expansion');
  }
  for (const id of ['litteratur', 'naeringsliv', 'subkultur']) {
    assert.equal(s.subjects.find((x) => x.id === id).nextGate, 'maintenance_and_source_refresh');
  }

  const natur = s.subjects.find((x) => x.id === 'natur');
  assert.equal(natur.nextGate, 'complete');
  const musikk = s.subjects.find((x) => x.id === 'musikk');
  assert.equal(musikk.navigationStatus, 'materialized');
  assert.equal(musikk.assessmentStatus, 'audited');
  assert.equal(musikk.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.equal(s.subjects.find((x) => x.id === 'by').nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.equal(s.subjects.find((x) => x.id === 'kunst').nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  const media = s.subjects.find((x) => x.id === 'media');
  assert.equal(media.editorialStatus, 'complete');
  assert.equal(media.nextGate, 'maintenance_source_refresh_and_place_case_expansion');

  const psykologi = s.subjects.find((x) => x.id === 'psykologi');
  assert.equal(psykologi.editorialStatus, 'chapters_in_progress');
  assert.equal(psykologi.nextGate, 'remaining_domain_chapter_production');

  for (const id of ['religion', 'scenekunst', 'sport', 'vitenskap', 'filosofi']) {
    const subject = s.subjects.find((x) => x.id === id);
    assert.equal(subject.editorialStatus, 'structure_ready');
    assert.equal(subject.nextGate, 'chapter_production');
  }

  const filmTv = s.subjects.find((x) => x.id === 'film_tv');
  const filmTvChapterCount = readJson('data/fagverk/fagverk_registry.json').subjects.film_tv.chapters.length;
  assert.ok(filmTvChapterCount >= 1 && filmTvChapterCount <= 6);
  if (filmTvChapterCount < 6) {
    assert.equal(filmTv.editorialStatus, 'chapters_in_progress');
    assert.equal(filmTv.nextGate, 'remaining_domain_chapter_production');
  } else {
    assert.equal(filmTv.editorialStatus, 'complete');
    assert.equal(filmTv.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  }
});

test('baseline report er en deterministisk projeksjon av eide kilder', () => {
  const categories = readJson('data/categories/category_contract.json');
  const manifest = readJson('data/fag/fag_manifest.json');
  const inventory = readJson('data/fagverk/subject_inventory.json');
  const status = readJson('data/fagverk/subject_status.json');
  const committed = readJson('reports/fagverk/subject-baseline.json');
  assert.deepEqual(committed, buildBaselineReport({ categories, manifest, inventory, status }));
});

test('Musikk deklarerer vitenskapelig pakke uten å opprette ny schemafamilie', () => {
  const i = readJson('data/fagverk/subject_inventory.json');
  const m = readJson('data/fag/fag_manifest.json');
  const music = i.subjects.find((x) => x.id === 'musikk');
  assert.equal(music.schemaFamily, 'standard_canonical');
  assert.ok(music.optionalManifestFields.includes('scientificPackage'));
  assert.equal(m.musikk.scientificPackage, 'musikk/scientific_package.json');
});

test('pilotsettet dekker fire schemafamilier uten å gjøre Teknologi til toppfag', () => {
  const i = readJson('data/fagverk/subject_inventory.json');
  const m = readJson('data/fag/fag_manifest.json');
  const pilots = i.subjects.filter((x) => x.pilot);
  assert.deepEqual(pilots.map((x) => x.id).sort(), ['by', 'natur', 'religion', 'vitenskap']);
  const t = i.subjects.find((x) => x.id === 'vitenskap').specializations.find((x) => x.id === 'teknologi');
  assert.equal(t.schemaFamily, 'technology_scientific_v2_4');
  assert.equal(t.pilot, true);
  assert.ok(m.vitenskap.specializations.teknologi);
  assert.equal(m.teknologi, undefined);
  assert.equal(new Set([...pilots.map((x) => x.schemaFamily), t.schemaFamily]).size, 4);
});
