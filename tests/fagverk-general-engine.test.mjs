import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditRepository } from '../scripts/audit-fagverk-general-engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

const methods = {
  methods: [
    { method_id: 'met_a', title: 'Metode A', description: 'Undersøker A.', procedure: ['Avgrens', 'Samle', 'Vurder'], limitations: ['Utvalg', 'Usikkerhet'] },
    { method_id: 'met_b', title: 'Metode B', description: 'Undersøker B.' }
  ]
};

function normalize({ subjectId, schemaFamily, pensum, fagkart, emners }) {
  return CORE.normalizeSubject({
    subjectId,
    schemaFamily,
    categoryLabel: subjectId,
    portalEntry: { badgePage: `merke.html?badge=${subjectId}`, subjectStatus: 'materialized' },
    statusEntry: { assessmentStatus: 'audited', editorialStatus: 'structure_ready' },
    registry: { subjects: {}, placeLinks: {} },
    source: { pensum, fagkart, emners, methods }
  });
}

test('canonical subject-resolver er streng og bruker aldri alias eller fallback', () => {
  const categories = { fagSubjects: ['natur', 'politikk'], aliases: { nature: 'natur' } };
  const manifest = { natur: {}, politikk: {} };
  assert.equal(CORE.resolveCanonicalSubjectId('natur', categories, manifest), 'natur');
  assert.throws(() => CORE.resolveCanonicalSubjectId('', categories, manifest), /eksplisitt subject-id/);
  assert.throws(() => CORE.resolveCanonicalSubjectId('nature', categories, manifest), /Ukjent canonical/);
  assert.throws(() => CORE.resolveCanonicalSubjectId('historie', categories, manifest), /Ukjent canonical/);
});

test('manifest-resolver holder required kjernefiler innenfor data/fag', () => {
  assert.equal(CORE.resolveManifestPointer('natur/pensum.json'), 'data/fag/natur/pensum.json');
  assert.throws(() => CORE.resolveManifestPointer('../quiz/file.json'), /utenfor data\/fag/);
  assert.throws(() => CORE.resolveManifestPointer('https://example.test/file.json'), /relativ/);
});

test('standard canonical adapter bruker pensumdomener og canonicale id-er', () => {
  const model = normalize({
    subjectId: 'natur',
    schemaFamily: 'standard_canonical',
    pensum: { subject_id: 'natur', domains: [{ domain_id: 'natur_a', label: 'Natur A', emne_ids: ['em_natur_a'], method_ids: ['met_a'] }] },
    fagkart: {},
    emners: [{ emne_id: 'em_natur_a', subject_id: 'natur', domain: 'natur_a', title: 'Emne A', method_ids: ['met_a'] }]
  });
  assert.equal(model.subject.adapter, 'standard');
  assert.equal(model.domains.length, 1);
  assert.equal(model.emners[0].domainId, 'natur_a');
  assert.deepEqual([...model.emners[0].methodIds], ['met_a']);
  assert.deepEqual([...model.methodsById.get('met_a').procedure], ['Avgrens', 'Samle', 'Vurder']);
  assert.deepEqual([...model.methodsById.get('met_a').limitations], ['Utvalg', 'Usikkerhet']);
});

test('foundation-adapter henter fagområder fra fagkart uten å gjøre kursmoduler til renderer', () => {
  const model = normalize({
    subjectId: 'religion',
    schemaFamily: 'foundation_v1',
    pensum: { subject_id: 'religion', modules: [{ module_id: 'kurs_1', title: 'Kurs', emner: ['em_religion_a'] }] },
    fagkart: { categories: [{ id: 'hellige_rom', title: 'Hellige rom', emne_ids: ['em_religion_a'] }] },
    emners: [{ emne_id: 'em_religion_a', subject_id: 'religion', domain: 'annet_navn', title: 'Hellige rom', method_ids: ['met_a'] }]
  });
  assert.equal(model.subject.adapter, 'standard');
  assert.equal(model.domains[0].id, 'hellige_rom');
  assert.equal(model.emners[0].domainId, 'hellige_rom');
});

test('by-adapter leser emnekoblinger i nested topic hooks', () => {
  const model = normalize({
    subjectId: 'by',
    schemaFamily: 'by_compatibility',
    pensum: { subject_id: 'by', modules: [{ module_id: 'kur_by_1', title: 'Bykurs', emner: ['em_by_a'] }] },
    fagkart: { categories: [{ id: 'byliv', title: 'Byliv', topic_hooks: [{ id: 'hook_by', emne_ids: ['em_by_a'], recommended_method_ids: ['met_b'] }] }] },
    emners: [{ emne_id: 'em_by_a', subject_id: 'by', area_id: 'by_infra', title: 'Byemne', methods: ['met_b'] }]
  });
  assert.equal(model.subject.adapter, 'by');
  assert.equal(model.domains[0].id, 'byliv');
  assert.equal(model.emners[0].domainId, 'byliv');
  assert.deepEqual([...model.domains[0].hookIds], ['hook_by']);
});

test('nested Teknologi-spesialisering bruker vitenskapelig fagkart og focus-koblinger', () => {
  const model = normalize({
    subjectId: 'teknologi',
    schemaFamily: 'technology_scientific_v2_4',
    pensum: { subject_id: 'teknologi', modules: [{ module_id: 'kur_tek_1', title: 'Teknologikurs', emner: ['em_tek_a'] }] },
    fagkart: { categories: [{ id: 'design', title: 'Design', focus: ['em_tek_a'], topic_hooks: [{ id: 'hook_tek', recommended_method_ids: ['met_a'] }] }] },
    emners: [{ emne_id: 'em_tek_a', subject_id: 'teknologi', domain: 'design', title: 'Teknologiemne', method_ids: ['met_a'] }]
  });
  assert.equal(model.subject.adapter, 'technology');
  assert.equal(model.domains[0].id, 'design');
  assert.equal(model.emners[0].domainId, 'design');
});

test('materialisert fagside og committed fase-1-rapport passerer full audit', () => {
  const result = auditRepository();
  assert.ok(result.materializedRows.some((row) => row.id === 'politikk'));
  const musikk = result.materializedRows.find((row) => row.id === 'musikk');
  assert.ok(musikk);
  assert.equal(musikk.domainCount, 8);
  assert.equal(musikk.emneCount, 48);
  assert.equal(musikk.methodCount, 18);
  assert.equal(result.report.summary.politicsFallbacks, 0);
  assert.equal(result.report.summary.subjectPageLegacyDependencies, 0);
});
