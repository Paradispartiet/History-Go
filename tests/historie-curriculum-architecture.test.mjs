import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { validateHistoryCurriculumArchitecture } from '../tools/validate-historie-curriculum-architecture.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(read(relativePath));

test('universitetsnær Historie-arkitektur validerer uten å endre canonicalt inventar', () => {
  const result = validateHistoryCurriculumArchitecture({ root });
  assert.deepEqual(result, {
    schema: 'history_go_history_curriculum_architecture_v1',
    status: 'active_curriculum_navigation',
    periods: 9,
    coveredPeriods: 6,
    partialPeriods: 2,
    missingPeriods: 1,
    thematicFields: 14,
    methodModules: 6,
    geographicPaths: 6,
    periodGuides: 9,
    canonicalDomainsPreserved: 23,
    canonicalEmnerPreserved: 230,
    canonicalMethodsPreserved: 105
  });
});

test('antikken og de to svake oversiktsperiodene fremstilles ærlig', () => {
  const architecture = json('data/fag/historie/curriculum_architecture_historie_v1.json');
  const periodGuides = json('data/fag/historie/period_guides_historie_v1.json');
  const byId = new Map(architecture.chronological_spine.map((period) => [period.id, period]));
  const guideById = new Map(periodGuides.guides.map((guide) => [guide.period_id, guide]));
  assert.equal(byId.get('antikken_eldre_sivilisasjoner').coverage_status, 'missing');
  assert.deepEqual(byId.get('antikken_eldre_sivilisasjoner').entry_emne_ids, []);
  assert.match(byId.get('antikken_eldre_sivilisasjoner').gap_action, /eget, globalt balansert antikkfelt/);
  assert.equal(byId.get('tidlig_moderne_1500_1814').coverage_status, 'partial');
  assert.equal(byId.get('samtid_etter_1991').coverage_status, 'partial');
  assert.equal(guideById.get('antikken_eldre_sivilisasjoner').editorial_status, 'complete');
  assert.equal(guideById.get('tidlig_moderne_1500_1814').editorial_status, 'complete');
  assert.equal(guideById.get('samtid_etter_1991').editorial_status, 'complete');
});

test('alle pedagogiske lag har forklarende tekst, læringsmål og nøkkelspørsmål', () => {
  const architecture = json('data/fag/historie/curriculum_architecture_historie_v1.json');
  assert.equal(architecture.version, '1.1.0');
  assert.equal(architecture.editorial_introduction.paragraphs.length, 3);
  const rows = [
    ...architecture.progression,
    ...architecture.chronological_spine,
    ...architecture.thematic_fields,
    ...architecture.method_foundation,
    ...architecture.geographic_paths
  ];
  assert.equal(rows.length, 40);
  for (const row of rows) {
    assert.ok(row.overview.length >= 300, `${row.id} har for kort oversiktstekst`);
    assert.equal(row.learning_outcomes.length, 3, `${row.id} mangler læringsmål`);
    assert.equal(row.key_questions.length, 3, `${row.id} mangler nøkkelspørsmål`);
  }
});

test('faste ti-kvoter er compatibility-data og ikke ny kurateringsregel', () => {
  const architecture = json('data/fag/historie/curriculum_architecture_historie_v1.json');
  assert.equal(architecture.curation_policy.fixed_emne_quotas_forbidden, true);
  assert.equal(architecture.curation_policy.track_size_follows_subject_matter, true);
  assert.equal(architecture.curation_policy.existing_23_by_10_inventory_is_compatibility_data, true);
  const entrySizes = architecture.chronological_spine.map((period) => period.entry_emne_ids.length);
  assert.ok(new Set(entrySizes).size >= 4, 'Periodene skal ha faglig varierende størrelse');
});

test('standardmodellen bevarer den valgfrie pensumarkitekturen', () => {
  const coreSource = read('js/fagverk-subject-core.js');
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
  const curriculum = { status: 'active_curriculum_navigation', chronological_spine: [] };
  const model = sandbox.HGFagverkSubjectCore.normalizeSubject({
    subjectId: 'historie',
    schemaFamily: 'standard_canonical',
    source: {
      pensum: { subject_title: 'Historie', domains: [{ domain_id: 'his_a', label: 'A', emne_ids: ['em_a'], method_ids: ['met_a'] }] },
      emners: [{ emne_id: 'em_a', subject_id: 'historie', area_id: 'his_a', title: 'Emne A', method_ids: ['met_a'] }],
      fagkart: {},
      methods: { methods: [{ method_id: 'met_a', title: 'Metode A', description: 'Beskrivelse' }] },
      curriculum
    }
  });
  assert.equal(model.source.curriculum.status, 'active_curriculum_navigation');
});

test('Historie-siden bruker studieløpet som hovedoversikt og registeret som sekundærlag', () => {
  const renderer = read('js/fagverk.js');
  for (const marker of ['historie-progresjon', 'historie-kronologi', 'historie-tema', 'historie-metode', 'historie-geografi']) {
    assert.match(renderer, new RegExp(marker));
  }
  assert.match(renderer, /Canonicalt fagregister/);
  assert.match(renderer, /komplett canonicalt fagregister/);
  assert.match(renderer, /active_curriculum_navigation/);
  const manifest = json('data/fag/fag_manifest.json');
  assert.equal(manifest.historie.curriculumArchitecture, 'historie/curriculum_architecture_historie_v1.json');
});
