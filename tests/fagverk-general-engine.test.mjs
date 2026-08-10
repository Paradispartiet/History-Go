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

function normalize({ subjectId, schemaFamily, pensum, fagkart, emners, concepts = [] }) {
  return CORE.normalizeSubject({
    subjectId,
    schemaFamily,
    categoryLabel: subjectId,
    portalEntry: { badgePage: `merke.html?badge=${subjectId}`, subjectStatus: 'materialized' },
    statusEntry: { assessmentStatus: 'audited', editorialStatus: 'structure_ready' },
    registry: { subjects: {}, placeLinks: {} },
    source: { pensum, fagkart, emners, methods, concepts }
  });
}

test('generell motor normaliserer forklarte begreper uten Politikk-avhengighet', () => {
  const model = normalize({
    subjectId: 'natur',
    schemaFamily: 'standard_canonical',
    pensum: { subject_id: 'natur', domains: [{ domain_id: 'natur_a', label: 'Natur A', emne_ids: ['em_natur_a'] }] },
    fagkart: {},
    emners: [{ emne_id: 'em_natur_a', subject_id: 'natur', domain: 'natur_a', title: 'Emne A' }],
    concepts: {
      concepts: [{
        concept_id: 'begrep_a',
        label: 'Begrep A',
        definition: 'En full forklaring.',
        definition_status: 'direct_editorial_or_canonical',
        domain_ids: ['natur_a'],
        source_emne_ids: ['em_natur_a'],
        related_concepts: ['begrep_b'],
        common_misuse: ['For vid bruk.']
      }]
    }
  });

  assert.equal(model.concepts.length, 1);
  assert.equal(model.conceptsById.get('begrep_a').label, 'Begrep A');
  assert.equal(model.concepts[0].definitionStatus, 'direct_editorial_or_canonical');
  assert.deepEqual([...model.concepts[0].emneIds], ['em_natur_a']);
  assert.deepEqual([...model.concepts[0].relatedIds], ['begrep_b']);
});

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

test('kapittelhydrering normaliserer pedagogiske felter og laster claims-kilder', async () => {
  const documents = new Map([
    ['chapter.json', {
      title: 'Kapittel',
      moduleFiles: ['module-a.json', 'module-b.json'],
      claimsFile: 'claims.json'
    }],
    ['module-a.json', {
      workedExamples: [{ title: 'Ny form', scenario: 'Situasjonen', steps: ['Steg 1', 'Steg 2'] }],
      misconceptions: [{ claim: 'Feil', correction: 'Rett' }],
      applicationTasks: [{ title: 'Eldre oppgave', prompt: 'Eldre instruksjon' }],
      relatedPlaces: [{ id: 'eldre_sted', title: 'Eldre sted' }],
      sections: [{ id: 'seksjon', concepts: ['arbeidsdeling'] }]
    }],
    ['module-b.json', {
      workedExamples: [{ title: 'Canonical form', situation: 'Annen situasjon', analysis: ['Analyse'] }],
      commonMisconceptions: [{ claim: 'Annen feil', correction: 'Annen rett' }],
      causalFramework: ['Forutsetning', 'Mekanisme', 'Utfall'],
      historiographicalDebate: { question: 'Hva forklarer endringen?', positions: ['Tolkning A', 'Tolkning B'], editorial_note: 'Prøv begge mot samme kilder.' },
      caseAnchors: [{ place_id: 'sporstedet', use: 'Les stedet som et dokumentert spor etter mekanismen.' }],
      sources: [{ id: 'stale', label: 'Stale', url: 'https://example.test/stale' }]
    }],
    ['claims.json', {
      claims: [{ id: 'claim-1' }],
      sources: [{ id: 'source-1', label: 'Canonical kilde', url: 'https://example.test/source' }]
    }]
  ]);
  const fetched = [];
  const chapter = await CORE.hydrateChapter({ file: 'chapter.json' }, async (file) => {
    fetched.push(file);
    return documents.get(file);
  });

  assert.deepEqual(fetched, ['chapter.json', 'module-a.json', 'module-b.json', 'claims.json']);
  assert.equal(chapter.workedExamples.length, 2);
  assert.equal(chapter.workedExamples[0].situation, 'Situasjonen');
  assert.deepEqual([...chapter.workedExamples[0].analysis], ['Steg 1', 'Steg 2']);
  assert.equal(chapter.workedExamples[1].situation, 'Annen situasjon');
  assert.deepEqual([...chapter.workedExamples[1].analysis], ['Analyse']);
  assert.equal(chapter.commonMisconceptions.length, 2);
  assert.equal(chapter.applicationTasks[0].task, 'Eldre oppgave');
  assert.deepEqual([...chapter.applicationTasks[0].prompts], ['Eldre instruksjon']);
  assert.equal(chapter.relatedPlaces[0].name, 'Eldre sted');
  assert.equal(chapter.relatedPlaces[0].role, 'Stedscase i kapittelet.');
  assert.deepEqual([...chapter.causalFramework], ['Forutsetning', 'Mekanisme', 'Utfall']);
  assert.equal(chapter.historiographicalDebate.question, 'Hva forklarer endringen?');
  assert.deepEqual([...chapter.historiographicalDebate.positions], ['Tolkning A', 'Tolkning B']);
  assert.equal(chapter.historiographicalDebate.editorialNote, 'Prøv begge mot samme kilder.');
  assert.equal(chapter.caseAnchors[0].id, 'sporstedet');
  assert.equal(chapter.caseAnchors[0].name, 'Sporstedet');
  assert.equal(chapter.concepts[0].id, 'arbeidsdeling');
  assert.equal(chapter.concepts[0].term, 'arbeidsdeling');
  assert.equal(chapter.concepts[0].definition, 'Begrepet brukes som analysebegrep i dette kapittelet.');
  assert.deepEqual(chapter.sources.map((source) => source.id), ['source-1']);
  assert.deepEqual(chapter.claims.map((claim) => claim.id), ['claim-1']);
});

test('alle tolv Næringsliv-kapitler hydrerer renderbare eksempler, misoppfatninger og canonicale kilder', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

  assert.equal(registry.subjects.naeringsliv.chapters.length, 12);
  for (const chapterMeta of registry.subjects.naeringsliv.chapters) {
    const chapter = await CORE.hydrateChapter(chapterMeta, fetchFile);
    const claimsDocument = await fetchFile(chapterMeta.claimsFile);
    assert.ok(chapter.workedExamples.length >= 2, `${chapterMeta.id}: mangler arbeidseksempler`);
    assert.ok(chapter.workedExamples.every((example) => example.situation && example.analysis.length), `${chapterMeta.id}: arbeidseksempel er ikke renderbart`);
    assert.ok(chapter.commonMisconceptions.length >= 5, `${chapterMeta.id}: misoppfatninger er ikke renderbare`);
    assert.ok(chapter.applicationTasks.every((task) => task.task && task.prompts.length), `${chapterMeta.id}: anvendelsesoppgave er ikke renderbar`);
    assert.ok(chapter.relatedPlaces.every((place) => place.name && place.role), `${chapterMeta.id}: stedscase er ikke renderbart`);
    if (chapterMeta.chapter_role === 'specialization') {
      assert.ok(chapter.concepts.length >= 9, `${chapterMeta.id}: begreper er ikke renderbare`);
      assert.ok(chapter.concepts.every((concept) => concept.id && concept.term && concept.definition), `${chapterMeta.id}: begrep mangler renderer-felt`);
    }
    assert.equal(chapter.sources.length, claimsDocument.sources.length, `${chapterMeta.id}: claims-kilder er ikke hydrert`);
    assert.ok(chapter.sources.every((source) => source.label && source.url), `${chapterMeta.id}: kilde mangler label eller URL`);
  }
});

test('materialisert fagside og committed fase-1-rapport passerer full audit', () => {
  const result = auditRepository();
  assert.ok(result.materializedRows.some((row) => row.id === 'politikk'));
  const by = result.materializedRows.find((row) => row.id === 'by');
  assert.ok(by);
  assert.equal(by.schemaFamily, 'by_compatibility');
  assert.equal(by.adapter, 'by');
  assert.equal(by.domainCount, 12);
  assert.equal(by.emneCount, 82);
  assert.equal(by.methodCount, 14);
  assert.equal(by.hookCount, 81);
  assert.equal(by.chapterCount, 17);
  const kunst = result.materializedRows.find((row) => row.id === 'kunst');
  assert.ok(kunst);
  assert.equal(kunst.schemaFamily, 'standard_canonical');
  assert.equal(kunst.adapter, 'standard');
  assert.equal(kunst.domainCount, 6);
  assert.equal(kunst.emneCount, 21);
  assert.equal(kunst.methodCount, 21);
  assert.equal(kunst.mappingCount, 21);
  assert.equal(kunst.hookCount, 60);
  assert.equal(kunst.chapterCount, 6);
  const media = result.materializedRows.find((row) => row.id === 'media');
  assert.ok(media);
  assert.equal(media.schemaFamily, 'standard_canonical');
  assert.equal(media.adapter, 'standard');
  assert.equal(media.domainCount, 6);
  assert.equal(media.emneCount, 120);
  assert.equal(media.methodCount, 163);
  assert.equal(media.mappingCount, 120);
  assert.equal(media.hookCount, 60);
  assert.equal(media.chapterCount, 1);
  const psykologi = result.materializedRows.find((row) => row.id === 'psykologi');
  assert.ok(psykologi);
  assert.equal(psykologi.schemaFamily, 'standard_canonical');
  assert.equal(psykologi.adapter, 'standard');
  assert.equal(psykologi.domainCount, 6);
  assert.equal(psykologi.emneCount, 58);
  assert.equal(psykologi.methodCount, 58);
  assert.equal(psykologi.mappingCount, 58);
  assert.equal(psykologi.hookCount, 60);
  assert.equal(psykologi.chapterCount, 0);
  const musikk = result.materializedRows.find((row) => row.id === 'musikk');
  assert.ok(musikk);
  assert.equal(musikk.domainCount, 8);
  assert.equal(musikk.emneCount, 48);
  assert.equal(musikk.methodCount, 18);
  const religion = result.materializedRows.find((row) => row.id === 'religion');
  assert.ok(religion);
  assert.equal(religion.schemaFamily, 'foundation_v1');
  assert.equal(religion.adapter, 'standard');
  assert.equal(religion.domainCount, 4);
  assert.equal(religion.emneCount, 8);
  assert.equal(religion.methodCount, 8);
  assert.equal(religion.chapterCount, 0);
  const scenekunst = result.materializedRows.find((row) => row.id === 'scenekunst');
  assert.ok(scenekunst);
  assert.equal(scenekunst.schemaFamily, 'foundation_v1');
  assert.equal(scenekunst.adapter, 'standard');
  assert.equal(scenekunst.domainCount, 4);
  assert.equal(scenekunst.emneCount, 8);
  assert.equal(scenekunst.methodCount, 9);
  assert.equal(scenekunst.mappingCount, 8);
  assert.equal(scenekunst.hookCount, 0);
  assert.equal(scenekunst.chapterCount, 0);
  const sport = result.materializedRows.find((row) => row.id === 'sport');
  assert.ok(sport);
  assert.equal(sport.schemaFamily, 'standard_canonical');
  assert.equal(sport.adapter, 'standard');
  assert.equal(sport.domainCount, 6);
  assert.equal(sport.emneCount, 116);
  assert.equal(sport.methodCount, 109);
  assert.equal(sport.mappingCount, 116);
  assert.equal(sport.hookCount, 60);
  assert.equal(sport.chapterCount, 0);
  const filosofi = result.materializedRows.find((row) => row.id === 'filosofi');
  assert.ok(filosofi);
  assert.equal(filosofi.schemaFamily, 'foundation_v1');
  assert.equal(filosofi.adapter, 'standard');
  assert.equal(filosofi.domainCount, 13);
  assert.equal(filosofi.emneCount, 54);
  assert.equal(filosofi.methodCount, 27);
  assert.equal(filosofi.mappingCount, 54);
  assert.equal(filosofi.hookCount, 37);
  assert.equal(filosofi.chapterCount, 0);
  const filmTv = result.materializedRows.find((row) => row.id === 'film_tv');
  assert.ok(filmTv);
  assert.equal(filmTv.schemaFamily, 'standard_canonical');
  assert.equal(filmTv.adapter, 'standard');
  assert.equal(filmTv.domainCount, 6);
  assert.equal(filmTv.emneCount, 120);
  assert.equal(filmTv.methodCount, 107);
  assert.equal(filmTv.mappingCount, 120);
  assert.equal(filmTv.hookCount, 60);
  assert.equal(filmTv.chapterCount, 0);
  const vitenskap = result.materializedRows.find((row) => row.id === 'vitenskap');
  assert.ok(vitenskap);
  assert.equal(vitenskap.schemaFamily, 'standard_canonical');
  assert.equal(vitenskap.adapter, 'standard');
  assert.equal(vitenskap.domainCount, 6);
  assert.equal(vitenskap.emneCount, 93);
  assert.equal(vitenskap.methodCount, 84);
  assert.equal(vitenskap.mappingCount, 93);
  assert.equal(vitenskap.hookCount, 60);
  assert.equal(vitenskap.chapterCount, 0);
  assert.ok(result.report.summary.adapterFamiliesExercised.includes('by_compatibility'));
  assert.ok(result.report.summary.adapterFamiliesExercised.includes('foundation_v1'));
  assert.equal(result.report.summary.politicsFallbacks, 0);
  assert.equal(result.report.summary.subjectPageLegacyDependencies, 0);
});
